/**
 * Валидаторы
 * 
 * Набор функций для проверки корректности пользовательского ввода.
 * Используется для валидации данных перед сохранением в базу данных
 * и предотвращения ввода некорректных данных.
 */

/**
 * Проверка корректности адреса электронной почты
 * 
 * @param {string} email - Адрес электронной почты для проверки
 * @returns {boolean} - true если адрес корректен, false в противном случае
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Проверка надежности пароля
 * 
 * Пароль должен содержать не менее 6 символов
 * 
 * @param {string} password - Пароль для проверки
 * @returns {boolean} - true если пароль соответствует требованиям, false в противном случае
 */
const validatePassword = (password) => {
    return password && password.length >= 6;
};

/**
 * Проверка корректности имени пользователя
 * 
 * Имя должно быть не пустым и содержать не более 15 символов
 * 
 * @param {string} name - Имя для проверки
 * @returns {boolean} - true если имя корректно, false в противном случае
 */
const validateName = (name) => {
    return name && name.length > 0 && name.length <= 15;
};

/**
 * Проверка корректности оценки отзыва
 * 
 * Оценка должна быть целым числом от 1 до 5
 * 
 * @param {number} rating - Оценка для проверки
 * @returns {boolean} - true если оценка корректна, false в противном случае
 */
const validateRating = (rating) => {
    return rating >= 1 && rating <= 5 && Number.isInteger(Number(rating));
};

/**
 * Проверка корректности названия ресторана
 * 
 * Название должно быть не пустым и содержать не более 50 символов
 * 
 * @param {string} name - Название ресторана для проверки
 * @returns {boolean} - true если название корректно, false в противном случае
 */
const validateRestaurantName = (name) => {
    return name && name.length > 0 && name.length <= 50;
};

/**
 * Проверка корректности текста комментария
 * 
 * Комментарий должен быть не пустым и содержать не более 1000 символов
 * 
 * @param {string} comment - Текст комментария для проверки
 * @returns {boolean} - true если комментарий корректен, false в противном случае
 */
const validateComment = (comment) => {
    return comment && comment.length > 0 && comment.length <= 1000;
};

module.exports = {
    validateEmail,
    validatePassword,
    validateName,
    validateRating,
    validateRestaurantName,
    validateComment
}; 