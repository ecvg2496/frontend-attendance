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
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Day</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Time In</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Start Break</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>End Break</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Time Out</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Total Hours</th>
            {/* <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Make Up Hours</th> */}
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.22rem' }}>Remarks</th>
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
                    {log.date ? formatDisplayDate(log.date) : "--"}
                  </Box>
                </td>
               <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '18px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {log.date ? (
                    <>
                    {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' })} {/* Example: Friday */}
                    </>
                  ) : (
                    "--"
                  )}
                </Box>
              </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '18px' }}>
                  {log.time_in ? formatTimeProfessional(log.time_in) : '--:--'}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '18px' }}>
                  {log.start_break ? formatTimeProfessional(log.start_break) : ''}
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '18px' }}>
                  {log.end_break ? formatTimeProfessional(log.end_break) : ''}
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '18px' }}>
                  {log.time_out ? formatTimeProfessional(log.time_out) : ''}
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '18px' }}>
                  {log.work_hours} hrs
                </td>

                  {/* <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '18px' }}>
                  {log.overtime} hrs
                </td> */}

              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
};

const AttendanceUserTimesheet = () => {
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
                  Weekly Timesheet
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
                <Typography variant="h5" color="black" sx={{ mb: 1 }}>
                  Employee: {employeeData.first_name} {employeeData.last_name}
                </Typography>
                <Typography variant="h5" color="black" sx={{ mb: 1 }}>
                  Department: {employeeData.department}
                </Typography>
                <Typography variant="h5" color="black" sx={{ mb: 1 }}>
                  Schedule: {formatTimeProfessional(employeeData.time_in)} - {formatTimeProfessional(employeeData.time_out)}
                </Typography>
                 <Typography variant="h5" color="black" sx={{ mb: 2 }}>
                  Employee Status: {employeeData?.employment_type}
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
                {/* <Typography variant="h3" color="primary" sx={{ mb: 2 }}>
                  Attendance Overview for {employeeData.first_name} {employeeData.last_name}
                </Typography> */}
                
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
      </Box>  
    </SideNavBar>
  );
};

export default AttendanceUserTimesheet;