import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Button, Typography, Select, MenuItem, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';

const SCHEDULE_API = 'http://localhost:5000/api/nursing/schedules';
const PATIENT_API = 'http://localhost:5000/api/nursing/patients';

export default function TherapyDashboard() {
  const [schedules, setSchedules] = useState([]);
  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    patientId: '',
    therapyType: '',
    therapist: '',
    scheduledTime: '',
    status: 'Pending'
  });

  
  const fetchSchedules = useCallback(async () => {
    try {
      const res = await axios.get(SCHEDULE_API);
      const normalized = res.data.map(s => ({
        id: s.id,
        patientId: s.patientId || s.patientid,
        therapyType: s.therapyType || s.therapytype,
        therapist: s.therapist,
        scheduledTime: s.scheduledTime || s.scheduledtime,
        status: s.status
      }));
      setSchedules(normalized);
    } catch (err) {
      console.error('Error loading schedules:', err);
      alert('Failed to load therapy sessions.');
    }
  }, []);

  
  const fetchPatients = useCallback(async () => {
    try {
      const res = await axios.get(PATIENT_API);
      const normalized = res.data.map(p => ({
        id: p.id,
        patientName: p.patientName || p.patientname || ''
      }));
      setPatients(normalized);
    } catch (err) {
      console.error('Error loading patients:', err);
      alert('Failed to load patients.');
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
    fetchPatients();
  }, [fetchSchedules, fetchPatients]);

  const now = dayjs();

  
  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${SCHEDULE_API}/${id}`, { status });
      fetchSchedules();
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Failed to update status.');
    }
  };

  
  const handleAddSession = async () => {
    const { patientId, therapyType, therapist, scheduledTime, status } = newSession;

    if (!patientId || !therapyType || !therapist || !scheduledTime) {
      alert('Please fill all fields before saving.');
      return;
    }

    try {
      await axios.post(SCHEDULE_API, {
        patientId: Number(patientId),
        therapyType: therapyType.trim(),
        therapist: therapist.trim(),
        scheduledTime: new Date(scheduledTime).toISOString(),
        status
      });

      setOpen(false);
      setNewSession({
        patientId: '',
        therapyType: '',
        therapist: '',
        scheduledTime: '',
        status: 'Pending'
      });

      fetchSchedules();
    } catch (err) {
      console.error('Failed to add session:', err.response?.data || err);
      alert('Error adding therapy session.');
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
   
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">🕒 Today's Therapy Sessions</Typography>
        <Button variant="contained" color="primary" sx={{ textTransform: 'none', px: 3, py: 1 }}
          onClick={() => setOpen(true)}>
          + Add Therapy Session
        </Button>
      </Box>

    
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Patient</TableCell>
            <TableCell>Therapy Type</TableCell>
            <TableCell>Therapist</TableCell>
            <TableCell>Scheduled Time</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ color: '#888' }}>
                No therapy sessions scheduled.
              </TableCell>
            </TableRow>
          ) : (
            schedules.map((s) => {
              const sessionTime = dayjs(s.scheduledTime);
              const isDelayed = s.status === 'Pending' && sessionTime.isBefore(now);

              const statusColor = s.status === 'Completed'
                ? '#2e7d32'
                : s.status === 'In Progress'
                  ? '#1565c0'
                  : isDelayed
                    ? '#d32f2f'
                    : '#f57c00';

              const patientName = patients.find(p => p.id === s.patientId)?.patientName || s.patientId;

              return (
                <TableRow key={s.id} sx={{ backgroundColor: isDelayed ? '#fff1f1' : 'inherit' }}>
                  <TableCell>{patientName}</TableCell>
                  <TableCell>{s.therapyType}</TableCell>
                  <TableCell>{s.therapist}</TableCell>
                  <TableCell>
                    {sessionTime.isValid() ? sessionTime.format('YYYY-MM-DD HH:mm') : 'Invalid Date'}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: statusColor, fontWeight: 500 }}>
                      {s.status}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={s.status}
                      onChange={(e) => updateStatus(s.id, e.target.value)}
                      sx={{ minWidth: 140 }}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Add Therapy Session Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Therapy Session</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            value={newSession.patientId}
            onChange={(e) => setNewSession({ ...newSession, patientId: e.target.value })}
            sx={{ mt: 1 }}
          >
            {patients.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.patientName} (ID: {p.id})
              </MenuItem>
            ))}
          </Select>

          <TextField
            label="Therapy Type"
            fullWidth
            margin="dense"
            value={newSession.therapyType}
            onChange={(e) => setNewSession({ ...newSession, therapyType: e.target.value })}
          />
          <TextField
            label="Therapist"
            fullWidth
            margin="dense"
            value={newSession.therapist}
            onChange={(e) => setNewSession({ ...newSession, therapist: e.target.value })}
          />
          <TextField
            label="Scheduled Time"
            type="datetime-local"
            fullWidth
            margin="dense"
            value={newSession.scheduledTime}
            onChange={(e) => setNewSession({ ...newSession, scheduledTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <Select
            fullWidth
            sx={{ mt: 2 }}
            value={newSession.status}
            onChange={(e) => setNewSession({ ...newSession, status: e.target.value })}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSession}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
