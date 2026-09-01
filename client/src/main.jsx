import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#101826',
              color: '#F6F3EC',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '0.9rem',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#1F6F63', secondary: '#F6F3EC' } },
            error: { iconTheme: { primary: '#B9502F', secondary: '#F6F3EC' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
