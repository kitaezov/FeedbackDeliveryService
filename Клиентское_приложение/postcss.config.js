/**
 * Конфигурационный файл PostCSS
 * 
 * PostCSS - это инструмент для преобразования CSS с помощью JavaScript плагинов.
 * Данный файл определяет используемые плагины и их настройки.
 */

module.exports = {
    plugins: {
        tailwindcss: {}, // Плагин для обработки Tailwind CSS
        autoprefixer: {}, // Автоматически добавляет вендорные префиксы для поддержки разных браузеров
    },
}
