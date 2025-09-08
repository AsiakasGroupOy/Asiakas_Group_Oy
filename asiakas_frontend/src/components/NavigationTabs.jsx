import { Link, useLocation } from "react-router-dom";
import { Tabs, Tab } from "@mui/material";

const NavigationTabs = () => {
  const location = useLocation();
  const path = location.pathname;

  const getTabValue = () => {
    if (path === "/") return "/";
    if (path === "/callview") return "/callview";
    if (path === "/import") return "/import";
    return false;
  };

  return (
    <Tabs
      value={getTabValue()}
      indicatorColor="primary"
      textColor="inherit"
      sx={{
        "& .MuiTab-root": {
          color: "#a6b8e0", // Default tab color
        },
        "& .Mui-selected": {
          color: "#ffffff", // Active tab color
        },
        "& .MuiTabs-indicator": {
          backgroundColor: "#ffffff",
          height: "1px", // Active tab underline color
        },
      }}
    >
      <Tab label="Contact list" value="/" component={Link} to="/" />
      <Tab label="Call view" value="/callview" component={Link} to="/callview"/>
      <Tab label="Import contacts" value="/import" component={Link} to="/import" />
    </Tabs>
  );
};

export default NavigationTabs;
