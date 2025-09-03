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
  InputAdornment,
  Checkbox,
  FormControlLabel
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
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'api/axios';
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
const StatusBadge = ({ status, isDuration, duration }) => {
  const getMatchedStyle = (statusText) => {
    if (isDuration) {
      return duration > 60 ? statusStyles.Overbreak : statusStyles.Break;
    }
    if (statusText.includes("Early") || statusText.includes("early")) return statusStyles.Early;
    if (statusText.includes("Late") || statusText.includes("late")) return statusStyles.Late;
    if (statusText.includes("Undertime") || statusText.includes("undertime")) return statusStyles.Undertime;
    if (statusText.includes("Overtime") || statusText.includes("overtime")) return statusStyles.Overtime;
    if (statusText.includes("Overbreak") || statusText.includes("overbreak")) return statusStyles.Overbreak;
    if (statusText.includes("On Time") || statusText.includes("on time")) return statusStyles.OnTime;
    if (statusText.includes("Paid Leave") || statusText.includes("paid leave")) return statusStyles.paidLeave;
    if (statusText.includes("Completed") || statusText.includes("completed")) return statusStyles.Completed;
    if(statusText.includes("Present") || statusText.includes("present")) return statusStyles.Present;
    return statusStyles[statusText];
  };

  const statusStyles = {
    Active: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Inactive: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Leave: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    Floating: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    Present: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Completed: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Working: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Overtime: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Late: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    Undertime: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    Absent: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Taken: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Missed: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Overbreak: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Early: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    OnTime: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    paidLeave: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Break: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' }, 
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
    month: 'long',
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
    if (isNaN(duration)) return '0m';

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    let result = '';
    if (hours > 0) result += `${hours}h`;
    if (minutes > 0) result += ` ${minutes}m`;

    return result.trim() || '0m';
  } catch (e) {
    console.error('Error formatting break duration:', e);
    return durationMinutes;
  }
};

