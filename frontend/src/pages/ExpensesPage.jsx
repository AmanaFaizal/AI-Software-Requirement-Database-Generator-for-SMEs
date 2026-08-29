import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { listExpenses, addExpense, deleteExpense } from '../api/supplyChain';
import { useBusiness } from '../context/BusinessContext';
import { tokens } from '../theme';

const CATEGORIES = ['Rent', 'Utilities', 'Salary', 'Maintenance', 'Marketing', 'Other'];

export default function ExpensesPage() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', description: '' });
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    if (!activeBusiness) navigate('/businesses');
  }, [activeBusiness, navigate]);

  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const data = await listExpenses(activeBusiness.business_id);
      setExpenses(data.expenses);
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Could not load expenses.' });
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!newExpense.category || !newExpense.amount) return;
    try {
      const data = await addExpense(activeBusiness.business_id, {
        category: newExpense.category,
        amount: Number(newExpense.amount),
        description: newExpense.description,
      });
      setExpenses((prev) => [...prev, data.expense]);
      setFormOpen(false);
      setNewExpense({ category: '', amount: '', description: '' });
      setSnackbar({ severity: 'success', message: 'Expense added.' });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Error adding expense.' });
    }
  }

  async function handleDelete(id) {
    try {
      await deleteExpense(activeBusiness.business_id, id);
      setExpenses((prev) => prev.filter(e => e.expense_id !== id));
      setSnackbar({ severity: 'success', message: 'Expense deleted.' });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Error deleting expense.' });
    }
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
        <Typography variant="h4">Expenses</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          Add Expense
        </Button>
      </Box>

      <Box sx={{ border: `1px solid ${tokens.hairline}`, borderRadius: 1.5, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((e) => (
              <TableRow key={e.expense_id} hover>
                <TableCell>{new Date(e.expense_date).toLocaleDateString()}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{e.category}</TableCell>
                <TableCell>{e.description || '-'}</TableCell>
                <TableCell align="right">${Number(e.amount).toFixed(2)}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => handleDelete(e.expense_id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 5, color: tokens.slate }}>
                  No expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            select
            label="Category"
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField
            label="Amount"
            type="number"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            fullWidth
            size="small"
            inputProps={{ min: 0, step: '0.01' }}
          />
          <TextField
            label="Description (Optional)"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            fullWidth
            size="small"
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
