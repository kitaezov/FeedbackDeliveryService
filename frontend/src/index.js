<<<<<<< HEAD
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

// Создание корневого элемента React для рендеринга приложения
const root = ReactDOM.createRoot(document.getElementById('root'));

// Рендеринг приложения с необходимыми провайдерами
root.render(
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);

// Запуск измерения веб-производительности
=======
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

>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
reportWebVitals();