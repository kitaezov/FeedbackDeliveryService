-- Add profile fields to users table

-- Add avatar column if it doesn't exist
SELECT COUNT(*) INTO @exist FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'avatar';

SET @query = IF(@exist = 0, 
    'ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL', 
    'SELECT "Column avatar already exists" as message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add phone_number column if it doesn't exist
SELECT COUNT(*) INTO @exist FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'phone_number';

SET @query = IF(@exist = 0, 
    'ALTER TABLE users ADD COLUMN phone_number VARCHAR(50) DEFAULT NULL', 
    'SELECT "Column phone_number already exists" as message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add birth_date column if it doesn't exist
SELECT COUNT(*) INTO @exist FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'birth_date';

SET @query = IF(@exist = 0, 
    'ALTER TABLE users ADD COLUMN birth_date DATE DEFAULT NULL', 
    'SELECT "Column birth_date already exists" as message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt; 