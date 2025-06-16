-- Add likes column to reviews table if it doesn't exist
SET @exist_likes_col := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.COLUMNS 
                         WHERE table_name = 'reviews' 
                         AND column_name = 'likes' 
                         AND table_schema = DATABASE());
                         
SET @sqlstmt_likes := IF(@exist_likes_col = 0, 
                        'ALTER TABLE reviews ADD COLUMN likes INT DEFAULT 0', 
                        'SELECT 1');
                        
PREPARE stmt_likes FROM @sqlstmt_likes;
EXECUTE stmt_likes;
DEALLOCATE PREPARE stmt_likes;

-- Add total_likes column to users table if it doesn't exist
SET @exist_total_likes_col := (SELECT COUNT(1) FROM INFORMATION_SCHEMA.COLUMNS 
                              WHERE table_name = 'users' 
                              AND column_name = 'total_likes' 
                              AND table_schema = DATABASE());
                              
SET @sqlstmt_total_likes := IF(@exist_total_likes_col = 0, 
                             'ALTER TABLE users ADD COLUMN total_likes INT DEFAULT 0', 
                             'SELECT 1');
                             
PREPARE stmt_total_likes FROM @sqlstmt_total_likes;
EXECUTE stmt_total_likes;
DEALLOCATE PREPARE stmt_total_likes; 