import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { listSales, addSale } from '../api/supplyChain';
import { listProducts } from '../api/products';
import { useBusiness } from '../context/BusinessContext';
import { tokens } from '../theme';

export default function SalesPage() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [newSale, setNewSale] = useState({ product_id: '', quantity: 1, customer_id: '' });
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    if (!activeBusiness) navigate('/businesses');
  }, [activeBusiness, navigate]);

  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const [salesData, productsData] = await Promise.all([
        listSales(activeBusiness.business_id),
        listProducts(activeBusiness.business_id)
      ]);
      setSales(salesData.sales);
      setProducts(productsData.products);
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Could not load sales.' });
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!newSale.product_id || !newSale.quantity) return;
    try {
      const data = await addSale(activeBusiness.business_id, {
        product_id: newSale.product_id,
        quantity: Number(newSale.quantity),
      });
      setSales((prev) => [...prev, data.sale]);
      setFormOpen(false);
      setNewSale({ product_id: '', quantity: 1, customer_id: '' });
      setSnackbar({ severity: 'success', message: 'Sale recorded! Invoice generated.' });
      load(); // Reload to get updated stock
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.response?.data?.message || 'Error recording sale.' });
    }
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
        <Typography variant="h4">Sales</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          Record Sale
        </Button>
      </Box>

      <Box sx={{ border: `1px solid ${tokens.hairline}`, borderRadius: 1.5, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Sale ID</TableCell>
              <TableCell align="right">Total Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((s) => (
              <TableRow key={s.sale_id} hover>
                <TableCell>{new Date(s.sale_date).toLocaleDateString()}</TableCell>
                <TableCell>#{s.sale_id}</TableCell>
                <TableCell align="right">${Number(s.total_amount).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {!loading && sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', py: 5, color: tokens.slate }}>
                  No sales found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Record Sale</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            select
            label="Product"
            value={newSale.product_id}
            onChange={(e) => setNewSale({ ...newSale, product_id: e.target.value })}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            {products.map(p => (
              <MenuItem key={p.product_id} value={p.product_id} disabled={p.quantity <= 0}>
                {p.product_name} (Stock: {p.quantity}, Price: ${p.selling_price})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Quantity"
            type="number"
            value={newSale.quantity}
            onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
            fullWidth
            size="small"
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={!newSale.product_id || newSale.quantity < 1}>Record</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {snackbar && <Alert severity={snackbar.severity}>{snackbar.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
