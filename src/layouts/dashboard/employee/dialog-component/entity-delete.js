import { Icon, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";


function EntityDelete(id, onClose, handleDelete) {

    return {
        open: true,
        props: { fullWidth: true, maxWidth: 'sm', scroll: 'body' },
        title: (
            <MDBox
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#2E3B55",
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
                    Confirm Delete
                </MDTypography>
                <IconButton
                    onClick={onClose} // Close modal on close button click
                    sx={{
                        position: "absolute",
                        top: "10px",
                        right: "20px",
                        color: "#FFFFFF",
                        "&:hover": {
                            color: "red",
                        },
                    }}
                >
                    <Icon sx={{ fontSize: 30, color: "white" }}>close</Icon>
                </IconButton>
            </MDBox>
        ),
        content: (
            <MDBox p={2}>
                <MDTypography variant="body1" color="textSecondary">
                    Are you sure to Delete this Candidate? This action cannot be undone.
                </MDTypography>
            </MDBox>
        ),
        action: (
            <MDBox p={2} display="flex" justifyContent="flex-end" gap={2}>
                <MDButton
                    onClick={onClose}
                    color="secondary"
                    variant="outlined"
                    sx={{
                        padding: "8px 16px",
                        borderColor: "#f44336",
                        color: "#f44336",
                        fontWeight: "bold",
                        "&:hover": {
                            backgroundColor: "#ffcccc",
                            borderColor: "#f44336",
                        },
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <Icon sx={{ fontSize: 20 }}>cancel</Icon>
                    Cancel
                </MDButton>
                <MDButton
                    color="primary"
                    variant="contained"
                    sx={{
                        padding: "8px 16px",
                        backgroundColor: "#4caf50",
                        "&:hover": {
                            backgroundColor: "#388e3c",
                        },
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                    onClick={handleDelete} // Call handleDeleteData to perform the deletion
                >
                    <Icon sx={{ fontSize: 20 }}>delete</Icon>
                    Confirm
                </MDButton>
            </MDBox>
        ),
    }
}

export default EntityDelete