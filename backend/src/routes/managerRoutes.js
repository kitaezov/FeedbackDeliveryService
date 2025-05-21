/**
 * Маршруты менеджера
 */

const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');

// Все маршруты менеджера требуют аутентификации и роли 'manager'
router.use(authenticateToken);
router.use(checkRole(['manager', 'admin', 'head_admin']));

// Управление отзывами
router.get('/reviews', managerController.getReviews);
router.post('/reviews/respond', managerController.respondToReview);
router.post('/reviews/:id/response', managerController.respondToReview);

// Данные ресторана
router.get('/restaurants', managerController.getRestaurants);

// Конечные точки аналитики
router.get('/analytics/stats', managerController.getStats);
router.get('/analytics/charts', managerController.getChartData);

module.exports = router; 