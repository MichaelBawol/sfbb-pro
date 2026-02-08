-- ============================================
-- ADD LOCATION_ID TO ALL DATA TABLES
-- Enables multi-location data separation
-- ============================================

-- Add location_id to temperature_logs
ALTER TABLE temperature_logs ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_temperature_logs_location ON temperature_logs(location_id);

-- Add location_id to checklists
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_checklists_location ON checklists(location_id);

-- Add location_id to cleaning_records
ALTER TABLE cleaning_records ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_cleaning_records_location ON cleaning_records(location_id);

-- Add location_id to waste_logs
ALTER TABLE waste_logs ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_waste_logs_location ON waste_logs(location_id);

-- Add location_id to maintenance_logs
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_location ON maintenance_logs(location_id);

-- Add location_id to spot_checks
ALTER TABLE spot_checks ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_spot_checks_location ON spot_checks(location_id);

-- Add location_id to diary_entries
ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_diary_entries_location ON diary_entries(location_id);

-- Add location_id to weekly_extra_checks
ALTER TABLE weekly_extra_checks ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_weekly_extra_checks_location ON weekly_extra_checks(location_id);

-- Add location_id to four_weekly_reviews
ALTER TABLE four_weekly_reviews ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_four_weekly_reviews_location ON four_weekly_reviews(location_id);

-- Add location_id to appliances (equipment can be location-specific)
ALTER TABLE appliances ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_appliances_location ON appliances(location_id);

-- Add location_id to alerts
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_alerts_location ON alerts(location_id);

-- Add location_id to suppliers (suppliers might serve specific locations)
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_suppliers_location ON suppliers(location_id);

-- Add location_id to dishes (menu might vary by location)
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_dishes_location ON dishes(location_id);

-- Note: location_id is nullable so existing data continues to work
-- Existing records with NULL location_id will be visible from all locations
-- New records will be tagged with the active location
