/**
 * FeedbackDeliveryService - Бэкенд приложения
 * 
 * Основной файл приложения Express, объединяющий все компоненты
 * 
 * @module backend
 * @version 1.0.0
 * @author Dev Team
 */

// Импорт необходимых модулей
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
// MongoDB connect is disabled - using SQL database instead
// const connectDB = require('./config/mongodb');
require('dotenv').config();

// MongoDB connection is disabled - using SQL database instead
// connectDB();

const initializeDatabase = require('./config/initDatabase');

// Инициализация приложения Express
const app = express();
const server = http.createServer(app);

// Инициализация WebSocket сервера
const wss = new WebSocket.Server({ server });

// Хранение активных соединений
const clients = new Set();

// Обработка WebSocket соединений
wss.on('connection', (ws) => {
    // Убрано избыточное логирование
    clients.add(ws);
    
    ws.on('message', (message) => {
        // Убрано избыточное логирование сообщений
    });
    
    ws.on('close', () => {
        // Убрано избыточное логирование
        clients.delete(ws);
    });
    
    // Отправляем приветственное сообщение
    ws.send(JSON.stringify({ type: 'connection', message: 'Соединение установлено' }));
});

// Глобальная функция для отправки обновлений всем клиентам
app.broadcastReview = (review) => {
    const message = JSON.stringify({ type: 'new_review', review });
    
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

// Глобальная функция для отправки уведомлений о новых тикетах поддержки
app.broadcastSupportTicket = (ticket) => {
    const message = JSON.stringify({ type: 'new_support_ticket', ticket });
    
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

// Промежуточное ПО (Middleware)
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '../public')));

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supportRoutes = require('./routes/supportRoutes');
const profileRoutes = require('./routes/profileRoutes');
const managerRoutes = require('./routes/managerRoutes');

// Регистрация маршрутов
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/profile', profileRoutes);

// Обработка корневого маршрута
app.get('/', (req, res) => {
    res.json({
        name: 'FeedbackDelivery API',
        version: '1.0.0',
        status: 'online'
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Глобальная обработка ошибок:', err);
    
    res.status(err.status || 500).json({
        message: err.message || 'Внутренняя ошибка сервера',
        details: err.details || 'Произошла неожиданная ошибка на сервере'
    });
});

// Обработка несуществующих маршрутов
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Маршрут не найден',
        details: `Маршрут ${req.originalUrl} не существует`
    });
});

// Добавляем доступ к модели пользователя для сервера
const userModel = require('./models/userModel');
app.set('userModel', userModel);

// Инициализация базы данных перед запуском сервера
initializeDatabase()
    .then(() => {
        console.log('Database initialized successfully');
    })
    .catch(error => {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    });

module.exports = { app, server }; 