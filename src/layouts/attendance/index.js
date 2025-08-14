import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, useTheme, 
  useMediaQuery, CircularProgress, Snackbar, Alert,
  Paper, Tooltip, Grid, LinearProgress, Modal,
  TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Icon, InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon, Schedule as ScheduleIcon,
  WarningAmber as WarningAmberIcon, AccessTime as AccessTimeIcon,
  FreeBreakfast as FreeBreakfastIcon, LunchDining as LunchDiningIcon,
  ExitToApp as ExitToAppIcon, Work as WorkIcon, 
  Timer as TimerIcon, Public as PublicIcon
} from '@mui/icons-material';
import axios from 'api/axios';
import SideNavBar from './content_page/nav_bar';
import './content_page/css/admintable.css';

// Helper functions for Philippine Time (PHT)
const getCurrentPHTDate = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
};

const formatTimeTo12Hour = (timeString) => {
  if (!timeString) return '';
  const timePart = timeString.includes('T') ? timeString.split('T')[1].substring(0, 5) : timeString.substring(0, 5);
  const [hours, minutes] = timePart.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const formatDateToYMD = (date) => {
  const phtDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const year = phtDate.getFullYear();
  const month = String(phtDate.getMonth() + 1).padStart(2, '0');
  const day = String(phtDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeToHMS = (date) => {
  const phtDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  return phtDate.toTimeString().substring(0, 8);
};

const formatDisplayDate = (dateString) => {
  try {
    const dateParts = dateString.split('-');
    if (dateParts.length === 3) {
      const date = new Date(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`);
      return date.toLocaleDateString('en-US', {
        timeZone: "Asia/Manila",
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return dateString;
  } catch (e) {
    return 'Invalid date';
  }
};

const EmployeeAttendanceDashboard = () => {
  const theme = useTheme();
  const [employee, setEmployee] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [breakDuration, setBreakDuration] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [currentTime, setCurrentTime] = useState({
    pht: { time12: '', date: '' }
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    title: '',
    content: '',
    icon: null,
    color: 'primary'
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime({
        pht: {
          time12: now.toLocaleTimeString('en-US', { 
            timeZone: "Asia/Manila",
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true 
          }),
          date: now.toLocaleDateString('en-US', { 
            timeZone: "Asia/Manila",
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load employee data and initialize state
  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      const emp = JSON.parse(storedEmployee);
      setEmployee(emp);
      fetchTodayAttendance(emp.id);
    }
  }, []);

  // Fetch today's attendance
  const fetchTodayAttendance = async (employeeId) => {
  setLoading(true);
  setError(null);
  try {
    const now = getCurrentPHTDate();
    const todayDate = formatDateToYMD(now);

    // First check for incomplete logs
    const incompleteResponse = await axios.get('attendance/logs/', {
      params: {
        employee_id: employeeId,
        time_out__isnull: true
      }
    });

    let existingRecord = Array.isArray(incompleteResponse.data) ? 
      incompleteResponse.data[0] : 
      incompleteResponse.data?.logs?.[0];

    // If no incomplete log, check today's records
    if (!existingRecord) {
      const todayResponse = await axios.get('attendance/logs/', {
        params: {
          employee_id: employeeId,
          date: todayDate
        }
      });
      
      existingRecord = Array.isArray(todayResponse.data) ? 
        todayResponse.data[0] : 
        todayResponse.data?.logs?.[0];
    }

    if (!existingRecord) {
      setTodayRecord({
        employee: employeeId,
        date: todayDate,
        status: 'Absent',
        time_in: null,
        start_break: null,
        end_break: null,
        time_out: null,
        break_duration: 0,
        work_hours: 0,
        time_in_status: 'Absent',
        time_out_status: 'Absent',
        break_status: null
      });
    } else {
      // Ensure the record has all required fields
      const completeRecord = {
        ...existingRecord,
        status: existingRecord.status || 
               (!existingRecord.time_in && !existingRecord.time_out ? 'Absent' : 
                existingRecord.time_out ? 'Completed' : 'Present'),
        time_in_status: existingRecord.time_in_status || 
                       (existingRecord.time_in ? 'On Time' : 'Absent'),
        time_out_status: existingRecord.time_out_status || 
                        (existingRecord.time_out ? 'On Time' : ''),
        break_status: existingRecord.break_status || '',
        break_duration: existingRecord.break_duration || 0,
        work_hours: existingRecord.work_hours || 0
      };
      setTodayRecord(completeRecord);
    }

  } catch (error) {
    setError('Failed to load attendance records');
    console.error('Error fetching attendance:', error);
  } finally {
    setLoading(false);
  }
};

  // Handle time actions (time in, break start/end, time out)
 const handleTimeAction = async (actionType) => {
  if (!employee || !employee.id) {
    setError('Employee data not found');
    return;
  }

  setLoading(true);
  setActionInProgress(actionType);
  setError(null);

  try {
    const now = getCurrentPHTDate();
    const timeString = formatTimeToHMS(now);

    // Check if we're completing a time-out action
    const isCompletingTimeOut = actionType === 'timeOut';

    // First check for incomplete logs (missing time_out)
    const incompleteResponse = await axios.get('attendance/logs/', {
      params: {
        employee_id: employee.id,
        time_out__isnull: true
      }
    });

    let existingRecord = Array.isArray(incompleteResponse.data) ?
      incompleteResponse.data[0] :
      incompleteResponse.data?.logs?.[0];

    // If no incomplete log and we're doing time-in, check for today's record
    if (!existingRecord && actionType === 'timeIn') {
      const todayResponse = await axios.get('attendance/logs/', {
        params: { employee_id: employee.id }
      });
      
      existingRecord = Array.isArray(todayResponse.data) ?
        todayResponse.data[0] :
        todayResponse.data?.logs?.[0];
    }

    // Prepare payload (NO DATE SENT)
    const payload = {
      employee: employee.id,
      [actionType === 'timeIn' ? 'time_in' :
       actionType === 'breakStart' ? 'start_break' :
       actionType === 'breakEnd' ? 'end_break' : 'time_out']: timeString,
      ...(existingRecord?.time_in && { time_in: existingRecord.time_in }),
      ...(existingRecord?.start_break && { start_break: existingRecord.start_break }),
      ...(existingRecord?.end_break && { end_break: existingRecord.end_break }),
      ...(existingRecord?.time_out && { time_out: existingRecord.time_out }),
      ...(actionType === 'timeIn' && { status: 'Present' }),
      ...(isCompletingTimeOut && { status: 'Completed' })
    };

    let apiResponse;
    if (existingRecord?.id) {
      // Update existing record
      apiResponse = await axios.patch(`attendance/logs/${existingRecord.id}/`, payload);
    } else {
      // Only allow creating new record for time-in action
      if (actionType === 'timeIn') {
        apiResponse = await axios.post('attendance/logs/', payload);
      } else {
        throw new Error(`Cannot record ${actionType} without an existing record`);
      }
    }

    // After successful time-out, force fetch today's record from backend
    if (isCompletingTimeOut) {
      const todayResponse = await axios.get('attendance/logs/', {
        params: { employee_id: employee.id }
      });

      const todaysRecord = Array.isArray(todayResponse.data) ?
        todayResponse.data[0] :
        todayResponse.data?.logs?.[0];

      setTodayRecord(todaysRecord || {
        employee: employee.id,
        status: 'Absent',
        time_in: null,
        start_break: null,
        end_break: null,
        time_out: null,
        break_duration: 0,
        work_hours: 0,
        time_in_status: 'Absent',
        time_out_status: 'Absent',
        break_status: null
      });
    } else {
      // For other actions, use the updated record
      setTodayRecord(apiResponse.data);
    }

    setSuccess(`Successfully recorded ${actionType}`);
    
    // Always refresh data after any action
    await fetchTodayAttendance(employee.id);

  } catch (error) {
    let errorMessage = `Failed to ${actionType}`;
    
    if (error.response) {
      errorMessage = error.response.data?.error || 
                     error.response.data?.message || 
                     JSON.stringify(error.response.data);
    } else if (error.message) {
      errorMessage = error.message;
    }

    setError(errorMessage);
    console.error('Error in handleTimeAction:', error);
  } finally {
    setLoading(false);
    setActionInProgress(null);
  }
};


  // Determine the next action button to show
  const getNextAction = () => {
    if (!todayRecord) return 'timeIn';

    if (!todayRecord.time_in) return 'timeIn';
    if (todayRecord.time_in && !todayRecord.start_break) return 'breakStart';
    if (todayRecord.start_break && !todayRecord.end_break) return 'breakEnd';
    if (todayRecord.end_break && !todayRecord.time_out) return 'timeOut';
    return 'timeIn'; // After time out, show time in again for next day
  };

  // Get button config based on next action
  const getButtonConfig = () => {
    const nextAction = getNextAction();
    
    const configs = {
      timeIn: {
        label: 'Time In',
        icon: <AccessTimeIcon />,
        color: 'success',
        tooltip: 'Record your start time',
        action: 'timeIn'
      },
      breakStart: {
        label: 'Start Break',
        icon: <FreeBreakfastIcon />,
        color: 'info',
        tooltip: 'Start your break period',
        action: 'breakStart'
      },
      breakEnd: {
        label: 'End Break',
        icon: <LunchDiningIcon />,
        color: 'warning',
        tooltip: 'End your break period',
        action: 'breakEnd'
      },
      timeOut: {
        label: 'Time Out',
        icon: <ExitToAppIcon />,
        color: 'error',
        tooltip: 'Record your end time',
        action: 'timeOut'
      }
    };

    return configs[nextAction];
  };

  // Show confirmation dialog
  const showConfirmationDialog = (actionType) => {
    const now = getCurrentPHTDate();
    const timeString = formatTimeToHMS(now);
    const formattedTime = formatTimeTo12Hour(timeString);
  
    const dialogConfigs = {
      timeIn: {
        title: 'Confirm Time In',
        content: <>Are you sure you want to time in at <span style={{ fontWeight: 'bold', color: '#000' }}>{formattedTime}</span>?</>,
        icon: <AccessTimeIcon fontSize="large" color="success" />,
        color: 'success'
      },
      breakStart: {
        title: 'Confirm Break Start',
        content: <>Are you sure you want to start your break at <span style={{ fontWeight: 'bold', color: '#000' }}>{formattedTime}</span>?</>,
        icon: <FreeBreakfastIcon fontSize="large" color="info" />,
        color: 'info'
      },
      breakEnd: {
        title: 'Confirm Break End',
        content: <>Are you sure you want to end your break at <span style={{ fontWeight: 'bold', color: '#000' }}>{formattedTime}</span>?</>,
        icon: <LunchDiningIcon fontSize="large" color="warning" />,
        color: 'warning'
      },
      timeOut: {
        title: 'Confirm Time Out',
        content: <>Are you sure you want to time out at <span style={{ fontWeight: 'bold', color: '#000' }}>{formattedTime}</span>?</>,
        icon: <ExitToAppIcon fontSize="large" color="error" />,
        color: 'error'
      }
    };
  
    setConfirmDialog({
      open: true,
      action: actionType,
      ...dialogConfigs[actionType]
    });
  };

  const handleConfirmAction = async () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    await handleTimeAction(confirmDialog.action);
  };

  // Render employee info
  const renderEmployeeInfo = () => {
    if (!employee) return (
      <Typography sx={{ mt: 4, color: "error.main" }}>
        <WarningAmberIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Employee not registered
      </Typography>
    );

    return (
      <Box sx={{ 
        display: 'flex',
        gap: 2,
        mb: 3,
        flexWrap: 'wrap'
      }}>
        {/* Employee Basic Info */}
        <Paper sx={{
          flex: 1,
          minWidth: 300,
          p: 2,
          borderRadius: 2,
          borderLeft: `4px solid ${theme.palette.info.main}`,
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 1
          }}>
            <PersonIcon color="info" sx={{ mr: 1, fontSize: '1rem' }} />
            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600 }}>
              User Information
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon color="primary" sx={{ mr: 2 }} />
            <Typography variant="h6">
              {employee.first_name} {employee.last_name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WorkIcon color="primary" sx={{ mr: 2 }} />
            <Typography variant="h6">
              {employee.department} / {employee.team}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WorkIcon color="primary" sx={{ mr: 2 }} />
            <Typography variant="h6">
              {employee.employment_type} / {employee.status}
            </Typography>
          </Box>
        </Paper>

        {/* Schedule */}
        <Paper sx={{
          flex: 1,
          minWidth: 300,
          p: 2,
          borderRadius: 2,
          borderLeft: `4px solid ${theme.palette.info.main}`,
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 1
          }}> 
            <ScheduleIcon color="info" sx={{ mr: 1, fontSize: '1rem' }} />
            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600 }}>
              Work Schedule
            </Typography>
          </Box>
          
          <Box sx={{ mb: 0.5 }}>
            <Typography variant="body1">
              Time In: {formatTimeTo12Hour(employee.time_in)}
            </Typography>
            <Typography variant="body1">
              Time Out:{formatTimeTo12Hour(employee.time_out)}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {employee.work_arrangement} / {employee.type}
          </Typography>
        </Paper>
      </Box>
    );
  };

  // Render the dynamic action button
  const renderActionButton = () => {
    const buttonConfig = getButtonConfig();
    const isLoading = loading && actionInProgress === buttonConfig.action;
    
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        mb: 3
      }}>
        <Tooltip title={buttonConfig.tooltip} arrow>
          <Button
            variant="contained"
            color={buttonConfig.color}
            startIcon={buttonConfig.icon}
            onClick={() => showConfirmationDialog(buttonConfig.action)}
            disabled={isLoading}
            sx={{
              minWidth: 200,
              height: 50,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none'
            }}
          >
            {buttonConfig.label}
            {isLoading && (
              <CircularProgress 
                size={24} 
                sx={{ 
                  position: 'absolute',
                  right: 12,
                  color: 'inherit'
                }} 
              />
            )}
          </Button>
        </Tooltip>
      </Box>
    );
  };

  // Render attendance table
  const renderAttendanceTable = () => {
    if (loading && !todayRecord) {
      return <CircularProgress sx={{ mt: 4 }} />;
    }

    if (!todayRecord) {
      return (
        <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
          No attendance record for today
        </Typography>
      );
    }

    const formatBreakDuration = (duration) => {
      if (duration === null || duration === undefined || isNaN(duration)) return '0 min';
      
      const durationNum = typeof duration === 'string' ? parseFloat(duration) : duration;
      return `${Math.floor(durationNum / 60)}h ${durationNum % 60}m`;
    };
    
    return (
      <Box sx={{ 
        width: '100%', 
        overflowX: 'auto',
        mb: 3
      }}>
        <table style={{ 
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem'
        }}>
          <thead>
            <tr style={{ backgroundColor: theme.palette.primary.main, color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Time In</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Time In Status</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Break</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Break Duration</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Break Status</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Time Out</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Time Out Status</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Work Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>
              <td style={{ padding: '12px 16px' }}>
                {formatDisplayDate(todayRecord.date)}
              </td>
              <td style={{ 
                padding: '12px 16px',
                color: todayRecord.status === 'Absent' ? 'red' : 'inherit',
                fontWeight: todayRecord.status === 'Absent' ? 'bold' : 'normal'
              }}>
                {todayRecord.status}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {formatTimeTo12Hour(todayRecord.time_in) || '--'}
              </td>
              
              <td
                style={{
                  padding: '12px 16px', whiteSpace: 'nowrap',
                  color:
                    todayRecord.time_in_status?.includes('Absent') ? 'red' :
                    todayRecord.time_in_status?.includes('Late') ? '#ed6c02' : 'inherit'
                }}
              >
                {todayRecord.time_in ? todayRecord.time_in_status : ''}
              </td>
                
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {todayRecord.start_break ? (
                  <>
                    <div>{formatTimeTo12Hour(todayRecord.start_break)}</div>
                    {todayRecord.end_break ? (
                      <div>{formatTimeTo12Hour(todayRecord.end_break)}</div>
                    ) : (
                      <div style={{ color: theme.palette.success.main }}>
                        Break in progress
                      </div>
                    )}
                  </>
                ) : ''}
              </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {todayRecord.end_break ? (
                  formatBreakDuration(todayRecord.break_duration)
                ) : ''}
              </td>
             <td
                style={{
                  padding: '12px 16px',
                  whiteSpace: 'nowrap',
                  color: todayRecord.break_status?.startsWith('Overbreak') ? 'red' : 'inherit'
                }}
              >
                {todayRecord.break_status || ''}
              </td>
              
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {formatTimeTo12Hour(todayRecord.time_out) || ''}
              </td>
              <td style={{ padding: '12px 16px', color: 
                todayRecord.time_out_status?.includes('Absent') ? 'red' :
                todayRecord.time_out_status?.includes('Undertime') ? 'red' :
                todayRecord.time_out_status?.includes('Overtime') ? '#ed6c02' : 'inherit' }}>
                {todayRecord.time_out ? todayRecord.time_out_status : ''}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {todayRecord.work_hours ? `${todayRecord.work_hours.toFixed(2)} hrs` : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </Box>
    );
  };

  // Confirmation dialog
  const renderConfirmationDialog = () => (
    <Dialog
      open={confirmDialog.open}
      onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {confirmDialog.icon}
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {confirmDialog.title}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {confirmDialog.content}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirmAction}
          color={confirmDialog.color}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <SideNavBar>
      <Box sx={{ p: 3 }}>
        {renderEmployeeInfo()}
        {renderActionButton()}
        {renderAttendanceTable()}

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess(null)}
        >
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>

        {renderConfirmationDialog()}
      </Box>
    </SideNavBar>
  );
};

export default EmployeeAttendanceDashboard;