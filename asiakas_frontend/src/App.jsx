import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './App.css'
import NavigationTabs from '../ui/NavigationTabs';


function App() {
  
  return (
    <Container maxWidth="xl">
      <CssBaseline />
      <AppBar position="fixed" sx={{ backgroundColor: '#08205e' }}>
        <Toolbar sx={{ alignItems: 'flex-start' }}>
          <Typography variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1,marginTop:1, display: { xs: 'none', sm: 'block', md: 'flex' } }}>
           AsiakasGroup Oy
          </Typography> 
         <NavigationTabs />
        </Toolbar>
         <Box
            sx={{
              width: "100%",
              height: "1px",
              backgroundColor: "white", 
              opacity: 0.3,
              marginBottom: 1,
          }}
          /> 
      </AppBar>
    </Container>
  );
}
  

export default App
