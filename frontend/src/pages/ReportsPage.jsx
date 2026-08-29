import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Snackbar, Alert } from '@mui/material';
import { getSalesReport } from '../api/supplyChain';
import { useBusiness } from '../context/BusinessContext';
import { tokens } from '../theme';

export default function ReportsPage() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    if (!activeBusiness) navigate('/businesses');
  }, [activeBusiness, navigate]);

  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const data = await getSalesReport(activeBusiness.business_id);
      setReport(data.report);
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Could not load reports.' });
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Final Sales Report</Typography>
        <Typography variant="body2" color="text.secondary">Financial overview for {activeBusiness?.business_name}</Typography>
      </Box>

      {report && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <Card sx={{ border: `1px solid ${tokens.hairline}`, boxShadow: 'none' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Total Sales</Typography>
                <Typography variant="h5" sx={{ color: tokens.emerald, fontWeight: 'bold' }}>
                  ${Number(report.totalSales).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ border: `1px solid ${tokens.hairline}`, boxShadow: 'none' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Total Purchases</Typography>
                <Typography variant="h5" sx={{ color: tokens.rust, fontWeight: 'bold' }}>
                  ${Number(report.totalPurchases).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ border: `1px solid ${tokens.hairline}`, boxShadow: 'none' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Total Expenses</Typography>
                <Typography variant="h5" sx={{ color: tokens.rust, fontWeight: 'bold' }}>
                  ${Number(report.totalExpenses).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ border: `1px solid ${tokens.hairline}`, boxShadow: 'none' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Net Profit</Typography>
                <Typography variant="h5" sx={{ color: report.profit >= 0 ? tokens.sapphire : tokens.rust, fontWeight: 'bold' }}>
                  ${Number(report.profit).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {snackbar && <Alert severity={snackbar.severity}>{snackbar.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
