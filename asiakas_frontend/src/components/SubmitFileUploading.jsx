import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
export default function SubmitFileUploading({
  submittingDialogOpen,
  handleSubmitFileUploadClosed,
  handleSubmitFileUpload,
}) {
  return (
    <Dialog
      open={submittingDialogOpen}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return; // prevent closing on outside click
        handleSubmitFileUploadClosed(); // allow normal closing via your Cancel button or Esc
      }}
    >
      <DialogTitle id="alert-dialog-title">
        {" Your file is ready. Press Submit to upload."}
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
          Cancel
        </Button>

        <Button
          onClick={handleSubmitFileUpload}
          variant="contained"
          color="dustblue"
          autoFocus
        >
          Submit loading
        </Button>
      </DialogActions>
    </Dialog>
  );
}
