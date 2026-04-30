import { useState } from "react";
import Stack from "@mui/material/Stack";
import {
  MenuItem,
  Menu,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  Icon,
} from "@mui/material";
import dayjs from "dayjs";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import ScheduledCallCalendar from "./ScheduledCallCalendar.jsx";

export default function StatusesCallView({ addNewStatus, statusList }) {
  const statuses = statusList || []; // Ensure statusList is an array
  const totalStatuses = statuses.length;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [calendarOpen, setCalendarOpen] = useState(false);
  console.log("StatusesCallView rendered with statuses:", statuses);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAddStatus = (status) => {
    addNewStatus({ status: status });
    setAnchorEl(null);
  };

  const handleCalendarOpen = () => {
    setCalendarOpen(true);
    setAnchorEl(null);
  };

  const handleSaveScheduledCall = async (utcDateTime) => {
    addNewStatus({
      status: "Scheduled Call",
      scheduledCall: utcDateTime,
    });

    setCalendarOpen(false);
  };

  return (
    <Stack spacing={{ xs: 1, sm: 2 }} width="100%">
      <Stack
        spacing={{ xs: 1, sm: 2 }}
        direction="row"
        justifyContent={"space-between"}
        alignItems="center"
      >
        <Typography variant="h10">
          Call Activity{totalStatuses > 0 ? `: ${totalStatuses}` : ""}
        </Typography>

        <IconButton
          id="basic-button"
          onClick={handleClick}
          sx={{ color: "#08205e", fontSize: 15 }}
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          Add Call Status
          <AddIcon sx={{ color: "#08205e", fontSize: 15, marginLeft: 1 }} />
        </IconButton>

        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          slotProps={{
            list: {
              "aria-labelledby": "basic-button",
            },
          }}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        >
          <MenuItem onClick={() => handleAddStatus("Meeting Scheduled")}>
            <EventAvailableOutlinedIcon
              sx={{ color: "#214f19", fontSize: 20, marginRight: 1 }}
            />
            Meeting Scheduled
          </MenuItem>
          <MenuItem onClick={() => handleAddStatus("Open")}>
            <EventRepeatOutlinedIcon
              sx={{ color: "#08205e", fontSize: 20, marginRight: 1 }}
            />
            Open
          </MenuItem>
          <MenuItem onClick={() => handleCalendarOpen()}>
            <EventOutlinedIcon
              sx={{ color: "#08205e", fontSize: 20, marginRight: 1 }}
            />
            Scheduled Call
          </MenuItem>
          <MenuItem onClick={() => handleAddStatus("Not Interested")}>
            <EventBusyOutlinedIcon
              sx={{ color: "#863737", fontSize: 20, marginRight: 1 }}
            />
            Not Interested
          </MenuItem>
          <MenuItem onClick={() => handleAddStatus("No Answer")}>
            <PhoneDisabledIcon
              sx={{ color: "#867537ff", fontSize: 20, marginRight: 1 }}
            />
            No Answer
          </MenuItem>
        </Menu>
      </Stack>
      <ScheduledCallCalendar
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onSave={handleSaveScheduledCall}
      />
      <List width="100%" sx={{ overflowY: "auto", maxHeight: 300 }}>
        {statuses.map((status, index) => (
          <ListItem
            sx={{ py: 0, paddingRight: 4, width: "100%" }}
            key={index}
            secondaryAction={
              <IconButton edge="end" aria-label="delete"></IconButton>
            }
          >
            <ListItemIcon>
              <Icon sx={{ height: "100%" }}>
                {status.status === "Meeting Scheduled" ? (
                  <EventAvailableOutlinedIcon sx={{ color: "#214f19" }} />
                ) : status.status === "Open" ? (
                  <EventRepeatOutlinedIcon sx={{ color: "#08205e" }} />
                ) : status.status === "Scheduled Call" ? (
                  <EventOutlinedIcon sx={{ color: "#08205e" }} />
                ) : status.status === "Not Interested" ? (
                  <EventBusyOutlinedIcon sx={{ color: "#863737" }} />
                ) : status.status === "No Answer" ? (
                  <PhoneDisabledIcon sx={{ color: "#867537ff" }} />
                ) : null}
              </Icon>
            </ListItemIcon>
            <Stack
              sx={{
                width: "100%",
                flexDirection: "column",
              }}
            >
              {/* Primary row */}
              <Stack
                sx={{
                  width: "100%",
                  border: "2px solid #08205e",
                  borderLeft: "none",
                  borderRight: "none",
                  borderTop: "none",
                  paddingTop: 0.9,
                }}
                direction="row"
                justifyContent="space-between"
              >
                <Typography>
                  {status.status === "Scheduled Call" && status.scheduled_call
                    ? `Scheduled Call (${dayjs(status.scheduled_call).format(
                        "DD.MM.YYYY HH:mm",
                      )})`
                    : status.status}
                </Typography>
                <Typography>
                  {dayjs(status.call_timestamp).format("HH:mm")}
                </Typography>
              </Stack>

              {/* Secondary row */}
              <Stack
                sx={{ width: "100%" }}
                direction="row"
                justifyContent="flex-end"
              >
                <Typography>
                  {dayjs(status.call_timestamp).format("dddd DD.MM.YYYY")}{" "}
                </Typography>
              </Stack>
            </Stack>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
