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
  TableContainer,
  TextField,
  InputAdornment
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
  Error as ErrorIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import SideNavBar from "../../content_page/sidebar";
import { useNavigate } from "react-router-dom";

// Utility function to get current Philippine date (UTC+8)
const getCurrentPhilippineDate = () => {
  const now = new Date();
  // Convert to PHT (UTC+8)
  const phtOffset = 8 * 60 * 60 * 1000;
  const phtTime = new Date(now.getTime() + phtOffset);
  return new Date(phtTime.toISOString().split('T')[0]);
};

// Status Badge Component
const StatusBadge = ({ status, isDuration = false }) => {
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
      fontSize: '0.95em',
      fontWeight: '600',
      textTransform: isDuration ? 'none' : 'capitalize',
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

// Convert date type 
const formatDisplayDate = (dateString) => {
  if (!dateString) return '--';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

//Convert time to AM / PM
const formatTimeToAMPM = (timeString) => {
  if (!timeString) return '--:--';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hour12}:${minutes} ${period}`;
  } catch (e) {
    console.error('Error formatting time:', e);
    return timeString;
  }
};

const formatBreakDuration = (durationMinutes) => {
  if (durationMinutes === null || durationMinutes === undefined) return '--';
  
  try {
    const duration = parseInt(durationMinutes, 10);
    
    if (isNaN(duration)) return '0 mins';
    
    if (duration > 59) {
      const hours = Math.floor(duration / 60);
      return `${hours} ${hours !== 1 ? 'hours' : 'hour'}`;
    }
    
    return `${duration} ${duration !== 1 ? 'mins' : 'min'}`;
  } catch (e) {
    console.error('Error formatting break duration:', e);
    return durationMinutes;
  }
};

// Main Table Component with Joined Data
const DailyAttendanceTable = ({ 
  employeeData, 
  logsData, 
  loading, 
  error, 
  onViewClick 
}) => {
  const theme = useTheme();
  const isXLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const [clientData, setClientData] = useState({});
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState(null);

  // Function to generate initials from first and last name
  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0) : '';
    const lastInitial = lastName ? lastName.charAt(0) : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // Fetch client data for each employee
  useEffect(() => {
    const fetchClientData = async () => {
      const clientMap = {};
      const uniqueEmployeeIds = [...new Set(logsData.map(log => log.employee))];
      
      try {
        setClientLoading(true);
        setClientError(null);
        
        await Promise.all(uniqueEmployeeIds.map(async (employeeId) => {
          try {
            const response = await axios.get(
              `http://localhost:8000/api/attendance/employees/${employeeId}/assigned-clients/`
            );
            clientMap[employeeId] = response.data[0] || null;
          } catch (err) {
            console.error(`Error fetching client data for employee ${employeeId}:`, err);
            clientMap[employeeId] = null;
          }
        }));
        
        setClientData(clientMap);
      } catch (err) {
        console.error('Error fetching client data:', err);
        setClientError('Failed to load client assignments');
      } finally {
        setClientLoading(false);
      }
    };

    if (logsData && logsData.length > 0) {
      fetchClientData();
    }
  }, [logsData]);

  if (loading || clientLoading) return <div className="loading">Loading attendance data...</div>;
  if (error || clientError) return <div className="error">Error: {error || clientError}</div>;
  if (!logsData || logsData.length === 0) return <div className="no-data">No attendance records found</div>;

  return (
    <Box width="100%" overflow="auto" position="relative">
 
      
       <table style={{ 
        width: '100%',
        minWidth: '1200px',
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ 
           backgroundColor: '#00B4D8', color: 'white', textAlign: 'left'
          }}>
            <th scope="col" style={{ padding: '8px 12px', textAlign: 'left'}}>Date</th>
            <th scope="col" style={{ padding: '8px 12px', textAlign: 'left'}}>Employee</th>
            <th scope="col" style={{ padding: '8px 12px', textAlign: 'left' }}>Client</th>
            <th scope="col" style={{ padding: '8px 12px'}}>Time In/Out</th>
            <th scope="col" style={{ padding: '8px 12px'}}>Break</th>
            <th scope="col" style={{ padding: '8px 12px'}}>Status</th>
            <th scope="col" style={{ padding: '8px 12px'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {logsData
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((log) => {
              const employee = log.employee_details || {};
              const initials = getInitials(employee.first_name, employee.last_name);
              const fullName = employee.first_name && employee.last_name 
                ? `${employee.first_name} ${employee.last_name}`
                : 'Unknown';
              
              const client = clientData[log.employee] || {};
              const clientInitials = getInitials(client.name);
              const clientName = client.name || 'Not assigned';
              const clientEmail = employee?.time_in && employee?.time_out 
                ? `${formatTimeToAMPM(employee?.time_in)} - ${formatTimeToAMPM(employee?.time_out)}` 
                : '';

              return (
                <tr key={log.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  {/* Date Column */}
                  <td data-title="Date" style={{ 
                    padding: '8px 12px',
                    textAlign: 'left',
                    whiteSpace: 'nowrap'
                  }}>
                    {log.date ? formatDisplayDate(log.date) : "No date"}
                  </td>

                  {/* Employee Column */}
                  <td data-title="Employee" style={{ 
                    padding: '8px 12px',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: '#1976d2', 
                          width: 28, 
                          height: 28, 
                          fontSize: 12,
                          color: 'white'
                        }}
                      >
                        {initials || 'NA'}
                      </Avatar>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 100 }}>{fullName}</div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                          {employee.department || ''} / {employee.team || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Client Column */}
                  <td data-title="Client" style={{ 
                    padding: '8px 12px',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: client.avatarColor || (clientName === 'Not assigned' ? '#9e9e9e' : '#3f51b5'),
                          width: 28, 
                          height: 28, 
                          fontSize: 12,
                          color: 'white'
                        }}
                      >
                        {clientInitials}
                      </Avatar>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          fontWeight: 'normal',
                          color: clientName === 'Not assigned' ? '#757575' : 'inherit'
                        }}>
                          {clientName}
                          {clientName === 'Not assigned' && (
                            <Tooltip title="This employee is not assigned to any client" arrow>
                              <span style={{ marginLeft: '4px', color: '#f44336' }}>*</span>
                            </Tooltip>
                          )}
                        </div>
                        {clientEmail && (
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>
                            {clientEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Time In/Out Column */}
                  <td data-title="Time In/Out" style={{ 
                    padding: '8px 12px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClockIcon fontSize="small" color="action" />
                        <span style={{ fontSize: '0.8rem' }}>
                          {log.time_in ? formatTimeProfessional(log.time_in) : '--:--'}
                        </span>
                        {log.time_in_status && (
                          <StatusBadge status={log.time_in_status} />
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <OvertimeIcon fontSize="small" color="action" />
                        <span style={{ fontSize: '0.8rem' }}>
                          {log.time_out ? formatTimeProfessional(log.time_out) : '--:--'}
                        </span>
                        {log.time_out_status && (
                          <StatusBadge status={log.time_out_status} />
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td data-title="Break" style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClockIcon fontSize="small" color="action" />
                        <span style={{ fontSize: '0.8rem' }}>
                          {log.start_break ? formatTimeProfessional(log.start_break) : '--:--'}
                        </span>
                        {log.start_break && (
                          <StatusBadge status={formatBreakDuration(log.break_duration)} isDuration />
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <OvertimeIcon fontSize="small" color="action" />
                        <span style={{ fontSize: '0.8rem' }}>
                          {log.end_break ? formatTimeProfessional(log.end_break) : '--:--'}
                        </span>
                        {log.end_break && (
                          <StatusBadge status={log.break_status} />
                        )}
                      </div>
                    </div> 
                  </td>

                  {/* Status Column */}
                  <td data-title="Status" style={{ 
                    padding: '8px 12px',
                    textAlign: 'center'
                  }}>
                    <StatusBadge status={log.status || 'Absent'} />
                  </td>
                  
                  {/* Actions Column */}
                  <td data-title="Actions" style={{ 
                    padding: '8px 12px',
                    textAlign: 'center'
                  }}>
                    <IconButton 
                      size="small"  
                      color="primary" 
                      sx={{ '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.1)' } }}
                      title="View Details"
                      onClick={() => onViewClick({ employee: employee, log })}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </Box>
  );
};

const AttendanceAdminLogs = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [logsData, setLogsData] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [overviewPage, setOverviewPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;
  
  const navigate = useNavigate();
    const isAdmin = () => {
          const employeeData = localStorage.getItem("employee");
          if (employeeData) {
            const employee = JSON.parse(employeeData);
            return employee.is_admin === 1 || employee.is_admin === true || employee.is_admin === "1";
          }
          return false;
        };
      
        // Redirect if not admin
        useEffect(() => {
          if (!isAdmin()) {
            navigate('/authentication/sign-in/');
          } 
    }, [navigate]);

  // Filter data based on current Philippine time and search term
  const filterData = (data) => {
    let filtered = [...data];
    
    // Get current Philippine date
    const currentDate = getCurrentPhilippineDate();
    
    // Group logs by employee and keep only the latest log for each
    const employeeLogsMap = {};
    
    filtered.forEach(log => {
      const logDate = new Date(log.date);
      const employeeId = log.employee;
      
      // If we don't have a log for this employee yet, or this log is newer
      if (!employeeLogsMap[employeeId] || 
          new Date(employeeLogsMap[employeeId].date) < logDate) {
        employeeLogsMap[employeeId] = log;
      }
    });
    
    // Convert back to array
    filtered = Object.values(employeeLogsMap);
    
    // Filter to show only logs from today or incomplete logs from yesterday
    filtered = filtered.filter(log => {
      const logDate = new Date(log.date);
      const isToday = logDate.toDateString() === currentDate.toDateString();
      const isYesterday = new Date(logDate.getTime() + 86400000).toDateString() === currentDate.toDateString();
      
      // Show if:
      // 1. It's from today, OR
      // 2. It's from yesterday and has time_in but no time_out
      return isToday || (isYesterday && log.time_in && !log.time_out);
    });
    
    // Apply search term filter if needed
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log => {
        if (!log.employee_details) return false;
        
        const firstName = log.employee_details.first_name?.toLowerCase() || '';
        const lastName = log.employee_details.last_name?.toLowerCase() || '';
        const email = log.employee_details.email?.toLowerCase() || '';
        
        return (
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          email.includes(searchLower) ||
          `${firstName} ${lastName}`.includes(searchLower) ||
          `${lastName} ${firstName}`.includes(searchLower)
        );
      });
    }
    
    return filtered;
  };

  const filteredData = filterData(logsData);

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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setOverviewPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all employees and logs
        const [employeesRes, logsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/attendance/employees/'),
          axios.get('http://localhost:8000/api/attendance/logs/')
        ]);

        const employees = employeesRes.data;
        const rawLogs = logsRes.data;
        const logs = Array.isArray(rawLogs) ? rawLogs : rawLogs.results || rawLogs.logs || [];

        // Create employee map for quick lookup
        const employeeMap = {};
        employees.forEach(emp => {
          employeeMap[emp.id] = emp;
        });

        // Join logs with employee data
        const joinedData = logs.map(log => {
          const emp = employeeMap[log.employee];
          return {
            ...log,
            employee_details: emp || null
          };
        });

        setAllEmployees(employees);
        setLogsData(joinedData);
        setError(null);
        
        // Set the first employee as default
        if (employees.length > 0) {
          setEmployeeData(employees[0]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to fetch data');
        setLogsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const exportToExcel = () => {
    const dataToExport = filteredData;
    if (!dataToExport.length) return;
  
    const excelData = dataToExport.map(log => ({
      'Date': formatDisplayDate(log.date),
      'Employee Name': log.employee_details ? `${log.employee_details.first_name} ${log.employee_details.last_name}` : 'Unknown',
      'Time In': formatTimeProfessional(log.time_in),
      'Time In Status': log.time_in_status || '',
      'Break Start': formatTimeProfessional(log.start_break),
      'Break End': formatTimeProfessional(log.end_break),
      'Break Status': log.start_break ? 'Taken' : 'Missed',
      'Break Duration': `${log.break_duration} mins`,
      'Time Out': formatTimeProfessional(log.time_out),
      'Time Out Status': log.time_out_status || '',
      'Status': log.status || 'Absent',
      'Undertime Hours': log.undertime_hours || '0',
      'Overtime Hours': formatMinutesToHours(log.overtime) || '0',
      'Make up Hours': log.make_up_hours || "0"
    }));
  
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    const colWidths = [
      { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
      { wch: 25 }
    ];
    ws['!cols'] = colWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Logs");
    
    const fileName = employeeData ? 
      `${employeeData.first_name}_${employeeData.last_name}_Attendance.xlsx` : 
      "Employee_Attendance.xlsx";
    
    XLSX.writeFile(wb, fileName);
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
      <Box sx={{ p: 2, mt: -12 }}>
        <Card sx={{ mb: 10, minHeight: 'calc(100vh - 64px)'}}>
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
          <CardContent sx={{ p: 1 }}>
            {tabValue === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" color="primary">
                    Employee Logs
                  </Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      sx: { fontSize: '0.8rem' }
                    }}
                    sx={{ width: '250px' }}
                  />
                </Box>
                
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

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadIcon fontSize="small" />}
                    onClick={exportToExcel}
                    disabled={!logsData.length}
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Export Excel
                  </Button>
                </Box>
                   
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" color="primary" sx={{ fontSize: '1.4rem' }}>
                    Overview Logs
                  </Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      sx: { fontSize: '0.8rem' }
                    }}
                    sx={{ width: '250px' }}
                  />
                  <Button
                   variant="contained"
                   color="success"
                   startIcon={<DownloadIcon fontSize="small" />}
                    onClick={exportToExcel}
                    disabled={!logsData.length}
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                   >
                  Export Excel
                </Button>
                </Box>
                
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
                
                <Box sx={{
                  width: '100%',
                  mt: 2,
                  overflowX: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '& .container': {
                    minWidth: '100%',
                    margin: 0,
                    padding: 0
                  },
                  '& .responsive-table': {
                    minWidth: '100%', 
                    width: '100%'
                  }
                }}>
                  <DailyAttendanceTable 
                    employeeData={employeeData}
                    // Show all logs without filtering by date
                    logsData={searchTerm 
                      ? logsData.filter(log => {
                          if (!log.employee_details) return false;
                          const searchLower = searchTerm.toLowerCase();
                          const firstName = log.employee_details.first_name?.toLowerCase() || '';
                          const lastName = log.employee_details.last_name?.toLowerCase() || '';
                          const email = log.employee_details.email?.toLowerCase() || '';
                          return (
                            firstName.includes(searchLower) ||
                            lastName.includes(searchLower) ||
                            email.includes(searchLower) ||
                            `${firstName} ${lastName}`.includes(searchLower) ||
                            `${lastName} ${firstName}`.includes(searchLower)
                          );
                        })
                      : logsData
                    }
                    loading={loading}
                    error={error}
                    onViewClick={handleViewClick}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(
                      (searchTerm 
                        ? logsData.filter(log => {
                            if (!log.employee_details) return false;
                            const searchLower = searchTerm.toLowerCase();
                            const firstName = log.employee_details.first_name?.toLowerCase() || '';
                            const lastName = log.employee_details.last_name?.toLowerCase() || '';
                            const email = log.employee_details.email?.toLowerCase() || '';
                            return (
                              firstName.includes(searchLower) ||
                              lastName.includes(searchLower) ||
                              email.includes(searchLower) ||
                              `${firstName} ${lastName}`.includes(searchLower) ||
                              `${lastName} ${firstName}`.includes(searchLower)
                            );
                          }).length 
                        : logsData.length) / itemsPerPage
                    )}
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
      </Box>  
    </SideNavBar>
  );
};

export default AttendanceAdminLogs;