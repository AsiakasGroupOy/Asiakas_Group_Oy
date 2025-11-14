import { Link, useLocation } from "react-router-dom";
import { Tabs, Tab } from "@mui/material";

const NavigationTabs = ({ role }) => {
  const location = useLocation();
  const path = location.pathname;

  const getTabValue = () => {
    if (path === "/contactlist") return "/contactlist";
    if (path === "/callview") return "/callview";
    if (path === "/import") return "/import";
    if (path === "/settings") return "/settings"; //Roles Management

    return false;
  };

  return (
    <Tabs
      value={getTabValue()}
      indicatorColor="primary"
      textColor="inherit"
      sx={{
        "& .MuiTabs-flexContainer": {
          justifyContent: "flex-end", // aligns tabs to the right
        },
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
        minWidth: 600,
      }}
    >
      <Tab
        label="Contact list"
        value="/contactlist"
        component={Link}
        to="/contactlist"
      />
      <Tab
        label="Call view"
        value="/callview"
        component={Link}
        to="/callview"
      />
      {["Manager", "Admin Access"].includes(role) && (
        <Tab
          label="Import contacts"
          value="/import"
          component={Link}
          to="/import"
        />
      )}
      {["Admin Access"].includes(role) && (
        <Tab
          label="Settings"
          value="/settings"
          component={Link}
          to="/settings"
        />
      )}
    </Tabs>
  );
};

export default NavigationTabs;
