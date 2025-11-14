import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  TextField,
  Button,
  Container,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme";
import { useAuth } from "./AuthContext.jsx";
import AlertMessage from "../AlertMessage";

export default function LoginForm() {
  const { handleLogin } = useAuth();
  const [alert, setAlert] = useState(null);
  const [logInData, setLogInData] = useState({
    useremail: "",
    password: "",
  });

  const navigate = useNavigate();
  const handleChange = (e) => {
    setLogInData({ ...logInData, [e.target.name]: e.target.value });
  };

  const handleUserLogIn = async (e) => {
    e.preventDefault();
    if (!logInData.useremail || !logInData.password) {
      setAlert({
        status: "error",
        title: "Empty fields",
        message: "Please fill in all fields.",
      });
      return;
    }
    const response = await handleLogin(logInData); // make handleLogin return response

    if (response?.status === "success") {
      navigate("/contactlist");
    }
    if (response?.status === "error") {
      setAlert({
        status: "error",
        title: "Login Failed",
        message: response.error || "Invalid email or password.",
      });
    }
  };

  return (
    <>
      {alert && <AlertMessage alert={alert} setAlert={setAlert} />}
      <Container maxWidth="xl">
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{ backgroundColor: "#08205e", overflowX: "auto" }}
        >
          <Toolbar sx={{ alignItems: "center" }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                marginTop: 1,
                display: { xs: "none", sm: "block", md: "flex" },
              }}
            >
              Soitto.ai
            </Typography>
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
      <Paper
        elevation={3}
        style={{
          padding: "20px",
          maxWidth: "400px",
          margin: "auto",
          marginTop: "100px",
        }}
      >
        <ThemeProvider theme={theme}>
          <form onSubmit={handleUserLogIn}>
            <TextField
              variant="outlined"
              required
              fullWidth
              margin="normal"
              label="User Email"
              name="useremail"
              value={logInData.useremail}
              onChange={handleChange}
            />

            <TextField
              label="Password"
              required
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              name="password"
              value={logInData.password}
              onChange={handleChange}
            />
            <Button
              variant="contained"
              color="dustblue"
              fullWidth
              style={{ marginTop: "20px" }}
              type="submit"
            >
              Login
            </Button>
          </form>
        </ThemeProvider>
      </Paper>
    </>
  );
}
