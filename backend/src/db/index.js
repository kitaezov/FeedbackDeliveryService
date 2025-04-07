/**
 * Database Helper Module
 * Wraps the MySQL connection pool for compatibility with code expecting a PostgreSQL-style interface
 */

const pool = require('../config/database');

/**
 * Execute a SQL query with parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result object with rows property
 */
const query = async (text, params) => {
  try {
    // Execute the query using the MySQL pool
    const [rows] = await pool.execute(text, params);
    
    // Return in a format compatible with pg style result
    return {
      rows: rows || []
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

module.exports = {
  query
}; 