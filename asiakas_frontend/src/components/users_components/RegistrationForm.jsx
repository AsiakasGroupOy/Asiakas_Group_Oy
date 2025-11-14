import { useState, useEffect } from "react";
import {
  Paper,
  TextField,
  Button,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { ThemeProvider } from "@mui/material";
import theme from "../../theme";
import AlertMessage from "../AlertMessage";
import { regProcess } from "../../utils/usersApi";
import { useNavigate } from "react-router-dom";

export default function RegistrationForm() {
  const [regData, setRegData] = useState({
    username: "",
    password: "",
  });
  const [repeatPassword, setRepeatPassord] = useState("");
  const [logInButton, setLogInButton] = useState(false);

  const [alert, setAlert] = useState(null);

  const [token, setToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, []);

  const handleChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!regData.username || !regData.password || !repeatPassword) {
      setAlert({
        status: "error",
        title: "Empty fields",
        message: "Please fill in all fields.",
      });

      return;
    }
    if (regData.password !== repeatPassword) {
      setAlert({
        status: "error",
        title: "Wrong password",
        message: "Please enter the correct password again.",
      });
      return;
    }

    const response = await regProcess({ token, ...regData });
    if (response.status === "success") {
      setLogInButton(true);
    } else {
      // Handle errors returned from backend
      setAlert({
        status: "error",
        title: "Registration failed",
        message: response.message || "Something went wrong",
      });
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="center">
        <Typography variant="h6" sx={{ color: "#08205e", marginTop: "10px" }}>
          Registration Form
        </Typography>
      </Stack>

      {alert && <AlertMessage alert={alert} setAlert={setAlert} />}

      <Paper
        elevation={3}
        style={{
          padding: "20px",
          maxWidth: "400px",
          margin: "auto",
          marginTop: "50px",
        }}
      >
        <ThemeProvider theme={theme}>
          <TextField
            autoFocus
            required
            variant="outlined"
            fullWidth
            margin="normal"
            label="Username"
            name="username"
            value={regData.username}
            onChange={handleChange}
          />

          <TextField
            label="Password"
            required
            variant="outlined"
            fullWidth
            margin="normal"
            name="password"
            value={regData.password}
            onChange={handleChange}
          />

          <TextField
            label="Confirm password"
            required
            variant="outlined"
            fullWidth
            margin="normal"
            name="repeatPassword"
            value={repeatPassword}
            onChange={(e) => setRepeatPassord(e.target.value)}
          />
          {logInButton ? (
            <Dialog
              open={logInButton}
              onClose={(event, reason) => {
                if (reason === "backdropClick") return; // prevent closing on outside click
                setLogInButton(false);
                navigate("/login", { replace: true }); // allow normal closing via your Cancel button or Esc
              }}
            >
              <DialogTitle id="alert-dialog-title">
                {" You have been registered. Please log in."}
              </DialogTitle>
              <DialogActions
                sx={{
                  justifyContent: "space-between",
                  marginLeft: 2,
                  marginRight: 2,
                }}
              >
                <Button
                  onClick={() => {
                    navigate("/login", { replace: true });
                    setLogInButton(false);
                  }}
                  variant="contained"
                  color="dustblue"
                  autoFocus
                >
                  Go to login Page
                </Button>
              </DialogActions>
            </Dialog>
          ) : (
            <Button
              variant="contained"
              color="dustblue"
              fullWidth
              onClick={handleRegistration}
              style={{ marginTop: "20px" }}
            >
              Register
            </Button>
          )}
        </ThemeProvider>
      </Paper>
    </>
  );
}
