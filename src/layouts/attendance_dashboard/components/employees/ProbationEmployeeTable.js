import React, { useState } from "react";
import { 
  IconButton, 
  Popper, 
  Paper, 
  MenuItem, 
  ClickAwayListener,
  Box
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import StatusBadge from "./StatusBadge";

const statusOptions = [
  'Active',
  'Regular',
  'Floating',
  'Holiday',
  'Newly Hired',
  'Probation',
  'On Leave',
  'Training',
  'Resigned',
  'Terminated'
];

const formatTimeProfessional = (timeString) => {
  if (!timeString) return '--:--';
  try {
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours, 10);
    const isPM = hourNum >= 12;
    const hour12 = hourNum % 12 || 12;
    
    return (
      <span style={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        fontSize: '0.85rem'
      }}>
        <span style={{ 
          fontWeight: 600,
          marginRight: '2px'
        }}>
          {`${hour12}:${minutes.padStart(2, '0')}`}
        </span>
        <span style={{
          fontSize: '0.65em',
          padding: '2px 6px',
          borderRadius: '10px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          background: isPM ? 'linear-gradient(to right, #2c3e50, #4a6491)' : 'linear-gradient(to right, #f5f7fa, #e4e8f0)',
          color: isPM ? '#ecf0f1' : '#2980b9'
        }}>
          {isPM ? 'PM' : 'AM'}
        </span>
      </span>
    );
  } catch (e) {
    return timeString;
  }
};

const ProbationEmployeeTable = ({ employees = [], loading, error, onEditClick, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openStatusPopper, setOpenStatusPopper] = useState(false);

  const probationEmployees = employees?.filter(emp => 
    emp?.status?.toLowerCase() === 'probation'
  ) || [];

  const handleStatusClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
    setOpenStatusPopper(true);
  };

  const handleStatusChange = (newStatus) => {
    onStatusChange(selectedEmployee.id, newStatus);
    setOpenStatusPopper(false);
  };

  if (loading) return <div className="loading" style={{ fontSize: '0.9rem' }}>Loading probation employees...</div>;
  if (error) return <div className="error" style={{ fontSize: '0.9rem' }}>Error: {error}</div>;
  if (probationEmployees.length === 0) return <div className="no-data" style={{ fontSize: '0.9rem' }}>No probation employees found</div>;

  return (
    <div style={{ 
      width: '100%', 
      overflowX: 'auto',
      display: 'block'
    }}>
      <table style={{ 
        width: 'auto',
        minWidth: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.9rem',
        tableLayout: 'auto'
      }}>
        <thead>
          <tr style={{ 
            fontSize: '1rem', 
            backgroundColor: '#00B4D8',
            color: 'white'
          }}>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Name</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Employment Type</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Job Type</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Work Set-up</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Schedule</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Contract Hours</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Department</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Team</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Status</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Processed by</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Date Updated</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {probationEmployees.map((employee) => (
            <tr key={employee.id} style={{ fontSize: '0.9rem' }}>
             <td style={{ padding: '12px 16px' }}>
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
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{employee.employment_type}</td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{employee.type}</td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{employee.work_arrangement}</td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {formatTimeProfessional(employee.time_in)}
                  <span style={{ color: '#777' }}>-</span>
                  {formatTimeProfessional(employee.time_out)}
                </div>
              </td>
              <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {employee.contract_hours}
              </td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{employee.department}</td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{employee.team}</td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                <Box onClick={(e) => handleStatusClick(e, employee)} sx={{ cursor: 'pointer' }}>
                  <StatusBadge status={employee.status} clickable />
                </Box>
                <Popper 
                  open={openStatusPopper && selectedEmployee?.id === employee.id} 
                  anchorEl={anchorEl}
                  placement="bottom-start"
                >
                  <ClickAwayListener onClickAway={() => setOpenStatusPopper(false)}>
                    <Paper elevation={3}>
                      {statusOptions.map((status) => (
                        <MenuItem 
                          key={status} 
                          onClick={() => handleStatusChange(status)}
                          selected={employee.status === status}
                          style={{ fontSize: '0.9rem' }}
                        >
                          <StatusBadge status={status} />
                        </MenuItem>
                      ))}
                    </Paper>
                  </ClickAwayListener>
                </Popper>
              </td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{employee.processed_by}</td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                {new Date(employee.processed_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })} at {new Date(employee.processed_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </td>
              <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                <IconButton 
                  size="small"  
                  color="primary" 
                  sx={{ '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.1)' } }}
                  title="View Details"
                >
                  <VisibilityIcon fontSize="small" />  
                </IconButton>
                <IconButton 
                  size="small"  
                  color="primary" 
                  sx={{ '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.1)' } }}
                  title="Edit Details"
                  onClick={() => onEditClick(employee)}
                >
                  <EditIcon fontSize="small" />  
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProbationEmployeeTable;