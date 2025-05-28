import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {faUserPlus} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Autocomplete from '@mui/material/Autocomplete';
import { fetchOrganizations, fetchCallLists } from '../contactListApi';


export default function AddContactForm({addNewContact}) {
  const [open, setOpen] = React.useState(false);
  const [organizationList, setOrganizationList] = useState([]); // State to hold organization names
  const [callingListNames, setCallingListNames] = useState([]); // State to hold calling list names

  const handleClickOpen = () => {
    setOpen(true);
    setContact({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      job_title: "",
      note: "",
      organization_name: "",
      calling_list_name: ""
    });
  };

  const handleClose = () => {
    setOpen(false);
  };
 const [contact, setContact] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    note: "",
    organization_name: "",
    calling_list_name: "", // <-- User can type a new or existing list name
  });
// Fetch organizations and CallLists on mount

useEffect(() => {
  Promise.all([fetchOrganizations(), fetchCallLists()])
    .then(([organizations, callLists]) => {
      setOrganizationList(organizations.map(org => org.organization_name));
      setCallingListNames(callLists.map(list => list.calling_list_name));
    })
    .catch(() => {
      setOrganizationList([]);
      setCallingListNames([]);
    });
}, []);
  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

    const handleSave = (e) => {
        e.preventDefault();
        addNewContact(contact);
        handleClose();
        console.log("Contact saved:", contact);
    }
  return (
    <React.Fragment>
               <Button
            variant="contained"
            color="dustblue"
            startIcon={<FontAwesomeIcon icon={faUserPlus} />}
            onClick={handleClickOpen}
          >
            Add New Contact
          </Button>
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle color='dustblue'>
          <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: 8 }} />
          Add New Contact
        </DialogTitle>
        <DialogContent>
         <TextField
            autoFocus
            required
            margin="dense"
            label="First Name"
            name="first_name" value={contact.first_name} onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            label="Last Name"
            name="last_name" value={contact.last_name} onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            margin="dense"
            label="Job Title"
           name="job_title" value={contact.job_title} onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            label="Phone"
            name="phone" value={contact.phone} onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            label="Email Address"
            name="email" value={contact.email} onChange={handleChange}
            fullWidth
            variant="standard"
          />
          
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            name="note" value={contact.note} onChange={handleChange} 
            fullWidth
            variant="standard"
          />
          <Autocomplete
            freeSolo
            size='small'
            options={organizationList} // array of organization names
            value={contact.organization_name}
            onInputChange={(event, newValue) => {
                setContact({ ...contact, organization_name: newValue });
            }}
            renderInput={(params) => (
                <TextField {...params} label="Organization" variant="standard" required />
            )}
            />
          <Autocomplete
            freeSolo
            size='small'
            options={callingListNames} // array of Calling lists names
            value={contact.calling_list_name}
            onInputChange={(event, newValue) => {
                setContact({ ...contact, calling_list_name: newValue });
            }}
            renderInput={(params) => (
                <TextField {...params} label="Calling List" variant="standard" required />
            )}
            />
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained"
            color="dustblue"
            onClick={handleClose}>Cancel</Button>
          <Button 
            variant="contained"
            color="dustblue"
            onClick={handleSave}>Save contact</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}