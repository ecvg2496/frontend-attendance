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
  InputAdornment,
  TextField,
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
  Edit as EditIcon,
  AccessTime as ClockIcon,
  FreeBreakfast as BreakIcon,
  Timer as OvertimeIcon,
  Event as DateIcon,
  Work as JobIcon,
  Groups as TeamIcon,
  Download as DownloadIcon,
  HourglassEmpty as UndertimeIcon
} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import '../content_page/css/admintable.css';
import SideNavBar from "../content_page/sidebar";

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
      fontSize: '0.75em',
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
    
    const pmStyles = {
      background: 'linear-gradient(to right, #2c3e50, #4a6491)',
      color: '#ecf0f1',
      textShadow: '0 1px 1px rgba(0,0,0,0.3)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
    };
    const amStyles = {
      background: 'linear-gradient(to right, #f5f7fa, #e4e8f0)',
      color: '#2980b9',
      textShadow: '0 1px 1px rgba(255,255,255,0.8)',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
    };
    
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, marginRight: '2px' }}>
          {`${hour12}:${minutes}`}
        </span>
        <span style={{
          fontSize: '0.7em',
          padding: '2px 6px',
          borderRadius: '10px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          ...(isPM ? pmStyles : amStyles)
        }}>
          {isPM ? 'PM' : 'AM'}
        </span>
      </span>
    );
  } catch (e) {
    console.error('Error formatting time:', e);
    return timeString;
  }
};

const formatTimeForExcel = (timeString) => {
  if (!timeString) return '--:--';
  
  try {
    const time = new Date(`2000-01-01T${timeString}`);
    const hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const isPM = hours >= 12;
    const hour12 = hours % 12 || 12;
    
    return `${hour12}:${minutes} ${isPM ? 'PM' : 'AM'}`;
  } catch (e) {
    console.error('Error formatting time for Excel:', e);
    return timeString;
  }
};

