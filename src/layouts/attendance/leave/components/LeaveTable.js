import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Stack,
  Avatar
} from '@mui/material';
import {
  PendingActions,
  CheckCircle,
  Cancel,
  CalendarToday
} from '@mui/icons-material';

const LeaveTable = ({ data, loading, error, type, leaveTypes }) => {
  const statusColors = {
    pending: { bg: '#FFF3E0', color: '#E65100', icon: <PendingActions fontSize="small" /> },
    approved: { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircle fontSize="small" /> },
    rejected: { bg: '#FFEBEE', color: '#C62828', icon: <Cancel fontSize="small" /> }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" p={4}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box p={2} bgcolor="error.light" color="error.dark" borderRadius={1}>
      <Typography align="center">Error: {error.message}</Typography>
    </Box>
  );

  if (!data || data.length === 0) return (
    <Box p={4} textAlign="center" color="text.secondary">
      <Typography variant="subtitle1">No {type} leave applications found</Typography>
    </Box>
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const columns = {
    pending: [
      { id: 'type', label: 'Type', align: 'left' },
      { id: 'dates', label: 'Dates', align: 'left' },
      { id: 'days', label: 'Days', align: 'center' },
      { id: 'reason', label: 'Reason', align: 'left' },
      { id: 'status', label: 'Status', align: 'center' },
      { id: 'applied', label: 'Date Filed', align: 'left' }
    ],
    approved: [
      { id: 'employee', label: 'Employee', align: 'left', width: 220 },
      { id: 'type', label: 'Type', align: 'left' },
      { id: 'dates', label: 'Dates', align: 'left' },
      { id: 'days', label: 'Days', align: 'center' },
      { id: 'status', label: 'Status', align: 'center' },
      { id: 'applied', label: 'Date Filed', align: 'left' }
    ],
    rejected: [
      { id: 'employee', label: 'Employee', align: 'left', width: 220 },
      { id: 'type', label: 'Type', align: 'left' },
      { id: 'dates', label: 'Dates', align: 'left' },
      { id: 'reason', label: 'Reason', align: 'left' },
      { id: 'days', label: 'Days', align: 'center' },
      { id: 'status', label: 'Status', align: 'center' },
      { id: 'applied', label: 'Date Filed', align: 'left' },
      { id: 'remarks', label: 'Remarks', align: 'left' }
    ]
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <table className="responsive-table" style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            {columns[type].map((column) => (
              <th key={column.id} style={{
                padding: '12px 16px',
                textAlign: column.align,
                fontWeight: 600,
                width: column.width || 'auto',
                borderBottom: '2px solid #e0e0e0'
              }}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const leaveType = leaveTypes.find(lt => lt.value === item.leave_type)?.label || item.leave_type;
            const days = calculateDays(item.start_date, item.end_date);

            return (
              <tr key={index} style={{ borderBottom: '1px solid #eee', '&:hover': { backgroundColor: '#fafafa' } }}>
                {type === 'pending' && (
                  <>
                    <td style={{ padding: '12px 16px' }}>{leaveType}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarToday color="action" fontSize="small" />
                        <Typography>{formatDate(item.start_date)} - {formatDate(item.end_date)}</Typography>
                      </Stack>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{days}</td>
                    <td style={{ padding: '12px 16px' }}>{item.reason}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <Chip
                        icon={statusColors[item.status].icon}
                        label={item.status}
                        sx={{
                          backgroundColor: statusColors[item.status].bg,
                          color: statusColors[item.status].color,
                          textTransform: 'capitalize'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>{formatDateTime(item.applied_at)}</td>
                  </>
                )}

                {type === 'approved' && (
                  <>
                    <td style={{ padding: '12px 16px' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {item.employee_name.charAt(0)}
                        </Avatar>
                        <div>
                          <Typography fontWeight={600}>{item.employee_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.email}</Typography>
                        </div>
                      </Stack>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{leaveType}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarToday color="action" fontSize="small" />
                        <Typography>{formatDate(item.start_date)} - {formatDate(item.end_date)}</Typography>
                      </Stack>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{days}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <Chip
                        icon={statusColors[item.status].icon}
                        label={item.status}
                        sx={{
                          backgroundColor: statusColors[item.status].bg,
                          color: statusColors[item.status].color,
                          textTransform: 'capitalize'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>{formatDateTime(item.applied_at)}</td>
                  </>
                )}

                {type === 'rejected' && (
                  <>
                    <td style={{ padding: '12px 16px' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {item.employee_name.charAt(0)}
                        </Avatar>
                        <div>
                          <Typography fontWeight={600}>{item.employee_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.email}</Typography>
                        </div>
                      </Stack>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{leaveType}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarToday color="action" fontSize="small" />
                        <Typography>{formatDate(item.start_date)} - {formatDate(item.end_date)}</Typography>
                      </Stack>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{item.reason}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{days}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <Chip
                        icon={statusColors[item.status].icon}
                        label={item.status}
                        sx={{
                          backgroundColor: statusColors[item.status].bg,
                          color: statusColors[item.status].color,
                          textTransform: 'capitalize'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>{formatDateTime(item.applied_at)}</td>
                    <td style={{ padding: '12px 16px' }}>{item.remarks || '-'}</td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
};

export default LeaveTable;