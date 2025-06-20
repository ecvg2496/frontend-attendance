import {Accordion, AccordionDetails, AccordionSummary, AppBar, Card, CardContent, Chip, Container, Divider, Icon, IconButton, Link, Tab, Tabs} from "@mui/material";
import Grid from "@mui/material/Grid";

import PageLayout from "examples/LayoutContainers/PageLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import useAuth from "hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { dataServicePrivate, formatDateTime } from "global/function";
import NavBar from "layouts/content_page/nav_bar";
import moment from "moment";
import ImageView from "layouts/dashboard/employee/image-viewer";
// import AudioPlayer from "material-ui-audio-player";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import MDButton from "components/MDButton";
import SwipeableViews from "react-swipeable-views";

import entityData from "./entityData";
import detailsData from "../personal-information/personal-details/detailsData";
import dependentsData from "../personal-information/dependents/dependentsData";
import Footer from "examples/Footer";
import educationData from "./educationData";
import experienceData from "./experienceData";
import referenceData from "../reference-information/referenceData";
import colors from "assets/theme/base/colors";
import { SvgIcon } from '@mui/material'; 
import { useLocation, useNavigate } from "react-router-dom";
import typography from "assets/theme/base/typography"


function Response(){

    const { e20 } = colors

    const {isAuth, auth} = useAuth();
    const { id } = auth
    const [params, setParams] = useSearchParams('');
    const [entity, setEntity] = useState()
    const [careers, setCareers] = useState()
    const [dependents, setDependents] = useState()
    const [education, setEducation] = useState()
    const [experience, setExperience] = useState()
    const [expDetails, setExpDetails] = useState()
    const [details, setDetails] = useState()
    const [answers, setAnswers] = useState()
    const [reference, setReference] = useState()
    const [step, setStep] = useState(0)
    const actionRef = useRef()

    const [answerStep, setAnswerStep] = useState(0)
    const answerRef = useRef()

    const careerId = localStorage.getItem('career_id')

    const navigate = useNavigate();
    const location = useLocation(); 
    const toPage = (url, params={}) => navigate(url, { state: { from: location, ...params }, replace: true })

    useEffect(() => {
        var entity_id = params.get('entity')
        var careers_id = params.get('careers')
        console.log('debug response params', entity_id, careers_id);

        // fetch career
        dataServicePrivate('POST', 'hr/careers/all', {
            filter: [{
                operator: '=',
                target: 'id',
                value: careers_id,
            }],
        }).then((result) => {
            console.log('debug career result', result);
            result = result.data['careers'][0]
            setCareers(result)

        }).catch((err) => {
            console.log('debug career error result', err);

        })

        // fetch entity
        dataServicePrivate('POST', 'entity/entities/all', {
            filter: [{
                operator: '=',
                target: 'id',
                value: id,
            }],
            relations: [{ details: { relations: ['platforms'] } }, 'educations', 'reference', 'dependents']
        }).then((result) => {
            console.log('debug entity result', result);
            result = result.data['entity'][0]
            setEntity(result)
            if (result?.dependents && result['dependents'].length) setDependents(result['dependents'])
            if (result?.educations && result['educations'].length) {
                var seq = [
                    "Elementary",
                    "Secondary (High School)",
                    "Senior High School",
                    "Vocational & Technical Education",
                    "College",
                    "Graduate School (Master's or Doctorate)"
                ]

                var ed = []
                seq.forEach((item) => {
                    var index = Object.keys(result['educations']).findIndex((e) => result['educations'][e].education == item)
                    if ( index >= 0 ) ed.push(result['educations'][index])
                })

                setEducation(ed)
            }
            setEducation(result['educations'])
            setReference(result['reference'])
            setDetails(result['details'])

        }).catch((err) => {
            console.log('debug entity error result', err);

        })

        // fetch experience
        dataServicePrivate('POST', 'entity/experience/all', {
            filter: [{
                operator: '=',
                target: 'entity_id',
                value: id,
            }],
        }).then((result) => {
            console.log('debug entity experience result', result);
            result = result.data['experience']
            setExperience(result[0])

            dataServicePrivate('POST', 'entity/experience/details/all', {
                filter: [{
                    operator: '=',
                    target: 'experience_id',
                    value: result[0].id,
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
                setExpDetails(result)
    
            }).catch((err) => {
                console.log('debug experience details error result', err);
    
            })

        }).catch((err) => {
            console.log('debug entity experience error result', err);

        })

        // fetch answers
        dataServicePrivate('POST', 'hr/careers/answers/all', {
            filter: [
                {
                    operator: '=',
                    target: 'entity_id',
                    value: entity_id,
                },
                {
                    operator: '=',
                    target: 'careers_id',
                    value: careers_id,
                },
            ],
            relations: ['question', 'files'],
            order: [
                {
                    target: 'group',
                    value: 'asc',
                },
                {
                    target: 'order',
                    value: 'asc',
                },
            ]
        }).then((result) => {
            console.log('debug answers result', result);
            result = result.data['career_answers']

            let answers = []
            for (let i in result) {
                let item = result[i]
                if (item['group'] in answers) {
                    var temp = {...answers[item['group']], [item['order']]: item}
                    answers[item['group']] = temp
                } else {
                    answers.push({[item['order']]: item})
                }
            }
            console.log('answers', answers);
            setAnswers(answers)

        }).catch((err) => {
            console.log('debug answers error result', err);

        })

    }, [])

    var orderlist = ['full_name', 'first_name', 'middle_name', 'last_name', 'email', 'contact_number']
    var blacklist = ['id', 'created_at', 'deleted_at', 'email_verified', 'email_verified_at', 'image', 'status', 'updated_at', 'users_id']

    const nextStep = () => {
        setStep(step+1)
        window.scrollTo(0, 0);
    }
    const prevStep = () => {
        setStep(step-1)
        window.scrollTo(0, 0);
    }
    const accordHeightChange = () => {
        setTimeout(() => {
            if (actionRef) actionRef.current.updateHeight()
        }, 500);
    }
    
    const nextAnswersStep = () => {
        setAnswerStep(answerStep+1)
        window.scrollTo(0, 0);
    }
    const prevAnswersStep = () => {
        setAnswerStep(answerStep-1)
        window.scrollTo(0, 0);
    }
    const accordAnswersHeightChange = () => {
        setTimeout(() => {
            if (answerRef) answerRef.current.updateHeight()
        }, 500);
    }
    
    useEffect(() => {
        window.addEventListener('scroll', accordHeightChange);

        return () => window.removeEventListener('scroll', accordHeightChange);
    },[])

    var tabs = ['Information', 'Questions', 'Reference']

    const isNumber = (str) => {
        if (typeof str != "string") return false
        return !isNaN(str) && !isNaN(parseFloat(str))
    }

    const renderInfo = (title, value, format='YYYY') => (
        <MDBox py={1} pr={2}>
            <MDTypography variant="button" fontWeight="bold" color="black" >
                {title}: &nbsp;
            </MDTypography>
            <MDTypography variant="button" fontWeight="regular" color="black">
                &nbsp;{moment(value).isValid() && !isNumber(value) && typeof value != 'number' && value != '0' ? formatDateTime(value, format) : typeof value == 'boolean' ? value==true?'Yes':'No' : value}
            </MDTypography>
        </MDBox>
    )

    const renderOtherDetails = (title, value, format='YYYY') => (
        <MDBox py={1} pr={2}>
            <MDTypography variant="button" fontWeight="bold" color="black" sx={{ display: 'block' }}>
                {title}: &nbsp;
            </MDTypography>
            <MDTypography variant="button" fontWeight="regular" color="black">
                &nbsp;{value}
            </MDTypography>
        </MDBox>
    )

    const renderOtherDetailsEmployment = (title, value, format='YYYY') => (
        <MDBox py={1} pr={2}>
            <MDTypography variant="button" fontWeight="bold" color="black">
                {title}: &nbsp;
            </MDTypography>
            <MDTypography variant="button" fontWeight="regular" color="black">
                &nbsp;{moment(value).isValid() && !isNumber(value) && value != '0' ? formatDateTime(value, format) : <div dangerouslySetInnerHTML={{__html: String(value).replace(/, /g, "<br>")}} />}
            </MDTypography>
        </MDBox>
    )
    const EDUCATION_ORDER = [
        'Elementary',
        'Secondary (High School)',
        'Senior High School',
        'Vocational & Technical Education',
        'College',
        "Graduate School (Master's or Doctorate)"
      ];
    const sortEducationByLevel = (educationArray) => {
        if (!educationArray) return [];
        
        return [...educationArray].sort((a, b) => {
          const aIndex = EDUCATION_ORDER.indexOf(a.education);
          const bIndex = EDUCATION_ORDER.indexOf(b.education);
          return aIndex - bIndex;
        });
      };
    return (
        <PageLayout>
            <NavBar position='absolute' />
            <MDBox mt={5} maxWidth="sm" mx='auto' pt={6} pb={3}>
                {careers && <MDTypography variant='h3' sx={{ textAlign: 'center', mb: 3 }}>{careers['title']}</MDTypography>}
                <AppBar position="static">
                    <Tabs value={step} onChange={(e, val) => {setStep(val); accordHeightChange();}}>
                        {tabs.map(item => (
                            <Tab 
                                label={item} 
                                sx={{
                                    color: 'black!important',
                                    '&.Mui-selected': {
                                        color: 'white!important',
                                        fontWeight: 'bold',
                                        backgroundColor: e20.main,
                                    },
                                }}
                            />
                        ))}
                    </Tabs>
                </AppBar>
                <SwipeableViews
                    index={step}
                    animateHeight
                    ref={actionRef}
                >
                    <MDBox>
                        <Card variant="outlined" sx={{ my: 2, mx: 1 }}>
                            <CardContent sx={{ p: '0.5rem 1.5rem!important' }}>
                                <Accordion
                                    sx={{ boxShadow: 0 }}
                                    defaultExpanded
                                    slotProps={{ transition: { addEndListener: accordHeightChange } }}
                                >
                                    <AccordionSummary expandIcon={<Icon fontSize="5px">expand_more</Icon>}><MDTypography variant='h5' textTransform='uppercase' color='e20'>Personal Information</MDTypography></AccordionSummary>
                                    <AccordionDetails>
                                        {entity && Object.keys(entityData).map((item, index) => {
                                            // if ( entityData[item].id == 'birthday' ) {
                                            //     return (
                                            //         <MDBox display='flex' justifyContent='space-between'>
                                            //             {renderInfo(entityData[item].label, entity[entityData[item].id], 'MMMM DD, YYYY')}
                                            //             {renderInfo('Age', entity['age']+' years old', 'MMMM DD, YYYY')}
                                            //         </MDBox>
                                            //     )
                                            // } else {
                                            //     return renderInfo(entityData[item].label, entity[entityData[item].id], 'MMMM DD, YYYY')
                                            // }
                                            return renderInfo(entityData[item].label, entity[entityData[item].id], 'MMMM DD, YYYY')
                                        })}
                                    </AccordionDetails>
                                </Accordion>
                            </CardContent>
                        </Card>
                        {dependents &&
                        <Card variant="outlined" sx={{ my: 2, mx: 1 }}>
                            <CardContent sx={{ p: '0.5rem 1.5rem!important' }}>
                                <Accordion
                                    sx={{ boxShadow: 0 }}
                                    defaultExpanded
                                    slotProps={{ transition: { addEndListener: accordHeightChange } }}
                                >
                                    <AccordionSummary expandIcon={<Icon fontSize="5px">expand_more</Icon>}><MDTypography variant='h5' textTransform='uppercase' color='e20'>Dependents</MDTypography></AccordionSummary>
                                    <AccordionDetails>
                                        {dependents && Object.keys(dependents).map((item, index) => (
                                            <Card variant="outlined" sx={{ mb: 2 }}>
                                                <CardContent>
                                                    {Object.keys(dependentsData).map((_item, _index) => renderInfo(dependentsData[_item].label, dependents[item][dependentsData[_item].id], 'MMMM DD, YYYY'))}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                            </CardContent>
                        </Card>}
                        {education &&
                        <Card variant="outlined" sx={{ my: 2, mx: 1 }}>
                        <CardContent sx={{ p: '0.5rem 1.5rem!important' }}>
                            <Accordion
                            sx={{ boxShadow: 0 }}
                            defaultExpanded
                            slotProps={{ transition: { addEndListener: accordHeightChange } }}
                            >
                            <AccordionSummary expandIcon={<Icon fontSize="5px">expand_more</Icon>}>
                                <MDTypography variant='h5' textTransform='uppercase' color='e20'>Education</MDTypography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {sortEducationByLevel(education).map((eduItem, index) => (
                                <Card variant="outlined" sx={{ mb: 2 }} key={index}>
                                    <CardContent>
                                    <MDBox display="flex" py={1} pr={2} justifyContent='center'>
                                        <MDTypography variant="button" fontWeight="bold" textTransform="uppercase" color='black'>
                                        {eduItem.education}
                                        </MDTypography>
                                    </MDBox>
                                    {Object.keys(educationData).map((_item, _index) => {
                                        if (eduItem[educationData[_item].id]) {
                                        if (educationData[_item].id !== 'education') { // Skip the education type since we already show it as header
                                            return renderInfo(educationData[_item].label, eduItem[educationData[_item].id])
                                        }
                                        }
                                        return null;
                                    })}
                                    </CardContent>
                                </Card>
                                ))}
                            </AccordionDetails>
                            </Accordion>
                        </CardContent>
                        </Card>}
                        {experience &&
                        <Card variant="outlined" sx={{ my: 2, mx: 1 }}>
                            <CardContent sx={{ p: '0.5rem 1.5rem!important' }}>
                                <Accordion
                                    sx={{ boxShadow: 0 }}
                                    defaultExpanded
                                    slotProps={{ transition: { addEndListener: accordHeightChange } }}
                                >
                                    <AccordionSummary expandIcon={<Icon fontSize="5px">expand_more</Icon>}><MDTypography variant='h5' textTransform='uppercase' color='e20'>Work Experience</MDTypography></AccordionSummary>
                                    <AccordionDetails>
                                        {renderInfo('Total Work Experience', experience['total_experience'])}
                                        {expDetails && Object.keys(expDetails).map((item, index) => (
                                            <Card variant="outlined" sx={{ mb: 2 }}>
                                                <CardContent>
                                                    {Object.keys(experienceData).map((_item, _index) => {
                                                        if ((expDetails[item]['present'] && experienceData[_item].id == 'end_date') || (!expDetails[item]['present'] && experienceData[_item].id == 'present')) {
                                                            return
                                                        }
                                                        return renderInfo(experienceData[_item].label, expDetails[item][experienceData[_item].id], 'MMMM YYYY')
                                                    })}
                                                </CardContent>
                                            </Card>
                                        ))}
                                        <MDBox py={1} pr={2}>
                                            <MDTypography variant="button" fontWeight="bold" color="black">
                                                Other Experience: &nbsp;
                                            </MDTypography>
                                            <MDTypography variant="button" fontWeight="regular" color="black">
                                                &nbsp;<div dangerouslySetInnerHTML={{__html: String(experience['other_experience']).replace(/\n/g, "<br>")}} />
                                            </MDTypography>
                                        </MDBox>
                                    </AccordionDetails>
                                </Accordion>
                            </CardContent>
                        </Card>}
                        <Card variant="outlined" sx={{ my: 2, mx: 1 }}>
                            <CardContent sx={{ p: '0.5rem 1.5rem!important' }}>
                                <Accordion
                                    sx={{ boxShadow: 0 }}
                                    defaultExpanded
                                    slotProps={{ transition: { addEndListener: accordHeightChange } }}
                                >
                                    <AccordionSummary expandIcon={<Icon fontSize="5px">expand_more</Icon>}><MDTypography variant='h5' textTransform='uppercase' color='e20'>Other Details</MDTypography></AccordionSummary>
                                    <AccordionDetails>
                                        {details && Object.keys(detailsData).map((item, index) => {
                                            if (detailsData[item].id == 'platforms_id') {
                                                return renderOtherDetails(detailsData[item].label, details[0]['platforms']['title'])
                                            } if (detailsData[item].id == 'government_requirements') {
                                                return renderOtherDetailsEmployment(detailsData[item].label, details[0][detailsData[item].id])
                                            } else {
                                                return renderOtherDetails(detailsData[item].label, details[0][detailsData[item].id])
                                            }
                                        })}
                                    </AccordionDetails>
                                </Accordion>
                            </CardContent>
                        </Card>
                        {accordHeightChange()}
                        <Divider sx={{ mt: 3 }} />
                    </MDBox>
                    {answers && <MDBox>
                        <AppBar position="static" sx={{ mt: 3 }}>
                            <Tabs value={answerStep} onChange={(e, val) => {setAnswerStep(val); accordHeightChange(); accordAnswersHeightChange();}}>
                                {Object.keys(answers).map((item, index) => (
                                    <Tab 
                                        label={`Group ${index+1}`}
                                        sx={{
                                            color: 'black!important',
                                            '&.Mui-selected': {
                                                color: 'white!important',
                                                fontWeight: 'bold',
                                                backgroundColor: e20.main,
                                            },
                                            fontSize: typography.size.xs
                                        }}
                                    />
                                ))}
                            </Tabs>
                        </AppBar>
                        <SwipeableViews
                            index={answerStep}
                            animateHeight
                            ref={answerRef}
                            resistance
                        >
                            {Object.keys(answers).map((item, index) => (
                                <MDBox m={2}>
                                    {Object.keys(answers[item]).map((_item, _index) => {
                                        var question = answers[item][_item]?.question
                                        var answer = answers[item][_item]
                                        if (answer) {
                                            if (question['type'] == 'input') {
                                                return (
                                                    <Card variant="outlined" sx={{ my: 2 }} key={_index}>
                                                        <CardContent sx={{ p: '0.5rem 1.5rem!important' }}>
                                                            <MDTypography variant='subtitle2' color='e20'>{question['title']}</MDTypography>
                                                            <Divider />
                                                            <MDTypography textTransform="capitalize" variant="caption">{answer['value']}</MDTypography>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            } else {
                                                return (
                                                    <Card variant="outlined" sx={{ my: 2 }} key={_index}>
                                                        <CardContent sx={{ p: '0.5rem 1.5rem!important' }}>
                                                            <MDTypography variant='subtitle2' color='e20'>{question['title']}</MDTypography>
                                                            <Divider />
                                                            {
                                                                answer['files'] != null ? 
                                                                    (
                                                                        <MDBox
                                                                        display="flex"
                                                                        justifyContent='center'>
                                                                            {
                                                                                String(answer['files']['file_type']).split('/')[1] == 'pdf' &&
                                                                                <Link href={answer['files']['files_url']} target="_blank">
                                                                                    <MDButton sx={{ width: '100%', borderRadius: 0, marginTop: '15px', }}>Open File</MDButton>
                                                                                </Link>
                                                                            }
                                                                            {
                                                                                String(answer['files']['file_type']).split('/')[0] == 'image' &&
                                                                                <ImageView data={answer['files']} />
                                                                            }
                                                                            {
                                                                                String(answer['files']['file_type']).split('/')[0] == 'audio' &&
                                                                                <MDBox width='100%'>
                                                                                    <AudioPlayer 
                                                                                        src={[answer['files']['files_url']]} 
                                                                                    />
                                                                                    <Link href={answer['files']['files_url']} target="_blank">
                                                                                        <MDButton sx={{ width: '100%', borderRadius: 0, marginTop: '15px', }}>Download</MDButton>
                                                                                    </Link>
                                                                                </MDBox>
                                                                            }
                                                                        </MDBox>
                                                                    ) 
                                                                :
                                                                    question['value'].split(', ').map((_key) => {
                                                                        if (answer['value'].split(', ').includes(_key)) {
                                                                            return (<Chip key={_key} label={_key} sx={{ m: "5px" }} />)
                                                                        } 
                                                                    }) 
                                                            }
                                                        </CardContent>
                                                    </Card>
                                                )
                                            }
                                        } else {
                                            if (!question['type'] == 'link' || !question['type'] == 'label') {
                                                return (
                                                    <Card variant="outlined" sx={{ my: 2 }} key={_index}>
                                                        <CardContent sx={{ p: '0.5rem 1.5rem!important' }}>
                                                            <MDTypography variant='subtitle2' color='e20'>{question['title']}</MDTypography>
                                                            <Divider />
                                                            <MDTypography textTransform="capitalize" variant="caption">No Answer</MDTypography>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            }
                                        }
                                        
                                    })}
                                    <Divider sx={{ mt: 6 }} />
                                </MDBox>
                            ))}
                        </SwipeableViews>
                        <MDBox display='flex'>
                            <MDBox width='100%' sx={{ textAlign: 'end' }}>
                                {answerStep !== 0 && (
                                    <IconButton
                                        onClick={prevAnswersStep}
                                        sx={{
                                            backgroundColor: '#666666 !important', 
                                            color: 'white !important', 
                                            '&:hover': {
                                                backgroundColor: '#555555 !important', 
                                                boxShadow: 'none',
                                                color: 'white !important'
                                            },
                                            '&.Mui-disabled': {
                                                backgroundColor: '#666666 !important',
                                                color: 'white !important',
                                                opacity: 0.5,
                                            }
                                        }}
                                    >
                                        <Icon sx={{ color: 'white' }}>navigate_before</Icon>
                                    </IconButton>
                                )}
                            </MDBox>
                            <MDBox width='100%'>
                            {answerStep < Object.keys(answers).length-1 && (
                                <IconButton
                                    onClick={nextAnswersStep}
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        color: 'white', 
                                        transition: 'all 0.3s ease',
                                        '& .MuiSvgIcon-root': { color: 'inherit' },
                                        '&:hover': {
                                            backgroundColor: '#2196f3', // Lighter blue on hover
                                            boxShadow: '0px 4px 10px rgba(33, 150, 243, 0.5)', // Soft glow effect
                                        } 
                                    }}
                                >
                                    <Icon>navigate_next</Icon>
                                </IconButton>
                            )}
                            </MDBox>
                        </MDBox>
                        <Divider sx={{ mt: 4 }} />
                    </MDBox>}
                    {/* <MDBox>
                        {answers && Object.keys(answers).map((item, key) => {
                            
                            if (answers[item]['question']['type'] == 'input') {
                                return (
                                    <Card variant="outlined" sx={{ my: 2, mx: 1 }} key={key}>
                                        <CardContent sx={{ p: '0.5rem 1.5rem!important' }}>
                                            <MDTypography variant='subtitle2' color='e20'>{answers[item]['question']['title']}</MDTypography>
                                            <Divider />
                                            <MDTypography textTransform="capitalize" variant="caption">{answers[item]['value']}</MDTypography>
                                        </CardContent>
                                    </Card>
                                )
                            } else {
                                return (
                                    <Card variant="outlined" sx={{ my: 2, mx: 1 }} key={key}>
                                        <CardContent sx={{ p: '0.5rem 1.5rem!important' }}>
                                            <MDTypography variant='subtitle2' color='e20'>{answers[item]['question']['title']}</MDTypography>
                                            <Divider />
                                            {
                                                answers[item]['files'] != null ? 
                                                    (
                                                        <MDBox
                                                        display="flex"
                                                        justifyContent='center'>
                                                            {
                                                                String(answers[item]['files']['file_type']).split('/')[1] == 'pdf' &&
                                                                <Link href={answers[item]['files']['files_url']} target="_blank">
                                                                    <MDButton sx={{ width: '100%', borderRadius: 0, marginTop: '15px', }}>Open File</MDButton>
                                                                </Link>
                                                            }
                                                            {
                                                                String(answers[item]['files']['file_type']).split('/')[0] == 'image' &&
                                                                <ImageView data={answers[item]['files']} />
                                                            }
                                                            {
                                                                String(answers[item]['files']['file_type']).split('/')[0] == 'audio' &&
                                                                <MDBox width='100%'>
                                                                    <AudioPlayer 
                                                                        src={[answers[item]['files']['files_url']]} 
                                                                    />
                                                                    <Link href={answers[item]['files']['files_url']} target="_blank">
                                                                        <MDButton sx={{ width: '100%', borderRadius: 0, marginTop: '15px', }}>Download</MDButton>
                                                                    </Link>
                                                                </MDBox>
                                                            }
                                                        </MDBox>
                                                    ) 
                                                :
                                                    answers[item]['question']['value'].split(', ').map((_key) => {
                                                        if (answers[item]['value'].split(', ').includes(_key)) {
                                                            return (<Chip key={_key} label={_key} sx={{ m: "5px" }} />)
                                                        } 
                                                    }) 
                                            }
                                        </CardContent>
                                    </Card>
                                )
                            }
                        })}
                        <Divider sx={{ mt: 3 }} />
                    </MDBox> */}
                    <MDBox>
                        {reference &&
                        <Card variant="outlined" sx={{ my: 2, mx: 1 }}>
                            <CardContent sx={{ p: '0.5rem 1.5rem!important' }}>
                                <Accordion
                                    sx={{ boxShadow: 0 }}
                                    defaultExpanded
                                    slotProps={{ transition: { addEndListener: accordHeightChange } }}
                                >
                                    <AccordionSummary expandIcon={<Icon fontSize="5px">expand_more</Icon>}><MDTypography variant='h5' color='e20'>CHARACTER REFERENCE</MDTypography></AccordionSummary>
                                    <AccordionDetails>
                                        {reference && Object.keys(reference).map((item, index) => (
                                            <Card variant="outlined" sx={{ mb: 2 }}>
                                                <CardContent>
                                                    {Object.keys(referenceData).map((_item, _index) => reference[item][referenceData[_item].id] && renderInfo(referenceData[_item].label, reference[item][referenceData[_item].id]))}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                            </CardContent>
                        </Card>}
                        <Divider sx={{ mt: 3 }} />
                    </MDBox>
                </SwipeableViews>
                <MDBox my={2} display='flex' justifyContent={step==0 ? 'end' : 'space-between'}>
                {step !== 0 && (
                    <MDButton
                        onClick={prevStep}
                        variant="contained"
                        startIcon={<Icon sx={{ color: 'white' }}>navigate_before</Icon>}
                        sx={{
                            backgroundColor: '#666666 !important', 
                            color: 'white !important', 
                            '&:hover': {
                                backgroundColor: '#555555 !important', 
                                boxShadow: 'none',
                                color: 'white !important'
                            },
                            '&.Mui-disabled': {
                                backgroundColor: '#666666 !important',
                                color: 'white !important',
                                opacity: 0.5,
                            }
                        }}
                    >
                        Prev
                    </MDButton>
                )}

                    {step !== 2 && (
                        <MDButton
                            onClick={nextStep}
                            variant="contained"
                            color="primary"
                            endIcon={<Icon>navigate_next</Icon>}
                            sx={{
                            color: 'white', 
                            transition: 'all 0.3s ease',
                            '& .MuiSvgIcon-root': { color: 'inherit' },
                            '&:hover': {
                                backgroundColor: '#2196f3', // Lighter blue on hover
                                boxShadow: '0px 4px 10px rgba(33, 150, 243, 0.5)', // Soft glow effect
                            } 
                            }}
                        >
                            Next
                        </MDButton>
                    )}

                    {step == 2 && (
                        <MDButton
                            onClick={()=>toPage('/careers')}
                            variant="contained"
                            color="primary"
                            sx={{
                            color: 'white', 
                            transition: 'all 0.3s ease',
                            '& .MuiSvgIcon-root': { color: 'inherit' },
                            '&:hover': {
                                backgroundColor: '#2196f3', // Lighter blue on hover
                                boxShadow: '0px 4px 10px rgba(33, 150, 243, 0.5)', // Soft glow effect
                            } 
                            }}
                        >
                            Home
                        </MDButton>
                    )}

                </MDBox>
            </MDBox>
            <Footer />
        </PageLayout>
    );
}

export default Response;