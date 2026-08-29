import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { listDealers, addDealer, deleteDealer } from '../api/supplyChain';
import { useBusiness } from '../context/BusinessContext';
import { tokens } from '../theme';

export default function DealersPage() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newShopName, setNewShopName] = useState('');
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    if (!activeBusiness) navigate('/businesses');
  }, [activeBusiness, navigate]);

  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const data = await listDealers(activeBusiness.business_id);
      setDealers(data.dealers);
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Could not load dealers.' });
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!newName) return;
    try {
      const data = await addDealer(activeBusiness.business_id, { supplier_name: newName, shop_name: newShopName });
      setDealers((prev) => [...prev, data.dealer]);
      setFormOpen(false);
      setNewName('');
      setNewShopName('');
      setSnackbar({ severity: 'success', message: 'Dealer added.' });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Error adding dealer.' });
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDealer(activeBusiness.business_id, id);
      setDealers((prev) => prev.filter(c => c.supplier_id !== id));
      setSnackbar({ severity: 'success', message: 'Dealer deleted.' });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Error deleting dealer.' });
    }
  }

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
        <Typography variant="h4">Dealers</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          Add Dealer
        </Button>
      </Box>

      <Box sx={{ border: `1px solid ${tokens.hairline}`, borderRadius: 1.5, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Shop Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dealers.map((d) => (
              <TableRow key={d.supplier_id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{d.supplier_name}</TableCell>
                <TableCell>{d.shop_name}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => handleDelete(d.supplier_id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && dealers.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: 'center', py: 5, color: tokens.slate }}>
                  No dealers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Dealer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Dealer Name"
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Shop Name"
            fullWidth
            variant="outlined"
            value={newShopName}
            onChange={(e) => setNewShopName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {snackbar && <Alert severity={snackbar.severity}>{snackbar.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
