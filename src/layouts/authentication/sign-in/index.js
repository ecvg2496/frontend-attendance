/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import { useState, useRef, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import axios from "api/axios";
import useAuth from "hooks/useAuth";
import { useSnackbar } from "notistack";
import { Divider, Icon, IconButton } from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { dataService } from "global/function";

// Import your company logo (replace with your actual logo path)
import CompanyLogo from "assets/images/E20_logo.jpg";

function Basic() {
  const [rememberMe, setRememberMe] = useState(false);
  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const { auth, setAuth, persist, setPersist, setIsAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const userRef = useRef('');
  const errRef = useRef('');

  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [visible, setVisible] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const attendanceResponse = await axios.post(
        "attendance/employee/login/",
        JSON.stringify({ email: user, password: pwd }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const employee = attendanceResponse.data.employee;
      localStorage.setItem("employee", JSON.stringify(employee));
      setAuth({
        is_admin: employee.is_admin,
        id: employee.id,
        authenticated: true,
      });
      setIsAuth(true);
      setUser("");
      setPwd("");
      const isAdmin = employee.is_admin === true || employee.is_admin === 1 || employee.is_admin === "1";
      navigate(isAdmin ? "/attendance/admin/dashboard" : "/attendance/user", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      enqueueSnackbar('User does not exist or password is incorrect', {
        variant: 'error',
        preventDuplicate: true,
        anchorOrigin: {
          horizontal: 'right',
          vertical: 'top',
        }
      });
    }
  };

  useEffect(() => {
    localStorage.setItem("persist", true);
  });

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const jwtCredential = credentialResponse.credential;
      const response = await axios.post(process.env.REACT_APP_GOOGLE_CALLBACK_URI, {
        token: jwtCredential,
      });
      const { access, refresh, user, entity } = response.data;
      const { id, is_superuser, is_staff } = jwtDecode(access)
      const is_admin = is_superuser || is_staff
      setAuth({
        accessToken: access,
        is_admin: is_admin,
        id: id[0],
      });
      setIsAuth(true);
      localStorage.setItem('refreshToken', refresh)
      navigate(is_admin ? '/dashboard' : from, { replace: true });
    } catch (error) {
      console.log("Google login failed:", error);
    }
  };

  return (
    <BasicLayout>
      {/* Watermark */}
      <MDBox
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          opacity: 0.5,
          '&:hover': { opacity: 0.8 }
        }}
      >
      </MDBox>

      <Card sx={{
        backgroundColor: '#36393f',
        color: '#dcddde',
        maxWidth: '480px',
        width: '100%',
        borderRadius: '5px',
        boxShadow: '0 2px 10px 0 rgba(0,0,0,.2)',
        padding: '32px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Company Logo */}
        <MDBox textAlign="center">
          <MDBox
            component="img"
            src={CompanyLogo}
            alt="Company Logo"
            sx={{
              maxHeight: '80px',
              maxWidth: '100%',
            }}
          />
          {/* <MDTypography variant="h3" fontWeight="medium" color="white" mb={1}>
            Welcome back!
          </MDTypography> */}
        </MDBox>

        <MDBox component="form" role="form">
          <MDBox mb={1}>
            <MDTypography variant="caption" color="white" fontWeight="bold" mb={0.5}>
              EMAIL
            </MDTypography>
            <MDInput 
              type="text" 
              fullWidth
              id="email"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              value={user}
              required
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
              sx={{
                backgroundColor: '#303339',
                borderColor: '#222428',
                color: '#dcddde',
                '& .MuiInputBase-input': {
                  color: '#dcddde',
                  padding: '10px',
                  height: '20px'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#222428',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#040405',
                },
              }}
            />
          </MDBox>
          
          <MDBox mb={1}>
            <MDTypography variant="caption" color="white" fontWeight="bold" mb={0.5}>
              PASSWORD
            </MDTypography>
            <MDInput 
              type={visible ? 'text' : 'password'} 
              fullWidth 
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
              sx={{
                backgroundColor: '#303339',
                borderColor: '#222428',
                color: '#dcddde',
                '& .MuiInputBase-input': {
                  color: '#dcddde',
                  padding: '10px',
                  height: '20px'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#222428',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#040405',
                },
              }}
              InputProps={{
                endAdornment: (
                  <IconButton 
                    size="small" 
                    onClick={() => setVisible(!visible)}
                    sx={{ color: '#b9bbbe' }}
                  >
                    <Icon>{visible ? 'visibility' : 'visibility_off'}</Icon>
                  </IconButton>
                ),
              }}
            />
          </MDBox>

          <MDBox mb={1}>
            <MDTypography
              component={Link}
              to="/authentication/reset-password"
              variant="caption"
              color="white"
              fontWeight="medium"
              sx={{ 
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Forgot your password?
            </MDTypography>
          </MDBox>

          <MDBox mt={2} mb={1}>
            <MDButton 
              variant="gradient" 
              color="info" 
              fullWidth 
              onClick={handleSubmit}
              sx={{
                backgroundColor: '#5865f2',
                color: 'white',
                height: '44px',
                fontSize: '16px',
                fontWeight: '500',
                '&:hover': {
                  backgroundColor: '#4752c4',
                },
                '&:disabled': {
                  backgroundColor: '#5865f2',
                  opacity: 0.5,
                  color: 'white',
                }
              }}
            >
              Login
            </MDButton>
          </MDBox>

          <MDBox display="flex" alignItems="center" my={2}>
            <Divider sx={{ flexGrow: 1, backgroundColor: '#72767d' }} />
            <MDTypography variant="caption" color="white" mx={1}>OR</MDTypography>
            <Divider sx={{ flexGrow: 1, backgroundColor: '#72767d' }} />
          </MDBox>

          <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.log("Login Failed");
              }}
              useOneTap
              flow="auth-code"
              theme="filled_blue"
              shape="pill"
              size="large"
              text="continue_with"
              width="100%"
            />
          </GoogleOAuthProvider>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;