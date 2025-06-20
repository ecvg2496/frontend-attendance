import React, { useState, useMemo } from "react";
import {
  Card,
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
  Fab
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Close, Save, Search, EditCalendar, PendingActions, Add, FilterList } from '@mui/icons-material';
import SideNavBar from "../../content_page/sidebar";
import '../../content_page/css/admintable.css';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Pending: { background: 'linear-gradient(to right, #FFA000, #FFCA28)', color: 'white' },
    Approved: { background: 'linear-gradient(to right, #4CAF50, #81C784)', color: 'white' },
    Rejected: { background: 'linear-gradient(to right, #F44336, #E57373)', color: 'white' },
    default: { background: '#e0e0e0', color: 'rgba(0, 0, 0, 0.87)' }
  };

  return (
    <span
      style={{
        padding: '4px 12px',
        borderRadius: '16px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'capitalize',
        ...(statusStyles[status] || statusStyles.default)
      }}
    >
      {status}
    </span>
  );
};

const AttendanceUserRequest = () => {
  const theme = useTheme();
  const [modalType, setModalType] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [clientFormData, setClientFormData] = useState({
    clientName: '',
    timezone: 'America/Los_Angeles',
    scheduleType: 'not_flexible',
    beginDate: '',
    activeTrack: false,
    trackScreenshots: false,
    trackWebsites: false,
    requireActiveTrack: false,
    trackProcesses: false,
    startTime: '08:00',
    endTime: '17:00',
    lunchBreak: true,
    workingHours: 8
  });

  const [requests, setRequests] = useState([
    { id: 1, client: 'Client A', type: 'Schedule Change', status: 'Pending', date: '2023-05-15', requestedBy: 'John Doe' },
    { id: 2, client: 'Client B', type: 'Time Off', status: 'Approved', date: '2023-05-10', requestedBy: 'Jane Smith' },
    { id: 3, client: 'Client C', type: 'Remote Work', status: 'Rejected', date: '2023-05-05', requestedBy: 'Mike Johnson' },
    { id: 4, client: 'Client A', type: 'Overtime', status: 'Pending', date: '2023-05-18', requestedBy: 'Sarah Williams' },
  ]);

  const [filter, setFilter] = useState({
    status: '',
    client: '',
    type: '',
    dateFrom: '',
    dateTo: ''
  });

  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      return (
        (filter.status === '' || request.status === filter.status) &&
        (filter.client === '' || request.client.includes(filter.client)) &&
        (filter.type === '' || request.type.includes(filter.type)) &&
        (filter.dateFrom === '' || request.date >= filter.dateFrom) &&
        (filter.dateTo === '' || request.date <= filter.dateTo)
      );
    });
  }, [requests, filter]);

  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      if (order === 'asc') {
        return a[orderBy] > b[orderBy] ? 1 : -1;
      } else {
        return a[orderBy] < b[orderBy] ? 1 : -1;
      }
    });
  }, [filteredRequests, order, orderBy]);

  const paginatedRequests = useMemo(() => {
    return sortedRequests.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedRequests, page, rowsPerPage]);

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredRequests.map((request) => request.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setActiveTab(0);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setClientFormData({
      clientName: '',
      timezone: 'America/Los_Angeles',
      scheduleType: 'not_flexible',
      beginDate: '',
      activeTrack: false,
      trackScreenshots: false,
      trackWebsites: false,
      requireActiveTrack: false,
      trackProcesses: false,
      startTime: '08:00',
      endTime: '17:00',
      lunchBreak: true,
      workingHours: 8
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleClientFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClientFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitClient = (e) => {
    e.preventDefault();
    console.log('Client form submitted:', clientFormData);
    handleCloseModal();
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on selected rows:`, selected);
  };

  return (
    <SideNavBar>
      <Card sx={{ p: 3, mt: -10 }}>
        <Typography variant="h4" color="primary" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Attendance Request Management
        </Typography>
        
        {/* Bulk Actions Toolbar (shown when rows are selected) */}
        {selected.length > 0 && (
          <Paper elevation={2} sx={{ p: 1, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {selected.length} selected
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => handleBulkAction('approve')}
              sx={{ textTransform: 'none' }}
            >
              Approve Selected
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              color="error"
              onClick={() => handleBulkAction('reject')}
              sx={{ textTransform: 'none' }}
            >
              Reject Selected
            </Button>
            <Button 
              variant="text" 
              size="small"
              onClick={() => setSelected([])}
              sx={{ textTransform: 'none', ml: 'auto' }}
            >
              Clear Selection
            </Button>
          </Paper>
        )}
        
        <Grid container spacing={3}>
          {/* Filter Section */}
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: '12px' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <FilterList color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Filters
                </Typography>
              </Box>
              
          <FormControl
            fullWidth
            size="small"
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiInputBase-root': {
                height: '40px', // consistent height
                borderRadius: '6px',
              },
              '& .MuiSelect-select': {
                paddingTop: '10.5px', // Adjust this to vertically center the text
                paddingBottom: '10.5px',
              }
            }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
              
              <TextField
                fullWidth
                label="Client Name"
                name="client"
                value={filter.client}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Request Type"
                name="type"
                value={filter.type}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="From Date"
                type="date"
                name="dateFrom"
                value={filter.dateFrom}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="To Date"
                type="date"
                name="dateTo"
                value={filter.dateTo}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
              />
              
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => setFilter({
                  status: '',
                  client: '',
                  type: '',
                  dateFrom: '',
                  dateTo: ''
                })}
              >
                Clear Filters
              </Button>
            </Paper>
          </Grid>
          
          {/* Table Section */}
          <Grid item xs={12} md={9}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: '12px' }}>
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%',
                  minWidth: '1000px',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem'
                }}>
                  <thead>
                    <tr style={{ 
                      backgroundColor: '#00B4D8',
                      color: 'white',
                      textAlign: 'left'
                    }}>
                      <th style={{ padding: '12px 16px', fontWeight: 'bold', width: '5%' }}>ID</th>
                      <th 
                        style={{ padding: '12px 16px', fontWeight: 'bold', width: '15%', cursor: 'pointer' }}
                        onClick={() => handleRequestSort('client')}
                      >
                        Client
                        {orderBy === 'client' && (
                          <span style={{ marginLeft: '4px' }}>
                            {order === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Request Type</th>
                      <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Requested By</th>
                      <th style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRequests.map((request) => {
                      const isItemSelected = isSelected(request.id);
                      return (
                        <tr 
                          key={request.id}
                          style={{ 
                            borderBottom: '1px solid #e0e0e0',
                            backgroundColor: isItemSelected ? '#e3f2fd' : 'inherit',
                            ':hover': { backgroundColor: '#f5f5f5' }
                          }}
                          onClick={(event) => handleClick(event, request.id)}
                        >
                          <td style={{ padding: '12px 16px' }}>{request.id}</td>
                          <td style={{ padding: '12px 16px' }}>{request.client}</td>
                          <td style={{ padding: '12px 16px' }}>{request.type}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <StatusBadge status={request.status} />
                          </td>
                          <td style={{ padding: '12px 16px' }}>{request.date}</td>
                          <td style={{ padding: '12px 16px' }}>{request.requestedBy}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button 
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                marginLeft: '8px',
                                color: '#1976d2'
                              }}
                            >
                              <PendingActions fontSize="small" />
                            </button>
                            <button 
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                marginLeft: '8px',
                                color: '#9c27b0'
                              }}
                            >
                              <EditCalendar fontSize="small" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginTop: '16px',
                padding: '8px 16px'
              }}>
                <div style={{ fontSize: '0.875rem' }}>
                  Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filteredRequests.length)} of {filteredRequests.length} entries
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.875rem' }}>Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    {[5, 10, 25].map((rows) => (
                      <option key={rows} value={rows}>{rows}</option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                      disabled={page === 0}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: page === 0 ? 'not-allowed' : 'pointer',
                        opacity: page === 0 ? 0.5 : 1
                      }}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(prev => prev + 1)}
                      disabled={page >= Math.ceil(filteredRequests.length / rowsPerPage) - 1}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: page >= Math.ceil(filteredRequests.length / rowsPerPage) - 1 ? 'not-allowed' : 'pointer',
                        opacity: page >= Math.ceil(filteredRequests.length / rowsPerPage) - 1 ? 0.5 : 1
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </Paper>
          </Grid>
        </Grid>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 56,
            height: 56,
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            }
          }}
        >
          <Add />
        </Fab>
      </Card>
    </SideNavBar>
  );
};

export default AttendanceUserRequest;