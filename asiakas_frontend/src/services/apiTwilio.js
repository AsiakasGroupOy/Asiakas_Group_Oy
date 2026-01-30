import { secureApiFetch } from "./apiFetch.js";

// Helper function to set ngrok headers for development mode with ngrok
const twilioHeaders = () =>
  import.meta.env.VITE_USE_NGROK_HEADERS === "true"
    ? { "ngrok-skip-browser-warning": "true" }
    : {};

// Fetch Twilio token for authenticated user
export const getTwilioToken = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/twilio/token`,

    {
      headers: twilioHeaders(),
    },
  );
};

export const initiateCall = async (callData) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/twilio/outbound`,
    {
      method: "POST",
      headers: twilioHeaders(),
      body: JSON.stringify({ callData }),
    },
  );
};
