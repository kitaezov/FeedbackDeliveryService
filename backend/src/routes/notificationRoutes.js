/**
 * Маршруты для работы с уведомлениями
 * @module notificationRoutes
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Получение всех уведомлений пользователя
router.get('/', authenticateToken, notificationController.getUserNotifications);

// Создание нового уведомления
router.post('/', authenticateToken, notificationController.createNotification);

// Пометить уведомление как прочитанное
router.put('/:id/read', authenticateToken, notificationController.markAsRead);

// Удаление уведомления
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

// Удаление всех уведомлений пользователя
router.delete('/', authenticateToken, notificationController.clearAllNotifications);

// Отправить уведомление с просьбой оценить доставку
router.post('/delivery-rating', authenticateToken, notificationController.sendDeliveryRatingRequest);

module.exports = router; 