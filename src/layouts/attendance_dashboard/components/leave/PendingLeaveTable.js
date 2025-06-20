import React, { useState, useEffect } from "react";
import api from "api/axios";
import {
  Modal,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  IconButton,
  Grid,
  Typography,
  Box
} from '@mui/material';
import { Edit, CheckCircle, Cancel, PendingActions } from '@mui/icons-material';

const PendingLeaveTable = ({ 
  filteredLeaveHistory = [], 
  loading, 
  error, 
  leaveTypes, 
  statusColors,
  refreshLeaveHistory
}) => {
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [employee, setEmployee] = useState(null);

  const getBusinessDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    const curDate = new Date(start);
    while (curDate <= end) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    }
  }, []);

  const handleStatusChange = (leave) => {
    setSelectedLeave(leave);
    setNewStatus('');
    setRemarks('');
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedLeave || !newStatus) return;
    
    setUpdating(true);
    setUpdateError(null);
    
    try {
      // Optimistic update
      const updatedLeave = {
        ...selectedLeave,
        status: newStatus,
        remarks: remarks,
        approved_at: newStatus === 'approved' ? new Date().toISOString() : null,
        approved_by: newStatus === 'approved' ? employee?.id : null
      };
      
      // Notify parent component
      if (refreshLeaveHistory) {
        refreshLeaveHistory(updatedLeave);
      }
      
      // API call
      const payload = {
        status: newStatus,
        remarks: remarks
      };
      
      if (newStatus === 'approved') {
        payload.approved_at = updatedLeave.approved_at;
        payload.approved_by = updatedLeave.approved_by;
      }
      
      await api.patch(`attendance/leave-applications/${selectedLeave.id}/`, payload);
      setStatusModalOpen(false);
    } catch (err) {
      setUpdateError(err.response?.data?.error || 'Failed to update leave status');
      // Revert optimistic update
      if (refreshLeaveHistory) {
        refreshLeaveHistory();
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading">Loading pending leave...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <>
      <div className="container" style={{ width: '100%', overflowX: 'auto' }}>
        <table className="responsive-table" style={{ minWidth: '1200px' }}>
          <thead>
            <tr style={{ fontSize: '1.1rem', backgroundColor: '#1565C0', color: '#fff' }}>
              <th style={{ padding: '12px 16px' }}>#</th>
              <th style={{ padding: '12px 16px' }}>Employee</th>
              <th style={{ padding: '12px 16px' }}>Type</th>
              <th style={{ padding: '12px 16px' }}>Start Date</th>
              <th style={{ padding: '12px 16px' }}>End Date</th>
              <th style={{ padding: '12px 16px' }}>Days</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Date Filed</th>
              <th style={{ padding: '12px 16px' }}>Reason</th>
              <th style={{ padding: '12px 16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaveHistory.length > 0 ? (
              filteredLeaveHistory.map((item, index) => {
                const diffDays = getBusinessDays(item.start_date, item.end_date);
                const leaveTypeLabel = leaveTypes.find(lt => lt.value === item.leave_type)?.label || item.leave_type;

                return (
                  <tr key={index} style={{ fontSize: '1rem', borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {item.employee_details?.first_name} {item.employee_details?.last_name}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{leaveTypeLabel}</td>
                    <td style={{ padding: '12px 16px' }}>{new Date(item.start_date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>{new Date(item.end_date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{diffDays}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        borderRadius: '12px',
                        textTransform: 'capitalize',
                        backgroundColor: statusColors[item.status]?.bg,
                        color: statusColors[item.status]?.color
                      }}>
                        {statusColors[item.status]?.icon}
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {new Date(item.applied_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{item.reason}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleStatusChange(item)}
                      >
                        <Edit />
                      </IconButton>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: '#777' }}>
                  No pending leave applications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Status Update Modal */}
      <Modal open={statusModalOpen} onClose={() => setStatusModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" gutterBottom>
            Update Leave Status
          </Typography>
          
          {selectedLeave && (
            <>
              <Typography variant="body1" gutterBottom>
                Employee: {selectedLeave.employee_details?.first_name} {selectedLeave.employee_details?.last_name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Leave Type: {leaveTypes.find(lt => lt.value === selectedLeave.leave_type)?.label}
              </Typography>
              
              <TextField
                select
                fullWidth
                label="Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                sx={{ mt: 2 }}
              >
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                sx={{ mt: 2 }}
              />
              
              {updateError && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {updateError}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button onClick={() => setStatusModalOpen(false)} sx={{ mr: 2 }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleStatusUpdate}
                  disabled={updating || !newStatus}
                  startIcon={updating ? <CircularProgress size={20} /> : null}
                >
                  {updating ? 'Updating...' : 'Update'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default PendingLeaveTable;