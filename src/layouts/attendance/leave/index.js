import React, { useState, useEffect } from "react";
import api from "api/axios";
import {
  Card,
  Typography,
  Box,
  Modal,
  Tabs,
  Fab,
  Tab,
  TextField,
  MenuItem,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Grid,
  Badge,
  Avatar,
  Chip,
  Stack,
  Divider,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Close,
  Send,
  PendingActions,
  CheckCircle,
  Cancel,
  AccessTime,
  SwapHoriz,
  Event,
  ArrowBack,
  Person,
  Email,
  Phone,
  ContactEmergency,
  CalendarToday,
  Today,
  EventAvailable,
  Description,
  Schedule,
  AttachFile,
  Delete
} from '@mui/icons-material';
import SideNavBar from "../content_page/nav_bar";
import '../content_page/css/admintable.css';

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

const LeaveTable = ({ data, loading, error, type, leaveTypes }) => {
  const statusColors = {
    pending: { bg: '#FFF3E0', color: '#E65100', icon: <PendingActions fontSize="small" /> },
    approved: { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircle fontSize="small" /> },
    rejected: { bg: '#FFEBEE', color: '#C62828', icon: <Cancel fontSize="small" /> }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" p={4}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box p={2} bgcolor="error.light" color="error.dark" borderRadius={1}>
      <Typography align="center">Error: {error.message}</Typography>
    </Box>
  );

  if (!data || data.length === 0) return (
    <Box p={4} textAlign="center" color="text.secondary">
      <Typography variant="subtitle1">No {type} leave applications found</Typography>
    </Box>
  );
  const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } 

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const formatDateFixer = (dateString) => {
  if (!dateString) return ""; 
  
  const date = new Date(dateString);
  return date.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <Box width="100%" overflow="auto" position="relative" sx={{ mt: 2 }}>
      <table style={{ 
        width: '100%',
        minWidth: '1500px',
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
            {type === 'pending' && (
              <>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Type</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Dates</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Days</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Reason</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap'}}>Date Filed</th>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Remarks</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap'}}>Processed By</th>
              </>
            )}
            {type === 'approved' && (
              <>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Type</th>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Dates</th>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Days</th>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Reason</th>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Remarks</th>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Date Filed</th>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Processed By</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap'}}>Date Approved</th>
              </>
            )}
            {type === 'rejected' && (
              <>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Type</th>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Dates</th>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Days</th>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Reason</th>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Date Filed</th>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Remarks</th>
                <th style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>Processed By</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap'}}>Date Rejected</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const leaveType = leaveTypes.find(lt => lt.value === item.leave_type)?.label || item.leave_type;
            const days = calculateDays(item.start_date, item.end_date);

            return (
              <tr 
                key={index} 
                style={{ 
                  borderBottom: '1px solid #e0e0e0',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                {type === 'pending' && (
                  <>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>
                      <Box fontWeight={500}>{leaveType}</Box>
                    </td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>
                      <Box fontSize="0.75rem" color="#666">
                        {formatDate(item.start_date)} - {formatDate(item.end_date)}
                      </Box>
                    </td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>{days}</td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>{item?.reason || "N/A"}</td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>
                      <Box fontSize="0.75rem" color="#666">
                        {formatDateTime(item.applied_at)}
                      </Box>
                    </td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>
                      <Box fontSize="0.75rem" color="#666">
                        {item.processed_by || 'Pending'}
                      </Box>
                    </td>
                  </>
                )}

                {type === 'approved' && (
                  <>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>{leaveType}</td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>
                      <Box fontSize="0.75rem" color="#666">
                        {formatDate(item.start_date)} - {formatDate(item.end_date)}
                      </Box>
                    </td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>{days}</td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>{item?.reason || "N/A"}</td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>{item.remarks}</td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>
                      <Box fontSize="0.75rem" color="#666">
                        {formatDateTime(item.applied_at)}
                      </Box>
                    </td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>
                      <Box color="#666">
                        {item.processed_by || 'System'}
                      </Box>
                    </td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>{formatDateFixer(item.approval_date) || ""}</td>
                  </>
                )}

                {type === 'rejected' && (
                  <>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>{leaveType}</td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>
                      <Box color="#666">
                        {formatDate(item.start_date)} - {formatDate(item.end_date)}
                      </Box>
                    </td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>{days}</td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>{item.reason}</td>                   
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>
                      <Box color="#666">
                        {formatDateTime(item.applied_at)}
                      </Box>
                    </td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>{item.remarks || '-'}</td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>
                      <Box fontSize="0.75rem" color="#666">
                        {item.processed_by || 'System'}
                      </Box>
                    </td>
                    <td style={{ padding: '12px 16px' , whiteSpace: 'nowrap'}}>{formatDateFixer(item.approval_date) || ""}</td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
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
    position: "",
    birthdate: "",
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    contact_during_leave: "",
    emergency_contact: "",
    date: "",
    hours: "",
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
    date: false,
    hours: false,
  });

  const leaveTypes = [
    { value: "Bereavement Leave", label: "Bereavement Leave" },
    { value: "Birthday Leave", label: "Birthday Leave" },
    { value: "Casual Leave", label: "Casual Leave" },
    { value: "Emergency Leave", label: "Emergency Leave" },
    { value: "Maternity Leave", label: "Maternity Leave" },
    { value: "Maternity Leave", label: "Vacation Leave" },
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
        department: emp.department,
        position: emp.position
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

  const calculateLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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

  const handleDateChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: false }));
    
    if (formData.leave_type) {
      const startDate = name === 'start_date' ? value : formData.start_date;
      const endDate = name === 'end_date' ? value : formData.end_date;
      
      if (startDate && endDate) {
        const days = calculateLeaveDays(startDate, endDate);
        const hasEnoughCredits = validateLeaveCredits(formData.leave_type, days);
        
        if (!hasEnoughCredits) {
          setResponseMsg(`Warning: You don't have enough ${formData.leave_type} credits for this duration`);
        } else {
          setResponseMsg("");
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'start_date' || name === 'end_date') {
      handleDateChange(name, value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setFormErrors(prev => ({ ...prev, [name]: false }));
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const days = calculateLeaveDays(formData.start_date, formData.end_date);
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
      const birthDate = formData.birthdate;
      payload.append("employee", formData.employee);
      payload.append("employee_name", formData.employee_name);
      payload.append("position", formData.position);
      payload.append("email", formData.email);
      payload.append("reason", formData.reason);
      payload.append("leave_type", formData.leave_type);
      payload.append("start_date", formData.start_date);
      payload.append("end_date", formData.end_date);
      payload.append("contact_during_leave", formData.contact_during_leave || "");
      payload.append("emergency_contact", formData.emergency_contact || "");
      if (file) {
        payload.append("attachment", file);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await api.post(endpoint, payload, config);
      console.log("Submission successful:", response.data);

      setResponseMsg("Leave Application submitted successfully!");
      
      setFormData(prev => ({
        ...prev,
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
        contact_during_leave: "",
        emergency_contact: "",
        date: "",
        hours: "",
      }));
      setFile(null);
      
      await fetchLeaveHistory();
      await fetchLeaveCredits(employee.id);
      setHistoryTabValue("pending");
      setShowModal(false);
      setResponseMsg("");
   
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Error submitting Leave Application";
      setResponseMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderFormContent = () => {
    return (
      <Grid container spacing={3}>
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
              '& .MuiOutlinedInput-root': {
                height: '53px',
                '& .MuiSelect-select': {
                  padding: '17px 17px',
                  display: 'flex',
                  alignItems: 'center'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0.5 }}>
                  <Event color={formErrors.leave_type ? "error" : "action"} />
                </InputAdornment>
              )
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    '& .MuiMenuItem-root': {
                      minHeight: '48px',
                      padding: '8px 16px',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)'
                      }
                    }
                  }
                }
              }
            }}
          >
            {leaveTypes.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                sx={{
                  minHeight: '48px',
                  padding: '15px 20px',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            name="start_date"
            value={formData.start_date || ''}
            onChange={(e) => handleDateChange('start_date', e.target.value)}
            required
            variant="outlined"
            error={formErrors.start_date}
            helperText={formErrors.start_date ? "Start date is required" : ""}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <EventAvailable color={formErrors.start_date ? "error" : "action"} sx={{ mr: 1 }} />
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            name="end_date"
            value={formData.end_date || ''}
            onChange={(e) => handleDateChange('end_date', e.target.value)}
            required
            variant="outlined"
            error={formErrors.end_date}
            helperText={formErrors.end_date ? "End date is required" : ""}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <EventAvailable color={formErrors.end_date ? "error" : "action"} sx={{ mr: 1 }} />
            }}
          />
        </Grid>

        {formData.start_date && formData.end_date && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              This leave will use {calculateLeaveDays(formData.start_date, formData.end_date)} days of your {formData.leave_type} credits.
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
          
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            border: '1px solid #e0e0e0', 
            borderRadius: 1,
            textAlign: 'justify'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              I UNDERSTAND THAT:
            </Typography>
            
            <Box component="ol" sx={{ 
              pl: 2.5, 
              '& li': { 
                mb: 1.5,
                textAlign: 'justify',
                textJustify: 'inter-word'
              } 
            }}>
              <Typography component="li" variant="body2" sx={{ textAlign: 'justify' }}>
                All leave of absence application must be filed <Box component="span" color="red" sx={{ fontWeight: 'bold' }}>TWO (2) WEEKS</Box> before the planned date and an email of request for leave will be sent to HR cc: Operations Manager and Immediate Supervisor with the leave form attached.
              </Typography>
              
              <Typography component="li" variant="body2" sx={{ textAlign: 'justify' }}>
                This shall be <Box component="span" sx={{ fontWeight: 'bold' }}>subject for approval</Box> by the assigned Client and the Operations Manager.
              </Typography>
              
              <Typography component="li" variant="body2" sx={{ textAlign: 'justify' }}>
                <Box component="span" sx={{ fontWeight: 'bold' }}>Leave due to sickness/medical reason</Box> should be filed or communicated to the immediate supervisor or the Operations Manager asap with acknowledgement. Sickness leave <Box component="span" sx={{ fontWeight: 'bold' }}>more than 2 days must be supported by doctor's certificate and must be filed upon return to work/duty.</Box> Failure to provide such document is in violation to the company's Code of Conduct section B.1 and shall be subject to disciplinary action.
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ 
              mt: 2, 
              fontStyle: 'italic',
              textAlign: 'justify',
              textJustify: 'inter-word'
            }}>
              I hereby request leave of absence from duty as indicated above and certify such leave/absence is requested for the purpose(s) indicated. I understand that I must comply with Eighty 20 Virtual's policies and procedures for requesting leave of absence (and provide additional documentation, including medical certification, if required) and that falsification on this form may be grounds for disciplinary action, including termination as per Eighty 20 Virtual, Inc. Code of Conduct.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
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
        minHeight: 'calc(103vh - 64px)',
        width: '100%',
        minWidth: '1400px',
        margin: '0 auto',
        p: 3,
        mt: -10
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          p: 2,
          backgroundColor: '#f5f5f5',
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
          
          <Box sx={{ mt: 3 }}>
            {historyTabValue === "pending" && (
              <LeaveTable 
                data={pendingLeaves}
                loading={loading}
                error={null}
                type="pending"
                leaveTypes={leaveTypes}
              />
            )}
            
            {historyTabValue === "approved" && (
              <LeaveTable 
                data={approvedLeaves}
                loading={loading}
                error={null}
                type="approved"
                leaveTypes={leaveTypes}
              />
            )}
            
            {historyTabValue === "rejected" && (
              <LeaveTable 
                data={rejectedLeaves}
                loading={loading}
                error={null}
                type="rejected"
                leaveTypes={leaveTypes}
              />
            )}
          </Box>
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

        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setResponseMsg("");
            setFile(null);
            setFormErrors({
              file: false,
              leave_type: false,
              start_date: false,
              end_date: false,
              reason: false,
              date: false,
              hours: false
            });
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          <Paper sx={{ 
            width: '90%',
            maxWidth: 800,
            maxHeight: '90vh',
            overflow: 'auto',
            p: 4,
            borderRadius: 2,
            position: 'relative'
          }}>
            <IconButton
              aria-label="close"
              onClick={() => {
                setShowModal(false);
                setResponseMsg("");
                setFile(null);
                setFormErrors({
                  file: false,
                  leave_type: false,
                  start_date: false,
                  end_date: false,
                  reason: false,
                  date: false,
                  hours: false
                });
              }}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16,
                color: 'text.secondary'
              }}
            >
              <Close />
            </IconButton>

            <Typography variant="h3" component="h2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
              Leave Application
            </Typography>
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
                        />
                      );
                    })}
                  </Box>
                )}
            <Box sx={{ pt: 2 }}>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} ml={-1}>
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
                      sx={{ '& .MuiOutlinedInput-root': { height: '53px' } }}
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
                      sx={{ '& .MuiOutlinedInput-root': { height: '53px' } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} mb={3} ml={-1}>
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
                      sx={{ '& .MuiOutlinedInput-root': { height: '53px' } }}
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
                      sx={{ '& .MuiOutlinedInput-root': { height: '53px' } }}
                    />
                  </Grid>
                  
                  {renderFormContent()}
                  
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => {
                          setShowModal(false);
                          setFile(null);
                          setFormErrors({
                            file: false,
                            leave_type: false,
                            start_date: false,
                            end_date: false,
                            reason: false,
                            date: false,
                            hours: false
                          });
                        }}
                        sx={{ minWidth: 120 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                        sx={{ minWidth: 120, color: 'white !important' }}
                      >
                        {loading ? 'Submitting...' : 'Submit'}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {responseMsg && (
              <Alert
                severity={responseMsg.includes("Error") ? "error" : "success"}
                sx={{ mt: 3 }}
                onClose={() => setResponseMsg("")}
              >
                {responseMsg}
              </Alert>
            )}
          </Paper>
        </Modal>
      </Card>
    </SideNavBar>
  );
};

export default LeaveFormModal;