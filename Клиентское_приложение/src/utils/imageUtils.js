/**
 * Утилиты для работы с изображениями
 */
import { API_URL } from '../config';

/**
 * Получает полный URL аватара пользователя из относительного пути
 * 
 * @param {string} avatarPath - Путь к файлу аватара или data URL
 * @param {boolean} bypassCache - Флаг для обхода кеширования
 * @returns {string|null} - Полный URL или null при отсутствии аватара
 */
export const getAvatarUrl = (avatarPath, bypassCache = true) => {
  if (!avatarPath) return null;
  
  // Если путь уже является data:URL, возвращаем его как есть
  if (avatarPath.startsWith('data:')) {
    return avatarPath;
  }
  
  try {
    // Если путь уже является полным URL
    if (avatarPath.startsWith('http')) {
      // Добавляем параметр для обхода кеширования при необходимости
      if (bypassCache) {
        const separator = avatarPath.includes('?') ? '&' : '?';
        return `${avatarPath}${separator}t=${Date.now()}`;
      }
      return avatarPath;
    }
    
    // Проверяем, начинается ли путь с /, если нет - добавляем его
    const normalizedPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
    
    // Формируем полный URL на основе базового адреса сервера
    let fullUrl = `${API_URL}${normalizedPath}`;
    
    // Добавляем параметр для обхода кеширования при необходимости
    if (bypassCache) {
      const separator = fullUrl.includes('?') ? '&' : '?';
      fullUrl = `${fullUrl}${separator}t=${Date.now()}`;
    }
    
    console.log(`getAvatarUrl: Сформирован URL ${fullUrl} из пути ${avatarPath}`);
    return fullUrl;
  } catch (error) {
    console.error('Ошибка в getAvatarUrl:', error, 'для пути:', avatarPath);
    return null;
  }
};

/**
 * Проверяет, является ли файл изображением поддерживаемого формата
 * 
 * @param {File} file - Файл для проверки
 * @returns {boolean} - true если файл является поддерживаемым изображением
 */
export const isValidImageFile = (file) => {
  if (!file) return false;
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
};

/**
 * Создает URL данных (data URL) для предпросмотра изображения
 * 
 * @param {File} file - Файл изображения
 * @returns {Promise<string>} - Promise с data URL изображения
 */
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !isValidImageFile(file)) {
      reject(new Error('Некорректный файл изображения'));
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsDataURL(file);
  });
};

/**
 * Оптимизирует размер изображения перед загрузкой
 * 
 * @param {File} file - Исходный файл изображения
 * @param {Object} options - Параметры оптимизации
 * @param {number} options.maxWidth - Максимальная ширина (по умолчанию 1200)
 * @param {number} options.maxHeight - Максимальная высота (по умолчанию 1200)
 * @param {number} options.quality - Качество сжатия JPEG (0-1, по умолчанию 0.8)
 * @returns {Promise<Blob>} - Promise с оптимизированным файлом изображения
 */
export const optimizeImage = (file, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) => {
  return new Promise((resolve, reject) => {
    // Если это не изображение, возвращаем исходный файл
    if (!isValidImageFile(file)) {
      resolve(file);
      return;
    }
    
    // Если файл очень маленький (< 1KB), вероятно, его не нужно оптимизировать
    if (file.size < 1024) {
      console.log(`Файл уже маленький (${file.size} байт), пропускаем оптимизацию`);
      resolve(file);
      return;
    }
    
    // Создаем объект изображения для обработки
    const img = new Image();
    img.onload = () => {
      // Проверка исходных размеров
      console.log(`Исходные размеры: ${img.width}x${img.height}`);
      
      // Если изображение слишком маленькое или невалидное, возвращаем оригинал
      if (img.width < 10 || img.height < 10) {
        console.log('Изображение слишком маленькое, пропускаем оптимизацию');
        resolve(file);
        return;
      }
      
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Масштабирование, если изображение превышает максимальные размеры
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }
      
      // Убеждаемся, что размеры целые числа
      width = Math.floor(width);
      height = Math.floor(height);
      console.log(`Оптимизированные размеры: ${width}x${height}`);
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      
      // Добавляем try-catch для отлова ошибок при работе с canvas
      try {
        ctx.drawImage(img, 0, 0, width, height);
        
        // Используем оригинальный формат файла, если возможно
        const mimeType = file.type;
        
        try {
          // Для GIF файлов, если они слишком большие, возвращаем оригинал
          if (mimeType === 'image/gif' && file.size > 1024 * 1024 * 2) {
            console.log('GIF файл слишком большой для обработки, возвращаем оригинал');
            resolve(file);
            return;
          }
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                console.log(`Оптимизировано: с ${file.size} до ${blob.size} байт`);
                
                // Если размер блоба подозрительно отличается от оригинала, возвращаем оригинальный файл
                if (blob.size < 100 || (blob.size > file.size * 3 && file.size > 1000)) {
                  console.warn('Подозрительный размер оптимизированного файла, возвращаем оригинал');
                  resolve(file);
                  return;
                }
                
                // Создаем новый File с оптимизированным изображением
                const optimizedFile = new File(
                  [blob],
                  file.name,
                  { type: mimeType, lastModified: Date.now() }
                );
                resolve(optimizedFile);
              } else {
                console.error('Ошибка при создании blob');
                // Возвращаем оригинальный файл при ошибке
                resolve(file);
              }
            },
            mimeType,
            quality
          );
        } catch (error) {
          console.error('Ошибка при создании blob', error);
          resolve(file);
        }
      } catch (error) {
        console.error('Ошибка при оптимизации изображения:', error);
        // Возвращаем оригинальный файл при любой ошибке
        resolve(file);
      }
    };
    
    img.onerror = (error) => {
      console.error('Ошибка загрузки изображения:', error);
      // Возвращаем оригинальный файл при ошибке загрузки
      resolve(file);
    };
    
    // Загружаем изображение
    createImagePreview(file)
      .then(dataUrl => {
        img.src = dataUrl;
      })
      .catch(error => {
        console.error('Ошибка создания превью:', error);
        // Возвращаем оригинальный файл при ошибке создания превью
        resolve(file);
      });
  });
};

/**
 * Добавляет нужные MIME типы изображений в заголовок accept для input[type=file]
 * 
 * @returns {string} - Строка с поддерживаемыми MIME типами для атрибута accept
 */
export const getImageAcceptString = () => {
  return "image/jpeg, image/png, image/gif, image/webp";
}; 