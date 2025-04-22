-- Добавление новых столбцов в таблицу ресторанов
-- Для column category
ALTER TABLE restaurants 
ADD COLUMN category VARCHAR(100) COMMENT 'Категория ресторана';

-- Для column price_range
ALTER TABLE restaurants 
ADD COLUMN price_range VARCHAR(10) COMMENT 'Диапазон цен';

-- Для column min_price
ALTER TABLE restaurants 
ADD COLUMN min_price VARCHAR(20) COMMENT 'Минимальная цена';

-- Для column delivery_time
ALTER TABLE restaurants 
ADD COLUMN delivery_time VARCHAR(20) COMMENT 'Время доставки'; 