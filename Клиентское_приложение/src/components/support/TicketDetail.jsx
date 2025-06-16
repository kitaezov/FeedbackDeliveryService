import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../../config';
import { useAuth } from '../../features/auth/authContext';
import Spinner from '../common/Spinner';

// Компонент для отображения статуса тикета с соответствующим цветом
const TicketStatusBadge = ({ status }) => {
  let bgColor = 'bg-gray-200';
  let textColor = 'text-gray-800';
  let statusText = 'Неизвестно';

  switch (status) {
    case 'open':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      statusText = 'Открыт';
      break;
    case 'in_progress':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      statusText = 'В работе';
      break;
    case 'closed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      statusText = 'Закрыт';
      break;
    default:
      break;
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {statusText}
    </span>
  );
};

// Компонент для отображения приоритета тикета
const TicketPriorityBadge = ({ priority }) => {
  let bgColor = 'bg-gray-200';
  let textColor = 'text-gray-800';
  let priorityText = 'Неизвестно';

  switch (priority) {
    case 'low':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      priorityText = 'Низкий';
      break;
    case 'medium':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      priorityText = 'Средний';
      break;
    case 'high':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      priorityText = 'Высокий';
      break;
    default:
      break;
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {priorityText}
    </span>
  );
};

// Компонент для отображения сообщения
const Message = ({ message, isCurrentUser, isStaff }) => {
  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-xl p-4 rounded-lg ${
          isStaff 
            ? 'bg-blue-100 border border-blue-200' 
            : isCurrentUser 
              ? 'bg-green-100 border border-green-200' 
              : 'bg-gray-100 border border-gray-200'
        }`}
      >
        <div className="flex items-center mb-2">
          <span className="font-semibold text-sm">{message.user_name}</span>
          {isStaff && (
            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              Поддержка
            </span>
          )}
        </div>
        <p className="text-gray-800 whitespace-pre-wrap break-words">{message.message}</p>
        <div className="mt-1 text-right">
          <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const messagesEndRef = useRef(null);
  
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  
  const isStaff = user && ['manager', 'admin', 'head_admin'].includes(user.role);

  // Прокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Загрузка данных тикета
  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/support/tickets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTicket(response.data.data.ticket);
      setMessages(response.data.data.messages);
    } catch (error) {
      console.error('Ошибка при загрузке тикета:', error);
      if (error.response && error.response.status === 404) {
        toast.error('Тикет не найден');
        navigate('/support');
      } else if (error.response && error.response.status === 403) {
        toast.error('У вас нет доступа к этому тикету');
        navigate('/support');
      } else {
        toast.error('Не удалось загрузить данные тикета');
      }
    } finally {
      setLoading(false);
    }
  };

  // Отправка нового сообщения
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }
    
    try {
      setSending(true);
      const response = await axios.post(
        `${API_URL}/api/support/tickets/${id}/messages`,
        { message: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Обновляем список сообщений и очищаем поле ввода
      const updatedMessages = [...messages, response.data.data];
      setMessages(updatedMessages);
      setNewMessage('');
      
      // Обновляем статус тикета, если он изменился
      if (ticket.status === 'closed') {
        fetchTicket();
      }
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      toast.error('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  // Обновление статуса тикета (для персонала поддержки)
  const handleUpdateStatus = async (newStatus) => {
    try {
      setStatusLoading(true);
      await axios.patch(
        `${API_URL}/api/support/tickets/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Обновляем тикет и сообщения
      fetchTicket();
      toast.success(`Статус тикета изменен на "${newStatus === 'open' ? 'Открыт' : newStatus === 'in_progress' ? 'В работе' : 'Закрыт'}"`);
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      toast.error('Не удалось обновить статус тикета');
    } finally {
      setStatusLoading(false);
    }
  };

  // Обновление приоритета тикета (для персонала поддержки)
  const handleUpdatePriority = async (newPriority) => {
    try {
      await axios.patch(
        `${API_URL}/api/support/tickets/${id}/priority`,
        { priority: newPriority },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Обновляем тикет
      fetchTicket();
      toast.success(`Приоритет тикета изменен на "${newPriority === 'low' ? 'Низкий' : newPriority === 'medium' ? 'Средний' : 'Высокий'}"`);
    } catch (error) {
      console.error('Ошибка при обновлении приоритета:', error);
      toast.error('Не удалось обновить приоритет тикета');
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchTicket();
  }, [id, token]);

  // Прокрутка к последнему сообщению при загрузке и добавлении новых сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600">Тикет не найден или у вас нет к нему доступа.</p>
          <button
            onClick={() => navigate('/support')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Вернуться к списку тикетов
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col lg:flex-row lg:gap-6">
        {/* Информация о тикете */}
        <div className="w-full lg:w-1/3 mb-6 lg:mb-0">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-gray-800">Тикет #{ticket.id}</h1>
              <button
                onClick={() => navigate('/support')}
                className="text-blue-600 hover:text-blue-800"
              >
                Назад к списку
              </button>
            </div>
            
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800">{ticket.subject}</h2>
              <p className="text-sm text-gray-600">Создан: {formatDate(ticket.created_at)}</p>
              {ticket.updated_at !== ticket.created_at && (
                <p className="text-sm text-gray-600">Обновлен: {formatDate(ticket.updated_at)}</p>
              )}
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <span className="text-sm text-gray-700 mr-2">Статус:</span>
                <TicketStatusBadge status={ticket.status} />
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">Приоритет:</span>
                <TicketPriorityBadge priority={ticket.priority} />
              </div>
            </div>
            
            {/* Управление тикетом (для персонала) */}
            {isStaff && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-md font-medium text-gray-800 mb-3">Управление тикетом</h3>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateStatus('open')}
                      disabled={ticket.status === 'open' || statusLoading}
                      className={`px-3 py-1.5 text-xs rounded-md ${
                        ticket.status === 'open'
                          ? 'bg-yellow-200 text-yellow-800 cursor-default'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      Открыт
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('in_progress')}
                      disabled={ticket.status === 'in_progress' || statusLoading}
                      className={`px-3 py-1.5 text-xs rounded-md ${
                        ticket.status === 'in_progress'
                          ? 'bg-blue-200 text-blue-800 cursor-default'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      В работе
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('closed')}
                      disabled={ticket.status === 'closed' || statusLoading}
                      className={`px-3 py-1.5 text-xs rounded-md ${
                        ticket.status === 'closed'
                          ? 'bg-green-200 text-green-800 cursor-default'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      Закрыт
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Приоритет
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdatePriority('low')}
                      disabled={ticket.priority === 'low'}
                      className={`px-3 py-1.5 text-xs rounded-md ${
                        ticket.priority === 'low'
                          ? 'bg-gray-200 text-gray-800 cursor-default'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Низкий
                    </button>
                    <button
                      onClick={() => handleUpdatePriority('medium')}
                      disabled={ticket.priority === 'medium'}
                      className={`px-3 py-1.5 text-xs rounded-md ${
                        ticket.priority === 'medium'
                          ? 'bg-orange-200 text-orange-800 cursor-default'
                          : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                      }`}
                    >
                      Средний
                    </button>
                    <button
                      onClick={() => handleUpdatePriority('high')}
                      disabled={ticket.priority === 'high'}
                      className={`px-3 py-1.5 text-xs rounded-md ${
                        ticket.priority === 'high'
                          ? 'bg-red-200 text-red-800 cursor-default'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      Высокий
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Чат с сообщениями */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow flex flex-col h-[600px]">
            {/* Заголовок чата */}
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Переписка</h2>
            </div>
            
            {/* Сообщения */}
            <div className="flex-grow overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Сообщений пока нет</p>
                </div>
              ) : (
                <div>
                  {messages.map(message => (
                    <Message
                      key={message.id}
                      message={message}
                      isCurrentUser={message.user_id === user.id}
                      isStaff={message.is_staff_reply}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Форма отправки сообщения */}
            <div className="p-4 border-t">
              {ticket.status === 'closed' && !isStaff ? (
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <p className="text-gray-600">Этот тикет закрыт. Вы не можете отправлять сообщения.</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex">
                  <textarea
                    className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Введите сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows="2"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className="px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? 'Отправка...' : 'Отправить'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail; 