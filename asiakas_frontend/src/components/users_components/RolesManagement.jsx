import { useEffect, useState } from "react";
import { Typography, Stack, CircularProgress } from "@mui/material";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import {
  fetchUsers,
  newRole,
  fetchInvitations,
  newInvitation,
  deleteUser,
  deleteInvitation,
} from "../../utils/usersApi.js";
import ActiveUsers from "./ActiveUsers";
import InviteUsers from "./InviteUsers";
import AlertMessage from "../AlertMessage";

export default function RolesManagement() {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [invitationsList, setInvitationsList] = useState([]);
  const [loadingInv, setLoadingInv] = useState(false);

  const fetchUserList = async () => {
    setLoading(true);
    const response = await fetchUsers();

    if (response.status === "success") {
      setUserList(response.data);
    } else {
      setAlert({
        status: response.status,
        title: "Upload Failed",
        message: response.message || "Failed to fetch users",
      });
    }

    setLoading(false);
  };

  const createAddRow = () => ({
    invitation_email: "",
    role: "",
    isAddRow: true,
  });

  const fetchUserInvitations = async () => {
    setLoadingInv(true);
    const list = await fetchInvitations();

    if (list.status === "success") {
      const listData = Array.isArray(list.data) ? list.data : [];
      setInvitationsList([...listData, createAddRow()]);
    } else {
      setInvitationsList([createAddRow()]);
      setAlert({
        status: list.status,
        title: "Upload Failed",
        message: list.message || "Failed to fetch invintations",
      });
    }
    setLoadingInv(false);
  };

  useEffect(() => {
    fetchUserList();
    fetchUserInvitations();
  }, []);

  const handleUpdatedRole = async (data) => {
    const role = await newRole(data);

    if (role.status === "success") {
      setAlert({
        status: role.status,
        title: "Role updated successfully",
        message: role.data.message,
      });
    } else if (role.status === "error") {
      setAlert({
        status: role.status,
        title: "Failed to update role",
        message: role.message,
      });
    }
  };

  const handleSendInvitation = async (data) => {
    const invitation = await newInvitation(data);

    if (invitation.status === "success") {
      setAlert({
        status: invitation.status,
        title: "Success",
        message: invitation.data.message,
      });
      fetchUserInvitations();
    } else if (invitation.status === "error") {
      setAlert({
        status: invitation.status,
        title: "Error",
        message: invitation.message,
      });
      fetchUserInvitations();
    }
  };

  const handleUserRemove = async (userID) => {
    const response = await deleteUser(userID);

    if (response.status === "success") {
      setAlert({
        status: response.status,
        title: "",
        message: response.data.message,
      });
      fetchUserList();
    } else {
      // Handle errors returned from backend
      setAlert({
        status: "error",
        title: "User was not removed from the list",
        message: response.message || "Something went wrong",
      });
    }
  };

  const handleRemoveInvitation = async (invID) => {
    const response = await deleteInvitation(invID);

    if (response.status === "success") {
      setAlert({
        status: response.status,
        title: "",
        message: response.data.message,
      });
      fetchUserInvitations();
    } else {
      // Handle errors returned from backend
      setAlert({
        status: "error",
        title: "User was not removed from the list",
        message: response.message || "Something went wrong",
      });
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="top" marginBlockEnd={3}>
        <SettingsSuggestIcon sx={{ fontSize: 30, color: "#08205e" }} />
        <Typography variant="h6" sx={{ color: "#08205e" }}>
          Roles Management
        </Typography>
      </Stack>

      {alert && <AlertMessage alert={alert} setAlert={setAlert} />}

      {loadingInv ? (
        <CircularProgress
          size={50}
          sx={{ color: "#08205eff", marginLeft: "50%", marginBottom: "10%" }}
        />
      ) : null}

      {invitationsList.length > 0 && (
        <InviteUsers
          invitationsList={invitationsList}
          handleSendInvitation={handleSendInvitation}
          handleRemoveInvitation={handleRemoveInvitation}
        />
      )}
      {loading ? (
        <CircularProgress
          size={50}
          sx={{ color: "#08205eff", marginLeft: "50%" }}
        />
      ) : null}

      {userList.length > 0 && (
        <ActiveUsers
          handleUpdatedRole={handleUpdatedRole}
          userList={userList}
          handleUserRemove={handleUserRemove}
        />
      )}
    </>
  );
}
