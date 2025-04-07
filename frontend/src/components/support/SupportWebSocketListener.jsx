import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/authContext';
import { handleSupportWebSocketMessage } from '../../utils/supportUtils';
import { API_URL } from '../../config';

/**
 * Компонент для прослушивания WebSocket-событий центра поддержки
 * Не отображается в DOM, но обрабатывает события WebSocket и отображает уведомления
 */
const SupportWebSocketListener = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Если пользователь не авторизован, не устанавливаем соединение
    if (!isAuthenticated || !user) return;

    // Получаем WebSocket-соединение из глобального объекта window
    const ws = window.webSocket;

    // Если соединение не существует или закрыто, не продолжаем
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    // Обработчик сообщений WebSocket
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Передаем данные в обработчик сообщений центра поддержки
        handleSupportWebSocketMessage(data, user, navigate);
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };

    // Добавляем обработчик сообщений
    ws.addEventListener('message', handleMessage);

    // Очистка при размонтировании компонента
    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [isAuthenticated, user, navigate]);

  // Компонент не отображает никакого UI
  return null;
};

export default SupportWebSocketListener; 