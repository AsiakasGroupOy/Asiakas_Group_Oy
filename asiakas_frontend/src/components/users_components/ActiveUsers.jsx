import { useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, IconButton, Box } from "@mui/material";
import { FormControl, Select, MenuItem } from "@mui/material";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-material.css";
import DeleteIcon from "@mui/icons-material/Delete";
ModuleRegistry.registerModules([AllCommunityModule]);
import { useTranslation } from "react-i18next";
import { getAgGridLocale } from "../../i18n/AgGridLocale.js";

export default function ActiveUsers({
  userList,
  handleUpdatedRole,
  handleUserRemove,
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
        headerName: t("activeUsersTable.userName"),
        field: "username",
      },
      {
        headerName: t("activeUsersTable.userEmail"),
        field: "useremail",
      },
      {
        headerName: t("activeUsersTable.role"),
        field: "role",
        editable: true,
        cellRenderer: (params) => (
          <FormControl size="small">
            <Select
              value={params.value ? params.value : ""}
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
              {roles.map((role) => (
                <MenuItem
                  key={role.value}
                  value={role.value}
                  sx={{ fontSize: 12 }}
                >
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ),
      },

      {
        headerName: t("activeUsersTable.actions"),
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
              {t("activeUsersTable.buttonChangeRole")}
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
    ],
    [t],
  );

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
          }}
        ></AgGridReact>
      </div>
    </>
  );
}
