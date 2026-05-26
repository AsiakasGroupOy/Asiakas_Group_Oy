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
import { filePreview } from "../services/importFileApi"; // Import the file preview function
import AlertMessage from "./AlertMessage";
import { useTranslation } from "react-i18next";

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
  const [alert, setAlert] = useState(null);
  const { t } = useTranslation();

  const initialPreview = async () => {
    try {
      if (!fileToPreview) {
        throw new Error(t("reviewContactsUploading.errMessages.noFile"));
      }

      const dataPreview = await filePreview(fileToPreview);

      if (dataPreview.status === "error") {
        throw new Error(
          dataPreview.message ||
            t("reviewContactsUploading.errMessages.errFetchingPreview"),
        );
      }

      setPreviewRows(dataPreview.data.rows);
      setMappingOptions(dataPreview.data.mappingOptions);
      setHeaders(dataPreview.data.headers);
      console.log("Preview data fetched successfully:", dataPreview);
      return true; // Indicate success
    } catch (error) {
      setAlert({
        status: "error",
        title: t("reviewContactsUploading.alert.title"),
        message: error.message || t("reviewContactsUploading.alert.message"),
      });

      return false;
    }
  };

  const translateMappingOption = (option) =>
    t(`reviewContactsUploading.mappingOptions.${option}`, option);

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
      } else {
        setPreviewRows([]);
        setMappingOptions([]);
        setHeaders([]);
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
    if (!mapping || !Object.values(mapping).includes("phone")) {
      setWarning(t("reviewContactsUploading.mappingWarning.phoneMapping"));
      return;
    }
    if (!mapping || !Object.values(mapping).includes("organization_name")) {
      setWarning(
        t("reviewContactsUploading.mappingWarning.organizationMapping"),
      );
      return;
    }

    if (
      Object.keys(mapping).length !== headers.length ||
      Object.values(mapping).includes("")
    ) {
      setWarning(t("reviewContactsUploading.mappingWarning.missedMapping"));
      return;
    }

    setWarning(""); // Clear any previous warnings
    handleOpenCallListDialog();
    setOpen(false); // Close the preview dialog but save all changes
  };

  return (
    <>
      {alert && <AlertMessage alert={alert} setAlert={setAlert} />}
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
          {t("reviewContactsUploading.mappingTitle")}
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
                          color:
                            mapping[col] && mapping[col] !== ""
                              ? "#08205eff"
                              : "#6a1a1aff", // only for this component
                          fontSize: "15px",
                        },
                      }}
                    >
                      <MenuItem
                        value=""
                        sx={{ fontSize: "12px", fontWeight: "bold" }}
                      >
                        {t("reviewContactsUploading.emptyMapField")}
                      </MenuItem>
                      {mappingOptions.map((option) => (
                        <MenuItem
                          key={option}
                          value={option}
                          disabled={
                            option !== "do_not_import" &&
                            Object.values(mapping).includes(option)
                          }
                        >
                          {translateMappingOption(option)}
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
            {t("reviewContactsUploading.buttons.cancel")}
          </Button>
          <Button
            variant="contained"
            color="dustblue"
            onClick={handleOpenNextCallListDialog}
            autoFocus
          >
            {t("reviewContactsUploading.buttons.next")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
