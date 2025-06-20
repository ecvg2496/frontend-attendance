import { DialogActions, DialogContent, DialogTitle, Dialog, Icon, IconButton } from "@mui/material"
import { useMaterialUIController, setDialog } from "context"
import { useEffect, useRef } from "react"


const DynamicDialog = () => {

    const [controller, dispatch] = useMaterialUIController()
    const { dialog } = controller
    const {
        open,
        disableClose,
        title,
        content,
        action,
        props,
    } = dialog
    const contentRef = useRef()

    const handleClose = () => {
        setDialog(dispatch, {...dialog, open: false})
    }

    useEffect(() => {
        setDialog(dispatch, {...dialog, contentRef})
    },[dispatch])

    return (
        <Dialog
            open={open}
            onClose={!disableClose && handleClose}
            {...props}
        >
            {title && <DialogTitle>{title}</DialogTitle>}
            {content && <DialogContent ref={contentRef}>{content}</DialogContent>}
            {action && <DialogActions sx={{ display: 'block' }}>{action}</DialogActions>}
        </Dialog>
    )

}

export default DynamicDialog