import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CallProvider } from './store/CallContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <CallProvider>
    <App />
  </CallProvider>
);
