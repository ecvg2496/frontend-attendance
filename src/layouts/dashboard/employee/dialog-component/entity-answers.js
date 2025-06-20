import { AppBar, Card, CardContent, Chip, Divider, Icon, Link, Tab, Tabs } from "@mui/material"
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
import AudioPlayer from 'react-h5-audio-player'
import ImageView from "../image-viewer"
import MDButton from "components/MDButton"
import useAuth from "hooks/useAuth"


function EntityAnswers({id}) {
    const [controller] = useMaterialUIController()
    const { dialog } = controller

    const { e20 } = colors
    const {isAuth, auth} = useAuth();

    const [answers, setAnswers] = useState()
    const [step, setStep] = useState(0)
    const swipeRef = useRef()

    useEffect(() => {
        if (id) {
            getEntityAnswers()
        }
    },[id])

    const getEntityAnswers = () => {
        console.log('id', id);

        dataServicePrivate('POST', 'hr/careers/answers/all', {
            filter: [
                {
                    operator: '=',
                    target: 'entitycareer_id',
                    value: id,
                },
            ],
            relations: ['files', 'question'],
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
            console.log('debug career answers result', result);
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
            console.log('debug career entity error result', err);

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

    var tabs = ['Information', 'Education', 'Experience', 'Details', 'Reference']

    return id && answers && (
        <MDBox>
            <AppBar position="static" sx={{ mb: 3 }}>
                <Tabs value={step} onChange={(e, val) => {setStep(val); accordHeightChange();}}>
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
                index={step}
                animateHeight
                ref={swipeRef}
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
                {step < Object.keys(answers).length-1 && (
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

export default EntityAnswers