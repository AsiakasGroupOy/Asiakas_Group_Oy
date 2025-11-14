import { useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, IconButton, Box } from "@mui/material";
import { FormControl, Select, MenuItem } from "@mui/material";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-material.css";

import DeleteIcon from "@mui/icons-material/Delete";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ActiveUsers({
  userList,
  handleUpdatedRole,
  handleUserRemove,
}) {
  const roles = ["Manager", "User", "Admin Access"];
  const [columnDefs] = useState([
    {
      headerName: "User name",
      field: "username",
    },
    {
      headerName: "Email",
      field: "useremail",
    },
    {
      headerName: "Role",
      field: "role",
      editable: true,
      cellRenderer: (params) => (
        <FormControl size="small">
          <Select
            value={params.value || ""}
            size="small"
            onChange={(e) => {
              params.node.setDataValue("role", e.target.value);
            }}
            sx={{
              ".MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              fontSize: 12,
              height: 40,
            }}
          >
            {roles.map((option) => (
              <MenuItem key={option} value={option} sx={{ fontSize: 12 }}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
    },

    {
      headerName: "Actions",
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent={"space-between"}
          height={40}
          width={"90%"}
        >
          <Button
            variant="outlined"
            color="warning"
            size="small"
            onClick={() => {
              handleUpdatedRole(params.data);
            }}
            sx={{ textTransform: "none", minWidth: "80px", flexShrink: 0 }}
          >
            Change Role
          </Button>
          <IconButton aria-label="delete" size="small">
            <DeleteIcon
              sx={{ color: "#800505ff", padding: "1px" }}
              onClick={() => {
                handleUserRemove(params.data);
              }}
            />
          </IconButton>
        </Box>
      ),
    },
  ]);

  const gridRef = useRef();

  return (
    <>
      <div
        className="ag-theme-material"
        style={{
          height: 400,
          width: "90%",
          margin: "0 auto",
          minWidth: 800,
          overflow: "auto",
        }}
      >
        <AgGridReact
          rowData={userList}
          columnDefs={columnDefs}
          ref={gridRef}
          onGridReady={(params) => {
            gridRef.current = params.api;
          }}
          pagination={true}
          paginationPageSize={20}
          rowHeight={40}
          headerHeight={40}
          domLayout="autoHeight"
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
            flex: 1,
          }}
        ></AgGridReact>
      </div>
    </>
  );
}
