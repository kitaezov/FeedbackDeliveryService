/**
 * Модель сообщений поддержки
 * Обрабатывает все операции с базой данных, связанные с сообщениями тикетов поддержки
 */

const pool = require('../config/database');

/**
 * Класс для работы с сообщениями в тикетах поддержки
 */
class SupportMessageModel {
    /**
     * Создать новое сообщение в тикете поддержки
     * @param {Object} messageData - Данные сообщения
     * @returns {Promise<Object>} - Информация о созданном сообщении
     */
    async create(messageData) {
        const { ticket_id, user_id, message, is_staff_reply = false } = messageData;
        
        const [result] = await pool.execute(
            'INSERT INTO support_messages (ticket_id, user_id, message, is_staff_reply, created_at) VALUES (?, ?, ?, ?, NOW())',
            [ticket_id, user_id, message, is_staff_reply]
        );
        
        // Обновление временной метки updated_at у тикета
        await pool.execute(
            'UPDATE support_tickets SET updated_at = NOW() WHERE id = ?',
            [ticket_id]
        );
        
        // Если это ответ от персонала, обновляем статус тикета на 'in_progress', если сейчас статус 'open'
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
     * Получить сообщения по ID тикета
     * @param {number} ticketId - ID тикета
     * @returns {Promise<Array>} - Список сообщений
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
     * Удалить сообщение
     * @param {number} id - ID сообщения
     * @returns {Promise<boolean>} - Результат удаления
     */
    async delete(id) {
        await pool.execute('DELETE FROM support_messages WHERE id = ?', [id]);
        return true;
    }
    
    /**
     * Удалить все сообщения тикета
     * @param {number} ticketId - ID тикета
     * @returns {Promise<boolean>} - Результат удаления
     */
    async deleteAllForTicket(ticketId) {
        await pool.execute('DELETE FROM support_messages WHERE ticket_id = ?', [ticketId]);
        return true;
    }
}

module.exports = new SupportMessageModel(); 