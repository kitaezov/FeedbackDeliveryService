/** @type {import('tailwindcss').Config} */

<<<<<<< HEAD
/**
 * Конфигурационный файл Tailwind CSS
 * 
 * Определяет настройки для фреймворка CSS, включая:
 * - Пути к файлам, которые должны быть обработаны
 * - Расширения темы
 * - Плагины
 */
module.exports = {
  // Указывает файлы, которые будут просканированы на наличие классов Tailwind
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // Включаем поддержку темной темы
  darkMode: 'class',
  // Настройки темы оформления
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
      colors: {
        // Цвета для светлой темы
        light: {
          background: '#ffffff',
          text: '#1a202c',
          primary: '#3f51b5',
          secondary: '#f50057',
          accent: '#f5f5f5',
        },
        // Цвета для темной темы
        dark: {
          background: '#1a202c',
          text: '#f7fafc',
          primary: '#90cdf4',
          secondary: '#f687b3',
          accent: '#2d3748',
        }
      },
      backgroundColor: {
        primary: 'var(--color-bg-primary)',
        secondary: 'var(--color-bg-secondary)',
      },
      textColor: {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
      },
    },
  },
  // Дополнительные плагины Tailwind
=======
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // Убедитесь, что пути настроены правильно
  ],
  theme: {
    extend: {},
  },
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
  plugins: [],
}
