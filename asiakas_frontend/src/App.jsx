import {Container, CssBaseline, AppBar, Toolbar, Typography, Box} from '@mui/material';
import './App.css'
import NavigationTabs from '../ui/NavigationTabs';
import { Outlet } from 'react-router-dom';


/*''*/

function App() {
  
  return (
   <>
    <Container maxWidth="xl">
      <CssBaseline />
      <AppBar position="fixed" sx={{ backgroundColor: "#08205e"  }}>
        <Toolbar sx={{ alignItems: 'flex-start' }}>
          <Typography variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, marginTop:1, display: { xs: 'none', sm: 'block', md: 'flex' } }}>
           AsiakasGroup Oy
          </Typography> 
         <NavigationTabs  />
        </Toolbar>
         <Box
            sx={{
              width: "100%",
              height: "1px",
              backgroundColor: "white", 
              opacity: 0.7,
              marginBottom: 1,
          }}
          /> 
      </AppBar>
    
    </Container>
    <Outlet />
   </>
  );
}
  

export default App
