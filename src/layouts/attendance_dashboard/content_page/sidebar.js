import React, { useState, useEffect } from 'react';
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
  Badge
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
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axios from 'axios';
import UserProfile from '../admin_profile';

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
    makeup: 0,
    schedule: 0,
    leave: 0
  });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleDrawerToggle = () => {
    if (!isMobile) {
      setCollapsed(!collapsed);
      if (!collapsed) {
        setClientMenuOpen(false);
      }
    } else {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleItemClick = (route) => {
    if (route === '/attendance/admin/profile') {
      setProfileModalOpen(true);
    } else {
      navigate(route);
    }
    if (isMobile) setMobileOpen(false);
  };
  
  const handleLogoutClick = () => {
    setLogoutOpen(true);
  };
  
  const handleLogoutConfirm = () => {
    localStorage.removeItem('employee');
    setLogoutOpen(false);
    navigate('/authentication/sign-in');
  };

  const handleLogoutCancel = () => {
    setLogoutOpen(false);
  };

  const handleClientClick = (e) => {
    if (e.currentTarget === e.target.closest('.MuiListItem-root')) {
      setClientMenuOpen(!clientMenuOpen);
    }
  };

  const handleSubItemClick = (route) => (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(route);
    if (isMobile) setMobileOpen(false);
  };

  const clientSubMenuItems = [
    { icon: <ColoredDashboardIcon />, text: 'Dashboard', route: '/attendance/admin/client' },
    { icon: <ColoredPersonAddIcon />, text: 'Create User', route: '/attendance/admin/employee' },
    { icon: <ColoredPeopleIcon />, text: 'Browse Users', route: '/attendance/admin/dashboard/browse' },
    { icon: <ColoredPeopleIcon />, text: 'Assign Users', route: '/attendance/admin/assign-users' },
    { icon: <ColoredTimeToLeaveIcon />, text: 'Leave', route: '/attendance/admin/leave-credit'},
    // { icon: <ColoredHistoryIcon />, text: 'Activities History', route: '/attendance/admin/activities-history' },
    { icon: <ColoredSyncIcon />, text: 'Schedule Request', route: '/attendance/admin/schedule' },
    { icon: <ColoredEventAvailableIcon />, text: 'Manage PTO', route: '/attendance/admin/pto' },
  ];

  const drawerItems = [
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
  ];

  const drawer = (
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
          <Typography variant="h4" color="white" component="div">
            Pending Requests
          </Typography>
          <IconButton 
            edge="end" 
            color="white" 
            onClick={() => setNotificationOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List disablePadding>
            <ListItem 
              button 
              onClick={() => {
                navigate('/attendance/admin/schedule');
                setNotificationOpen(false);
              }}
              sx={{
                px: 3,
                py: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                color: 'black !important'
              }}
            >
              <ListItemIcon>
                <SyncIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={`Schedule Requests (${notificationDetails.schedule})`} 
                primaryTypographyProps={{ fontWeight: 500 }}
              />
              <ChevronRightIcon color="action" />
            </ListItem>
            <Divider />
            <ListItem 
              button 
              onClick={() => {
                navigate('/attendance/admin/leave-credit');
                setNotificationOpen(false);
              }}
              sx={{
                px: 3,
                py: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                color: 'black !important'
              }}
            >
              <ListItemIcon>
                <EventAvailableIcon color="secondary" />
              </ListItemIcon>
              <ListItemText 
                primary={`Leave Applications (${notificationDetails.leave})`} 
                primaryTypographyProps={{ fontWeight: 500 }}
              />
              <ChevronRightIcon color="action" />
            </ListItem>
            <Divider />
            <ListItem 
              button 
              onClick={() => {
                navigate('/attendance/admin/makeup-requests');
                setNotificationOpen(false);
              }}
              sx={{
                px: 3,
                py: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                color: 'black !important'
              }}
            >
              <ListItemIcon>
                <AccessTimeIcon color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary={`Makeup Requests (${notificationDetails.makeup})`} 
                primaryTypographyProps={{ fontWeight: 500 }}
              />
              <ChevronRightIcon color="action" />
            </ListItem>
          </List>
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
  );

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
    </Box>
  );
};

export default GlobalSideNav;