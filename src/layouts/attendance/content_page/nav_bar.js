import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  useMediaQuery,
  useTheme,
  Box,
  Avatar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  styled,
  Tooltip,
  Badge,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import LogsIcon from '@mui/icons-material/ListAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BuildIcon from '@mui/icons-material/Build';
import TuneIcon from '@mui/icons-material/Tune';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TodayIcon from "@mui/icons-material/Today"; 
import Logo from 'assets/images/Eighty_20_icon_transparent.png';
import PersonIcon from '@mui/icons-material/Person';
import UserProfile from '../user_profile';
import Pusher from 'pusher-js';
import { dataService } from "global/function";
import CloseIcon from '@mui/icons-material/Close';
import { formatDistanceToNow } from 'date-fns';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';

const drawerWidthExpanded = 300;
const drawerWidthCollapsed = 90;

// Custom colored icons
const ColoredAccessTimeIcon = styled(AccessTimeIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const ColoredEmployeeAttendance = styled(TodayIcon)(({ theme }) => ({
  color: theme.palette.error.main,
}));

const ColoredPersonIcon = styled(PersonIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const ColoredLogsIcon = styled(LogsIcon)(({ theme }) => ({
  color: theme.palette.secondary.main,
}));

const ColoredReceiptLongIcon = styled(ReceiptLongIcon)(({ theme }) => ({
  color: theme.palette.success.main,
}));

const ColoredLibraryBooksIcon = styled(LibraryBooksIcon)(({ theme }) => ({
  color: theme.palette.warning.main,
}));

const ColoredTimeToLeaveIcon = styled(TimeToLeaveIcon)(({ theme }) => ({
  color: theme.palette.error.main,
}));

const ColoredLogoutIcon = styled(LogoutIcon)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 8,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontWeight: 'bold',
    fontSize: '0.75rem',
  },
}));

const CustomListItem = styled(ListItem)(({ theme, collapsed, isnotification }) => ({
  borderRadius: '12px',
  margin: collapsed ? '8px 4px' : '8px 12px',
  padding: collapsed ? '12px 8px' : '12px 16px',
  justifyContent: collapsed ? 'center' : 'flex-start',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' 
      ? 'rgba(0, 0, 0, 0.05)' 
      : 'rgba(255, 255, 255, 0.08)',
    transform: 'scale(1.02)',
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.light,
    '& .MuiListItemIcon-root, & .MuiTypography-root': {
      color: theme.palette.primary.main,
    },
  },
  ...(isnotification && {
    '& .MuiBadge-badge': {
      right: collapsed ? -4 : 8,
      top: 8,
    }
  }),
}));

const NotificationItem = styled(ListItem)(({ theme }) => ({
  padding: '12px 16px',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& .MuiListItemSecondaryAction-root': {
    right: '16px',
  },
  '& .MuiAvatar-root': {
    marginRight: theme.spacing(2),
  },
  '& .MuiTypography-body2': {
    color: theme.palette.text.secondary,
  },
}));

// Helper functions for Manila timezone
const formatToManilaDate = (dateString) => {
  if (!dateString) return 'Invalid date';
  
  try {
    const date = new Date(dateString);
    const manilaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    
    return manilaDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting Manila date:', error);
    return dateString;
  }
};

const isTodayInManila = (dateString) => {
  if (!dateString) return false;
  
  try {
    const today = new Date();
    const manilaToday = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const manilaDate = new Date(dateString);
    
    return manilaDate.toDateString() === manilaToday.toDateString();
  } catch (error) {
    console.error('Error checking Manila date:', error);
    return false;
  }
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return 'Invalid date';
  
  try {
    const date = new Date(dateString);
    const manilaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    
    return manilaDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Manila'
    });
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return dateString;
  }
};

