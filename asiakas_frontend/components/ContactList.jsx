import { AgGridReact } from "ag-grid-react";
import { useRef, useState, useEffect, useMemo } from "react";
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
import theme from "../src/theme";

ModuleRegistry.registerModules([AllCommunityModule]);

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

  const columnDefs = useMemo(()=>[
    {
      headerName: "Calling List",
      field: "calling_list",
      filter: true,
    },
    {
      headerName: "Organization",
      field: "organization",
      filter: true,
    },
    { headerName: "Contact", field: "contact", filter: true },
    { headerName: "Phone Number", field: "phone" },
    { headerName: "Additional Information", field: "add_info" },
    { headerName: "Status", field: "status", filter: true },
    {
      headerName: "Last Activity",
      field: "last_activity",
      filter: true,
    },
    {
      headerName: "Number of Calls",
      field: "number_of_calls",
      filter: true,
    },
    { headerName: "Actions", field: "actions" },
  ],[]);
  const [columnStateVersion, setColumnStateVersion] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const gridRef = useRef();

  const handleSelectedRows = () => {
    const handleSelected = gridRef.current.getSelectedRows();
    setSelectedRows(handleSelected);
  };

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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


  console.log("Works");

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
        <Groups2RoundedIcon />
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
                suppressMenu: true
              }}
              rowHeight={36}
              headerHeight={40}
              suppressDragLeaveHidesColumns={true}
              suppressColumnReset={true}
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
            />
          </div>
        </div>
      </div>
    </>
  );
}
