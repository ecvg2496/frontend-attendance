import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { Public as PublicIcon } from '@mui/icons-material';

const TimeDisplay = ({ currentTime }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2, backgroundColor: 'primary.light' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PublicIcon sx={{ mr: 1, color: 'primary.dark' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
              Philippine Time (PHT)
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>
            {currentTime.pht.time24}
          </Typography>
          <Typography variant="body1" sx={{ color: 'primary.contrastText' }}>
            {currentTime.pht.time12}
          </Typography>
          <Typography variant="body2" sx={{ color: 'primary.contrastText' }}>
            {currentTime.pht.date}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2, backgroundColor: 'secondary.light' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PublicIcon sx={{ mr: 1, color: 'secondary.dark' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'secondary.dark' }}>
              Eastern Time (EST)
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.contrastText' }}>
            {currentTime.est.time24}
          </Typography>
          <Typography variant="body1" sx={{ color: 'secondary.contrastText' }}>
            {currentTime.est.time12}
          </Typography>
          <Typography variant="body2" sx={{ color: 'secondary.contrastText' }}>
            {currentTime.est.date}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TimeDisplay;