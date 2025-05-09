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
              paddingTop: 0,  // Adjusting padding
              paddingBottom: 0,  // Adjusting padding
               minHeight: "initial", 
          },
        },
      },
    }
  });
export default theme;