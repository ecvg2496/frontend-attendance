import React, { useState, useEffect } from "react";
import api from "api/axios";
import {
  Card,
  Typography,
  Box,
  Modal,
  TextField,
  Paper,
  CircularProgress,
  IconButton,
  Alert,
  Grid,
  Chip,
  Autocomplete,
  Avatar
} from '@mui/material';
import {
  Close,
  ChevronLeft,
  ChevronRight,
  Today,
  Search
} from '@mui/icons-material';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isSameDay, addMonths, subMonths, isWeekend, 
  startOfWeek, endOfWeek } from 'date-fns';
import SideNavBar from 'layouts/attendance_dashboard/content_page/sidebar';

// Calendar Component
const AttendanceCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateDetails, setDateDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch attendance data when employee or month changes
  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendanceData();
    }
  }, [selectedEmployee, currentDate]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get("/attendance/employees/");
      setEmployees(response.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await api.get("/attendance/monthly/", {
        params: {
          employee_id: selectedEmployee.id,
          year: year,
          month: month
        }
      });
      
      if (response.data && response.data.daily_data) {
        setAttendanceData(response.data.daily_data);
        setSummaryData(response.data.summary);
      } else {
        setAttendanceData([]);
        setSummaryData(null);
        setError("No attendance data available");
      }
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError(err.response?.data?.error || "Error fetching attendance data");
      setAttendanceData([]);
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate avatar initials
  const getAvatarInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  // Filter employees based on search input
  const filteredEmployees = employees.filter(employee => {
    const searchTerm = searchInput.toLowerCase();
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const position = employee.position ? employee.position.toLowerCase() : '';
    
    return fullName.includes(searchTerm) || 
           position.includes(searchTerm) ||
           (employee.department && employee.department.toLowerCase().includes(searchTerm));
  });

  const getDayStatus = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const dayData = attendanceData.find(item => 
      format(new Date(item.date), 'yyyy-MM-dd') === formattedDate
    );

    if (dayData) {
      return {
        status: dayData.status,
        label: dayData.status.charAt(0).toUpperCase() + dayData.status.slice(1),
        details: dayData
      };
    }

    // Fallback for weekends
    if (isWeekend(date)) {
      return { status: 'weekend', label: 'Weekend' };
    }

    return { status: 'unknown', label: 'No Data' };
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'present' || statusLower === 'completed') {
      return 'success.light';
    } else if (statusLower.includes('leave')) {
      return 'warning.light';
    } else if (statusLower === 'absent') {
      return 'error.light';
    } else if (statusLower === 'late' || statusLower === 'incomplete') {
      return 'warning.main';
    } else if (statusLower === 'weekend') {
      return 'grey.100';
    } else {
      return 'background.paper';
    }
  };

  const handleDateClick = (date, status) => {
    if (status.details) {
      setSelectedDate(date);
      setDateDetails(status.details);
      setShowDetailsModal(true);
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
          mb: 2,
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <Typography 
              key={day} 
              align="center" 
              fontWeight="bold" 
              color={index <= 6 ? 'primary' : 'text.primary'} 
            >
              {day}
            </Typography>
          ))}
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1
        }}>
          {days.map(day => {
            const status = getDayStatus(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const backgroundColor = getStatusColor(status.status);
            
            return (
              <Box
                key={day.toISOString()}
                onClick={() => handleDateClick(day, status)}
                sx={{
                  height: 80,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  cursor: status.details ? 'pointer' : 'default',
                  backgroundColor: backgroundColor,
                  opacity: isCurrentMonth ? 1 : 0.4,
                  '&:hover': status.details ? {
                    backgroundColor: 'action.hover',
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s'
                  } : {}
                }}
              >
                <Typography variant="caption" display="block" align="center">
                  {format(day, 'd')}
                </Typography>
                {status.details && isCurrentMonth && (
                  <Typography 
                    variant="caption" 
                    display="block" 
                    align="center" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    {status.label}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <SideNavBar>
      <Card sx={{
        minHeight: 'calc(104vh - 64px)',
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        p: 3,
        overflowX: 'hidden',
        boxSizing: 'border-box',
        mt: -10
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h3" color="primary">
            Monthly Attendance Calendar
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: 300 }}>
            <Autocomplete
              options={filteredEmployees}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
              value={selectedEmployee}
              onChange={(event, newValue) => {
                setSelectedEmployee(newValue);
              }}
              inputValue={searchInput}
              onInputChange={(event, newInputValue) => {
                setSearchInput(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search employee"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <Search sx={{ color: 'text.secondary', mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
                  sx={{ minWidth: 300 }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: 'primary.main',
                        fontSize: '1.2rem'
                      }}
                    >
                      {getAvatarInitials(option.first_name, option.last_name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {option.first_name} {option.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.position} {option.department && `• ${option.department}`}
                      </Typography>
                    </Box>
                  </Box>
                </li>
              )}
              noOptionsText="No employees found"
              loading={loading}
              loadingText="Loading employees..."
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!selectedEmployee ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Please select an employee to view attendance data
          </Alert>
        ) : (
          <>
            {/* Calendar Header with Employee Info */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: 'primary.main',
                    fontSize: '1rem'
                  }}
                >
                  {getAvatarInitials(selectedEmployee.first_name, selectedEmployee.last_name)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEmployee.position}
                    {selectedEmployee.department && ` • ${selectedEmployee.department}`}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  color="primary"
                  disabled={loading}
                >
                  <ChevronLeft />
                </IconButton>

                <Typography variant="h4" fontWeight="bold" color="primary">
                  {format(currentDate, 'MMMM yyyy')}
                </Typography>

                <IconButton 
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  disabled={loading}
                  color="primary"
                >
                  <ChevronRight />
                </IconButton>

                <IconButton 
                  onClick={() => setCurrentDate(new Date())}
                  disabled={loading}
                  color="primary"
                >
                </IconButton>
              </Box>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Calendar */}
                {renderCalendar()}

                {/* Legend and Summary */}
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="h6" gutterBottom>Legend</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 20, height: 20, bgcolor: 'success.light', borderRadius: 1 }} />
                              <Typography variant="body2">Present/Completed</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 20, height: 20, bgcolor: 'error.light', borderRadius: 1 }} />
                              <Typography variant="body2">Absent</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 20, height: 20, bgcolor: 'warning.main', borderRadius: 1 }} />
                              <Typography variant="body2">Late/Incomplete</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 20, height: 20, bgcolor: 'warning.light', borderRadius: 1 }} />
                              <Typography variant="body2">Leave (All Types)</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      {summaryData && (
                        <Box sx={{ p: 2, bgcolor: 'primary.main', borderRadius: 1, height: '100%' }}>
                          <Typography variant="h6" gutterBottom color="white">
                            Monthly Summary
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="white">
                                Present: {summaryData.days_present} day{summaryData.days_present !== 1 ? 's' : ''}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="white">
                                Absent: {summaryData.days_absent} day{summaryData.days_absent !== 1 ? 's' : ''}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="white">
                                Late: {summaryData.days_late} day{summaryData.days_late !== 1 ? 's' : ''}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="white">
                                Leave: {summaryData.days_leave} day{summaryData.days_leave !== 1 ? 's' : ''}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </>
        )}

        {/* Date Details Modal */}
        <Modal
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          <Paper sx={{
            width: '90%',
            maxWidth: '500px',
            p: 3,
            borderRadius: 2,
            position: 'relative'
          }}>
            <IconButton
              aria-label="close"
              onClick={() => setShowDetailsModal(false)}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16
              }}
            >
              <Close />
            </IconButton>

            <Typography variant="h5" color="primary" gutterBottom>
              Attendance Details
            </Typography>

            {selectedDate && (
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </Typography>
            )}

            {dateDetails && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" fontWeight="bold">Status:</Typography>
                    <Chip 
                      label={dateDetails.status || 'Unknown'} 
                      color={
                        dateDetails.status === 'present' || dateDetails.status === 'completed' ? 'success' :
                        dateDetails.status === 'absent' ? 'error' :
                        dateDetails.status === 'late' || dateDetails.status === 'incomplete' ? 'warning' : 
                        dateDetails.status.includes('leave') ? 'warning' : 'default'
                      }
                    />
                  </Grid>
                  {dateDetails.time_in && (
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="bold">Time In:</Typography>
                      <Typography variant="body2">{dateDetails.time_in}</Typography>
                    </Grid>
                  )}
                  {dateDetails.time_out && (
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="bold">Time Out:</Typography>
                      <Typography variant="body2">{dateDetails.time_out}</Typography>
                    </Grid>
                  )}
                  {(dateDetails.work_hours || dateDetails.work_hours === 0) && (
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="bold">Work Hours:</Typography>
                      <Typography variant="body2">{dateDetails.work_hours} hours</Typography>
                    </Grid>
                  )}
                  {dateDetails.late_duration > 0 && (
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="bold">Late Duration:</Typography>
                      <Typography variant="body2">{dateDetails.late_duration} minutes</Typography>
                    </Grid>
                  )}
                  {dateDetails.overtime > 0 && (
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="bold">Overtime:</Typography>
                      <Typography variant="body2">{dateDetails.overtime} hours</Typography>
                    </Grid>
                  )}
                  {dateDetails.remarks && (
                    <Grid item xs={12}>
                      <Typography variant="body2" fontWeight="bold">Remarks:</Typography>
                      <Typography variant="body2">{dateDetails.remarks}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </Paper>
        </Modal>
      </Card>
    </SideNavBar>
  );
};

export default AttendanceCalendar;