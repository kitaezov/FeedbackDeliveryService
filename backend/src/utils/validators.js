/**
 * Валидаторы
 * 
 * Набор функций для проверки корректности пользовательского ввода.
 * Используется для валидации данных перед сохранением в базу данных
 * и предотвращения ввода некорректных данных.
 */

/**
 * Проверка корректности email адреса
 * 
 * Email должен соответствовать стандартному формату:
 * - Содержать @ и домен
 * - Не содержать специальных символов
 * - Иметь корректную длину
 * 
 * @param {string} email - Email адрес для проверки
 * @returns {boolean} - true если email корректен, false в противном случае
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Проверка корректности пароля
 * 
 * Пароль должен соответствовать следующим требованиям:
 * - Минимум 8 символов
 * - Содержать хотя бы одну цифру
 * - Содержать хотя бы одну букву
 * 
 * @param {string} password - Пароль для проверки
 * @returns {boolean} - true если пароль корректен, false в противном случае
 */
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
};

/**
 * Проверка корректности имени пользователя
 * 
 * Имя должно соответствовать следующим требованиям:
 * - Содержать только буквы, цифры и пробелы
 * - Быть длиной от 2 до 50 символов
 * 
 * @param {string} name - Имя пользователя для проверки
 * @returns {boolean} - true если имя корректно, false в противном случае
 */
const validateName = (name) => {
    const nameRegex = /^[A-Za-zА-Яа-я\s\d]{2,50}$/;
    return nameRegex.test(name);
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

/**
 * Проверка корректности рейтинга
 * 
 * Рейтинг должен быть числом от 1 до 5
 * 
 * @param {number} rating - Значение рейтинга для проверки
 * @returns {boolean} - true если рейтинг корректен, false в противном случае
 */
const validateRating = (rating) => {
    return Number.isInteger(rating) && rating >= 1 && rating <= 5;
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

module.exports = {
    validateEmail,
    validatePassword,
    validateName,
    validateComment,
    validateRating,
    validateRestaurantName
}; 