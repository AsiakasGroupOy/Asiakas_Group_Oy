import { apiFetch, secureApiFetch } from "./apiFetch.js";

// Fetching all users names for setting form
export const fetchUsers = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/users/all`
  );
};

// Fetching invitations for setting form
export const fetchInvitations = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/invitations`
  );
};

// Updating user role by admin
export const newRole = async (userData) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/users/role`,

    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    }
  );
};

export const deleteUser = async (userID) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/users/remove`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userID),
    }
  );
};

export const deleteInvitation = async (userID) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/invitations/remove`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userID),
    }
  );
};

// Send Invitation to a new user
export const newInvitation = async (invData) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/invitations/invite`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invData),
    }
  );
};

//Registration form
export const regProcess = async (regData) => {
  return await apiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regData),
    }
  );
};
