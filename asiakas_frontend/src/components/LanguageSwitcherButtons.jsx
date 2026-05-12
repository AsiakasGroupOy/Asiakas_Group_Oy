import { useState } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import theme from "../theme";
import { ThemeProvider } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcherButtons() {
  const [language, setLanguage] = useState("fi");
  const { i18n } = useTranslation();
  const handleChange = (event, newLanguage) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
    }
    i18n.changeLanguage(newLanguage);
  };

  return (
    <ThemeProvider theme={theme}>
      <ToggleButtonGroup
        color="standard"
        value={language}
        size="medium"
        exclusive
        onChange={handleChange}
        aria-label="Platform"
      >
        <ToggleButton value="fi">Fi</ToggleButton>
        <ToggleButton value="en">En</ToggleButton>
      </ToggleButtonGroup>
    </ThemeProvider>
  );
}
