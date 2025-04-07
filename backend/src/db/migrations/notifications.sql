-- Создание таблицы уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(10) NOT NULL DEFAULT 'info', -- 'info', 'success', 'error'
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для повышения производительности запросов
-- Используем процедуру для безопасного создания индексов
-- Индекс по user_id
SET @exist_user_id := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_name = 'notifications' AND index_name = 'notifications_user_id_idx' AND table_schema = DATABASE());
SET @sqlstmt_user := IF(@exist_user_id = 0, 'ALTER TABLE notifications ADD INDEX notifications_user_id_idx (user_id)', 'SELECT 1');
PREPARE stmt_user FROM @sqlstmt_user;
EXECUTE stmt_user;
DEALLOCATE PREPARE stmt_user;

-- Индекс по is_read
SET @exist_is_read := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS WHERE table_name = 'notifications' AND index_name = 'notifications_is_read_idx' AND table_schema = DATABASE());
SET @sqlstmt_read := IF(@exist_is_read = 0, 'ALTER TABLE notifications ADD INDEX notifications_is_read_idx (is_read)', 'SELECT 1');
PREPARE stmt_read FROM @sqlstmt_read;
EXECUTE stmt_read;
DEALLOCATE PREPARE stmt_read;

-- Комментарии к таблице в формате комментариев MySQL
-- Таблица: Уведомления пользователей системы
-- Колонка id: Уникальный идентификатор уведомления
-- Колонка user_id: Идентификатор пользователя, которому принадлежит уведомление
-- Колонка message: Текст уведомления
-- Колонка type: Тип уведомления: info, success, error
-- Колонка is_read: Флаг, указывающий прочитано ли уведомление
-- Колонка created_at: Дата и время создания уведомления 