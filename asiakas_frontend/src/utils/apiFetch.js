import { invokeGlobalLogout } from "./globalLogout";

// General apiFetch Utility
export const apiFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, { ...options, credentials: "include" });
    let data;

    try {
      data = await response.json();
    } catch {
      return { status: "error", message: "Invalid response from server" };
    }

    if (!response.ok) {
      return {
        status: "error",
        message: data.error || data.message || "Something went wrong",
      };
    }

    return { status: "success", data };
  } catch (networkError) {
    console.error(
      "Network/system error:",
      networkError.message || networkError
    );
    return {
      status: "error",
      message: "Network error. Please try again later.",
    };
  }
};

//Secured apiFetch with token refresh handling
export const secureApiFetch = async (url, options = {}) => {
  const result = await apiFetch(url, options);

  // Process backend validation results for expired, invalid, or missing tokens
  if (result.status === "error") {
    const err = result.message;

    // Token expired → refresh + retry once
    if (
      err === "Token expired" ||
      err === "Unauthorized" ||
      err === "Invalid token"
    ) {
      console.info(`${err} → attempting refresh...`);
      const refresh = await refreshToken();

      if (refresh.status === "success") {
        console.info("Token refresh successful → retrying original request");
        return await apiFetch(url, options);
      }

      console.error("Refresh token invalid → logging out ", refresh.message);
      window.alert("Session expired. Please log in again.");
      await invokeGlobalLogout(); // this triggers logout() in AuthProvider // force logout

      return { status: "session-expired" };
    }
  }
  return result;
};

// Refresh token request
export const refreshToken = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/refresh`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { status: "error", message: data.error || "Refresh failed" };
    }

    return { status: "success", message: data.message };
  } catch {
    return { status: "error", message: "Network error during token refresh" };
  }
};

// LogIn process
export const logInProcess = async (logInData) => {
  return await apiFetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(logInData),
  });
};

// Current user status
export const getCurrentUser = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/users/current`,
    {
      method: "GET",
    }
  );
};

// LogOut process
export const logOutProcess = async () => {
  return await apiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/users/logout`,
    {
      method: "POST",
    }
  );
};
