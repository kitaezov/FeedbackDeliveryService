const pool = require('./config/database');

async function fixDatabase() {
  console.log('Starting database fix script...');

  try {
    // Check if response column exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'reviews' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME = 'response'
    `);

    if (columns.length === 0) {
      console.log('Adding missing "response" column to reviews table');
      await pool.query(`
        ALTER TABLE reviews 
        ADD COLUMN response TEXT NULL
      `);
      console.log('Column "response" successfully added to reviews table');
    } else {
      console.log('Column "response" already exists');
    }

    // Check other needed columns
    const columnsToCheck = [
      { name: 'response_date', type: 'TIMESTAMP NULL' },
      { name: 'responded_by', type: 'INT NULL' },
      { name: 'manager_name', type: 'VARCHAR(100) NULL' }
    ];

    for (const column of columnsToCheck) {
      const [exists] = await pool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'reviews' 
        AND TABLE_SCHEMA = DATABASE()
        AND COLUMN_NAME = ?
      `, [column.name]);

      if (exists.length === 0) {
        console.log(`Adding missing "${column.name}" column to reviews table`);
        await pool.query(`
          ALTER TABLE reviews 
          ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`Column "${column.name}" successfully added`);
      } else {
        console.log(`Column "${column.name}" already exists`);
      }
    }

    console.log('Database fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database:', error);
    process.exit(1);
  }
}

fixDatabase(); 