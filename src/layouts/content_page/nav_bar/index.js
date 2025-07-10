import { AppBar, Container, Toolbar } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Add this import

import MDButton from "components/MDButton";
import MDBox from "components/MDBox";

import e20logo from "assets/images/e20/eighty_20_logo.png";
import rgba from "assets/theme/functions/rgba";

import useAuth from "hooks/useAuth";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import { useMaterialUIController } from "context";
import { useEffect } from "react";
import PropTypes from "prop-types";
import { fontSize } from "@mui/system";
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

function NavBar({color, position}) {
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate(); // Initialize the navigate function
    
    const pages = ['home', 'careers'];
    const { isAuth, setIsAuth } = useAuth();
    const [controller] = useMaterialUIController();
    const { darkMode } = controller;

    console.log(isAuth);

    const handleLogout = async (e) => {
        e.preventDefault();
    
        try {
            await axiosPrivate.post('entity/logout', {
                refresh: localStorage.getItem('refreshToken')
            });

            setIsAuth(false);
            navigate('/'); // Redirect to home after logout
        } catch(e) {
            console.error('Logout error:', e);
        }
    }

    const handleNavigation = (path) => {
        navigate(path); 
    }

    return (
        <AppBar position={position}>
            <Container maxWidth='xl'>
            <Toolbar disableGutters>
                <MDBox 
                    component="img" 
                    src={e20logo} 
                    width="20%" 
                    onClick={() => handleNavigation('/')} // Make logo clickable
                    sx={{ cursor: 'pointer' }}
                />
                {/* <MDBox sx={{display: { xs: 'none', md: 'flex' } }}>
                {pages.map((page) => (
                    <MDButton
                    variant="text"
                    key={page}
                    onClick={() => handleNavigation(`/${page}`)} // Changed from href to onClick
                    color={color ? color : darkMode ? 'white' : 'primary'}
                    sx={{ 
                        my: 2, 
                        display: 'block', 
                        bgcolor: rgba(0,0,0,0.5),
                        borderRadius: 0,
                        fontSize: 16
                    }}
                    >
                    {page}
                    </MDButton>
                ))}
                </MDBox> */}
                { isAuth ? 
                <MDBox display="flex" sx={{ flexGrow: 1, flexDirection: 'row-reverse' }}>
                <MDButton 
                  color="info" 
                  onClick={handleLogout}
                  startIcon={<LogoutIcon fontSize="small" />}
                >
                  Log out
                </MDButton>
                </MDBox>
                : 
                <MDBox display="flex" sx={{ flexGrow: 1, flexDirection: 'row-reverse' }}>
                    <MDButton 
                      color="info" 
                      variant="contained" 
                      onClick={() => handleNavigation('/authentication/sign-in')} // Changed from href to onClick
                      startIcon={<LoginIcon fontSize="small" />}
                    >
                      Log in
                    </MDButton>
                </MDBox> }
            </Toolbar>
            </Container>
        </AppBar>
    );
}

NavBar.defaultProps = {
    position: 'absolute'
}

NavBar.propTypes = {
    color: PropTypes.string,
    position: PropTypes.string,
};

export default NavBar;