import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  AccessTime as AccessTimeIcon,
  FreeBreakfast as FreeBreakfastIcon,
  LunchDining as LunchDiningIcon,
  ExitToApp as ExitToAppIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const API_BASE_URL = 'http://localhost:8000/api/attendance';

const formatTimeTo12Hour = (timeString) => {
  if (!timeString) return '--:-- --';
  const timePart = timeString.includes('T') ? timeString.split('T')[1].substring(0, 5) : timeString.substring(0, 5);
  const [hours, minutes] = timePart.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const formatDisplayDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      timeZone: "Asia/Manila",
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  } catch (e) {
    return 'Invalid date';
  }
};

const AttendanceLogsTable = ({ employeeId }) => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');

  useEffect(() => {
    const fetchAttendanceLogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/logs`, {
          params: {
            employee_id: employeeId,
            ordering: order === 'asc' ? orderBy : `-${orderBy}`
          }
        });
        setRecords(response.data?.results || []);
      } catch (error) {
        console.error('Error fetching attendance logs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchAttendanceLogs();
    }
  }, [employeeId, order, orderBy]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const filteredRecords = records.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      formatDisplayDate(record.date).toLowerCase().includes(searchLower) ||
      (record.time_in && formatTimeTo12Hour(record.time_in).toLowerCase().includes(searchLower)) ||
      (record.time_out && formatTimeTo12Hour(record.time_out).toLowerCase().includes(searchLower)) ||
      (record.status && record.status.toLowerCase().includes(searchLower)) ||
      (record.time_in_status && record.time_in_status.toLowerCase().includes(searchLower)) ||
      (record.time_out_status && record.time_out_status.toLowerCase().includes(searchLower))
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success.main';
      case 'Absent': return 'error.main';
      case 'Late': return 'warning.main';
      case 'Half Day': return 'info.main';
      default: return 'text.primary';
    }
  };

  const getTimeStatusIcon = (status) => {
    if (!status) return null;
    
    if (status.includes('Late') || status.includes('Undertime')) {
      return <WarningIcon fontSize="small" color="warning" sx={{ ml: 0.5 }} />;
    } else if (status.includes('On Time') || status.includes('Overtime')) {
      return <CheckCircleIcon fontSize="small" color="success" sx={{ ml: 0.5 }} />;
    }
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (records.length === 0) {
    return (
      <Typography sx={{ mt: 4, textAlign: 'center' }}>
        No attendance records found
      </Typography>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="div">
          Attendance History
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search records..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} size="small">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'date'}
                  direction={orderBy === 'date' ? order : 'desc'}
                  onClick={() => handleSort('date')}
                  sx={{ color: 'common.white !important' }}
                >
                  <Typography variant="subtitle2" sx={{ color: 'common.white' }}>
                    Date
                  </Typography>
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'common.white' }}>
                <Typography variant="subtitle2">Status</Typography>
              </TableCell>
              <TableCell sx={{ color: 'common.white' }}>
                <Box display="flex" alignItems="center">
                  <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'common.white' }} />
                  <Typography variant="subtitle2">Time In</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'common.white' }}>
                <Box display="flex" alignItems="center">
                  <FreeBreakfastIcon fontSize="small" sx={{ mr: 0.5, color: 'common.white' }} />
                  <Typography variant="subtitle2">Break Start</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'common.white' }}>
                <Box display="flex" alignItems="center">
                  <LunchDiningIcon fontSize="small" sx={{ mr: 0.5, color: 'common.white' }} />
                  <Typography variant="subtitle2">Break End</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'common.white' }}>
                <Box display="flex" alignItems="center">
                  <ExitToAppIcon fontSize="small" sx={{ mr: 0.5, color: 'common.white' }} />
                  <Typography variant="subtitle2">Time Out</Typography>
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ color: 'common.white' }}>
                <Typography variant="subtitle2">Work Hours</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {formatDisplayDate(record.date)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={record.status}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(record.status),
                      color: 'common.white',
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2">
                      {record.time_in ? formatTimeTo12Hour(record.time_in) : '--:-- --'}
                    </Typography>
                    {record.time_in_status && (
                      <Tooltip title={record.time_in_status} arrow>
                        {getTimeStatusIcon(record.time_in_status)}
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {record.start_break ? formatTimeTo12Hour(record.start_break) : '--:-- --'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {record.end_break ? formatTimeTo12Hour(record.end_break) : '--:-- --'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2">
                      {record.time_out ? formatTimeTo12Hour(record.time_out) : '--:-- --'}
                    </Typography>
                    {record.time_out_status && (
                      <Tooltip title={record.time_out_status} arrow>
                        {getTimeStatusIcon(record.time_out_status)}
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: record.work_hours < (record.employee?.contract_hours || 8) ? 'error.main' : 'success.main'
                    }}
                  >
                    {record.work_hours ? `${record.work_hours} hrs` : '--'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredRecords.length === 0 && (
        <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
          No records match your search criteria
        </Typography>
      )}
    </Paper>
  );
};

export default AttendanceLogsTable;