import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, InputAdornment, Chip, Menu, MenuItem, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { listProducts, addProduct, updateProduct, deleteProduct } from '../api/products';
import { useBusiness } from '../context/BusinessContext';
import ProductFormDialog from '../components/ProductFormDialog';
import { tokens, numeralSx } from '../theme';

function money(v) {
  if (v === null || v === undefined) return '—';
  return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InventoryPage() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuProduct, setMenuProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    if (!activeBusiness) navigate('/businesses');
  }, [activeBusiness, navigate]);

  const load = useCallback(async (searchTerm = '') => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const data = await listProducts(activeBusiness.business_id, searchTerm ? { search: searchTerm } : {});
      setProducts(data.products);
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Could not load inventory.' });
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => { load(); }, [load]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setFormOpen(true);
    setMenuAnchor(null);
  }

  async function handleFormSubmit(values) {
    if (editing) {
      const { product } = await updateProduct(activeBusiness.business_id, editing.product_id, values);
      setProducts((prev) => prev.map((p) => (p.product_id === product.product_id ? product : p)));
      setSnackbar({ severity: 'success', message: `${product.product_name} updated.` });
    } else {
      const { product } = await addProduct(activeBusiness.business_id, values);
      setProducts((prev) => [product, ...prev]);
      setSnackbar({ severity: 'success', message: `${product.product_name} added to inventory.` });
    }
    setFormOpen(false);
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteProduct(activeBusiness.business_id, confirmDelete.product_id);
      setProducts((prev) => prev.filter((p) => p.product_id !== confirmDelete.product_id));
      setSnackbar({ severity: 'success', message: `${confirmDelete.product_name} removed.` });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Could not delete this product.' });
    } finally {
      setConfirmDelete(null);
    }
  }

  const lowStockCount = useMemo(() => products.filter((p) => p.quantity <= 5).length, [products]);

  return (
    <Box sx={{ maxWidth: 980 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4">Inventory</Typography>
          <Typography variant="body2" color="text.secondary">
            {activeBusiness?.business_name} · {products.length} product{products.length === 1 ? '' : 's'}
            {lowStockCount > 0 && (
              <Chip
                label={`${lowStockCount} low on stock`}
                size="small"
                sx={{ ml: 1, bgcolor: 'rgba(179,73,46,0.1)', color: tokens.rust, fontWeight: 600 }}
              />
            )}
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={openAdd}>
          Add product
        </Button>
      </Box>

      <TextField
        placeholder="Search products by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        fullWidth
        sx={{ mb: 2, maxWidth: 360, bgcolor: 'background.paper' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: tokens.slate }} />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ border: `1px solid ${tokens.hairline}`, borderRadius: 1.5, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Cost Price</TableCell>
              <TableCell align="right">Selling Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="right" sx={{ width: 48 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.product_id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{p.product_name}</TableCell>
                <TableCell>
                  {p.category
                    ? <Chip label={p.category} size="small" variant="outlined" sx={{ borderColor: tokens.hairline }} />
                    : <Typography variant="body2" color="text.secondary">—</Typography>}
                </TableCell>
                <TableCell align="right" sx={{ ...numeralSx, color: p.quantity <= 5 ? tokens.rust : 'inherit', fontWeight: p.quantity <= 5 ? 600 : 400 }}>
                  {p.quantity}
                </TableCell>
                <TableCell align="right" sx={numeralSx}>{money(p.buy_price)}</TableCell>
                <TableCell align="right" sx={numeralSx}>{money(p.selling_price)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuProduct(p); }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {!loading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: tokens.slate }}>
                  {search
                    ? `No products match "${search}".`
                    : 'No products yet — add your first one to start tracking stock.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => openEdit(menuProduct)}>Edit</MenuItem>
        <MenuItem
          onClick={() => { setConfirmDelete(menuProduct); setMenuAnchor(null); }}
          sx={{ color: tokens.rust }}
        >
          Delete
        </MenuItem>
      </Menu>

      <ProductFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialValue={editing}
      />

      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This removes <strong>{confirmDelete?.product_name}</strong> from your inventory. This can't be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: tokens.rust, '&:hover': { bgcolor: '#943a24' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snackbar && <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
