import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Snackbar, Alert,
} from '@mui/material';
import { listInvoices } from '../api/supplyChain';
import { useBusiness } from '../context/BusinessContext';
import { tokens } from '../theme';

export default function InvoicesPage() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    if (!activeBusiness) navigate('/businesses');
  }, [activeBusiness, navigate]);

  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const data = await listInvoices(activeBusiness.business_id);
      setInvoices(data.invoices);
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Could not load invoices.' });
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Invoices</Typography>
        <Typography variant="body2" color="text.secondary">Automatically generated from delivered purchase orders and sales.</Typography>
      </Box>

      <Box sx={{ border: `1px solid ${tokens.hairline}`, borderRadius: 1.5, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Invoice Number</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.invoice_id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{inv.invoice_number}</TableCell>
                <TableCell>{new Date(inv.issue_date).toLocaleDateString()}</TableCell>
                <TableCell>${Number(inv.amount).toFixed(2)}</TableCell>
                <TableCell>{inv.purchase_id ? 'Purchase' : 'Sale'}</TableCell>
              </TableRow>
            ))}
            {!loading && invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 5, color: tokens.slate }}>
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {snackbar && <Alert severity={snackbar.severity}>{snackbar.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
