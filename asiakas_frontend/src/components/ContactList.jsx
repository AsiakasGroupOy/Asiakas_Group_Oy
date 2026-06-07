import { AgGridReact } from "ag-grid-react";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useMemo, useEffect } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-material.css";
import dayjs from "dayjs";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import {
  Button,
  Tooltip,
  Menu,
  MenuItem,
  Checkbox,
  Divider,
  Autocomplete,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Typography from "@mui/material/Typography";
import { faTrashCan, faFileExport } from "@fortawesome/free-solid-svg-icons";
import {
  fullContactsCallLists,
  addContact,
  removeContactsCallLists,
} from "../services/contactListApi.js";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import AddNewContact from "./AddNewContact";
import { useAuth } from "./users_components/AuthContext.jsx";
import AlertMessage from "./AlertMessage";
import { dateOnlyComparator } from "../services/dateComparator.js";
import { useTranslation } from "react-i18next";
import { getAgGridLocale } from "../i18n/agGridLocale.js";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ContactList() {
  const [contactList, setContactList] = useState();
  const { t, i18n } = useTranslation();
  const { role } = useAuth();
  const columnDefs = useMemo(
    () => [
      {
        headerName: t("contactListTable.callingList"),
        field: "calling_list.calling_list_name",
        filter: true,
      },
      {
        headerName: t("contactListTable.company"),
        field: "contact.organization_name",
        filter: true,
      },
      {
        headerName: t("contactListTable.contact"),
        field: "contact_name",
        valueGetter: (params) =>
          `${params.data.contact.first_name || ""} ${
            params.data.contact.last_name || ""
          }`,
        filter: true,
      },
      { headerName: t("contactListTable.phone"), field: "contact.phone" },
      {
        headerName: t("contactListTable.email"),
        field: "contact.email",
      },
      {
        headerName: t("contactListTable.status"),
        field: "latest_call_log.status",
        filter: true,
        valueFormatter: (params) =>
          params.value ? t(`callStatusArea.${params.value}`) : "",
      },
      {
        headerName: t("contactListTable.lastActivity"),
        field: "latest_call_log.call_timestamp",
        filter: "agDateColumnFilter",
        valueGetter: (params) => {
          const value = params.data.latest_call_log?.call_timestamp;
          return value ? new Date(value) : null;
        },
        valueFormatter: (params) => {
          return params.value
            ? dayjs(params.value).format("DD.MM.YYYY HH:mm")
            : "";
        },
        filterParams: {
          comparator: dateOnlyComparator,
          inRangeInclusive: true,
          buttons: ["reset"],
        },
      },
      {
        headerName: t("contactListTable.latestScheduledCall"),
        field: "latest_call_log.latest_scheduled_call",
        filter: "agDateColumnFilter",
        valueGetter: (params) => {
          const value = params.data.latest_call_log?.latest_scheduled_call;
          return value ? new Date(value) : null;
        },
        valueFormatter: (params) => {
          return params.value
            ? dayjs(params.value).format("DD.MM.YYYY HH:mm")
            : "";
        },

        filterParams: {
          comparator: dateOnlyComparator,
          inRangeInclusive: true,
          buttons: ["reset"],
        },
      },
      {
        headerName: t("contactListTable.createdBy"),
        field: "latest_call_log.created_by_username",
        filter: true,
      },
      {
        headerName: t("contactListTable.numberOfCalls"),
        field: "latest_call_log.call_count",
        filter: true,
      },
    ],
    [t],
  );

  const [, setColumnStateVersion] = useState(0);
  const [agGridFilter, setAgGridFilter] = useState(true);
  const [alert, setAlert] = useState(null);
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
    const response = await fullContactsCallLists();

    if (response.status === "success") {
      setContactList(response.data);
    } else {
      setContactList([]);
      setAlert({
        status: response.status,
        message: t(response.message),
      });
    }
  };

  const handleSelectedRows = () => {
    const handleSelected = gridRef.current.getSelectedRows();

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
    const fileName = t(`contactList.csvName`) + `_${timestamp}.csv`;
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
    const response = await addContact(newContact);

    if (response.status === "success") {
      fetchContactList(); // Refresh contact list after adding
      setAlert({
        status: response.status,
        message: t(`addNewContact.${response.data.message}`),
      });
    } else {
      setAlert({
        status: response.status,
        message: response.message.startsWith("apiFetchErrors.")
          ? t(response.message)
          : t(`addNewContact.errors.${response.message}`),
      });
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      setAlert({
        status: "warning",
        message: t("contactList.warningDeleteContacts"),
      });
      return;
    }

    const contactIds = selectedRows.map((row) => ({
      contact_id: row.contact.contact_id,
      calling_list_id: row.calling_list.calling_list_id,
      concal_id: row.concal_id,
    }));

    const response = await removeContactsCallLists(contactIds);

    if (response.status === "success") {
      setAlert({
        status: response.status,
        message: t("contactList.deletedRowsMessage", {
          count: response.data.message,
        }),
      });
      fetchContactList(); // Refresh contact list after deletion
    } else {
      setAlert({
        status: response.status,
        message: response.message.startsWith("apiFetchErrors.")
          ? t(response.message)
          : t("contactList.errors.failedDeleteContacts"),
      });
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
          {t("contactList.pageTitle")}
        </Typography>
      </div>

      {role !== "User" && (
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
            <AddNewContact
              addNewContact={addNewContact}
              setAgGridFilter={setAgGridFilter}
            />

            <Button
              variant="contained"
              color="dustblue"
              startIcon={<FontAwesomeIcon icon={faTrashCan} />}
              onClick={handleDelete}
            >
              {t("contactList.deleteButton")}
            </Button>
            <Button
              variant="contained"
              color="dustblue"
              startIcon={<FontAwesomeIcon icon={faFileExport} />}
              onClick={exportToCsv}
            >
              {t("contactList.exportButton")}
            </Button>
          </ThemeProvider>
        </div>
      )}
      {alert && <AlertMessage alert={alert} setAlert={setAlert} />}
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
                {areAllColumnsVisible()
                  ? `${t("contactList.columnMenuDeselectAll")}`
                  : `${t("contactList.columnMenuSelectAll")}`}
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
          width: "100%",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 190,
            width: "100%",
          }}
        >
          <div className="ag-theme-material">
            <AgGridReact
              rowData={contactList}
              columnDefs={columnDefs}
              key={i18n.language}
              pagination={true}
              {...(role !== "User" && {
                rowSelection: {
                  mode: "multiRow",
                  selectAll: "filtered",
                },
              })}
              localeText={getAgGridLocale(t)}
              onSelectionChanged={handleSelectedRows}
              defaultColDef={{
                resizable: true,
                floatingFilter: agGridFilter,
                flex: 1,
                minWidth: 35,
              }}
              domLayout="autoHeight"
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
