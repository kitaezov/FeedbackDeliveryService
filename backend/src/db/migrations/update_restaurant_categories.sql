-- First, modify the category column to be ENUM if it's not already
ALTER TABLE restaurants MODIFY COLUMN category ENUM('italian', 'asian', 'russian', 'seafood', 'french', 'georgian', 'mexican', 'american') NOT NULL DEFAULT 'russian';

-- Update restaurants with Italian cuisine
UPDATE restaurants 
SET category = 'italian'
WHERE LOWER(name) LIKE '%итальян%' 
   OR LOWER(name) LIKE '%italian%'
   OR LOWER(cuisine_type) LIKE '%итальян%' 
   OR LOWER(cuisine_type) LIKE '%italian%';

-- Update restaurants with Asian cuisine
UPDATE restaurants 
SET category = 'asian'
WHERE LOWER(name) LIKE '%азиат%' 
   OR LOWER(name) LIKE '%asian%'
   OR LOWER(cuisine_type) LIKE '%азиат%' 
   OR LOWER(cuisine_type) LIKE '%asian%';

-- Update restaurants with Russian cuisine
UPDATE restaurants 
SET category = 'russian'
WHERE LOWER(name) LIKE '%русск%' 
   OR LOWER(name) LIKE '%russian%'
   OR LOWER(cuisine_type) LIKE '%русск%' 
   OR LOWER(cuisine_type) LIKE '%russian%';

-- Update restaurants with Seafood cuisine
UPDATE restaurants 
SET category = 'seafood'
WHERE LOWER(name) LIKE '%морепродукт%' 
   OR LOWER(name) LIKE '%seafood%'
   OR LOWER(cuisine_type) LIKE '%морепродукт%' 
   OR LOWER(cuisine_type) LIKE '%seafood%';

-- Update restaurants with French cuisine
UPDATE restaurants 
SET category = 'french'
WHERE LOWER(name) LIKE '%француз%' 
   OR LOWER(name) LIKE '%french%'
   OR LOWER(cuisine_type) LIKE '%француз%' 
   OR LOWER(cuisine_type) LIKE '%french%';

-- Update restaurants with Georgian cuisine
UPDATE restaurants 
SET category = 'georgian'
WHERE LOWER(name) LIKE '%грузин%' 
   OR LOWER(name) LIKE '%georgian%'
   OR LOWER(cuisine_type) LIKE '%грузин%' 
   OR LOWER(cuisine_type) LIKE '%georgian%';

-- Update restaurants with Mexican cuisine
UPDATE restaurants 
SET category = 'mexican'
WHERE LOWER(name) LIKE '%мексикан%' 
   OR LOWER(name) LIKE '%mexican%'
   OR LOWER(cuisine_type) LIKE '%мексикан%' 
   OR LOWER(cuisine_type) LIKE '%mexican%';

-- Update restaurants with American cuisine
UPDATE restaurants 
SET category = 'american'
WHERE LOWER(name) LIKE '%американ%' 
   OR LOWER(name) LIKE '%american%'
   OR LOWER(cuisine_type) LIKE '%американ%' 
   OR LOWER(cuisine_type) LIKE '%american%';

-- Set a default category for any restaurants without one
UPDATE restaurants 
SET category = 'russian'
WHERE category IS NULL; 