

const database = require('./database');

module.exports = {
  database,
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_key',
  serverPort: process.env.PORT || 3000,
}; 