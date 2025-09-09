import React, { useState, useEffect } from 'react';
import { axiosPrivate } from 'api/axios';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
  Paper,
  MenuItem, 
  IconButton,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import SideNavBar from 'layouts/attendance_dashboard/content_page/sidebar';
import { useNavigate } from "react-router-dom";

// Constants
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

const employmentTypeOptions = [
  'Regular',
  'Probationary',
  'Contractual',
  'Independent Contractor'
];

const statusOptions = [
  'Active',
  'Holiday',
  'Newly Hired',
  'Probation',
  'On Leave',
  'Training',
  'Resigned',
  'Terminated'
];

const clientStatusOptions = [
  'Active',
  'Inactive',
  'Pending'
];

const clientTypeOptions = [
  'Corporate',
  'Individual',
  'Government',
  'Non-Profit'
];

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

const formatDate = (dateString) => {
  if (!dateString) return '--';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};

// Status Badge Component
const StatusBadge = ({ status, clickable = false, isClient = false }) => {
  const employeeStatusStyles = {
    Active: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Holiday: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    'Newly Hired': { background: 'linear-gradient(to right, #2196F3, #64B5F6)', color: 'white' },
    Probation: { background: 'linear-gradient(to right, #FF9800, #FFB74D)', color: 'white' },
    Floating: { background: 'linear-gradient(to right, #FF9800, #FFB74D)', color: 'white' },
    'On Leave': { background: 'linear-gradient(to right, #9C27B0, #BA68C8)', color: 'white' },
    Training: { background: 'linear-gradient(to right, #00BCD4, #4DD0E1)', color: 'white' },
    Resigned: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    AWOL: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Terminated: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    default: { background: '#e0e0e0', color: 'rgba(0, 0, 0, 0.87)' }
  };

  const clientStatusStyles = {
    Active: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Inactive: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    Pending: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    default: { background: '#e0e0e0', color: 'rgba(0, 0, 0, 0.87)' }
  };

  const styles = isClient ? clientStatusStyles : employeeStatusStyles;

  return (
    <span
      style={{
        padding: '4px 12px',
        borderRadius: '16px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'capitalize',
        cursor: clickable ? 'pointer' : 'default',
        ...(styles[status] || styles.default)
      }}
    >
      {status}
    </span>
  );
};

