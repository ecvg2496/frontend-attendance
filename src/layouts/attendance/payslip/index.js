import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Card,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  IconButton,
  Snackbar,
  Tooltip,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import { Edit, Delete, Search, FileDownload } from '@mui/icons-material';
import { useLocation, useNavigate } from "react-router-dom";
import SideNavBar from '../content_page/nav_bar';
const AttendanceUserPayslip = () => {
  const [logs, setLogs] = useState([
    // Sample data for demonstration
    {
      name: 'John Doe',
      schedule: '9:00 AM - 5:00 PM',
      overtime: 'No',
      timestamp: '2023-10-01 08:59:00',
    },
    {
      name: 'Jane Smith',
      schedule: '10:00 AM - 6:00 PM',
      overtime: 'Yes',
      timestamp: '2023-10-01 09:05:00',
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const location = useLocation();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

   //Authentication
   useEffect(() => {
    const storedEmployee = localStorage.getItem("employee");
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    } else {
      navigate("/authentication/sign-in", { replace: true });
    }
  }, [navigate]);

  // Handle sorting
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort logs
  const sortedLogs = logs.sort((a, b) => {
    if (order === 'asc') {
      return a[orderBy] > b[orderBy] ? 1 : -1;
    } else {
      return a[orderBy] < b[orderBy] ? 1 : -1;
    }
  });

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredLogs = sortedLogs.filter((log) =>
    log.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle export to CSV
  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      logs.map((log) => Object.values(log).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'attendance_logs.csv');
    document.body.appendChild(link);
    link.click();
  };

  // Calculate totals for Timesheet
  const totalHours = logs.length * 8; // Assuming 8 hours per day
  const totalOvertime = logs.filter((log) => log.overtime === 'Yes').length;
  const totalDays = logs.length;

  return (
    <SideNavBar>
      <Card
        sx={{
          padding: '20px',
          margin: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h4" align="center" color = "primary" gutterBottom>
          Leave
        </Typography>

        {/* Tab Panel */}
        <Tabs
          value={page}
          onChange={(e, newValue) => setPage(newValue)}
          centered
          sx={{ marginBottom: '20px' }}
        >
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>

     

        {/* Timesheet Tab */}
        {page === 1 && (
          <div>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Total Hours Worked</TableCell>
                    <TableCell>Total Overtime Days</TableCell> 
                    <TableCell>Total Days Present</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{log.name}</TableCell>
                      <TableCell>{totalHours}</TableCell>
                      <TableCell>{totalOvertime}</TableCell>
                      <TableCell>{totalDays}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        {/* Snackbar for Notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Card>
    </SideNavBar>
  );
};

export default AttendanceUserPayslip;