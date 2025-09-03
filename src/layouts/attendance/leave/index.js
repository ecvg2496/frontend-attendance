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
    { value: "Paternity Leave", label: "Paternity Leave" },
    { value: "Vacation Leave", label: "Vacation Leave" },
    { value: "Sick Leave", label: "Sick Leave" },
  ];

  // Function to check if a date is a weekend
  const isWeekend = (date) => {
    if (!date) return false;
    const day = new Date(date).getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  // Function to add days with weekend adjustment for final date
  const addDaysWithWeekendAdjustment = (startDate, daysToAdd) => {
    const result = new Date(startDate);
    result.setDate(result.getDate() + daysToAdd);
    
    // If the result falls on a weekend, adjust to Monday
    const dayOfWeek = result.getDay();
    if (dayOfWeek === 0) { // Sunday
      result.setDate(result.getDate() + 1);
    } else if (dayOfWeek === 6) { // Saturday
      result.setDate(result.getDate() + 2);
    }
    
    return result;
  };

  // Function to check if it's a graveyard shift (PM to AM)
  const isGraveyardShift = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return false;
    
    const parseTime = (timeStr) => {
      if (!timeStr) return { hours: 0 };
      
      // Handle both "HH:mm" and "HH:mm:ss" formats
      const timeParts = timeStr.split(':');
      if (timeParts.length < 2) return { hours: 0 };
      
      let hours = parseInt(timeParts[0]);
      
      // Handle AM/PM if present in string
      if (typeof timeStr === 'string') {
        if (timeStr.includes('PM') && hours < 12) {
          hours += 12;
        } else if (timeStr.includes('AM') && hours === 12) {
          hours = 0;
        }
      }
      
      return { hours };
    };

    const timeInParsed = parseTime(timeIn);
    const timeOutParsed = parseTime(timeOut);
    
    // Graveyard shift: time in is PM and time out is AM (next day)
    return timeInParsed.hours >= 12 && timeOutParsed.hours < 12;
  };

  // Function to adjust end date for Friday leaves
  const adjustEndDateForFriday = (startDate, endDate) => {
    if (!startDate || !endDate) return endDate;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If start and end are the same day and it's a Friday
    if (start.getTime() === end.getTime() && start.getDay() === 5) {
      const adjustedEnd = new Date(end);
      adjustedEnd.setDate(adjustedEnd.getDate() + 1); // Add 1 day
      return adjustedEnd;
    }
    
    return endDate;
  };

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

  const calculateLeaveDuration = (startDate, endDate, isHalfDay, timeIn, timeOut) => {
  if (!startDate || !endDate || !timeIn || !timeOut) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Helper: check if graveyard shift
  const isGraveyardShift = (timeIn, timeOut) => {
    return new Date(`1970-01-01T${timeOut}`) < new Date(`1970-01-01T${timeIn}`);
  };

  // For graveyard shift with same start and end date
  if (isGraveyardShift(timeIn, timeOut) && start.getTime() === end.getTime()) {
    return isHalfDay ? 0.5 : 1;
  }

  // Normalize to midnight
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // Count only business days
  let businessDays = 0;
  let current = new Date(start);

  while (current <= end) {
    const day = current.getDay(); // 0=Sun, 6=Sat
    if (day !== 0 && day !== 6) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  // Handle half-day
  if (isHalfDay) {
    if (start.getTime() === end.getTime()) {
      return 0.5; // single day half leave
    }
    return businessDays - 0.5; // multi-day with half on last day
  }

  return businessDays;
  };

  // const validateLeaveCredits = (leaveType, days) => {
  //   if (!leaveCredits) return true;
    
  //   const leaveTypeMap = {
  //     'Vacation Leave': 'vacation_leave',
  //     'Sick Leave': 'sick_leave',
  //   };
    
  //   const creditType = leaveTypeMap[leaveType];
  //   if (!creditType) return true;
    
  //   const availableCredits = leaveCredits[creditType] || 0;
  //   return availableCredits >= days;
  // };

  const handleHalfDayChange = (e) => {
    const checked = e.target.checked;
    
    if (checked && formData.start_date) {
      // For half-day, set end date to the same as start date
      setFormData(prev => ({ ...prev, end_date: prev.start_date }));
      
      // Check if this is a graveyard shift (PM to AM)
      const parseTime = (timeStr) => {
        if (!timeStr) return { hours: 0, minutes: 0 };
        const timeParts = timeStr.split(':');
        if (timeParts.length < 2) return { hours: 0, minutes: 0 };
        
        let hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        
        if (typeof timeStr === 'string') {
          if (timeStr.includes('PM') && hours < 12) {
            hours += 12;
          } else if (timeStr.includes('AM') && hours === 12) {
            hours = 0;
          }
        }
        
        return { hours, minutes };
      };

      const timeInParsed = parseTime(formData.time_in);
      const timeOutParsed = parseTime(formData.time_out);
      
      // If it's a graveyard shift (PM to AM), show confirmation
      if (timeInParsed.hours >= 12 && timeOutParsed.hours < 12) {
        setConfirmDialogConfig({
          title: 'Confirm Half-Day Leave',
          message: 'You have selected half-day for a graveyard shift. This will calculate as half of your regular hours. Continue?',
          onConfirm: () => {
            setIsHalfDay(true);
            setConfirmDialogOpen(false);
          }
        });
        setConfirmDialogOpen(true);
      } else {
        setIsHalfDay(checked);
      }
    } else {
      setIsHalfDay(checked);
    }
  };

  const handleDateChange = (name, value) => {
    // Prevent weekend filing
    if (value && isWeekend(value)) {
      setResponseMsg("Cannot file leave applications on weekends");
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: false }));
    
    // Auto-set end date based on leave type
    if (name === 'start_date' && value) {
      let endDate = new Date(value);
      
      if (formData.leave_type === "Birthday Leave") {
        // Birthday Leave: Same day
        setFormData(prev => ({ ...prev, end_date: value }));
      } 
      else if (formData.leave_type === "Maternity Leave") {
        // Maternity Leave: 105 days from start date (including weekends)
        // But adjust if the final date falls on a weekend
        const adjustedEndDate = addDaysWithWeekendAdjustment(value, 104); // 105 days total (inclusive)
        setFormData(prev => ({ ...prev, end_date: adjustedEndDate }));
      }
      else if (formData.leave_type === "Paternity Leave") {
        // Paternity Leave: 7 days from start date (including weekends)
        // But adjust if the final date falls on a weekend
        const adjustedEndDate = addDaysWithWeekendAdjustment(value, 6); // 7 days total (inclusive)
        setFormData(prev => ({ ...prev, end_date: adjustedEndDate }));
      }
      else if (isHalfDay) {
        // For half-day, end date should be the same as start date
        setFormData(prev => ({ ...prev, end_date: value }));
      }
    }
    
    // Adjust end date for Friday if needed
    if (name === 'start_date' || name === 'end_date') {
      const adjustedEndDate = adjustEndDateForFriday(
        name === 'start_date' ? value : formData.start_date,
        name === 'end_date' ? value : formData.end_date
      );
      
      if (adjustedEndDate !== formData.end_date) {
        setFormData(prev => ({ ...prev, end_date: adjustedEndDate }));
      }
    }
    
    if (formData.leave_type && (name === 'start_date' || name === 'end_date')) {
      const hours = calculateLeaveDuration(
        name === 'start_date' ? value : formData.start_date,
        name === 'end_date' ? value : formData.end_date,
        isHalfDay,
        formData.time_in,
        formData.time_out
      );
      // const hasEnoughCredits = validateLeaveCredits(formData.leave_type, hours);
      
      // if (!hasEnoughCredits) {
      //   setResponseMsg(`Warning: You don't have enough ${formData.leave_type} credits for this duration`);
      // } else {
      //   setResponseMsg("");
      // }
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
    
    // Get the birthday in the current year
    const currentYear = new Date().getFullYear();
    const birthdayThisYear = new Date(currentYear, birthDateObj.getMonth(), birthDateObj.getDate());
    
    // Calculate the 30-day window
    const windowStart = new Date(birthdayThisYear);
    const windowEnd = new Date(birthdayThisYear);
    windowEnd.setDate(windowEnd.getDate() + 30);
    
    // Check if start date is within the 30-day window
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
  
  // Debug function to check form data
  const debugFormData = () => {
    console.log("Form Data:", {
      employee: formData.employee,
      leave_type: formData.leave_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_half_day: isHalfDay,
      time_in: formData.time_in,
      time_out: formData.time_out,
      reason: formData.reason,
      file: file ? file.name : 'No file'
    });
  };

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
    debugFormData(); // Debug form data
    
    // First validate all required fields
    if (!validateForm()) {
      setResponseMsg("Please fill all required fields");
      return;
    }
    
    // Check for weekend filing
    if (isWeekend(formData.start_date) || isWeekend(formData.end_date)) {
      setResponseMsg("Cannot file leave applications on weekends");
      return;
    }
    
    // Special validation for Birthday Leave
    if (formData.leave_type === "Birthday Leave") {
      const isValid = validateBirthdayLeave(employee.birthdate, formData.start_date);
      if (!isValid) {
        setResponseMsg("Birthday Leave must be within 30 days from your birthday");
        return;
      }
    }
    
    // Calculate leave DAYS (not hours) and validate credits
    const days = calculateLeaveDuration(
      formData.start_date, 
      formData.end_date, 
      isHalfDay,
      formData.time_in,
      formData.time_out
    );
    // const hasEnoughCredits = validateLeaveCredits(formData.leave_type, days);
    
    // if (!hasEnoughCredits) {
    //   setResponseMsg(`Insufficient leave credits for ${formData.leave_type}`);
    //   return;
    // }
    
    // Format dates for backend
    const formatDateForBackend = (date) => {
      try {
        return new Date(date).toISOString().split('T')[0];
      } catch (e) {
        console.error("Date formatting error:", e);
        return date; // fallback to original value
      }
    };

    try {
      setLoading(true);
      const endpoint = "/attendance/leave-applications/";
      const payload = new FormData();
      
      // Add all form data with properly formatted dates
      payload.append("employee", formData.employee);
      payload.append("employee_name", formData.employee_name);
      payload.append("position", formData.position);
      payload.append("email", formData.email);
      payload.append("time_in", formData.time_in);
      payload.append("time_out", formData.time_out);
      payload.append("reason", formData.reason);
      payload.append("leave_type", formData.leave_type);
      payload.append("start_date", formatDateForBackend(formData.start_date));
      payload.append("end_date", formatDateForBackend(formData.end_date));
      payload.append("is_half_day", isHalfDay);
      payload.append("half_day_type", isHalfDay ? halfDayType : 'none');
      payload.append("contact_during_leave", formData.contact_during_leave || "");
      payload.append("emergency_contact", formData.emergency_contact || "");
      
      // Send duration in DAYS to match backend
      payload.append("duration", days);
      
      // Add team and department if available
      if (formData.team) {
        payload.append("assigned_team", formData.team);
      }
      if (formData.department) {
        payload.append("department", formData.department);
      }
      
      if (file) {
        payload.append("attachment", file);
      }

      console.log("Sending payload:", {
        employee: formData.employee,
        leave_type: formData.leave_type,
        start_date: formatDateForBackend(formData.start_date),
        end_date: formatDateForBackend(formData.end_date),
        is_half_day: isHalfDay,
        time_in: formData.time_in,
        time_out: formData.time_out,
        duration: days // Now in days
      });

      const response = await api.post(endpoint, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResponseMsg("Leave Application submitted successfully!");
      
      // Reset form
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

  const handleCancelLeave = async (leaveId) => {
    try {
      setLoading(true);
      await api.delete(`/attendance/leave-applications/${leaveId}/`);
      await fetchLeaveHistory();
      setResponseMsg("Leave application cancelled successfully");
    } catch (error) {
      console.error("Error cancelling leave:", error);
      setResponseMsg("Error cancelling leave application");
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
          p: 1,
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
        </Box>
        <Box sx={{ mt: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ width: '100%', overflowX: 'auto'  }}>
            <table style={{ 
                    width: '100%',
                    minWidth: '1200px',
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem'
                  }}>       
              <thead>
                  <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.0rem' }}>Date of Filing</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.0rem' }}>Leave Type</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.0rem' }}>Start Date</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.0rem' }}>End Date</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.0rem' }}>Duration</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.0rem' }}>Reason</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.0rem' }}>Processed By</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.0rem' }}>Updated At</th>
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.0rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {historyTabValue === 'pending' && pendingLeaves.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.0rem', textAlign: 'center'}}>
                        <Typography variant="body2">No pending leave applications</Typography>
                      </td>
                    </tr>
                  )}
                  {historyTabValue === 'approved' && approvedLeaves.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.0rem', textAlign: 'center'}}>
                        <Typography variant="body2">No approved leave applications</Typography>
                      </td>
                    </tr>
                  )}
                  {historyTabValue === 'rejected' && rejectedLeaves.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '1.0rem', textAlign: 'center'}}>
                        <Typography variant="body2">No rejected leave applications</Typography>
                      </td>
                    </tr>
                  )}
                  
                  {(historyTabValue === 'pending' ? pendingLeaves : 
                    historyTabValue === 'approved' ? approvedLeaves : 
                    rejectedLeaves).map((leave) => (
                    <tr key={leave.id}>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap'}}>{new Date(leave.applied_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontWeight: 'bold'}}>{leave.leave_type}</td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap'}}>
                        {new Date(leave.start_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap'}}>
                        {new Date(leave.end_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </td>
                     <td style={{ padding: '12px 16px', whiteSpace: 'nowrap'}}>
                      {leave.is_half_day && leave.start_date === leave.end_date ? 
                        '0.5 day' : 
                        `${leave.duration || 1} day${leave.duration > 1 ? 's' : ''}${leave.is_half_day ? ' (with half-day)' : ''}`
                      }
                    </td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {leave.reason}
                      </td>
                       <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {leave.processed_by}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {leave?.approval_date
                          ? new Date(leave.approval_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : ""}
                      </td>
                      <td>
                        {leave.status === 'pending' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleCancelLeave(leave.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 0.5 }}> {/* Reduced margin */}
                        <Event color={formErrors.leave_type ? "error" : "action"} />
                      </InputAdornment>
                    ),
                    style: {
                      height: '56px',
                    }
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '16.5px 12px', 
                      paddingRight: '32px !important',
                      paddingLeft: '4px !important', 
                    },
                    '& .MuiOutlinedInput-input': {
                      display: 'flex',
                      alignItems: 'center',
                      marginLeft: '0px !important', 
                    },
                    '& .MuiInputAdornment-root': {
                      marginRight: '4px', 
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
                        disabled={formData.leave_type === "Birthday Leave" || 
                                  formData.leave_type === "Maternity Leave" || 
                                  formData.leave_type === "Paternity Leave"}
                      />
                    }
                    label="Half-day"
                  />
                </Grid>

                {formData.leave_type === "Birthday Leave" && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Birthday Leave is automatically set for 1 day only (from your selected date).
                      Must be within 30 days from your birthday ({employee?.birthdate ? new Date(employee.birthdate).toLocaleDateString() : ""}).
                    </Alert>
                  </Grid>
                )}
                {formData.leave_type === "Maternity Leave" && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Maternity Leave is automatically set for 105 days from your selected start date.
                    </Alert>
                  </Grid>
                )}

                {formData.leave_type === "Paternity Leave" && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Paternity Leave is automatically set for 7 days from your selected start date.
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
                      const selectedDate = new Date(date);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Set to midnight for accurate comparison
                      
                      // For all leave types except Birthday Leave, disable past dates and weekends
                      if (formData.leave_type !== "Birthday Leave") {
                        return selectedDate < today || isWeekend(selectedDate);
                      }
                      
                      // For Birthday Leave, use the 30-day window logic and disable weekends
                      if (formData.leave_type === "Birthday Leave" && employee?.birthdate) {
                        const birthDate = new Date(employee.birthdate);
                        
                        // Get the birthday in the current year
                        const currentYear = new Date().getFullYear();
                        const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
                        
                        // Calculate the 30-day window
                        const windowStart = new Date(birthdayThisYear);
                        const windowEnd = new Date(birthdayThisYear);
                        windowEnd.setDate(windowEnd.getDate() + 30);
                        
                        // Disable dates outside the 30-day window and weekends
                        return selectedDate < windowStart || selectedDate > windowEnd || isWeekend(selectedDate);
                      }
                      
                      return isWeekend(selectedDate);
                    }}
                    inputFormat="MM/dd/yyyy"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        variant="outlined"
                        error={formErrors.start_date}
                        helperText={
                          formErrors.start_date ? "Start date is required" : 
                          formData.leave_type === "Birthday Leave" ? 
                            `Must be within 30 days from your birthday: ${employee?.birthdate ? 
                              new Date(employee.birthdate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : ""}` 
                            : "Cannot select past dates or weekends"
                        }
                      />
                    )}
                    sx={{ width: '100%' }} 
                  />
                </LocalizationProvider>
              </Grid>
                
              <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DesktopDatePicker
                      label="End Date"
                      value={formData.end_date || null}
                      onChange={(newValue) => handleDateChange('end_date', newValue)}
                      inputFormat="MM/dd/yyyy"
                      disabled={formData.leave_type === "Birthday Leave" || 
                                formData.leave_type === "Maternity Leave" || 
                                formData.leave_type === "Paternity Leave" || 
                                isHalfDay}
                      shouldDisableDate={(date) => {
                        const selectedDate = new Date(date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return selectedDate < today || isWeekend(selectedDate);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          required
                          variant="outlined"
                          error={formErrors.end_date}
                          helperText={formErrors.end_date ? "End date is required" : "Cannot select past dates or weekends"}
                        />
                      )}
                      sx={{ width: '100%' }} 
                    />
                  </LocalizationProvider>
                </Grid>
             

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
                      startAdornment: <Description color={formErrors.reason ? "error" : 'action'} sx={{ mr: 1, mt: 1, alignSelf: 'flex-start' }} />
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