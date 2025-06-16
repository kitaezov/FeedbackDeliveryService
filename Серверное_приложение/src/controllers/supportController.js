/**
 * Support Controller
 * Handles all support ticket related operations
 */

const supportTicketModel = require('../models/supportTicketModel');
const supportMessageModel = require('../models/supportMessageModel');
const userModel = require('../models/userModel');

/**
 * Create a new support ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with created ticket
 */
const createTicket = async (req, res) => {
    try {
        const { subject, message, priority } = req.body;
        const userId = req.user.id;
        
        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Subject and message are required'
            });
        }
        
        const ticketData = {
            user_id: userId,
            subject,
            message,
            priority: priority || 'medium',
            status: 'open'
        };
        
        const ticket = await supportTicketModel.create(ticketData);
        
        // Создаем начальное сообщение
        await supportMessageModel.create({
            ticket_id: ticket.id,
            user_id: userId,
            message,
            is_staff_reply: false
        });
        
        // Получаем информацию о пользователе для WebSocket-уведомления
        const user = await userModel.findById(userId);
        if (user) {
            // Добавляем информацию о пользователе в билет для уведомления
            const ticketWithUser = {
                ...ticket,
                user_name: user.name,
                user_email: user.email
            };
            
            // Отправляем WebSocket-уведомление сотрудникам
            if (req.app.broadcastSupportTicket) {
                req.app.broadcastSupportTicket(ticketWithUser);
            }
        }
        
        return res.status(201).json({
            success: true,
            message: 'Билет поддержки успешно создан',
            data: ticket
        });
    } catch (error) {
        console.error('Ошибка при создании билета поддержки:', error);
        return res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

/**
 * Получить билеты поддержки пользователя
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Ответ с билетами пользователя
 */
const getUserTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit, offset } = req.query;
        
        const options = { limit, offset };
        const tickets = await supportTicketModel.getByUserId(userId, options);
        
        return res.status(200).json({
            success: true,
            data: tickets
        });
    } catch (error) {
        console.error('Ошибка при получении билетов пользователя:', error);
        return res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

/**
 * Получить все билеты поддержки (для сотрудников)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Ответ с билетами
 */
const getAllTickets = async (req, res) => {
    try {
        const { status, priority, limit, offset } = req.query;
        
        // Проверяем, авторизован ли пользователь (manager, admin, или head_admin)
        const userRole = req.user.role;
        if (!['manager', 'admin', 'head_admin'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Неавторизованный доступ'
            });
        }
        
        const options = { status, priority, limit, offset };
        const tickets = await supportTicketModel.getAll(options);
        
        return res.status(200).json({
            success: true,
            data: tickets
        });
    } catch (error) {
        console.error('Ошибка при получении всех билетов:', error);
        return res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

/**
 * Получить билет по ID с сообщениями
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Ответ с билетом и сообщениями
 */
const getTicketById = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        const ticket = await supportTicketModel.findById(ticketId);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Билет не найден'
            });
        }
        
        // Проверяем, авторизован ли пользователь для просмотра этого билета
        const isAuthorized = ticket.user_id === userId || 
                             ['manager', 'admin', 'head_admin'].includes(userRole);
        
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Неавторизованный доступ'
            });
        }
        
        // Получаем сообщения для этого билета
        const messages = await supportMessageModel.getByTicketId(ticketId);
        
        return res.status(200).json({
            success: true,
            data: {
                ticket,
                messages
            }
        });
    } catch (error) {
        console.error('Ошибка при получении билета по ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

/**
 * Добавить сообщение в билет
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Ответ с созданным сообщением
 */
const addMessage = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Содержимое сообщения обязательно'
            });
        }
        
        // Проверяем, существует ли билет
        const ticket = await supportTicketModel.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Билет не найден'
            });
        }
        
        // Проверяем, имеет ли пользователь право добавлять сообщение
        const isStaffUser = ['manager', 'admin', 'head_admin'].includes(userRole);
        const isTicketOwner = ticket.user_id === userId;
        
        if (!isTicketOwner && !isStaffUser) {
            return res.status(403).json({
                success: false,
                message: 'Неавторизованный доступ'
            });
        }
        
        // Создаем сообщение
        const messageData = {
            ticket_id: ticketId,
            user_id: userId,
            message,
            is_staff_reply: isStaffUser
        };
        
        const createdMessage = await supportMessageModel.create(messageData);
        
        // Обновляем статус билета, если нужно
        if (isStaffUser && ticket.status === 'open') {
            await supportTicketModel.updateStatus(ticketId, 'in_progress');
        }
        
        // Получаем пользователя для целей уведомления
        const user = await userModel.findById(userId);
        
        return res.status(201).json({
            success: true,
            message: 'Сообщение добавлено успешно',
            data: {
                ...createdMessage,
                user_name: user.name
            }
        });
    } catch (error) {
        console.error('Ошибка при добавлении сообщения:', error);
        return res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

/**
 * Обновление статуса билета (для сотрудников)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Ответ с обновленным билетом
 */
const updateTicketStatus = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userRole = req.user.role;
        const { status } = req.body;
        
        // Проверяем, авторизован ли пользователь (только для сотрудников)
        if (!['manager', 'admin', 'head_admin'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Неавторизованный доступ'
            });
        }
        
        if (!status || !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Неверное значение статуса'
            });
        }
        
        // Проверяем, существует ли билет
        const ticket = await supportTicketModel.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Билет не найден'
            });
        }
        
        // Обновляем статус билета
        await supportTicketModel.updateStatus(ticketId, status);
        
        return res.status(200).json({
            success: true,
            message: 'Статус билета обновлен успешно',
            data: {
                id: ticketId,
                status
            }
        });
    } catch (error) {
        console.error('Ошибка при обновлении статуса билета:', error);
        return res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

/**
 * Обновление приоритета билета (для сотрудников)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Ответ с обновленным билетом
 */
const updateTicketPriority = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userRole = req.user.role;
        const { priority } = req.body;
        
        // Проверяем, авторизован ли пользователь (только для сотрудников)
        if (!['manager', 'admin', 'head_admin'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Неавторизованный доступ'
            });
        }
        
        if (!priority || !['low', 'medium', 'high', 'urgent'].includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Неверное значение приоритета'
            });
        }
        
        // Проверяем, существует ли билет
        const ticket = await supportTicketModel.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Билет не найден'
            });
        }
        
        // Обновляем приоритет билета
        await supportTicketModel.updatePriority(ticketId, priority);
        
        return res.status(200).json({
            success: true,
            message: 'Приоритет билета обновлен успешно',
            data: {
                id: ticketId,
                priority
            }
        });
    } catch (error) {
        console.error('Ошибка при обновлении приоритета билета:', error);
        return res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

/**
 * Удаление билета
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Ответ с удаленным билетом
 */
const deleteTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Проверяем, существует ли билет
        const ticket = await supportTicketModel.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Билет не найден'
            });
        }
        
        // Проверяем, имеет ли пользователь право удалить билет
        const isStaffUser = ['admin', 'head_admin'].includes(userRole);
        const isTicketOwner = ticket.user_id === userId;
        
        if (!isTicketOwner && !isStaffUser) {
            return res.status(403).json({
                success: false,
                message: 'Неавторизованный доступ'
            });
        }
        
        // Удаляем билет
        await supportTicketModel.remove(ticketId);
        
        return res.status(200).json({
            success: true,
            message: 'Билет удален успешно',
            data: {
                id: ticketId
            }
        });
    } catch (error) {
        console.error('Ошибка при удалении билета:', error);
        return res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

module.exports = {
    createTicket,
    getUserTickets,
    getAllTickets,
    getTicketById,
    addMessage,
    updateTicketStatus,
    updateTicketPriority,
    deleteTicket
}; 