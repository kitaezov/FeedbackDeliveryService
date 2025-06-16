/**
 * Support Routes
 * Endpoints for support ticket operations
 */

const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get user's support tickets
router.get('/user/tickets', authenticateToken, (req, res) => {
  supportController.getUserTickets(req, res);
});

// Create a new support ticket
router.post('/tickets', authenticateToken, (req, res) => {
  supportController.createTicket(req, res);
});

// Get all support tickets (staff only)
router.get('/tickets', authenticateToken, (req, res) => {
  supportController.getAllTickets(req, res);
});

// Get specific ticket by ID
router.get('/tickets/:id', authenticateToken, (req, res) => {
  supportController.getTicketById(req, res);
});

// Add a message to a ticket
router.post('/tickets/:id/messages', authenticateToken, (req, res) => {
  supportController.addMessage(req, res);
});

// Update ticket status (staff only)
router.patch('/tickets/:id/status', authenticateToken, (req, res) => {
  supportController.updateTicketStatus(req, res);
});

// Update ticket priority (staff only)
router.patch('/tickets/:id/priority', authenticateToken, (req, res) => {
  supportController.updateTicketPriority(req, res);
});

// Delete a ticket
router.delete('/tickets/:id', authenticateToken, (req, res) => {
  supportController.deleteTicket(req, res);
});

module.exports = router; 