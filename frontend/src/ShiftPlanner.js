import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import ShiftCard from './ShiftCard';

const API_URL = 'http://localhost:5000/api/nursing/shifts';

export default function ShiftPlanner() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await axios.get(API_URL);
        setShifts(res.data);
      } catch (err) {
        console.error('Error fetching shifts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShifts();
  }, []);


  const grouped = shifts.reduce((acc, shift) => {
    const type = shift.shift || 'Unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(shift);
    return acc;
  }, {});


  const colors = {
    Morning: '#E3F2FD',  // light blue
    Evening: '#FFF3E0',  // light orange
    Night: '#EDE7F6',    // light purple
    Unknown: '#F5F5F5',  // fallback gray
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        👩‍⚕️ Nurse Shift Planner
      </Typography>

      {Object.keys(grouped).length === 0 ? (
        <Typography sx={{ mt: 3, color: '#888' }}>
          No shifts available.
        </Typography>
      ) : (
        Object.keys(grouped).map((shiftType) => (
          <Box key={shiftType} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {shiftType} Shift
            </Typography>
            <Grid container spacing={2}>
              {grouped[shiftType].map((s) => (
                <Grid item xs={12} sm={6} md={4} key={s.id || s.nurseId}>
                  <ShiftCard data={s} bgColor={colors[shiftType] || '#FFF'} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}
    </Box>
  );
}
