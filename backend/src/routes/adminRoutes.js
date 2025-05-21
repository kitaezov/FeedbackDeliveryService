/**
 * Маршруты администратора
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');

// Инициализация главного администратора (публичный маршрут, работает только один раз)
router.get('/init-head-admin', adminController.initializeHeadAdmin);

// Получить всех пользователей - только администраторы или выше
router.get('/users', authenticateToken, checkRole('admin'), adminController.getUsers);

// Обновить роль пользователя - администратор может назначить менеджера, главный администратор может назначить любую роль
router.put('/users/:id/role', authenticateToken, checkRole('admin'), adminController.updateUserRole);

// Блокировать учетную запись пользователя - только администраторы или выше
router.post('/users/:id/block', authenticateToken, checkRole('admin'), adminController.blockUser);

// Разблокировать учетную запись пользователя - только администраторы или выше
router.post('/users/:id/unblock', authenticateToken, checkRole('admin'), adminController.unblockUser);

// Удалить отзыв - только менеджеры или выше
router.delete('/reviews/:id', authenticateToken, checkRole('manager'), adminController.deleteReview);

// Получить все удаленные отзывы с причинами - только менеджеры или выше
router.get('/deleted-reviews', authenticateToken, checkRole('manager'), adminController.getDeletedReviews);

// Маршруты управления ресторанами
router.get('/restaurants', authenticateToken, checkRole('admin'), adminController.getRestaurants);
router.post('/restaurants', authenticateToken, checkRole('admin'), adminController.createRestaurant);
router.put('/restaurants/:id', authenticateToken, checkRole('admin'), adminController.updateRestaurant);
router.delete('/restaurants/:id', authenticateToken, checkRole('admin'), adminController.deleteRestaurant);

module.exports = router; 