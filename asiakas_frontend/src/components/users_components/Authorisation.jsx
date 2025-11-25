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

  useEffect(() => {
    const authCurrentUser = async () => {
      try {
        const response = await getCurrentUser();
        if (response.status === "success") {
          setCurrentUser(response.data);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        setCurrentUser(null);
      }
    };

    authCurrentUser();
  }, []);

  const handleLogin = async (logInData) => {
    const response = await logInProcess(logInData);
    if (response.status === "success") {
      setCurrentUser(response.data);
      return response;
    } else {
      // Handle errors returned from backend
      setCurrentUser(null);
      return response;
    }
  };

  const logout = useCallback(async () => {
    const resLogOut = await logOutProcess();
    setCurrentUser(null);
    return resLogOut;
  }, []);

  useEffect(() => {
    registerGlobalLogout(logout);
  }, [logout]);

  const isAuthenticated = !!currentUser;
  const role = currentUser?.role;
  console.log("Current user role in AuthProvider:", role);
  const current_customer_id = currentUser?.customer_id;

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
          handleLogin,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};
