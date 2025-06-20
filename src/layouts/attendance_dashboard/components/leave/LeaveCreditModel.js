import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Select,
  MenuItem,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close, Edit, Add, Refresh } from '@mui/icons-material';
import api from 'api/axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 1200,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
  overflow: 'auto',
};

const LeaveCreditsModal = ({ open, onClose }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [editMode, setEditMode] = useState(null);
  const [formData, setFormData] = useState({
    employee: '',
    leave_type: '',
    days: 0
  });

  const LEAVE_TYPES = [
    { value: 'ANNUAL', label: 'Annual Leave (VL/EL/SL/BL)' },
    { value: 'BDL', label: 'Birthday Leave' },
    { value: 'MATERNITY', label: 'Maternity Leave' },
    { value: 'PATERNITY', label: 'Paternity Leave' },
    { value: 'MAGNA_CARTA', label: 'Magna Carta Leave' },
    { value: 'OTHERS', label: 'Other Leaves' }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [employeesRes, creditsRes] = await Promise.all([
        api.get('/employees/'),
        api.get(`/leave-credits/?year=${year}`)
      ]);

      // Join employee data with leave credits
      const employeesWithCredits = employeesRes.data.map(emp => {
        const employeeCredits = creditsRes.data.filter(c => c.employee === emp.id);
        return {
          ...emp,
          credits: employeeCredits.reduce((acc, credit) => {
            acc[credit.category] = credit;
            return acc;
          }, {})
        };
      });

      setEmployees(employeesWithCredits);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open, year]);

  const handleInitialize = async () => {
    if (window.confirm(`Initialize leave credits for all eligible employees in ${year}?`)) {
      try {
        await api.post('attendance/leave/initialize-credits/', { year });
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Initialization failed');
      }
    }
  };

  const handleEdit = (employeeId, creditType) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee?.credits?.[creditType]) {
      setEditMode({ employeeId, creditType });
      setFormData({
        employee: employeeId,
        leave_type: creditType,
        days: employee.credits[creditType].total_days
      });
    }
  };

  const handleSave = async () => {
    try {
      await api.patch(`/leave-credits/${formData.employee}/${formData.leave_type}/${year}/`, {
        total_days: formData.days
      });
      setEditMode(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const getCreditDisplay = (employee, creditType) => {
    if (!employee.credits?.[creditType]) return 'N/A';
    
    const credit = employee.credits[creditType];
    const remaining = credit.total_days - credit.used_days;
    
    if (creditType === 'ANNUAL') {
      return (
        <Box display="flex" alignItems="center">
          <Typography variant="body2" sx={{ mr: 1 }}>
            {remaining}/{credit.total_days}
          </Typography>
          {remaining < 1 && <Chip label="Exhausted" size="small" color="error" />}
        </Box>
      );
    } else if (creditType === 'BDL') {
      return credit.used_days > 0 ? (
        <Chip label="Used" size="small" color="success" />
      ) : (
        <Chip label="Available" size="small" />
      );
    } else {
      return credit.total_days > 0 ? (
        <Typography variant="body2">Available</Typography>
      ) : (
        <Typography variant="body2">N/A</Typography>
      );
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Employee Leave Credits</Typography>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              label="Year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              size="small"
              sx={{ width: 100 }}
            />
            <Button
              variant="contained"
              onClick={fetchData}
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleInitialize}
            startIcon={<Add />}
          >
            Initialize Credits
          </Button>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box bgcolor="error.light" p={2} mb={3} borderRadius={1}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Annual (5 days)</TableCell>
                <TableCell>Birthday</TableCell>
                <TableCell>Maternity</TableCell>
                <TableCell>Paternity</TableCell>
                <TableCell>Magna Carta</TableCell>
                <TableCell>Other</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <Typography fontWeight="bold">
                      {emp.first_name} {emp.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {emp.department} • {emp.team}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={emp.status} 
                      size="small" 
                      color={
                        ['Probation', 'Probationary'].includes(emp.status) ? 'warning' : 
                        ['Terminated', 'Resigned', 'AWOL'].includes(emp.status) ? 'error' : 'success'
                      }
                    />
                  </TableCell>
                  {['ANNUAL', 'BDL', 'MATERNITY', 'PATERNITY', 'MAGNA_CARTA', 'OTHERS'].map((type) => (
                    <TableCell key={type}>
                      {editMode?.employeeId === emp.id && editMode?.creditType === type ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <TextField
                            type="number"
                            value={formData.days}
                            onChange={(e) => setFormData({...formData, days: e.target.value})}
                            size="small"
                            sx={{ width: 80 }}
                          />
                          <Button 
                            size="small" 
                            onClick={handleSave}
                            variant="contained"
                          >
                            Save
                          </Button>
                          <Button 
                            size="small" 
                            onClick={() => setEditMode(null)}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Box display="flex" alignItems="center" gap={1}>
                          {getCreditDisplay(emp, type)}
                          {!['Probation', 'Probationary', 'Terminated', 'Resigned', 'AWOL'].includes(emp.status) && (
                            <IconButton 
                              size="small"
                              onClick={() => handleEdit(emp.id, type)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => {
                        // You can implement a detailed view here
                      }}
                    >
                      View History
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default LeaveCreditsModal;