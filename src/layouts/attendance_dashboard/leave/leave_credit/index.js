import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  Chip,
  Typography,
  TextField,
  Button,
  Divider,
  MenuItem,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Checkbox,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Radio, RadioGroup,
  FormControlLabel,
  InputAdornment 
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Clear as ClearIcon,
  Business as BusinessIcon,
  CheckCircle,
  MoreVert,
  Check,
  Close
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import SideNavBar from 'layouts/attendance_dashboard/content_page/sidebar';
import LaunchIcon from '@mui/icons-material/Launch';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { axiosPrivate } from 'api/axios';

// Constants
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({length: 5}, (_, i) => currentYear + i);

// Helper Functions
const formatTimeProfessional = (timeString) => {
  if (!timeString) return '--:--';
  try {
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours, 10);
    const isPM = hourNum >= 12;
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minutes.padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
  } catch (e) {
    return timeString;
  }
};



const formatDisplayDate = (dateString) => {
  if (!dateString) {
    return ""; 
  }
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      timeZone: "Asia/Manila"
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e); 
    return '';
  }
};
const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
};

const StatusBadge = ({ status, clickable = false }) => {
  const statusStyles = {
    Active: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Holiday: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    'Newly Hired': { background: 'linear-gradient(to right, #2196F3, #64B5F6)', color: 'white' },
    Probation: { background: 'linear-gradient(to right, #FF9800, #FFB74D)', color: 'white' },
    Floating: { background: 'linear-gradient(to right, #FF9800, #FFB74D)', color: 'white' },
   'On Leave': { background: 'linear-gradient(to right, #9C27B0, #BA68C8)', color: 'white' },
   'Leave': { background: 'linear-gradient(to right, #9C27B0, #BA68C8)', color: 'white' },
    Training: { background: 'linear-gradient(to right, #00BCD4, #4DD0E1)', color: 'white' },
    Resigned: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Terminated: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    pending: { background: '#FFA000', color: 'white' },
    approved: { background: '#4CAF50', color: 'white' },
    rejected: { background: '#F44336', color: 'white' },
    default: { background: '#e0e0e0', color: 'rgba(0, 0, 0, 0.87)' }
  };

  return (
    <span style={{
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'capitalize',
      cursor: clickable ? 'pointer' : 'default',
      ...(statusStyles[status] || statusStyles.default)
    }}>
      {status}
    </span>
  );
};

