/**
 * Маршруты поддержки
 * Маршруты для операций с тикетами поддержки
 */

const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Выводит пользовательские тикеты
router.get('/user/tickets', authenticateToken, (req, res) => {
  supportController.getUserTickets(req, res);
});

// Создает новый тикет
router.post('/tickets', authenticateToken, (req, res) => {
  supportController.createTicket(req, res);
});

// Выводит все тикеты (только для персонала)
router.get('/tickets', authenticateToken, (req, res) => {
  supportController.getAllTickets(req, res);
});

// Выводит конкретный тикет по ID
router.get('/tickets/:id', authenticateToken, (req, res) => {
  supportController.getTicketById(req, res);
});

// Добавляет сообщение к тикету
router.post('/tickets/:id/messages', authenticateToken, (req, res) => {
  supportController.addMessage(req, res);
});

// Обновляет статус тикета (только для персонала)
router.patch('/tickets/:id/status', authenticateToken, (req, res) => {
  supportController.updateTicketStatus(req, res);
});

// Обновляет приоритет тикета (только для персонала)
router.patch('/tickets/:id/priority', authenticateToken, (req, res) => {
  supportController.updateTicketPriority(req, res);
});

// Удаляет тикет
router.delete('/tickets/:id', authenticateToken, (req, res) => {
  supportController.deleteTicket(req, res);
});

module.exports = router; 