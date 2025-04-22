/**
 * Main configuration file
 * Exports all configuration settings for the application
 */

const database = require('./database');

module.exports = {
  database,
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_key',
  serverPort: process.env.PORT || 3000,
  // Add any other configuration settings here
}; 