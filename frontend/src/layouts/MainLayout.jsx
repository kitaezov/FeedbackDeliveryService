import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/components/Header';
import { Footer } from '../common/components/Footer';
import { Toast } from '../common/components/ui';
import SupportWebSocketListener from '../components/support/SupportWebSocketListener';

/**
 * Основной лейаут приложения с хедером и футером
 */
export const MainLayout = () => {
    return (
        <>
            {/* Основной контейнер с относительным позиционированием */}
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 relative w-full">
                <Header />
                
                <main className="flex-grow relative z-10 w-full container-responsive px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
                    <div className="py-6 w-full">
                        <Outlet />
                    </div>
                </main>
                
                <Footer />
                
                {/* Компонент для отображения уведомлений */}
                <Toast />

                {/* Компонент для прослушивания WebSocket-событий центра поддержки */}
                <SupportWebSocketListener />
            </div>
        </>
    );
}; 