import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
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
  Grid,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  CheckCircle as PresentIcon,
  Schedule as LateIcon,
  Cancel as AbsentIcon,
  Event as DateIcon,
  Error as ErrorIcon,
  AccessTime as OvertimeIcon,
  TimerOff as UndertimeIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  EventAvailable as PresentIconModal,
  EventBusy as AbsentIconModal,
  EventNote as EventNoteIcon,
  BeachAccess as LeaveIconModal
  
} from '@mui/icons-material';
import axios from 'api/axios';
import SideNavBar from "../content_page/nav_bar";

// Utility functions
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

const getTwoWeekPeriods = (currentDate = new Date()) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // First period: 1st to 15th (inclusive)
  const firstPeriodStart = new Date(year, month, 1);
  const firstPeriodEnd = new Date(year, month, 15);
  
  // Second period: 16th to last day of month
  const secondPeriodStart = new Date(year, month, 16);
  const secondPeriodEnd = new Date(year, month + 1, 0); // Last day of month
  
  return [
    { 
      start: firstPeriodStart, 
      end: firstPeriodEnd, 
      label: `1-15`
    },
    { 
      start: secondPeriodStart, 
      end: secondPeriodEnd, 
      label: `16-${secondPeriodEnd.getDate()}` 
    }
  ];
};

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

