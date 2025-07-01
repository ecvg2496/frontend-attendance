import React from 'react';
import { Box, Button, Tooltip, LinearProgress, Typography } from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  FreeBreakfast as FreeBreakfastIcon,
  LunchDining as LunchDiningIcon,
  ExitToApp as ExitToAppIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';

const TimeButtons = ({
  todayRecord,
  loading,
  actionInProgress,
  pendingTimeOut,
  breakDelayRemaining,
  breakDelayProgress,
  showConfirmationDialog,
  formatTimeFromSeconds
}) => {
  const buttons = [
    {
      action: 'timeIn',
      label: 'Time In',
      icon: <AccessTimeIcon />,
      color: '#4CAF50',
      bgColor: '#E8F5E9'
    },
    {
      action: 'breakStart',
      label: 'Start Break',
      icon: <FreeBreakfastIcon />,
      color: '#2196F3',
      bgColor: '#E3F2FD'
    },
    {
      action: 'breakEnd',
      label: 'End Break',
      icon: <LunchDiningIcon />,
      color: '#FF9800',
      bgColor: '#FFF3E0'
    },
    {
      action: 'timeOut',
      label: 'Time Out',
      icon: <ExitToAppIcon />,
      color: '#F44336',
      bgColor: '#FFEBEE'
    }
  ];

  const getButtonState = (action) => {
    // ... (same button state logic as before)
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3, justifyContent: 'center' }}>
      {buttons.map((btn) => {
        const { status, disabled, tooltip } = getButtonState(btn.action);
        const isLoading = loading && actionInProgress === btn.action;
        
        return (
          <Tooltip title={tooltip} arrow key={btn.action}>
            <Box>
              <Button
                variant={status === 'completed' ? "contained" : "outlined"}
                disabled={disabled}
                startIcon={btn.icon}
                onClick={() => !disabled && showConfirmationDialog(btn.action)}
                sx={{
                  minWidth: 150,
                  height: 50,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  borderWidth: '2px',
                  textTransform: 'none',
                  color: status === 'completed' ? '#fff' : btn.color,
                  backgroundColor: status === 'completed' ? btn.color : btn.bgColor,
                  borderColor: btn.color,
                  '&:hover': {
                    backgroundColor: status === 'completed' ? btn.color : `${btn.color}20`,
                    borderWidth: '2px'
                  },
                  '&.Mui-disabled': {
                    color: status === 'completed' ? '#fff' : `${btn.color}80`,
                    backgroundColor: status === 'completed' ? `${btn.color}80` : `${btn.bgColor}80`,
                    borderColor: status === 'completed' ? 'transparent' : `${btn.color}80`
                  }
                }}
              >
                {btn.label}
                {isLoading && (
                  <CircularProgress 
                    size={24} 
                    sx={{ 
                      position: 'absolute',
                      right: 12,
                      color: status === 'completed' ? '#fff' : btn.color
                    }} 
                  />
                )}
              </Button>
              {btn.action === 'breakStart' && breakDelayRemaining > 0 && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <HourglassEmptyIcon color="action" sx={{ mr: 1 }} />
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={breakDelayProgress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'divider',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'text.secondary'
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatTimeFromSeconds(breakDelayRemaining)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default TimeButtons;