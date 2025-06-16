import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Компонент вкладок с анимацией переключения
 * 
 * @component
 * @param {Object} props - Свойства компонента
 * @param {Array<TabItem>} props.tabs - Массив вкладок
 * @param {string} [props.activeTab] - Ключ активной вкладки (необязательно, если используется внутреннее состояние)
 * @param {Function} [props.onChange] - Обработчик изменения активной вкладки
 * @param {string} [props.variant='default'] - Вариант отображения вкладок
 * @param {string} [props.className=''] - Дополнительные CSS классы
 * @param {boolean} [props.isDarkMode=false] - Тёмная тема
 * @returns {JSX.Element} React-компонент
 */
export const Tabs = ({
    tabs = [],
    activeTab: externalActiveTab,
    onChange,
    variant = 'default',
    className = '',
    isDarkMode = false,
    ...props
}) => {
    // Внутреннее состояние для управления активной вкладкой, если не предоставлено внешнее
    const [activeTab, setActiveTab] = useState(externalActiveTab || (tabs[0]?.key || ''));
    
    // Определение активной вкладки на основе внешнего состояния или по умолчанию
    useEffect(() => {
        if (externalActiveTab && externalActiveTab !== activeTab) {
            setActiveTab(externalActiveTab);
        } else if (!externalActiveTab && tabs.length > 0 && !tabs.some(tab => tab.key === activeTab)) {
            // Если внешнее состояние не передано и текущей активной вкладки нет в списке
            setActiveTab(tabs[0].key);
        }
    }, [externalActiveTab, tabs]);
    
    // Получаем содержимое активной вкладки
    const getActiveTabContent = () => {
        const activeTabItem = tabs.find(tab => tab.key === activeTab);
        return activeTabItem ? activeTabItem.content : null;
    };
    
    // Обработчик клика по вкладке
    const handleTabClick = (key) => {
        if (key !== activeTab) {
            if (onChange) {
                onChange(key);
            }
            if (!externalActiveTab) {
                setActiveTab(key);
            }
        }
    };
    
    // Получаем стили для вкладок в зависимости от варианта
    const getTabsStyles = () => {
        const variants = {
            'default': {
                container: 'border-b border-gray-200 flex overflow-x-auto scrollbar-none',
                tab: (isActive) => [
                    'px-4 py-2 font-medium text-sm cursor-pointer whitespace-nowrap',
                    isActive 
                        ? `border-b-2 border-gray-700 text-gray-700 ${isDarkMode ? 'text-gray-300 border-gray-500' : ''}` 
                        : `text-gray-500 hover:text-gray-700 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : ''}`,
                ].join(' '),
                indicator: 'hidden',
                content: 'pt-4'
            },
            'pills': {
                container: 'flex flex-wrap gap-2 overflow-x-auto scrollbar-none',
                tab: (isActive) => [
                    'px-4 py-2 rounded-full font-medium text-sm cursor-pointer whitespace-nowrap transition-colors',
                    isActive 
                        ? `bg-gray-700 text-white ${isDarkMode ? 'bg-gray-800 text-gray-300' : ''}` 
                        : `bg-gray-100 text-gray-700 hover:bg-gray-200 ${
                            isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : ''
                          }`,
                ].join(' '),
                indicator: 'hidden',
                content: 'mt-4'
            },
            'buttons': {
                container: 'flex flex-wrap border border-gray-200 rounded-lg overflow-hidden',
                tab: (isActive) => [
                    'px-4 py-2 font-medium text-sm cursor-pointer whitespace-nowrap transition-colors',
                    isActive 
                        ? `bg-gray-100 text-gray-900 ${isDarkMode ? 'bg-gray-700 text-white' : ''}` 
                        : `bg-white text-gray-700 hover:bg-gray-50 ${
                            isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-750' : ''
                          }`,
                ].join(' '),
                indicator: 'hidden',
                content: 'mt-4'
            },
            'underline': {
                container: 'flex relative border-b border-gray-200 overflow-x-auto scrollbar-none',
                tab: (isActive) => [
                    'px-4 py-2 font-medium text-sm cursor-pointer whitespace-nowrap',
                    isActive 
                        ? `text-gray-800 ${isDarkMode ? 'text-gray-300' : ''}` 
                        : `text-gray-500 hover:text-gray-700 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : ''}`,
                ].join(' '),
                indicator: 'absolute bottom-0 h-0.5 bg-gray-700 transition-all duration-300',
                content: 'pt-4'
            }
        };
        
        return variants[variant] || variants.default;
    };
    
    const tabStyles = getTabsStyles();
    
    // Находим индекс активной вкладки для анимированного индикатора
    const activeTabIndex = tabs.findIndex(tab => tab.key === activeTab);
    
    // Анимация для контента вкладок
    const contentVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.3
            }
        },
        exit: { 
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.2
            }
        }
    };
    
    return (
        <div className={className} {...props}>
            <div className={tabStyles.container}>
                {tabs.map((tab) => (
                    <div
                        key={tab.key}
                        className={tabStyles.tab(tab.key === activeTab)}
                        onClick={() => handleTabClick(tab.key)}
                    >
                        {tab.label}
                    </div>
                ))}
                
                {variant === 'underline' && activeTabIndex !== -1 && (
                    <motion.div
                        className={tabStyles.indicator}
                        initial={false}
                        animate={{
                            left: `calc(${activeTabIndex} * (100% / ${tabs.length}) + ((100% / ${tabs.length}) - 100%) / 2)`,
                            width: `calc(100% / ${tabs.length})`,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                )}
            </div>
            
            <div className={tabStyles.content}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {getActiveTabContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

/**
 * @typedef {Object} TabItem
 * @property {string} key - Уникальный ключ вкладки
 * @property {string|React.ReactNode} label - Текст или компонент для заголовка вкладки
 * @property {React.ReactNode} content - Содержимое вкладки
 */

// Проверка типов props
Tabs.propTypes = {
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.node.isRequired,
            content: PropTypes.node.isRequired
        })
    ).isRequired,
    activeTab: PropTypes.string,
    onChange: PropTypes.func,
    variant: PropTypes.oneOf(['default', 'pills', 'buttons', 'underline']),
    className: PropTypes.string,
    isDarkMode: PropTypes.bool
}; 