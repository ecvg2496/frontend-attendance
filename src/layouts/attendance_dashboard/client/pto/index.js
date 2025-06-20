import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { axiosPrivate } from 'api/axios';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Divider,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  FormControlLabel,
  IconButton, 
  MenuItem, 
  Checkbox
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit,
  PersonAdd,
  Delete,
  Close
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import SideNavBar from 'layouts/attendance_dashboard/content_page/sidebar';

// Constants
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({length: 5}, (_, i) => currentYear + i);

// Helper Functions
const formatDisplayDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      timeZone: "Asia/Manila",
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalid date';
  }
};

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Active: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    'Newly Hired': { background: 'linear-gradient(to right, #2196F3, #64B5F6)', color: 'white' },
    Probation: { background: 'linear-gradient(to right, #FF9800, #FFB74D)', color: 'white' },
    Floating: { background: 'linear-gradient(to right, #FF9800, #FFB74D)', color: 'white' },
    'On Leave': { background: 'linear-gradient(to right, #9C27B0, #BA68C8)', color: 'white' },
    Resigned: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    AWOL: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Terminated: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    default: { background: '#e0e0e0', color: 'rgba(0, 0, 0, 0.87)' }
  };

  return (
    <span style={{
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'capitalize',
      ...(statusStyles[status] || statusStyles.default)
    }}>
      {status}
    </span>
  );
};

