import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const UserSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const navigate = useNavigate();
  const { token } = useAuth();

  // Загрузка тикетов пользователя
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/support/user/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTickets(response.data.data);
    } catch (error) {
      console.error('Ошибка при загрузке тикетов:', error);
      toast.error('Не удалось загрузить ваши обращения');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка тикетов при монтировании компонента
  useEffect(() => {
    fetchTickets();
  }, [token]);

  // Обработка изменений в полях формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Создание нового тикета
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/support/tickets`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Обращение успешно создано!');
      setFormData({
        subject: '',
        message: '',
        priority: 'medium'
      });
      setShowForm(false);
      fetchTickets();
    } catch (error) {
      console.error('Ошибка при создании тикета:', error);
      toast.error('Не удалось создать обращение. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Переход к просмотру тикета
  const handleViewTicket = (id) => {
    navigate(`/support/tickets/${id}`);
  };

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
    <div className="container mx-auto p-4 max-w-6xl bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Мои обращения в поддержку</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          {showForm ? 'Отменить' : 'Новое обращение'}
        </button>
      </div>

      {/* Форма создания тикета */}
      {showForm && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Создать новое обращение</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Тема *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Сообщение *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Приоритет
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                disabled={loading}
              >
                {loading ? 'Отправка...' : 'Отправить'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список тикетов */}
      {loading ? (
        <div className="flex justify-center my-8">
          <Spinner size="lg" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">У вас пока нет обращений в поддержку.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Создать первое обращение
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тема
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Приоритет
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата создания
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                    #{ticket.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 max-w-xs truncate">
                    {ticket.subject}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <TicketStatusBadge status={ticket.status} />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <TicketPriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(ticket.created_at)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewTicket(ticket.id)}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Просмотреть
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserSupportTickets; 