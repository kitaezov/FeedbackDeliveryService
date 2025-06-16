/**
 * Компонент всплывающих уведомлений для приложения FeedbackDeliveryService
 * 
 * Отображает временные уведомления различных типов (информация, успех, ошибка)
 * с анимацией появления и исчезновения, используя библиотеку Framer Motion.
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

/**
 * Компонент всплывающего уведомления
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.message - Текст сообщения для отображения
 * @param {string} [props.type='info'] - Тип уведомления ('info', 'success', 'error')
 * @param {Function} props.onClose - Функция для закрытия уведомления
 * @param {string|number} props.id - Уникальный идентификатор уведомления
 * @param {number} [props.autoClose=5000] - Время в мс до автоматического закрытия (0 - отключено)
 * @returns {JSX.Element} React-компонент
 */
export const ToastNotification = ({
                                      message,
                                      type = 'info',
                                      onClose,
                                      id,
                                      autoClose = 5000
                                  }) => {

    // Эффект для автоматического закрытия уведомления через указанное время
    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                onClose(id);
            }, autoClose);

            // Очистка таймера при размонтировании компонента
            return () => clearTimeout(timer);
        }
    }, [autoClose, onClose, id]);

    /**
     * Определяет иконку и цвета уведомления в зависимости от типа
     * @returns {Object} Объект с параметрами стилизации
     */
    const getIconAndColors = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircle size={20} />,
                    bg: 'bg-green-50',
                    border: 'border-green-500',
                    iconColor: 'text-green-500'
                };
            case 'error':
                return {
                    icon: <AlertCircle size={20} />,
                    bg: 'bg-red-50',
                    border: 'border-red-500',
                    iconColor: 'text-red-500'
                };
            case 'info':
            default:
                return {
                    icon: <Info size={20} />,
                    bg: 'bg-gray-50',
                    border: 'border-gray-500',
                    iconColor: 'text-gray-500'
                };
        }
    };

    const { icon, bg, border, iconColor } = getIconAndColors();

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex items-start p-4 mb-3 border-l-4 rounded shadow-lg ${bg} ${border}`}
            style={{ maxWidth: '350px' }}
        >
            <div className={`mr-3 ${iconColor}`}>
                {icon}
            </div>
            <div className="flex-1 mr-2">
                <p className="text-sm text-gray-800">{message}</p>
            </div>
            <button
                onClick={() => onClose(id)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Закрыть уведомление"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};