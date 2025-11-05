import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField, Button, Typography, MenuItem, Grid, Paper
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const API_URL = 'http://localhost:5000/api/nursing/vitals';
const PATIENT_API = 'http://localhost:5000/api/nursing/patients';

export default function VitalsTracker() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [form, setForm] = useState({ bloodPressure: '', temperature: '', pulse: '' });
  const [vitals, setVitals] = useState([]);

  useEffect(() => {
    axios.get(PATIENT_API).then(res => setPatients(res.data));
  }, []);

  const fetchVitals = async (id) => {
    if (!id) return;
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      setVitals(res.data || []);
    } catch (err) {
      console.error('Error fetching vitals:', err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return alert('Select a patient first!');
    if (!form.bloodPressure && !form.temperature && !form.pulse) return alert('Enter at least one value!');
    
    try {
      await axios.post(API_URL, { patientId: selectedPatient, ...form });
      setForm({ bloodPressure: '', temperature: '', pulse: '' });
      fetchVitals(selectedPatient);
    } catch (err) {
      console.error('Error saving vitals:', err);
    }
  };

  const chartData = {
    labels: vitals.slice().reverse().map(v => new Date(v.timestamp).toLocaleString()),
    datasets: [
      {
        label: 'Temperature (°F)',
        data: vitals.slice().reverse().map(v => v.temperature),
        borderColor: 'red',
        backgroundColor: 'rgba(255,0,0,0.1)',
      },
      {
        label: 'Pulse (bpm)',
        data: vitals.slice().reverse().map(v => v.pulse),
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.1)',
      }
    ]
  };

  const patientName = patients.find(p => p.id === Number(selectedPatient))?.patientName || '';

  return (
    <div style={{ padding: 30 }}>
      <Typography variant="h5" gutterBottom>Patient Vital Tracker</Typography>

      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Select Patient"
              fullWidth
              value={selectedPatient}
              onChange={(e) => {
                setSelectedPatient(e.target.value);
                fetchVitals(e.target.value);
              }}
            >
              {patients.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.patientName}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              label="BP"
              value={form.bloodPressure}
              onChange={(e) => setForm({ ...form, bloodPressure: e.target.value })}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              label="Temp (°F)"
              type="number"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: e.target.value })}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              label="Pulse"
              type="number"
              value={form.pulse}
              onChange={(e) => setForm({ ...form, pulse: e.target.value })}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              sx={{ height: '100%' }}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {vitals.length > 0 ? (
        <>
          <Typography variant="h6" gutterBottom>
            Vital Trends ({patientName})
          </Typography>
          <Line data={chartData} />
        </>
      ) : selectedPatient ? (
        <Typography color="textSecondary">No vitals recorded for {patientName} yet.</Typography>
      ) : null}
    </div>
  );
}
