CREATE TABLE IF NOT EXISTS staff_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(80) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  permission_name VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES staff_roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  status ENUM('active','inactive','suspended') DEFAULT 'active',
  failed_login_attempts INT DEFAULT 0,
  locked_until DATETIME NULL,
  last_login DATETIME NULL,
  password_reset_token_hash VARCHAR(255) NULL,
  reset_token_expires_at DATETIME NULL,
  two_factor_enabled TINYINT(1) DEFAULT 0,
  two_factor_secret VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_role FOREIGN KEY (role_id) REFERENCES staff_roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  refresh_token_hash VARCHAR(128) NOT NULL UNIQUE,
  user_agent VARCHAR(255),
  ip_address VARCHAR(64),
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS login_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NULL,
  email VARCHAR(160),
  ip_address VARCHAR(64),
  device VARCHAR(255),
  status ENUM('success','failed','locked') NOT NULL,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_login_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS device_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  ip_address VARCHAR(64),
  device VARCHAR(255),
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_device_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NULL,
  action VARCHAR(160) NOT NULL,
  module VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  parent_id INT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  logo_url VARCHAR(255),
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS attributes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  type ENUM('text','color','size','number') DEFAULT 'text',
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS attribute_values (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attribute_id INT NOT NULL,
  value VARCHAR(120) NOT NULL,
  display_value VARCHAR(120),
  UNIQUE KEY uq_attribute_value (attribute_id, value),
  CONSTRAINT fk_attribute_value FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS collections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  description TEXT,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  sku VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(12,2) DEFAULT 0,
  cost_price DECIMAL(12,2) DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  availability ENUM('in_stock','out_of_stock','preorder') DEFAULT 'in_stock',
  low_stock_threshold INT DEFAULT 5,
  status ENUM('active','draft','scheduled','archived') DEFAULT 'draft',
  category_id INT NULL,
  brand_id INT NULL,
  image_url VARCHAR(255),
  seo_title VARCHAR(180),
  seo_description VARCHAR(255),
  google_product_category VARCHAR(255),
  gtin VARCHAR(64),
  mpn VARCHAR(64),
  product_condition VARCHAR(32) DEFAULT 'new',
  gender VARCHAR(32),
  age_group VARCHAR(32),
  product_attributes_json JSON NULL,
  scheduled_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_product_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  variant_name VARCHAR(160) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  attributes_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS collection_products (
  collection_id INT NOT NULL,
  product_id INT NOT NULL,
  PRIMARY KEY (collection_id, product_id),
  CONSTRAINT fk_collection_product_collection FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  CONSTRAINT fk_collection_product_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS media_assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(180) NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  file_type VARCHAR(80),
  size_bytes INT DEFAULT 0,
  uploaded_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_admin FOREIGN KEY (uploaded_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(140) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(40),
  country VARCHAR(80) DEFAULT 'United Arab Emirates',
  status ENUM('active','blocked','vip') DEFAULT 'active',
  total_spent DECIMAL(12,2) DEFAULT 0,
  orders_count INT DEFAULT 0,
  last_order_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(40) NOT NULL UNIQUE,
  customer_id INT NULL,
  status ENUM('pending','processing','packed','shipped','delivered','cancelled','returned','refunded') DEFAULT 'pending',
  payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  fulfillment_status ENUM('unfulfilled','partial','fulfilled') DEFAULT 'unfulfilled',
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  shipping DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'AED',
  channel VARCHAR(60) DEFAULT 'Online Store',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  product_name VARCHAR(180) NOT NULL,
  sku VARCHAR(80),
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  UNIQUE KEY uq_order_item_order_sku (order_id, sku),
  CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  change_type ENUM('manual','sale','return','transfer','damage') DEFAULT 'manual',
  quantity_before INT DEFAULT 0,
  quantity_after INT DEFAULT 0,
  note VARCHAR(255),
  admin_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_inventory_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NULL,
  provider VARCHAR(80) DEFAULT 'Stripe',
  transaction_id VARCHAR(120) UNIQUE,
  amount DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'AED',
  status ENUM('paid','pending','failed','refunded') DEFAULT 'pending',
  paid_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS shipping_shipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NULL,
  carrier VARCHAR(80) DEFAULT 'DHL',
  tracking_number VARCHAR(120) UNIQUE,
  status ENUM('label_created','in_transit','delivered','exception') DEFAULT 'label_created',
  cost DECIMAL(12,2) DEFAULT 0,
  shipped_at DATETIME NULL,
  delivered_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_shipping_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  message VARCHAR(255) NOT NULL,
  type ENUM('info','success','warning','danger') DEFAULT 'info',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS visitor_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  visitors INT DEFAULT 0,
  sessions INT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  channel ENUM('email','sms','whatsapp','push','banner') DEFAULT 'email',
  status ENUM('draft','scheduled','active','completed') DEFAULT 'draft',
  budget DECIMAL(12,2) DEFAULT 0,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cms_pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  status ENUM('draft','published') DEFAULT 'draft',
  seo_title VARCHAR(180),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NULL,
  customer_id INT NULL,
  rating INT NOT NULL DEFAULT 5,
  review_text TEXT,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_review_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_number VARCHAR(40) NOT NULL UNIQUE,
  customer_id INT NULL,
  subject VARCHAR(180) NOT NULL,
  priority ENUM('low','medium','high','urgent') DEFAULT 'medium',
  status ENUM('open','pending','resolved','closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ticket_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(120) PRIMARY KEY,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO staff_roles (id, role_name, description) VALUES
(1,'Super Admin','Full platform access with all permissions'),
(2,'Manager','Store manager with sales, catalog, customer and reporting access'),
(3,'Shipping Staff','Order fulfillment and shipping operations'),
(4,'Marketing Staff','Campaigns, content, SEO and analytics'),
(5,'Customer Support','Customer care, tickets and order lookup');

INSERT IGNORE INTO permissions (permission_name, description) VALUES
('dashboard.read','View dashboard'),('catalog.read','View catalog'),('catalog.write','Create and update catalog'),('catalog.delete','Delete catalog records'),
('orders.read','View orders'),('orders.write','Create and update orders'),('customers.read','View customers'),('customers.write','Create and update customers'),
('inventory.read','View inventory'),('inventory.write','Update inventory'),('payments.read','View payment records'),('shipping.read','View shipping records'),('shipping.write','Update shipping records'),
('marketing.read','View marketing'),('marketing.write','Manage marketing'),('analytics.read','View analytics'),('seo.read','View SEO'),('seo.write','Manage SEO'),('cms.read','View CMS'),('cms.write','Manage CMS'),
('localization.read','View localization'),('reviews.read','View reviews'),('reviews.write','Moderate reviews'),('ai.read','View AI insights'),('staff.read','View staff'),('staff.write','Manage staff'),
('support.read','View support tickets'),('support.write','Manage support tickets'),('settings.read','View settings'),('settings.write','Manage settings'),('security.read','View security logs'),('logs.read','View system logs');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE permission_name IN ('dashboard.read','catalog.read','catalog.write','orders.read','orders.write','customers.read','customers.write','inventory.read','inventory.write','payments.read','shipping.read','analytics.read','reviews.read','support.read','settings.read');
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE permission_name IN ('dashboard.read','orders.read','orders.write','inventory.read','shipping.read','shipping.write','support.read');
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE permission_name IN ('dashboard.read','catalog.read','marketing.read','marketing.write','analytics.read','seo.read','seo.write','cms.read','cms.write','reviews.read');
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions WHERE permission_name IN ('dashboard.read','orders.read','customers.read','customers.write','support.read','support.write','reviews.read');

INSERT IGNORE INTO categories (id,name,slug,status,sort_order) VALUES
(1,'Abayas','abayas','active',1),(2,'Dresses','dresses','active',2),(3,'Jalabiyas','jalabiyas','active',3),(4,'Jeans','jeans','active',4),(5,'Lingerie & Nightwear','lingerie-nightwear','active',5),(6,'Tops & Tees','tops-tees','active',6),(7,'Skirts','skirts','active',7),(8,'Sports','sports','active',8);

INSERT IGNORE INTO brands (id,name,slug,status) VALUES
(1,'Orla Signature','orla-signature','active'),(2,'Orla Modest','orla-modest','active'),(3,'Orla Luxe','orla-luxe','active'),(4,'Orla Active','orla-active','active');

INSERT IGNORE INTO attributes (id,name,slug,type,status) VALUES
(1,'Size','size','size','active'),(2,'Color','color','color','active'),(3,'Fabric','fabric','text','active');
INSERT IGNORE INTO attribute_values (attribute_id,value,display_value) VALUES
(1,'XS','XS'),(1,'S','S'),(1,'M','M'),(1,'L','L'),(1,'XL','XL'),(2,'Black','#111111'),(2,'Blue','#4778ff'),(2,'Beige','#d7b48a'),(3,'Silk','Silk'),(3,'Cotton Blend','Cotton Blend');

INSERT IGNORE INTO collections (id,name,slug,description,status) VALUES
(1,'Ramadan Luxe','ramadan-luxe','Luxury modest edits for festive season','active'),(2,'New In','new-in','Fresh arrivals curated for OrlaTrends','active'),(3,'Best Sellers','best-sellers','High velocity selling products','active');

INSERT IGNORE INTO products (id,name,sku,slug,description,price,compare_at_price,cost_price,stock_quantity,low_stock_threshold,status,category_id,brand_id,image_url,seo_title,seo_description) VALUES
(1,'Pearl Beige Premium Abaya','OT-AB-1001','pearl-beige-premium-abaya','Luxury flowing beige abaya with premium drape and minimal detailing.',249.00,319.00,118.00,42,8,'active',1,2,'/assets/images/products/Product1.jpg','Pearl Beige Premium Abaya','Shop premium beige abaya at OrlaTrends.'),
(2,'Pastel Evening Dress','OT-DR-1002','pastel-evening-dress','Elegant pastel evening dress for premium occasions.',189.00,249.00,82.00,27,6,'active',2,3,'/assets/images/products/Product2.jpg','Pastel Evening Dress','Elegant dresses for women online.'),
(3,'Floral Modest Maxi Dress','OT-DR-1003','floral-modest-maxi-dress','A breathable floral maxi dress designed for daily elegance.',159.00,219.00,70.00,12,5,'active',2,1,'/assets/images/products/Product4.jpg','Floral Modest Maxi Dress','Premium modest maxi dresses online.'),
(4,'Black Embroidered Jalabiya','OT-JA-1004','black-embroidered-jalabiya','Premium embroidered jalabiya in black with refined finish.',229.00,299.00,110.00,7,8,'active',3,2,'/assets/images/products/Product5.jpg','Black Embroidered Jalabiya','Luxury jalabiyas for women.'),
(5,'Sky Blue Resort Dress','OT-DR-1005','sky-blue-resort-dress','Soft sky-blue resort dress with airy silhouette.',174.00,229.00,75.00,3,6,'active',2,1,'/assets/images/products/Product6.jpg','Sky Blue Resort Dress','Shop resort dresses online.'),
(6,'Classic Straight Jeans','OT-JE-1006','classic-straight-jeans','High-rise classic straight jeans for everyday styling.',129.00,169.00,56.00,24,6,'active',4,1,'/assets/images/categories/Jeans.png','Classic Straight Jeans','Women jeans online at OrlaTrends.'),
(7,'Navy Occasion Dress','OT-DR-1007','navy-occasion-dress','Premium navy occasion dress with structured silhouette.',199.00,279.00,92.00,15,5,'active',2,3,'/assets/images/products/Product8.jpg','Navy Occasion Dress','Premium occasion dresses online.'),
(8,'Chocolate Satin Skirt','OT-SK-1008','chocolate-satin-skirt','Soft satin skirt in chocolate tone for elevated styling.',119.00,159.00,48.00,5,6,'active',7,1,'/assets/images/products/Product9.jpg','Chocolate Satin Skirt','Luxury satin skirts online.'),
(9,'Royal Blue Co-ord Set','OT-CO-1009','royal-blue-co-ord-set','Premium royal blue co-ord set with tailored finish.',214.00,279.00,98.00,2,5,'active',6,3,'/assets/images/products/Product10.jpg','Royal Blue Co-ord Set','Royal blue women co-ord set.'),
(10,'Ruby Statement Dress','OT-DR-1010','ruby-statement-dress','Statement ruby dress for premium events.',289.00,369.00,130.00,18,6,'draft',2,3,'/assets/images/products/Product12.jpg','Ruby Statement Dress','Statement dresses online.');

INSERT IGNORE INTO product_variants (product_id,variant_name,sku,price,stock_quantity,attributes_json) VALUES
(1,'Pearl Beige / S','OT-AB-1001-S',249.00,14,JSON_OBJECT('size','S','color','Beige')),
(1,'Pearl Beige / M','OT-AB-1001-M',249.00,18,JSON_OBJECT('size','M','color','Beige')),
(4,'Black / M','OT-JA-1004-M',229.00,4,JSON_OBJECT('size','M','color','Black')),
(9,'Royal Blue / L','OT-CO-1009-L',214.00,2,JSON_OBJECT('size','L','color','Blue'));

INSERT IGNORE INTO collection_products (collection_id, product_id) VALUES (1,1),(1,4),(1,7),(2,2),(2,3),(2,10),(3,1),(3,4),(3,9);

INSERT IGNORE INTO customers (id,full_name,email,phone,country,status,total_spent,orders_count,last_order_at) VALUES
(1,'Aisha Khan','aisha@example.com','+971501112233','United Arab Emirates','vip',857.00,4,NOW() - INTERVAL 1 DAY),
(2,'Mariam Noor','mariam@example.com','+971522224444','United Arab Emirates','active',428.00,2,NOW() - INTERVAL 2 DAY),
(3,'Sara Ali','sara@example.com','+966555551111','Saudi Arabia','active',289.00,1,NOW() - INTERVAL 3 DAY),
(4,'Noura Hassan','noura@example.com','+97433112244','Qatar','active',613.00,3,NOW() - INTERVAL 4 DAY),
(5,'Leena Thomas','leena@example.com','+971565558888','United Arab Emirates','active',119.00,1,NOW() - INTERVAL 5 DAY);

INSERT IGNORE INTO orders (id,order_number,customer_id,status,payment_status,fulfillment_status,subtotal,tax,shipping,total,currency,channel,created_at) VALUES
(1,'OT-21024',1,'processing','paid','unfulfilled',478.00,23.90,18.00,519.90,'AED','Online Store',NOW() - INTERVAL 1 DAY),
(2,'OT-21023',2,'shipped','paid','fulfilled',318.00,15.90,20.00,353.90,'AED','Instagram',NOW() - INTERVAL 2 DAY),
(3,'OT-21022',3,'pending','pending','unfulfilled',289.00,14.45,0.00,303.45,'AED','Online Store',NOW() - INTERVAL 3 DAY),
(4,'OT-21021',4,'delivered','paid','fulfilled',613.00,30.65,25.00,668.65,'AED','Online Store',NOW() - INTERVAL 4 DAY),
(5,'OT-21020',5,'packed','paid','partial',119.00,5.95,18.00,142.95,'AED','WhatsApp',NOW() - INTERVAL 5 DAY);

INSERT IGNORE INTO order_items (order_id,product_id,product_name,sku,quantity,unit_price,total) VALUES
(1,1,'Pearl Beige Premium Abaya','OT-AB-1001',1,249.00,249.00),(1,4,'Black Embroidered Jalabiya','OT-JA-1004',1,229.00,229.00),
(2,2,'Pastel Evening Dress','OT-DR-1002',1,189.00,189.00),(2,6,'Classic Straight Jeans','OT-JE-1006',1,129.00,129.00),
(3,10,'Ruby Statement Dress','OT-DR-1010',1,289.00,289.00),(4,7,'Navy Occasion Dress','OT-DR-1007',2,199.00,398.00),(4,9,'Royal Blue Co-ord Set','OT-CO-1009',1,214.00,214.00),
(5,8,'Chocolate Satin Skirt','OT-SK-1008',1,119.00,119.00);

INSERT IGNORE INTO payments (order_id,provider,transaction_id,amount,currency,status,paid_at) VALUES
(1,'Stripe','txn_ot_21024',519.90,'AED','paid',NOW() - INTERVAL 1 DAY),(2,'PayPal','txn_ot_21023',353.90,'AED','paid',NOW() - INTERVAL 2 DAY),(3,'COD','txn_ot_21022',303.45,'AED','pending',NULL),(4,'Stripe','txn_ot_21021',668.65,'AED','paid',NOW() - INTERVAL 4 DAY),(5,'Tamara','txn_ot_21020',142.95,'AED','paid',NOW() - INTERVAL 5 DAY);

INSERT IGNORE INTO shipping_shipments (order_id,carrier,tracking_number,status,cost,shipped_at,delivered_at) VALUES
(2,'DHL','DHL-OT-21023','in_transit',20.00,NOW() - INTERVAL 1 DAY,NULL),(4,'Aramex','ARX-OT-21021','delivered',25.00,NOW() - INTERVAL 4 DAY,NOW() - INTERVAL 2 DAY),(5,'FedEx','FDX-OT-21020','label_created',18.00,NULL,NULL);

INSERT IGNORE INTO visitor_analytics (report_date,visitors,sessions,conversion_rate) VALUES
(CURDATE() - INTERVAL 6 DAY,1860,2450,2.7),(CURDATE() - INTERVAL 5 DAY,2140,2880,3.1),(CURDATE() - INTERVAL 4 DAY,1980,2650,2.9),(CURDATE() - INTERVAL 3 DAY,2560,3240,3.8),(CURDATE() - INTERVAL 2 DAY,2980,3780,4.2),(CURDATE() - INTERVAL 1 DAY,3375,4210,4.7),(CURDATE(),3820,4680,5.1);

INSERT IGNORE INTO notifications (id,title,message,type,is_read) VALUES
(1,'Low stock alert','Royal Blue Co-ord Set has only 2 units left.','warning',0),(2,'New paid order','Order OT-21024 is paid and ready for processing.','success',0),(3,'Campaign scheduled','Ramadan Luxe campaign is scheduled for review.','info',0);

INSERT IGNORE INTO campaigns (id,name,channel,status,budget,starts_at,ends_at) VALUES
(1,'Ramadan Luxe Launch','email','scheduled',2500.00,NOW() + INTERVAL 2 DAY,NOW() + INTERVAL 15 DAY),(2,'VIP WhatsApp Drop','whatsapp','active',1200.00,NOW() - INTERVAL 1 DAY,NOW() + INTERVAL 5 DAY),(3,'New In Banner Push','banner','active',600.00,NOW(),NOW() + INTERVAL 7 DAY);

INSERT IGNORE INTO cms_pages (id,title,slug,status,seo_title) VALUES
(1,'Homepage','home','published','OrlaTrends Premium Women Fashion'),(2,'About OrlaTrends','about-us','published','About OrlaTrends'),(3,'Shipping Policy','shipping-policy','published','Shipping Policy');

INSERT IGNORE INTO product_reviews (id,product_id,customer_id,rating,review_text,status) VALUES
(1,1,1,5,'Beautiful fabric and premium packaging.','approved'),(2,4,2,4,'Elegant design, delivery was quick.','approved'),(3,9,4,5,'Color looks luxurious in person.','pending');

INSERT IGNORE INTO support_tickets (id,ticket_number,customer_id,subject,priority,status) VALUES
(1,'SUP-1001',1,'Need size exchange for abaya','medium','open'),(2,'SUP-1002',3,'COD confirmation request','low','pending'),(3,'SUP-1003',4,'Tracking update required','high','resolved');

INSERT IGNORE INTO app_settings (setting_key,setting_value) VALUES
('store_name','OrlaTrends'),('default_currency','AED'),('country','United Arab Emirates'),('language','English'),('tax_rate','5'),('maintenance_mode','false');



-- ORLATRENDS VARIANT DEEPLINK EXTENSIONS
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(12,2) DEFAULT 0 AFTER price;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NULL AFTER stock_quantity;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS availability ENUM('in_stock','out_of_stock','preorder') DEFAULT 'in_stock' AFTER image_url;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

INSERT IGNORE INTO categories (id,name,slug,status,sort_order) VALUES
(9,'Shoes','shoes','active',9),(10,'Accessories','accessories','active',10);

INSERT IGNORE INTO attributes (id,name,slug,type,status) VALUES
(4,'Shoe Size','shoe-size','size','active'),(5,'Material','material','text','active'),(6,'Pattern','pattern','text','active'),(7,'Style','style','text','active'),(8,'Fit','fit','text','active'),(9,'Sleeve Type','sleeve-type','text','active'),(10,'Heel Size','heel-size','number','active');

INSERT IGNORE INTO attribute_values (attribute_id,value,display_value) VALUES
(4,'EU 40','EU 40'),(4,'EU 41','EU 41'),(4,'EU 42','EU 42'),(4,'EU 43','EU 43'),
(5,'Linen','Linen'),(5,'Crepe','Crepe'),(5,'Satin','Satin'),(5,'Faux Leather','Faux Leather'),
(6,'Embroidered','Embroidered'),(6,'Floral','Floral'),(6,'Solid','Solid'),
(7,'Occasion','Occasion'),(7,'Modest','Modest'),(7,'Casual','Casual'),
(8,'Regular','Regular'),(8,'Relaxed','Relaxed'),(8,'Tailored','Tailored'),
(9,'Long Sleeve','Long Sleeve'),(9,'Short Sleeve','Short Sleeve'),
(10,'Block Heel','Block Heel'),(10,'Flat','Flat');

INSERT IGNORE INTO products (id,name,sku,slug,description,price,compare_at_price,cost_price,stock_quantity,low_stock_threshold,status,category_id,brand_id,image_url,seo_title,seo_description) VALUES
(11,'Tan Block Heel Sandals','OT-SH-1011','tan-block-heel-sandals','Premium tan block heel sandals with soft faux leather finish.',179.00,229.00,82.00,19,5,'active',9,1,'/assets/images/products/Product11.jpg','Tan Block Heel Sandals','Shop premium block heel sandals at OrlaTrends.'),
(12,'Black Everyday Tote Bag','OT-AC-1012','black-everyday-tote-bag','Structured black everyday tote bag with premium finish.',149.00,199.00,64.00,16,5,'active',10,1,'/assets/images/products/Product12.jpg','Black Everyday Tote Bag','Premium everyday tote bag for women.');

INSERT IGNORE INTO product_variants (product_id,variant_name,sku,price,compare_at_price,stock_quantity,image_url,availability,attributes_json) VALUES
(1,'Beige / S / Linen','OT-AB-1001-BE-S',249.00,319.00,14,'/assets/images/products/Product1.jpg','in_stock',JSON_OBJECT('color','Beige','size','S','fabric','Linen','style','Modest')),
(1,'Beige / M / Linen','OT-AB-1001-BE-M',249.00,319.00,18,'/assets/images/products/Product1.jpg','in_stock',JSON_OBJECT('color','Beige','size','M','fabric','Linen','style','Modest')),
(1,'Black / M / Linen','OT-AB-1001-BK-M',259.00,329.00,6,'/assets/images/products/Product3.jpg','in_stock',JSON_OBJECT('color','Black','size','M','fabric','Linen','style','Modest')),
(1,'Black / L / Linen','OT-AB-1001-BK-L',259.00,329.00,0,'/assets/images/products/Product3.jpg','out_of_stock',JSON_OBJECT('color','Black','size','L','fabric','Linen','style','Modest')),
(4,'Black / M / Crepe','OT-JA-1004-BK-M',229.00,299.00,4,'/assets/images/products/Product5.jpg','in_stock',JSON_OBJECT('color','Black','size','M','fabric','Crepe','pattern','Embroidered')),
(4,'Black / L / Crepe','OT-JA-1004-BK-L',229.00,299.00,3,'/assets/images/products/Product5.jpg','in_stock',JSON_OBJECT('color','Black','size','L','fabric','Crepe','pattern','Embroidered')),
(7,'Navy / S / Occasion','OT-DR-1007-NV-S',199.00,279.00,5,'/assets/images/products/Product8.jpg','in_stock',JSON_OBJECT('color','Navy','size','S','style','Occasion','fit','Tailored')),
(7,'Navy / M / Occasion','OT-DR-1007-NV-M',209.00,279.00,7,'/assets/images/products/Product8.jpg','in_stock',JSON_OBJECT('color','Navy','size','M','style','Occasion','fit','Tailored')),
(7,'White / M / Occasion','OT-DR-1007-WH-M',209.00,279.00,0,'/assets/images/products/Product2.jpg','out_of_stock',JSON_OBJECT('color','White','size','M','style','Occasion','fit','Tailored')),
(9,'Royal Blue / M / Cotton Blend','OT-CO-1009-BL-M',214.00,279.00,3,'/assets/images/products/Product10.jpg','in_stock',JSON_OBJECT('color','Royal Blue','size','M','fabric','Cotton Blend','fit','Regular')),
(9,'Royal Blue / L / Cotton Blend','OT-CO-1009-BL-L',214.00,279.00,2,'/assets/images/products/Product10.jpg','in_stock',JSON_OBJECT('color','Royal Blue','size','L','fabric','Cotton Blend','fit','Regular')),
(11,'Brown / EU 42 / Block Heel','OT-SH-1011-BR-42',179.00,229.00,9,'/assets/images/products/Product11.jpg','in_stock',JSON_OBJECT('color','Brown','shoe-size','EU 42','material','Faux Leather','heel-size','Block Heel')),
(11,'Black / EU 43 / Block Heel','OT-SH-1011-BK-43',189.00,239.00,0,'/assets/images/products/Product11.jpg','out_of_stock',JSON_OBJECT('color','Black','shoe-size','EU 43','material','Faux Leather','heel-size','Block Heel')),
(12,'Black / Solid / Faux Leather','OT-AC-1012-BK',149.00,199.00,16,'/assets/images/products/Product12.jpg','in_stock',JSON_OBJECT('color','Black','material','Faux Leather','pattern','Solid','style','Casual'));

UPDATE product_variants SET image_url=COALESCE(NULLIF(image_url,''), '/assets/images/products/Product1.jpg'), availability=IF(stock_quantity > 0, 'in_stock', 'out_of_stock') WHERE product_id=1;
UPDATE product_variants SET image_url=COALESCE(NULLIF(image_url,''), '/assets/images/products/Product5.jpg'), availability=IF(stock_quantity > 0, 'in_stock', 'out_of_stock') WHERE product_id=4;
UPDATE product_variants SET image_url=COALESCE(NULLIF(image_url,''), '/assets/images/products/Product10.jpg'), availability=IF(stock_quantity > 0, 'in_stock', 'out_of_stock') WHERE product_id=9;

INSERT INTO app_settings (setting_key,setting_value) VALUES ('store_domain','https://orlatrendsin.netlify.app') ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
-- END ORLATRENDS VARIANT DEEPLINK EXTENSIONS

-- ORLATRENDS UNIVERSAL MERCHANT VARIANT EXTENSIONS
ALTER TABLE products ADD COLUMN IF NOT EXISTS availability ENUM('in_stock','out_of_stock','preorder') DEFAULT 'in_stock' AFTER stock_quantity;
UPDATE products SET availability=IF(stock_quantity > 0, 'in_stock', 'out_of_stock') WHERE availability IS NULL;

ALTER TABLE products ADD COLUMN IF NOT EXISTS google_product_category VARCHAR(180) NULL AFTER seo_description;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gtin VARCHAR(64) NULL AFTER google_product_category;
ALTER TABLE products ADD COLUMN IF NOT EXISTS mpn VARCHAR(120) NULL AFTER gtin;
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_condition ENUM('new','refurbished','used') DEFAULT 'new' AFTER mpn;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gender VARCHAR(40) NULL AFTER product_condition;
ALTER TABLE products ADD COLUMN IF NOT EXISTS age_group VARCHAR(40) NULL AFTER gender;

ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS variant_key VARCHAR(140) NULL AFTER id;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS gtin VARCHAR(64) NULL AFTER availability;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS ean VARCHAR(64) NULL AFTER gtin;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS barcode VARCHAR(64) NULL AFTER ean;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS mpn VARCHAR(120) NULL AFTER barcode;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS product_condition ENUM('new','refurbished','used') DEFAULT 'new' AFTER mpn;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS gender VARCHAR(40) NULL AFTER product_condition;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS age_group VARCHAR(40) NULL AFTER gender;

INSERT IGNORE INTO categories (id,name,slug,status,sort_order) VALUES
(11,'Mobiles','mobiles','active',11),(12,'Laptops','laptops','active',12),(13,'Electronics','electronics','active',13);

INSERT IGNORE INTO attributes (id,name,slug,type,status) VALUES
(11,'RAM','ram','text','active'),(12,'Storage','storage','text','active'),(13,'Processor','processor','text','active'),(14,'Screen Size','screen-size','text','active'),(15,'Model','model','text','active'),(16,'Connectivity','connectivity','text','active'),(17,'Warranty','warranty','text','active'),(18,'Capacity','capacity','text','active'),(19,'Gender','gender','text','active'),(20,'Age Group','age-group','text','active'),(21,'GTIN','gtin','text','active'),(22,'EAN','ean','text','active'),(23,'Barcode','barcode','text','active'),(24,'MPN','mpn','text','active'),(25,'Condition','condition','text','active');

INSERT IGNORE INTO attribute_values (attribute_id,value,display_value) VALUES
(11,'8GB','8GB'),(11,'12GB','12GB'),(11,'16GB','16GB'),(12,'128GB','128GB'),(12,'256GB','256GB'),(12,'512GB','512GB'),(12,'1TB','1TB'),(13,'Core i7','Core i7'),(13,'M3','M3'),(14,'14 inch','14 inch'),(14,'6.7 inch','6.7 inch'),(16,'5G','5G'),(17,'1 Year','1 Year'),(19,'female','female'),(19,'male','male'),(19,'unisex','unisex'),(20,'adult','adult'),(20,'kids','kids');

INSERT IGNORE INTO brands (id,name,slug,status) VALUES
(5,'Orla Tech','orla-tech','active');

INSERT IGNORE INTO products (id,name,sku,slug,description,price,compare_at_price,cost_price,stock_quantity,low_stock_threshold,status,category_id,brand_id,image_url,seo_title,seo_description,google_product_category,gtin,mpn,product_condition) VALUES
(13,'Smart Pro Mobile','OT-MB-2013','smart-pro-mobile','Premium unlocked 5G mobile with high resolution display and fast storage.',1299.00,1499.00,850.00,20,5,'active',11,5,'/assets/images/products/Product6.jpg','Smart Pro Mobile','Unlocked 5G mobile phone online.','Electronics > Communications > Telephony > Mobile Phones','','OT-MB-2013','new'),
(14,'UltraBook Air 14 Laptop','OT-LP-2014','ultrabook-air-14-laptop','Slim 14 inch laptop for work, study, and travel.',3299.00,3699.00,2400.00,12,3,'active',12,5,'/assets/images/products/Product10.jpg','UltraBook Air 14 Laptop','Premium lightweight laptop online.','Electronics > Computers > Laptops','','OT-LP-2014','new');

INSERT IGNORE INTO product_variants (product_id,variant_key,variant_name,sku,price,compare_at_price,stock_quantity,image_url,availability,gtin,ean,barcode,mpn,product_condition,attributes_json) VALUES
(13,'ot-mb-2013-bk-128','Black / 8GB RAM / 128GB Storage','OT-MB-2013-BK-128',1299.00,1499.00,8,'/assets/images/products/Product6.jpg','in_stock','6291000000012','6291000000012','6291000000012','OT-MB-2013-BK-128','new',JSON_OBJECT('color','Black','ram','8GB','storage','128GB','connectivity','5G','warranty','1 Year')),
(13,'ot-mb-2013-sl-256','Silver / 12GB RAM / 256GB Storage','OT-MB-2013-SL-256',1499.00,1699.00,0,'/assets/images/products/Product6.jpg','out_of_stock','6291000000029','6291000000029','6291000000029','OT-MB-2013-SL-256','new',JSON_OBJECT('color','Silver','ram','12GB','storage','256GB','connectivity','5G','warranty','1 Year')),
(14,'ot-lp-2014-i7-512','Space Gray / Core i7 / 512GB','OT-LP-2014-I7-512',3299.00,3699.00,6,'/assets/images/products/Product10.jpg','in_stock','6291000000036','6291000000036','6291000000036','OT-LP-2014-I7-512','new',JSON_OBJECT('color','Space Gray','processor','Core i7','storage','512GB','ram','16GB','screen-size','14 inch')),
(14,'ot-lp-2014-i7-1tb','Space Gray / Core i7 / 1TB','OT-LP-2014-I7-1TB',3599.00,3999.00,4,'/assets/images/products/Product10.jpg','in_stock','6291000000043','6291000000043','6291000000043','OT-LP-2014-I7-1TB','new',JSON_OBJECT('color','Space Gray','processor','Core i7','storage','1TB','ram','16GB','screen-size','14 inch'));

UPDATE product_variants SET variant_key=LOWER(REPLACE(REPLACE(sku,'_','-'),' ','-')) WHERE variant_key IS NULL OR variant_key='';
UPDATE products SET gender='female', age_group='adult', google_product_category=COALESCE(google_product_category,'Apparel & Accessories > Clothing') WHERE category_id IN (1,2,3,4,5,6,7,8) AND (gender IS NULL OR gender='');
-- END ORLATRENDS UNIVERSAL MERCHANT VARIANT EXTENSIONS


