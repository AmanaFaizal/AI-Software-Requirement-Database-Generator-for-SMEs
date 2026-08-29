import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { listReminders, addReminder, deleteReminder, updateReminder } from '../api/reminders';
import { useBusiness } from '../context/BusinessContext';
import { tokens } from '../theme';

export default function RemindersPage() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    if (!activeBusiness) navigate('/businesses');
  }, [activeBusiness, navigate]);

  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const data = await listReminders(activeBusiness.business_id);
      setReminders(data.reminders);
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Could not load reminders.' });
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!newTitle || !newDate) {
      setSnackbar({ severity: 'warning', message: 'Please provide both title and date/time.' });
      return;
    }
    try {
      const data = await addReminder(activeBusiness.business_id, { 
        title: newTitle, 
        reminder_date: newDate 
      });
      setReminders((prev) => [...prev, data.reminder]);
      setFormOpen(false);
      setNewTitle('');
      setNewDate('');
      setSnackbar({ severity: 'success', message: 'Reminder added.' });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Error adding reminder.' });
    }
  }

  async function handleDelete(id) {
    try {
      await deleteReminder(activeBusiness.business_id, id);
      setReminders((prev) => prev.filter(r => r.reminder_id !== id));
      setSnackbar({ severity: 'success', message: 'Reminder deleted.' });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Error deleting reminder.' });
    }
  }

  async function handleComplete(id) {
    try {
      const data = await updateReminder(activeBusiness.business_id, id, { status: 'Completed' });
      setReminders((prev) => prev.map(r => r.reminder_id === id ? data.reminder : r));
      setSnackbar({ severity: 'success', message: 'Reminder marked as completed.' });
    } catch (err) {
      setSnackbar({ severity: 'error', message: 'Error updating reminder.' });
    }
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
        <Typography variant="h4">Reminders</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          Add Reminder
        </Button>
      </Box>

      <Box sx={{ border: `1px solid ${tokens.hairline}`, borderRadius: 1.5, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reminders.map((r) => (
              <TableRow key={r.reminder_id} hover sx={{ opacity: r.status === 'Completed' ? 0.6 : 1 }}>
                <TableCell sx={{ fontWeight: 600 }}>
                  {r.title}
                </TableCell>
                <TableCell>
                  {new Date(r.reminder_date).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={r.status} color={r.status === 'Completed' ? 'success' : 'warning'} />
                </TableCell>
                <TableCell align="right">
                  {r.status !== 'Completed' && (
                    <IconButton size="small" color="success" onClick={() => handleComplete(r.reminder_id)} title="Mark as completed">
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton size="small" color="error" onClick={() => handleDelete(r.reminder_id)} title="Delete">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && reminders.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 5, color: tokens.slate }}>
                  No reminders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Reminder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reminder Title"
            fullWidth
            variant="outlined"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Date and Time"
            type="datetime-local"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
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
