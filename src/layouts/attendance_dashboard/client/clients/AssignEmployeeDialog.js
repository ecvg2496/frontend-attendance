import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Checkbox,
  ListItemButton,
  ListItemIcon,
  Collapse,
  Typography,
  Chip
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Groups,
  Category,
  PersonAdd
} from '@mui/icons-material';

const AssignEmployeeDialog = ({
  open,
  onClose,
  employees,
  assignedEmployees = [],
  onAssign
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState({});
  const [expandedDepartments, setExpandedDepartments] = useState({});

  // Group employees by department and team
  const groupEmployees = () => {
    const grouped = {};
    
    employees.forEach(employee => {
      if (!grouped[employee.department]) {
        grouped[employee.department] = {};
      }
      
      if (!grouped[employee.department][employee.team]) {
        grouped[employee.department][employee.team] = [];
      }
      
      grouped[employee.department][employee.team].push(employee);
    });
    
    return grouped;
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleTeamExpand = (team) => {
    setExpandedTeams(prev => ({
      ...prev,
      [team]: !prev[team]
    }));
  };

  const handleDepartmentExpand = (department) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [department]: !prev[department]
    }));
  };

  const handleAssign = () => {
    onAssign(selectedEmployees);
    setSelectedEmployees([]);
  };

  const groupedEmployees = groupEmployees();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" fontWeight="bold">
          Assign Employees
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <List sx={{ maxHeight: 500, overflow: 'auto' }}>
          {Object.entries(groupedEmployees).map(([department, teams]) => (
            <React.Fragment key={department}>
              <ListItemButton onClick={() => handleDepartmentExpand(department)}>
                <ListItemIcon>
                  <Category />
                </ListItemIcon>
                <ListItemText primary={department || 'No Department'} />
                {expandedDepartments[department] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={expandedDepartments[department]} timeout="auto" unmountOnExit>
                {Object.entries(teams).map(([team, teamEmployees]) => (
                  <React.Fragment key={team}>
                    <ListItemButton 
                      sx={{ pl: 8 }} 
                      onClick={() => handleTeamExpand(`${department}-${team}`)}
                    >
                      <ListItemIcon>
                        <Groups />
                      </ListItemIcon>
                      <ListItemText primary={team || 'No Team'} />
                      {expandedTeams[`${department}-${team}`] ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={expandedTeams[`${department}-${team}`]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {teamEmployees.map((employee) => {
                          const isAssigned = assignedEmployees.some(e => e.id === employee.id);
                          return (
                            <ListItem 
                              key={employee.id}
                              sx={{ pl: 12 }}
                              secondaryAction={
                                <Checkbox
                                  edge="end"
                                  checked={selectedEmployees.includes(employee.id)}
                                  onChange={() => handleEmployeeSelect(employee.id)}
                                  disabled={isAssigned}
                                />
                              }
                              disablePadding
                            >
                              <ListItemButton 
                                onClick={() => !isAssigned && handleEmployeeSelect(employee.id)}
                                disabled={isAssigned}
                              >
                                <ListItemAvatar>
                                  <Avatar>
                                    {employee.first_name?.[0]}{employee.last_name?.[0]}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={`${employee.first_name} ${employee.last_name}`}
                                  secondary={`${employee.position} • ${employee.employee_type}`}
                                />
                                {isAssigned && (
                                  <Chip 
                                    label="Assigned" 
                                    size="small" 
                                    color="success" 
                                    sx={{ ml: 2 }}
                                  />
                                )}
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Collapse>
                  </React.Fragment>
                ))}
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleAssign}
          color="primary"
          variant="contained"
          startIcon={<PersonAdd />}
          disabled={selectedEmployees.length === 0}
        >
          Assign Selected ({selectedEmployees.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignEmployeeDialog;