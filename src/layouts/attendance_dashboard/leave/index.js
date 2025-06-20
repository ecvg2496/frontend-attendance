import React, { useState, useEffect } from "react";
import api from "api/axios";
import { 
  Card, Box, Tabs, Tab, Button, Modal, 
  CircularProgress, TextField, Badge, Typography,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Select, MenuItem,
  Chip, IconButton, Grid, Divider
} from '@mui/material';
import { 
  PendingActions, CheckCircle, Cancel, 
  Add, Close, Refresh, Edit, Save,
  ArrowDropDown, ArrowDropUp
} from '@mui/icons-material';
import SideNavBar from "../content_page/sidebar";
import '../content_page/css/admintable.css';

const AttendanceAdminLeaveDashboard = () => {
  const [tabValue, setTabValue] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedCredits, setEditedCredits] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'applied_at', direction: 'desc' });
  
  // Data states
  const [leaveCredits, setLeaveCredits] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);

  // Define leave types and status colors
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
    pending: { bg: "#FFF3E0", color: "#E65100", icon: <PendingActions /> },
    approved: { bg: "#E8F5E9", color: "#2E7D32", icon: <CheckCircle /> },
    rejected: { bg: "#FFEBEE", color: "#C62828", icon: <Cancel /> },
  };

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [creditsRes, leavesRes] = await Promise.all([
        api.get(`/attendance/leave-credits/?year=${year}`),
        api.get('/attendance/leave-applications/') // Get all leave applications
      ]);
      
      setLeaveCredits(creditsRes.data);
      setEditedCredits([...creditsRes.data]);
      setAllLeaves(leavesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setLoading(true);
      const response = await api.patch(`/attendance/leave-application/${id}/status/`, {
        status: newStatus
      });
      
      // Optimistic update
      setAllLeaves(prev => 
        prev.map(leave => 
          leave.id === id ? { ...leave, status: newStatus } : leave
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const initializeCredits = async () => {
    try {
      await api.post('attendance/initialize-leave-credits/', { year });
      fetchData();
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Initialization failed');
    }
  };

  const handleCreditChange = (id, field, value) => {
    setEditedCredits(prev => 
      prev.map(credit => 
        credit.id === id ? { ...credit, [field]: value } : credit
      )
    );
  };

  const saveEditedCredits = async () => {
    try {
      setLoading(true);
      await api.patch('attendance/update-leave-credits/', { credits: editedCredits });
      setLeaveCredits(editedCredits);
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update credits');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedLeaves = React.useMemo(() => {
    let sortableItems = [...allLeaves];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [allLeaves, sortConfig]);

  const filteredLeaves = React.useMemo(() => {
    if (tabValue === 'all') return sortedLeaves;
    return sortedLeaves.filter(leave => leave.status === tabValue);
  }, [sortedLeaves, tabValue]);

  useEffect(() => {
    fetchData();
  }, [year]);

  const leaveCounts = {
    all: allLeaves.length,
    pending: allLeaves.filter(l => l.status === 'pending').length,
    approved: allLeaves.filter(l => l.status === 'approved').length,
    rejected: allLeaves.filter(l => l.status === 'rejected').length,
  };

  const calculateLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <ArrowDropUp /> : <ArrowDropDown />;
  };

  return (
    <SideNavBar>
      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              label="Year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              size="small"
              sx={{ width: 100 }}
            />
            <Button 
              variant="outlined" 
              onClick={fetchData}
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => setModalOpen(true)}
              startIcon={<Add />}
            >
              Initialize Credits
            </Button>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab value="all" label={
              <Badge badgeContent={leaveCounts.all} color="primary">
                All Requests
              </Badge>
            } />
            <Tab 
              value="pending" 
              label={
                <Badge badgeContent={leaveCounts.pending} color="warning">
                  <Box display="flex" alignItems="center">
                    <PendingActions sx={{ mr: 1 }} />
                    Pending
                  </Box>
                </Badge>
              }
            />
            <Tab 
              value="approved" 
              label={
                <Badge badgeContent={leaveCounts.approved} color="success">
                  <Box display="flex" alignItems="center">
                    <CheckCircle sx={{ mr: 1 }} />
                    Approved
                  </Box>
                </Badge>
              }
            />
            <Tab 
              value="rejected" 
              label={
                <Badge badgeContent={leaveCounts.rejected} color="error">
                  <Box display="flex" alignItems="center">
                    <Cancel sx={{ mr: 1 }} />
                    Rejected
                  </Box>
                </Badge>
              }
            />
            <Tab value="credits" label="Leave Credits" />
          </Tabs>
        </Box>

        <Box sx={{ mt: 2 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box color="error.main" p={2}>{error}</Box>
          ) : tabValue === 'credits' ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Employee</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Total Credits</TableCell>
                    <TableCell>Used Credits</TableCell>
                    <TableCell>Remaining</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editedCredits.map((credit) => (
                    <TableRow key={credit.id}>
                      <TableCell>{credit.employee_name}</TableCell>
                      <TableCell>{credit.leave_type}</TableCell>
                      <TableCell>{credit.year}</TableCell>
                      <TableCell>
                        {editMode ? (
                          <TextField
                            type="number"
                            value={credit.total_credits}
                            onChange={(e) => 
                              handleCreditChange(credit.id, 'total_credits', e.target.value)
                            }
                            size="small"
                            sx={{ width: 80 }}
                          />
                        ) : (
                          credit.total_credits
                        )}
                      </TableCell>
                      <TableCell>{credit.used_credits}</TableCell>
                      <TableCell>
                        {credit.total_credits - credit.used_credits}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box display="flex" justifyContent="flex-end" p={2}>
                <Button 
                  variant="contained" 
                  onClick={() => editMode ? saveEditedCredits() : setEditMode(true)}
                  startIcon={editMode ? <Save /> : <Edit />}
                  color={editMode ? "success" : "primary"}
                >
                  {editMode ? "Save Changes" : "Edit Credits"}
                </Button>
              </Box>
            </TableContainer>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>
                      <Box display="flex" alignItems="center" onClick={() => handleSort('employee_name')} sx={{ cursor: 'pointer' }}>
                        Employee
                        <SortIcon column="employee_name" />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" onClick={() => handleSort('leave_type')} sx={{ cursor: 'pointer' }}>
                        Leave Type
                        <SortIcon column="leave_type" />
                      </Box>
                    </TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" onClick={() => handleSort('status')} sx={{ cursor: 'pointer' }}>
                        Status
                        <SortIcon column="status" />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" onClick={() => handleSort('applied_at')} sx={{ cursor: 'pointer' }}>
                        Date Filed
                        <SortIcon column="applied_at" />
                      </Box>
                    </TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLeaves.map((leave) => {
                    const days = calculateLeaveDays(leave.start_date, leave.end_date);
                    const startDate = new Date(leave.start_date).toLocaleDateString();
                    const endDate = new Date(leave.end_date).toLocaleDateString();
                    
                    return (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <Box>
                            <Typography fontWeight="bold">{leave.employee_name}</Typography>
                            <Typography variant="body2" color="text.secondary">{leave.email}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{leave.leave_type}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography>{startDate}</Typography>
                            <Typography variant="body2" color="text.secondary">to {endDate}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{days}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography noWrap title={leave.reason}>
                            {leave.reason}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={leave.status}
                            sx={{
                              backgroundColor: statusColors[leave.status]?.bg,
                              color: statusColors[leave.status]?.color,
                              textTransform: 'capitalize'
                            }}
                            icon={statusColors[leave.status]?.icon}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(leave.applied_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {leave.status === 'pending' && (
                            <Box display="flex" gap={1}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => handleStatusUpdate(leave.id, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Initialize Leave Credits</Typography>
              <IconButton onClick={() => setModalOpen(false)}>
                <Close />
              </IconButton>
            </Box>
            
            <Typography paragraph>
              This will assign 5 annual leave days and 1 birthday leave day to all eligible employees for {year}.
            </Typography>
            
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button onClick={() => setModalOpen(false)} variant="outlined">
                Cancel
              </Button>
              <Button 
                onClick={initializeCredits} 
                variant="contained" 
                color="primary"
              >
                Initialize
              </Button>
            </Box>
          </Box>
        </Modal>
      </Card>
    </SideNavBar>
  );
};

export default AttendanceAdminLeaveDashboard;