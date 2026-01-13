import { secureApiFetch } from "./apiFetch.js";

// Fetch Twilio token for authenticated user
export const getTwilioToken = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL_NGROK}/api/twilio/token`,
    {
      headers: { "ngrok-skip-browser-warning": "true" },
    }
  );
};

export const initiateCall = async (callData) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL_NGROK}/api/twilio/outbound`,
    {
      method: "POST",
      headers: { "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify({ callData }),
    }
  );
};
