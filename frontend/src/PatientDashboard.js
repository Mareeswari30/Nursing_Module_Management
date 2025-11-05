import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  Box, Typography, Tabs, Tab, Table, TableHead, TableBody, TableRow, TableCell,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Select, MenuItem
} from '@mui/material';

const PATIENT_API = 'http://localhost:5000/api/nursing/patients';
const SCHEDULE_API = 'http://localhost:5000/api/nursing/schedules';

export default function NursingDashboard() {
  const [tab, setTab] = useState(0);

  // ======== PATIENT STATE ========
  const [patients, setPatients] = useState([]);
  const [openPatient, setOpenPatient] = useState(false);
  const [search, setSearch] = useState('');
  const [newPatient, setNewPatient] = useState({
    patientName: '', age: '', roomNumber: '', assignedNurse: '', careNotes: ''
  });
  const [editRow, setEditRow] = useState({ id: null, roomNumber: '', careNotes: '' });

  // ======== THERAPY STATE ========
  const [schedules, setSchedules] = useState([]);
  const [openSession, setOpenSession] = useState(false);
  const [newSession, setNewSession] = useState({
    patientId: '', therapyType: '', therapist: '', scheduledTime: '', status: 'Pending'
  });

  const normalizePatient = (p) => ({
    id: p.id,
    patientName: p.patientName || p.patientname || '',
    age: p.age,
    roomNumber: p.roomNumber || p.roomnumber || '',
    assignedNurse: p.assignedNurse || p.assignednurse || '',
    careNotes: p.careNotes || p.carenotes || ''
  });

  const normalizeSchedule = (s) => ({
    id: s.id,
    patientId: s.patientId || s.patientid,
    therapyType: s.therapyType || s.therapytype,
    therapist: s.therapist,
    scheduledTime: s.scheduledTime || s.scheduledtime,
    status: s.status
  });

  
  const fetchPatients = useCallback(async () => {
    try {
      const res = await axios.get(PATIENT_API, { params: { search } });
      setPatients(res.data.map(normalizePatient));
    } catch (err) {
      console.error(err);
      alert('Failed to load patient data');
    }
  }, [search]);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await axios.get(SCHEDULE_API);
      setSchedules(res.data.map(normalizeSchedule));
    } catch (err) {
      console.error(err);
      alert('Failed to load therapy sessions');
    }
  }, []);

  
  useEffect(() => {
    const timer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timer);
  }, [search, fetchPatients]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  
  const handleAddPatient = async () => {
    const payload = {
      patientName: newPatient.patientName.trim(),
      age: Number(newPatient.age),
      roomNumber: newPatient.roomNumber.trim(),
      assignedNurse: newPatient.assignedNurse.trim(),
      careNotes: newPatient.careNotes.trim()
    };
    if (!payload.patientName || !payload.age || !payload.assignedNurse) {
      alert('Name, Age, and Nurse are required.');
      return;
    }
    try {
      await axios.post(PATIENT_API, payload);
      setOpenPatient(false);
      setNewPatient({ patientName: '', age: '', roomNumber: '', assignedNurse: '', careNotes: '' });
      fetchPatients();
    } catch (err) {
      console.error(err);
      alert('Failed to add patient');
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Delete this patient?')) return;
    try {
      await axios.delete(`${PATIENT_API}/${id}`);
      fetchPatients();
    } catch (err) {
      console.error(err);
      alert('Failed to delete patient');
    }
  };

  const handleUpdatePatient = async (id, data) => {
    try {
      await axios.put(`${PATIENT_API}/${id}`, data);
      setEditRow({ id: null, roomNumber: '', careNotes: '' });
      fetchPatients();
    } catch (err) {
      console.error(err);
      alert('Failed to update patient');
    }
  };

  
  const handleAddSession = async () => {
    const { patientId, therapyType, therapist, scheduledTime, status } = newSession;
    if (!patientId || !therapyType || !therapist || !scheduledTime) {
      alert('Fill all fields');
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
      setOpenSession(false);
      setNewSession({ patientId: '', therapyType: '', therapist: '', scheduledTime: '', status: 'Pending' });
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert('Failed to add session');
    }
  };

  const updateSessionStatus = async (id, status) => {
    try {
      await axios.patch(`${SCHEDULE_API}/${id}`, { status });
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const now = dayjs();

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>🏥 Nursing Dashboard</Typography>

      {/* Tabs */}
      <Tabs value={tab} onChange={(e, val) => setTab(val)} sx={{ mb: 3 }}>
        <Tab label="Patients" />
        <Tab label="Therapy Sessions" />
      </Tabs>

     
      {tab === 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ width: 300 }}
            />
            <Button variant="contained" onClick={() => setOpenPatient(true)}>+ Add Patient</Button>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Nurse</TableCell>
                <TableCell>Care Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: '#777' }}>No patients found</TableCell>
                </TableRow>
              ) : patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.patientName}</TableCell>
                  <TableCell>{p.age}</TableCell>

                 
                  <TableCell>
                    {editRow.id === p.id ? (
                      <TextField
                        size="small"
                        value={editRow.roomNumber}
                        onChange={(e) => setEditRow({ ...editRow, roomNumber: e.target.value })}
                      />
                    ) : (
                      <span onClick={() => setEditRow({ id: p.id, roomNumber: p.roomNumber, careNotes: p.careNotes })} style={{ cursor: 'pointer' }}>
                        {p.roomNumber || '—'}
                      </span>
                    )}
                  </TableCell>

                  <TableCell>{p.assignedNurse}</TableCell>

                  
                  <TableCell>
                    {editRow.id === p.id ? (
                      <TextField
                        size="small"
                        value={editRow.careNotes}
                        onChange={(e) => setEditRow({ ...editRow, careNotes: e.target.value })}
                      />
                    ) : (
                      <span onClick={() => setEditRow({ id: p.id, roomNumber: p.roomNumber, careNotes: p.careNotes })} style={{ cursor: 'pointer' }}>
                        {p.careNotes || '—'}
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    {editRow.id === p.id && (
                      <Button size="small" variant="contained" onClick={() => handleUpdatePatient(p.id, { roomNumber: editRow.roomNumber, careNotes: editRow.careNotes })} sx={{ mr: 1 }}>
                        Save
                      </Button>
                    )}
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDeletePatient(p.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Add Patient Dialog */}
          <Dialog open={openPatient} onClose={() => setOpenPatient(false)} fullWidth maxWidth="sm">
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogContent>
              {Object.keys(newPatient).map((field) => (
                <TextField
                  key={field}
                  label={field.replace(/([A-Z])/g, ' $1')}
                  fullWidth
                  margin="dense"
                  type={field === 'age' ? 'number' : 'text'}
                  value={newPatient[field]}
                  onChange={(e) => setNewPatient({ ...newPatient, [field]: e.target.value })}
                />
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenPatient(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleAddPatient}>Save</Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      
      {tab === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" onClick={() => setOpenSession(true)}>+ Add Therapy Session</Button>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient ID</TableCell>
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
                  <TableCell colSpan={6} align="center" sx={{ color: '#777' }}>No sessions scheduled</TableCell>
                </TableRow>
              ) : schedules.map((s) => {
                const sessionTime = dayjs(s.scheduledTime);
                const isDelayed = s.status === 'Pending' && sessionTime.isBefore(now);
                const statusColor = s.status === 'Completed' ? '#2e7d32' :
                  s.status === 'In Progress' ? '#1565c0' : isDelayed ? '#d32f2f' : '#f57c00';

                return (
                  <TableRow key={s.id} sx={{ backgroundColor: isDelayed ? '#fff1f1' : 'inherit' }}>
                    <TableCell>{s.patientId}</TableCell>
                    <TableCell>{s.therapyType}</TableCell>
                    <TableCell>{s.therapist}</TableCell>
                    <TableCell>{sessionTime.isValid() ? sessionTime.format('YYYY-MM-DD HH:mm') : 'Invalid Date'}</TableCell>
                    <TableCell>
                      <Typography sx={{ color: statusColor, fontWeight: 500 }}>{s.status}</Typography>
                    </TableCell>
                    <TableCell>
                      <Select size="small" value={s.status} onChange={(e) => updateSessionStatus(s.id, e.target.value)} sx={{ minWidth: 140 }}>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Add Session Dialog */}
          <Dialog open={openSession} onClose={() => setOpenSession(false)} fullWidth maxWidth="sm">
            <DialogTitle>Add Therapy Session</DialogTitle>
            <DialogContent>
              <TextField
                label="Patient ID"
                fullWidth margin="dense"
                value={newSession.patientId}
                onChange={(e) => setNewSession({ ...newSession, patientId: e.target.value })}
              />
              <TextField
                label="Therapy Type"
                fullWidth margin="dense"
                value={newSession.therapyType}
                onChange={(e) => setNewSession({ ...newSession, therapyType: e.target.value })}
              />
              <TextField
                label="Therapist"
                fullWidth margin="dense"
                value={newSession.therapist}
                onChange={(e) => setNewSession({ ...newSession, therapist: e.target.value })}
              />
              <TextField
                label="Scheduled Time"
                type="datetime-local"
                fullWidth margin="dense"
                value={newSession.scheduledTime}
                onChange={(e) => setNewSession({ ...newSession, scheduledTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <Select fullWidth sx={{ mt: 2 }} value={newSession.status} onChange={(e) => setNewSession({ ...newSession, status: e.target.value })}>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenSession(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleAddSession}>Save</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}
