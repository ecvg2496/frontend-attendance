import {Card, CardContent, CardHeader, Checkbox, Chip, Container, Dialog, DialogActions, DialogContent, Divider, Icon, IconButton, Link, Step, StepLabel, Stepper, TextField} from "@mui/material";
import Grid from "@mui/material/Grid2";

import PageLayout from "examples/LayoutContainers/PageLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import useAuth from "hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { dataServicePrivate, formatDateTime } from "global/function";
import NavBar from "layouts/content_page/nav_bar";

import MDButton from "components/MDButton";

import { useLocation, useNavigate } from "react-router-dom";
import MDInput from "components/MDInput";

import * as yup from 'yup';
import { Field, FieldArray, Form, Formik, useFormik } from 'formik';
import { generateObjectSchema } from "global/validation";
import { generateYupSchema } from "global/validation";
import { generateFormInput } from "global/form";
import Footer from "examples/Footer";
import SwipeableViews from "react-swipeable-views";
import CareersStepper from "../careers-stepper";
import { useMaterialUIController, setLoading, setDialog } from "context";
import ReferenceInformation from "../reference-information";
import PersonalInformation from "../personal-information";
import { useSnackbar } from "notistack";


function CareerQuestionsForm(){

    // controller
    const [controller, dispatch] = useMaterialUIController()
    const { loading, dialog } = controller

    // local
    const local = localStorage.getItem('answers')
    const removeLocalData = () => {
        localStorage.removeItem('answers')
    }

    // navigation
    const navigate = useNavigate();
    const location = useLocation(); 
    const from = location.state?.from?.pathname || "/careers/personalinfo";
    const prevPage = () => navigate(from, { replace: true })
    const toPage = (url, params={}) => navigate(url, { state: { from: location, ...params }, replace: true })

    const {isAuth, auth} = useAuth();
    const [answers, setAnswers] = useState(local ? JSON.parse(local) : {})
    const [questions, setQuestions] = useState()
    const [step, setStep] = useState(localStorage.getItem('step') != null ? Number(localStorage.getItem('step')) : 0)
    const [answerFormData, setAnswerFormData] = useState()
    const [ref, setRef] = useState()
    const err = useRef()

    const [authCheck, setAuthCheck] = useState(false)
    const [termCheck, setTermCheck] = useState(false)
    const dialogRef = useRef()
    const [scrollBottom, setScrollBottom] = useState(false)
    const [scrollOverflow, setScrollOverflow] = useState(false)

    const swipeRef = useRef()

    const [pageStep, setPageStep] = useState(localStorage.getItem('page') != null ? Number(localStorage.getItem('page')) : 0)
    const pageSwipeRef = useRef()

    const [open, setOpen] = useState(false)
    const [content, setContent] = useState()

    // snackbar nostick
    const { enqueueSnackbar } = useSnackbar()
    
    // must be revice
    const careerId = localStorage.getItem('career_id')
    console.log('career id', careerId);

    const validationSchema = (data) => {
        // init validation
        var yupObject = generateObjectSchema(data)
        var yupSchema = yupObject.reduce(generateYupSchema, {})
        return yup.object().shape(yupSchema)
    }

    var entity_id = auth['id']
    useEffect(() => {

        // fetch career
        dataServicePrivate('POST', 'hr/careers/all', {
            filter: [{
                operator: '=',
                target: 'id',
                value: careerId,
            }],
            relations: ['has', 'questions'],
        }).then((result) => {
            console.log('debug careers result', result);
            result = result.data['careers'][0].has
            generateQuestionsSchema(result)

        }).catch((err) => {
            console.log('debug careers error result', err);

        })

        if ( pageStep == 2 ) {
            handleRefreshPageDialog()
        }

    }, [])

    const getReference = () => {
        dataServicePrivate('POST', 'entity/reference/all', {
            filter: [{
                operator: '=',
                target: 'entity_id',
                value: entity_id,
            }],
        }).then((result) => {
            console.log('debug reference result', result);
            result = result.data['entity_reference']
            setRef(result)

        }).catch((err) => {
            console.log('debug reference error result', err);

        })
    }

    const generateQuestionsSchema = (data) => {
        var schema = []

        // get sections
        var section = []
        Object.keys(data).map((item, index)=>{
            if ( !(data[item].section in section) ) section.push(data[item].section)
        })

        // get questions in order sequence
        section.forEach((item) => {

            var question = []
            for (var i=0; i<Object.keys(data).length; i++) {

                var order = Object.keys(data).findIndex((_item) => data[_item].section == item && data[_item].order == i)
                if ( order>=0 ) {
                    question.push({
                        id: data[order]['questions'].id,
                        label: data[order]['questions'].title,
                        type: data[order]['questions'].type,
                        required: data[order]['questions'].required,
                        ...(
                            data[order]['questions'].type == 'select' 
                            || data[order]['questions'].type == 'check'
                            || data[order]['questions'].type == 'radio'
                            || data[order]['questions'].type == 'file'
                            || data[order]['questions'].type == 'link'
                            // || data[order]['questions'].type == 'label'
                        ) 
                        ? {options: (data[order]['questions'].value).split(', ')} 
                        : {options: data[order]['questions'].value}
                    })

                    continue
                }

            }
            schema.push(question)

        })
        setQuestions(schema)
        console.log('debug question schema', schema);

    }

    useEffect(() => {
        if (answers) {
            const onbeforeunloadFn = () => {
                localStorage.setItem('answers', JSON.stringify(answers))
            }
          
            window.addEventListener('beforeunload', onbeforeunloadFn);
            return () => {
                window.removeEventListener('beforeunload', onbeforeunloadFn);
            }
        }
    },[answers])

    useEffect(() => {
        const onbeforeunloadFn = () => {
            localStorage.setItem('page', pageStep)
        }
      
        window.addEventListener('beforeunload', onbeforeunloadFn);
        return () => {
            window.removeEventListener('beforeunload', onbeforeunloadFn);
        }
    },[pageStep])

    useEffect(() => {
        const onbeforeunloadFn = () => {
            localStorage.setItem('step', step)
        }
      
        window.addEventListener('beforeunload', onbeforeunloadFn);
        return () => {
            window.removeEventListener('beforeunload', onbeforeunloadFn);
        }
    },[step])

    const authorization = (
        <MDBox mt={3}>
            <MDBox display='flex' justifyContent='center'>
                <MDTypography
                    component="a"
                    variant="button"
                    fontWeight="bold"
                    color="info"
                    sx={{ mb: 3 }}
                >
                    Authorization Letter
                </MDTypography>
            </MDBox>
            <MDTypography variant="overline" gutterBottom sx={{ display: 'block', textIndent: '30px', textAlign: 'justify', textJustify: 'inter-word' }}>
                In the course of conducting an investigation into my background, I authorize the Company to contact any government agencies, 
                previous employers, educational institutions, public or private entities, and individuals, as well as the listed references.
            </MDTypography>
            <MDTypography variant="overline" gutterBottom sx={{ display: 'block' }}></MDTypography> 
            <MDTypography variant="overline" gutterBottom sx={{ display: 'block', textIndent: '30px', textAlign: 'justify', textJustify: 'inter-word' }}>
                I authorize the Company to release all background investigation data to the Company's designated hiring officers for use in evaluating
                my application for employment or for continued empoyment. I understand and acknowledge that the information gathered and provided to hiring officers by the 
                Company may be detrimental to my application for employment or continued employment.
            </MDTypography>
            <MDTypography variant="overline" gutterBottom sx={{ display: 'block' }}></MDTypography> 
            <MDTypography variant="overline" gutterBottom sx={{ display: 'block', textIndent: '30px', textAlign: 'justify', textJustify: 'inter-word' }}>
                I also authorize any individual, company, firm, corporation, or public agency to disclose any and all information pertaining to me, whether verbal or written.
                I hereby release from all liability any person, firm, or organization that provides information or records in accordance with this authorization.
            </MDTypography>
            <MDTypography variant="overline" gutterBottom sx={{ display: 'block' }}></MDTypography> 
            <MDTypography variant="overline" gutterBottom sx={{ display: 'block', textIndent: '30px', textAlign: 'justify', textJustify: 'inter-word' }}>
                By signing this document, I give the Company my permission to conduct an initial background check for employment application purposes, as well as any
                subsequent background checks deemed necessary during the course of my employment with the Company.
            </MDTypography>
        </MDBox>
    )

    const term = (
        <MDBox mt={3}>
            <MDBox display='flex' justifyContent='center'>
                <MDTypography
                    component="a"
                    variant="button"
                    fontWeight="bold"
                    color="info"
                    sx={{ mb: 3 }}
                >
                    Terms and Conditions
                </MDTypography>
            </MDBox>
            <MDTypography variant="overline" gutterBottom sx={{ display: 'block', textIndent: '30px', textAlign: 'justify', textJustify: 'inter-word' }}>
                I hereby certify that, to the best of my knowledge, my responses to the questions on this application are correct, 
                and that any dishonesty or falsification may jeopardize my employment application.
            </MDTypography>
            <MDTypography variant="overline" gutterBottom sx={{ display: 'block', textIndent: '30px', textAlign: 'justify', textJustify: 'inter-word' }}>
                I hereby release all persons, companies, or corporations who provide such information from any liability or responsibility. I also 
                agree to submit any future examination that Eighty20 Virtual may require of me and that the foregoing examination questions and answers may be 
                used in any way that the company desires.
            </MDTypography>
            <MDTypography variant="overline" gutterBottom sx={{ display: 'block', textIndent: '30px', textAlign: 'justify', textJustify: 'inter-word' }}>
                I am fully aware of the consequences of non-declaration, untruthfulness, and dishonesty that may result in the termination of my employment contract.
            </MDTypography>
        </MDBox>
    )

    const handleAuthCheck = () => {
        setAuthCheck(true)
        setOpen(false)
        setScrollBottom(false)
    }
    const handleTermCheck = () => {
        setTermCheck(true)
        setOpen(false)
        setScrollBottom(false)
    }

    const AuthLetter = () => (
        <MDBox>
            <MDBox>
                <MDBox display={'flex'} alignItems='center'>
                    <Checkbox
                        sx={{ alignItems: 'unset', pl: 0 }} 
                        required 
                        checked={authCheck}
                        onClick={() => {
                            setContent({ content: authorization, handle: handleAuthCheck });
                            setOpen(true)
                        }}
                    />
                    <MDTypography
                        variant="overline"
                        fontWeight="regular"
                        color="text"
                        sx={{ display: 'block', cursor: 'pointer' }}
                    >
                        I have read, understand and agree to the 
                        <MDTypography
                            component="a"
                            variant="overline"
                            fontWeight="bold"
                            color="info"
                            textGradient
                            sx={{ ml: '4px' }}
                            onClick={() => {
                                setContent({ content: authorization, handle: handleAuthCheck });
                                setOpen(true)
                            }}
                        >
                            Authorization Letter
                        </MDTypography>
                    </MDTypography>
                </MDBox> 
                <MDBox display={'flex'} alignItems='center'>
                    <Checkbox
                        sx={{ alignItems: 'unset', pl: 0 }} 
                        required 
                        checked={termCheck}
                        onClick={() => {
                            setContent({ content: term, handle: handleTermCheck });
                            setOpen(true)
                        }}
                    />
                    <MDTypography
                        variant="overline"
                        fontWeight="regular"
                        color="text"
                        sx={{ display: 'block' }}
                    >
                        I have read, understand and agree to the 
                        <MDTypography
                            component="a"
                            variant="overline"
                            fontWeight="bold"
                            color="info"
                            textGradient
                            sx={{ mx: '4px', cursor: 'pointer' }}
                            onClick={() => {
                                setContent({ content: term, handle: handleTermCheck });
                                setOpen(true)
                            }}
                        >
                            Terms and Conditions
                        </MDTypography>  
                    </MDTypography>
                </MDBox> 
            </MDBox>
        </MDBox>
    )

    const handleNav = (data, opt) => {
        console.log('debug submit', data, opt);

        if ( step == Object.keys(questions).length-1 ) {
            setAnswerFormData(data)
            setPageStep(pageStep+1)
            PageSwipeHeightChange()
            window.scrollTo(0, 0);
        } else {
            opt.setTouched({})
            setStep(step+1)
            PageSwipeHeightChange()
            window.scrollTo(0, 0);
        }

    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (ref && Object.keys(ref).length >= 2) {
            var formData = new FormData()

            Object.keys(answerFormData).map((item, index) => {
                if (answerFormData[item]) {
                    if (Array.isArray(answerFormData[item])) {
                        formData.append(item, answerFormData[item].join(', '))
                    } else {
                        formData.append(item, answerFormData[item])
                    }
                }
            })
            formData.append('entity_id', auth['id'])
            formData.append('careers_id', careerId)

            formData.forEach((item, index) => {
                console.log('debug form data', index, item);
            })

            setLoading(dispatch, true)

            dataServicePrivate('POST', 'hr/careers/entity/submitv2', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }).then((result) => {
                console.log('debug answers define result', result);
                removeLocalData()
                toPage('/careers/submitted')
            }).catch((err) => {
                console.log('debug answers define error result', err);

            }).finally((e) => {
                console.log('debug answers define finally result', e);
                setLoading(dispatch, false)
            })
        } else {
            enqueueSnackbar('Add atleast 2 reference.', {
                variant: 'error',
                preventDuplicate: true,
                anchorOrigin: {
                    horizontal: 'right',
                    vertical: 'top',
                }
            })

            if (err.current) {
                err.current.scrollIntoView({
                    behavior: 'smooth', // Changed to smooth for better experience
                    block: 'center',
                    inline: 'center',
                });
            }
        }
    }

    const SwipeHeightChange = (delay=500) => {
        setTimeout(() => {
            if (swipeRef) swipeRef?.current?.updateHeight()
        }, delay);
    }

    const PageSwipeHeightChange = (delay=500) => {
        setTimeout(() => {
            if (pageSwipeRef) pageSwipeRef?.current?.updateHeight()
        }, delay);
    }
        
    useEffect(() => {
        window.addEventListener('scroll', SwipeHeightChange);
        window.addEventListener('scroll', PageSwipeHeightChange);

        return () => {
            window.removeEventListener('scroll', SwipeHeightChange)
            window.removeEventListener('scroll', PageSwipeHeightChange)
        };
    },[])

    const handleDialogScroll = () => {
        if (dialogRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = dialogRef.current;
            setScrollBottom(scrollTop + clientHeight >= scrollHeight - 10)
        }
    }
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                if (dialogRef.current) {
                    const { scrollHeight, clientHeight } = dialogRef.current;
                    setScrollBottom(scrollHeight <= clientHeight);
                }
            }, 100); 
        }
    },[open])

    const handleDialogClose = () => setDialog(dispatch, {...dialog, open: false})

    const handleRefreshPageDialog = () => {
        setDialog(dispatch, {
            open: true,
            title: (
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
                        Reattach Files
                    </MDTypography>
                </MDBox>
            ),
            content: (
                <MDBox p={2}>
                    <MDTypography variant="body1" color="textSecondary">
                        You've refreshed the page, causing all attached files to be lost. Please reattach them by returning to the career questions section.
                    </MDTypography>
                </MDBox>
            ),
            action: (
                <MDBox p={2} display="flex" justifyContent="flex-end" gap={2}>
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
                            setPageStep(1);
                            setStep(0)
                            handleDialogClose();
                        }}
                    >
                        <Icon sx={{ fontSize: 20 }}>check</Icon>
                        Confirm
                    </MDButton>
                </MDBox>
            ),
        });
    }
    
    const pageStepper = () => {
        setPageStep(pageStep-1); 
        PageSwipeHeightChange();
        SwipeHeightChange();
    }
    const stepper = () => {
        setStep(step-1); 
        PageSwipeHeightChange();
        SwipeHeightChange();
    }

    return (
        <PageLayout>
            <NavBar position='absolute' />
            <Grid container pt={6} pb={3}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <MDBox mt={5} maxWidth="sm" mx='auto'>
                        <Card variant="outlined">
                            {questions && answers &&
                                <SwipeableViews
                                    index={pageStep}
                                    animateHeight
                                    ref={pageSwipeRef}
                                >
                                    <CardContent>
                                        <PersonalInformation update={()=>{setPageStep(pageStep+1); setStep(0);}} updateHeight={()=>{PageSwipeHeightChange(); window.scrollTo(0, 0);}} />
                                    </CardContent>
                                    <CardContent>
                                        <IconButton onClick={()=>{step==0 ? pageStepper() : stepper(), window.scrollTo(0, 0);}}><Icon>keyboard_backspace</Icon></IconButton>
                                        <Formik
                                            initialValues={answers}
                                            validationSchema={validationSchema(questions[step])}
                                            onSubmit={handleNav}
                                        >
                                            {({values, touched, errors, isValid, handleChange, handleBlur, setFieldValue, setFieldTouched}) => (
                                                <Form>
                                                    <SwipeableViews
                                                        index={step}
                                                        animateHeight
                                                        ref={swipeRef}
                                                    >
                                                        {Object.keys(questions).map((item, index) => (
                                                            <FieldArray
                                                                render={arrayHelper => (
                                                                <MDBox>
                                                                    {/* {console.log('values', values)} */}
                                                                    {setAnswers(values)}
                                                                    {Object.keys(questions[item]).map((_item, index) => {
                                                                        var data = questions[item][_item]
                                                                        // console.log('data', data);
                                                                        // universal format
                                                                        // {data.type == 'check' && SwipeHeightChange()}

                                                                        var touch = data.type == 'date' ? typeof touched[data.id] == 'undefined' ? true : touched[data.id] : touched[data.id]
                                                                        var error = data.type == 'date' ? data.required && errors[data.id] : errors[data.id]
                                                                        return (generateFormInput({
                                                                            variant: 'outlined',
                                                                            fullWidth: true,
                                                                            type: data.type,
                                                                            id: data.id,
                                                                            name: data.id,
                                                                            label: data.label,
                                                                            value: values[data.id],
                                                                            required: item == step ? data.required : false,
                                                                            onChange: handleChange,
                                                                            onBlur: handleBlur,
                                                                            setFieldValue,
                                                                            setFieldTouched,
                                                                            error: touch && Boolean(error),
                                                                            helperText: touch && error,
                                                                            options: data.options ? data.options : undefined,
                                                                            heightChange: SwipeHeightChange,
                                                                        }))
                                                                    })}
                                                                    <Divider />
                                                                </MDBox>
                                                                )}
                                                            />
                                                        ))}
                                                    </SwipeableViews>
                                                    <Divider />
                                                    <MDBox style={{ display: 'flex' }} justifyContent={step > 0 ? 'space-between' : 'end'}>
                                                        {step > 0 && (
                                                        <MDButton 
                                                            onClick={() => {setStep(step-1); PageSwipeHeightChange(); window.scrollTo(0, 0);}} 
                                                            sx={{ 
                                                                my: 1,  
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
                                                            startIcon={<Icon sx={{ color: 'white' }}>navigate_before</Icon>}
                                                        >
                                                            Back
                                                        </MDButton>
                                                        )}
                                                        <MDBox>
                                                            <MDButton sx={{ my: 1 }} color='info' type="submit" endIcon={<Icon>navigate_next</Icon>}>
                                                                {step == Object.keys(questions).length-1 ? 'Continue' : 'Next'}
                                                            </MDButton>
                                                        </MDBox>
                                                    </MDBox>
                                                </Form>
                                            )}
                                        </Formik>
                                    </CardContent>
                                    <CardContent>
                                        <IconButton onClick={()=>{setPageStep(pageStep-1); PageSwipeHeightChange(); window.scrollTo(0, 0);}}><Icon>keyboard_backspace</Icon></IconButton>
                                        <ReferenceInformation update={()=>{getReference();}} heightUpdate={()=>{PageSwipeHeightChange(100);}} />
                                        <Divider />
                                        <form onSubmit={handleSubmit}>
                                        <AuthLetter />
                                        <MDButton sx={{ my: 1 }} color='info' fullWidth type='submit' startIcon={<Icon>send</Icon>} >Submit Application</MDButton>
                                        </form>
                                    </CardContent>
                                </SwipeableViews>
                            }
                        </Card>
                    </MDBox>
                </Grid>
                <Grid display={{ xs: 'none', lg: 'block' }} size={{ lg: 5 }}>
                    <CareersStepper activeStep={pageStep} orientation='vertical' position='fixed' />
                </Grid>
            </Grid>
            <Footer />
            <Dialog
                open={open}
                sx={{ overflowY: "auto" }}
            >
                <DialogContent ref={dialogRef} onScroll={handleDialogScroll}>{content?.content}</DialogContent>
                <DialogActions>
                    <MDButton onClick={()=>setOpen(false)} color='error'>Close</MDButton>
                    <MDButton color='success' disabled={!scrollBottom} onClick={content?.handle}>
                        Agree
                    </MDButton>
                </DialogActions>
            </Dialog>
        </PageLayout>
    );
}

export default CareerQuestionsForm;