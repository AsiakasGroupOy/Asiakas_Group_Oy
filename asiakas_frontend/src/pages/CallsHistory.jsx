import { useState, useMemo, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-material.css";
import dayjs from "dayjs";
import { fetchCallsHistory } from "../services/callsHistoryApi.js";
import AlertMessage from "../components/AlertMessage.jsx";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
} from "@mui/material";
import ListIcon from "@mui/icons-material/List";
import { useAuth } from "../components/users_components/AuthContext.jsx";
import { fetchCustomersList } from "../services/customersApi.js";
import { dateOnlyComparator } from "../services/dateComparator.js";

export default function CallsHistory() {
  const [callsHistory, setCallsHistory] = useState([]);
  const [customersOptions, setCustomersOptions] = useState([
    { customer_id: "", customer_name: "" },
  ]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const { current_customer_id, role } = useAuth();
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Customer Name",
        field: "customer_name",
        filter: true,
      },
      {
        headerName: "User Name",
        field: "user_name",
        filter: true,
      },
      {
        headerName: "Direction",
        field: "direction",
        filter: true,
      },

      {
        headerName: "Calling List",
        field: "calling_list_name",
        filter: true,
      },
      {
        headerName: "Company",
        field: "organization_name",
        filter: true,
      },

      {
        headerName: "Contact Name",
        field: "contact_name",
        filter: true,
      },

      { headerName: "From Number", field: "from_number" },

      { headerName: "To Number", field: "to_number", filter: true },

      {
        headerName: "Started At",
        field: "started_at",
        filter: "agDateColumnFilter",
        valueGetter: (params) => {
          const value = params.data?.started_at;
          return value ? new Date(value) : null;
        },
        valueFormatter: (params) => {
          return params.value
            ? dayjs(params.value).format("DD.MM.YYYY HH:mm")
            : "";
        },
        filterParams: {
          comparator: dateOnlyComparator,
          buttons: ["reset"],
        },
      },

      {
        headerName: "Ended At",
        field: "ended_at",
        filter: "agDateColumnFilter",
        valueGetter: (params) => {
          const value = params.data?.ended_at;
          return value ? new Date(value) : null;
        },
        valueFormatter: (params) => {
          return params.value
            ? dayjs(params.value).format("DD.MM.YYYY HH:mm")
            : "";
        },
        filterParams: {
          comparator: dateOnlyComparator,
          buttons: ["reset"],
        },
      },

      { headerName: "Status", field: "status", filter: true },

      {
        headerName: "Duration",
        field: "recording_duration",
      },

      {
        headerName: "Recording id",
        field: "recording_sid",
      },
    ],
    [],
  );

  useEffect(() => {
    getCallsHistory();
    if (role === "App Admin") {
      getCustomersList();
    }
  }, [role]);

  const getCallsHistory = async () => {
    const response = await fetchCallsHistory(current_customer_id);

    if (response.status === "success") {
      setCallsHistory(response.data);
      setLoading(false);
    } else {
      setCallsHistory([]);
      setAlert({
        status: response.status,
        message: response.message,
      });
    }
  };

  const getCustomersList = async () => {
    const customersList = await fetchCustomersList();
    if (customersList.status === "success") {
      setCustomersOptions(
        customersList.data.map((c) => ({
          customer_id: c.customer_id,
          customer_name: c.customer_name,
        })),
      );
    } else {
      setCustomersOptions([]);
      setAlert({
        status: customersList.status,
        message: customersList.message,
      });
    }
  };

  const getCallsHistoryOnCustomer = async (customer_name) => {
    setSelectedCustomer(customer_name);
    const findCustomerId = customersOptions.find(
      (c) => c.customer_name === customer_name,
    );

    const response = await fetchCallsHistory(findCustomerId.customer_id);

    if (response.status === "success") {
      setCallsHistory(response.data);
    } else {
      setCallsHistory([]);
      setAlert({
        status: response.status,
        message: response.message,
      });
    }
  };

  const gridRef = useRef();
  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "top",
          gap: 10,
          height: 60,
        }}
      >
        <Stack direction="row" spacing={1}>
          <ListIcon sx={{ color: "#08205e", fontSize: 30 }} />
          <Typography variant="h6" sx={{ color: "#08205e" }}>
            Calls History
          </Typography>
        </Stack>

        {role === "App Admin" && (
          <FormControl size="small" sx={{ display: "flex", width: "50%" }}>
            <InputLabel id="calllist-label" shrink>
              Customer list
            </InputLabel>
            <Select
              labelId="callshistory-label"
              label="Customer name"
              value={selectedCustomer || ""}
              onChange={(e) => getCallsHistoryOnCustomer(e.target.value)}
              size="small"
              displayEmpty
              renderValue={(selected) => selected || ""}
            >
              {customersOptions.map((option) => (
                <MenuItem key={option.customer_id} value={option.customer_name}>
                  {option.customer_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>

      {alert && <AlertMessage alert={alert} setAlert={setAlert} />}
      {loading ? (
        <CircularProgress
          size={50}
          sx={{ color: "#08205eff", marginLeft: "50%", marginBottom: "10%" }}
        />
      ) : (
        <div
          className="ag-theme-material"
          style={{
            marginTop: 15,
            height: "auto",
            width: "100%",
            margin: "0 auto",
            minWidth: 800,
            overflow: "auto",
          }}
        >
          <AgGridReact
            rowData={callsHistory}
            columnDefs={columnDefs}
            ref={gridRef}
            onGridReady={(params) => {
              gridRef.current = params.api;
            }}
            pagination={true}
            paginationPageSize={20}
            rowHeight={30}
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
      )}
    </>
  );
}
