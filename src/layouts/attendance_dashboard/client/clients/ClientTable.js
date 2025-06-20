import React from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  useMediaQuery,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import { Edit, Delete, PersonAdd, Search, Close } from '@mui/icons-material';

const ClientTable = ({ 
  clients, 
  loading, 
  error, 
  onEditClick, 
  onAssignClick, 
  onDeleteClick,
  onUnassignClick,
  page,
  rowsPerPage,
  handleChangePage,
  searchTerm,
  handleSearchChange
}) => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const formatTimeToAMPM = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  if (loading) return <div className="loading">Loading clients...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (clients.length === 0) return <div className="no-data">No clients found</div>;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: isSmallScreen ? '100%' : '300px' }}
        />
      </Box>
      
      <div className="container" style={{ width: '100%', overflowX: 'auto' }}>
        <table className="responsive-table" style={{ minWidth: '1300px' }}>
          <thead>
            <tr style={{ backgroundColor: '#2E7D32', color: 'white' }}>
              <th scope="col" style={{ width: '200px', padding: '10px 14px' }}>Client Name</th>
              <th scope="col" style={{ width: '150px', padding: '10px 14px' }}>Timezone</th>
              <th scope="col" style={{ width: '200px', padding: '10px 14px' }}>Schedule</th>
              <th scope="col" style={{ width: '100px', padding: '10px 14px' }}>Total VA</th>
              <th scope="col" style={{ width: '200px', padding: '10px 14px' }}>Assigned Employees</th>
              <th scope="col" style={{ width: '120px', padding: '10px 14px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
               <th scope="row" style={{ padding: '10px 14px', backgroundColor: '#f5f5f5', fontWeight: '500' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: client.avatarColor || '#3f51b5' }}>
                      {client.name[0].toUpperCase()}
                    </Avatar>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div>{client.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{client.email}</div>
                    </div>
                  </div>
                </th>
                <td style={{ padding: '10px 14px' }}>{client.timezone}</td>
                <td style={{ padding: '10px 14px' }}>
                  {client.clientType !== 'project' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {formatTimeToAMPM(client.start_time)} - {formatTimeToAMPM(client.end_time)} 
                      {client.lunchBreak && <Chip label="1h lunch" size="small" variant="outlined" />}
                    </div>
                  ) : 'Flexible'}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold' }}>
                  {client.assigned_employees?.length || 0}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {client.assigned_employees?.map(emp => (
                      <Chip
                        key={emp.id}
                        avatar={<Avatar sx={{ width: 24, height: 24 }}>{emp.first_name?.[0]}{emp.last_name?.[0]}</Avatar>}
                        label={`${emp.first_name} ${emp.last_name}`}
                        variant="outlined"
                        size="small"
                        onDelete={() => onUnassignClick(emp, client)}
                        deleteIcon={<Close fontSize="small" />}
                      />
                    ))}
                  </Box>
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                  <IconButton onClick={() => onEditClick(client)} title="Edit">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => onAssignClick(client)} title="Assign">
                    <PersonAdd fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => onDeleteClick(client)} title="Delete">
                    <Delete fontSize="small" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
};

export default ClientTable;