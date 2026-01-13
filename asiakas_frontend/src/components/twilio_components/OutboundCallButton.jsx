import { useTwilio } from "./TwilioContext.jsx";
import CallIcon from "@mui/icons-material/Call";
import { Button } from "@mui/material";

export default function OutboundCallButton({ callData }) {
  const { makeCall, twilioStatus, hangup, activeCall } = useTwilio();

  if (!callData?.to_number) {
    console.log("No phone number in callData:", callData);
    return <div>NO phone number</div>;
  }

  const handleClick = () => {
    if (activeCall) {
      // If there's an active call, hang up
      hangup();
    } else {
      // Otherwise, initiate a  call
      makeCall({
        To: callData.to_number,
        contact_name: callData.contact_name,
        organization_name: callData.organization_name,
        calling_list_name: callData.calling_list_name,
      });
    }
  };

  const buttonText = activeCall
    ? `Hang Up ${callData.to_number}`
    : twilioStatus === "ready"
    ? `Call ${callData.to_number}`
    : "Device not ready";

  const callIcon = activeCall ? (
    <CallIcon sx={{ color: "red" }} />
  ) : twilioStatus === "ready" ? (
    <CallIcon sx={{ color: "#08205e" }} />
  ) : null;

  return (
    <Button
      onClick={handleClick}
      variant="outlined"
      size="medium"
      disabled={twilioStatus !== "ready"}
      startIcon={callIcon}
      sx={{
        borderRadius: 6,
        borderColor: activeCall ? "red" : "#08205e",
        borderWidth: "1px",
        textTransform: "none",
        color: activeCall ? "red" : "#08205e",
        fontSize: "15px",
        padding: "12px 24px",
        "& .MuiButton-startIcon svg": {
          fontSize: "22px",
        },
      }}
    >
      {buttonText}
    </Button>
  );
}
