import {Card, CardContent, CardHeader, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Icon, IconButton, Link} from "@mui/material";
import Grid from "@mui/material/Grid2";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import PageLayout from "examples/LayoutContainers/PageLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import useAuth from "hooks/useAuth";
import { useEffect, useState } from "react";
import NavBar from "layouts/content_page/nav_bar";
import moment from "moment";

import CareersStepper from "../careers-stepper";
import MDButton from "components/MDButton";
import { useLocation, useNavigate } from "react-router-dom";
import { dataServicePrivate } from "global/function";
import Footer from "examples/Footer";
import { formatDateTime } from "global/function";

import detailsData from "./personal-details/detailsData";
import colors from "assets/theme/base/colors";
import { ErrorOutlineTwoTone } from "@mui/icons-material";
import boxShadow from "assets/theme/functions/boxShadow";
import { useMaterialUIController, setDialog } from "context";
import PersonalForm from "./personal";
import Dependents from "./dependents";
import Educational from "./educational";
import WorkExperienceForm from "./work-experience";
import PersonalDetailsForm from "./personal-details";


function PersonalInformation({ update, updateHeight }){
    const [controller, dispatch] = useMaterialUIController();
    const { dialog } = controller;

    // colors
    const { error } = colors

    // navigation
    const navigate = useNavigate();
    const location = useLocation(); 
    const from = location.state?.from?.pathname || "/";
    const prevPage = () => navigate(from, { replace: true })
    const toPage = (url, params={}) => navigate(url, { state: { from: location, ...params }, replace: true })
    const [loading, setLoading] = useState(false);
    const [discardState, setDiscardState] = useState({ id: null, type: null, open: false })

    // save this career id in cache

    const {isAuth, auth} = useAuth();
    console.log('auth', auth);
    const [entity, setEntity] = useState()
    const [experience, setExperience] = useState()
    const [details, setDetails] = useState()
    const [educations, setEducations] = useState()
    const [hasDependents, setHasDependents] = useState(false)
    const [dependents, setDependents] = useState()
    const [disabled, setDisable] = useState(true)
    const [elem, setElem] = useState()
    const [high, setHigh] = useState()
    // remove personal local data
    localStorage.removeItem('entity')
    localStorage.removeItem('entity_details')
    // localStorage.removeItem('work_experience')
    // localStorage.removeItem('experience')
    localStorage.removeItem('answers')

    var entity_id = auth['id']
    useEffect(() => {
        // fetch entity
        getEntity()

        // fetch experience
        getExperience()

        // entity education
        getEducation()

        // entity dependents
        getDependents()

        updateHeight()
    }, [])

    const getEntity = () => {
        dataServicePrivate('POST', 'entity/entities/all', {
            filter: [{
                operator: '=',
                target: 'id',
                value: entity_id,
            }],
            relations: ['details']
        }).then((result) => {
            console.log('debug entity result', result);
            result = result.data['entity'][0]

            // fetch dependents
            setHasDependents(result?.children ? result['children'] == 'Yes' ? true : false : false)

            var title = ['full_name', 'contact_number', 'email', 'permanent_address']
            var color = []
            var variant = ['h6']
            var temp = []
            if ( result?.created_at ) {
                Object.keys(title).map((item, index) => {
                    temp.push({
                        title: result[title[item]],
                        color: color[index] ? color[index] : 'inherit',
                        variant: variant[index] ? variant[index] : 'body2',
                    })
                })
                setEntity(temp)
            }

            var detail = result['details'][0]
            var title = ['salary', 'us_time', 'work_in_office', 'application', 'start']
            var color = []
            var variant = []

            if ( detail?.created_at ) {
                var temp = []
                Object.keys(title).map((item, index) => {
                    temp.push({
                        title: `${detailsData[detailsData.findIndex((e) => e.id == title[item])].label}: ${detail[title[item]]}`,
                        color: color[index] ? color[index] : 'inherit',
                        variant: variant[index] ? variant[index] : 'body2',
                    })
                })
                setDetails(temp)
            }
        }).catch((err) => {
            console.log('debug entity error result', err);

        })
    }

    const getDependents = () => {
        dataServicePrivate('POST', 'entity/dependents/all', {
            filter: [{
                operator: '=',
                target: 'entity_id',
                value: entity_id,
            }],
        }).then((result) => {
            console.log('debug dependents result', result);
            result = result.data['entity_dependents']
            var title = []
            Object.keys(result).map((item, index) => {
                title.push(['name', 'birthday', 'relationship'])
            })
            var color = []
            var variant = ['h6']

            setDependents()
            if (result.length) {
                var temp = []
                Object.keys(title).map((item, index) => {
                    var _temp = []
                    Object.keys(title[item]).map((_item, _index) => {
                        _temp.push({
                            title: title[item][_item] == 'birthday' ? 
                            <MDTypography variant='body2'>
                                {formatDateTime(result[item]['birthday'], 'MMMM DD, YYYY')}
                            </MDTypography> : result[item][title[item][_item]] ,
                            color: color[_index] ? color[_index] : 'inherit',
                            variant: variant[_index] ? variant[_index] : 'body2',
                        })
                    })

                    temp.push(_temp)
                })
                setDependents(temp)
            }

        }).catch((err) => {
            console.log('debug entity error result', err);

        })
    }

    const getEducation = () => {
        dataServicePrivate('POST', 'entity/education/all', {
            filter: [{
                operator: '=',
                target: 'entity_id',
                value: entity_id,
            }],
        }).then((result) => {
            console.log('debug entity education result', result);
            result = result.data['entity_education']
            var seq = [
                "Elementary",
                "Secondary (High School)",
                "Senior High School",
                "Vocational & Technical Education",
                "College",
                "Graduate School (Master's or Doctorate)"
            ]
            var check = ['education', 'school', 'course', 'start_date', 'end_date']
            
            setEducations()
            if ( Object.keys(result).length ) {
                var color = []
                var variant = ['h6']
                var temp = []
            
                seq.forEach((item) => {
                    var _temp = []
                    var index = Object.keys(result).findIndex((e) => result[e].education == item)

                    if ( index >= 0 ) {

                        check.forEach((_item, _index) => {
                            if ( result[index][_item] ) {
                                _temp.push({
                                    title: 
                                    _item == 'start_date' || _item == 'end_date'
                                    ?   result[index]['start_date'] 
                                        ?   _item == 'start_date' && ( result[index]['start_date'] && result[index]['start_date'] ) &&
                                            <MDTypography variant='body2'>
                                                {formatDateTime(result[index].start_date, 'YYYY')} {
                                                    result[index]['present'] 
                                                    ? `to Present` 
                                                    : result[index]['undergrad']
                                                    ? `- Undergraduate`
                                                    : `to ${formatDateTime(result[index].end_date, 'YYYY')}`
                                                }
                                            </MDTypography>
                                        : <MDTypography variant='body2'>
                                            {formatDateTime(result[index]['end_date'], 'YYYY')}
                                        </MDTypography> 
                                    : result[index][_item],
                                    color: color[_index] ? color[_index] : 'inherit',
                                    variant: variant[_index] ? variant[_index] : 'body2',
                                })
                            }
                        })
                        temp.push(_temp)
                    }
                })
            
                setEducations(temp)
            }
            

        }).catch((err) => {
            console.log('debug entity education error result', err);

        })
    }

    const getExperience = () => {
        dataServicePrivate('POST', 'entity/experience/all', {
            filter: [{
                operator: '=',
                target: 'entity_id',
                value: entity_id,
            }],
        }).then((result) => {
            console.log('debug experience result', result);
            result = result.data['experience'][0]
            // fetch experience details
            dataServicePrivate('POST', 'entity/experience/details/all', {
                filter: [{
                    operator: '=',
                    target: 'experience_id',
                    value: result['id'],
                }],
                order: [
                    {
                        target: 'present',
                        value: 'desc',
                    },
                    {
                        target: 'end_date',
                        value: 'desc',
                    },
                    {
                        target: 'start_date',
                        value: 'desc',
                    },
                ]
            }).then((result) => {
                console.log('debug experience details result', result);
                result = result.data['experience_details']
                var title = []

                Object.keys(result).map((item, index) => {
                    title.push(['company', 'position_held', 'start_date', 'stay_length'])
                })

                var color = []
                var variant = ['h6']

                setExperience()
                if (result.length) {
                    var temp = []
                    Object.keys(title).map((item, index) => {
                        var _temp = []
                        Object.keys(title[item]).map((_item, _index) => {
                            _temp.push({
                                title: title[item][_item] == 'start_date' ? 
                                <MDTypography variant='body2'>
                                    {formatDateTime(result[item]['start_date'], 'MMMM YYYY')} to {result[item]['present'] ? `Present` : formatDateTime(result[item]['end_date'], 'MMMM YYYY') }
                                </MDTypography> : result[item][title[item][_item]] ,
                                color: color[_index] ? color[_index] : 'inherit',
                                variant: variant[_index] ? variant[_index] : 'body2',
                            })
                        })
    
                        temp.push(_temp)
                    })
                    setExperience(temp)
                }

            }).catch((err) => {
                console.log('debug experience details error result', err);

            })

        }).catch((err) => {
            console.log('debug experience error result', err);

        })
    }

    useEffect(() => {
        console.log('personal entity', entity);
        console.log('personal details', details);
        console.log('personal educations', educations);
        console.log('personal experience', experience);
        console.log('personal dependents', dependents);
    
        const isEducationComplete = () => {
            if (!educations || !educations.length) return false;
    
            const requiredLevels = ["Elementary", "Secondary (High School)"];
    
            const hasRequiredLevels = requiredLevels.every((level) =>
                educations.some((edu) =>
                    edu.some((field) => field.title === level)
                )
            );
    
           
    
            return hasRequiredLevels;
        };
    
        const allFieldsFilled = entity && details && (hasDependents ? dependents : true);
        const isEducationValid = isEducationComplete();
    
        setDisable(!(allFieldsFilled && isEducationValid));
    }, [entity, details, educations, experience, dependents]);
    
    const handlePersonalAction = (data=null) => {
        setDialog(dispatch, {
            open: true,
            disableClose: true,
            props: { fullWidth: true, maxWidth: 'sm' },
            title: (
                <MDBox
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    <MDTypography
                        variant="h3"
                    >
                        {data ? 'Personal Information' : 'Personal Information'}
                    </MDTypography>
                    <IconButton
                        onClick={() => setDialog(dispatch, { ...dialog, open: false })} // Close modal on close button click
                        sx={{
                            position: "absolute",
                            top: "0px",
                            right: "0px",
                        }}
                    >
                        <Icon sx={{ fontSize: 30 }}>close</Icon>
                    </IconButton>
                </MDBox>
            ),
            content: (
                <MDBox p={2}><PersonalForm update={getEntity} /></MDBox>
            ),
        });
    }

    const openDiscardHandle = (type=null) => {
        setDiscardState({
          open: true,
          type: type,
        });
    }
    const closeDiscardHandle = () => {
        setDiscardState({...discardState, open: false})
    }

    const confirmDependentDiscardHandle = () => {
        localStorage.removeItem('dependentList')
        closeDiscardHandle()
        setDialog(dispatch, { ...dialog, open: false })
    }

    const confirmExperienceDiscardHandle = () => {
        localStorage.removeItem('experienceList')
        closeDiscardHandle()
        setDialog(dispatch, { ...dialog, open: false })
    }

    const handleDependentsAction = (data=null) => {
        setDialog(dispatch, {
            open: true,
            disableClose: true,
            props: { fullWidth: true, maxWidth: 'sm' },
            title: (
                <MDBox
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    <MDTypography
                        variant="h3"
                    >
                        Dependents
                    </MDTypography>
                    <IconButton
                        onClick={() => openDiscardHandle('dependents')} // Close modal on close button click
                        sx={{
                            position: "absolute",
                            top: "0px",
                            right: "0px",
                        }}
                    >
                        <Icon sx={{ fontSize: 30 }}>close</Icon>
                    </IconButton>
                </MDBox>
            ),
            content: (
                <MDBox p={2}><Dependents update={getDependents} /></MDBox>
            ),
        });
    }

    const handleEducationAction = (data=null) => {
        setDialog(dispatch, {
            open: true,
            disableClose: true,
            props: { fullWidth: true, maxWidth: 'sm' },
            title: (
                <MDBox
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    <MDTypography
                        variant="h3"
                    >
                        Educational Background
                    </MDTypography>
                    <IconButton
                        onClick={() => setDialog(dispatch, { ...dialog, open: false })} // Close modal on close button click
                        sx={{
                            position: "absolute",
                            top: "0px",
                            right: "0px",
                        }}
                    >
                        <Icon sx={{ fontSize: 30 }}>close</Icon>
                    </IconButton>
                </MDBox>
            ),
            content: (
                <MDBox p={2}><Educational update={getEducation} /></MDBox>
            ),
        });
    }

    const handleWorkAction = (data=null) => {
        setDialog(dispatch, {
            open: true,
            disableClose: true,
            props: { fullWidth: true, maxWidth: 'sm' },
            title: (
                <MDBox
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    <MDBox>
                        <MDTypography variant='h3'>Work Experience</MDTypography>
                        <MDTypography sx={{ mt: 3}}  variant='button' color='error'>OJT/Internship can be considered </MDTypography>
                    </MDBox>
                    <IconButton
                        onClick={() => openDiscardHandle('experience')} // Close modal on close button click
                        sx={{
                            position: "absolute",
                            top: "0px",
                            right: "0px",
                        }}
                    >
                        <Icon sx={{ fontSize: 30 }}>close</Icon>
                    </IconButton>
                </MDBox>
            ),
            content: (
                <MDBox p={2}><WorkExperienceForm update={getExperience} /></MDBox>
            ),
        });
    }

    const handleDetailsAction = (data=null) => {
        setDialog(dispatch, {
            open: true,
            disableClose: true,
            props: { fullWidth: true, maxWidth: 'sm' },
            title: (
                <MDBox
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    <MDTypography
                        variant="h3"
                    >
                        {data ? 'Other Details' : 'Other Details'}
                    </MDTypography>
                    <IconButton
                        onClick={() => setDialog(dispatch, { ...dialog, open: false })} // Close modal on close button click
                        sx={{
                            position: "absolute",
                            top: "0px",
                            right: "0px",
                        }}
                    >
                        <Icon sx={{ fontSize: 30 }}>close</Icon>
                    </IconButton>
                </MDBox>
            ),
            content: (
                <MDBox p={2}><PersonalDetailsForm update={getEntity} /></MDBox>
            ),
        });
    }

    const InformationContent = ({ title, data, err=null, handleAction }) => (
        <Card 
            sx={{
                mx: 5, 
                my: 3,
                ...(err && {
                    boxShadow:`${boxShadow([0, 4], [6, -1], error.main, 0.2)}, ${boxShadow(
                        [0, 2],
                        [4, -1],
                        error.main,
                        0.90
                    )}`
                })
            }}
        >
            <CardContent>
                <MDTypography variant='h6' color={err ? 'error' : 'info'}>{title}</MDTypography>
                <Divider />
                {
                    data ? Object.keys(data).map((item, index) => (
                        <MDTypography 
                        key={index} 
                        color={data[item]?.color ? data[item].color : 'inherit'}
                        variant={data[item]?.variant ? data[item].variant : ''}
                        sx={{ color: '#000 !important', WebkitTextFillColor: '#000 !important', display: 'block',}}
                        >{data[item].title}{Object.keys(data).length == index+1 && '...'}</MDTypography>
                    )) 
                    : <MDBox display='flex' justifyContent='center'><MDTypography color='secondary' variant='button' >Add your information here</MDTypography></MDBox>
                }
               <MDButton
                    sx={{ 
                        mt: 2, 
                        borderColor: 'secondary.main', 
                        color: 'secondary.main', 
                        transition: 'all 0.3s ease', 
                        '& .MuiSvgIcon-root': { color: 'inherit' }, 
                        '&:hover': {
                        borderColor: 'red', 
                        color: 'red', 
                        '& .MuiSvgIcon-root': { color: 'red' }, 
                        }
                    }}
                    variant='outlined' 
                    fullWidth 
                    color='secondary' 
                    startIcon={<Icon>{data ? `edit` : `add`}</Icon>}
                    onClick={handleAction}
                >
                    {`${data ? 'Edit' : 'Add'} ${title}`}
                </MDButton>
                {/* {err && <MDBox display='flex' justifyContent='end'><MDTypography color='error'>* Required</MDTypography></MDBox>} */}
                {err}
            </CardContent>
        </Card>
    )

    const WorkExpContent = ({ title, data, err=null, handleAction }) => {

        var errContent = null
        if ( typeof err != 'boolean' ) {
            errContent = err?.label
            err = err?.missing
        }

        return (
            <Card
                sx={{
                    mx: 5, 
                    my: 3,
                    ...(err && {
                        boxShadow:`${boxShadow([0, 4], [6, -1], error.main, 0.2)}, ${boxShadow(
                            [0, 2],
                            [4, -1],
                            error.main,
                            0.90
                        )}`
                    })
                }}
            >
                <CardContent>
                    <MDTypography variant='h6' color={err ? 'error' : 'info'}>{title}</MDTypography>
                    <Divider />
                    {
                        data ? Object.keys(data).map((item, index) => {
                            return (
                                <MDBox key={index}>
                                    {Object.keys(data[item]).map((_item, _index) => {
                                        const value = data[item][_item];
                                        const textValue = typeof value === "object" && value !== null ? value.title : value;
        
                                        return (
                                            <MDTypography 
                                                key={`${index}-${_index}`} 
                                                variant={value?.variant || 'body1'}
                                                sx={{ 
                                                    color: "#000 !important", 
                                                    textTransform: 'none',
                                                    WebkitTextFillColor: '#000 !important', 
                                                    display: 'block', 
                                                }}
                                            >
                                                {textValue}
                                            </MDTypography>
                                        );
                                    })}
                                    <Divider />
                                </MDBox>
                            );
                        })
                        : <MDBox display='flex' justifyContent='center'>
                            <MDTypography color='secondary' variant='button'>Add your information here</MDTypography>
                        </MDBox>
                    }
                    <MDButton   
                        sx={{ 
                            mt: 2, 
                            borderColor: 'secondary.main', 
                            color: 'secondary.main', 
                            transition: 'all 0.3s ease', 
                            '& .MuiSvgIcon-root': { color: 'inherit' }, 
                            '&:hover': {
                                borderColor: 'red', 
                                color: 'red', 
                                '& .MuiSvgIcon-root': { color: 'red' },
                            }
                        }} 
                        variant='outlined' 
                        fullWidth 
                        color='secondary' 
                        startIcon={<Icon>{data ? `edit` : `add`}</Icon>}
                        onClick={handleAction}
                    >
                        {`${data ? 'Edit' : 'Add'} ${title}`}
                    </MDButton>
                    {/* {err && <MDBox display='flex' justifyContent='end'><MDTypography color='error'>* Required</MDTypography></MDBox>} */}
                    {errContent}
                </CardContent>
            </Card>
        )
    };
    

    const [missingInfo, setMissingInfo] = useState([]);

    useEffect(() => {
        let missing = [];

        // Personal Information
        missing.push({
            key: "personal-info",
            label: "Personal Information",
            missing: !entity || entity.length === 0
        });

        // Dependents (Optional)
        if (hasDependents) {
            missing.push({
                key: "missing-dependents",
                label: "Dependents",
                missing: !dependents || dependents.length === 0
            });
        }

        // Educational Background Check
        const educationData = educations || [];

        const hasElementary = educationData.some(edu => edu.some(field => field.title === "Elementary"));
        const hasHighSchool = educationData.some(edu => edu.some(field => field.title === "Secondary (High School)"));
    
        let missingEdu = [];

        if (!hasElementary) missingEdu.push("• Elementary is required");
        if (!hasHighSchool) missingEdu.push("• High School is required");
    
        missing.push({
            key: "missing-educational-background",
            label: (
                <MDBox mt={1} display='flex' justifyContent='end'>  
                    <MDBox style={{ marginLeft: "15px", whiteSpace: "pre-line" }}>
                        {missingEdu.length > 0 && missingEdu.map((text, index) => (
                            <MDTypography variant='button' sx={{ display: 'block' }} key={index}>{text}</MDTypography>
                        ))}
                    </MDBox>
                </MDBox>
            ),
            missing: missingEdu.length > 0
        });

        // Work Experience
        missing.push({
            key: "missing-work-experience",
            label: "Work Experience",
            missing: !experience || experience.length === 0
        });

        // Other Details
        missing.push({
            key: "missing-other-details",
            label: "Other Details",
            missing: !details || details.length === 0
        });
        console.log('missing', missing);

        setMissingInfo(missing);
    }, [entity, dependents, experience, details, educations]);
    
    return (
        <MDBox>
            <InformationContent title='PERSONAL INFORMATION' data={entity} err={missingInfo[0]?.missing} handleAction={() => handlePersonalAction(entity)} />
            { hasDependents && <WorkExpContent title='DEPENDENTS' data={dependents} err={missingInfo[1]?.missing} handleAction={handleDependentsAction} /> }
            <WorkExpContent title='EDUCATIONAL BACKGROUND' data={educations} err={missingInfo[!hasDependents ? 1 : 2]} handleAction={handleEducationAction} />
            <WorkExpContent title='WORK EXPERIENCE' data={experience} err={missingInfo[!hasDependents ? 2 : 3]?.missing} handleAction={handleWorkAction} />
            <InformationContent title='OTHER DETAILS' data={details} err={missingInfo[!hasDependents ? 3 : 4]?.missing} handleAction={handleDetailsAction} />
            <MDButton onClick={() => {update(); updateHeight();}} disabled={disabled || loading} startIcon={<Icon>check</Icon>} fullWidth color={disabled ? 'secondary' : 'info'} sx={{ marginLeft:{ xs: '0', sm: '5%', md: '7%' }, width: { xs: '100%', sm: '90%', md: '86%' }, maxWidth: '100%', boxSizing: 'border-box', px: 5 }}> {loading ? 'Loading...' : 'Continue'} </MDButton>
            {/* discard dialog */}
            <Dialog open={discardState.open} onClose={closeDiscardHandle}>
                <DialogTitle>
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
                            <Icon sx={{ color: "#FF9800", fontSize: 30 }}>help</Icon>
                            Discard Changes?
                        </MDTypography>
                    </MDBox>
                </DialogTitle>
                <DialogContent>
                    <MDBox p={2}>
                        <MDTypography variant="body1" color="textSecondary">
                            You have unsaved changes. If you leave now, the information you've entered will be lost.
                        </MDTypography>
                    </MDBox>
                </DialogContent>
                <DialogActions>
                    <MDBox p={2} display="flex" justifyContent="flex-end" gap={2}>
                        <MDButton
                            onClick={closeDiscardHandle}
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
                            onClick={()=>{
                                switch (discardState['type']) {
                                    case 'dependents':
                                        confirmDependentDiscardHandle()
                                        break
                                    
                                    case 'experience':
                                        confirmExperienceDiscardHandle()
                                        break
                                }
                            }}
                        >
                            <Icon sx={{ fontSize: 20 }}>delete</Icon>
                            Confirm
                        </MDButton>
                    </MDBox>
                </DialogActions>
            </Dialog>
        </MDBox>
    );    
}

export default PersonalInformation;