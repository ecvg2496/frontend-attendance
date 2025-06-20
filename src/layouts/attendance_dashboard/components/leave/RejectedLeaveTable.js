import React from "react";
import { Cancel } from '@mui/icons-material';

const RejectedLeaveTable = ({ 
  filteredLeaveHistory = [], 
  loading, 
  error, 
  leaveTypes, 
  statusColors 
}) => {
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

  if (loading) return <div className="loading">Loading rejected leave...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="container" style={{ width: '100%', overflowX: 'auto' }}>
      <table className="responsive-table" style={{ minWidth: '1200px' }}>
        <thead>
          <tr style={{ fontSize: '1.1rem', backgroundColor: '#1565C0', color: '#fff' }}>
            <th style={{ padding: '12px 16px' }}>#</th>
            <th style={{ padding: '12px 16px', width: '220px' }}>Employee</th>
            <th style={{ padding: '12px 16px' }}>Type</th>
            <th style={{ padding: '12px 16px' }}>Start Date</th>
            <th style={{ padding: '12px 16px' }}>End Date</th>
            <th style={{ padding: '12px 16px' }}>Days</th>
            <th style={{ padding: '12px 16px' }}>Status</th>
            <th style={{ padding: '12px 16px' }}>Date Filed</th>
            <th style={{ padding: '12px 16px' }}>Remarks</th>
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
                    <div style={{ fontWeight: 600 }}>{item.employee_name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.email}</div>
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
                  <td style={{ padding: '12px 16px' }}>{item.remarks || 'N/A'}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#777' }}>
                No rejected leave applications found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RejectedLeaveTable;