import { Stack, Typography, CircularProgress } from "@mui/material";
import ActiveCustomers from "../components/customers_components/ActiveCustomers";
import { useEffect, useState } from "react";
import {
  fetchCustomers,
  fetchCustomerUsers,
  updateCustomer,
  deleteCustomer,
  fetchCustomersInvitations,
  newCustomerInvitation,
  deleteCustomerInvitation,
} from "../services/customersApi.js";
import { newRole, deleteUser } from "../services/usersApi.js";
import UserDialog from "../components/customers_components/UsersDialog.jsx";
import InviteCustomers from "../components/customers_components/InviteCustomers.jsx";

export default function CustomersManagement() {
  const [customersList, setCustomersList] = useState([]);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [invitationsList, setInvitationsList] = useState([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomersList();
    fetchInvitationsList();
  }, []);

  const fetchCustomersList = async () => {
    setLoading(true);
    const response = await fetchCustomers();
    if (response.status === "success") {
      setCustomersList(response.data);
    } else {
      window.alert("Failed to fetch customers: " + (response.message || ""));
    }
    setLoading(false);
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

  const handleCustomerRemove = async (customer) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      const customerDeleted = await deleteCustomer(customer.customer_id);

      if (customerDeleted.status === "success") {
        window.alert(customerDeleted.data.message + " deleted successfully");
        fetchCustomersList();
      } else {
        window.alert(
          "Failed to delete customer: " + (customerDeleted.message || "")
        );
      }
    }
  };
  const createAddRow = () => ({
    customer_name: "",
    customer_address: "",
    invitation_email: "",
    isAddRow: true,
  });

  const fetchInvitationsList = async () => {
    setLoadingInv(true);
    const list = await fetchCustomersInvitations();

    if (list.status === "success") {
      const listData = Array.isArray(list.data) ? list.data : [];
      setInvitationsList([...listData, createAddRow()]);
    } else {
      setInvitationsList([createAddRow()]);
      window.alert("Failed to fetch invitations: " + (list.message || ""));
    }
    setLoadingInv(false);
  };

  const handleSendInvitation = async (data) => {
    const invitation = await newCustomerInvitation(data);

    if (invitation.status === "success") {
      window.alert(invitation.data.message);
    } else if (invitation.status === "error") {
      window.alert(invitation.message);
    }
    fetchInvitationsList();
  };

  const handleRemoveInvitation = async (invID) => {
    const response = await deleteCustomerInvitation(invID.invitation_id);

    if (response.status === "success") {
      window.alert(response.data.message);
      fetchInvitationsList();
    } else {
      window.alert(
        "Failed to remove invitation: " +
          (response.message || "Something went wrong")
      );
    }
  };

  const fetchUsersForCustomer = async (customer_id) => {
    const response = await fetchCustomerUsers(customer_id);
    if (response.status === "success") {
      setUserList(response.data);
    }
    return response;
  };

  const handleShowCustomerUsers = async (customer) => {
    const response = await fetchUsersForCustomer(customer.customer_id);
    if (response.status === "success") {
      setSelectedCustomer(customer);
      setUsersDialogOpen(true);
    } else {
      window.alert("Failed to fetch users: " + (response.message || ""));
    }
  };

  const handleCloseUsersDialog = () => {
    setUsersDialogOpen(false);
    setSelectedCustomer(null);
    setUserList([]);
  };

  const handleUpdateUserRole = async (data) => {
    const role = await newRole(data);
    if (role.status === "success") {
      window.alert("Role updated successfully: " + role.data.message);
    } else {
      window.alert("Failed to update role: " + (role.message || ""));
    }
    const response = await fetchUsersForCustomer(selectedCustomer.customer_id);
    if (response.status === "error") {
      window.alert("Failed to fetch users: " + (response.message || ""));
    }
  };

  const handleUserRemove = async (data) => {
    console.log("Removing user with data:", data);
    const response = await deleteUser(data.user_id);
    if (response.status === "success") {
      window.alert(response.data.message);
      const users = await fetchUsersForCustomer(selectedCustomer.customer_id);
      if (users.status === "error") {
        window.alert("Failed to fetch users: " + (users.message || ""));
      }
    } else {
      window.alert(
        "Failed to remove user: " + (response.message || "Something went wrong")
      );
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="top" marginBlockEnd={3}>
        <Typography variant="h6" sx={{ color: "#08205e" }}>
          Customers Management
        </Typography>
      </Stack>
      {loadingInv ? (
        <CircularProgress
          size={50}
          sx={{ color: "#08205eff", marginLeft: "50%", marginBottom: "10%" }}
        />
      ) : null}
      <InviteCustomers
        invitationsList={invitationsList}
        handleSendInvitation={handleSendInvitation}
        handleRemoveInvitation={handleRemoveInvitation}
      />
      {loading ? (
        <CircularProgress
          size={50}
          sx={{ color: "#08205eff", marginLeft: "50%" }}
        />
      ) : null}
      <ActiveCustomers
        customersList={customersList}
        handleUpdateCustomer={handleUpdateCustomer}
        handleShowCustomerUsers={handleShowCustomerUsers}
        handleCustomerRemove={handleCustomerRemove}
      />
      <UserDialog
        open={usersDialogOpen}
        onClose={handleCloseUsersDialog}
        selectedCustomer={selectedCustomer?.customer_name || ""}
        userList={userList}
        handleUpdateUserRole={handleUpdateUserRole}
        handleUserRemove={handleUserRemove}
      />
    </>
  );
}
