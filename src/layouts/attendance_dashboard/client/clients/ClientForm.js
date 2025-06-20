import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Divider,
  Button,
  Avatar,
  IconButton,
  Popover,
  Grid,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Save, Add, Language, AccessTime, Close } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ClientForm = ({ 
  open,
  clientData, 
  onSave, 
  onClose,
  availableTimezones = [],
  isEdit = false 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    timezone: 'America/Los_Angeles',
    clientType: 'standard',
    begin_date: null,
    startTime: '00:00',
    endTime: '00:00',
    lunchBreak: true,
    workingHours: 0,
    avatarColor: '#3f51b5',
    created_by: []
  });
  const [timezoneAnchorEl, setTimezoneAnchorEl] = useState(null);
  const [newTimezone, setNewTimezone] = useState('');

  useEffect(() => {
    if (clientData) {
      setFormData({
        ...clientData,
        begin_date: clientData.begin_date ? new Date(clientData.begin_date) : null
      });
    } else {
      const employeeData = localStorage.getItem("employee");
      if (employeeData) {
        const employee = JSON.parse(employeeData);
        setFormData(prev => ({
          ...prev,
          created_by: [{
            name: `${employee.first_name} ${employee.last_name}`,
            email: employee.email
          }]
        }));
      }
    }
  }, [clientData]);

  const calculateEndTime = (startTime, clientType, lunchBreak) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let totalHours = clientType === 'part-time' ? 4 : 8;
    if (lunchBreak && clientType !== 'part-time') totalHours += 1;
    let endHour = hours + totalHours;
    return `${String(endHour % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'name' && value && !formData.name) {
      const colors = ['#3f51b5', '#f44336', '#4caf50', '#ff9800', '#9c27b0'];
      setFormData(prev => ({
        ...prev,
        avatarColor: colors[Math.floor(Math.random() * colors.length)]
      }));
    }

    if (name === 'startTime' || name === 'clientType' || name === 'lunchBreak') {
      const newEndTime = calculateEndTime(
        name === 'startTime' ? value : formData.startTime,
        name === 'clientType' ? value : formData.clientType,
        name === 'lunchBreak' ? checked : formData.lunchBreak
      );
      setFormData(prev => ({
        ...prev,
        endTime: newEndTime,
        workingHours: (name === 'clientType' && value === 'part-time') ? 4 : 8
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      begin_date: formData.begin_date ? formData.begin_date.toISOString().split('T')[0] : null
    });
  };

  const handleAddTimezone = () => {
    if (newTimezone && !availableTimezones.includes(newTimezone)) {
      setFormData(prev => ({ ...prev, timezone: newTimezone }));
      setTimezoneAnchorEl(null);
      setNewTimezone('');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '8px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white !important' }}>
            {isEdit ? 'Edit Client' : 'Create Client'}
          </Typography>
          <IconButton 
            onClick={onClose} 
            sx={{ color: 'white' }}
            aria-label="close"
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <Paper square elevation={0}>
          <Tabs 
            value={activeTab} 
            onChange={(e, val) => setActiveTab(val)} 
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3
              }
            }}
          >
            <Tab label="Basic Information" />
            <Tab label="Schedule Settings" />
          </Tabs>
        </Paper>

        <DialogContent sx={{ p: 0 }}>
          <Box p={3}>
            <form onSubmit={handleSubmit}>
              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ 
                        bgcolor: formData.avatarColor, 
                        width: 56, 
                        height: 56,
                        fontSize: '1.5rem'
                      }}>
                        {formData.name[0]?.toUpperCase() || 'C'}
                      </Avatar>
                      <TextField
                        fullWidth
                        label="Client Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Client Type</InputLabel>
                      <Select
                        name="clientType"
                        value={formData.clientType}
                        onChange={handleChange}
                        label="Client Type"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300 // Fixed dropdown height
                            }
                          }
                        }}
                        sx={{
                          '& .MuiSelect-select': {
                            height: '56px !important',
                            minHeight: '56px !important',
                            paddingLeft: '16px',
                            display: 'flex',
                            alignItems: 'center'
                          },
                          '& .MuiOutlinedInput-root': {
                            height: '56px'
                          }
                        }}
                      >
                        <MenuItem value="part-time">Part-time</MenuItem>
                        <MenuItem value="standard">Standard</MenuItem>
                        <MenuItem value="project">Project (no specific hours)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Select
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleChange}
                          label="Timezone"
                          fullWidth
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300 // Fixed dropdown height
                              }
                            }
                          }}
                          sx={{
                            '& .MuiSelect-select': {
                              height: '56px !important',
                              minHeight: '56px !important',
                              paddingLeft: '16px',
                              display: 'flex',
                              alignItems: 'center'
                            },
                            '& .MuiOutlinedInput-root': {
                              height: '56px'
                            }
                          }}
                          renderValue={(selected) => (
                            <Box display="flex" alignItems="center">
                              <Language sx={{ mr: 1, fontSize: '1rem' }} />
                              {selected}
                            </Box>
                          )}
                        >
                          {availableTimezones.map(tz => (
                            <MenuItem key={tz} value={tz}>
                              <Box display="flex" alignItems="center">
                                <Language sx={{ mr: 1, fontSize: '1rem' }} />
                                {tz}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        <IconButton 
                          onClick={(e) => setTimezoneAnchorEl(e.currentTarget)}
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </FormControl>
                    
                    <Popover
                      open={Boolean(timezoneAnchorEl)}
                      anchorEl={timezoneAnchorEl}
                      onClose={() => setTimezoneAnchorEl(null)}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <Box p={2} width={300}>
                        <Typography variant="subtitle1" gutterBottom>
                          Add New Timezone
                        </Typography>
                        <Box display="flex" gap={1} alignItems="center">
                          <TextField
                            size="small"
                            value={newTimezone}
                            onChange={(e) => setNewTimezone(e.target.value)}
                            placeholder="e.g., America/Chicago"
                            fullWidth
                          />
                          <Button 
                            variant="contained" 
                            onClick={handleAddTimezone}
                            disabled={!newTimezone}
                            size="small"
                            sx={{ color: 'white' }}
                          >
                            Add
                          </Button>
                        </Box>
                      </Box>
                    </Popover>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <DatePicker
                      label="Begin On"
                      value={formData.begin_date}
                      onChange={(date) => setFormData(prev => ({ ...prev, begin_date: date }))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          required
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: <AccessTime sx={{ mr: 1 }} />
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Working Hours
                    </Typography>
                    {formData.clientType !== 'project' && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Start Time"
                              type="time"
                              name="startTime"
                              value={formData.startTime}
                              onChange={handleChange}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="End Time"
                              type="time"
                              name="endTime"
                              value={formData.endTime}
                              onChange={handleChange}
                              InputLabelProps={{ shrink: true }}
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="lunchBreak"
                              checked={formData.lunchBreak}
                              onChange={handleChange}
                            />
                          }
                          label="Include 1-hour lunch break (automatically deducted from working hours)"
                        />
                        <Divider sx={{ my: 2 }} />
                        <TextField
                          fullWidth
                          label={`Total Working Hours (${formData.clientType === 'part-time' ? '5' : '9'} hrs/day)`}
                          value={formData.workingHours}
                          InputProps={{
                            readOnly: true,
                            endAdornment: 'hours/day',
                          }}
                        />
                      </>
                    )}
                    {formData.clientType === 'project' && (
                      <Typography variant="body2">
                        Project clients don't have specific working hour requirements.
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              )}

              <Box sx={{ 
                mt: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box>
                  {activeTab > 0 && (
                    <Button
                      variant="outlined"
                      onClick={() => setActiveTab(activeTab - 1)}
                      sx={{ 
                        minWidth: 120,
                        color: 'primary.main',
                        borderColor: 'primary.main',
                        '&:hover': {
                          borderColor: 'primary.dark'
                        }
                      }}
                    >
                      Previous
                    </Button>
                  )}
                </Box>
                <Box>
                  {activeTab < 1 ? (
                    <Button
                      variant="contained"
                      onClick={() => setActiveTab(activeTab + 1)}
                      sx={{ 
                        minWidth: 120,
                        color: 'white !important',
                        '&:hover': {
                          backgroundColor: 'primary.dark'
                        }
                      }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save sx={{ color: 'white' }} />}
                      sx={{ 
                        minWidth: 120,
                        color: 'white !important',
                        '&:hover': {
                          backgroundColor: 'primary.dark'
                        }
                      }}
                    >
                      Save
                    </Button>
                  )}
                </Box>
              </Box>
            </form>
          </Box>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ClientForm;