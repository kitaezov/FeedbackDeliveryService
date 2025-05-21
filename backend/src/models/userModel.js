/**
 * Модель пользователя
 * Обрабатывает все операции с базой данных, связанные с пользователями
 */

const pool = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Класс для работы с пользователями
 */
class UserModel {
    /**
     * Создать нового пользователя
     * @param {Object} userData - Данные пользователя (имя, email, пароль)
     * @returns {Promise<Object>} - Информация о созданном пользователе
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
     * Найти пользователя по email
     * @param {string} email - Email пользователя
     * @returns {Promise<Object|null>} - Объект пользователя или null
     */
    async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Найти пользователя по ID
     * @param {number} id - ID пользователя
     * @returns {Promise<Object|null>} - Объект пользователя или null
     */
    async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) return null;
        
        // Преобразование значений ролей из базы данных в значения для фронтенда
        const roleMapping = {
            'user': 'user',
            'mgr': 'manager',
            'admin': 'admin',
            'head': 'head_admin'
        };
        
        const user = rows[0];
        user.role = roleMapping[user.role] || user.role;
        
        return user;
    }
    
    /**
     * Обновить информацию о пользователе
     * @param {number} id - ID пользователя
     * @param {Object} userData - Данные пользователя для обновления
     * @returns {Promise<boolean>} - Результат обновления
     */
    async update(id, userData) {
        try {
            const { name, email, password, phoneNumber, birthDate } = userData;
            console.log('UserModel.update - Входные данные:', JSON.stringify(userData, null, 2));
            console.log('UserModel.update - Извлеченные поля:');
            console.log('- phoneNumber:', phoneNumber);
            console.log('- birthDate:', birthDate);
            
            // Динамическое построение запроса на обновление на основе предоставленных полей
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
            
            // Если нет полей для обновления, возвращаем false
            if (queryParts.length === 0) {
                console.log('UserModel.update - Нет полей для обновления');
                return false;
            }
            
            // Завершаем формирование запроса с параметрами
            const query = `UPDATE users SET ${queryParts.join(', ')} WHERE id = ?`;
            params.push(id);
            
            console.log('UserModel.update - SQL запрос:', query);
            console.log('UserModel.update - Параметры:', params);
            
            // Выполняем запрос на обновление
            const [result] = await pool.execute(query, params);
            console.log('UserModel.update - Результат обновления:', result);
            
            // Получаем обновленные данные пользователя
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
     * Обновить пароль пользователя
     * @param {number} id - ID пользователя
     * @param {string} password - Новый пароль
     * @returns {Promise<boolean>} - Результат обновления
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
     * Обновить роль пользователя
     * @param {number} id - ID пользователя
     * @param {string} role - Новая роль ('user', 'manager', 'admin', 'head_admin')
     * @returns {Promise<boolean>} - Результат обновления
     */
    async updateRole(id, role) {
        try {
            console.log(`UserModel: Updating user ${id} role to "${role}"`);
            
            // Преобразование полных названий ролей в короткие для хранения в базе данных
            const roleMapping = {
                'user': 'user',
                'manager': 'manager',  // Изменено с 'mgr' на 'manager'
                'admin': 'admin',
                'head_admin': 'head_admin'  // Изменено с 'head' на 'head_admin'
            };
            
            const dbRole = roleMapping[role] || 'user';
            console.log(`UserModel: Mapped role "${role}" to database value "${dbRole}"`);
            
            // Проверяем существование пользователя перед обновлением
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
                [dbRole, id]
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
     * Получить всех пользователей с опциональной фильтрацией
     * @param {Object} options - Параметры фильтрации
     * @returns {Promise<Array>} - Список пользователей
     */
    async getAll(options = {}) {
        try {
            console.log('UserModel.getAll: Получение списка пользователей');
            const { role } = options;
            
            // Убедиться, что limit и offset являются корректными положительными целыми числами
            let limit = parseInt(options.limit || 50, 10);
            let offset = parseInt(options.offset || 0, 10);
            
            // Проверка значений
            if (isNaN(limit) || limit <= 0) limit = 50;
            if (isNaN(offset) || offset < 0) offset = 0;
            
            // Ограничение максимального лимита
            if (limit > 1000) limit = 1000;
            
            let query = 'SELECT id, name, email, role, created_at, is_blocked, blocked_reason FROM users';
            let queryParams = [];
            
            if (role) {
                query += ' WHERE role = ?';
                queryParams.push(role);
            }
            
            // MySQL2 не обрабатывает placeholders ? корректно для LIMIT OFFSET
            // Использование прямых числовых значений безопасно, так как мы проверили их выше
            query += ` ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
            
            console.log('Выполнение SQL-запроса:', query);
            console.log('Параметры:', queryParams);
            
            // Проверка соединения с базой данных
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
     * Убедиться, что в системе существует главный администратор
     * @returns {Promise<void>}
     */
    async ensureHeadAdmin() {
        try {
            // Проверяем существование главного администратора
            const headAdmin = await this.findByEmail('admin@yandex.ru');
            
            if (headAdmin) {
                // Если существует, но не имеет роль head_admin, обновляем роль
                if (headAdmin.role !== 'head_admin') {
                    await this.updateRole(headAdmin.id, 'head_admin');
                    console.log('Updated admin@yandex.ru to head_admin role');
                }
                return headAdmin;
            } else {
                // Создаем главного администратора, если он не существует
                const hashedPassword = await bcrypt.hash('admin123', 10); // Пароль по умолчанию
                
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
     * Заблокировать пользователя
     * @param {number} id - ID пользователя
     * @param {string} reason - Причина блокировки
     * @returns {Promise<boolean>} - Результат блокировки
     */
    async blockUser(id, reason) {
        await pool.execute(
            'UPDATE users SET is_blocked = 1, blocked_reason = ? WHERE id = ?',
            [reason, id]
        );
        
        return true;
    }
    
    /**
     * Разблокировать пользователя
     * @param {number} id - ID пользователя
     * @returns {Promise<boolean>} - Результат разблокировки
     */
    async unblockUser(id) {
        await pool.execute(
            'UPDATE users SET is_blocked = 0, blocked_reason = NULL WHERE id = ?',
            [id]
        );
        
        return true;
    }
    
    /**
     * Проверить статус блокировки пользователя
     * @param {number} id - ID пользователя
     * @returns {Promise<Object>} - Статус блокировки
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
     * Обновить аватар пользователя
     * @param {number} id - ID пользователя
     * @param {string} avatarPath - Путь к файлу аватара
     * @returns {Promise<boolean>} - Результат обновления
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
     * Обновить количество лайков пользователя
     * @param {number} userId - ID пользователя
     * @returns {Promise<boolean>} - Результат обновления
     */
    async updateLikesCount(userId) {
        // Сначала вычисляем общее количество лайков из всех отзывов пользователя
        const [likesResult] = await pool.execute(
            'SELECT COALESCE(SUM(likes), 0) as total_likes FROM reviews WHERE user_id = ?',
            [userId]
        );
        
        const totalLikes = likesResult[0]?.total_likes || 0;
        
        // Обновляем поле total_likes пользователя
        await pool.execute(
            'UPDATE users SET total_likes = ?, updated_at = NOW() WHERE id = ?',
            [totalLikes, userId]
        );
        
        return true;
    }

    /**
     * Создать пользователя (альтернативный метод)
     * @param {Object} userData - Данные пользователя
     * @returns {Promise<Object>} - Созданный пользователь
     */
    async createUser(userData) {
        const { name, email, password, role } = userData;
        
        try {
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, password, role]
            );
            
            // Получаем созданного пользователя с временной меткой
            const [userRows] = await pool.execute(
                'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
                [result.insertId]
            );
            
            return userRows[0] || {
                id: result.insertId,
                name,
                email,
                role,
                created_at: new Date()
            };
        } catch (error) {
            console.error('Error creating user with role:', error);
            throw error;
        }
    }

    /**
     * Убедиться, что в системе существуют пользователи по умолчанию
     * @returns {Promise<void>}
     */
    async ensureDefaultUsers() {
        try {
            // Проверяем, есть ли уже пользователи
            const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
            
            // Сначала проверяем существующих пользователей
            console.log('Checking existing users and roles...');
            const [allUsers] = await pool.execute('SELECT id, name, email, role FROM users');
            console.log(`Found ${allUsers.length} existing users:`);
            allUsers.forEach(user => {
                console.log(`- User: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
            });
            
            // Определяем пользователей по умолчанию
            const defaultUsers = [
                {
                    name: 'Test User',
                    email: 'user@example.com',
                    password: 'password123',
                    role: 'user'
                },
                {
                    name: 'Test Manager',
                    email: 'manager@example.com',
                    password: 'password123',
                    role: 'manager'
                },
                {
                    name: 'Test Admin',
                    email: 'admin@example.com',
                    password: 'password123',
                    role: 'admin'
                },
                {
                    name: 'Test Head Admin',
                    email: 'head_admin@example.com',
                    password: 'password123',
                    role: 'head_admin'
                }
            ];
            
            // Убеждаемся, что каждый пользователь по умолчанию существует
            for (const userData of defaultUsers) {
                // Проверяем, существует ли пользователь по email
                const [existingUser] = await pool.execute(
                    'SELECT id, name, email, role FROM users WHERE email = ?', 
                    [userData.email]
                );
                
                if (existingUser.length === 0) {
                    console.log(`Creating default user: ${userData.name} (${userData.email})`);
                    
                    // Хешируем пароль
                    const hashedPassword = await bcrypt.hash(userData.password, 10);
                    
                    // Преобразуем роль для хранения в базе данных
                    const roleMapping = {
                        'user': 'user',
                        'manager': 'manager',
                        'admin': 'admin',
                        'head_admin': 'head_admin'
                    };
                    
                    const dbRole = roleMapping[userData.role] || 'user';
                    
                    // Добавляем пользователя
                    await pool.execute(
                        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                        [userData.name, userData.email, hashedPassword, dbRole]
                    );
                    
                    console.log(`User ${userData.email} created with role ${dbRole}`);
                } else {
                    console.log(`User already exists: ${userData.email}`);
                }
            }
            
            console.log('Default user check completed');
        } catch (error) {
            console.error('Error ensuring default users:', error);
        }
    }

    /**
     * Сбросить пароль пользователя по email
     * @param {string} email - Email пользователя
     * @param {string} newPassword - Новый пароль
     * @returns {Promise<boolean>} - Результат сброса пароля
     */
    async resetPasswordByEmail(email, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            console.log(`Resetting password for user with email: ${email}`);
            
            const [result] = await pool.execute(
                'UPDATE users SET password = ? WHERE email = ?',
                [hashedPassword, email]
            );
            
            if (result.affectedRows === 0) {
                console.log(`Password reset failed: No user found with email ${email}`);
                return false;
            }
            
            console.log(`Password reset successful for user: ${email}`);
            return true;
        } catch (error) {
            console.error('Error resetting password:', error);
            return false;
        }
    }
}

module.exports = new UserModel(); 