const LeaveActionModal = ({ open, onClose, leaveApplication, onApprove, onReject, onRemarksChange, processing }) => {
  const [remarks, setRemarks] = useState(leaveApplication?.remarks || '');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [requestType, setRequestType] = useState('paid leave'); 

  useEffect(() => {
    if (leaveApplication) {
      setRemarks(leaveApplication.remarks || '');
    }
  }, [leaveApplication?.id]);

 const handleRemarksChange = useCallback((e) => {
    const newRemarks = e.target.value;
    setRemarks(newRemarks);
    if (onRemarksChange) {
      onRemarksChange(newRemarks);
    }
  }, [onRemarksChange]);

  // Calculate the leave credits display
  const renderLeaveCredits = () => {
    if (!leaveApplication?.leave_credits || leaveApplication.leave_credits.length === 0) {
      return (
        <Typography variant="body1" color="error.main">
          No leave credits available
        </Typography>
      );
    }
    const remainingDays = lc.total_days - (lc.is_paid || 0);
    const isZeroCredits = remainingDays === 0;
    return (
   <Box 
    key={`${lc.leave_type}-${lc.year}`}
    display="flex"
    alignItems="center"
    gap={1}
    sx={{
      p: 1,
      backgroundColor: isCurrentLeaveType ? '#e3f2fd' : 'transparent',
      borderRadius: 1,
      border: isCurrentLeaveType ? '1px solid #bbdefb' : 'none'
    }}
    >
    <Typography variant="body1" fontWeight={isCurrentLeaveType ? 600 : 400}>
      {lc.leave_type.charAt(0).toUpperCase() + lc.leave_type.slice(1)}:
    </Typography>
    <Typography 
      variant="body1" 
      color={isZeroCredits ? 'error.main' : isCurrentLeaveType ? 'primary.main' : 'text.primary'}
      fontWeight={isCurrentLeaveType ? 600 : 400}
    >
      {lc.is_paid || 0} / {lc.total_days} days paid
    </Typography>
    {isCurrentLeaveType && (
      <Tooltip title="This leave type is being used for the current application">
        <CheckCircle color="primary" fontSize="small" />
      </Tooltip>
    )}
  </Box>
    );

  };

  //Render leave credit balance
  const renderLeaveCreditsModal = () => {
  if (!leaveApplication?.leave_credits || leaveApplication.leave_credits.length === 0) {
    return (
      <Typography variant="body1" color="error.main">
        No leave balance
      </Typography>
    );
  }

  return (
    <Box display="flex" flexDirection="column">
      {leaveApplication.leave_credits.map((lc) => {
        // Determine the correct field to subtract based on leave type
        const isBirthdayLeave = lc.leave_type.toLowerCase() === 'birthday';
        const used = isBirthdayLeave ? lc.is_paid_birthday || 0 : lc.is_paid || 0;
        const remainingDays = lc.total_days - used;

        const isZeroCredits = remainingDays === 0;
        const isCurrentLeaveType = lc.leave_type === leaveApplication.leave_type.toLowerCase();

        return (
          <Box 
            key={`${lc.leave_type}-${lc.year}`}
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              mb: -2,
              p: 1,
              backgroundColor: isCurrentLeaveType ? '#e3f2fd' : 'transparent',
              borderRadius: 1,
              border: isCurrentLeaveType ? '1px solid #bbdefb' : 'none'
            }}
          >
            <Typography variant="body1" fontWeight={isCurrentLeaveType ? 600 : 400}>
              {lc.leave_type.charAt(0).toUpperCase() + lc.leave_type.slice(1)}:
            </Typography>
            <Typography 
              variant="body1" 
              color={isZeroCredits ? 'error.main' : isCurrentLeaveType ? 'primary.main' : 'text.primary'}
              fontWeight={isCurrentLeaveType ? 600 : 400}
            >
              {`${remainingDays} ${remainingDays === 1 ? 'day' : 'days'} remaining`}
            </Typography>
            {isCurrentLeaveType && (
              <Tooltip title="This leave type is being used for the current application">
                <CheckCircle color="primary" fontSize="small" />
              </Tooltip>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle style={{ 
        textAlign: 'center', 
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
        color: '#000',
        padding: '16px'
      }}>
        <Typography variant="h4" component="h1" color="primary" sx={{mb:1.5}}>EMPLOYEE LEAVE APPLICATION FORM</Typography>
        <div>
          {renderLeaveCreditsModal()}
        </div>
      </DialogTitle>
      <DialogContent dividers style={{ color: '#000' }}>
        

        
        {/* Employee Information Section */}
        <Box mb={3} p={2} border={1} borderColor="#e0e0e0" borderRadius={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1" style={{ fontWeight: '400' }}>
                Employee Name: {leaveApplication?.employee_name || ''}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" style={{ fontWeight: '400' }}>
                Position: {leaveApplication?.position || ''}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" style={{ fontWeight: '400' }}>
                Account Assigned: {leaveApplication?.account || ''}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" style={{ fontWeight: '400', whiteSpace: 'nowrap' }}>
                Date Filed: {formatDisplayDate(leaveApplication?.applied_at) || 'Invalid Date'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Leave Details Section */}
        <Box mb={3} p={2} border={1} borderColor="#e0e0e0" borderRadius={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1" style={{ fontWeight: '400' }}>
                Date Covered: {formatDisplayDate(leaveApplication?.start_date) || 'N/A'} to {formatDisplayDate(leaveApplication?.end_date) || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" style={{ fontWeight: '400' }}>
                No. of Days: {calculateLeaveDays(leaveApplication?.start_date, leaveApplication?.end_date) || '1'} day(s)
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" style={{ fontWeight: '400' }}>
                Date of Return to Work: {formatDisplayDate(leaveApplication?.return_date || leaveApplication?.end_date) || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" style={{ fontWeight: '400' }}>
                Leave to be Applied: {leaveApplication?.leave_type || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
                   <RadioGroup
                     row
                     value={requestType}
                     onChange={(e) => setRequestType(e.target.value)}
                   >
                    <FormControlLabel
                        value="paid leave"
                        control={<Radio />}
                        label="With Pay"
                        sx={{
                          '& .MuiFormControlLabel-label': {
                            color: 'black !important',
                          },
                        }}
                      />

                     <FormControlLabel
                      value="unpaid leave"
                      control={<Radio />}
                      label="Without Pay"
                      disabled={selectedLeave?.leave_type?.toLowerCase() === 'birthday leave'}
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          color: selectedLeave?.leave_type?.toLowerCase() === 'birthday leave' 
                            ? 'text.disabled' 
                            : 'black !important',
                        },
                      }}
                    />
                   </RadioGroup>
            </Grid>

          </Grid>
        </Box>

        {/* Policy Section */}
        <Box mb={3} p={2} border={1} borderColor="#e0e0e0" borderRadius={1}>
          <Typography variant="body1" style={{ fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>
            I UNDERSTAND THAT:
          </Typography>
          <Typography variant="body2" component="div" style={{ marginLeft: '16px', color: '#000' }}>
            <ol style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px', fontWeight: '400' }}>
                All leave of absence application must be filed <span style={{ color: 'red', fontWeight: 'bold' }}>TWO (2) WEEKS</span> before the planned date.
              </li>
              <li style={{ marginBottom: '8px', fontWeight: '400' }}>
                This shall be subject for approval by the assigned Client and the Operations Manager.
              </li>
              <li style={{ marginBottom: '8px', fontWeight: '400' }}>
                Leave due to sickness/medical reason should be filed or communicated to the immediate supervisor or the Operations Manager asap with acknowledgement. Sickness leave more than 2 days must be supported by doctor's certificate and must be filed upon return to work/duty.
              </li>
            </ol>
          </Typography>
          <Typography variant="body2" style={{ color: '#000', fontStyle: 'italic', marginTop: '12px', fontWeight: '400' }}>
            I hereby request leave of absence from duty as indicated above and certify such leave/absence is requested for the purpose(s) indicated.
          </Typography>
        </Box>

        {/* Remarks Section */}
        <Box mt={1.5}>
          <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>
            Remarks:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={remarks}
            onChange={handleRemarksChange}
            variant="outlined"
            placeholder="Enter remarks here..."
            InputProps={{
              style: { color: '#000' }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions style={{ padding: '16px' }}>
        <Button 
          startIcon={<Close />} 
          style={{ 
            backgroundColor: '#f44336',
            color: 'white',
            fontWeight: 'bold'
          }}
          onClick={() => onReject(leaveApplication.id)}
          disabled={leaveApplication?.status === 'approved' || leaveApplication?.status === 'rejected' || processing}
        >
          {processing ? 'Processing...' : 'Reject'}
        </Button>
       <Button 
        startIcon={<Check />} 
        style={{ 
          backgroundColor: '#4caf50',
          color: 'white',
          fontWeight: 'bold'
        }}
        onClick={() => onApprove(leaveApplication.id, requestType === 'paid leave')}
        disabled={leaveApplication?.status === 'approved' || leaveApplication?.status === 'rejected' || processing}
       >
        {processing ? 'Processing...' : 'Approve'}
      </Button>
      </DialogActions>
      <Box p={1} style={{ textAlign: 'center', color: 'black', fontWeight: '300' }}>
        © 2025 Eighty20 Virtual, Inc
      </Box>
    </Dialog>
  );
};

const EmployeeTable = ({ 
  employees = [], 
  loading, 
  error, 
  selectedEmployees,
  onSelectEmployee,
  onSubmitSelected,
  year
}) => {
  const [selectAll, setSelectAll] = useState(false);

  // Filter out Resigned and Floating status employees
  const activeEmployees = employees.filter(employee => 
    employee?.status !== "Resigned" && employee?.status !== "Floating" && employee?.status !== "AWOL" && employee?.status !== "Terminated" 
  );

  useEffect(() => {
    const selectableEmployees = activeEmployees.filter(emp => {
        const hasRegular = (emp.leave_credits || []).some(lc => 
          lc.leave_type === 'regular' && lc.year === year
        );
        const hasSpecial = (emp.leave_credits || []).some(lc => 
          lc.leave_type === 'birthday' && lc.year === year
        );
        return !(hasRegular && hasSpecial);
    }).map(emp => emp.id);
    
    setSelectAll(
        selectedEmployees.length === selectableEmployees.length && 
        selectableEmployees.length > 0
    );
  }, [selectedEmployees, activeEmployees, year]);

  const handleSelectAll = (event) => {
    const selectableEmployees = activeEmployees.filter(emp => {
      const hasRegular = (emp.leave_credits || []).some(lc => 
        lc.leave_type === 'regular' && lc.year === year
      );
      const hasSpecial = (emp.leave_credits || []).some(lc => 
        lc.leave_type === 'birthday' && lc.year === year
      );
      return !(hasRegular && hasSpecial);
    }).map(emp => emp.id);
    
    if (event.target.checked) {
      onSelectEmployee(selectableEmployees);
    } else {
      onSelectEmployee([]);
    }
  };

  const handleSelectEmployee = (employeeId) => {
    if (selectedEmployees.includes(employeeId)) {
      onSelectEmployee(selectedEmployees.filter(id => id !== employeeId));
    } else {
      onSelectEmployee([...selectedEmployees, employeeId]);
    }
  };


  if (loading) {
    return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>;
  }

  if (error) {
    return <Box p={1}><Alert severity="error">{error}</Alert></Box>;
  }

  if (activeEmployees.length === 0) {
    return <Box p={1}><Alert severity="info">No active employees found</Alert></Box>;
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
            <th style={{ padding: '12px 16px', width: '50px' }}>
              <Checkbox
                checked={selectAll}
                onChange={handleSelectAll}
                color="primary"
                indeterminate={selectedEmployees.length > 0 && !selectAll}
              />
            </th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Employee</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Schedule</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Regularization Date</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Regular Leave</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Birthday Leave</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Status</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Processed By</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date Processed</th>
          </tr>
        </thead>
        <tbody>
          {activeEmployees.map((employee) => {
            const leaveCredits = employee.leave_credits || []; 
            const hasRegularLeave = leaveCredits.some(
              lc => lc.leave_type === 'regular' && lc.year === year
            );
            const hasSpecialLeave = leaveCredits.some(
              lc => lc.leave_type === 'birthday' && lc.year === year
            );
            const hasBothLeaves = hasRegularLeave && hasSpecialLeave;
            const isSelectable = !hasBothLeaves;
            
            return (
              <tr key={employee.id} style={{ 
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: selectedEmployees.includes(employee.id) ? '#f0f7ff' : 'inherit',
              }}>
                <td style={{ padding: '12px 16px' }}>
                  <Checkbox
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={() => isSelectable && handleSelectEmployee(employee.id)}
                    color="primary"
                    disabled={!isSelectable}
                  />
                  {hasBothLeaves && (
                    <Tooltip title={`Leave credits already initialized for ${year}`}>
                      <CheckCircle color="success" fontSize="small" style={{ marginLeft: 8 }} />
                    </Tooltip>
                  )}
                </td>
                
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
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {formatTimeProfessional(employee?.time_in)} - {formatTimeProfessional(employee?.time_out)} 
                  </Box>
                    <div>
                    {employee?.contract_hours} hrs
                    </div>
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {formatDisplayDate(employee?.employment_date || 'N/A')}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {(employee?.leave_credits?.length || 0) > 0 ? (
                    employee.leave_credits
                      .filter(lc => lc?.leave_type.toLowerCase() === 'regular')
                      .map(lc => {
                        const remainingDays = lc.total_days - (lc.is_paid || 0);
                        const isZeroCredits = remainingDays === 0;
                        return (
                          <Box
                            key={`regular-${lc.year}`}
                            fontSize="0.9rem"
                            color={isZeroCredits ? 'error.main' : 'inherit'}
                          >
                            {remainingDays}
                          </Box>
                        );
                      })
                  ) : (
                    <Box color="error.main" fontSize="0.9rem">None</Box>
                  )}
                </td>

                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {(employee?.leave_credits?.length || 0) > 0 ? (
                    employee.leave_credits
                      .filter(lc => lc?.leave_type.toLowerCase() === 'birthday')
                      .map(lc => {
                        const remainingDays = (lc.total_days) - (lc.is_paid_birthday || 0);
                        const isZeroCredits = remainingDays === 0;
                        return (
                          <Box
                            key={`birthday-${lc.year}`}
                            fontSize="0.9rem"
                            color={isZeroCredits ? 'error.main' : 'inherit'}
                          >
                            {remainingDays}
                          </Box>
                        );
                      })
                  ) : (
                    <Box color="error.main" fontSize="0.9rem">None</Box>
                  )}
                </td>
                
                <td style={{ padding: '12px 16px' }}>
                  <StatusBadge status={employee?.status || 'Unknown'} />
                </td>
                
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {(employee?.leave_credits?.length || 0) > 0 ? (
                    <Box fontSize="0.9rem">
                      {employee.leave_credits[0]?.created_by || 'System Admin'}
                    </Box>
                  ) : (
                    <Box color="error.main" fontSize="0.9rem">N/A</Box>
                  )}
                </td>
                 <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    {formatDisplayDate(employee.leave_credits[0]?.processed_at) || ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {selectedEmployees.length > 0 && (
        <Box sx={{ 
          position: 'sticky', 
          bottom: 16, 
          right: 16, 
          display: 'flex', 
          justifyContent: 'flex-end',
          mt: 2,
          p: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 1,
          boxShadow: 2
        }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onSubmitSelected}
            startIcon={<CheckCircle />}
            sx={{ minWidth: 300, color: 'white !important' }}
          >
            Initialize Leave Credits ({selectedEmployees.length} Selected)
          </Button>
        </Box>
      )}
    </Box>
  );
};

 const LeaveApplications = ({ clients, loading, error, refreshData }) => { 
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [processing, setProcessing] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState({
    pending: true,
    approved: true,
    rejected: true
  });
  const [leaveTypeFilter, setLeaveTypeFilter] = useState({});
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  // Initialize leave type filter options
  useEffect(() => {
    if (clients.length > 0) {
      const types = [...new Set(clients.map(client => client.leave_type))];
      const initialLeaveTypeFilter = {};
      types.forEach(type => {
        initialLeaveTypeFilter[type] = true;
      });
      setLeaveTypeFilter(initialLeaveTypeFilter);
    }
  }, [clients]);

  const handleOpenModal = useCallback((leaveApplication) => {
    setSelectedLeave(leaveApplication);
    setRemarks(leaveApplication.remarks || '');
    setModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const stringToColor = (string) => {
    if (!string) return '#000000';
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).slice(-2);
    }

    return color;
  };

  const handleApprove = async (id, isPaid) => {
    try {
      setProcessing(true);
      const storedEmployee = localStorage.getItem('employee');
      const currentEmployee = storedEmployee ? JSON.parse(storedEmployee) : null;
      const processedBy = currentEmployee 
        ? `${currentEmployee.first_name} ${currentEmployee.last_name}`
        : 'System Admin';
      const processedAt = new Date().toISOString();

      // Check if this is birthday leave
      const isBirthdayLeave = selectedLeave?.leave_type?.toLowerCase() === 'birthday leave';

      const response = await axiosPrivate.patch(
        `attendance/leave-applications/${id}/`,
        {
          status: 'approved',
          remarks: remarks,
          is_paid: isBirthdayLeave ? true : isPaid,
          processed_by: processedBy,
          approval_date: processedAt,
        }
      );

      const days = calculateLeaveDays(selectedLeave.start_date, selectedLeave.end_date);
      
      setSnackbar({
        open: true,
        message: isBirthdayLeave 
          ? `Approved ${days} paid day(s) from birthday leave`
          : isPaid
            ? `Approved ${days} paid day(s) - added to paid leave balance`
            : `Approved ${days} unpaid day(s) - added to used leave days`,
        severity: 'success'
      });
      
      await refreshData();
    } catch (error) {
      let errorMessage = 'Failed to approve leave';
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('regular leave credits')) {
          errorMessage = 'Cannot approve: Regular leave credits not initialized';
        } else if (error.response.data.error.includes('birthday leave credits')) {
          errorMessage = 'Cannot approve: Birthday leave credits not initialized';
        } else if (error.response.data.error.includes('exceed available')) {
          errorMessage = 'Cannot approve: Would exceed available paid leave days';
        }
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setProcessing(false);
      handleCloseModal();
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessing(true);
      const storedEmployee = localStorage.getItem('employee');
      const currentEmployee = storedEmployee ? JSON.parse(storedEmployee) : null;
      const processedBy = currentEmployee 
        ? `${currentEmployee.first_name} ${currentEmployee.last_name}`
        : 'System Admin';
      const processedAt = new Date().toISOString();

      await axiosPrivate.patch(`attendance/leave-applications/${id}/`, {
        status: 'rejected',
        remarks: remarks,
        processed_by: processedBy,
        approval_date: processedAt
      });
      
      setSnackbar({
        open: true,
        message: 'Leave application rejected successfully',
        severity: 'success'
      });
      
      await refreshData();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to reject leave application',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
      handleCloseModal();
    }
  };

  const handleRemarksChange = (value) => {
    setRemarks(value);
  };

  // Filter functions
  const filterBySearchTerm = (client) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      client.employee_name?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.reason?.toLowerCase().includes(term) ||
      client.remarks?.toLowerCase().includes(term) ||
      client.processed_by?.toLowerCase().includes(term)
    );
  };

  const filterByStatus = (client) => {
    return statusFilter[client.status?.toLowerCase()] || false;
  };

  const filterByDateRange = (client) => {
    if (!dateRange.startDate && !dateRange.endDate) return true;
    
    const startDate = new Date(client.start_date);
    const endDate = new Date(client.end_date);
    
    if (dateRange.startDate && dateRange.endDate) {
      const filterStart = new Date(dateRange.startDate);
      const filterEnd = new Date(dateRange.endDate);
      return (startDate >= filterStart && endDate <= filterEnd);
    }
    
    if (dateRange.startDate) {
      const filterStart = new Date(dateRange.startDate);
      return startDate >= filterStart;
    }
    
    if (dateRange.endDate) {
      const filterEnd = new Date(dateRange.endDate);
      return endDate <= filterEnd;
    }
    
    return true;
  };

  // Apply all filters
  const filteredClients = clients.filter(client => 
    filterBySearchTerm(client) &&
    filterByStatus(client) &&
    filterByDateRange(client)
  );

 const sortedClients = [...filteredClients].sort((a, b) => {
  // For pending status, show newest first
  if (a.status === 'pending' && b.status === 'pending') {
    return new Date(b.applied_at) - new Date(a.applied_at);
  }
  // For non-pending, also sort by newest first
  if (a.status !== 'pending' && b.status !== 'pending') {
    return new Date(b.applied_at) - new Date(a.applied_at);
  }
  // Keep pending applications at the top
  return a.status === 'pending' ? -1 : 1;
  });

  // Toggle functions for filters
  const toggleStatusFilter = (status) => {
    setStatusFilter(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };
  const handleDateRangeChange = (which, date) => {
    setDateRange(prev => ({
      ...prev,
      [which]: date
    }));
  };

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function formatDisplayDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  function calculateLeaveDays(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>;
  if (error) return <Box p={1}><Alert severity="error">{error}</Alert></Box>;
  
  return (
    <>
      {/* Filter Controls */}
      <Box mb={3} p={3} bgcolor="#fff" borderRadius={3} boxShadow={4}>
      <Grid container spacing={2} alignItems="center">
        {/* Status Filters */}
        <Grid item xs={12} md={6} lg={6}>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {Object.entries(statusFilter).map(([status, checked]) => (
              <FormControlLabel
                key={status}
                control={
                  <Checkbox
                    checked={checked}
                    onChange={() => toggleStatusFilter(status)}
                    size="small"
                    color="primary"
                  />
                }
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                sx={{
                  m: 0,
                  '& .MuiFormControlLabel-label': { fontWeight: 500 },
                }}
              />
            ))}
          </Box>
        </Grid>

        {/* Date Pickers */}
        <Grid item xs={12} md={6} lg={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.startDate}
                  onChange={(date) => handleDateRangeChange('startDate', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      sx={{ borderRadius: 2, backgroundColor: '#f9f9f9' }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={dateRange.endDate}
                  onChange={(date) => handleDateRangeChange('endDate', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      sx={{ borderRadius: 2, backgroundColor: '#f9f9f9' }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>

      
      {/* Results count */}
      <Box mb={2}>
        <Typography variant="body2" color="textSecondary">
          Showing {filteredClients.length} of {clients.length} leave applications
        </Typography>
      </Box>

      {/* Table */}
      <Box width="100%" overflow="auto">
        <table style={{ 
          width: '100%',
          minWidth: '1200px',
          borderCollapse: 'collapse',
          fontSize: '0.875rem'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Action</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date Filed</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Employee</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Leave Type</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Start to End Date</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Regular Leave</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Birthday Leave</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Reason</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Remarks</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Processed By</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date Processed</th>
            </tr>
          </thead>
          <tbody>
            {sortedClients.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ padding: '20px', textAlign: 'center' }}>
                  <Alert severity="info">No leave applications match your filters</Alert>
                </td>
              </tr>
            ) : (
              sortedClients.map((client) => (  
                <tr key={client.id} style={{ borderBottom: '1px solid #e0e0e0', ':hover': { backgroundColor: '#f5f5f5' } }}>
                  <td style={{ padding: '12px 16px' }}>
                    <IconButton onClick={() => handleOpenModal(client)}>
                      <LaunchIcon color="primary" />
                    </IconButton>
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    {formatDisplayDate(client?.applied_at) || "N/A"}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: stringToColor(client?.employee_name), 
                        fontSize: '0.75rem' 
                      }}>
                        {getInitials(client?.employee_name)} 
                      </Avatar>
                      <Box>
                        <Box fontWeight={500}>{client.employee_name}</Box>
                        <Box fontSize="0.75rem" color="#666">{client.email}</Box>
                      </Box>
                    </Box>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{client.leave_type}</td>
                  <td style={{ padding: '12px 16px'}}>
                    {formatDisplayDate(client.start_date)} to {formatDisplayDate(client.end_date)}
                    {client.start_date && client.end_date && (
                      <div>
                        <span style={{color: 'black'}}>
                          ({calculateLeaveDays(client.start_date, client.end_date)}{" "}
                          {calculateLeaveDays(client.start_date, client.end_date) === 1 ? 'day' : 'days'})
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {client.leave_credits && client.leave_credits.length > 0 ? (
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {client.leave_credits
                        .filter(lc => lc?.leave_type.toLowerCase() === 'regular')
                        .map(lc => {
                          const remainingDays = lc.total_days - (lc.is_paid || 0);
                          const isZeroCredits = remainingDays === 0;
                          return (
                            <Box 
                              key={`${lc.leave_type}-${lc.year}`} 
                              fontSize="0.9rem"
                              color={isZeroCredits ? 'error.main' : 'inherit'}
                            >
                              {remainingDays}
                            </Box>
                          );
                        })}
                    </Box>
                  ) : (
                    <Box color="error.main" fontSize="0.9rem">None</Box>
                  )}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {client.leave_credits && client.leave_credits.length > 0 ? (
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {client.leave_credits
                        .filter(lc => lc?.leave_type.toLowerCase() === 'birthday')
                        .map(lc => {
                          const remainingDays = lc.total_days - (lc.is_paid_birthday || 0);
                          const isZeroCredits = remainingDays === 0;
                          return (
                            <Box 
                              key={`${lc.leave_type}-${lc.year}`} 
                              fontSize="0.9rem"
                              color={isZeroCredits ? 'error.main' : 'inherit'}
                            >
                              {remainingDays}
                            </Box>
                          );
                        })}
                    </Box>
                  ) : (
                    <Box color="error.main" fontSize="0.9rem">None</Box>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>{client.reason}</td>
                <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={client.status || 'pending'} />
                </td>
                <td style={{ padding: '12px 16px' }}>
                    {client.remarks || ''}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    {client.processed_by || ''}
                </td>
                 <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    {formatDisplayDate(client.approval_date) || ''}
                </td>
                  
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>

      <LeaveActionModal
        open={modalOpen}
        onClose={handleCloseModal}
        leaveApplication={selectedLeave}
        onApprove={handleApprove}
        onReject={handleReject}
        onRemarksChange={handleRemarksChange}
        processing={processing}
      />
      
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
    </>
  );
};

export default function BrowserUsersTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [allUsers, setAllUsers] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLetter, setActiveLetter] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [year, setYear] = useState(currentYear);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previousBalances, setPreviousBalances] = useState({});
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
  
      const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 0) {
        const [employeesResponse, leaveCreditsResponse] = await Promise.all([
          axiosPrivate.get('attendance/employees/'),
          axiosPrivate.get('attendance/leave-credits/', {
            params: { year }
          })
        ]);

        // Transform leave credits data into a more usable format
        const leaveCreditsByEmployee = {};
        leaveCreditsResponse.data.forEach(lc => {
          if (!leaveCreditsByEmployee[lc.employee]) {
            leaveCreditsByEmployee[lc.employee] = [];
          }
          leaveCreditsByEmployee[lc.employee].push(lc);
        });

        // Merge with employee data
        const employeesWithLeaveCredits = employeesResponse.data.map(emp => ({
          ...emp,
          leave_credits: leaveCreditsByEmployee[emp.id] || []
        }));

        setAllUsers(employeesWithLeaveCredits);
        setFilteredData(employeesWithLeaveCredits);
      } else {
        const response = await axiosPrivate.get('attendance/leave-applications/');
        setAllClients(response.data);
        setFilteredData(response.data);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  const [editMode, setEditMode] = useState(false);
  const [editableCredits, setEditableCredits] = useState({});
  
  useEffect(() => {
  if (activeTab === 0 && filteredData.length > 0) {
    const credits = {};
    filteredData.forEach(employee => {
      credits[employee.id] = {
        regular: 5, // Default value
        birthday: 1  // Default value
      };
    });
    setEditableCredits(credits);
  }
}, [filteredData, activeTab]);

  useEffect(() => {
    fetchData();
  }, [activeTab, year]);

  useEffect(() => {
    const data = activeTab === 0 ? allUsers : allClients;
    let filtered = [...data];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.first_name?.toLowerCase().includes(term) || 
         item.last_name?.toLowerCase().includes(term) || 
         item.email?.toLowerCase().includes(term) ||
         (item.employee_name?.toLowerCase().includes(term)))
      );
    }
    
    if (activeLetter) {
      filtered = filtered.filter(item => 
        (item.first_name?.[0]?.toUpperCase() === activeLetter) ||
        (item.employee_name?.[0]?.toUpperCase() === activeLetter)
      );
    }
    
    setFilteredData(filtered);
  }, [searchTerm, activeLetter, allUsers, allClients, activeTab]);
  
useEffect(() => {
  if (activeTab === 1 && filteredData.length > 0) {
    const newBalances = {};
    filteredData.forEach(client => {
      client.leave_credits?.forEach(lc => {
        const key = `${client.id}-${lc.leave_type}`;
        newBalances[key] = `${lc.total_days - (lc.used_days || 0)}/${lc.total_days}`;
      });
    });
    setPreviousBalances(newBalances);
  }
}, [filteredData, activeTab]);

  const handleSelectEmployee = (employeeIds) => {
    setSelectedEmployees(employeeIds);
  };

  const handleSubmitSelected = async () => {
    try {
      setLoading(true);
      
      const storedEmployee = localStorage.getItem('employee');
      const currentEmployee = storedEmployee ? JSON.parse(storedEmployee) : null;
      const createdBy = currentEmployee 
        ? `${currentEmployee.first_name} ${currentEmployee.last_name}` 
        : 'System Admin';
      await axiosPrivate.post('attendance/initialize-leave-credits/', {
        employee_ids: selectedEmployees,
        year,
        created_by: createdBy,
        processed_at: new Date().toISOString()
      });
      
      await fetchData();
      setSelectedEmployees([]);
      
      setSnackbar({
        open: true,
        message: `Successfully initialized leave credits for ${selectedEmployees.length} employees`,
        severity: 'success'
      });
      
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to initialize leave credits',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleLetterClick = (letter) => {
    setActiveLetter(activeLetter === letter ? null : letter);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchTerm('');
    setActiveLetter(null);
    setSelectedEmployees([]);
  };

  return (
    <SideNavBar>
      <Card sx={{ mt: -10, minHeight: 'calc(103vh - 64px)' }}>
        <Box p={3}>
          <Typography variant="h4" component="h1" color="primary" mb={2}>
            Leave Management
          </Typography>
          
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Leave Credits" icon={<PersonIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Leave Requests" icon={<BusinessIcon fontSize="small" />} iconPosition="start" />
          </Tabs>
          
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
                    placeholder={`Search ${activeTab === 0 ? 'employees' : 'leave requests'}...`}
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
                  onChange={(e) => setPageSize(Math.max(1, parseInt(e.target.value) || 10))}
                  size="small"
                  sx={{ width: '60px' }}
                />
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
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
                  backgroundColor: activeLetter === letter ? '#2E7D32' : 'inherit',
                  color: activeLetter === letter ? 'white !important' : 'inherit',
                  '&:hover': {
                    backgroundColor: activeLetter === letter ? '#1B5E20' : 'rgba(46, 125, 50, 0.08)'
                  }
                }}
              >
                {letter}
              </Button>
            ))}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {activeTab === 0 ? (
            <EmployeeTable
              employees={filteredData}
              loading={loading}
              error={error}
              selectedEmployees={selectedEmployees}
              onSelectEmployee={handleSelectEmployee}
              onSubmitSelected={handleSubmitSelected}
              year={year}
            />
          ) : (
            <LeaveApplications
              clients={filteredData}
              loading={loading}
              error={error}
              refreshData={fetchData}
            />
          )}
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