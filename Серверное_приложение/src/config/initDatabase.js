const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function checkIfTableExists(tableName) {
    try {
        const [rows] = await pool.execute(`
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = ?
        `, [tableName]);
        return rows.length > 0;
    } catch (error) {
        console.error(`Error checking if table ${tableName} exists:`, error);
        return false;
    }
}

async function initializeDatabase() {
    try {
        console.log('Starting database initialization...');

        // Check if reviews table already exists
        const reviewsTableExists = await checkIfTableExists('reviews');
        
        if (reviewsTableExists) {
            console.log('Reviews table already exists, skipping full initialization');
            
            // Only initialize tables that might be missing
            // We can still create other tables that might not exist yet
            await ensureOtherTablesExist();
            
            return;
        }

        // If reviews table doesn't exist, proceed with full initialization
        // Чтение SQL файла
        const sqlPath = path.join(__dirname, 'init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Разделение SQL файла на отдельные команды
        const commands = sql.split(';').filter(cmd => cmd.trim());

        // Выполнение каждой команды последовательно
        for (const command of commands) {
            if (command.trim()) {
                await pool.execute(command);
            }
        }

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Ensure that other necessary tables exist without recreating existing ones
async function ensureOtherTablesExist() {
    try {
        // Check and create notifications table if it doesn't exist
        const notificationsExists = await checkIfTableExists('notifications');
        if (!notificationsExists) {
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    message TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
        }

        // Check and create review_photos table if it doesn't exist
        const reviewPhotosExists = await checkIfTableExists('review_photos');
        if (!reviewPhotosExists) {
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS review_photos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    review_id INT NOT NULL,
                    photo_url VARCHAR(255) NOT NULL,
                    is_receipt BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
                )
            `);
        }

        // Check and create review_votes table if it doesn't exist
        const reviewVotesExists = await checkIfTableExists('review_votes');
        if (!reviewVotesExists) {
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS review_votes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    review_id INT NOT NULL,
                    user_id INT NOT NULL,
                    vote_type ENUM('up', 'down') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_review_vote (review_id, user_id),
                    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
        }
    } catch (error) {
        console.error('Error ensuring other tables exist:', error);
        throw error;
    }
}

// Экспорт функции для использования в других файлах
module.exports = initializeDatabase;

// Если скрипт запущен напрямую, выполняем инициализацию
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Database initialization completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('Database initialization failed:', error);
            process.exit(1);
        });
} 