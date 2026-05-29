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
import AlertMessage from "../components/AlertMessage";
import { useTranslation } from "react-i18next";

export default function CustomersManagement() {
  const [customersList, setCustomersList] = useState([]);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [invitationsList, setInvitationsList] = useState([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const { t } = useTranslation();

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
      setAlert({
        status: response.status,
        message: t(response.message),
      });
    }
    setLoading(false);
  };

  const handleUpdateCustomer = async (customer) => {
    const checkFields = customer;
    if (!checkFields.customer_name || !checkFields.customer_address) {
      setAlert({
        status: "error",
        message: t("customersManagement.errors.errFieldsRequired"),
      });
      return;
    }

    const updatedCustomer = await updateCustomer(
      customer.customer_id,
      customer,
    );
    if (updatedCustomer.status === "success") {
      setAlert({
        status: updatedCustomer.status,
        message: t("customersManagement.updateSuccessMsg", {
          customer_name: updatedCustomer.data,
        }),
      });
    } else {
      setAlert({
        status: updatedCustomer.status,
        message: updatedCustomer.message.startsWith("apiFetchErrors.")
          ? t(updatedCustomer.message)
          : t(`customersManagement.errors.${updatedCustomer.message}`),
      });
    }
    fetchCustomersList();
  };

  const handleCustomerRemove = async (customer) => {
    if (window.confirm(t("customersManagement.removeCustomerAwareMsg"))) {
      const customerDeleted = await deleteCustomer(customer.customer_id);

      if (customerDeleted.status === "success") {
        setAlert({
          status: customerDeleted.status,
          message: t("customersManagement.removeSuccessMsg", {
            customer_name: customerDeleted.data,
          }),
        });

        fetchCustomersList();
      } else {
        setAlert({
          status: customerDeleted.status,
          message: customerDeleted.message.startsWith("apiFetchErrors.")
            ? t(customerDeleted.message)
            : t(`customersManagement.errors.${customerDeleted.message}`),
        });
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
      setAlert({
        status: list.status,
        title: t("customersManagement.errors.errFailedFetchInvitations"),
        message: t(list.message),
      });
    }
    setLoadingInv(false);
  };

  const handleSendInvitation = async (data) => {
    const checkFields = data;
    if (!checkFields.customer_name || !checkFields.customer_address) {
      setAlert({
        status: "error",
        message: t(
          "customersManagement.errors.errInvitationsNoCustomerNameOrAddress",
        ),
      });
      return;
    }
    const invitation = await newCustomerInvitation(data);

    if (invitation.status === "success") {
      setAlert({
        status: invitation.status,
        message: t("customersManagement.invitationSent", {
          invitation_email: invitation.data.message,
        }),
      });
    } else if (invitation.status === "error") {
      setAlert({
        status: invitation.status,
        message: invitation.message.startsWith("apiFetchErrors.")
          ? t(invitation.message)
          : t(`customersManagement.errors.${invitation.message}`),
      });
    }
    fetchInvitationsList();
  };

  const handleRemoveInvitation = async (invID) => {
    const response = await deleteCustomerInvitation(invID.invitation_id);

    if (response.status === "success") {
      setAlert({
        status: response.status,
        message: t("customersManagement.invitRemoveSuccessMsg", {
          invitation_email: response.data.message,
        }),
      });
      fetchInvitationsList();
    } else {
      setAlert({
        status: response.status,
        message: response.message.startsWith("apiFetchErrors.")
          ? t(response.message)
          : t(`customersManagement.errors.${response.message}`),
      });
    }
  };

  const loadUsersForCustomer = async (customer_id) => {
    const response = await fetchCustomerUsers(customer_id);
    if (response.status === "success") {
      setUserList(response.data);
    } else {
      setUserList([]);
    }
    return response;
  };

  const handleShowCustomerUsers = async (customer) => {
    const response = await loadUsersForCustomer(customer.customer_id);
    if (response.status === "success") {
      setSelectedCustomer(customer);
      setUsersDialogOpen(true);
    } else {
      setAlert({
        status: response.status,
        title: t("customersManagement.errors.errFailedLoadUsers"),
        message: t(response.message),
      });
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
      setAlert({
        status: role.status,
        title: t("rolesManagement.rolesUpdate.roleUpdatedTitle"), //same msg as in rolesManagement
        message: t("rolesManagement.rolesUpdate.roleAssigned", {
          role: t(`rolesManagement.roles.${role.data.role}`),
          username: role.data.username,
        }),
      });
      const response = await loadUsersForCustomer(selectedCustomer.customer_id);
      if (response.status === "error") {
        setAlert({
          status: response.status,
          title: t("customersManagement.errors.errFailedLoadUsers"),
          message: t(response.message),
        });
      }
    } else {
      setAlert({
        status: role.status,
        title: t("rolesManagement.rolesUpdate.errors.errChangeRoleTitle"), //same msg as in rolesManagement
        message: role.message.startsWith("apiFetchErrors.")
          ? t(role.message)
          : t(`rolesManagement.rolesUpdate.errors.${role.message}`),
      });
    }
  };

  const handleUserRemove = async (data) => {
    const response = await deleteUser(data.user_id);
    if (response.status === "success") {
      setAlert({
        status: response.status,
        message: t("rolesManagement.users.deleteUserSuccessMsg", {
          //same msg as in rolesManagement
          useremail: response.data.message,
        }),
      });

      const users = await loadUsersForCustomer(selectedCustomer.customer_id);
      if (users.status === "error") {
        setAlert({
          status: users.status,
          title: t("customersManagement.errors.errFailedLoadUsers"),
          message: t(users.message),
        });
      }
    } else {
      setAlert({
        status: "error",
        title: t("rolesManagement.users.errors.errDeleteUserTitle"), //same msg as in rolesManagement
        message: response.message.startsWith("apiFetchErrors.")
          ? t(response.message)
          : t(`rolesManagement.users.errors.${response.message}`),
      });
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="top" marginBlockEnd={3}>
        <Typography variant="h6" sx={{ color: "#08205e" }}>
          {t("customersManagement.pageTitle")}
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
      {alert && <AlertMessage alert={alert} setAlert={setAlert} />}
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
