import * as React from "react";
import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import IconButton from "@mui/material/IconButton";

export default function EditContact({ editContact, saveEditContact }) {
  const [open, setOpen] = React.useState(false);

  const [contact, setContact] = useState({
    contact_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
  });
  // Fetch organizations and CallLists on mount

  const handleClickOpen = () => {
    setOpen(true);
    setContact({
      contact_id: editContact.contact_id,
      first_name: editContact.first_name || "",
      last_name: editContact.last_name || "",
      email: editContact.email || "",
      phone: editContact.phone || "",
      job_title: editContact.job_title || "",
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveEditContact(contact);
    handleClose();
  };
  return (
    <>
      <IconButton onClick={handleClickOpen} sx={{ ml: "auto" }}>
        <EditOutlinedIcon sx={{ color: "#08205e", fontSize: "23px" }} />
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle color="dustblue">
          <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: 8 }} />
          Edit Contact
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            label="First Name"
            name="first_name"
            value={contact.first_name}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            required
            margin="dense"
            label="Last Name"
            name="last_name"
            value={contact.last_name}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            label="Job Title"
            name="job_title"
            value={contact.job_title}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            required
            margin="dense"
            label="Phone"
            name="phone"
            value={contact.phone}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            label="Email Address"
            name="email"
            value={contact.email}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="dustblue" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="dustblue" onClick={handleSave}>
            Save contact
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
