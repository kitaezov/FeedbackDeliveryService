/**
 * Support Message Model
 * Handles all database operations related to support ticket messages
 */

const pool = require('../config/database');

class SupportMessageModel {
    /**
     * Create a new support ticket message
     * @param {Object} messageData - Message data
     * @returns {Promise<Object>} - Created message info
     */
    async create(messageData) {
        const { ticket_id, user_id, message, is_staff_reply = false } = messageData;
        
        const [result] = await pool.execute(
            'INSERT INTO support_messages (ticket_id, user_id, message, is_staff_reply, created_at) VALUES (?, ?, ?, ?, NOW())',
            [ticket_id, user_id, message, is_staff_reply]
        );
        
        // Update the ticket's updated_at timestamp
        await pool.execute(
            'UPDATE support_tickets SET updated_at = NOW() WHERE id = ?',
            [ticket_id]
        );
        
        // If this is a staff reply, update the ticket status to 'in_progress' if it's 'open'
        if (is_staff_reply) {
            await pool.execute(
                'UPDATE support_tickets SET status = CASE WHEN status = "open" THEN "in_progress" ELSE status END WHERE id = ?',
                [ticket_id]
            );
        }
        
        const [messageRows] = await pool.execute(
            'SELECT * FROM support_messages WHERE id = ?',
            [result.insertId]
        );
        
        return messageRows[0] || {
            id: result.insertId,
            ticket_id,
            user_id,
            message,
            is_staff_reply,
            created_at: new Date()
        };
    }
    
    /**
     * Get messages by ticket ID
     * @param {number} ticketId - Ticket ID
     * @returns {Promise<Array>} - List of messages
     */
    async getByTicketId(ticketId) {
        const [rows] = await pool.execute(
            `SELECT m.*, u.name as user_name, u.role as user_role
             FROM support_messages m
             JOIN users u ON m.user_id = u.id
             WHERE m.ticket_id = ?
             ORDER BY m.created_at ASC`,
            [ticketId]
        );
        
        return rows;
    }
    
    /**
     * Delete a message
     * @param {number} id - Message ID
     * @returns {Promise<boolean>} - Success status
     */
    async delete(id) {
        await pool.execute('DELETE FROM support_messages WHERE id = ?', [id]);
        return true;
    }
    
    /**
     * Delete all messages for a ticket
     * @param {number} ticketId - Ticket ID
     * @returns {Promise<boolean>} - Success status
     */
    async deleteAllForTicket(ticketId) {
        await pool.execute('DELETE FROM support_messages WHERE ticket_id = ?', [ticketId]);
        return true;
    }
}

module.exports = new SupportMessageModel(); 