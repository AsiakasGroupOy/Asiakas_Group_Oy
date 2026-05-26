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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
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
              <Typography
                variant="h8"
                noWrap
                sx={{
                  marginTop: "1px",
                  display: { xs: "none", sm: "block", md: "flex" },
                }}
              >
                Myy enemmän, soita tehokkaammin
              </Typography>
            </Box>
            {isAuthenticated && (
              <Box
                sx={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <NavigationTabs role={role} sx={{ alignSelf: "flex-end" }} />

                <IconButton onClick={logout}>
                  <LogoutOutlinedIcon
                    sx={{ color: "#fbfbfbff", marginLeft: "25px" }}
                  />
                </IconButton>
              </Box>
            )}
            <LanguageSwitcherButtons />
          </Toolbar>

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
