import React from 'react';
import PropTypes from 'prop-types';

/**
 * Компонент пагинации
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Текущая страница
 * @param {number} props.totalPages - Общее количество страниц
 * @param {Function} props.onPageChange - Обработчик изменения страницы
 * @param {number} props.siblingCount - Количество страниц для отображения слева и справа от текущей
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element}
 */
export const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    siblingCount = 1,
    className = ''
}) => {
    // Если страница всего одна, не отображаем пагинацию
    if (totalPages <= 1) return null;
    
    // Функция для генерации массива страниц для отображения
    const generatePagesArray = () => {
        // Всегда показываем первую и последнюю страницу
        const firstPage = 1;
        const lastPage = totalPages;
        
        // Определяем диапазон страниц для показа вокруг текущей страницы
        let startPage = Math.max(1, currentPage - siblingCount);
        let endPage = Math.min(totalPages, currentPage + siblingCount);
        
        // Проверяем, нужны ли точки в начале
        const showStartEllipsis = startPage > 1 + 1;
        
        // Проверяем, нужны ли точки в конце
        const showEndEllipsis = endPage < totalPages - 1;
        
        // Создаем массив страниц для отображения
        const pages = [];
        
        // Всегда добавляем первую страницу
        pages.push(firstPage);
        
        // Добавляем точки в начале, если нужно
        if (showStartEllipsis) {
            pages.push('ellipsis-start');
        }
        
        // Добавляем страницы в середине (если они не первая и не последняя)
        for (let i = startPage; i <= endPage; i++) {
            if (i !== firstPage && i !== lastPage) {
                pages.push(i);
            }
        }
        
        // Добавляем точки в конце, если нужно
        if (showEndEllipsis) {
            pages.push('ellipsis-end');
        }
        
        // Добавляем последнюю страницу, если она не является первой
        if (lastPage !== firstPage) {
            pages.push(lastPage);
        }
        
        return pages;
    };
    
    // Генерируем массив страниц
    const pages = generatePagesArray();
    
    return (
        <nav className={`flex justify-center mt-6 ${className}`}>
            <ul className="flex items-center space-x-2 shadow-sm p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                {/* Кнопка "Предыдущая" */}
                <li>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md border text-sm transition-all duration-200
                            ${currentPage === 1 
                                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        aria-label="Previous Page"
                    >
                        <svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </li>
                
                {/* Кнопки страниц */}
                {pages.map((page, index) => {
                    // Для точек
                    if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                        return (
                            <li key={page}>
                                <span className="px-3 py-2 text-gray-500 dark:text-gray-400">
                                    ...
                                </span>
                            </li>
                        );
                    }
                    
                    // Для обычных страниц
                    return (
                        <li key={index}>
                            <button
                                onClick={() => onPageChange(page)}
                                className={`px-3 py-2 rounded-md border text-sm transition-all duration-200
                                    ${currentPage === page 
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md dark:bg-blue-700 dark:border-blue-700' 
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                                aria-current={currentPage === page ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        </li>
                    );
                })}
                
                {/* Кнопка "Следующая" */}
                <li>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-md border text-sm transition-all duration-200
                            ${currentPage === totalPages 
                                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        aria-label="Next Page"
                    >
                        <svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

// Проверка типов props
Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    siblingCount: PropTypes.number,
    className: PropTypes.string
}; 