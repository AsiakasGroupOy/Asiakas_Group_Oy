import { useState, useEffect, useCallback } from "react";
import {
  getCurrentUser,
  logInProcess,
  logOutProcess,
} from "../../services/apiFetch.js";

import { registerGlobalLogout } from "../../services/globalLogout.js";
import { AuthContext } from "./AuthContext.jsx";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(
    !!localStorage.getItem("was_logged_in")
  );

  useEffect(() => {
    const authCurrentUser = async () => {
      if (localStorage.getItem("was_logged_in") !== "true") {
        setLoading(false);
        return;
      }
      try {
        const response = await getCurrentUser();
        if (response.status === "success") {
          setCurrentUser(response.data);
        } else {
          setCurrentUser(null);
          localStorage.removeItem("was_logged_in");
        }
      } catch (err) {
        setCurrentUser(null);
        localStorage.removeItem("was_logged_in");
      } finally {
        setLoading(false); // Stop loading regardless of success/fail
      }
    };

    authCurrentUser();
  }, []);

  const handleLogin = async (logInData) => {
    const response = await logInProcess(logInData);
    if (response.status === "success") {
      localStorage.setItem("was_logged_in", "true");
      setCurrentUser(response.data);

      return response;
    } else {
      // Handle errors returned from backend
      setCurrentUser(null);

      return response;
    }
  };

  const logout = useCallback(async () => {
    localStorage.removeItem("was_logged_in");
    const userIdtoLogOut = currentUser?.user_id;
    if (userIdtoLogOut) {
      const resLogOut = await logOutProcess(userIdtoLogOut);

      if (resLogOut.status !== "success") {
        console.error("Logout failed:", resLogOut.message);
      }
    }
    setCurrentUser(null);
    window.location.assign("/login");
  }, [currentUser]);

  useEffect(() => {
    registerGlobalLogout(logout);
  }, []);

  const isAuthenticated = !!currentUser;
  const role = currentUser?.role;
  const current_customer_id = currentUser?.customer_id;
  const current_user_id = currentUser?.user_id;
  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
      >
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <>
      <AuthContext.Provider
        value={{
          currentUser,
          setCurrentUser,
          isAuthenticated,
          role,
          logout,
          current_customer_id,
          current_user_id,
          handleLogin,
          loading,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};
