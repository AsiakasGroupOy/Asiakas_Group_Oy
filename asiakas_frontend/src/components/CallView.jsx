import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from '@mui/icons-material/Person';
import { useLocation } from "react-router-dom";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import theme from "../theme";
import { ThemeProvider } from "@mui/material/styles";
import { fullContactsCallLists } from "../contactListApi";


export default function CallView() {
  const [contactList, setContactList] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [companySearch, setCompanySearch] = useState("");
  const [callListSearch, setCallListSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [noteValue, setNoteValue] = useState("");
  const location = useLocation();
  const concal_id = location.state?.id ?? 1; // Default to first contact if no id is provided

  useEffect(() => {
    fetchContactList();
  }, []);

  const fetchContactList = async () => {
      try {
        const data = await fullContactsCallLists();
        console.log("Fetched contact list:", data);
        setContactList(data);
      } catch (error) {
        console.error("Failed to load contacts: ", error);
      }
    };

  // Extract unique calling list names for the dropdown
  const callListOptions = [
    ...new Set(contactList.map((c) => c.calling_list.calling_list_name)),
  ];


  useEffect(() => {
    if (!contactList.length) return;

     // Find the current contact by id
    const currentContact = contactList.find(
    (c) => String(c.concal_id) === String(concal_id)
    )|| contactList[0];
    if (!currentContact) return;

    const filtered = contactList.filter(
          c =>
            c.contact.organization_name === currentContact.contact.organization_name &&
            c.calling_list.calling_list_name === currentContact.calling_list.calling_list_name
        );
    setFilteredContacts(filtered);

    const startIdx = filtered.findIndex(
    (c) => String(c.concal_id) === String(concal_id)
    );    
    setCurrentIndex(startIdx >= 0 ? startIdx : 0);
    setCallListSearch(currentContact.calling_list.calling_list_name);
    setCompanySearch(currentContact.contact.organization_name);
    // Filter contacts by current contact's company or call list
  
}, [concal_id, contactList]);

  const handleCallListChange = (callList) => {
    const selectedCallList = callList;
    if (!selectedCallList) {
      const filteredByCallList = contactList;
      setFilteredContacts(filteredByCallList);
      setCompanySearch(filteredByCallList[0].contact.organization_name || "");
      setCallListSearch("");
      setCurrentIndex(0);
      return;
    }
    setCallListSearch(selectedCallList);

    const filteredByCallList = contactList.filter(
      (c) => c.calling_list.calling_list_name === selectedCallList
    );
    // If there are companies in this call list, set the company search and navigate to the first contact
    if (filteredByCallList.length > 0) {
      setFilteredContacts(filteredByCallList);
      setCompanySearch(filteredByCallList[0].contact.organization_name || "");
      setCurrentIndex(0);
    } else {
      setCompanySearch("");
    }
  };
  /* const saveNoteToDB = async (newNote) => {
  try {
    await fetch(`http://localhost:5000/contact/${contact.contact_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: newNote }),
    });
    // Optionally, update contacts state here if needed
  } catch (error) {
    console.error("Failed to save note:", error);
  }
};*/

  // Filtering logic


  let companyMatch = filteredContacts.filter((c) =>
    c.contact.organization_name.toLowerCase().includes(companySearch.trim().toLowerCase())
  );

  // If no matches, use the currentContact as the only result (if it exists)

  const activeContacts = companyMatch;
   console.log("companyMatch", activeContacts);
  const contact = activeContacts[currentIndex] || activeContacts[0];

  useEffect(() => {
    setNoteValue(contact?.note || "");
  }, [contact]);

  const goToContact = (idx) => {
    if (activeContacts[idx]) {
      setCurrentIndex(idx);
      setCompanySearch(activeContacts[idx].contact.organization_name || "")
      setCallListSearch(activeContacts[idx].calling_list.calling_list_name || "");
    }
  };

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
            spacing={{ xs: 1, sm: 2, md: 2 }}
            width={"100%"}
            direction={"column"}
          >
            {activeContacts.length >0 && companySearch ? (
              <Stack
                spacing={{ xs: 1, sm: 2, md: 1 }}
                direction={"row"}
                alignItems={"center"}
              >
                <BusinessIcon
                  sx={{ color: "#08205e", fontSize: 22}}
                />
                <Typography variant="h6" >
                  {contact.contact.organization_name}
                </Typography>
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
                  renderValue={(selected) => selected || "All Call Lists"}
                >
                  <MenuItem value="">
                    <em>All Call Lists</em>
                  </MenuItem>
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
        <Box sx={{ minWidth: 800, overflow: "auto" }}>
          <Paper sx={{ display: "flex", p: 2, gap: 3, m: 2 }}>
              <Stack spacing={{ xs: 1, sm: 2, md: 4 }} width={"100%"}>
            <Stack  
            spacing={{ xs: 1, sm: 2, md: 1}}
            sx={{ borderBottom: '1px solid #08205e', width: "50%"}}
             direction={"row"}
             alignItems={"center"}>
                
                <PersonIcon
                  sx={{ color: "#08205e", fontSize: 27}}
                />
                <Typography variant="h6" >
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
                onBlur={() => saveNoteToDB(noteValue)} // Save on blur
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
          {companySearch ? (
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
          ) : null}
        </Box>
      ) : (
        <Typography sx={{ p: 4 }}>No contact found.</Typography>
      )}
    </>
  );
}
