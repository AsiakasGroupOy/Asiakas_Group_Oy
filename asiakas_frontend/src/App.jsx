import {
  Container,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
} from "@mui/material";
import "./App.css";
import NavigationTabs from "./components/NavigationTabs";
import { useAuth } from "./components/users_components/AuthContext.jsx";
import { Outlet } from "react-router-dom";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import LanguageSwitcherButtons from "./components/LanguageSwitcherButtons";

function App() {
  const { isAuthenticated, role, logout } = useAuth();

  return (
    <>
      <Container maxWidth="xl">
        <CssBaseline />
        <AppBar position="fixed" sx={{ backgroundColor: "#08205e" }}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              gap: 1,
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src="/soitto.ai_white.png"
                style={{
                  height: "55px",
                }}
                alt="Logo"
              />
            </Box>
            {isAuthenticated && (
              <Box
                sx={{
                  display: "flex",
                  overflowX: "auto",
                  flex: 1,
                  scrollButtons: "auto",
                  alignItems: "center",
                  marginLeft: "auto",
                }}
              >
                <NavigationTabs role={role} sx={{}} />
              </Box>
            )}
            {isAuthenticated && (
              <IconButton onClick={logout}>
                <LogoutOutlinedIcon sx={{ color: "#fbfbfbff" }} />
              </IconButton>
            )}
            <LanguageSwitcherButtons />
          </Toolbar>

          <Box
            sx={{
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
