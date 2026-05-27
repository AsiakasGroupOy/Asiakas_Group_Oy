import { useTwilio } from "./TwilioContext.jsx";
import { useState, useEffect } from "react";
import PhoneCallbackIcon from "@mui/icons-material/PhoneCallback";
import CallEndIcon from "@mui/icons-material/CallEnd";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import { Snackbar, Alert, Button, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function IncomingCallDialog() {
  const { incomingCall, activeCall, hangup, acceptIncomingCall } = useTwilio();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (incomingCall && !open) {
      setOpen(true);
    } else if (!incomingCall && !activeCall && open) {
      setOpen(false);
    }
  }, [incomingCall, activeCall]);

  const fromNumber =
    incomingCall?.customParameters?.get("from_number") ||
    incomingCall?.parameters?.From;
  const orgName = incomingCall?.customParameters?.get("organization_name");

  const handleAcceptClick = () => {
    if (incomingCall) {
      acceptIncomingCall();
    } else {
      hangup();
      setOpen(false);
    }
  };

  const handleCancelCall = () => {
    incomingCall.ignore(); //To stop incoming sound for the local Device instance

    setOpen(false);
  };

  const callIcon = incomingCall ? (
    <PhoneCallbackIcon sx={{ color: "#085e1bff" }} />
  ) : activeCall ? (
    <CallEndIcon sx={{ color: "#08205e" }} />
  ) : null;

  const buttonText = incomingCall
    ? t("twilioInboundCallDialog.buttonText.accept")
    : t("twilioInboundCallDialog.buttonText.reject");

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      onClose={(event, reason) => {
        if (reason === "clickaway") {
          return;
        }
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 1,
          display: "flex",
          alignItems: "center",
          ml: 15,
          mt: -2,
          gap: 2,
          backgroundColor: "#f0ffffff",
          borderRadius: 4,
          marginLeft: 25,
        }}
      >
        {t("twilioInboundCallDialog.callFrom")} {fromNumber}{" "}
        {orgName ? `${orgName} ` : ""}
        <Button
          onClick={handleAcceptClick}
          size="small"
          startIcon={callIcon}
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: incomingCall ? "#085e1bff" : "#08085eff",
            borderWidth: "1px",
            textTransform: "none",
            color: incomingCall ? "#085e1bff" : "#08205e",
            fontSize: "15px",
            "& .MuiButton-startIcon svg": {
              fontSize: "30px",
            },
          }}
        >
          {buttonText}
        </Button>
        {incomingCall ? (
          <Button
            onClick={handleCancelCall}
            size="small"
            startIcon={<PhoneDisabledIcon />}
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "red",
              borderWidth: "1px",
              color: "red",
              "& .MuiButton-startIcon svg": {
                marginRight: "0px",
                fontSize: "30px",
              },
              "& .MuiButton-startIcon": {
                marginRight: "0px",
              },
            }}
          ></Button>
        ) : null}
      </Paper>
    </Snackbar>
  );
}
