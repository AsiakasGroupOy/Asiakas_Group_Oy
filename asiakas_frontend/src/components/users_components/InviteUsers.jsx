import { useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, IconButton, Box, TextField } from "@mui/material";
import { FormControl, Select, MenuItem } from "@mui/material";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-material.css";

import DeleteIcon from "@mui/icons-material/Delete";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function InviteUsers({
  invitationsList,
  handleSendInvitation,
  handleRemoveInvitation,
}) {
  const roles = ["Manager", "User", "Admin Access"];
  const [columnDefs] = useState([
    {
      headerName: "Email",
      field: "invitation_email",
      editable: true,
      cellRenderer: (params) => {
        if (params.data.isAddRow) {
          return (
            <TextField
              size="small"
              autoFocus
              value={params.value || ""}
              fullWidth
              onChange={(e) =>
                params.node.setDataValue("invitation_email", e.target.value)
              }
              sx={{
                ".MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "& .MuiInputBase-input": {
                  fontSize: "12px",
                },
              }}
            />
          );
        }
        return params.value;
      },
    },
    {
      headerName: "Role",
      field: "role",

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
      headerName: "Expiration date",
      field: "expires_at",
      valueGetter: (params) => {
        const value = params.data.expires_at;

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
      cellStyle: (params) => {
        const value = params.data.expires_at;
        if (!value) return null;
        const expirationDate = new Date(value);
        const now = new Date();
        const diffInDays = (now - expirationDate) / (1000 * 60 * 60 * 24);

        // If the expiration date is more than 1 day *later* than now → red
        if (diffInDays > 1) {
          return { color: "red", fontWeight: "bold" };
        }
        return null;
      },
    },

    {
      headerName: "Actions",
      sortable: false,
      filter: false,

      cellRenderer: (params) => {
        if (params.data.isAddRow) {
          return (
            <Button
              variant="outlined"
              color="#08205e"
              size="small"
              onClick={() => handleSendInvitation(params.data)}
              sx={{
                textTransform: "inherit",
                minWidth: "100px",
                color: "#08205e",
              }}
            >
              Send invitation
            </Button>
          );
        }
        return (
          <IconButton aria-label="delete" size="small">
            <DeleteIcon
              sx={{ color: "#800505ff", padding: "1px" }}
              onClick={() => {
                handleRemoveInvitation(params.data);
              }}
            />
          </IconButton>
        );
      },
    },
  ]);

  const gridRef = useRef();

  return (
    <>
      <div
        className="ag-theme-material"
        style={{
          width: "90%",
          margin: "auto",
          marginBottom: 40,
          minWidth: 800,
          overflow: "auto",
        }}
      >
        <AgGridReact
          rowData={invitationsList}
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
            minWidth: 140,
          }}
        ></AgGridReact>
      </div>
    </>
  );
}