const EmployeeTable = ({ 
  employees = [], 
  loading, 
  error, 
  year,
  onEditClick,
  onAssignClick,
  onDeleteClick
}) => {
  if (loading) {
    return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>;
  }

  if (error) {
    return <Box p={1}><Alert severity="error">{error}</Alert></Box>;
  }

  if (employees.length === 0) {
    return <Box p={1}><Alert severity="info">No employees found</Alert></Box>;
  }

  return (
    <Box width="100%" overflow="auto" position="relative">
      <table style={{ 
        width: '100%',
        minWidth: '1200px',
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Employee</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Employment Date</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Team</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Leave Type</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Total</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Paid</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>No Pay</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Balance</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => {
            const leaveCredits = employee.leave_credits || [];
            const regularLeave = leaveCredits.find(lc => lc.leave_type === 'regular' && lc.year === year);
            const birthdayLeave = leaveCredits.find(lc => lc.leave_type === 'birthday' && lc.year === year);
            const hasLeaveCredits = regularLeave || birthdayLeave;

            return (
              <tr key={employee.id} style={{ 
                borderBottom: '1px solid #e0e0e0'
              }}>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontSize: '0.75rem' }}>
                      {employee?.first_name?.[0] || ''}{employee?.last_name?.[0] || ''}
                    </Avatar>
                    <Box>
                      <Box fontWeight={500}>
                        {employee?.first_name || 'Unknown'} {employee?.last_name || ''}
                      </Box>
                      <Box fontSize="0.75rem" color="#666">{employee?.email || 'No email'}</Box>
                    </Box>
                  </Box>
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {formatDisplayDate(employee?.employment_date)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {employee?.team || 'N/A'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {hasLeaveCredits ? (
                    <Box display="flex" flexDirection="column" gap={1}>
                      {regularLeave && <span>Regular ({regularLeave.year})</span>}
                      {birthdayLeave && <span>Birthday ({birthdayLeave.year})</span>}
                    </Box>
                  ) : (
                    <span>No credits</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {hasLeaveCredits ? (
                    <Box display="flex" flexDirection="column" gap={1}>
                      {regularLeave && <span>{regularLeave.total_days || 0}</span>}
                      {birthdayLeave && <span>{birthdayLeave.total_days || 0}</span>}
                    </Box>
                  ) : (
                    <Box color="error.main" fontSize="0.9rem">N/A</Box>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: 'teal' }}>
                  {hasLeaveCredits ? (
                    <Box display="flex" flexDirection="column" gap={1}>
                      {regularLeave && <span>{regularLeave?.is_paid || 0}</span>}
                      {birthdayLeave && <span>{birthdayLeave?.is_paid || 0}</span>}
                    </Box>
                  ) : null}
                </td>
                <td style={{ padding: '12px 16px', color: 'orange' }}>
                  {hasLeaveCredits ? (
                    <Box display="flex" flexDirection="column" gap={1}>
                      {regularLeave && <span>{regularLeave?.used_days || 0}</span>}
                      {birthdayLeave && <span>{birthdayLeave?.used_days || 0}</span>}
                    </Box>
                  ) : null}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {hasLeaveCredits ? (
                    <Box display="flex" flexDirection="column" gap={1}>
                      {regularLeave && (
                        <span style={{ color: (regularLeave.total_days - regularLeave.used_days - regularLeave.is_paid) <= 0 ? 'red' : 'green' }}>
                          {regularLeave.total_days - regularLeave.used_days - regularLeave.is_paid}
                        </span>
                      )}
                      {birthdayLeave && (
                        <span style={{ color: (birthdayLeave.total_days - birthdayLeave.is_paid_birthday) <= 0 ? 'red' : 'green' }}>
                          {birthdayLeave.total_days - birthdayLeave.used_days -  birthdayLeave.is_paid_birthday}
                        </span>
                      )}
                    </Box>
                  ) : null}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <StatusBadge status={employee?.status || 'Unknown'} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
};

export default function BrowseUserPTO() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLetter, setActiveLetter] = useState(null);
  const [year, setYear] = useState(currentYear);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [statusFilters, setStatusFilters] = useState({
    Active: true,
    'Newly Hired': true,
    Floating: true,
    'On Leave': true,
    Resigned: false,
    AWOL: false,
    Terminated: false
  });
  const navigate = useNavigate();

  // Calculate paginated data
  const filteredData = useMemo(() => {
    let filtered = [...allUsers];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        (emp.first_name?.toLowerCase().includes(term) || 
         emp.last_name?.toLowerCase().includes(term) || 
         emp.email?.toLowerCase().includes(term))
      );
    }
    
    if (activeLetter) {
      filtered = filtered.filter(emp => 
        emp.first_name?.[0]?.toUpperCase() === activeLetter
      );
    }

    const activeStatusFilters = Object.keys(statusFilters).filter(key => statusFilters[key]);
    if (activeStatusFilters.length > 0) {
      filtered = filtered.filter(emp => activeStatusFilters.includes(emp.status));
    }
    
    return filtered;
  }, [searchTerm, activeLetter, allUsers, statusFilters]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const isAdmin = useCallback(() => {
    const employeeData = localStorage.getItem("employee");
    if (employeeData) {
      const employee = JSON.parse(employeeData);
      return employee.is_admin === 1 || employee.is_admin === true || employee.is_admin === "1";
    }
    return false;
  }, []);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/authentication/sign-in/');
    }
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesResponse, leaveCreditsResponse] = await Promise.all([
        axiosPrivate.get('attendance/employees/'),
        axiosPrivate.get('attendance/leave-credits/', {
          params: { year }
        })
      ]);

      const leaveCreditsByEmployee = {};
      leaveCreditsResponse.data.forEach(lc => {
        if (!leaveCreditsByEmployee[lc.employee]) {
          leaveCreditsByEmployee[lc.employee] = [];
        }
        leaveCreditsByEmployee[lc.employee].push(lc);
      });

      const employeesWithLeaveCredits = employeesResponse.data.map(emp => ({
        ...emp,
        leave_credits: leaveCreditsByEmployee[emp.id] || []
      }));

      setAllUsers(employeesWithLeaveCredits);
      setLoading(false);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  const handleLetterClick = useCallback((letter) => {
    setActiveLetter(activeLetter === letter ? null : letter);
  }, [activeLetter]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const StatusFilterCheckbox = () => (
    <Box sx={{ mb: 2, p: 2, borderRadius: 1 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {Object.keys(statusFilters).map(status => (
          <FormControlLabel
            key={status}
            control={
              <Checkbox
                checked={statusFilters[status]}
                onChange={() => setStatusFilters(prev => ({
                  ...prev,
                  [status]: !prev[status]
                }))}
                size="small"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StatusBadge status={status} />
              </Box>
            }
          />
        ))}
      </Box>
    </Box>
  );

  const PaginationControls = () => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, gap: 1 }}>
    <Button 
      variant="outlined" 
      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      disabled={currentPage === 1}
    >
      Previous
    </Button>
    
    <Typography variant="body2">
      Page {currentPage} of {totalPages}
    </Typography>
    
    <Button 
      variant="outlined" 
      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      disabled={currentPage === totalPages || totalPages === 0}
    >
      Next
    </Button>
  </Box>
  );
  return (
    <SideNavBar>
      <Card sx={{ mt: -10, minHeight: 'calc(103vh - 64px)' }}>
        <Box p={3}>
          <Typography variant="h4" component="h1" color="primary" mb={2}>
            Employee PTO Management
          </Typography>
      
          <Box sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <Box sx={{ position: 'relative' }}>
                  <SearchIcon sx={{ 
                    position: 'absolute', 
                    left: '8px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#757575'
                  }} />
                  <TextField
                    fullWidth
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ '& .MuiInputBase-input': { pl: '32px' } }}
                  />
                </Box>
              </Box>
          

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                <Typography variant="body2">Page Size:</Typography>
                <TextField
                  type="number"
                  value={pageSize}
                  onChange={(e) => {
                    const newSize = Math.max(1, parseInt(e.target.value) || 10);
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  size="small"
                  sx={{ width: '60px' }}
                />
              </Box>
            </Box>
          </Box>
          
          
          <StatusFilterCheckbox />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: 'center' }}>
            {alphabet.map(letter => (
              <Button 
                key={letter} 
                onClick={() => handleLetterClick(letter)}
                variant={activeLetter === letter ? 'contained' : 'outlined'}
                sx={{
                  minWidth: '32px', 
                  height: '32px', 
                  p: 0,
                  backgroundColor: activeLetter === letter ? '#00B4D8' : 'inherit',
                  color: activeLetter === letter ? 'white !important' : 'inherit',
                  '&:hover': {
                    backgroundColor: activeLetter === letter ? '#0088A3' : 'rgba(0, 180, 216, 0.08)'
                  }
                }}
              >
                {letter}
              </Button>
            ))}
          </Box>
          <PaginationControls />
          
          <Divider sx={{ my: 2 }} />

          <EmployeeTable
            employees={paginatedData}
            loading={loading}
            error={error}
            year={year}
          />
          
        </Box>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SideNavBar>
  );
}