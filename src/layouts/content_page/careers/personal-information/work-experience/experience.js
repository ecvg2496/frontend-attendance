import {Card, CardContent, Chip, Container, Divider, Icon, IconButton, Link, TextField} from "@mui/material";
import Grid from "@mui/material/Grid2";

import PageLayout from "examples/LayoutContainers/PageLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import useAuth from "hooks/useAuth";
import { useEffect, useState } from "react";
import { dataServicePrivate, formatDateTime } from "global/function";
import NavBar from "layouts/content_page/nav_bar";

import MDButton from "components/MDButton";

import { useLocation, useNavigate } from "react-router-dom";

import * as yup from 'yup';
import { FieldArray, Form, Formik } from 'formik';
import experienceData from "./experienceData";
import { generateObjectSchema } from "global/validation";
import { generateYupSchema } from "global/validation";
import { generateFormInput } from "global/form";
import Footer from "examples/Footer";
import moment from "moment";


function ExperienceForm({ data, update }){

    // navigation
    const navigate = useNavigate();
    const location = useLocation(); 
    const from = location.state?.from?.pathname || "/careers/personalinfo";
    const prevPage = () => navigate(from, { replace: true })
    const toPage = (url) => navigate(url, { state: { from: location }, replace: true })

    // get id from uselocation
    // const id = location.state?.id || null
    // console.log('location id', id);

    const {isAuth, auth} = useAuth();
    const [workId, setWorkId] = useState()
    const [experience, setExperience] = useState()
    const [stayLength, setStayLength] = useState()
    const [endDate, setEndDate] = useState()
    var entity_id = auth['id']

    const local = localStorage.getItem('experience')
    const removeLocal = () => {
        localStorage.removeItem('experience')
    }

    const localList = localStorage.getItem('experienceList')

    // init validation
    var yupObject = generateObjectSchema(experienceData)
    var yupSchema = yupObject.reduce(generateYupSchema, {})
    var validationSchema = yup.object().shape(yupSchema)

    useEffect(() => {
        console.log('exp detail', data);
        var detail = {}
        if (data && data['data']) {
            detail = data['data']
        } if (local) {
            detail = JSON.parse(local)
        } else {
            localStorage.setItem('experience', JSON.stringify(detail))
        }

        setExperience(detail)
        // fetch experience
        // dataServicePrivate('POST', 'entity/experience/all', {
        //     filter: [{
        //         operator: '=',
        //         target: 'entity_id',
        //         value: entity_id,
        //     }],
        //     relations: ['details'],
        // }).then((result) => {
        //     console.log('debug experience result', result);
        //     result = result.data['experience'][0]
        //     setWorkId(result['id'])
        //     var detail = {}
        //     Object.keys(result['details']).map((item, index) => {
        //         if (result['details'][item].id == id) detail = result['details'][item] 
        //     })
        //     if (local) {
        //         detail = JSON.parse(local)
        //     } else {
        //         localStorage.setItem('experience', JSON.stringify(detail))
        //     }

        //     // const blacklist = ['id', 'description', 'deleted_at', 'created_at', 'updated_at']
        //     // blacklist.forEach((item) => {
        //     //     if (item in detail) delete detail[item]
        //     // })
        //     setExperience(detail)

        // }).catch((err) => {
        //     console.log('debug experience error result', err);

        // })

    }, [])

    useEffect(() => {
        if (experience) {
            const onbeforeunloadFn = () => {
                localStorage.setItem('experience', JSON.stringify(experience))
            }
          
            window.addEventListener('beforeunload', onbeforeunloadFn);
            return () => {
                window.removeEventListener('beforeunload', onbeforeunloadFn);
            }
        }
    },[experience])

    const handleSubmit = (submitData) => {
        var submit = {...submitData, 'stay_length': stayLength}
        console.log('data', submitData);
        if (submitData?.present) submit['end_date'] = null
        console.log('local list', localList, submit, data);
        if ( data['index'] != null ) {
            var temp = [...JSON.parse(localList)]
            temp.splice(data['index'], 1, submit)
            localStorage.setItem('experienceList', JSON.stringify(temp))
        } else {
            var temp = [...(localList && JSON.parse(localList)), submit]
            localStorage.setItem('experienceList', JSON.stringify(temp))
        }
        removeLocal()
        update()

        // dataServicePrivate('POST', 'entity/experience/details/define', submit).then((result) => {
        //     console.log('debug experience define result', result);
        //     removeLocal()
        //     update()
        // }).catch((err) => {
        //     console.log('debug experience define error result', err);

        // })
    }

    return (
        <MDBox>
            {experience && <Formik
                initialValues={experience}
                validationSchema={validationSchema}
                onSubmit={(data) => {
                    handleSubmit(data)
                }}
            >
                {({values, touched, errors, isValid, handleChange, handleBlur, setFieldValue, setFieldTouched}) => (
                    <Form>
                        <FieldArray
                            render={arrayHelper => (
                            <MDBox>
                                {setExperience(values)}
                                {console.log('values', values, isValid)}
                                {Object.keys(experienceData).map((item, index) => {
                                    var disabled = false
                                    if ( experienceData[item].id == 'end_date' && 'present' in values ) {
                                        disabled = values.present
                                        Object.keys(experienceData).map((item, index) => {
                                            if (values.present) {
                                                setEndDate(values['end_date'])
                                                delete values['end_date']
                                            } else {
                                                if (endDate) values['end_date'] = endDate
                                            }
                                        })
                                    }

                                    var stay_length = `0 year & 0 month`
                                    if ( 'start_date' in values && ('end_date' in values || ('present' in values && (values.present))) ) {
                                        var start = moment(values.start_date)
                                        var end = ''

                                        if ( 'end_date' in values ) end = moment(values.end_date)
                                        if ( 'present' in values && (values.present) ) end = moment()

                                        var years = end.diff(start, 'year')
                                        start.add(years, 'years')

                                        var months = end.diff(start, 'months')
                                        start.add(months, 'months')

                                        if ( start && end ) stay_length = `${years} ${years>1?'years':'year'} & ${months} ${months>1?'months':'month'}`
                                        setStayLength(stay_length)
                                    }

                                    // universal format
                                    var touch = experienceData[item].type == 'date' ? typeof touched[experienceData[item].id] == 'undefined' ? true : touched[experienceData[item].id] : touched[experienceData[item].id]
                                    var error = experienceData[item].type == 'date' ? !(disabled) && errors[experienceData[item].id] : errors[experienceData[item].id]

                                    if ( experienceData[item].id == 'present' ) {
                                        return (
                                            <MDBox display='flex' justifyContent='space-between' alignItems='center'>
                                                {generateFormInput({
                                                    variant: 'outlined',
                                                    fullWidth: true,
                                                    disabled,
                                                    type: experienceData[item].type,
                                                    id: experienceData[item].id,
                                                    name: experienceData[item].id,
                                                    label: experienceData[item].label,
                                                    value: values[experienceData[item].id],
                                                    required: experienceData[item].required,
                                                    onChange: handleChange,
                                                    onBlur: handleBlur,
                                                    setFieldValue,
                                                    setFieldTouched,
                                                    error: touched[experienceData[item].id] && Boolean(errors[experienceData[item].id]),
                                                    helperText: touched[experienceData[item].id] && errors[experienceData[item].id],
                                                    options: experienceData[item].options ? experienceData[item].options : undefined
                                                })}
                                                <MDTypography sx={{ mx: 2 }} variant='button'>Length of stay: {stay_length}</MDTypography>
                                            </MDBox>
                                        )
                                    } else {
                                        return (generateFormInput({
                                            variant: 'outlined',
                                            fullWidth: true,
                                            disabled,
                                            type: experienceData[item].type,
                                            id: experienceData[item].id,
                                            name: experienceData[item].id,
                                            label: experienceData[item].label,
                                            value: values[experienceData[item].id],
                                            required: experienceData[item].required,
                                            onChange: handleChange,
                                            onBlur: handleBlur,
                                            setFieldValue,
                                            setFieldTouched,
                                            error: touch && Boolean(error),
                                            helperText: touch && error,
                                            options: experienceData[item].options ? experienceData[item].options : undefined
                                        }))
                                    }
                                })}
                            </MDBox>
                            )}
                        />
                        <MDButton sx={{ my: 1 }} color='info' fullWidth type='submit'startIcon={<Icon>save</Icon>}> Save</MDButton>
                    </Form>
                )}
            </Formik>}
        </MDBox>
    );
}

export default ExperienceForm;