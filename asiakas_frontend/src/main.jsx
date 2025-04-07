import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import ContactList from '../components/ContactList.jsx'
import CallView from '../components/CallView.jsx'

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
        path: "callview",                
        element: <CallView />,
      },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
