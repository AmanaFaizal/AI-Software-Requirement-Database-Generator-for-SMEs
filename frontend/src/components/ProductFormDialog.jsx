import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Alert, MenuItem
} from '@mui/material';
import { listCategories } from '../api/supplyChain';
import { useBusiness } from '../context/BusinessContext';

const EMPTY = { product_name: '', category_id: '', quantity: '', cost_price: '', selling_price: '' };

export default function ProductFormDialog({ open, onClose, onSubmit, initialValue }) {
  const { activeBusiness } = useBusiness();
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const isEdit = Boolean(initialValue);

  useEffect(() => {
    if (open) {
      setValues(
        initialValue
          ? {
              product_name: initialValue.product_name || '',
              category_id: initialValue.category_id || '',
              quantity: initialValue.quantity ?? '',
              cost_price: initialValue.cost_price ?? '',
              selling_price: initialValue.selling_price ?? '',
            }
          : EMPTY
      );
      setError('');
      if (activeBusiness) {
        listCategories(activeBusiness.business_id).then(data => setCategories(data.categories)).catch(console.error);
      }
    }
  }, [open, initialValue, activeBusiness]);

  function set(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit({
        product_name: values.product_name,
        category_id: values.category_id || null,
        quantity: values.quantity === '' ? 0 : Number(values.quantity),
        cost_price: values.cost_price === '' ? null : Number(values.cost_price),
        selling_price: values.selling_price === '' ? null : Number(values.selling_price),
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this product.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Edit product' : 'Add product'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Product name"
            value={values.product_name}
            onChange={set('product_name')}
            required
            autoFocus
            fullWidth
            size="small"
          />
          <TextField
            select
            label="Category"
            value={values.category_id}
            onChange={set('category_id')}
            fullWidth
            size="small"
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {categories.map(c => (
              <MenuItem key={c.category_id} value={c.category_id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Quantity in stock"
            type="number"
            value={values.quantity}
            onChange={set('quantity')}
            fullWidth
            size="small"
            inputProps={{ min: 0 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Cost price"
              type="number"
              value={values.cost_price}
              onChange={set('cost_price')}
              fullWidth
              size="small"
              inputProps={{ min: 0, step: '0.01' }}
            />
            <TextField
              label="Selling price"
              type="number"
              value={values.selling_price}
              onChange={set('selling_price')}
              fullWidth
              size="small"
              inputProps={{ min: 0, step: '0.01' }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
