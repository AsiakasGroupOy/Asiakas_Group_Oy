import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ContactList from "./components/ContactList.jsx";
import CallView from "./components/CallView.jsx";
import ImportContacts from "./components/ImportContacts.jsx";
import LoginForm from "./components/users_components/LoginForm.jsx";
import RolesManagement from "./components/users_components/RolesManagement.jsx";
import RegistrationForm from "./components/users_components/RegistrationForm.jsx";
import { AuthProvider } from "./components/users_components/Authorisation.jsx";
import NotAuthorized from "./components/users_components/NotAuthorized.jsx";
import ProtectedRoute from "./components/users_components/ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/register",
    element: <RegistrationForm />,
  },
  {
    path: "/not-authorized",
    element: <NotAuthorized />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "contactlist",
        element: (
          <ProtectedRoute allowedRoles={["Manager", "User", "Admin Access"]}>
            <ContactList />
          </ProtectedRoute>
        ),
      },
      {
        path: "callview",
        element: (
          <ProtectedRoute allowedRoles={["Manager", "User", "Admin Access"]}>
            <CallView />
          </ProtectedRoute>
        ),
      },
      {
        path: "import",
        element: (
          <ProtectedRoute allowedRoles={["Manager", "Admin Access"]}>
            <ImportContacts />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute allowedRoles={["Admin Access"]}>
            <RolesManagement />{" "}
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
