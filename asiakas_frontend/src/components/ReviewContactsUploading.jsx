import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { filePreview } from "./importFileApi"; // Import the file preview function

export default function ReviewContactsUploading({
  openPreview,
  setOpenPreview,
  open,
  setOpen,
  handleOpenCallListDialog,
  mapping,
  setMapping,
  handleNext,
  fileToPreview,
  handleBack,
}) {
  const [previewRows, setPreviewRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mappingOptions, setMappingOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");

  const initialPreview = async () => {
    try {
      if (!fileToPreview) {
        throw new Error("No file download to preview");
      }

      const data = await filePreview(fileToPreview);
      if (!data) {
        throw new Error("No preview data available");
      }

      setPreviewRows(data.rows);
      setMappingOptions(data.mappingOptions);
      setHeaders(data.headers);

      return true; // Indicate success
    } 
      catch (error) {
      alert("Error fetching preview data or incorect data format in file.");
      console.error("Error fetching preview data:", error);

      return false;
    }
  };

  useEffect(() => {
    const fetchPreview = async () => {
      if (openPreview) {
        setLoading(true);
        const success = await initialPreview();
        setLoading(false);
        if (success) {
          setOpen(true);
          handleNext();
          setWarning(""); // Clear any previous warnings
        } else {
          handleBack();
          setOpenPreview(false); // Close the preview dialog if no data is available
        }
      }
    else {  
        setPreviewRows([]);
        setMappingOptions([]);
        setHeaders([]);
      console.log("Selected preview:", openPreview);
      } 

    };
    fetchPreview();
  }, [openPreview]); // Re-run when openPreview changes

  const handleChange = (col, value) => {
    setWarning(""); // Clear any previous warnings

    setMapping((prev) => {
      const updated = { ...prev, [col]: value };
      return updated;
    });
  };

  const handleClose = () => {
    setOpen(false);
    handleBack();
  };

  const handleOpenNextCallListDialog = () => {
   
    if (!mapping || !Object.values(mapping).includes("Phone (required)")) {
      setWarning(
        "Please include a 'phone' field in the mapping before proceeding."
      );
      return;
    }
    if (!mapping || !Object.values(mapping).includes("Organization name")) {
      setWarning(
        "Please include a 'Organization name' field in the mapping before proceeding."
      );
      return;
    }

    if (Object.keys(mapping).length !== headers.length ||
        Object.values(mapping).includes("")) {
      setWarning("Please map all columns before proceeding.");
    return;
    }
    
    setWarning(""); // Clear any previous warnings
    handleOpenCallListDialog();
    setOpen(false); // Close the preview dialog but save all changes
  };

  return (
    <>
      {loading ? <CircularProgress sx={{ color: "#08205eff" }} /> : null}
      <Dialog
        open={open}
        maxWidth="lg"
        onClose={(event, reason) => {
          if (reason === "backdropClick") return; // prevent closing on outside click
          handleClose(); // allow normal closing via your Cancel button or Esc
        }}
        sx={{ marginTop: 20 }}
      >
        <DialogTitle
          sx={{ fontSize: "20px", fontWeight: "bold", color: "#08205eff" }}
        >
          Map Columns to Fields
        </DialogTitle>
        {warning && (
          <div
            style={{ color: "red", display: "flex", justifyContent: "center" }}
          >
            {warning}
          </div>
        )}
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#f9e9e959",
                  borderBottom: "2px solid #0c0c0cff",
                }}
              >
                {headers.map((col) => (
                  <TableCell key={col}>
                    <Select
                      value={mapping[col] || ""}
                      onChange={(e) => handleChange(col, e.target.value)}
                      fullWidth
                      displayEmpty
                      sx={{
                        "& .MuiInputBase-input": {
                          color:  mapping[col] && mapping[col] !== "" ? "#08205eff" : "#6a1a1aff", // only for this component
                          fontSize: "15px",
                        },
                      }}
                    >
                      <MenuItem
                        value=""
                        sx={{ fontSize: "12px", fontWeight: "bold" }}
                      >
                        -- Map field --
                      </MenuItem>
                      {mappingOptions.map((option) => (
                        <MenuItem 
                          key={option} 
                          value={option}
                          disabled={
                            option !== "Do not import" && 
                            Object.values(mapping).includes(option)}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow
                sx={{
                  backgroundColor: "#08205e1a",
                  borderBottom: "2px solid #0c0c0cff",
                }}
              >
                {headers.map((col) => (
                  <TableCell key={col} sx={{ fontSize: "12px" }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {previewRows.map((row, index) => (
                <TableRow key={index}>
                  {row.map((col, colIndex) => (
                    <TableCell key={colIndex}>{col}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "space-between",
            marginLeft: 10,
            marginRight: 10,
          }}
        >
          <Button variant="contained" color="grey" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="dustblue"
            onClick={handleOpenNextCallListDialog}
            autoFocus
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
