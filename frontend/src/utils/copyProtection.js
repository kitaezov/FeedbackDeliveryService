/**
 * Утилиты для защиты контента от массового копирования
 * Запрещает использование Ctrl+A, но позволяет копировать выделенные фрагменты
 */

/**
 * Инициализирует защиту от массового копирования (Ctrl+A)
 */
export const initCopyProtection = () => {
  document.addEventListener('keydown', preventSelectAll);
};

/**
 * Предотвращает использование Ctrl+A (Select All)
 * @param {KeyboardEvent} event - объект события клавиатуры
 */
const preventSelectAll = (event) => {
  // Проверяем комбинацию Ctrl+A (код клавиши A - 65)
  if ((event.ctrlKey || event.metaKey) && event.keyCode === 65) {
    event.preventDefault();
    console.log('Ctrl+A заблокирован');
  }
};

/**
 * Удаляет защиту от массового копирования
 */
export const removeCopyProtection = () => {
  document.removeEventListener('keydown', preventSelectAll);
}; 