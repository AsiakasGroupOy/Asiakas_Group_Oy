import { useState, useEffect,useRef } from "react";
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
import {useLocation } from "react-router-dom";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import theme from "../theme";
import { ThemeProvider } from "@mui/material/styles";
import {
  addNote,
  fetchByFirstFromConCallingList,
  fetchByNavIdFromConCallingList,
  fetchByCallingListName,
  fetchCallLists,
} from "../contactListApi";

export default function CallView() {
  const [currentOrgIndex, setCurrentOrgIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [companySearch, setCompanySearch] = useState("");
  const [noteValue, setNoteValue] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [callListOptions, setCallListOptions] = useState([]);
  const [filteredOrgNames, setFilteredOrgNames] = useState([]);
  const [callListSearch, setCallListSearch] = useState("");

  const location = useLocation();
 
  const [currentConcalId, setCurrentConcalId] = useState(location.state?.id || null);
  
 
  useEffect(() => {
    const filteredFromConCallingList = async () => {
      try {
        let data;
        if (!currentConcalId) {
          data = await fetchByFirstFromConCallingList();
        } else {
          data = await fetchByNavIdFromConCallingList(currentConcalId);
        }
        setFilteredContacts(data);
      } catch (error) {
        console.error(
          "Failed to load data filtered by Calling list name",
          error
        );
      }
    };
    filteredFromConCallingList();
  }, []);

  // Extract unique calling list names for the dropdown
  useEffect(() => {
    const fetchCallingLists = async () => {
      try {
        const clNames = await fetchCallLists();
        setCallListOptions(clNames.map((c) => c.calling_list_name));
      } catch (error) {
        console.error("Failed to load calling lists: ", error);
      }
    };
    fetchCallingLists();
  }, []);

  useEffect(() => {
    if (!filteredContacts.length) return;

    // Find the current contact by id
    let currentContact;
    if (currentConcalId) {
      console.log("Current Concal ID:", currentConcalId);
      currentContact = filteredContacts.find(
        (c) => String(c.concal.concal_id) === String(currentConcalId)
      );
      console.log("Current Contact:", currentContact);
      setCurrentConcalId("")
    }
    
    else {
      currentContact = filteredContacts[0]; // Default to the first contact if no id is provided
      console.log("No currentConcalId provided, using first contact:", currentContact);
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
    try {
      const data = await fetchByCallingListName(callListName);
      setFilteredContacts(data);
    } catch (error) {
      console.error("Failed to load contacts by calling list name:", error);
    }
  };

  const saveNoteToDB = async (newNote) => {
    const ccl_id = contact.concal.concal_id;
    try {
      await addNote(ccl_id, newNote);
      setCurrentConcalId(ccl_id);
      const data= await fetchByNavIdFromConCallingList(ccl_id);
      setFilteredContacts(data);
      setNoteValue(newNote);
      console.log("note coontact id:", currentConcalId);
    } catch (error) {
      console.error("Failed to save note:", error);
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
      console.log(
        "Company names:",
        filteredOrgNames,
        "Current Org Index:",
        idx,
        "filtered:",
        filteredContacts
      );
    }
  };

  useEffect(() => {
    if (contact && contact.concal) {
      setNoteValue(contact.concal.note || "");
    }
  }, [contact]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          marginTop: 6,
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
                  value={callListSearch}
                  onChange={(e) => handleCallListChange(e.target.value)}
                  size="small"
                  displayEmpty
                  renderValue={(selected) => selected}
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
        <ThemeProvider theme={theme}>
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
              `Company ${currentOrgIndex + 1} of ${filteredOrgNames.length}`}
          </Typography>
          <Button
            variant="contained"
            color="dustblue"
            onClick={() => goToOrganization(currentOrgIndex + 1)}
            disabled={currentOrgIndex >= filteredOrgNames.length - 1}
          >
            Next
          </Button>
        </ThemeProvider>
      </Box>

      
        <Box sx={{ minWidth: 800, overflow: "auto" }}>
          <Paper sx={{ display: "flex", p: 2, gap: 3, m: 2 }}>
            <Stack spacing={{ xs: 1, sm: 2, md: 4 }} width={"100%"}>
              <Stack
                spacing={{ xs: 1, sm: 2, md: 1 }}
                sx={{ borderBottom: "1px solid #08205e", width: "50%" }}
                direction={"row"}
                alignItems={"center"}
              >
                <PersonIcon sx={{ color: "#08205e", fontSize: 27 }} />
                <Typography variant="h6">
                  {contact.contact.first_name + " " + contact.contact.last_name}
                </Typography>
              </Stack>
              <Stack spacing={{ xs: 1, sm: 2, md: 2 }} direction="row">
                <Stack spacing={{ xs: 1, sm: 2, md: 2 }} width={"100%"}>
                  <Stack spacing={{ xs: 1, sm: 2, md: 2 }} direction="row">
                    <TextField
                      label="Name"
                      value={contact.contact.first_name}
                      size="small"
                      sx={{ width: "50%" }}
                    />
                    <TextField
                      label="Surename"
                      value={contact.contact.last_name}
                      size="small"
                      sx={{ width: "50%" }}
                    />
                  </Stack>
                  <Stack spacing={{ xs: 1, sm: 2, md: 2 }} direction="row">
                    <TextField
                      label="Job Title"
                      value={contact.contact.job_title}
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
                      value={contact.contact.email}
                      size="small"
                      sx={{ width: "100%" }}
                    />
                    <TextField
                      label="Website"
                      value={contact.contact.website}
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
            <Stack spacing={{ xs: 1, sm: 2 }} width="100%">
              <TextField
                label="Call statuses"
                size="small"
                sx={{ width: "100%" }}
              />
            </Stack>
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
    </>
  );
}
