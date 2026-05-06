import { Link, useLocation } from "react-router-dom";
import { Tabs, Tab } from "@mui/material";
import { useTranslation } from "react-i18next";

const NavigationTabs = ({ role }) => {
  const location = useLocation();
  const path = location.pathname;
  const { t } = useTranslation();

  const getTabValue = () => {
    if (path === "/contactlist") return "/contactlist";
    if (path === "/callview") return "/callview";
    if (path === "/import") return "/import";
    if (path === "/settings") return "/settings"; //Roles Management
    if (path === "/customers-management") return "/customers-management";
    if (path === "/calls-history") return "/calls-history";

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
        label={t("navigationTabs.contactList")}
        value="/contactlist"
        component={Link}
        to="/contactlist"
      />
      <Tab
        label={t("navigationTabs.callView")}
        value="/callview"
        component={Link}
        to="/callview"
      />
      {["Manager", "Admin Access", "App Admin"].includes(role) && (
        <Tab
          label={t("navigationTabs.importContacts")}
          value="/import"
          component={Link}
          to="/import"
        />
      )}
      {["Admin Access", "App Admin"].includes(role) && (
        <Tab
          label={t("navigationTabs.settings")}
          value="/settings"
          component={Link}
          to="/settings"
        />
      )}
      {["App Admin"].includes(role) && (
        <Tab
          label="Customer Management"
          value="/customers-management"
          component={Link}
          to="/customers-management"
        />
      )}
      {["Manager", "Admin Access", "App Admin"].includes(role) && (
        <Tab
          label={t("navigationTabs.callsHistory")}
          value="/calls-history"
          component={Link}
          to="/calls-history"
        />
      )}
    </Tabs>
  );
};

export default NavigationTabs;
