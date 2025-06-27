import React, { useState, useRef, useEffect } from "react";
import {
  Grid, Icon, Button, Tabs, Tab, Modal, Box, Typography, Card, IconButton, Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from 'api/axios';
import { axiosPrivate } from "api/axios";
import { dataServicePrivate, dataService, formatDateTime } from "global/function";
// Material Dashboard components
import MDBox from "components/MDBox";
import SideBar from "./content_page/sidebar";
import DynamicForm from "./content_page/dynamicForm";
import employeeFormConfig from "./dynamic_value/employee_info";
import { Snackbar} from '@mui/material';

// Import components
import AllEmployeeTable from "./components/employees/AllEmployeeTable";
import HiredCandidatesTable from "./components/employees/HiredCandidatesTable";
import ProbationEmployeeTable from "./components/employees/ProbationEmployeeTable";
import ResignedEmployeeTable from "./components/employees/ResignedEmployeeTable";
import TrainingEmployeeTable from "./components/employees/TrainingEmployeeTable";
import FloatingEmployeeTable from "./components/employees/FloatingEmployeeTable";
import TabPanel from "./components/employees/TabPanel";

// Import utils
import {
  getInitialFormData,
  formatTimeForDisplay,
  formatTimeToHHMM,
  calculateAge
} from "./components/utils/employeeUtils";
import AlphabetFilter from "./components/employees/AlphabetFilter";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: "80vh",
  overflowY: "auto",
};