const formatDateWorded = (dateString) => {
  if (!dateString) return 'Invalid date';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const SideNavBar = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState(0);
  const [pendingCounts, setPendingCounts] = useState({
    makeup_requests: 0,
    schedule_requests: 0,
    leave_applications: 0,
    total: 0,
    all_counts: {}
  });
  const [notifications, setNotifications] = useState([]);
  const [holidayNotifications, setHolidayNotifications] = useState([]);
  const [todayHolidays, setTodayHolidays] = useState([]);
  const [holidayDetails, setHolidayDetails] = useState({
    company: 0,
    special: 0,
    regular: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [pusherStatus, setPusherStatus] = useState('connecting');
  const [holidayAlert, setHolidayAlert] = useState(null);
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  // Helper functions
  const getAvatarText = useCallback((fullName) => {
    const parts = fullName?.split(' ') || [];
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0] ? `${parts[0][0]}${parts[0][1]}`.toUpperCase() : '??';
  }, []);

  useEffect(() => {
  const storedEmployee = localStorage.getItem('employee');
  if (storedEmployee) {
    const emp = JSON.parse(storedEmployee);
    setEmployee(emp);
    // Store employee ID for easy access
    localStorage.setItem('employeeId', emp.id);
  }
  }, []);

  const hashString = useCallback((str) => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }, []);

  const showHolidayAlert = useCallback((holidayData) => {
    setHolidayAlert({
      title: holidayData.title,
      message: `Today is ${holidayData.title} (${holidayData.details?.type_display || 'Holiday'})!`,
      type: 'info'
    });
  }, []);

  // Fetch notification counts
  const fetchNotificationCounts = useCallback(async () => {
  try {
    setLoading(true);
    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) {
      setError('Employee ID not found');
      return;
    }

    const response = await dataService(
      'GET',
      '/attendance/pending-requests/',
      { params: { employee_id: employeeId } }
    );
    
    if (response.error) {
      setError(response.message || 'Failed to load notification counts');
      return;
    }

    const data = response.data;
    setPendingCounts({
      makeup_requests: data.makeup_requests?.pending || 0,
      schedule_requests: data.schedule_requests?.pending || 0,
      leave_applications: data.leave_applications?.pending || 0,
      total: data.totals?.pending || data.total || 0,
      all_counts: data
    });
  } catch (error) {
    setError('Failed to load notification counts');
    console.error('Error fetching counts:', error);
  } finally {
    setLoading(false);
  }
  }, []);

  // Fetch recent notifications for user
  const fetchRecentNotifications = useCallback(async () => {
  try {
    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) {
      console.error('Employee ID not found');
      return;
    }

    // Use query parameter instead of path parameter
    const response = await dataService('GET', '/attendance/user-notifications/', {
      params: { employee_id: employeeId }
    });
    
    if (response.error) {
      console.error('Error fetching recent notifications:', response.message);
      return;
    }

    // Transform the data for user notifications
    const notificationsData = response.data?.notifications || response.data || [];
    
    const transformed = notificationsData.map(notif => ({
      ...notif,
      id: notif.id || `${notif.type}_${notif.request_id}`,
      title: notif.title || `${notif.type} request ${notif.status}`,
      is_read: notif.is_read || false,
      processed_by: notif.processed_by || {
        id: notif.processed_by_id,
        first_name: notif.processed_by_name?.split(' ')[0] || 'Admin',
        last_name: notif.processed_by_name?.split(' ')[1] || '',
        avatar_text: getAvatarText(notif.processed_by_name),
        avatar_color: `hsl(${hashString(notif.processed_by_name) % 360}, 70%, 50%)`
      }
    }));

    setNotifications(transformed);
  } catch (err) {
    console.error('Error fetching recent notifications:', err);
  }
}, [getAvatarText, hashString]);

  // Fetch holiday notifications
  const fetchHolidayNotifications = useCallback(async () => {
    try {
      const response = await dataService('GET', '/attendance/holiday-notifications/');
      
      if (response.error) {
        console.error('Error fetching holiday notifications:', response.message);
        return;
      }

      const holidayData = response.data?.holidays || response.data || [];
      
      const transformed = holidayData.map(holiday => ({
        ...holiday,
        id: holiday.id || `${holiday.type}_${holiday.holiday_id}`,
        title: holiday.title || `Upcoming ${holiday.type} holiday`,
        is_read: holiday.is_read || false,
        type: holiday.type || 'company',
        // Convert date to Manila timezone for display
        formattedDate: formatDateForDisplay(holiday.date),
        // Store original date for comparison
        originalDate: holiday.date,
        // Check if it's today in Manila time
        isTodayManila: isTodayInManila(holiday.date)
      }));

      setHolidayNotifications(transformed);
    } catch (err) {
      console.error('Error fetching holiday notifications:', err);
    }
  }, []);

  const formatDateWorded = (dateString) => {
  if (!dateString) return 'Invalid date';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
  };
  const formatTimeToAMPM = (timeString) => {
  if (!timeString) return 'Invalid time';
  
  try {
    // Handle both "HH:mm:ss" and "HH:mm" formats
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${minutes} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
  };
  // Check today's holidays
  const checkTodaysHoliday = useCallback(async () => {
    try {
      const response = await dataService('GET', '/attendance/holidays/today/');
      
      if (response.error) {
        console.error('Error checking today\'s holiday:', response.message);
        return;
      }

      const todayHolidaysData = response.data?.holidays || [];
      
      // Filter for holidays that are actually today in Manila time
      const manilaTodayHolidays = todayHolidaysData.filter(holiday => 
        isTodayInManila(holiday.date)
      );
      
      setTodayHolidays(manilaTodayHolidays);

      // Show alert for today's holidays in Manila time
      if (manilaTodayHolidays.length > 0) {
        manilaTodayHolidays.forEach(holiday => {
          showHolidayAlert({
            title: holiday.title,
            details: {
              type_display: holiday.details?.type_display || 'Holiday',
              description: holiday.details?.description || '',
              // Show Manila date in alert
              formatted_date: formatDateForDisplay(holiday.date)
            }
          });
        });
      }
    } catch (err) {
      console.error('Error checking today\'s holiday:', err);
    }
  }, [showHolidayAlert]);

  // Fetch holiday notification counts
  const fetchHolidayNotificationCounts = useCallback(async () => {
    try {
      const response = await dataService('GET', '/attendance/holiday-notification-counts/');
      
      if (response.error) {
        console.error('Error fetching holiday notification counts:', response.message);
        return;
      }

      const counts = response.data?.counts || response.data || {};
      setHolidayDetails({
        company: counts.company || 0,
        special: counts.special || 0,
        regular: counts.regular || 0,
        total: counts.total || 0
      });
    } catch (err) {
      console.error('Error fetching holiday notification counts:', err);
    }
  }, []);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds) => {
    try {
      const response = await dataService('POST', '/attendance/notifications/mark-read/', {
        notification_ids: notificationIds
      });
      
      if (response.error) {
        console.error('Error marking notifications as read:', response.message);
        return;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  }, []);

  // Mark holiday notifications as read
  const markHolidaysAsRead = useCallback(async (holidayIds) => {
    try {
      const response = await dataService('POST', '/attendance/holiday-mark-as-read/', {
        holiday_ids: holidayIds
      });
      
      if (response.error) {
        console.error('Error marking holiday notifications as read:', response.message);
        return;
      }
      
      // Update local state
      setHolidayNotifications(prev => 
        prev.map(h => 
          holidayIds.includes(h.id) ? { ...h, is_read: true } : h
        )
      );
    } catch (err) {
      console.error('Error marking holiday notifications as read:', err);
    }
  }, []);

  // Pusher setup
  const setupPusher = useCallback(() => {
    // Disconnect existing connection if any
    if (window.userPusher) {
      window.userPusher.disconnect();
      window.userPusher = null;
    }

    const pusherConfig = {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER || 'ap1',
      forceTLS: true,
      channelAuthorization: {
        endpoint: process.env.REACT_APP_PUSHER_AUTH_ENDPOINT || '/api/attendance/pusher/auth/',
        transport: 'ajax'
      },
      userAuthentication: {
        endpoint: process.env.REACT_APP_PUSHER_USER_AUTH_ENDPOINT || '/api/attendance/pusher/auth/',
        transport: 'ajax'
      }
    };

    try {
      window.userPusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, pusherConfig);
      const { connection } = window.userPusher;

      // Connection state handlers
      connection.bind('state_change', (states) => {
        console.log('Pusher connection state changed:', states);
        setPusherStatus(states.current);
      });

      connection.bind('connected', () => {
        console.log('Pusher connected successfully');
        setPusherStatus('connected');
        
        // Subscribe to channels
        subscribeToChannels();
      });

      connection.bind('error', (error) => {
        console.error('Pusher connection error:', error);
        setPusherStatus('error');
      });

      // Function to subscribe to channels
      const subscribeToChannels = () => {
        try {
          const employeeId = localStorage.getItem('employeeId');
          if (employeeId) {
            // Personal channel for user notifications
            const userChannel = window.userPusher.subscribe(`private-employee-${employeeId}`);
            
            // Admin channel for count updates
            const adminChannel = window.userPusher.subscribe('admin-dashboard');

            userChannel.bind('request_processed', (data) => {
              console.log('Request processed:', data);
              setSnackbarMessage(data.message);
              setSnackbarSeverity(data.status === 'approved' ? 'success' : 'error');
              setSnackbarOpen(true);
              // Refresh counts and notifications
              fetchNotificationCounts();
              fetchRecentNotifications();
            });

            userChannel.bind('new_notification', (data) => {
              console.log('New notification:', data);
              // Refresh notifications
              fetchRecentNotifications();
            });

            userChannel.bind('holiday_today', (data) => {
              console.log('Today is a holiday:', data);
              // Refresh holiday notifications
              fetchHolidayNotificationCounts();
              fetchHolidayNotifications();
              // Show immediate notification to user
              showHolidayAlert(data);
            });

            userChannel.bind('holiday_alert', (data) => {
              console.log('Holiday alert:', data);
              fetchHolidayNotificationCounts();
              fetchHolidayNotifications();
            });
          }
        } catch (err) {
          console.error('Error in channel subscription:', err);
        }
      };

    } catch (err) {
      console.error('Pusher initialization failed:', err);
      setPusherStatus('initialization_error');
    }
  }, [fetchNotificationCounts, fetchRecentNotifications, fetchHolidayNotificationCounts, fetchHolidayNotifications, showHolidayAlert]);

  // Event handlers
  const handleDrawerToggle = useCallback(() => {
    if (!isMobile) {
      setCollapsed(prev => !prev);
    } else {
      setMobileOpen(prev => !prev);
    }
  }, [isMobile]);

  const handleItemClick = useCallback((route) => {
    if (route === '/attendance/user/profile') {
      setProfileModalOpen(true);
    } else if (route === '#notifications') {
      setNotificationOpen(true);
    } else {
      navigate(route);
    }
    if (isMobile) setMobileOpen(false);
  }, [navigate, isMobile]);
  
  const handleLogoutClick = useCallback(() => {
    setLogoutOpen(true);
  }, []);
  
  const handleLogoutConfirm = useCallback(() => {
    localStorage.removeItem('employee');
    if (window.userPusher) {
      window.userPusher.disconnect();
      window.userPusher = null;
    }
    setLogoutOpen(false);
    navigate('/authentication/sign-in');
  }, [navigate]);

  const handleLogoutCancel = useCallback(() => {
    setLogoutOpen(false);
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    setNotificationTab(newValue);
  }, []);

  const handleCloseHolidayAlert = useCallback(() => {
    setHolidayAlert(null);
  }, []);

  // Effects
  useEffect(() => {
    setupPusher();
    fetchNotificationCounts();
    fetchHolidayNotificationCounts();
    checkTodaysHoliday();
    
    return () => {
      if (window.userPusher) {
        window.userPusher.disconnect();
        window.userPusher = null;
      }
    };
  }, [setupPusher, fetchNotificationCounts, fetchHolidayNotificationCounts, checkTodaysHoliday]);

  useEffect(() => {
    if (notificationOpen) {
      fetchRecentNotifications();
      fetchHolidayNotifications();
    }
  }, [notificationOpen, fetchRecentNotifications, fetchHolidayNotifications]);

  // Memoized data
  const drawerItems = useMemo(() => [
    { 
      icon: <ColoredPersonIcon fontSize="large" />, 
      text: 'Profile', 
      route: '/attendance/user/profile' 
    },
    { 
      icon: <ColoredEmployeeAttendance fontSize="large" />, 
      text: 'Employee Attendance', 
      route: '/attendance/user' 
    },
    {
      icon: (
        <StyledBadge 
          badgeContent={pendingCounts.total + holidayDetails.total} 
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              right: collapsed ? -4 : 8,
              top: 8,
            }
          }}
        >
          <NotificationsIcon fontSize="large" style={{ color: '#9c27b0' }} />
        </StyledBadge>
      ),
      text: 'Notifications',
      route: '#notifications',
      isNotification: true
    },
    { 
      icon: <ColoredLogsIcon fontSize="large" />, 
      text: 'Logs', 
      route: '/attendance/user/log' 
    },
    { 
      icon: <ColoredLibraryBooksIcon fontSize="large" />, 
      text: 'Timesheet', 
      route: '/attendance/user/timesheet' 
    },
    { 
      icon: <ColoredTimeToLeaveIcon fontSize="large" />, 
      text: 'Leave Request', 
      route: '/attendance/user/leave' 
    },
    {
      icon: <TuneIcon style={{ color: '#00B4D8' }} fontSize="large" />,
      text: 'Schedule Request',
      route: '/attendance/user/schedule-request'
    },
  ], [pendingCounts.total, holidayDetails.total, collapsed]);

  const ConnectionStatusIndicator = useMemo(() => {
    return (
      <Tooltip title={`Pusher connection: ${pusherStatus}`}>
        <Box sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: 
            pusherStatus === 'connected' ? theme.palette.success.main :
            pusherStatus === 'connecting' ? theme.palette.warning.main :
            theme.palette.error.main,
          ml: 1
        }} />
      </Tooltip>
    );
  }, [pusherStatus, theme]);

  const drawer = useMemo(() => (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Logo and Collapse Button */}
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: '80px',
        px: collapsed ? 0 : 3,
      }}>
        {!collapsed && (
          <Tooltip title="Company Logo">
            <Avatar
              alt="Logo"
              src={Logo}
              variant="square"
              sx={{
                width: 50,
                height: 50,
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            />
          </Tooltip>
        )}
        <Box display="flex" alignItems="center">
          <Tooltip title={collapsed ? "Expand Menu" : "Collapse Menu"}>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: 'transparent',
                  transform: 'rotate(180deg)',
                },
                transition: 'transform 0.3s ease',
              }}
            >
              <MenuIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          {!collapsed && ConnectionStatusIndicator}
        </Box>
      </Toolbar>
      <Divider />

      {/* Main Navigation Items */}
      <List sx={{ flexGrow: 1 }}>
        {drawerItems.map((item, index) => (
          <Tooltip 
            key={index}
            title={item.text} 
            placement="right"
            disableHoverListener={!collapsed}
          >
            <CustomListItem
              button
              collapsed={collapsed}
              onClick={() => handleItemClick(item.route)}
              isnotification={item.isNotification}
            >
              <ListItemIcon
                sx={{
                  minWidth: 'auto',
                  mr: collapsed ? 0 : 3,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '1.1rem',
                    fontWeight: '500',
                  }}
                />
              )}
            </CustomListItem>
          </Tooltip>
        ))}
      </List>

      <Divider />

      {/* Logout Button */}
      <Tooltip 
        title="Logout" 
        placement="right"
        disableHoverListener={!collapsed}
      >
        <CustomListItem
          button
          collapsed={collapsed}
          onClick={handleLogoutClick}
          sx={{
            mb: 2,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 'auto',
              mr: collapsed ? 0 : 3,
              justifyContent: 'center',
            }}
          >
            <ColoredLogoutIcon fontSize="large" />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: '1.1rem',
                fontWeight: '500',
              }}
            />
          )}
        </CustomListItem>
      </Tooltip>

      {/* Footer Section */}
      {!collapsed && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{
            color: theme.palette.text.secondary,
            fontSize: '1.125rem',
          }}>
            © 2025 Eighty20 Virtual, Inc
          </Typography>
        </Box>
      )}

      {/* User Profile Modal */}
      <Dialog
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            padding: '0',
          }
        }}
      >
        <UserProfile onClose={() => setProfileModalOpen(false)} />
      </Dialog>

      {/* Notification Modal */}
      <Dialog
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          px: 3,
        }}>
          <Box display="flex" alignItems="center">
            <Typography variant="h4" color="white" component="div">
              My Requests & Notifications
            </Typography>
            {pendingCounts.total + holidayDetails.total > 0 && (
              <Chip 
                label={pendingCounts.total + holidayDetails.total} 
                color="error" 
                size="small" 
                sx={{ 
                  ml: 2,
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
            )}
          </Box>
          <Box>
            {(notifications.some(n => !n.is_read) || holidayNotifications.some(h => !h.is_read)) && (
              <Button 
                color="black" 
                size="small"
                onClick={() => {
                  markAsRead(notifications.filter(n => !n.is_read).map(n => n.id));
                  markHolidaysAsRead(holidayNotifications.filter(h => !h.is_read).map(h => h.id));
                }}
                sx={{color: 'white !important' }}
              >
                Mark all as read
              </Button>
            )}
            <IconButton 
              edge="end" 
              color="white" 
              onClick={() => setNotificationOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Tabs for Requests and Holiday notifications */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={notificationTab} 
            onChange={handleTabChange} 
            centered
            sx={{
              '& .MuiTab-root': {
                fontSize: '0.9rem',
                fontWeight: 500,
                minWidth: 'auto',
                px: 2,
              }
            }}
          >
            <Tab label="My Requests" />
            <Tab label="Holidays" />
          </Tabs>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box p={3} textAlign="center">
              <Typography color="error">{error}</Typography>
              <Button 
                onClick={() => {
                  fetchNotificationCounts();
                  fetchHolidayNotificationCounts();
                }}
                color="primary"
                sx={{ mt: 2 }}
              >
                Retry
              </Button>
            </Box>
          ) : (
            <Box>
              {/* My Requests Tab Content */}
              {notificationTab === 0 && (
                <Box>
                  
                  {/* Recent Notifications Section */}
                  <Box px={3} py={2}>
                    <Typography variant="h5" color="primary" gutterBottom>
                      Recent Notifications
                    </Typography>
                    {notifications.length > 0 ? (
                      notifications.map((notification) => {
                        const notificationTypeDisplay = 
                          notification.type === 'makeup' ? 'Make-up' :
                          notification.type === 'leave' ? 'Leave' :
                          notification.type === 'schedule' ? 'Schedule' :
                          notification.type.charAt(0).toUpperCase() + notification.type.slice(1);

                        return (
                          <NotificationItem
                            key={notification.id}
                            sx={{
                              backgroundColor: notification.is_read 
                                ? 'transparent' 
                                : theme.palette.action.selected,
                              alignItems: 'flex-start',
                              py: 2,
                              px: 2,
                              mb: 1,
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.divider}`
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: '48px', mt: '4px' }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: notification.processed_by?.avatar_color || 'grey.500',
                                  width: 40, 
                                  height: 40,
                                  fontSize: '0.875rem',
                                  fontWeight: 600
                                }}
                              >
                                {notification.processed_by?.avatar_text || 'AD'}
                              </Avatar>
                            </ListItemIcon>
                            <Box sx={{ flex: 1 }}>
                              {/* Request Type and Status Badge */}
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Chip 
                                  label={notificationTypeDisplay}
                                  size="small"
                                  color={
                                    notification.type === 'leave' ? 'secondary' :
                                    notification.type === 'schedule' ? 'primary' :
                                    'warning'
                                  }
                                />
                                <Chip 
                                  label={notification.status.toUpperCase()}
                                  size="small"
                                  color={
                                    notification.status === 'approved' ? 'success' :
                                    notification.status === 'rejected' ? 'error' :
                                    'warning'
                                  }
                                  variant="filled"
                                />
                              </Box>
                              
                              {/* Processed by and Timestamp */}
                              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                 <Typography variant="subtitle2" fontWeight={500}>
                                {notification.title}
                              </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </Typography>
                              </Box>
                              
                              {/* Request Title */}
                            
                              
                              {/* Request Message */}
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {notification.message}
                              </Typography>
                              
                              {/* Additional Details */}
                              {notification.details && (
                              <Box sx={{ 
                                mt: 1, 
                                p: 2, 
                                backgroundColor: 'rgba(0,0,0,0.03)', 
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`
                              }}>
                                {Object.entries(notification.details).map(([key, value]) => {
                                  // Handle schedule_days array specially
                                  if (key === 'schedule_days' && Array.isArray(value)) {
                                    return (
                                      <Box key={key} sx={{ mb: 2 }}>
                                        {/* <Typography variant="subtitle2" fontWeight="bold" display="block" sx={{ mb: 1, fontSize: '1rem' }}>
                                          SCHEDULE DAYS:
                                        </Typography> */}
                                        {value.map((day, index) => (
                                          <Typography 
                                            key={index} 
                                            variant="body2" 
                                            color="textSecondary" 
                                            display="block" 
                                            sx={{ 
                                              fontSize: '0.95rem',
                                              mb: 0.5
                                            }}
                                          >
                                            {formatDateWorded(day.date)} - {formatTimeToAMPM(day.time_in)} to {formatTimeToAMPM(day.time_out)} ({day.hours} hrs)
                                          </Typography>
                                        ))}
                                      </Box>
                                    );
                                  }
                                  
                                  // Format specific fields
                                  let displayValue = value;
                                  let displayKey = key.replace(/_/g, ' ');
                                  
                                  if (key === 'start_date' || key === 'end_date') {
                                    displayValue = formatDateWorded(value);
                                  } else if (key === 'admin_remarks' && !value) {
                                    displayValue = 'None';
                                  } else if (key === 'reason' && !value) {
                                    displayValue = 'Not specified';
                                  } else if (key === 'leave_type') {
                                    displayValue = value.charAt(0).toUpperCase() + value.slice(1);
                                  }
                                  
                                  // Capitalize first letter of each word in key
                                  displayKey = displayKey.replace(/\b\w/g, l => l.toUpperCase());
                                  
                                  // Handle regular key-value pairs
                                  return (
                                    <Typography 
                                      key={key} 
                                      variant="body2" 
                                      color="textSecondary" 
                                      display="block"
                                      sx={{ 
                                        mb: 1,
                                        fontSize: '0.95rem'
                                      }}
                                    >
                                      <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                                        {displayKey}:
                                      </Box> {typeof displayValue === 'object' ? JSON.stringify(displayValue) : displayValue}
                                    </Typography>
                                  );
                                })}
                              </Box>
                            )}
                            <Typography variant="body1" color="textSecondary" sx={{ mt: 1, fontSize: '1rem' }}>
                              Processed by: {notification.processed_by?.first_name} {notification.processed_by?.last_name}
                            </Typography>
                            </Box>
                            
                            {/* Unread indicator */}
                            {!notification.is_read && (
                              <Box 
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: theme.palette.primary.main,
                                  ml: 1,
                                }}
                              />
                            )}
                          </NotificationItem>
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                        No recent notifications
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {/* Holidays Tab Content */}
              {notificationTab === 1 && (
                <Box>
            

                  {/* Recent Holiday Notifications Section */}
                  <Box px={3} py={2}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="h5" color="primary" gutterBottom>
                        Holiday Schedule
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={fetchHolidayNotifications}
                        disabled={loading}
                      >
                        <AccessTimeIcon />
                      </IconButton>
                    </Box>
                    {holidayNotifications.length > 0 ? (
                      holidayNotifications.map((holiday) => {
                        // Format holiday type for display
                        const holidayTypeDisplay = 
                          holiday.type === 'company' ? 'Company Holiday' :
                          holiday.type === 'special' ? 'Special Holiday' :
                          holiday.type === 'regular' ? 'Regular Holiday' :
                          holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1);

                        return (
                          <NotificationItem
                            key={holiday.id}
                            sx={{
                              backgroundColor: holiday.is_read 
                                ? 'transparent' 
                                : theme.palette.action.selected,
                              alignItems: 'flex-start',
                              py: 2,
                              px: 2,
                              mb: 1,
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.divider}`
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: '48px', mt: '4px' }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: 
                                    holiday.type === 'company' ? 'primary.main' :
                                    holiday.type === 'special' ? 'secondary.main' :
                                    'warning.main',
                                  width: 40, 
                                  height: 40,
                                  fontSize: '0.875rem',
                                  fontWeight: 600
                                }}
                              >
                                {holidayTypeDisplay.charAt(0)}
                              </Avatar>
                            </ListItemIcon>
                            <Box sx={{ flex: 1 }}>
                              {/* Holiday Type Badge and Today indicator */}
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Chip 
                                  label={holidayTypeDisplay}
                                  size="small"
                                  color={
                                    holiday.type === 'company' ? 'primary' :
                                    holiday.type === 'special' ? 'secondary' :
                                    'warning'
                                  }
                                />
                                {holiday.isTodayManila && (
                                  <Chip 
                                    label="Today" 
                                    color="success" 
                                    size="small" 
                                  />
                                )}
                              </Box>
                              
                              {/* Holiday Date */}
                              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" fontWeight={500} color="primary">
                                  {holiday.title}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {formatDistanceToNow(new Date(holiday.date), { addSuffix: true })}
                                </Typography>
                              </Box>
                              
                              {/* Holiday Date */}
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                <DateRangeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {holiday.formattedDate}
                              </Typography>
                              
                              {/* Holiday Description */}
                              {holiday.details?.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  {holiday.details.description}
                                </Typography>
                              )}
                            </Box>
                            
                            {/* Unread indicator */}
                            {!holiday.is_read && (
                              <Box 
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: theme.palette.primary.main,
                                  ml: 1,
                                }}
                              />
                            )}
                          </NotificationItem>
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                        No upcoming holidays
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

    </Box>
  ), [
    theme,
    collapsed,
    handleDrawerToggle,
    ConnectionStatusIndicator,
    drawerItems,
    handleItemClick,
    handleLogoutClick,
    profileModalOpen,
    notificationOpen,
    notificationTab,
    pendingCounts,
    holidayDetails,
    notifications,
    holidayNotifications,
    loading,
    error,
    markAsRead,
    markHolidaysAsRead,
    fetchNotificationCounts,
    fetchHolidayNotifications,
    handleTabChange
  ]);

  return (
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            width: isMobile ? drawerWidthExpanded : (collapsed ? drawerWidthCollapsed : drawerWidthExpanded),
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: isMobile ? drawerWidthExpanded : (collapsed ? drawerWidthCollapsed : drawerWidthExpanded),
              boxSizing: 'border-box',
              borderRight: 'none',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.standard,
              }),
              overflowX: 'hidden',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            marginTop: theme.spacing(8),
            width: `calc(100% - ${isMobile ? 0 : (collapsed ? drawerWidthCollapsed : drawerWidthExpanded)}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard,
            }),
            backgroundColor: theme.palette.background.default,
            minHeight: '100vh',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Snackbar for real-time notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
          icon={snackbarSeverity === 'success' ? <CheckCircleIcon /> : <CancelIcon />}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Holiday Alert Snackbar */}
      <Snackbar
        open={!!holidayAlert}
        autoHideDuration={8000}
        onClose={handleCloseHolidayAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseHolidayAlert} 
          severity="info"
          sx={{ 
            width: '100%',
            maxWidth: '450px',
            background: 'linear-gradient(45deg, #ff6b6b 0%, #ff8e53 100%)',
            color: 'white',
            borderRadius: '16px',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 10px 40px rgba(255,107,107,0.3)',
            '& .MuiAlert-icon': {
              color: 'white',
              alignItems: 'center'
            },
            '& .MuiAlert-action': {
              paddingTop: '8px'
            }
          }}
          iconMapping={{
            info: <LocalActivityIcon sx={{ fontSize: 30 }} />
          }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseHolidayAlert}
              sx={{ 
                background: 'rgba(255,255,255,0.2)',
                '&:hover': { background: 'rgba(255,255,255,0.3)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          }
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              mb: 1, 
              fontSize: '1.2rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              🎊 {holidayAlert?.title}
            </Typography>
            <Typography sx={{ 
              opacity: 0.95, 
              fontSize: '0.9rem',
              lineHeight: 1.4
            }}>
              {holidayAlert?.message}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>
       {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '450px',
            boxShadow: theme.shadows[10],
          }
        }}
      >
        <DialogTitle id="logout-dialog-title" sx={{
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: '600',
          color: theme.palette.text.primary,
          pb: 1,
        }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <DialogContentText sx={{
            textAlign: 'center',
            fontSize: '1.1rem',
            color: theme.palette.text.secondary
          }}>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{
          justifyContent: 'center',
          pt: 2,
          px: 3,
          pb: 1,
        }}>
          <Button
            onClick={handleLogoutCancel}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              px: 4,
              py: 1,
              textTransform: 'none',
              fontSize: '1rem',
              mr: 3,
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            color="error"
            sx={{
              borderRadius: '8px',
              px: 4,
              py: 1,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: theme.palette.error.dark,
                boxShadow: 'none'
              }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SideNavBar;