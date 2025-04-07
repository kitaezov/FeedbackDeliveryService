import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Container, 
    Button, 
    Heading,
    Card
} from '../../../common/components/ui';
import { TopRestaurants } from '../../restaurants/components';

/**
 * Главная страница приложения
 */
export const HomePage = () => {
    return (
        <Container size="full" className="px-4 sm:px-6 md:px-8 w-full">
            {/* Главный баннер */}
            <section className="py-12 md:py-20 text-center">
                <div className="max-w-6xl mx-auto">
                    <Heading level={1} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Рейтинг ресторанов от реальных посетителей
                    </Heading>
                    
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                        Ищите лучшие рестораны по отзывам и рейтингам от других пользователей. 
                        Делитесь своими впечатлениями!
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to="/restaurants">
                            <Button variant="primary" size="large">
                                Все рестораны
                            </Button>
                        </Link>
                        
                        <Link to="/profile/reviews">
                            <Button variant="secondary" size="large">
                                Мои отзывы
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
            
            {/* Секция с популярными ресторанами */}
            <div className="mb-12 w-full">
                <TopRestaurants />
            </div>
            
            {/* Секция с преимуществами сервиса */}
            <section className="py-12 mt-12 w-full">
                <div className="mb-8 text-center">
                    <Heading level={2} className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Почему стоит использовать наш сервис
                    </Heading>
                    <p className="text-gray-600 dark:text-gray-400">
                        Мы предлагаем удобный и надежный способ поиска ресторанов и обмена отзывами
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Честные отзывы
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Все отзывы на нашем сервисе оставлены реальными посетителями, 
                            которые поделились своим опытом.
                        </p>
                    </Card>
                    
                    <Card className="p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Удобный поиск
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Используйте фильтры по рейтингу, кухне и другим параметрам, 
                            чтобы найти идеальный ресторан для любого случая.
                        </p>
                    </Card>
                    
                    <Card className="p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Сообщество
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Станьте частью сообщества ценителей хорошей еды, делитесь своими 
                            впечатлениями и находите единомышленников.
                        </p>
                    </Card>
                </div>
            </section>
            
            {/* Призыв к действию */}
            <section className="py-12 mt-8 bg-primary-50 dark:bg-primary-900 rounded-lg">
                <div className="text-center">
                    <Heading level={2} className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Готовы поделиться своим мнением?
                    </Heading>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Присоединяйтесь к нашему сообществу и помогите другим найти лучшие рестораны
                    </p>
                    <Link to="/restaurants">
                        <Button variant="primary" size="large">
                            Начать сейчас
                        </Button>
                    </Link>
                </div>
            </section>
        </Container>
    );
}; 