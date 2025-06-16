/**
 * Точка входа React-приложения "FeedbackDeliveryService"
 * 
 * Этот файл инициализирует приложение, подключает провайдеры и рендерит корневой компонент в DOM.
 */

import React from 'react';
import App from './styles/App';
import './index.css';
import './styles/image.css';
import { BrowserRouter } from "react-router-dom";
import ReactDOM from 'react-dom/client';
import reportWebVitals from "./reportWebVitals";
import { NotificationProvider } from './components/NotificationContext';
import { AuthProvider } from './features/auth/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Add global debug helper to fix reviews not showing up
window.debugReviews = true;
console.log("DEBUG MODE ENABLED - Reviews debugging is active");

// Monkey patch console.log to add timestamps
const originalConsoleLog = console.log;
console.log = function() {
  const timestamp = new Date().toISOString();
  originalConsoleLog.apply(console, [`[${timestamp}]`, ...arguments]);
};

// Создание корневого элемента React для рендеринга приложения
const root = ReactDOM.createRoot(document.getElementById('root'));

// Рендеринг приложения с необходимыми провайдерами
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Запуск измерения веб-производительности
reportWebVitals();