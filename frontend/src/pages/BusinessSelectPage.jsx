import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardActionArea, CardContent, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LogoutIcon from '@mui/icons-material/Logout';
import { listBusinesses, createBusiness } from '../api/business';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import BizGuideMark from '../components/BizGuideMark';
import { tokens } from '../theme';

export default function BusinessSelectPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const { setActiveBusiness } = useBusiness();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const data = await listBusinesses();
      setBusinesses(data.businesses);
    } catch (err) {
      setError('Could not load your businesses.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openBusiness(biz) {
    setActiveBusiness(biz);
    navigate('/inventory');
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const { business } = await createBusiness({ business_name: name, business_type: type });
      setDialogOpen(false);
      setName('');
      setType('');
      setBusinesses((prev) => [business, ...prev]);
      openBusiness(business);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create business.');
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: tokens.parchment, py: 5, px: 2 }}>
      <Box sx={{ maxWidth: 780, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <BizGuideMark />
          <IconButton onClick={logout} title="Log out" size="small">
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="h4" sx={{ mb: 0.5 }}>
          {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Your businesses'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Pick a business to manage, or set up a new one.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {businesses.map((biz) => (
            <Card key={biz.business_id} variant="outlined" sx={{ borderColor: tokens.hairline }}>
              <CardActionArea onClick={() => openBusiness(biz)} sx={{ p: 1 }}>
                <CardContent>
                  <StorefrontIcon sx={{ color: tokens.amber, mb: 1 }} />
                  <Typography variant="h6">{biz.business_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {biz.business_type || 'General business'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}

          <Card
            variant="outlined"
            sx={{
              borderColor: tokens.hairline,
              borderStyle: 'dashed',
              display: 'flex',
            }}
          >
            <CardActionArea onClick={() => setDialogOpen(true)} sx={{ p: 1, height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: tokens.slate }}>
                <AddIcon sx={{ mb: 1 }} />
                <Typography variant="body2">Add a business</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>

        {!loading && businesses.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            You don't have any businesses yet — add one to get started.
          </Typography>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add a business</DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Business name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              fullWidth
              size="small"
            />
            <TextField
              label="Business type"
              placeholder="e.g. hardware_store, bakery, salon"
              value={type}
              onChange={(e) => setType(e.target.value)}
              fullWidth
              size="small"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="secondary">Create</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
