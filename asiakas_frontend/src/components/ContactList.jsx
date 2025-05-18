import { AgGridReact } from "ag-grid-react";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useMemo, useEffect } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-material.css";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import {
  Button,
  Tooltip,
  Menu,
  MenuItem,
  Checkbox,
  Divider,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Typography from "@mui/material/Typography";
import {
  faUserPlus,
  faTrashCan,
  faFileExport,
} from "@fortawesome/free-solid-svg-icons";

import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";


ModuleRegistry.registerModules([AllCommunityModule]);

export default function ContactList() {
  const [customers] = useState([
    { contact_id: 1,
      calling_list_name: "List 1",
      company_name: "Org A",
      first_name: "John",
      last_name: "Doe",
      phone: "123-456-7890",
      website: "Info A",
      status_type: "Active",
      call_date: "2023-01-01",
      number_of_calls: 5,
     
    },
    { contact_id: 2,
      calling_list_name: "List 2",
      company_name: "Org B",
      first_name: "Jane",
      last_name: "Smith",
      phone: "987-654-3210",
      website: "Info B",
      status_type: "Inactive",
      call_date: "2023-02-01",
      number_of_calls: 10,
      
    },
    { contact_id: 3,
      calling_list_name: "List 3",
      company_name: "Org C",
      first_name: "Alice",
      last_name: "Johnson",
      phone: "555-555-5555",
      website: "Info C",
      status_type: "Active",
      call_date: "2023-03-01",
      number_of_calls: 15,
      
    },
    { contact_id: 4,
      calling_list_name: "List 4",
      company_name: "Org D",
      first_name: "Bob",
      last_name: "Brown",
      phone: "444-444-4444",
      website: "Info D",
      status_type: "Inactive",
      call_date: "2023-04-01",
      number_of_calls: 20,
      
    },
    { contact_id: 5,
      calling_list_name: "List 5",
      company_name: "Org E",
      first_name: "Charlie",
      last_name: "Green",
      phone: "333-333-3333",
      website: "Info E",
      status_type: "Active",
      call_date: "2023-05-01",
      number_of_calls: 25,
      
    },
  ]);
  const [contactList, setContactList] = useState();
  //Must be set up to AgGridReact instead of "customers" in rowData={customers}

  const columnDefs = useMemo(()=>[
    {
      headerName: "Calling List",
      field: "calling_list_name",
      filter: true,
    },
    {
      headerName: "Company",
      field: "company_name",
      filter: true,
    },
    { headerName: "Contact",
      field: "contact_name",
      valueGetter: params => `${params.data.first_name} ${params.data.last_name}`,
      filter: true
    },
    { headerName: "Phone Number", field: "phone" },
    { headerName: "Additional Information", field: "website" },
    { headerName: "Status", field: "status_type", filter: true },
    {
      headerName: "Last Activity",
      field: "call_date",
      filter: true,
    },
    {
      headerName: "Number of Calls",
      field: "number_of_calls",
      filter: true,
    },
    //{ cellRenderer: (params) => {<EditContact data={params.data} />},
    //}   
  ],[]);

  const [columnStateVersion, setColumnStateVersion] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const gridRef = useRef();

  const open = Boolean(anchorEl);
  const handleClose = () => {
      setAnchorEl(null);
    };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /*useEffect(() => {
      fetchContactList();
    }, []);

 const fetchContactList = async () => {
    try {
      const response = await getContactList();
       
      if (!response.ok) {
        throw new Error("Error in retrieving contacts" + response.statusText);
      }
      const data = await response.json();
      setContactList(data);
    } catch (error) {
      console.error("Failed to load contacts: ", error);
    }
  };
*/

  const handleSelectedRows = () => {
      const handleSelected = gridRef.current.getSelectedRows();
      setSelectedRows(handleSelected);
    };

  const areAllColumnsVisible = () => {
      if (!gridRef.current) return true;
      const state = gridRef.current.getColumnState();
      return columnDefs.every(
        (col) => {
          const colState = state.find(c => c.colId === col.field);
          return colState ? !colState.hide : true;
        }
      );
    };
  
  const handleToggleColumn = (field) => {
    const colState = gridRef.current.getColumnState().find(c => c.colId === field);
    const isCurrentlyVisible = colState ? !colState.hide : true;
    gridRef.current.setColumnsVisible([field], !isCurrentlyVisible);
    // Save state after change
    const state = gridRef.current.getColumnState();
    localStorage.setItem("savedColumnState", JSON.stringify(state));
    setColumnStateVersion(v => v + 1); // force re-render for immediate checkbox update
    
  };


  const handleToggleAll = () => {
    if (!gridRef.current) return;
    const allVisible = areAllColumnsVisible();
    console.log("allVisible", allVisible);
    columnDefs.forEach((col) => {
      gridRef.current.setColumnsVisible([col.field], !allVisible);
    });
    // Save state after change
    const state = gridRef.current.getColumnState();
    localStorage.setItem("savedColumnState", JSON.stringify(state));
    gridRef.current.sizeColumnsToFit();
    setColumnStateVersion(v => v + 1);
  };

  
  const exportToCsv = () => {
    const columnKeys = columnDefs.map(col => col.field);
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const fileName = `Contact list_${timestamp}.csv`;
      const params = {
          columnKeys:columnKeys,
          fileName: fileName, // Specify the file name for the exported CSV file
      };
      gridRef.current.exportDataAsCsv(params);
  };

  const navigate = useNavigate();
  const handleRowClick = (params) => {
    const contactId = params.data.contact_id;
      navigate('/callview', {
      state: { id: contactId }
       });
  };



  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 82,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          marginTop: 50,
          gap: 10,
        }}
      >
        <Groups2RoundedIcon sx={{ color: "#08205e"}}/>
        <Typography variant="h6" sx={{ color: "#08205e" }}>
          Contact list
        </Typography>
      </div>

      <div
        style={{
          display: "flex",
          position: "sticky",
          top: 125,
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
            onClick={exportToCsv}
          >
            Export to Excel
          </Button>
        </ThemeProvider>
      </div>

      <div
        style={{
          position: "sticky",
          top: 160,
          justifyItems: "end",
        }}
      >
        <Typography variant="subtitle2" sx={{ color: "#08205e" }}>
          {selectedRows?.length > 0 && `Selected rows ${selectedRows.length}`}
        </Typography>

        <ThemeProvider theme={theme}>
          <Tooltip title="Columns" placement="right-start">
            <Button color="dustblue" onClick={handleClick}>
              <ViewColumnIcon />
            </Button>

            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              <MenuItem
                onClick={handleToggleAll}
                disableRipple
                sx={{ fontWeight: "bold" }}
              >
                {areAllColumnsVisible() ?  "Deselect All": "Select All"}
              </MenuItem>
              <Divider />
              {columnDefs.map((col) => (
                <MenuItem key={col.field} disableRipple>
                  <Checkbox
                    checked={
                      gridRef.current && gridRef.current.getColumnState().find(c => c.colId === col.field)
                        ? !gridRef.current.getColumnState().find(c => c.colId === col.field).hide
                        : true
                    }
                    onChange={() => handleToggleColumn(col.field)}
                    sx={{
                      color: "#374c86",
                      "&.Mui-checked": {
                        color: "#374c86",
                      },
                    }}
                  />
                  {col.headerName}
                </MenuItem>
              ))}
            </Menu>
          </Tooltip>
        </ThemeProvider>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 20,
          height: "calc(100vh - 240px)", // Adjust based on total height above
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 190,
            width: "100%",
          }}
        >
          <div className="ag-theme-material" style={{ height: "100%" }}>
            <AgGridReact
              rowData={customers}
              columnDefs={columnDefs}
              pagination={true}
              rowSelection={{
                mode: "multiRow",
                selectAll: "filtered",
              }}
              onSelectionChanged={handleSelectedRows}
              defaultColDef={{
                resizable: true,
                flex: 1,
                minWidth: 100,
              
              }}
              rowHeight={36}
              headerHeight={40}
              suppressMovableColumns={true}
              ref={gridRef}
              onGridReady={(params) => {
                gridRef.current = params.api;
                  // Restore column state if saved
                const savedState = localStorage.getItem("savedColumnState");
                if (savedState) {
                  params.api.applyColumnState({
                    state: JSON.parse(savedState),
                    applyOrder: true,
                  });
                }
                 params.api.sizeColumnsToFit();
                }}
              onColumnVisible={(params) => {
                const state = params.api.getColumnState();
                params.api.sizeColumnsToFit();
                localStorage.setItem("savedColumnState", JSON.stringify(state));
                }}  
              onRowClicked={handleRowClick}
            />
          </div>
        </div>
      </div>
    </>
  );
}
