import { useState } from "react";
import Stack from "@mui/material/Stack";
import {
  Divider,
  MenuItem,
  Menu,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Icon,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";

export default function StatusesCallView({ addNewStatus, statusList }) {
  const statuses = statusList || []; // Ensure statusList is an array
  const totalStatuses = statuses.length;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAddStatus = (status) => {
    addNewStatus(status);
    setAnchorEl(null);
  };

  return (
    <Stack spacing={{ xs: 1, sm: 2 }} width="100%">
      <Stack
        spacing={{ xs: 1, sm: 2 }}
        direction="row"
        justifyContent={"space-between"}
        alignItems="center"
      >
        <Typography variant="h10">Call Activity: {totalStatuses}</Typography>

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
          <MenuItem onClick={() => handleAddStatus("Scheduled Call")}>
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
        </Menu>
      </Stack>
      <List width="100%" sx={{ overflowY: "auto", maxHeight: 300 }}>
        {statuses.map((status, index) => (
          <ListItem
            sx={{ py: 0, paddingRight: 4, width: "100%" }}
            key={index}
            alignItems="flex-start"
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
                ) : null}
              </Icon>
            </ListItemIcon>
            <ListItemText
              sx={{ width: "100%" }}
              primary={
                <Stack
                  sx={{ width: "100%" }}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography>{status.status}</Typography>
                  <Typography>
                    {new Date(status.call_timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </Typography>
                </Stack>
              }
              secondary={
                <Stack sx={{ width: "100%" }} alignItems="end">
                  <Divider sx={{ width: "100%", borderColor: "#08205e" }} />
                  <Typography>
                    {new Date(status.call_timestamp).toLocaleDateString()}
                  </Typography>
                </Stack>
              }
            />
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
