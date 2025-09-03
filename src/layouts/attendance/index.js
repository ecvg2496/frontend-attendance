import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, useTheme, 
  useMediaQuery, CircularProgress, Snackbar, Alert,
  Paper, Tooltip, Grid, LinearProgress, Modal,
  TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Icon, InputAdornment,
  Card, CardContent, Avatar
} from '@mui/material';
import {
  Person as PersonIcon, Schedule as ScheduleIcon,
  WarningAmber as WarningAmberIcon, AccessTime as AccessTimeIcon,
  FreeBreakfast as FreeBreakfastIcon, LunchDining as LunchDiningIcon,
  ExitToApp as ExitToAppIcon, Work as WorkIcon, 
  Timer as TimerIcon, Public as PublicIcon,
  WatchLater as WatchLaterIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import axios from 'api/axios';
import SideNavBar from './content_page/nav_bar';
import './content_page/css/admintable.css';

// Manila timezone
const MANILA_TIMEZONE = 'Asia/Manila';

// Helper function to convert UTC to Manila time
const utcToManilaTime = (date) => {
  if (!date) return null;
  
  try {
    const utcDate = new Date(date);
    const manilaOffset = 8 * 60; // Manila is UTC+8
    const localOffset = utcDate.getTimezoneOffset();
    const manilaTime = new Date(utcDate.getTime() + (localOffset + manilaOffset) * 60000);
    
    return manilaTime;
  } catch (e) {
    console.error('Error converting to Manila time:', e);
    return new Date();
  }
};

// Format date to Manila date string (for display)
const formatToManilaDate = (date) => {
  try {
    const manilaDate = utcToManilaTime(date);
    if (!manilaDate) return '';
    
    return manilaDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    console.error('Error formatting Manila date:', e);
    return 'Invalid date';
  }
};

// Get Manila date in YYYY-MM-DD format (for API requests)
const getManilaDateYMD = (date) => {
  try {
    const manilaDate = utcToManilaTime(date);
    if (!manilaDate) return '';
    
    const year = manilaDate.getFullYear();
    const month = String(manilaDate.getMonth() + 1).padStart(2, '0');
    const day = String(manilaDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error('Error getting Manila date YMD:', e);
    return '';
  }
};

// Format time to 12-hour format
const formatTimeTo12Hour = (timeString) => {
  if (!timeString) return '';
  
  try {
    let date;
    if (timeString.includes('T') && timeString.endsWith('Z')) {
      // UTC ISO string
      date = utcToManilaTime(timeString);
    } else if (typeof timeString === 'string' && timeString.includes(':')) {
      // Time string (HH:MM:SS)
      const now = new Date();
      const [hours, minutes, seconds] = timeString.split(':');
      date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 
                     parseInt(hours), parseInt(minutes), seconds ? parseInt(seconds) : 0);
      date = utcToManilaTime(date);
    } else {
      return timeString;
    }
    
    if (!date) return timeString;
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    
    return `${hours12}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
  } catch (e) {
    console.error('Error formatting time:', e, timeString);
    return timeString;
  }
};

// Format time to HH:MM:SS for API
const formatTimeToHMS = (date) => {
  try {
    const manilaDate = utcToManilaTime(date);
    if (!manilaDate) return '';
    
    const hours = manilaDate.getHours().toString().padStart(2, '0');
    const minutes = manilaDate.getMinutes().toString().padStart(2, '0');
    const seconds = manilaDate.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  } catch (e) {
    console.error('Error formatting time to HMS:', e);
    return '';
  }
};

const EmployeeAttendanceDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [employee, setEmployee] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [breakDuration, setBreakDuration] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [currentTime, setCurrentTime] = useState({
    manila: { time12: '', time24: '', date: '' }
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
    const updateTime = () => {
      const now = new Date();
      const manilaTime = utcToManilaTime(now);
      
      if (manilaTime) {
        const hours = manilaTime.getHours();
        const minutes = manilaTime.getMinutes();
        const seconds = manilaTime.getSeconds();
        
        const time24 = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        const time12 = `${hours12}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
        
        const date = manilaTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        setCurrentTime({
          manila: { time12, time24, date }
        });
      }
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
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
      const now = new Date();
      const todayDate = getManilaDateYMD(now);

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

      // If no incomplete log, check today's records using Manila date
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
      const now = new Date();
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

      // Prepare payload with Manila date
      const manilaDate = getManilaDateYMD(now);
      const payload = {
        employee: employee.id,
        date: manilaDate, // Send Manila date to backend
        [actionType === 'timeIn' ? 'time_in' :
         actionType === 'breakStart' ? 'start_break' :
         actionType === 'breakEnd' ? 'end_break' : 'time_out']: timeString,
        ...(existingRecord?.time_in && { time_in: existingRecord.time_in }),
        ...(existingRecord?.start_break && { start_break: existingRecord.start_break }),
        ...(existingRecord?.end_break && { end_break: existingRecord.end_break }),
        ...(existingRecord?.time_out && { time_out: existingRecord.time_out }),
        ...(actionType === 'timeIn' && { status: 'present' }),
        ...(isCompletingTimeOut && { status: 'completed' })
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

      // After successful action, force fetch today's record from backend
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
    const now = new Date();
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

  // Render the digital clock and action button box
  const renderClockAndActionBox = () => {
    const buttonConfig = getButtonConfig();
    const isLoading = loading && actionInProgress === buttonConfig.action;
    
    return (
      <Card sx={{ 
        mb: 3, 
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <CardContent sx={{ textAlign: 'center' }}>
          {/* Digital Clock */}
          <Box sx={{ mb: 3 }}>
            <WatchLaterIcon sx={{ fontSize: "3rem !important", mb: 1, opacity: 0.9 }} />
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold',
              fontFamily: '"Orbitron", monospace',
              letterSpacing: '2px',
              mb: 0.5
            }}>
              {currentTime.manila.time24}
            </Typography>
            <Typography variant="h6" sx={{ 
              opacity: 0.9,
              fontFamily: '"Roboto Mono", monospace'
            }}>
              {currentTime.manila.time12}
            </Typography>
            <Typography variant="body2" sx={{ 
              opacity: 0.8, 
              mt: 1,
              fontFamily: '"Roboto", sans-serif'
            }}>
              {currentTime.manila.date}
            </Typography>
            <Typography variant="caption" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              opacity: 0.7,
              mt: 1,
              fontFamily: '"Roboto", sans-serif'
            }}>
              <PublicIcon sx={{ fontSize: 14, mr: 0.5 }} />
              Asia/Manila Time
            </Typography>
          </Box>

          {/* Action Button */}
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
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                fontFamily: '"Roboto", sans-serif',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
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
        </CardContent>
      </Card>
    );
  };

  // Render employee info with avatar
  const renderEmployeeInfo = () => {
    if (!employee) return (
      <Typography sx={{ mt: 4, color: "error.main", fontFamily: '"Roboto", sans-serif' }}>
        <WarningAmberIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Employee not registered
      </Typography>
    );

    // Get initials for avatar
    const getInitials = () => {
      const firstInitial = employee.first_name ? employee.first_name.charAt(0) : '';
      const lastInitial = employee.last_name ? employee.last_name.charAt(0) : '';
      return `${firstInitial}${lastInitial}`.toUpperCase();
    };

    const capitalizeFirstLetter = (string) => {
      if (!string) return "";
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return (
      <Box sx={{ 
        display: 'flex',
        gap: 2,
        mb: 3,
        flexWrap: 'wrap'
      }}>
        {/* Employee Basic Info - Styled like the clock box */}
        <Card sx={{
          flex: 1,
          minWidth: 300,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              borderBottom: '2px solid rgba(255,255,255,0.2)',
              pb: 2
            }}>
              <BadgeIcon sx={{ mr: 1, fontSize: '3rem !important' }} />
              <Typography variant="h3" sx={{ 
                fontWeight: 700,
                fontFamily: '"Roboto", sans-serif'
              }}>
                USER INFORMATION
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ 
                width: 60, 
                height: 60, 
                mr: 2, 
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                {getInitials()}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold',
                  fontFamily: '"Roboto", sans-serif'
                }}>
                  {employee.first_name} {employee.last_name}
                </Typography>
                {/* <Typography variant="body1" sx={{ 
                  opacity: 0.9,
                  fontFamily: '"Roboto", sans-serif'
                }}>
                  Employee ID: {employee.employee_id || 'N/A'}
                </Typography> */}
              </Box>
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 2 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1, opacity: 0.8, fontSize: '1.5rem' }} />
                <Box>
                  <Typography variant="body1" sx={{ 
                    fontSize: '0.9rem', 
                    opacity: 0.8,
                    fontFamily: '"Roboto", sans-serif'
                  }}>
                    Department
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'medium',
                    fontFamily: '"Roboto", sans-serif'
                  }}>
                    {employee.department}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon sx={{ mr: 1, opacity: 0.8, fontSize: '1.5rem' }} />
                <Box>
                  <Typography variant="body1" sx={{ 
                    fontSize: '0.9rem', 
                    opacity: 0.8,
                    fontFamily: '"Roboto", sans-serif'
                  }}>
                    Team
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'medium',
                    fontFamily: '"Roboto", sans-serif'
                  }}>
                    {employee.team}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, opacity: 0.8, fontSize: '1.5rem' }} />
                <Box>
                  <Typography variant="body1" sx={{ 
                    fontSize: '0.9rem', 
                    opacity: 0.8,
                    fontFamily: '"Roboto", sans-serif'
                  }}>
                    Employment Type
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'medium',
                    fontFamily: '"Roboto", sans-serif'
                  }}>
                    {capitalizeFirstLetter(employee.employment_type)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BadgeIcon sx={{ mr: 1, opacity: 0.8, fontSize: '1.5rem' }} />
                <Box>
                  <Typography variant="body1" sx={{ 
                    fontSize: '0.9rem', 
                    opacity: 0.8,
                    fontFamily: '"Roboto", sans-serif'
                  }}>
                    Status
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'medium',
                    fontFamily: '"Roboto", sans-serif'
                    // color: employee.status === 'Active' ? '#4caf50' : '#ff9800'
                  }}>
                    {employee.status}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Work Schedule - Styled like the clock box */}
        <Card sx={{
          flex: 1,
          minWidth: 300,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
          color: '#2c3e50',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              borderBottom: '2px solid rgba(0,0,0,0.1)',
              pb: 2
            }}>
              <ScheduleIcon sx={{ mr: 1, fontSize: '3rem !important' }} />
              <Typography variant="h3" sx={{ 
                fontWeight: 700,
                fontFamily: '"Roboto", sans-serif'
              }}>
                WORK SCHEDULE
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.3)'
              }}>
                <AccessTimeIcon sx={{ mr: 2, color: '#2c3e50', fontSize: '1.8rem' }} />
                <Box>
                  <Typography variant="body1" sx={{ 
                    fontSize: '0.9rem', 
                    opacity: 0.8,
                    fontFamily: '"Roboto", sans-serif'
                  }}>
                    Time In
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'bold',
                    fontFamily: '"Roboto Mono", monospace'
                  }}>
                    {formatTimeTo12Hour(employee.time_in)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.3)'
              }}>
                <ExitToAppIcon sx={{ mr: 2, color: '#2c3e50', fontSize: '1.8rem' }} />
                <Box>
                  <Typography variant="body1" sx={{ 
                    fontSize: '0.9rem', 
                    opacity: 0.8,
                    fontFamily: '"Roboto", sans-serif'
                  }}>
                    Time Out
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'bold',
                    fontFamily: '"Roboto Mono", monospace'
                  }}>
                    {formatTimeTo12Hour(employee.time_out)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.3)'
            }}>
              <Box>
                <Typography variant="body1" sx={{ 
                  fontSize: '0.9rem', 
                  opacity: 0.8,
                  fontFamily: '"Roboto", sans-serif'
                }}>
                  Work Arrangement
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'medium',
                  fontFamily: '"Roboto", sans-serif'
                }}>
                  {capitalizeFirstLetter(employee?.work_arrangement)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body1" sx={{ 
                  fontSize: '0.9rem', 
                  opacity: 0.8,
                  fontFamily: '"Roboto", sans-serif'
                }}>
                  Type
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'medium',
                  fontFamily: '"Roboto", sans-serif'
                }}>
                  {employee.type}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // Render attendance table
  const renderAttendanceTable = () => {
    if (loading && !todayRecord) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!todayRecord) {
      return (
        <Typography sx={{ 
          p: 3, 
          textAlign: 'center', 
          color: 'text.secondary',
          fontFamily: '"Roboto", sans-serif'
        }}>
          No attendance record for today
        </Typography>
      );
    }

    const formatBreakDuration = (duration) => {
      if (duration === null || duration === undefined || isNaN(duration)) return '0 min';
      
      const durationNum = typeof duration === 'string' ? parseFloat(duration) : duration;
      return `${Math.floor(durationNum / 60)}h ${durationNum % 60}m`;
    };
    const capitalizeFirstLetter = (string) => {
      if (!string) return "";
      return string.charAt(0).toUpperCase() + string.slice(1);
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
          fontSize: '0.875rem',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'        
          }}>
          <thead>
            <tr style={{ 
              backgroundColor: theme.palette.primary.main, 
              color: 'white', 
              textAlign: 'left' 
            }}>
              <th style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap',
                fontSize: '1rem',
                fontWeight: '600'
              }}>Date</th>
              <th style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap',
                fontSize: '1rem',
                fontWeight: '600'
              }}>Status</th>
              <th style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap',
                fontSize: '1rem',
                fontWeight: '600'
              }}>Time In</th>
              <th style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap',
                fontSize: '1rem',
                fontWeight: '600'
              }}>Time In Status</th>
              <th style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap',
                fontSize: '1rem',
                fontWeight: '600'
              }}>Break</th>
              <th style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap',
                fontSize: '1rem',
                fontWeight: '600'
              }}>Break Duration</th>
              <th style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap',
                fontSize: '1rem',
                fontWeight: '600'
              }}>Break Status</th>
              <th style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap',
                fontSize: '1rem',
                fontWeight: '600'
              }}>Time Out</th>
              <th style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap',
                fontSize: '1rem',
                fontWeight: '600'
              }}>Time Out Status</th>
              <th style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap',
                fontSize: '1rem',
                fontWeight: '600'
              }}>Work Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ 
              borderBottom: '1px solid #e0e0e0', 
              whiteSpace: 'nowrap',
              backgroundColor: '#fafafa'
            }}>
              <td style={{ 
                padding: '16px', 
                fontWeight: '500'
              }}>
                {formatToManilaDate(todayRecord.date)}
              </td>
              <td style={{ 
                padding: '16px',
                color: todayRecord.status === 'Absent' ? '#d32f2f' : '#2e7d32',
                fontWeight: 'bold'
              }}>
                {capitalizeFirstLetter(todayRecord.status)}
              </td>
              <td style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap', 
                fontWeight: '500'
              }}>
                {formatTimeTo12Hour(todayRecord.time_in) || '--'}
              </td>
              
              <td style={{
                padding: '16px', 
                whiteSpace: 'nowrap',
                color:
                  todayRecord.time_in_status?.includes('Absent') ? '#d32f2f' :
                  todayRecord.time_in_status?.includes('Late') ? '#ed6c02' : '#2e7d32',
                fontWeight: '500'
              }}>
                {capitalizeFirstLetter(todayRecord.time_in ? todayRecord.time_in_status : '')}
              </td>
                
              <td style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap'
              }}>
                {todayRecord.start_break ? (
                  <>
                    <div style={{ fontWeight: '500' }}>{formatTimeTo12Hour(todayRecord.start_break)}</div>
                    {todayRecord.end_break ? (
                      <div style={{ fontWeight: '500' }}>{formatTimeTo12Hour(todayRecord.end_break)}</div>
                    ) : (
                      <div style={{ color: '#4caf50', fontWeight: '500' }}>
                        Break in progress
                      </div>
                    )}
                  </>
                ) : '--'}
              </td>
              
              <td style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap', 
                fontWeight: '500'
              }}>
                {todayRecord.end_break ? (
                  formatBreakDuration(todayRecord.break_duration)
                ) : '--'}
              </td>
             
              <td style={{
                padding: '16px',
                whiteSpace: 'nowrap',
                color: todayRecord.break_status?.startsWith('Overbreak') ? '#d32f2f' : '#2e7d32',
                fontWeight: '500'
              }}>
                {todayRecord.break_status || '--'}
              </td>
              
              <td style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap', 
                fontWeight: '500'
              }}>
                {formatTimeTo12Hour(todayRecord.time_out) || '--'}
              </td>
              
              <td style={{ 
                padding: '16px', 
                color: 
                  todayRecord.time_out_status?.includes('Absent') ? '#d32f2f' :
                  todayRecord.time_out_status?.includes('Undertime') ? '#d32f2f' :
                  todayRecord.time_out_status?.includes('Overtime') ? '#ed6c02' : '#2e7d32',
                fontWeight: '500'
              }}>
                {todayRecord.time_out ? todayRecord.time_out_status : '--'}
              </td>
              
              <td style={{ 
                padding: '16px', 
                whiteSpace: 'nowrap', 
                fontWeight: 'bold',
                color: '#1976d2'
              }}>
                {todayRecord.work_hours ? `${todayRecord.work_hours.toFixed(2)} hrs` : '--'}
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
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        fontFamily: '"Roboto", sans-serif'
      }}>
        {confirmDialog.icon}
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {confirmDialog.title}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" sx={{ mb: 2, fontFamily: '"Roboto", sans-serif' }}>
          {confirmDialog.content}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
          color="inherit"
          sx={{ fontFamily: '"Roboto", sans-serif' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirmAction}
          color={confirmDialog.color}
          variant="contained"
          disabled={loading}
          sx={{ fontFamily: '"Roboto", sans-serif' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <SideNavBar>
      <Box sx={{ p: isMobile ? 1 : 3 }}>
        {renderEmployeeInfo()}
        {renderClockAndActionBox()}
        {renderAttendanceTable()}

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ fontFamily: '"Roboto", sans-serif' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess(null)}
        >
          <Alert onClose={() => setSuccess(null)} severity="success" sx={{ fontFamily: '"Roboto", sans-serif' }}>
            {success}
          </Alert>
        </Snackbar>

        {renderConfirmationDialog()}
      </Box>
    </SideNavBar>
  );
};

export default EmployeeAttendanceDashboard;