import {
  Card,
  CardContent,
  Divider,
  Icon,
  IconButton,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import PageLayout from "examples/LayoutContainers/PageLayout";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import NavBar from "layouts/content_page/nav_bar";
import Footer from "examples/Footer";
import useAuth from "hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { dataServicePrivate, formatDateTime } from "global/function";
import { useMaterialUIController, setDialog } from "context";
import { useLocation, useNavigate } from "react-router-dom";
import MDTypography from "components/MDTypography";
import DependentsForm from "./dependents";

function Dependents({ update }) {
  const [controller, dispatch] = useMaterialUIController();
  const { dialog } = controller;
  const { loading } = controller;

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/careers/personalinfo";
  const prevPage = () => navigate(from, { replace: true });
  const toPage = (url, params = {}) =>
    navigate(url, { state: { from: location, ...params }, replace: true });

  const { auth } = useAuth();
  const [dependents, setDependents] = useState();
  const [loadingDependents, setLoadingDependents] = useState(true);
  const [deleteState, setDeleteState] = useState({ id: null, open: false })
  const [dependState, setDependState] = useState({ data: null, open: false })
  const [discardState, setDiscardState] = useState({ id: null, open: false })
  const [dependentsDeleted, setDependentsDeleted] = useState([])
  const entity_id = auth.id;

  var local = localStorage.getItem('dependentList')
  const removeLocal = () => {
    localStorage.removeItem('dependentList')
  }

  // UseMemo = to prevent unnecessary rerenders
  const memoizedDependents = useMemo(() => dependents, [dependents]);

  // Fetch dependents only when necessary
  const fetchDependents = () => {
    setLoadingDependents(true);
    dataServicePrivate("POST", "entity/dependents/all", {
      filter: [{ operator: "=", target: "entity_id", value: entity_id }],
    })
      .then((result) => {
        console.log('debug entity dependents result', result);
        result = result.data['entity_dependents']

        local = localStorage.getItem('dependentList')
        if (local) {
          result = JSON.parse(local)
        } else {
          localStorage.setItem('dependentList', JSON.stringify(result))
        }

        setDependents(result);
      })
      .catch((error) => {
        console.error("Error fetching dependents:", error);
      })
      .finally(() => {
        setLoadingDependents(false);
      });
  }

  useEffect(() => {
    if (dependents) {
      const onbeforeunloadFn = () => {
        localStorage.setItem('dependentList', JSON.stringify(dependents))
      }
    
      window.addEventListener('beforeunload', onbeforeunloadFn);
      return () => {
        window.removeEventListener('beforeunload', onbeforeunloadFn);
      }
    }
  },[dependents])

  useEffect(() => {
    fetchDependents();
  }, []);

  const handleDelete = (index) => {
    // dataServicePrivate("POST", "entity/dependents/delete", { id })
    // .then((result) => {
    //   console.log('debug dependents delete result', result);
    //   update();
    // })
    // .catch((error) => console.error("Error deleting dependent:", error));
    var temp = [...dependents]
    var deleted = temp.splice(index, 1)[0]
    console.log('delete', deleted);
    if ('id' in deleted) {
      setDependentsDeleted([...dependentsDeleted, deleted['id']])
    }
    setDependents(temp)
    localStorage.setItem('dependentList', JSON.stringify(temp))
    closeDeleteHandle()
  };

  const openDeleteHandle = (index) => {
    setDeleteState({
      open: true,
      index: index,
    });
  };
  const closeDeleteHandle = () => {
    fetchDependents();
    update();
    setDeleteState({...deleteState, open: false});
  }

  const openDependHandle = (data=null, index=null) => {
    setDependState({
      open: true,
      data: data,
      index: index,
    });
  };
  const closeDependHandle = () => {
    fetchDependents()
    setDependState({...dependState, open: false})
  }

  const openDiscardHandle = () => {
    setDiscardState({
      open: true,
    });
  }
  const closeDiscardHandle = () => {
    setDiscardState({...discardState, open: false})
  }
  const confirmDependentDiscardHandle = () => {
    localStorage.removeItem('dependents')
    closeDiscardHandle()
    closeDependHandle()
  }

  const closeDependendsHandle = () => {
    removeLocal()
    update()
    setDialog(dispatch, { ...dialog, open: false });
  }

  // Handle form submission (if needed, you can add any functionality)
  const handleSubmit = (event) => {
    event.preventDefault();
    dataServicePrivate('POST', 'entity/dependents/define', dependents).then((result) => {
      console.log('debug dependents define result', result);

      console.log('asdw dep dleete', dependentsDeleted);
      if (dependentsDeleted.length) {
        dataServicePrivate("POST", "entity/dependents/delete", dependentsDeleted)
        .then((result) => {
          console.log('debug dependents delete result', result);
          closeDependendsHandle()
        })
        .catch((error) => console.error("Error deleting dependent:", error));
      } else {
        closeDependendsHandle()
      }

    }).catch((err) => {
      console.log('debug dependents define error result', err);

    })
  };

  return (
    <MDBox>
      {loadingDependents ? (
        <MDTypography
          color="textSecondary"
          variant="h5"
          sx={{ my: 2, textAlign: "center" }}
        >
          Loading...
        </MDTypography>
      ) : dependents.length === 0 ? (
        <MDTypography
          color="error"
          variant="h5"
          sx={{ my: 2, textAlign: "center" }}
        >
          No dependents found
        </MDTypography>
      ) : (
        dependents.map((dependent, index) => (
          <Card
            key={index}
            sx={{ position: "relative", my: 2, p: 2 }}
            variant="outlined"
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h5">{dependent.name}</Typography>
                <Typography variant="body2">
                  {formatDateTime(dependent.birthday, "MMMM DD, YYYY")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ textTransform: "capitalize" }}
                >
                  {dependent.relationship}
                </Typography>
              </Box>
              <Box>
                <IconButton
                  onClick={()=>openDependHandle(dependent, index)}
                >
                  <Icon color="primary">edit</Icon>
                </IconButton>
                <IconButton
                  onClick={() => openDeleteHandle(index)}
                >
                  <Icon color="error">delete</Icon>
                </IconButton>
              </Box>
            </Box>
          </Card>
        ))
      )}

      <MDButton
        variant="outlined"
        color="secondary"
        fullWidth
        sx={{ 
          mt: 3, 
          borderColor: 'secondary.main', // Default border color
          color: 'secondary.main', // Default text color
          transition: 'all 0.3s ease', // Smooth transition effect
          '& .MuiSvgIcon-root': { color: 'inherit' }, // Ensure the icon inherits the text color
          '&:hover': {
            borderColor: 'red', // Border turns red
            color: 'red', // Text turns red
            '& .MuiSvgIcon-root': { color: 'red' }, // Icon turns red
          }
        }}
        startIcon={<Icon>add</Icon>}
        onClick={() => openDependHandle()}
      >
        Add Dependents
      </MDButton>

      <form onSubmit={handleSubmit}>
        <MDButton
          sx={{ my: 2 }}
          color="info"
          fullWidth
          type="submit"
          startIcon={<Icon>save</Icon>}
        >
          Save all changes
        </MDButton>
      </form>

      {/* delete dialog */}
      <Dialog open={deleteState.open} onClose={closeDeleteHandle}>
        <DialogTitle>
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
            <Typography
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
            </Typography>
          </MDBox>
        </DialogTitle>
        <DialogContent>
          <MDBox p={2}>
            <Typography variant="body1" color="textSecondary">
              Are you sure you want to delete this item? This action cannot be undone.
            </Typography>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDBox p={2} display="flex" justifyContent="flex-end" gap={2}>
            <MDButton
              onClick={closeDeleteHandle}
              color="secondary"
              variant="outlined"
              sx={{
                padding: "8px 16px",
                borderColor: "#F44336",
                color: "#F44336",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#FFC5C5",
                  borderColor: "#F44336",
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
                handleDelete(deleteState['index']);
              }}
            >
              <Icon sx={{ fontSize: 20 }}>delete</Icon>
              Confirm
            </MDButton>
          </MDBox>
        </DialogActions>
      </Dialog>

      {/* discard dialog */}
      <Dialog open={discardState.open} onClose={closeDiscardHandle}>
        <DialogTitle>
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
            <Typography
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
              <Icon sx={{ color: "#FF9800", fontSize: 30 }}>help</Icon>
              Discard Changes?
            </Typography>
          </MDBox>
        </DialogTitle>
        <DialogContent>
          <MDBox p={2}>
            <Typography variant="body1" color="textSecondary">
              You have unsaved changes. If you leave now, the information you've entered will be lost.
            </Typography>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDBox p={2} display="flex" justifyContent="flex-end" gap={2}>
            <MDButton
              onClick={closeDiscardHandle}
              color="secondary"
              variant="outlined"
              sx={{
                padding: "8px 16px",
                borderColor: "#F44336",
                color: "#F44336",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#FFC5C5",
                  borderColor: "#F44336",
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
              onClick={confirmDependentDiscardHandle}
            >
              <Icon sx={{ fontSize: 20 }}>delete</Icon>
              Confirm
            </MDButton>
          </MDBox>
        </DialogActions>
      </Dialog>

      {/* add/edit dialog */}
      <Dialog fullWidth maxWidth='sm' open={dependState.open}>
        <DialogTitle>
          <MDBox
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <MDTypography
              variant="h3"
            >
              {dependState.id ? 'Edit Dependents' : 'Add Dependents'}
            </MDTypography>
            <IconButton
              onClick={openDiscardHandle} // Close modal on close button click
              sx={{
                position: "absolute",
                top: "0px",
                right: "0px",
              }}
            >
              <Icon sx={{ fontSize: 30 }}>close</Icon>
            </IconButton>
          </MDBox>
        </DialogTitle>
        <DialogContent>
          <MDBox p={2}><DependentsForm data={dependState} update={()=>{fetchDependents(); update(); closeDependHandle();}} /></MDBox>
        </DialogContent>
      </Dialog>
    </MDBox>
  );
}

export default Dependents;
