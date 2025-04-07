import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from './LoadingSpinner';

/**
 * Компонент оптимизированной загрузки изображений с обработкой ошибок
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.src - URL изображения
 * @param {string} props.alt - Альтернативный текст
 * @param {string} props.className - CSS классы
 * @param {string} props.fallbackSrc - URL запасного изображения при ошибке
 * @param {Object} props.style - Инлайн стили
 * @param {Function} props.onLoad - Обработчик успешной загрузки
 * @param {Function} props.onError - Обработчик ошибки загрузки
 * @param {number} props.maxRetries - Максимальное количество попыток загрузки
 * @param {boolean} props.isDarkMode - Флаг темной темы
 * @returns {JSX.Element} - React-компонент
 */
const ImageLoader = ({
  src,
  alt,
  className,
  fallbackSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgMTJDMTIuMjA5MSAxMiAxNCAxMC4yMDkxIDE0IDhDMTQgNS43OTA4NiAxMi4yMDkxIDQgMTAgNEM3Ljc5MDg2IDQgNiA1Ljc5MDg2IDYgOEM2IDEwLjIwOTEgNy43OTA4NiAxMiAxMCAxMloiIGZpbGw9IiM2QjcyODAiLz48cGF0aCBkPSJNMTAgMEMyLjIzODU4IDAgLTMuMzk1MDZlLTA3IDIuMjM4NTggLTMuOTc5MDNlLTA3IDEwQy00LjU2MzAxZS0wNyAxNy43NjE0IDIuMjM4NTggMjAgMTAgMjBDMTcuNzYxNCAyMCAyMCAxNy43NjE0IDIwIDEwQzIwIDIuMjM4NTggMTcuNzYxNCAwIDEwIDBaTTE2LjkxOTEgMTYuOTE5MUMxNS40MzA4IDE4LjQwNzUgMTIuNzYxMyAxOCAxMCAxOEM3LjIzODc0IDE4IDQuNTY5MTggMTguNDA3NSAzLjA4MDg5IDE2LjkxOTFDMS41OTI1OSAxNS40MzA4IDIgMTIuNzYxMyAyIDEwQzIgNy4yMzg3NCAxLjU5MjU5IDQuNTY5MTggMy4wODA4OSAzLjA4MDg5QzQuNTY5MTggMS41OTI1OSA3LjIzODc0IDIgMTAgMkMxMi43NjEzIDIgMTUuNDMwOCAxLjU5MjU5IDE2LjkxOTEgMy4wODA4OUMxOC40MDc1IDQuNTY5MTggMTggNy4yMzg3NCAxOCAxMEMxOCAxMi43NjEzIDE4LjQwNzUgMTUuNDMwOCAxNi45MTkxIDE2LjkxOTFaIiBmaWxsPSIjNkI3MjgwIi8+PC9zdmc+',
  style = {},
  onLoad,
  onError,
  maxRetries = 3,
  isDarkMode = false,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retries, setRetries] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const imgRef = useRef(null);

  // Проверяем, является ли URL уже data:URL
  const isDataUrl = (url) => url && url.startsWith('data:');
  
  // Проверяем, является ли URL внешним (не локальным)
  const isExternalUrl = (url) => {
    if (!url || isDataUrl(url)) return false;
    return url.startsWith('http') && !url.includes('localhost') && !url.includes('127.0.0.1');
  };

  // Проверяем, содержит ли URL timestamp параметр
  const hasTimestamp = (url) => {
    if (!url || isDataUrl(url)) return false;
    return url.includes('t=') || url.includes('timestamp=');
  };

  // Добавляет параметр к URL для предотвращения кеширования
  function addCacheBuster(url) {
    if (!url) return null;
    
    // Не добавляем cache buster к data URLs
    if (isDataUrl(url)) return url;
    
    // Если параметр времени уже есть, не добавляем новый
    if (hasTimestamp(url)) return url;
    
    // Проверяем, содержит ли URL уже параметры
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }

  // Устанавливаем начальное значение src с cache buster при монтировании
  useEffect(() => {
    console.log(`ImageLoader: инициализация с src=${src}`);
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      console.error('ImageLoader: пустой src');
      return;
    }

    if (isDataUrl(src)) {
      console.log('ImageLoader: обнаружен data:URL');
    }
    
    setImgSrc(addCacheBuster(src));
    setIsLoading(true);
    setHasError(false);
    setRetries(0);
    setUseFallback(false);
  }, [src]);

  // Специальная обработка для случаев, когда изображение невидимо
  useEffect(() => {
    // Проверяем, является ли изображение действительно загруженным, но скрытым
    const checkVisibility = () => {
      if (imgRef.current && imgRef.current.complete && !imgRef.current.naturalWidth) {
        console.log('ImageLoader: изображение загружено, но имеет нулевой размер');
        handleError({ target: imgRef.current });
      }
    };

    // Запускаем проверку после того, как изображение должно загрузиться
    const timer = setTimeout(checkVisibility, 1000);
    
    return () => clearTimeout(timer);
  }, [imgSrc]);

  const handleLoad = (e) => {
    console.log(`Изображение загружено: ${imgSrc?.substring(0, 30)}...`);
    
    // Дополнительная проверка на нулевые размеры
    if (e.target.naturalWidth === 0 || e.target.naturalHeight === 0) {
      console.error('Изображение загружено с нулевыми размерами');
      handleError(e);
      return;
    }
    
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    console.error(`Ошибка загрузки изображения: ${imgSrc?.substring(0, 30)}...`);
    
    // Пробуем повторно загрузить изображение с другим cache buster
    if (retries < maxRetries && !isDataUrl(src) && !useFallback) {
      console.log(`Повторная попытка загрузки (${retries + 1}/${maxRetries})...`);
      setRetries(retries + 1);
      
      // Принудительно добавляем новый timestamp при каждой попытке
      const newSrc = src + (src.includes('?') ? '&' : '?') + `t=${Date.now()}_${retries}`;
      setImgSrc(newSrc);
      return;
    }
    
    // Если все попытки исчерпаны, используем fallback
    setIsLoading(false);
    setHasError(true);
    
    if (!useFallback && fallbackSrc) {
      console.log('Использую fallback изображение');
      setUseFallback(true);
      setImgSrc(fallbackSrc);
    } else {
      // Если мы уже используем fallback или его нет, просто показываем ошибку
      if (onError) onError(e);
    }
  };

  return (
    <>
      {isLoading && (
        <div 
          className={`${className} flex items-center justify-center`} 
          style={{
            ...style,
            minWidth: '30px',
            minHeight: '30px'
          }}
        >
          <LoadingSpinner
            size="xs"
            variant="gray"
            isDarkMode={isDarkMode}
            inline={true}
            fullscreen={false}
            showLogo={false}
            duration={1}
          />
        </div>
      )}
      {imgSrc && (
        <img
          ref={imgRef}
          key={`img-${retries}-${useFallback ? 'fallback' : 'original'}`} 
          src={imgSrc}
          alt={alt}
          crossOrigin={isExternalUrl(imgSrc) ? "anonymous" : undefined}
          className={`${className} ${isLoading ? 'hidden' : 'block'} ${hasError && !useFallback ? 'error-image' : ''}`}
          style={{
            ...style,
            opacity: hasError && !useFallback ? 0.7 : 1
          }}
          onLoad={handleLoad}
          onError={handleError}
          {...rest}
        />
      )}
    </>
  );
};

ImageLoader.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  fallbackSrc: PropTypes.string,
  style: PropTypes.object,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  maxRetries: PropTypes.number,
  isDarkMode: PropTypes.bool
};

export default ImageLoader; 