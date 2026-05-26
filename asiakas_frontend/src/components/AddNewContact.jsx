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
import Autocomplete from "@mui/material/Autocomplete";
import { fetchOrganizations, fetchCallLists } from "../services/contactListApi";
import { useTranslation } from "react-i18next";
import AlertMessage from "./AlertMessage";

export default function AddContactForm({ addNewContact, setAgGridFilter }) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [alert, setAlert] = useState(null);

  const [organizationList, setOrganizationList] = useState([]); // State to hold organization names
  const [callingListNames, setCallingListNames] = useState([]); // State to hold calling list names
  const [contact, setContact] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    note: "",
    organization_name: "", // <-- User can type a new or existing list name
    website: "",
    calling_list_name: "", // <-- User can type a new or existing list name
  });
  // Fetch organizations and CallLists on mount

  const fetchOrganizationAndCallLists = async () => {
    const [organizations, callLists] = await Promise.all([
      fetchOrganizations(),
      fetchCallLists(),
    ]);

    if (organizations.status === "success" && organizations.data.length > 0) {
      setOrganizationList(
        organizations.data.map((org) => org.organization_name),
      );
    } else {
      setOrganizationList([]);
      window.alert(
        organizations.message.startsWith("apiFetchErrors.")
          ? t(organizations.message)
          : t("Error"),
      );
    }

    if (callLists.status === "success" && callLists.data.length > 0) {
      setCallingListNames(callLists.data.map((list) => list.calling_list_name));
    } else {
      setCallingListNames([]);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    setAgGridFilter(false);
    setContact({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      job_title: "",
      note: "",
      organization_name: "",
      website: "",
      calling_list_name: "",
    });
    fetchOrganizationAndCallLists();
  };

  const handleClose = () => {
    setOpen(false);
    setAgGridFilter(true);
  };

  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (
      !contact.first_name ||
      !contact.last_name ||
      !contact.phone ||
      !contact.organization_name ||
      !contact.calling_list_name
    ) {
      setAlert({
        status: "error",
        message: t("addNewContact.errors.alertRequiredFields"),
      });
      return;
    }
    addNewContact(contact);
    handleClose();
  };
  return (
    <>
      <Button
        variant="contained"
        color="dustblue"
        startIcon={<FontAwesomeIcon icon={faUserPlus} />}
        onClick={handleClickOpen}
      >
        {t("addNewContact.addButton")}
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle color="dustblue">
          <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: 8 }} />
          {t("addNewContact.dialogTitle")}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            label={t("addNewContact.firstName")}
            name="first_name"
            value={contact.first_name}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            required
            margin="dense"
            label={t("addNewContact.lastName")}
            name="last_name"
            value={contact.last_name}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            label={t("addNewContact.jobTitle")}
            name="job_title"
            value={contact.job_title}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            required
            margin="dense"
            label={t("addNewContact.phone")}
            name="phone"
            value={contact.phone}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            label={t("addNewContact.email")}
            name="email"
            value={contact.email}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />

          <TextField
            margin="dense"
            label={t("addNewContact.note")}
            name="note"
            value={contact.note}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <Autocomplete
            freeSolo
            required
            size="small"
            options={organizationList} // array of organization names
            value={contact.organization_name}
            onInputChange={(event, newValue) => {
              setContact({ ...contact, organization_name: newValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoComplete="off"
                label={t("addNewContact.organization")}
                variant="standard"
                required
                onKeyDown={(e) => e.stopPropagation()}
              />
            )}
          />

          <TextField
            margin="dense"
            label={t("addNewContact.website")}
            name="website"
            value={contact.website}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <Autocomplete
            freeSolo
            required
            size="small"
            options={callingListNames} // array of Calling lists names
            value={contact.calling_list_name}
            onInputChange={(event, newValue) => {
              setContact({ ...contact, calling_list_name: newValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("addNewContact.callingList")}
                variant="standard"
                required
                onKeyDown={(e) => e.stopPropagation()}
              />
            )}
          />
        </DialogContent>
        {alert && <AlertMessage alert={alert} setAlert={setAlert} />}
        <DialogActions>
          <Button variant="contained" color="dustblue" onClick={handleClose}>
            {t("addNewContact.cancel")}
          </Button>
          <Button variant="contained" color="dustblue" onClick={handleSave}>
            {t("addNewContact.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
