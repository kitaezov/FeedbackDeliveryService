/**
 * Утилита обработки ошибок
 * Предоставляет стандартизированную обработку ошибок для API-ответов
 */

/**
 * Обработка ошибок API со стандартизированным форматом ответа
 * @param {Object} res - Объект ответа Express
 * @param {string} message - Понятное пользователю сообщение об ошибке
 * @param {number} statusCode - HTTP код статуса
 * @param {Error} error - Оригинальный объект ошибки
 * @returns {Object} - JSON ответ с деталями ошибки
 */
const errorHandler = (res, message, statusCode = 500, error = null) => {
    // Логируем детали ошибки в консоль для отладки
    console.error(`Ошибка API (${statusCode}): ${message}`);
    if (error) {
        console.error('Оригинальная ошибка:', error);
    }
    
    // Отправляем стандартизированный ответ с ошибкой
    return res.status(statusCode).json({
        success: false,
        message: message,
        details: error?.message || 'Дополнительные детали отсутствуют',
        timestamp: new Date().toISOString()
    });
};

module.exports = errorHandler; 