
import { Link } from 'react-router-dom';
import { Tabs, Tab } from '@mui/material';
import React ,{ useState }from 'react';

const NavigationTabs = () => {
    const [activeTab, setActiveTab] = useState(0);
  
    const handleChange = (event, newValue) => {
      setActiveTab(newValue);
    };
  
    return (
      <Tabs
        value={activeTab}
        onChange={handleChange}
        indicatorColor="primary"
        sx={{
          "& .MuiTab-root": {
            color: "#a6b8e0", // Default tab color
          },
          "& .Mui-selected": {
            color: "#ffffff", // Active tab color
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#ffffff",
            height: '1px',  // Active tab underline color
          },
        }}
      >
        <Tab label="Contact list" component={Link} to="/" />
        <Tab label="Call view" component={Link} to="/CallView" />
      </Tabs>
    );
  };
  
  export default NavigationTabs;