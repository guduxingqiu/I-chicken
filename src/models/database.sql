-- 创建数据库
CREATE DATABASE IF NOT EXISTS parking_coupon_db;
USE parking_coupon_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 工作人员表
CREATE TABLE IF NOT EXISTS staff (
    staff_id INT PRIMARY KEY AUTO_INCREMENT,
    staff_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    parking_area VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 停车场位置表
CREATE TABLE IF NOT EXISTS parking_locations (
    parking_id INT PRIMARY KEY AUTO_INCREMENT,
    parking_area VARCHAR(50) NOT NULL,
    parking_lot_number VARCHAR(20) NOT NULL,
    UNIQUE KEY unique_lot (parking_area, parking_lot_number)
);

-- 车辆信息表
CREATE TABLE IF NOT EXISTS vehicle_information (
    user_id INT,
    car_plate VARCHAR(20) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 停车券表
CREATE TABLE IF NOT EXISTS parking_coupons (
    coupon_code VARCHAR(20) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    usage_limit INT DEFAULT 10,
    status ENUM('valid', 'expired', 'in_use') DEFAULT 'valid',
    valid_from DATETIME,
    valid_until DATETIME,
    time_remaining INT,
    parking_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (parking_id) REFERENCES parking_locations(parking_id)
);

-- 支付表
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method ENUM('wallet', 'online_banking') NOT NULL,
    payment_status ENUM('successful', 'failed', 'pending') DEFAULT 'pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 反馈和报告表
CREATE TABLE IF NOT EXISTS feedback_reports (
    fr_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    parking_id INT,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parking_id) REFERENCES parking_locations(parking_id)
); 