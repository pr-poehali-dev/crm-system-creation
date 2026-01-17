-- Таблица лидов
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    lead_id VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    vehicle_type VARCHAR(100),
    rental_period VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица партнёров
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    partner_id VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    telegram_username VARCHAR(100),
    telegram_link VARCHAR(255),
    legal_name VARCHAR(255),
    inn VARCHAR(20),
    kpp VARCHAR(20),
    legal_address TEXT,
    bank_name VARCHAR(255),
    bank_account VARCHAR(50),
    correspondent_account VARCHAR(50),
    bik VARCHAR(20),
    passport_series VARCHAR(10),
    passport_number VARCHAR(20),
    passport_issued_by TEXT,
    passport_issued_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица автомобилей партнёров (субаренда)
CREATE TABLE IF NOT EXISTS partner_vehicles (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL,
    model VARCHAR(255) NOT NULL,
    license_plate VARCHAR(50) NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица услуг подрядчиков
CREATE TABLE IF NOT EXISTS partner_services (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица выдач и приёмов автомобилей
CREATE TABLE IF NOT EXISTS vehicle_handovers (
    id SERIAL PRIMARY KEY,
    handover_id VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id INTEGER NOT NULL,
    booking_id INTEGER,
    type VARCHAR(20) NOT NULL CHECK (type IN ('pickup', 'return')),
    handover_date DATE NOT NULL,
    handover_time TIME NOT NULL,
    odometer VARCHAR(100) NOT NULL,
    fuel_level VARCHAR(100) NOT NULL,
    transponder_needed BOOLEAN DEFAULT FALSE,
    transponder_number VARCHAR(100),
    deposit_amount DECIMAL(10, 2) DEFAULT 0,
    rental_amount DECIMAL(10, 2) DEFAULT 0,
    rental_payment_method VARCHAR(50),
    rental_receipt_url TEXT,
    damages TEXT,
    notes TEXT,
    custom_fields JSONB,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица финансовых операций (расширенная)
CREATE TABLE IF NOT EXISTS finance_operations (
    id SERIAL PRIMARY KEY,
    operation_id VARCHAR(50) UNIQUE NOT NULL,
    booking_id VARCHAR(50),
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    client_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('payment', 'debt', 'expense')),
    method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    document_url TEXT,
    document_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(type);
CREATE INDEX IF NOT EXISTS idx_vehicle_handovers_vehicle ON vehicle_handovers(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_handovers_booking ON vehicle_handovers(booking_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_handovers_date ON vehicle_handovers(handover_date DESC);
CREATE INDEX IF NOT EXISTS idx_finance_category ON finance_operations(category);
CREATE INDEX IF NOT EXISTS idx_finance_date ON finance_operations(date DESC);