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
import { faTrashCan, faFileExport } from "@fortawesome/free-solid-svg-icons";
import {
  fullContactsCallLists,
  addContact,
  removeContactsCallLists,
} from "./contactListApi";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import AddNewContact from "./AddNewContact";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ContactList() {
  const [contactList, setContactList] = useState();
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Calling List",
        field: "calling_list.calling_list_name",
        filter: true,
      },
      {
        headerName: "Company",
        field: "contact.organization_name",
        filter: true,
      },
      {
        headerName: "Contact",
        field: "contact_name",
        valueGetter: (params) =>
          `${params.data.contact.first_name || ""} ${params.data.contact.last_name || ""}`,
        filter: true,
      },
      { headerName: "Phone Number", field: "contact.phone" },
      { headerName: "Additional Information", field: "contact.website" },
      { headerName: "Status", field: "latest_call_log.status", filter: true },
      {
        headerName: "Last Activity",
        field: "latest_call_log.call_timestamp",
        filter: true,
        valueGetter: (params) => {
          const value = params.data.latest_call_log.call_timestamp;
          if (!value) return "";
          const date = new Date(value);
          const pad = (n) => n.toString().padStart(2, "0");
          return (
            pad(date.getDate()) +
            "-" +
            pad(date.getMonth() + 1) +
            "-" +
            date.getFullYear() +
            " " +
            pad(date.getHours()) +
            ":" +
            pad(date.getMinutes())
          );
        },
      },
      {
        headerName: "Number of Calls",
        field: "latest_call_log.call_count",
        filter: true,
      },
    ],
    []
  );

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

  const handleSelectedRows = () => {
    const handleSelected = gridRef.current.getSelectedRows();
    console.log("Selected rows:", handleSelected);
    setSelectedRows(handleSelected);
  };

  const areAllColumnsVisible = () => {
    if (!gridRef.current) return true;
    const state = gridRef.current.getColumnState();
    return columnDefs.every((col) => {
      const colState = state.find((c) => c.colId === col.field);
      return colState ? !colState.hide : true;
    });
  };

  const handleToggleColumn = (field) => {
    const colState = gridRef.current
      .getColumnState()
      .find((c) => c.colId === field);
    const isCurrentlyVisible = colState ? !colState.hide : true;
    gridRef.current.setColumnsVisible([field], !isCurrentlyVisible);
    // Save state after change
    const state = gridRef.current.getColumnState();
    localStorage.setItem("savedColumnState", JSON.stringify(state));
    setColumnStateVersion((v) => v + 1); // force re-render for immediate checkbox update
  };

  const handleToggleAll = () => {
    if (!gridRef.current) return;
    const allVisible = areAllColumnsVisible();
    columnDefs.forEach((col) => {
      gridRef.current.setColumnsVisible([col.field], !allVisible);
    });
    // Save state after change
    const state = gridRef.current.getColumnState();
    localStorage.setItem("savedColumnState", JSON.stringify(state));
    gridRef.current.sizeColumnsToFit();
    setColumnStateVersion((v) => v + 1);
  };

  const exportToCsv = () => {
    const columnKeys = columnDefs.map((col) => col.field);
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const fileName = `Contact list_${timestamp}.csv`;
    const params = {
      columnKeys: columnKeys,
      fileName: fileName, // Specify the file name for the exported CSV file
    };
    gridRef.current.exportDataAsCsv(params);
  };

  const navigate = useNavigate();

  const handleRowClick = (params) => {
    const concal_id = params.data.concal_id;
    navigate("/callview", {
      state: { id: concal_id },
    });
  };

  const addNewContact = async (newContact) => {
    try {
      await addContact(newContact);
      fetchContactList(); // Refresh contact list after adding
      alert("Contact added!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one row to delete.");
      return;
    }

    const contactIds = selectedRows.map((row) => ({
      contact_id: row.contact.contact_id,
      calling_list_id: row.calling_list.calling_list_id,
      concal_id: row.concal_id,
    }));

    try {
      const response = await removeContactsCallLists(contactIds);
      alert(response.message);
      fetchContactList(); // Refresh contact list after deletion
    } catch (error) {
      console.error("Error deleting contacts:", error);
      alert("Failed to delete contacts: " + (error.message || "Unknown error"));
    }
  };

  return (
    <>
      <div
        style={{
          position: "sticky",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Groups2RoundedIcon sx={{ color: "#08205e" }} />
        <Typography variant="h6" sx={{ color: "#08205e" }}>
          Contact list
        </Typography>
      </div>

      <div
        style={{
          display: "flex",
          position: "sticky",
          flexDirection: "row",
          justifyContent: "end",
          gap: 10,
        }}
      >
        <ThemeProvider theme={theme}>
          <AddNewContact addNewContact={addNewContact} />

          <Button
            variant="contained"
            color="dustblue"
            startIcon={<FontAwesomeIcon icon={faTrashCan} />}
            onClick={handleDelete}
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
                {areAllColumnsVisible() ? "Deselect All" : "Select All"}
              </MenuItem>
              <Divider />
              {columnDefs.map((col) => (
                <MenuItem key={col.field} disableRipple>
                  <Checkbox
                    checked={
                      gridRef.current &&
                      gridRef.current
                        .getColumnState()
                        .find((c) => c.colId === col.field)
                        ? !gridRef.current
                            .getColumnState()
                            .find((c) => c.colId === col.field).hide
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
          <div
            className="ag-theme-material"
            style={{ height: "100%", width: "100%" }}
          >
            <AgGridReact
              rowData={contactList}
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
                minWidth: 35,
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
