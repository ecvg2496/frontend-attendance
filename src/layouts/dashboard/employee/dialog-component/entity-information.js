import { AppBar, Card, CardContent, Divider, Icon, Tab, Tabs } from "@mui/material"
import MDBox from "components/MDBox"
import MDTypography from "components/MDTypography"
import { useMaterialUIController } from "context"
import { formatDateTime } from "global/function"
import { isNumber } from "global/function"
import { dataServicePrivate } from "global/function"
import entityData from "./entity-data/entityData"
import moment from "moment"
import { useEffect, useRef, useState } from "react"
import dependentsData from "./entity-data/dependentsData"
import educationData from "./entity-data/educationData"
import experienceData from "./entity-data/experienceData"
import referenceData from "./entity-data/referenceData"
import colors from "assets/theme/base/colors"
import SwipeableViews from "react-swipeable-views"
import detailsData from "./entity-data/detailsData"
import typography from "assets/theme/base/typography"
import MDButton from "components/MDButton"


function EntityInformation({id}) {
    const [controller] = useMaterialUIController()
    const { dialog } = controller

    const { e20 } = colors

    const [entity, setEntity] = useState()
    const [dependents, setDependents] = useState()
    const [education, setEducation] = useState()
    const [experience, setExperience] = useState()
    const [expDetails, setExpDetails] = useState()
    const [details, setDetails] = useState()
    const [reference, setReference] = useState()
    const [step, setStep] = useState(0)
    const swipeRef = useRef()

    useEffect(() => {
        if (id) {
            getEntity()
        }
    },[id])

    const getEntity = () => {
        dataServicePrivate('POST', 'entity/entities/all', {
            filter: [{
                operator: '=',
                target: 'id',
                value: id,
            }],
            relations: [
                'educations', 
                'reference', 
                'dependents',
                'experience',
                {
                    details: {
                        relations: ['platforms']
                    }
                },
            ]
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

            setReference(result['reference'])
            setDetails(result['details'])

            setExperience(result['experience'][0])

            result = result['experience'][0]
            dataServicePrivate('POST', 'entity/experience/details/all', {
                filter: [{
                    operator: '=',
                    target: 'experience_id',
                    value: result.id,
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
            console.log('debug entity error result', err);

        })
    }

    const nextStep = () => {
        setStep(step+1)
        dialog.contentRef?.current.scrollTo(0, 0)
    }
    const prevStep = () => {
        setStep(step-1)
        dialog.contentRef?.current.scrollTo(0, 0)
    }

    const accordHeightChange = () => {
        setTimeout(() => {
            if (swipeRef) swipeRef?.current?.updateHeight()
        }, 500);
    }
    
    useEffect(() => {
        window.addEventListener('scroll', accordHeightChange);

        return () => window.removeEventListener('scroll', accordHeightChange);
    },[])

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
            <MDTypography variant="button" fontWeight="bold" color="black">
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

    var tabs = ['Personal', 'Education', 'Experience', 'Details', 'Reference']
    const content = [
        (<MDBox m={2}>
            {entity && Object.keys(entityData).map((item, index) => renderInfo(entityData[item].label, entity[entityData[item].id], 'MMMM DD, YYYY'))}
            <Divider sx={{ mt: 3 }} />
        </MDBox>),
        (<MDBox m={2}>
            {education && Object.keys(education).map((item, index) => (
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        {Object.keys(educationData).map((_item, _index) => {
                            if (education[item][educationData[_item].id]) {
                                if ( educationData[_item].id == 'education' ) {
                                    var value = education[item][educationData[_item].id]
                                    return (
                                        <MDBox display="flex" py={1} pr={2} justifyContent='center'>
                                            <MDTypography variant="button" fontWeight="bold" textTransform="uppercase" color='black'>
                                                &nbsp;{moment(value).isValid() && typeof value != 'number' && value != '0' ? formatDateTime(value, 'YYYY') : value}
                                            </MDTypography>
                                        </MDBox>
                                    )
                                } else {
                                    return renderInfo(educationData[_item].label, education[item][educationData[_item].id])
                                }
                            }
                        })}
                    </CardContent>
                </Card>
            ))}
            <Divider sx={{ mt: 3 }} />
        </MDBox>),
        experience && <MDBox variant="outlined" m={2}>
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
            <Divider sx={{ mt: 3 }} />
        </MDBox>,
        (<MDBox mx={2}>
            {details && Object.keys(detailsData).map((item, index) => {
                if (detailsData[item].id == 'platforms_id') {
                    return renderOtherDetails(detailsData[item].label, details[0]['platforms']['title'])
                } if (detailsData[item].id == 'government_requirements') {
                    return renderOtherDetailsEmployment(detailsData[item].label, details[0][detailsData[item].id])
                } else {
                    return renderOtherDetails(detailsData[item].label, details[0][detailsData[item].id])
                }
            })}
            <Divider sx={{ mt: 3 }} />
        </MDBox>),
        (<MDBox m={2}>
            {reference && Object.keys(reference).map((item, index) => (
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        {Object.keys(referenceData).map((_item, _index) => reference[item][referenceData[_item].id] && renderInfo(referenceData[_item].label, reference[item][referenceData[_item].id]))}
                    </CardContent>
                </Card>
            ))}
            <Divider sx={{ mt: 3 }} />
        </MDBox>)
    ]

    if (dependents) {
        tabs.splice(1, 0, 'Dependents')
        content.splice(1, 0 , (
            <MDBox m={2}>
                {Object.keys(dependents).map((item, index) => (
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            {Object.keys(dependentsData).map((_item, _index) => renderInfo(dependentsData[_item].label, dependents[item][dependentsData[_item].id], 'MMMM DD, YYYY'))}
                        </CardContent>
                    </Card>
                ))}
                <Divider sx={{ mt: 3 }} />
            </MDBox>
        ))
    }
    console.log('tabs', tabs);

    useEffect(()=> {
        console.log('step', step);
    },[step])

    return id && entity && (
        <MDBox>
            <AppBar position="static" sx={{ mb: 3 }}>
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
                                fontSize: typography.size.xs
                            }}
                        />
                    ))}
                </Tabs>
            </AppBar>
            <SwipeableViews
                index={step}
                animateHeight
                ref={swipeRef}
            >
                {content}
            </SwipeableViews>
            <MDBox mx={2} mt={2} display='flex' justifyContent={step==0 ? 'end' : 'space-between'}>
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
                {step < Object.keys(tabs).length-1 && (
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
            </MDBox>
        </MDBox>
    )
}

export default EntityInformation