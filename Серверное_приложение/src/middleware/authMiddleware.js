/**
 * Промежуточное ПО (Middleware) аутентификации и авторизации
 * 
 * Данный модуль отвечает за:
 * - Проверку JWT-токенов для аутентификации пользователей
 * - Управление доступом на основе ролей пользователей
 * - Защиту маршрутов API от несанкционированного доступа
 */

const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

/**
 * Проверяет JWT-токен и добавляет данные пользователя в объект запроса
 * 
 * Извлекает токен из заголовка Authorization, проверяет его
 * действительность и находит соответствующего пользователя в базе данных.
 * 
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 * @param {Function} next - Функция перехода к следующему middleware
 * @returns {Object|void} Возвращает ответ с ошибкой или вызывает next()
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Получаем заголовок авторизации
        const authHeader = req.headers['authorization'];
        console.log('Auth header:', authHeader ? `${authHeader.substr(0, 20)}...` : 'отсутствует');
        
        const token = authHeader && authHeader.split(' ')[1];
        
        // Проверяем наличие токена
        if (!token) {
            console.log('Токен отсутствует');
            return res.status(401).json({
                message: 'Требуется авторизация',
                details: 'Токен доступа отсутствует'
            });
        }
        
        // Проверяем действительность токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Декодированный токен:', decoded);
        
        // Получаем пользователя из базы данных
        const user = await userModel.findById(decoded.userId);
        console.log('Пользователь найден:', user ? `ID: ${user.id}, роль: ${user.role}` : 'не найден');
        
        // Проверяем существование пользователя
        if (!user) {
            console.log('Пользователь не найден');
            return res.status(401).json({
                message: 'Требуется авторизация',
                details: 'Пользователь не найден'
            });
        }
        
        // Добавляем данные пользователя в объект запроса
        req.user = {
            id: user.id,
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        
        console.log('Аутентификация успешна, переход к следующему middleware');
        // Передаем управление следующему middleware
        next();
    } catch (error) {
        // Обрабатываем ошибки проверки токена
        console.error('Ошибка аутентификации:', error);
        return res.status(401).json({
            message: 'Требуется авторизация',
            details: 'Недействительный токен доступа'
        });
    }
};

/**
 * Проверяет наличие у пользователя необходимой роли для доступа
 * 
 * Может принимать как одну роль, так и массив допустимых ролей.
 * Реализует иерархию ролей: head_admin > admin > manager > user
 * 
 * @param {string|Array} requiredRole - Требуемая роль или массив ролей
 * @returns {Function} Middleware-функция Express для проверки роли
 */
const checkRole = (requiredRole) => {
    return (req, res, next) => {
        // Логирование для отладки
        console.log('Checking role:', {
            requiredRole,
            userRole: req?.user?.role,
            userId: req?.user?.id
        });
        
        // Сначала проверяем, аутентифицирован ли пользователь
        if (!req.user) {
            console.log('User not authenticated');
            return res.status(401).json({
                message: 'Требуется авторизация',
                details: 'Пользователь не аутентифицирован'
            });
        }
        
        // Определяем иерархию ролей и их уровни доступа
        const roleHierarchy = {
            'head_admin': 100,
            'admin': 80,
            'manager': 50,
            'user': 10,
            'moderator': 50,  // Для совместимости со старыми ролями
            'super_admin': 100, // Для совместимости со старыми ролями
            'глав_админ': 100,  // Для совместимости с русскими именами ролей
            'менеджер': 50,     // Для совместимости с русскими именами ролей
            'модератор': 50     // Для совместимости с русскими именами ролей
        };
        
        // Получаем уровень доступа текущего пользователя
        const userRoleLevel = roleHierarchy[req.user.role] || 0;
        console.log(`User role level: ${userRoleLevel} (${req.user.role})`);
        
        // Если requiredRole - массив, обрабатываем его
        if (Array.isArray(requiredRole)) {
            // Находим максимальный уровень доступа из требуемых ролей
            const requiredLevels = requiredRole.map(role => roleHierarchy[role] || 0);
            const minimumRequiredLevel = Math.min(...requiredLevels);
            
            console.log(`Required levels: ${JSON.stringify(requiredLevels)}, Minimum: ${minimumRequiredLevel}`);
            
            // Проверяем, удовлетворяет ли уровень пользователя минимальному требуемому уровню
            if (userRoleLevel < minimumRequiredLevel) {
                console.log('Access denied: insufficient role level (array check)');
                return res.status(403).json({
                    message: 'Доступ запрещен',
                    details: 'У вас нет необходимых прав для выполнения этого действия'
                });
            }
        } else {
            // Если requiredRole - строка, проверяем, достаточно ли у пользователя прав
            const requiredLevel = roleHierarchy[requiredRole] || 0;
            
            console.log(`Required level: ${requiredLevel} (${requiredRole})`);
            
            if (userRoleLevel < requiredLevel) {
                console.log('Access denied: insufficient role level (string check)');
                return res.status(403).json({
                    message: 'Доступ запрещен',
                    details: 'У вас нет необходимых прав для выполнения этого действия'
                });
            }
        }
        
        // Если все проверки пройдены, передаем управление следующему middleware
        console.log('Role check passed, proceeding to next middleware');
        next();
    };
};

/**
 * Middleware для проверки, является ли пользователь администратором
 * 
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 * @param {Function} next - Функция перехода к следующему middleware
 * @returns {Object|void} Возвращает ответ с ошибкой или вызывает next()
 */
const isAdmin = (req, res, next) => {
    // Сначала проверяем, аутентифицирован ли пользователь
    if (!req.user) {
        return res.status(401).json({
            message: 'Требуется авторизация',
            details: 'Пользователь не аутентифицирован'
        });
    }
    
    // Проверяем, является ли пользователь администратором
    if (req.user.role !== 'admin' && req.user.role !== 'head_admin' && req.user.role !== 'super_admin' && req.user.role !== 'глав_админ') {
        return res.status(403).json({
            message: 'Доступ запрещен',
            details: 'Требуются права администратора'
        });
    }
    
    // Если все проверки пройдены, передаем управление следующему middleware
    next();
};

module.exports = {
    authenticateToken,
    checkRole,
    isAdmin
}; 