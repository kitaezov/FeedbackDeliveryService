import React, { useEffect, useRef, useState } from 'react';

/**
 * Компонент с анимированным фоном без параллакс эффекта
 */
const Background = () => {
  const canvasRef = useRef(null);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastTimestamp = 0;
    let fps = 60;
    let frameCount = 0;
    let lastFpsUpdate = 0;

    // Проверка производительности
    const checkPerformance = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
        return;
      }

      // Подсчет FPS
      frameCount++;
      if (timestamp - lastFpsUpdate > 1000) { // обновление каждую секунду
        fps = frameCount;
        frameCount = 0;
        lastFpsUpdate = timestamp;
        
        // Если FPS низкий, упрощаем анимацию
        if (fps < 30 && !isLowPerformance) {
          setIsLowPerformance(true);
        } else if (fps > 40 && isLowPerformance) {
          setIsLowPerformance(false);
        }
      }
    };

    // Устанавливаем размер canvas на полный экран
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Создаем массив линий
    const lines = [];
    const createLines = () => {
      // Адаптируем количество линий в зависимости от производительности
      const countMultiplier = isLowPerformance ? 0.5 : 1;
      const count = Math.floor((window.innerWidth / 100) * countMultiplier);
      
      for (let i = 0; i < count; i++) {
        lines.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          length: Math.random() * 100 + 50,
          opacity: Math.random() * 0.3 + 0.3, 
          width: Math.random() * 2 + 1, 
          hue: Math.random() * 30 + 210, // Синие оттенки
        });
      }
    };

    // Рисуем анимацию
    const render = (timestamp) => {
      checkPerformance(timestamp);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      lines.forEach(line => {
        ctx.beginPath();
        const x = line.x;
        const y = line.y;
        const isDark = document.documentElement.classList.contains('dark');
        
        // Разные цвета для светлой и темной темы
        if (isDark) {
          ctx.strokeStyle = `hsla(${line.hue}, 80%, 65%, ${line.opacity})`;
        } else {
          ctx.strokeStyle = `hsla(${line.hue}, 80%, 50%, ${line.opacity})`;
        }
        
        ctx.lineWidth = line.width;
        
        // Рисуем ломаную линию
        ctx.moveTo(x, y);
        
        // Создаем несколько сегментов для ломаной линии
        // В режиме низкой производительности уменьшаем количество сегментов
        const segments = isLowPerformance ? 2 : 3;
        for (let i = 0; i < segments; i++) {
          const nextX = x + (i + 1) * (line.length / segments) + Math.sin(Date.now() * 0.001 + i) * 20;
          const nextY = y + Math.cos(Date.now() * 0.002 + i) * 20;
          ctx.lineTo(nextX, nextY);
        }
        
        ctx.stroke();
      });
      
      animationFrameId = window.requestAnimationFrame(render);
    };

    // Инициализация
    handleResize();
    window.addEventListener('resize', handleResize);
    createLines();
    render();

    // Очистка при размонтировании компонента
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLowPerformance]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full absolute inset-0 pointer-events-none"
      style={{ opacity: 1 }}
    />
  );
};

export default Background; 