/**
 * Модуль контекста уведомлений для приложения FeedbackDeliveryService
 * 
 * Этот модуль предоставляет контекст React для управления всплывающими уведомлениями
 * во всем приложении. Использует React Context API для доступа к функциям
 * создания и удаления уведомлений из любого компонента.
 */

import React, { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastNotification } from './ToastNotification';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';

// Создание контекста для уведомлений
const NotificationContext = createContext();

/**
 * Хук для использования контекста уведомлений в компонентах
 * 
 * @returns {Object} Объект с методами для работы с уведомлениями 
 */
export const useNotification = () => {
    return useContext(NotificationContext);
};

/**
 * Провайдер контекста уведомлений
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 * @returns {JSX.Element} React-компонент провайдера
 */
export const NotificationProvider = ({ children }) => {
    // Состояние для хранения активных уведомлений
    const [notifications, setNotifications] = useState([]);

    /**
     * Добавление нового уведомления
     * 
     * @param {string} message - Текст сообщения
     * @param {string} [type='info'] - Тип уведомления ('info', 'success', 'error')
     * @param {number} [autoClose=5000] - Время в мс до автоматического закрытия (0 - отключено)
     * @returns {string} Уникальный идентификатор созданного уведомления
     */
    const addNotification = (message, type = 'info', autoClose = 5000) => {
        const id = uuidv4();
        setNotifications(prev => [...prev, { id, message, type, autoClose }]);
        return id;
    };

    /**
     * Удаление уведомления по идентификатору
     * 
     * @param {string} id - Идентификатор уведомления для удаления
     */
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    // Вспомогательные методы для разных типов уведомлений
    
    /**
     * Создание уведомления об успешном действии
     * @param {string} message - Текст сообщения
     * @param {number} [autoClose] - Время автоматического закрытия
     * @returns {string} ID уведомления
     */
    const notifySuccess = (message, autoClose) => addNotification(message, 'success', autoClose);
    
    /**
     * Создание уведомления об ошибке
     * @param {string} message - Текст сообщения
     * @param {number} [autoClose] - Время автоматического закрытия
     * @returns {string} ID уведомления
     */
    const notifyError = (message, autoClose) => addNotification(message, 'error', autoClose);
    
    /**
     * Создание информационного уведомления
     * @param {string} message - Текст сообщения
     * @param {number} [autoClose] - Время автоматического закрытия
     * @returns {string} ID уведомления
     */
    const notifyInfo = (message, autoClose) => addNotification(message, 'info', autoClose);

    // Значение контекста с публичными методами
    const contextValue = {
        addNotification,
        removeNotification,
        notifySuccess,
        notifyError,
        notifyInfo
    };

    /**
     * Компонент-контейнер для отображения всех активных уведомлений
     * Использует React Portal для рендеринга вне DOM-иерархии
     * 
     * @returns {React.ReactPortal|null} Портал с компонентами уведомлений
     */
    const NotificationContainer = () => {
        // Проверяем, есть ли DOM доступ для портала
        if (typeof window === 'undefined') return null;

        return createPortal(
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                <AnimatePresence>
                    {notifications.map(({ id, message, type, autoClose }) => (
                        <ToastNotification
                            key={id}
                            id={id}
                            message={message}
                            type={type}
                            autoClose={autoClose}
                            onClose={removeNotification}
                        />
                    ))}
                </AnimatePresence>
            </div>,
            document.body
        );
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            <NotificationContainer />
        </NotificationContext.Provider>
    );
};

NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired
}; 