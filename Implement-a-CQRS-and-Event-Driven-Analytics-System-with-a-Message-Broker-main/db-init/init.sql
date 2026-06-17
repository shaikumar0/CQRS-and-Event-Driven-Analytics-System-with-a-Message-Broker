CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10,2),
  stock INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE outbox (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(100),
  payload JSON,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics tables

CREATE TABLE product_sales_view (
  product_id INT PRIMARY KEY,
  total_quantity_sold INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  order_count INT DEFAULT 0
);

CREATE TABLE category_metrics_view (
  category_name VARCHAR(100) PRIMARY KEY,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_orders INT DEFAULT 0
);

CREATE TABLE customer_ltv_view (
  customer_id INT PRIMARY KEY,
  total_spent DECIMAL(12,2) DEFAULT 0,
  order_count INT DEFAULT 0,
  last_order_date TIMESTAMP
);

CREATE TABLE hourly_sales_view (
  hour_timestamp DATETIME PRIMARY KEY,
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0
);