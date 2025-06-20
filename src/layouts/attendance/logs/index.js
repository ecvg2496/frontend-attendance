import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Avatar,
  Box, 
  Typography, 
  Paper, 
  Tab, 
  Tabs, 
  Card, 
  CardContent,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Pagination,
  useTheme,
  useMediaQuery,
  TableContainer
} from '@mui/material';
import { 
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Person as PersonIcon,
  CheckCircle as PresentIcon,
  Schedule as LateIcon,
  Cancel as AbsentIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Event as DateIcon,
  AccessTime as ClockIcon,
  Timer as OvertimeIcon,
  HourglassEmpty as UndertimeIcon,
  WorkOff as LeaveIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import '../content_page/css/admintable.css';
import SideNavBar from "../content_page/nav_bar";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    Active: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Inactive: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Leave: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    Floating: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    Present: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Working: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Late: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    Undertime: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    Absent : { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Taken: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Missed: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' }
  };

  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: '10px',
      fontSize: '0.7em',
      fontWeight: '600',
      textTransform: 'capitalize',
      ...statusStyles[status] || { background: '#e0e0e0' }
    }}>
      {status}
    </span>
  );
};

// Time Formatter Component
const formatTimeProfessional = (timeString) => {
  if (!timeString) return '--:--';
  
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

//Convert date type 
const formatDisplayDate = (dateString) => {
  if (!dateString) return '--';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Main Table Component with Joined Data
const DailyAttendanceTable = ({ employeeData, logsData, loading, error, onViewClick }) => {
  const theme = useTheme();
  const isXLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

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

  // Enhanced responsive styles
  // const styles = {
  //   container: {
  //     width: '100%',
  //     overflow: 'auto',
  //     maxHeight: 'calc(100vh - 300px)',
  //   },
  //   table: {
  //     width: '100%',
  //     minWidth: isXLargeScreen ? '100%' : (isLargeScreen ? '1200px' : '1100px'),
  //     tableLayout: 'auto',
  //     fontSize: '0.75rem'
  //   },
  //   header: {
  //     position: 'sticky',
  //     top: 0,
  //     zIndex: 1,
  //     backgroundColor: '#2E7D32',
  //     color: 'white',
  //     fontSize: '0.85rem',
  //     '& th': {
  //       padding: '6px 8px',
  //       whiteSpace: 'nowrap'
  //     }
  //   },
  //   cell: {
  //     padding: '6px 8px',
  //     fontSize: '0.8rem'
  //   },
  //   employeeCell: {
  //     minWidth: '180px',
  //     textAlign: 'left'
  //   },
  //   avatar: {
  //     width: 28,
  //     height: 28,
  //     marginRight: 1
  //   }
  // };

  return (
      <table style={{ 
          width: '100%',
          minWidth: '1200px',
          borderCollapse: 'collapse',
          fontSize: '0.875rem'
        }}>
        <thead>
          <tr style={{backgroundColor: '#00B4D8', color: 'white', textAlign: 'left'}}>
            <th style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>Date</th>
            <th style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>Status</th>
            <th style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>Time In</th>
            <th style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>Status</th>
            <th style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>Break</th>
            <th style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>Duration</th>
            <th style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>Time Out</th>
            <th style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>Status</th>
            <th style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {logsData.map((log) => {
            const breakStatus = log.start_break ? 'Taken' : 'Missed';
            
            return (
              <tr key={log.id}>
                <td style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <DateIcon fontSize="small" color="action" />
                    {log.date ? formatDisplayDate(log.date) : "--"}
                  </Box>
                </td>
                    
                <td style={{ ...{padding: '12px 16px', whiteSpace: 'nowrap'}, textAlign: 'center' }}>
                  <StatusBadge status={log.status || 'Absent'} />
                </td>

                <td style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>
                  {log.time_in ? formatTimeProfessional(log.time_in) : '--:--'}
                </td>
                <td style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {log.time_in_status}
                  </Box>
                </td>

                <td style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>
                  {log.start_break ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                      <span>{formatTimeProfessional(log.start_break)}</span>
                    </Box>
                  ) : '--:--'}
                  <div>
                  {log.start_break ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                      <span>{formatTimeProfessional(log.end_break)}</span>
                    </Box>
                  ) : '--:--'}
                  </div>
                </td>
                <td style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>
                  {log.break_duration ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                      <span>{formatTimeProfessional(log.start_break)}</span>
                    </Box>
                  ) : '--:--'}
                </td>
             
                <td style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>
                  {log.time_out ? formatTimeProfessional(log.time_out) : '--:--'}
                </td>
                <td style={{padding: '12px 16px', whiteSpace: 'nowrap'}}>
                  {log.time_out_status || '--:--'}
                </td>
                
                <td style={{ ...{padding: '12px 16px', whiteSpace: 'nowrap'}, textAlign: 'center' }}>
                  <Tooltip title="View Details">
                    <IconButton 
                      color="primary" 
                      onClick={() => onViewClick({ employee: employeeData, log })}
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
  const itemsPerPage = 5;

  // Disable future dates
  const disableFutureDates = (date) => {
    return date > new Date();
  };

  // Handle date change with validation
  const handleDateChange = (type, newValue) => {
    const newDateRange = {...dateRange, [type]: newValue};
    setDateRange(newDateRange);
    
    // Validate date range
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
      
      if (dateRange.startDate && !dateRange.endDate) {
        return logDate >= dateRange.startDate;
      }
      
      if (!dateRange.startDate && dateRange.endDate) {
        return logDate <= dateRange.endDate;
      }
      
      if (dateRange.startDate && dateRange.endDate) {
        return logDate >= dateRange.startDate && logDate <= dateRange.endDate;
      }
      
      return true;
    });
  };

  const filteredData = filterByDateRange(logsData);

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
        
        const logsRes = await axios.get(`http://localhost:8000/api/attendance/logs/?employee_id=${emp.id}`);
        
        if (!logsRes.data?.results) {
          throw new Error('Invalid logs data format');
        }
        
        setLogsData(logsRes.data.results);
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

  const formatMinutesToHours = (minutes) => {
    if (!minutes && minutes !== 0) return '--';
    const mins = parseFloat(minutes);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };
  
  const calculateStats = (data) => {
    const lateCount = data.filter(log => log.time_in_status === 'Late').length;
    const undertimeCount = data.filter(log => log.time_out_status === 'Undertime').length;
    const overtimeCount = data.filter(log => log.overtime && log.overtime > 0).length;
    const presentCount = data.filter(log => log.status === 'Present').length;
    const leaveCount = data.filter(log => log.status === 'Leave').length;
    const floatingCount = data.filter(log => log.status === 'Floating').length;
    const absentCount = data.length - presentCount - leaveCount - floatingCount;
    
    const totalUndertime = data.reduce((total, log) => {
      if (log.time_out_status === 'Undertime' && log.undertime_hours) {
        return total + parseFloat(log.undertime_hours);
      }
      return total;
    }, 0);
    
    const totalOvertimeMinutes = data.reduce((total, log) => {
      const mins = parseFloat(log.overtime) || 0;
      return total + mins;
    }, 0);

    const totalMakeupHours = data.reduce((total, log) => {
      if (log.make_up_hours) {
        return total + parseFloat(log.make_up_hours);
      }
      return total;
    }, 0);

    return {
      totalLogs: data.length,
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      leave: leaveCount,
      floating: floatingCount,
      undertime: undertimeCount,
      totalUndertimeHours: totalUndertime.toFixed(2),
      overtime: overtimeCount,
      totalOvertimeHours: (totalOvertimeMinutes / 60).toFixed(2),
      totalMakeupHours: totalMakeupHours.toFixed(2),
    };
  };

  const clearDateRange = () => {
    setDateRange({ startDate: null, endDate: null });
    setDateError(false);
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

  const stats = calculateStats(filteredData);

return (
  <SideNavBar>
    <Box sx={{ p: 2 }}>
      <Card sx={{ mb: 2, mt: -12, overflow: 'auto' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ 
            '& .MuiTabs-indicator': { height: 3 },
            '& .MuiTab-root': { minHeight: 48, fontSize: '0.8rem' }
          }}
        >
          <Tab label="Attendance Logs" icon={<TodayIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Overview" icon={<DateRangeIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
        <CardContent sx={{ p: 2 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 1, fontSize: '1.4rem' }}>
                {employeeData.first_name}'s Logs
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${stats.totalLogs} Records`}
                  color="info" 
                  variant="outlined" 
                  icon={<PersonIcon fontSize="small" />} 
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
                <Chip 
                  label={`${stats.present} Present`}
                  color="success" 
                  variant="outlined" 
                  icon={<PresentIcon fontSize="small" />} 
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
                <Chip 
                  label={`${stats.late} Late`}
                  color="warning" 
                  variant="outlined" 
                  icon={<LateIcon fontSize="small" />} 
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
                <Chip 
                  label={`${stats.absent} Absent`}
                  color="error" 
                  variant="outlined" 
                  icon={<AbsentIcon fontSize="small" />} 
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>

              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <DailyAttendanceTable 
                  employeeData={employeeData}
                  logsData={paginatedData}
                  loading={loading}
                  error={error}
                  onViewClick={handleViewClick}
                />
              </Box>

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
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontSize: '1.2rem' }}>
                Attendance Overview for {employeeData.first_name} {employeeData.last_name}
              </Typography>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
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
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', mb: 1 }}>Attendance Overview</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Total Records:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{stats.totalLogs}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Present:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#4CAF50' }}>
                        {stats.present} ({Math.round((stats.present / stats.totalLogs) * 100)}%)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Leaves:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#FFA000' }}>
                        {stats.leave} ({Math.round((stats.leave / stats.totalLogs) * 100)}%)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Floating Holidays:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#FFA000' }}>
                        {stats.floating} ({Math.round((stats.floating / stats.totalLogs) * 100)}%)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Absent:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#F44336' }}>
                        {stats.absent} ({Math.round((stats.absent / stats.totalLogs) * 100)}%)
                      </Typography>
                    </Box>
                  </Box>
                </Card>
                
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', mb: 1 }}>Time Compliance</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Late Arrivals:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#FFA000' }}>
                        {stats.late}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Undertime Days:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#FFA000' }}>
                        {stats.undertime}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Total Undertime:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {stats.totalUndertimeHours} hours
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Total Make Up Hours:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {stats.totalMakeupHours} hours
                      </Typography>
                    </Box>
                  </Box>
                </Card>
                
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', mb: 1 }}>Overtime</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Overtime Days:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#4CAF50' }}>
                        {stats.overtime}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Total Overtime:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {stats.totalOvertimeHours} hours
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>
              
              <Card sx={{ p: 2, mt: 2, overflow: 'auto' }}>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <DailyAttendanceTable 
                    employeeData={employeeData}
                    logsData={paginatedOverviewData}
                    loading={loading}
                    error={error}
                    onViewClick={handleViewClick}
                  />
                </Box>
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
              </Card>
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
            size="small"
            sx={{ fontSize: '0.7rem' }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>  
  </SideNavBar>
  );
};

export default AttendanceUserLogs;