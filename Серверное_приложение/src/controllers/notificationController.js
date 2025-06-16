/**
 * Контроллер для управления уведомлениями
 * @module notificationController
 */

const db = require('../db');
const pool = require('../config/database');

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
        
        // Преобразуем временные метки в удобочитаемый формат
        const formattedNotifications = notifications.rows.map(notification => {
            // Вычисляем относительное время
            const createdTime = new Date(notification.created_at);
            const now = new Date();
            const diffMs = now - createdTime;
            const diffSeconds = Math.floor(diffMs / 1000);
            const diffMinutes = Math.floor(diffSeconds / 60);
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            let timeText;
            if (diffSeconds < 60) {
                timeText = `${diffSeconds} секунд назад`;
                if (diffSeconds === 1) timeText = '1 секунду назад';
            } else if (diffMinutes < 60) {
                timeText = `${diffMinutes} минут назад`;
                if (diffMinutes === 1) timeText = '1 минуту назад';
                else if (diffMinutes < 5) timeText = `${diffMinutes} минуты назад`;
            } else if (diffHours < 24) {
                timeText = `${diffHours} часов назад`;
                if (diffHours === 1) timeText = '1 час назад';
                else if (diffHours < 5) timeText = `${diffHours} часа назад`;
            } else {
                timeText = `${diffDays} дней назад`;
                if (diffDays === 1) timeText = '1 день назад';
                else if (diffDays < 5) timeText = `${diffDays} дня назад`;
            }
            
            return {
                ...notification,
                time: timeText
            };
        });
        
        // Считаем количество непрочитанных уведомлений
        const unreadCount = notifications.rows.filter(note => !note.is_read).length;
        
        res.json({
            notifications: formattedNotifications,
            unreadCount
        });
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
 * Создать стандартное уведомление о новом отзыве для пользователя
 */
const createReviewNotification = async (userId, restaurantName) => {
    try {
        await db.query(
            'INSERT INTO notifications (user_id, message, type, is_read, created_at) VALUES (?, ?, ?, false, NOW())',
            [userId, `Ваш отзыв для ресторана ${restaurantName} был успешно опубликован!`, 'info']
        );
        return true;
    } catch (err) {
        console.error('Ошибка при создании уведомления о новом отзыве:', err);
        return false;
    }
};

/**
 * Создать уведомление для менеджера о новом отзыве на его ресторан
 */
const createManagerReviewNotification = async (restaurantName, restaurantId) => {
    try {
        // Получаем всех менеджеров, привязанных к ресторану
        const [managers] = await pool.query(
            'SELECT id FROM users WHERE role = "manager" AND restaurant_id = ?',
            [restaurantId]
        );
        
        if (managers.length === 0) {
            console.log(`Для ресторана ${restaurantName} (ID: ${restaurantId}) не найдены менеджеры`);
            return false;
        }
        
        // Создаем уведомление для каждого менеджера
        for (const manager of managers) {
            await db.query(
                'INSERT INTO notifications (user_id, message, type, is_read, created_at) VALUES (?, ?, ?, false, NOW())',
                [manager.id, `Новый отзыв на ваш ресторан ${restaurantName}`, 'info']
            );
        }
        
        return true;
    } catch (err) {
        console.error('Ошибка при создании уведомления для менеджера о новом отзыве:', err);
        return false;
    }
};

/**
 * Создать стандартное уведомление об обновлении профиля
 */
const createProfileUpdateNotification = async (userId) => {
    try {
        // Проверяем, существует ли функция запроса и таблица уведомлений
        const checkTable = async () => {
            try {
                await db.query('SELECT 1 FROM notifications LIMIT 1');
                return true;
            } catch (err) {
                console.warn('Таблица notifications не существует или не доступна:', err.message);
                return false;
            }
        };
        
        // Если таблица существует, добавляем уведомление
        if (await checkTable()) {
            await db.query(
                'INSERT INTO notifications (user_id, message, type, is_read, created_at) VALUES (?, ?, ?, false, NOW())',
                [userId, 'Обновление профиля', 'success']
            );
            return true;
        } else {
            console.warn('Пропуск создания уведомления - таблица не существует');
            return false;
        }
    } catch (err) {
        console.error('Ошибка при создании уведомления об обновлении профиля:', err);
        return false;
    }
};

/**
 * Создать стандартное уведомление с просьбой оценить доставку
 */
const createDeliveryRatingNotification = async (userId, restaurantName) => {
    try {
        await db.query(
            'INSERT INTO notifications (user_id, message, type, is_read, created_at) VALUES (?, ?, ?, false, NOW())',
            [userId, `Оцените доставку ресторана ${restaurantName}`, 'info']
        );
        return true;
    } catch (err) {
        console.error('Ошибка при создании уведомления об оценке доставки:', err);
        return false;
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
        
        // Получаем обновленное уведомление
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

/**
 * Отправить уведомление с просьбой оценить доставку
 */
const sendDeliveryRatingRequest = async (req, res) => {
    try {
        const { restaurantName } = req.body;
        const userId = req.user.id;
        
        if (!restaurantName) {
            return res.status(400).json({ message: 'Название ресторана обязательно' });
        }
        
        // Создаем уведомление для пользователя
        const result = await createDeliveryRatingNotification(userId, restaurantName);
        
        if (!result) {
            return res.status(500).json({ message: 'Не удалось создать уведомление' });
        }
        
        res.status(201).json({ message: 'Уведомление успешно отправлено' });
    } catch (err) {
        console.error('Ошибка при отправке уведомления о доставке:', err);
        res.status(500).json({ message: 'Ошибка сервера при отправке уведомления' });
    }
};

/**
 * Удалить все уведомления пользователя
 */
const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Удаляем все уведомления пользователя
        await db.query(
            'DELETE FROM notifications WHERE user_id = ?',
            [userId]
        );
        
        res.json({ message: 'Все уведомления успешно удалены' });
    } catch (err) {
        console.error('Ошибка при удалении уведомлений:', err);
        res.status(500).json({ message: 'Ошибка при удалении уведомлений' });
    }
};

module.exports = {
    getUserNotifications,
    createNotification,
    markAsRead,
    deleteNotification,
    createReviewNotification,
    createManagerReviewNotification,
    createProfileUpdateNotification,
    createDeliveryRatingNotification,
    sendDeliveryRatingRequest,
    clearAllNotifications
}; 