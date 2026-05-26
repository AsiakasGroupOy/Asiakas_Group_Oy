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
import { useTranslation } from "react-i18next";

export default function LoginForm() {
  const { handleLogin } = useAuth();
  const [alert, setAlert] = useState(null);
  const { t } = useTranslation();
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
        title: t("loginForm.alertEmptyFieldsTitle"),
        message: t("loginForm.alertEmptyFields"),
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
        title: t("loginForm.alertInvalidCredentialsTitle"),
        message: response.message.startsWith("apiFetchErrors.")
          ? t(response.message)
          : t(`loginForm.${response.message}`),
      });
    }
  };

  return (
    <>
      {alert && <AlertMessage alert={alert} setAlert={setAlert} />}

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
              fullWidth
              margin="normal"
              label={t("loginForm.email")}
              name="useremail"
              value={logInData.useremail}
              onChange={handleChange}
            />

            <TextField
              label={t("loginForm.password")}
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
              {t("loginForm.login")}
            </Button>
          </form>
        </ThemeProvider>
      </Paper>
    </>
  );
}
