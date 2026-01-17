CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(booking_type);
CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_bookings_contract ON bookings(contract_number);
CREATE INDEX IF NOT EXISTS idx_bookings_manager ON bookings(assigned_manager);