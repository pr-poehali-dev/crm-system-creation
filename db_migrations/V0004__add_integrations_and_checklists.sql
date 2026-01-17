CREATE TABLE IF NOT EXISTS t_p81623955_crm_system_creation.branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p81623955_crm_system_creation.integrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    config TEXT,
    avito_client_id VARCHAR(255),
    avito_client_secret VARCHAR(255),
    telegram_bot_token VARCHAR(255),
    telegram_chat_id VARCHAR(255),
    whatsapp_api_key VARCHAR(255),
    whatsapp_phone VARCHAR(50),
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p81623955_crm_system_creation.checklists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p81623955_crm_system_creation.checklist_items (
    id SERIAL PRIMARY KEY,
    checklist_id INTEGER,
    category VARCHAR(100),
    item VARCHAR(255) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS t_p81623955_crm_system_creation.vehicle_inspections (
    id SERIAL PRIMARY KEY,
    fleet_id INTEGER,
    request_id INTEGER,
    checklist_id INTEGER,
    employee_id INTEGER,
    inspection_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'В процессе',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p81623955_crm_system_creation.inspection_results (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER,
    checklist_item_id INTEGER,
    status VARCHAR(50),
    value TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);