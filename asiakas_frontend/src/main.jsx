import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import ContactList from './components/ContactList.jsx'
import CallView from './components/CallView.jsx'
import ImportContacts from './components/ImportContacts.jsx';

const router = createBrowserRouter([ 
  {
    path: "/",
    element: <App />,
    children: [                       
      {
        element: <ContactList />,
        index: true                 
      },
      {
        path: "/callview",                
        element: <CallView />,
      },
      {
        path: "/import",
        element:<ImportContacts />,
      },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
