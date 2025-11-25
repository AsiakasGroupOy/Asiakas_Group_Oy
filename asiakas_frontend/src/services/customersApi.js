import { apiFetch, secureApiFetch } from "./apiFetch.js";

// Fetching all customers for setting form
export const fetchCustomers = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/customers/all`
  );
};

// Fetching users for a specific customer
export const fetchCustomerUsers = async (customer_id) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/customers/${customer_id}/users`
  );
};

export const updateCustomer = async (customer_id, customerData) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/customers/${customer_id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    }
  );
};

export const deleteCustomer = async (customer_id) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/delete`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer_id),
    }
  );
};
