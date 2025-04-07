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

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  // Проверка, имеет ли пользователь права доступа
  const isAuthorized = user && ['manager', 'admin', 'head_admin'].includes(user.role);

  // Загрузка всех тикетов
  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Формирование параметров запроса на основе фильтров
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      
      const response = await axios.get(`${API_URL}/api/support/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });
      
      setTickets(response.data.data);
    } catch (error) {
      console.error('Ошибка при загрузке тикетов:', error);
      if (error.response && error.response.status === 403) {
        toast.error('У вас нет доступа к этой странице');
        navigate('/');
      } else {
        toast.error('Не удалось загрузить список тикетов');
      }
    } finally {
      setLoading(false);
    }
  };

  // Загрузка тикетов при монтировании компонента и изменении фильтров
  useEffect(() => {
    if (isAuthorized) {
      fetchTickets();
    } else {
      navigate('/');
      toast.error('У вас нет доступа к этой странице');
    }
  }, [token, filters, isAuthorized]);

  // Обработка изменения фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Сброс фильтров
  const resetFilters = () => {
    setFilters({
      status: '',
      priority: ''
    });
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

  if (!isAuthorized) {
    return null; // Компонент не будет отображаться для неавторизованных пользователей
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl bg-white rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Управление тикетами поддержки</h1>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Фильтры</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Все статусы</option>
                <option value="open">Открыт</option>
                <option value="in_progress">В работе</option>
                <option value="closed">Закрыт</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Приоритет
              </label>
              <select
                id="priority"
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Все приоритеты</option>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Сбросить фильтры
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Список тикетов */}
      {loading ? (
        <div className="flex justify-center my-8">
          <Spinner size="lg" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">Нет тикетов, соответствующих выбранным фильтрам.</p>
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
                  Пользователь
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
                  Последнее обновление
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map(ticket => (
                <tr 
                  key={ticket.id} 
                  className={`hover:bg-gray-50 ${
                    ticket.status === 'open' && ticket.priority === 'high' 
                      ? 'bg-red-50'
                      : ticket.status === 'open'
                        ? 'bg-yellow-50'
                        : ''
                  }`}
                >
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                    #{ticket.id}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-sm text-gray-800">{ticket.user_name}</div>
                    <div className="text-xs text-gray-500">{ticket.user_email}</div>
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
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(ticket.updated_at)}
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

export default AdminSupportTickets; 