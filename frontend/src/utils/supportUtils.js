/**
 * Утилиты для работы с WebSocket в центре поддержки
 */

import { toast } from 'react-toastify';
import { API_URL } from '../config';

/**
 * Обработчик WebSocket-сообщений для центра поддержки
 * @param {Object} data - Данные WebSocket сообщения
 * @param {Object} user - Текущий пользователь
 * @param {Function} navigate - Функция навигации
 */
export const handleSupportWebSocketMessage = (data, user, navigate) => {
  if (!data || !user) return;

  try {
    // Тип сообщения WebSocket
    const { type } = data;

    // Обработка различных типов сообщений
    switch (type) {
      case 'new_support_ticket':
        handleNewSupportTicket(data, user, navigate);
        break;
      
      case 'support_message':
        handleNewSupportMessage(data, user, navigate);
        break;
      
      case 'support_ticket_status_change':
        handleTicketStatusChange(data, user);
        break;
      
      default:
        // Неизвестный тип сообщения
        break;
    }
  } catch (error) {
    console.error('Ошибка при обработке WebSocket-сообщения:', error);
  }
};

/**
 * Обработка сообщения о новом тикете
 * @param {Object} data - Данные сообщения
 * @param {Object} user - Текущий пользователь
 * @param {Function} navigate - Функция навигации
 */
const handleNewSupportTicket = (data, user, navigate) => {
  const { ticket } = data;

  // Показываем уведомление только для менеджеров и администраторов
  if (['manager', 'admin', 'head_admin'].includes(user.role)) {
    toast.info(
      <div>
        <p className="font-medium mb-1">Новый тикет в поддержку</p>
        <p className="text-sm mb-1">Тема: {ticket.subject}</p>
        <p className="text-sm mb-2">От: {ticket.user_name}</p>
        <button 
          onClick={() => navigate(`/support/tickets/${ticket.id}`)}
          className="px-4 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 mt-1"
        >
          Просмотреть
        </button>
      </div>,
      {
        autoClose: 10000, // 10 секунд
        position: "top-right",
        closeOnClick: false,
      }
    );
  }
};

/**
 * Обработка сообщения о новом сообщении в тикете
 * @param {Object} data - Данные сообщения
 * @param {Object} user - Текущий пользователь
 * @param {Function} navigate - Функция навигации
 */
const handleNewSupportMessage = (data, user, navigate) => {
  const { message, ticket_id, sender_name, is_staff_reply } = data;

  // Для обычных пользователей показываем уведомления только о сообщениях персонала
  // Для персонала показываем уведомления о сообщениях пользователей
  const shouldNotify = 
    (['manager', 'admin', 'head_admin'].includes(user.role) && !is_staff_reply) ||
    (!['manager', 'admin', 'head_admin'].includes(user.role) && is_staff_reply);

  if (shouldNotify) {
    toast.info(
      <div>
        <p className="font-medium mb-1">Новое сообщение в тикете #{ticket_id}</p>
        <p className="text-sm mb-1">От: {sender_name}</p>
        <p className="text-sm mb-2 italic">{message.length > 50 ? `${message.substring(0, 50)}...` : message}</p>
        <button 
          onClick={() => navigate(`/support/tickets/${ticket_id}`)}
          className="px-4 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 mt-1"
        >
          Просмотреть
        </button>
      </div>,
      {
        autoClose: 8000, // 8 секунд
        position: "top-right",
      }
    );
  }
};

/**
 * Обработка сообщения об изменении статуса тикета
 * @param {Object} data - Данные сообщения
 * @param {Object} user - Текущий пользователь
 */
const handleTicketStatusChange = (data, user) => {
  const { ticket_id, new_status, changed_by } = data;

  // Обычным пользователям показываем уведомления об изменении статуса их тикетов
  if (!['manager', 'admin', 'head_admin'].includes(user.role)) {
    let statusText = '';
    switch (new_status) {
      case 'open':
        statusText = 'открыт';
        break;
      case 'in_progress':
        statusText = 'в работе';
        break;
      case 'closed':
        statusText = 'закрыт';
        break;
      default:
        statusText = new_status;
    }

    toast.info(
      `Статус тикета #${ticket_id} изменен на "${statusText}" пользователем ${changed_by}`,
      {
        autoClose: 5000,
        position: "top-right",
      }
    );
  }
}; 