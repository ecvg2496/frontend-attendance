import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, IconButton, Modal, 
  Grid, TextField, Select, MenuItem, FormControl, 
  InputLabel, Alert 
} from '@mui/material';
import axios from 'axios';
import { format, parse } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const WorkScheduleTab = ({ employees }) => {
  const [schedules, setSchedules] = useState([]);
  const [clients, setClients] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    employee_id: '',
    client_id: '',
    timezone_id: '',
    us_start_time: '',
    us_end_time: '',
    ph_start_time_dst: '',
    ph_end_time_dst: '',
    ph_start_time: '',
    ph_end_time: '',
    work_setup: 'REMOTE'
  });

  useEffect(() => {
    fetchSchedules();
    fetchClients();
    fetchTimezones();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/work-schedules/');
      setSchedules(response.data);
    } catch (err) {
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients/');
      setClients(response.data);
    } catch (err) {
      console.error('Failed to load clients', err);
    }
  };

  const fetchTimezones = async () => {
    try {
      const response = await axios.get('/api/timezones/');
      setTimezones(response.data);
    } catch (err) {
      console.error('Failed to load timezones', err);
    }
  };

  const formatTimeProfessional = (timeString) => {
    if (!timeString) return '--:--';
    try {
      const [hours, minutes] = timeString.split(':');
      const hourNum = parseInt(hours, 10);
      const isPM = hourNum >= 12;
      const hour12 = hourNum % 12 || 12;
      
      const pmStyles = {
        background: 'linear-gradient(to right, #2c3e50, #4a6491)',
        color: '#ecf0f1',
        textShadow: '0 1px 1px rgba(0,0,0,0.3)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
      };
      const amStyles = {
        background: 'linear-gradient(to right, #f5f7fa, #e4e8f0)',
        color: '#2980b9',
        textShadow: '0 1px 1px rgba(255,255,255,0.8)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
      };
      
      return (
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center',
        }}>
          <span style={{ 
            fontWeight: 600,
            marginRight: '2px'
          }}>
            {`${hour12}:${minutes.padStart(2, '0')}`}
          </span>
          <span style={{
            fontSize: '0.7em',
            padding: '2px 6px',
            borderRadius: '10px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            ...(isPM ? pmStyles : amStyles)
          }}>
            {isPM ? (
              <>
                <span style={{ opacity: 0.8 }}>🌙&nbsp;</span>
                PM
              </>
            ) : (
              <>
                <span style={{ opacity: 0.8 }}>☀️&nbsp;</span>
                AM
              </>
            )}
          </span>
        </span>
      );
    } catch (e) {
      console.error('Error formatting time:', e);
      return timeString;
    }
  };

  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setCurrentSchedule(schedule.id);
      setFormData({
        employee_id: schedule.employee.id,
        client_id: schedule.client.id,
        timezone_id: schedule.timezone?.id || '',
        us_start_time: schedule.us_start_time,
        us_end_time: schedule.us_end_time,
        ph_start_time_dst: schedule.ph_start_time_dst,
        ph_end_time_dst: schedule.ph_end_time_dst,
        ph_start_time: schedule.ph_start_time,
        ph_end_time: schedule.ph_end_time,
        work_setup: schedule.work_setup
      });
    } else {
      setCurrentSchedule(null);
      setFormData({
        employee_id: '',
        client_id: '',
        timezone_id: '',
        us_start_time: '',
        us_end_time: '',
        ph_start_time_dst: '',
        ph_end_time_dst: '',
        ph_start_time: '',
        ph_end_time: '',
        work_setup: 'REMOTE'
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentSchedule) {
        await axios.put(`/api/work-schedules/${currentSchedule}/`, formData);
      } else {
        await axios.post('/api/work-schedules/', formData);
      }
      fetchSchedules();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await axios.delete(`/api/work-schedules/${id}/`);
        fetchSchedules();
      } catch (err) {
        setError('Failed to delete schedule');
      }
    }
  };

  if (loading) return <div className="loading">Loading schedules...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (schedules.length === 0) return <div className="no-data">No schedules found</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Work Schedules
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{
            backgroundColor: '#2E7D32',
            '&:hover': {
              backgroundColor: '#1B5E20'
            }
          }}
        >
          Add Schedule
        </Button>
      </Box>

      <div className="container" style={{ width: '100%', overflowX: 'auto' }}>
        <table className="responsive-table" style={{ minWidth: '1300px' }}>
          <thead>
            <tr style={{ fontSize: '1.2rem', backgroundColor: '#2E7D32' }}>
              <th scope="col" style={{ fontSize: 'inherit', width: '200px', padding: '12px 16px' }}>Employee</th>
              <th scope="col" style={{ width: '200px', padding: '12px 16px' }}>Client</th>
              <th scope="col" style={{ width: '120px', padding: '12px 16px' }}>Timezone</th>
              <th scope="col" style={{ width: '180px', padding: '12px 16px' }}>US Schedule</th>
              <th scope="col" style={{ width: '180px', padding: '12px 16px' }}>PH Schedule (DST)</th>
              <th scope="col" style={{ width: '180px', padding: '12px 16px' }}>PH Schedule</th>
              <th scope="col" style={{ width: '120px', padding: '12px 16px' }}>Work Setup</th>
              <th scope="col" style={{ width: '120px', padding: '12px 16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id} style={{ fontSize: '1.1rem' }}>
                <td style={{ padding: '12px 16px', backgroundColor: '#f5f5f5', fontWeight: '500' }}>
                  {`${schedule.employee.first_name} ${schedule.employee.last_name}`}
                </td>
                <td style={{ padding: '12px 16px' }}>{schedule.client.name}</td>
                <td style={{ padding: '12px 16px' }}>{schedule.timezone?.abbreviation || 'N/A'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {formatTimeProfessional(schedule.us_start_time)}
                    <span style={{ color: '#777' }}>-</span>
                    {formatTimeProfessional(schedule.us_end_time)}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {formatTimeProfessional(schedule.ph_start_time_dst)}
                    <span style={{ color: '#777' }}>-</span>
                    {formatTimeProfessional(schedule.ph_end_time_dst)}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {formatTimeProfessional(schedule.ph_start_time)}
                    <span style={{ color: '#777' }}>-</span>
                    {formatTimeProfessional(schedule.ph_end_time)}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>{schedule.work_setup}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <IconButton 
                    color="primary" 
                    sx={{ '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.1)' } }}
                    title="View Details"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    color="primary" 
                    sx={{ '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.1)' } }}
                    title="Edit Details"
                    onClick={() => handleOpenModal(schedule)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' } }}
                    title="Delete"
                    onClick={() => handleDelete(schedule.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
            {currentSchedule ? 'Edit Schedule' : 'Add New Schedule'}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    label="Employee"
                    required
                  >
                    {employees.map(emp => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {`${emp.first_name} ${emp.last_name}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Client</InputLabel>
                  <Select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleInputChange}
                    label="Client"
                    required
                  >
                    {clients.map(client => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    name="timezone_id"
                    value={formData.timezone_id}
                    onChange={handleInputChange}
                    label="Timezone"
                  >
                    {timezones.map(tz => (
                      <MenuItem key={tz.id} value={tz.id}>
                        {tz.name} ({tz.abbreviation})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Work Setup</InputLabel>
                  <Select
                    name="work_setup"
                    value={formData.work_setup}
                    onChange={handleInputChange}
                    label="Work Setup"
                    required
                  >
                    <MenuItem value="ONSITE">Onsite</MenuItem>
                    <MenuItem value="REMOTE">Remote</MenuItem>
                    <MenuItem value="HYBRID">Hybrid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* US Schedule */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  US Schedule
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  name="us_start_time"
                  value={formData.us_start_time}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  name="us_end_time"
                  value={formData.us_end_time}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              {/* PH Schedule (DST) */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
                  PH Schedule (with DST)
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  name="ph_start_time_dst"
                  value={formData.ph_start_time_dst}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  name="ph_end_time_dst"
                  value={formData.ph_end_time_dst}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              {/* PH Schedule */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
                  PH Schedule (without DST)
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  name="ph_start_time"
                  value={formData.ph_start_time}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  name="ph_end_time"
                  value={formData.ph_end_time}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleCloseModal}
                    sx={{
                      color: '#2E7D32',
                      borderColor: '#2E7D32',
                      '&:hover': {
                        borderColor: '#1B5E20'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={loading}
                    sx={{
                      backgroundColor: '#2E7D32',
                      '&:hover': {
                        backgroundColor: '#1B5E20'
                      }
                    }}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default WorkScheduleTab;