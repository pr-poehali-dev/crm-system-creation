-- Создание таблиц для CRM системы

-- Клиенты
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    company VARCHAR(255),
    passport VARCHAR(100),
    driver_license VARCHAR(100),
    address TEXT,
    notes TEXT,
    balance DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Автопарк
CREATE TABLE fleet (
    id SERIAL PRIMARY KEY,
    model VARCHAR(255) NOT NULL,
    license_plate VARCHAR(50) NOT NULL UNIQUE,
    year INTEGER,
    color VARCHAR(50),
    vin VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Свободен',
    location VARCHAR(255),
    next_service_date DATE,
    daily_rate DECIMAL(10, 2),
    km_rate DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Услуги/Тарифы
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    km_price DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Заявки
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    service_id INTEGER REFERENCES services(id),
    fleet_id INTEGER REFERENCES fleet(id),
    status VARCHAR(50) DEFAULT 'Новая',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    days INTEGER DEFAULT 1,
    km INTEGER DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- История изменений заявок
CREATE TABLE request_history (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES requests(id),
    action VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Платежи
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES requests(id),
    client_id INTEGER REFERENCES clients(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Завершён',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Сотрудники
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    position VARCHAR(100),
    balance DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX idx_requests_client ON requests(client_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created ON requests(created_at);
CREATE INDEX idx_payments_request ON payments(request_id);
CREATE INDEX idx_fleet_status ON fleet(status);
CREATE INDEX idx_clients_phone ON clients(phone);