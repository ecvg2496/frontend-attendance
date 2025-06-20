import React, { useContext } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Badge,
  Box,
  styled,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import { ColorModeContext } from './src/ThemeProvider'; // adjust path

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  borderBottom: `1px solid ${theme.palette.divider}`,
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 5,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

export const TopNavBar = ({
  title = "Leave Application Review",
  notificationCount = 3,
  user = { name: "John Doe", avatar: "" },
  onMenuClick
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const colorMode = useContext(ColorModeContext);

  return (
    <StyledAppBar position="fixed">
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 3 } }}>
        {/* Left side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton edge="start" onClick={onMenuClick} sx={{ display: { md: 'none' } }} aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={600} color="primary" noWrap sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            {title}
          </Typography>
        </Box>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          <Tooltip title="Toggle Dark Mode">
            <IconButton onClick={colorMode.toggleColorMode} aria-label="toggle theme">
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <IconButton aria-label="notifications">
            <StyledBadge badgeContent={notificationCount} color="error" max={99}>
              <NotificationsIcon />
            </StyledBadge>
          </IconButton>

          <IconButton aria-label="help">
            <HelpOutlineIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, gap: 1 }}>
            <Avatar
              alt={user.name}
              src={user.avatar}
              sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
            />
            {!isMobile && (
              <Typography variant="subtitle2">
                {user.name}
              </Typography>
            )}
          </Box>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default TopNavBar;
