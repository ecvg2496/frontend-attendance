// src/LeaveFormModal.js
import React, { useState, useEffect } from "react";
import api from "api/axios";
import {
  Card,
  Typography,
  Box,
  Modal,
  Tabs,
  Tab,
  Chip,
  TextField,
  MenuItem,
  Button,
  Paper,
  Divider,
  CircularProgress,
  IconButton,
  Grid,
  Badge
} from '@mui/material';
import { Close, History, Send, EditCalendar, PendingActions, CheckCircle, Cancel } from '@mui/icons-material';
import SideNavBar from "../content_page/nav_bar";
import '../content_page/css/admintable.css'

const PendingLeaveTable = ({ filteredLeaveHistory = [], loading, error, historyTabValue, leaveTypes, statusColors }) => {
  if (loading) return <div className="loading">Loading pending leave...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (filteredLeaveHistory.length === 0) {
    return (
      <div className="no-data" style={{ padding: '2rem', textAlign: 'center', color: '#777' }}>
        No {historyTabValue} leave applications found
      </div>
    );
  }

  return (
    <div className="container" style={{ width: '100%', overflowX: 'auto' }}>
      <table className="responsive-table" style={{ minWidth: '1200px' }}>
        <thead>
          <tr style={{ fontSize: '1.1rem', backgroundColor: '#1565C0', color: '#fff' }}>
            {/* <th style={{ padding: '12px 16px' }}>#</th> */}
            <th style={{ padding: '12px 16px' }}>Type</th>
            <th style={{ padding: '12px 16px' }}>Start Date</th>
            <th style={{ padding: '12px 16px' }}>End Date</th>
            <th style={{ padding: '12px 16px' }}>Reason</th>
            <th style={{ padding: '12px 16px' }}>Status</th>
            <th style={{ padding: '12px 16px' }}>Date Filed</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeaveHistory.map((item, index) => {
            const startDate = new Date(item.start_date);
            const endDate = new Date(item.end_date);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const leaveTypeLabel = leaveTypes.find(lt => lt.value === item.leave_type)?.label || item.leave_type;

            return (
              <tr key={index} style={{ fontSize: '1rem', borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px 16px' }}>{leaveTypeLabel}</td>
                <td style={{ padding: '12px 16px' }}>{startDate.toLocaleDateString('en-US', {day: 'numeric', year: 'numeric' ,month: 'long'})}</td>
                <td style={{ padding: '12px 16px' }}>{endDate.toLocaleDateString('en-US', {day: 'numeric', year: 'numeric' ,month: 'long'})}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>{diffDays}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.reason}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    textTransform: 'capitalize',
                    backgroundColor: statusColors[item.status]?.bg,
                    color: statusColors[item.status]?.color
                  }}>
                    {statusColors[item.status]?.icon}
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {new Date(item.applied_at).toLocaleString('en-US', {
                    weekday: 'long',   
                    year: 'numeric',  
                    month: 'long',     
                    day: 'numeric',    
                    hour: 'numeric',   
                    minute: '2-digit',  
                    second: '2-digit',  
                    hour12: true      
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const ApprovedLeaveTable = ({ filteredLeaveHistory = [], loading, error, historyTabValue, leaveTypes, statusColors }) => {
  if (loading) return <div className="loading">Loading approved leave...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (filteredLeaveHistory.length === 0) {
    return (
      <div className="no-data" style={{ padding: '2rem', textAlign: 'center', color: '#777' }}>
        No {historyTabValue} leave applications found
      </div>
    );
  }

  return (
    <div className="container" style={{ width: '100%', overflowX: 'auto' }}>
      <table className="responsive-table" style={{ minWidth: '1200px' }}>
        <thead>
          <tr style={{ fontSize: '1.1rem', backgroundColor: '#1565C0', color: '#fff' }}>
            <th style={{ padding: '12px 16px' }}>#</th>
            <th style={{ padding: '12px 16px', width: '220px' }}>Employee</th>
            <th style={{ padding: '12px 16px' }}>Type</th>
            <th style={{ padding: '12px 16px' }}>Start Date</th>
            <th style={{ padding: '12px 16px' }}>End Date</th>
            <th style={{ padding: '12px 16px' }}>Days</th>
            <th style={{ padding: '12px 16px' }}>Status</th>
            <th style={{ padding: '12px 16px' }}>Date Filed</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeaveHistory.map((item, index) => {
            const startDate = new Date(item.start_date);
            const endDate = new Date(item.end_date);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const leaveTypeLabel = leaveTypes.find(lt => lt.value === item.leave_type)?.label || item.leave_type;

            return (
              <tr key={index} style={{ fontSize: '1rem', borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600 }}>{item.employee_name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.email}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>{leaveTypeLabel}</td>
                <td style={{ padding: '12px 16px' }}>{startDate.toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px' }}>{endDate.toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>{diffDays}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    textTransform: 'capitalize',
                    backgroundColor: statusColors[item.status]?.bg,
                    color: statusColors[item.status]?.color
                  }}>
                    {statusColors[item.status]?.icon}
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {new Date(item.applied_at).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const RejectedLeaveTable = ({ filteredLeaveHistory = [], loading, error, historyTabValue, leaveTypes, statusColors }) => {
  if (loading) return <div className="loading">Loading pending leave...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (filteredLeaveHistory.length === 0) {
    return (
      <div className="no-data" style={{ padding: '2rem', textAlign: 'center', color: '#777' }}>
        No {historyTabValue} leave applications found
      </div>
    );
  }

  return (
    <div className="container" style={{ width: '100%', overflowX: 'auto' }}>
      <table className="responsive-table" style={{ minWidth: '1200px' }}>
        <thead>
          <tr style={{ fontSize: '1.1rem', backgroundColor: '#1565C0', color: '#fff' }}>
            <th style={{ padding: '12px 16px', width: '220px' }}>Employee</th>
            <th style={{ padding: '12px 16px' }}>Type</th>
            <th style={{ padding: '12px 16px' }}>Start Date</th>
            <th style={{ padding: '12px 16px' }}>End Date</th>
            <th style={{ padding: '12px 16px' }}>Reason</th>
            <th style={{ padding: '12px 16px' }}>Days</th>
            <th style={{ padding: '12px 16px' }}>Status</th>
            <th style={{ padding: '12px 16px' }}>Date Filed</th>
            <th style={{ padding: '12px 16px' }}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeaveHistory.map((item, index) => {
            const startDate = new Date(item.start_date);
            const endDate = new Date(item.end_date);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const leaveTypeLabel = leaveTypes.find(lt => lt.value === item.leave_type)?.label || item.leave_type;

            return (
              <tr key={index} style={{ fontSize: '1rem', borderBottom: '1px solid #ddd' }}>
                {/* <td style={{ padding: '12px 16px', textAlign: 'center' }}>{index + 1}</td> */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600 }}>{item.employee_name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.email}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>{leaveTypeLabel}</td>
                <td style={{ padding: '12px 16px' }}>{startDate.toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px' }}>{endDate.toLocaleDateString()}</td>
                <td style ={{padding: '12px 16px'}}>
                  {item.reason}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>{diffDays}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    textTransform: 'capitalize',
                    backgroundColor: statusColors[item.status]?.bg,
                    color: statusColors[item.status]?.color
                  }}>
                    {statusColors[item.status]?.icon}
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {new Date(item.applied_at).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const RequestFormModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [tabValue, setTabValue] = useState("apply");
  const [historyTabValue, setHistoryTabValue] = useState("pending");
  const [formData, setFormData] = useState({
    employee: "",
    employee_name: "",
    email: "",
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    contact_during_leave: "",
    emergency_contact: "",
    type: "",
    department: "",
  });
  const [responseMsg, setResponseMsg] = useState("");
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
 

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      const emp = JSON.parse(storedEmployee);
      console.log("Employee data from localStorage:", emp);
      const full_name = `${emp.first_name} ${emp.last_name}`;
      setEmployee(emp);
      setFormData(prev => ({
        ...prev,
        employee: emp.id,
        employee_name: full_name,
        email: emp.email || ""
      }));
    }
  }, []);
  
  // 2. Fetch leave history when employee data is available
  const fetchLeaveHistory = async () => {
    if (!employee?.id) return;
    
    try {
      setLoading(true);
      // Add employee_id parameter to the API call
      const res = await api.get(`/attendance/leave-applications/?employee_id=${employee.id}`);
      setLeaveHistory(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };
  // 3. Trigger fetch when employee ID changes
  useEffect(() => {
    fetchLeaveHistory();
  }, [employee?.id]);

  useEffect(() => {
    if (showModal && tabValue === "history") {
      fetchLeaveHistory();
    }
  }, [showModal, tabValue]);
  
  useEffect(() => {
    if (showModal && employee) {
      const full_name = `${employee.first_name} ${employee.last_name}`;
      setFormData(prev => ({
        ...prev,
        employee: employee.id,
        employee_name: full_name,  
        email: employee.email || "",
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
        contact_during_leave: "",
        emergency_contact: "",
      }));
    }
  }, [showModal, employee]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dates
    const dateValidation = validateLeaveDates(formData.start_date, formData.end_date);
    if (!dateValidation.isValid) {
      setResponseMsg(dateValidation.error);
      return;
    }
  
    try {
      setLoading(true);
      const res = await api.post("/attendance/leave-applications/", formData);
      setResponseMsg("Leave application submitted successfully");
      
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
      
      // Refresh leave history
      fetchLeaveHistory();
      setHistoryTabValue("pending");
    } catch (err) {
      setResponseMsg(err.response?.data?.error || "Error submitting leave application");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleHistoryTabChange = (event, newValue) => {
    setHistoryTabValue(newValue);
  };
  useEffect(() => {
    console.log("Leave history updated:", leaveHistory);
  }, [leaveHistory]);
  const validateLeaveDates = (startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
  
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    // Check if start date is in the past
    if (start < today) {
      return { isValid: false, error: "Start date cannot be in the past" };
    }
  
    // Check if end date is before start date
    if (end < start) {
      return { isValid: false, error: "End date cannot be before start date" };
    }
  
    return { isValid: true };
  };

  const leaveTypes = [
    { value: "Vacation Leave", label: "Vacation Leave" },
    { value: "Sick Leave", label: "Sick Leave" },
    { value: "Maternity Leave", label: "Maternity Leave" },
    { value: "Paternity Leave", label: "Paternity Leave" },
    { value: "Casual Leave", label: "Casual Leave" },
    { value: "Emergency Leave", label: "Emergency Leave" },
    { value: "Bereavement Leave", label: "Bereavement Leave" },
  ];

  const statusColors = {
    pending: { bg: "warning.light", color: "warning.dark", icon: <PendingActions /> },
    approved: { bg: "success.light", color: "success.dark", icon: <CheckCircle /> },
    rejected: { bg: "error.light", color: "error.dark", icon: <Cancel /> },
  };

  // Define filtered leave arrays
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
      <Card sx={{ p: 3 }}>
        {/* Status Tabs */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={historyTabValue} 
              onChange={handleHistoryTabChange}
              aria-label="leave status tabs"
              variant="fullWidth"
            >
              <Tab 
                value="pending" 
                label={
                  <Badge badgeContent={leaveCounts.pending} color="warning" sx={{ '& .MuiBadge-badge': { right: -15, mt: 1.5 } }}>
                    <Box display="flex" alignItems="center">
                      <PendingActions fontSize="small" sx={{ mr: 1 }} />
                      Pending
                    </Box>
                  </Badge>
                }
              />
              <Tab 
                value="approved" 
                label={
                  <Badge badgeContent={leaveCounts.approved} color="success" sx={{ '& .MuiBadge-badge': { right: -15, mt: 1.5 } }}>
                    <Box display="flex" alignItems="center">
                      <CheckCircle fontSize="small" sx={{ mr: 1 }} />
                      Approved
                    </Box>
                  </Badge>
                }
              />
              <Tab 
                value="rejected" 
                label={
                  <Badge badgeContent={leaveCounts.rejected} color="error" sx={{ '& .MuiBadge-badge': { right: -15, mt: 1.5 } }}>
                    <Box display="flex" alignItems="center">
                      <Cancel fontSize="small" sx={{ mr: 1 }} />
                      Rejected
                    </Box>
                  </Badge>
                }
              />
            </Tabs>
          </Box>
          
          {/* Tab Content - Each tab shows its own table */}
          <Box sx={{ mt: 2 }}>
            {/* Pending Leaves Tab */}
            {historyTabValue === "pending" && (
              <PendingLeaveTable 
                filteredLeaveHistory={pendingLeaves}
                loading={loading}
                error={null}
                historyTabValue={historyTabValue}
                leaveTypes={leaveTypes}
                statusColors={statusColors}
              />
            )}
            
            {/* Approved Leaves Tab */}
            {historyTabValue === "approved" && (
              <ApprovedLeaveTable 
                filteredLeaveHistory={approvedLeaves}
                loading={loading}
                error={null}
                historyTabValue={historyTabValue}
                leaveTypes={leaveTypes}
                statusColors={statusColors}
              />
            )}
            
            {/* Rejected Leaves Tab */}
            {historyTabValue === "rejected" && (
              <RejectedLeaveTable 
                filteredLeaveHistory={rejectedLeaves}
                loading={loading}
                error={null}
                historyTabValue={historyTabValue}
                leaveTypes={leaveTypes}
                statusColors={statusColors}
              />
            )}
          </Box>
        </Box>

        {/* Apply for Leave Button - Bottom Right */}
        <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<EditCalendar sx={{ color: 'white' }} />}
            onClick={() => setShowModal(true)}
          >
            Apply for Leave
          </Button>
        </Box>

        {/* Leave Application Modal */}
        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setResponseMsg("");
            setTabValue("apply");
            setHistoryTabValue("pending");
          }}
          aria-labelledby="leave-application-modal"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper sx={{ 
            width: '80%', 
            maxWidth: 900,
            maxHeight: '90vh',
            overflow: 'auto',
            p: 3,
            position: 'relative'
          }}>
            <IconButton
              aria-label="close"
              onClick={() => {
                setShowModal(false);
                setResponseMsg("");
                setTabValue("apply");
                setHistoryTabValue("pending");
              }}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <Close />
            </IconButton>

            <Typography variant="h5" color="primary" component="h2" gutterBottom>
              Leave Application
            </Typography>

            <Box sx={{ pt: 2 }}>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Hidden Employee ID */}
                  <input type="hidden" name="employee" value={formData.employee} />
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employee Name"
                      name="employee_name"
                      value={formData.employee_name}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Leave Type"
                      name="leave_type"
                      value={formData.leave_type}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                            },
                          },
                        },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          height: '56px',
                        },
                        '& .MuiSelect-select': {
                          padding: '16.5px 14px',
                          textAlign: 'left',
                        },
                      }}
                    >
                      {leaveTypes.map((option) => (
                        <MenuItem 
                          key={option.value} 
                          value={option.value}
                          sx={{
                            padding: '8px 16px',
                            minHeight: '48px',
                            justifyContent: 'flex-start',
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
                      label="Contact During Leave"
                      name="contact_during_leave"
                      value={formData.contact_during_leave}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    error={!!formData.start_date && new Date(formData.start_date) < new Date(new Date().setHours(0, 0, 0, 0))}
                    helperText={
                      !!formData.start_date && new Date(formData.start_date) < new Date(new Date().setHours(0, 0, 0, 0))
                        ? "Start date cannot be in the past"
                        : ""
                    }
                  />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    error={
                      !!formData.start_date && 
                      !!formData.end_date && 
                      new Date(formData.end_date) < new Date(formData.start_date)
                    }
                    helperText={
                      !!formData.start_date && 
                      !!formData.end_date && 
                      new Date(formData.end_date) < new Date(formData.start_date)
                        ? "End date cannot be before start date"
                        : ""
                    }
                  />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Emergency Contact"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Reason for Leave"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      multiline
                      rows={4}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Send sx={{ color: 'white' }} />}
                        sx={{ 
                          minWidth: 120,
                          color: 'white',
                          '& .MuiButton-startIcon': {
                            color: 'white'
                          }
                        }}
                      >
                        {loading ? 'Submitting...' : 'Submit'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {responseMsg && (
              <Box
                mt={2}
                p={2}
                bgcolor={responseMsg.includes("Error") ? "error.light" : "success.light"}
                color={responseMsg.includes("Error") ? "error.dark" : "success.dark"}
                borderRadius={1}
              >
                <Typography variant="body2" align="center">
                  {responseMsg}
                </Typography>
              </Box>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
            )}
          </Paper>
        </Modal>
      </Card>
    </SideNavBar>
  );
};

export default RequestFormModal;