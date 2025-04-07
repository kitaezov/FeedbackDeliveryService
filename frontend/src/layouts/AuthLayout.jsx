import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Toast } from '../common/components/ui';

/**
 * Лейаут для страниц авторизации
 */
export const AuthLayout = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <div className="flex flex-col min-h-screen relative">
            {/* Background with blur */}
            <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-0"></div>
            <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 z-0"></div>
            
            {/* Content container */}
            <div className="flex flex-col min-h-screen relative z-10 backdrop-blur-sm">
                {/* Шапка */}
                <header className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 backdrop-blur-md shadow-sm py-4 relative z-20">
                    <div className="container mx-auto px-4 w-full max-w-full">
                        <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-500">
                            Restaurant Reviews
                        </Link>
                    </div>
                </header>
                
                {/* Основной контент */}
                <main className="flex-1 flex items-center justify-center w-full py-8 px-4 sm:px-6 md:px-8 lg:px-10">
                    {/* Animated blur circles */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                    </div>
                    
                    <div className="w-full max-w-full">
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg 
                                      backdrop-blur-2xl bg-opacity-60 dark:bg-opacity-70 
                                      border border-gray-100 dark:border-gray-700 p-6
                                      transition-all duration-500 hover:shadow-2xl">
                            <Outlet />
                        </div>
                    </div>
                </main>
                
                {/* Футер */}
                <footer className="w-full border-t mt-12 bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 backdrop-blur-md text-gray-600 dark:text-gray-400 relative z-20">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex flex-col items-center">
                            <Link to="/" className="font-semibold text-lg mb-2">
                                Restaurant Reviews
                            </Link>
                            <p className="text-sm mb-2 text-center">
                                Сервис отзывов о ресторанах и доставке еды
                            </p>
                            <p className="text-sm">
                                © {currentYear} Restaurant Reviews. Все права защищены.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
            
            {/* Компонент для отображения уведомлений */}
            <Toast />
        </div>
    );
}; 