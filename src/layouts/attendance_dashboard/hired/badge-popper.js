import MDBadge from "components/MDBadge";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import { useState, useEffect } from "react";
import { Grow, Paper, ClickAwayListener, MenuList, MenuItem, Popper, Icon, IconButton, Button, Dialog, DialogContent, DialogActions } from "@mui/material"
import MDTypography from "components/MDTypography";
import { ChromePicker } from "react-color";
import MDInput from "components/MDInput";
import { useSnackbar } from "notistack";


function BadgePopper({
    id,
    badgeId,
    variant,
    content,
    data,
    editable,
    deletable,
}) {

    const [openAddData, setOpenAddData] = useState(false)
    const [colorPicker, setColorPicker] = useState()
    const [dataId, setDataId] = useState()
    const [title, setTitle] = useState()
    const [action, setAction] = useState()
    const [currentBadge, setCurrentBadge] = useState()

    // snackbar nostick
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        // console.log('debug badge popper content:', content);
        setCurrentBadge(content[Object.keys(content).find(key => content[key].id == badgeId)] || 0)
    },[])

    const [state, setState] = useState({
        open: false, 
        anchorEl: null,
    })
    return (
        <MDBox>     
                {currentBadge 
                ?   <MDBadge
                        badgeContent={currentBadge.title}
                        color={currentBadge.color}
                        variant={variant}
                    />
                :   <MDBadge
                        badgeContent='unassigned'
                        color='#D3D3D3'
                        variant={variant}
                    />
                }
        </MDBox>
    );
}

export default BadgePopper