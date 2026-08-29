import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Snackbar, Alert, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { listPurchases, addPurchase, updatePurchaseStatus, listDealers } from '../api/supplyChain';
import { listProducts } from '../api/products';
import { useBusiness } from '../context/BusinessContext';
import { tokens } from '../theme';

export default function PurchasesPage() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [newPurchase, setNewPurchase] = useState({ supplier_id: '', product_id: '', quantity: 1, total_amount: 0 });
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    if (!activeBusiness) navigate('/businesses');
  }, [activeBusiness, navigate]);

  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const [purchData, dealData, prodData] = await Promise.all([
        listPurchases(activeBusiness.business_id),
        listDealers(activeBusiness.business_id),
        listProducts(activeBusiness.business_id)
      ]);
      setPurchases(purchData.purchases);
      setDealers(dealData.dealers);
      setProducts(prodData.products);
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Could not load purchases.' });
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!newPurchase.supplier_id || !newPurchase.product_id || !newPurchase.total_amount) {
      setSnackbar({ severity: 'warning', message: 'Please fill all fields' });
      return;
    }
    try {
      const data = await addPurchase(activeBusiness.business_id, {
        supplier_id: newPurchase.supplier_id,
        product_id: newPurchase.product_id,
        quantity: newPurchase.quantity,
        total_amount: newPurchase.total_amount,
        is_ordered: true,
      });
      setPurchases((prev) => [...prev, data.purchase]);
      setFormOpen(false);
      setSnackbar({ severity: 'success', message: 'Purchase Order created.' });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Error creating order.' });
    }
  }

  async function handleMarkDelivered(id) {
    try {
      const data = await updatePurchaseStatus(activeBusiness.business_id, id, { is_delivered: true });
      setPurchases((prev) => prev.map(p => p.purchase_id === id ? data.purchase : p));
      setSnackbar({ severity: 'success', message: 'Order marked as delivered. Invoice generated!' });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Error updating order.' });
    }
  }
  
  async function handleMarkPaid(id) {
    try {
      const data = await updatePurchaseStatus(activeBusiness.business_id, id, { is_paid: true });
      setPurchases((prev) => prev.map(p => p.purchase_id === id ? data.purchase : p));
      setSnackbar({ severity: 'success', message: 'Order marked as paid.' });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Error updating order.' });
    }
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
        <Typography variant="h4">Purchase Orders (Buyed Stocks)</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          New Order
        </Button>
      </Box>

      <Box sx={{ border: `1px solid ${tokens.hairline}`, borderRadius: 1.5, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.map((p) => (
              <TableRow key={p.purchase_id} hover>
                <TableCell>#{p.purchase_id}</TableCell>
                <TableCell>{new Date(p.purchase_date).toLocaleDateString()}</TableCell>
                <TableCell>${Number(p.total_amount).toFixed(2)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip size="small" label={p.is_ordered ? 'Ordered' : 'Draft'} color={p.is_ordered ? 'primary' : 'default'} />
                    <Chip size="small" label={p.is_delivered ? 'Delivered' : 'Pending'} color={p.is_delivered ? 'success' : 'warning'} />
                    <Chip size="small" label={p.is_paid ? 'Paid' : 'Unpaid'} color={p.is_paid ? 'success' : 'error'} />
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {!p.is_delivered && (
                    <Button size="small" onClick={() => handleMarkDelivered(p.purchase_id)}>Mark Delivered</Button>
                  )}
                  {!p.is_paid && (
                    <Button size="small" onClick={() => handleMarkPaid(p.purchase_id)}>Mark Paid</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!loading && purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 5, color: tokens.slate }}>
                  No purchase orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Purchase Order</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            select
            label="Dealer"
            value={newPurchase.supplier_id}
            onChange={(e) => setNewPurchase({ ...newPurchase, supplier_id: e.target.value })}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            {dealers.map(d => <MenuItem key={d.supplier_id} value={d.supplier_id}>{d.supplier_name}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="Product"
            value={newPurchase.product_id}
            onChange={(e) => setNewPurchase({ ...newPurchase, product_id: e.target.value })}
            fullWidth
            size="small"
          >
            {products.map(p => <MenuItem key={p.product_id} value={p.product_id}>{p.product_name}</MenuItem>)}
          </TextField>
          <TextField
            label="Quantity"
            type="number"
            value={newPurchase.quantity}
            onChange={(e) => setNewPurchase({ ...newPurchase, quantity: Number(e.target.value) })}
            fullWidth
            size="small"
          />
          <TextField
            label="Total Cost"
            type="number"
            value={newPurchase.total_amount}
            onChange={(e) => setNewPurchase({ ...newPurchase, total_amount: Number(e.target.value) })}
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {snackbar && <Alert severity={snackbar.severity}>{snackbar.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