// Status Filter Modal Component
const StatusFilterModal = ({ open, onClose, statusFilters, onFilterChange }) => {
  const statusOptions = [
    { value: 'Present', label: 'Present' },
    { value: 'Late', label: 'Late' },
    { value: 'Absent', label: 'Absent' },
    { value: 'Leave', label: 'Leave' },
    { value: 'Floating', label: 'Floating' },
    { value: 'Undertime', label: 'Undertime' },
    { value: 'Overtime', label: 'Overtime' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filter by Status</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
          {statusOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={statusFilters[option.value] || false}
                  onChange={() => onFilterChange(option.value)}
                  color="primary"
                />
              }
              label={option.label}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
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
  const [clientData, setClientData] = useState({});
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState(null);

  // Function to generate initials from first and last name
  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0) : '';
    const lastInitial = lastName ? lastName.charAt(0) : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const getInitialClientName = (fullName) => {
    if (!fullName) return '?';
    const nameParts = fullName.trim().split(' ');
    const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || '';
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}` || '?';
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
              `/attendance/employees/${employeeId}/assigned-clients/`
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
            <th scope="col" style={{ padding: '8px 12px', textAlign: 'left', fontSize: '1.1rem'}}>Information</th>
            <th scope="col" style={{ padding: '8px 12px', fontSize: '1.1rem'}}>Status</th>
            <th scope="col" style={{ padding: '8px 12px', fontSize: '1.1rem'}}>Time In/Out</th>
            <th scope="col" style={{ padding: '8px 12px', fontSize: '1.1rem'}}>Break</th>
            <th scope="col" style={{ padding: '8px 12px', fontSize: '1.1rem'}}>Work Hours</th>
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
              const clientInitials = getInitialClientName(client.name);
              const clientName = client.name || 'Not assigned';
              const clientEmail = employee?.time_in && employee?.time_out 
                ? `${formatTimeToAMPM(employee?.time_in)} - ${formatTimeToAMPM(employee?.time_out)}` 
                : '';

              return (
                <tr key={log.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  {/* Information Column */}
                <td 
                    data-title="Date" 
                    style={{ 
                      padding: '8px 12px',
                      textAlign: 'left',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                      {log.date ? formatDisplayDate(log.date) : "No date"}
                    </span>
                    
                    <div>
                      VA: {employee.first_name} {employee.last_name}
                    </div>
                    <div>
                      Client: {clientName}
                    </div>
                    <div>
                      Task Id: {log.transaction_id}
                    </div>
                  </td>

                   {/* Status Column */}
                  <td data-title="Status" style={{ 
                    padding: '8px 12px', fontSize: '0.7rem', whiteSpace: 'nowrap'
                  }}>
                    <StatusBadge status={log.status || 'Absent'} />
                  </td>

                  {/* Time In/Out Column */}
                  <td data-title="Time In/Out" style={{ 
                      padding: '8px 12px', whiteSpace: 'nowrap'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ClockIcon fontSize="medium" color="action" />
                          <span 
                            style={{ 
                              fontSize: '1rem', 
                              color: log.time_in_status?.includes('Late') ? 'red' : 'inherit' 
                            }}
                          >
                            {log.time_in ? formatTimeProfessional(log.time_in) : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <OvertimeIcon fontSize="medium" color="action" />
                          <span 
                            style={{ 
                              fontSize: '1rem', 
                              color: log.time_out_status?.includes('Overtime') ? 'red' : 'inherit' 
                            }}
                          >
                            {log.time_out ? formatTimeProfessional(log.time_out) : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Start Break/End Break */}
                    <td data-title="Break" style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ClockIcon fontSize="medium" color="action" />
                          <span style={{ fontSize: '1rem' }}>
                            {log.start_break ? formatTimeProfessional(log.start_break) : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <OvertimeIcon fontSize="medium" color="action" />
                          <span 
                            style={{ 
                              fontSize: '1rem', 
                              color: (log.break_status?.startsWith('Overbreak') || log.break_duration > 60) 
                                ? 'red' 
                                : 'inherit' 
                            }}
                          >
                            {log.end_break ? formatTimeProfessional(log.end_break) : ''}
                          </span>
                        </div>
                      </div> 
</td>

                  {/* Work Hours */}
                    <td data-title="Break" style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClockIcon fontSize="medium" color="action" />
                        <span style={{ fontSize: '1rem' }}>
                          {log?.work_hours || '0'}
                        </span>
                      </div>
                      {/* <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <OvertimeIcon fontSize="medium" color="action" />
                        <span style={{ fontSize: '1rem' }}>
                          {log.end_break ? formatTimeProfessional(log.end_break) : ''}
                        </span>
                        {log.end_break && (
                          <StatusBadge status={log.break_status} />
                        )}
                      </div> */}
                    </div> 
                  </td>

                </tr>
              );
            })}
        </tbody>
      </table>
    </Box>
  );
};

const AttendanceAdminActivities = () => {
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
  const [statusFilters, setStatusFilters] = useState({
    Present: true,
    Late: true,
    Absent: true,
    Leave: true,
    Floating: true,
    Undertime: true,
    Overtime: true,
  });
  const [filterModalOpen, setFilterModalOpen] = useState(false);
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

  // Filter data based on current Philippine time, search term, and status filters
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
    
    // Apply status filters
    filtered = filtered.filter(log => {
      if (!log.status) return false;
      
      if (log.status === 'Present' && !statusFilters.Present) return false;
      if (log.status === 'Leave' && !statusFilters.Leave) return false;
      if (log.status === 'Floating' && !statusFilters.Floating) return false;
      if (log.status === 'Absent' && !statusFilters.Absent) return false;
      
      // Check time statuses
      if (log.time_in_status === 'Late' && !statusFilters.Late) return false;
      if (log.time_out_status === 'Undertime' && !statusFilters.Undertime) return false;
      if (log.overtime && log.overtime > 0 && !statusFilters.Overtime) return false;
      
      return true;
    });
    
    return filtered;
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilters(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
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
  }, [searchTerm, statusFilters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all employees and logs
        const [employeesRes, logsRes] = await Promise.all([
          axios.get('/attendance/employees/'),
          axios.get('/attendance/logs/')
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
    if (isNaN(mins)) return '0h 0m';
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };
  
  const calculateStats = (data) => {
    const lateCount = data.filter(log => log.time_in_status === 'Late').length;
    const undertimeCount = data.filter(log => log.time_out_status === 'Undertime').length;
    const overtimeCount = data.filter(log => log.overtime && parseFloat(log.overtime) > 0).length;
    const presentCount = data.filter(log => log.status === 'Present').length;
    const leaveCount = data.filter(log => log.status === 'Leave').length;
    const floatingCount = data.filter(log => log.status === 'Floating').length;
    const absentCount = data.length - presentCount - leaveCount - floatingCount;
    
    const totalUndertime = data.reduce((total, log) => {
      if (log.time_out_status === 'Undertime' && log.undertime_hours) {
        return total + (parseFloat(log.undertime_hours) || 0);
      }
      return total;
    }, 0);
    
    const totalOvertimeMinutes = data.reduce((total, log) => {
      const mins = parseFloat(log.overtime) || 0;
      return total + mins;
    }, 0);

    const totalMakeupHours = data.reduce((total, log) => {
      if (log.make_up_hours) {
        return total + (parseFloat(log.make_up_hours) || 0);
      }
      return total;
    }, 0);

    // Calculate percentages safely
    const safePercentage = (numerator, denominator) => {
      return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;
    };

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
      presentPercentage: safePercentage(presentCount, data.length),
      leavePercentage: safePercentage(leaveCount, data.length),
      floatingPercentage: safePercentage(floatingCount, data.length),
      absentPercentage: safePercentage(absentCount, data.length),
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
      'Break Duration': `${log.break_duration || 0} mins`,
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
        <Card sx={{ mb: 10, minHeight: 'calc(104vh - 64px)'}}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ 
              '& .MuiTabs-indicator': { height: 3 },
              '& .MuiTab-root': { minHeight: 48, fontSize: '0.8rem' }
            }}
          >
            <Tab label={
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 400 }}>Attendance Logs</Typography>
            }
            icon={<TodayIcon fontSize="medium" />}
            iconPosition="start"
            />
            <Tab
              label={
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 400, color: 'black !important' }}>
                  Overview
                </Typography>
              }
              icon={<DateRangeIcon fontSize="medium" />}
              iconPosition="start"
            />
          </Tabs>
          <CardContent sx={{ p: 1 }}>
            {tabValue === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h3" color="primary">
                    Activities History
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
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
                      variant="outlined"
                      startIcon={<FilterListIcon />}
                      onClick={() => setFilterModalOpen(true)}
                      size="small"
                    >
                      Filter
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
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
                    label={`${stats.absent} Absent`}
                    color="error" 
                    variant="outlined" 
                    icon={<AbsentIcon fontSize="small" />} 
                    size="small"
                    sx={{ fontSize: '1.2rem' }}
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
                  <Typography variant="h3" color="primary">
                    Overview Logs
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
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
                          {stats.present} ({stats.presentPercentage}%)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Leaves:</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#FFA000' }}>
                          {stats.leave} ({stats.leavePercentage}%)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Floating Holidays:</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#FFA000' }}>
                          {stats.floating} ({stats.floatingPercentage}%)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Absent:</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#F44336' }}>
                          {stats.absent} ({stats.absentPercentage}%)
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

        {/* Status Filter Modal */}
        <StatusFilterModal
          open={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          statusFilters={statusFilters}
          onFilterChange={handleStatusFilterChange}
        />

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
                    <Typography sx={{ fontSize: '0.75rem' }}>Overtime: {formatMinutesToHours(selectedLog.log.overtime)}</Typography>
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

export default AttendanceAdminActivities;