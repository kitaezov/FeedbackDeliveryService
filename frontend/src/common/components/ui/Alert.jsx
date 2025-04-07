import React from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Alert component for displaying notifications to users
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Alert type (info, success, warning, error)
 * @param {React.ReactNode} props.children - Alert content
 * @param {boolean} props.dismissible - Whether the alert can be dismissed
 * @param {Function} props.onDismiss - Function to call when alert is dismissed
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export const Alert = ({
    type = 'info',
    children,
    dismissible = false,
    className = '',
    onDismiss
}) => {
    // Определяем стили для разных типов уведомлений
    const typeStyles = {
        info: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700',
        success: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    };
    
    // Иконки для разных типов уведомлений
    const icons = {
        info: <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>,
        success: <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>,
        warning: <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>,
        error: <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
    };
    
    return (
        <div className={`flex items-center p-4 mb-4 border rounded-lg ${typeStyles[type]} ${className}`} role="alert">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3">
                {icons[type]}
            </div>
            <div className="flex-1 text-sm font-medium">
                {children}
            </div>
            {dismissible && (
                <button
                    type="button"
                    className={`ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 ${
                        type === 'info' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' :
                        type === 'success' ? 'bg-green-100 text-green-500 hover:bg-green-200 focus:ring-green-400 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800' :
                        type === 'warning' ? 'bg-yellow-100 text-yellow-500 hover:bg-yellow-200 focus:ring-yellow-400 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800' :
                        'bg-red-100 text-red-500 hover:bg-red-200 focus:ring-red-400 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
                    }`}
                    onClick={onDismiss}
                >
                    <span className="sr-only">Закрыть</span>
                    <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                </button>
            )}
        </div>
    );
};

// Проверка типов props
Alert.propTypes = {
    type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    dismissible: PropTypes.bool,
    onDismiss: PropTypes.func
}; 