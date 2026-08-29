import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Alert,
} from '@mui/material';

const EMPTY = { product_name: '', category: '', quantity: '', buy_price: '', selling_price: '' };

export default function ProductFormDialog({ open, onClose, onSubmit, initialValue }) {
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initialValue);

  useEffect(() => {
    if (open) {
      setValues(
        initialValue
          ? {
              product_name: initialValue.product_name || '',
              category: initialValue.category || '',
              quantity: initialValue.quantity ?? '',
              buy_price: initialValue.buy_price ?? '',
              selling_price: initialValue.selling_price ?? '',
            }
          : EMPTY
      );
      setError('');
    }
  }, [open, initialValue]);

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
        category: values.category || null,
        quantity: values.quantity === '' ? 0 : Number(values.quantity),
        buy_price: values.buy_price === '' ? null : Number(values.buy_price),
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
            label="Category"
            value={values.category}
            onChange={set('category')}
            fullWidth
            size="small"
          />
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
              label="Buy price"
              type="number"
              value={values.buy_price}
              onChange={set('buy_price')}
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
