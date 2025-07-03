import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { AppBar, Container, Toolbar } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import e20logo from "assets/images/e20/eighty_20_logo.png";
import rgba from "assets/theme/functions/rgba";
import useAuth from "hooks/useAuth";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import { useMaterialUIController } from "context";
import { showToast } from "utils/notification";

function NavBar({ color, position }) {
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const { isAuth, setIsAuth } = useAuth();
    const [controller] = useMaterialUIController();
    const { darkMode } = controller;
    const [loading, setLoading] = useState(false);

    const pages = ['home', 'careers'];

    const handleLogout = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await axiosPrivate.post('entity/logout', {
                refresh: localStorage.getItem('refreshToken')
            });
            
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsAuth(false);
            navigate('/');
            showToast('Logged out successfully', 'success');
        } catch (error) {
            showToast('Logout failed. Please try again.', 'error');
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleNavigation = (page) => {
        navigate(`/${page}`);
    }

    const handleLogin = () => {
        navigate('/auth/sign-in'); // Updated to more common auth route
    }

    return (
        <AppBar position={position}>
            <Container maxWidth='xl'>
                <Toolbar disableGutters>
                    <MDBox 
                        component="img" 
                        src={e20logo} 
                        width="20%" 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    />
                    
                    <MDBox sx={{ display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <MDButton
                                variant="text"
                                key={page}
                                color={color ? color : darkMode ? 'white' : 'primary'}
                                onClick={() => handleNavigation(page)}
                                sx={{ 
                                    my: 2, 
                                    display: 'block', 
                                    bgcolor: rgba(0, 0, 0, 0.5),
                                    borderRadius: 0,
                                    fontSize: 16
                                }}
                            >
                                {page}
                            </MDButton>
                        ))}
                    </MDBox>
                    
                    <MDBox display="flex" sx={{ flexGrow: 1, flexDirection: 'row-reverse' }}>
                        {isAuth ? (
                            <MDButton 
                                color="info" 
                                onClick={handleLogout}
                                disabled={loading}
                                startIcon={<LogoutIcon fontSize="small" />}
                            >
                                {loading ? 'Logging out...' : 'Log out'}
                            </MDButton>
                        ) : (
                            <MDButton 
                                color="info" 
                                variant="contained" 
                                onClick={handleLogin}
                                startIcon={<LoginIcon fontSize="small" />}
                            >
                                Log in
                            </MDButton>
                        )}
                    </MDBox>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

NavBar.defaultProps = {
    position: 'absolute',
    color: null
};

NavBar.propTypes = {
    color: PropTypes.string,
    position: PropTypes.string,
};

export default NavBar;