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
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Badge,
  Stack,
  Divider,
  Alert,
  Chip,
  Autocomplete,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Close,
  Send,
  PendingActions,
  CheckCircle,
  Cancel,
  Event,
  CalendarToday
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import SideNavBar from 'layouts/attendance_dashboard/content_page/sidebar';
import '../content_page/css/admintable.css';

// Helper Components
const LoadingIndicator = () => (
  <Box display="flex" justifyContent="center" p={4}>
    <CircularProgress />
  </Box>
);

const ErrorDisplay = ({ message }) => (
  <Box p={2} bgcolor="error.light" color="error.dark" borderRadius={1}>
    <Typography align="center">Error: {message}</Typography>
  </Box>
);

const EmptyState = ({ type }) => (
  <Box p={4} textAlign="center" color="text.secondary">
    <Typography variant="subtitle1">No {type} holidays found</Typography>
  </Box>
);

// Status Badge Component
const StatusBadge = ({ status, count }) => {
  const statusConfig = {
    regular: { color: 'primary', icon: <Event fontSize="small" /> },
    special: { color: 'secondary', icon: <CalendarToday fontSize="small" /> },
    company: { color: 'info', icon: <Event fontSize="small" /> },
    // Add a default configuration for unknown statuses
    default: { color: 'default', icon: <Event fontSize="small" /> }
  };

  // Use the status config or fall back to default if status is unknown
  const config = statusConfig[status] || statusConfig.default;

  return (
    <Badge badgeContent={count} color={config.color} sx={{ '& .MuiBadge-badge': { right: -15, mt: 1.5 } }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {config.icon}
        <Typography variant="body2" textTransform="capitalize">
          {status}
        </Typography>
      </Stack>
    </Badge>
  );
};

// Date Formatting Functions
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
};

