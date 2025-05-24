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
export default function CallView() {
  const [contacts] = useState([
    {
      contact_id: 1,
      calling_list_name: "List 1",
      organization_name: "Org A",
      first_name: "John",
      last_name: "Doe",
      phone: "123-456-7890",
      website: "Info A",
      status_type: "Active",
      call_date: "2023-01-01",
      number_of_calls: 5,
      email: "werty@erttyyu.com",
      note: "",
      job_title: "Software Engineer",
    },
    {
      contact_id: 21,
      calling_list_name: "List 1",
      organization_name: "Org A",
      first_name: "GOOO",
      last_name: "GOOO",
      phone: "123-456-7890",
      website: "Info A",
      status_type: "Active",
      call_date: "2023-01-01",
      number_of_calls: 5,
      email: "sxfdsh@erttyyu.com",
      note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut",
      job_title: "Engineer",
    },
    {
      contact_id: 2,
      calling_list_name: "List 1",
      organization_name: "Org B",
      first_name: "Jane",
      last_name: "Smith",
      phone: "987-654-3210",
      website: "Info B",
      status_type: "Inactive",
      call_date: "2023-02-01",
      number_of_calls: 10,
      email: "wedvfdrty@erttyyu.com",
      note:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut" +
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut",
      job_title: "Manager",
    },
    {
      contact_id: 3,
      calling_list_name: "List 3",
      organization_name: "Org C",
      first_name: "Alice",
      last_name: "Johnson",
      phone: "555-555-5555",
      website: "Info C",
      status_type: "Active",
      call_date: "2023-03-01",
      number_of_calls: 15,
      email: "dd@erttyyu.com",
      note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut",
      job_title: "Director",
    },
    {
      contact_id: 4,
      calling_list_name: "List 4",
      organization_name: "Org D",
      first_name: "Bob",
      last_name: "Brown",
      phone: "444-444-4444",
      website: "Info D",
      status_type: "Inactive",
      call_date: "2023-04-01",
      number_of_calls: 20,
       email: "",
      note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut",
      job_title: "Sales",
    },
    {
      contact_id: 5,
      calling_list_name: "List 5",
      organization_name: "Org E",
      first_name: "Charlie",
      last_name: "Green",
      phone: "333-333-3333",
      website: "Info E",
      status_type: "Active",
      call_date: "2023-05-01",
      number_of_calls: 25,
      email: "",
      note: "",
      job_title: "Analyst",
    },
  ]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [companySearch, setCompanySearch] = useState("");
  const [callListSearch, setCallListSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [noteValue, setNoteValue] = useState("");
  const location = useLocation();
  const id = location.state?.id ?? 1; // Default to first contact if no id is provided

  // Fetch all contacts on mount
  /* useEffect(() => {
   
    fetch("http://localhost:5000/contactlist/") // Adjust endpoint as needed
      .then(res => res.json())
      .then(data => {
        setContacts(data);
        
      })
      .catch((error) => {
      console.error(error);
    });
  }, []);
*/

  // Extract unique calling list names for the dropdown
  const callListOptions = [
    ...new Set(contacts.map((c) => c.calling_list_name)),
  ];

  // Find the current contact by id
  const currentContact = contacts.find(
    (c) => String(c.contact_id) === String(id)
  );

  useEffect(() => {
     if (currentContact) {
    setCallListSearch(currentContact.calling_list_name || "");
    setCompanySearch(currentContact.organization_name || "");
    // Filter contacts by current contact's company or call list
    const filtered = contacts.filter(
      c =>
        c.organization_name === currentContact.organization_name ||
        c.calling_list_name === currentContact.calling_list_name
    );
    setFilteredContacts(filtered);
    setCurrentIndex(0); // Optionally reset index
  }
}, [currentContact, contacts]);

  const handleCallListChange = (callList) => {
    const selectedCallList = callList;
    if (!selectedCallList) {
      const filteredByCallList = contacts;
      setFilteredContacts(filteredByCallList);
      setCompanySearch(filteredByCallList[0].organization_name || "");
      setCallListSearch("");
      setCurrentIndex(0);
      return;
    }
    setCallListSearch(selectedCallList);

    const filteredByCallList = contacts.filter(
      (c) => c.calling_list_name === selectedCallList
    );
    // If there are companies in this call list, set the company search and navigate to the first contact
    if (filteredByCallList.length > 0) {
      setFilteredContacts(filteredByCallList);
      setCompanySearch(filteredByCallList[0].organization_name || "");
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
    c.organization_name.toLowerCase().includes(companySearch.trim().toLowerCase())
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
      setCompanySearch(activeContacts[idx].organization_name || "");
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
                  {contact.organization_name}
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
                  {contact.first_name + " " + contact.last_name}
                </Typography>
              </Stack>
            <Stack spacing={{ xs: 1, sm: 2, md: 2 }} direction="row"> 
            <Stack spacing={{ xs: 1, sm: 2, md: 2 }} width={"100%"}>
              <Stack spacing={{ xs: 1, sm: 2, md: 2 }} direction="row">
                <TextField
                  label="Name"
                  value={contact.first_name}
                  size="small"
                  sx={{ width: "50%" }}
                />
                <TextField
                  label="Surename"
                  value={contact.last_name}
                  size="small"
                  sx={{ width: "50%" }}
                />
              </Stack>
              <Stack spacing={{ xs: 1, sm: 2, md: 2 }} direction="row">
                <TextField
                  label="Job Title"
                  value={contact.job_title}
                  size="small"
                  sx={{ width: "50%" }}
                />
                <TextField
                  label="Phone"
                  value={contact.phone}
                  size="small"
                  sx={{ width: "50%" }}
                />
              </Stack>
              <Stack spacing={{ xs: 1, sm: 2 }} width="100%">
                <TextField
                  label="Email"
                  value={contact.email}
                  size="small"
                  sx={{ width: "100%" }}
                />
                <TextField
                  label="Website"
                  value={contact.website}
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