const capitalizeFirstLetter = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Employee Table Component
const EmployeeTable = ({ employees, loading, error, onEditClick, onStatusChange }) => {
  // ... (keep existing state and handlers)

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ 
        width: '100%',
        minWidth: '1200px',
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ 
            backgroundColor: '#00B4D8',
            color: 'white',
            textAlign: 'left'
          }}>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Name</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Employment Date</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Position</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Department / Team</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Schedule</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Work Type</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Status</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Processed By</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} style={{ 
              borderBottom: '1px solid #e0e0e0',
              ':hover': { backgroundColor: '#f5f5f5' }
            }}>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                  }}>
                    {employee.first_name?.[0]}{employee.last_name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      {employee.email}
                    </div>
                  </div>
                </div>
              </td>
              
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {formatDate(employee.employment_date || '')}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {employee.position}
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{employee.team}</td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {formatTimeProfessional(employee.time_in)}
                  <span>-</span>
                  {formatTimeProfessional(employee.time_out)}
                </div>
                <div>
                  {employee?.contract_hours} hrs
                </div>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {/* <StatusBadge status={employee.type} /> */}
                {employee.type}
                 <div>
                      {capitalizeFirstLetter(employee.work_arrangement)}
                 </div>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <StatusBadge status={employee.status}/>
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>{employee?.processed_by || "N/A"}</td>
              <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>{new Date(employee.processed_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Client Table Component
const ClientTable = ({ clients, loading, error, onEditClick, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [openPopper, setOpenPopper] = useState(false);
  const [currentField, setCurrentField] = useState(null);

  const handleMenuClick = (event, client, field) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
    setCurrentField(field);
    setOpenPopper(true);
  };

  const handleMenuClose = () => {
    setOpenPopper(false);
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
        <CircularProgress size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '8px' }}>
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div style={{ padding: '8px' }}>
        <Alert severity="info">No clients found</Alert>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ 
        width: '100%',
        minWidth: '1200px',
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ 
            backgroundColor: '#00B4D8',
            color: 'white',
            textAlign: 'left'
          }}>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Client Name</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Client Email</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Type</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Timezone</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Schedule</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Processed By</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Date Created</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} style={{ 
              borderBottom: '1px solid #e0e0e0',
              ':hover': { backgroundColor: '#f5f5f5' }
            }}>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#9C27B0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                  }}>
                  {`${client.name?.split(' ')[0]?.[0] ?? ''}${client.name?.split(' ').slice(-1)[0]?.[0] ?? ''}`}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {client.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      Since: {formatDate(client.begin_date)}
                    </div>
                  </div>
                </div>
              </td>
              
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{client.email}</td>
              
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                {/* <StatusBadge status={client.client_type} isClient /> */}
                {client.client_type}
              </td>
              
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{client.timezone}</td>
              
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {formatTimeProfessional(client.start_time)}
                  <span>-</span>
                  {formatTimeProfessional(client.end_time)}
                  {client.lunch_break && (
                    <Tooltip title="Includes lunch break">
                      <span style={{ marginLeft: '4px', fontSize: '0.75rem' }}></span>
                    </Tooltip>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                  {client.schedule_type}
                </div>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
              <div>
                {client.created_by}
              </div>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
              <div>
                {formatDate(client.updated_at)}
              </div>
              </td>
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
              <div>
                {formatDate(client.created_at)}
              </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main Browser Component
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

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 0) {
          // Fetch users
          const response = await axiosPrivate.get('attendance/employees/');
          setAllUsers(response.data);
          setFilteredData(response.data);
        } else {
          // Fetch clients
          const response = await axiosPrivate.get('attendance/clients/');
          setAllClients(response.data);
          setFilteredData(response.data);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  useEffect(() => {
    const data = activeTab === 0 ? allUsers : allClients;
    let filtered = [...data];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.first_name?.toLowerCase().includes(term) || 
        (item.name?.toLowerCase().includes(term)) || 
        (item.email?.toLowerCase().includes(term)))
      );
    }
    
    if (activeLetter) {
      filtered = filtered.filter(item => 
        (item.first_name?.[0]?.toUpperCase() === activeLetter) ||
        (item.name?.[0]?.toUpperCase() === activeLetter)
      );
    }
    
    setFilteredData(filtered);
  }, [searchTerm, activeLetter, allUsers, allClients, activeTab]);

  const handleEditClick = (item) => {
    console.log('Edit clicked for:', item);
    // You can implement edit functionality here
  };

  const handleLetterClick = (letter) => {
    setActiveLetter(activeLetter === letter ? null : letter);
  };


  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchTerm('');
    setActiveLetter(null);
  };

  return (
    <SideNavBar>
      <Card sx={{mt: -10, minHeight: 'calc(104vh - 64px)'}}>
        <div style={{ padding: '24px' }}>
          <Typography variant="h4" component="h1" color="primary" style={{ marginBottom: '16px' }}>
            Browse User / Client
          </Typography>
          
          {/* Tabs */}
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ mb: 2 }}
          >
            <Tab 
              label="Employees" 
              icon={<PersonIcon fontSize="small" />} 
              iconPosition="start" 
            />
            <Tab 
              label="Clients" 
              icon={<BusinessIcon fontSize="small" />} 
              iconPosition="start" 
            />
          </Tabs>
          
          {/* Search and Filter Controls */}
          <div style={{ 
            padding: '16px', 
            marginBottom: '16px',
            backgroundColor: 'transparent'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ position: 'relative' }}>
                  <SearchIcon style={{ 
                    position: 'absolute', 
                    left: '8px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#757575'
                  }} />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab === 0 ? 'employees' : 'clients'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 8px 8px 32px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>
             
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginLeft: 'auto'
              }}>
                {/* <span style={{ fontSize: '0.875rem' }}>Page Size:</span>
                <TextField
                  type="number"
                  value={pageSize}
                  onChange={(e) => setPageSize(Math.max(1, parseInt(e.target.value) || 10))}
                  size="small"
                  style={{ width: '60px' }}
                  variant="outlined"
                /> */}
              </div>
            </div>
          </div>
          
          {/* Alphabet Filter */}
          <Divider style={{ margin: '16px 0' }} />
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px', 
            marginBottom: '16px',
            justifyContent: 'center'
          }}>
            {alphabet.map(letter => (
              <Button 
                key={letter} 
                onClick={() => handleLetterClick(letter)}
                variant={activeLetter === letter ? 'contained' : 'outlined'}
                sx={{
                  minWidth: '32px', 
                  height: '32px', 
                  padding: 0,
                  backgroundColor: activeLetter === letter ? '#2E7D32' : 'inherit',
                  color: activeLetter === letter ? 'white !important' : 'inherit',
                  borderColor: '#2E7D32',
                  '&:hover': {
                    backgroundColor: activeLetter === letter ? '#1B5E20' : 'rgba(46, 125, 50, 0.08)',
                    borderColor: '#1B5E20'
                  }
                }}
                size="small"
              >
                {letter}
              </Button>
            ))}
          </div>
          
          <Divider style={{ margin: '16px 0' }} />
          
          {/* Data Table */}
          {activeTab === 0 ? (
            <EmployeeTable
              employees={filteredData}
              loading={loading}
              error={error}
              onEditClick={handleEditClick}
            />
          ) : (
            <ClientTable
              clients={filteredData}
              loading={loading}
              error={error}
              onEditClick={handleEditClick}
            />
          )}
        </div>
      </Card>
    </SideNavBar>
  );
}