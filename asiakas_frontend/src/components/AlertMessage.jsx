import { Typography, Alert, AlertTitle, Box } from "@mui/material";

export default function AlertMessage({ alert, setAlert }) {
  return (
    <Box
      display="flex"
      position="fixed"
      left="10%"
      top="20"
      alignItems={"center"}
      justifyContent={"center"}
      height="50%"
      width="80%"
      zIndex="1300"
      bgcolor="rgba(188, 188, 188, 0.6)"
    >
      <Alert
        sx={{
          margin: 10,
          fontSize: "13px",
          width: 500,
          height: 150,
          "&.MuiAlert-standardError": {
            marginTop: 2,
          },
        }}
        severity={alert.status}
        onClose={() => setAlert(null)}
      >
        <AlertTitle sx={{ mt: 2, fontSize: "16px" }}>
          {alert.title || ""}
        </AlertTitle>
        <Typography sx={{ mt: 2, fontSize: "14px", width: "100%" }}>
          {alert.message}
        </Typography>
      </Alert>
    </Box>
  );
}
