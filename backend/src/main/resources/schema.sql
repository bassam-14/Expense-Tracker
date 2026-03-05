CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,      -- Display name
    email VARCHAR(100) UNIQUE NOT NULL,        -- For login
    password VARCHAR(255) NOT NULL,            -- BCrypt Hash
    `role` VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    version INT DEFAULT 1
    );

CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(36) PRIMARY KEY,                -- UUID
    user_id BIGINT NOT NULL,                   -- Foreign Key linking to users
    merchant VARCHAR(255),                     -- Extracted by Python
    amount DECIMAL(10, 2),                     -- Extracted by Python
    `date` DATE,                           -- Extracted by Python
    category VARCHAR(50),                      -- Extracted by Python
    status VARCHAR(20) NOT NULL,
    image_url VARCHAR(500) NOT NULL,           -- MinIO path
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    version INT DEFAULT 1,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    );