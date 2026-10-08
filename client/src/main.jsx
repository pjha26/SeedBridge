import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter lives here so every component can use React Router hooks */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
