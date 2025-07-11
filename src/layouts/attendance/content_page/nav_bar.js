import React, { useState } from 'react';
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
  Tooltip
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
import Logo from 'assets/images/Eighty_20_icon_transparent.png';
import PersonIcon from '@mui/icons-material/Person';
import UserProfile from '../user_profile'; // Adjust path as needed

const drawerWidthExpanded = 300;
const drawerWidthCollapsed = 90;

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

const CustomListItem = styled(ListItem)(({ theme, collapsed }) => ({
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
}));

const SideNavBar = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleDrawerToggle = () => {
    if (!isMobile) {
      setCollapsed(!collapsed);
    } else {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleItemClick = (route) => {
    if (route === '/attendance/user/profile') {
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
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('employee');
    setLogoutOpen(false);
    navigate('/authentication/sign-in');
  };

  const handleLogoutCancel = () => {
    setLogoutOpen(false);
  };

  const drawerItems = [
    { 
      icon: <PersonIcon fontSize="large" />, 
      text: 'Edit Profile', 
      route: '/attendance/user/profile' 
    },
    { 
      icon: <PersonIcon fontSize="large" />, 
      text: 'Employee Attendance', 
      route: '/attendance/user' 
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
      icon: <TuneIcon style={{ color: '#00B4D8' }} fontSize="large" />, // Using your primary color for consistency
      text: 'Schedule Request',
      route: '/attendance/user/schedule-request' // Updated route
    },
    // {
    //   icon: <EventAvailableIcon style={{ color: '#4caf50' }} fontSize="large" />,
    //   text: 'Make Up Request',
    //   route: '/attendance/user/make-up'
    // },
    { 
      icon: <ColoredTimeToLeaveIcon fontSize="large" />, 
      text: 'Leave', 
      route: '/attendance/user/leave' 
    },
    {
    icon: <BuildIcon style={{ color: '#ff9800' }} fontSize="large" />,
    text: 'Diagnostic',
    route: '/attendance/user/diagnostic'
    },
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

export default SideNavBar;