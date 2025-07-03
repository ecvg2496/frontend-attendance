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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar
} from '@mui/material';
import { 
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircle as PresentIcon,
  Schedule as ScheduleIcon,
  Schedule as LateIcon,    
  Cancel as CancelIcon,
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
  Check as ApproveIcon,
  Close as RejectIcon
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
    Missed: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Pending: { background: 'linear-gradient(to right, #9E9E9E, #BDBDBD)', color: 'white' },
    Approved: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Rejected: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' }
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
  onViewClick,
  onApprove,
  onReject,
  isAdmin
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
      // Extract employee IDs properly
      const uniqueEmployeeIds = [...new Set(logsData.map(log => log.employee.id))];
      
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
    <div className="container" style={{ 
      width: '100%', 
      overflow: 'auto',
      maxHeight: 'calc(100vh - 300px)'
    }}>
      <table style={{ 
        width: '100%',
        minWidth: '1200px',
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ 
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: '#00B4D8',
            color: 'white',
            fontSize: '1rem'
          }}>
            <th scope="col" style={{ padding: '8px 12px', textAlign: 'left'}}>Date</th>
            <th scope="col" style={{ padding: '8px 12px', textAlign: 'left'}}>Employee</th>
            <th scope="col" style={{ padding: '8px 12px', textAlign: 'left' }}>Client</th>
            <th scope="col" style={{ padding: '8px 12px'}}>Time In/Out</th>
            <th scope="col" style={{ padding: '8px 12px'}}>Break</th>
            <th scope="col" style={{ padding: '8px 12px'}}>Status</th>
            <th scope="col" style={{ padding: '8px 12px'}}>Approval</th>
            <th scope="col" style={{ padding: '8px 12px'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {logsData
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((log) => {
              const employee = log.employee || {};
              const initials = employee.name ? 
                employee.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 
                'NA';
              const fullName = employee.name || 'Unknown';
              
              // Get client data using employee ID as key
              const client = clientData[log.employee.id] || {};
              const clientName = client.name || 'Not assigned';
              const clientInitials = clientName.split(' ').map(n => n[0]).join('').substring(0, 2);

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
                        {initials}
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
                          bgcolor: '#3f51b5',
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
                          color: '#757575'
                        }}>
                          {clientName}
                          {!client.client_name && (
                            <Tooltip title="This employee is not assigned to any client" arrow>
                              <span style={{ marginLeft: '4px', color: '#f44336' }}>*</span>
                            </Tooltip>
                          )}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                           {client.schedule_type || ''}
                        </div>
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
                  
                  {/* Break Column */}
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
                  
                  {/* Approval Status Column */}
                  <td data-title="Approval" style={{ 
                    padding: '8px 12px',
                    textAlign: 'center'
                  }}>
                    <StatusBadge status={log.processed_status || 'Pending'} />
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
                    
                    {isAdmin && (
                      <>
                        <IconButton 
                          size="small"  
                          color="success" 
                          sx={{ '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.1)' } }}
                          title="Approve"
                          onClick={() => onApprove(log.id)}
                        >
                          <ApproveIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"  
                          color="error" 
                          sx={{ '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' } }}
                          title="Reject"
                          onClick={() => onReject(log.id)}
                        >
                          <RejectIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

const AttendanceAdminLogs = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [logsData, setLogsData] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const itemsPerPage = 10;
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
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

  // Filter data based on search term and approval status
  const filterData = (data) => {
    let filtered = [...data];
    
    // Apply search term filter
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
    
    // Apply approval status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(log => {
        if (filterStatus === 'pending') return !log.processed_status;
        return log.processed_status === filterStatus;
      });
    }
    
    return filtered;
  };

  const filteredData = filterData(logsData);

  // Paginate the data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);
  
  const handleViewClick = (data) => {
    setSelectedLog(data);
    setOpenModal(true);
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

    // Approval stats
    const pendingCount = data.filter(log => !log.processed_status).length;
    const approvedCount = data.filter(log => log.processed_status === 'Approved').length;
    const rejectedCount = data.filter(log => log.processed_status === 'Rejected').length;

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
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
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
      'Approval Status': log.processed_status || 'Pending',
      'Undertime Hours': log.undertime_hours || '0',
      'Overtime Hours': formatMinutesToHours(log.overtime) || '0',
      'Make up Hours': log.make_up_hours || "0"
    }));
  
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    const colWidths = [
      { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 25 }
    ];
    ws['!cols'] = colWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Logs");
    
    const fileName = employeeData ? 
      `${employeeData.first_name}_${employeeData.last_name}_Attendance.xlsx` : 
      "Employee_Attendance.xlsx";
    
    XLSX.writeFile(wb, fileName);
  };
  useEffect(() => {
  fetchPendingLogs();
  }, []);
 const fetchPendingLogs = async () => {
  try {
    setLoading(true);
    
    // Fetch pending logs and employees in parallel
    const [logsRes, employeesRes] = await Promise.all([
      axios.get('http://localhost:8000/api/attendance/logs/pending/'),
      axios.get('http://localhost:8000/api/attendance/employees/')
    ]);

    const logs = Array.isArray(logsRes.data) ? logsRes.data : logsRes.data.results || logsRes.data.logs || [];
    const employees = employeesRes.data;

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
    
    // Set the first employee as default if needed
    if (employees.length > 0 && !employeeData) {
      setEmployeeData(employees[0]);
    }
  } catch (err) {
    console.error('Error fetching pending logs:', err);
    setError(err.message || 'Failed to fetch pending logs');
  } finally {
    setLoading(false);
  }
  };
  const handleApprove = async (logId) => {
  try {
    setLoading(true);
    const employeeData = JSON.parse(localStorage.getItem("employee"));
    
    // Prepare the request data
    const requestData = {
      remarks: prompt("Enter approval remarks (optional):") || "",
    };

    const response = await axios.patch(
      `http://localhost:8000/api/attendance/logs/approve/${logId}/`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'success') {
      // Update the local state to reflect approval
      setLogsData(prevLogs => 
        prevLogs.map(log => 
          log.id === logId ? { 
            ...log, 
            processed_status: 'Approved',
            processed_by: `${employeeData.first_name} ${employeeData.last_name}`,
            processed_at: new Date().toISOString(),
            remarks: requestData.remarks
          } : log
        )
      );

      // Show success notification
      setSnackbar({
        open: true,
        message: `Approved! Timesheet ID: ${response.data.timesheet_id}`
      });
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        message={snackbar.message}
      />
      // Optional: Refresh the pending logs list
      fetchPendingLogs();
    } else {
      throw new Error(response.data.message || 'Approval failed');
    }
  } catch (err) {
    console.error('Error approving log:', err);
    alert(`Approval failed: ${err.response?.data?.message || err.message}`);
  } finally {
    setLoading(false);
  }
  };

  const handleReject = async (logId) => {
    try {
      setLoading(true);
      const employeeData = JSON.parse(localStorage.getItem("employee"));
      
      const response = await axios.patch(
        `http://localhost:8000/api/attendance/logs/reject/${logId}/`,
        {
          processed_by: `${employeeData.first_name} ${employeeData.last_name}`,
          processed_status: 'Rejected'
        }
      );
      
      // Update the local state
      setLogsData(prevLogs => 
        prevLogs.map(log => 
          log.id === logId ? { ...log, processed_status: 'Rejected' } : log
        )
      );
      
    } catch (err) {
      console.error('Error rejecting log:', err);
      setError(err.message || 'Failed to reject log');
    } finally {
      setLoading(false);
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

  const stats = calculateStats(filteredData);

  return (
    <SideNavBar>
      <Box sx={{ p: 2, mt: -12 }}>
        <Card sx={{ mb: 10, minHeight: 'calc(100vh - 64px)'}}>
          <CardContent sx={{ p: 1 }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" color="primary">
                  Employee Attendance Logs
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
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
                  label={`${stats.pending} Pending`}
                  color="default" 
                  variant="outlined" 
                  icon={<ScheduleIcon fontSize="small" />} 
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
                <Chip 
                  label={`${stats.approved} Approved`}
                  color="success" 
                  variant="outlined" 
                  icon={<CheckCircleIcon fontSize="small" />} 
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
                <Chip 
                  label={`${stats.rejected} Rejected`}
                  color="error" 
                  variant="outlined" 
                  icon={<CancelIcon fontSize="small" />} 
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
                onApprove={handleApprove}
                onReject={handleReject}
                isAdmin={isAdmin()}
              />
            </Box>
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
                    <Typography sx={{ fontSize: '0.75rem' }}>Approval Status: <StatusBadge status={selectedLog.log.processed_status || 'Pending'} /></Typography>
                    {selectedLog.log.processed_by && (
                      <Typography sx={{ fontSize: '0.75rem' }}>Processed By: {selectedLog.log.processed_by}</Typography>
                    )}
                    {selectedLog.log.processed_at && (
                      <Typography sx={{ fontSize: '0.75rem' }}>Processed At: {new Date(selectedLog.log.processed_at).toLocaleString()}</Typography>
                    )}
                    {selectedLog.log.remarks && (
                      <Typography sx={{ fontSize: '0.75rem' }}>Remarks: {selectedLog.log.remarks}</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 1 }}>
            {isAdmin() && selectedLog?.log && !selectedLog.log.processed_status && (
              <>
                <Button 
                  onClick={() => {
                    handleApprove(selectedLog.log.id);
                    setOpenModal(false);
                  }} 
                  color="success"
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                  startIcon={<ApproveIcon />}
                >
                  Approve
                </Button>
                <Button 
                  onClick={() => {
                    handleReject(selectedLog.log.id);
                    setOpenModal(false);
                  }} 
                  color="error"
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                  startIcon={<RejectIcon />}
                >
                  Reject
                </Button>
              </>
            )}
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