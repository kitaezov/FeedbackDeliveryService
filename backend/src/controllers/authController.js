/**
 * Контроллер аутентификации
 * Обрабатывает регистрацию, вход и проверку токена
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { validateEmail, validatePassword, validateName } = require('../utils/validators');
const config = require('../config');
const fs = require('fs');
const path = require('path');

// Безопасно импортировать контроллер уведомлений
let notificationController;
try {
    notificationController = require('./notificationController');
} catch (error) {
    console.error('Ошибка при загрузке контроллера уведомлений:', error);
    // Создать фиктивный контроллер уведомлений, если реальный не может быть загружен
    notificationController = {
        createProfileUpdateNotification: async () => false
    };
}

/**
 * Регистрация нового пользователя
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
    try {   
        console.log('Попытка регистрации с данными:', req.body);
        const { name, email, password } = req.body;
        
        // Проверка входных данных
        if (!validateName(name)) {
            console.log('Ошибка при проверке имени:', name);
            return res.status(400).json({
                message: 'Некорректное имя',
                details: 'Имя должно содержать от 1 до 15 символов'
            });
        }
        
        if (!validateEmail(email)) {
            console.log('Ошибка при проверке email:', email);
            return res.status(400).json({
                message: 'Некорректный email',
                details: 'Пожалуйста, введите корректный email-адрес'
            });
        }
        
        if (!validatePassword(password)) {
            console.log('Ошибка при проверке пароля:', password);
            return res.status(400).json({
                message: 'Некорректный пароль',
                details: 'Пароль должен содержать не менее 8 символов, включать как минимум одну букву и одну цифру'
            });
        }
        
        // Проверка, существует ли пользователь
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            console.log('Пользователь уже существует:', email);
            return res.status(409).json({
                message: 'Пользователь уже существует',
                details: 'Email уже используется другим пользователем'
            });
        }
        
        console.log('Создание пользователя в базе данных...');
        // Создать пользователя
        const user = await userModel.create({ name, email, password });
        console.log('Пользователь создан:', user);
        
        // Генерация JWT-токена
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
 * Вход пользователя
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log(`Login attempt with email: ${email}`);
        
        // Проверка входных данных
        if (!email || !password) {
            console.log('Вход не выполнен: Отсутствует email или пароль');
            return res.status(400).json({
                message: 'Недостаточно данных',
                details: 'Пожалуйста, введите email и пароль'
            });
        }
        
        // Поиск пользователя
        const user = await userModel.findByEmail(email);
        console.log(`Пользователь найден: ${user ? 'Да' : 'Нет'}`);
        
        if (!user) {
            console.log(`Вход не выполнен: Пользователь с email ${email} не найден`);
            return res.status(401).json({
                message: 'Неверные учетные данные',
                details: 'Пользователь с таким email не найден'
            });
        }
        
        console.log(`Найден пользователь: ${user.name}, Роль: ${user.role}, ID: ${user.id}`);
        
        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log(`Пароль действителен: ${isPasswordValid ? 'Да' : 'Нет'}`);
        
        if (!isPasswordValid) {
            console.log(`Вход не выполнен: Неверный пароль для пользователя ${email}`);
            return res.status(401).json({
                message: 'Неверные учетные данные',
                details: 'Неверный пароль'
            });
        }
        
        // Проверка, заблокирован ли аккаунт
        if (user.is_blocked === 1) {
            console.log(`Вход не выполнен: Пользователь ${email} заблокирован`);
            return res.status(403).json({
                message: 'Аккаунт заблокирован',
                details: 'Ваш аккаунт был заблокирован администратором',
                blocked: true,
                blocked_reason: user.blocked_reason || 'Причина не указана'
            });
        }
        
        // Генерация JWT-токена
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log(`Вход выполнен успешно для пользователя ${email}`);
        
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
 * Проверка токена
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
        
        // Проверка токена
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
 * Получить данные профиля пользователя
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
 * Загрузить аватар пользователя
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadAvatar = async (req, res) => {
    try {
        console.log('Запрос на загрузку аватара получен');
        console.log('Пользователь в запросе:', req.user);
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
 * Удалить аватар пользователя
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

/**
    * Обновление информации о профиле пользователя
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res) => {
    try {
        // Извлечение ID пользователя из токена
        const userId = req.user.userId;
        console.log('Обновление профиля для пользователя:', userId);
        console.log('Данные запроса:', JSON.stringify(req.body, null, 2));
        
        // Получение данных для обновления из тела запроса
        const { name, email, phoneNumber, birthDate, currentPassword, newPassword } = req.body;
        console.log('Извлеченные поля:');
        console.log('- phoneNumber:', phoneNumber);
        console.log('- birthDate:', birthDate);
        
        // Получение пользователя из базы данных
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
                details: 'Указанный пользователь не существует в базе данных'
            });
        }
        
        // Подготовка данных для обновления
        const updateData = {};
        
        // Проверка и добавление имени, если оно предоставлено
        if (name !== undefined) {
            if (!validateName(name)) {
                return res.status(400).json({
                    message: 'Некорректное имя',
                    details: 'Имя должно содержать от 1 до 15 символов',
                    field: 'name'
                });
            }
            updateData.name = name;
        }
        
        // Проверка и добавление email, если он предоставлен
        if (email !== undefined && email !== user.email) {
            if (!validateEmail(email)) {
                return res.status(400).json({
                    message: 'Некорректный email',
                    details: 'Пожалуйста, введите корректный email-адрес',
                    field: 'email'
                });
            }
            
            // Проверка, используется ли email другим пользователем
            const existingUser = await userModel.findByEmail(email);
            if (existingUser && existingUser.id !== userId) {
                return res.status(409).json({
                    message: 'Email уже используется',
                    details: 'Указанный email уже используется другим пользователем',
                    field: 'email'
                });
            }
            
            updateData.email = email;
        }
        
        // Добавление phoneNumber, если он предоставлен
        if (phoneNumber !== undefined) {
            updateData.phoneNumber = phoneNumber;
            console.log('phoneNumber добавлен в updateData:', phoneNumber);
        }
        
        // Добавление birthDate, если он предоставлен
        if (birthDate !== undefined) {
            updateData.birthDate = birthDate;
            console.log('birthDate добавлен в updateData:', birthDate);
        }
        
        // Обработка изменения пароля, если он предоставлен
        if (newPassword) {
            // Проверка текущего пароля
            if (!currentPassword) {
                return res.status(400).json({
                    message: 'Необходим текущий пароль',
                    details: 'Для смены пароля необходимо указать текущий пароль',
                    field: 'currentPassword'
                });
            }
            
            // Проверка, является ли текущий пароль корректным
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: 'Неверный текущий пароль',
                    details: 'Указанный текущий пароль не соответствует действительному',
                    field: 'currentPassword'
                });
            }
            
            // Проверка нового пароля
            if (!validatePassword(newPassword)) {
                return res.status(400).json({
                    message: 'Некорректный новый пароль',
                    details: 'Новый пароль должен содержать не менее 8 символов, включать как минимум одну букву и одну цифру',
                    field: 'newPassword'
                });
            }
            
            // Хеширование нового пароля
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            updateData.password = hashedPassword;
        }
        
        // Если нет данных для обновления
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: 'Нет данных для обновления',
                details: 'Не указаны поля для обновления'
            });
        }
        
        console.log('Данные для обновления:', JSON.stringify(updateData, null, 2));
        
        // Обновление пользователя в базе данных
        const updatedUser = await userModel.update(userId, updateData);
        
        console.log('Результат обновления:', updatedUser ? 'Успешно' : 'Ошибка');
        if (updatedUser) {
            console.log('Обновленные данные пользователя:', JSON.stringify(updatedUser, null, 2));
        }
        
        if (!updatedUser) {
            return res.status(500).json({
                message: 'Ошибка обновления профиля',
                details: 'Не удалось обновить профиль в базе данных'
            });
        }
        
        // Создаем уведомление об обновлении профиля - обернем в try/catch,
        // чтобы не прерывать основной процесс, если с уведомлениями проблема
        try {
            await notificationController.createProfileUpdateNotification(userId);
        } catch (notificationError) {
            console.error('Ошибка создания уведомления:', notificationError);
            // Продолжаем выполнение, не прерывая основной процесс
        }
        
        // Возвращаем обновленные данные пользователя
        res.json({
            message: 'Профиль успешно обновлен',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                birthDate: updatedUser.birthDate,
                role: updatedUser.role,
                created_at: updatedUser.created_at,
                avatar: updatedUser.avatar
            }
        });
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        res.status(500).json({
            message: 'Ошибка обновления профиля',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

/**
 * Утилита для сброса пароля пользователя (только для разработки)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resetPassword = async (req, res) => {
    try {
        // Этот эндпоинт должен быть доступен только в режиме разработки
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                message: 'Доступ запрещен',
                details: 'Этот эндпоинт доступен только в режиме разработки'
            });
        }
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                message: 'Некорректные данные',
                details: 'Email и пароль обязательны'
            });
        }
        
        const success = await userModel.resetPasswordByEmail(email, password);
        
        if (success) {
            res.json({
                message: 'Пароль успешно сброшен',
                details: `Пароль для ${email} был сброшен`
            });
        } else {
            res.status(404).json({
                message: 'Ошибка сброса пароля',
                details: 'Пользователь не найден или произошла ошибка при сбросе пароля'
            });
        }
    } catch (error) {
        console.error('Ошибка сброса пароля:', error);
        res.status(500).json({
            message: 'Ошибка сброса пароля',
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
    deleteAvatar,
    updateProfile,
    resetPassword
}; 