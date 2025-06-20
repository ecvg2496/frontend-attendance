import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, Chip } from '@mui/material';

const LeaveCreditsTable = ({ filteredLeaveCredits = [], loading, error }) => {
  if (loading) return <div>Loading leave credits...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Employee</TableCell>
          <TableCell>Leave Type</TableCell>
          <TableCell>Total Days</TableCell>
          <TableCell>Used Days</TableCell>
          <TableCell>Remaining</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredLeaveCredits.map(credit => (
          <TableRow key={credit.id}>
            <TableCell>{credit.employee_name}</TableCell>
            <TableCell>{credit.category_display}</TableCell>
            <TableCell>{credit.total_days}</TableCell>
            <TableCell>{credit.used_days}</TableCell>
            <TableCell>
              <Chip 
                label={credit.total_days - credit.used_days} 
                color={(credit.total_days - credit.used_days) > 0 ? 'success' : 'error'} 
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LeaveCreditsTable;