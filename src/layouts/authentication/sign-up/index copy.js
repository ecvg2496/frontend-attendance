import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import bgImage from "assets/images/E20_logo.jpg";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import { TextField, Icon, IconButton } from "@mui/material";
import { dataService } from "global/function";
import { useSnackbar } from "notistack";
import { useTheme, useMediaQuery } from "@mui/material";

function Cover() {
    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm_password, setConfirmPassword] = useState('');
    const [visiblePass, setVisiblePass] = useState(false);
    const [visibleConfPass, setVisibleConfPass] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [scrolledToBottom, setScrolledToBottom] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const paperRef = useRef(null);
    const [content, setContent] = useState(null);
    const [hasScrollbar, setHasScrollbar] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        if (open) {
            setScrolledToBottom(false);
            if (paperRef.current) {
                paperRef.current.scrollTop = 0;
            }
        }
    }, [open]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.length) {
            enqueueSnackbar(`Email field is blank`, {
                variant: 'error',
                anchorOrigin: {
                    horizontal: 'right',
                    vertical: 'top',
                }
            });
            return;
        } else if (!password.length) {
            enqueueSnackbar(`Password field is blank`, {
                variant: 'error',
                anchorOrigin: {
                    horizontal: 'right',
                    vertical: 'top',
                }
            });
            return;
        } else if (!confirm_password.length) {
            enqueueSnackbar(`Confirm Password is blank`, {
                variant: 'error',
                anchorOrigin: {
                    horizontal: 'right',
                    vertical: 'top',
                }
            });
            return;
        } else if (!agreed) {
            enqueueSnackbar(`You must agree to the Terms and Conditions`, {
                variant: 'error',
                anchorOrigin: {
                    horizontal: 'right',
                    vertical: 'top',
                }
            });
            return;
        }
    
        dataService('POST', 'entity/register', {
            username: username,
            password: password,
            confirm_password: confirm_password,
        }).then((result) => {
            enqueueSnackbar('User successfully created', {
                variant: 'success',
                preventDuplicate: true,
                anchorOrigin: {
                    horizontal: 'right',
                    vertical: 'top',
                }
            });
            navigate(from, { replace: true });
        }, (err) => {
            const error = err.response.data;
            if (typeof error === 'object') {
                if ('password' in error) {
                    Object.keys(error.password).forEach((item) => {
                        enqueueSnackbar(error.password[item], {
                            variant: 'error',
                            preventDuplicate: true,
                            anchorOrigin: {
                                horizontal: 'right',
                                vertical: 'top',
                            }
                        });
                    });
                } else if ('Authentication' in error) {
                    enqueueSnackbar(error.Authentication[0], {
                        variant: 'error',
                        preventDuplicate: true,
                        anchorOrigin: {
                            horizontal: 'right',
                            vertical: 'top',
                        }
                    });
                }
            } else {
                enqueueSnackbar(`Username already exists`, {
                    variant: 'error',
                    preventDuplicate: true,
                    anchorOrigin: {
                        horizontal: 'right',
                        vertical: 'top',
                    }
                });
            }
        });
    };

    const termslogin = (
    <MDBox mt={isMobile ? 0.5 : 1}>
    <MDBox display="flex" justifyContent="center" mb={isMobile ? 0.5 : 1}>
      <MDTypography 
        variant="h4" 
        fontWeight="bold" 
        color="info" 
        sx={{ 
          fontSize: isMobile ? "1.1rem" : "1.3rem",
          lineHeight: 1.2
        }}
      >
        Terms and Conditions 
      </MDTypography>
    </MDBox>

    <MDBox sx={{ 
      lineHeight: 1.4, 
      textAlign: "justify",
      fontSize: isMobile ? "0.8rem" : "0.9rem"
    }}>
      <MDTypography paragraph sx={{ 
        fontSize: "inherit",
        mb: isMobile ? 1 : 1.5 
      }}>
        By submitting your application through this website, you agree to the following:
      </MDTypography>

      {/* Section 1 */}
      <MDTypography sx={{ 
        fontSize: "inherit",
        fontWeight: "bold",
        mb: 0.5
      }}>
        1. Purpose of Information
      </MDTypography>
      <MDBox component="ul" sx={{ 
        pl: 2.5,
        mt: 0,
        mb: isMobile ? 1 : 1.5,
        '& li': {
          mb: 0.25
        }
      }}>
        <MDBox component="li" sx={{ fontSize: "inherit" }}>
          The information you provide will be used solely for evaluating your qualifications and processing your job application.
        </MDBox>
        <MDBox component="li" sx={{ fontSize: "inherit" }}>
          Your data may also be used to contact you regarding your application status or related opportunities.
        </MDBox>
      </MDBox>

      {/* Section 2 */}
      <MDTypography sx={{ 
        fontSize: "inherit",
        fontWeight: "bold",
        mb: 0.5
      }}>
        2. Data Privacy
      </MDTypography>
      <MDBox component="ul" sx={{ 
        pl: 2.5,
        mt: 0,
        mb: isMobile ? 1 : 1.5,
        '& li': {
          mb: 0.25
        }
      }}>
        <MDBox component="li" sx={{ fontSize: "inherit" }}>
          We will handle your personal information in accordance with our Privacy Policy.
        </MDBox>
        <MDBox component="li" sx={{ fontSize: "inherit" }}>
          Your data will not be shared with third parties without your consent, except as required by law or for recruitment purposes.
        </MDBox>
      </MDBox>

      {/* Section 3 */}
      <MDTypography sx={{ 
        fontSize: "inherit",
        fontWeight: "bold",
        mb: 0.5
      }}>
        3. Accuracy of Information
      </MDTypography>
      <MDBox component="ul" sx={{ 
        pl: 2.5,
        mt: 0,
        mb: isMobile ? 1 : 1.5,
        '& li': {
          mb: 0.25
        }
      }}>
        <MDBox component="li" sx={{ fontSize: "inherit" }}>
          You are responsible for ensuring that the information you provide is accurate and truthful.
        </MDBox>
        <MDBox component="li" sx={{ fontSize: "inherit" }}>
          Providing false or misleading information may result in the rejection of your application.
        </MDBox>
      </MDBox>

      {/* Section 4 */}
      <MDTypography sx={{ 
        fontSize: "inherit",
        fontWeight: "bold",
        mb: 0.5
      }}>
        4. Update to Terms
      </MDTypography>
      <MDBox component="ul" sx={{ 
        pl: 2.5,
        mt: 0,
        mb: isMobile ? 1 : 1.5,
        '& li': {
          mb: 0.25
        }
      }}>
        <MDBox component="li" sx={{ fontSize: "inherit" }}>
          We may update these Terms and Conditions at any time. Changes will be posted on this page and will apply to future applications.
        </MDBox>
      </MDBox>

      {/* Section 5 */}
      <MDTypography sx={{ 
        fontSize: "inherit",
        fontWeight: "bold",
        mb: 0.5
      }}>
        5. Contact Us
      </MDTypography>
      <MDBox component="ul" sx={{ 
        pl: 2.5,
        mt: 0,
        mb: 0,
        '& li': {
          mb: 0.25
        }
      }}>
        <MDBox component="li" sx={{ fontSize: "inherit" }}>
          If you have any questions about these terms or how your information will be used, please contact us at:
        </MDBox>
        <MDBox component="li" sx={{ fontSize: "inherit" }}>
          Email Address: 
          <a 
            href="https://mail.google.com/mail/?view=cm&fs=1&to=hr@eighty20virtual.com,careers@eighty20virtual.com&cc=recruitment@eighty20virtual.com&su=Applicant%20Inquiry&body=%0A%0A%0A"
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              fontSize: "inherit", 
              fontWeight: "bold", 
              textDecoration: "underline",  
              color: "#1a73e8",
              marginLeft: "4px"
            }}
          >
            hr@eighty20virtual.com
          </a>
        </MDBox>
        <MDBox component="li" sx={{ fontSize: "inherit" }}>
          Contact Number: 
          <MDTypography component="span" sx={{ 
            fontSize: "inherit", 
            fontWeight: "bold",
            marginLeft: "4px"
          }}>
            +639171658356
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
                        {/* Form fields remain unchanged */}
                        <MDBox mb={2}>
                            <TextField 
                                onChange={(e) => setUsername(e.target.value)} 
                                value={username} 
                                type="text" 
                                label="Email" 
                                variant="standard" 
                                fullWidth 
                                autoComplete="off" 
                            />
                        </MDBox>
                        <MDBox mb={2}>
                            <TextField 
                                onChange={(e) => setPassword(e.target.value)} 
                                value={password} 
                                type={visiblePass ? 'text' : "password"}
                                label="Password" 
                                variant="standard" 
                                fullWidth 
                                InputProps={{
                                    endAdornment: (
                                        <IconButton size="small" onClick={() => setVisiblePass(!visiblePass)}>
                                            <Icon>{visiblePass ? 'visibility' : 'visibility_off'}</Icon>
                                        </IconButton>
                                    ),
                                    autoComplete: 'new-password'
                                }}
                            />
                        </MDBox>
                        <MDBox mb={2}>
                            <TextField 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                value={confirm_password} 
                                type={visibleConfPass ? 'text' : "password"}
                                label="Confirm Password" 
                                variant="standard" 
                                fullWidth 
                                InputProps={{
                                    endAdornment: (
                                        <IconButton size="small" onClick={() => setVisibleConfPass(!visibleConfPass)}>
                                            <Icon>{visibleConfPass ? 'visibility' : 'visibility_off'}</Icon>
                                        </IconButton>
                                    ),
                                }}
                            />
                        </MDBox>
                        <MDBox display="flex" alignItems="center" ml={-1}>
                            <Checkbox 
                                checked={agreed}
                                onChange={(e) => {
                                    e.preventDefault();
                                    setContent(termslogin);
                                    setOpen(true);
                                }}
                                required 
                            />
                            <MDTypography
                                variant="button"
                                fontWeight="regular"
                                color="text"
                                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setContent(termslogin);
                                    setOpen(true);
                                }}
                            >
                                &nbsp;&nbsp;I agree to the&nbsp;
                            </MDTypography>
                            <MDTypography
                                component="a"
                                href="#"
                                variant="button"
                                fontWeight="bold"
                                color="info"
                                textGradient
                                onClick={(e) => {
                                    e.preventDefault();
                                    setContent(termslogin);
                                    setOpen(true);
                                }}
                            >
                                Terms and Conditions
                            </MDTypography>
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
                                <MDTypography variant="button" fontWeight="regular" color="inherit">
                                    Sign Up
                                </MDTypography>
                            </MDButton>
                        </MDBox>
                        <MDBox mt={3} mb={1} textAlign="center" position="relative" zIndex={1}>
                            <MDTypography variant="body2">
                                Already have an account?{" "}
                                <MDTypography
                                    component={Link}
                                    to="/authentication/sign-in"
                                    variant="body2"
                                    sx={{
                                        color: 'primary.main',
                                        fontWeight: 400,
                                        textDecoration: "none",
                                        padding: '2px 4px',
                                        display: 'inline-block',
                                        position: 'relative',
                                        zIndex: 2,
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    LOG IN HERE
                                </MDTypography>
                            </MDTypography>
                        </MDBox>
                    </MDBox>
                </MDBox>
            </Card>

            <Modal open={open} onClose={() => setOpen(false)}>
                <Paper
                    ref={paperRef}
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: isMobile ? "90%" : { sm: "70%", md: "60%", lg: "50%" },
                        maxWidth: "600px",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 0,
                        borderRadius: 2,
                        maxHeight: isMobile ? "80vh" : "65vh",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <MDBox
                        sx={{
                            overflowY: "auto",
                            flexGrow: 1,
                            p: isMobile ? 1.5 : 3,
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
                        {termslogin}
                    </MDBox>

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
                            checked={agreed}
                            onChange={() => {
                                if ((scrolledToBottom || !hasScrollbar) && !agreed) {
                                    setAgreed(true);
                                    setOpen(false);
                                }
                                else if (agreed) {
                                    setOpen(false);
                                }
                            }}
                            sx={{ 
                                p: 0.5,
                                mr: 1,
                                color: agreed ? 'primary.main' : 'action.active',
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
                                color: agreed ? 'primary.main' : 'text.primary',
                                fontSize: isMobile ? '0.875rem' : '1rem',
                                fontWeight: agreed ? 'bold' : 'regular',
                            }}
                            onClick={() => {
                                if ((scrolledToBottom || !hasScrollbar) && !agreed) {
                                    setAgreed(true);
                                    setOpen(false);
                                }
                                else if (agreed) {
                                    setOpen(false);
                                }
                            }}
                        >
                            {agreed ? "I agree to the Terms and Conditions" : "I agree to the Terms and Conditions"}
                        </MDTypography>
                    </MDBox>
                </Paper>
            </Modal>
        </BasicLayout>
    );
}

export default Cover;