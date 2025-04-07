/**
 * Authentication Controller
 * Handles user registration, login, and token validation
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { validateEmail, validatePassword, validateName } = require('../utils/validators');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
    try {
        console.log('Register attempt with data:', req.body);
        const { name, email, password } = req.body;
        
        // Validate input
        if (!validateName(name)) {
            console.log('Name validation failed:', name);
            return res.status(400).json({
                message: 'Некорректное имя',
                details: 'Имя должно содержать от 1 до 15 символов'
            });
        }
        
        if (!validateEmail(email)) {
            console.log('Email validation failed:', email);
            return res.status(400).json({
                message: 'Некорректный email',
                details: 'Пожалуйста, введите корректный email-адрес'
            });
        }
        
        if (!validatePassword(password)) {
            console.log('Password validation failed');
            return res.status(400).json({
                message: 'Некорректный пароль',
                details: 'Пароль должен содержать не менее 6 символов'
            });
        }
        
        // Check if user already exists
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(409).json({
                message: 'Пользователь уже существует',
                details: 'Email уже используется другим пользователем'
            });
        }
        
        console.log('Creating user in database...');
        // Create user
        const user = await userModel.create({ name, email, password });
        console.log('User created:', user);
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            },
            token
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({
            message: 'Ошибка регистрации',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: 'Недостаточно данных',
                details: 'Пожалуйста, введите email и пароль'
            });
        }
        
        // Find user
        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                message: 'Неверные учетные данные',
                details: 'Пользователь с таким email не найден'
            });
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Неверные учетные данные',
                details: 'Неверный пароль'
            });
        }
        
        // Check if the account is blocked
        if (user.is_blocked === 1) {
            return res.status(403).json({
                message: 'Аккаунт заблокирован',
                details: 'Ваш аккаунт был заблокирован администратором',
                blocked: true,
                blocked_reason: user.blocked_reason || 'Причина не указана'
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Успешная аутентификация',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            },
            token
        });
    } catch (error) {
        console.error('Ошибка аутентификации:', error);
        res.status(500).json({
            message: 'Ошибка аутентификации',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Validate token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const validateToken = (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                valid: false,
                message: 'Токен отсутствует'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true });
    } catch (error) {
        console.error('Ошибка валидации токена:', error);
        res.json({
            valid: false,
            message: 'Недействительный токен'
        });
    }
};

/**
 * Get user profile data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
    try {
        // Проверка заголовка авторизации
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({
                message: 'Необходима авторизация',
                details: 'Отсутствует заголовок авторизации'
            });
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                message: 'Необходима авторизация',
                details: 'Отсутствует токен авторизации'
            });
        }
        
        // Проверка токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        
        // Получение данных пользователя из базы данных
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
                details: 'Указанный пользователь не существует в базе данных'
            });
        }
        
        // Проверка блокировки
        const isBlocked = user.is_blocked === 1;
        
        // Отправка данных пользователя
        res.json({
            message: 'Данные профиля успешно получены',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
                avatar: user.avatar,
                is_blocked: isBlocked,
                blocked_reason: isBlocked ? user.blocked_reason : null,
                total_likes: user.total_likes || 0
            }
        });
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        
        // Проверка на ошибку JWT
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                message: 'Недействительный токен',
                details: 'Токен не прошел верификацию'
            });
        }
        
        // Проверка на истекший токен
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Срок действия токена истек',
                details: 'Пожалуйста, войдите заново'
            });
        }
        
        res.status(500).json({
            message: 'Ошибка получения профиля',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Upload user avatar
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadAvatar = async (req, res) => {
    try {
        console.log('Запрос на загрузку аватара получен');
        console.log('User в запросе:', req.user);
        console.log('Файл:', req.file ? `Имя: ${req.file.filename}, размер: ${req.file.size}` : 'Файл отсутствует');
        
        // Проверяем, был ли загружен файл
        if (!req.file) {
            console.log('Ошибка: Файл не был загружен');
            return res.status(400).json({
                message: 'Файл не загружен',
                details: 'Необходимо выбрать файл для загрузки'
            });
        }

        const userId = req.user.userId || req.user.id;
        console.log(`Используем ID пользователя: ${userId}`);
        
        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        console.log(`Путь к аватару: ${avatarPath}`);

        // Обновляем аватар пользователя в базе данных
        const updatedUser = await userModel.updateAvatar(userId, avatarPath);
        console.log('Результат обновления аватара:', updatedUser ? 'Успешно' : 'Ошибка');

        if (!updatedUser) {
            console.log('Ошибка: Пользователь не найден при обновлении аватара');
            return res.status(404).json({
                message: 'Пользователь не найден',
                details: 'Не удалось обновить аватар пользователя'
            });
        }

        // Возвращаем успешный ответ с URL аватара
        console.log('Успешно загружен аватар, отправляем ответ');
        res.json({
            message: 'Аватар успешно загружен',
            avatarUrl: avatarPath
        });
    } catch (error) {
        console.error('Ошибка загрузки аватара:', error);
        res.status(500).json({
            message: 'Ошибка загрузки аватара',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Delete user avatar
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAvatar = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Получаем текущего пользователя
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
                details: 'Не удалось найти пользователя для удаления аватара'
            });
        }

        // Если у пользователя есть аватар, удаляем файл
        if (user.avatar) {
            const fs = require('fs');
            const path = require('path');
            const avatarPath = path.join(__dirname, '../../public', user.avatar);

            // Проверяем существование файла перед удалением
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
            }
        }

        // Обновляем пользователя, устанавливая avatarUrl в null
        const updatedUser = await userModel.updateAvatar(userId, null);

        if (!updatedUser) {
            return res.status(500).json({
                message: 'Не удалось обновить пользователя',
                details: 'Произошла ошибка при обновлении данных пользователя'
            });
        }

        res.json({
            message: 'Аватар успешно удален'
        });
    } catch (error) {
        console.error('Ошибка удаления аватара:', error);
        res.status(500).json({
            message: 'Ошибка удаления аватара',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

module.exports = {
    register,
    login,
    validateToken,
    getProfile,
    uploadAvatar,
    deleteAvatar
}; 