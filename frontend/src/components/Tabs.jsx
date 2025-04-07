import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

// Контекст для передачи состояния между компонентами
const TabsContext = createContext(null);

/**
 * Компонент вкладок (tabs)
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние элементы (компоненты Tab)
 * @param {string} props.defaultValue - Значение активной вкладки по умолчанию
 * @param {function} props.onValueChange - Колбэк при изменении активной вкладки
 * @param {string} props.value - Значение активной вкладки (контролируемый компонент)
 * @param {string} props.className - Дополнительные CSS классы
 * @param {boolean} props.isDarkMode - Включена ли темная тема
 */
export const Tabs = ({
  children,
  defaultValue,
  onValueChange,
  value: controlledValue,
  className = '',
  isDarkMode = false,
  ...props
}) => {
  // Состояние для неконтролируемого компонента
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  
  // Определяем, является ли компонент контролируемым
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  
  // Обработчик изменения активной вкладки
  const handleValueChange = (newValue) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };
  
  // Определяем классы для разных тем
  const themeClasses = isDarkMode 
    ? 'border-gray-700 bg-gray-900 text-gray-300' 
    : 'border-gray-200 bg-white text-gray-700';
  
  return (
    <TabsContext.Provider value={{ value, onChange: handleValueChange }}>
      <div className={`${className} ${themeClasses}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

/**
 * Компонент списка вкладок
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние элементы (компоненты TabTrigger)
 * @param {string} props.className - Дополнительные CSS классы
 * @param {boolean} props.isDarkMode - Включена ли темная тема
 */
export const TabsList = ({ 
  children, 
  className = '',
  isDarkMode = false,
  ...props 
}) => {
  // Определяем классы для разных тем
  const themeClasses = isDarkMode 
    ? 'border-b border-gray-700 bg-gray-900' 
    : 'border-b border-gray-200 bg-white';
  
  return (
    <div 
      className={`flex space-x-4 ${themeClasses} ${className}`}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Компонент триггера вкладки (кнопка вкладки)
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Содержимое вкладки
 * @param {string} props.value - Значение вкладки
 * @param {string} props.className - Дополнительные CSS классы
 * @param {boolean} props.isDarkMode - Включена ли темная тема
 */
export const TabsTrigger = ({ 
  children, 
  value, 
  className = '',
  isDarkMode = false,
  ...props 
}) => {
  const { value: selectedValue, onChange } = useContext(TabsContext);
  const isSelected = selectedValue === value;
  
  // Определяем классы для разных состояний и тем
  const baseClasses = 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors';
  const selectedClasses = isSelected 
    ? (isDarkMode 
        ? 'border-indigo-400 text-indigo-400' 
        : 'border-indigo-500 text-indigo-600')
    : (isDarkMode 
        ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300');
  
  return (
    <button
      role="tab"
      aria-selected={isSelected}
      className={`${baseClasses} ${selectedClasses} ${className}`}
      onClick={() => onChange(value)}
      tabIndex={isSelected ? 0 : -1}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Компонент контента вкладки
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Содержимое вкладки
 * @param {string} props.value - Значение вкладки
 * @param {string} props.className - Дополнительные CSS классы
 * @param {boolean} props.isDarkMode - Включена ли темная тема
 */
export const TabsContent = ({ 
  children, 
  value, 
  className = '',
  isDarkMode = false,
  ...props 
}) => {
  const { value: selectedValue } = useContext(TabsContext);
  const isSelected = selectedValue === value;
  
  if (!isSelected) {
    return null;
  }
  
  // Определяем классы для разных тем
  const themeClasses = isDarkMode ? 'bg-gray-800' : 'bg-white';
  
  return (
    <div 
      role="tabpanel"
      className={`p-4 ${themeClasses} ${className}`}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Компонент Tab - упрощенная обертка для быстрого использования
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Содержимое вкладки
 * @param {string} props.value - Значение вкладки
 * @param {string} props.label - Заголовок вкладки
 * @param {boolean} props.isDarkMode - Включена ли темная тема
 */
export const Tab = ({
  children,
  value,
  label,
  isDarkMode = false,
  ...props
}) => {
  return (
    <TabsContent value={value} isDarkMode={isDarkMode} {...props}>
      {children}
    </TabsContent>
  );
};

// PropTypes
Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string,
  onValueChange: PropTypes.func,
  value: PropTypes.string,
  className: PropTypes.string,
  isDarkMode: PropTypes.bool
};

TabsList.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  isDarkMode: PropTypes.bool
};

TabsTrigger.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  className: PropTypes.string,
  isDarkMode: PropTypes.bool
};

TabsContent.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  className: PropTypes.string,
  isDarkMode: PropTypes.bool
};

Tab.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isDarkMode: PropTypes.bool
};

// Экспорт компонентов
export { TabsContext }; 