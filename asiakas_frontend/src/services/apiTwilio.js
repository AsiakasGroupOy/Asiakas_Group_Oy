import { secureApiFetch } from "./apiFetch.js";

// Fetch Twilio token for authenticated user
export const getTwilioToken = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/twilio/token`
  );
};

export const initiateCall = async (callData) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/twilio/outbound`,
    {
      method: "POST",
      body: JSON.stringify({ callData }),
    }
  );
};
