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
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';

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

const MakeupRequestTable = ({ data, loading, error, type }) => {
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
      <Typography variant="subtitle1">No {type} makeup requests found</Typography>
    </Box>
  );

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Employee</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Time In</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Time Out</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Break</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Hours</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Reason</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Status</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date Filed</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={index} 
              style={{ 
                borderBottom: '1px solid #e0e0e0',
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
            >
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontSize: '0.75rem' }}>
                    {getInitials(item.employee_name)}
                  </Avatar>
                  <Box>
                    <Box fontWeight={500}>{item.employee_name || 'Unknown'}</Box>
                    <Box fontSize="0.75rem" color="#666">{item.email || 'No email'}</Box>
                  </Box>
                </Box>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {formatDate(item.date)}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {formatTime(item.time_in)}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {formatTime(item.time_out)}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {item.start_break && item.end_break ? 
                  `${formatTime(item.start_break)} - ${formatTime(item.end_break)}` : 
                  'No break'}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {item.hours} hours
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {item.reason}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Chip 
                  label={item.status}
                  size="small"
                  sx={{ 
                    backgroundColor: statusColors[item.status].bg,
                    color: statusColors[item.status].color,
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Box fontSize="0.75rem" color="#666">
                  {formatDateTime(item.created_at)}
                </Box>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

const MakeupRequestForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [historyTabValue, setHistoryTabValue] = useState("pending");
  const [formData, setFormData] = useState({
    employee: "",
    employee_name: "",
    team: "",
    department: "",
    email: "",
    position: "",
    date: "",
    time_in: "",
    time_out: "",
    start_break: "",
    end_break: "",
    hours: "",
    reason: ""
  });
  const [responseMsg, setResponseMsg] = useState("");
  const [makeupHistory, setMakeupHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [formErrors, setFormErrors] = useState({
    date: false,
    time_in: false,
    time_out: false,
    reason: false,
    hours: false
  });

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
      fetchMakeupHistory();
    }
  }, [employee]);

  const fetchMakeupHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/makeup-requests/?employee_id=${employee.id}`);
      const data = Array.isArray(res.data) ? res.data : [];
      const normalizedData = data.map(item => ({
        ...item,
        status: item.status.toLowerCase()
      }));
      setMakeupHistory(normalizedData);
    } catch (error) {
      console.error("Error fetching history:", error);
      setMakeupHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateHours = () => {
    if (!formData.time_in || !formData.time_out) return 0;

    const timeIn = new Date(`2000-01-01T${formData.time_in}`);
    const timeOut = new Date(`2000-01-01T${formData.time_out}`);
    
    let totalMinutes = (timeOut - timeIn) / (1000 * 60);
    
    if (formData.start_break && formData.end_break) {
      const startBreak = new Date(`2000-01-01T${formData.start_break}`);
      const endBreak = new Date(`2000-01-01T${formData.end_break}`);
      totalMinutes -= (endBreak - startBreak) / (1000 * 60);
    }
    
    return (totalMinutes / 60).toFixed(2);
  };

  useEffect(() => {
    if (formData.time_in && formData.time_out) {
      const calculatedHours = calculateHours();
      setFormData(prev => ({ ...prev, hours: calculatedHours }));
    }
  }, [formData.time_in, formData.time_out, formData.start_break, formData.end_break]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: false }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (!formData.date) {
      newErrors.date = true;
      isValid = false;
    }
    if (!formData.time_in) {
      newErrors.time_in = true;
      isValid = false;
    }
    if (!formData.time_out) {
      newErrors.time_out = true;
      isValid = false;
    }
    if (!formData.reason) {
      newErrors.reason = true;
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setResponseMsg("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const endpoint = "/attendance/makeup-requests/";
      const payload = {
        employee: formData.employee,
        date: formData.date,
        time_in: formData.time_in,
        time_out: formData.time_out,
        start_break: formData.start_break || null,
        end_break: formData.end_break || null,
        hours: formData.hours,
        reason: formData.reason
      };

      const response = await api.post(endpoint, payload);
      console.log("Submission successful:", response.data);

      setResponseMsg("Makeup Request submitted successfully!");
      
      setFormData(prev => ({
        ...prev,
        date: "",
        time_in: "",
        time_out: "",
        start_break: "",
        end_break: "",
        hours: "",
        reason: ""
      }));
      
      await fetchMakeupHistory();
      setHistoryTabValue("pending");
      setShowModal(false);
      setResponseMsg("");
   
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Error submitting Makeup Request";
      setResponseMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = makeupHistory.filter(item => item.status === "pending");
  const approvedRequests = makeupHistory.filter(item => item.status === "approved");
  const rejectedRequests = makeupHistory.filter(item => item.status === "rejected");

  const requestCounts = {
    pending: pendingRequests.length,
    approved: approvedRequests.length,
    rejected: rejectedRequests.length,
  };

  return (
    <SideNavBar>
      <Card sx={{ 
        minHeight: 'calc(103vh - 64px)',
        width: '100%',      
        mt: -10
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          p: 2,
          borderRadius: 1
        }}>
          <Typography variant="h3" color="primary">
            Makeup Time Requests
          </Typography>
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
              label={<StatusBadge status="pending" count={requestCounts.pending} />}
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              value="approved" 
              label={<StatusBadge status="approved" count={requestCounts.approved} />}
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              value="rejected" 
              label={<StatusBadge status="rejected" count={requestCounts.rejected} />}
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
          
          <Box sx={{ mt: 3 }}>
            {historyTabValue === "pending" && (
              <MakeupRequestTable 
                data={pendingRequests}
                loading={loading}
                error={null}
                type="pending"
              />
            )}
            
            {historyTabValue === "approved" && (
              <MakeupRequestTable 
                data={approvedRequests}
                loading={loading}
                error={null}
                type="approved"
              />
            )}
            
            {historyTabValue === "rejected" && (
              <MakeupRequestTable 
                data={rejectedRequests}
                loading={loading}
                error={null}
                type="rejected"
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
            setFormErrors({
              date: false,
              time_in: false,
              time_out: false,
              reason: false,
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
                setFormErrors({
                  date: false,
                  time_in: false,
                  time_out: false,
                  reason: false,
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
              Makeup Time Request
            </Typography>

            <Box sx={{ pt: 2 }}>
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

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      name="date"
                      value={formData.date || ''}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      error={formErrors.date}
                      helperText={formErrors.date ? "Date is required" : ""}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <CalendarToday color={formErrors.date ? "error" : "action"} sx={{ mr: 1 }} />
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Hours"
                      name="hours"
                      value={formData.hours || ''}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      error={formErrors.hours}
                      helperText={formErrors.hours ? "Hours is required" : ""}
                      InputProps={{
                        readOnly: true,
                        startAdornment: <AccessTime color={formErrors.hours ? "error" : "action"} sx={{ mr: 1 }} />,
                        endAdornment: <Typography variant="body2">hours</Typography>
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Time In"
                      type="time"
                      name="time_in"
                      value={formData.time_in || ''}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      error={formErrors.time_in}
                      helperText={formErrors.time_in ? "Time in is required" : ""}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <Schedule color={formErrors.time_in ? "error" : "action"} sx={{ mr: 1 }} />
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Time Out"
                      type="time"
                      name="time_out"
                      value={formData.time_out || ''}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      error={formErrors.time_out}
                      helperText={formErrors.time_out ? "Time out is required" : ""}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <Schedule color={formErrors.time_out ? "error" : "action"} sx={{ mr: 1 }} />
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Break Start"
                      type="time"
                      name="start_break"
                      value={formData.start_break || ''}
                      onChange={handleChange}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <SwapHoriz color="action" sx={{ mr: 1 }} />
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Break End"
                      type="time"
                      name="end_break"
                      value={formData.end_break || ''}
                      onChange={handleChange}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <SwapHoriz color="action" sx={{ mr: 1 }} />
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Reason for Makeup Time"
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
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<Cancel />}
                        onClick={() => {
                          setShowModal(false);
                          setFormErrors({
                            date: false,
                            time_in: false,
                            time_out: false,
                            reason: false,
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

export default MakeupRequestForm;