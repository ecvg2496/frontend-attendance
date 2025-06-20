import React, { useState, useEffect } from "react";
import {
  Card,
  Snackbar,
  Alert,
  Typography,
  Box,
  Modal,
  Tabs,
  Tab,
  Button,
  Paper,
  Divider,
  Grid,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  useTheme,
  InputAdornment,
  Chip,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Autocomplete,
  Fab, 
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { CheckCircle } from '@mui/icons-material';
import {
  Close, Save, EditCalendar, PendingActions, Add,
  Edit, Delete, PersonAdd, AccessTime, Language,
  Visibility as VisibilityIcon,
  Groups,
  Work,
  Category
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import SideNavBar from "../content_page/sidebar";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { dataServicePrivate } from "global/function";
// Helper function for avatar colors
function stringToColor(string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

const formatTimeToAMPM = (timeString) => {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${period}`;
};

const ClientTable = ({ 
  clients, 
  loading, 
  error, 
  onEditClick, 
  onAssignClick, 
  onDeleteClick,
  onUnassignClick
}) => {
  const navigate = useNavigate();
  
  if (loading) {
    return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>;
  }

  if (error) {
    return <Box p={1}><Alert severity="error">{error}</Alert></Box>;
  }

  if (clients.length === 0) {
    return <Box p={1}><Alert severity="info">No clients found</Alert></Box>;
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
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Actions</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Client Name</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Type</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Timezone</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Schedule</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Assigned Employees</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Processed By</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date Created</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Date Modified</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
               <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <IconButton 
                  size="small"  
                  color="primary" 
                  sx={{ '&:hover': { backgroundColor: 'rgba(0, 180, 216, 0.1)' } }}
                  title="Edit Details"
                  onClick={() => onEditClick(client)}
                >
                  <Edit fontSize="small" />  
                </IconButton>
                <IconButton 
                  size="small"  
                  color="secondary" 
                  sx={{ '&:hover': { backgroundColor: 'rgba(0, 180, 216, 0.1)' } }}
                  title="Assign Employees"
                  onClick={() => onAssignClick(client)}
                >
                  <PersonAdd fontSize="small" />  
                </IconButton>
                <IconButton 
                  size="small"  
                  color="error" 
                  sx={{ '&:hover': { backgroundColor: 'rgba(0, 180, 216, 0.1)' } }}
                  title="Delete Client"
                  onClick={() => onDeleteClick(client)}
                >
                  <Delete fontSize="small" />  
                </IconButton>
              </td>
              
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: client.avatarColor || stringToColor(client.name),
                      fontSize: '0.75rem'
                    }}
                  >
                    {(() => {
                      const parts = client.name.trim().split(' ');
                      if (parts.length === 1) {
                        return parts[0][0].toUpperCase();
                      } else {
                        const firstInitial = parts[0][0].toUpperCase();
                        const lastInitial = parts[parts.length - 1][0].toUpperCase();
                        return `${firstInitial}${lastInitial}`;
                      }
                    })()}
                  </Avatar>
                  <Box>
                    <Box fontWeight={500} style={{ fontSize: '0.95rem' }}>
                      {client.name}
                    </Box>
                    <Box fontSize="0.75rem" color="#666">{client.email}</Box>
                  </Box>
                </Box>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {client.client_type}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {client.timezone}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {client.client_type !== 'project' ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    {formatTimeToAMPM(client.start_time)} - {formatTimeToAMPM(client.end_time)} 
                  </Box>
                  
                ) : 'Flexible'}
                  <div>
                     {client.lunch_break && (
                      <Chip 
                        label="1h lunch" 
                        size="small" 
                        variant="outlined" 
                        color="default"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                   </div>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {client.assigned_employees?.map(emp => (
                    <Chip
                      key={emp.id}
                      avatar={<Avatar sx={{ width: 24, height: 24 }}>{emp.first_name?.[0]}{emp.last_name?.[0]}</Avatar>}
                      label={`${emp.first_name} ${emp.last_name}`}
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: '0.75rem', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnassignClick(emp, client);
                      }}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onUnassignClick(emp, client);
                      }}
                      deleteIcon={<Close fontSize="small" />}
                    />
                  ))}
                  {(!client.assigned_employees || client.assigned_employees.length === 0) && (
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                      None assigned
                    </Typography>
                  )}
                </Box>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {client.created_by}
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>{new Date(client.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>{new Date(client.updated_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};
const AttendanceAdminClient = () => {
  const theme = useTheme();
  const [modalType, setModalType] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [timezoneAnchorEl, setTimezoneAnchorEl] = useState(null);
  const [newTimezone, setNewTimezone] = useState('');
  const [availableTimezones, setAvailableTimezones] = useState([
    'America/Los_Angeles',
    'America/New_York',
    'Europe/London',
    'Asia/Manila'
  ]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [employeeToUnassign, setEmployeeToUnassign] = useState(null);
  const [actionSelectionOpen, setActionSelectionOpen] = useState(false);
  const navigate = useNavigate();
  
  const [clientFormData, setClientFormData] = useState({
    name: '',
    email: '',
    timezone: '',
    schedule_type: '',
    client_type: '',
    begin_date: null,
    activeTrack: false,
    trackScreenshots: false,
    trackWebsites: false,
    requireActiveTrack: false,
    trackProcesses: false,
    start_time: '09:00',
    end_time: '17:00',
    lunch_break: true,
    working_hours: 8,
    avatarColor: '#3f51b5'
  });
  const [timeIn, setTimeIn] = useState(null);
  const [timeOut, setTimeOut] = useState(null);

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
    } else {
      fetchClients();
      fetchEmployees();
    }
  }, [navigate]);

  const fetchClients = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await dataServicePrivate('GET', 'attendance/clients/');
    setClients(response.data);
  } catch (err) {
    console.error('Error fetching clients:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

 const fetchEmployees = async () => {
  try {
    const response = await dataServicePrivate('GET', 'attendance/employees/');
    setEmployees(response.data);
  } catch (error) {
    console.error('Error fetching employees:', error);
  }
};
  useEffect(() => {
  if (selectedEmployee?.time_in) {
    const [hours, minutes] = selectedEmployee.time_in.split(':');
    const date = new Date();
    date.setHours(hours, minutes);
    setTimeIn(date);
  } else {
    setTimeIn(null);
  }

  if (selectedEmployee?.time_out) {
    const [hours, minutes] = selectedEmployee.time_out.split(':');
    const date = new Date();
    date.setHours(hours, minutes);
    setTimeOut(date);
  } else {
    setTimeOut(null);
  }
}, [selectedEmployee]);


  const calculateEndTime = (start_time, client_type, lunch_break) => {
    if (!start_time) return '17:00';
    
    const [hours, minutes] = start_time.split(':').map(Number);
    let totalHours = client_type === 'part-time' ? 4 : 8;
    if (lunch_break && client_type !== 'part-time') totalHours += 1;
    
    let endHour = hours + totalHours;
    const endMinute = minutes;
    
    if (endHour >= 24) endHour -= 24;
    
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (clientFormData.client_type && clientFormData.start_time) {
      const newEndTime = calculateEndTime(
        clientFormData.start_time, 
        clientFormData.client_type, 
        clientFormData.lunch_break
      );
      
      setClientFormData(prev => ({
        ...prev,
        end_time: newEndTime,
        working_hours: prev.client_type === 'part-time' ? 4 : 8
      }));
    }
  }, [clientFormData.start_time, clientFormData.client_type, clientFormData.lunch_break]);

  const handleOpenModal = (type) => {
    setModalType(type);
    setActiveTab(0);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedClient(null);
    setClientFormData({
      name: '',
      email: '',
      timezone: '',
      schedule_type: '',
      client_type: '',
      begin_date: null,
      activeTrack: false,
      trackScreenshots: false,
      trackWebsites: false,
      requireActiveTrack: false,
      trackProcesses: false,
      start_time: '09:00',
      end_time: '17:00',
      lunch_break: true,
      working_hours: 8,
      avatarColor: '#3f51b5'
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleClientFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    const updatedData = {
      ...clientFormData,
      [name]: type === 'checkbox' ? checked : value
    };

    if (name === 'name' && value && !clientFormData.name) {
      updatedData.avatarColor = stringToColor(value);
    }

    setClientFormData(updatedData);
  };


  const handleTimezoneClose = () => {
    setTimezoneAnchorEl(null);
  };

  const handleAddTimezone = () => {
    if (newTimezone && !availableTimezones.includes(newTimezone)) {
      setAvailableTimezones([...availableTimezones, newTimezone]);
      setClientFormData({
        ...clientFormData,
        timezone: newTimezone
      });
    }
    setNewTimezone('');
    handleTimezoneClose();
  };

  const handleAssignClick = (client) => {
    if (!client) return;
    
    setSelectedClient(client);
    setSelectedEmployees([]);
    setSelectedEmployee(null);
    setAssignDialogOpen(true);
  };

 const handleAssignEmployees = async (e) => {
  e.preventDefault();
  if (!selectedClient || !selectedEmployee) return;
  
  try {
    const response = await dataServicePrivate(
      'POST', 
      `attendance/clients/${selectedClient.id}/assign-employee/`,
      {
        employee_ids: [selectedEmployee.id],
        require_active_track: clientFormData.requireActiveTrack
      }
    );
    
    if (response.data.already_assigned) {
      alert(`${selectedEmployee.first_name} ${selectedEmployee.last_name} is already assigned to this client`);
      return;
    }
    
    console.log('Assignment successful:', response.data.message);
    setAssignDialogOpen(false);
    fetchClients();
  } catch (error) {
    console.error('Error assigning employees:', error);
    alert(`Error: ${error.response?.data?.message || error.message}`);
  }
  };

  const handleUnassignClick = (employee, client) => {
    setEmployeeToUnassign(employee);
    setSelectedClient(client);
    setUnassignDialogOpen(true);
  };

  const handleUnassignConfirm = async () => {
  if (!selectedClient || !employeeToUnassign) return;
  
  try {
    const response = await dataServicePrivate(
      'POST',
      `attendance/clients/${selectedClient.id}/unassign-employee/`,
      { employee_ids: [employeeToUnassign.id] }
    );

    console.log('Unassignment successful:', response.data.message);
    setUnassignDialogOpen(false);
    fetchClients();
  } catch (error) {
    console.error('Error unassigning employee:', error);
    alert(`Error: ${error.response?.data?.message || error.message}`);
  } finally {
    setEmployeeToUnassign(null);
  } 
  };

  const handleUnassignCancel = () => {
    setUnassignDialogOpen(false);
    setEmployeeToUnassign(null);
  };

  const handleSubmitClient = async (e) => {
  e.preventDefault();
  try {
    const adminCreatedBy = localStorage.getItem("employee");
    const currentAdmin = adminCreatedBy ? JSON.parse(adminCreatedBy) : null;
    const formData = {
      ...clientFormData,
      begin_date: clientFormData.begin_date ? clientFormData.begin_date.toISOString().split('T')[0] : null,
      created_by: currentAdmin ? (currentAdmin.first_name + " " + currentAdmin.last_name) : null
    };

    const method = selectedClient ? 'PUT' : 'POST';
    const url = selectedClient 
      ? `attendance/clients/${selectedClient.id}/`
      : 'attendance/clients/';

    const response = await dataServicePrivate(method, url, formData);
    
    console.log('Client saved:', response.data);
    handleCloseModal();
    fetchClients();
  } catch (error) {
    console.error('Error saving client:', error);
    alert(`Error: ${error.response?.data?.message || error.message}`);
  }
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
  if (!clientToDelete) return;
  
  try {
    await dataServicePrivate('DELETE', `attendance/clients/${clientToDelete.id}/`);
    fetchClients();
    setDeleteConfirmOpen(false);
    setClientToDelete(null);
  } catch (error) {
    console.error('Error deleting client:', error);
    alert(`Error: ${error.response?.data?.message || error.message}`);
  }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setClientToDelete(null);
  };

  const openTimezonePopover = Boolean(timezoneAnchorEl);
  const timezonePopoverId = openTimezonePopover ? 'timezone-popover' : undefined;
  const autoCompleteRef = React.useRef(null);
  useEffect(() => {
    if (assignDialogOpen && autoCompleteRef.current) {
      setTimeout(() => {
        autoCompleteRef.current.focus();
      }, 100);
    }
  }, [assignDialogOpen]);
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <SideNavBar>
        <Card sx={{ p: 3, position: 'relative', minHeight: 'calc(105vh - 64px)', mt: -10 }}>
          <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
            Client and Employee Assignment
          </Typography>

          <Box sx={{
              width: '100%',
              overflowX: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              '& .container': {
                minWidth: '100%',
                margin: 0,
                padding: 0
              },
              '& .responsive-table': {
                minWidth: '100%', 
                width: '100%'
              }
            }}>
            <ClientTable 
              clients={clients} 
              loading={loading}
              error={error}
              onEditClick={(client) => {
                setSelectedClient(client);
                setClientFormData({
                  ...client,
                  begin_date: client.begin_date ? new Date(client.begin_date) : null
                });
                handleOpenModal('client');
              }}
              onAssignClick={(client) => handleAssignClick(client)}
              onDeleteClick={(client) => handleDeleteClick(client)}
              onUnassignClick={(employee, client) => handleUnassignClick(employee, client)}
            />
          </Box>

          {/* Floating Action Button */}
         <Fab
          color="primary"
          aria-label="add"
          onClick={() => {
            setClientFormData({
              name: '',
              email: '',
              timezone: '',
              schedule_type: '',
              client_type: '',
              begin_date: null,
              activeTrack: false,
              trackScreenshots: false,
              trackWebsites: false,
              requireActiveTrack: false,
              trackProcesses: false,
              start_time: '09:00',
              end_time: '17:00',
              lunch_break: true,
              working_hours: 8,
              avatarColor: '#3f51b5'
            });
            setSelectedClient(null);
            setModalType('client');
          }}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark
            }
          }}
        >
          <Add />
        </Fab>

          {/* Action Selection Modal */}
          <Modal
            open={actionSelectionOpen}
            onClose={() => setActionSelectionOpen(false)}
            aria-labelledby="action-selection-modal"
          >
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: '8px'
            }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Select Action
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setActionSelectionOpen(false);
                        if (clients.length > 0) {
                          setSelectedClient(clients[0]); // Or let user select which client
                          setAssignDialogOpen(true);
                        } 
                    }}
                    sx={{
                      height: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      p: 2
                    }}
                  >
                    <Work fontSize="large" />
                    <Typography>Create Client</Typography>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setActionSelectionOpen(false);
                      setAssignDialogOpen(true);
                    }}
                    sx={{
                      height: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      p: 2
                    }}
                  >
                    <PersonAdd fontSize="large" />
                    <Typography>Assign Users</Typography>
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Modal>

          {/* Assign Employees Dialog */}
          <Dialog 
            open={assignDialogOpen} 
            onClose={() => setAssignDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ backgroundColor: '#f5f5f5', pb: 1 }}>
              <Typography variant="h2" color = "primary" sx={{fontWeight: 'bold', fontSize: '1.2rem' }}>
                Assign Employee to {selectedClient?.name || 'Selected Client'}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              {selectedClient && (
                <Box component="form" onSubmit={handleAssignEmployees} sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Autocomplete
                      options={employees}
                      getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
                      value={selectedEmployee}
                      onChange={(event, newValue) => {
                        setSelectedEmployee(newValue);
                        if (newValue) {
                          setSelectedEmployees([newValue.id]);
                        }
                      }}
                      filterOptions={(options, state) => {
                        const inputValue = state.inputValue.toLowerCase();
                        return options
                          .filter(option => 
                            !selectedClient?.assigned_employees?.some(emp => emp.id === option.id)
                          )
                          .filter(option => 
                            `${option.first_name} ${option.last_name}`.toLowerCase().includes(inputValue))
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search Employee"
                          variant="outlined"
                          fullWidth
                          required
                          autoFocus
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonAdd />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => {
                        const isAssigned = selectedClient?.assigned_employees?.some(
                          emp => emp.id === option.id
                        );
                        
                        return (
                          <li {...props}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              width: '100%',
                              opacity: isAssigned ? 0.6 : 1
                            }}>
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32,
                                  bgcolor: stringToColor(option.first_name + ' ' + option.last_name)
                                }}
                              >
                                {option.first_name[0]}{option.last_name[0]}
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography>
                                  {option.first_name} {option.last_name}
                                  {isAssigned && (
                                    <Chip 
                                      label="Assigned" 
                                      size="small" 
                                      color="success"
                                      sx={{ ml: 1, fontSize: '0.7rem' }}
                                    />
                                  )}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {option.department} • {option.team}
                                </Typography>
                              </Box>
                              {isAssigned && (
                                <Box sx={{ color: theme.palette.success.main }}>
                                  <CheckCircle fontSize="small" />
                                </Box>
                              )}
                            </Box>
                          </li>
                        );
                      }}
                    />
                    </Grid>
                    {selectedEmployee && (
                    <>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Department"
                          value={selectedEmployee.department || ''}
                          onChange={(e) => setSelectedEmployee({
                            ...selectedEmployee,
                            department: e.target.value
                          })}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Category />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Team"
                          value={selectedEmployee.team || ''}
                          onChange={(e) => setSelectedEmployee({
                            ...selectedEmployee,
                            team: e.target.value
                          })}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Groups />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                       <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Timezone</InputLabel>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%'
                            }}
                          >
                            <Select
                              name="timezone"
                              value={clientFormData.timezone}
                              onChange={handleClientFormChange}
                              label="Timezone"
                              size="medium"
                              sx={{
                                flex: 1,
                                '& .MuiSelect-select': {
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '56px !important',
                                  minHeight: '56px !important',
                                  paddingLeft: '16px'
                                },
                                '& .MuiOutlinedInput-root': {
                                  height: '56px'
                                }
                              }}
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Language fontSize="medium" sx={{ mr: 1 }} />
                                  {selected}
                                </Box>
                              )}
                            >
                              {availableTimezones.map((tz) => (
                                <MenuItem key={tz} value={tz}>
                                  <Box display="flex" alignItems="center">
                                    <Language fontSize="medium" sx={{ mr: 1 }} />
                                    {tz}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </Box>
                        </FormControl>   
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <MobileTimePicker
                          label="Time In"
                          value={timeIn}
                          onChange={(newValue) => {
                            setTimeIn(newValue);
                            setSelectedEmployee({
                              ...selectedEmployee,
                              time_in: newValue ? format(newValue, 'HH:mm') : ''
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AccessTime />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                          
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MobileTimePicker
                          label="Time Out"
                          value={timeOut}
                          onChange={(newValue) => {
                            setTimeOut(newValue);
                            setSelectedEmployee({
                              ...selectedEmployee,
                              time_out: newValue ? format(newValue, 'HH:mm') : ''
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AccessTime />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>

                 <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedEmployee.include_break || false}
                        onChange={(e) => {
                          const includeBreak = e.target.checked;
                          setSelectedEmployee({
                            ...selectedEmployee,
                            include_break: includeBreak,
                            time_out: selectedEmployee.time_in ? 
                              calculateEndTime(
                                selectedEmployee.time_in, 
                                selectedEmployee.working_hours, 
                                includeBreak
                              ) : ''
                          });
                        }}
                        color="primary"
                        sx={{color:'black !important'}}
                      />
                    }
                    label="Include 1-hour break (automatically adjusts end time)"
                  />
                </Grid>

                  </LocalizationProvider>
                    </>
                  )}
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      onClick={() => setAssignDialogOpen(false)}
                      color="secondary"
                      sx={{ mr: 2 }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      color="primary"
                      variant="contained"
                      disabled={!selectedEmployee}
                      sx={{color: 'white !important'}}
                    >
                      Assign Employee
                    </Button>
                  </Box>
                </Box>
              )}
            </DialogContent>
          </Dialog>

          {/* Unassign Employee Dialog */}
          <Dialog
            open={unassignDialogOpen}
            onClose={handleUnassignCancel}
            maxWidth="xs"
          >
            <DialogTitle>Confirm Unassign Employee</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to unassign {employeeToUnassign?.first_name} {employeeToUnassign?.last_name} from {selectedClient?.name}?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleUnassignCancel} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={handleUnassignConfirm} 
                color="error"
                variant="contained"
              >
                Unassign
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteConfirmOpen}
            onClose={handleDeleteCancel}
            maxWidth="xs"
          >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete {clientToDelete?.name}?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm} 
                color="error"
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Client Creation/Edit Modal */}
          <Modal
            open={modalType === 'client'}
            onClose={handleCloseModal}
            aria-labelledby="client-creation-modal"
          >
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '95%', md: '700px' },
              maxHeight: '85vh',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 0,
              borderRadius: '8px',
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box p={2} sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: 'white !important' }}>
                  {selectedClient ? 'Edit Client' : 'Create New Client'}
                </Typography>
              </Box>

              <Paper square elevation={0} sx={{ position: 'sticky', top: 64, zIndex: 1 }}>
                <Tabs 
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTabs-indicator': {
                      height: 3,
                      backgroundColor: theme.palette.primary.main
                    }
                  }}
                >
                  <Tab label="Basic Information" sx={{ py: 2, fontSize: '0.875rem' }} />
                  <Tab label="Schedule Settings" sx={{ py: 2, fontSize: '0.875rem' }} />
                </Tabs>
              </Paper>

              <Box p={3} sx={{ overflow: 'auto', flex: 1, mt: 2 }}>
                <form onSubmit={handleSubmitClient}>
                  {activeTab === 0 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar 
                            sx={{ 
                              bgcolor: clientFormData.avatarColor,
                              width: 56, 
                              height: 56,
                              fontSize: '1.5rem'
                            }}
                          >
                            {clientFormData.name ? clientFormData.name[0].toUpperCase() : 'C'}
                          </Avatar>
                          <TextField
                            fullWidth
                            label="Client Name"
                            name="name"
                            value={clientFormData.name}
                            onChange={handleClientFormChange}
                            required
                            variant="outlined"
                            size="medium"
                            sx={{
                              '& .MuiInputBase-root': {
                                height: '56px'
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            value={clientFormData.email}
                            onChange={handleClientFormChange}
                            required
                            variant="outlined"
                            size="medium"
                            sx={{
                              '& .MuiInputBase-root': {
                                height: '56px'
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Client Type</InputLabel>
                          <Select
                            name="client_type"
                            value={clientFormData.client_type}
                            onChange={handleClientFormChange}
                            label="Client Type"
                            size="medium"
                            sx={{
                              mr: 2,
                              '& .MuiSelect-select': {
                                height: '56px !important',
                                minHeight: '56px !important',
                                paddingLeft: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                textIndent: '4px',
                              },
                              '& .MuiOutlinedInput-root': {
                                height: '56px',
                              },
                            }}
                          >
                            <MenuItem value="Part-time">Part-time (4hrs/day)</MenuItem>
                            <MenuItem value="Standard">Standard (8hrs/day)</MenuItem>
                            <MenuItem value="Project">Project (no specific hours)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Schedule Type</InputLabel>
                          <Select
                            name="schedule_type"
                            value={clientFormData.schedule_type}
                            onChange={handleClientFormChange}
                            label="Schedule Type"
                            size="medium"
                            sx={{
                              mr: 2,
                              '& .MuiSelect-select': {
                                height: '56px !important',
                                minHeight: '56px !important',
                                paddingLeft: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                textIndent: '4px',
                              },
                              '& .MuiOutlinedInput-root': {
                                height: '56px',
                              },
                            }}
                          >
                              <MenuItem value="Custom Schedule">Custom Schedule</MenuItem>
                              <MenuItem value="Flexible">Flexible</MenuItem>
                              <MenuItem value="Not Flexible">Not Flexible</MenuItem>
                              <MenuItem value="Fixed Schedule">Fixed Schedule</MenuItem>
                              <MenuItem value="Rotating Shifts">Rotating Shifts</MenuItem>
                              <MenuItem value="Split Shift">Split Shift</MenuItem>
                              <MenuItem value="On-Call">On-Call</MenuItem>
                              <MenuItem value="Flex-time">Flex-Time</MenuItem>
                              <MenuItem value="Compressed Workweek">Compressed Workweek</MenuItem>
                              <MenuItem value="Remote/Telecommute">Remote/Telecommute</MenuItem>
                              <MenuItem value="Shift Work">Shift Work</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Timezone</InputLabel>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%'
                            }}
                          >
                            <Select
                              name="timezone"
                              value={clientFormData.timezone}
                              onChange={handleClientFormChange}
                              label="Timezone"
                              size="medium"
                              sx={{
                                flex: 1,
                                '& .MuiSelect-select': {
                                  display: 'flex',
                                  alignItems: 'center',
                                  height: '56px !important',
                                  minHeight: '56px !important',
                                  paddingLeft: '16px'
                                },
                                '& .MuiOutlinedInput-root': {
                                  height: '56px'
                                }
                              }}
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Language fontSize="medium" sx={{ mr: 1 }} />
                                  {selected}
                                </Box>
                              )}
                            >
                              {availableTimezones.map((tz) => (
                                <MenuItem key={tz} value={tz}>
                                  <Box display="flex" alignItems="center">
                                    <Language fontSize="medium" sx={{ mr: 1 }} />
                                    {tz}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </Box>
                        </FormControl>
                        <Popover
                          id={timezonePopoverId}
                          open={openTimezonePopover}
                          anchorEl={timezoneAnchorEl}
                          onClose={handleTimezoneClose}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                        >
                          <Box sx={{ p: 2, width: 300 }}>
                            <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
                              Add New Timezone
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <TextField
                                size="small"
                                value={newTimezone}
                                onChange={(e) => setNewTimezone(e.target.value)}
                                placeholder="e.g., America/Chicago"
                                fullWidth
                              />
                              <Button 
                                variant="contained" 
                                onClick={handleAddTimezone}
                                disabled={!newTimezone}
                              >
                                Add
                              </Button>
                            </Box>
                          </Box>
                        </Popover>
                      </Grid>
                      <Grid item xs={12}>
                        <DatePicker
                          label="Begin On"
                          value={clientFormData.begin_date}
                          onChange={(newValue) => {
                            setClientFormData({
                              ...clientFormData,
                              begin_date: newValue
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              size="medium" 
                              required
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start" sx={{ mr: 1 }}>
                                    <AccessTime fontSize="medium" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiInputBase-root': {
                                  height: '56px'
                                }
                              }}
                            />
                          )}
                          components={{
                            OpenPickerIcon: AccessTime
                          }}
                          views={['year', 'month', 'day']}
                          showDaysOutsideCurrentMonth
                        />
                      </Grid>
                    </Grid>
                  )}

                  {activeTab === 1 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                          Working Hours
                        </Typography>
                        {clientFormData.client_type !== 'project' && (
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                label="Start Time"
                                type="time"
                                name="start_time"
                                value={clientFormData.start_time}
                                onChange={handleClientFormChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                size="small"
                                sx={{
                                  '& .MuiInputBase-root': {
                                    height: '40px'
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                label="End Time"
                                type="time"
                                name="end_time"
                                value={clientFormData.end_time}
                                onChange={handleClientFormChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                size="small"
                                sx={{
                                  '& .MuiInputBase-root': {
                                    height: '40px'
                                  }
                                }}
                                InputProps={{
                                  readOnly: true
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="lunch_break"
                                    checked={clientFormData.lunch_break}
                                    onChange={handleClientFormChange}
                                    color="primary"
                                  />
                                }
                                label="Include 1-hour lunch break (automatically deducted from working hours)"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label={`Total Working Hours (${clientFormData.client_type === 'part-time' ? '4' : '8'} hrs/day)`}
                                type="number"
                                name="working_hours"
                                value={clientFormData.working_hours}
                                onChange={handleClientFormChange}
                                variant="outlined"
                                size="small"
                                InputProps={{
                                  readOnly: true,
                                  endAdornment: <Typography variant="body2">hours/day</Typography>,
                                }}
                                sx={{
                                  '& .MuiInputBase-root': {
                                    height: '40px'
                                  },
                                  '& .MuiInputBase-input': {
                                    color: theme.palette.text.secondary
                                  }
                                }}
                              />
                            </Grid>
                          </Grid>
                        )}
                        {clientFormData.client_type === 'project' && (
                          <Typography variant="body2" color="textSecondary">
                            Project clients don't have specific working hour requirements.
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  )}

                  <Divider sx={{ my: 3 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      {activeTab > 0 && (
                        <Button
                          variant="outlined"
                          sx={{ 
                            mr: 2,
                            borderRadius: '6px',
                            px: 3,
                            py: 1,
                            textTransform: 'none'
                          }}
                          onClick={() => setActiveTab(activeTab - 1)}
                        >
                          Previous
                        </Button>
                      )}
                    </Box>
                    <Box>
                      {activeTab < 1 && (
                        <Button
                          variant="contained"
                          sx={{ 
                            mr: 2,
                            borderRadius: '6px',
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            color: 'white !important'
                          }}
                          onClick={() => setActiveTab(activeTab + 1)}
                        >
                          Next
                        </Button>
                      )}
                      {activeTab === 1 && (
                        <Button
                          variant="contained"
                          type="submit"
                          startIcon={<Save />}
                          sx={{ 
                            borderRadius: '6px',
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            color: 'white !important'
                          }}
                        >
                          Save
                        </Button>
                      )}
                    </Box>
                  </Box>
                </form>
              </Box>
            </Box>
          </Modal>
        </Card>
      </SideNavBar>
    </LocalizationProvider>
  );
};

export default AttendanceAdminClient;