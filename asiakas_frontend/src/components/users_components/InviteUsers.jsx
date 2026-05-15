import { useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, IconButton, Box, TextField } from "@mui/material";
import { FormControl, Select, MenuItem } from "@mui/material";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-material.css";
import { useTranslation } from "react-i18next";
import { getAgGridLocale } from "../../i18n/agGridLocale.js";

import DeleteIcon from "@mui/icons-material/Delete";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function InviteUsers({
  invitationsList,
  handleSendInvitation,
  handleRemoveInvitation,
}) {
  const { t, i18n } = useTranslation();
  const roles = [
    { value: "Manager", label: t("activeUsersTable.managerRole") },
    { value: "User", label: t("activeUsersTable.userRole") },
    { value: "Admin Access", label: t("activeUsersTable.adminAccessRole") },
  ];

  const columnDefs = useMemo(
    () => [
      {
        headerName: t("inviteUsersTable.userEmail"),
        field: "invitation_email",
        editable: (params) => params.data.isAddRow === true,
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
        headerName: t("inviteUsersTable.role"),
        field: "role",
        editable: (params) => params.data.isAddRow === true,
        cellRenderer: (params) => {
          if (params.data && params.data.isAddRow) {
            return (
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
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      sx={{ fontSize: 12 }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          }
          return (
            roles.find((r) => r.value === params.value)?.label || params.value
          );
        },
      },
      {
        headerName: t("inviteUsersTable.expDate"),
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
          // If the expiration date is more than 1 day *later* than now → red
          if (expirationDate > now) {
            return { color: "red", fontWeight: "bold" };
          }
          return null;
        },
      },

      {
        headerName: t("inviteUsersTable.actions"),
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
                {t("inviteUsersTable.buttonSendInvitation")}
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
    ],
    [t],
  );

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
          key={i18n.language}
          localeText={getAgGridLocale(t)}
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
