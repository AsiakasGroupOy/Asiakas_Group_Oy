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
} from "../services/usersApi";
import ActiveUsers from "../components/users_components/ActiveUsers";
import InviteUsers from "../components/users_components/InviteUsers";
import AlertMessage from "../components/AlertMessage";
import { useTranslation } from "react-i18next";

export default function RolesManagement() {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [invitationsList, setInvitationsList] = useState([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const { t } = useTranslation();

  const refreshUsers = async () => {
    const response = await fetchUsers();

    if (response.status === "success") {
      setUserList(response.data);
    } else {
      setUserList([]);
    }

    return response;
  };

  const fetchUserList = async () => {
    setLoading(true);
    const response = await refreshUsers();

    if (response.status === "error") {
      setAlert({
        status: response.status,
        title: t("rolesManagement.users.errors.errFetchUsersTitle"),
        message: t(response.message),
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
        title: t("rolesManagement.invitation.errors.errFetchInvitationsTitle"),
        message: t(list.message),
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
        title: t("rolesManagement.rolesUpdate.roleUpdatedTitle"),
        message: t("rolesManagement.rolesUpdate.roleAssigned", {
          role: t(`rolesManagement.roles.${role.data.role}`),
          username: role.data.username,
        }),
      });

      const response = await refreshUsers();
      if (response.status === "error") {
        setAlert({
          status: response.status,
          title: t("rolesManagement.users.errors.errFetchUsersTitle"),
          message: t(response.message),
        });
      }
    } else if (role.status === "error") {
      setAlert({
        status: role.status,
        title: t("rolesManagement.rolesUpdate.errors.errChangeRoleTitle"),
        message: role.message.startsWith("apiFetchErrors.")
          ? t(role.message)
          : t(`rolesManagement.rolesUpdate.errors.${role.message}`),
      });
    }
  };

  const handleSendInvitation = async (data) => {
    const checkFields = data;
    if (!checkFields.invitation_email || !checkFields.role) {
      setAlert({
        status: "error",
        message: t(
          "rolesManagement.invitation.errors.errSentInvitationsEmailRoleRequired",
        ),
      });
      return;
    }

    console.log("Check Fields", checkFields);
    const invitation = await newInvitation(data);

    if (invitation.status === "success") {
      setAlert({
        status: invitation.status,
        title: t("rolesManagement.invitation.sendInvitationTitle"),
        message: t("rolesManagement.invitation.sendInvitationMsg", {
          email: invitation.data.message,
        }),
      });
    } else if (invitation.status === "error") {
      setAlert({
        status: invitation.status,
        title: t("rolesManagement.invitation.errors.errSendInvitationTitle"),
        message: invitation.message.startsWith("apiFetchErrors.")
          ? t(invitation.message)
          : t(`rolesManagement.invitation.errors.${invitation.message}`),
      });
    }
    fetchUserInvitations();
  };

  const handleUserRemove = async (data) => {
    const response = await deleteUser(data.user_id);

    if (response.status === "success") {
      setAlert({
        status: response.status,
        message: t("rolesManagement.users.deleteUserSuccessMsg", {
          useremail: response.data.message,
        }),
      });
      const response = await refreshUsers();
      if (response.status === "error") {
        setAlert({
          status: response.status,
          title: t("rolesManagement.users.errors.errFetchUsersTitle"),
          message: t(response.message),
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

  const handleRemoveInvitation = async (invID) => {
    const response = await deleteInvitation(invID);

    if (response.status === "success") {
      setAlert({
        status: response.status,
        title: "",
        message: t("rolesManagement.invitation.deleteInvitationMsg", {
          email: response.data.message,
        }),
      });
      fetchUserInvitations();
    } else {
      // Handle errors returned from backend
      setAlert({
        status: "error",
        title: t("rolesManagement.invitation.errors.errDeleteInvitationTitle"),
        message: response.message.startsWith("apiFetchErrors.")
          ? t(response.message)
          : t(`rolesManagement.invitation.errors.${response.message}`),
      });
    }
  };
  return (
    <>
      <Stack direction="row" spacing={1} alignItems="top" marginBlockEnd={3}>
        <SettingsSuggestIcon sx={{ fontSize: 30, color: "#08205e" }} />
        <Typography variant="h6" sx={{ color: "#08205e" }}>
          {t("rolesManagement.pageTitle")}
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
