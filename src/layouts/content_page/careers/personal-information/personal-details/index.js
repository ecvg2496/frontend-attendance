import {Button, Card, CardContent, Checkbox, Chip, Container, Divider, FormControl, Icon, IconButton, InputLabel, Link, ListItemText, MenuItem, OutlinedInput, Select, TextField} from "@mui/material";
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

import * as yup from 'yup';
import { Field, FieldArray, Form, Formik, useFormik } from 'formik';
import schema from "./detailsData";
import { generateObjectSchema } from "global/validation";
import { generateYupSchema } from "global/validation";
import { generateFormInput } from "global/form";
import Footer from "examples/Footer";
import { CheckboxField } from "./components/check-box";
import { useMaterialUIController, setDialog } from "context";


function PersonalDetailsForm({ update }){
    const [controller, dispatch] = useMaterialUIController();
    const { dialog } = controller;

    // navigation
    const navigate = useNavigate();
    const location = useLocation(); 
    const from = location.state?.from?.pathname || "/";
    const prevPage = () => navigate(from, { replace: true })
    const toPage = (url) => navigate(url, { state: { from: location }, replace: true })

    const {isAuth, auth} = useAuth();
    const [entityDetails, setEntityDetails] = useState()

    const localEntityDetails = localStorage.getItem('entity_details')
    const removeLocalEntityDetails = () => {
        localStorage.removeItem('entity_details')
    }

    // init validation
    var yupObject = generateObjectSchema(schema)
    var yupSchema = yupObject.reduce(generateYupSchema, {})
    var validationSchema = yup.object().shape(yupSchema)

    useEffect(() => {
        var entity_id = auth['id']

        // fetch platforms
        dataServicePrivate('POST', 'hr/careers/platform/all', {
            exclude: [
                {
                    'operator': '=',
                    'target': 'status',
                    'value': 'close',
                }
            ],
        }).then((result) => {
            console.log('debug careers platform result', result);
            result = result.data['career_platforms']
            var tempPlatforms = []
            result.forEach((value) => tempPlatforms.push(value))
            schema[schema.findIndex((e) => e.id == 'platforms_id')]['options'] = tempPlatforms
        }).catch((err) => {
            console.log('debug careers platform error result', err);
        
        })

        // fetch entity details
        dataServicePrivate('POST', 'entity/details/all', {
            filter: [{
                operator: '=',
                target: 'entity_id',
                value: entity_id,
            }],
        }).then((result) => {
            console.log('debug entity details result', result);
            result = result.data['entity_details'][0]
            if (localEntityDetails) {
                result = JSON.parse(localEntityDetails)
            } else {
                localStorage.setItem('entity_details', JSON.stringify(result))
            }

            setEntityDetails(result)

        }).catch((err) => {
            console.log('debug entity details error result', err);

        })

    }, [])

    useEffect(() => {
        if (entityDetails) {
            const onbeforeunloadFn = () => {
                localStorage.setItem('entity_details', JSON.stringify(entityDetails))
            }
          
            window.addEventListener('beforeunload', onbeforeunloadFn);
            return () => {
                window.removeEventListener('beforeunload', onbeforeunloadFn);
            }
        }
    },[entityDetails])

    const handleSubmit = (data) => {
        dataServicePrivate('POST', 'entity/details/define', data).then((result) => {
            console.log('debug entity details define result', result);
            removeLocalEntityDetails()
            update()
            setDialog(dispatch, { ...dialog, open: false });
        }).catch((err) => {
            console.log('debug entity details define error result', err);

        })
    }

    return (
        <MDBox>
            {entityDetails && <Formik
                initialValues={entityDetails}
                validationSchema={validationSchema}
                onSubmit={(data) => {
                    console.log('submit data', data)
                    handleSubmit(data)
                }}
            >
                {({values, touched, errors, isValid, handleChange, handleBlur, setFieldValue, setFieldTouched}) => (
                    <Form>
                        <FieldArray
                            render={arrayHelper => (
                            <MDBox>
                                {setEntityDetails(values)}
                                {console.log('values', values)}
                                {Object.keys(schema).map((item, index) => {
                                    var touch = schema[item].type == 'date' ? typeof touched[schema[item].id] == 'undefined' ? true : touched[schema[item].id] : touched[schema[item].id]
                                    var error = schema[item].type == 'date' ? schema[item].required && errors[schema[item].id] : errors[schema[item].id]

                                    if ( schema[item].id == 'government_requirements' ) {

                                        // const sx = { my: 2};
                                        const props = {
                                            variant: 'outlined',
                                            fullWidth: true,
                                            type: schema[item].type,
                                            id: schema[item].id,
                                            name: schema[item].id,
                                            label: schema[item].label,
                                            value: values[schema[item].id],
                                            required: schema[item].required,
                                            onBlur: handleBlur,
                                            setFieldValue,
                                            setFieldTouched,
                                            error: touch && Boolean(error),
                                            helperText: touch && error,
                                            options: schema[item].options ? schema[item].options : undefined
                                        }
                                        props['sx'] = { p: '16.5px 14px' }
                                        props['value'] =
                                            props['value'] && typeof props['value'] === 'string'
                                                ? props['value'].split(', ')
                                                : props['value'] || [];
                                        const handleChange = (e) => {
                                            const {
                                                target: { value },
                                            } = e;
                                            setFieldValue(
                                                props.id,
                                                typeof value === 'string' ? value.split(', ') : value.join(', '),
                                                props.required
                                            );
                                        };
                                        return <CheckboxField props={props} handleChange={handleChange} />;

                                    } else {
                                        return (generateFormInput({
                                            variant: 'outlined',
                                            fullWidth: true,
                                            type: schema[item].type,
                                            id: schema[item].id,
                                            name: schema[item].id,
                                            label: schema[item].label,
                                            value: values[schema[item].id],
                                            required: schema[item].required,
                                            onChange: handleChange,
                                            onBlur: handleBlur,
                                            setFieldValue,
                                            setFieldTouched,
                                            error: touch && Boolean(error),
                                            helperText: touch && error,
                                            options: schema[item].options ? schema[item].options : undefined
                                        }))
                                    }
                                })}
                            </MDBox>
                            )}
                        />
                        <MDButton sx={{ my: 1 }} color='info' fullWidth type='submit' startIcon={<Icon>save</Icon>} >Save</MDButton>
                    </Form>
                )}
            </Formik>}
        </MDBox>
    );
}

export default PersonalDetailsForm;