import { secureApiFetch } from "./apiFetch.js";

//Fetching calls history
export const fetchCallsHistory = async (current_customer_id) => {
  return await secureApiFetch(
    `${
      import.meta.env.VITE_BACKEND_URL
    }/api/callbacks/calls?customer_id=${current_customer_id}`,
    {
      method: "GET",
    }
  );
};
