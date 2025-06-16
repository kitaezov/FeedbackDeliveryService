import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Компонент модального окна
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Состояние открытия модального окна
 * @param {Function} props.onClose - Функция закрытия окна
 * @param {string} props.title - Заголовок модального окна
 * @param {React.ReactNode} props.children - Содержимое модального окна
 * @param {string} props.size - Размер модального окна (sm, md, lg, xl)
 * @returns {JSX.Element|null}
 */
export const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md' 
}) => {
    // Ссылка на внутренний контейнер модального окна
    const modalRef = useRef(null);
    
    // Определяем размер модального окна
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        'full': 'max-w-full'
    };
    
    // Обработчик клика вне модального окна
    const handleOutsideClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };
    
    // Обработчик нажатия клавиши Escape
    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };
    
    // Добавляем и удаляем обработчики событий
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
            document.addEventListener('keydown', handleEscapeKey);
            
            // Блокируем прокрутку страницы
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscapeKey);
            
            // Восстанавливаем прокрутку страницы
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);
    
    // Если модальное окно не открыто, ничего не рендерим
    if (!isOpen) {
        return null;
    }
    
    // Создаем портал для рендеринга модального окна вне иерархии компонентов
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div 
                ref={modalRef}
                className={`w-full ${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Заголовок модального окна */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 
                        id="modal-title" 
                        className="text-lg font-medium text-gray-900 dark:text-white"
                    >
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                        aria-label="Закрыть"
                    >
                        <svg 
                            className="h-6 w-6" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M6 18L18 6M6 6l12 12" 
                            />
                        </svg>
                    </button>
                </div>
                
                {/* Содержимое модального окна */}
                <div className="px-6 py-4">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}; 