import React, { useEffect, useRef, useState } from 'react';

/**
 * Компонент с плавающими частицами для фона
 */
const BackgroundParticles = () => {
  const canvasRef = useRef(null);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const particles = [];
    let lastTimestamp = 0;
    let fps = 60;
    let frameCount = 0;
    let lastFpsUpdate = 0;
    
    // Адаптируем количество частиц в зависимости от производительности
    const particlesCount = isLowPerformance ? 35 : 80;

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

    // Создаем частицы
    const createParticles = () => {
      for (let i = 0; i < particlesCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 4 + 1.5,
          opacity: Math.random() * 0.4 + 0.3,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          hue: Math.random() * 60 + 180, // Голубые и синие оттенки
        });
      }
    };

    // Рисуем и обновляем частицы
    const render = (timestamp) => {
      checkPerformance(timestamp);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        // Обновляем позицию
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Если частица выходит за границы, возвращаем ее с другой стороны
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Рисуем частицу
        ctx.beginPath();
        const isDark = document.documentElement.classList.contains('dark');
        
        // Создаем градиент для каждой частицы
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius
        );
        
        if (isDark) {
          gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 75%, ${particle.opacity})`);
          gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 75%, 0)`);
        } else {
          gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 60%, ${particle.opacity})`);
          gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 60%, 0)`);
        }
        
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // В режиме низкой производительности пропускаем соединение частиц
      if (!isLowPerformance) {
        connectParticles();
      }
      
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    // Функция для соединения близких частиц
    const connectParticles = () => {
      // Адаптируем максимальное расстояние в зависимости от производительности
      const maxDistance = isLowPerformance ? 80 : 150;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            // Прозрачность линии зависит от расстояния
            const opacity = 1 - (distance / maxDistance);
            const isDark = document.documentElement.classList.contains('dark');
            
            ctx.beginPath();
            if (isDark) {
              ctx.strokeStyle = `rgba(100, 200, 255, ${opacity * 0.3})`;
            } else {
              ctx.strokeStyle = `rgba(70, 130, 180, ${opacity * 0.2})`;
            }
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // Инициализация
    handleResize();
    window.addEventListener('resize', handleResize);
    createParticles();
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

export default BackgroundParticles; 