-- Migration to add user tracking columns to all tables
-- Run this script against your PostgreSQL database to track who created/updated records

-- Add user tracking columns to absences table
ALTER TABLE absences 
ADD COLUMN
IF NOT EXISTS created_by_email VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS created_by_name VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS updated_by_email VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS updated_by_name VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN
IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add user tracking columns to downed_equipment table
ALTER TABLE downed_equipment 
ADD COLUMN
IF NOT EXISTS created_by_email VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS created_by_name VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS updated_by_email VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS updated_by_name VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN
IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add user tracking columns to on_call_staff table
ALTER TABLE on_call_staff 
ADD COLUMN
IF NOT EXISTS created_by_email VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS created_by_name VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS updated_by_email VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS updated_by_name VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN
IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add user tracking columns to notices table
ALTER TABLE notices 
ADD COLUMN
IF NOT EXISTS created_by_email VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS created_by_name VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS updated_by_email VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS updated_by_name VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN
IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add user tracking columns to emergency_alerts table
ALTER TABLE emergency_alerts 
ADD COLUMN
IF NOT EXISTS created_by_email VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS created_by_name VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS updated_by_email VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS updated_by_name VARCHAR
(255),
ADD COLUMN
IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN
IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for better query performance
CREATE INDEX
IF NOT EXISTS idx_absences_created_by ON absences
(created_by_email);
CREATE INDEX
IF NOT EXISTS idx_absences_updated_by ON absences
(updated_by_email);
CREATE INDEX
IF NOT EXISTS idx_equipment_created_by ON downed_equipment
(created_by_email);
CREATE INDEX
IF NOT EXISTS idx_equipment_updated_by ON downed_equipment
(updated_by_email);
CREATE INDEX
IF NOT EXISTS idx_oncall_created_by ON on_call_staff
(created_by_email);
CREATE INDEX
IF NOT EXISTS idx_oncall_updated_by ON on_call_staff
(updated_by_email);
CREATE INDEX
IF NOT EXISTS idx_notices_created_by ON notices
(created_by_email);
CREATE INDEX
IF NOT EXISTS idx_notices_updated_by ON notices
(updated_by_email);
CREATE INDEX
IF NOT EXISTS idx_alerts_created_by ON emergency_alerts
(created_by_email);
CREATE INDEX
IF NOT EXISTS idx_alerts_updated_by ON emergency_alerts
(updated_by_email);

-- Add trigger function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for each table
DROP TRIGGER IF EXISTS update_absences_updated_at
ON absences;
CREATE TRIGGER update_absences_updated_at
    BEFORE
UPDATE ON absences
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

DROP TRIGGER IF EXISTS update_equipment_updated_at
ON downed_equipment;
CREATE TRIGGER update_equipment_updated_at
    BEFORE
UPDATE ON downed_equipment
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

DROP TRIGGER IF EXISTS update_oncall_updated_at
ON on_call_staff;
CREATE TRIGGER update_oncall_updated_at
    BEFORE
UPDATE ON on_call_staff
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

DROP TRIGGER IF EXISTS update_notices_updated_at
ON notices;
CREATE TRIGGER update_notices_updated_at
    BEFORE
UPDATE ON notices
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

DROP TRIGGER IF EXISTS update_alerts_updated_at
ON emergency_alerts;
CREATE TRIGGER update_alerts_updated_at
    BEFORE
UPDATE ON emergency_alerts
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();
