/**
 * User Model
 * Handles all database operations related to users
 */

const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
    /**
     * Create a new user
     * @param {Object} userData - User data (name, email, password)
     * @returns {Promise<Object>} - Created user info
     */
    async create(userData) {
        const { name, email, password } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'user']
        );
        
        // Получаем пользователя с датой создания
        const [userRows] = await pool.execute(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [result.insertId]
        );
        
        return userRows[0] || {
            id: result.insertId,
            name,
            email,
            role: 'user',
            created_at: new Date()
        };
    }
    
    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>} - User object or null
     */
    async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Find user by ID
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} - User object or null
     */
    async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Update user info
     * @param {number} id - User ID
     * @param {Object} userData - User data to update
     * @returns {Promise<boolean>} - Success status
     */
    async update(id, userData) {
        try {
            const { name, email, password, phoneNumber, birthDate } = userData;
            console.log('UserModel.update - Входные данные:', JSON.stringify(userData, null, 2));
            console.log('UserModel.update - Извлеченные поля:');
            console.log('- phoneNumber:', phoneNumber);
            console.log('- birthDate:', birthDate);
            
            // Build the update query dynamically based on provided fields
            let queryParts = [];
            let params = [];
            
            if (name !== undefined) {
                queryParts.push('name = ?');
                params.push(name);
            }
            
            if (email !== undefined) {
                queryParts.push('email = ?');
                params.push(email);
            }
            
            if (password !== undefined) {
                queryParts.push('password = ?');
                params.push(password);
            }
            
            if (phoneNumber !== undefined) {
                queryParts.push('phone_number = ?');
                params.push(phoneNumber);
                console.log('UserModel.update - Добавлен параметр phone_number:', phoneNumber);
            }
            
            if (birthDate !== undefined) {
                queryParts.push('birth_date = ?');
                params.push(birthDate);
                console.log('UserModel.update - Добавлен параметр birth_date:', birthDate);
            }
            
            // If no fields to update, return
            if (queryParts.length === 0) {
                console.log('UserModel.update - Нет полей для обновления');
                return false;
            }
            
            // Complete the query with parameters
            const query = `UPDATE users SET ${queryParts.join(', ')} WHERE id = ?`;
            params.push(id);
            
            console.log('UserModel.update - SQL запрос:', query);
            console.log('UserModel.update - Параметры:', params);
            
            // Execute update query
            const [result] = await pool.execute(query, params);
            console.log('UserModel.update - Результат обновления:', result);
            
            // Get updated user data
            const [rows] = await pool.execute(
                'SELECT id, name, email, role, created_at, avatar, phone_number as phoneNumber, birth_date as birthDate FROM users WHERE id = ?',
                [id]
            );
            
            console.log('UserModel.update - Полученные данные:', rows.length > 0 ? JSON.stringify(rows[0], null, 2) : 'нет данных');
            
            return rows[0] || null;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
    
    /**
     * Update user password
     * @param {number} id - User ID
     * @param {string} password - New password
     * @returns {Promise<boolean>} - Success status
     */
    async updatePassword(id, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        
        return true;
    }

    /**
     * Update user role
     * @param {number} id - User ID
     * @param {string} role - New role ('user', 'manager', 'admin', 'head_admin')
     * @returns {Promise<boolean>} - Success status
     */
    async updateRole(id, role) {
        try {
            console.log(`UserModel: Updating user ${id} role to "${role}"`);
            
            // Ensure role is one of the valid roles
            const validRoles = ['user', 'manager', 'admin', 'head_admin'];
            if (!validRoles.includes(role)) {
                console.error(`UserModel: Invalid role value: "${role}"`);
                throw new Error('Invalid role value');
            }
            
            // Check if the user exists before updating
            const [userCheck] = await pool.execute(
                'SELECT id FROM users WHERE id = ?',
                [id]
            );
            
            if (userCheck.length === 0) {
                console.error(`UserModel: User with ID ${id} not found`);
                throw new Error(`User with ID ${id} not found`);
            }
            
            console.log(`UserModel: Executing SQL to update role`);
            const [result] = await pool.execute(
                'UPDATE users SET role = ? WHERE id = ?',
                [role, id]
            );
            
            console.log(`UserModel: Role update result:`, result);
            
            if (result.affectedRows === 0) {
                console.error(`UserModel: No rows were affected`);
                throw new Error('Role update failed, no rows affected');
            }
            
            console.log(`UserModel: Role successfully updated`);
            return true;
        } catch (error) {
            console.error(`UserModel: Error in updateRole:`, error);
            throw error;
        }
    }

    /**
     * Get all users with optional filtering
     * @param {Object} options - Filter options
     * @returns {Promise<Array>} - List of users
     */
    async getAll(options = {}) {
        try {
            console.log('UserModel.getAll: Получение списка пользователей');
            const { role } = options;
            
            // Ensure limit and offset are valid positive integers
            let limit = parseInt(options.limit || 50, 10);
            let offset = parseInt(options.offset || 0, 10);
            
            // Validate values
            if (isNaN(limit) || limit <= 0) limit = 50;
            if (isNaN(offset) || offset < 0) offset = 0;
            
            // Cap maximum limit
            if (limit > 1000) limit = 1000;
            
            let query = 'SELECT id, name, email, role, created_at, is_blocked, blocked_reason FROM users';
            let queryParams = [];
            
            if (role) {
                query += ' WHERE role = ?';
                queryParams.push(role);
            }
            
            // MySQL2 doesn't handle ? placeholders correctly for LIMIT OFFSET
            // Using direct integer values is safe here since we've validated them above
            query += ` ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
            
            console.log('Выполнение SQL-запроса:', query);
            console.log('Параметры:', queryParams);
            
            // Check database connection
            console.log('Проверка соединения с базой данных...');
            if (!pool) {
                console.error('Ошибка: Отсутствует соединение с базой данных');
                throw new Error('Database connection not available');
            }
            
            const [rows] = await pool.execute(query, queryParams);
            console.log(`Получено ${rows.length} пользователей из базы данных`);
            
            return rows;
        } catch (error) {
            console.error('UserModel.getAll ошибка:', error);
            throw error;
        }
    }

    /**
     * Ensure head admin exists (admin@yandex.ru)
     * This method will create or update the user with email admin@yandex.ru to have head_admin role
     * @returns {Promise<Object>} - Head admin user data
     */
    async ensureHeadAdmin() {
        try {
            // Check if head admin exists
            const headAdmin = await this.findByEmail('admin@yandex.ru');
            
            if (headAdmin) {
                // If exists but not head_admin role, update role
                if (headAdmin.role !== 'head_admin') {
                    await this.updateRole(headAdmin.id, 'head_admin');
                    console.log('Updated admin@yandex.ru to head_admin role');
                }
                return headAdmin;
            } else {
                // Create head admin if doesn't exist
                const hashedPassword = await bcrypt.hash('admin123', 10); // Default password
                
                const [result] = await pool.execute(
                    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                    ['Head Admin', 'admin@yandex.ru', hashedPassword, 'head_admin']
                );
                
                console.log('Created head_admin user: admin@yandex.ru');
                
                const [userRows] = await pool.execute(
                    'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
                    [result.insertId]
                );
                
                return userRows[0] || {
                    id: result.insertId,
                    name: 'Head Admin',
                    email: 'admin@yandex.ru',
                    role: 'head_admin',
                    created_at: new Date()
                };
            }
        } catch (error) {
            console.error('Error ensuring head admin exists:', error);
            throw error;
        }
    }

    /**
     * Block user account
     * @param {number} id - User ID
     * @param {string} reason - Reason for blocking the account
     * @returns {Promise<boolean>} - Success status
     */
    async blockUser(id, reason) {
        await pool.execute(
            'UPDATE users SET is_blocked = 1, blocked_reason = ? WHERE id = ?',
            [reason, id]
        );
        
        return true;
    }
    
    /**
     * Unblock user account
     * @param {number} id - User ID
     * @returns {Promise<boolean>} - Success status
     */
    async unblockUser(id) {
        await pool.execute(
            'UPDATE users SET is_blocked = 0, blocked_reason = NULL WHERE id = ?',
            [id]
        );
        
        return true;
    }
    
    /**
     * Check if user account is blocked
     * @param {number} id - User ID
     * @returns {Promise<Object>} - Object with isBlocked and reason properties
     */
    async checkBlockStatus(id) {
        const [rows] = await pool.execute(
            'SELECT is_blocked, blocked_reason FROM users WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) {
            return { isBlocked: false, reason: null };
        }
        
        return { 
            isBlocked: rows[0].is_blocked === 1, 
            reason: rows[0].blocked_reason 
        };
    }

    /**
     * Update user avatar
     * @param {number} id - User ID
     * @param {string|null} avatarPath - Path to avatar or null to remove avatar
     * @returns {Promise<boolean>} - Success status
     */
    async updateAvatar(id, avatarPath) {
        try {
            // Выполняем SQL запрос для обновления пути к аватару
            await pool.execute(
                'UPDATE users SET avatar = ? WHERE id = ?',
                [avatarPath, id]
            );
            
            // Получаем обновленные данные пользователя для подтверждения
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error updating user avatar:', error);
            throw error;
        }
    }

    /**
     * Update user's total likes count based on their reviews
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} - Success status
     */
    async updateLikesCount(userId) {
        // First calculate the total likes from all user's reviews
        const [likesResult] = await pool.execute(
            'SELECT COALESCE(SUM(likes), 0) as total_likes FROM reviews WHERE user_id = ?',
            [userId]
        );
        
        const totalLikes = likesResult[0]?.total_likes || 0;
        
        // Update the user's total_likes field
        await pool.execute(
            'UPDATE users SET total_likes = ?, updated_at = NOW() WHERE id = ?',
            [totalLikes, userId]
        );
        
        return true;
    }

    /**
     * Ensure default users exist in the database
     * This method creates default users if the database is empty
     * @returns {Promise<boolean>} - Success status
     */
    async ensureDefaultUsers() {
        try {
            console.log('UserModel: Проверка наличия пользователей в системе...');
            
            // Check if any users exist
            const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
            const userCount = rows[0].count;
            
            console.log(`UserModel: Текущее количество пользователей в системе: ${userCount}`);
            
            if (userCount === 0) {
                console.log('UserModel: Пользователи не найдены. Создание демонстрационных пользователей...');
                
                // Create demo admin (In addition to head admin that is created separately)
                const adminPassword = await bcrypt.hash('admin123', 10);
                await pool.execute(
                    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                    ['Администратор', 'admin@example.com', adminPassword, 'admin']
                );
                console.log('UserModel: Создан пользователь admin@example.com с ролью admin');
                
                // Create demo manager
                const managerPassword = await bcrypt.hash('manager123', 10);
                await pool.execute(
                    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                    ['Менеджер', 'manager@example.com', managerPassword, 'manager']
                );
                console.log('UserModel: Создан пользователь manager@example.com с ролью manager');
                
                // Create demo user
                const userPassword = await bcrypt.hash('user123', 10);
                await pool.execute(
                    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                    ['Пользователь', 'user@example.com', userPassword, 'user']
                );
                console.log('UserModel: Создан пользователь user@example.com с ролью user');
                
                return true;
            }
            
            console.log('UserModel: В системе уже есть пользователи, создание демонстрационных пользователей не требуется');
            return false;
        } catch (error) {
            console.error('UserModel: Ошибка при создании демонстрационных пользователей:', error);
            throw error;
        }
    }
}

module.exports = new UserModel(); 