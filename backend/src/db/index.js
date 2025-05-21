/**
 * Модуль базы данных
 * Обеспечивает совместимость с ожиданием интерфейса PostgreSQL в коде, ожидающего PostgreSQL-стиль интерфейса
 */

const pool = require('../config/database');

/**
 * Выполнение SQL-запроса с параметрами
 * @param {string} text - Текст SQL-запроса
 * @param {Array} params - Параметры запроса
 * @returns {Promise<Object>} - Объект результата запроса с свойством rows
 */
const query = async (text, params) => {
  try {
    // Выполнение запроса с использованием пула MySQL
    const [rows] = await pool.execute(text, params);
    
    // Возвращение в формате, совместимом с pg-стилем результата
    return {
      rows: rows || []
    };
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
    throw error;
  }
};

module.exports = {
  query
}; 