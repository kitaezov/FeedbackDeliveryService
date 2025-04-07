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
        
        // Create the initial message
        await supportMessageModel.create({
            ticket_id: ticket.id,
            user_id: userId,
            message,
            is_staff_reply: false
        });
        
        // Get user information for WebSocket notification
        const user = await userModel.findById(userId);
        if (user) {
            // Add user info to ticket for notification
            const ticketWithUser = {
                ...ticket,
                user_name: user.name,
                user_email: user.email
            };
            
            // Send WebSocket notification to staff
            if (req.app.broadcastSupportTicket) {
                req.app.broadcastSupportTicket(ticketWithUser);
            }
        }
        
        return res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            data: ticket
        });
    } catch (error) {
        console.error('Error creating support ticket:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get user's support tickets
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with user's tickets
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
        console.error('Error getting user tickets:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get all support tickets (for staff)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with tickets
 */
const getAllTickets = async (req, res) => {
    try {
        const { status, priority, limit, offset } = req.query;
        
        // Check if user is authorized (manager, admin, or head_admin)
        const userRole = req.user.role;
        if (!['manager', 'admin', 'head_admin'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
        
        const options = { status, priority, limit, offset };
        const tickets = await supportTicketModel.getAll(options);
        
        return res.status(200).json({
            success: true,
            data: tickets
        });
    } catch (error) {
        console.error('Error getting all tickets:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get ticket by ID with messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with ticket and messages
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
                message: 'Ticket not found'
            });
        }
        
        // Check if user is authorized to view this ticket
        const isAuthorized = ticket.user_id === userId || 
                             ['manager', 'admin', 'head_admin'].includes(userRole);
        
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
        
        // Get messages for this ticket
        const messages = await supportMessageModel.getByTicketId(ticketId);
        
        return res.status(200).json({
            success: true,
            data: {
                ticket,
                messages
            }
        });
    } catch (error) {
        console.error('Error getting ticket by ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Add a message to a ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with created message
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
                message: 'Message content is required'
            });
        }
        
        // Verify ticket exists
        const ticket = await supportTicketModel.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }
        
        // Check permission to add message
        const isStaffUser = ['manager', 'admin', 'head_admin'].includes(userRole);
        const isTicketOwner = ticket.user_id === userId;
        
        if (!isTicketOwner && !isStaffUser) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
        
        // Create message
        const messageData = {
            ticket_id: ticketId,
            user_id: userId,
            message,
            is_staff_reply: isStaffUser
        };
        
        const createdMessage = await supportMessageModel.create(messageData);
        
        // Update ticket status if needed
        if (isStaffUser && ticket.status === 'open') {
            await supportTicketModel.updateStatus(ticketId, 'in_progress');
        }
        
        // Get user for notification purposes
        const user = await userModel.findById(userId);
        
        return res.status(201).json({
            success: true,
            message: 'Message added successfully',
            data: {
                ...createdMessage,
                user_name: user.name
            }
        });
    } catch (error) {
        console.error('Error adding message:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Update ticket status (staff only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with updated ticket
 */
const updateTicketStatus = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userRole = req.user.role;
        const { status } = req.body;
        
        // Check if user is authorized (staff only)
        if (!['manager', 'admin', 'head_admin'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
        
        if (!status || !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }
        
        // Verify ticket exists
        const ticket = await supportTicketModel.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }
        
        // Update ticket status
        await supportTicketModel.updateStatus(ticketId, status);
        
        return res.status(200).json({
            success: true,
            message: 'Ticket status updated successfully',
            data: {
                id: ticketId,
                status
            }
        });
    } catch (error) {
        console.error('Error updating ticket status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Update ticket priority (staff only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with updated ticket
 */
const updateTicketPriority = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userRole = req.user.role;
        const { priority } = req.body;
        
        // Check if user is authorized (staff only)
        if (!['manager', 'admin', 'head_admin'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
        
        if (!priority || !['low', 'medium', 'high', 'urgent'].includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid priority value'
            });
        }
        
        // Verify ticket exists
        const ticket = await supportTicketModel.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }
        
        // Update ticket priority
        await supportTicketModel.updatePriority(ticketId, priority);
        
        return res.status(200).json({
            success: true,
            message: 'Ticket priority updated successfully',
            data: {
                id: ticketId,
                priority
            }
        });
    } catch (error) {
        console.error('Error updating ticket priority:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Delete a ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with deleted ticket
 */
const deleteTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Verify ticket exists
        const ticket = await supportTicketModel.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }
        
        // Check permission to delete
        const isStaffUser = ['admin', 'head_admin'].includes(userRole);
        const isTicketOwner = ticket.user_id === userId;
        
        if (!isTicketOwner && !isStaffUser) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
        
        // Delete the ticket
        await supportTicketModel.remove(ticketId);
        
        return res.status(200).json({
            success: true,
            message: 'Ticket deleted successfully',
            data: {
                id: ticketId
            }
        });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
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