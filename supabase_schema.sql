-- ============================================================================
-- UCSD Crime Logs - Supabase Database Schema
-- User-Submitted Crime Reports
-- ============================================================================

-- Drop existing objects if they exist (for clean reinstallation)
DROP TRIGGER IF EXISTS update_user_reports_updated_at ON user_reports;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS user_reports;
DROP TYPE IF EXISTS report_status;

-- ============================================================================
-- 1. Custom Types
-- ============================================================================

-- Status enum for report approval workflow
CREATE TYPE report_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================================
-- 2. Main Table: user_reports
-- ============================================================================

CREATE TABLE user_reports (
    -- Primary key
    id BIGSERIAL PRIMARY KEY,

    -- Incident identification
    incident_case VARCHAR(20) UNIQUE NOT NULL,  -- Format: USER-YYYY-NNN (e.g., USER-2025-001)

    -- Incident details (matching police_reports.json structure)
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    date_occurred DATE NOT NULL,
    time_occurred TIME,  -- Optional, as some reports may not have specific times
    date_reported DATE NOT NULL DEFAULT CURRENT_DATE,
    summary TEXT NOT NULL,
    disposition VARCHAR(100) DEFAULT 'Under Review',

    -- Additional fields for user submissions
    contact_info TEXT,  -- Optional contact information (email/phone)

    -- Workflow management
    status report_status DEFAULT 'pending',
    processed BOOLEAN DEFAULT FALSE,  -- Tracks if added to JSON file

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT valid_date_occurred CHECK (date_occurred <= CURRENT_DATE),
    CONSTRAINT valid_date_reported CHECK (date_reported <= CURRENT_DATE),
    CONSTRAINT incident_case_format CHECK (incident_case ~ '^USER-[0-9]{4}-[0-9]{3}$')
);

-- ============================================================================
-- 3. Indexes for Performance
-- ============================================================================

-- Index on status for filtering pending/approved reports
CREATE INDEX idx_user_reports_status ON user_reports(status);

-- Index on processed flag for sync operations
CREATE INDEX idx_user_reports_processed ON user_reports(processed) WHERE processed = FALSE;

-- Composite index for sync queries (status + processed + id)
CREATE INDEX idx_user_reports_sync ON user_reports(status, processed, id);

-- Index on date_occurred for date-based queries
CREATE INDEX idx_user_reports_date_occurred ON user_reports(date_occurred DESC);

-- Index on created_at for chronological queries
CREATE INDEX idx_user_reports_created_at ON user_reports(created_at DESC);

-- Index on incident_case for lookups
CREATE INDEX idx_user_reports_incident_case ON user_reports(incident_case);

-- ============================================================================
-- 4. Automatic Timestamp Update Function
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Triggers
-- ============================================================================

-- Automatically update updated_at on row modification
CREATE TRIGGER update_user_reports_updated_at
    BEFORE UPDATE ON user_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on the table
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public INSERT for new report submissions
-- This allows anyone to submit a report without authentication
CREATE POLICY "Allow public insert" ON user_reports
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Policy: Allow public SELECT for viewing their own reports
-- Users can view reports (useful if you want to add a "check status" feature later)
CREATE POLICY "Allow public select" ON user_reports
    FOR SELECT
    TO public
    USING (true);

-- Policy: Allow service role to do everything
-- The sync script will use the service role key
CREATE POLICY "Allow service role all operations" ON user_reports
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to UPDATE (for admin panel)
-- This allows you to build an admin interface for approving/rejecting reports
CREATE POLICY "Allow authenticated update" ON user_reports
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 7. Helper Function: Generate Next Incident Case Number
-- ============================================================================

CREATE OR REPLACE FUNCTION get_next_incident_case()
RETURNS VARCHAR AS $$
DECLARE
    current_year INTEGER;
    next_number INTEGER;
    case_number VARCHAR(20);
BEGIN
    -- Get current year
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);

    -- Find the highest number for the current year
    SELECT COALESCE(
        MAX(
            CAST(
                SUBSTRING(incident_case FROM 'USER-[0-9]{4}-([0-9]{3})$')
                AS INTEGER
            )
        ),
        0
    ) + 1
    INTO next_number
    FROM user_reports
    WHERE incident_case LIKE 'USER-' || current_year || '-%';

    -- Format the case number
    case_number := 'USER-' || current_year || '-' || LPAD(next_number::TEXT, 3, '0');

    RETURN case_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. Sample Data (Optional - for testing)
-- ============================================================================

-- Uncomment the following to insert sample data for testing

/*
INSERT INTO user_reports (
    incident_case,
    category,
    location,
    date_occurred,
    time_occurred,
    summary,
    contact_info,
    status
) VALUES
(
    'USER-2025-001',
    'Suspicious Activity',
    'Geisel Library, 5th Floor',
    '2025-01-15',
    '14:30:00',
    'Observed individual attempting to access restricted area near the Special Collections section.',
    'student@ucsd.edu',
    'approved'
),
(
    'USER-2025-002',
    'Theft',
    'Price Center',
    '2025-01-16',
    '11:00:00',
    'Laptop stolen from table in food court area. Black Dell laptop left unattended for approximately 10 minutes.',
    NULL,
    'pending'
),
(
    'USER-2025-003',
    'Safety Concern',
    'Revelle College Parking Lot',
    '2025-01-16',
    '20:15:00',
    'Several street lights are out in the parking lot, creating dark areas that feel unsafe.',
    '858-555-1234',
    'approved'
);
*/

-- ============================================================================
-- 9. Utility Views (Optional - for analytics)
-- ============================================================================

-- View: Approved reports ready for sync
CREATE OR REPLACE VIEW reports_ready_for_sync AS
SELECT
    id,
    incident_case,
    category,
    location,
    date_occurred,
    time_occurred,
    date_reported,
    summary,
    disposition,
    created_at
FROM user_reports
WHERE status = 'approved' AND processed = FALSE
ORDER BY id ASC;

-- View: Report statistics
CREATE OR REPLACE VIEW report_statistics AS
SELECT
    status,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE processed = TRUE) as processed_count,
    COUNT(*) FILTER (WHERE processed = FALSE) as pending_sync_count
FROM user_reports
GROUP BY status;

-- ============================================================================
-- Setup Complete!
-- ============================================================================

-- Display confirmation message
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Supabase schema created successfully!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Tables created: user_reports';
    RAISE NOTICE 'Views created: reports_ready_for_sync, report_statistics';
    RAISE NOTICE 'Functions created: get_next_incident_case()';
    RAISE NOTICE 'RLS policies enabled for security';
    RAISE NOTICE '===========================================';
END $$;
