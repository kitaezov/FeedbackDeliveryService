/**
 * Create Restaurants Table Script
 * Runs the restaurants.sql migration file to create the missing restaurants table
 */

require('dotenv').config({ path: '../../.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function createRestaurantsTable() {
  try {
    console.log('Creating restaurants table...');
    
    // Read the restaurants.sql file
    const migrationPath = path.join(__dirname, '../db/migrations/restaurants.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL file into individual statements
    const statements = migrationSql
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // Execute each statement
    for (let statement of statements) {
      statement = statement.trim();
      if (statement) {
        try {
          await pool.query(statement);
          console.log('Executed statement successfully');
        } catch (err) {
          console.log('Error executing statement:', err.message);
          console.log('Statement:', statement);
          // Continue execution despite errors
        }
      }
    }
    
    console.log('Restaurants table creation completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating restaurants table:', error);
    process.exit(1);
  }
}

createRestaurantsTable(); 