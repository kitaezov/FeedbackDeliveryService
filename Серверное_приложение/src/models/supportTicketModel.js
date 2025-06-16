/**
 * Модель тикетов поддержки
 * Обрабатывает все операции с базой данных, связанные с тикетами поддержки
 */

const pool = require('../config/database');

/**
 * Класс для работы с тикетами поддержки пользователей
 */
class SupportTicketModel {
    /**
     * Создать новый тикет поддержки
     * @param {Object} ticketData - Данные тикета
     * @returns {Promise<Object>} - Информация о созданном тикете
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
     * Найти тикет по ID
     * @param {number} id - ID тикета
     * @returns {Promise<Object|null>} - Объект тикета или null
     */
    async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM support_tickets WHERE id = ?',
            [id]
        );
        
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Получить тикеты по ID пользователя
     * @param {number} userId - ID пользователя
     * @returns {Promise<Array>} - Список тикетов
     */
    async getByUserId(userId, options = {}) {
        // Убедиться, что limit и offset являются корректными положительными целыми числами
        let limit = parseInt(options.limit || 50, 10);
        let offset = parseInt(options.offset || 0, 10);
        
        // Проверка значений
        if (isNaN(limit) || limit <= 0) limit = 50;
        if (isNaN(offset) || offset < 0) offset = 0;
        
        // Ограничение максимального лимита
        if (limit > 1000) limit = 1000;
        
        const [rows] = await pool.execute(
            `SELECT * FROM support_tickets WHERE user_id = ? 
             ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
            [userId]
        );
        
        return rows;
    }
    
    /**
     * Получить все тикеты с опциональной фильтрацией
     * @param {Object} options - Параметры фильтрации
     * @returns {Promise<Array>} - Список тикетов
     */
    async getAll(options = {}) {
        const { status, priority } = options;
        
        // Убедиться, что limit и offset являются корректными положительными целыми числами
        let limit = parseInt(options.limit || 50, 10);
        let offset = parseInt(options.offset || 0, 10);
        
        // Проверка значений
        if (isNaN(limit) || limit <= 0) limit = 50;
        if (isNaN(offset) || offset < 0) offset = 0;
        
        // Ограничение максимального лимита
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
     * Обновить статус тикета
     * @param {number} id - ID тикета
     * @param {string} status - Новый статус ('open', 'in_progress', 'closed')
     * @returns {Promise<boolean>} - Результат обновления
     */
    async updateStatus(id, status) {
        // Убедиться, что статус является одним из допустимых значений
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
     * Обновить приоритет тикета
     * @param {number} id - ID тикета
     * @param {string} priority - Новый приоритет ('low', 'medium', 'high')
     * @returns {Promise<boolean>} - Результат обновления
     */
    async updatePriority(id, priority) {
        // Убедиться, что приоритет является одним из допустимых значений
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
     * Удалить тикет
     * @param {number} id - ID тикета
     * @returns {Promise<boolean>} - Результат удаления
     */
    async delete(id) {
        // Сначала удалить связанные сообщения
        await pool.execute('DELETE FROM support_messages WHERE ticket_id = ?', [id]);
        
        // Затем удалить сам тикет
        await pool.execute('DELETE FROM support_tickets WHERE id = ?', [id]);
        
        return true;
    }
}

module.exports = new SupportTicketModel(); 