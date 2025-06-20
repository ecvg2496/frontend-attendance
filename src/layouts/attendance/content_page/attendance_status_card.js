import React from 'react';
import { 
  Box, 
  Typography, 
  Chip,
  Tooltip,
  useTheme 
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  TimerOff as TimerOffIcon,
  AccessTime as AccessTimeIcon,
  Timer as TimerIcon,
  EventBusy as EventBusyIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';

const statusConfig = {
  'on-time': {
    icon: <CheckCircleIcon color="success" />,
    label: 'On Time',
    color: 'success.main',
    tooltip: 'Logged in and out within scheduled hours'
  },
  'late': {
    icon: <WarningIcon color="warning" />,
    label: 'Late',
    color: 'warning.main',
    tooltip: 'Logged in after scheduled start time'
  },
  'early-out': {
    icon: <ErrorIcon color="error" />,
    label: 'Early Out',
    color: 'error.main',
    tooltip: 'Logged out before scheduled end time'
  },
  'undertime': {
    icon: <TimerOffIcon color="error" />,
    label: 'Undertime',
    color: 'error.main',
    tooltip: 'Worked less than required hours'
  },
  'overtime': {
    icon: <TimerIcon color="info" />,
    label: 'Overtime',
    color: 'info.main',
    tooltip: 'Worked beyond scheduled hours (approved)'
  },
  'no-log': {
    icon: <ErrorIcon color="error" />,
    label: 'Missing Log',
    color: 'error.main',
    tooltip: 'Missing either log in or log out'
  },
  'multiple-logs': {
    icon: <WarningIcon color="warning" />,
    label: 'Multiple Logs',
    color: 'warning.main',
    tooltip: 'Multiple log entries detected'
  },
  'manual-entry': {
    icon: <AccessTimeIcon color="secondary" />,
    label: 'Manual Entry',
    color: 'secondary.main',
    tooltip: 'Time log was manually entered'
  },
  'leave-present': {
    icon: <EventBusyIcon color="error" />,
    label: 'Leave Conflict',
    color: 'error.main',
    tooltip: 'Leave approved but marked present'
  },
  'holiday-work': {
    icon: <CalendarTodayIcon color="info" />,
    label: 'Holiday Work',
    color: 'info.main',
    tooltip: 'Worked on a non-working day'
  }
};

const AttendanceStatusCard = ({ status, timeDetails }) => {
  const theme = useTheme();
  const config = statusConfig[status] || statusConfig['on-time'];

  return (
    <Tooltip title={config.tooltip} arrow>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          mb: 2,
          borderRadius: 1,
          backgroundColor: theme.palette.grey[100],
          borderLeft: `4px solid ${theme.palette[config.color.split('.')[0]].main}`
        }}
      >
        <Box sx={{ mr: 2 }}>
          {config.icon}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {config.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {timeDetails}
          </Typography>
        </Box>
        <Chip 
          label={status.replace('-', ' ')} 
          color={config.color.split('.')[0]} 
          size="small"
        />
      </Box>
    </Tooltip>
  );
};

export default AttendanceStatusCard;