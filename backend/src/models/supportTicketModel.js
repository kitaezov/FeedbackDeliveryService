/**
 * Support Ticket Model
 * Handles all database operations related to support tickets
 */

const pool = require('../config/database');

class SupportTicketModel {
    /**
     * Create a new support ticket
     * @param {Object} ticketData - Ticket data
     * @returns {Promise<Object>} - Created ticket info
     */
    async create(ticketData) {
        const { user_id, subject, message, priority = 'medium', status = 'open' } = ticketData;
        
        const [result] = await pool.execute(
            'INSERT INTO support_tickets (user_id, subject, message, priority, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [user_id, subject, message, priority, status]
        );
        
        const [ticketRows] = await pool.execute(
            'SELECT * FROM support_tickets WHERE id = ?',
            [result.insertId]
        );
        
        return ticketRows[0] || {
            id: result.insertId,
            user_id,
            subject,
            message,
            priority,
            status,
            created_at: new Date()
        };
    }
    
    /**
     * Find ticket by ID
     * @param {number} id - Ticket ID
     * @returns {Promise<Object|null>} - Ticket object or null
     */
    async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM support_tickets WHERE id = ?',
            [id]
        );
        
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Get tickets by user ID
     * @param {number} userId - User ID
     * @returns {Promise<Array>} - List of tickets
     */
    async getByUserId(userId, options = {}) {
        // Ensure limit and offset are valid positive integers
        let limit = parseInt(options.limit || 50, 10);
        let offset = parseInt(options.offset || 0, 10);
        
        // Validate values
        if (isNaN(limit) || limit <= 0) limit = 50;
        if (isNaN(offset) || offset < 0) offset = 0;
        
        // Cap maximum limit
        if (limit > 1000) limit = 1000;
        
        const [rows] = await pool.execute(
            `SELECT * FROM support_tickets WHERE user_id = ? 
             ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
            [userId]
        );
        
        return rows;
    }
    
    /**
     * Get all tickets with optional filtering
     * @param {Object} options - Filter options
     * @returns {Promise<Array>} - List of tickets
     */
    async getAll(options = {}) {
        const { status, priority } = options;
        
        // Ensure limit and offset are valid positive integers
        let limit = parseInt(options.limit || 50, 10);
        let offset = parseInt(options.offset || 0, 10);
        
        // Validate values
        if (isNaN(limit) || limit <= 0) limit = 50;
        if (isNaN(offset) || offset < 0) offset = 0;
        
        // Cap maximum limit
        if (limit > 1000) limit = 1000;
        
        let query = `
            SELECT t.*, u.name as user_name, u.email as user_email 
            FROM support_tickets t
            JOIN users u ON t.user_id = u.id
            WHERE 1=1
        `;
        let queryParams = [];
        
        if (status) {
            query += ' AND t.status = ?';
            queryParams.push(status);
        }
        
        if (priority) {
            query += ' AND t.priority = ?';
            queryParams.push(priority);
        }
        
        query += ` ORDER BY 
            CASE 
                WHEN t.status = 'open' THEN 1
                WHEN t.status = 'in_progress' THEN 2
                WHEN t.status = 'closed' THEN 3
            END,
            CASE 
                WHEN t.priority = 'high' THEN 1
                WHEN t.priority = 'medium' THEN 2
                WHEN t.priority = 'low' THEN 3
            END,
            t.created_at DESC
            LIMIT ${limit} OFFSET ${offset}`;
        
        const [rows] = await pool.execute(query, queryParams);
        return rows;
    }
    
    /**
     * Update ticket status
     * @param {number} id - Ticket ID
     * @param {string} status - New status ('open', 'in_progress', 'closed')
     * @returns {Promise<boolean>} - Success status
     */
    async updateStatus(id, status) {
        // Ensure status is one of the valid statuses
        const validStatuses = ['open', 'in_progress', 'closed'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status value');
        }
        
        await pool.execute(
            'UPDATE support_tickets SET status = ? WHERE id = ?',
            [status, id]
        );
        
        return true;
    }
    
    /**
     * Update ticket priority
     * @param {number} id - Ticket ID
     * @param {string} priority - New priority ('low', 'medium', 'high')
     * @returns {Promise<boolean>} - Success status
     */
    async updatePriority(id, priority) {
        // Ensure priority is one of the valid priorities
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority)) {
            throw new Error('Invalid priority value');
        }
        
        await pool.execute(
            'UPDATE support_tickets SET priority = ? WHERE id = ?',
            [priority, id]
        );
        
        return true;
    }
    
    /**
     * Delete a ticket
     * @param {number} id - Ticket ID
     * @returns {Promise<boolean>} - Success status
     */
    async delete(id) {
        // First delete related messages
        await pool.execute('DELETE FROM support_messages WHERE ticket_id = ?', [id]);
        
        // Then delete the ticket
        await pool.execute('DELETE FROM support_tickets WHERE id = ?', [id]);
        
        return true;
    }
}

module.exports = new SupportTicketModel(); 