-- Создание таблицы для бронирований с полной информацией

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    
    -- Идентификатор клиента
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    
    -- Информация об автомобиле
    vehicle_id INTEGER REFERENCES fleet(id),
    vehicle_model VARCHAR(255),
    vehicle_license_plate VARCHAR(50),
    
    -- Даты и период
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    days INTEGER NOT NULL DEFAULT 1,
    
    -- Маршрут
    pickup_location VARCHAR(500),
    dropoff_location VARCHAR(500),
    
    -- Статус
    status VARCHAR(50) NOT NULL DEFAULT 'Бронь',
    
    -- Финансы
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Услуги (JSON массив с выбранными услугами и ценами)
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Расчёт аренды
    rental_days INTEGER,
    rental_km INTEGER,
    rental_price_per_day DECIMAL(10, 2),
    rental_price_per_km DECIMAL(10, 2),
    
    -- Дополнительные поля
    notes TEXT,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    
    -- История платежей (JSON массив)
    payments JSONB DEFAULT '[]'::jsonb,
    
    -- Метаданные
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_client_phone ON bookings(client_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);