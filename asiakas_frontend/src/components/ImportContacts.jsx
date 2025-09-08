import { useState, useRef } from "react";
import {
  Paper,
  Box,
  Card,
  CardContent,
  Typography,
  CardActions,
  TextField,
  Button,
  Alert,
  AlertTitle,
  CircularProgress
} from "@mui/material";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import theme from "../theme";
import ReviewContactsUploading from "./ReviewContactsUploading";
import { ThemeProvider } from "@mui/material/styles";
import AssignCallListToUploading from "./AssignCallListToUploadingContacts";
import SubmitFileUploading from "./SubmitFileUploading";
import { uploadContactsFile } from "./contactListApi";

export default function ImportContacts() {
  const [activeStep, setActiveStep] = useState(-1);
  const [fileName, setFileName] = useState("");
  const [fileToPreview, setFileToPreview] = useState(null); // State to hold the file to preview
  const [open, setOpen] = useState(false); // State to control preview dialog
  const [openPreview, setOpenPreview] = useState(false); // State to control the preview dialog window
  const [selectedCallList, setSelectedCallList] = useState("");
  const [openCallListDialog, setOpenCallListDialog] = useState(false); // State to control the call list options window
  const [mapping, setMapping] = useState({});
  const [submittingDialogOpen, setSubmittingDialogOpen] = useState(false); // State to control the submitting dialog window
  const [completeAlert, setCompleteAlert] = useState(false);
  const [numberUploadedRows, setNumberUploadedRows] = useState(0);
  const [uploadFailedAlert, setUploadFailedAlert] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [loadingStarts, setLoadingStarts] = useState(false);

  const steps = ["Select file", "Review and upload", "Complete"];

  const fileInputRef = useRef(null);

  const ifNextDisabled = fileName === "" || activeStep === 2 ? true : false;

  const handleButtonClick = () => {
    fileInputRef.current.click(); // programmatically click the hidden input
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const allowed = [".csv", ".xls", ".xlsx"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowed.includes(ext)) {
        alert("Please upload a CSV or Excel file.");
        setFileName("");
        setActiveStep(-1);
        return;
      }

      setFileName(file.name);
      setFileToPreview(file);
      setActiveStep(0);
      // Move to the next step if a file is selected
    } else {
      setFileName("");
      setActiveStep(-1); // Reset file name if no file is selected
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1); // Move to the next step at Stepper Line
  };
  const handleStepBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1); // Move to the back step at Stepper Line
  };

  const handleBack = () => {
    setActiveStep(-1);
    setFileName(""); // Reset file name when going back
    setFileToPreview(""); // Reset file to preview when going back
    setMapping({}); // Reset mapping when going back
    setOpenPreview(false); // Close the preview dialog when going back
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // reset the file input so same file can be selected again
    }
  };

  const handleOpenCallListDialog = () => {
    handleNext();
    setOpenCallListDialog(true);
  };

  const handleCloseCallListDialog = () => {
    setOpenCallListDialog(false);
    setOpen(true);
    handleStepBack(); // Go back to the previous step
    setSelectedCallList(""); // Close the dialog and resetting state
  };

  const handleSubmitDialogWindowOpen = () => {
    setOpenCallListDialog(false);
    setSubmittingDialogOpen(true);
    
  };

  const handleSubmitFileUpload = async () => {
    console.log(selectedCallList,mapping, fileToPreview)
    try {
      setLoadingStarts(true);
      setSubmittingDialogOpen(false);
      setOpen(false); // Close the preview dialog
      const uploading = await (uploadContactsFile(fileToPreview, mapping, selectedCallList))

      setLoadingStarts(false);

      if (uploading.inserted_contacts > 0) {
        // Successfully uploaded at least one row
        setActiveStep(3);
        setNumberUploadedRows(uploading.inserted_contacts);
        setCompleteAlert(true);

        if (uploading.warnings.length) {
          setUploadErrorMessage(uploading.warnings.join("\n"));
        }
        console.log("Uploading result:", uploading);

      } else if (uploading.warnings.length) {
        // Uploaded 0 rows and warnings
        setUploadErrorMessage(uploading.warnings.join("\n"));
        setUploadFailedAlert(true);
        setNumberUploadedRows(uploading.inserted_contacts);

      } else if (uploading.message) {
        // Uploaded 0 rows and error message from backend
        setUploadErrorMessage(uploading.message);
        setUploadFailedAlert(true);
      }
      
    } catch (err) {
      setLoadingStarts(false);
      // Network or unexpected errors
      console.error(err);
      setUploadErrorMessage(err.message || "Something went wrong while uploading the file.");
      setUploadFailedAlert(true);
    }
};

  const handleSubmitFileUploadClosed = () => {
    // Reset all the states to initial
    alert("Are you sure you want to cancel the file upload?");
    setSubmittingDialogOpen(false);
    setSelectedCallList("");
    handleBack();
  };
  
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 1,
        }}
      >
        <ThemeProvider theme={theme}>
          <Paper
            sx={{
              borderRadius: 2,
              width: "90%",
              padding: 2,
              marginBottom: 3,
            }}
          >
            <Stepper activeStep={activeStep}>
              {steps.map((label) => {
                return (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </Paper>

          {activeStep < 2 ? (
            <Card
              sx={{ width: "60%", marginTop: 2, padding: 1, borderRadius: 2 }}
            >
              <CardContent>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ marginBottom: 2 }}
                >
                  Select contact list
                </Typography>
                <Typography variant="body" component="div">
                  Content (requirements for the file upload):
                  <ul>
                    <li>Allowed file formats: .csv, .xls, .xlsx</li>
                    <li>The first row of the file must contain headers.</li>
                    <li>
                      In Excel files, contacts must be listed in the first
                      worksheet.
                    </li>
                  </ul>
                </Typography>

                {/* Hidden file input */}
                <TextField
                  type="file"
                  inputRef={fileInputRef}
                  onChange={handleFileChange}
                  sx={{ display: "none" }}
                />

                {/* Show selected file name */}
                <TextField
                  value={fileName ? fileName : "No file selected"}
                  variant="standard"
                  fullWidth
                  size="medium"
                  margin="normal"
                  aria-readonly
                />
              </CardContent>
              <CardActions sx={{ justifyContent: "space-between" }}>
                <Button
                  variant="contained"
                  color="dustblue"
                  onClick={handleButtonClick}
                >
                  Select file
                </Button>
                <Button
                  variant="contained"
                  color="dustblue"
                  disabled={ifNextDisabled}
                  onClick={() => setOpenPreview(true)}
                >
                  Next
                </Button>
              </CardActions>
            </Card>
          ) : null}
          <ReviewContactsUploading
            open={open}
            setOpen={setOpen}
            openPreview={openPreview}
            setOpenPreview={setOpenPreview}
            handleNext={handleNext}
            fileToPreview={fileToPreview}
            handleBack={handleBack}
            handleStepBack={handleStepBack}
            mapping={mapping}
            setMapping={setMapping}
            handleOpenCallListDialog={handleOpenCallListDialog}
          />
          <AssignCallListToUploading
            openCallListDialog={openCallListDialog}
            handleCloseCallListDialog={handleCloseCallListDialog}
            handleSubmitDialogWindowOpen={handleSubmitDialogWindowOpen}
            selectedCallList={selectedCallList}
            setSelectedCallList={setSelectedCallList}
          />

          <SubmitFileUploading
            submittingDialogOpen={submittingDialogOpen}
            handleSubmitFileUpload={handleSubmitFileUpload}
            handleSubmitFileUploadClosed={handleSubmitFileUploadClosed}
          />
          {loadingStarts ? <CircularProgress sx={{ color: "#08205eff" }} /> : null}

          {(uploadFailedAlert || completeAlert) && (
            <Alert
              sx={{ marginTop: 10, fontSize: "13px" }}
              severity={
                 uploadErrorMessage && numberUploadedRows > 0
                ? "warning"
                : completeAlert && numberUploadedRows > 0
                ? "success": "error"}
              onClose={() => {
                setCompleteAlert(false);
                setUploadFailedAlert(false);
                setSelectedCallList("");
                setNumberUploadedRows(0);
                setUploadErrorMessage("");
                handleBack();
              }}
            >
              <AlertTitle sx={{  mt: 2, fontSize: "15px" }}>
                 {uploadErrorMessage && numberUploadedRows > 0
                  ? `Upload Completed with Warnings (${numberUploadedRows} row(s) uploaded)`
                  : completeAlert && numberUploadedRows > 0
                  ? `Upload Successful (${numberUploadedRows} row(s))`
                  : "Upload Failed"}
              </AlertTitle>
              
                {uploadErrorMessage ? (
                  <>
                  <br />
                  These issues were found:
                  <br />
                  <br /> 
                    {uploadErrorMessage.split("\n").map((msg, idx) => (
                         <Typography key={idx} component="span" display="block">
                            {msg}
                         </Typography>
                     ))}
                  </>
                ) : completeAlert && numberUploadedRows > 0 ?  (
                  "Your file has been uploaded and is ready to use."
                ) : (
                  "There was an error uploading your file. Please try again."   
                ) 
               }
            </Alert>
              )}
        </ThemeProvider>
      </Box>
    </>
  );
}
