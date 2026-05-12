import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import i18n from "./i18n/i18n.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ContactList from "./components/ContactList.jsx";
import CallView from "./components/CallView.jsx";
import ImportContacts from "./components/ImportContacts.jsx";
import LoginForm from "./components/users_components/LoginForm.jsx";
import RolesManagement from "./pages/RolesManagement.jsx";
import CallsHistory from "./pages/CallsHistory.jsx";
import RegistrationForm from "./components/users_components/RegistrationForm.jsx";
import { AuthProvider } from "./components/users_components/Authorisation.jsx";
import NotAuthorized from "./components/users_components/NotAuthorized.jsx";
import ProtectedRoute from "./components/users_components/ProtectedRoute.jsx";
import CustomersManagement from "./pages/CustomersManagement.jsx";
import { TwilioProvider } from "./components/twilio_components/TwilioProvider.jsx";
import IncomingCallDialog from "./components/twilio_components/IncomingCallDialog.jsx";

const router = createBrowserRouter([
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
        index: true,
        element: <LoginForm />,
      },
      {
        path: "login", // Optional: handles "/login" explicitly
        element: <LoginForm />,
      },
      {
        path: "contactlist",
        element: (
          <ProtectedRoute
            allowedRoles={["Manager", "User", "Admin Access", "App Admin"]}
          >
            <ContactList />
          </ProtectedRoute>
        ),
      },
      {
        path: "callview",
        element: (
          <ProtectedRoute
            allowedRoles={["Manager", "User", "Admin Access", "App Admin"]}
          >
            <CallView />
          </ProtectedRoute>
        ),
      },
      {
        path: "import",
        element: (
          <ProtectedRoute
            allowedRoles={["Manager", "Admin Access", "App Admin"]}
          >
            <ImportContacts />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute allowedRoles={["Admin Access", "App Admin"]}>
            <RolesManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "customers-management",
        element: (
          <ProtectedRoute allowedRoles={["App Admin"]}>
            <CustomersManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "calls-history",
        element: (
          <ProtectedRoute
            allowedRoles={["Manager", "Admin Access", "App Admin"]}
          >
            <CallsHistory />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <TwilioProvider>
        <IncomingCallDialog />
        <RouterProvider router={router} />
      </TwilioProvider>
    </AuthProvider>
  </StrictMode>,
);
