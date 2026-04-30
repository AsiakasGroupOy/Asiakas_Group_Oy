import dayjs from "dayjs";
import { useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/fi";
import utc from "dayjs/plugin/utc";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDateTimePicker } from "@mui/x-date-pickers/DesktopDateTimePicker";
import { Dialog, DialogActions, Button } from "@mui/material";

dayjs.extend(utc);

export default function ScheduledCallCalendar({ open, onClose, onSave }) {
  const [scheduledCallValue, setScheduledCallValue] = useState(null);

  const handleSave = () => {
    const utcDateTime = scheduledCallValue.toISOString();
    onSave(utcDateTime);
    setScheduledCallValue(null); // Reset the date picker value after saving
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return; // prevent closing on outside click
        onClose();
        setScheduledCallValue(null); // Reset the date picker value when closing
      }}
    >
      <DialogActions
        sx={{
          flexDirection: "column",
          alignItems: "center",
          padding: 2,
          gap: 1,
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fi">
          <DesktopDateTimePicker
            viewRenderers={{
              hours: null,
              minutes: null,
              seconds: null,
            }}
            value={scheduledCallValue}
            onChange={(newValue) => {
              setScheduledCallValue(newValue);
            }}
          />
        </LocalizationProvider>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "90%",
          }}
        >
          <Button onClick={onClose} color="warning" variant="contained">
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            variant="contained"
            color="dustblue"
            autoFocus
          >
            Save
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
}
