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
import { useTranslation } from "react-i18next";

export default function StatusesCallView({ addNewStatus, statusList }) {
  const statuses = statusList || []; // Ensure statusList is an array
  const totalStatuses = statuses.length;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { t, i18n } = useTranslation();

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
      status: "scheduledCall",
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
          {t("callStatusArea.callActivity")}
          {totalStatuses > 0 ? `: ${totalStatuses}` : ""}
        </Typography>

        <IconButton
          id="basic-button"
          onClick={handleClick}
          sx={{ color: "#08205e", fontSize: 15 }}
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          {t("callStatusArea.addCallStatusTitle")}
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
          <MenuItem onClick={() => handleAddStatus("meetingScheduled")}>
            <EventAvailableOutlinedIcon
              sx={{ color: "#214f19", fontSize: 20, marginRight: 1 }}
            />
            {t("callStatusArea.meetingScheduled")}
          </MenuItem>
          <MenuItem onClick={() => handleAddStatus("open")}>
            <EventRepeatOutlinedIcon
              sx={{ color: "#08205e", fontSize: 20, marginRight: 1 }}
            />
            {t("callStatusArea.open")}
          </MenuItem>
          <MenuItem onClick={() => handleCalendarOpen()}>
            <EventOutlinedIcon
              sx={{ color: "#08205e", fontSize: 20, marginRight: 1 }}
            />
            {t("callStatusArea.scheduledCall")}
          </MenuItem>
          <MenuItem onClick={() => handleAddStatus("notInterested")}>
            <EventBusyOutlinedIcon
              sx={{ color: "#863737", fontSize: 20, marginRight: 1 }}
            />
            {t("callStatusArea.notInterested")}
          </MenuItem>
          <MenuItem onClick={() => handleAddStatus("noAnswer")}>
            <PhoneDisabledIcon
              sx={{ color: "#867537ff", fontSize: 20, marginRight: 1 }}
            />
            {t("callStatusArea.noAnswer")}
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
                {status.status === "meetingScheduled" ? (
                  <EventAvailableOutlinedIcon sx={{ color: "#214f19" }} />
                ) : status.status === "open" ? (
                  <EventRepeatOutlinedIcon sx={{ color: "#08205e" }} />
                ) : status.status === "scheduledCall" ? (
                  <EventOutlinedIcon sx={{ color: "#08205e" }} />
                ) : status.status === "notInterested" ? (
                  <EventBusyOutlinedIcon sx={{ color: "#863737" }} />
                ) : status.status === "noAnswer" ? (
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
                  {status.status === "scheduledCall" && status.scheduled_call
                    ? `${t("callStatusArea.scheduledCall")} (${dayjs(
                        status.scheduled_call,
                      ).format("DD.MM.YYYY HH:mm")})`
                    : status.status
                      ? t(`callStatusArea.${status.status}`)
                      : null}
                </Typography>
                <Typography>
                  {dayjs(status.call_timestamp)
                    .locale(i18n.language)
                    .format("HH:mm")}
                </Typography>
              </Stack>

              {/* Secondary row */}
              <Stack
                sx={{ width: "100%" }}
                direction="row"
                justifyContent="flex-end"
              >
                <Typography>
                  {dayjs(status.call_timestamp)
                    .locale(i18n.language)
                    .format("dddd DD.MM.YYYY")}{" "}
                </Typography>
              </Stack>
            </Stack>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
