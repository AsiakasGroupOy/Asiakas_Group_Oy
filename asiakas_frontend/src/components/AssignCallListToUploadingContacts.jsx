import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Autocomplete,
} from "@mui/material";
import { fetchCallLists } from "../utils/contactListApi"; // Import the function to fetch call lists

export default function AssignCallListToUploading({
  selectedCallList,
  setSelectedCallList,
  openCallListDialog,
  handleCloseCallListDialog,
  handleSubmitDialogWindowOpen,
}) {
  const [callListOptions, setCallListOptions] = useState([]);

  const handleCloseDialog = () => {
    handleCloseCallListDialog();
  };
  const handleSubmitDialog = () => {
    if (!selectedCallList) {
      alert("Please select a call list before proceeding.");
      return;
    }
    handleSubmitDialogWindowOpen();
  };
  useEffect(() => {
    const fetchAllCallLists = async () => {
      const response = await fetchCallLists();
      if (response.status === "success" && response.data.length > 0) {
        setCallListOptions(response.data.map((cl) => cl.calling_list_name));
      } else {
        setCallListOptions([]);
        window.alert("Call lists could be empty or not available.");
      }
    };

    fetchAllCallLists();
  }, []);

  return (
    <>
      <Dialog
        open={openCallListDialog}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return; // prevent closing on outside click
          handleCloseDialog(); // allow normal closing via your Cancel button or Esc
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontSize: "20px", fontWeight: "bold", color: "#08205eff" }}
        >
          Assign Call List
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            freeSolo
            required
            size="small"
            options={callListOptions} // array of Calling lists names
            value={selectedCallList || ""}
            onInputChange={(_, newValue) => {
              setSelectedCallList(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  callListOptions.length === 0
                    ? "No existing call lists - type a new name"
                    : "Select or type a calling list"
                }
                variant="standard"
                required
              />
            )}
          />
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "space-between",
            marginLeft: 10,
            marginRight: 10,
          }}
        >
          <Button variant="contained" color="grey" onClick={handleCloseDialog}>
            Back
          </Button>
          <Button
            variant="contained"
            color="dustblue"
            onClick={handleSubmitDialog}
            autoFocus
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
