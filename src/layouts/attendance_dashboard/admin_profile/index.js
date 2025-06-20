import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Tooltip
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  Lock, 
  Person, 
  Email, 
  Phone, 
  Edit, 
  LocationOn 
} from "@mui/icons-material";
import { axiosPrivate } from "api/axios";
import { useNavigate } from "react-router-dom";

const AdminProfile = ({ onClose }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    user_photo: null,
    address: '',
    processed_by:''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [editMode, setEditMode] = useState({
    personalInfo: false,
    password: false
  });
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: ""
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('employee');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setUserData({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            contact_number: user.contact_number || '',
            user_photo: user.user_photo || null,
            address: user.address || '',
            processed_by: user.processed_by
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        showAlert("Failed to load user data", "error");
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleClickShowPassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        showAlert('Please upload an image (JPEG, PNG, GIF)', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showAlert('Image size should be less than 2MB', 'error');
        return;
      }
      
      setUserData(prev => ({
        ...prev,
        user_photo: file
      }));
    }
  };

  const showAlert = (message, severity = "warning") => {
    setAlert({ open: true, severity, message });
    setTimeout(() => setAlert(prev => ({ ...prev, open: false })), 7000);
  };

 const handleSavePersonalInfo = async () => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('first_name', userData.first_name);
      formData.append('last_name', userData.last_name);
      formData.append('email', userData.email);
      formData.append('contact_number', userData.contact_number);
      formData.append('address', userData.address);
      formData.append('processed_by', userData.processed_by);

      if (userData.user_photo instanceof File) {
        formData.append('user_photo', userData.user_photo);
      }

      const response = await axiosPrivate.patch(
        `/attendance/employees/${currentUser.id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const updatedUser = {
        ...currentUser,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        contact_number: userData.contact_number,
        address: userData.address,
        user_photo: response.data.user_photo || currentUser.user_photo
      };
      
      localStorage.setItem('employee', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

    showAlert('Profile updated successfully!', 'success');
    setTimeout(() => {
      onClose();
    }, 1000); 
      
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || 
                         Object.values(error.response?.data || {}).flat().join(' ') || 
                         'Failed to update profile';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

 const handleChangePassword = async () => {
    // Frontend validation (passwords match, length >= 8)
    if (passwordData.new_password !== passwordData.confirm_password) {
        showAlert("Passwords don't match!", "error");
        return;
    }
    if (passwordData.new_password.length < 8) {
        showAlert("Password must be 8+ characters", "error");
        return;
    }

    try {
        setLoading(true);
        const employee = JSON.parse(localStorage.getItem('employee'));
        
        const response = await axiosPrivate.post(
            `attendance/change-password/${employee.id}/`,  
            {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
                confirm_password: passwordData.confirm_password
            }
        );

        showAlert("Password changed successfully! Please login again.", "success");

        localStorage.removeItem('employee');
        setPasswordData({
            current_password: '',
            new_password: '',
            confirm_password: ''
        });
        setTimeout(() => {
            navigate('/authentication/sign-in');
        }, 2000); 
        
    } catch (error) {
        const errorMsg = error.response?.data?.error || 
                        error.response?.data?.current_password?.[0] || 
                        "Failed to change password";
        showAlert(errorMsg, "error");
    } finally {
        setLoading(false);
    }
  };

  if (loading && !currentUser) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading user profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Personal Information Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" color="primary" component="h2">
            <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
            Personal Information
          </Typography>
          <Box>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ mr: 2 }}
            >
              Close
            </Button>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setEditMode(prev => ({ ...prev, personalInfo: !prev.personalInfo }))}
              disabled={editMode.password}
            >
              {editMode.personalInfo ? 'Cancel' : 'Edit'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar
            alt={`${userData.first_name} ${userData.last_name}`}
            {...(userData.user_photo
              ? {
                  src:
                    userData.user_photo instanceof File
                      ? URL.createObjectURL(userData.user_photo)
                      : userData.user_photo,
                }
              : {})}
            sx={{ width: 120, height: 120, mb: 2 }}
          >
            {(userData.first_name || userData.last_name) &&
              `${(userData.first_name?.[0] || '')}${(userData.last_name?.[0] || '')}`.toUpperCase()}
        </Avatar>
            {editMode.personalInfo && (
              <Button 
                variant="contained" 
                component="label"
                sx={{ color: 'white !important' }}
              >
                Upload Photo
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
            )}
          </Grid>
          <Grid item xs={12} sm={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={userData.first_name}
                  onChange={handlePersonalInfoChange}
                  disabled={!editMode.personalInfo}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={userData.last_name}
                  onChange={handlePersonalInfoChange}
                  disabled={!editMode.personalInfo}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={userData.address}
                  onChange={handlePersonalInfoChange}
                  disabled={!editMode.personalInfo}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={userData.email}
                  onChange={handlePersonalInfoChange}
                  disabled={!editMode.personalInfo}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contact_number"
                  value={userData.contact_number}
                  onChange={handlePersonalInfoChange}
                  disabled={!editMode.personalInfo}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {editMode.personalInfo && (
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSavePersonalInfo}
                    disabled={loading}
                    sx={{ color: 'white !important' }}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Password Change Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" color="primary" component="h2">
            <Lock sx={{ verticalAlign: 'middle', mr: 1 }} />
            Password Settings
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditMode(prev => ({ ...prev, password: !prev.password }))}
            disabled={editMode.personalInfo}
          >
            {editMode.password ? 'Cancel' : 'Change Password'}
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {editMode.password ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="current-password">Current Password</InputLabel>
                <OutlinedInput
                  id="current-password"
                  name="current_password"
                  type={showPassword.current ? 'text' : 'password'}
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleClickShowPassword('current')}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword.current ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Current Password"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="new-password">New Password</InputLabel>
                <OutlinedInput
                  id="new-password"
                  name="new_password"
                  type={showPassword.new ? 'text' : 'password'}
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleClickShowPassword('new')}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="New Password"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="confirm-password">Confirm New Password</InputLabel>
                <OutlinedInput
                  id="confirm-password"
                  name="confirm_password"
                  type={showPassword.confirm ? 'text' : 'password'}
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleClickShowPassword('confirm')}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Confirm New Password"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleChangePassword}
                disabled={loading}
                sx={{ color: 'white !important' }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="h5" color="black">
            Do not forget to change your password.
          </Typography>
        )}
      </Box>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlert(prev => ({ ...prev, open: false }))} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProfile;