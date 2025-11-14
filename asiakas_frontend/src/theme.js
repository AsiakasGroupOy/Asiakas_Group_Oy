import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontSize: 10, // base font size (affects rem-based sizing)
    fontFamily: "Arial, sans-serif", // base font family
  },
  palette: {
    dustblue: {
      main: "#374c86",
      light: "#a1b3e6",
      dark: "#333f61",
      contrastText: "#fff",
    },
    grey: {
      main: "#e3e3e3ff",
      light: "#eceff1",
      dark: "#78909c",
      contrastText: "#360202ff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          "& .MuiButton-startIcon": {
            marginRight: 8, // spacing between icon and text
          },
          "& .MuiButton-startIcon svg": {
            fontSize: "13px", // target the FontAwesome SVG inside
          },

          "&:focus:not(:focus-visible)": {
            outline: "none",
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          height: 20, // or whatever height you want
          paddingTop: 0, // Adjusting padding
          paddingBottom: 0, // Adjusting padding
          minHeight: "initial",
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          "&.Mui-active": {
            color: "#374c86",
            fontSize: "22px", // active step icon color
          },
          "&.Mui-completed": {
            color: "#374c86",
            fontSize: "22px", // active step icon color
          },
        },
        text: {
          fontSize: "15px", // step number font size
          fontWeight: "bold", // make the step number bold
          fill: "#fff", // white color for the step number
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: "15px", // 12px
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#374c86", // your custom color
          },
        },
        notchedOutline: {
          borderColor: "rgba(0, 0, 0, 0.23)", // default color when not focused
        },
        input: {
          fontSize: "15px",
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: "#374c86", // your custom color
          },
        },
      },
    },

    MuiStepConnector: {
      styleOverrides: {
        root: {
          "&.Mui-active": {
            borderColor: "#a6b8e0", // active step connector color
          },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontSize: "0.875rem", // 14px
        },
      },
    },
  },
});
export default theme;
