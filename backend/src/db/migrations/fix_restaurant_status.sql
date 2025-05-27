-- Fix restaurant status values
UPDATE restaurants 
SET is_active = 1 
WHERE is_active IS NULL 
   OR is_active = 'true' 
   OR is_active = '1' 
   OR is_active = true;

-- Make sure any explicitly inactive restaurants stay inactive
UPDATE restaurants 
SET is_active = 0 
WHERE is_active = 'false' 
   OR is_active = '0' 
   OR is_active = false; 