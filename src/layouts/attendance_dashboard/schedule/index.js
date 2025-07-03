import React, { useState, useEffect, useCallback, useMemo } from "react";
import { axiosPrivate } from "api/axios";
import {
  Card,
  Typography,
  Box,
  Modal,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Avatar,
  Chip,
  Stack,
  Divider,
  Alert,
  Snackbar,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import {
  Add,
  Close,
  PendingActions,
  CheckCircle,
  Cancel,
  AccessTime,
  Schedule,
  Search as SearchIcon,
  FilterList,
  Tune,
  Remove,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Edit
} from '@mui/icons-material';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse, compareDesc } from 'date-fns';
import GlobalSideNav from "../content_page/sidebar";
import '../content_page/css/admintable.css';
import LaunchIcon from '@mui/icons-material/Launch';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

// Helper Functions (same as before)
const formatDisplayDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalid date';
  }
};

const formatDisplayTime = (timeString) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ScheduleRequestTable component (updated without pagination)
const ScheduleRequestTable = ({ 
  data, 
  loading, 
  error, 
  onStatusUpdate,
  onViewDetails
}) => {
  const statusColors = {
    pending: { bg: '#FFF3E0', color: '#E65100', icon: <PendingActions fontSize="small" /> },
    approved: { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircle fontSize="small" /> },
    rejected: { bg: '#FFEBEE', color: '#C62828', icon: <Cancel fontSize="small" /> }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Box p={2} bgcolor="error.light" color="error.dark" borderRadius={1}>
        <Typography align="center">Error: {error.message}</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box p={4} textAlign="center" color="text.secondary">
        <Typography variant="subtitle1">No schedule requests found</Typography>
      </Box>
    );
  }

  return (
    <Box width="100%" overflow="auto" position="relative" sx={{ mt: 2, mb: 4 }}>
      <table style={{
        width: '100%',
        minWidth: '1200px',
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Actions</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date Filed</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Employee</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date Requested</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Schedule Details</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Day Off</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Reason</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Remarks</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Status</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Processed By</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date Modified</th>
          </tr>
        </thead>
        <tbody>
          {data.map((request, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <IconButton onClick={() => onViewDetails(request)}>
                  {request.status === 'pending' ? (
                    <LaunchIcon color="primary" />
                  ) : (
                    <VisibilityIcon color="primary" />
                  )}
                </IconButton>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Box fontSize="0.9rem">
                  {formatDateTime(request.created_at)}
                </Box>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontSize: '0.75rem' }}>
                    {getInitials(request.employee_name)}
                  </Avatar>
                  <Box>
                    <Box fontWeight={500}>{request.employee_name || 'Unknown'}</Box>
                    <Box fontSize="0.75rem" color="#666">{request.email || 'No email'}</Box>
                  </Box>
                </Box>
              </td>
              <td style={{ padding: '12px 16px' }}>
                {request.schedule_days.map((day, i) => (
                  <div key={i}>{formatDisplayDate(day.date)}</div>
                ))}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {request.schedule_days.map((day, i) => (
                  <Box key={i} mb={2}>
                    <Typography variant="body2" sx={{fontSize: '0.9rem'}}>
                      {formatDisplayTime(day.time_in)} - {formatDisplayTime(day.time_out)} 
                    </Typography>
                    {day.start_break && day.end_break && (
                      <Typography variant="caption" color="text.secondary">
                        Break: {formatDisplayTime(day.start_break)} - {formatDisplayTime(day.end_break)}
                      </Typography>
                    )}
                  </Box>
                ))}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <Box>
                    {request.is_day_off || '0'}
                  </Box>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <Box>
                  {request.justification || 'None'}
                </Box>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <Box>
                  {request?.admin_remarks || ''}
                </Box>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Chip
                  label={
                    request.status.charAt(0).toUpperCase() + request.status.slice(1)
                  }
                  size="small"
                  sx={{
                    backgroundColor: statusColors[request.status].bg,
                    color: statusColors[request.status].color,
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              </td>
              <td style={{ padding: '12px 16px' }}>
                <Box>
                  {request?.processed_by || ''}
                </Box>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Box>
                  {formatDateTime(request?.updated_at) || ''}
                </Box>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

// EmployeeScheduleTable component (updated with edit modal)
const EmployeeScheduleTable = ({ 
  data, 
  loading, 
  error
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    monday: { enabled: false, timeIn: '08:00', timeOut: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    tuesday: { enabled: false, timeIn: '08:00', timeOut: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    wednesday: { enabled: false, timeIn: '08:00', timeOut: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    thursday: { enabled: false, timeIn: '08:00', timeOut: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    friday: { enabled: false, timeIn: '08:00', timeOut: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    permanent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    // If employee has existing schedule, populate the form
    if (employee.schedule) {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const newScheduleData = { ...scheduleData };
      
      days.forEach(day => {
        if (employee.schedule[day]) {
          newScheduleData[day] = {
            enabled: true,
            timeIn: employee.schedule[day].time_in || '08:00',
            timeOut: employee.schedule[day].time_out || '17:00',
            breakStart: employee.schedule[day].break_start || '12:00',
            breakEnd: employee.schedule[day].break_end || '13:00'
          };
        }
      });
      
      newScheduleData.permanent = employee.schedule.permanent || false;
      setScheduleData(newScheduleData);
    }
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedEmployee(null);
    // Reset form data
    setScheduleData({
      monday: { enabled: false, timeIn: '08:00', timeOut: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      tuesday: { enabled: false, timeIn: '08:00', timeOut: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      wednesday: { enabled: false, timeIn: '08:00', timeOut: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      thursday: { enabled: false, timeIn: '08:00', timeOut: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      friday: { enabled: false, timeIn: '08:00', timeOut: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      permanent: false
    });
  };

  const handleScheduleChange = (day, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };
const handleSelectAllToggle = (checked) => {
  setSelectAllChecked(checked);

  const updatedSchedule = { ...scheduleData };
  Object.keys(updatedSchedule).forEach(day => {
    updatedSchedule[day].enabled = checked;
  });
  setScheduleData(updatedSchedule);
};
  const handleDayToggle = (day, checked) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: checked
      }
    }));
  };
  const calculateTotalHours = () => {
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    .filter(day => scheduleData[day].enabled)
    .reduce((total, day) => total + (scheduleData[day].hours || 0), 0)
    .toFixed(2);
};
  const handleSubmit = async () => {
    if (!selectedEmployee) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare the schedule data to send to the API
      const scheduleToSubmit = {
        monday: scheduleData.monday.enabled ? {
          time_in: scheduleData.monday.timeIn,
          time_out: scheduleData.monday.timeOut,
          break_start: scheduleData.monday.breakStart,
          break_end: scheduleData.monday.breakEnd
        } : null,
        tuesday: scheduleData.tuesday.enabled ? {
          time_in: scheduleData.tuesday.timeIn,
          time_out: scheduleData.tuesday.timeOut,
          break_start: scheduleData.tuesday.breakStart,
          break_end: scheduleData.tuesday.breakEnd
        } : null,
        wednesday: scheduleData.wednesday.enabled ? {
          time_in: scheduleData.wednesday.timeIn,
          time_out: scheduleData.wednesday.timeOut,
          break_start: scheduleData.wednesday.breakStart,
          break_end: scheduleData.wednesday.breakEnd
        } : null,
        thursday: scheduleData.thursday.enabled ? {
          time_in: scheduleData.thursday.timeIn,
          time_out: scheduleData.thursday.timeOut,
          break_start: scheduleData.thursday.breakStart,
          break_end: scheduleData.thursday.breakEnd
        } : null,
        friday: scheduleData.friday.enabled ? {
          time_in: scheduleData.friday.timeIn,
          time_out: scheduleData.friday.timeOut,
          break_start: scheduleData.friday.breakStart,
          break_end: scheduleData.friday.breakEnd
        } : null,
        permanent: scheduleData.permanent
      };

      // Call API to update employee schedule
      await axiosPrivate.put(`attendance/employees/${selectedEmployee.id}/schedule/`, scheduleToSubmit);
      
      // Close modal and refresh data
      handleCloseEditModal();
      // You might want to add a success snackbar here
    } catch (error) {
      console.error("Error updating schedule:", error);
      // You might want to add an error snackbar here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Box p={2} bgcolor="error.light" color="error.dark" borderRadius={1}>
        <Typography align="center">Error: {error.message}</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box p={4} textAlign="center" color="text.secondary">
        <Typography variant="subtitle1">No employee schedules found</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box width="100%" overflow="auto" position="relative" sx={{ mt: 2, mb: 4 }}>
        <table style={{
          width: '100%',
          minWidth: '1200px',
          borderCollapse: 'collapse',
          fontSize: '0.875rem'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Employee</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Position</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Department</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Current Schedule</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Processed By</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((employee, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontSize: '0.75rem' }}>
                      {getInitials(employee?.first_name)}
                    </Avatar>
                    <Box>
                      <Box fontWeight={500}>{employee?.first_name || ''} {employee?.last_name || ''}</Box>
                      <Box fontSize="0.75rem" color="#666">{employee.email || 'No email'}</Box>
                    </Box>
                  </Box>
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {employee.position || 'N/A'}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {employee.department || 'N/A'}
                </td>
                {/* <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {employee.department ? (
                    <Box>
                      <Typography variant="body2">
                        {employee?.time_in} - {employee.schedule.time_out}
                      </Typography>
                      {employee.schedule.break_start && employee.schedule.break_end && (
                        <Typography variant="caption" color="text.secondary">
                          Break: {employee.schedule.break_start} - {employee.schedule.break_end}
                        </Typography>
                      )}
                    </Box>
                  ) : 'No schedule set'}
                </td> */}
                 <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {formatDisplayTime(employee?.time_in) || 'N/A'} - {formatDisplayTime(employee?.time_out)}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {employee?.processed_by || ""}
                </td>
                              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <Tooltip title="Edit Schedule">
                    <IconButton 
                      color="primary"
                      size="small"
                      onClick={() => handleEditClick(employee)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      {/* Edit Schedule Modal */}
      <Modal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        aria-labelledby="edit-schedule-modal"
        aria-describedby="edit-schedule-description"
      >
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
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" color="primary" component="h2">
              Edit Schedule of {selectedEmployee?.first_name} {selectedEmployee?.last_name}
            </Typography>
            <IconButton onClick={handleCloseEditModal}>
              <Close />
            </IconButton>
          </Box>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mb: 3 }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Select</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Day</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Time In</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Time Out</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Break</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Break Start</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Break End</th>
                  </tr>
                </thead>
                <tbody>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => (
                    <tr key={day} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <Checkbox
                          checked={scheduleData[day].enabled}
                          onChange={(e) => handleDayToggle(day, e.target.checked)}
                        />
                      </td>
                      <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{day}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <MobileTimePicker
                          value={parse(scheduleData[day].timeIn, 'HH:mm', new Date())}
                          onChange={(newValue) => handleScheduleChange(day, 'timeIn', format(newValue, 'HH:mm'))}
                          disabled={!scheduleData[day].enabled}
                          renderInput={(params) => <TextField {...params} size="small" />}
                        />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <MobileTimePicker
                          value={parse(scheduleData[day].timeOut, 'HH:mm', new Date())}
                          onChange={(newValue) => handleScheduleChange(day, 'timeOut', format(newValue, 'HH:mm'))}
                          disabled={!scheduleData[day].enabled}
                          renderInput={(params) => <TextField {...params} size="small" />}
                        />
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <Checkbox
                          checked={scheduleData[day].hasBreak}
                          onChange={(e) => handleScheduleChange(day, 'hasBreak', e.target.checked)}
                          disabled={!scheduleData[day].enabled}
                        />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {scheduleData[day].hasBreak && (
                          <MobileTimePicker
                            value={parse(scheduleData[day].breakStart, 'HH:mm', new Date())}
                            onChange={(newValue) => handleScheduleChange(day, 'breakStart', format(newValue, 'HH:mm'))}
                            disabled={!scheduleData[day].enabled}
                            renderInput={(params) => <TextField {...params} size="small" />}
                          />
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {scheduleData[day].hasBreak && (
                          <MobileTimePicker
                            value={parse(scheduleData[day].breakEnd, 'HH:mm', new Date())}
                            onChange={(newValue) => handleScheduleChange(day, 'breakEnd', format(newValue, 'HH:mm'))}
                            disabled={!scheduleData[day].enabled}
                            renderInput={(params) => <TextField {...params} size="small" />}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Hours Display */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="subtitle1" color="primary">
                  Total Work Hours:{" "}
                  {
                    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
                      .filter(day => scheduleData[day].enabled)
                      .reduce((acc, day) => acc + (scheduleData[day].hours || 0), 0)
                      .toFixed(2)
                  } hours
                </Typography>
              </Box>
            </Box>
          </LocalizationProvider>

        </Box>
      </Modal>
    </>
  );
};

// RequestDetailsModal component (same as before)
const RequestDetailsModal = ({ 
  open, 
  onClose, 
  request, 
  onStatusUpdate,
  loading 
}) => {
  const [adminRemarks, setAdminRemarks] = useState(request?.admin_remarks || '');
  const employee = JSON.parse(localStorage.getItem('employee'));

  const handleStatusUpdateWithRemarks = (status) => {
  const processedByName = employee ? `${employee.first_name} ${employee.last_name}` : 'Admin';
  onStatusUpdate(status, adminRemarks, processedByName);
  };

  useEffect(() => {
    if (request) {
      setAdminRemarks(request.admin_remarks || '');
    }
  }, [request]);

  if (!request) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="request-details-modal"
      aria-describedby="request-details-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="h4" color="primary" component="h2">
            Schedule Request Details
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Box>
          <Box>
            <Typography>Name:&nbsp;{request.employee_name || 'Unknown'}</Typography>
            <Typography>
              Email:&nbsp;
              <span style={{ color: 'blue' }}>
                {request.email || 'No email'}
              </span>
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography>
            Status:&nbsp;
            <span style={{ 
              color: request?.status === 'approved' ? 'green' : 
                    request?.status === 'rejected' ? 'red' : 
                    request?.status === 'pending' ? 'orange' : 
                    'inherit'
            }}>
              {request?.status 
                ? request.status.charAt(0).toUpperCase() + request.status.slice(1) 
                : 'N/A'}
            </span>
          </Typography>
        </Box>
        <Typography>Date Filed: {formatDateTime(request.created_at)}</Typography>
        <Typography>Reason:&nbsp;{request.justification || 'No reason provided'}</Typography>
        <Typography mb={2}>Date Modified: {formatDateTime(request.updated_at)}</Typography>

        {request.processed_by && (
          <Typography mb={2}>
            Processed by: {request.processed_by}
          </Typography>
        )}

        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary" mb={2}>Schedule Days</Typography>
          {request.schedule_days.map((day, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2, borderRadius: 1 }}>
              <Typography fontWeight="medium" mb={1}>
                {formatDisplayDate(day.date)}
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Time In:</Typography>
                <Typography>{formatDisplayTime(day.time_in)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Time Out:</Typography>
                <Typography>{formatDisplayTime(day.time_out)}</Typography>
              </Box>
              {day.start_break && day.end_break && (
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Break Time:</Typography>
                  <Typography>
                    {formatDisplayTime(day.start_break)} - {formatDisplayTime(day.end_break)}
                  </Typography>
                </Box>
              )}
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Total Hours:</Typography>
                <Typography>{day.hours} hours</Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Admin Remarks
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Enter remarks for this action..."
            value={adminRemarks}
            onChange={(e) => setAdminRemarks(e.target.value)}
            InputProps={{
              readOnly: request.status !== 'pending',
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: request.status !== 'pending' ? 'action.hover' : 'background.paper',
              }
            }}
          />
        </Box>

        {request.status === 'pending' && (
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button 
              variant="contained" 
              color="error"
              startIcon={<Cancel />}
              onClick={() => handleStatusUpdateWithRemarks('rejected')}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Reject'}
            </Button>
            <Button 
              variant="contained" 
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleStatusUpdateWithRemarks('approved')}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Approve'}
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

// FilterModal component (same as before)
const FilterModal = ({ 
  open, 
  onClose, 
  statusFilters, 
  onStatusFilterChange,
  alphabetFilter,
  onAlphabetFilterChange
}) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" color="primary">Filter Options</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box mb={3}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={statusFilters.pending}
                  onChange={() => onStatusFilterChange('pending')}
                  sx={{
                    color: '#FFA726',
                    '&.Mui-checked': {
                      color: '#FB8C00',
                    },
                  }}
                />
              }
              label="Pending"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={statusFilters.approved}
                  onChange={() => onStatusFilterChange('approved')}
                  sx={{
                    color: '#66BB6A',
                    '&.Mui-checked': {
                      color: '#388E3C',
                    },
                  }}
                />
              }
              label="Approved"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={statusFilters.rejected}
                  onChange={() => onStatusFilterChange('rejected')}
                  sx={{
                    color: '#EF9A9A',
                    '&.Mui-checked': {
                      color: '#D32F2F',
                    },
                  }}
                />
              }
              label="Rejected"
            />
          </FormGroup>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {alphabet.map(value => (
              <Button 
                key={value} 
                onClick={() => onAlphabetFilterChange(value)}
                variant={alphabetFilter === value ? 'contained' : 'outlined'}
                sx={{
                  minWidth: '36px', 
                  height: '36px', 
                  borderRadius: '8px',
                  p: 0,
                  fontWeight: 'bold',
                  borderColor: '#90caf9',
                  color: alphabetFilter === value ? 'white !important' : 'inherit',
                  backgroundColor: alphabetFilter === value ? '#2E7D32' : 'inherit',
                  '&:hover': {
                    backgroundColor: alphabetFilter === value ? '#1B5E20' : 'rgba(46, 125, 50, 0.08)'
                  }
                }}
              >
                {value}
              </Button>
            ))}
            <Button 
              onClick={() => onAlphabetFilterChange('')}
              variant={alphabetFilter === '' ? 'contained' : 'outlined'}
              sx={{
                minWidth: '80px', 
                height: '36px', 
                borderRadius: '8px',
                fontWeight: 'bold',
                borderColor: '#90caf9',
                color: alphabetFilter === '' ? 'white !important' : 'inherit',
                backgroundColor: alphabetFilter === '' ? '#2E7D32' : 'inherit',
                '&:hover': {
                  backgroundColor: alphabetFilter === '' ? '#1B5E20' : 'rgba(46, 125, 50, 0.08)'
                }
              }}
            >
              All
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained" sx={{color: 'white !important'}}>
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CustomizeScheduleRequestForm = () => {
  const [scheduleRequests, setScheduleRequests] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [employeeError, setEmployeeError] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState({
    pending: true,
    approved: true,
    rejected: true
  });
  const [alphabetFilter, setAlphabetFilter] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const refreshData = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      const emp = JSON.parse(storedEmployee);
      setEmployee(emp);
      fetchScheduleRequests(emp.id);
    }
  }, [refreshCounter]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchScheduleRequests = async (employeeId) => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get(`attendance/schedule-requests/`);
      const data = Array.isArray(res.data) ? res.data : [];
      const normalizedData = data.map(item => ({
        ...item,
        status: item.status.toLowerCase()
      }));
      setScheduleRequests(normalizedData);
    } catch (error) {
      console.error("Error fetching schedule requests:", error);
      setScheduleRequests([]);
      setSnackbar({
        open: true,
        message: "Failed to fetch schedule requests",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      const response = await axiosPrivate.get('attendance/employees/');
      setAllEmployees(response.data);
      setEmployeeLoading(false);
    } catch (err) {
      setEmployeeError(err.message);
      setEmployeeLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return scheduleRequests
      .filter(request => {
        if (!statusFilters[request.status]) return false;
        
        if (alphabetFilter && request.employee_name) {
          const firstLetter = request.employee_name.charAt(0).toUpperCase();
          if (firstLetter !== alphabetFilter) return false;
        }
        
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesName = request.employee_name?.toLowerCase().includes(searchLower);
          const matchesEmail = request.email?.toLowerCase().includes(searchLower);
          const matchesReason = request.justification?.toLowerCase().includes(searchLower);
          const matchesStatus = request.status?.toLowerCase().includes(searchLower);
          const matchesRemarks = request.admin_remarks?.toLowerCase().includes(searchLower);
          
          if (!matchesName && !matchesEmail && !matchesReason && !matchesStatus && !matchesRemarks) {
            return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return compareDesc(new Date(a.created_at), new Date(b.created_at));
      });
  }, [scheduleRequests, statusFilters, alphabetFilter, searchTerm]);

  const filteredEmployees = useMemo(() => {
    return allEmployees
      .filter(employee => {
        if (employeeSearchTerm) {
          const searchLower = employeeSearchTerm.toLowerCase();
          const matchesName = employee.name?.toLowerCase().includes(searchLower);
          const matchesEmail = employee.email?.toLowerCase().includes(searchLower);
          const matchesPosition = employee.position?.toLowerCase().includes(searchLower);
          const matchesDepartment = employee.department?.toLowerCase().includes(searchLower);
          
          if (!matchesName && !matchesEmail && !matchesPosition && !matchesDepartment) {
            return false;
          }
        }
        return true;
      });
  }, [allEmployees, employeeSearchTerm]);

  const handleStatusFilterChange = (status) => {
    setStatusFilters(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const handleAlphabetFilterChange = (value) => {
    setAlphabetFilter(value);
  };

  const handleViewDetails = useCallback((request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedRequest(null);
  }, []);

  const handleStatusUpdate = useCallback(async (status, remarks, processedBy) => {
  if (!selectedRequest) return;
  
  try {
    setActionLoading(true);
    
    // Get employee data from localStorage
    const storedEmployee = localStorage.getItem('employee');
    const employee = storedEmployee ? JSON.parse(storedEmployee) : null;
    const processedByName = employee ? `${employee.first_name} ${employee.last_name}` : 'Admin';
    
    const updateData = {
      status: status,
      admin_remarks: remarks,
      processed_by: processedByName  
    };

    const response = await axiosPrivate.patch(
      `attendance/schedule-requests/${selectedRequest.id}/`,
      updateData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    setSnackbar({
      open: true,
      message: `Request ${status} successfully!`,
      severity: "success"
    });
    
    // Refresh data
    const res = await axiosPrivate.get('attendance/schedule-requests/');
    setScheduleRequests(res.data.map(item => ({
      ...item,
      status: item.status.toLowerCase()
    })));
    
    handleCloseModal();
  } catch (error) {
    console.error("Error updating request status:", error);
    
    let errorMessage = "Failed to update request status";
    if (error.response) {
      // Handle specific backend validation errors
      if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.status === 400) {
        errorMessage = "Invalid request data. Please check the schedule dates.";
      }
    }
    
    setSnackbar({
      open: true,
      message: errorMessage,
      severity: "error"
    });
  } finally {
    setActionLoading(false);
  }
}, [selectedRequest, refreshData, handleCloseModal]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <GlobalSideNav>
      <Card sx={{
        minHeight: 'calc(103vh - 64px)',
        width: '100%',
        mt: -10,
        p: 3
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderRadius: 1
        }}>
          <Typography variant="h3" color="primary">
            {currentTab === 0 ? 'Custom Schedule Requests' : 'Employee Schedules'}
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="schedule tabs">
            <Tab label="Schedule Request" />
            <Tab label="Employee Schedule" />
          </Tabs>
        </Box>

        {currentTab === 0 ? (
          <>
            <Box sx={{ p: 2, borderRadius: 1 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <TextField
                  placeholder="Search requests..."
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ maxWidth: 500 }}
                />
                
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setFilterModalOpen(true)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Filters
                </Button>
              </Box>
            </Box>

            <ScheduleRequestTable
              data={filteredRequests}
              loading={loading}
              error={error}
              onStatusUpdate={refreshData}
              onViewDetails={handleViewDetails}
            />

            <RequestDetailsModal
              open={modalOpen}
              onClose={handleCloseModal}
              request={selectedRequest}
              onStatusUpdate={handleStatusUpdate}
              loading={actionLoading}
            />

            <FilterModal
              open={filterModalOpen}
              onClose={() => setFilterModalOpen(false)}
              statusFilters={statusFilters}
              onStatusFilterChange={handleStatusFilterChange}
              alphabetFilter={alphabetFilter}
              onAlphabetFilterChange={handleAlphabetFilterChange}
            />
          </>
        ) : (
          <>
            <Box sx={{ p: 2, borderRadius: 1 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <TextField
                  placeholder="Search employees..."
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                  }}
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  sx={{ maxWidth: 500 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setFilterModalOpen(true)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Filters
                </Button>
              </Box>
              
            </Box>

            <EmployeeScheduleTable
              data={filteredEmployees}
              loading={employeeLoading}
              error={employeeError}
            />
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Card>
    </GlobalSideNav>
  );
};

export default CustomizeScheduleRequestForm;