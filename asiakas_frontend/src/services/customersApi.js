import { secureApiFetch } from "./apiFetch.js";

// Fetching all customers for setting form
export const fetchCustomers = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/customers/all`,
  );
};

// Fetching customers list for dropdowns
export const fetchCustomersList = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/customers/options`,
    {
      method: "GET",
    },
  );
};

// Fetching users for a specific customer
export const fetchCustomerUsers = async (customer_id) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/customers/${customer_id}/users`,
  );
};

export const updateCustomer = async (customer_id, customerData) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/customers/${customer_id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    },
  );
};

export const deleteCustomer = async (customer_id) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/customers/remove`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: customer_id }),
    },
  );
};
export const fetchCustomersInvitations = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/invitations/customers`,
  );
};

export const newCustomerInvitation = async (invitationData) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/invitations/customers/invite`,

    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invitationData),
    },
  );
};

export const deleteCustomerInvitation = async (invitation_id) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/invitations/customers/remove`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitation_id: invitation_id }),
    },
  );
};
