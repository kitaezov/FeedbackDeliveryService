import React from 'react';
import { Mail, Phone, MessageCircle, Clock } from 'lucide-react';

/**
 * Компонент футера
 * 
 * @param {Object} props - Свойства компонента
 * @param {boolean} [props.isDarkMode=false] - Режим темной темы
 * @returns {JSX.Element} React-компонент
 */
export const Footer = ({ isDarkMode = false }) => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className={`w-full border-t mt-auto ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700'
        }`}>
            <div className="container-responsive py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Company Info */}
                    <div className="flex flex-col">
                        <h3 className="text-lg font-semibold mb-4">О компании FeedbackDelivery</h3>
                        <p className="text-sm leading-relaxed">
                            Мы специализированная служба оценки доставки еды. Помогаем клиентам находить лучшие сервисы
                            доставки и делиться своими впечатлениями о качестве блюд, скорости доставки и обслуживании.
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col">
                        <h3 className="text-lg font-semibold mb-4">Контактная информация</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center">
                                <Phone className="icon-sm mr-3 flex-shrink-0" />
                                <span className="text-sm">+7 (911) 846-75-25</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="icon-sm mr-3 flex-shrink-0" />
                                <span className="text-sm">info@feedbackdelivery.ru</span>
                            </li>
                            <li className="flex items-center">
                                <MessageCircle className="icon-sm mr-3 flex-shrink-0" />
                                <span className="text-sm">Telegram: @feedbackdeliverychannel</span>
                            </li>
                        </ul>
                    </div>

                    {/* Service Hours & Legal */}
                    <div className="flex flex-col">
                        <h3 className="text-lg font-semibold mb-4">Часы работы</h3>
                        <div className="flex items-start mb-4">
                            <Clock className="icon-sm mr-3 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p>Техническая поддержка:</p>
                                <p>Круглосуточно</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <p className="text-sm text-center">
                        © {currentYear} FeedbackDelivery. Все права защищены.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 