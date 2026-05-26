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
  AppBar,
  Toolbar,
} from "@mui/material";
import { ThemeProvider } from "@mui/material";
import theme from "../../theme";
import AlertMessage from "../AlertMessage";
import { regProcess } from "../../services/usersApi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcherButtons from "../LanguageSwitcherButtons";

export default function RegistrationForm() {
  const [regData, setRegData] = useState({
    username: "",
    password: "",
  });
  const [repeatPassword, setRepeatPassword] = useState("");
  const [logInButton, setLogInButton] = useState(false);

  const [alert, setAlert] = useState(null);
  const { t } = useTranslation();
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
        title: t("registrationForm.errors.alertEmptyFieldsTitle"),
        message: t("registrationForm.errors.alertEmptyFieldsMessage"),
      });

      return;
    }
    if (regData.password !== repeatPassword) {
      setAlert({
        status: "error",
        title: t("registrationForm.errors.errPassword.errRepeatPasswordTitle"),
        message: t(
          "registrationForm.errors.errPassword.errRepeatPasswordMessage",
        ),
      });
      return;
    }

    const response = await regProcess({ token, ...regData });

    if (response.status === "success") {
      setLogInButton(true);
    } else {
      const errors = Array.isArray(response.message)
        ? response.message
        : [response.message];

      const translatedErrors = errors.map((err) =>
        t(err) !== err
          ? t(err)
          : t(`registrationForm.errors.errPassword.${err}`),
      );

      setAlert({
        status: "error",
        title: t("registrationForm.errors.errPassword.errPasswordTitle"),
        message:
          translatedErrors.join("\n") ||
          t("registrationForm.errors.errPassword.errPasswordMessage"),
      });
    }
  };

  return (
    <>
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
          <LanguageSwitcherButtons />
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Stack direction="row" justifyContent="center">
        <Typography variant="h6" sx={{ color: "#08205e", marginTop: "10px" }}>
          {t("registrationForm.registrationFormTitle")}
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
            label={t("registrationForm.username")}
            name="username"
            value={regData.username}
            onChange={handleChange}
          />

          <TextField
            label={t("registrationForm.password")}
            required
            variant="outlined"
            fullWidth
            margin="normal"
            name="password"
            value={regData.password}
            onChange={handleChange}
          />

          <TextField
            label={t("registrationForm.confirmPassword")}
            required
            variant="outlined"
            fullWidth
            margin="normal"
            name="repeatPassword"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
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
                {t("registrationForm.dialogTitle")}
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
                  {t("registrationForm.buttons.login")}
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
              {t("registrationForm.buttons.register")}
            </Button>
          )}
        </ThemeProvider>
      </Paper>
    </>
  );
}
