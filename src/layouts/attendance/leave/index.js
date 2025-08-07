import React, { useState, useEffect } from "react";
import api from "api/axios";
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import {
  Card,
  Typography,
  Box,
  Tabs,
  Fab,
  Tab,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  IconButton,
  Grid,
  Badge,
  Chip,
  Stack,
  Alert,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Add,
  AccessTime,
  Close,
  Send,
  PendingActions,
  CheckCircle,
  Cancel,
  Event,
  Person,
  Email,
  Phone,
  ContactEmergency,
  EventAvailable,
  Description,
  AttachFile,
  Delete
} from '@mui/icons-material';
import SideNavBar from "../content_page/nav_bar";
import '../content_page/css/admintable.css';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const StatusBadge = ({ status, count }) => {
  const statusConfig = {
    pending: { color: 'warning', icon: <PendingActions fontSize="small" /> },
    approved: { color: 'success', icon: <CheckCircle fontSize="small" /> },
    rejected: { color: 'error', icon: <Cancel fontSize="small" /> }
  };

  return (
    <Badge badgeContent={count} color={statusConfig[status].color} sx={{ '& .MuiBadge-badge': { right: -15, mt: 1.5 } }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {statusConfig[status].icon}
        <Typography variant="body2" textTransform="capitalize">
          {status}
        </Typography>
      </Stack>
    </Badge>
  );
};

const FileUploadArea = ({ file, setFile, isRequired, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileValidation(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileValidation(e.target.files[0]);
    }
  };

  const handleFileValidation = (file) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF, DOC, JPG, or PNG files.');
      return;
    }

    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 5MB.');
      return;
    }

    setFile(file);
  };

  return (
    <Box
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{
        border: '2px dashed',
        borderColor: error ? 'error.main' : isDragging ? 'primary.main' : 'grey.300',
        borderRadius: 1,
        p: 3,
        textAlign: 'center',
        backgroundColor: isDragging ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        mb: 1
      }}
    >
      <input
        type="file"
        id="file-upload"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Stack alignItems="center" spacing={1}>
          <AttachFile fontSize="large" color={error ? 'error' : 'action'} />
          <Typography variant="body1" color={error ? 'error' : 'text.primary'}>
            {file ? file.name : 'Drag & drop files here or click to browse'}
          </Typography>
          <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
            {file ? '' : 'Supports: PDF, DOC, JPG, PNG (Max 5MB)'}
          </Typography>
          <Button variant="outlined" component="span" sx={{ mt: 1 }}>
            Browse Files
          </Button>
        </Stack>
      </label>
      {file && (
        <Button
          size="small"
          onClick={() => setFile(null)}
          startIcon={<Delete />}
          sx={{ mt: 1 }}
        >
          Remove File
        </Button>
      )}
      {error && !file && (
        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
          File attachment is required
        </Typography>
      )}
    </Box>
  );
};

const LeaveFormModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [historyTabValue, setHistoryTabValue] = useState("pending");
  const [formData, setFormData] = useState({
    employee: "",
    employee_name: "",
    team: "",
    department: "",
    email: "",
    time_in: "",
    time_out: "",
    position: "",
    birthdate: "",
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    contact_during_leave: "",
    emergency_contact: "",
  });
  const [responseMsg, setResponseMsg] = useState("");
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [file, setFile] = useState(null);
  const [leaveCredits, setLeaveCredits] = useState(null);
  const [formErrors, setFormErrors] = useState({
    file: false,
    leave_type: false,
    start_date: false,
    end_date: false,
    reason: false,
  });
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayType, setHalfDayType] = useState('first_half');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const leaveTypes = [
    { value: "Bereavement Leave", label: "Bereavement Leave" },
    { value: "Birthday Leave", label: "Birthday Leave" },
    { value: "Casual Leave", label: "Casual Leave" },
    { value: "Emergency Leave", label: "Emergency Leave" },
    { value: "Maternity Leave", label: "Maternity Leave" },
    { value: "Vacation Leave", label: "Vacation Leave" },
    { value: "Sick Leave", label: "Sick Leave" },
  ];

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      const emp = JSON.parse(storedEmployee);
      const full_name = `${emp.first_name} ${emp.last_name}`;
      setEmployee(emp);
      setFormData(prev => ({
        ...prev,
        employee: emp.id,
        employee_name: full_name,
        email: emp.email || "",
        team: emp.team,
        time_in: emp.time_in,
        time_out: emp.time_out,
        department: emp.department,
        position: emp.position,
        birthdate: emp.birthdate
      }));
    }
  }, []);

  useEffect(() => {
    if (employee?.id) {
      fetchLeaveCredits(employee.id);
      fetchLeaveHistory();
    }
  }, [employee]);

  const fetchLeaveCredits = async (employeeId) => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await api.get(
        `attendance/leave-credits/?employee_id=${employeeId}&year=${currentYear}`
      );
      setLeaveCredits(response.data);
    } catch (err) {
      console.error("Error fetching leave credits:", err);
    }
  };

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/leave-applications/?employee_id=${employee.id}`);
      const data = Array.isArray(res.data) ? res.data : [];
      const normalizedData = data.map(item => ({
        ...item,
        status: item.status.toLowerCase()
      }));
      setLeaveHistory(normalizedData);
    } catch (error) {
      console.error("Error fetching history:", error);
      setLeaveHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateLeaveDays = (startDate, endDate, isHalfDay) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const fullDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    
    if (isHalfDay) {
      if (startDate === endDate) {
        return 0.5; 
      }
      return fullDays - 0.5; 
    }
    
    return fullDays;
  };

  const validateLeaveCredits = (leaveType, days) => {
    if (!leaveCredits) return true;
    
    const leaveTypeMap = {
      'Vacation Leave': 'vacation_leave',
      'Sick Leave': 'sick_leave',
    };
    
    const creditType = leaveTypeMap[leaveType];
    if (!creditType) return true;
    
    const availableCredits = leaveCredits[creditType] || 0;
    return availableCredits >= days;
  };

  const handleHalfDayChange = (e) => {
    const checked = e.target.checked;
    
    if (checked && formData.start_date && formData.end_date && formData.start_date !== formData.end_date) {
      setConfirmDialogConfig({
        title: 'Confirm Half-Day Leave',
        message: 'You have selected different dates with half-day leave. This will calculate as 0.5 days. Continue?',
        onConfirm: () => {
          setIsHalfDay(true);
          setFormData(prev => ({ ...prev, end_date: prev.start_date }));
          setConfirmDialogOpen(false);
        }
      });
      setConfirmDialogOpen(true);
    } else {
      setIsHalfDay(checked);
      if (checked) {
        setFormData(prev => ({ ...prev, end_date: prev.start_date }));
      }
    }
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: false }));
    
    if (name === 'start_date' && formData.leave_type === "Birthday Leave" && value) {
      setFormData(prev => ({ ...prev, end_date: value }));
    }
    
    if (formData.leave_type && (name === 'start_date' || name === 'end_date')) {
      const days = calculateLeaveDays(
        name === 'start_date' ? value : formData.start_date,
        name === 'end_date' ? value : formData.end_date,
        isHalfDay
      );
      const hasEnoughCredits = validateLeaveCredits(formData.leave_type, days);
      
      if (!hasEnoughCredits) {
        setResponseMsg(`Warning: You don't have enough ${formData.leave_type} credits for this duration`);
      } else {
        setResponseMsg("");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'leave_type') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        start_date: "",
        end_date: ""
      }));
      setIsHalfDay(false);
    } else if (name === 'start_date' || name === 'end_date') {
      handleDateChange(name, value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setFormErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateBirthdayLeave = (birthDate, startDate) => {
    if (!birthDate || !startDate) return false;
    
    const birthDateObj = new Date(birthDate);
    const startDateObj = new Date(startDate);
    
    const windowStart = new Date(birthDateObj);
    const windowEnd = new Date(birthDateObj);
    windowEnd.setDate(windowEnd.getDate() + 29);
    
    return startDateObj >= windowStart && startDateObj <= windowEnd;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (!formData.leave_type) {
      newErrors.leave_type = true;
      isValid = false;
    }
    if (!formData.start_date) {
      newErrors.start_date = true;
      isValid = false;
    }
    if (!formData.end_date) {
      newErrors.end_date = true;
      isValid = false;
    }
    if (!formData.reason) {
      newErrors.reason = true;
      isValid = false;
    }
    if (!file) {
      newErrors.file = true;
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };
  
  //Convert time format
  
  const formatTimeToAMPM = (timeString) => {
  if (!timeString) return '';
  
  // Handle both "HH:mm" and "HH:mm:ss" formats
  const timeParts = timeString.split(':');
  if (timeParts.length < 2) return timeString;
  
  let hours = parseInt(timeParts[0]);
  const minutes = timeParts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert 24h to 12h format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${hours}:${minutes} ${ampm}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.leave_type === "Birthday Leave") {
      const isValid = validateBirthdayLeave(employee.birthdate, formData.start_date);
      if (!isValid) {
        setResponseMsg("Birthday Leave must be on or after your birthday and before the 30th of your birth month");
        return;
      }
    }
    
    const days = calculateLeaveDays(formData.start_date, formData.end_date, isHalfDay);
    const hasEnoughCredits = validateLeaveCredits(formData.leave_type, days);
    
    if (!hasEnoughCredits) {
      setResponseMsg(`Insufficient leave credits for ${formData.leave_type}`);
      return;
    }
    
    if (!validateForm()) {
      setResponseMsg("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const endpoint = "/attendance/leave-applications/";
      const payload = new FormData();
      
      payload.append("employee", formData.employee);
      payload.append("employee_name", formData.employee_name);
      payload.append("position", formData.position);
      payload.append("email", formData.email);
      payload.append("time_in", formData.time_in);
      payload.append("time_out", formData.time_out);
      payload.append("reason", formData.reason);
      payload.append("leave_type", formData.leave_type);
      payload.append("start_date", formData.start_date);
      payload.append("end_date", formData.end_date);
      payload.append("is_half_day", isHalfDay);
      payload.append("half_day_type", isHalfDay ? halfDayType : 'none');
      payload.append("contact_during_leave", formData.contact_during_leave || "");
      payload.append("emergency_contact", formData.emergency_contact || "");
      
      if (file) {
        payload.append("attachment", file);
      }

      const response = await api.post(endpoint, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResponseMsg("Leave Application submitted successfully!");
      
      setFormData(prev => ({
        ...prev,
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
        contact_during_leave: "",
        emergency_contact: "",
      }));
      setFile(null);
      setIsHalfDay(false);
      setHalfDayType('first_half');
      
      await fetchLeaveHistory();
      await fetchLeaveCredits(employee.id);
      setHistoryTabValue("pending");
      setShowModal(false);
      setResponseMsg("");
    } catch (error) {
      console.error("Submission error:", error);
      setResponseMsg(error.response?.data?.message || 
                    error.response?.data?.error || 
                    "Error submitting Leave Application");
    } finally {
      setLoading(false);
    }
  };

  const pendingLeaves = leaveHistory.filter(item => item.status === "pending");
  const approvedLeaves = leaveHistory.filter(item => item.status === "approved");
  const rejectedLeaves = leaveHistory.filter(item => item.status === "rejected");

  const leaveCounts = {
    pending: pendingLeaves.length,
    approved: approvedLeaves.length,
    rejected: rejectedLeaves.length,
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
        <Typography variant="h3" color="primary" sx={{mb: 1}}>Leave Applications</Typography>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          p: 2,
          borderRadius: 1
        }}>
          {leaveCredits && (
            <Box sx={{ display: 'flex', gap: 3 }}>
              {leaveCredits.map((credit) => {
                const isBirthdayLeave = credit.leave_type.toLowerCase() === 'birthday';
                const used = isBirthdayLeave ? credit.is_paid_birthday || 0 : credit.is_paid || 0;
                const remainingDays = credit.total_days - used;

                return (
                  <Chip
                    key={credit.id}
                    label={`${credit.leave_type === 'regular' ? 'Regular' : 'Birthday'} Leave: ${
                      remainingDays
                    } ${remainingDays === 1 ? 'day' : 'days'}`}
                    color={remainingDays > 0 ? 'primary' : 'error'}
                    variant="outlined"
                    sx={{mr: -2}}
                  />
                );
              })}
            </Box>
          )}
        </Box>

        <Box sx={{ width: '100%' }}>
          <Tabs 
            value={historyTabValue} 
            onChange={(e, newValue) => setHistoryTabValue(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px 4px 0 0'
              }
            }}
          >
            <Tab 
              value="pending" 
              label={<StatusBadge status="pending" count={leaveCounts.pending} />}
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              value="approved" 
              label={<StatusBadge status="approved" count={leaveCounts.approved} />}
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              value="rejected" 
              label={<StatusBadge status="rejected" count={leaveCounts.rejected} />}
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
          
          {/* Leave History Tables would go here */}
        </Box>

        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setShowModal(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            color: 'white',
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s'
            }
          }}
        >
          <Add />
        </Fab>

        <Dialog
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setResponseMsg("");
            setFile(null);
            setIsHalfDay(false);
            setHalfDayType('first_half');
            setFormErrors({
              file: false,
              leave_type: false,
              start_date: false,
              end_date: false,
              reason: false,
            });
          }}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: 'primary.main',
            color: 'white',
            py: 2,
            px: 3,
            mb: 2
          }}>
            <Typography variant="h5" color="white">Leave Application</Typography>
            <IconButton 
              edge="end" 
              color="white" 
              onClick={() => {
                setShowModal(false);
                setResponseMsg("");
                setFile(null);
                setIsHalfDay(false);
                setHalfDayType('first_half');
                setFormErrors({
                  file: false,
                  leave_type: false,
                  start_date: false,
                  end_date: false,
                  reason: false,
                });
              }}
              sx={{ p: 0 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            {leaveCredits && (
              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                {leaveCredits.map((credit) => {
                  const isBirthdayLeave = credit.leave_type.toLowerCase() === 'birthday';
                  const used = isBirthdayLeave ? credit.is_paid_birthday || 0 : credit.is_paid || 0;
                  const remainingDays = credit.total_days - used;

                  return (
                    <Chip
                      key={credit.id}
                      label={`${credit.leave_type === 'regular' ? 'Regular' : 'Birthday'} Leave: ${
                        remainingDays
                      } ${remainingDays === 1 ? 'day' : 'days'}`}
                      color={remainingDays > 0 ? 'primary' : 'error'}
                      variant="outlined"
                    />
                  );
                })}
              </Box>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee Name"
                    name="employee_name"
                    value={formData.employee_name}
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      startAdornment: <Person color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      startAdornment: <Email color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Team"
                    name="team"
                    value={formData.team}
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      startAdornment: <Person color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={formData.department}
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      startAdornment: <Email color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>

                 <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Time in"
                    name="time_in"
                    value={formData.time_in ? formatTimeToAMPM(formData.time_in) : ''}
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      startAdornment: <AccessTime color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>

               <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Time out"
                    name="time_out"
                    value={formData.time_out ? formatTimeToAMPM(formData.time_out) : ''}
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      startAdornment: <AccessTime color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                 <TextField
                      select
                      fullWidth
                      label="Leave Type"
                      name="leave_type"
                      value={formData.leave_type || ''}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      error={formErrors.leave_type}
                      helperText={formErrors.leave_type ? "Leave type is required" : ""}
                      sx={{ 
                        width: '100%',
                        '& .MuiSelect-select': {
                          padding: '10px 14px' // Match TextField padding
                        }
                      }}
                    >
                      {leaveTypes.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isHalfDay}
                        onChange={handleHalfDayChange}
                        color="primary"
                        disabled={formData.leave_type === "Birthday Leave"}
                      />
                    }
                    label="Half-day"
                  />
                </Grid>

                {formData.leave_type === "Birthday Leave" && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Birthday Leave is automatically set for 1 day only (from your selected date).
                      Must be within your birth month ({employee?.birthdate ? new Date(employee.birthdate).toLocaleString('default', { month: 'long' }) : ""}) 
                      and on/after your birthday ({employee?.birthdate ? new Date(employee.birthdate).toLocaleDateString() : ""}).
                    </Alert>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DesktopDatePicker
                      label="Start Date"
                      value={formData.start_date || null}
                      onChange={(newValue) => handleDateChange('start_date', newValue)}
                      shouldDisableDate={(date) => {
                        if (formData.leave_type !== "Birthday Leave" || !employee?.birthdate) {
                          return false;
                        }
                        const birthDate = new Date(employee.birthdate);
                        return (
                          date.getMonth() !== birthDate.getMonth() || 
                          date.getDate() < birthDate.getDate()
                        );
                      }}
                      inputFormat="yyyy-MM-dd"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          required
                          variant="outlined"
                          error={formErrors.start_date}
                          helperText={formErrors.start_date ? "Start date is required" : ""}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DesktopDatePicker
                      label="End Date"
                      value={formData.end_date || null}
                      onChange={(newValue) => handleDateChange('end_date', newValue)}
                      inputFormat="yyyy-MM-dd"
                      disabled={formData.leave_type === "Birthday Leave" || isHalfDay}
                      shouldDisableDate={(date) => {
                        if (formData.leave_type !== "Birthday Leave") {
                          return false;
                        }
                        return date.getDate() > 30;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          required
                          variant="outlined"
                          error={formErrors.end_date}
                          helperText={formErrors.end_date ? "End date is required" : ""}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>

                {formData.start_date && formData.end_date && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {isHalfDay ? (
                        formData.start_date === formData.end_date ? (
                          "This is a half-day leave (0.5 day)"
                        ) : (
                          `This leave will use 0.5 days to your ${formData.leave_type} credits.`
                        )
                      ) : (
                        `This leave will use ${calculateLeaveDays(formData.start_date, formData.end_date, isHalfDay)} ${calculateLeaveDays(formData.start_date, formData.end_date, isHalfDay) === 1 ? 'day' : 'days'} of your ${formData.leave_type} credits.`
                      )}
                    </Alert>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    name="emergency_contact"
                    value={formData.emergency_contact || ''}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <ContactEmergency color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact During Leave"
                    name="contact_during_leave"
                    value={formData.contact_during_leave || ''}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <Phone color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Leave"
                    name="reason"
                    value={formData.reason || ''}
                    onChange={handleChange}
                    required
                    error={formErrors.reason}
                    helperText={formErrors.reason ? "Reason is required" : ""}
                    multiline
                    rows={4}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <Description color={formErrors.reason ? "error" : "action"} sx={{ mr: 1, mt: 1, alignSelf: 'flex-start' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Attachment <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <FileUploadArea 
                    file={file} 
                    setFile={setFile} 
                    isRequired={true} 
                    error={formErrors.file}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Please attach supporting documents (e.g., medical certificate for sick leave)
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setShowModal(false);
                setFile(null);
                setIsHalfDay(false);
                setHalfDayType('first_half');
                setFormErrors({
                  file: false,
                  leave_type: false,
                  start_date: false,
                  end_date: false,
                  reason: false,
                });
              }}
              startIcon={<Cancel />}
              sx={{ minWidth: 120 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={handleSubmit}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
              sx={{ minWidth: 120, color: 'white !important' }}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
        >
          <DialogTitle>{confirmDialogConfig.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {confirmDialogConfig.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                confirmDialogConfig.onConfirm();
                setConfirmDialogOpen(false);
              }} 
              color="primary"
              autoFocus
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </SideNavBar>
  );
};

export default LeaveFormModal;