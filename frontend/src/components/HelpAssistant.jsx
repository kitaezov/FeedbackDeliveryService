import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, MessageSquare, ArrowLeft, Send, User, Bot, Paperclip, Clock, Phone, Search, Info, ChevronDown, RefreshCw, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const HelpAssistant = ({ isDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [operatorMode, setOperatorMode] = useState(false);
    const [operatorInfo, setOperatorInfo] = useState(null);
    const [activeChatId, setActiveChatId] = useState(null);
    const [prevChats, setPrevChats] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showRating, setShowRating] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const [faqExpanded, setFaqExpanded] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const chatEndRef = useRef(null);
    const modalRef = useRef(null);
    const fileInputRef = useRef(null);

    // Информация по часто задаваемым вопросам
    const faqItems = [
        {
            question: "Как оформить заказ?",
            answer: "Чтобы оформить заказ, добавьте выбранные блюда в корзину, проверьте состав заказа, укажите адрес доставки и выберите удобный способ оплаты."
        },
        {
            question: "Как отследить статус доставки?",
            answer: "Статус доставки можно отследить в разделе 'Мои заказы'. Там вы увидите текущее местоположение курьера и примерное время прибытия."
        },
        {
            question: "Как получить кэшбэк?",
            answer: "Кэшбэк автоматически начисляется на ваш аккаунт после успешного оформления и получения заказа. Размер кэшбэка составляет 5% от суммы заказа."
        },
        {
            question: "Как изменить данные профиля?",
            answer: "Чтобы изменить данные профиля, перейдите в раздел 'Личный кабинет', нажмите на 'Настройки профиля' и внесите необходимые изменения."
        }
    ];

    // Информация по темам помощи
    const helpTopics = {
        'Техническая поддержка': {
            title: 'Техническая поддержка',
            content: 'Опишите техническую проблему, с которой вы столкнулись. Постарайтесь указать: что именно не работает, на какой странице, и какие действия привели к ошибке.',
            icon: <MessageSquare className="w-4 h-4 mr-2" />
        },
        'Связаться с оператором': {
            title: 'Связаться с оператором',
            content: 'Соединяем вас с первым доступным оператором. Обычно это занимает от 1 до 3 минут.',
            icon: <Phone className="w-4 h-4 mr-2" />
        },
        'История обращений': {
            title: 'История обращений',
            content: 'Здесь отображается история ваших предыдущих обращений.',
            icon: <Clock className="w-4 h-4 mr-2" />
        },
        'Сообщить об ошибке': {
            title: 'Сообщить об ошибке',
            content: 'Пожалуйста, опишите ошибку, с которой вы столкнулись. Укажите: на какой странице возникла проблема, какие действия к ней привели, и прикрепите скриншот, если возможно.',
            icon: <RefreshCw className="w-4 h-4 mr-2" />
        },
        'Вопросы по доставке': {
            title: 'Вопросы по доставке',
            content: 'Расскажите, какие вопросы у вас возникли по доставке заказа. Укажите номер заказа, если он у вас есть.',
            icon: <Info className="w-4 h-4 mr-2" />
        }
    };

    const handleBackFromHistory = () => {
        setSelectedTopic(null); // Сбрасываем выбранную тему
        setChatMessages([]); // Очищаем сообщения

        // Если нужно отобразить стартовое сообщение
        setChatMessages([
            {
                sender: 'support',
                text: 'Выберите тему для начала разговора',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                name: 'Бот поддержки'
            }
        ]);
    }

    const samplePrevChats = [
        {
            id: '1',
            date: '27 марта',
            topic: 'Проблема с доставкой',
            lastMessage: 'Спасибо за ваше обращение! Мы...',
            status: 'Решено'
        },
        {
            id: '2',
            date: '15 марта',
            topic: 'Вопрос по оплате',
            lastMessage: 'Возврат средств будет произведен...',
            status: 'Решено'
        }
    ];

    // Прокрутка чата вниз при добавлении новых сообщений
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    // Инициализация предыдущих чатов
    useEffect(() => {
        setPrevChats(samplePrevChats);
    }, []);

    // Закрытие при клике вне модального окна
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Функция для имитации ответа поддержки
    const simulateResponse = (text, delay = 1000, isOperator = false) => {
        setIsTyping(true);

        setTimeout(() => {
            const supportResponse = {
                sender: isOperator ? 'operator' : 'support',
                text: text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                name: isOperator ? operatorInfo?.name : 'Бот поддержки'
            };

            setChatMessages(prev => [...prev, supportResponse]);
            setIsTyping(false);

            // Если это сообщение от оператора о завершении чата, предлагаем оценить
            if (isOperator && text.includes('Спасибо за обращение')) {
                setTimeout(() => setShowRating(true), 1000);
            }
        }, delay);
    };

    // Проверка авторизации пользователя
    useEffect(() => {
        // Проверяем авторизацию при монтировании компонента
        const checkAuth = () => {
            const localStorageToken = localStorage.getItem('token');
            const sessionStorageToken = sessionStorage.getItem('token');
            const isAuthed = !!(localStorageToken || sessionStorageToken);
            setIsAuthenticated(isAuthed);
            return isAuthed;
        };
        
        // Первоначальная проверка
        checkAuth();

        // Обработчик события для отслеживания изменений в localStorage
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                checkAuth();
            }
        };

        // Обработчик события авторизации из других частей приложения
        const handleAuthEvent = (e) => {
            checkAuth();
        };

        // Регистрируем обработчики событий
        window.addEventListener('storage', handleStorageChange);
        document.addEventListener('auth-changed', handleAuthEvent);
        
        // Проверяем статус авторизации каждый раз при открытии окна помощи
        const handleOpenAssistant = () => {
            if (!isOpen) {
                checkAuth();
            }
        };
        
        // Очистка при размонтировании
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            document.removeEventListener('auth-changed', handleAuthEvent);
        };
    }, [isOpen]);

    // Обработчик выбора темы - доступен только авторизованным пользователям
    const handleTopicSelect = (topic) => {
        if (!isAuthenticated && topic !== 'FAQ') {
            // Показываем сообщение о необходимости авторизации
            setChatMessages([
                {
                    sender: 'support',
                    text: 'Для обращения в службу поддержки необходимо войти в аккаунт. Пожалуйста, авторизуйтесь, чтобы продолжить.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    name: 'Бот поддержки'
                }
            ]);
            setSelectedTopic('Авторизация');
            return;
        }

        setSelectedTopic(topic);
        setActiveChatId(Date.now().toString());

        // Обработка случая "История обращений"
        if (topic === 'История обращений') {
            // Получаем историю предыдущих обращений
            fetchChatHistory();
            return;
        }

        // Если тема существует в helpTopics
        if (helpTopics[topic]) {
            setChatMessages([
                {
                    sender: 'support',
                    text: helpTopics[topic].content,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    name: 'Бот поддержки'
                }
            ]);

            // Если выбрано "Связаться с оператором", подключаем оператора
            if (topic === 'Связаться с оператором') {
                connectToOperator();
            }
        } else {
            // Обработка неизвестных тем
            setChatMessages([
                {
                    sender: 'support',
                    text: 'Выберите тему для начала разговора или опишите ваш вопрос.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    name: 'Бот поддержки'
                }
            ]);
        }
    };

    // Загрузка истории обращений
    const fetchChatHistory = () => {
        setIsTyping(true);
        
        // Здесь должен быть реальный API-запрос к серверу
        // Имитируем задержку получения данных
        setTimeout(() => {
            if (prevChats.length === 0) {
                setChatMessages([
                    {
                        sender: 'support',
                        text: 'У вас пока нет истории обращений. Когда вы обратитесь в поддержку, все ваши запросы будут сохранены здесь.',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        name: 'Бот поддержки'
                    }
                ]);
            } else {
                setChatMessages([
                    {
                        sender: 'support',
                        text: 'Ваша история обращений:',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        name: 'Бот поддержки'
                    }
                ]);
                
                // Добавляем отдельное сообщение для каждого предыдущего обращения
                prevChats.forEach(chat => {
                    setChatMessages(prev => [...prev, {
                        sender: 'support',
                        text: `${chat.date}: ${chat.topic} (${chat.status}) - ${chat.lastMessage}`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        name: 'История',
                        isHistory: true
                    }]);
                });
            }
            
            setIsTyping(false);
        }, 1000);
    };

    // Подключение к оператору
    const connectToOperator = () => {
        setIsTyping(true);

        // Имитация ожидания оператора
        setTimeout(() => {
            setOperatorMode(true);
            const operator = {
                name: 'Анна',
                position: 'Старший специалист'
            };
            setOperatorInfo(operator);

            const operatorResponse = {
                sender: 'operator',
                text: `Здравствуйте! Меня зовут ${operator.name}, я ${operator.position} службы поддержки. Чем я могу вам помочь сегодня?`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                name: operator.name
            };

            setChatMessages(prev => [...prev, operatorResponse]);
            setIsTyping(false);
        }, 3000);
    };

    // Запрос подключения к оператору из обычного чата
    const requestOperator = () => {
        simulateResponse('Сейчас мы подключим вас к первому освободившемуся оператору. Пожалуйста, ожидайте.');
        setTimeout(() => connectToOperator(), 3000);
    };

    // Возврат к выбору темы
    const handleBackToTopics = () => {
        // Сохраняем текущий чат в историю, если он не пустой
        if (chatMessages.length > 0 && activeChatId) {
            // Безопасное получение title с проверкой на существование объекта в helpTopics
            let topicTitle = 'Общий вопрос';
            if (selectedTopic && helpTopics[selectedTopic] && helpTopics[selectedTopic].title) {
                topicTitle = helpTopics[selectedTopic].title;
            }

            const newChat = {
                id: activeChatId,
                date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
                topic: topicTitle,
                lastMessage: chatMessages[chatMessages.length - 1].text.substring(0, 30) + '...',
                status: operatorMode ? 'Отвечено' : 'Автоответ'
            };

            setPrevChats(prev => [newChat, ...prev]);
        }

        setSelectedTopic(null);
        setChatMessages([]);
        setOperatorMode(false);
        setOperatorInfo(null);
        setShowRating(false);
        setSelectedRating(0);
    };

    // Отправка сообщения
    const handleSendMessage = () => {
        if (message.trim() === '') return;

        // Добавляем сообщение пользователя
        const newMessage = {
            sender: 'user',
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            name: 'Вы'
        };

        setChatMessages(prev => [...prev, newMessage]);
        const userMessage = message; // Сохраняем текст сообщения
        setMessage('');

        // Обработка сообщения об ошибке
        if (selectedTopic === 'Сообщить об ошибке') {
            // Отправка сообщения об ошибке на сервер
            sendErrorReport(userMessage)
                .then(response => {
                    simulateResponse(`Ваше сообщение об ошибке успешно зарегистрировано под номером #${response.errorId || 'ERR-' + Math.floor(Math.random() * 10000)}. Наши специалисты уже работают над решением проблемы. Мы свяжемся с вами, как только проблема будет решена. Спасибо за помощь в улучшении нашего сервиса!`);
                })
                .catch(error => {
                    console.error('Ошибка при отправке сообщения об ошибке:', error);
                    simulateResponse("Извините, произошла проблема при регистрации вашего сообщения. Пожалуйста, попробуйте отправить сообщение ещё раз или свяжитесь с оператором напрямую, выбрав соответствующий пункт в меню.");
                });
            return;
        }
        
        // Обработка вопросов по доставке
        if (selectedTopic === 'Вопросы по доставке') {
            // Проверяем наличие номера заказа в сообщении пользователя
            const orderNumberMatch = userMessage.match(/\b(?:заказ[а]?|order)(?:\s+?№?)(\d+)\b/i);
            const hasOrderNumber = orderNumberMatch !== null;
            
            if (hasOrderNumber) {
                const orderNumber = orderNumberMatch[1];
                setTimeout(() => {
                    simulateResponse(`Спасибо за обращение по заказу №${orderNumber}. Наш оператор получит всю информацию по этому заказу и свяжется с вами в ближайшее время. Хотите ли вы получить текущий статус заказа?`);
                }, 1000);
            } else {
                setTimeout(() => {
                    simulateResponse("Для более быстрой обработки вашего вопроса, пожалуйста, укажите номер заказа в формате 'заказ №12345'. Если у вас нет номера заказа, опишите проблему как можно подробнее, и мы постараемся помочь.");
                }, 1000);
            }
            return;
        }

        // Разные ответы в зависимости от режима
        if (operatorMode) {
            // Случайная задержка для реалистичности
            const randomDelay = 2000 + Math.random() * 3000;
            
            // Анализ сообщения пользователя
            const containsGreeting = /^(привет|здравствуйте|добрый день|доброе утро|добрый вечер|hi|hello)/i.test(userMessage);
            const containsGratitude = /(спасибо|благодарю|помогли|супер|отлично)/i.test(userMessage);
            const containsFarewell = /(до свидания|пока|всего хорошего|спасибо за помощь|все понятно)/i.test(userMessage);
            const containsComplaint = /(проблема|не работает|ошибка|неправильно|плохо|некорректно)/i.test(userMessage);
            const containsQuestion = /(\?|как|когда|почему|зачем|что|где|кто|какой|чем|сколько)/i.test(userMessage);
            
            if (containsFarewell) {
                simulateResponse(`Спасибо за обращение в нашу службу поддержки! Нам важно знать ваше мнение о качестве обслуживания. Не могли бы вы оценить наш разговор?`, randomDelay, true);
                setTimeout(() => setShowRating(true), randomDelay + 1000);
            } else if (containsGreeting) {
                simulateResponse(`Здравствуйте! Рада, что могу вам помочь. Расскажите, пожалуйста, подробнее о вашем вопросе.`, randomDelay, true);
            } else if (containsGratitude) {
                simulateResponse(`Всегда рада помочь! Если возникнут еще вопросы, обращайтесь в любое время.`, randomDelay, true);
            } else if (containsComplaint) {
                simulateResponse(`Я понимаю вашу обеспокоенность. Давайте вместе разберёмся с этой проблемой. Расскажите, пожалуйста, более подробно: когда именно возникла проблема и что вы пытались сделать в этот момент?`, randomDelay, true);
            } else if (containsQuestion) {
                simulateResponse(`Хороший вопрос. Я проверяю информацию и вернусь к вам с ответом через минуту.`, randomDelay, true);
                
                // Имитация дополнительной проверки и более подробного ответа
                setTimeout(() => {
                    simulateResponse(`Я проверила всю доступную информацию по вашему вопросу. В нашей базе знаний есть несколько решений. Сейчас я подготовлю для вас наиболее подходящий ответ с учетом вашей ситуации.`, randomDelay + 10000, true);
                }, randomDelay + 1000);
            } else {
                // Перечень более содержательных и естественных ответов
                const responses = [
                    `Благодарю вас за предоставленную информацию. Я внимательно изучила ваш вопрос и хочу уточнить несколько деталей. Какой браузер и устройство вы используете? Это поможет нам точнее определить причину проблемы.`,
                    `Я проанализировала ваш запрос и вижу, что ситуация нестандартная. Я бы хотела создать для вас индивидуальное решение. Могу я уточнить, когда именно вы впервые столкнулись с этой проблемой?`,
                    `Спасибо за подробное описание. Я вижу две возможные причины проблемы. Давайте проверим сначала наиболее вероятную. Не могли бы вы попробовать очистить кеш браузера и повторить операцию?`,
                    `Я внимательно ознакомилась с вашим запросом. Для полного решения вопроса мне потребуется консультация с нашими техническими специалистами. Если вы не возражаете, я оформлю запрос и вернусь к вам с детальным решением в течение 2 часов. Оставайтесь на связи.`
                ];

                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                simulateResponse(randomResponse, randomDelay, true);
            }
        } else {
            // Автоматические ответы бота поддержки
            if (selectedTopic === 'Техническая поддержка') {
                // Проверка наличия ключевых слов для классификации запроса
                const isLoginIssue = /(логин|вход|авторизац|пароль|login|не могу войти)/i.test(userMessage);
                const isPaymentIssue = /(оплат|платеж|деньг|карт|payment|payment|refund|возврат)/i.test(userMessage);
                const isAppIssue = /(приложение|не работает|глючит|тормозит|зависает|app|application)/i.test(userMessage);
                
                if (isLoginIssue) {
                    simulateResponse("Похоже, у вас проблема с входом в систему. Вот несколько рекомендаций:\n\n1. Проверьте правильность ввода email и пароля\n2. Убедитесь, что Caps Lock выключен\n3. Попробуйте сбросить пароль через функцию восстановления\n\nЕсли эти шаги не помогли, хотите, чтобы я подключил вас к специалисту?");
                } else if (isPaymentIssue) {
                    simulateResponse("Я вижу, у вас вопрос по оплате. Для решения финансовых вопросов требуется верификация. Подключаю вас к оператору финансового отдела...");
                    setTimeout(() => connectToOperator(), 3000);
                } else if (isAppIssue) {
                    simulateResponse("Для решения технических проблем с приложением рекомендую следующие шаги:\n\n1. Обновите приложение до последней версии\n2. Перезапустите устройство\n3. Проверьте подключение к интернету\n\nПомогли ли вам эти рекомендации?");
                } else {
                    const generalResponses = [
                        "Спасибо за обращение в техническую поддержку. Чтобы я мог лучше помочь вам, пожалуйста, укажите более конкретно, с какой проблемой вы столкнулись?",
                        "Я получил ваш запрос. Для более точной помощи, не могли бы вы указать, на каком устройстве и в каком браузере у вас возникла проблема?",
                        "Благодарю за сообщение. Чтобы решить вашу проблему быстрее, пожалуйста, опишите, какие действия привели к ошибке и какое сообщение вы видите на экране."
                    ];
                    
                    const response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
                    simulateResponse(response);
                }
            } else {
                // Стандартные ответы для других тем
                const botResponses = [
                    'Спасибо за ваше обращение. Мы обработаем ваш запрос в ближайшее время. Хотите, чтобы с вами связался оператор для более детального разбора вопроса?',
                    'Благодарим за обращение. Ваш запрос зарегистрирован в системе. Оператор ответит вам в течение 15 минут. Желаете ли вы получить уведомление о статусе вашего обращения по email?',
                    'Ваш запрос принят в обработку. Чтобы мы могли быстрее решить ваш вопрос, не могли бы вы указать дополнительную информацию или номер заказа?',
                    'Мы получили ваше сообщение. Для оперативного решения вашего вопроса, рекомендуем связаться с оператором. Подключить вас к первому доступному специалисту?'
                ];

                const randomBotResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
                simulateResponse(randomBotResponse);
            }
        }
    };

    // Функция для отправки сообщения об ошибке на сервер
    const sendErrorReport = async (errorMessage) => {
        try {
            // Получаем токен из localStorage
            const token = localStorage.getItem('token');
            
            // В реальном приложении должен быть запрос к API
            // Имитируем задержку и успешный ответ
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Возвращаем успешный результат с ID ошибки
            return {
                success: true,
                errorId: 'ERR-' + Math.floor(Math.random() * 10000),
                message: 'Сообщение об ошибке успешно сохранено'
            };
            
            /* Раскомментируйте для реального использования API
            const response = await api.post('/support/error-report', {
                message: errorMessage,
                location: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });

            return response.data;
            */
        } catch (error) {
            console.error('Ошибка при отправке отчета:', error);
            throw error;
        }
    };

    // Обработчик отправки файла
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Имитация отправки файла
        const fileMessage = {
            sender: 'user',
            text: `Отправлен файл: ${file.name}`,
            isFile: true,
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(1)} КБ`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            name: 'Вы'
        };

        setChatMessages(prev => [...prev, fileMessage]);

        // Имитация ответа службы поддержки на отправку файла
        if (operatorMode) {
            simulateResponse('Спасибо за отправленный файл. Я ознакомлюсь с ним и дам ответ в ближайшее время.', 2000, true);
        } else {
            simulateResponse('Файл успешно получен и прикреплен к вашему обращению.');
        }

        setShowFileUpload(false);
    };

    // Обработчик поиска в предыдущих чатах
    const handleSearch = () => {
        // В реальном приложении здесь был бы запрос к API
        // Для примера просто имитируем задержку
        setTimeout(() => {
            // Результаты поиска
        }, 500);
    };

    // Открытие предыдущего чата
    const openPreviousChat = (chatId) => {
        // В реальном приложении здесь был бы запрос к API
        // Для примера создаем фиктивные сообщения
        const sampleChat = [
            {
                sender: 'support',
                text: 'Здравствуйте! Чем мы можем вам помочь?',
                time: '14:23',
                name: 'Бот поддержки'
            },
            {
                sender: 'user',
                text: 'У меня проблема с заказом №12345',
                time: '14:25',
                name: 'Вы'
            },
            {
                sender: 'operator',
                text: 'Здравствуйте! Меня зовут Михаил, я специалист службы поддержки. Сейчас проверю информацию по вашему заказу.',
                time: '14:26',
                name: 'Михаил'
            },
            {
                sender: 'operator',
                text: 'Я проверил ваш заказ. К сожалению, произошла задержка в доставке. Курьер будет у вас в течение 20 минут. Приносим извинения за неудобства.',
                time: '14:30',
                name: 'Михаил'
            },
            {
                sender: 'user',
                text: 'Спасибо за информацию!',
                time: '14:32',
                name: 'Вы'
            },
            {
                sender: 'operator',
                text: 'Всегда рады помочь! Если у вас возникнут еще вопросы, обращайтесь.',
                time: '14:33',
                name: 'Михаил'
            }
        ];

        setActiveChatId(chatId);
        setChatMessages(sampleChat);
        setSelectedTopic('История обращения');
    };

    // Оценка чата
    const handleRating = (rating) => {
        setSelectedRating(rating);

        setTimeout(() => {
            simulateResponse('Благодарим за оценку! Ваше мнение очень важно для нас.', 500);
            setShowRating(false);
        }, 500);
    };

    // Переключение состояния FAQ
    const toggleFaqItem = (index) => {
        setFaqExpanded(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };
};

export default HelpAssistant;