/**
 * Restaurant Routes
 */

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/search', restaurantController.searchRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.get('/by-slug/:slug', restaurantController.getRestaurantBySlug);

// Admin only routes
router.post('/', authenticateToken, checkRole(['admin', 'head_admin']), restaurantController.createRestaurant);
router.put('/:id', authenticateToken, checkRole(['admin', 'head_admin']), restaurantController.updateRestaurant);
router.put('/:id/slug', authenticateToken, checkRole(['admin', 'head_admin']), restaurantController.updateRestaurantSlug);
router.delete('/:id', authenticateToken, checkRole(['admin', 'head_admin']), restaurantController.deleteRestaurant);
router.put('/:id/criteria', authenticateToken, checkRole(['admin', 'head_admin']), restaurantController.updateRestaurantCriteria);

module.exports = router; 