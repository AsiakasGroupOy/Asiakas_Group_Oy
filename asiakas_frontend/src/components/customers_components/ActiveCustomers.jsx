import { useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, IconButton, Box } from "@mui/material";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-material.css";
import DeleteIcon from "@mui/icons-material/Delete";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function ActiveCustomers({
  customersList,
  handleUpdateCustomer,
  handleShowCustomerUsers,
  handleCustomerRemove,
}) {
  const [columnDefs] = useState([
    {
      headerName: "Company Id",
      field: "customer_id",
    },
    {
      headerName: "Company Name",
      field: "customer_name",
      editable: true,
    },
    {
      headerName: "Company Address",
      field: "customer_address",
      editable: true,
    },
    {
      headerName: "Twilio phone number",
      field: "assigned_number",
      editable: true,
    },

    {
      headerName: "Actions",
      sortable: false,
      filter: false,
      justifyContent: "space-between",
      width: 220,
      flex: 0,
      cellRenderer: (params) => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent={"space-between"}
          height={40}
          width={"100%"}
        >
          <Button
            variant="outlined"
            color="warning"
            size="small"
            onClick={() => {
              handleUpdateCustomer(params.data);
            }}
            sx={{
              textTransform: "none",
              minWidth: "80px",
              flexShrink: 0,
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="warning"
            size="small"
            onClick={() => {
              handleShowCustomerUsers(params.data);
            }}
            sx={{ textTransform: "none", minWidth: "80px", flexShrink: 0 }}
          >
            Users
          </Button>
          <IconButton aria-label="delete" size="small">
            <DeleteIcon
              sx={{ color: "#800505ff", padding: "1px" }}
              onClick={() => {
                handleCustomerRemove(params.data);
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
          minWidth: 900,
          overflow: "auto",
        }}
      >
        <AgGridReact
          rowData={customersList}
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
