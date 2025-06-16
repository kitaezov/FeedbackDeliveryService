import React from 'react';
import PropTypes from 'prop-types';
import { Utensils } from 'lucide-react';
import ImageLoader from './ImageLoader';

/**
 * Компонент для отображения изображений ресторанов с обработкой ошибок
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.src - URL изображения
 * @param {string} props.alt - Альтернативный текст
 * @param {string} props.className - CSS классы
 * @param {string} props.fallbackSrc - URL запасного изображения при ошибке
 * @param {Object} props.style - Инлайн стили
 * @param {Function} props.onLoad - Обработчик успешной загрузки
 * @param {Function} props.onError - Обработчик ошибки загрузки
 * @returns {JSX.Element} - React-компонент
 */
const RestaurantImage = ({
  src,
  alt,
  className = '',
  restaurantName,
  fallbackIcon = true,
  ...props
}) => {
  const defaultFallback = (
    <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}>
      {fallbackIcon && <Utensils className="w-1/3 h-1/3 text-gray-400" />}
    </div>
  );

  // Если нет URL изображения, сразу показываем заглушку
  if (!src) {
    return defaultFallback;
  }

  return (
    <ImageLoader
      src={src}
      alt={alt || `Изображение ресторана ${restaurantName || ''}`}
      className={`${className} restaurant-image`}
      fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGMEYwRjAiLz48cGF0aCBkPSJNODAgMTEwSDEyME0xMDAgOTBWMTMwIiBzdHJva2U9IiNBMEEwQTAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
      {...props}
    />
  );
};

RestaurantImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  restaurantName: PropTypes.string,
  fallbackIcon: PropTypes.bool
};

export default RestaurantImage; 