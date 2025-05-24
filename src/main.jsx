// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Your main App component
import './index.css'; // Optional: if you have global styles in index.css
// If your App.css is only for App component, it's usually imported in App.js

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);