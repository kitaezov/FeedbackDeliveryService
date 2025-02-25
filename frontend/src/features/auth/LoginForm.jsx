import React, { useState } from 'react';

/**
 * Константы для валидации данных
 */
const VALIDATION_RULES = {
    MIN_PASSWORD_LENGTH: 6,
    MAX_NAME_LENGTH: 50,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

/**
 * Компонент кнопки с анимацией при наведении
 * @param children
 * @param className
 * @param {Object} props - Пропсы компонента
 */
const Button = ({ children, className, ...props }) => (
    <button
        className={`transform transition-all duration-200 hover:scale-105 ${className}`}
        {...props}
    >
        {children}
    </button>
);

/**
 * Компонент модального окна авторизации/регистрации
 * @param {Object} props - Пропсы компонента
 * @param {Function} props.onClose - Функция закрытия модального окна
 * @param {Function} props.onSubmit - Функция отправки формы
 * @param {Object} props.loginData - Данные формы
 * @param {Function} props.setLoginData - Функция обновления данных формы
 * @param {boolean} props.isRegistration - Флаг режима регистрации
 */
const LoginModal = ({ onClose, onSubmit, loginData, setLoginData, isRegistration }) => {
    // Состояние для хранения ошибок валидации
    const [errors, setErrors] = useState({});

    /**
     * Валидация данных формы
     * @returns {boolean} - Результат валидации
     */
    const validateForm = () => {
        const newErrors = {};

        // Валидация email
        if (!VALIDATION_RULES.EMAIL_REGEX.test(loginData.email)) {
            newErrors.email = 'Некорректный email адрес';
        }

        // Валидация пароля
        if (loginData.password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
            newErrors.password = `Пароль должен содержать минимум ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} символов`;
        }

        // Валидация имени при регистрации
        if (isRegistration) {
            if (!loginData.name) {
                newErrors.name = 'Имя обязательно для заполнения';
            } else if (loginData.name.length > VALIDATION_RULES.MAX_NAME_LENGTH) {
                newErrors.name = `Имя не должно превышать ${VALIDATION_RULES.MAX_NAME_LENGTH} символов`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Обработчик отправки формы
     * @param {Event} e - Событие отправки формы
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (validateForm()) {
                await onSubmit(e);
            }
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            setErrors({
                submit: 'Произошла ошибка при отправке формы. Попробуйте позже.'
            });
        }
    };

    /**
     * Обработчик изменения полей формы
     * @param {string} field - Название поля
     * @param {string} value - Новое значение
     */
    const handleInputChange = (field, value) => {
        setLoginData({ ...loginData, [field]: value });
        // Очищаем ошибку поля при изменении
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-xl transform transition-all duration-300 scale-100">
                <h2 className="text-xl font-bold mb-4 font-playfair">
                    {isRegistration ? "Регистрация" : "Войти"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistration && (
                        <div>
                            <label className="block text-sm font-medium mb-1 font-source">Имя</label>
                            <input
                                type="text"
                                className={`w-full p-2 border rounded-lg dark:bg-gray-700 font-source ${
                                    errors.name ? 'border-red-500' : ''
                                }`}
                                value={loginData.name || ''}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                required
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1 font-source">Email</label>
                        <input
                            type="email"
                            className={`w-full p-2 border rounded-lg dark:bg-gray-700 font-source ${
                                errors.email ? 'border-red-500' : ''
                            }`}
                            value={loginData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 font-source">Пароль</label>
                        <input
                            type="password"
                            className={`w-full p-2 border rounded-lg dark:bg-gray-700 font-source ${
                                errors.password ? 'border-red-500' : ''
                            }`}
                            value={loginData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>
                    {errors.submit && (
                        <p className="text-red-500 text-sm mt-1">{errors.submit}</p>
                    )}
                    <div className="flex justify-between">
                        <Button
                            type="submit"
                            className="bg-transparent border border-gray-500 text-gray-500 px-6 py-2 rounded-lg hover:bg-gray-800 hover:text-white"
                        >
                            {isRegistration ? "Зарегистрироваться" : "Войти"}
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 font-source"
                        >
                            Отмена
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export { LoginModal };