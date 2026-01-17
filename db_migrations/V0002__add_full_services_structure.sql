-- Добавление категорий услуг
CREATE TABLE service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES service_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Обновление таблицы услуг - добавление новых полей
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES service_categories(id);
ALTER TABLE services ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2);
ALTER TABLE services ADD COLUMN IF NOT EXISTS crossover_markup DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS minivan_markup DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS bus_markup DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS night_markup DECIMAL(5, 2) DEFAULT 50;
ALTER TABLE services ADD COLUMN IF NOT EXISTS weekend_markup DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Добавление таблицы пакетных предложений
CREATE TABLE service_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    base_price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    crossover_markup DECIMAL(5, 2) DEFAULT 30,
    minivan_markup DECIMAL(5, 2) DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Связь пакетов с услугами
CREATE TABLE package_services (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES service_packages(id),
    service_id INTEGER REFERENCES services(id),
    quantity INTEGER DEFAULT 1
);

-- Тарифы выезда
CREATE TABLE travel_rates (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(255) NOT NULL,
    min_distance INTEGER,
    max_distance INTEGER,
    price DECIMAL(10, 2) NOT NULL,
    free_from_amount DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE
);

-- Абонементы
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    visits_per_period INTEGER,
    period_days INTEGER,
    discount_percent DECIMAL(5, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Клиентские абонементы
CREATE TABLE client_subscriptions (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    subscription_id INTEGER REFERENCES subscriptions(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    visits_left INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);