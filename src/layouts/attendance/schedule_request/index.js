import React, { useState, useEffect } from "react";
import api from "api/axios";

import {
  Card,
  Typography,
  Box,
  Modal,
  Tabs,
  Fab,
  Tab,
  Checkbox,
  TextField,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Badge,
  Avatar,
  Chip,
  Stack,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add,
  Close,
  Send,
  PendingActions,
  CheckCircle,
  Cancel,
  AccessTime,
  Schedule
} from '@mui/icons-material';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse, isValid } from 'date-fns';
import SideNavBar from "../content_page/nav_bar";
import '../content_page/css/admintable.css';

const StatusBadge = ({ status, count }) => {
  const statusConfig = {
    pending: { color: 'warning', icon: <PendingActions fontSize="small" /> },
    approved: { color: 'success', icon: <CheckCircle fontSize="small" /> },
    rejected: { color: 'error', icon: <Cancel fontSize="small" /> }
  };

  return (
    <Badge badgeContent={count} color={statusConfig[status].color} sx={{ '& .MuiBadge-badge': { right: -15, mt: 1.5 } }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {statusConfig[status].icon}
        <Typography variant="body2" textTransform="capitalize">
          {status}
        </Typography>
      </Stack>
    </Badge>
  );
};

const ScheduleRequestTable = ({ data, loading, error, type }) => {
  const statusColors = {
    pending: { bg: '#FFF3E0', color: '#E65100', icon: <PendingActions fontSize="small" /> },
    approved: { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircle fontSize="small" /> },
    rejected: { bg: '#FFEBEE', color: '#C62828', icon: <Cancel fontSize="small" /> }
  };

   const flattenRequests = (requests) => {
    if (!requests || !Array.isArray(requests)) return [];
    
    return requests.flatMap(request => {
      // Skip requests without schedule_days or with empty schedule_days
      if (!request.schedule_days || request.schedule_days.length === 0) {
        return [];
      }
      
      // Ensure schedule_days is an array
      const days = Array.isArray(request.schedule_days) ? 
        request.schedule_days : 
        [request.schedule_days];
      
      return days.map(day => ({
        ...request,
        ...day,
        request_id: request.id,
        request_created_at: request.created_at,
        request_status: request.status.toLowerCase()
      }));
    });
  };

  const flattenedData = data ? flattenRequests(data) : [];

  if (loading) return (
    <Box display="flex" justifyContent="center" p={4}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box p={2} bgcolor="error.light" color="error.dark" borderRadius={1}>
      <Typography align="center">Error: {error.message}</Typography>
    </Box>
  );

  if (!flattenedData || flattenedData.length === 0) return (
    <Box p={4} textAlign="center" color="text.secondary">
      <Typography variant="subtitle1">No {type} schedule requests found</Typography>
    </Box>
  );

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      // Handle both "HH:mm" format and time objects
      const time = typeof timeString === 'string' ? 
        parse(timeString, 'HH:mm', new Date()) : 
        new Date(timeString);
      
      if (!isValid(time)) return timeString; // Fallback to raw string if parsing fails
      
      return format(time, 'h:mm a');
    } catch (e) {
      return timeString; // Fallback to raw string if any error occurs
    }
  };

    const formatTimeAMPM = (timeValue) => {
    if (!timeValue) return "";
    try {
      // Handle both "HH:mm" format and time objects
      let timeObj;
      if (typeof timeValue === 'string') {
        const [hours, minutes] = timeValue.split(':');
        timeObj = new Date();
        timeObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      } else if (timeValue instanceof Date) {
        timeObj = timeValue;
      } else {
        return timeValue; // Fallback for unexpected formats
      }
      
      return format(timeObj, 'h:mm a');
    } catch (e) {
      console.error("Error formatting time:", e);
      return timeValue; // Fallback to original value if formatting fails
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box width="100%" overflow="auto" position="relative" sx={{ mt: 2 }}>
      <table style={{
        width: '100%',
        minWidth: '1500px',
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date Filed</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Schedule Day</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Schedule Time</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Break </th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Reason</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Processed By</th>
          </tr>
        </thead>
        <tbody>
          {flattenedData.map((request, index) => (
            <tr key={`${request.request_id}-${index}`} style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Box fontSize="0.75rem" color="#666">
                  {formatDateTime(request.request_created_at)}
                </Box>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {formatDate(request.date)}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {formatTimeAMPM(request.time_in)} - {formatTimeAMPM(request.time_out)}
                <div>
                {request?.hours} hrs
                </div>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {request.start_break && request.end_break ? (
                  `${formatTimeAMPM(request.start_break)} - ${formatTimeAMPM(request.end_break)}`
                ) : 'No break'}
              </td>
              <td style={{ padding: '12px 16px' }}>
                {request.justification}
              </td>
              <td style={{ padding: '12px 16px' }}>
                {request?.processed_by}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

const CustomizeScheduleRequestForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [historyTabValue, setHistoryTabValue] = useState("pending");
  const [formData, setFormData] = useState({
    justification: "",
    schedule_days: Array(5).fill().map((_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time_in: "08:00",
      time_out: "17:00",
      start_break: "12:00",
      end_break: "13:00",
      has_lunch_break: true,
      is_day_off: false,
      hours: 8.00
    }))
  });
  const [responseMsg, setResponseMsg] = useState("");
  const [scheduleRequests, setScheduleRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [selectedDays, setSelectedDays] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false
  });

  const handleDaySelection = (day) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      const emp = JSON.parse(storedEmployee);
      setEmployee(emp);
      
      setFormData(prev => ({
        ...prev,
        schedule_days: prev.schedule_days.map(day => ({
          ...day,
          time_in: emp.default_time_in || "08:00",
          time_out: emp.default_time_out || "17:00"
        }))
      }));
      
      fetchScheduleRequests(emp.id);
    }
  }, []);

 const fetchScheduleRequests = async (employeeId) => {
  try {
    setLoading(true);
    const res = await api.get(`/attendance/schedule-requests/?employee_id=${employeeId}&status=pending`);
    console.log('API response:', res.data);
    const data = Array.isArray(res.data) ? res.data : [];
    const normalizedData = data.map(item => ({
      ...item,
      status: item.status
    }));
    setScheduleRequests(normalizedData);
  } catch (error) {
    console.error("Error fetching schedule requests:", error);
    setScheduleRequests([]);
  } finally {
    setLoading(false);
  }
  };

  const calculateHours = (time_in, time_out, has_lunch_break, is_day_off) => {
    if (is_day_off) return 0.00;
    if (!time_in || !time_out) return 0.00;
    
    try {
      // Parse times consistently
      const parseTime = (time) => {
        if (typeof time === 'string') {
          const [hours, minutes] = time.split(':').map(Number);
          return { hours, minutes };
        }
        // Handle if time is already an object
        return {
          hours: time?.hours || 0,
          minutes: time?.minutes || 0
        };
      };

      const inTime = parseTime(time_in);
      const outTime = parseTime(time_out);
      
      let totalMinutes = (outTime.hours * 60 + outTime.minutes) - (inTime.hours * 60 + inTime.minutes);
      
      if (totalMinutes < 0) totalMinutes += 24 * 60;
      
      if (has_lunch_break) {
        totalMinutes -= 60;
      }
      
      return parseFloat((totalMinutes / 60).toFixed(2));
    } catch (e) {
      console.error("Error calculating hours:", e);
      return 0.00;
    }
  };

  const handleDayChange = (index, field, value) => {
    const updatedDays = [...formData.schedule_days];
    updatedDays[index] = {
      ...updatedDays[index],
      [field]: value
    };

    // Recalculate hours if relevant fields change
    if (['time_in', 'time_out', 'has_lunch_break', 'is_day_off'].includes(field)) {
      updatedDays[index].hours = calculateHours(
        updatedDays[index].time_in,
        updatedDays[index].time_out,
        updatedDays[index].has_lunch_break,
        updatedDays[index].is_day_off
      );
    }

    setFormData({
      ...formData,
      schedule_days: updatedDays
    });
  };

  const validateForm = () => {
    if (!formData.justification) {
      setResponseMsg("Please provide a reason for your request");
      return false;
    }
    
    const hasValidDays = formData.schedule_days.some(day => day.hours > 0);
    if (!hasValidDays) {
      setResponseMsg("Please specify working hours for at least one day");
      return false;
    }
    
    return true;
  };

  const formatTimeForBackend = (time) => {
    if (!time) return null;
    
    if (typeof time === 'string' && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return time;
    }

    if (time instanceof Date) {
      return format(time, 'HH:mm');
    }
    
    // Default fallback
    return "08:00";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const selectedScheduleDays = formData.schedule_days
        .filter((_, index) => {
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
          return selectedDays[days[index]];
        })
        .map(day => ({
          date: day.date,
          time_in: formatTimeForBackend(day.time_in),
          time_out: formatTimeForBackend(day.time_out),
          start_break: day.has_lunch_break ? "12:00" : null,
          end_break: day.has_lunch_break ? "13:00" : null,
          hours: day.hours,
          work_type: "full_time"
        }));

      if (selectedScheduleDays.length === 0) {
        setResponseMsg("Please select at least one day");
        return;
      }

      const payload = {
        employee: employee.id,
        justification: formData.justification,
        schedule_days: selectedScheduleDays
      };

      const response = await api.post("attendance/schedule-requests/", payload);
      console.log("Submission successful:", response.data);

      setResponseMsg("Schedule request submitted successfully!");
      setTimeout(() => {
        setShowModal(false);
        setResponseMsg("");
        fetchScheduleRequests(employee.id);
      }, 2000);

    } catch (error) {
      console.error("Submission error:", error);
      let errorMessage = "Error submitting request";
      
      if (error.response) {
        if (error.response.data) {
          // Handle nested error details from Django
          if (error.response.data.error) {
            errorMessage = JSON.stringify(error.response.data.error, null, 2);
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else {
            errorMessage = JSON.stringify(error.response.data, null, 2);
          }
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      }
      
      setResponseMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const pendingRequests = scheduleRequests.filter(item => item.status === "pending");
  const approvedRequests = scheduleRequests.filter(item => item.status === "approved");
  const rejectedRequests = scheduleRequests.filter(item => item.status === "rejected");

  const requestCounts = {
    pending: pendingRequests.length,
    approved: approvedRequests.length,
    rejected: rejectedRequests.length,
  };

  return (
    <SideNavBar>
      <Card sx={{
        minHeight: 'calc(103vh - 64px)',
        width: '100%',
        mt: -10
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          p: 2,
          borderRadius: 1
        }}>
          <Typography variant="h3" color="primary">
            Custom Schedule Requests
          </Typography>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Tabs
            value={historyTabValue}
            onChange={(e, newValue) => setHistoryTabValue(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px 4px 0 0'
              }
            }}
          >
            <Tab
              value="pending"
              label={<StatusBadge status="pending" count={requestCounts.pending} />}
              sx={{ textTransform: 'none' }}
            />
            <Tab
              value="approved"
              label={<StatusBadge status="approved" count={requestCounts.approved} />}
              sx={{ textTransform: 'none' }}
            />
            <Tab
              value="rejected"
              label={<StatusBadge status="rejected" count={requestCounts.rejected} />}
              sx={{ textTransform: 'none' }}
            />
          </Tabs>

          <Box sx={{ mt: 3 }}>
            {historyTabValue === "pending" && (
              <ScheduleRequestTable
                data={pendingRequests}
                loading={loading}
                error={null}
                type="pending"
              />
            )}

            {historyTabValue === "approved" && (
              <ScheduleRequestTable
                data={approvedRequests}
                loading={loading}
                error={null}
                type="approved"
              />
            )}

            {historyTabValue === "rejected" && (
              <ScheduleRequestTable
                data={rejectedRequests}
                loading={loading}
                error={null}
                type="rejected"
              />
            )}
          </Box>
        </Box>

        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setShowModal(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            color: 'white',
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s'
            }
          }}
        >
          <Add />
        </Fab>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Modal
            open={showModal}
            onClose={() => {
              setShowModal(false);
              setResponseMsg("");
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}
          >
            <Paper sx={{
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              p: 4,
              borderRadius: 2,
              position: 'relative',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
            }}>
              <IconButton
                aria-label="close"
                onClick={() => {
                  setShowModal(false);
                  setResponseMsg("");
                }}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <Close />
              </IconButton>

              <Typography variant="h3" component="h2" color="primary" gutterBottom sx={{ 
                fontWeight: 600,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Schedule fontSize="large" />
                Schedule Request Form
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                  Requested Schedule
                </Typography>
                
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', width: '50px' }}>Select</th>
                      <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Day</th>
                      <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Start Time</th>
                      <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>End Time</th>
                      <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Work Hours</th>
                      <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Break</th>
                      <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Day Off</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => {
                      const dayData = formData.schedule_days[index] || {
                        date: new Date().toISOString().split('T')[0],
                        time_in: "08:00",
                        time_out: "17:00",
                        has_lunch_break: true,
                        is_day_off: false,
                        hours: 8.00
                      };

                      return (
                        <tr key={day} style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <Checkbox
                              checked={selectedDays[day]}
                              onChange={() => handleDaySelection(day)}
                              color="primary"
                            />
                          </td>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{day}</td>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <MobileTimePicker
                              value={parse(dayData.time_in, 'HH:mm', new Date())}
                              onChange={(newValue) => {
                                const formattedTime = format(newValue, 'HH:mm');
                                handleDayChange(index, 'time_in', formattedTime);
                              }}
                              renderInput={(params) => (
                                <TextField {...params} size="small" sx={{ width: '120px' }} />
                              )}
                              disabled={!selectedDays[day]}
                            />
                          </td>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <MobileTimePicker
                              value={parse(dayData.time_out, 'HH:mm', new Date())}
                              onChange={(newValue) => {
                                const formattedTime = format(newValue, 'HH:mm');
                                handleDayChange(index, 'time_out', formattedTime);
                              }}
                              renderInput={(params) => (
                                <TextField {...params} size="small" sx={{ width: '120px' }} />
                              )}
                              disabled={!selectedDays[day]}
                            />
                          </td>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <Typography sx={{fontSize: '0.9rem'}}>
                              {dayData.hours.toFixed(2)} hours
                            </Typography>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <Checkbox
                              checked={dayData.has_lunch_break}
                              onChange={(e) => handleDayChange(index, 'has_lunch_break', e.target.checked)}
                              color="primary"
                              disabled={!selectedDays[day] || dayData.is_day_off}
                            />
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <Checkbox
                              checked={dayData.is_day_off}
                              onChange={(e) => handleDayChange(index, 'is_day_off', e.target.checked)}
                              color="primary"
                              disabled={!selectedDays[day]}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
              
              <Box sx={{ mb: 2, p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  <strong>Total Working Hours:</strong> {formData.schedule_days
                    .filter((_, index) => index < 5) 
                    .reduce((total, day) => total + (day?.hours || 0), 0)
                    .toFixed(2)} hours
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Reason for Schedule Change
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.justification}
                  onChange={(e) => setFormData({...formData, justification: e.target.value})}
                  placeholder="Reason"
                  variant="outlined"
                />
              </Box>

              {responseMsg && (
                <Alert
                  severity={responseMsg.includes("Error") ? "error" : "success"}
                  sx={{ mt: 2, mb: 2 }}
                  onClose={() => setResponseMsg("")}
                >
                  {responseMsg}
                </Alert>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowModal(false);
                    setResponseMsg("");
                  }}
                  startIcon={<Cancel />}
                  sx={{ minWidth: 120 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={<Send />}
                  sx={{ minWidth: 120, color: 'white !important' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
              </Box>
            </Paper>
          </Modal>
        </LocalizationProvider>
      </Card>
    </SideNavBar>
  );
};

export default CustomizeScheduleRequestForm;