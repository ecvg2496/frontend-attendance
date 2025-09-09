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
  Tooltip,
  styled,
  Collapse,
  Badge,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  Snackbar,
  Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogsIcon from '@mui/icons-material/ListAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Logo from 'assets/images/Eighty_20_icon_transparent.png';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LogoutIcon from '@mui/icons-material/Logout';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import HistoryIcon from '@mui/icons-material/History';
import SyncIcon from '@mui/icons-material/Sync';
import TaskIcon from '@mui/icons-material/Task';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonIcon from '@mui/icons-material/Person';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import CloseIcon from '@mui/icons-material/Close';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { dataService } from "global/function";
import Pusher from 'pusher-js';
import { formatDistanceToNow } from 'date-fns';
import UserProfile from '../admin_profile';
import { DateRangeIcon } from '@mui/x-date-pickers';

const drawerWidthExpanded = 275;
const drawerWidthCollapsed = 105;

// Custom colored icons
const ColoredAccessTimeIcon = styled(AccessTimeIcon)(({ theme }) => ({
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

const ColoredPersonIcon = styled(PersonIcon)(({ theme }) => ({
  color: theme.palette.info.main,
}));

const ColoredCircleNotificationsIcon = styled(CircleNotificationsIcon)(({ theme }) => ({
  color: theme.palette.warning.main,
}));

// Submenu icons with consistent colors
const ColoredDashboardIcon = styled(DashboardIcon)(({ theme }) => ({
  color: theme.palette.info.main,
}));

const ColoredPersonAddIcon = styled(PersonAddIcon)(({ theme }) => ({
  color: theme.palette.success.main,
}));

const ColoredPeopleIcon = styled(PeopleIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const ColoredRequestQuoteIcon = styled(RequestQuoteIcon)(({ theme }) => ({
  color: theme.palette.warning.main,
}));

const ColoredHistoryIcon = styled(HistoryIcon)(({ theme }) => ({
  color: theme.palette.secondary.main,
}));

const ColoredSyncIcon = styled(SyncIcon)(({ theme }) => ({
  color: theme.palette.info.dark,
}));

const ColoredTaskIcon = styled(TaskIcon)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const ColoredEventAvailableIcon = styled(EventAvailableIcon)(({ theme }) => ({
  color: theme.palette.success.dark,
}));

const CustomListItem = styled(ListItem)(({ theme, collapsed }) => ({
  borderRadius: '12px',
  margin: collapsed ? '8px 4px' : '8px 12px',
  padding: collapsed ? '12px 8px' : '12px 16px',
  justifyContent: collapsed ? 'center' : 'flex-start',
  flexDirection: collapsed ? 'column' : 'row',
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
}));

const CustomListItemText = styled(ListItemText)(({ collapsed }) => ({
  marginTop: collapsed ? '8px' : 0,
  textAlign: collapsed ? 'center' : 'left',
  '& .MuiTypography-root': {
    fontSize: collapsed ? '0.75rem' : '1.1rem',
    fontWeight: collapsed ? 400 : 500,
    lineHeight: collapsed ? '1.2' : '1.5',
  }
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

const HolidayNotificationItem = ({ holiday, onItemClick, theme }) => {
  const holidayTypeDisplay = 
    holiday.type === 'company' ? 'Company Holiday' :
    holiday.type === 'special' ? 'Special Holiday' :
    holiday.type === 'regular' ? 'Regular Holiday' :
    holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1);

  // Use isTodayInManila function
  const isToday = isTodayInManila(holiday.date);

  const getInitials = (text) => {
    if (!text || typeof text !== 'string') return '?';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase(); // Changed to words[1]
  };

  const formatDateWorded = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <NotificationItem
      onClick={() => onItemClick(holiday.type, holiday.holiday_id)}
      sx={{
        backgroundColor: holiday.is_read 
          ? 'transparent' 
          : theme.palette.action.selected,
        alignItems: 'flex-start',
        py: 2,
        px: 2,
        mb: 1,
        borderLeft: isToday ? `4px solid ${theme.palette.success.main}` : 'none'
      }}
    >
      <ListItemIcon sx={{ minWidth: '48px', mt: '4px' }}>
        <Avatar
          sx={{
            bgcolor:
              holiday?.type === "company"
                ? "primary.main"
                : holiday?.type === "special"
                ? "secondary.main"
                : "warning.main",
            width: 40,
            height: 40,
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          {getInitials(holiday?.title)}
        </Avatar>
      </ListItemIcon>
      <Box sx={{ flex: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={100} color="primary">
            {holiday.title}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {formatDistanceToNow(new Date(holiday.date), { addSuffix: true })}
          </Typography>
        </Box>
        
        <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
          <DateRangeIcon color="red" /> &nbsp;{formatDateWorded(holiday.date)}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {holiday.details?.description || 'No description available'}
        </Typography>

        {isToday && (
          <Chip 
            label="Today" 
            color="success" 
            size="small" 
            sx={{ mt: 1 }}
          />
        )}
      </Box>
      
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
};

const GlobalSideNav = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [clientMenuOpen, setClientMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationDetails, setNotificationDetails] = useState({
    leave: 0,
    schedule: 0,
    makeup: 0,
    total: 0
  });
  const [holidayDetails, setHolidayDetails] = useState({
    company: 0,
    special: 0,
    regular: 0,
    total: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [holidayNotifications, setHolidayNotifications] = useState([]);
  const [todayHolidays, setTodayHolidays] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pusherStatus, setPusherStatus] = useState('connecting');
  const [holidayAlert, setHolidayAlert] = useState(null);
  const navigate = useNavigate();
  
  // Memoized helper functions
  const getAvatarText = useCallback((fullName) => {
    const parts = fullName?.split(' ') || [];
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0] ? `${parts[0][0]}${parts[0][1]}`.toUpperCase() : '??';
  }, []);

  const hashString = useCallback((str) => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }, []);

  // Notification sound with error handling
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log("Audio play failed:", e));
    } catch (error) {
      console.log("Notification sound error:", error);
    }
  }, []);

  // Show holiday alert
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
      const response = await dataService('GET', '/attendance/notifications/counts/');
      
      if (response.error) {
        setError(response.message || 'Failed to load notification counts');
        return;
      }

      // Handle different response structures
      const counts = response.data?.counts || response.data || {};
      const leaveCount = counts.leave?.pending || counts.leave || 0;
      const scheduleCount = counts.schedule?.pending || counts.schedule || 0;
      const makeupCount = counts.makeup?.pending || counts.makeup || 0;
      const totalCount = counts.totals?.pending || counts.total || counts.totals || 0;

      setNotificationDetails({
        leave: leaveCount,
        schedule: scheduleCount,
        makeup: makeupCount,
        total: totalCount
      });
      setNotificationCount(totalCount);
    } catch (err) {
      setError('Failed to load notification counts');
      console.error('Error fetching notification counts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Fetch recent notifications
  const fetchRecentNotifications = useCallback(async () => {
    try {
      const response = await dataService('GET', '/attendance/notifications/');
      
      if (response.error) {
        console.error('Error fetching recent notifications:', response.message);
        return;
      }

      // Handle different response structures
      const notificationsData = response.data?.notifications || response.data || [];
      
      const transformed = notificationsData.map(notif => ({
        ...notif,
        id: notif.id || `${notif.type}_${notif.request_id}`,
        title: notif.title || `New ${notif.type} request`,
        is_read: notif.is_read || false,
        employee: notif.employee || {
          id: notif.employee_id,
          first_name: notif.employee_name?.split(' ')[0] || 'Unknown',
          last_name: notif.employee_name?.split(' ')[1] || '',
          avatar_text: getAvatarText(notif.employee_name),
          avatar_color: `hsl(${hashString(notif.employee_name) % 360}, 70%, 50%)`
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
      isTodayInManila: isTodayInManila(holiday.date)
    }));

    setHolidayNotifications(transformed);
  } catch (err) {
    console.error('Error fetching holiday notifications:', err);
  }
}, []);

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
      
      // Update counts if marking all as read
      if (notificationIds.length === notifications.filter(n => !n.is_read).length) {
        setNotificationCount(0);
        setNotificationDetails(prev => ({
          ...prev,
          leave: 0,
          schedule: 0,
          makeup: 0,
          total: 0
        }));
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  }, [notifications]);

  const formatToManilaDate = (dateString) => {
    if (!dateString) return 'Invalid date';
    
    try {
      // Create date in Manila timezone
      const date = new Date(dateString);
      const manilaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
      
      return manilaDate.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting Manila date:', error);
      return dateString;
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
    if (window.pusher) {
      window.pusher.disconnect();
      window.pusher = null;
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

    console.log('Initializing Pusher with public channel config:', pusherConfig);

    try {
      window.pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, pusherConfig);
      const { connection } = window.pusher;

      // Connection state handlers
      connection.bind('state_change', (states) => {
        console.log('Pusher connection state changed:', states);
        setPusherStatus(states.current);
      });

      connection.bind('connected', () => {
        console.log('Pusher connected successfully');
        setPusherStatus('connected');
        
        // Now subscribe to public channels
        subscribeToPublicChannels();
      });

      connection.bind('error', (error) => {
        console.error('Pusher connection error:', error);
        setPusherStatus('error');
      });

      // Function to subscribe to public channels
      const subscribeToPublicChannels = () => {
        try {
          const adminChannel = window.pusher.subscribe('admin-dashboard');
          
          adminChannel.bind('pusher:subscription_succeeded', () => {
            console.log('Successfully subscribed to admin-dashboard channel');
            setPusherStatus('subscribed');
          });

          adminChannel.bind('pusher:subscription_error', (status) => {
            console.error('Failed to subscribe to admin-dashboard:', status);
            setPusherStatus('subscription_error');
          });

          // Event handlers
          adminChannel.bind('new_pending_request', (data) => {
            console.log('New public notification:', data);
            // Refresh both counts and notifications
            fetchNotificationCounts();
            fetchRecentNotifications();
            playNotificationSound();
          });

          adminChannel.bind('requests_updated', (data) => {
            console.log('Public requests updated:', data);
            // Refresh counts when requests are updated
            fetchNotificationCounts();
          });

          adminChannel.bind('refresh_notifications', (data) => {
            console.log('Refresh notifications signal received:', data);
            // Refresh both counts and notifications
            fetchNotificationCounts();
            fetchRecentNotifications();
          });

          // Holiday notification events
          adminChannel.bind('holiday_today', (data) => {
            console.log('Today is a holiday:', data);
            // Refresh holiday notifications
            fetchHolidayNotificationCounts();
            fetchHolidayNotifications();
            playNotificationSound();
            // Show immediate notification to user
            showHolidayAlert(data);
          });

          adminChannel.bind('holiday_alert', (data) => {
            console.log('Holiday alert:', data);
            fetchHolidayNotificationCounts();
            fetchHolidayNotifications();
          });

          adminChannel.bind('holiday_created', (data) => {
            console.log('New holiday created:', data);
            fetchHolidayNotificationCounts();
            fetchHolidayNotifications();
          });

          adminChannel.bind('holiday_updated', (data) => {
            console.log('Holiday updated:', data);
            fetchHolidayNotificationCounts();
            fetchHolidayNotifications();
          });

          adminChannel.bind('holiday_deleted', (data) => {
            console.log('Holiday deleted:', data);
            fetchHolidayNotificationCounts();
            fetchHolidayNotifications();
          });

        } catch (err) {
          console.error('Error in public channel subscription:', err);
        }
      };

    } catch (err) {
      console.error('Pusher initialization failed:', err);
      setPusherStatus('initialization_error');
    }
  }, [fetchNotificationCounts, fetchRecentNotifications, fetchHolidayNotificationCounts, fetchHolidayNotifications, playNotificationSound, showHolidayAlert]);

  // Event handlers
  const handleDrawerToggle = useCallback(() => {
    if (!isMobile) {
      setCollapsed(prev => !prev);
      if (!collapsed) {
        setClientMenuOpen(false);
      }
    } else {
      setMobileOpen(prev => !prev);
    }
  }, [isMobile, collapsed]);

  const handleItemClick = useCallback((route) => {
    if (route === '/attendance/admin/profile') {
      setProfileModalOpen(true);
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
    setLogoutOpen(false);
    navigate('/authentication/sign-in');
  }, [navigate]);

  const handleLogoutCancel = useCallback(() => {
    setLogoutOpen(false);
  }, []);

  const handleClientClick = useCallback((e) => {
    if (e.currentTarget === e.target.closest('.MuiListItem-root')) {
      setClientMenuOpen(prev => !prev);
    }
  }, []);

  const handleSubItemClick = useCallback((route) => (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(route);
    if (isMobile) setMobileOpen(false);
  }, [navigate, isMobile]);

  const handleNotificationClick = useCallback((type, requestId) => {
    // Navigate to appropriate page based on notification type with tab parameter
    switch(type) {
      
      case 'leave':
        navigate('/attendance/admin/leave-credit?tab=requests');
        break;

      case 'schedule':
        navigate('/attendance/admin/schedule?tab=requests');
        break;

      case 'makeup':
        navigate('/attendance/admin/client?tab=makeup');
        break;

      default:
        break;
    }
    setNotificationOpen(false);
  }, [navigate]);

  const handleHolidayNotificationClick = useCallback((type, holidayId) => {
    navigate('/attendance/admin/holiday-assignment?tab=holidays');
    setNotificationOpen(false);
  }, [navigate]);

  const handleTabChange = useCallback((event, newValue) => {
    setNotificationTab(newValue);
  }, []);

  const handleCloseHolidayAlert = useCallback(() => {
    setHolidayAlert(null);
  }, []);
 
  const formatDateWorded = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };
  const convertHolidayDateToManila = (dateString) => {
    const dateTimeString = `${dateString}T00:00:00`;
    return utcToZonedTime(new Date(dateTimeString), 'Asia/Manila');
  };
  

  // Memoized data
  const clientSubMenuItems = useMemo(() => [
    { icon: <ColoredDashboardIcon />, text: 'Dashboard', route: '/attendance/admin/client' },
    { icon: <ColoredHistoryIcon />, text: 'Activities History', route: '/attendance/admin/activities-history' },
    { icon: <ColoredPersonAddIcon />, text: 'Employee', route: '/attendance/admin/employee' },
    { icon: <ColoredPeopleIcon />, text: 'Browse Employee', route: '/attendance/admin/dashboard/browse' },
    { icon: <ColoredPeopleIcon />, text: 'Assign Employee', route: '/attendance/admin/assign-users' },
    { icon: <EventBusyIcon color="error" />, text: 'Absences & Late', route: '/attendance/admin/calendar' },
    { icon: <ColoredTimeToLeaveIcon />, text: 'Leave', route: '/attendance/admin/leave-credit'},
    { icon: <ColoredSyncIcon />, text: 'Schedule Request', route: '/attendance/admin/schedule' },
    { icon: <ColoredEventAvailableIcon />, text: 'Assign Holiday', route: '/attendance/admin/holiday-assignment' },
    { icon: <ColoredEventAvailableIcon />, text: 'Manage PTO', route: '/attendance/admin/pto' },
  ], []);

  const drawerItems = useMemo(() => [
    {
      icon: <ColoredPersonIcon fontSize="large" />,
      text: 'Edit Profile',
      route: '/attendance/admin/profile'
    },
    {
      icon: (
        <Badge 
          badgeContent={notificationCount} 
          color="error"
          overlap="circular"
          max={99}
        >
          <ColoredCircleNotificationsIcon fontSize="large" />
        </Badge>
      ),
      text: 'Notifications',
      route: '#',
      onClick: () => setNotificationOpen(true)
    },
    {
      icon: <BusinessCenterIcon fontSize="large" sx={{color: '#1976d2'}} />, 
      text: 'User Request', 
      route: '/attendance/dashboard/client',
      hasSubmenu: true
    }
  ], [notificationCount]);

  // Effects
  useEffect(() => {
    setupPusher();
    fetchNotificationCounts();
    fetchHolidayNotificationCounts();
    checkTodaysHoliday();
    
    return () => {
      if (window.pusher) {
        window.pusher.disconnect();
        window.pusher = null;
      }
    };
  }, [setupPusher, fetchNotificationCounts, fetchHolidayNotificationCounts, checkTodaysHoliday]);

  useEffect(() => {
    if (notificationOpen) {
      fetchRecentNotifications();
      fetchHolidayNotifications();
    }
  }, [notificationOpen, fetchRecentNotifications, fetchHolidayNotifications]);

  // Drawer component
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
          {!collapsed}
        </Box>
      </Toolbar>
      <Divider />

      {/* Main Navigation Items */}
      <List sx={{ flexGrow: 1 }}>
        {drawerItems.map((item, index) => (
          <React.Fragment key={index}>
            <CustomListItem
              button
              collapsed={collapsed}
              onClick={item.onClick || (item.hasSubmenu ? handleClientClick : () => handleItemClick(item.route))}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light' 
                    ? 'rgba(0, 0, 0, 0.05)' 
                    : 'rgba(255, 255, 255, 0.08)',
                },
              }}
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
              <CustomListItemText
                primary={item.text}
                collapsed={collapsed}
              />
              {!collapsed && item.hasSubmenu && (clientMenuOpen ? <ExpandLess /> : <ExpandMore />)}
            </CustomListItem>
            
            {item.hasSubmenu && !collapsed && (
              <Collapse in={clientMenuOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {clientSubMenuItems.map((subItem, subIndex) => (
                    <CustomListItem
                      key={subIndex}
                      button
                      collapsed={collapsed}
                      onClick={handleSubItemClick(subItem.route)}
                      sx={{ 
                        pl: 6,
                        margin: collapsed ? '8px 4px' : '8px 12px 8px 36px',
                        padding: collapsed ? '12px 8px' : '12px 16px',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'light' 
                            ? 'rgba(0, 0, 0, 0.05)' 
                            : 'rgba(255, 255, 255, 0.08)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 'auto',
                          mr: collapsed ? 0 : 3,
                          justifyContent: 'center',
                        }}
                      >
                        {subItem.icon}
                      </ListItemIcon>
                      <CustomListItemText
                        primary={subItem.text}
                        collapsed={collapsed}
                      />
                    </CustomListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      <Divider />

      {/* Logout Button */}
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
        <CustomListItemText
          primary="Logout"
          collapsed={collapsed}
        />
      </CustomListItem>

      {/* Footer Section */}
      {!collapsed && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.9rem',
          }}>
            © 2025 Eighty20 Virtual, Inc
          </Typography>
        </Box>
      )}

      {/* Notifications Dialog */}
      <Dialog
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        maxWidth="sm"
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
              Notifications
            </Typography>
            {notificationCount > 0 && (
              <Chip 
                label={notificationCount} 
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
            {notifications.some(n => !n.is_read) && (
              <Button 
                color="black" 
                size="small"
                onClick={() => markAsRead(notifications.filter(n => !n.is_read).map(n => n.id))}
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
        
        {/* Tabs for Pending and Holiday notifications */}
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
            <Tab label="Pending" />
            <Tab label="Holiday" />
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
                onClick={fetchNotificationCounts}
                color="primary"
                sx={{ mt: 2 }}
              >
                Retry
              </Button>
            </Box>
          ) : (
            <>
              {/* Pending Tab Content */}
              {notificationTab === 0 && (
                <List disablePadding>
                  {/* Leave Applications */}
                  <ListItem 
                    button 
                    onClick={() => handleNotificationClick('leave')}
                    sx={{
                      px: 3,
                      py: 2,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <EventAvailableIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography fontWeight={500}>Leave Applications</Typography>
                          {notificationDetails.leave > 0 && (
                            <Chip 
                              label={notificationDetails.leave} 
                              color="error" 
                              size="small" 
                              sx={{ ml: 2 }} 
                            />
                          )}
                        </Box>
                      }
                      secondary="Pending leave requests from employees"
                    />
                    <ChevronRightIcon color="action" />
                  </ListItem>
                  <Divider />

                  {/* Schedule Requests */}
                  <ListItem 
                    button 
                    onClick={() => handleNotificationClick('schedule')}
                    sx={{
                      px: 3,
                      py: 2,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <SyncIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography fontWeight={500}>Schedule Requests</Typography>
                          {notificationDetails.schedule > 0 && (
                            <Chip 
                              label={notificationDetails.schedule} 
                              color="error" 
                              size="small" 
                              sx={{ ml: 2 }} 
                            />
                          )}
                        </Box>
                      }
                      secondary="Pending schedule change requests"
                    />
                    <ChevronRightIcon color="action" />
                  </ListItem>
                  <Divider />

                  {/* Makeup Requests */}
                  <ListItem 
                    button 
                    onClick={() => handleNotificationClick('makeup')}
                    sx={{
                      px: 3,
                      py: 2,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <AccessTimeIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography fontWeight={500}>Makeup Requests</Typography>
                          {notificationDetails.makeup > 0 && (
                            <Chip 
                              label={notificationDetails.makeup} 
                              color="error" 
                              size="small" 
                              sx={{ ml: 2 }} 
                            />
                          )}
                        </Box>
                      }
                      secondary="Pending makeup time requests"
                    />
                    <ChevronRightIcon color="action" />
                  </ListItem>
                  <Divider />

                  {/* Recent Notifications Section */}
                  <Box px={3} py={2}>
                    <Typography variant="body1" fontWeight="bold" color="primary" gutterBottom>
                      Recent Pending
                    </Typography>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      // Format notification type for display
                      const notificationTypeDisplay = 
                        notification.type === 'makeup' ? 'Make-up' :
                        notification.type === 'leave' ? 'Leave' :
                        notification.type === 'schedule' ? 'Schedule' :
                        notification.type.charAt(0).toUpperCase() + notification.type.slice(1);

                      return (
                        <NotificationItem
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.type, notification.request_id)}
                          sx={{
                            backgroundColor: notification.is_read 
                              ? 'transparent' 
                              : theme.palette.action.selected,
                            alignItems: 'flex-start',
                            py: 2,
                            px: 2,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: '48px', mt: '4px' }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: notification.employee?.avatar_color || 'grey.500',
                                width: 40, 
                                height: 40,
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}
                            >
                              {notification.employee?.avatar_text || '??'}
                            </Avatar>
                          </ListItemIcon>
                          <Box sx={{ flex: 1 }}>
                            {/* Request Type Badge */}
                            <Chip 
                              label={notificationTypeDisplay}
                              size="small"
                              color={
                                notification.type === 'leave' ? 'secondary' :
                                notification.type === 'schedule' ? 'primary' :
                                'warning'
                              }
                              sx={{ mb: 1 }}
                            />
                            
                            {/* Employee Name and Timestamp */}
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography fontWeight={100} color="primary">
                                {notification.employee?.first_name} {notification.employee?.last_name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </Typography>
                            </Box>
                            
                            {/* Request Title */}
                            <Typography variant="subtitle2" fontWeight={500} sx={{ mt: 0.5 }}>
                              {notification.title}
                            </Typography>
                            
                            {/* Request Details */}
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {notification.message}
                            </Typography>
                            
                            {/* Additional Details */}
                            {notification.type === 'leave' && notification.details && (
                              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                <Chip 
                                  label={notification.details.leave_type}
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                />
                                <Chip 
                                  label={notification.details.duration}
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                />
                              </Box>
                            )}
                            
                            {notification.type === 'schedule' && notification.details?.schedule_days?.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                {notification.details.schedule_days.map((day, index) => (
                                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <EventAvailableIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                                    <Typography variant="caption">
                                      {day.date}: {day.time_in} to {day.time_out}
                                      {day.is_day_off && (
                                        <Chip label="Day Off" size="small" sx={{ ml: 1 }} />
                                      )}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                            
                            {notification.type === 'makeup' && notification.details && (
                              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="caption">
                                  Requested: {notification.details.requested_date}
                                  {notification.details.requested_hours && (
                                    <span> ({notification.details.requested_hours} hours)</span>
                                  )}
                                </Typography>
                              </Box>
                            )}
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
                </List>
              )}

              {/* Holiday Tab Content */}
              {notificationTab === 1 && (
                <List disablePadding>
                  {/* Company Holidays */}
                  <ListItem 
                    button 
                    onClick={() => handleHolidayNotificationClick('company')}
                    sx={{
                      px: 3,
                      py: 2,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <EventAvailableIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography fontWeight={500}>US Holidays</Typography>
                          {holidayDetails.company > 0 && (
                            <Chip 
                              label={holidayDetails.company} 
                              color="error" 
                              size="small" 
                              sx={{ ml: 2 }} 
                            />
                          )}
                        </Box>
                      }
                      secondary="Upcoming US holidays"
                    />
                    <ChevronRightIcon color="action" />
                  </ListItem>
                  <Divider />

                  {/* Special Holidays */}
                  <ListItem 
                    button 
                    onClick={() => handleHolidayNotificationClick('special')}
                    sx={{
                      px: 3,
                      py: 2,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <EventAvailableIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography fontWeight={500}>Philippine Holiday</Typography>
                          {holidayDetails.special > 0 && (
                            <Chip 
                              label={holidayDetails.special} 
                              color="error" 
                              size="small" 
                              sx={{ ml: 2 }} 
                            />
                          )}
                        </Box>
                      }
                      secondary="Upcoming Philippine holidays"
                    />
                    <ChevronRightIcon color="action" />
                  </ListItem>
                  <Divider />

                  {/* Regular Holidays */}
                  <ListItem 
                    button 
                    onClick={() => handleHolidayNotificationClick('regular')}
                    sx={{
                      px: 3,
                      py: 2,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <EventAvailableIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography fontWeight={500}>Holidays</Typography>
                          {holidayDetails.regular > 0 && (
                            <Chip 
                              label={holidayDetails.regular} 
                              color="error" 
                              size="small" 
                              sx={{ ml: 2 }} 
                            />
                          )}
                        </Box>
                      }
                      secondary="Other holidays"
                    />
                    <ChevronRightIcon color="action" />
                  </ListItem>
                  <Divider />

                  {/* Recent Holiday Notifications Section */}
                  <Box px={3} py={2}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="body1" fontWeight="bold" color="primary" gutterBottom>
                        Holiday Notifications
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={fetchHolidayNotifications}
                        disabled={loading}
                      >
                        <SyncIcon />
                      </IconButton>
                    </Box>
                    
                    {holidayNotifications.length > 0 ? (
                      <>
                        {/* Today's Holidays Section */}
                        {holidayNotifications.filter(holiday => isTodayInManila(holiday.date)).length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="success.main" gutterBottom>
                              🎉 Today's Holiday
                            </Typography>
                            {holidayNotifications
                              .filter(holiday => isTodayInManila(holiday.date))
                              .map((holiday) => (
                                <HolidayNotificationItem 
                                  key={holiday.id} 
                                  holiday={holiday} 
                                  onItemClick={handleHolidayNotificationClick}
                                  theme={theme}
                                />
                              ))
                            }
                          </Box>
                        )}
                        
                        {/* Upcoming Holidays Section */}
                        {holidayNotifications.filter(holiday => !isTodayInManila(holiday.date)).length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
                              📅 Upcoming Holiday
                            </Typography>
                            {holidayNotifications
                              .filter(holiday => !isTodayInManila(holiday.date))
                              .map((holiday) => (
                                <HolidayNotificationItem 
                                  key={holiday.id} 
                                  holiday={holiday} 
                                  onItemClick={handleHolidayNotificationClick}
                                  theme={theme}
                                />
                              ))
                            }
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                        No upcoming holidays
                      </Typography>
                    )}
                  </Box>
                </List>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

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
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <UserProfile 
          onClose={() => setProfileModalOpen(false)}  
        />
      </Dialog>

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
    </Box>
  ), [
    theme,
    collapsed,
    handleDrawerToggle,
    drawerItems,
    handleClientClick,
    handleItemClick,
    clientMenuOpen,
    clientSubMenuItems,
    handleSubItemClick,
    handleLogoutClick,
    notificationOpen,
    notificationTab,
    notificationCount,
    notifications,
    holidayNotifications,
    loading,
    error,
    notificationDetails,
    holidayDetails,
    handleNotificationClick,
    handleHolidayNotificationClick,
    handleTabChange,
    markAsRead,
    fetchNotificationCounts,
    fetchHolidayNotifications,
    profileModalOpen,
    logoutOpen,
    handleLogoutCancel,
    handleLogoutConfirm
  ]);

  return (
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
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              color: 'black !important'
            }}>
              🎊 {holidayAlert?.title}
            </Typography>
            <Typography sx={{ 
              opacity: 0.95, 
              fontSize: '0.9rem',
              lineHeight: 1.4,
              color: 'black !important'
            }}>
              {holidayAlert?.message}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GlobalSideNav;