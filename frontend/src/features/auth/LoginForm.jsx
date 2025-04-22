import React, { useState } from 'react';
import axios from 'axios';
import AnimatedButton from "../../components/AnimatedButton";
import { Mail, Lock, User, X, Check, AlertCircle, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

// Анимация для кнопок
const buttonVariants = {
    hover: {
        scale: 1.05,
        transition: { 
            duration: 0.2,
            type: "spring", 
            stiffness: 400 
        }
    },
    tap: {
        scale: 0.95,
        transition: { 
            duration: 0.1 
        }
    }
};

// Анимация для инпутов
const inputVariants = {
    initial: { 
        scale: 1 
    },
    hover: {
        boxShadow: "0 0 0 2px rgba(55, 65, 81, 0.15)",
        transition: { 
            duration: 0.2 
        }
    },
    focus: { 
        scale: 1.02,
        boxShadow: "0 0 0 3px rgba(55, 65, 81, 0.2)",
        transition: { 
            duration: 0.2,
            type: "spring", 
            stiffness: 400 
        }
    },
    blur: { 
        scale: 1,
        boxShadow: "0 0 0 0px rgba(55, 65, 81, 0)",
        transition: { 
            duration: 0.2 
        }
    }
};

// Анимация для иконок
const iconVariants = {
    initial: { 
        opacity: 0.7,
        scale: 1
    },
    hover: { 
        opacity: 1,
        scale: 1.1,
        transition: { 
            duration: 0.2 
        }
    },
    tap: { 
        scale: 0.9,
        transition: { 
            duration: 0.1 
        }
    }
};

// Анимация для переключения между элементами формы
const formElementVariants = {
    hidden: { 
        opacity: 0, 
        y: 10 
    },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
        }
    },
    exit: { 
        opacity: 0, 
        y: -10,
        transition: { 
            duration: 0.2 
        }
    }
};

