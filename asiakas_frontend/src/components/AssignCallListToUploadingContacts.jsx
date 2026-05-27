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
import { fetchCallLists } from "../services/contactListApi"; // Import the function to fetch call lists
import { useTranslation } from "react-i18next";
import AlertMessage from "./AlertMessage";

export default function AssignCallListToUploading({
  selectedCallList,
  setSelectedCallList,
  openCallListDialog,
  handleCloseCallListDialog,
  handleSubmitDialogWindowOpen,
}) {
  const [callListOptions, setCallListOptions] = useState([]);
  const { t } = useTranslation();
  const [alert, setAlert] = useState(null);

  const handleCloseDialog = () => {
    handleCloseCallListDialog();
  };
  const handleSubmitDialog = () => {
    if (!selectedCallList) {
      setAlert({
        status: "warning",
        message: t("assignCallListToUploading.alertCallListMissing"),
      });

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
        setAlert({
          status: "error",
          message: t(response.message),
        });
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
          {t("assignCallListToUploading.dialogTitle")}
        </DialogTitle>
        {alert && <AlertMessage alert={alert} setAlert={setAlert} />}
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
                    ? t("assignCallListToUploading.dialogLablelNoCallList")
                    : t("assignCallListToUploading.dialogLableSelectCallList")
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
            {t("assignCallListToUploading.buttons.back")}
          </Button>
          <Button
            variant="contained"
            color="dustblue"
            onClick={handleSubmitDialog}
            autoFocus
          >
            {t("assignCallListToUploading.buttons.next")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
