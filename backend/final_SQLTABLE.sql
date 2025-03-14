drop database filxconnect;
create database filxconnect;
use filxconnect;
create table admins(
	aid BINARY(16) DEFAULT (UUID_TO_BIN(UUID())) PRIMARY KEY,
    aname VARCHAR(50) NOT NULL,
    aemail VARCHAR(100)  NOT NULL UNIQUE,
    apass VARCHAR(16) NOT NULL,
    aprofilepic TEXT,
    acreatedate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    aupdatedate TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE users (
    id BINARY(16) DEFAULT (UUID_TO_BIN(UUID())) PRIMARY KEY,  -- UUID as Primary Key (Stored in Binary Format for Efficiency)
    username VARCHAR(50) NOT NULL UNIQUE,                     -- Unique Username
    email VARCHAR(100) NOT NULL UNIQUE,                       -- Unique Email
    password VARCHAR(255) NOT NULL,                           -- Hashed Password
    profile_picture TEXT DEFAULT NULL,                        -- Profile Picture (URL or Base64)
    bio VARCHAR(20) DEFAULT NULL,                                    -- User Bio
    status INT NOT NULL DEFAULT 0,                     -- User Status (1 = Active, 0 = Inactive)
    reports INT NOT NULL DEFAULT 0,							  -- Number of times User gets Reported
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           -- Auto-set Creation Time
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- Auto-set Last Updated Time
);
CREATE TABLE post (
    id BINARY(16) NOT NULL PRIMARY KEY,
    content VARCHAR(255) NULL,
    title VARCHAR(255) NULL,
    user_id BINARY(16) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status CHAR(1) NOT NULL-- Assuming 'users' is the related table
);
CREATE TABLE media (
    id BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID())), -- Correct UUID storage
    post_id BINARY(16) NOT NULL, -- Foreign key linking to posts.id
    media_url TEXT NOT NULL,  -- Store image/video URL
    media_type TEXT NOT NULL,  -- Type of media
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE TABLE reactions (
    id BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID())),  -- Unique ID for the like
    post_id BINARY(16) NOT NULL,  -- Foreign key referencing post.id
    user_id BINARY(16) NOT NULL,  -- Foreign key referencing users.id
    emoji varchar(50) NOT NULL, -- Reaction Type
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the like was created
    PRIMARY KEY (id)   -- ✅ Correct reference to users.id
);

CREATE TABLE notifications (
    id BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID())), -- Unique identifier
    user_id BINARY(16) NOT NULL,
    post_id BINARY(16),
    -- User who receives the notification
    message TEXT NOT NULL, -- Notification message
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sender text,
    sender_pic text, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the notification was created
    PRIMARY KEY (id)
);

CREATE TABLE adminotif(
id BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID())), -- Unique identifier
    -- User who receives the notification
    message TEXT NOT NULL, -- Notification message
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sender text,
    sender_pic text, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the notification was created
    PRIMARY KEY (id)
);

CREATE TABLE messages (
    id BINARY(16) DEFAULT (UUID_TO_BIN(UUID())) PRIMARY KEY,
    sender_id BINARY(16) NOT NULL,
    receiver_id BINARY(16) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE followers (
    id BINARY(16) NOT NULL PRIMARY KEY,
    follower_id BINARY(16) NOT NULL,
    following_id BINARY(16) NOT NULL,
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id)
);
CREATE TABLE comments (
    id BINARY(16) NOT NULL PRIMARY KEY,
    content VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    post_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL
);
CREATE TABLE reports (
    report_id BINARY(16) NOT NULL PRIMARY KEY,
    block_request_flag BIT(1) NOT NULL,
    reason VARCHAR(255) NULL,
    report_status ENUM('PENDING', 'DISMISSED', 'APPROVED') NULL,
    reported_post_id BINARY(16) NULL,
    reported_user_id BINARY(16) NULL,
    reporter_user_id BINARY(16) NULL,
    timestamp DATETIME(6) NULL
);
INSERT INTO admins (aid, aname, aemail, apass, aprofilepic) 
VALUES (1, 'root', 'root@filxconnect.com', 'Super1234', "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/zybt9ffewrjwhq7tyvy1.png");



