/**
 * Manager Routes
 */

const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');

// All manager routes require authentication and 'manager' role
router.use(authenticateToken);
router.use(checkRole(['manager', 'admin', 'head_admin']));

// Reviews management
router.get('/reviews', managerController.getReviews);
router.post('/reviews/:id/response', managerController.respondToReview);

// Restaurant data
router.get('/restaurants', managerController.getRestaurants);

// Analytics endpoints
router.get('/analytics/stats', managerController.getStats);
router.get('/analytics/charts', managerController.getChartData);

module.exports = router; 