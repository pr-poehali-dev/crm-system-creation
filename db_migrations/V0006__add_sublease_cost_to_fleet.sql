-- Добавляем поле стоимости субаренды для автомобилей
ALTER TABLE t_p81623955_crm_system_creation.fleet 
ADD COLUMN IF NOT EXISTS sublease_cost DECIMAL(10, 2) DEFAULT 0.00;

COMMENT ON COLUMN t_p81623955_crm_system_creation.fleet.sublease_cost IS 'Стоимость субаренды автомобиля (если берём в аренду у другой компании), руб/сутки';