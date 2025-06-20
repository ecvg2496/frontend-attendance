import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  FormControlLabel, 
  Icon, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Switch,
  Tooltip 
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import useAuth from "hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { dataServicePrivate, formatDateTime } from "global/function";
import moment from "moment";
import EducationalAttainmentForm from "./education";
import { useSnackbar } from "notistack";
import { useMaterialUIController, setDialog } from "context";
import elemData from './elemData';

function Educational({ update }) {
  const [controller, dispatch] = useMaterialUIController()
  const { dialog } = controller
  // Navigation and state setup
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { auth } = useAuth();
  
  // Education data state
  const [education, setEducation] = useState([]);
  const [elem, setElem] = useState(null);
  const [high, setHigh] = useState(null);
  const [senior, setSenior] = useState(null);
  const [tech, setTech] = useState(null);
  const [college, setCollege] = useState(null);
  const [master, setMaster] = useState(null);
  
  // Dialog states
  const [deleteState, setDeleteState] = useState({ 
    id: null, 
    open: false, 
    level: null 
  });
  const [eduState, setEduState] = useState({ 
    id: null, 
    open: false, 
    education: null, 
    end_date: null 
  });
  
  // Draft and not applicable states
  const [drafts, setDrafts] = useState({
    elem: null,
    high: null,
    senior: null,
    tech: null,
    college: null,
    master: null
  });
  const [notApplicableLevels, setNotApplicableLevels] = useState({});
 
  const entity_id = auth['id'];
  const [pendingDeletions, setPendingDeletions] = useState([]);

  // Initial data fetch
  useEffect(() => {
    init();
  }, []);

  const init = () => {
    dataServicePrivate('POST', 'entity/education/all', {
      filter: [{ 
        operator: '=', 
        target: 'entity_id', 
        value: entity_id 
      }],
    }).then((result) => {
      const educationData = result.data['entity_education'];
      setEducation(educationData);
      setAttainment(educationData);
    }).catch(err => {
      console.error('Error fetching education data:', err);
    });
  };
  
  const snackBar = (title, variant = 'success') => {
    enqueueSnackbar(title, { 
      variant,
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'right'
      }
    });
  };

  const setAttainment = (data) => {
    data.forEach(entry => {
      const eduType = entry.education;
      
      switch(eduType) {
        case 'Elementary':
          setElem(entry);
          break;
        case 'Secondary (High School)':
          setHigh(entry);
          break;
        case 'Senior High School':
          setSenior(entry);
          break;
        case 'Vocational & Technical Education':
          setTech(entry);
          break;
        case 'College':
          setCollege(entry);
          break;
        case "Graduate School (Master's or Doctorate)":
          setMaster(entry);
          break;
        default:
          break;
      }
    });
  };
  const handleDelete = async (id, level) => {
    try {
      await dataServicePrivate('POST', 'entity/education/delete', { id });
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      snackBar('Failed to delete education record', 'error');
      throw err;
    }
  };
  const saveEducation = (data) => {
    return dataServicePrivate('POST', 'entity/education/define', data);
  };

  const validateElementaryDuration = (elemData) => {
    if (!elemData) return true;
    
    // If present or undergrad is true, skip duration validation
    if (elemData.present || elemData.undergrad) return true;
    
    const endDate = elemData.end_date;
    if (!endDate) {
      snackBar("Elementary education must have an end date", 'error');
      return false;
    }
    
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    let error = false;
    let errorMessage = "";
    const getEffectiveData = (levelKey) => drafts[levelKey] || 
      (levelKey === 'elem' ? elem :
       levelKey === 'high' ? high :
       levelKey === 'senior' ? senior :
       levelKey === 'tech' ? tech :
       levelKey === 'college' ? college :
       levelKey === 'master' ? master : null);
  
    // Get effective data for all levels
    const effectiveElem = getEffectiveData('elem');
    const effectiveHigh = getEffectiveData('high');
    const effectiveSenior = getEffectiveData('senior');
    const effectiveTech = getEffectiveData('tech');
    const effectiveCollege = getEffectiveData('college');
    const effectiveMaster = getEffectiveData('master');
  
    // Validate required fields
    if (!effectiveElem && !notApplicableLevels.elem) {
      snackBar("Elementary education is required", 'error');
      return;
    }
    if (!effectiveHigh && !notApplicableLevels.high) {
      snackBar("High School education is required", 'error');
      return;
    }
    // If Master's/Doctor's exist while College is Undergraduate or Presently Enrolled
    if (effectiveMaster) {
      if (effectiveCollege?.undergrad) {
        errorMessage = "Cannot have Graduate School while College is marked as Undergraduate";
        error = true;
      }
      else if (effectiveCollege?.present) {
        errorMessage = "Cannot have Graduate School while College is still in progress (Present)";
        error = true;
      }
      else if (!effectiveCollege?.end_date) {
        errorMessage = "Cannot have Graduate School without completed College education";
        error = true;
      }
    }
    if (effectiveMaster && !isCollegeCompleted(effectiveCollege)) {
      errorMessage = "Cannot have Graduate School without completed College education";
      error = true;
    }
  
    // Validate prerequisite education level for draft and database
    if (effectiveCollege && !effectiveHigh) {
      errorMessage = "Cannot have College without High School";
      error = true;
    }
    if (effectiveMaster && !effectiveCollege) {
      errorMessage = "Cannot have Graduate School without College";
      error = true;
    }
    if (effectiveTech && !effectiveHigh) {
      errorMessage = "Cannot have Vocational without High School";
      error = true;
    }
    if (effectiveSenior && !effectiveHigh) {
      errorMessage = "Cannot have Senior High without High School";
      error = true;
    }
  
    // Validate elementary duration if present
    if (effectiveElem && !validateElementaryDuration(effectiveElem)) {
      return;
    }
  
    // Validate education sequence
    if (effectiveElem?.end_date && effectiveHigh?.end_date) {
      const elemYear = moment(effectiveElem.end_date).year();
      const highYear = moment(effectiveHigh.end_date).year();
      if (highYear - elemYear < 4) {
        errorMessage = `Elementary (${elemYear}) to High School (${highYear}) must have at least 4 years gap`;
        error = true;
      }
    }
  
    if (effectiveHigh?.end_date && effectiveSenior?.end_date) {
      const highYear = moment(effectiveHigh.end_date).year();
      const seniorYear = moment(effectiveSenior.end_date).year();
      if (seniorYear - highYear < 2) {
        errorMessage = `High School (${highYear}) to Senior High (${seniorYear}) must have at least 2 years gap`;
        error = true;
      }
    }
  
    // Updated: Senior High and Vocational must have at least 1 year gap
    if (effectiveSenior?.end_date && effectiveTech?.end_date) {
      const seniorYear = moment(effectiveSenior.end_date).year();
      const techYear = moment(effectiveTech.end_date).year();
      if (techYear - seniorYear < 1) {
        errorMessage = `Senior High (${seniorYear}) to Vocational (${techYear}) must have at least 1 year gap`;
        error = true;
      }
    }
  
    if (!effectiveSenior?.end_date && effectiveTech?.end_date && effectiveHigh?.end_date) {
      const highYear = moment(effectiveHigh.end_date).year();
      const techYear = moment(effectiveTech.end_date).year();
      if (techYear - highYear < 1) {
        errorMessage = `High School (${highYear}) to Vocational (${techYear}) must have at least 1 year gap`;
        error = true;
      }
    }
  
    if (effectiveHigh?.end_date && effectiveTech?.start_date) {
      const highYear = moment(effectiveHigh.end_date).year();
      const techYear = moment(effectiveTech.start_date).year();
      if (techYear < highYear) {
        errorMessage = `Vocational start (${techYear}) cannot be before High School graduation (${highYear})`;
        error = true;
      }
    }
  
    if (effectiveSenior?.end_date && effectiveCollege?.start_date) {
      const seniorYear = moment(effectiveSenior.end_date).year();
      const collegeYear = moment(effectiveCollege.start_date).year();
      if (collegeYear < seniorYear) {
        errorMessage = `College start (${collegeYear}) cannot be before Senior High graduation (${seniorYear})`;
        error = true;
      }
    }
  
    if (effectiveTech?.end_date && effectiveCollege?.start_date) {
      const techYear = moment(effectiveTech.end_date).year();
      const collegeYear = moment(effectiveCollege.start_date).year();
      if (collegeYear < techYear) {
        errorMessage = `College start (${collegeYear}) cannot be before Vocational graduation (${techYear})`;
        error = true;
      }
    }
  
    if (effectiveCollege?.start_date && effectiveHigh?.end_date) {
      const collegeYear = moment(effectiveCollege.start_date).year();
      const highYear = moment(effectiveHigh.end_date).year();
      if (collegeYear < highYear) {
        errorMessage = `College start (${collegeYear}) cannot be before High School graduation (${highYear})`;
        error = true;
      }
    }
  
    if (effectiveMaster?.start_date && effectiveCollege?.end_date) {
      const masterYear = moment(effectiveMaster.start_date).year();
      const collegeYear = moment(effectiveCollege.end_date).year();
      if (masterYear < collegeYear) {
        errorMessage = `Graduate School start (${masterYear}) cannot be before College graduation (${collegeYear})`;
        error = true;
      }
    }
  
    if (error) {
      snackBar(errorMessage, 'error');
      return;
    }
  
    // Rest of the save logic remains the same...
    try {
      const savePromises = [];
      const deletePromises = [];
      
      // Process pending deletions
      pendingDeletions.forEach(({ id, level }) => {
        deletePromises.push(handleDelete(id, level));
      });
      
      // Process not applicable levels
      Object.entries(notApplicableLevels).forEach(([levelKey, isNotApplicable]) => {
        if (isNotApplicable) {
          const data = getEffectiveData(levelKey);
          if (data?.id) {
            deletePromises.push(handleDelete(data.id, attainmentFromKey(levelKey)));
          }
          setDrafts(prev => ({ ...prev, [levelKey]: null }));
        }
      });
      
      // Save all drafts that aren't marked as not applicable
      Object.entries(drafts).forEach(([levelKey, draft]) => {
        if (draft && !notApplicableLevels[levelKey]) {
          savePromises.push(saveEducation(draft));
        }
      });
  
      await Promise.all([...savePromises, ...deletePromises]);
      
      // Clear pending deletions after successful save
      setPendingDeletions([]);
      
      snackBar("All changes saved successfully");
      // Reset all states
      setDrafts({
        elem: null,
        high: null,
        senior: null,
        tech: null,
        college: null,
        master: null
      });
      setNotApplicableLevels({});
      init();
      update();
      setDialog(dispatch, { ...dialog, open: false });
    } catch (err) {
      console.error("Error saving education data:", err);
      snackBar("Error saving education data", 'error');
    }
  };
  const handleManualDelete = (id, level) => {
    if (!id && drafts[levelKey]) {
      setDrafts(prev => ({ ...prev, [levelKey]: null }));
      snackBar(`Draft removed`);
      return;
    }
    
    // Add to pending deletions instead of deleting immediately
    setPendingDeletions(prev => [...prev, { id, level }]);
    
    // Clear the data from state (but not from database yet)
    const levelKey = attainmentToKey(level);
    const stateSetters = {
      'elem': setElem,
      'high': setHigh,
      'senior': setSenior,
      'tech': setTech,
      'college': setCollege,
      'master': setMaster
    };
    
    if (stateSetters[levelKey]) {
      stateSetters[levelKey](null);
    }
    
    // Also remove from education array
    setEducation(prev => prev.filter(edu => edu.id !== id));
    
    // snackBar(`${level} marked for deletion. Changes will be saved when you click "Save All Changes"`);
  };
  const openDeleteHandle = (id, level) => {
    setDeleteState({
      open: true,
      id,
      level,
    });
  };

  const closeDeleteHandle = () => {
    setDeleteState({...deleteState, open: false});
  };

  const openEduHandle = (id = null, attainment = null, end_date = null) => {
    const levelKey = attainmentToKey(attainment);
    const draftData = drafts[levelKey];
    const existingData = 
      attainment === 'Elementary' ? elem :
      attainment === 'Secondary (High School)' ? high :
      attainment === 'Senior High School' ? senior :
      attainment === 'Vocational & Technical Education' ? tech :
      attainment === 'College' ? college :
      attainment === "Graduate School (Master's or Doctorate)" ? master : null;
  
    // Use draft data if available, otherwise use existing data
    const currentData = draftData || existingData || {
      education: attainment,
      entity_id: entity_id,
      isNew: true
    };
  
    setEduState({
      open: true,
      id,
      education: attainment,
      end_date,
      isEditing: id !== null || draftData !== null,
      currentData
    });
  };

  const closeEduHandle = () => {
    setEduState({...eduState, open: false});
  };

  const deleteHandle = (id = null, level = null) => {
    const educationHierarchy = [
      "Elementary",
      "Secondary (High School)",
      "Senior High School",
      "Vocational & Technical Education",
      "College",
      "Graduate School (Master's or Doctorate)"
    ];
    
    const deleteIndex = educationHierarchy.indexOf(level);
    
    for (let i = deleteIndex + 1; i < educationHierarchy.length; i++) {
      const higherLevel = educationHierarchy[i];
      const higherLevelKey = attainmentToKey(higherLevel);
      
      if ((higherLevelKey === 'elem' && (elem || drafts.elem)) ||
          (higherLevelKey === 'high' && (high || drafts.high)) ||
          (higherLevelKey === 'senior' && (senior || drafts.senior)) ||
          (higherLevelKey === 'tech' && (tech || drafts.tech)) ||
          (higherLevelKey === 'college' && (college || drafts.college)) ||
          (higherLevelKey === 'master' && (master || drafts.master))) {
        
        snackBar(`You cannot delete ${level} because a higher level exists: ${higherLevel}.`, 'error');
        return;
      }
    }
    
    openDeleteHandle(id, level);
  };

  const handleDraftChange = (values, attainment) => {
    const levelKey = attainmentToKey(attainment);
    
    // Update the draft state
    setDrafts(prev => ({
      ...prev,
      [levelKey]: values
    }));
    
    // Special handling for college updates
    if (levelKey === 'college') {
      // If college is now incomplete, clear any master's data
      if ((values.present || values.undergrad || !values.end_date) && (master || drafts.master)) {
        setDrafts(prev => ({ ...prev, master: null }));
        if (master?.id) {
          setPendingDeletions(prev => [...prev, { 
            id: master.id, 
            level: "Graduate School (Master's or Doctorate)" 
          }]);
        }
      }
    }
  };

  const attainmentToKey = (attainment) => {
    switch(attainment) {
      case 'Elementary': return 'elem';
      case 'Secondary (High School)': return 'high';
      case 'Senior High School': return 'senior';
      case 'Vocational & Technical Education': return 'tech';
      case 'College': return 'college';
      case "Graduate School (Master's or Doctorate)": return 'master';
      default: return '';
    }
  };

  const attainmentFromKey = (key) => {
    switch(key) {
      case 'elem': return 'Elementary';
      case 'high': return 'Secondary (High School)';
      case 'senior': return 'Senior High School';
      case 'tech': return 'Vocational & Technical Education';
      case 'college': return 'College';
      case 'master': return "Graduate School (Master's or Doctorate)";
      default: return '';
    }
  };

  const EducationAttainment = ({ 
    attainment, 
    data, 
    required = false, 
    optional = false, 
    disabled = false, 
    end_date,
    notApplicableDisabled = false,
    notApplicableChecked = false,
    onNotApplicableChange = () => {},
    tooltip = ""
  }) => {
    const levelKey = attainmentToKey(attainment);
    const draftData = drafts[levelKey];
    const hasData = draftData || data;
    const [isDeleting, setIsDeleting] = useState(false);
    const displayData = draftData || data;
  
    const handleOptionChange = (e) => {
      const checked = e.target.checked;
      setNotApplicableLevels(prev => ({
        ...prev,
        [levelKey]: checked
      }));
      onNotApplicableChange(checked);
    };
  
    const handleManualDelete = (id, level) => {
      if (!id && drafts[levelKey]) {
        setDrafts(prev => ({ ...prev, [levelKey]: null }));
        snackBar(`Draft removed`);
        return;
      }
      deleteHandle(id, level);
    };
  
    return (
      <MDBox my={1}>
        <MDTypography variant="h5">{attainment}</MDTypography>
        
        {optional && (
          <Tooltip title={tooltip} placement="top">
            <FormControlLabel
              label="Not Applicable"
              sx={{ my: 1 }}
              control={
                <Switch
                  checked={notApplicableChecked || !!notApplicableLevels[levelKey]}
                  onChange={handleOptionChange}
                  // disabled={notApplicableDisabled || disabled || (required && hasData)}
                />
              }
            />
          </Tooltip>
        )}
        
        {(!notApplicableLevels[levelKey] || (required && hasData)) && (
          <>
            {displayData ? (
              <Card variant="outlined" sx={{ my: 2 }}>
                <MDBox display="flex" position="absolute" right={0} p={1}>
                  <Tooltip title="Edit">
                    <IconButton 
                      onClick={() => openEduHandle(displayData.id, attainment, end_date)}  
                      disabled={isDeleting}
                    >
                      <Icon color="primary">edit</Icon>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      onClick={() => handleManualDelete(displayData.id, attainment)}
                      disabled={isDeleting}
                    >
                      <Icon color="error">delete</Icon>
                    </IconButton>
                  </Tooltip>
                </MDBox>
                <CardContent>
                  <MDTypography variant="body2">School: {displayData.school}</MDTypography>
                  {displayData?.course && (
                    <MDTypography variant="body2">Course: {displayData.course}</MDTypography>
                  )}
                  <MDTypography variant="body2"> Year: &nbsp;
                    {['Elementary', 'Secondary (High School)', 'Senior High School', 'Vocational & Technical Education'].includes(attainment) ? 
                      (displayData.end_date ? formatDateTime(displayData.end_date, 'YYYY') : '') :
                      (displayData.start_date ? formatDateTime(displayData.start_date, 'YYYY') : '') +
                      (displayData.present ? ' to Present' :
                      displayData.undergrad ? ' - Undergraduate' :
                      displayData.end_date ? ` to ${formatDateTime(displayData.end_date, 'YYYY')}` : '')
                    }
                  </MDTypography>
                </CardContent>
              </Card>
            ) : (
              <Tooltip title={disabled ? tooltip : ""}>
                <div>
                  <MDButton
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    disabled={disabled}
                    startIcon={<Icon>add</Icon>}
                    onClick={() => openEduHandle(null, attainment, end_date)}
                    sx={{ 
                      borderColor: "secondary.main",
                      "&:hover": {
                        color: disabled ? "inherit" : "red",
                        borderColor: disabled ? "inherit" : "red",
                        "& .MuiSvgIcon-root": { color: disabled ? "inherit" : "red" }
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    <MDTypography variant="body2" color="inherit">
                      Add {attainment} Background
                    </MDTypography>
                  </MDButton>
                </div>
              </Tooltip>
            )}
          </>
        )}
        
        {required && !displayData && !notApplicableLevels[levelKey] && (
          <MDTypography color="error" variant="button">
            {attainment} is required
          </MDTypography>
        )}
      </MDBox>
    );
  };

  const isCollegeCompleted = (collegeData) => {
    const effectiveData = drafts.college || collegeData;
    
    if (!effectiveData) return false;
    return !effectiveData.present && 
           !effectiveData.undergrad && 
           effectiveData.end_date;
  };

  const getGraduateSchoolTooltip = (collegeData) => {
    if (!collegeData) return "College education is required first";
    if (collegeData.present) return "Cannot add Graduate School while College is marked as Present";
    if (collegeData.undergrad) return "Cannot add Graduate School while College is marked as Undergraduate";
    if (!collegeData.end_date) return "College must have an end date to add Graduate School";
    return "";
  };
  const getCollegeSchoolToolTip = (highData) => {
    if (!highData) return "Secondary (High School) education is required first";
    return "";
  }
  const getSeniorHighSchoolToolTip = (highData) => {
    if (!highData) return "Secondary (High School) education is required first";
    return "";
  }
  const getSecondaryHighSchoolToolTip = (elemData) => {
    if (!elemData) return "Secondary (High School) education is required first";
    return "";
  }
  return (
    <MDBox>
      {education?.length === 0 && !Object.values(drafts).some(draft => draft !== null) && (
        <MDTypography color="error" variant="h5" sx={{ my: 2, textAlign: "center" }}>
          No educational background found
        </MDTypography>
      )}
      
      <EducationAttainment 
        attainment='Elementary' 
        data={elem} 
        required 
      />
      <EducationAttainment 
        attainment='Secondary (High School)' 
        data={high} 
        required 
        disabled={!elem && !drafts.elem} 
        end_date={(elem || drafts.elem)?.end_date 
          ? moment((elem || drafts.elem).end_date).add(4, 'years').format('YYYY') 
          : undefined} 
        tooltip={getSecondaryHighSchoolToolTip(drafts.elem || elem)}
      />
      <EducationAttainment 
        attainment='Senior High School' 
        data={senior} 
        optional 
        disabled={!high && !drafts.high} 
        end_date={(high || drafts.high)?.end_date 
          ? moment((high || drafts.high).end_date).add(2, 'years').format('YYYY') 
          : undefined} 
        tooltip={getSeniorHighSchoolToolTip(drafts.high || high)}

      />
      <EducationAttainment 
        attainment='Vocational & Technical Education' 
        data={tech} 
        optional  
        disabled={!high && !drafts.high} 
        end_date={(senior || drafts.senior || high || drafts.high)?.end_date 
          ? moment((senior || drafts.senior || high || drafts.high).end_date).add(1, 'years').format('YYYY') 
          : undefined} 
        tooltip={getSeniorHighSchoolToolTip(drafts.high || high)}

      />
      <EducationAttainment 
        attainment='College' 
        data={college} 
        disabled={!high && !drafts.high} 
        end_date={(tech || drafts.tech || senior || drafts.senior || high || drafts.high)?.end_date 
          ? moment((tech || drafts.tech || senior || drafts.senior || high || drafts.high).end_date).format('YYYY') 
          : undefined}    
        tooltip={getCollegeSchoolToolTip(drafts.high|| high)}                     
      />
     <EducationAttainment 
        attainment="Graduate School (Master's or Doctorate)" 
        data={master} 
        optional 
        disabled={
          (!college && !drafts.college) || // No college record exists
          Boolean((drafts.college || college)?.undergrad) || // College is undergraduate
          Boolean((drafts.college || college)?.present) || // College is presently enrolled
          !isCollegeCompleted(college) // College is not properly completed
        }
        notApplicableDisabled={!isCollegeCompleted(college || drafts.college)}
        tooltip={getGraduateSchoolTooltip(drafts.college || college)}
        end_date={(drafts.college || college)?.end_date}
      />
      
      <Divider />
      
      <form onSubmit={handleSubmit}>
        <MDButton 
          sx={{ my: 1 }} 
          color='info' 
          fullWidth 
          type='submit' 
          // disabled={(!elem && !drafts.elem && !notApplicableLevels.elem) || (!high && !drafts.high && !notApplicableLevels.high)} 
          startIcon={<Icon>save</Icon>}
        >
          Save All Changes
        </MDButton>
      </form>

      {/* Delete Dialog */}
      <Dialog open={deleteState.open} onClose={closeDeleteHandle} fullWidth maxWidth="sm">
      <DialogTitle sx={{ padding: 0 }}>
              <MDBox
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#2E5B6F",
                  padding: "12px 20px",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                  position: "relative",
                }}
              >
                <MDTypography
                  variant="h6"
                  color="white"
                  sx={{
                    fontWeight: "600",
                    fontSize: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Icon sx={{ color: "#FF9800", fontSize: 30 }}>info</Icon>
                  Delete {deleteState.level || 'Education Record'}
                </MDTypography>
              </MDBox>
            </DialogTitle>
            <DialogContent>
              <MDBox p={2}>
                <MDTypography variant="body1" color="textSecondary">
                  Are you sure you want to delete this {deleteState.level?.toLowerCase() || 'education'} record? 
                  This action cannot be undone.
                </MDTypography>
              </MDBox>
            </DialogContent>
            <DialogActions>
            <MDBox p={2} display="flex" justifyContent="flex-end" gap={2}>
              <MDButton
                onClick={closeDeleteHandle}
                color="secondary"
                variant="outlined"
                sx={{
                  padding: "8px 16px",
                  borderColor: "#F44336",
                  color: "#F44336",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#FFC5C5",
                    borderColor: "#F44336",
                  },
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Icon sx={{ fontSize: 20 }}>cancel</Icon>
                Cancel
              </MDButton>
              <MDButton
                color="primary"
                variant="contained"
                sx={{
                  padding: "8px 16px",
                  backgroundColor: "#4CAF50",
                  "&:hover": {
                    backgroundColor: "#388E3C",
                  },
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
                autoFocus
                onClick={() => {
                  handleManualDelete(deleteState.id, deleteState.level);
                  closeDeleteHandle();
                }}
              >
                <Icon sx={{ fontSize: 20 }}>delete</Icon>
                Confirm
              </MDButton>
            </MDBox>
            </DialogActions>
       </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog fullWidth maxWidth='sm' open={eduState.open}>
        <DialogTitle>
          <MDBox sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}>
            <MDTypography variant="h3">
              {`${eduState.isEditing ? 'Edit' : 'Add'} ${eduState.education}`}
            </MDTypography>
            <IconButton onClick={closeEduHandle} sx={{ position: "absolute", top: "0px", right: "0px" }}>
              <Icon sx={{ fontSize: 30 }}>close</Icon>
            </IconButton>
          </MDBox>
        </DialogTitle>
        <DialogContent>
          <MDBox p={2}>
          <EducationalAttainmentForm 
            id={eduState.id} 
            education={eduState.education} 
            end_date={eduState.end_date}
            initialValues={eduState.currentData}
            onSave={(values) => {
              handleDraftChange(values, eduState.education);
              closeEduHandle();
            }}
          />
          </MDBox>
        </DialogContent>
      </Dialog>
    </MDBox>
  );
}

export default Educational;