// src/index.js
import React from 'react';
import App from './styles/App';
import './index.css';
import ReactDOM from 'react-dom/client';
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();