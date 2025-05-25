-- First, modify the category column to be ENUM
ALTER TABLE restaurants MODIFY COLUMN category ENUM('italian', 'asian', 'russian', 'seafood', 'french', 'georgian', 'mexican', 'american') NOT NULL DEFAULT 'russian';

-- Update all restaurants to have Russian cuisine by default
UPDATE restaurants SET category = 'russian' WHERE category IS NULL OR category = '';

-- Update specific restaurants based on their names
UPDATE restaurants 
SET category = 'russian'
WHERE LOWER(name) LIKE '%русск%' 
   OR LOWER(name) LIKE '%russian%'
   OR LOWER(cuisine_type) LIKE '%русск%' 
   OR LOWER(cuisine_type) LIKE '%russian%';

-- Log the results
SELECT name, category FROM restaurants; 