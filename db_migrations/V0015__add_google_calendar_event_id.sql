-- Добавление поля для хранения ID события в Google Calendar
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS google_calendar_event_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_bookings_google_event ON bookings(google_calendar_event_id);