const LoginModal = ({
    onClose,
    isRegistration,
    onLoginSuccess,
    switchToRegistration
}) => {
    const [loginData, setLoginData] = useState({
        name: isRegistration ? '' : undefined,
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrengthDetails, setPasswordStrengthDetails] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        specialChars: false
    });
    const [passwordImprovement, setPasswordImprovement] = useState('');
    const [strengthPercentage, setStrengthPercentage] = useState(0);
    
    // Состояния для верификации email - всегда отключена
    const [verificationStep, setVerificationStep] = useState(false);
    // Эти состояния остаются, но мы не будем их использовать
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationEmail, setVerificationEmail] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const VALIDATION_RULES = {
        MIN_PASSWORD_LENGTH: 8,
        MAX_NAME_LENGTH: 50,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        WEAK_PASSWORD_PATTERNS: [
            /123/, /qwerty/, /password/, /admin/,
            /111111/, /12345/, /letmein/, /welcome/
        ]
    };

    const checkPasswordStrength = (password) => {
        if (!password) {
            return {
                strengthChecks: {
                    length: false,
                    uppercase: false,
                    lowercase: false,
                    numbers: false,
                    specialChars: false
                },
                improvement: 'Введите пароль',
                strengthPercentage: 0
            };
        }
        
        // Базовые проверки
        const strengthChecks = {
            length: password.length >= VALIDATION_RULES.MIN_PASSWORD_LENGTH,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /\d/.test(password),
            specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };

        // Дополнительные проверки
        const hasSequentialChars = /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789/i.test(password);
        const hasRepeatedChars = /(.)\1{2,}/i.test(password); // 3+ повторения одного символа
        const hasKeyboardSequence = /qwer|asdf|zxcv|1234|7890|0987|poiu|lkjh|mnbv/i.test(password);
        
        // Расширенный список распространенных паролей
        const hasWeakPattern = VALIDATION_RULES.WEAK_PASSWORD_PATTERNS.some(pattern => pattern.test(password.toLowerCase()));
        
        // Бонусы за длину пароля: по 5% за каждые 4 символа свыше минимальных 8 (до макс. 20%)
        const lengthBonus = Math.min(20, Math.floor((password.length - VALIDATION_RULES.MIN_PASSWORD_LENGTH) / 4) * 5);
        
        // Штрафы за небезопасные паттерны
        const sequentialPenalty = hasSequentialChars ? 15 : 0;
        const repeatedPenalty = hasRepeatedChars ? 15 : 0;
        const keyboardPenalty = hasKeyboardSequence ? 20 : 0;
        const weakPatternPenalty = hasWeakPattern ? 25 : 0;
        
        // Расчет с весами для разных критериев
        const weights = {
            length: 15,
            uppercase: 15,
            lowercase: 15,
            numbers: 15,
            specialChars: 20
        };
        
        let score = 0;
        for (const [check, isValid] of Object.entries(strengthChecks)) {
            if (isValid) {
                score += weights[check];
            }
        }
        
        // Добавляем бонус за длину и вычитаем штрафы
        score += lengthBonus;
        score -= (sequentialPenalty + repeatedPenalty + keyboardPenalty + weakPatternPenalty);
        
        // Финальный процент силы пароля, ограничен от 0 до 100
        const strengthPercentage = Math.max(0, Math.min(100, score));
        
        // Формируем рекомендации по улучшению
        const missingRequirements = [];
        if (!strengthChecks.length) missingRequirements.push('увеличить длину пароля (минимум 8 символов)');
        if (!strengthChecks.uppercase) missingRequirements.push('добавить заглавные буквы');
        if (!strengthChecks.lowercase) missingRequirements.push('добавить строчные буквы');
        if (!strengthChecks.numbers) missingRequirements.push('добавить цифры');
        if (!strengthChecks.specialChars) missingRequirements.push('добавить специальные символы');
        
        if (hasRepeatedChars) missingRequirements.push('избегать повторяющихся символов (например, "aaa")');
        if (hasSequentialChars) missingRequirements.push('избегать последовательностей символов (например, "abc", "123")');
        if (hasKeyboardSequence) missingRequirements.push('избегать клавиатурных последовательностей (например, "qwerty")');
        if (hasWeakPattern) missingRequirements.push('избегать распространенных паттернов паролей');
        
        let improvement = '';
        if (missingRequirements.length > 0) {
            improvement = `Рекомендуем: ${missingRequirements.join(', ')}`;
        }
        
        return { strengthChecks, improvement, strengthPercentage };
    };

    const handlePasswordChange = (password) => {
        // Only apply strength check for registration
        if (isRegistration) {
            const result = checkPasswordStrength(password);

            setPasswordStrengthDetails(result.strengthChecks);
            setPasswordImprovement(result.improvement);
            setStrengthPercentage(result.strengthPercentage);
        }

        setLoginData(prev => ({ ...prev, password }));

        // Clear any previous password-related errors
        const newErrors = { ...errors };
        delete newErrors.password;
        delete newErrors.passwordStrength;
        setErrors(newErrors);
    };

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!VALIDATION_RULES.EMAIL_REGEX.test(loginData.email)) {
            newErrors.email = 'Некорректный email адрес';
        }

        // Password validation
        if (isRegistration) {
            const result = checkPasswordStrength(loginData.password);

            // Check if all strength criteria are met
            const isPasswordStrong = Object.values(result.strengthChecks).every(check => check);

            if (!isPasswordStrong) {
                newErrors.passwordStrength = result.improvement || 'Пароль не соответствует требованиям безопасности';
            }
        }

        // Name validation for registration
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Если мы на этапе проверки кода подтверждения
        if (verificationStep) {
            await verifyEmailCode();
            return;
        }

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Если это регистрация, отправляем запрос на регистрацию напрямую
            if (isRegistration) {
                const response = await api.post('auth/register', loginData);
                
                const userWithToken = {
                    ...response.data.user,
                    token: response.data.token
                };

                // Сохраняем токен в localStorage или sessionStorage
                if (loginData.rememberMe) {
                    localStorage.setItem('token', response.data.token);
                } else {
                    localStorage.setItem('token', response.data.token);
                }
                
                // Вызываем обработчик успешного входа
                onLoginSuccess(userWithToken);
                
                // Диспатчим пользовательское событие для обновления статуса авторизации
                const authEvent = new CustomEvent('auth-changed', { 
                    detail: { 
                        isAuthenticated: true,
                        user: response.data.user
                    } 
                });
                document.dispatchEvent(authEvent);
                
                onClose();
            } else {
                // Стандартный вход в систему
                const response = await api.post('auth/login', loginData);
                
                const userWithToken = {
                    ...response.data.user,
                    token: response.data.token
                };

                // Сохраняем токен в localStorage для сохранения сессии при обновлении страницы
                localStorage.setItem('token', response.data.token);
                
                // Вызываем обработчик успешного входа
                onLoginSuccess(userWithToken);
                
                // Диспатчим пользовательское событие для обновления статуса авторизации
                const authEvent = new CustomEvent('auth-changed', { 
                    detail: { 
                        isAuthenticated: true,
                        user: response.data.user
                    } 
                });
                document.dispatchEvent(authEvent);
                
                onClose();
            }
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            setErrors({
                submit: error.response?.data?.message ||
                    error.response?.data?.details ||
                    `Произошла ошибка при ${isRegistration ? 'регистрации' : 'входе'}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Функция проверки кода верификации - теперь ничего не делает
    const verifyEmailCode = async () => {
        console.log('Верификация по email отключена');
        return;
    };

    // Функция отправки кода подтверждения на email - теперь ничего не делает
    const sendVerificationEmail = async () => {
        console.log('Отправка кода верификации отключена');
        return;
    };

    // Повторная отправка кода - теперь ничего не делает
    const resendVerificationCode = async () => {
        console.log('Повторная отправка кода отключена');
        return;
    };

    // Обратный отсчет для повторной отправки - теперь ничего не делает
    const startResendCooldown = () => {
        console.log('Обратный отсчет отключен');
        return;
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 25,
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2 }
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[99]">
            <AnimatePresence>
                {/* Add a blurred backdrop */}
                <motion.div 
                    className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100]"
                    style={{ backdropFilter: "blur(8px)" }}
                    key="backdrop"
                    onClick={onClose}
                />
                <motion.div
                    className="bg-white dark:bg-gray-800 p-8 rounded-lg w-96 shadow-2xl border border-gray-200 dark:border-gray-700 z-[101]"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    key="modal"
                >
                    <div className="flex justify-between items-center mb-6">
                        <motion.h2 
                            className="text-2xl font-bold text-gray-700 dark:text-gray-200 flex items-center"
                            variants={formElementVariants}
                        >
                            {isRegistration ? (
                                <>
                                    <UserPlus size={24} className="mr-2 text-gray-700 dark:text-gray-300" />
                                    {verificationStep ? 'Подтверждение Email' : 'Регистрация'}
                                </>
                            ) : (
                                <>
                                    <LogIn size={24} className="mr-2 text-gray-700 dark:text-gray-300" />
                                    Войти
                                </>
                            )}
                        </motion.h2>
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                                        bg-gray-100 dark:bg-gray-700 rounded-full p-2"
                            aria-label="Закрыть"
                        >
                            <X size={20}/>
                        </motion.button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="wait">
                            {/* Проверка кода подтверждения */}
                            {isRegistration && verificationStep ? (
                                <>
                                    <motion.div
                                        key="verification-info"
                                        variants={formElementVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        <p>Мы отправили код подтверждения на адрес <span className="font-medium">{verificationEmail}</span></p>
                                        <p className="mt-1">Пожалуйста, проверьте свою почту и введите полученный код.</p>
                                    </motion.div>
                                    
                                    <motion.div
                                        key="verification-code"
                                        variants={formElementVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Код подтверждения
                                        </label>
                                        <motion.input
                                            type="text"
                                            className={`w-full p-3 text-center text-lg font-medium tracking-widest border rounded-lg text-gray-900 dark:text-gray-100 
                                                      bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 transition-all duration-200
                                                      ${errors.verificationCode ? 'border-red-500 focus:ring-red-200' : 
                                                                    'border-gray-300 dark:border-gray-600 focus:ring-gray-300 focus:border-gray-500 hover:border-gray-400'}`}
                                            value={verificationCode}
                                            onChange={(e) => {
                                                // Позволяем вводить только цифры и ограничиваем длину
                                                const value = e.target.value.replace(/[^\d]/g, '').substring(0, 6);
                                                setVerificationCode(value);
                                                
                                                // Очищаем ошибку при вводе
                                                if (errors.verificationCode) {
                                                    const newErrors = {...errors};
                                                    delete newErrors.verificationCode;
                                                    setErrors(newErrors);
                                                }
                                            }}
                                            placeholder="• • • • • •"
                                            disabled={isLoading}
                                            initial="initial"
                                            whileFocus="focus"
                                            whileHover="hover"
                                            variants={inputVariants}
                                        />
                                        {errors.verificationCode && (
                                            <motion.div 
                                                className="flex items-center mt-1"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                            >
                                                <AlertCircle size={16} className="text-red-600 mr-1"/>
                                                <p className="text-red-600 text-sm">{errors.verificationCode}</p>
                                            </motion.div>
                                        )}
                                        
                                        <div className="mt-3 flex justify-center">
                                            <button
                                                type="button"
                                                onClick={resendVerificationCode}
                                                disabled={resendCooldown > 0 || isLoading}
                                                className={`text-sm ${
                                                    resendCooldown > 0 || isLoading
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'text-gray-700 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-200'
                                                }`}
                                            >
                                                {resendCooldown > 0 
                                                    ? `Отправить код повторно (${resendCooldown}с)` 
                                                    : 'Отправить код повторно'}
                                            </button>
                                        </div>
                                    </motion.div>
                                    
                                    {/* Submit error */}
                                    {errors.submit && (
                                        <motion.div 
                                            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                        >
                                            <div className="flex items-center">
                                                <AlertCircle size={18} className="text-red-600 dark:text-red-400 mr-2"/>
                                                <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                    
                                    <motion.div
                                        key="verify-button"
                                        variants={formElementVariants}
                                    >
                                        <AnimatedButton
                                            type="submit"
                                            disabled={isLoading}
                                            className={`w-full flex items-center justify-center px-4 py-3 font-medium rounded-lg 
                                                     text-white bg-gray-700 hover:bg-gray-800 focus:outline-none 
                                                     focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                                                     ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Проверка...
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <UserPlus size={20} className="mr-2 text-gray-700 dark:text-gray-300" />
                                                    Подтвердить и зарегистрироваться
                                                </div>
                                            )}
                                        </AnimatedButton>
                                    </motion.div>
                                </>
                            ) : (
                                // Основная форма входа/регистрации
                                <>
                                    {/* Name input (if registration) */}
                                    {isRegistration && (
                                        <motion.div
                                            key="name-input"
                                            variants={formElementVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Имя</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                    <User size={18} className="text-gray-700 dark:text-gray-300"/>
                                                </div>
                                                <motion.input
                                                    type="text"
                                                    className={`w-full p-3 pl-10 border rounded-lg text-gray-900 dark:text-gray-100 
                                                              bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 transition-all duration-200
                                                              ${errors.name ? 'border-red-500 focus:ring-red-200' : 
                                                                            'border-gray-300 dark:border-gray-600 focus:ring-gray-300 focus:border-gray-500 hover:border-gray-400'}`}
                                                    value={loginData.name || ''}
                                                    onChange={(e) => setLoginData(prev => ({...prev, name: e.target.value}))}
                                                    disabled={isLoading}
                                                    initial="initial"
                                                    whileFocus="focus"
                                                    whileHover="hover"
                                                    variants={inputVariants}
                                                />
                                            </div>
                                            {errors.name && (
                                                <motion.div 
                                                    className="flex items-center mt-1"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                >
                                                    <AlertCircle size={16} className="text-red-600 mr-1"/>
                                                    <p className="text-red-600 text-sm">{errors.name}</p>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Email input */}
                                    <motion.div
                                        key="email-input"
                                        variants={formElementVariants}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                <Mail size={18} className="text-gray-700 dark:text-gray-300"/>
                                            </div>
                                            <motion.input
                                                type="email"
                                                className={`w-full p-3 pl-10 border rounded-lg text-gray-900 dark:text-gray-100 
                                                          bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 transition-all duration-200
                                                          ${errors.email ? 'border-red-500 focus:ring-red-200' : 
                                                                        'border-gray-300 dark:border-gray-600 focus:ring-gray-300 focus:border-gray-500 hover:border-gray-400'}`}
                                                value={loginData.email}
                                                onChange={(e) => setLoginData(prev => ({...prev, email: e.target.value}))}
                                                disabled={isLoading}
                                                initial="initial"
                                                whileFocus="focus"
                                                whileHover="hover"
                                                variants={inputVariants}
                                            />
                                        </div>
                                        {errors.email && (
                                            <motion.div 
                                                className="flex items-center mt-1"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                            >
                                                <AlertCircle size={16} className="text-red-600 mr-1"/>
                                                <p className="text-red-600 text-sm">{errors.email}</p>
                                            </motion.div>
                                        )}
                                    </motion.div>

                                    {/* Password input */}
                                    <motion.div
                                        key="password-input"
                                        variants={formElementVariants}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Пароль</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                <Lock size={18} className="text-gray-700 dark:text-gray-300"/>
                                            </div>
                                            <motion.input
                                                type={showPassword ? "text" : "password"}
                                                className={`w-full p-3 pl-10 pr-10 border rounded-lg text-gray-900 dark:text-gray-100 
                                                          bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 transition-all duration-200
                                                          ${errors.password || errors.passwordStrength ? 'border-red-500 focus:ring-red-200' : 
                                                                                            'border-gray-300 dark:border-gray-600 focus:ring-gray-300 focus:border-gray-500 hover:border-gray-400'}`}
                                                value={loginData.password}
                                                onChange={(e) => handlePasswordChange(e.target.value)}
                                                disabled={isLoading}
                                                initial="initial"
                                                whileFocus="focus"
                                                whileHover="hover"
                                                variants={inputVariants}
                                            />
                                            <motion.button
                                                type="button"
                                                variants={iconVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                onClick={togglePasswordVisibility}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 
                                                         dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                            >
                                                {showPassword ? <EyeOff size={20} className="text-gray-700 dark:text-gray-300"/> : <Eye size={20} className="text-gray-700 dark:text-gray-300"/>}
                                            </motion.button>
                                        </div>
                                        {errors.password && (
                                            <motion.div 
                                                className="flex items-center mt-1"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                            >
                                                <AlertCircle size={16} className="text-red-600 mr-1"/>
                                                <p className="text-red-600 text-sm">{errors.password}</p>
                                            </motion.div>
                                        )}
                                        {errors.passwordStrength && (
                                            <motion.div 
                                                className="flex items-center mt-1"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                            >
                                                <AlertCircle size={16} className="text-red-600 mr-1"/>
                                                <p className="text-red-600 text-sm">{errors.passwordStrength}</p>
                                            </motion.div>
                                        )}
                                        
                                        {/* Password requirements for registration */}
                                        {isRegistration && loginData.password.length > 0 && (
                                            <motion.div 
                                                className="mt-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="mb-3">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Надежность пароля: {strengthPercentage}%
                                                        </span>
                                                        <span className={`text-xs font-medium ${
                                                            strengthPercentage < 30 ? 'text-red-600 dark:text-red-400' :
                                                            strengthPercentage < 50 ? 'text-orange-600 dark:text-orange-400' :
                                                            strengthPercentage < 75 ? 'text-yellow-600 dark:text-yellow-400' :
                                                            'text-green-600 dark:text-green-400'
                                                        }`}>
                                                            {strengthPercentage < 30 ? 'Очень слабый' :
                                                             strengthPercentage < 50 ? 'Слабый' :
                                                             strengthPercentage < 75 ? 'Средний' :
                                                             strengthPercentage < 90 ? 'Хороший' : 'Отличный'}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-300 ${
                                                                strengthPercentage < 30 ? 'bg-red-500' :
                                                                strengthPercentage < 50 ? 'bg-orange-500' :
                                                                strengthPercentage < 75 ? 'bg-yellow-500' :
                                                                strengthPercentage < 90 ? 'bg-green-500' : 'bg-emerald-500'
                                                            }`}
                                                            style={{ width: `${strengthPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                    {strengthPercentage >= 75 && (
                                                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                            Отличный пароль! Ваш пароль достаточно надежный.
                                                        </p>
                                                    )}
                                                    {strengthPercentage < 30 && (
                                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                            Этот пароль слишком простой и может быть легко подобран.
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Требования к паролю:</p>
                                                <ul className="space-y-1">
                                                    <li className="flex items-center text-sm">
                                                        <span className={`flex-shrink-0 w-5 h-5 mr-2 rounded-full flex items-center justify-center ${
                                                            passwordStrengthDetails.length 
                                                                ? 'bg-green-500 text-white' 
                                                                : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}>
                                                            {passwordStrengthDetails.length ? <Check size={12} /> : null}
                                                        </span>
                                                        <span className={passwordStrengthDetails.length ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                                                            Минимум 8 символов
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center text-sm">
                                                        <span className={`flex-shrink-0 w-5 h-5 mr-2 rounded-full flex items-center justify-center ${
                                                            passwordStrengthDetails.uppercase 
                                                                ? 'bg-green-500 text-white' 
                                                                : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}>
                                                            {passwordStrengthDetails.uppercase ? <Check size={12} /> : null}
                                                        </span>
                                                        <span className={passwordStrengthDetails.uppercase ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                                                            Заглавные буквы (A-Z)
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center text-sm">
                                                        <span className={`flex-shrink-0 w-5 h-5 mr-2 rounded-full flex items-center justify-center ${
                                                            passwordStrengthDetails.lowercase 
                                                                ? 'bg-green-500 text-white' 
                                                                : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}>
                                                            {passwordStrengthDetails.lowercase ? <Check size={12} /> : null}
                                                        </span>
                                                        <span className={passwordStrengthDetails.lowercase ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                                                            Строчные буквы (a-z)
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center text-sm">
                                                        <span className={`flex-shrink-0 w-5 h-5 mr-2 rounded-full flex items-center justify-center ${
                                                            passwordStrengthDetails.numbers 
                                                                ? 'bg-green-500 text-white' 
                                                                : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}>
                                                            {passwordStrengthDetails.numbers ? <Check size={12} /> : null}
                                                        </span>
                                                        <span className={passwordStrengthDetails.numbers ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                                                            Цифры (0-9)
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center text-sm">
                                                        <span className={`flex-shrink-0 w-5 h-5 mr-2 rounded-full flex items-center justify-center ${
                                                            passwordStrengthDetails.specialChars 
                                                                ? 'bg-green-500 text-white' 
                                                                : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}>
                                                            {passwordStrengthDetails.specialChars ? <Check size={12} /> : null}
                                                        </span>
                                                        <span className={passwordStrengthDetails.specialChars ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                                                            Специальные символы (!@#$%)
                                                        </span>
                                                    </li>
                                                </ul>
                                            </motion.div>
                                        )}
                                    </motion.div>

                                    {/* Remember me checkbox */}
                                    <motion.div
                                        key="remember-me"
                                        variants={formElementVariants}
                                    >
                                        <label className="flex items-center">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="opacity-0 absolute h-5 w-5"
                                                    checked={loginData.rememberMe}
                                                    onChange={(e) => setLoginData(prev => ({...prev, rememberMe: e.target.checked}))}
                                                />
                                                <div className={`border w-5 h-5 rounded flex items-center justify-center 
                                                       ${loginData.rememberMe ? 
                                                        'bg-gray-700 border-gray-700' : 
                                                        'border-gray-400 dark:border-gray-600'}`}>
                                                    {loginData.rememberMe && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            exit={{ scale: 0 }}
                                                        >
                                                            <Check size={14} className="text-white" />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="ml-2 text-sm text-text-white dark:text-white">Запомнить меня</span>
                                        </label>
                                    </motion.div>

                                    {/* Submit error */}
                                    {errors.submit && (
                                        <motion.div 
                                            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                        >
                                            <div className="flex items-center">
                                                <AlertCircle size={18} className="text-red-600 dark:text-red-400 mr-2"/>
                                                <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Submit button */}
                                    <motion.div
                                        key="submit-button"
                                        variants={formElementVariants}
                                    >
                                        <AnimatedButton
                                            type="submit"
                                            disabled={isLoading}
                                            className={`w-full flex items-center justify-center px-4 py-3 font-medium rounded-lg 
                                                     text-white bg-gray-700 hover:bg-gray-800 focus:outline-none 
                                                     focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                                                     ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Загрузка...
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    {isRegistration ? <UserPlus size={20} className="mr-2 text-gray-700 dark:text-gray-300" /> : <LogIn size={20} className="mr-2 text-gray-700 dark:text-gray-300" />}
                                                    {isRegistration ? 'Зарегистрироваться' : 'Войти'}
                                                </div>
                                            )}
                                        </AnimatedButton>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default LoginModal;
