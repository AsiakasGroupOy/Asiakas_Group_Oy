import { Stack, Typography } from "@mui/material";
import ActiveCustomers from "../components/customers_components/ActiveCustomers";
import { useEffect, useState } from "react";
import {
  fetchCustomers,
  fetchCustomerUsers,
  updateCustomer,
} from "../services/customersApi.js";

export default function CustomersManagement() {
  const [customersList, setCustomersList] = useState([]);
  const [UsersDialogOpen, setUsersDialogOpen] = useState(false);
  const [customerUpdateDialogOpen, setCustomerUpdateDialogOpen] =
    useState(false);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    fetchCustomersList();
  }, []);

  const fetchCustomersList = async () => {
    const response = await fetchCustomers();
    if (response.status === "success") {
      setCustomersList(response.data);
    } else {
      window.alert("Failed to fetch customers: " + (response.message || ""));
    }
  };

  const fetchUsersForCustomer = async (customer_id) => {
    const response = await fetchCustomerUsers(customer_id);
    if (response.status === "success") {
      setUserList(response.data);
    } else {
      window.alert("Failed to fetch co-users: " + (response.message || ""));
    }
  };

  const handleUpdateCustomer = async (customer) => {
    const updatedCustomer = await updateCustomer(
      customer.customer_id,
      customer
    );
    if (updatedCustomer.status === "success") {
      window.alert(updatedCustomer.data.message);
    } else {
      window.alert(
        "Failed to update customer: " + (updatedCustomer.message || "")
      );
    }
    fetchCustomersList();
  };

  const handleShowCustomerUsers = (customer) => {
    setDialogOpen(true);
    fetchUsersForCustomer(customer.customer_id);
  };

  const handleCustomerRemove = async (customer) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      const deleteCustomer = await deleteCustomer(customer.customer_id);

      if (deleteCustomer.status === "success") {
        fetchCustomersList();
        window.alert(deleteCustomer.data.message + " deleted successfully");
      } else {
        window.alert(
          "Failed to delete customer: " + (deleteCustomer.message || "")
        );
      }
    }
    fetchCustomersList();
  };

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="top" marginBlockEnd={3}>
        <Typography variant="h6" sx={{ color: "#08205e" }}>
          Customers Management
        </Typography>
      </Stack>
      <ActiveCustomers
        customersList={customersList}
        handleUpdateCustomer={handleUpdateCustomer}
        handleShowCustomerUsers={handleShowCustomerUsers}
        handleCustomerRemove={handleCustomerRemove}
      />
    </>
  );
}
