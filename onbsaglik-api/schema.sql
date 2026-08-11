-- ===================================================
-- OnbSağlık PostgreSQL Veritabanı Şeması (Supabase SQL)
-- ===================================================

-- 1. Ürünler Tablosu
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    brand_slug VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    category_slug VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    market_price DECIMAL(10, 2) DEFAULT 0,
    stock INT DEFAULT 0,
    vat_rate INT DEFAULT 10,
    images TEXT[],
    barcode VARCHAR(100),
    trendyol_link TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Siparişler Tablosu
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    payment_token VARCHAR(255) NOT NULL,
    items JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    customer_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Yönetici Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Varsayılan Admin Kullanıcısı (Şifre: onbAdmin2024!)
INSERT INTO users (email, password_hash, role)
VALUES ('admin@onbsaglik.com', '$2b$10$vI8A7y+K75.Z7yN.z58b9.aFk9O6nKx0Y9W6vG8b9Z8vG8b9Z8vG8', 'super_admin')
ON CONFLICT (email) DO NOTHING;
