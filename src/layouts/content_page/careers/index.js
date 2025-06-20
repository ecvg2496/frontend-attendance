import { Card, Container, Divider, Modal, Fade, Backdrop, FormControl, InputLabel, MenuItem, Select, NativeSelect, useTheme, 
    FormControlLabel, FormLabel, RadioGroup, Radio, FormGroup, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, CardContent, Button, Box, Alert, Stack, Icon,
    Link,
    IconButton,
    DialogContentText,
    Tooltip,
    CardHeader,
    CircularProgress} from "@mui/material";
import Grid from "@mui/material/Grid";

import PageLayout from "examples/LayoutContainers/PageLayout";
import NavBar from "../nav_bar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import useAuth from "hooks/useAuth";
import { useNavigate, useLocation, useFetcher } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "api/axios";
import MDInput from "components/MDInput";
import { axiosPrivate } from "api/axios";
import { DatePicker } from "@mui/x-date-pickers";
import Notifications from "../../notifications/dynamic-notification";
import Sticky from 'react-sticky-el';
import { useSnackbar } from "notistack";
import MDAlert from "components/MDAlert";
import moment, { ISO_8601 } from "moment";

import e20logo from 'assets/images/e20/Eighty_20_shadow_2_transparent.png'
import e20logo_black from 'assets/images/e20/EIGHT 20 LOGO.jpg'
import smiley1 from 'assets/images/icons/smiley icon1.png'
import smiley2 from 'assets/images/icons/smiley icon2.png'
import smiley3 from 'assets/images/icons/smiley icon3.png'

import SwipeableViews from "react-swipeable-views";
import FileUpload from "./file-upload";
import { dataServicePrivate, dataService } from "global/function";



function Careers(){

    const { isAuth, auth } = useAuth();

    // navigation
    const navigate = useNavigate();
    const location = useLocation(); 
    const from = location.state?.from?.pathname || "/";
    const prevPage = () => navigate(from, { replace: true })
    const toPage = (url, params={}) => navigate(url, { state: { from: location, ...params }, replace: true })

    const mainKey = location.state?.key 
    console.log('key', mainKey);

    const [careers, setCareers] = useState();
    const [content, setContent] = useState(null);
    const [hasCareers, setHasCareers] = useState({})

    const handleRedirection = (e) =>{
        e.preventDefault();

        navigate('/authentication/sign-in', { state: { from: location }, replace: true });
    }

    useEffect(() => {
        const getCareers = async () => {
            try {
                const response = await axios.post('hr/careers/all', {
                    filter: [
                        {
                            target: 'status',
                            operator: '=',
                            value: 'active',
                        }
                    ],
                    relations: ["has", "questions"],
                    order: [{
                        target: 'posted_at',
                        value: 'desc'
                    }],
                });
                setCareers(response.data['careers'])
                console.log("debug careers", response.data);
                
            } catch (err) {
                console.log("debug careers error", err);
            }
        }

        getCareers();
        entityCareers()

        localStorage.removeItem('page')
        localStorage.removeItem('step')
        localStorage.removeItem('answers')

    }, [])

    const entityCareers = () => {
        if (isAuth) {
            dataServicePrivate('POST', 'hr/careers/entity/all', {
                filter: [
                    {
                        'operator': '=',
                        'target': 'entity_id',
                        'value': auth['id'],
                    },
                ],
            }).then((result) => {
                console.log('debug careers entity result', result);
                setHasCareers(result.data['entity_career'])
            }).catch((err) => {
                console.log('debug carrrers entity error result', err);
                
            })
        }
    }

    useEffect(() => {
        if (careers && mainKey != undefined) careerHandle(mainKey)
    }, careers, mainKey)

    const careerHandle = (key) => {
        var button = (<MDButton onClick={isAuth ? () => {
            // handleOpen();
            // startTimer();
            localStorage.setItem('career_id', careers[key].id)
            toPage('/careers/questions')
        } : handleRedirection} variant="gradient" color="info" py="2rem" px="3rem" sx={{ fontSize: 30, fontWeight: 'bold' }}>
            Apply
        </MDButton>)
        var exist = false
        Object.keys(hasCareers).map((item, index) => {
            if (hasCareers[item].careers_id == careers[key].id) {
                // exist = true
            }
        })

        if (exist) {
            button = (<MDButton disabled variant="gradient" color="info" py="2rem" px="3rem" sx={{ fontSize: 30, fontWeight: 'bold' }}>
                Applied
            </MDButton>)
        }

        setContent(
            <MDBox px="2rem">
                <MDBox mb="3rem">
                    <MDTypography color='info' fontWeight="bold" sx={{ fontSize: 50, lineHeight: .9 }} >{careers[key].title}</MDTypography>
                    <Divider />
                    <MDTypography>Job type: {careers[key].type}</MDTypography>
                    <MDTypography>Work hours: {careers[key].benifits}</MDTypography>
                    <MDTypography>Preferred Experience: {careers[key].experience}</MDTypography>
                    <MDTypography>Salary Rate: {careers[key].salary}</MDTypography>
                    <MDBox mt="2rem">{button}</MDBox>
                </MDBox>
                <MDTypography><div dangerouslySetInnerHTML={{__html: careers[key].descriptions}} /></MDTypography>
            </MDBox>
        );

    }

    return (
        <PageLayout>
            <Container maxWidth="xl">
                <NavBar />
                <MDBox pt="5rem">
                    <Grid container>
                        <Grid xs={4}>
                            {
                                careers && Object.keys(careers).map((key, item) => (
                                    <Card sx={{ my: '1rem' }} onClick={() => careerHandle(key)} key={item}>
                                        <MDBox p="2rem">
                                            <MDTypography color='info' fontWeight="bold" sx={{ fontSize: 30, lineHeight: .9 }} >{careers[key].title}</MDTypography>
                                            <Divider />
                                            <MDTypography>Job type: {careers[key].type}</MDTypography>
                                            <MDTypography>Work hours: {careers[key].benifits}</MDTypography>
                                            <MDTypography>Preferred Experience: {careers[key].experience}</MDTypography>
                                            <MDTypography>Salary Rate: {careers[key].salary}</MDTypography>
                                        </MDBox>
                                    </Card>
                                ))
                            }
                        </Grid>
                        <Grid xs={8}>
                            <Sticky>
                                <MDBox p="2rem" sx={{ overflowY: 'scroll', height: '100vh' }}>
                                    {
                                        content ? content :
                                        <MDBox position="relative">
                                            <MDBox display="flex" justifyContent="center" >
                                                <MDBox component='img' src={e20logo} width="75%" height="75%" opacity=".1" />
                                                <MDBox position='absolute' sx={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                                    <MDTypography align="center" fontWeight="medium" sx={{ fontSize: 30, lineHeight: .9, textShadow: '1px 1px 1px rgba(0, 0, 0, .2)' }} >You haven&lsquo;t selected a career</MDTypography>
                                                    <MDTypography align="center" sx={{ textShadow: '1px 1px 1px rgba(0, 0, 0, .2)' }}>Select a career on the left to see the details here</MDTypography>
                                                </MDBox>
                                            </MDBox>
                                        </MDBox>
                                    }
                                </MDBox>
                            </Sticky>
                        </Grid>
                    </Grid>
                </MDBox>
            </Container>
        </PageLayout>
    );
}

export default Careers;