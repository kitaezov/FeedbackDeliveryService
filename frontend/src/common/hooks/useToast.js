import { useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * Хук для работы с уведомлениями (тостами)
 * 
 * @returns {Object} - Объект с методами для показа уведомлений
 */
export const useToast = () => {
    /**
     * Показать уведомление с заданными параметрами
     * 
     * @param {Object} options - Параметры уведомления
     * @param {string} options.title - Заголовок уведомления
     * @param {string} options.description - Текст уведомления
     * @param {string} options.type - Тип уведомления (success, error, warning, info)
     * @param {Object} options.config - Дополнительные настройки для react-toastify
     */
    const showToast = useCallback(({ title, description, type = 'info', config = {} }) => {
        const content = (
            <div>
                {title && <div className="font-semibold">{title}</div>}
                {description && <div className="text-sm mt-1">{description}</div>}
            </div>
        );
        
        // Настройки по умолчанию
        const defaultConfig = {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        };
        
        // Объединяем настройки
        const toastConfig = {
            ...defaultConfig,
            ...config
        };
        
        // Вызываем соответствующий метод в зависимости от типа
        switch (type) {
            case 'success':
                toast.success(content, toastConfig);
                break;
            case 'error':
                toast.error(content, toastConfig);
                break;
            case 'warning':
                toast.warning(content, toastConfig);
                break;
            case 'info':
            default:
                toast.info(content, toastConfig);
                break;
        }
    }, []);
    
    /**
     * Показать информационное уведомление
     * 
     * @param {string} title - Заголовок уведомления
     * @param {string} description - Текст уведомления
     * @param {Object} config - Дополнительные настройки
     */
    const showInfo = useCallback((title, description, config = {}) => {
        showToast({ title, description, type: 'info', config });
    }, [showToast]);
    
    /**
     * Показать уведомление об успехе
     * 
     * @param {string} title - Заголовок уведомления
     * @param {string} description - Текст уведомления
     * @param {Object} config - Дополнительные настройки
     */
    const showSuccess = useCallback((title, description, config = {}) => {
        showToast({ title, description, type: 'success', config });
    }, [showToast]);
    
    /**
     * Показать уведомление об ошибке
     * 
     * @param {string} title - Заголовок уведомления
     * @param {string} description - Текст уведомления
     * @param {Object} config - Дополнительные настройки
     */
    const showError = useCallback((title, description, config = {}) => {
        showToast({ title, description, type: 'error', config });
    }, [showToast]);
    
    /**
     * Показать предупреждающее уведомление
     * 
     * @param {string} title - Заголовок уведомления
     * @param {string} description - Текст уведомления
     * @param {Object} config - Дополнительные настройки
     */
    const showWarning = useCallback((title, description, config = {}) => {
        showToast({ title, description, type: 'warning', config });
    }, [showToast]);
    
    /**
     * Закрыть все активные уведомления
     */
    const dismissAll = useCallback(() => {
        toast.dismiss();
    }, []);
    
    return {
        showToast,
        showInfo,
        showSuccess,
        showError,
        showWarning,
        dismissAll
    };
}; 