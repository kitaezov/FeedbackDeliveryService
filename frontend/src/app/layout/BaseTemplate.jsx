/**
 * Компонент базового шаблона страницы
 * 
 * Предоставляет общую структуру для типовых страниц приложения
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '../../common/components/ui/Card';
import { LoadingSpinner } from '../../common/components/ui/LoadingSpinner';

/**
 * Компонент базового шаблона страницы
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.title - Заголовок страницы
 * @param {string} [props.description] - Описание страницы
 * @param {ReactNode} props.children - Основное содержимое
 * @param {boolean} [props.isLoading=false] - Индикатор загрузки
 * @param {ReactNode} [props.headerActions] - Дополнительные действия в заголовке 
 * @param {ReactNode} [props.sidebar] - Боковая панель (если есть)
 * @param {string} [props.sidebarPosition='right'] - Позиция боковой панели ('left' или 'right')
 * @param {boolean} [props.fullWidth=false] - Занимать полную ширину контейнера
 * @param {boolean} [props.showCard=true] - Отображать содержимое в карточке
 * @returns {JSX.Element} React-компонент
 */
export const BaseTemplate = ({
    title,
    description,
    children,
    isLoading = false,
    headerActions,
    sidebar,
    sidebarPosition = 'right',
    fullWidth = false,
    showCard = true
}) => {
    // Отображение контента в зависимости от флага загрузки
    const renderContent = () => {
        if (isLoading) {
            return <LoadingSpinner size="large" fullPage={false} />;
        }
        
        if (showCard) {
            return (
                <Card>
                    <div className="p-6">
                        {children}
                    </div>
                </Card>
            );
        }
        
        return children;
    };
    
    // Отображение с учетом боковой панели
    const renderWithSidebar = () => {
        const contentClasses = fullWidth ? 'w-full' : 'max-w-4xl mx-auto';
        const mainContentClasses = sidebar ? (sidebarPosition === 'left' ? 'md:ml-4' : 'md:mr-4') : '';
        
        // Если нет сайдбара - просто возвращаем контент
        if (!sidebar) {
            return (
                <div className={contentClasses}>
                    {renderContent()}
                </div>
            );
        }
        
        // С сайдбаром
        return (
            <div className={`flex flex-col md:flex-row ${contentClasses}`}>
                {sidebarPosition === 'left' && (
                    <div className="w-full md:w-1/4 mb-4 md:mb-0">
                        {sidebar}
                    </div>
                )}
                
                <div className={`w-full ${sidebar ? 'md:w-3/4' : 'w-full'} ${mainContentClasses}`}>
                    {renderContent()}
                </div>
                
                {sidebarPosition === 'right' && (
                    <div className="w-full md:w-1/4 mt-4 md:mt-0">
                        {sidebar}
                    </div>
                )}
            </div>
        );
    };
    
    return (
        <div className="w-full">
            {/* Заголовок страницы */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{title}</h1>
                        {description && (
                            <p className="mt-1 text-gray-500">{description}</p>
                        )}
                    </div>
                    
                    {headerActions && (
                        <div className="mt-4 md:mt-0 flex items-center space-x-2">
                            {headerActions}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Основное содержимое с сайдбаром или без */}
            {renderWithSidebar()}
        </div>
    );
};

// Проверка типов props
BaseTemplate.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    children: PropTypes.node.isRequired,
    isLoading: PropTypes.bool,
    headerActions: PropTypes.node,
    sidebar: PropTypes.node,
    sidebarPosition: PropTypes.oneOf(['left', 'right']),
    fullWidth: PropTypes.bool,
    showCard: PropTypes.bool
}; 