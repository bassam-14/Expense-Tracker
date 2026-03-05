import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // 1. Import it

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* 2. Wrap your entire app inside it */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);