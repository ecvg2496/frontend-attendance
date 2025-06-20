/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Fade, FormControl, Typography, InputLabel, MenuItem, Modal, Select, Backdrop, Divider, Tooltip, Icon, FormLabel, 
    FormGroup, FormControlLabel, Checkbox, RadioGroup, Radio, Popover, Dialog, DialogContent, DialogActions, DialogTitle, IconButton, CardContent, CardHeader, Chip, 
    Link,
    Popper,
    Paper,
    Grow,
    MenuList,
    ClickAwayListener,
    Menu,
    ListItemIcon,
    useMediaQuery,
    useTheme,
    CircularProgress,
    Snackbar} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import useAuth from "hooks/useAuth";
import { useEffect, useMemo, useState } from "react";
import { axiosPrivate } from "api/axios";
import team3 from "assets/images/team-3.jpg";
import burceMars from "assets/images/bruce-mars.jpg";
import { LocalConvenienceStoreOutlined } from "@mui/icons-material";
import MDInput from "components/MDInput";
import moment from "moment";

import PersonIcon from "@mui/icons-material/Person";
import BadgePopper from "./badge-popper";

import { useSnackbar } from "notistack";
import ImgsViewer from 'react-images-viewer';
import { dataServicePrivate } from "global/function";
import { ChromePicker } from 'react-color'
import ConfirmDialog from "../dynamic/confirm-dialog";
import ImageView from "./image-viewer";
import AudioPlayer from 'react-h5-audio-player';
import GenerateExel from "./generate-exel";
import { DateRangePicker } from "react-date-range";
import { useMaterialUIController, setDialog } from "context";

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { isSameDay, startOfDay } from "date-fns";
import entityData from "./entityData";
import { DateRangeFilterColumnFN, DateRangeFilterFN } from "./filter/filter-fn";
import PopupState, { bindPopper, bindToggle } from "material-ui-popup-state";
import EntityDelete from "./dialog-component/entity-delete";
import EntityInformation from "./dialog-component/entity-information";
import EntityAnswers from "./dialog-component/entity-answers";
import { useLocation, useNavigate } from "react-router-dom";


function Employee() {
    const [controller, dispatch] = useMaterialUIController()
    const { dialog } = controller

    const theme = useTheme()
    const maxWidth = useMediaQuery(theme.breakpoints.up('lg'))

    // navigation
    const navigate = useNavigate();
    const location = useLocation(); 
    const from = location.state?.from?.pathname || "/";
    const prevPage = () => navigate(from, { replace: true })
    const toPage = (url, params={}) => navigate(url, { state: { from: location, ...params }, replace: true })
    
    const [recruit, setRecruit] = useState();
    const [tags, setTags] = useState()
    const [platforms, setPlatforms] = useState()

    const [rows, setRows] = useState([]);

    // menu
    const [menuState, setMenuState] = useState(null)
    const [menuId, setMenuId] = useState()
    const menuOpen = Boolean(menuState)

    // menu platform
    const [menuPlatformState, setMenuPlatformState] = useState(null)
    const [menuPlatformId, setMenuPlatformId] = useState()
    const menuPlatformOpen = Boolean(menuPlatformState)
    const [menuPlatformOptions, setMenuPlatformOptions] = useState([])
    const [menuPlatformDisable, setMenuPlatformDisable] = useState(false)
    const [menuPlatformLoading, setMenuPlatformLoading] = useState(0)

    // menu tags
    const [menuTagState, setMenuTagState] = useState(null)
    const [menuTagId, setMenuTagId] = useState()
    const menuTagOpen = Boolean(menuTagState)
    const [menuTagOptions, setMenuTagOptions] = useState([])
    const [menuTagDisable, setMenuTagDisable] = useState(false)
    const [menuTagLoading, setMenuTagLoading] = useState(0)

    // tag prev submit snackbar
    const [snackTag, setSnackTag] = useState(false)
    const [tagPrevId, setTagPrevId] = useState()

    const handleOpenSnackTag = () => setSnackTag(true)
    const handleCloseSnackTag = () => setSnackTag(false)

    // snackbar nostick
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

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

    const formatDateTime = ( date='', output = 'YYYY-MM-DD HH:mm:ss') => {
        return moment( date ).format( output );
    }

    useEffect(() => {
        getInit()
        getTags()
        getPlatforms()

    },[]);

    // revice generate excel
    const getEntityExperience = (id) => {
        dataServicePrivate('POST', 'entity/experience/all', {
            filter: [
                {
                    operator: '=',
                    target: 'entity_id',
                    value: id,
                },
            ],
            relations: ['details']
        }).then((result) => {
            console.log('debug entity experience result:', result);
            return result.data['experience']
            
        }).catch((err) => {
            console.log('debug entity experience error result:', err);
            
        })
    }

    const getInit = () => {
        getRecruit()
    }

    const getPlatforms = () => {
        dataServicePrivate('POST', 'hr/careers/platform/all', {}).then((result) => {
            console.log('debug platform result:', result);
            result = result.data['career_platforms']
            setPlatforms(result)
        }).catch((err) => {
            console.log('debug platform error result:', err);
            
        })
    }

    useEffect(() => {
        if (platforms) {
            var options = []
            Object.keys(platforms).map((item, index) => {
                options.push(
                    <MDBox sx={{ position: 'relative' }}>
                        {menuPlatformLoading == platforms[item].id && <CircularProgress size={20} thickness={7} sx={{ position: 'absolute', zIndex: 1, mx: 'auto', left: 0, right: 0, mt: '5px' }} />}
                        <MenuItem disabled={menuPlatformDisable} onClick={() => handlePlatformsUpdate(menuPlatformId, platforms[item].id)}>
                            <ListItemIcon><Icon sx={{ color: platforms[item].color }}>circle</Icon></ListItemIcon>
                            {platforms[item].title}
                        </MenuItem>
                    </MDBox>
                )
            })
            setMenuPlatformOptions(options)
        }
    },[platforms, menuPlatformId, menuPlatformDisable, menuPlatformLoading])

    const getRecruit = () => {
        dataServicePrivate('POST', 'hr/careers/entity/all', {
            relations: ['careers', 'platforms', 'tags', { entity: { relations: ['details'] } }],
            order: [{
                'target': 'created_at',
                'value': 'desc',
            }],
        }).then((result) => {
            console.log("debug employee", result);
            setRecruit(result.data['entity_career'])
            tagSelectionFinal()
            platformSelectionFinal()
        }, (err) => {
            console.log("debug employee error", err);
        })
    }

    const getTags = async (data = {}) => {
        await axiosPrivate.post('hr/careers/tags/all', data).then((result) => {
            console.log("debug career tags", result.data);
            result = result.data['career_tags']
            var tags = [{
                id: null,
                title: 'Unnasigned',
                color: '#D3D3D3',
            }]
            for (let i=0; i<Object.keys(result).length; i++) {
                tags[i+1] = {
                    id: result[i].id,
                    title: result[i].title,
                    color: result[i].color,
                }
            }
            console.log("debug career tags result", tags);
            setTags(tags)

        }, (err) => {
            console.log("debug career tags error", err);
        });
    }

    useEffect(() => {
        if (tags && menuTagId) {
            dataServicePrivate('POST', 'hr/careers/tags/logs/all', {
                filter: [{
                    operator: '=',
                    target: 'entitycareer_id',
                    value: menuTagId,
                }]
            }).then((result) => {
                console.log("debug career tags logs result", result);
                result = result.data['tag_logs']

                var options = []
                Object.keys(tags).map((item, index) => {
                    if (result.length && Object.keys(result).find((_item, _index) => result[_item].tags_id == tags[item].id) || tags[item].id==null) {
                        options.push(
                            <MDBox sx={{ position: 'relative' }}>
                                {menuTagLoading == tags[item].id && <CircularProgress size={20} thickness={7} sx={{ position: 'absolute', zIndex: 1, mx: 'auto', left: 0, right: 0, mt: '5px' }} />}
                                <MenuItem disabled={true}>
                                    <ListItemIcon><Icon sx={{ color: tags[item].color }}>circle</Icon></ListItemIcon>
                                    {tags[item].title}
                                </MenuItem>
                            </MDBox>
                        )
                    } else {
                        options.push(
                            <MDBox sx={{ position: 'relative' }}>
                                {menuTagLoading == tags[item].id && <CircularProgress size={20} thickness={7} sx={{ position: 'absolute', zIndex: 1, mx: 'auto', left: 0, right: 0, mt: '5px' }} />}
                                <MenuItem disabled={menuTagDisable} onClick={() => handleTagUpdate(menuTagId, tags[item].id)}>
                                    <ListItemIcon><Icon sx={{ color: tags[item].color }}>circle</Icon></ListItemIcon>
                                    {tags[item].title}
                                </MenuItem>
                            </MDBox>
                        )
                    }
                })
                setMenuTagOptions(options)
            })
            
        }
    },[tags, menuTagId, menuTagDisable, menuTagLoading])

    const handlePrevSnackbar = (id) => {
        console.log('asdw id', id);
        dataServicePrivate('POST', 'hr/careers/entity/tag_undo', {id}).then((result) => {
            console.log("debug undo career tag", result);
            result = result.data
            setMenuTagDisable()
            getInit();
            handleCloseSnackTag()

            dataServicePrivate('POST', 'hr/careers/tags/fetch', {id: result['deleted_logs'].tags}).then((_result) => {
                console.log('debug fetch tag result', _result);
                _result = _result.data['career_tags']
                if ( _result['title'] == 'Hired' ) {
                    var career_id = result['entity_career'].id
                    dataServicePrivate('POST', 'hr/careers/entity/define', {
                        id: career_id,
                        hired_at: null,
                    }).then((__result) => {
                        console.log('debug define careers result', __result);
                        getInit();
                    })
                }
            })
        }, (err) => {
            console.log("debug undo career tag error", err);
        });
    }

    const snackTagAction = (
        <MDBox>
            <MDButton variant='outlined' size="small" sx={{ mr: 1 }} onClick={() => handlePrevSnackbar(tagPrevId)}>Undo</MDButton>
            <IconButton size="small" onClick={handleCloseSnackTag}><Icon color="white">close</Icon></IconButton>
        </MDBox>
    )

    const handleTagUpdate = (id, tags_id) => {
        tagSelectionInit(tags_id)
        var data = { id, tags_id }
        if ( tags[Object.keys(tags).findIndex((item) => tags[item].id == tags_id)].title == 'Job Offer' ) {
            data['jo_at'] = moment()
        }
        if ( tags[Object.keys(tags).findIndex((item) => tags[item].id == tags_id)].title == 'Hired' ) {
            data['hired_at'] = moment()
        }

        dataServicePrivate('POST', 'hr/careers/entity/tag', data).then((result) => {
            console.log("debug update career tag", result);
            result = result.data
            setTagPrevId(result['tag_logs'].id)
            handleOpenSnackTag()
            getInit();
        }, (err) => {
            console.log("debug update career tag error", err);
        });
    }

    const handlePlatformsUpdate = (id, platforms_id) => {
        platformSelectionInit(platforms_id)
        dataServicePrivate('POST', 'hr/careers/entity/define', { id, platforms_id }).then((result) => {
            console.log("debug update career platform", result);
            result = result.data
            getInit();
        }, (err) => {
            console.log("debug update career platform error", err);

        });
    }

    const platformSelectionInit = (id) => {
        setMenuPlatformDisable(true)
        setMenuPlatformLoading(id)
    }
    const platformSelectionFinal = () => {
        setMenuPlatformDisable(false)
        setMenuPlatformLoading(0)
        setMenuPlatformState(null)
    }

    const tagSelectionInit = (id) => {
        setMenuTagDisable(true)
        setMenuTagLoading(id)
    }
    const tagSelectionFinal = () => {
        setMenuTagDisable(false)
        setMenuTagLoading(0)
        setMenuTagState(null)
    }

    function formatPhoneNumber(data) {
        var cleaned = ('' + data).replace(/\\D/g, '');
        var match = cleaned.match(/(\d{4})(\d{3})(\d{4})/);
        return match ? match[1] + '-' + match[2] + '-' + match[3] : 'Invalid Number'
    }

    const handleMenu = (event, id) => { 
        setMenuId(id)
        setMenuState(event.currentTarget)
    }

    const handleDialogClose = () => {
        setDialog(dispatch, { ...dialog, open: false })
    }

    const handleDelete = (id) => {
        setDialog(dispatch, EntityDelete(id, handleDialogClose, ()=>{
            snackBar('Recruit successfully deleted', 'success')
            dataServicePrivate('POST', 'hr/careers/entity/delete', {id}).then((result) => {
                console.log("debug career entity delete", result);
                getInit()
                handleDialogClose()
                snackBar('Recruit successfully deleted', 'success')
            }, (err) => {
                console.log("debug delete error", err);
                snackBar('Recruit unsuccessfully deleted', 'error')
            });
        }))
    }

    const [entityInfo, setEntityInfo] = useState()

    const handleEntityInformation = (id) => {
        setEntityInfo(<EntityInformation id={id} />)
    }

    useEffect(() => {
        if (entityInfo) {
            setDialog(dispatch, {
                ...dialog,
                open: true,
                disableClose: true,
                props: { fullWidth: true, maxWidth: 'sm' },
                title: (
                    <MDBox
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "12px 20px",
                            position: "relative",
                        }}
                    >
                        <MDTypography
                            variant="h6"
                            sx={{
                                fontWeight: "600",
                                fontSize: "1.25rem",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            Candidate Information
                        </MDTypography>
                        <IconButton
                            onClick={handleDialogClose} // Close modal on close button click
                            sx={{
                                position: "absolute",
                                top: "10px",
                                right: "20px",
                            }}
                        >
                            <Icon sx={{ fontSize: 30, color: "white" }}>close</Icon>
                        </IconButton>
                    </MDBox>
                ),
                content: entityInfo,
            })
        } 
    },[entityInfo, maxWidth])

    const handleMenuPlatform = (event, id) => {
        console.log('event', event);
        setMenuPlatformId(id)
        setMenuPlatformState(event.currentTarget)
        
    }

    const handleMenuTag = (event, id) => {
        setMenuTagId(id)
        setMenuTagState(event.currentTarget)
        
    }

    useEffect(() => {
        if (recruit) {
            var rows = []
            Object.keys(recruit).map((key) => {
                rows.push(
                    {
                        full_name: recruit[key]['entity'].full_name,
                        email: recruit[key]['entity'].email,
                        career: recruit[key]['careers'].title,
                        number: recruit[key]['entity'].contact_number,
                        // platforms: recruit[key]['platforms'],
                        platforms: (
                            <MDBadge
                                badgeContent={recruit[key]['platforms'].title}
                                color={recruit[key]['platforms'].color}
                                variant='customGradient'
                                sx={{ cursor: 'pointer' }}
                                onClick={(e) => handleMenuPlatform(e, recruit[key].id)}
                            />
                        ),
                        applied: formatDateTime(recruit[key].created_at, 'MMM DD, YYYY HH:mm:ss A'),
                        updated: recruit[key].updated_at ? formatDateTime(recruit[key].updated_at, 'MMM DD, YYYY HH:mm:ss A') : 'No Data',
                        entity_careers_id: recruit[key].id,
                        // tag: recruit[key]['tags'],
                        tags: (
                            <MDBadge
                                badgeContent={recruit[key]?.tags ? recruit[key]['tags'].title : 'unassigned'}
                                color={recruit[key]?.tags ? recruit[key]['tags'].color : '#D3D3D3'}
                                variant='customGradient'
                                sx={{ cursor: 'pointer' }}
                                onClick={(e) => handleMenuTag(e, recruit[key].id)}
                            />
                        ),
                        actions: (
                            <MDBox>
                                <Grid container spacing={.5}>
                                    <Grid item>
                                        {/* <MDButton onClick={() => formHandle(recruit[key]['entity'].id, recruit[key]['careers'].id)} color='secondary'>View</MDButton> */}
                                        <Tooltip title='View Candidate Information'>
                                            <IconButton size='small' color="info" onClick={() => handleEntityInformation(recruit[key]['entity'].id)}><Icon>visibility</Icon></IconButton>
                                        </Tooltip>
                                    </Grid> 
                                    {/* <Grid item>
                                        <MDButton color='primary'>Download</MDButton>
                                    </Grid>  */}
                                    <Grid item>
                                        {/* <MDButton onClick={() => handleDeleteRecruit(recruit[key].id)} color='error'>Delete</MDButton> */}
                                        <Tooltip title='Delete Candidate'>
                                            <IconButton size='small' color="error" onClick={() => handleDelete(recruit[key].id)}><Icon>delete</Icon></IconButton>
                                        </Tooltip>
                                    </Grid> 
                                    <Grid item>
                                        <Tooltip title='More Actions'>
                                            <IconButton size='small' color="secondary" onClick={(e) => handleMenu(e, recruit[key].id)}><Icon>more_vert</Icon></IconButton>
                                        </Tooltip>
                                    </Grid> 
                                </Grid>
                            </MDBox>
                        )
                    }
                )
            })
    
            if (rows) setRows(rows)
        }

    },[recruit, tags, platforms])

    const PlatformFilterColumnFN = ({ column: { filterValue, setFilter, id } }) => (
        <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel><MDTypography textTransform='capitalize' fontWeight='medium' variant='caption'>{id}</MDTypography></InputLabel>
            <Select
                label={<MDTypography textTransform='capitalize' fontWeight='medium' variant='caption'>{id}</MDTypography>}
                value={filterValue ?? ''}
                onChange={(e) => setFilter(e.target.value)}
                sx={{ padding: '0.625rem!important' }}
            >
                <MenuItem value="">No Filter</MenuItem>
                {platforms && platforms.map((item, index) => (
                    <MenuItem key={index} value={item.title}>{item.title}</MenuItem>
                ))}
            </Select>
        </FormControl>
    )

    const TagsFilterColumnFN = ({ column: { filterValue, setFilter, id } }) => (
        <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel><MDTypography textTransform='capitalize' fontWeight='medium' variant='caption'>{id}</MDTypography></InputLabel>
            <Select
                label={<MDTypography textTransform='capitalize' fontWeight='medium' variant='caption'>{id}</MDTypography>}
                value={filterValue ?? ''}
                onChange={(e) => setFilter(e.target.value)}
                sx={{ padding: '0.625rem!important' }}
            >
                <MenuItem value="">No Filter</MenuItem>
                {tags && tags.map((item, index) => (
                    <MenuItem key={index} value={item.title}>{item.title}</MenuItem>
                ))}
            </Select>
        </FormControl>
    )

    const columns = [
        { Header: "name", accessor: (row) => `${row.full_name} ${row.email}`, id: 'name', Cell: ({row}) => (
            <Employee image={team3} name={row.original.full_name} email={row.original.email} />
        ), align: "left" },
        { Header: "contact number", accessor: "number", Cell: ({value}) => (
            <MDTypography variant="caption" color="text" fontWeight="medium">
                {formatPhoneNumber(value)}
            </MDTypography>
        ), align: "left" },
        { Header: "position applied", accessor: "career", Cell: ({value}) => (<Career title={value} />), align: "left"},
        { Header: "source", 
            // accessor: (row) => (row?.platforms ? row.platforms['title'] : 'unassigned' ), 
            accessor: 'platforms', 
            id: "platforms",
            align: "center",
            // Cell: ({row}) => PlatformPopperFn(row), 
            // Cell: ({row}) => (
            //     <MDBadge
            //         badgeContent={row.original?.platforms ? row.original.platforms['title'] : 'unassigned'} 
            //         color={row.original?.platforms ? row.original.platforms['color'] : '#D3D3D3'} 
            //         variant='customGradient'
            //         sx={{ cursor: 'pointer' }}
            //         onClick={(e) => handleMenuPlatform(e, row.original.entity_careers_id)}
            //     />
            // ),
            Filter: PlatformFilterColumnFN},
        { Header: "date applied", accessor: "applied", align: "center", Cell: ({value}) => (
            <MDTypography variant="caption" color="text" fontWeight="medium">
                {value}
            </MDTypography>
        ), Filter: DateRangeFilterColumnFN, filter: DateRangeFilterFN},
        { Header: "date updated", accessor: "updated", align: "center", Cell: ({value}) => (
            <MDTypography variant="caption" color="text" fontWeight="medium">
                {value}
            </MDTypography>
        ), Filter: DateRangeFilterColumnFN, filter: DateRangeFilterFN},
        { Header: 'status', 
            // accessor: (row) => (row?.tag ? row.tag['title'] : 'unassigned' ), 
            accessor: 'tags', 
            id: 'status', 
            align: "center", 
            // Cell: ({row}) => TagPopperFn(row), 
            // Cell: ({row}) => (
            //     <MDBadge 
            //         badgeContent={row.original?.tag ? row.original.tag['title'] : 'unassigned'} 
            //         color={row.original?.tag ? row.original.tag['color'] : '#D3D3D3'} 
            //         variant='customGradient'
            //         sx={{ cursor: 'pointer' }}
            //         onClick={(e) => handleMenuTag(e, row.original.entity_careers_id)}
            //     />
            // ),
            Filter: TagsFilterColumnFN},
        { Header: "actions", accessor: "actions", align: "center", disableFilters: true, disableGlobalFilter: true },
    ]

    const PlatformPopperFn = (row) => (
        <PopupState variant="popper">
            {(popupState) => (
                <MDBox>
                    <MDButton {...bindToggle(popupState)}>
                        <MDBadge 
                            badgeContent={row.original?.platforms ? row.original.platforms['title'] : 'unassigned'} 
                            color={row.original?.platforms ? row.original.platforms['color'] : '#D3D3D3'} 
                            variant='customGradient'
                            sx={{ cursor: 'pointer' }}
                        />
                    </MDButton>
                    <Popper
                        placement="left"
                        transition
                        {...bindPopper(popupState)}
                    >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: placement="center right"
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={popupState.close}>
                                    <MenuList
                                        autoFocusItem={popupState.isOpen}
                                    >
                                        {
                                            platforms && Object.keys(platforms).map((item, key) => (
                                                <MenuItem 
                                                    key={key} 
                                                    onClick={() => handlePlatformsUpdate(row.original.entity_careers_id, platforms[item].id)}
                                                    sx={{ 
                                                        bgcolor: 'transparent', 
                                                        justifyContent: 'space-between' 
                                                    }}
                                                    
                                                >
                                                    <MDBadge
                                                        badgeContent={platforms[item].title}
                                                        color={platforms[item].color}
                                                        variant='customGradient'
                                                    />
                                                </MenuItem>
                                            ))
                                        }
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                    </Popper>
                </MDBox>
            )}
        </PopupState>
    )

    const TagPopperFn = (row) => (
        <PopupState variant="popper">
            {(popupState) => (
                <MDBox>
                    <MDButton {...bindToggle(popupState)}>
                        <MDBadge 
                            badgeContent={row.original?.tag ? row.original.tag['title'] : 'unassigned'} 
                            color={row.original?.tag ? row.original.tag['color'] : '#D3D3D3'} 
                            variant='customGradient'
                            sx={{ cursor: 'pointer' }}
                        />
                    </MDButton>
                    <Popper
                        placement="left"
                        transition
                        {...bindPopper(popupState)}
                    >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: placement="center right"
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={popupState.close}>
                                    <MenuList
                                        autoFocusItem={popupState.isOpen}
                                    >
                                        {
                                            tags && Object.keys(tags).map((item, key) => (
                                                <MenuItem 
                                                    key={key} 
                                                    onClick={() => handleTagUpdate(row.original.entity_careers_id, tags[item].id)}
                                                    sx={{ 
                                                        bgcolor: 'transparent', 
                                                        justifyContent: 'space-between' 
                                                    }}
                                                    
                                                >
                                                    <MDBadge
                                                        badgeContent={tags[item].title}
                                                        color={tags[item].color}
                                                        variant='customGradient'
                                                    />
                                                </MenuItem>
                                            ))
                                        }
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                    </Popper>
                </MDBox>
            )}
        </PopupState>
    )

    const Employee = ({ image, name, email }) => (
        <MDBox display="flex" alignItems="center" lineHeight={1}>
            <MDAvatar src={image} name={name} size="sm" />
            <MDBox ml={2} lineHeight={1}>
                <MDTypography display="block" variant="button" fontWeight="medium">
                {name}
                </MDTypography>
                <MDTypography variant="caption">{email}</MDTypography>
            </MDBox>
        </MDBox>
    );

    const Career = ({ title }) => (
        <MDBox lineHeight={1} textAlign="left">
            <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
                {title}
            </MDTypography>
        </MDBox>
    );

    const handleDebugPicker = (e) => {
        console.log('debug color picker:', e);
    }

    const [menuAnswers, setMenuAnswer] = useState()

    const handleMenuAnswersDialog = () => {
        console.log('id', menuId);
        if ( menuId ) {
            setMenuAnswer(<EntityAnswers id={menuId} />)
        }
    }
    useEffect(() => {
        if (menuAnswers) {
            setDialog(dispatch, {
                ...dialog,
                open: true,
                disableClose: true,
                props: { fullWidth: true, maxWidth: 'sm' },
                title: (
                    <MDBox
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "12px 20px",
                            position: "relative",
                        }}
                    >
                        <MDTypography
                            variant="h6"
                            sx={{
                                fontWeight: "600",
                                fontSize: "1.25rem",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            Candidate Answers
                        </MDTypography>
                        <IconButton
                            onClick={handleDialogClose} // Close modal on close button click
                            sx={{
                                position: "absolute",
                                top: "10px",
                                right: "20px",
                            }}
                        >
                            <Icon sx={{ fontSize: 30, color: "white" }}>close</Icon>
                        </IconButton>
                    </MDBox>
                ),
                content: menuAnswers,
            })
        }
    },[menuAnswers, maxWidth])

    const handleExport = () => {
        if (menuId) {
            localStorage.setItem('entity_careers_id', menuId)
            window.open('/candidate/export', '_blank')
        }
    }

    const MenuOptions = [
        (
            <MenuItem onClick={() => {handleMenuAnswersDialog(); setMenuState(null)}}>
                <ListItemIcon><Icon>question_answer</Icon></ListItemIcon>
                Answers
            </MenuItem>
        ),
        (
            <MenuItem onClick={handleExport}>
                <ListItemIcon><Icon>download</Icon></ListItemIcon>
                Export to Excel
            </MenuItem>
        ),
        (
            <MenuItem >
                <ListItemIcon><Icon>question_mark</Icon></ListItemIcon>
                Information
            </MenuItem>
        ),
    ]

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox pt={6} pb={3}>
                <Grid container spacing={6}>
                    <Grid item xs={12}>
                        <Card>
                            <MDBox
                                mx={2}
                                mt={-3}
                                py={3}
                                px={2}
                                variant="gradient"
                                bgColor="info"
                                borderRadius="lg"
                                coloredShadow="info"
                            >
                                <MDTypography variant="h6" color="white">
                                Candidate
                                </MDTypography>
                            </MDBox>
                            <MDBox pt={3}>
                            <DataTable
                                table={{ columns, rows }}
                                showTotalEntries
                                noEndBorder
                                canSearch
                            />
                            </MDBox>
                        </Card>
                    </Grid>
                </Grid>
            </MDBox>
            <Footer />
            
            <Menu
                anchorEl={menuState}
                anchorReference={null}
                open={menuOpen}
                onClose={() => setMenuState(null)}
            >
                {MenuOptions.map((item) => (item))}
            </Menu>
            <Menu
                anchorEl={menuPlatformState}
                anchorReference={null}
                open={menuPlatformOpen}
                onClose={() => setMenuPlatformState(null)}
            >
                {menuPlatformOptions.map((item) => (item))}
            </Menu>
            <Menu
                anchorEl={menuTagState}
                anchorReference={null}
                open={menuTagOpen}
                onClose={() => setMenuTagState(null)}
            >
                {menuTagOptions.map((item) => (item))}
            </Menu>

            <Snackbar
                open={snackTag}
                autoHideDuration={60000}
                message='Status change'
                action={snackTagAction}
            />
        </DashboardLayout>
    );
}

export default Employee;