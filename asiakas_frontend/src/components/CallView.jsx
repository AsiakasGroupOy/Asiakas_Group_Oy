import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PersonIcon from "@mui/icons-material/Person";
import { useLocation } from "react-router-dom";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import theme from "../theme";
import { ThemeProvider } from "@mui/material/styles";
import {
  addNote,
  addStatus,
  fetchByFirstFromConCallingList,
  fetchByNavIdFromConCallingList,
  fetchByCallingListName,
  fetchCallLists,
  editContact,
} from "../services/contactListApi.js";
import StatusesCallView from "./StatusesCallView";
import EditContact from "./EditContact.jsx";
import { useAuth } from "./users_components/AuthContext.jsx";
import AlertMessage from "./AlertMessage.jsx";

export default function CallView() {
  const [currentOrgIndex, setCurrentOrgIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [companySearch, setCompanySearch] = useState("");
  const [noteValue, setNoteValue] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [callListOptions, setCallListOptions] = useState([]);
  const [filteredOrgNames, setFilteredOrgNames] = useState([]);
  const [callListSearch, setCallListSearch] = useState(null);
  const [alert, setAlert] = useState(null);
  const location = useLocation();

  const [currentConcalId, setCurrentConcalId] = useState(
    location.state?.id || null
  );

  useEffect(() => {
    const filteredFromConCallingList = async () => {
      let data;
      if (!currentConcalId) {
        data = await fetchByFirstFromConCallingList();
      } else {
        data = await fetchByNavIdFromConCallingList(currentConcalId);
      }

      if (data.status === "success" && data.data.length > 0) {
        setFilteredContacts(data.data);
      } else {
        setFilteredContacts([]);
        window.alert(data.message); // Alert for empty or error
      }
    };
    filteredFromConCallingList();
  }, []);

  // Extract unique calling list names for the dropdown
  useEffect(() => {
    const fetchCallingLists = async () => {
      const clNames = await fetchCallLists();

      if (clNames.status === "success" && clNames.data.length > 0) {
        setCallListOptions(clNames.data.map((c) => c.calling_list_name));
      } else {
        setCallListOptions([]);
      }
    };
    fetchCallingLists();
  }, []);

  useEffect(() => {
    if (!filteredContacts.length) return;

    // Find the current contact by id
    let currentContact;
    if (currentConcalId) {
      currentContact = filteredContacts.find(
        (c) => String(c.concal.concal_id) === String(currentConcalId)
      );
    } else {
      currentContact = filteredContacts[0]; // Default to the first contact if no id is provided
    }

    const filteredByCompany = filteredContacts.filter(
      (c) =>
        c.contact.organization_name === currentContact.contact.organization_name
    );

    const startIdx = filteredByCompany.findIndex(
      (c) =>
        String(c.concal.concal_id) === String(currentContact.concal.concal_id)
    );

    const orgNames = [
      ...new Set(filteredContacts.map((c) => c.contact.organization_name)),
    ];

    setFilteredOrgNames(orgNames);

    const startOrgIdx = orgNames.findIndex(
      (c) => c === currentContact.contact.organization_name
    );

    setCurrentOrgIndex(startOrgIdx >= 0 ? startOrgIdx : 0);
    setCurrentIndex(startIdx >= 0 ? startIdx : 0);
    setCallListSearch(currentContact.calling_list.calling_list_name);
    setCompanySearch(currentContact.contact.organization_name);

    // Filter contacts by current contact's organization name
  }, [filteredContacts]);

  const handleCallListChange = async (callListName) => {
    setCurrentConcalId("");
    const data = await fetchByCallingListName(callListName);
    if (data.status === "success") {
      setFilteredContacts(data.data);
    } else {
      setFilteredContacts([]);
      window.alert(data.message); // Alert for empty or error
    }
  };

  const saveNoteToDB = async (newNote) => {
    const ccl_id = contact.concal.concal_id;
    const dataNote = await addNote(ccl_id, newNote);
    if (dataNote.status === "success") {
      setCurrentConcalId(ccl_id);
      const data = await fetchByNavIdFromConCallingList(ccl_id);
      if (data.status === "success") {
        setFilteredContacts(data.data);
        setNoteValue(newNote);
      } else {
        setFilteredContacts([]);
        window.alert(data.message); // Alert for empty or error
      }
    } else {
      setAlert({
        status: dataNote.status,
        message: dataNote.message,
      });
    }
  };

  // Filtering logic
  let companyMatch = filteredContacts.filter((c) =>
    c.contact.organization_name
      .toLowerCase()
      .includes(companySearch.trim().toLowerCase())
  );

  // If no matches, use the currentContact as the only result (if it exists)
  const activeContacts = companyMatch;
  console.log("Active Contacts:", activeContacts);
  const contact = activeContacts[currentIndex] || activeContacts[0];

  const goToContact = (idx) => {
    if (activeContacts[idx]) {
      setCurrentIndex(idx);
    }
  };

  const goToOrganization = (idx) => {
    if (filteredOrgNames.length > 0) {
      setCurrentOrgIndex(idx);
      const companySearch = filteredOrgNames[idx] || "";
      setCompanySearch(companySearch);
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    if (contact && contact.concal) {
      setNoteValue(contact.concal.note || "");
    }
  }, [contact]);

  const addNewStatus = async (status) => {
    const ccl_id = contact.concal.concal_id;
    const newStatus = status;
    const dataStatus = await addStatus(ccl_id, newStatus);
    if (dataStatus.status === "success") {
      setCurrentConcalId(ccl_id);
      const data = await fetchByNavIdFromConCallingList(ccl_id);
      if (data.status === "success") {
        setFilteredContacts(data.data);
      } else {
        setFilteredContacts([]);
        window.alert(data.message); // Alert for empty or error
      }
    } else {
      setAlert({
        status: dataStatus.status,
        message: dataStatus.message,
      });
    }
  };

  const saveEditContact = async (editContactData) => {
    const ccl_id = contact.concal.concal_id;
    const saveData = await editContact(editContactData);
    if (saveData.status === "success") {
      setCurrentConcalId(ccl_id);
      const data = await fetchByNavIdFromConCallingList(ccl_id);
      if (data.status === "success") {
        setFilteredContacts(data.data);
      } else {
        setFilteredContacts([]);
        window.alert(data.message); // Alert for empty or error
      }
    } else {
      setAlert({
        status: saveData.status,
        message: saveData.message,
      });
    }
  };
  return (
    <>
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "left",
            left: 0,
          }}
        >
          <LocalPhoneIcon
            sx={{ color: "#08205e", fontSize: 22, marginRight: 1 }}
          />
          <Typography variant="h6" sx={{ color: "#08205e" }}>
            Call View
          </Typography>
        </Box>
        <Box sx={{ minWidth: 800, overflow: "auto" }}>
          <Paper sx={{ display: "flex", p: 2, gap: 3, m: 2 }}>
            <Stack
              spacing={{ xs: 1, sm: 2, md: 3 }}
              width={"100%"}
              direction={"column"}
            >
              {activeContacts.length > 0 && companySearch ? (
                <Stack
                  spacing={{ xs: 1, sm: 2, md: 1 }}
                  direction={"row"}
                  alignItems={"center"}
                >
                  <BusinessIcon sx={{ color: "#08205e", fontSize: 22 }} />
                  <Typography variant="h6">
                    {contact.contact.organization_name}
                  </Typography>
                  {!callListSearch ? (
                    <Stack
                      spacing={{ xs: 1, sm: 2, md: 1 }}
                      sx={{ borderLeft: "1px solid #08205e", paddingLeft: 3 }}
                      direction={"row"}
                      alignItems={"center"}
                    >
                      <AssignmentOutlinedIcon
                        sx={{ color: "#08205e", fontSize: 22 }}
                      />
                      <Typography variant="h6">
                        {contact.calling_list.calling_list_name}
                      </Typography>
                    </Stack>
                  ) : null}
                </Stack>
              ) : null}

              <Stack spacing={{ xs: 1, sm: 2, md: 2 }} direction="row">
                <TextField
                  label="Search Company"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  size="small"
                  sx={{ width: "100%" }}
                />
                <FormControl size="small" sx={{ width: "100%" }}>
                  <InputLabel id="calllist-label" shrink>
                    Search Call list
                  </InputLabel>
                  <Select
                    labelId="calllist-label"
                    label="Search Call List"
                    value={
                      callListOptions.includes(callListSearch)
                        ? callListSearch
                        : ""
                    }
                    onChange={(e) => handleCallListChange(e.target.value)}
                    size="small"
                    displayEmpty
                    renderValue={(selected) => selected || "Empty list"}
                  >
                    {callListOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </Paper>
        </Box>
        {alert && <AlertMessage alert={alert} setAlert={setAlert} />}
        {activeContacts.length > 0 && companySearch ? (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                m: 2,
                width: "49%",
              }}
            >
              <Button
                variant="contained"
                color="dustblue"
                onClick={() => goToOrganization(currentOrgIndex - 1)}
                disabled={currentOrgIndex <= 0}
              >
                Previous
              </Button>
              <Typography
                variant="subtitle"
                sx={{ color: "#08205e", alignSelf: "center" }}
              >
                {filteredOrgNames.length > 1 &&
                  `Company ${currentOrgIndex + 1} of ${
                    filteredOrgNames.length
                  }`}
              </Typography>
              <Button
                variant="contained"
                color="dustblue"
                onClick={() => goToOrganization(currentOrgIndex + 1)}
                disabled={currentOrgIndex >= filteredOrgNames.length - 1}
              >
                Next
              </Button>
            </Box>

            <Box sx={{ minWidth: 800, overflow: "auto" }}>
              <Paper sx={{ display: "flex", p: 2, gap: 3, m: 2 }}>
                <Stack spacing={{ xs: 1, sm: 2, md: 4 }} width={"100%"}>
                  <Stack
                    sx={{ borderBottom: "1px solid #08205e", width: "50%" }}
                    direction="row"
                    alignItems="center"
                  >
                    <PersonIcon
                      sx={{ color: "#08205e", fontSize: 27, marginRight: 1 }}
                    />
                    <Typography variant="h6">
                      {(contact.contact.first_name || "") +
                        " " +
                        (contact.contact.last_name || "")}
                    </Typography>
                    <EditContact
                      sx={{ ml: "auto" }}
                      editContact={contact.contact}
                      saveEditContact={saveEditContact}
                    />
                  </Stack>
                  <Stack spacing={{ xs: 1, sm: 2, md: 2 }} direction="row">
                    <Stack spacing={{ xs: 1, sm: 2, md: 2 }} width={"100%"}>
                      <Stack spacing={{ xs: 1, sm: 2, md: 2 }} direction="row">
                        <TextField
                          label="Name"
                          value={contact.contact.first_name || ""}
                          size="small"
                          sx={{ width: "50%" }}
                        />
                        <TextField
                          label="Surname"
                          value={contact.contact.last_name || ""}
                          size="small"
                          sx={{ width: "50%" }}
                        />
                      </Stack>
                      <Stack spacing={{ xs: 1, sm: 2, md: 2 }} direction="row">
                        <TextField
                          label="Job Title"
                          value={contact.contact.job_title || ""}
                          size="small"
                          sx={{ width: "50%" }}
                        />
                        <TextField
                          label="Phone"
                          value={contact.contact.phone}
                          size="small"
                          sx={{ width: "50%" }}
                        />
                      </Stack>
                      <Stack spacing={{ xs: 1, sm: 2 }} width="100%">
                        <TextField
                          label="Email"
                          value={contact.contact.email || ""}
                          size="small"
                          sx={{ width: "100%" }}
                        />
                        <TextField
                          label="Website"
                          value={contact.contact.website || ""}
                          size="small"
                          sx={{ width: "100%" }}
                        />
                      </Stack>
                    </Stack>

                    <Stack spacing={{ xs: 1, sm: 2 }} width="100%">
                      <TextField
                        id="outlined-multiline-static"
                        label="Notes"
                        multiline
                        rows={9}
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        onBlur={() => {
                          if ((contact?.concal?.note || "") !== noteValue) {
                            saveNoteToDB(noteValue);
                          }
                        }} // Save on blur
                        size="small"
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
              <Paper sx={{ display: "flex", p: 2, gap: 3, m: 2, width: "49%" }}>
                <StatusesCallView
                  addNewStatus={addNewStatus}
                  statusList={contact.call_log}
                />
              </Paper>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  m: 2,
                  width: "49%",
                }}
              >
                <ThemeProvider theme={theme}>
                  <Button
                    variant="contained"
                    color="dustblue"
                    onClick={() => goToContact(currentIndex - 1)}
                    disabled={currentIndex <= 0}
                  >
                    Previous
                  </Button>
                  <Typography
                    variant="subtitle"
                    sx={{ color: "#08205e", alignSelf: "center" }}
                  >
                    {activeContacts.length > 1 &&
                      `Contact ${currentIndex + 1} of ${activeContacts.length}`}
                  </Typography>
                  <Button
                    variant="contained"
                    color="dustblue"
                    onClick={() => goToContact(currentIndex + 1)}
                    disabled={currentIndex >= activeContacts.length - 1}
                  >
                    Next
                  </Button>
                </ThemeProvider>
              </Box>
            </Box>
          </>
        ) : (
          <Typography sx={{ p: 4 }}>No contact found.</Typography>
        )}
      </ThemeProvider>
    </>
  );
}
