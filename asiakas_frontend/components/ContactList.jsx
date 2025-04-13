import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-material.css";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faTrashCan,
  faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import { createTheme, ThemeProvider } from "@mui/material/styles";

ModuleRegistry.registerModules([AllCommunityModule]);
console.log(AllCommunityModule);

export default function ContactList() {
  const [customers] = useState([
    {
      calling_list: "List 1",
      organization: "Org A",
      contact: "John Doe",
      phone: "123-456-7890",
      add_info: "Info A",
      status: "Active",
      last_activity: "2023-01-01",
      number_of_calls: 5,
      actions: "Edit",
    },
    {
      calling_list: "List 2",
      organization: "Org B",
      contact: "Jane Smith",
      phone: "987-654-3210",
      add_info: "Info B",
      status: "Inactive",
      last_activity: "2023-02-01",
      number_of_calls: 10,
      actions: "Edit",
    },
    {
      calling_list: "List 3",
      organization: "Org C",
      contact: "Alice Johnson",
      phone: "555-555-5555",
      add_info: "Info C",
      status: "Active",
      last_activity: "2023-03-01",
      number_of_calls: 15,
      actions: "Edit",
    },
    {
      calling_list: "List 4",
      organization: "Org D",
      contact: "Bob Brown",
      phone: "444-444-4444",
      add_info: "Info D",
      status: "Inactive",
      last_activity: "2023-04-01",
      number_of_calls: 20,
      actions: "Edit",
    },
    {
      calling_list: "List 5",
      organization: "Org E",
      contact: "Charlie Green",
      phone: "333-333-3333",
      add_info: "Info E",
      status: "Active",
      last_activity: "2023-05-01",
      number_of_calls: 25,
      actions: "Edit",
    },
  ]);

  const [columnDefs] = useState([
    { headerName: "Calling List", field: "calling_list", filter: true },
    { headerName: "Organization", field: "organization", filter: true },
    { headerName: "Contact", field: "contact", filter: true },
    { headerName: "Phone Number", field: "phone" },
    { headerName: "Additional Information", field: "add_info" },
    { headerName: "Status", field: "status", filter: true },
    { headerName: "Last Activity", field: "last_activity", filter: true },
    { headerName: "Number of Calls", field: "number_of_calls", filter: true },
    { headerName: "Actions", field: "actions" },
  ]);
  console.log("Works");

  const defaultColDef = {
    flex: 1,
    minWidth: 50,
    sortable: true,
  };

  const rowSelection = {
    mode: "multiRow",
  };

  const theme = createTheme({
    typography: {
      fontSize: 10, // base font size (affects rem-based sizing)
      fontFamily: "Arial, sans-serif", // base font family
    },
    palette: {
      dustblue: {
        main: "#374c86",
        light: "#a1b3e6",
        dark: "#333f61",
        contrastText: "#fff",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            "& .MuiButton-startIcon": {
              marginRight: 8, // spacing between icon and text
            },
            "& .MuiButton-startIcon svg": {
              fontSize: "13px", // target the FontAwesome SVG inside
            },

            "&:focus:not(:focus-visible)": {
              outline: "none",
            },
          },
        },
      },
    },
  });

  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 64,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          marginTop: 30,
          gap: 10,
        }}
      >
        <Groups2RoundedIcon />
        <h3 style={{ color: "#08205e" }}>Contact list</h3>
      </div>

      <div
       
        style={{
          position: "sticky",
          top: 128,
          display: "flex",
          flexDirection: "row",
          justifyContent: "end",
          gap: 10,
        }}
      >
        <ThemeProvider theme={theme}>
          <Button
            variant="contained"
            color="dustblue"
            startIcon={<FontAwesomeIcon icon={faUserPlus} />}
          >
            Add New Contact
          </Button>
          <Button
            variant="contained"
            color="dustblue"
            startIcon={<FontAwesomeIcon icon={faTrashCan} />}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            color="dustblue"
            startIcon={<FontAwesomeIcon icon={faFileExport} />}
          >
            Export to Excel
          </Button>
        </ThemeProvider>
      </div>
      <div style={{ width: "100%", height: "100%" }}>
        <div
          className="ag-theme-material"
          style={{ height: "80%", width: "100%",  position: "sticky", top: 180,}}
        >
          <AgGridReact
            rowData={customers}
            columnDefs={columnDefs}
            pagination={true}
            rowSelection={rowSelection}
            onSelectionChanged={(event) => console.log("Row Selected!")}
            defaultColDef={defaultColDef}
          />
        </div>
      </div>
    </>
  );
}