const formatDisplayDate = (dateString) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// Summary Card Component
const SummaryCard = ({ title, value, icon, color = 'primary', onClick }) => (
  <Paper 
    elevation={2} 
    onClick={onClick}
    sx={{ 
      p: 2, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      borderRadius: 2,
      borderLeft: `4px solid ${color}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {icon}
      <Typography variant="subtitle2" sx={{ ml: 1, color: 'text.secondary' }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color }}>
      {value}
    </Typography>
  </Paper>
);

// Main Table Component
const DailyAttendanceTable = ({ employeeData, logsData, loading, error }) => {
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
        fontSize: '0.875rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <thead>
          <tr style={{ 
            backgroundColor: '#00B4D8', 
            color: 'white', 
            textAlign: 'left',
            height: '48px'
          }}>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1rem', fontWeight: '600' }}>Date</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1rem', fontWeight: '600' }}>Day</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1rem', fontWeight: '600' }}>Time In</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1rem', fontWeight: '600' }}>Start Break</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1rem', fontWeight: '600' }}>End Break</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1rem', fontWeight: '600' }}>Time Out</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1rem', fontWeight: '600' }}>Total Hours</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1rem', fontWeight: '600' }}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {logsData.map((log, index) => {
            const status = log.time_in ? 'Present' : (log.status || 'Absent');
            const rowStyle = {
              backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: '#f0f7ff'
              }
            };
            
            return (
              <tr key={log.id} style={rowStyle}>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {log.date ? formatDisplayDate(log.date) : "--"}
                  </Box>
                </td>
               <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {log.date ? (
                    <>
                    {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </>
                  ) : (
                    "--"
                  )}
                </Box>
              </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                  {log.time_in ? formatTimeProfessional(log.time_in) : '--:--'}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                  {log.start_break ? formatTimeProfessional(log.start_break) : ''}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                  {log.end_break ? formatTimeProfessional(log.end_break) : ''}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                  {log.time_out ? formatTimeProfessional(log.time_out) : ''}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                  {log.work_hours} hrs
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                  <Chip 
                    label={status} 
                    size="small" 
                    color={
                      status === 'Present' ? 'success' : 
                      status === 'Late' ? 'warning' : 
                      status === 'Absent' ? 'error' : 'default'
                    }
                    variant="outlined"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
};

const AttendanceUserTimesheet = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [logsData, setLogsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPeriod, setCurrentPeriod] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryModalData, setSummaryModalData] = useState({ type: '', dates: [] });
  const itemsPerPage = 7;

  const twoWeekPeriods = getTwoWeekPeriods(currentMonth);
  const currentPeriodRange = twoWeekPeriods[currentPeriod];

  const filterByTwoWeekPeriod = (data) => {
    if (!currentPeriodRange) return data;
    return data.filter(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0); // Normalize time for comparison
      
      const startDate = new Date(currentPeriodRange.start);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(currentPeriodRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      
      return logDate >= startDate && logDate <= endDate;
    });
  };

  const filteredData = filterByTwoWeekPeriod(logsData);

  const calculateStats = (data) => {
    let totalLateHours = 0;
    let totalUndertimeHours = 0;
    let totalOvertimeHours = 0;
    
    const lateDates = data.filter(log => {
      if (log.time_in_status === 'Late' && log.time_in && employeeData?.time_in) {
        const [hours1, minutes1] = log.time_in.split(':').map(Number);
        const [hours2, minutes2] = employeeData.time_in.split(':').map(Number);
        const totalMinutes1 = hours1 * 60 + minutes1;
        const totalMinutes2 = hours2 * 60 + minutes2;
        const lateHours = (totalMinutes1 - totalMinutes2) / 60;
        if (lateHours > 0) {
          totalLateHours += lateHours;
          return true;
        }
      }
      return false;
    }).map(log => log.date);

    const undertimeDates = data.filter(log => {
      if (log.time_out_status === 'Undertime' && log.undertime_hours) {
        totalUndertimeHours += parseFloat(log.undertime_hours);
        return true;
      }
      return false;
    }).map(log => log.date);

    const overtimeDates = data.filter(log => {
      if (log.overtime) {
        totalOvertimeHours += parseFloat(log.overtime) / 60;
        return true;
      }
      return false;
    }).map(log => log.date);

    const presentDates = data.filter(log => log.status === 'Present').map(log => log.date);
    const leaveDates = data.filter(log => log.status === 'Leave').map(log => log.date);
    const absentDates = data.filter(log => !log.time_in && !log.status).map(log => log.date);

    return {
      totalLogs: data.length,
      present: presentDates.length,
      presentDates,
      late: lateDates.length,
      lateDates,
      totalLateHours: totalLateHours.toFixed(2),
      absent: absentDates.length,
      absentDates,
      leave: leaveDates.length,
      leaveDates,
      undertime: undertimeDates.length,
      undertimeDates,
      totalUndertimeHours: totalUndertimeHours.toFixed(2),
      overtime: overtimeDates.length,
      overtimeDates,
      totalOvertimeHours: totalOvertimeHours.toFixed(2),
    };
  };

  const stats = calculateStats(filteredData);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSummaryCardClick = (type) => {
    let dates = [];
    switch(type) {
      case 'Present':
        dates = stats.presentDates;
        break;
      case 'Leave':
        dates = stats.leaveDates;
        break;
      case 'Absent':
        dates = stats.absentDates;
        break;
      case 'Late':
        dates = stats.lateDates;
        break;
      case 'Overtime':
        dates = stats.overtimeDates;
        break;
      case 'Undertime':
        dates = stats.undertimeDates;
        break;
      default:
        break;
    }
    
    setSummaryModalData({ type, dates });
    setSummaryModalOpen(true);
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
        
        const logsRes = await axios.get(`attendance/timesheet/?employee_id=${emp.id}`);
        
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

  const handlePeriodChange = (direction) => {
    if (direction === 'prev') {
      setCurrentPeriod(prev => (prev === 0 ? 1 : 0));
    } else {
      setCurrentPeriod(prev => (prev === 1 ? 0 : 1));
    }
  };

  const handleMonthChange = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    setCurrentPeriod(0);
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

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const formatDateToWords = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  return (
    <SideNavBar>
      <Box sx={{ p: 2 }}>
        <Card sx={{  
          minHeight: 'calc(104vh - 64px)',
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
          p: 3,
          overflowX: 'hidden',
          boxSizing: 'border-box',
          mt: -12,
          borderRadius: 2,
          boxShadow: 3
        }}>

          <CardContent sx={{ p: 2 }}>
            {/* Employee Information Section */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="h3" color="primary" sx={{ mb: 2, fontWeight: 'bold'}}>
                Attendance Timesheet
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <Box component="span">Name:</Box> {employeeData.first_name} {employeeData.last_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <Box component="span">Department:</Box> {employeeData.department}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <Box component="span">Schedule:</Box> {formatTimeProfessional(employeeData.time_in)} - {formatTimeProfessional(employeeData.time_out)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <Box component="span">Status:</Box> {capitalizeFirstLetter(employeeData?.employment_type)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Summary Section */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={6} sm={4} md={2}>
                <SummaryCard 
                  title="Present" 
                  value={stats.present} 
                  icon={<PresentIcon color="success" />} 
                  color="#2ecc71"
                  onClick={() => handleSummaryCardClick('Present')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <SummaryCard 
                  title="Leave" 
                  value={stats.leave} 
                  icon={<DateIcon color="info" />} 
                  color="#3498db"
                  onClick={() => handleSummaryCardClick('Leave')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <SummaryCard 
                  title="Absent" 
                  value={stats.absent} 
                  icon={<AbsentIcon color="error" />} 
                  color="#e74c3c"
                  onClick={() => handleSummaryCardClick('Absent')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <SummaryCard 
                  title="Late" 
                  value={`${stats.late}`} 
                  icon={<LateIcon color="warning" />} 
                  color="#f39c12"
                  onClick={() => handleSummaryCardClick('Late')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <SummaryCard 
                  title="Overtime" 
                  value={`${stats.overtime}`} 
                  icon={<OvertimeIcon color="secondary" />} 
                  color="#9b59b6"
                  onClick={() => handleSummaryCardClick('Overtime')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <SummaryCard 
                  title="Undertime" 
                  value={`${stats.undertime}`} 
                  icon={<UndertimeIcon color="action" />} 
                  color="#95a5a6"
                  onClick={() => handleSummaryCardClick('Undertime')}
                />
              </Grid>
            </Grid>

            {/* Period Navigation */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 2 }}>
                <IconButton
                  onClick={() => handleMonthChange('prev')}
                  size="small"
                  sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                
                <Typography variant="subtitle1" sx={{ minWidth: '200px', textAlign: 'center', color: 'black' }}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Typography>
                
                <IconButton
                  onClick={() => handleMonthChange('next')}
                  size="small"
                  sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 2 }}>
                <IconButton
                  onClick={() => handlePeriodChange('prev')}
                  size="small"
                  disabled={currentPeriod === 0}
                  sx={{ 
                    borderRadius: 1, 
                    backgroundColor: currentPeriod !== 0 ? 'primary.main' : 'action.disabled',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: currentPeriod !== 0 ? 'primary.dark' : 'action.disabled'
                    }
                  }}
                >
                  <NavigateBeforeIcon />
                </IconButton>
                
                <Typography variant="subtitle1" sx={{ minWidth: '120px', textAlign: 'center', color: 'black' }}>
                  {currentPeriodRange?.label || '1-15'}
                </Typography>
                
                <IconButton
                  onClick={() => handlePeriodChange('next')}
                  size="small"
                  disabled={currentPeriod === 1}
                  sx={{ 
                    borderRadius: 1, 
                    backgroundColor: currentPeriod !== 1 ? 'primary.main' : 'action.disabled',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: currentPeriod !== 1 ? 'primary.dark' : 'action.disabled'
                    }
                  }}
                >
                  <NavigateNextIcon />
                </IconButton>
              </Box>

              <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'black' }}>
                Period: {formatDateToWords(currentPeriodRange?.start)} - {formatDateToWords(currentPeriodRange?.end)}
              </Typography>
            </Paper>

            {/* Attendance Table */}
            <DailyAttendanceTable 
              employeeData={employeeData}
              logsData={paginatedData}
              loading={loading}
              error={error}
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
          </CardContent>
        </Card>
        

        {/* Summary Modal */}
        <Dialog 
          open={summaryModalOpen} 
          onClose={() => setSummaryModalOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: 'primary.main', 
            color: 'white',
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h5" color="white" sx={{ ml: 2, fontWeight: 'bold' }}>
                {summaryModalData.type} Dates
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setSummaryModalOpen(false)} 
              size="small"
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {summaryModalData.dates.length > 0 ? (
              <>
                <Typography variant="body1" sx={{ 
                  mb: 3, 
                  textAlign: 'center',
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 'small',
                  color: 'black !important'
                }}>
                  Total of <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {summaryModalData.dates.length}
                  </Box> {summaryModalData.type.toLowerCase()} day(s)
                </Typography>
                <List 
                  dense 
                  sx={{ 
                    maxHeight: '300px', 
                    overflow: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    py: 0
                  }}
                >
                  {summaryModalData.dates.map((date, index) => (
                    <ListItem 
                      key={index}
                      sx={{
                        borderBottom: index < summaryModalData.dates.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        '&:last-child': {
                          borderBottom: 'none'
                        }
                      }}
                    >
                      <ListItemText 
                        primary={formatDisplayDate(date)} 
                        primaryTypographyProps={{
                          sx: {
                            display: 'flex',
                            alignItems: 'center',
                            '&:before': {
                              content: '"•"',
                              color: 'primary.main',
                              fontWeight: 'bold',
                              fontSize: '20px',
                              mr: 1.5
                            }
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                color: 'text.secondary'
              }}>
                <EventNoteIcon sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
                <Typography variant="body1">
                  No {summaryModalData.type.toLowerCase()} days found for this period.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={() => setSummaryModalOpen(false)} 
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 'bold',
                color: 'white !important'
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>  
    </SideNavBar>
  );
};

export default AttendanceUserTimesheet;