function AttendanceDashboard() {
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());
  const [alert, setAlert] = useState({ open: false, severity: "info", message: "" });
  const alertRef = useRef(null);
  const timeoutRef = useRef(null);
  const [employee, setEmployee] = useState(null);
  const isAdmin = () => {
      const employeeData = localStorage.getItem("employee");
      if (employeeData) {
        const employee = JSON.parse(employeeData);
        return employee.is_admin === 1 || employee.is_admin === true || employee.is_admin === "1";
      }
      return false;
    };
  
    // Redirect if not admin
    // useEffect(() => {
    //   if (!isAdmin()) {
    //     navigate('/authentication/sign-in/');
    //   } 
    // }, [navigate]);
    
  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosPrivate.get('attendance/employees/');
        setAllEmployees(response.data);
        filterEmployees(0, response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
      const storedEmployee = localStorage.getItem('employee');
      if (storedEmployee) {
        const emp = JSON.parse(storedEmployee);
        setEmployee(emp);
        console.log(setEmployee(emp));
      }
    }, []);

  // Filter employees based on selected tab
  const filterEmployees = (tabIndex, employees = allEmployees) => {
    let filtered = [];
    switch(tabIndex) {
      case 0: filtered = employees; break;
      case 1: filtered = employees.filter(emp => emp.status === "Newly Hired"); break;
      case 2: filtered = employees.filter(emp => emp.status === "Probation"); break;
      case 3: filtered = employees.filter(emp => emp.status === "Resigned"); break;
      case 4: filtered = employees.filter(emp => emp.status === "Training"); break;
      case 5: filtered = employees.filter(emp => emp.status === "Floating"); break;
      default: filtered = employees;
    }
    setFilteredEmployees(filtered);
  };

  // Update filtered employees when tab changes
  useEffect(() => {
    filterEmployees(selectedTab);
  }, [selectedTab, allEmployees]);

  const handleAddClick = () => {
    setFormData(getInitialFormData());
    setIsEditing(false);
    setCurrentEmployeeId(null);
    setOpenModal(true);
  };
  const getPhilippineTime = () => {
    const options = {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    const now = new Date();
    const formatted = now.toLocaleString('en-US', options);
    return formatted.replace(',', ' at');
  };
  
  const handleEditClick = (employeeOrCandidate) => {
    if (employeeOrCandidate.entity) {
      // This is a hired candidate - treat as new employee
      const candidate = employeeOrCandidate;
      const [firstName, ...lastNameParts] = candidate.entity?.full_name?.split(' ') || [];
      const lastName = lastNameParts.join(' ') || '';
      
      setFormData({
        first_name: firstName || '',
        last_name: lastName || '',
        email: candidate.entity?.email || '',
        // All other fields empty
        middle_name: '',
        birthdate: '',
        type: '',
        work_arrangement: '',
        position: '',
        department: '',
        team: '',
        contract_hours: '',
        position: '',
        status: '',
        time_in: '',
        time_out: '',
        hourly_rate: '',
        daily_rate: '',
        password: "temp_password",
        processed_by:''
      });
      setIsEditing(false);
      setCurrentEmployeeId(null);
    } else {
      // This is an existing employee
      const formattedEmployee = {
        ...employeeOrCandidate,
        time_in: formatTimeForDisplay(employeeOrCandidate.time_in),
        time_out: formatTimeForDisplay(employeeOrCandidate.time_out)
      };
      setFormData(getInitialFormData(formattedEmployee));
      setCurrentEmployeeId(employeeOrCandidate.id);
      setIsEditing(true);
    }
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setIsEditing(false);
    setCurrentEmployeeId(null);
    setFormData(getInitialFormData());
  };

  const handleClear = () => {
    setFormData(getInitialFormData());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "birthdate") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        age: calculateAge(value),
      }));
      return;
    }

    if (["hourly_rate", "daily_rate", "contract_hours"].includes(name)) {
      if (!/^\d*(\.\d{0,2})?$/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  function getManilaTimeISOString() {
  const now = new Date();
  const manilaOffset = 8 * 60 * 60 * 1000; // Manila is UTC+8
  return new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + manilaOffset).toISOString();
  }
  useEffect(() => {
    if (formData.type === "Full Time") {
      setFormData(prev => ({ ...prev, contract_hours: "9" }));
    }
  }, [formData.type]);

  useEffect(() => {
    if (formData.time_in && formData.contract_hours) {
      const timeIn = new Date(`1970-01-01T${formData.time_in}:00`);
      const contractHours = parseFloat(formData.contract_hours);

      if (!isNaN(contractHours)) {
        const timeOut = new Date(timeIn.getTime() + contractHours * 60 * 60 * 1000);
        const timeOutString = timeOut.toTimeString().slice(0, 5);
        setFormData(prev => ({ ...prev, time_out: timeOutString }));
      }
    }
  }, [formData.time_in, formData.contract_hours]);

  // Auto-calculate daily rate
  useEffect(() => {
    if (formData.contract_hours && formData.hourly_rate) {
      const contractHours = parseFloat(formData.contract_hours);
      const hourlyRate = parseFloat(formData.hourly_rate);
  
      if (!isNaN(contractHours) && !isNaN(hourlyRate)) {
        const dailyRate = contractHours * hourlyRate;
        setFormData(prev => ({ ...prev, daily_rate: dailyRate.toFixed(2) }));
      }
    } else {
      setFormData(prev => ({ ...prev, daily_rate: "" }));
    }
    }, [formData.contract_hours, formData.hourly_rate]);

    const handleStatusChange = async (employeeId, newStatus) => {
      try {
        setLoading(true);
        
        const currentEmployee = JSON.parse(localStorage.getItem('employee'));
        if (!currentEmployee) {
          throw new Error('No employee data found');
        }

        const processedBy = `${currentEmployee.first_name} ${currentEmployee.last_name}`;
        const processedAt = getManilaTimeISOString();
        
        const updateData = {
          status: newStatus,
          processed_by: processedBy,
          processed_at: processedAt,
          ...(newStatus === 'Resigned' && { date_resignation: processedAt }),
        };

        const response = await dataServicePrivate(
          'PATCH', 
          `attendance/employees/${employeeId}/`, 
          updateData,
          { headers: { "Content-Type": "application/json" } }
        );
        
        // Update local state
        setAllEmployees(prev => prev.map(emp => 
          emp.id === employeeId ? { 
            ...emp, 
            status: newStatus,
            processed_by: processedBy,
            processed_at: processedAt,
            ...(newStatus === 'Resigned' && { 
              date_resignation: processedAt,
              formatted_date_resignation: new Date(processedAt).toLocaleString('en-US', {
                timeZone: 'Asia/Manila',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })
            }),
            formatted_processed_at: new Date(processedAt).toLocaleString('en-US', {
              timeZone: 'Asia/Manila',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
          } : emp
        ));
        
        filterEmployees(selectedTab);
        
        showAlert('Status updated successfully!', 'success');
        

      } catch (error) {
        console.error('Status update error:', error);
        showAlert(error.response?.data?.message || 'Failed to update status', 'error');
      } finally {
        setLoading(false);
      }
    };

    const handleEmploymentTypeChange = async (employeeId, newEmploymentType) => {
      try {
        setLoading(true);
        
        const currentEmployee = JSON.parse(localStorage.getItem('employee'));
        if (!currentEmployee) {
          throw new Error('No employee data found');
        }

        const processedBy = `${currentEmployee.first_name} ${currentEmployee.last_name}`;
        const processedAt = getManilaTimeISOString();
        
        // Prepare update data
        const updateData = {
          employment_type: newEmploymentType,
          processed_by: processedBy,
          processed_at: processedAt,
        };

        // Add regular date if employment type is being changed to Regular
        if (newEmploymentType === 'Regular') {
          updateData.date_regular = processedAt;
        }

       const response = await dataServicePrivate(
          'PATCH', 
          `attendance/employees/${employeeId}/`, 
          updateData,
          { headers: { "Content-Type": "application/json" } } // or "multipart/form-data"
        );
        
        // Update local state
        setAllEmployees(prev => prev.map(emp => 
          emp.id === employeeId ? { 
            ...emp, 
            employment_type: newEmploymentType,
            processed_by: processedBy,
            processed_at: processedAt,
            // Add regular date if employment type is Regular
            ...(newEmploymentType === 'Regular' && { 
              date_regular: processedAt,
              formatted_date_regular: new Date(processedAt).toLocaleString('en-US', {
                timeZone: 'Asia/Manila',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })
            }),
            // Add formatted processed_at for display
            formatted_processed_at: new Date(processedAt).toLocaleString('en-US', {
              timeZone: 'Asia/Manila',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
          } : emp
        ));
        
        filterEmployees(selectedTab);
        
        showAlert('Employment type updated successfully!', 'success');
      } catch (error) {
        console.error('Employment type update error:', error);
        showAlert(error.response?.data?.message || 'Failed to update employment type', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    const handleEmployeeTypeChange = async (employeeId, newEmployeeType) => {
    try {
      setLoading(true);
      
      const currentEmployee = JSON.parse(localStorage.getItem('employee'));
      if (!currentEmployee) {
        throw new Error('No employee data found');
      }

      const processedBy = `${currentEmployee.first_name} ${currentEmployee.last_name}`;
      const processedAt = getManilaTimeISOString();
      
      // Prepare update data
      const updateData = {
        type: newEmployeeType,
        processed_by: processedBy,
        processed_at: processedAt,
      };

      const response = await axios.patch(
        `/attendance/employees/${employeeId}/`,
        updateData
      );
      
      // Update local state
      setAllEmployees(prev => prev.map(emp => 
        emp.id === employeeId ? { 
          ...emp, 
          type: newEmployeeType,
          processed_by: processedBy,
          processed_at: processedAt,
          // Add formatted processed_at for display
          formatted_processed_at: new Date(processedAt).toLocaleString('en-US', {
            timeZone: 'Asia/Manila',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        } : emp
      ));
      
      filterEmployees(selectedTab);
      
      showAlert('Employee type updated successfully!', 'success');
    } catch (error) {
      console.error('Employee type update error:', error);
      showAlert(error.response?.data?.message || 'Failed to update employee type', 'error');
    } finally {
      setLoading(false);
    }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get current employee data from localStorage
    const currentEmployee = JSON.parse(localStorage.getItem('employee'));
    if (!currentEmployee) {
      showAlert('No employee data found. Please log in again.', 'error');
      return;
    }

    const processedBy = `${currentEmployee.first_name} ${currentEmployee.last_name}`;
    const processedAt = getManilaTimeISOString();

    // Validation patterns
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^[0-9]{11}$/;
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
    // Enhanced validation rules
    const validations = [
      [!formData.last_name, "Please fill out last name."],
      [formData.last_name?.trim().length < 2, "Last name should have at least 2 letters."],
      [!formData.first_name, "Please fill out first name."],
      [formData.first_name?.trim().length < 2, "First name should have at least 2 letters."],
      [!formData.middle_name, "Please fill out middle name."],
      [formData.middle_name?.trim().length < 2, "Middle Name name should have at least 2 letters."],
      [!formData.email, "Please fill out email."],
      [!emailPattern.test(formData.email), "Invalid email address."],
      [!formData.contact_number, "Please fill out contact number."],
      [!phonePattern.test(formData.contact_number), "Contact number must be 11 digits."],
      [!formData.address, "Please fill out address."],
      [formData.address?.trim().length < 5, "Address should be at least 5 characters."],
      [!formData.employment_date, "Please select employment date."],
      [!formData.birthdate, "Please select a birthdate."],
      [!formData.type, "Please select a job type."],
      [!formData.work_arrangement, "Please select a work arrangement."],
      [!formData.department, "Please select a department."],
      [!formData.position, "Please select a position."],
      [!formData.team, "Please select a team."],
      [!formData.contract_hours, "Please input contract hours."],
      [isNaN(Number(formData.contract_hours)), "Contract hours must be a number."],
      [Number(formData.contract_hours) < 4 && formData.type === "Part Time", "Part-time contract hours must be at least 4."],
      [Number(formData.contract_hours) > 8 && formData.type === "Part Time", "Part-time contract hours maximum is 8."],
      [Number(formData.contract_hours) > 9, "Contract hours maximum is 9."],
      [!formData.status, "Please select an employment status."],
      [!formData.time_in, "Please select a time-in."],
      [!formData.time_out, "Please select a time-out."],
      [formData.user_photo instanceof File && formData.user_photo.size > 2 * 1024 * 1024, "User photo cannot exceed 2MB."],
      [formData.user_photo instanceof File && !imageTypes.includes(formData.user_photo.type), "User photo must be in JPEG, PNG, or GIF format."],
    ];
  
    // Execute validations and collect all errors
    const errors = validations
      .filter(([condition]) => condition)
      .map(([_, message]) => message);
  
    if (errors.length > 0) {
      showAlert(errors[0], "error");
      return;
    }
  
    try {
      const formDataToSend = new FormData();
      
      // Append all fields except user_photo first
      const fieldsToAppend = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        middle_name: formData.middle_name.trim(),
        email: formData.email.trim(),
        contact_number: formData.contact_number,
        address: formData.address,
        position: formData.position,
        employment_date: formData.employment_date,
        birthdate: formData.birthdate,
        type: formData.type,
        employment_type: formData.employment_type,
        work_arrangement: formData.work_arrangement,
        department: formData.department,
        team: formData.team,
        contract_hours: Number(formData.contract_hours),
        status: formData.status,
        time_in: formatTimeToHHMM(formData.time_in),
        time_out: formatTimeToHHMM(formData.time_out),
        hourly_rate: Number(formData.hourly_rate),
        daily_rate: Number(formData.daily_rate),
        processed_by: processedBy, 
        processed_at: processedAt, 
      };
  
      Object.entries(fieldsToAppend).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });
  
      // Handle file upload separately
      if (formData.user_photo) {
        if (formData.user_photo instanceof File) {
          formDataToSend.append('user_photo', formData.user_photo);
        } else if (typeof formData.user_photo === 'string') {
          // If it's a string (existing photo URL), we might want to handle it differently
          // or skip it if we don't want to modify the existing photo
        }
      }
  
      if (!isEditing) {
        formDataToSend.append('password', 'temp_password');
      }
  
      // Enhanced API configuration
      const config = {
        method: isEditing ? 'put' : 'post',
        url: isEditing 
          ? `/attendance/employees/${currentEmployeeId}/`
          : "/attendance/define/",
        data: formDataToSend,
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 seconds timeout
      };
  
      // Execute API call with loading state
      setLoading(true);
      const response = await axios(config);
  
      // Handle success
      showAlert(`Employee ${isEditing ? 'updated' : 'added'} successfully!`, "success");
      
      // Refresh data
      const refreshData = async () => {
        try {
          const { data: employees } = await dataServicePrivate('GET', 'attendance/employees/');
          setAllEmployees(employees);
          filterEmployees(selectedTab, employees);
  
          if (!isEditing && selectedTab === 1) {
            await axiosPrivate.post("hr/careers/entity/all", {
              relations: ["careers", "platforms", "tags", { entity: { relations: ["details"] } }],
              order: { target: "created_at", value: "desc" },
            });
          }
        } catch (refreshError) {
          console.error("Refresh error:", refreshError);
        }
      };
  
      await refreshData();
      handleModalClose();
  
    } catch (error) {
      console.error("Submission error:", error);
      
      let errorMessage = `Failed to ${isEditing ? 'update' : 'create'} employee record.`;
      
      if (error.response) {
        // Handle specific backend errors
        if (error.response.data?.user_photo) {
          errorMessage = error.response.data.user_photo.join(' ');
        } else if (error.response.data?.email) {
          errorMessage = `Email error: ${error.response.data.email.join(' ')}`;
        } else if (error.response.data?.non_field_errors) {
          errorMessage = error.response.data.non_field_errors.join(' ');
        } else {
          errorMessage = error.response.data?.message || 
                       error.response.data?.error || 
                       errorMessage;
        }
      } else if (error.request) {
        errorMessage = "No response received from server. Please try again.";
      }
  
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        showAlert('Please upload an image (JPEG, PNG, GIF)', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showAlert('Image size should be less than 2MB', 'error');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        user_photo: file
      }));
    }
  };

  const showAlert = (message, severity = "warning") => {
    setAlert({ open: true, severity, message });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAlert(prev => ({ ...prev, open: false })), 7000);
  };

  const handleTabChange = (event, newValue) => setSelectedTab(newValue);

  return (
    <SideBar>
      <MDBox pt={6} pb={3} mt={-15}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card sx={{minHeight: 'calc(104vh - 64px)'}}>
              <MDBox p={3}>
                <Tabs 
                  value={selectedTab} 
                  onChange={handleTabChange} 
                  aria-label="employee tabs" 
                  sx={{
                    backgroundColor: 'primary.main', 
                    '& .MuiTab-root': {
                      color: 'white !important',
                      fontSize: '0.9rem',
                      minWidth: 'unset',
                      padding: '8px 16px',
                    },
                    '& .Mui-selected': {
                      backgroundColor: 'primary.dark', 
                      color: 'white', 
                    },
                    mb: 2
                  }}
                >
                  <Tab label="Employee" />
                  <Tab label="Newly Hired" />
                  <Tab label= "Probation" />
                  <Tab label="Resigned" />
                  <Tab label="Training" />
                  <Tab label="Floating" />
                </Tabs>
  
                <Box sx={{ 
                  width: '100%',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {selectedTab === 0 && (
                    <TabPanel>
                      <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                        Employee Records
                      </Typography>
                      <Box sx={{
                        width: '100%',
                        overflowX: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        '& .container': {
                          minWidth: '100%',
                          margin: 0,
                          padding: 0
                        },
                        '& .responsive-table': {
                          minWidth: '100%', 
                          width: '100%'
                        }
                      }}>
                      <AllEmployeeTable 
                        employees={filteredEmployees}
                        loading={loading}
                        error={error}
                        onEditClick={handleEditClick}
                        onStatusChange={handleStatusChange}
                        onEmploymentTypeChange={handleEmploymentTypeChange}
                        onEmployeeTypeChange={handleEmployeeTypeChange} // Add this
                      />
                      </Box>
                    </TabPanel>
                  )}
                  {selectedTab === 1 && (
                    <TabPanel>
                      <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                        Newly Hired Employees
                      </Typography>
                      <Box sx={{
                        width: '100%',
                        overflowX: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        '& .container': {
                          minWidth: '100%',
                          margin: 0,  
                          padding: 0
                        },
                        '& .responsive-table': {
                          minWidth: '100%',
                          width: '100%'
                        }
                      }}>
                        <HiredCandidatesTable onEditClick={handleEditClick} />
                      </Box>
                    </TabPanel>
                  )}
                  {selectedTab === 2 && (
                    <TabPanel>
                      <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                       Probation Employees
                      </Typography>
                      <Box sx={{
                        width: '100%',
                        overflowX: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        '& .container': {
                          minWidth: '100%',
                          margin: 0,  
                          padding: 0
                        },
                        '& .responsive-table': {
                          minWidth: '100%',
                          width: '100%'
                        }
                      }}>
                        <ProbationEmployeeTable 
                          employees={filteredEmployees} 
                          loading={loading} 
                          error={error} 
                          onEditClick={handleEditClick}
                          onStatusChange={handleStatusChange} />
                      </Box>
                    </TabPanel>
                  )}
                  {selectedTab === 3 && (
                    <TabPanel>
                      <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                        Resigned Employees
                      </Typography>
                      <Box sx={{
                        width: '100%',
                        overflowX: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        '& .container': {
                          minWidth: '100%',
                          margin: 0,
                          padding: 0
                        },
                        '& .responsive-table': {
                          minWidth: '100%',
                          width: '100%'
                        }
                      }}>
                        <ResignedEmployeeTable
                         employees={filteredEmployees}
                         loading={loading}     
                         error={error}         
                         onEditClick={handleEditClick}
                         onStatusChange={handleStatusChange}  />
                      </Box>
                    </TabPanel>
                  )}
                  {selectedTab === 4 && ( <TabPanel>
                      <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                        Training Employees
                      </Typography>
                      <Box sx={{
                        width: '100%',
                        overflowX: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        '& .container': {
                          minWidth: '100%',
                          margin: 0,
                          padding: 0
                        },
                        '& .responsive-table': {
                          minWidth: '100%',
                          width: '100%'
                        }
                      }}>
                        <TrainingEmployeeTable
                         employees={filteredEmployees}
                         loading={loading}     
                         error={error}         
                         onEditClick={handleEditClick}
                         onStatusChange = {handleStatusChange} />
                      </Box>
                    </TabPanel>)}
                  {selectedTab === 5 && ( <TabPanel>
                    <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                        Floating Employees
                      </Typography>
                      <Box sx={{
                        width: '100%',
                        overflowX: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        '& .container': {
                          minWidth: '100%',
                          margin: 0,
                          padding: 0
                        },
                        '& .responsive-table': {
                          minWidth: '100%',
                          width: '100%'
                        }
                      }}>
                        <FloatingEmployeeTable
                         employees={filteredEmployees}
                         loading={loading}     
                         error={error}         
                         onEditClick={handleEditClick}
                         onStatusChange={handleStatusChange} />
                      </Box>
                  </TabPanel>)}
                </Box>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
  
      {/* Floating Add Button */}
      <Button
        variant="contained"
        color="primary"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          borderRadius: "50%",
          width: 56,
          height: 56,
          boxShadow: 3,
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: 4
          },
          transition: 'all 0.2s ease'
        }}
        onClick={handleAddClick}
      >
        <Icon sx={{ color: "white !important" }}>add</Icon>
      </Button>
  
      {/* Modal for Adding/Editing Employees */}
      <Modal 
        open={openModal} 
        onClose={handleModalClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{
          ...modalStyle,
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          {formData.user_photo && (
            <div style={{ margin: '16px 0' }}>
              <Typography variant="subtitle2" gutterBottom>
                {isEditing ? 'Current Photo' : 'Uploaded Photo'}
              </Typography>
              {typeof formData.user_photo === 'string' ? (
                <img 
                  src={formData.user_photo} 
                  alt="Employee" 
                  style={{ 
                    maxWidth: '150px', 
                    maxHeight: '150px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
              ) : formData.user_photo instanceof File ? (
                <Typography variant="body2">
                  New photo selected: {formData.user_photo.name}
                </Typography>
              ) : null}
            </div>
          )}
          {/* Close Button */}
          <IconButton
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "text.secondary",
              "&:hover": {
                backgroundColor: 'action.hover',
                color: "text.primary",
              },
            }}
            onClick={handleModalClose}
          >
            <Icon>close</Icon>
          </IconButton>
  
          {/* Modal Title */}
          <Typography variant="h5" color="primary" gutterBottom sx={{ 
            textAlign: "center",
            fontWeight: 600,
            pt: 1
          }}>
            {isEditing ? 'Edit Employee' : 'Add New Employee'}
          </Typography>
  
          {/* Alert */}
          {alert.open && (
            <Alert
              severity={alert.severity}
              onClose={() => setAlert({ ...alert, open: false })}
              sx={{ 
                mb: 2,
                mx: 2
              }}
              ref={alertRef}
            >
              {alert.message}
            </Alert>
          )}
  
          {/* Dynamic Form */}
          <DynamicForm
            formConfig={employeeFormConfig}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            handleClear={handleClear}
            handleFileChange={handleFileChange}
          />
        </Box>
      </Modal>
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
    </SideBar>
  );
}

export default AttendanceDashboard;