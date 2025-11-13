-- ============================================================================
-- UCSD Crime Logs - Upvotes Table Setup
-- ============================================================================
-- Creates the report_upvotes table for tracking upvotes on crime reports
-- Run this query in the Supabase SQL Editor to set up the table
-- ============================================================================

-- Create the report_upvotes table
CREATE TABLE IF NOT EXISTS report_upvotes (
    incident_case TEXT PRIMARY KEY,
    upvote_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_report_upvotes_incident_case ON report_upvotes(incident_case);

-- Add RLS (Row Level Security) policies
ALTER TABLE report_upvotes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read upvote counts
CREATE POLICY "Allow public read access" ON report_upvotes
    FOR SELECT
    USING (true);

-- Allow anyone to insert upvotes (for creating initial record)
CREATE POLICY "Allow public insert" ON report_upvotes
    FOR INSERT
    WITH CHECK (true);

-- Allow anyone to update upvote counts
CREATE POLICY "Allow public update" ON report_upvotes
    FOR UPDATE
    USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_upvotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on every update
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON report_upvotes
    FOR EACH ROW
    EXECUTE FUNCTION update_upvotes_updated_at();

-- ============================================================================
-- Notes:
-- ============================================================================
-- - Run this SQL in the Supabase SQL Editor
-- - The table supports both user-submitted (USER-YYYY-NNN) and official reports
-- - RLS policies allow public read and increment operations
-- - The updated_at timestamp is automatically maintained
-- ============================================================================
