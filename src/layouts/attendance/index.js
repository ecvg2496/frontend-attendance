import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, useTheme, Tabs, Tab,
  useMediaQuery, CircularProgress, Snackbar, Alert,
  Paper, Tooltip, Grid, LinearProgress, Modal,
  TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Icon, InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon, Schedule as ScheduleIcon,
  WarningAmber as WarningAmberIcon, AccessTime as AccessTimeIcon,
  FreeBreakfast as FreeBreakfastIcon, LunchDining as LunchDiningIcon,
  ExitToApp as ExitToAppIcon, History as HistoryIcon,
  Work as WorkIcon, Timer as TimerIcon, ScheduleSend as ScheduleSendIcon,
  Public as PublicIcon, HourglassEmpty as HourglassEmptyIcon,
  AddCircle as AddCircleIcon, Search as SearchIcon
} from '@mui/icons-material';
import axios from 'api/axios';
import SideNavBar from './content_page/nav_bar';
import './content_page/css/admintable.css';

// Helper functions for Philippine Time (PHT)
const getCurrentPHTDate = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
};

const getCurrentESTDate = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
};

const getPHTTimezoneLabel = () => "GMT + 8:00";

const isEDT = (date) => {
  const year = date.getFullYear();
  const dstStart = new Date(year, 2, 14, 2, 0, 0);
  const dstEnd = new Date(year, 10, 7, 2, 0, 0);
  return date >= dstStart && date < dstEnd;
};

const getESTTimezoneLabel = () => {
  const nowEST = getCurrentESTDate();
  return isEDT(nowEST) ? "GMT - 4:00 (DST)" : "GMT - 5:00 (ST)";
};

const formatTimeTo12Hour = (timeString) => {
  if (!timeString) return '--:-- --';
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

const formatMinutesToHours = (minutes) => {
  if (!minutes && minutes !== 0) return '--';
  const mins = parseFloat(minutes);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
};

const formatTimeFromSeconds = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDigitalTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = (hours % 12 || 12).toString().padStart(2, '0');
  
  return {
    time24: `${hours}:${minutes}:${seconds}`,
    time12: `${hours12}:${minutes}:${seconds} ${ampm}`,
    date: date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: date.timeZone
    })
  };
};

