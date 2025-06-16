import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Компонент хлебных крошек для навигации
 * 
 * @param {Object} props
 * @param {Array} props.items - Массив объектов с label и href
 * @param {string} props.className - Дополнительные CSS классы
 * @param {string} props.separator - Символ-разделитель между элементами
 * @returns {JSX.Element}
 */
export const Breadcrumb = ({ items = [], className = '', separator = '/' }) => {
    if (!items.length) return null;
    
    return (
        <nav className={`flex ${className}`} aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    
                    return (
                        <li key={index} className="inline-flex items-center">
                            {index > 0 && (
                                <span className="mx-2 text-gray-500 dark:text-gray-400">
                                    {separator}
                                </span>
                            )}
                            
                            {isLast ? (
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.href}
                                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}; 