/**
 * Контроллер для управления уведомлениями
 * @module notificationController
 */

const db = require('../db');

/**
 * Получить все уведомления пользователя
 */
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Получаем уведомления из базы данных
        const notifications = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        
        res.json(notifications.rows);
    } catch (err) {
        console.error('Ошибка при получении уведомлений:', err);
        res.status(500).json({ message: 'Ошибка при получении уведомлений' });
    }
};

/**
 * Создать новое уведомление
 */
const createNotification = async (req, res) => {
    try {
        const { userId, message, type } = req.body;
        
        // Проверяем права пользователя (только админ может создавать уведомления для других)
        if (userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Недостаточно прав' });
        }
        
        const newNotification = await db.query(
            'INSERT INTO notifications (user_id, message, type, is_read, created_at) VALUES (?, ?, ?, false, NOW())',
            [userId, message, type || 'info']
        );
        
        // Get the inserted notification
        const insertedId = newNotification.rows.insertId;
        const insertedNotification = await db.query(
            'SELECT * FROM notifications WHERE id = ?',
            [insertedId]
        );
        
        res.status(201).json(insertedNotification.rows[0]);
    } catch (err) {
        console.error('Ошибка при создании уведомления:', err);
        res.status(500).json({ message: 'Ошибка при создании уведомления' });
    }
};

/**
 * Пометить уведомление как прочитанное
 */
const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.id;
        
        // Проверяем, принадлежит ли уведомление пользователю
        const notification = await db.query(
            'SELECT * FROM notifications WHERE id = ?',
            [notificationId]
        );
        
        if (notification.rows.length === 0) {
            return res.status(404).json({ message: 'Уведомление не найдено' });
        }
        
        if (notification.rows[0].user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Недостаточно прав' });
        }
        
        // Обновляем статус уведомления
        await db.query(
            'UPDATE notifications SET is_read = true WHERE id = ?',
            [notificationId]
        );
        
        // Get the updated notification
        const updatedNotification = await db.query(
            'SELECT * FROM notifications WHERE id = ?',
            [notificationId]
        );
        
        res.json(updatedNotification.rows[0]);
    } catch (err) {
        console.error('Ошибка при обновлении уведомления:', err);
        res.status(500).json({ message: 'Ошибка при обновлении уведомления' });
    }
};

/**
 * Удалить уведомление
 */
const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.id;
        
        // Проверяем, принадлежит ли уведомление пользователю
        const notification = await db.query(
            'SELECT * FROM notifications WHERE id = ?',
            [notificationId]
        );
        
        if (notification.rows.length === 0) {
            return res.status(404).json({ message: 'Уведомление не найдено' });
        }
        
        if (notification.rows[0].user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Недостаточно прав' });
        }
        
        // Удаляем уведомление
        await db.query(
            'DELETE FROM notifications WHERE id = ?',
            [notificationId]
        );
        
        res.json({ message: 'Уведомление успешно удалено' });
    } catch (err) {
        console.error('Ошибка при удалении уведомления:', err);
        res.status(500).json({ message: 'Ошибка при удалении уведомления' });
    }
};

module.exports = {
    getUserNotifications,
    createNotification,
    markAsRead,
    deleteNotification
}; 