//Label Holiday based on current day
const HolidayBanner = ({ holidays }) => {
  const today = new Date();
  
  // Find holidays that match today's date
  const todaysHolidays = holidays.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return (
      holidayDate.getDate() === today.getDate() &&
      holidayDate.getMonth() === today.getMonth() &&
      holidayDate.getFullYear() === today.getFullYear()
    );
  });

  if (todaysHolidays.length === 0) return null;

  return (
    <Box sx={{ 
      mb: 3,
      display: 'flex',
      justifyContent: 'center',
      gap: 2,
      flexWrap: 'wrap'
    }}>
      {todaysHolidays.map(holiday => (
        <Alert 
          key={holiday.id}
          severity="info"
          icon={<Event />}
          sx={{ 
            width: '100%',
            maxWidth: '800px',
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="span">
              Today is a {holiday.type} holiday:
            </Typography>
            <Typography variant="h6" component="span" fontWeight="bold">
              {holiday.name}
            </Typography>
            <Typography variant="body1" component="span" sx={{ ml: 1 }}>
              ({format(holiday.date, 'MMMM d, yyyy')})
            </Typography>
          </Box>
        </Alert>
      ))}
    </Box>
  );
};

// Table Components
const HolidayListTable = ({ data, loading, error, onEdit, onAssign }) => {
  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorDisplay message={error.message} />;
  if (!data?.length) return <EmptyState type="holidays" />;

  return (
    <Box width="100%" overflow="auto" sx={{ mt: 2 }}>
      <table style={{
        width: '100%',
        minWidth: '800px',
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Name</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Type</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Recurring</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((holiday) => (
            <tr key={holiday.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={{ padding: '12px 16px' }}>
                <Typography fontWeight="500">{holiday.name}</Typography>
                {holiday.description && (
                  <Typography variant="caption" color="text.secondary">
                    {holiday.description}
                  </Typography>
                )}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {formatDate(holiday.date)}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Chip 
                  label={holiday.type} 
                  color={
                    holiday.type === 'regular' ? 'primary' : 
                    holiday.type === 'special' ? 'secondary' : 'info'
                  }
                  size="small"
                />
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {holiday.recurring ? 'Yes' : 'No'}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Stack direction="row" spacing={1}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => onEdit(holiday)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    onClick={() => onAssign(holiday)}
                    sx={{color: 'white !important'}}
                  >
                    Assign
                  </Button>
                </Stack>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

const EmployeeHolidayTable = ({ data, loading, error }) => {
  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorDisplay message={error.message} />;
  if (!data?.length) return <EmptyState type="employee holiday assignments" />;

  return (
    <Box width="100%" overflow="auto" sx={{ mt: 2 }}>
      <table style={{
        width: '100%',
        minWidth: '800px',
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#00B4D8', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Employee</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Position</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Work Arrangement</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Status</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Holiday</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Processed By</th>
          </tr>
        </thead>
        <tbody>
          {data.map((assignment) => {
            // Add null checks
            const employee = assignment.employee || {};
            const holiday = assignment.holiday || {};
            
            return (
              <tr key={assignment.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {employee.first_name} {employee.last_name}
                  {employee.email && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {employee.email}
                    </Typography>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {employee.position || 'N/A'} 
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {employee.work_arrangement || 'N/A'} 
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {employee.status || 'N/A'} 
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {holiday.name || 'N/A'}
                  {holiday.type && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {holiday.type}
                    </Typography>
                  )}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {holiday.date ? formatDate(holiday.date) : 'N/A'}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {assignment.processed_by || 'System'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
};

// Main Component
const HolidayManagement = () => {
  const [activeTab, setActiveTab] = useState("holidays");
  const [showModal, setShowModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [employeeHolidays, setEmployeeHolidays] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseMsg, setResponseMsg] = useState("");
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [assignmentData, setAssignmentData] = useState({
    is_paid: true,
    pay_multiplier: 1.0
  });

  const [formData, setFormData] = useState({
    name: "",
    date: new Date(),
    type: "regular",
    recurring: false,
    description: ""
  });

  // Fetch data
  useEffect(() => {
    fetchHolidays();
    fetchEmployeeHolidays();
    fetchEmployees();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await api.get("/attendance/holidays/");
      setHolidays(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeHolidays = async () => {
  try {
    setLoading(true);
    const response = await api.get("/attendance/employee-holidays/");
    console.log("Employee holidays response:", response.data); 
    setEmployeeHolidays(response.data);
  } catch (err) {
    console.error("Error details:", err.response?.data); 
    setError(err);
  } finally {
    setLoading(false);
  }
};

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/attendance/employees/");
      setEmployees(response.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAssignmentChange = (field, value) => {
    setAssignmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name) {
      setResponseMsg("Please enter a holiday name");
      return false;
    }
    if (!formData.date) {
      setResponseMsg("Please select a date");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        ...formData,
        date: format(formData.date, 'yyyy-MM-dd')
      };

      if (selectedHoliday) {
        // Update existing holiday
        await api.put(`/attendance/holidays/${selectedHoliday.id}/`, payload);
        setResponseMsg("Holiday updated successfully!");
      } else {
        // Create new holiday
        await api.post("/attendance/holidays/", payload);
        setResponseMsg("Holiday created successfully!");
      }

      fetchHolidays();
      setTimeout(() => {
        setShowModal(false);
        setResponseMsg("");
        setSelectedHoliday(null);
      }, 1500);
    } catch (err) {
      setResponseMsg(err.response?.data?.message || "Error saving holiday");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/attendance/holidays/${id}/`);
      setResponseMsg("Holiday deleted successfully");
      fetchHolidays();
    } catch (err) {
      setResponseMsg(err.response?.data?.message || "Error deleting holiday");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async () => {
  if (!selectedEmployees.length) {
    setResponseMsg("Please select at least one employee");
    return;
  }

  try {
    setLoading(true);
    
    // Transform payload to match backend expectations
    const payload = {
      employee_ids: selectedEmployees.map(e => e.id),
      is_paid: assignmentData.is_paid,
      pay_multiplier: parseFloat(assignmentData.pay_multiplier) 
    };

    const response = await api.post(
      `/attendance/holidays/${selectedHoliday.id}/assign/`, 
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    setResponseMsg("Holiday assigned successfully!");
    fetchEmployeeHolidays();
    
    setTimeout(() => {
      setShowAssignmentModal(false);
      setResponseMsg("");
      setSelectedHoliday(null);
      setSelectedEmployees([]);
    }, 1500);
    
  } catch (err) {
    let errorMsg = "Error assigning holiday";
    
    if (err.response) {
      // Handle specific error cases
      if (err.response.data?.existing_assignments) {
        errorMsg = `Some employees already have this holiday assigned`;
      } else if (err.response.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response.data?.message) {
        errorMsg = err.response.data.message;
      }
    }
    
    setResponseMsg(errorMsg);
  } finally {
    setLoading(false);
  }
  };

  const openEditModal = (holiday) => {
    setSelectedHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: parseISO(holiday.date),
      type: holiday.type,
      recurring: holiday.recurring,
      description: holiday.description || ""
    });
    setShowModal(true);
  };

  const openAssignModal = (holiday) => {
    setSelectedHoliday(holiday);
    setAssignmentData({
      is_paid: true,
      pay_multiplier: 1.0
    });
    setSelectedEmployees([]);
    setShowAssignmentModal(true);
  };

  const holidayCounts = {
    regular: holidays.filter(h => h.type === 'regular').length,
    special: holidays.filter(h => h.type === 'special').length,
    company: holidays.filter(h => h.type === 'company').length
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
          mb: 2,
          p: 2,
          borderRadius: 1
        }}>
          <Typography variant="h3" color="primary">
            Holiday Management
          </Typography>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px 4px 0 0'
              }
            }}
          >
            <Tab
              value="holidays"
              label={<StatusBadge status="regular" count={holidayCounts.regular} />}
              sx={{ textTransform: 'none' }}
            />
            <Tab
              value="special"
              label={<StatusBadge status="special" count={holidayCounts.special} />}
              sx={{ textTransform: 'none' }}
            />
            <Tab
              value="company"
              label={<StatusBadge status="company" count={holidayCounts.company} />}
              sx={{ textTransform: 'none' }}
            />
            <Tab
              value="assignments"
              label={
                <Badge badgeContent={employeeHolidays.length} color="primary">
                  <Typography variant="body2">Assignments</Typography>
                </Badge>
              }
              sx={{ textTransform: 'none' }}
            />
          </Tabs>

          <Box sx={{ mt: 3 }}>
            <HolidayBanner holidays={holidays} />
            
            {activeTab === "holidays" && (
              <HolidayListTable
                data={holidays.filter(h => h.type === 'regular')}
                loading={loading}
                error={error}
                onEdit={openEditModal}
                onAssign={openAssignModal}
              />
            )}

            {activeTab === "special" && (
              <HolidayListTable
                data={holidays.filter(h => h.type === 'special')}
                loading={loading}
                error={error}
                onEdit={openEditModal}
                onAssign={openAssignModal}
              />
            )}

            {activeTab === "company" && (
              <HolidayListTable
                data={holidays.filter(h => h.type === 'company')}
                loading={loading}
                error={error}
                onEdit={openEditModal}
                onAssign={openAssignModal}
              />
            )}

            {activeTab === "assignments" && (
              <EmployeeHolidayTable
                data={employeeHolidays}
                loading={loading}
                error={error}
              />
            )}
          </Box>
        </Box>

        <Fab
          color="primary"
          aria-label="add"
          onClick={() => {
            setSelectedHoliday(null);
            setFormData({
              name: "",
              date: new Date(),
              type: "regular",
              recurring: false,
              description: ""
            });
            setShowModal(true);
          }}
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

        {/* Holiday Form Modal */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Modal
            open={showModal}
            onClose={() => {
              setShowModal(false);
              setResponseMsg("");
              setSelectedHoliday(null);
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
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              p: 4,
              borderRadius: 2,
              position: 'relative',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
            }}>
              <IconButton
                aria-label="close"
                onClick={() => {
                  setShowModal(false);
                  setResponseMsg("");
                  setSelectedHoliday(null);
                }}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <Close />
              </IconButton>

              <Typography variant="h3" component="h2" color="primary" gutterBottom sx={{ 
                fontWeight: 600,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Event fontSize="large" />
                {selectedHoliday ? 'Edit Holiday' : 'Add New Holiday'}
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Holiday Name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  margin="normal"
                  required
                />

                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => handleFormChange('date', newValue)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" required />
                  )}
                />

                <TextField
                  select
                  fullWidth
                  label="Type"
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  margin="normal"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="regular">Regular Holiday</option>
                  <option value="special">Special Non-Working Holiday</option>
                  <option value="company">Company Holiday</option>
                </TextField>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.recurring}
                      onChange={(e) => handleFormChange('recurring', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Recurring Holiday (repeats annually)"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description (Optional)"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  margin="normal"
                />

                {responseMsg && (
                  <Alert
                    severity={responseMsg.includes("Error") ? "error" : "success"}
                    sx={{ mt: 2, mb: 2 }}
                    onClose={() => setResponseMsg("")}
                  >
                    {responseMsg}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                  {selectedHoliday && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(selectedHoliday.id)}
                      disabled={loading}
                      sx={{ mr: 'auto' }}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowModal(false);
                      setResponseMsg("");
                      setSelectedHoliday(null);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    sx={{ color: 'white !important' }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Modal>

          {/* Assignment Modal */}
          <Modal
            open={showAssignmentModal}
            onClose={() => {
              setShowAssignmentModal(false);
              setResponseMsg("");
              setSelectedHoliday(null);
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
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              p: 4,
              borderRadius: 2,
              position: 'relative',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
            }}>
              <IconButton
                aria-label="close"
                onClick={() => {
                  setShowAssignmentModal(false);
                  setResponseMsg("");
                  setSelectedHoliday(null);
                }}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <Close />
              </IconButton>

              <Typography variant="h3" component="h2" color="primary" gutterBottom sx={{ 
                fontWeight: 600,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Event fontSize="large" />
                Assign Holiday to Employees
              </Typography>

              {selectedHoliday && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h6">{selectedHoliday.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(selectedHoliday.date)} • {selectedHoliday.type}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Autocomplete
                  multiple
                  options={employees}
                  getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
                  value={selectedEmployees}
                  onChange={(event, newValue) => {
                    setSelectedEmployees(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Employees"
                      placeholder="Search employees..."
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.first_name} {option.last_name} ({option.department})
                    </li>
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={`${option.first_name} ${option.last_name}`}
                        size="small"
                      />
                    ))
                  }
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assignmentData.is_paid}
                      onChange={(e) => handleAssignmentChange('is_paid', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Paid Holiday"
                />

                <TextField
                  type="number"
                  label="Pay Multiplier"
                  value={assignmentData.pay_multiplier}
                  onChange={(e) => handleAssignmentChange('pay_multiplier', parseFloat(e.target.value))}
                  inputProps={{ min: 0, step: 0.1 }}
                  sx={{ width: 120, ml: 2 }}
                />
              </Box>

              {responseMsg && (
                <Alert
                  severity={responseMsg.includes("Error") ? "error" : "success"}
                  sx={{ mt: 2, mb: 2 }}
                  onClose={() => setResponseMsg("")}
                >
                  {responseMsg}
                </Alert>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setResponseMsg("");
                    setSelectedHoliday(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAssignSubmit}
                  disabled={loading || !selectedEmployees.length}
                  sx={{ color: 'white !important' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Assign Holiday'}
                </Button>
              </Box>
            </Paper>
          </Modal>
        </LocalizationProvider>
      </Card>
    </SideNavBar>
  );
};

export default HolidayManagement;