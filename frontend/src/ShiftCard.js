import React from 'react';
import { Card, CardContent, Typography, Chip, Stack, Box } from '@mui/material';

export default function ShiftCard({ data, bgColor }) {
  const patients = data.patients || [];

  return (
    <Card sx={{ backgroundColor: bgColor, borderRadius: 2, minHeight: 150 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {data.nurseName || 'Unknown Nurse'}
        </Typography>

        <Typography variant="body2" color="textSecondary" gutterBottom>
          Shift: {data.shift || 'N/A'}
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          Assigned Patients:
        </Typography>

        {patients.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {patients.slice(0, 5).map((p, i) => (
              <Chip key={i} label={p} variant="outlined" size="small" />
            ))}
            {patients.length > 5 && (
              <Box sx={{ mt: 0.5 }}>
                <Chip label={`+${patients.length - 5} more`} size="small" />
              </Box>
            )}
          </Stack>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No patients assigned
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
