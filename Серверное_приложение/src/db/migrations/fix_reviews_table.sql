-- CAUTION: These DROP statements will delete all data. Only uncomment if you want to recreate the tables from scratch.
-- Drop dependent tables first
-- DROP TABLE IF EXISTS review_votes;
-- DROP TABLE IF EXISTS review_photos;
-- DROP TABLE IF EXISTS manager_responses;
-- DROP TABLE IF EXISTS error_reports;
-- DROP TABLE IF EXISTS deleted_reviews;

-- Drop the reviews table
-- DROP TABLE IF EXISTS reviews;

-- Create the reviews table with the correct structure
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    likes INT DEFAULT 0,
    food_rating INT DEFAULT 0,
    service_rating INT DEFAULT 0,
    atmosphere_rating INT DEFAULT 0,
    price_rating INT DEFAULT 0,
    cleanliness_rating INT DEFAULT 0,
    has_receipt BOOLEAN DEFAULT FALSE,
    receipt_photo VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_restaurant_name_idx ON reviews(restaurant_name);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews(created_at);

-- Recreate dependent tables
CREATE TABLE IF NOT EXISTS review_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    vote_type ENUM('up', 'down') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_review_vote (review_id, user_id),
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS review_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    is_receipt BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS manager_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    manager_id INT NOT NULL,
    response_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (review_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS error_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT,
    reporter_id INT,
    reason TEXT NOT NULL,
    status ENUM('pending', 'resolved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by INT,
    resolution_notes TEXT,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deleted_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    restaurant_name VARCHAR(100) NOT NULL,
    rating DECIMAL(2, 1) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    food_rating DECIMAL(2, 1),
    service_rating DECIMAL(2, 1),
    atmosphere_rating DECIMAL(2, 1),
    price_rating DECIMAL(2, 1),
    cleanliness_rating DECIMAL(2, 1),
    deleted_by INT NOT NULL,
    deletion_reason TEXT NOT NULL,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_name VARCHAR(100),
    admin_name VARCHAR(100),
    INDEX deleted_reviews_review_id_idx (review_id),
    INDEX deleted_reviews_user_id_idx (user_id),
    INDEX deleted_reviews_deleted_by_idx (deleted_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 