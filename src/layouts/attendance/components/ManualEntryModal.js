import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Divider
} from '@mui/material';
import { Close as CloseIcon, Info as InfoIcon } from '@mui/icons-material';
import { formatDateToYMD, formatTimeToHMS, getCurrentPHTDate } from '../helpers/timeUtils';

const ManualEntryModal = ({ 
  open, 
  setOpen, 
  employee, 
  loading, 
  handleSubmitManualEntry 
}) => {
  const [manualEntry, setManualEntry] = useState({
    date: formatDateToYMD(getCurrentPHTDate()),
    action: 'timeIn',
    time: formatTimeToHMS(getCurrentPHTDate()),
    reason: '',
    notes: '',
    scenario: 'normal' // 'normal', 'system_issue', 'fieldwork', 'leave_mismatch'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setManualEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    handleSubmitManualEntry(manualEntry);
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Manual Time Log Entry</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Scenario</InputLabel>
              <Select
                name="scenario"
                value={manualEntry.scenario}
                onChange={handleChange}
                label="Scenario"
              >
                <MenuItem value="normal">Normal Manual Entry</MenuItem>
                <MenuItem value="system_issue">System Issues</MenuItem>
                <MenuItem value="fieldwork">Fieldwork</MenuItem>
                <MenuItem value="leave_mismatch">Leave Day Logged as Present</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {manualEntry.scenario === 'leave_mismatch' && (
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'warning.light', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <InfoIcon color="warning" />
                <Typography variant="body2">
                  Use this option when leave was approved but system shows employee as present.
                  This will reconcile the attendance record with leave records.
                </Typography>
              </Box>
            </Grid>
          )}

          {manualEntry.scenario === 'system_issue' && (
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'info.light', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <InfoIcon color="info" />
                <Typography variant="body2">
                  Use this option when the time log was manually entered due to system issues.
                  Please provide details in the notes section.
                </Typography>
              </Box>
            </Grid>
          )}

          {manualEntry.scenario === 'fieldwork' && (
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'success.light', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <InfoIcon color="success" />
                <Typography variant="body2">
                  Use this option for fieldwork or remote work entries.
                  Please attach supporting documents if available.
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              name="date"
              value={manualEntry.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Time"
              type="time"
              name="time"
              value={manualEntry.time}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Action Type</InputLabel>
              <Select
                name="action"
                value={manualEntry.action}
                onChange={handleChange}
                label="Action Type"
              >
                <MenuItem value="timeIn">Time In</MenuItem>
                <MenuItem value="breakStart">Start Break</MenuItem>
                <MenuItem value="breakEnd">End Break</MenuItem>
                <MenuItem value="timeOut">Time Out</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Reason</InputLabel>
              <Select
                name="reason"
                value={manualEntry.reason}
                onChange={handleChange}
                label="Reason"
              >
                <MenuItem value="forgot">Forgot to log</MenuItem>
                <MenuItem value="technical">Technical issues</MenuItem>
                <MenuItem value="emergency">Emergency situation</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={manualEntry.notes}
              onChange={handleChange}
              multiline
              rows={3}
              margin="normal"
              placeholder={
                manualEntry.scenario === 'leave_mismatch' 
                  ? "Please specify the leave type and dates that should be applied..." 
                  : "Provide additional details about this manual entry..."
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Manual Entry'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManualEntryModal;