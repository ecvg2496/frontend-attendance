import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Box, 
  Typography, 
  Tab, 
  Tabs, 
  Card, 
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Pagination,
  useTheme,
  useMediaQuery,
  Fab,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Person as PersonIcon,
  CheckCircle as PresentIcon,
  Schedule as LateIcon,
  Cancel as AbsentIcon,
  Event as DateIcon,
  Error as ErrorIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'api/axios';
import '../content_page/css/admintable.css';
import SideNavBar from "../content_page/nav_bar";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getMatchedStyle = (statusText) => {
    if (statusText.includes("Early")) return statusStyles.Early;
    if (statusText.includes("Late")) return statusStyles.Late;
    if (statusText.includes("Undertime")) return statusStyles.Undertime;
    if (statusText.includes("Overbreak")) return statusStyles.Overbreak;
    if (statusText.includes("Overtime")) return statusStyles.Overtime;
    if (statusText.includes("On Time")) return statusStyles.OnTime;
    if (statusText.includes("Paid Leave")) return statusStyles.paidLeave;
    return statusStyles[statusText];
  };

  const statusStyles = {
    Active: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Inactive: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Leave: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    Floating: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    Present: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Working: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Overtime: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Late: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    Undertime: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    Absent : { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Taken: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Missed: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Overbreak: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Early: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    OnTime: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    paidLeave: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' }
  };

  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: '10px',
      fontSize: '1.2em',
      fontWeight: '600',
      textTransform: 'capitalize',
      ...(getMatchedStyle(status) || { background: '#e0e0e0', color: '#333' })
    }}>
      {status}
    </span>
  );
};

// Time Formatter Component
const formatTimeProfessional = (timeString) => {
  if (!timeString) return '';
  
  try {
    const time = new Date(`2000-01-01T${timeString}`);
    const hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const isPM = hours >= 12;
    const hour12 = hours % 12 || 12;
    
    return `${hour12}:${minutes} ${isPM ? 'PM' : 'AM'}`;
  } catch (e) {
    console.error('Error formatting time:', e);
    return timeString;
  }
};

// Convert date type 
const formatDisplayDate = (dateString) => {
  if (!dateString) return '--';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// Main Table Component with Joined Data
const DailyAttendanceTable = ({ employeeData, logsData, loading, error, onViewClick }) => {
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
      <CircularProgress size={20} />
    </Box>
  );
  
  if (error) return (
    <Box sx={{ p: 1 }}>
      <Alert severity="error" sx={{ fontSize: '0.8rem' }}>{error}</Alert>
    </Box>
  );

  if (!logsData || logsData.length === 0) return (
    <Box sx={{ p: 1 }}>
      <Alert severity="info" sx={{ fontSize: '0.8rem' }}>No attendance records found</Alert>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
     <table style={{ 
        width: '100%',
        minWidth: '1200px',
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Date</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Status</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Time In</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Time-in Status</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Start Break</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>End Break</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Break Status</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Time Out</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Time Out Status</th>
          </tr>
        </thead>
        <tbody>
          {logsData.map((log) => {
            const hasBreak = log.start_break && log.end_break;
            const breakStatus = hasBreak ? 'Taken' : 'Missed';
            const status = log.time_in ? 'Present' : (log.status || 'Absent');
            const timeStatus = log.time_out;
            return (
              <tr key={log.id}>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '18px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <DateIcon fontSize="medium" color="action" />
                    {log.date ? formatDisplayDate(log.date) : "--"}
                  </Box>
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <StatusBadge status={status} />
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '18px' }}>
                  {log.time_in ? formatTimeProfessional(log.time_in) : '--:--'}
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StatusBadge status={log?.time_in_status || ''} />
                  </Box>
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '18px' }}>
                  {log.start_break ? formatTimeProfessional(log.start_break) : ''}
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '18px' }}>
                  {log.end_break ? formatTimeProfessional(log.end_break) : ''}
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {hasBreak && (
                    <StatusBadge status={log?.break_status || breakStatus} />
                  )}
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '18px' }}>
                  {log.time_out ? formatTimeProfessional(log.time_out) : ''}
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {timeStatus && (
                    <StatusBadge status={log?.time_out_status || ''} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
};

const AttendanceUserLogs = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [logsData, setLogsData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [overviewPage, setOverviewPage] = useState(1);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [dateError, setDateError] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [openRequestForm, setOpenRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    date: null,
    type: '',
    time_in: '',
    time_out: '',
    reason: ''
  });
  const itemsPerPage = 7;

  // Disable future dates
  const disableFutureDates = (date) => {
    return date > new Date();
  };

  // Handle date change with validation
  const handleDateChange = (type, newValue) => {
    const newDateRange = {...dateRange, [type]: newValue};
    setDateRange(newDateRange);
    
    if (newDateRange.startDate && newDateRange.endDate && newDateRange.endDate < newDateRange.startDate) {
      setDateError(true);
      setShowErrorModal(true);
    } else {
      setDateError(false);
    }
  };

  // Filter data based on date range for both tabs
  const filterByDateRange = (data) => {
    if (dateError) return [];
    if (!dateRange.startDate && !dateRange.endDate) return data;
    
    return data.filter(log => {
      const logDate = new Date(log.date);
      const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
      const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
      
      if (startDate && !endDate) {
        startDate.setHours(0, 0, 0, 0);
        return logDate >= startDate;
      }
      
      if (!startDate && endDate) {
        endDate.setHours(23, 59, 59, 999);
        return logDate <= endDate;
      }
      
      if (startDate && endDate) {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return logDate >= startDate && logDate <= endDate;
      }
      
      return true;
    });
  };

  const filteredData = filterByDateRange(logsData);

  // Calculate time difference in hours
  const calculateTimeDifference = (time1, time2) => {
    if (!time1 || !time2) return 0;
    
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    
    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;
    
    return (totalMinutes1 - totalMinutes2) / 60;
  };

  const calculateStats = (data) => {
    let totalLateHours = 0;
    let totalUndertimeHours = 0;
    let totalOvertimeHours = 0;
    let totalMakeupHours = 0;
    
    const lateCount = data.filter(log => {
      if (log.time_in_status === 'Late' && log.time_in && employeeData?.time_in) {
        const lateHours = calculateTimeDifference(log.time_in, employeeData.time_in);
        if (lateHours > 0) {
          totalLateHours += lateHours;
          return true;
        }
      }
      return false;
    }).length;

    const undertimeCount = data.filter(log => {
      if (log.time_out_status === 'Undertime' && log.undertime_hours) {
        totalUndertimeHours += parseFloat(log.undertime_hours);
        return true;
      }
      return false;
    }).length;

    const overtimeCount = data.filter(log => {
      if (log.overtime) {
        totalOvertimeHours += parseFloat(log.overtime) / 60;
        return true;
      }
      return false;
    }).length;

    const presentCount = data.filter(log => log.status === 'Present').length;
    const leaveCount = data.filter(log => log.status === 'Leave').length;
    const floatingCount = data.filter(log => log.status === 'Floating').length;
    const absentCount = data.length - presentCount - leaveCount - floatingCount;

    data.forEach(log => {
      if (log.make_up_hours) {
        totalMakeupHours += parseFloat(log.make_up_hours);
      }
    });

    return {
      totalLogs: data.length,
      present: presentCount,
      late: lateCount,
      totalLateHours: totalLateHours.toFixed(2),
      absent: absentCount,
      leave: leaveCount,
      floating: floatingCount,
      undertime: undertimeCount,
      totalUndertimeHours: totalUndertimeHours.toFixed(2),
      overtime: overtimeCount,
      totalOvertimeHours: totalOvertimeHours.toFixed(2),
      totalMakeupHours: totalMakeupHours.toFixed(2),
    };
  };

  const stats = calculateStats(filteredData);

  // Paginate the data for Attendance Logs tab
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Paginate the data for Overview tab
  const paginatedOverviewData = filteredData.slice(
    (overviewPage - 1) * itemsPerPage,
    overviewPage * itemsPerPage
  );

  // Reset to first page when date range changes
  useEffect(() => {
    setCurrentPage(1);
    setOverviewPage(1);
  }, [dateRange]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        const storedEmployee = localStorage.getItem('employee');
        
        if (!storedEmployee) {
          throw new Error('No employee data found');
        }
        
        const emp = JSON.parse(storedEmployee);
        
        if (!emp?.id) {
          throw new Error('Invalid employee data');
        }
        
        setEmployeeData(emp);
        
        const logsRes = await axios.get(`attendance/logs/?employee_id=${emp.id}`);
        
        if (!logsRes.data?.logs) {
          throw new Error('Invalid logs data format');
        }
        
        const updatedLogs = logsRes.data.logs.map(log => ({
          ...log,
          status: log.time_in ? 'Present' : (log.status || 'Absent')
        }));
        
        setLogsData(updatedLogs); 
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to fetch data');
        setLogsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  const handleViewClick = (data) => {
    setSelectedLog(data);
    setOpenModal(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const clearDateRange = () => {
    setDateRange({ startDate: null, endDate: null });
    setDateError(false);
  };

  // Handle FAB click
  const handleFabClick = () => {
    setOpenRequestForm(true);
  };

  // Handle request form input changes
  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setRequestForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date change in request form
  const handleRequestDateChange = (date) => {
    setRequestForm(prev => ({
      ...prev,
      date: date
    }));
  };

  // Submit the request form
  const handleSubmitRequest = async () => {
    try {
      // Add validation here
      if (!requestForm.date || !requestForm.type) {
        setError('Please fill all required fields');
        return;
      }

      const payload = {
        employee_id: employeeData.id,
        ...requestForm,
        date: requestForm.date.toISOString().split('T')[0] // Format date as YYYY-MM-DD
      };

      const response = await axios.post('attendance/requests/', payload);
      
      // Handle success
      setOpenRequestForm(false);
      setRequestForm({
        date: null,
        type: '',
        time_in: '',
        time_out: '',
        reason: ''
      });
      
      // Optionally refresh data or show success message
    } catch (err) {
      console.error('Request submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit request');
    }
  };

  if (!employeeData) {
    return (
      <SideNavBar>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      </SideNavBar>
    );
  }

  return (
    <SideNavBar>
      <Box sx={{ p: 2 }}>
        {/* Add the FAB */}
        <Fab 
          color="primary" 
          aria-label="add"
          onClick={handleFabClick}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>

        <Card sx={{  
          minHeight: 'calc(104vh - 64px)',
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
          p: 3,
          overflowX: 'hidden',
          boxSizing: 'border-box',
          mt: -12 
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ 
              '& .MuiTab-root': { minHeight: 48, fontSize: '0.8rem', color: 'black !important' },
              width: '100%'
            }}
          >
            <Tab
              label={
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 500 }}>
                  Attendance Logs
                </Typography>
              }
              icon={<TodayIcon fontSize="medium" />}
              iconPosition="start"
            />
            <Tab
              label={
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 500, color: 'black !important' }}>
                  Overview
                </Typography>
              }
              icon={<DateRangeIcon fontSize="medium" />}
              iconPosition="start"
            />
          </Tabs>
          <CardContent sx={{ p: 2 }}>
            {tabValue === 0 && (
              <Box>
                <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                  {employeeData.first_name}'s Logs
                </Typography>
            
                <DailyAttendanceTable 
                  employeeData={employeeData}
                  logsData={paginatedData}
                  loading={loading}
                  error={error}
                  onViewClick={handleViewClick}
                />

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(filteredData.length / itemsPerPage)}
                    page={currentPage}
                    onChange={(event, page) => setCurrentPage(page)}
                    color="primary"
                    size="small"
                    sx={{ '& .MuiPaginationItem-root': { fontSize: '0.7rem' } }}
                  />
                </Box>
              </Box>
            )}
            {tabValue === 1 && (
              <Box>
                <Typography variant="h3" color="primary" sx={{ mb: 2 }}>
                  Attendance Overview for {employeeData.first_name} {employeeData.last_name}
                </Typography>
                
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3 }}>
                    <DatePicker
                      label="Start Date"
                      value={dateRange.startDate}
                      onChange={(newValue) => handleDateChange('startDate', newValue)}
                      shouldDisableDate={disableFutureDates}
                      slotProps={{
                        textField: {
                          size: 'small',
                          variant: 'outlined',
                          sx: { width: '150px' },
                          error: dateError
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>to</Typography>
                    <DatePicker
                      label="End Date"
                      value={dateRange.endDate}
                      onChange={(newValue) => handleDateChange('endDate', newValue)}
                      shouldDisableDate={disableFutureDates}
                      slotProps={{
                        textField: {
                          size: 'small',
                          variant: 'outlined',
                          sx: { width: '150px' },
                          error: dateError
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={clearDateRange}
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      Clear
                    </Button>
                  </Box>
                </LocalizationProvider>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${stats.totalLogs} Records`}
                    color="info" 
                    variant="outlined" 
                    icon={<PersonIcon fontSize="small" />} 
                    size="small"
                    sx={{ fontSize: '1.2rem' }}
                  />
                  <Chip 
                    label={`${stats.present} Present`}
                    color="success" 
                    variant="outlined" 
                    icon={<PresentIcon fontSize="small" />} 
                    size="small"
                    sx={{ fontSize: '1.2rem' }}
                  />
                  <Chip 
                    label={`${stats.late} Late`}
                    color="warning" 
                    variant="outlined" 
                    icon={<LateIcon fontSize="small" />} 
                    size="small"
                    sx={{ fontSize: '1.2rem' }}
                  />
                  <Chip 
                    label={`${stats.late} Leave`}
                    color="warning" 
                    variant="outlined" 
                    icon={<LateIcon fontSize="small" />} 
                    size="small"
                    sx={{ fontSize: '1.2rem' }}
                  />
                  <Chip 
                    label={`${stats.absent} Absent`}
                    color="error" 
                    variant="outlined" 
                    icon={<AbsentIcon fontSize="small" />} 
                    size="small"
                    sx={{ fontSize: '1.2rem' }}
                  />
                  <Chip 
                    label={`${stats.absent} Undertime`}
                    color="error" 
                    variant="outlined" 
                    icon={<AbsentIcon fontSize="small" />} 
                    size="small"
                    sx={{ fontSize: '1.2rem' }}
                  />
                </Box>
                
                <DailyAttendanceTable 
                  employeeData={employeeData}
                  logsData={paginatedOverviewData}
                  loading={loading}
                  error={error}
                  onViewClick={handleViewClick}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(filteredData.length / itemsPerPage)}
                    page={overviewPage}
                    onChange={(event, page) => setOverviewPage(page)}
                    color="primary"
                    size="small"
                    sx={{ '& .MuiPaginationItem-root': { fontSize: '0.7rem' } }}
                  />
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Log Details Modal */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontSize: '0.9rem' }}>
            {selectedLog?.employee.first_name}'s Log Details
          </DialogTitle>
          <DialogContent dividers sx={{ p: 1 }}>
            {selectedLog && (
              <Box sx={{ p: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: '0.8rem' }}>Employee Information</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Email: {selectedLog.employee.email}</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Department: {selectedLog.employee.department}</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Team: {selectedLog.employee.team}</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Status: <StatusBadge status={selectedLog.employee.status} /></Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: '0.8rem' }}>Job Details</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Type: {selectedLog.employee.type}</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Work Arrangement: {selectedLog.employee.work_arrangement}</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Contract Hours: {selectedLog.employee.contract_hours}h</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      Schedule: {formatTimeProfessional(selectedLog.employee.time_in)} - {formatTimeProfessional(selectedLog.employee.time_out)}
                    </Typography>
                  </Box>

                  <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: '0.8rem' }}>Attendance Record</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Date: {formatDisplayDate(selectedLog.log.date)}</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Time In: {formatTimeProfessional(selectedLog.log.time_in)}</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Time Out: {formatTimeProfessional(selectedLog.log.time_out)}</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      Break: {selectedLog.log.start_break ? 
                        `${formatTimeProfessional(selectedLog.log.start_break)} - ${formatTimeProfessional(selectedLog.log.end_break)}` : 
                        'No break recorded'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Work Hours: {selectedLog.log.work_hours || '0'} hours</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Overtime: {selectedLog.log.overtime || '0'} hours</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Undertime: {selectedLog.log.undertime_hours || '0'} hours</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Make Up Hours: {selectedLog.log.make_up_hours || '0'} hours</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Status: <StatusBadge status={selectedLog.log.status} /></Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>Break Status: <StatusBadge status={selectedLog.log.start_break ? 'Taken' : 'Missed'} /></Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 1 }}>
            <Button 
              onClick={() => setOpenModal(false)} 
              color="primary"
              size="small"
              sx={{ fontSize: '0.7rem' }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Modal for Invalid Date Range */}
        <Dialog open={showErrorModal} onClose={() => setShowErrorModal(false)}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.9rem' }}>
            <ErrorIcon color="error" fontSize="small" />
            Invalid Date Range
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
              End date cannot be earlier than start date. Please correct the dates.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setShowErrorModal(false)} 
              color="primary"
              variant="contained"
              size="small"
              sx={{ fontSize: '0.7rem', color: 'white !important' }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Log Request Form */}
        <Dialog 
          open={openRequestForm} 
          onClose={() => setOpenRequestForm(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle variant="h3" color="primary">Log Adjustment</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={requestForm.date}
                  onChange={handleRequestDateChange}
                  shouldDisableDate={disableFutureDates}
                  slotProps={{
                    textField: {
                      size: 'small',
                      variant: 'outlined',
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>

              <FormControl fullWidth size="small">
                <InputLabel>Request Type</InputLabel>
                <Select
                  value={requestForm.type}
                  onChange={handleRequestChange}
                  name="type"
                  label="Request Type"
                >
                  <MenuItem value="time_adjustment">Time In/Out Adjustment</MenuItem>
                  <MenuItem value="time_adjustment">Break Adjustment</MenuItem>
                  <MenuItem value="overtime">Overtime Request</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Time In (HH:MM)"
                value={requestForm.time_in}
                onChange={handleRequestChange}
                name="time_in"
                size="small"
                placeholder="08:00"
              />

              <TextField
                label="Time Out (HH:MM)"
                value={requestForm.time_out}
                onChange={handleRequestChange}
                name="time_out"
                size="small"
                placeholder="17:00"
              />

              <TextField
                label="Reason"
                value={requestForm.reason}
                onChange={handleRequestChange}
                name="reason"
                size="small"
                multiline
                rows={3}
              />

              {error && (
                <Alert severity="error" sx={{ fontSize: '0.8rem' }}>
                  {error}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenRequestForm(false)}
              color="secondary"
              variant="contained"
              size="small"
              sx={{color:'white !important'}}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitRequest}
              color="primary"
              variant="contained"
              size="small"
              sx={{color:'white !important'}}
            >
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>
      </Box>  
    </SideNavBar>
  );
};

export default AttendanceUserLogs;