import {Card, CardContent, Chip, CircularProgress, Container, Divider, Icon, IconButton, Link, TextField} from "@mui/material";
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
import MDInput from "components/MDInput";
import CareersStepper from "../../careers-stepper";
import { useSnackbar } from "notistack";

import * as yup from 'yup';
import { Field, FieldArray, Form, Formik, useFormik } from 'formik';
import entityData from "./entityData";
import { generateObjectSchema } from "global/validation";
import { generateYupSchema } from "global/validation";
import { generateFormInput } from "global/form";
import Footer from "examples/Footer";
import moment from "moment";
import { useMaterialUIController, setDialog } from "context";


function PersonalForm({ update }){
    const [controller, dispatch] = useMaterialUIController();
    const { dialog } = controller;

    // navigation
    const navigate = useNavigate();
    const location = useLocation(); 
    const from = location.state?.from?.pathname || "/";
    const prevPage = () => navigate(from, { replace: true })
    const toPage = (url) => navigate(url, { state: { from: location }, replace: true })

    const {isAuth, auth} = useAuth();
    const [entity, setEntity] = useState()
    const [age, setAge] = useState()

    const localEntity = localStorage.getItem('entity')
    const removeLocalEntity = () => {
        localStorage.removeItem('entity')
    }

    // init validation
    var yupObject = generateObjectSchema(entityData)
    var yupSchema = yupObject.reduce(generateYupSchema, {})
    var validationSchema = yup.object().shape(yupSchema)

     // snackbar nostick
        const { enqueueSnackbar } = useSnackbar()
        const snackBar = (title, error) => {
            enqueueSnackbar(title, {
                variant: error,
                preventDuplicate: true,
                anchorOrigin: {
                    horizontal: 'right',
                    vertical: 'top',
                }
            })
        }

    useEffect(() => {
        var entity_id = auth['id']

        // fetch entity
        dataServicePrivate('POST', 'entity/entities/all', {
            filter: [{
                operator: '=',
                target: 'id',
                value: entity_id,
            }],
        }).then((result) => {
            console.log('debug entity result', result);
            result = result.data['entity'][0]
            if (localEntity) {
                result = JSON.parse(localEntity)
            } else {
                localStorage.setItem('entity', JSON.stringify(result))
            }

            setEntity(result)

        }).catch((err) => {
            console.log('debug entity error result', err);

        })

    }, [])

    useEffect(() => {
        if (entity) {
            const onbeforeunloadFn = () => {
                localStorage.setItem('entity', JSON.stringify(entity))
            }
          
            window.addEventListener('beforeunload', onbeforeunloadFn);
            return () => {
                window.removeEventListener('beforeunload', onbeforeunloadFn);
            }
        }
    },[entity])    

    const handleSubmit = (data) => {
        if(age < 18){
            snackBar(`Please enter a valid age as your current age of ${age} is less than 18 years old.`,`error`)
            return;
        }
        else{
            dataServicePrivate('POST', 'entity/entities/define', {...data, age}).then((result) => {
                console.log('debug entity define result', result);
                removeLocalEntity()
                update()
                setDialog(dispatch, { ...dialog, open: false });
                // navigate('/careers/personalinfo', { replace: true })
            }).catch((err) => {
                console.log('debug entity define error result', err);
    
            })
        }
    }

    return (
        <MDBox>
            {!entity ? <MDBox display='flex' justifyContent='center'><CircularProgress size="3rem" /></MDBox> : <Formik
                initialValues={entity}
                validationSchema={validationSchema}
                onSubmit={(data) => {
                    console.log(data)
                    handleSubmit(data)
                }}
            >
                {({values, touched, errors, isValid, handleChange, handleBlur, setFieldValue, setFieldTouched}) => (
                    <Form>
                        <FieldArray
                            render={arrayHelper => (
                            <MDBox>
                                {setEntity(values)}
                                {Object.keys(entityData).map((item, index) => {
                                    // console.log('values', values);
                                    // universal format
                                    var touch = entityData[item].type == 'date' ? typeof touched[entityData[item].id] == 'undefined' ? true : touched[entityData[item].id] : touched[entityData[item].id]
                                    var error = entityData[item].type == 'date' ? entityData[item].required && errors[entityData[item].id] : errors[entityData[item].id]
                                    if ( entityData[item].id == 'birthday' ) {
                                        var age = 0
                                        if ( values?.birthday ) {
                                            age = moment().diff(values.birthday, 'years')
                                            setAge(age)
                                        }

                                        return (
                                            <MDBox my={2} display='flex' justifyContent='space-between' alignItems='center'>
                                                {generateFormInput({
                                                    variant: 'outlined',
                                                    fullWidth: false,
                                                    type: entityData[item].type,
                                                    id: entityData[item].id,
                                                    name: entityData[item].id,
                                                    label: entityData[item].label,
                                                    value: values[entityData[item].id],
                                                    required: entityData[item].required,
                                                    sx: [{ my: 0 }],
                                                    onChange: handleChange,
                                                    onBlur: handleBlur,
                                                    setFieldValue,
                                                    setFieldTouched,
                                                    error: touch && Boolean(error),
                                                    helperText: touch && error,
                                                    options: entityData[item].options ? entityData[item].options : undefined
                                                })}
                                                <MDTypography sx={{ mx: 2 }} variant='button' color={age < 18 ? 'error' : 'inherit'}>Age: {age} years old</MDTypography>
                                            </MDBox>
                                        )
                                    } else {
                                        return (generateFormInput({
                                            variant: 'outlined',
                                            fullWidth: true,
                                            type: entityData[item].type,
                                            id: entityData[item].id,
                                            name: entityData[item].id,
                                            label: entityData[item].label,
                                            value: values[entityData[item].id],
                                            required: entityData[item].required,
                                            onChange: handleChange,
                                            onBlur: handleBlur,
                                            setFieldValue,
                                            setFieldTouched,
                                            error: touch && Boolean(error),
                                            helperText: touch && error,
                                            options: entityData[item].options ? entityData[item].options : undefined
                                        }))
                                    }
                                })}  
                            </MDBox>
                            )}
                        />
                        <MDButton sx={{ my: 1 }} color='info' fullWidth type='submit' startIcon={<Icon>save</Icon>}>Save</MDButton>
                    </Form>
                )}
            </Formik>}
        </MDBox>
    );
}

export default PersonalForm;