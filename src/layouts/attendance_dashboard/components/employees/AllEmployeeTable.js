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

const employmentTypeOptions = [
  'Regular',
  'Probationary',
  'Contractual',
  'Independent Contractor'
];
const jobTypeOptions = [
  'Full Time',
  'Part Time',
  'Contractual'
];
const statusOptions = [
  'Active',
  'Floating',
  'Holiday',
  'Newly Hired',
  'Probation',
  'On Leave',
  'Training',
  'Resigned',
  'AWOL',
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

const AllEmployeeTable = ({ employees, loading, error, onEditClick, onEmployeeTypeChange, onEmploymentTypeChange, onStatusChange }) => {
  const [employmentTypeAnchorEl, setEmploymentTypeAnchorEl] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openEmploymentTypePopper, setOpenEmploymentTypePopper] = useState(false);
  const [openEmployeeTypePopper, setOpenEmployeeTypePopper] = useState(false);
  const [openStatusPopper, setOpenStatusPopper] = useState(false);
  const [employeeTypeAnchorEl, setEmployeeTypeAnchorEl] = useState(null);
  const handleEmploymentTypeClick = (event, employee) => {
    setEmploymentTypeAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
    setOpenEmploymentTypePopper(true);
  };

  const handleStatusClick = (event, employee) => {
    setStatusAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
    setOpenStatusPopper(true);
  };

  const handleEmploymentTypeChange = (newType) => {
    onEmploymentTypeChange(selectedEmployee.id, newType);
    setOpenEmploymentTypePopper(false);
  };

  const handleStatusChange = (newStatus) => {
    onStatusChange(selectedEmployee.id, newStatus);
    setOpenStatusPopper(false);
  };
  const handleEmployeeTypeClick = (event, employee) => {
  setEmployeeTypeAnchorEl(event.currentTarget);
  setOpenEmployeeTypePopper(true);
  setSelectedEmployee(employee);
  };

  const handleEmployeeTypeChange = (newType) => {
    onEmployeeTypeChange(selectedEmployee.id, newType);
    setOpenEmployeeTypePopper(false);
  };
  if (loading) return <div className="loading" style={{ fontSize: '0.9rem' }}>Loading employees...</div>;
  if (error) return <div className="error" style={{ fontSize: '0.9rem' }}>Error: {error}</div>;
  if (employees.length === 0) return <div className="no-data" style={{ fontSize: '0.9rem' }}>No employees found</div>;

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
        tableLayout: 'auto' // This is key for auto-adjusting widths
      }}>
        <thead>
          <tr style={{ 
            fontSize: '1rem', 
            backgroundColor: '#00B4D8',
            color: 'white'
          }}>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Actions</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'left' }}>Name</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'left' }}>Position</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'left' }}>Status</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'left' }}>Type</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'left' }}>Employment Date</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'left' }}>Work Set-up</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'left' }}>Schedule & Hours</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'left' }}>Team</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'left' }}>Processed by</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'left' }}>Regularization Date</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'left' }}>Resignation Date</th>
            <th scope="col" style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'left' }}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} style={{ fontSize: '0.9rem' }}>
                <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                <IconButton 
                  size="medium"  
                  color="primary" 
                  sx={{ '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.1)' } }}
                  title="Edit Details"
                  onClick={() => onEditClick(employee)}
                >
                  <EditIcon fontSize="medium" />  
                </IconButton>
               </td>
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
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{employee.position || ""}</td>            
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                <Box onClick={(e) => handleStatusClick(e, employee)} sx={{ cursor: 'pointer' }}>
                  <StatusBadge status={employee.status} clickable />
                </Box>
                <Popper 
                  open={openStatusPopper && selectedEmployee?.id === employee.id} 
                  anchorEl={statusAnchorEl}
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
             <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
              {/* Employment Type Dropdown */}
              <Box onClick={(e) => handleEmploymentTypeClick(e, employee)} sx={{ cursor: 'pointer', mb: 1 }}>
                <StatusBadge status={employee.employment_type} clickable />
              </Box>
              <Popper 
                open={openEmploymentTypePopper && selectedEmployee?.id === employee.id} 
                anchorEl={employmentTypeAnchorEl}
                placement="bottom-start"
              >
                <ClickAwayListener onClickAway={() => setOpenEmploymentTypePopper(false)}>
                  <Paper elevation={3}>
                    {employmentTypeOptions.map((type) => (
                      <MenuItem 
                        key={type} 
                        onClick={() => handleEmploymentTypeChange(type)}
                        selected={employee.employment_type === type}
                        style={{ fontSize: '0.9rem' }}
                      >
                        <StatusBadge status={type} />
                      </MenuItem>
                    ))}
                  </Paper>
                </ClickAwayListener>
              </Popper>

              {/* Job Type Dropdown */}
              <Box onClick={(e) => handleEmployeeTypeClick(e, employee)} sx={{ cursor: 'pointer' }}>
                <StatusBadge status={employee.type} clickable />
              </Box>
              <Popper 
                open={openEmployeeTypePopper && selectedEmployee?.id === employee.id} 
                anchorEl={employeeTypeAnchorEl}
                placement="bottom-start"
              >
                <ClickAwayListener onClickAway={() => setOpenEmployeeTypePopper(false)}>
                  <Paper elevation={3}>
                    {jobTypeOptions.map((type) => (
                      <MenuItem 
                        key={type} 
                        onClick={() => handleEmployeeTypeChange(type)}
                        selected={employee.type === type}
                        style={{ fontSize: '0.9rem' }}
                      >
                        <StatusBadge status={type} />
                      </MenuItem>
                    ))}
                  </Paper>
                </ClickAwayListener>
              </Popper>
            </td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  {new Date(employee.employment_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
              </td> 
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{employee.work_arrangement}</td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {formatTimeProfessional(employee.time_in)}
                    <span style={{ color: '#777' }}>-</span>
                    {formatTimeProfessional(employee.time_out)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#555' }}>
                    {employee.contract_hours} hours
                  </div>
                </div>
              </td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{employee.team}</td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{employee.processed_by}</td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  {employee.date_regular ? (
                    <>
                      {new Date(employee.date_regular).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {' at '}
                      {new Date(employee.date_regular).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </>
                  ) : null}
              </td>
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  {employee.date_resignation ? (
                    <>
                      {new Date(employee.date_resignation).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {' at '}
                      {new Date(employee.date_resignation).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </>
                  ) : null}
              </td>
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
            </tr>
          ))}
        </tbody>
      </table>    
    </div>
  );
};

export default AllEmployeeTable;