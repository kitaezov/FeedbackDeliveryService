<<<<<<< HEAD
/**
 * Модуль для измерения веб-производительности приложения
 * 
 * Этот файл предоставляет функцию для отслеживания и отправки ключевых метрик 
 * веб-производительности (Core Web Vitals) в аналитическую систему.
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

/**
 * Функция для регистрации метрик производительности
 * 
 * @param {Function} onPerfEntry - Функция обратного вызова для обработки метрик
 */
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Cumulative Layout Shift (CLS) - Совокупное смещение макета
    onCLS(onPerfEntry);
    // First Input Delay (FID) - Задержка первого ввода
    onFID(onPerfEntry);
    // First Contentful Paint (FCP) - Первая отрисовка содержимого
    onFCP(onPerfEntry);
    // Largest Contentful Paint (LCP) - Отрисовка самого большого содержимого
    onLCP(onPerfEntry);
    // Time to First Byte (TTFB) - Время до первого байта
=======
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onFID(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
    onTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
