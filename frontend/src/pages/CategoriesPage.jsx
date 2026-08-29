import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { listCategories, addCategory, deleteCategory } from '../api/supplyChain';
import { useBusiness } from '../context/BusinessContext';
import { tokens } from '../theme';

export default function CategoriesPage() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    if (!activeBusiness) navigate('/businesses');
  }, [activeBusiness, navigate]);

  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const data = await listCategories(activeBusiness.business_id);
      setCategories(data.categories);
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Could not load categories.' });
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!newCatName) return;
    try {
      // Split by comma and filter empty
      const names = newCatName.split(',').map(n => n.trim()).filter(n => n);
      
      const data = await addCategory(activeBusiness.business_id, { names });
      // data.categories contains the array of new categories
      setCategories((prev) => [...prev, ...data.categories]);
      setFormOpen(false);
      setNewCatName('');
      setSnackbar({ severity: 'success', message: `${data.categories.length} categories added.` });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Error adding category.' });
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCategory(activeBusiness.business_id, id);
      setCategories((prev) => prev.filter(c => c.category_id !== id));
      setSnackbar({ severity: 'success', message: 'Category deleted.' });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Error deleting category.' });
    }
  }

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
        <Typography variant="h4">Categories</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          Add Category
        </Button>
      </Box>

      <Box sx={{ border: `1px solid ${tokens.hairline}`, borderRadius: 1.5, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.category_id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => handleDelete(c.category_id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: 'center', py: 5, color: tokens.slate }}>
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Category(s)</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You can enter multiple categories separated by commas.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name(s)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
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
