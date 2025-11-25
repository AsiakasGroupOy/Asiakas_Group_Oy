import { Typography, Alert, AlertTitle, Box } from "@mui/material";

export default function AlertMessage({ alert, setAlert }) {
  return (
    <Box
      display="flex"
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      alignItems={"flex-start"}
      justifyContent={"center"}
      zIndex="1000"
      bgcolor="rgba(255, 255, 255, 0.83)"
    >
      <Alert
        sx={{
          marginTop: 30,
          fontSize: "13px",
          width: "100%",
          maxWidth: 500,
          height: 150,
          boxShadow: 3,
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
