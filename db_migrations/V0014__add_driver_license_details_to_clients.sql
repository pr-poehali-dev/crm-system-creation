-- Добавляем поля для водительского удостоверения в таблицу clients
ALTER TABLE t_p81623955_crm_system_creation.clients 
ADD COLUMN IF NOT EXISTS driver_license_series VARCHAR(20),
ADD COLUMN IF NOT EXISTS driver_license_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS driver_license_issued_date DATE;