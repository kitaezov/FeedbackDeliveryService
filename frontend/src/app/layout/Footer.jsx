/**
 * Компонент футера приложения
 * 
 * Отображает информацию внизу страницы
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Компонент футера
 * 
 * @param {Object} props - Свойства компонента
 * @param {boolean} [props.isDarkMode=false] - Режим темной темы
 * @returns {JSX.Element} React-компонент
 */
export const Footer = ({ isDarkMode = false }) => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className={`
            w-full border-t mt-12
            ${isDarkMode ? 'bg-gray-900 text-gray-300 border-gray-800' : 'bg-gray-100 text-gray-700 border-gray-200'}
        `}>
            <div className="container max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row md:justify-between gap-8">
                    <div className="md:w-1/3 md:pr-8">
                        <Link to="/" className="font-bold text-xl inline-block mb-3">
                            FeedbackService
                        </Link>
                        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Сервис отзывов о ресторанах и доставке еды. Мы помогаем клиентам находить лучшие рестораны и делиться своими впечатлениями.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">
                                Компания
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link 
                                        to="/about" 
                                        className={`text-sm hover:underline ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}
                                    >
                                        О нас
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/contacts" 
                                        className={`text-sm hover:underline ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}
                                    >
                                        Контакты
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">
                                Правовая информация
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link 
                                        to="/privacy" 
                                        className={`text-sm hover:underline ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}
                                    >
                                        Политика конфиденциальности
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/terms" 
                                        className={`text-sm hover:underline ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}
                                    >
                                        Условия использования
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <p className="text-sm text-center">
                        &copy; {currentYear} FeedbackService. Все права защищены.
                    </p>
                </div>
            </div>
        </footer>
    );
};

// Проверка типов props
Footer.propTypes = {
    isDarkMode: PropTypes.bool
}; 