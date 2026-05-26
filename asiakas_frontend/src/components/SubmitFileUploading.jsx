import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function SubmitFileUploading({
  submittingDialogOpen,
  handleSubmitFileUploadClosed,
  handleSubmitFileUpload,
}) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={submittingDialogOpen}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return; // prevent closing on outside click
        handleSubmitFileUploadClosed(); // allow normal closing via your Cancel button or Esc
      }}
    >
      <DialogTitle id="alert-dialog-title">
        {t("submitFileUploading.dialogTitle")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description"></DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{ justifyContent: "space-between", marginLeft: 2, marginRight: 2 }}
      >
        <Button
          onClick={handleSubmitFileUploadClosed}
          color="warning"
          variant="contained"
        >
          {t("submitFileUploading.buttons.cancel")}
        </Button>

        <Button
          onClick={handleSubmitFileUpload}
          variant="contained"
          color="dustblue"
          autoFocus
        >
          {t("submitFileUploading.buttons.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
