import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "api/axios";
import {
  Card,
  Typography,
  Box,
  Modal,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Avatar,
  Chip,
  Stack,
  Divider,
  Alert,
  Snackbar,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Add,
  Close,
  PendingActions,
  CheckCircle,
  Cancel,
  AccessTime,
  Schedule,
  Search as SearchIcon,
  FilterList
} from '@mui/icons-material';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse, compareDesc } from 'date-fns';
import GlobalSideNav from "../content_page/sidebar";
import '../content_page/css/admintable.css';
import LaunchIcon from '@mui/icons-material/Launch';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Helper Functions
const formatDisplayDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalid date';
  }
};

const formatDisplayTime = (timeString) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
    // hour: '2-digit',
    // minute: '2-digit'
  });
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ScheduleRequestTable = ({ 
  data, 
  loading, 
  error, 
  onStatusUpdate,
  onViewDetails 
}) => {
  const statusColors = {
    pending: { bg: '#FFF3E0', color: '#E65100', icon: <PendingActions fontSize="small" /> },
    approved: { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircle fontSize="small" /> },
    rejected: { bg: '#FFEBEE', color: '#C62828', icon: <Cancel fontSize="small" /> }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Box p={2} bgcolor="error.light" color="error.dark" borderRadius={1}>
        <Typography align="center">Error: {error.message}</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box p={4} textAlign="center" color="text.secondary">
        <Typography variant="subtitle1">No schedule requests found</Typography>
      </Box>
    );
  }

  return (
    <Box width="100%" overflow="auto" position="relative" sx={{ mt: 2, mb: 4 }}>
      <table style={{
        width: '100%',
        minWidth: '1200px',
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Actions</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date Filed</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Employee</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date Requested</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Schedule Details</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Day Off</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Reason</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Remarks</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Status</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Processed By</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date Modified</th>

          </tr>
        </thead>
        <tbody>
          {data.map((request, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
             <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
              <IconButton onClick={() => onViewDetails(request)}>
                {request.status === 'pending' ? (
                  <LaunchIcon color="primary" />
                ) : (
                  <VisibilityIcon color="primary" />
                )}
              </IconButton>
            </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Box fontSize="0.9rem">
                  {formatDateTime(request.created_at)}
                </Box>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontSize: '0.75rem' }}>
                    {getInitials(request.employee_name)}
                  </Avatar>
                  <Box>
                    <Box fontWeight={500}>{request.employee_name || 'Unknown'}</Box>
                    <Box fontSize="0.75rem" color="#666">{request.email || 'No email'}</Box>
                  </Box>
                </Box>
              </td>
              <td style={{ padding: '12px 16px' }}>
                {request.schedule_days.map((day, i) => (
                  <div key={i}>{formatDisplayDate(day.date)}</div>
                ))}
              </td>
            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
              {request.schedule_days.map((day, i) => (
                <Box key={i} mb={2}>
                  <Typography variant="body2" sx={{fontSize: '0.9rem'}}>
                    {formatDisplayTime(day.time_in)} - {formatDisplayTime(day.time_out)} 
                  </Typography>
                  {day.start_break && day.end_break && (
                    <Typography variant="caption" color="text.secondary">
                      Break: {formatDisplayTime(day.start_break)} - {formatDisplayTime(day.end_break)}
                    </Typography>
                  )}
                </Box>
              ))}
            </td>
            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Box>
                  {request.is_day_off || '0'}
                </Box>
            </td>
              <td style={{ padding: '12px 16px' }}>
                <Box>
                  {request.justification || 'None'}
                </Box>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <Box>
                  {request.admin_remarks || 'N/A'}
                </Box>
              </td>
             <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Chip
                  label={
                    request.status.charAt(0).toUpperCase() + request.status.slice(1)
                  }
                  size="small"
                  sx={{
                    backgroundColor: statusColors[request.status].bg,
                    color: statusColors[request.status].color,
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              </td>
               <td style={{ padding: '12px 16px' }}>
                <Box>
                  {request?.processed_by || 'N/A'}
                </Box>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Box>
                  {formatDateTime(request?.updated_at) || 'N/A'}
                </Box>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

const RequestDetailsModal = ({ 
  open, 
  onClose, 
  request, 
  onStatusUpdate,
  loading 
}) => {
  const [adminRemarks, setAdminRemarks] = useState(request?.admin_remarks || '');
  const employee = JSON.parse(localStorage.getItem('employee'));

  const handleStatusUpdateWithRemarks = (status) => {
    onStatusUpdate(status, adminRemarks, employee.name);
  };

  useEffect(() => {
    if (request) {
      setAdminRemarks(request.admin_remarks || '');
    }
  }, [request]);

  if (!request) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="request-details-modal"
      aria-describedby="request-details-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="h4" color="primary" component="h2">
            Schedule Request Details
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Box>
          <Box>
            <Typography>Name:&nbsp;{request.employee_name || 'Unknown'}</Typography>
            <Typography>
              Email:&nbsp;
              <span style={{ color: 'blue' }}>
                {request.email || 'No email'}
              </span>
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography>
            Status:&nbsp;
            <span style={{ 
              color: request?.status === 'approved' ? 'green' : 
                    request?.status === 'rejected' ? 'red' : 
                    request?.status === 'pending' ? 'orange' : 
                    'inherit'
            }}>
              {request?.status 
                ? request.status.charAt(0).toUpperCase() + request.status.slice(1) 
                : 'N/A'}
            </span>
          </Typography>
        </Box>
        <Typography>Date Filed: {formatDateTime(request.created_at)}</Typography>
        <Typography>Reason:&nbsp;{request.justification || 'No reason provided'}</Typography>
        <Typography mb={2}>Date Modified: {formatDateTime(request.updated_at)}</Typography>

        {request.processed_by && (
          <Typography mb={2}>
            Processed by: {request.processed_by}
          </Typography>
        )}

        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary" mb={2}>Schedule Days</Typography>
          {request.schedule_days.map((day, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2, borderRadius: 1 }}>
              <Typography fontWeight="medium" mb={1}>
                {formatDisplayDate(day.date)}
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Time In:</Typography>
                <Typography>{formatDisplayTime(day.time_in)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Time Out:</Typography>
                <Typography>{formatDisplayTime(day.time_out)}</Typography>
              </Box>
              {day.start_break && day.end_break && (
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Break Time:</Typography>
                  <Typography>
                    {formatDisplayTime(day.start_break)} - {formatDisplayTime(day.end_break)}
                  </Typography>
                </Box>
              )}
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Total Hours:</Typography>
                <Typography>{day.hours} hours</Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Admin Remarks
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Enter remarks for this action..."
            value={adminRemarks}
            onChange={(e) => setAdminRemarks(e.target.value)}
            InputProps={{
              readOnly: request.status !== 'pending',
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: request.status !== 'pending' ? 'action.hover' : 'background.paper',
              }
            }}
          />
        </Box>

        {request.status === 'pending' && (
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button 
              variant="contained" 
              color="error"
              startIcon={<Cancel />}
              onClick={() => handleStatusUpdateWithRemarks('rejected')}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Reject'}
            </Button>
            <Button 
              variant="contained" 
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleStatusUpdateWithRemarks('approved')}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Approve'}
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

const CustomizeScheduleRequestForm = () => {
  const [scheduleRequests, setScheduleRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState({
    pending: true,
    approved: true,
    rejected: true
  });
  const [alphabetFilter, setAlphabetFilter] = useState('');
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  const refreshData = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      const emp = JSON.parse(storedEmployee);
      setEmployee(emp);
      fetchScheduleRequests(emp.id);
    }
  }, [refreshCounter]);

  const fetchScheduleRequests = async (employeeId) => {
    try {
      setLoading(true);
      const res = await api.get(`attendance/schedule-requests/`);
      const data = Array.isArray(res.data) ? res.data : [];
      const normalizedData = data.map(item => ({
        ...item,
        status: item.status.toLowerCase()
      }));
      setScheduleRequests(normalizedData);
    } catch (error) {
      console.error("Error fetching schedule requests:", error);
      setScheduleRequests([]);
      setSnackbar({
        open: true,
        message: "Failed to fetch schedule requests",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return scheduleRequests
      .filter(request => {
        if (!statusFilters[request.status]) return false;
        
        if (alphabetFilter && request.employee_name) {
          const firstLetter = request.employee_name.charAt(0).toUpperCase();
          if (firstLetter !== alphabetFilter) return false;
        }
        
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesName = request.employee_name?.toLowerCase().includes(searchLower);
          const matchesEmail = request.email?.toLowerCase().includes(searchLower);
          const matchesReason = request.justification?.toLowerCase().includes(searchLower);
          const matchesStatus = request.status?.toLowerCase().includes(searchLower);
          const matchesRemarks = request.admin_remarks?.toLowerCase().includes(searchLower);
          
          if (!matchesName && !matchesEmail && !matchesReason && !matchesStatus && !matchesRemarks) {
            return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return compareDesc(new Date(a.created_at), new Date(b.created_at));
      });
  }, [scheduleRequests, statusFilters, alphabetFilter, searchTerm]);

  const handleStatusFilterChange = (status) => {
    setStatusFilters(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const handleViewDetails = useCallback((request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedRequest(null);
  }, []);

  const handleStatusUpdate = useCallback(async (status, remarks, processedBy) => {
    if (!selectedRequest) return;
    
    try {
      setActionLoading(true);
      
      const response = await api.patch(`attendance/schedule-requests/${selectedRequest.id}/`, {
        status: status,
        admin_remarks: remarks,
        processed_by: processedBy
      });
      
      setSnackbar({
        open: true,
        message: `Request ${status} successfully!`,
        severity: "success"
      });
      
      refreshData();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating request status:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || "Failed to update request status",
        severity: "error"
      });
    } finally {
      setActionLoading(false);
    }
  }, [selectedRequest, refreshData, handleCloseModal]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <GlobalSideNav>
      <Card sx={{
        minHeight: 'calc(103vh - 64px)',
        width: '100%',
        mt: -10,
        p: 3
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderRadius: 1
        }}>
          <Typography variant="h3" color="primary">
            Custom Schedule Requests
          </Typography>
        </Box>

        <Box sx={{ p: 2, borderRadius: 1 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <TextField
              placeholder="Search requests..."
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ maxWidth: 500 }}
            />
          </Box>
                  
          <Box sx={{ mb: 2 }}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={statusFilters.pending}
                    onChange={() => handleStatusFilterChange('pending')}
                    sx={{
                      color: '#FFA726',
                      '&.Mui-checked': {
                        color: '#FB8C00',
                      },
                    }}
                  />
                }
                label="Pending"
                sx={{ mr: 2, color: 'text.primary' }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={statusFilters.approved}
                    onChange={() => handleStatusFilterChange('approved')}
                    sx={{
                      color: '#66BB6A',
                      '&.Mui-checked': {
                        color: '#388E3C',
                      },
                    }}
                  />
                }
                label="Approved"
                sx={{ mr: 2, color: 'text.primary' }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={statusFilters.rejected}
                    onChange={() => handleStatusFilterChange('rejected')}
                    sx={{
                      color: '#EF9A9A',
                      '&.Mui-checked': {
                        color: '#D32F2F',
                      },
                    }}
                  />
                }
                label="Rejected"
                sx={{ color: 'text.primary' }}
              />
            </FormGroup>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 2 }}>
            {alphabet.map(value => (
              <Button 
                key={value} 
                onClick={() => setAlphabetFilter(alphabetFilter === value ? '' : value)}
                variant={alphabetFilter === value ? 'contained' : 'outlined'}
                sx={{
                  minWidth: '36px', 
                  height: '36px', 
                  borderRadius: '8px',
                  p: 0,
                  fontWeight: 'bold',
                  borderColor: '#90caf9',
                  color: alphabetFilter === value ? 'white !important' : 'inherit',
                  backgroundColor: alphabetFilter === value ? '#2E7D32' : 'inherit',
                  '&:hover': {
                    backgroundColor: alphabetFilter === value ? '#1B5E20' : 'rgba(46, 125, 50, 0.08)'
                  }
                }}
              >
                {value}
              </Button>
            ))}
          </Box>
        </Box>

        <ScheduleRequestTable
          data={filteredRequests}
          loading={loading}
          error={null}
          onStatusUpdate={refreshData}
          onViewDetails={handleViewDetails}
        />

        <RequestDetailsModal
          open={modalOpen}
          onClose={handleCloseModal}
          request={selectedRequest}
          onStatusUpdate={handleStatusUpdate}
          loading={actionLoading}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Card>
    </GlobalSideNav>
  );
};

export default CustomizeScheduleRequestForm;