import {
  Container,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import "./App.css";
import NavigationTabs from "./components/NavigationTabs";
import LoginForm from "./components/users_components/LoginForm";
import { useAuth } from "./components/users_components/AuthContext.jsx";
import { Outlet, Navigate } from "react-router-dom";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

function App() {
  const { isAuthenticated, role, logout } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <>
      <Container maxWidth="xl">
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{ backgroundColor: "#08205e", overflowX: "auto" }}
        >
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                marginTop: "10px",
                display: { xs: "none", sm: "block", md: "flex" },
              }}
            >
              Soitto.ai
            </Typography>

            {isAuthenticated && <NavigationTabs role={role} />}

            <IconButton onClick={logout}>
              <LogoutOutlinedIcon
                sx={{ color: "#fbfbfbff", marginLeft: "25px" }}
              />
            </IconButton>
          </Toolbar>
          {!isAuthenticated && <LoginForm />}
          <Box
            sx={{
              width: "100%",
              height: "1px",
              backgroundColor: "white",
              opacity: 0.7,
              marginBottom: 1,
            }}
          />
        </AppBar>
      </Container>
      <Toolbar />

      <Outlet />
    </>
  );
}

export default App;
