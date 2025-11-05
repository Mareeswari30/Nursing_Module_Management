import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';

const PATIENT_API = 'http://localhost:5000/api/nursing/patients';

export default function PatientDashboard() {
  const [patients, setPatients] = useState([]);
  const [openPatient, setOpenPatient] = useState(false);
  const [search, setSearch] = useState('');
  const [newPatient, setNewPatient] = useState({
    patientName: '', age: '', roomNumber: '', assignedNurse: '', careNotes: ''
  });
  const [editRow, setEditRow] = useState({ id: null, roomNumber: '', careNotes: '' });

  const normalizePatient = (p) => ({
    id: p.id,
    patientName: p.patientName || p.patientname || '',
    age: p.age,
    roomNumber: p.roomNumber || p.roomnumber || '',
    assignedNurse: p.assignedNurse || p.assignednurse || '',
    careNotes: p.careNotes || p.carenotes || ''
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

  useEffect(() => {
    const timer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timer);
  }, [search, fetchPatients]);

  // ======== HANDLERS ========
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

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom> Patients</Typography>

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
    </Box>
  );
}
