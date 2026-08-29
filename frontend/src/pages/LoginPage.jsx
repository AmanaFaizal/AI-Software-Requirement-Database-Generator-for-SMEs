import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, Link } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/businesses');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Welcome back</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Log in to keep running your business.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          size="small"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          size="small"
        />
        <Button type="submit" variant="contained" color="secondary" size="large" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
        New to BizGuide?{' '}
        <Link component={RouterLink} to="/register" underline="hover">
          Create an account
        </Link>
      </Typography>
    </AuthLayout>
  );
}
