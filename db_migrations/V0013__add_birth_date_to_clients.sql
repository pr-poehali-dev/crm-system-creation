-- Добавляем поле birth_date в таблицу clients
ALTER TABLE t_p81623955_crm_system_creation.clients 
ADD COLUMN IF NOT EXISTS birth_date DATE;