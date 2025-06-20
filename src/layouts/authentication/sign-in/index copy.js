import { useState, useRef, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/E20_logo.jpg";
import axios from "api/axios";
import useAuth from "hooks/useAuth";
import { useSnackbar } from "notistack";
import { Divider, Icon, IconButton, Modal, Paper, TextField } from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { dataService } from "global/function";

function Basic() {
  const [rememberMe, setRememberMe] = useState(false);
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
  
  // Google Sign-In State
  const [googleLoginPending, setGoogleLoginPending] = useState(false);
  
  // Terms & Conditions Modal State
  const [openTermsModal, setOpenTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const termsModalRef = useRef(null);
  const [hasScrollbar, setHasScrollbar] = useState(false);

  // Reset scroll state when modal opens
  useEffect(() => {
    if (openTermsModal) {
      setScrolledToBottom(false);
      if (termsModalRef.current) {
        termsModalRef.current.scrollTop = 0;
      }
    }
  }, [openTermsModal]);

  // Handle terms acceptance
  useEffect(() => {
    if (termsAccepted && openTermsModal) {
      handleAcceptTerms();
    }
  }, [termsAccepted, openTermsModal]);

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

   const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // First try careers login
      // try {
      //   const careersResponse = await axios.post('entity/login',
      //     {
      //       username: user,
      //       password: pwd
      //     },
      //     {
      //       headers: { 'Content-Type': 'application/json' },
      //       withCredentials: true
      //     }
      //   );
        
      //   const accessToken = careersResponse?.data?.access;
      //   const data = jwtDecode(accessToken);
      //   const refreshToken = careersResponse?.data?.refresh;
      //   const is_admin = data['is_superuser'] || data['is_staff'] ? true : false;
        
      //   setAuth({
      //     accessToken: accessToken,
      //     is_admin: is_admin,
      //     id: data['entity_id']
      //   });
      //   setIsAuth(true);
      //   localStorage.setItem('refreshToken', refreshToken);
        
      //   setUser('');
      //   setPwd('');
        
      //   navigate(is_admin ? '/dashboard' : from, { replace: true });
      //   return;
      // } catch (careersError) {
      //   console.log('Careers login attempt failed:', careersError);
      // }
  
      // If careers login failed, try attendance login
      const attendanceResponse = await axios.post(
        "attendance/employee/login/",
        JSON.stringify({  
          email: user,   
          password: pwd,
        }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      const employee = attendanceResponse.data.employee;
      
      localStorage.setItem("employee", JSON.stringify({
        id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        time_in: employee.time_in,
        time_out: employee.time_out,
        is_admin: employee.is_admin,
        type: employee.type,
        work_arrangement: employee.work_arrangement,
        employment_type: employee.employment_type,
        contract_hours: employee.contract_hours,
        department: employee.department,
        team: employee.team,
        employment_type: employee.employment_type,
        status: employee.status,
        birthdate: employee.birthdate
      }));
      
      setAuth({
        is_admin: employee.is_admin,
        id: employee.id,
        authenticated: true
      });
      
      setIsAuth(true);
      setUser("");
      setPwd("");
      
      const isAdmin = employee.is_admin === 1 || 
                     employee.is_admin === true || 
                     employee.is_admin === "1";
      
      if (isAdmin) {
        navigate("/attendance/admin/dashboard", { replace: true });
      } else {
        navigate("/attendance/user", { replace: true });
      }
      
    } catch (error) {
      console.error("Both login attempts failed:", error);
      enqueueSnackbar('User does not exist', {
        variant: 'error',
        preventDuplicate: true,
        anchorOrigin: {
          horizontal: 'right',
          vertical: 'top',
        }
      });
    }
  }

  useEffect(() => {
    localStorage.setItem("persist", true);
  });

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setGoogleLoginPending(true);
    try {
      const jwtCredential = credentialResponse.credential;

      const response = await axios.post(process.env.REACT_APP_GOOGLE_CALLBACK_URI, {
        token: jwtCredential,
      });
      
      // Check if this is a new user
      if (response.data.is_new_user) {
        setPendingGoogleCredential(credentialResponse);
        setOpenTermsModal(true);
        return;
      }

      // Existing user flow
      const { access, refresh } = response.data;
      const { id, is_superuser, is_staff } = jwtDecode(access);
      const is_admin = is_superuser || is_staff;
      console.log(id, is_superuser, is_staff);
      setAuth({
        accessToken: access,
        is_admin: is_admin,
        id: id[0],
      });
      setIsAuth(true);
      localStorage.setItem('refreshToken', refresh);
      navigate(is_admin ? '/dashboard' : from, { replace: true });

    } catch (error) {
      console.log("Google login failed:", error);
      enqueueSnackbar('Google login failed. Please try again.', {
        variant: 'error',
        anchorOrigin: {
          horizontal: 'right',
          vertical: 'top',
        }
      });
    } finally {
      setGoogleLoginPending(false);
    }
  };

  const handleAcceptTerms = async () => {
    if (!pendingGoogleCredential || !termsAccepted) return;
    
    setGoogleLoginPending(true);
    try {
      const response = await axios.post(process.env.REACT_APP_GOOGLE_CALLBACK_URI, {
        token: pendingGoogleCredential.credential,
        accept_terms: true
      });
      
      const { access, refresh } = response.data;
      const { id, is_superuser, is_staff } = jwtDecode(access);
      const is_admin = is_superuser || is_staff;

      setAuth({
        accessToken: access,
        is_admin: is_admin,
        id: id[0],
      });
      setIsAuth(true);
      localStorage.setItem('refreshToken', refresh);
      navigate(is_admin ? '/dashboard' : from, { replace: true });
      
    } catch (error) {
      console.error("Error completing signup:", error);
      enqueueSnackbar('Error completing signup. Please try again.', {
        variant: 'error',
        anchorOrigin: {
          horizontal: 'right',
          vertical: 'top',
        }
      });
    } finally {
      setGoogleLoginPending(false);
      setOpenTermsModal(false);
      setPendingGoogleCredential(null);
      setTermsAccepted(false);
    }
  };

  const handleGoogleLoginError = () => {
    console.log("Google login failed");
    enqueueSnackbar('Google login failed', {
      variant: 'error',
      anchorOrigin: {
        horizontal: 'right',
        vertical: 'top',
      }
    });
  };

  const termsContent = (
    <MDBox mt={3}>
      <MDBox display="flex" justifyContent="center" mb={2}>
        <MDTypography variant="h4" fontWeight="bold" color="info" mt={-5}>
          Terms and Conditions 
        </MDTypography>
      </MDBox>

      <MDBox sx={{ fontSize: "1rem", lineHeight: 1.6, textAlign: "justify" }}>
        <MDTypography paragraph sx={{ fontSize: "1rem" }} mt={-3}>
          By submitting your application through this website, you agree to the following:
        </MDTypography>

        <MDTypography sx={{ ml: 2, fontSize: "1rem", fontWeight: "bold", mt: -2 }}>
          1. Purpose of Information
        </MDTypography>
        <MDBox component="ul" sx={{ pl: 3 }}>
          <MDBox component="li" sx={{ ml: 2, fontSize: "1rem" }}>
            The information you provide will be used solely for evaluating your qualifications
            and processing your job application.
          </MDBox>
          <MDBox component="li" sx={{ ml: 2, fontSize: "1rem" }}>
            Your data may also be used to contact you regarding your application status or
            related opportunities.
          </MDBox>
        </MDBox>

        <MDTypography sx={{ ml: 2, fontSize: "1rem", fontWeight: "bold" }}>
          2. Data Privacy
        </MDTypography>
        <MDBox component="ul" sx={{ pl: 3 }}>
          <MDBox component="li" sx={{ ml: 2, fontSize: "1rem" }}>
            We will handle your personal information in accordance with our Privacy Policy.
          </MDBox>
          <MDBox component="li" sx={{ ml: 2, fontSize: "1rem" }}>
            Your data will not be shared with third parties without your consent, except as
            required by law or for recruitment purposes.
          </MDBox>
        </MDBox>

        <MDTypography sx={{ ml: 2, fontSize: "1rem", fontWeight: "bold" }}>
          3. Accuracy of Information
        </MDTypography>
        <MDBox component="ul" sx={{ pl: 3 }}>
          <MDBox component="li" sx={{ ml: 2, fontSize: "1rem" }}>
            You are responsible for ensuring that the information you provide is accurate and
            truthful.
          </MDBox>
          <MDBox component="li" sx={{ ml: 2, fontSize: "1rem" }}>
            Providing false or misleading information may result in the rejection of your
            application.
          </MDBox>
        </MDBox>

        <MDTypography sx={{ ml: 2, fontSize: "1rem", fontWeight: "bold" }}>
          4. Update to Terms
        </MDTypography>
        <MDBox component="ul" sx={{ pl: 3 }}>
          <MDBox component="li" sx={{ ml: 2, fontSize: "1rem" }}>
            We may update these Terms and Conditions at any time. Changes will be posted
            on this page and will apply to future applications.
          </MDBox>
        </MDBox>

        <MDTypography sx={{ ml: 2, fontSize: "1rem", fontWeight: "bold" }}>
          5. Contact Us
        </MDTypography>
        <MDBox component="ul" sx={{ pl: 3 }}>
          <MDBox component="li" sx={{ ml: 2, fontSize: "1rem" }}>
            If you have any questions about these terms or how your information will be
            used, please contact us at:
          </MDBox>
          <MDBox component="li" sx={{ ml: 2, fontSize: "1rem" }}>
            Email Address: 
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=hr@eighty20virtual.com,careers@eighty20virtual.com&cc=recruitment@eighty20virtual.com&su=Applicant%20Inquiry&body=%0A%0A%0A"
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                fontSize: "1rem", 
                fontWeight: "bold", 
                textDecoration: "underline",  
                color: "#1a73e8"
              }}
            >
              &nbsp;hr@eighty20virtual.com
            </a>
          </MDBox>
          <MDBox component="li" sx={{ ml: 2, fontSize: "1rem" }}>
            Contact Number: 
            <MDTypography component="span" sx={{ fontSize: "1rem", fontWeight: "bold" }}>
            &nbsp;+639171658356
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </MDBox>
  );

  return (
    <BasicLayout image={bgImage}>
      <Card>
       <MDBox
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
              mx={2}
              mt={-3}
              p={2}
              mb={1}
              textAlign="center"
              sx={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "114%", 
                backgroundPosition: "center",
                height: "100px", 
                }}
        />
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDInput 
                type="text" 
                label="Email" 
                fullWidth
                id="email"
                ref={userRef}
                autoComplete="off"
                onChange={(e) => setUser(e.target.value)}
                value={user}
                required
               />
            </MDBox>
            <MDBox mb={2}>
              <MDInput 
                type={visible ? 'text' : 'password'} 
                label="Password" 
                fullWidth 
                id="password"
                onChange={(e) => setPwd(e.target.value)}
                value={pwd}
                required
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" onClick={() => setVisible(!visible)}>
                      <Icon>{visible ? 'visibility' : 'visibility_off'}</Icon>
                    </IconButton>
                  ),
                }}
              />
            </MDBox>
            <MDBox display="flex" justifyContent="space-between" ml={-1}>
              <MDBox display="flex" alignItems="center">
                <Switch checked={rememberMe} onChange={handleSetRememberMe} />
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color="text"
                  onClick={handleSetRememberMe}
                  sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                >
                  &nbsp;&nbsp;Remember me
                </MDTypography>
              </MDBox>
              <MDBox textAlign="center">
                <MDTypography
                  component={Link}
                  to="/authentication/reset-password"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Forgot password?
                </MDTypography>
              </MDBox>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton 
                variant="contained" 
                color="info" 
                fullWidth 
                onClick={handleSubmit} 
                sx={{
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: "0.875rem", 
                  fontWeight: "regular", 
                  textTransform: "none", 
                  gap: 1.5, 
                  py: 1.2, 
                  borderRadius: "8px",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)",
                  "&:hover": {
                    backgroundColor: "#0179b6", 
                    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)", 
                    color: "#000", 
                  }
                }}
              >
                <Icon sx={{ fontSize: "1.5rem"}}>person_add</Icon>                  
                Sign in
              </MDButton>
            </MDBox>
            <MDBox my={1} display='flex' justifyContent='center'>
              <MDTypography variant='button'>or</MDTypography>
            </MDBox>
            
            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
              <MDBox mb={2}>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  useOneTap
                  render={({ onClick }) => (
                    <MDButton 
                      variant="outlined" 
                      color="secondary" 
                      startIcon={<GoogleIcon />}
                      onClick={onClick}
                      fullWidth
                      disabled={googleLoginPending}
                      sx={{
                        backgroundColor: 'white',
                        color: 'rgba(0, 0, 0, 0.54)',
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                      }}
                    >
                      {googleLoginPending ? 'Signing in...' : 'Sign in with Google'}
                    </MDButton>
                  )}
                />
              </MDBox>
            </GoogleOAuthProvider>

            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="body2">
                Don&apos;t have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="body2"
                  color="error"
                  textGradient
                  sx={{ fontWeight: '400' }}
                >
                  REGISTER HERE
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>

      {/* Terms and Conditions Modal */}
      <Modal open={openTermsModal} onClose={() => setOpenTermsModal(false)}>
        <Paper
          ref={termsModalRef}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "85%", sm: "70%", md: "60%", lg: "50%" },
            maxWidth: "600px",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 0,
            borderRadius: 2,
            maxHeight: "65vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Scrollable content */}
          <MDBox
            sx={{
              overflowY: "auto",
              flexGrow: 1,
              p: 3,
              scrollbarWidth: 'thin',
              scrollbarColor: '#888 #f1f1f1',
              '&::-webkit-scrollbar': {
                width: '15px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '10px',
                border: '2px solid #f1f1f1',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
              },
              '&::-webkit-scrollbar-button': {
                display: 'block',
                height: '15px',
                backgroundColor: '#f1f1f1',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%23888' d='M0 2l4 4 4-4H0z'/%3E%3C/svg%3E")`
              },
              '&::-webkit-scrollbar-button:vertical:decrement': {
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%23888' d='M0 6l4-4 4 4H0z'/%3E%3C/svg%3E")`
              }
            }}
            ref={(el) => {
              if (el) {
                const hasScrollbar = el.scrollHeight > el.clientHeight;
                setHasScrollbar(hasScrollbar);
                if (!hasScrollbar) {
                  setScrolledToBottom(true);
                }
              }
            }}
            onScroll={(e) => {
              const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
              const bottom = scrollHeight - scrollTop <= clientHeight + 5;
              setScrolledToBottom(bottom);
            }}
          >
            {termsContent}
          </MDBox>

          {/* Checkbox section - fixed at bottom */}
          <MDBox 
            sx={{
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              zIndex: 1,
              boxShadow: '0 -2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Checkbox
              checked={termsAccepted}
              onChange={() => {
                if ((scrolledToBottom || !hasScrollbar) && !termsAccepted) {
                  setTermsAccepted(true);
                }
                else if (termsAccepted) {
                  setTermsAccepted(false);
                }
              }}
              sx={{ 
                p: 0.5,
                mr: 1,
                color: termsAccepted ? 'primary.main' : 'action.active',
                '&.Mui-checked': {
                  color: 'primary.main',
                },
              }}
            />
            <MDTypography 
              variant="button"
              sx={{ 
                cursor: 'pointer',
                userSelect: 'none',
                color: termsAccepted ? 'primary.main' : 'text.primary',
                fontSize: '1rem',
                fontWeight: termsAccepted ? 'bold' : 'regular',
              }}
              onClick={() => {
                if ((scrolledToBottom || !hasScrollbar) && !termsAccepted) {
                  setTermsAccepted(true);
                }
                else if (termsAccepted) {
                  setTermsAccepted(false);
                }
              }}
            >
              I agree to the Terms and Conditions
            </MDTypography>
          </MDBox>
        </Paper>
      </Modal>
    </BasicLayout>
  );
}

export default Basic;