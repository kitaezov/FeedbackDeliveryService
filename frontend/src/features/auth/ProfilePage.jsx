import React, { useState } from "react";

/**
 * Константы для валидации данных пользователя
 */
const VALIDATION_RULES = {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_PASSWORD_LENGTH: 6
};

/**
 * Компонент спиннера загрузки
 */
const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
);

/**
 * Компонент карточки
 */
const Card = ({ children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {children}
    </div>
);

/**
 * Компонент заголовка карточки
 */
const CardHeader = ({ children }) => (
    <div className="p-4 border-b dark:border-gray-700">{children}</div>
);

/**
 * Компонент контента карточки
 */
const CardContent = ({ children }) => (
    <div className="p-4">{children}</div>
);

/**
 * Компонент карточки отзыва
 */
const ReviewCard = ({ review }) => (
    <div className="p-4 border rounded-lg dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                {review.userName.charAt(0)}
            </div>
            <span className="font-medium">{review.userName}</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{review.text}</p>
        <div className="mt-2 text-sm text-gray-500">
            Рейтинг: {review.rating} • Лайков: {review.likes}
        </div>
    </div>
);

/**
 * Компонент иконки редактирования
 */
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);

/**
 * Основной компонент страницы профиля
 * @param {Object} props - Пропсы компонента
 * @param {Object} props.user - Данные пользователя
 * @param {Function} props.onUpdateUser - Функция обновления данных пользователя
 * @param {Function} props.onLogout - Функция выхода из системы
 */
const ProfilePage = ({ user, onUpdateUser, onLogout }) => {
    // Состояния компонента
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(user);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    /**
     * Валидация данных пользователя
     * @returns {boolean} Результат валидации
     */
    const validateForm = () => {
        const newErrors = {};

        // Валидация имени
        if (!editedUser.name || editedUser.name.length < VALIDATION_RULES.MIN_NAME_LENGTH) {
            newErrors.name = `Имя должно содержать минимум ${VALIDATION_RULES.MIN_NAME_LENGTH} символа`;
        } else if (editedUser.name.length > VALIDATION_RULES.MAX_NAME_LENGTH) {
            newErrors.name = `Имя не должно превышать ${VALIDATION_RULES.MAX_NAME_LENGTH} символов`;
        }

        // Валидация email
        if (!VALIDATION_RULES.EMAIL_REGEX.test(editedUser.email)) {
            newErrors.email = 'Некорректный email адрес';
        }

        // Валидация пароля
        if (editedUser.newPassword && editedUser.newPassword.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
            newErrors.password = `Пароль должен содержать минимум ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} символов`;
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
            if (!validateForm()) {
                return;
            }

            setIsLoading(true);
            // Имитация задержки сетевого запроса
            await new Promise(resolve => setTimeout(resolve, 1000));
            await onUpdateUser(editedUser);
            setIsEditing(false);
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            setErrors({
                submit: 'Произошла ошибка при обновлении профиля. Попробуйте позже.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Обработчик изменения полей формы
     * @param {string} field - Название поля
     * @param {string} value - Новое значение
     */
    const handleInputChange = (field, value) => {
        setEditedUser({ ...editedUser, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    return (
        <div className="space-y-6">
            {isLoading && <LoadingSpinner />}

            <Card>
                <CardHeader>
                    <h2 className="text-xl font-bold">Профиль пользователя</h2>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Имя</label>
                                <input
                                    type="text"
                                    className={`w-full p-2 border rounded-lg dark:bg-gray-700 ${
                                        errors.name ? 'border-red-500' : ''
                                    }`}
                                    value={editedUser.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    className={`w-full p-2 border rounded-lg dark:bg-gray-700 ${
                                        errors.email ? 'border-red-500' : ''
                                    }`}
                                    value={editedUser.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Новый пароль</label>
                                <input
                                    type="password"
                                    className={`w-full p-2 border rounded-lg dark:bg-gray-700 ${
                                        errors.password ? 'border-red-500' : ''
                                    }`}
                                    placeholder="Оставьте пустым, чтобы не менять"
                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>
                            {errors.submit && (
                                <p className="text-red-500 text-sm">{errors.submit}</p>
                            )}
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Сохранить
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setErrors({});
                                        setEditedUser(user);
                                    }}
                                    className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold">{user.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                                </div>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <EditIcon />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <div className="text-2xl font-bold">{user.totalReviews}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Отзывов</div>
                                </div>
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <div className="text-2xl font-bold">{user.averageRating}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Средняя оценка</div>
                                </div>
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <div className="text-2xl font-bold">{user.totalLikes}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Лайков получено</div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h2 className="text-xl font-bold">Мои отзывы</h2>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {user.reviews?.length > 0 ? (
                            user.reviews.map(review => (
                                <ReviewCard
                                    key={review.id}
                                    review={{...review, userName: user.name}}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">У вас пока нет отзывов</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export { ProfilePage };