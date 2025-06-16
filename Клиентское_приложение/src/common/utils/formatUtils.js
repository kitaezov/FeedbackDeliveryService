/**
 * Утилиты для форматирования различных типов данных
 */

/**
 * Форматирует адрес объекта для отображения
 * 
 * @param {Object} address - Объект с данными адреса
 * @param {string} address.street - Улица
 * @param {string} address.building - Номер дома
 * @param {string} address.city - Город
 * @param {string} address.state - Область/штат
 * @param {string} address.zip - Почтовый индекс
 * @param {string} address.country - Страна
 * @returns {string} - Отформатированный адрес
 */
export const formatAddress = (address) => {
    if (!address) return 'Адрес не указан';
    
    // Составляем массив из непустых компонентов адреса
    const addressParts = [];
    
    if (address.street && address.building) {
        addressParts.push(`${address.street}, ${address.building}`);
    } else if (address.street) {
        addressParts.push(address.street);
    }
    
    if (address.city) addressParts.push(address.city);
    if (address.state) addressParts.push(address.state);
    if (address.zip) addressParts.push(address.zip);
    if (address.country) addressParts.push(address.country);
    
    return addressParts.join(', ') || 'Адрес не указан';
};

/**
 * Форматирование даты в локализованный формат
 * 
 * @param {string|Date} date - Дата в ISO формате или объект Date
 * @param {Object} options - Параметры форматирования
 * @param {boolean} options.showTime - Показывать ли время
 * @param {string} options.locale - Локаль для форматирования (по умолчанию ru-RU)
 * @returns {string} - Отформатированная дата
 */
export const formatDate = (date, { showTime = false, locale = 'ru-RU' } = {}) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Проверка на валидность даты
    if (isNaN(dateObj.getTime())) return '';
    
    // Проверка на то, является ли время полуночью (00:00)
    const isDefaultTime = dateObj.getHours() === 0 && dateObj.getMinutes() === 0;
    
    // Если время 00:00 или showTime=false, не показываем время
    const shouldShowTime = showTime && !isDefaultTime;
    
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...(shouldShowTime && {
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    return dateObj.toLocaleDateString(locale, options);
};

/**
 * Форматирование числа в денежный формат
 * 
 * @param {number} amount - Сумма
 * @param {Object} options - Параметры форматирования
 * @param {string} options.currency - Валюта (по умолчанию RUB)
 * @param {string} options.locale - Локаль для форматирования (по умолчанию ru-RU)
 * @returns {string} - Отформатированная сумма
 */
export const formatCurrency = (amount, { currency = 'RUB', locale = 'ru-RU' } = {}) => {
    if (amount === null || amount === undefined) return '';
    
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Форматирование числа в читаемый формат с разделителями разрядов
 * 
 * @param {number} number - Число для форматирования
 * @param {Object} options - Параметры форматирования
 * @param {number} options.decimals - Количество десятичных знаков
 * @param {string} options.locale - Локаль для форматирования (по умолчанию ru-RU)
 * @returns {string} - Отформатированное число
 */
export const formatNumber = (number, { decimals = 0, locale = 'ru-RU' } = {}) => {
    if (number === null || number === undefined) return '';
    
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number);
};

/**
 * Форматирование числа со склонением существительного
 * 
 * @param {number} number - Число
 * @param {string[]} words - Массив слов для склонения [одна штука, две штуки, пять штук]
 * @returns {string} - Число с правильным склонением слова
 */
export const pluralize = (number, words) => {
    const num = Math.abs(number) % 100;
    const num1 = num % 10;
    
    if (num > 10 && num < 20) return `${number} ${words[2]}`;
    if (num1 > 1 && num1 < 5) return `${number} ${words[1]}`;
    if (num1 === 1) return `${number} ${words[0]}`;
    
    return `${number} ${words[2]}`;
};

/**
 * Сокращение длинных строк
 * 
 * @param {string} text - Текст для сокращения
 * @param {number} maxLength - Максимальная длина текста
 * @param {string} ellipsis - Строка для обозначения сокращения
 * @returns {string} - Сокращенный текст
 */
export const truncateText = (text, maxLength = 100, ellipsis = '...') => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}; 