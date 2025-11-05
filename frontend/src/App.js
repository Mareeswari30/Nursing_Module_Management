import React from 'react';
import {
  AppBar,
  Tabs,
  Tab,
  Box,
  Paper,
  Typography,
  Container
} from '@mui/material';

import PatientDashboard from './PatientDashboard';
import TherapyDashboard from './TherapyDashboard';
import ShiftPlanner from './ShiftPlanner';
import VitalsTracker from './VitalsTracker';

export default function App() {
  const [tab, setTab] = React.useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const tabLabels = [
    'Patients',
    'Therapy Schedules',
    'Shift Planner',
    'Vitals'
  ];

  const renderTabContent = () => {
    switch (tab) {
      case 0:
        return <PatientDashboard />;
      case 1:
        return <TherapyDashboard />;
      case 2:
        return <ShiftPlanner />;
      case 3:
        return <VitalsTracker />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f7f9fb',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
 
      <AppBar position="static" color="primary" elevation={2}>
        <Container maxWidth="lg">
          <Typography
            variant="h6"
            sx={{
              py: 1.5,
              fontWeight: 'bold',
              letterSpacing: 0.5
            }}
          >
            🏥 Nursing Care Management
          </Typography>
        </Container>
      </AppBar>

      
      <Paper
        square
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: '#fff'
        }}
      >
        <Tabs
          value={tab}
          onChange={handleChange}
          centered
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              px: 2
            }
          }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Paper>

 
      <Container
        maxWidth="lg"
        sx={{
          mt: 3,
          mb: 4,
          flexGrow: 1
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: '#fff',
            minHeight: '70vh'
          }}
        >
          {renderTabContent()}
        </Paper>
      </Container>
    </Box>
  );
}