//Convert date type 
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
  const theme = useTheme();
  const isXLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Box sx={{ p: 2 }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  if (!logsData || logsData.length === 0) return (
    <Box sx={{ p: 2 }}>
      <Alert severity="info">No attendance records found</Alert>
    </Box>
  );

  // Enhanced responsive styles
  const styles = {
    container: {
      width: '100%',
      overflow: 'auto',
      maxHeight: 'calc(100vh - 300px)',
    },
    table: {
      width: '100%',
      minWidth: isXLargeScreen ? '100%' : (isLargeScreen ? '1800px' : '1700px'),
      tableLayout: 'auto'
    },
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 1,
      backgroundColor: '#2E7D32',
      color: 'white',
      fontSize: isXLargeScreen ? '1.1rem' : '0.9rem',
      '& th': {
        padding: isXLargeScreen ? '16px 20px' : '12px 16px',
        whiteSpace: 'nowrap'
      }
    },
    cell: {
      padding: isXLargeScreen ? '14px 18px' : '12px 14px',
      fontSize: isXLargeScreen ? '0.95rem' : '0.85rem'
    },
    employeeCell: {
      minWidth: isXLargeScreen ? '220px' : '180px'
    },
    iconSize: isXLargeScreen ? 'medium' : 'small',
    avatar: {
      width: isXLargeScreen ? 40 : 32,
      height: isXLargeScreen ? 40 : 32,
      marginBottom: 1
    }
  };

  return (
    <TableContainer component={Paper} sx={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.header}>
            <th style={{ ...styles.cell, ...styles.employeeCell }}>Employee</th>
            <th style={styles.cell}>Date</th>
            <th style={styles.cell}>Job Details</th>
            <th style={styles.cell}>Schedule</th>
            <th style={styles.cell}>Actual Hours</th>
            <th style={styles.cell}>Work Hours</th>
            <th style={styles.cell}>Overtime</th>
            <th style={styles.cell}>Status</th>
            <th style={styles.cell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {logsData.map((log) => {
            const breakStatus = log.start_break ? 'Taken' : 'Missed';
            
            return (
              <tr key={log.id}>
                {/* Employee Info */}
                <th scope="row" style={{ ...styles.cell, ...styles.employeeCell, backgroundColor: '#f5f5f5' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar 
                      alt={`${employeeData.first_name} ${employeeData.last_name}`} 
                      src={employeeData.user_photo || '/default-avatar.png'}
                      sx={styles.avatar}
                    />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                        {`${employeeData.first_name} ${employeeData.last_name}`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                        {employeeData.email}
                      </Typography>
                    </Box>
                  </Box>
                </th>
                
                {/* Date */}
                <td style={styles.cell}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DateIcon fontSize={styles.iconSize} color="action" />
                    {log.date ? formatDisplayDate(log.date) : "No date"}
                  </Box>
                </td>
                
                {/* Job Details */}
                <td style={styles.cell}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <JobIcon fontSize={styles.iconSize} color="action" />
                      <Typography variant="body2">
                        {`${employeeData.type} (${employeeData.work_arrangement})`}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TeamIcon fontSize={styles.iconSize} color="action" />
                      <Typography variant="body2">
                        {`${employeeData.department} / ${employeeData.team}`}
                      </Typography>
                    </Box>
                  </Box>
                </td>
                
                {/* Scheduled Hours */}
                <td style={{ ...styles.cell, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    {formatTimeProfessional(employeeData.time_in)}
                    <span style={{ color: '#777' }}>-</span>
                    {formatTimeProfessional(employeeData.time_out)}
                  </Box>
                </td>

                <td style={{ ...styles.cell, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    {employeeData.contract_hours || 0}
                  </Box>
                </td>
                
                {/* Attendance Logs */}
                {/* <td style={styles.cell}>
                  {log.time_in ? formatTimeProfessional(log.time_in) : '--:--'}
                </td>
                
                <td style={styles.cell}>
                  {log.start_break ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <span>{formatTimeProfessional(log.start_break)}</span>
                      <span style={{ fontSize: '0.7em' }}>to</span>
                      <span>{formatTimeProfessional(log.end_break)}</span>
                      <StatusBadge status={breakStatus} />
                    </Box>
                  ) : '--:--'}
                </td>
                
                <td style={styles.cell}>
                  {log.time_out ? formatTimeProfessional(log.time_out) : '--:--'}
                </td> */}
                
                <td style={{ ...styles.cell, textAlign: 'center' }}>
                  <Chip 
                    icon={<ClockIcon fontSize={styles.iconSize} />}
                    label={`${log.work_hours || '--'}h`} 
                    variant="outlined"
                    color={log.work_hours >= employeeData.contract_hours ? 'success' : 'default'}
                    size="small"
                  />
                </td>
                
                <td style={{ ...styles.cell, textAlign: 'center' }}>
                  <Chip 
                    icon={<OvertimeIcon fontSize={styles.iconSize} />}
                    label={`${log.overtime || '0'}h`}
                    variant="outlined"
                    color={log.overtime > 0 ? 'warning' : 'default'}
                    size="small"
                  />
                </td>
                
                <td style={{ ...styles.cell, textAlign: 'center' }}>
                  <StatusBadge status={log.status || 'Absent'} />
                </td>
                
                <td style={{ ...styles.cell, textAlign: 'center' }}>
                  <Tooltip title="View Details">
                    <IconButton 
                      color="primary" 
                      onClick={() => onViewClick({ employee: employeeData, log })}
                      size="small"
                    >
                      <VisibilityIcon fontSize={styles.iconSize} />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableContainer>
  );
};

const AttendanceAdminTimesheet = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [logsData, setLogsData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter logs by date if needed
  const filteredData = logsData.filter(log => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const logDate = log.date ? formatDisplayDate(log.date).toLowerCase() : '';
    
    return (
      logDate.includes(searchLower) ||
      (log.status?.toLowerCase()?.includes(searchLower))
    );
  });

  // Paginate the filtered data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const exportToExcel = () => {
    if (!logsData.length) return;

    // Prepare the data for Excel
    const excelData = logsData.map(log => ({
      'Date': formatDisplayDate(log.date),
      'Employee Name': `${employeeData.first_name} ${employeeData.last_name}`,
      'Employment Type': `${employeeData.employment_type}`,
      'Job Type': `${employeeData.type} (${employeeData.work_arrangement})`,
      'Department/Team': `${employeeData.department} / ${employeeData.team}`,
      'Scheduled Hours': `${formatTimeForExcel(employeeData.time_in)} - ${formatTimeForExcel(employeeData.time_out)}`,
      'Contact Hours': `${employeeData.contract_hours || ''}`,    
      'Actual Hours': `${log.work_hours}`,
      'Overtime': `${log.overtime || '0'}h`,
      'Employment Status': log.status || 'Absent'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const colWidths = [
      { wch: 20 }, // Date
      { wch: 30 }, // Employee Name
      { wch: 25 }, // Job Type
      { wch: 25 }, // Department/Team
      { wch: 20 }, // Work Arrangement
      { wch: 20 }, // Scheduled Hours
      { wch: 12 }, // Time Out
      { wch: 12 }, // Work Hours
      { wch: 20 }, // Overtime
      { wch: 25 } 
    ];
    ws['!cols'] = colWidths;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Timesheet");
    
    // Generate file name
    const fileName = `${employeeData.first_name}_${employeeData.last_name}_Timesheet.xlsx`;
    
    // Export the file
    XLSX.writeFile(wb, fileName);
  };

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
        
        // Changed to use employee_id parameter for proper filtering
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

  const calculateStats = (data) => {
    const lateCount = data.filter(log => log.time_in_status === 'Late').length;
    const undertimeCount = data.filter(log => log.time_out_status === 'Undertime').length;
    const overtimeCount = data.filter(log => log.overtime && log.overtime > 0).length;
    const presentCount = data.filter(log => log.status === 'Present').length;
    const absentCount = data.length - presentCount;
    
    // Calculate total undertime hours (make up hours)
    const totalUndertime = data.reduce((total, log) => {
      if (log.time_out_status === 'Undertime' && log.undertime_hours) {
        return total + parseFloat(log.undertime_hours);
      }
      return total;
    }, 0);
    
    // Calculate total overtime hours
    const totalOvertime = data.reduce((total, log) => {
      if (log.overtime) {
        return total + parseFloat(log.overtime);
      }
      return total;
    }, 0);

    return {
      totalLogs: data.length,
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      undertime: undertimeCount,
      totalUndertimeHours: totalUndertime.toFixed(2),
      overtime: overtimeCount,
      totalOvertimeHours: totalOvertime.toFixed(2),
    };
  };

  if (!employeeData) {
    return (
      <SideNavBar>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </SideNavBar>
    );
  }

  const stats = calculateStats(logsData);

  return (
    <SideNavBar>
      <Box sx={{ p: 3 }}>
        <Card sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ '& .MuiTabs-indicator': { height: 4 } }}
          >
            <Tab label="Attendance Timesheet" icon={<TodayIcon />} iconPosition="start" sx={{ minHeight: 60 }} />
            <Tab label="Summary" icon={<DateRangeIcon />} iconPosition="start" sx={{ minHeight: 60 }} />
          </Tabs>
          <CardContent>
            {tabValue === 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  {employeeData.first_name}'s Timesheet History
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${stats.totalLogs} Records`}
                    color="info" 
                    variant="outlined" 
                    icon={<PersonIcon />} 
                  />
                  <Chip 
                    label={`${stats.present} Present`}
                    color="success" 
                    variant="outlined" 
                    icon={<PresentIcon />} 
                  />
                  <Chip 
                    label={`${stats.late} Late`}
                    color="warning" 
                    variant="outlined" 
                    icon={<LateIcon />} 
                  />
                  <Chip 
                    label={`${stats.absent} Absent/Missing`}
                    color="error" 
                    variant="outlined" 
                    icon={<AbsentIcon />} 
                  />
                </Box>

                {/* Search and Pagination Controls */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <TextField
                    label="Search by date or status"
                    variant="outlined"
                    size="small"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 300 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<DownloadIcon />}
                      onClick={exportToExcel}
                      disabled={!logsData.length}
                    >
                      Export Excel
                    </Button>
                    <Pagination
                      count={Math.ceil(filteredData.length / itemsPerPage)}
                      page={currentPage}
                      onChange={(event, page) => setCurrentPage(page)}
                      color="primary"
                      shape="rounded"
                    />
                  </Box>
                </Box>

                {/* Daily Attendance Table */}
                <DailyAttendanceTable 
                  employeeData={employeeData}
                  logsData={paginatedData}
                  loading={loading}
                  error={error}
                  onViewClick={handleViewClick}
                />
              </Box>
            )}
            {tabValue === 1 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Attendance Summary for {employeeData.first_name} {employeeData.last_name}
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                  {/* Present/Absent Summary */}
                  <Card sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Attendance Overview</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Total Records:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{stats.totalLogs}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Present:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                          {stats.present} ({Math.round((stats.present / stats.totalLogs) * 100)}%)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Absent:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                          {stats.absent} ({Math.round((stats.absent / stats.totalLogs) * 100)}%)
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                  
                  {/* Late/Undertime Summary */}
                  <Card sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Late & Undertime</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Late Arrivals:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FFA000' }}>
                          {stats.late} ({Math.round((stats.late / stats.totalLogs) * 100)}%)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Undertime Days:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FFA000' }}>
                          {stats.undertime} ({Math.round((stats.undertime / stats.totalLogs) * 100)}%)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Total Make Up Hours:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {stats.totalUndertimeHours} hours
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                  
                  {/* Overtime Summary */}
                  <Card sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Overtime</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Overtime Days:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                          {stats.overtime} ({Math.round((stats.overtime / stats.totalLogs) * 100)}%)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Total Overtime Hours:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {stats.totalOvertimeHours} hours
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Box>
                
                {/* Recent Records */}
                <Card sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Recent Attendance Records</Typography>
                  <DailyAttendanceTable 
                    employeeData={employeeData}
                    logsData={logsData.slice(0, 5)}
                    loading={loading}
                    error={error}
                    onViewClick={handleViewClick}
                  />
                </Card>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Log View Modal */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedLog?.employee.first_name}'s Log Details
          </DialogTitle>
          <DialogContent dividers>
            {selectedLog && (
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                  {/* Basic Info */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Employee Information</Typography>
                    <Typography>Email: {selectedLog.employee.email}</Typography>
                    <Typography>Department: {selectedLog.employee.department}</Typography>
                    <Typography>Team: {selectedLog.employee.team}</Typography>
                    <Typography>Employment Status: <StatusBadge status={selectedLog.employee.status} /></Typography>
                  </Box>

                  {/* Job Details */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Job Details</Typography>
                    <Typography>Type: {selectedLog.employee.type}</Typography>
                    <Typography>Work Arrangement: {selectedLog.employee.work_arrangement}</Typography>
                    <Typography>Contract Hours: {selectedLog.employee.contract_hours}h</Typography>
                    <Typography>
                      Schedule: {formatTimeProfessional(selectedLog.employee.time_in)} - {formatTimeProfessional(selectedLog.employee.time_out)}
                    </Typography>
                  </Box>

                  {/* Attendance Details */}
                  <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Attendance Record</Typography>
                    <Typography>Date: {formatDisplayDate(selectedLog.log.date)}</Typography>
                    <Typography>Time In: {formatTimeProfessional(selectedLog.log.time_in)}</Typography>
                    <Typography>Time Out: {formatTimeProfessional(selectedLog.log.time_out)}</Typography>
                    <Typography>
                      Break: {selectedLog.log.start_break ? 
                        `${formatTimeProfessional(selectedLog.log.start_break)} - ${formatTimeProfessional(selectedLog.log.end_break)}` : 
                        'No break recorded'}
                    </Typography>
                    <Typography>Work Hours: {selectedLog.log.work_hours || '--'} hours</Typography>
                    <Typography>Undertime: {selectedLog.log.undertime_hours || '0'} hours</Typography>
                    <Typography>Overtime: {selectedLog.log.overtime || '0'} hours</Typography>
                    <Typography>Status: <StatusBadge status={selectedLog.log.status} /></Typography>
                    <Typography>Break Status: <StatusBadge status={selectedLog.log.start_break ? 'Taken' : 'Missed'} /></Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>  
    </SideNavBar>
  );
};

export default AttendanceAdminTimesheet;