const EmployeeAttendanceDashboard = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [employee, setEmployee] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [breakDuration, setBreakDuration] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [currentTime, setCurrentTime] = useState({
    pht: formatDigitalTime(getCurrentPHTDate()),
    est: formatDigitalTime(getCurrentESTDate())
  });
  const [breakDelayRemaining, setBreakDelayRemaining] = useState(null);
  const [breakDelayProgress, setBreakDelayProgress] = useState(0);
  const [clientAttendanceData, setClientAttendanceData] = useState([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleAttendanceData, setScheduleAttendanceData] = useState([]);
  const [leaveCredits, setLeaveCredits] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    title: '',
    content: '',
    icon: null,
    color: 'primary'
  });
  const [breakAlert, setBreakAlert] = useState({
    open: false,
    remainingTime: null,
    acknowledged: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [pendingTimeOut, setPendingTimeOut] = useState(null);
  
  const tabItems = [
    { label: "Today's Attendance", icon: <AccessTimeIcon /> },
    { label: "History", icon: <HistoryIcon /> },
  ];

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime({
        pht: formatDigitalTime(getCurrentPHTDate()),
        est: formatDigitalTime(getCurrentESTDate())
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Load employee data and initialize state
  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      const emp = JSON.parse(storedEmployee);
      setEmployee(emp);
      fetchTodayAttendance(emp.id);
      fetchClientAttendance(emp.id);
      fetchAssignedSchedule(emp.id);
    }
  }, []);

  useEffect(() => {
    if (employee?.id) {
      fetchLeaveCredits(employee.id);
    }
  }, [employee]);

  // Fetch leave credits
  const fetchLeaveCredits = async (employeeId) => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await axios.get(
        `/attendance/leave-credits/?employee_id=${employeeId}&year=${currentYear}`
      );
      setLeaveCredits(response.data);
    } catch (err) {
      console.error("Error fetching leave credits:", err);
    }
  };

  // Break duration calculation
  useEffect(() => {
    let interval;
    if (todayRecord?.start_break && !todayRecord?.end_break && !breakAlert.acknowledged) {
      const maxBreakMinutes = employee?.employment_type === 'training' ? 15 : 60;
      const startTime = new Date(`${todayRecord.date}T${todayRecord.start_break}`);
      
      interval = setInterval(() => {
        const now = getCurrentPHTDate();
        const durationMs = now - startTime;
        const durationMins = Math.floor(durationMs / (1000 * 60));
        const durationSecs = Math.floor((durationMs % (1000 * 60)) / 1000);
        
        const remainingMins = maxBreakMinutes - durationMins;
        
        if (remainingMins === 5 || remainingMins === 1) {
          setBreakAlert({
            open: true,
            remainingTime: `${remainingMins} minute${remainingMins > 1 ? 's' : ''}`,
            acknowledged: false
          });
        }

        if (durationMins >= maxBreakMinutes) {
          setBreakDuration(`${maxBreakMinutes}m (Max)`);
          clearInterval(interval);
        } else {
          setBreakDuration(`${durationMins.toString().padStart(2, '0')}:${durationSecs.toString().padStart(2, '0')}`);
        }
      }, 1000);
    }
  
    return () => clearInterval(interval);
  }, [todayRecord, employee?.employment_type, breakAlert.acknowledged]);

  // Fetch client attendance
  const fetchClientAttendance = async (employeeId) => {
    if (!employeeId) return;
  
    setClientLoading(true);
    try {
      const clientResponse = await axios.get(
        `/attendance/employees/${employeeId}/assigned-clients/`
      );
      const assignedClients = clientResponse.data;
      localStorage.setItem("assignedClients", JSON.stringify(assignedClients));
      setClientAttendanceData(assignedClients);
    } catch (error) {
      console.error("Error fetching assigned clients:", error);
      setError("Failed to load assigned clients");
    } finally {
      setClientLoading(false);
    }
  };

  //Fetch assigned schedules
  const fetchAssignedSchedule = async (employeeId) => {
    if (!employeeId) return;
  
    setScheduleLoading(true);
    try {
      const scheduleResponse = await axios.get(
        `/attendance/schedule/employee/${employeeId}/`
      );
      const assignedClients = scheduleResponse.data;
      localStorage.setItem("scheduleTime", JSON.stringify(assignedClients));
      setScheduleAttendanceData(assignedClients);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError("Failed to load schedule of employee");
    } finally {
      setScheduleLoading(false);
    }
  };

  // Break alert modal
  const BreakAlertModal = () => (
    <Dialog
      open={breakAlert.open}
      onClose={() => setBreakAlert({...breakAlert, open: false, acknowledged: true})}
      aria-labelledby="break-alert"
    >
      <DialogTitle sx={{ color: 'warning.main', display: 'flex', alignItems: 'center' }}>
        <WarningAmberIcon sx={{ mr: 1 }} />
        Break Time Almost Over!
      </DialogTitle>
      <DialogContent>
        <Typography>
          Your break will end in <strong>{breakAlert.remainingTime}</strong>.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setBreakAlert({...breakAlert, open: false, acknowledged: true})}
          color="primary"
          variant="contained"
          sx={{color: 'white !important'}}
        >
          Acknowledge
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Handle 1-hour delay for break start after time-in
  useEffect(() => {
    let interval;
    if (todayRecord?.time_in && !todayRecord?.start_break) {
      const timeIn = new Date(`${todayRecord.date}T${todayRecord.time_in}`);
      const now = getCurrentPHTDate();
      const elapsedMs = now - timeIn;
      const delayMs = 60 * 60 * 1000;
      
      if (elapsedMs < delayMs) {
        const remainingMs = delayMs - elapsedMs;
        setBreakDelayRemaining(Math.ceil(remainingMs / 1000));
        
        interval = setInterval(() => {
          setBreakDelayRemaining(prev => {
            const newValue = prev - 1;
            if (newValue <= 0) {
              clearInterval(interval);
              return 0;
            }
            return newValue;
          });
          
          setBreakDelayProgress(100 - ((remainingMs - (breakDelayRemaining * 1000)) / delayMs * 100));
        }, 1000);
      } else {
        setBreakDelayRemaining(0);
      }
    } else {
      setBreakDelayRemaining(0);
    }

    return () => clearInterval(interval);
  }, [todayRecord, breakDelayRemaining]);

  // Fetch today's attendance
  const fetchTodayAttendance = async (employeeId) => {
  setLoading(true);
  setError(null);
  try {
    const now = getCurrentPHTDate();
    const today = formatDateToYMD(now);
    const yesterday = formatDateToYMD(new Date(now.setDate(now.getDate() - 1)));
    
    // First check if there's an open record from yesterday (no time out)
    const yesterdayResponse = await axios.get(`/attendance/logs`, {  
      params: { 
        employee_id: employeeId,
        date: yesterday
      }
    });
    
    let existingRecord = yesterdayResponse.data?.logs?.[0];
    
    // If no open record from yesterday, check today's records
    if (!existingRecord || existingRecord.time_out) {
      const todayResponse = await axios.get(`/attendance/logs`, {  
        params: { 
          employee_id: employeeId,
          date: today
        }
      });
      existingRecord = todayResponse.data?.logs?.[0];
    }

    // If still no record, create a new one based on current time
    if (!existingRecord) {
      existingRecord = {
        employee: employeeId,
        date: now.getHours() < 5 ? yesterday : today, // Use yesterday's date if it's early morning (before 5am)
        status: 'Present',
        time_in: null,
        start_break: null,
        end_break: null,
        time_out: null,
        break_duration: 0,
        work_hours: 0,
        time_in_status: null,
        time_out_status: null,
        break_status: null
      };
    }
    
    setTodayRecord(existingRecord);
    
    // Load all records for history
    const allRecordsResponse = await axios.get(`/attendance/logs`, {
      params: {
        employee_id: employeeId,
        ordering: '-date,-time_in'
      }
    });
    
    setAttendanceRecords(allRecordsResponse.data?.results || []);
    
  } catch (error) {
    setError('Failed to load attendance records');
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
    const today = formatDateToYMD(now);
    const weekday = now.getDay();

    // For Saturday, we need to check both Friday and Saturday logs
    const datesToCheck = weekday === 6 ? 
      [today, formatDateToYMD(new Date(now.setDate(now.getDate() - 1)))] : 
      [today];

    let existingRecord = null;
    let recordDate = today;
    
    // Check for existing logs in all relevant dates
    for (const date of datesToCheck) {
      const response = await axios.get(`/attendance/logs`, {  
        params: { 
          employee_id: employee.id,
          date: date
        }
      });
      
      if (response.data?.logs?.[0]) {
        existingRecord = response.data.logs[0];
        recordDate = date;
        break;
      }
    }

    let payload = {
      employee: employee.id,
      date: recordDate,
      [actionType === 'timeIn' ? 'time_in' : 
       actionType === 'breakStart' ? 'start_break' :
       actionType === 'breakEnd' ? 'end_break' : 'time_out']: timeString
    };

    if (existingRecord) {
      payload.id = existingRecord.id;
    }

    let response;
    if (payload.id) {
      response = await axios.patch(`/attendance/logs/${payload.id}/`, payload);
    } else {
      response = await axios.post('/attendance/logs/', payload);
    }

    setTodayRecord(response.data);
    setSuccess(`Successfully recorded ${actionType}`);
    await fetchTodayAttendance(employee.id);
  } catch (error) {
    setError(error.response?.data?.error || error.message || `Failed to ${actionType}`);
  } finally {
    setLoading(false);
    setActionInProgress(null);
  }
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

  // Get button state
  const getButtonState = (action) => {
  // Get current date in PHT
  const currentPHTDate = getCurrentPHTDate();
  const todayDateStr = formatDateToYMD(currentPHTDate);
  const isWeekend = currentPHTDate.getDay() === 0 || currentPHTDate.getDay() === 6; 
  const isMondayMorning = currentPHTDate.getDay() === 1 && currentPHTDate.getHours() < 12;
  const shouldDisableAll = isWeekend && (!todayRecord || !todayRecord.time_in) && !isMondayMorning;

  // if (shouldDisableAll) {
  //   return { 
  //     status: 'disabled', 
  //     disabled: true, 
  //     tooltip: 'Actions are disabled on weekends when there is no time-in record. Buttons will enable Monday morning.' 
  //   };
  // }

  const isTodayRecord = todayRecord && todayRecord.date === todayDateStr;

  if (!isTodayRecord) {
    return action === 'timeIn' ? 
      { status: 'enabled', disabled: false, tooltip: 'Time in now' } : 
      { status: 'disabled', disabled: true, tooltip: 'Only available for today\'s record' };
  }

  // Calculate time since time-in (if exists)
  let timeSinceTimeIn = 0;
  let timeInDate = null;
  if (todayRecord.time_in) {
    timeInDate = new Date(`${todayRecord.date}T${todayRecord.time_in}`);
    const now = getCurrentPHTDate();
    timeSinceTimeIn = (now - timeInDate) / (1000 * 60); // in minutes
  }

  // Time In button logic
  if (action === 'timeIn') {
    const disabled = (todayRecord.time_in && !todayRecord.time_out) || loading;
    return {
      status: todayRecord.time_in ? 'completed' : 'enabled',
      disabled: disabled,
      tooltip: disabled ? 'Already timed in' : 'Time in now'
    };
  }

  // Break Start button logic
  if (action === 'breakStart') {
    const canStartBreak = todayRecord.time_in && 
                        !todayRecord.time_out && 
                        (!todayRecord.start_break || 
                        (todayRecord.start_break && todayRecord.end_break));
    
    const oneHourPassed = timeSinceTimeIn >= 60;
    const disabled = !canStartBreak || !oneHourPassed || loading;
    
    let tooltip = '';
    if (!todayRecord.time_in) {
      tooltip = 'Must time in first';
    } else if (!oneHourPassed) {
      const remainingMins = 60 - Math.floor(timeSinceTimeIn);
      tooltip = `Break available in ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
    } else if (todayRecord.start_break && !todayRecord.end_break) {
      tooltip = 'Break already started';
    } else {
      tooltip = 'Start your break';
    }

    return {
      status: todayRecord.start_break && !todayRecord.end_break ? 'completed' : 'enabled',
      disabled: disabled,
      tooltip: tooltip
    };
  }

  // Break End button logic
  if (action === 'breakEnd') {
    const canEndBreak = todayRecord.time_in && 
                       !todayRecord.time_out && 
                       todayRecord.start_break && 
                       !todayRecord.end_break;
    
    return {
      status: todayRecord.end_break ? 'completed' : 'enabled',
      disabled: !canEndBreak || loading,
      tooltip: !canEndBreak ? 'Must start break first' : 'End your break'
    };
  }

  // Time Out button logic
  if (action === 'timeOut') {
    const canTimeOut = todayRecord.time_in && 
                      !todayRecord.time_out && 
                      (!todayRecord.start_break || 
                      (todayRecord.start_break && todayRecord.end_break));
    
    const oneHourPassed = timeSinceTimeIn >= 60;
    const disabled = !canTimeOut || !oneHourPassed || loading;
    
    let tooltip = '';
    if (!todayRecord.time_in) {
      tooltip = 'Must time in first';
    } else if (todayRecord.start_break && !todayRecord.end_break) {
      tooltip = 'Must end break first';
    } else if (!oneHourPassed) {
      const remainingMins = 60 - Math.floor(timeSinceTimeIn);
      tooltip = `Time out available in ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
    } else {
      tooltip = 'Time out now';
    }

    return {
      status: todayRecord.time_out ? 'completed' : 'enabled',
      disabled: disabled,
      tooltip: tooltip
    };
  }

  return { status: 'disabled', disabled: true, tooltip: 'Action not available' };
  };

  // Filter records based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecords(attendanceRecords);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = attendanceRecords.filter(record => {
        const dateMatch = formatDisplayDate(record.date).toLowerCase().includes(searchLower);
        const timeInMatch = formatTimeTo12Hour(record.time_in).toLowerCase().includes(searchLower);
        const timeOutMatch = record.time_out ? formatTimeTo12Hour(record.time_out).toLowerCase().includes(searchLower) : false;
        const statusMatch = record.status.toLowerCase().includes(searchLower);
        
        return dateMatch || timeInMatch || timeOutMatch || statusMatch;
      });
      setFilteredRecords(filtered);
    }
  }, [searchTerm, attendanceRecords]);

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
        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
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

  const formatTimeForTimezone = (timezone) => {
  try {
    const options = {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    const dateOptions = {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', options);
    const dateStr = now.toLocaleDateString('en-US', dateOptions);
    
    // Get GMT offset
    const offset = -now.getTimezoneOffset() / 60;
    const gmtOffset = `GMT ${offset >= 0 ? '+' : ''}${offset}:00`;
    
    return {
      time12: timeStr,
      date: dateStr,
      gmtOffset
    };
  } catch (e) {
    return null;
  }
};

  // Render time display
  const renderTimeDisplay = () => {
  const estLabel = getESTTimezoneLabel(); 
  const phtLabel = getPHTTimezoneLabel();
  
  // Get client timezone data if available
  const clientTimezoneData = clientAttendanceData.length > 0 
    ? formatTimeForTimezone(clientAttendanceData[0].timezone)
    : null;

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* Philippine Time */}
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2, backgroundColor: theme.palette.primary.light }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PublicIcon sx={{ mr: 1, color: theme.palette.secondary.contrastText }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>
              Philippine Time ({phtLabel})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box>
              <Typography variant="body1" sx={{ color: theme.palette.secondary.contrastText }}>
                {currentTime.pht.time12}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.secondary.contrastText }}>
                {currentTime.pht.date}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Eastern Time */}
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2, backgroundColor: theme.palette.secondary.light }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PublicIcon sx={{ mr: 1, color: theme.palette.secondary.contrastText }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>
              Eastern Time ({estLabel})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box>
              <Typography variant="body1" sx={{ color: theme.palette.secondary.contrastText }}>
                {currentTime.est.time12}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.secondary.contrastText }}>
                {currentTime.est.date}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Client Timezone - only show if client data exists */}
      {clientTimezoneData && (
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ 
            p: 2, 
            backgroundColor: theme.palette.success.light,
            color: theme.palette.success.contrastText
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PublicIcon sx={{ mr: 1, color: theme.palette.success.contrastText }} />
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 'bold',
                color: theme.palette.success.contrastText
              }}>
                {clientAttendanceData[0].timezone} Time ({clientTimezoneData.gmtOffset})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1" sx={{ color: theme.palette.success.contrastText }}>
                  {clientTimezoneData.time12}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.success.contrastText }}>
                  {clientTimezoneData.date}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
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
        gap: 1,
        mb: 1
      }}>
        {/* Employee Basic Info */}
        <Box sx={{
          width: 500,
          backgroundColor: theme.palette.grey[50],
          p: 2,
          borderRadius: 2,
          borderLeft: `4px solid ${theme.palette.info.main}`,
          boxShadow: theme.shadows[1]
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
            <Typography variant="h6" sx={{color: 'black !important'}}>
              {employee.first_name} {employee.last_name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WorkIcon color="primary" sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{color: 'black !important'}}>
              {employee.department} / {employee.team}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WorkIcon color="primary" sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{color: 'black !important'}}>
              {employee.employment_type} / {employee.status}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WorkIcon color="primary" sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{color: 'black !important'}}>
              {employee.work_arrangement} / {employee.type}
            </Typography>
          </Box>
        
        </Box>
        
          {/* Schedule */}
       <Box sx={{
          width: 500,
          backgroundColor: theme.palette.grey[50],
          p: 2,
          borderRadius: 2,
          borderLeft: `4px solid ${theme.palette.info.main}`,
          boxShadow: theme.shadows[1]
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
              Weekly Schedule
            </Typography>
          </Box>
          
          {scheduleLoading ? (
            <CircularProgress size={20} />
          ) : scheduleAttendanceData.length > 0 ? (
            <Box>
              {/* Sort days by weekday order before mapping */}
              {[...scheduleAttendanceData]
                .sort((a, b) => {
                  // Define the order of weekdays
                  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                  return dayOrder.indexOf(a.day.toLowerCase()) - dayOrder.indexOf(b.day.toLowerCase());
                })
                .map((day) => (
                  <Box 
                    key={day.id}
                    sx={{ 
                      mb: 1.5,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: theme.palette.grey[100],
                      borderLeft: `3px solid ${theme.palette.primary.main}`
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {day.day.charAt(0).toUpperCase() + day.day.slice(1)}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatTimeTo12Hour(day.time_in)} - {formatTimeTo12Hour(day.time_out)}
                      </Typography>
                    </Box>
                    
                    {day.has_break && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mt: 0.5
                      }}>
                        <FreeBreakfastIcon sx={{ 
                          fontSize: '1rem', 
                          color: theme.palette.secondary.main,
                          mr: 1
                        }} />
                        <Typography variant="caption">
                          Break: {formatTimeTo12Hour(day.break_start)} - {formatTimeTo12Hour(day.break_end)}
                        </Typography>
                      </Box>
                    )}
                    
                    {day.notes && (
                      <Typography variant="caption" sx={{ 
                        display: 'block',
                        mt: 0.5,
                        fontStyle: 'italic',
                        color: theme.palette.text.secondary
                      }}>
                        Note: {day.notes}
                      </Typography>
                    )}
                  </Box>
                ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              No schedule assigned
            </Typography>
          )}
        </Box>
        {/* Client Information */}
        <Box sx={{
          width: 500,
          backgroundColor: theme.palette.grey[50],
          p: 2,
          borderRadius: 2,
          borderLeft: `4px solid ${theme.palette.info.main}`,
          boxShadow: theme.shadows[1]
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 1
          }}>
            <WorkIcon color="info" sx={{ mr: 1, fontSize: '1rem' }} />
            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600 }}>
              Assigned Clients
            </Typography>
          </Box>

          {clientLoading ? (
            <CircularProgress size={20} />
          ) : clientAttendanceData.length > 0 ? (
            clientAttendanceData.map(client => (
              <Box key={client.id} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6" sx={{color: 'black !important'}}>
                    {client.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2}}>
                  <TimerIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6" sx={{color: 'black !important'}}>
                    {formatTimeTo12Hour(client.start_time)} - {formatTimeTo12Hour(client.end_time)} ({client.schedule_type})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2}}>
                  <TimerIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6" sx={{color: 'black !important'}}>
                    {client.timezone}
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              No clients assigned
            </Typography>
          )}
        </Box>

        {/* Leave Credits */}
        <Box sx={{
          width: 500,
          backgroundColor: theme.palette.grey[50],
          p: 2,
          borderRadius: 2,
          borderLeft: `4px solid ${theme.palette.info.main}`,
          boxShadow: theme.shadows[1]
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 1
          }}> 
            <WorkIcon color="info" sx={{ mr: 1, fontSize: '1rem' }} />
            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600 }}>
              Leave Credits
            </Typography>
          </Box>

          {leaveCredits.length > 0 ? (
            leaveCredits.map(credit => {
              const remainingDays = credit.total_days - credit.used_days;
              const daysText = (count) => count === 1 ? 'day' : 'days';
              
              return (
                <Box key={credit.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 400 }}>
                    {credit.leave_type.charAt(0).toUpperCase() + credit.leave_type.slice(1)} Leave
                  </Typography>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 1
                  }}>
                    <Typography variant="body2">Total:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 400 }}>
                      {credit.total_days} {daysText(credit.total_days)}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <Typography variant="body2">Used:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {credit.used_days} {daysText(credit.used_days)}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 1
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Remaining:</Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: remainingDays === 0 ? theme.palette.error.main : theme.palette.success.main
                    }}>
                      {remainingDays} {daysText(remainingDays)}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              No leave credits available
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  // Render time buttons
  const renderTimeButtons = () => {
    const buttons = [
      {
        action: 'timeIn',
        label: 'Time In',
        icon: <AccessTimeIcon />,
        color: '#4CAF50',
        bgColor: '#E8F5E9'
      },
      {
        action: 'breakStart',
        label: 'Start Break',
        icon: <FreeBreakfastIcon />,
        color: '#2196F3',
        bgColor: '#E3F2FD'
      },
      {
        action: 'breakEnd',
        label: 'End Break',
        icon: <LunchDiningIcon />,
        color: '#FF9800',
        bgColor: '#FFF3E0'
      },
      {
        action: 'timeOut',
        label: 'Time Out',
        icon: <ExitToAppIcon />,
        color: '#F44336',
        bgColor: '#FFEBEE'
      }
    ];
  
    return (
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap',
        mb: 3,
        justifyContent: 'center'
      }}>
        {buttons.map((btn) => {
          const { status, disabled, tooltip } = getButtonState(btn.action);
          const isLoading = loading && actionInProgress === btn.action;
          
          const buttonContent = (
            <Button
              key={btn.action}
              variant={status === 'completed' ? "contained" : "outlined"}
              disabled={disabled}
              startIcon={btn.icon}
              onClick={() => !disabled && showConfirmationDialog(btn.action)}
              sx={{
                minWidth: 150,
                height: 50,
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '8px',
                borderWidth: '2px',
                textTransform: 'none',
                color: status === 'completed' ? '#fff' : btn.color,
                backgroundColor: status === 'completed' ? btn.color : btn.bgColor,
                borderColor: btn.color,
                '&:hover': {
                  backgroundColor: status === 'completed' ? btn.color : `${btn.color}20`,
                  borderWidth: '2px'
                },
                '&.Mui-disabled': {
                  color: status === 'completed' ? '#fff' : `${btn.color}80`,
                  backgroundColor: status === 'completed' ? `${btn.color}80` : `${btn.bgColor}80`,
                  borderColor: status === 'completed' ? 'transparent' : `${btn.color}80`
                }
              }}
            >
              {btn.label}
              {isLoading && (
                <CircularProgress 
                  size={24} 
                  sx={{ 
                    position: 'absolute',
                    right: 12,
                    color: status === 'completed' ? '#fff' : btn.color
                  }} 
                />
              )}
            </Button>
          );
          
          return tooltip ? (
            <Tooltip title={tooltip} arrow key={btn.action}>
              <Box>
                {buttonContent}
                {btn.action === 'breakStart' && breakDelayRemaining > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <HourglassEmptyIcon color="action" sx={{ mr: 1 }} />
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={breakDelayProgress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'divider',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 'text.secondary'
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeFromSeconds(breakDelayRemaining)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Tooltip>
          ) : (
            <Box key={btn.action}>
              {buttonContent}
            </Box>
          );
        })}
      </Box>
    );
  };

  // Render attendance table
  const renderAttendanceTable = () => {
    if (loading && !todayRecord) {
      return <div className="loading">Loading attendance data...</div>;
    }
  
    if (!todayRecord) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#777' }}>
          No attendance record for today
        </div>
      );
    }
  
    const formatBreakDuration = (duration) => {
      if (duration === null || duration === undefined || isNaN(duration)) return '0.00 min';
      
      const durationNum = typeof duration === 'string' ? parseFloat(duration) : duration;
  
      if (durationNum < 1) {
        return `${durationNum.toFixed(2)} min`;
      } else if (durationNum >= 60) {
        const hours = Math.floor(durationNum / 60);
        const minutes = Math.round(durationNum % 60);
        return `${hours}h ${minutes}m`;
      } else {
        return `${durationNum.toFixed(2)} mins`;
      }
    };
    
    return (
      <div className="container" style={{ 
        width: '100%', 
        overflowX: 'auto',
        maxWidth: '100%'
      }}>
        <table style={{ 
          width: '100%',
          minWidth: '1200px',
          borderCollapse: 'collapse',
          fontSize: '0.875rem'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Time In</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Start Break</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>End Break</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Break Duration</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Time Out</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Work Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ fontSize: '1rem', borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {formatDisplayDate(todayRecord.date)}
              </td>
              <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                {formatTimeTo12Hour(todayRecord.time_in)}
              </td>
              
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {todayRecord.time_in_status ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    backgroundColor: todayRecord.time_in_status.includes('Late') ? '#FFE082' : '#C8E6C9',
                    color: todayRecord.time_in_status.includes('Late') ? '#5D4037' : '#1B5E20'
                  }}>
                    {todayRecord.time_in_status}
                  </span>
                ) : '--'}
              </td>
              
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <div style={{ fontWeight: 500 }}>
                  {formatTimeTo12Hour(todayRecord.start_break)}
                </div>
                {todayRecord.start_break && !todayRecord.end_break && breakDuration && (
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: (todayRecord?.break_duration >= (employee?.employment_type === 'training' ? 15 : 60)) ? 
                      '#D32F2F' : '#666'
                  }}>
                    Duration: {breakDuration}
                  </div>
                )}
              </td>
              
              <td style={{ padding: '12px 16px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {formatTimeTo12Hour(todayRecord.end_break)}
              </td>
  
              <td style={{
                padding: '12px 16px',
                fontWeight: 600,
                color: todayRecord.break_duration >= 61 ? '#D32F2F' : 'inherit',
                whiteSpace: 'nowrap'
              }}>
                {formatBreakDuration(todayRecord.break_duration)}
              </td>
              
              <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                {formatTimeTo12Hour(todayRecord.time_out)}
              </td>
              
              <td style={{ 
                padding: '12px 16px',
                fontWeight: 600,
                color: todayRecord.work_hours < employee.contract_hours ? '#D32F2F' : '#2E7D32',
                whiteSpace: 'nowrap'
              }}>
                {todayRecord.work_hours ? `${todayRecord.work_hours} hrs` : '0 hr'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Render history tracker
  const renderHistoryTracker = () => {
    const formatDurationDisplay = (minutes) => {
      if (!minutes || minutes === 0) return '';
      const mins = parseFloat(minutes);
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m`;
    };
  
    if (loading && filteredRecords.length === 0) {
      return <CircularProgress sx={{ mt: 4 }} />;
    }
  
    if (filteredRecords.length === 0) {
      return (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography>No matching attendance records found</Typography>
          {searchTerm && (
            <Button onClick={() => setSearchTerm('')} sx={{ mt: 2 }}>
              Clear search
            </Button>
          )}
        </Box>
      );
    }
  
    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
  
        <Grid container spacing={2}>
          {filteredRecords.map((record) => {
            const lateDuration = formatDurationDisplay(record.late_duration);
            const earlyDuration = formatDurationDisplay(record.early_duration);
            const breakDuration = formatDurationDisplay(record.break_duration);
            const overtimeDuration = formatDurationDisplay(record.overtime);
            const undertimeDuration = formatDurationDisplay(record.undertime);
  
            const hasLateStatus = lateDuration && record.time_in_status?.includes('Late');
            const hasEarlyStatus = earlyDuration && record.time_in_status?.includes('Early');
            const hasUndertimeStatus = undertimeDuration && record.time_out_status?.includes('Undertime');
            const hasOverbreakStatus = record.time_out_status?.includes('Overbreak');
            const hasOvertimeStatus = overtimeDuration && record.time_out_status?.includes('Overtime');
            
            return (
              <Grid item xs={12} key={record.id}>
                <Paper elevation={3} sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  backgroundColor: theme.palette.background.paper
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      color: 'black !important'
                    }}>
                      {formatDisplayDate(record.date)}
                    </Typography>  
                    <Box sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 12,
                      backgroundColor:
                        record.status === 'Present' ? '#4CAF50' : 
                        record.status === 'Late' ? '#FF9800' :
                        record.status === 'Absent' ? '#F44336' : 
                        '#BDBDBD', 
                      color: '#FFFFFF !important', 
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      display: 'inline-block',
                      textAlign: 'center',
                      minWidth: 64
                    }}>
                      {record.status}
                    </Box>
                  </Box>
  
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 1,
                    }}>
                      <AccessTimeIcon sx={{ 
                        mr: 1, 
                        fontSize: '1rem',
                        color: hasLateStatus ? theme.palette.error.main : 
                              hasEarlyStatus ? theme.palette.success.main : 
                              theme.palette.text.secondary
                      }} />
                      <Typography variant="body2" sx={{
                        fontSize: '0.95rem',
                        color: hasLateStatus ? theme.palette.error.main : 
                              hasEarlyStatus ? theme.palette.success.main : 'inherit'
                      }}>
                        <strong>Time In:</strong> {formatTimeTo12Hour(record.time_in) || '--'}
                      </Typography>
                      {record.time_in_status && (
                        <Typography variant="caption" sx={{ 
                          ml: 1,
                          fontSize: '0.85rem',
                          color: hasLateStatus ? theme.palette.error.main : 
                                hasEarlyStatus ? theme.palette.success.main : 'inherit'
                        }}>
                          {record.time_in_status}
                        </Typography>
                      )}
                    </Box>
  
                    {(record.start_break || (record.end_break && record.break_duration > 0)) && (
                      <Box sx={{ 
                        borderRadius: 1,
                        mb: 1
                      }}>
                        {record.start_break && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <FreeBreakfastIcon sx={{ 
                              mr: 1, 
                              fontSize: '1rem',
                              color: theme.palette.info.main
                            }} />
                            <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
                              <strong>Break Started:</strong> {formatTimeTo12Hour(record.start_break)}
                            </Typography>
                          </Box>
                        )}
                        
                        {record.end_break && record.break_duration > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LunchDiningIcon sx={{ 
                              mr: 1, 
                              fontSize: '1rem',
                              color: record.break_status?.includes('Overbreak') ? 
                                theme.palette.error.main : theme.palette.success.main
                            }} />
                            <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
                              <strong>Break Ended:</strong> {formatTimeTo12Hour(record.end_break)}
                            </Typography>
                            {record.break_status && (
                              <Typography variant="caption" sx={{ 
                                ml: 1,
                                fontSize: '0.85rem',
                                color: record.break_status?.includes('Overbreak') ? 
                                  theme.palette.error.main : theme.palette.success.main
                              }}>
                                {record.break_status}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}
  
                    {record.time_out && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mb: 1,
                      }}>
                        <ExitToAppIcon sx={{ 
                          mr: 1, 
                          fontSize: '1rem',
                          color: hasUndertimeStatus ? theme.palette.error.main : 
                                hasOvertimeStatus ? theme.palette.info.main : 
                                theme.palette.success.main
                        }} />
                        <Typography variant="body2" sx={{
                          fontSize: '0.95rem',
                          color: hasUndertimeStatus ? theme.palette.error.main : 
                                hasOvertimeStatus ? theme.palette.info.main : 'inherit'
                        }}>
                          <strong>Time Out:</strong> {formatTimeTo12Hour(record.time_out)}
                        </Typography>
                        {record.time_out_status && (
                          <Typography variant="caption" sx={{ 
                            ml: 1,
                            fontSize: '0.85rem',
                            color: hasUndertimeStatus ? theme.palette.error.main : 
                                  hasOvertimeStatus ? theme.palette.info.main : 'inherit'
                          }}>
                            {record.time_out_status.replace(/\(([^)]+)\)\s*\1/g, '$1')}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  return (
    <SideNavBar>
      <Box sx={{ p: 3, mt: -13 }}>
        {renderTimeDisplay()}
        {renderEmployeeInfo()}
        {employee && (
          <>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: 2,
                backgroundColor: "#f5f5f5",
              }}
            >
              {tabItems.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                    color: tabValue === index ? "#1976d2" : "#555",
                    transition: "color 0.3s",
                    "&:hover": {
                      color: "#1565c0",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#e3f2fd",
                      borderRadius: 2,
                    },
                  }}
                />
              ))}
            </Tabs>
            
            {tabValue === 0 && (
              <>
                {renderTimeButtons()}
                {renderAttendanceTable()}
              </>
            )}
            {tabValue === 1 && renderHistoryTracker()}
          </>
        )}

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
        <BreakAlertModal />
      </Box>
    </SideNavBar>
  );
};

export default EmployeeAttendanceDashboard;