-- ============================================================================
-- UCSD Crime Logs - Admin SQL Queries
-- ============================================================================
-- Helpful SQL queries for managing user-submitted crime reports.
-- Run these queries in the Supabase SQL Editor or via your preferred
-- PostgreSQL client.
-- ============================================================================

-- ============================================================================
-- 1. VIEW ALL PENDING REPORTS (Need Review)
-- ============================================================================
-- Shows all reports waiting for approval/rejection, ordered by submission date

SELECT
    id,
    incident_case,
    category,
    location,
    date_occurred,
    time_occurred,
    summary,
    contact_info,
    created_at,
    DATE_PART('day', NOW() - created_at) as days_pending
FROM user_reports
WHERE status = 'pending'
ORDER BY created_at ASC;

-- ============================================================================
-- 2. APPROVE A REPORT (by ID)
-- ============================================================================
-- Replace <REPORT_ID> with the actual ID of the report

UPDATE user_reports
SET status = 'approved'
WHERE id = <REPORT_ID>;

-- ============================================================================
-- 3. APPROVE MULTIPLE REPORTS (by IDs)
-- ============================================================================
-- Replace <ID1>, <ID2>, <ID3> with actual IDs

UPDATE user_reports
SET status = 'approved'
WHERE id IN (<ID1>, <ID2>, <ID3>);

-- ============================================================================
-- 4. REJECT A REPORT (by ID)
-- ============================================================================
-- Replace <REPORT_ID> with the actual ID of the report

UPDATE user_reports
SET status = 'rejected'
WHERE id = <REPORT_ID>;

-- ============================================================================
-- 5. APPROVE ALL REPORTS OLDER THAN N DAYS
-- ============================================================================
-- Auto-approve reports that are older than 7 days (adjust as needed)

UPDATE user_reports
SET status = 'approved'
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '7 days';

-- ============================================================================
-- 6. VIEW APPROVED REPORTS READY FOR SYNC
-- ============================================================================
-- Shows approved reports that haven't been synced to JSON yet

SELECT
    id,
    incident_case,
    category,
    location,
    date_occurred,
    summary,
    created_at,
    DATE_PART('day', NOW() - created_at) as days_since_submission
FROM user_reports
WHERE status = 'approved'
  AND processed = FALSE
ORDER BY date_occurred DESC;

-- ============================================================================
-- 7. VIEW ALL REPORTS (with status breakdown)
-- ============================================================================
-- Shows all reports with their current status

SELECT
    id,
    incident_case,
    category,
    location,
    date_occurred,
    status,
    processed,
    created_at
FROM user_reports
ORDER BY created_at DESC
LIMIT 100;

-- ============================================================================
-- 8. GET STATISTICS BY STATUS
-- ============================================================================
-- Shows count of reports by status

SELECT
    status,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE processed = TRUE) as synced,
    COUNT(*) FILTER (WHERE processed = FALSE) as not_synced
FROM user_reports
GROUP BY status
ORDER BY status;

-- ============================================================================
-- 9. GET STATISTICS BY CATEGORY
-- ============================================================================
-- Shows count of reports by category

SELECT
    category,
    COUNT(*) as total_reports,
    COUNT(*) FILTER (WHERE status = 'approved') as approved,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected
FROM user_reports
GROUP BY category
ORDER BY total_reports DESC;

-- ============================================================================
-- 10. VIEW REPORTS BY DATE RANGE
-- ============================================================================
-- Shows reports within a specific date range
-- Replace <START_DATE> and <END_DATE> with actual dates (e.g., '2025-01-01')

SELECT
    id,
    incident_case,
    category,
    location,
    date_occurred,
    summary,
    status
FROM user_reports
WHERE date_occurred BETWEEN '<START_DATE>' AND '<END_DATE>'
ORDER BY date_occurred DESC;

-- ============================================================================
-- 11. SEARCH REPORTS BY KEYWORD
-- ============================================================================
-- Search for reports containing specific keywords in summary or location
-- Replace <KEYWORD> with your search term

SELECT
    id,
    incident_case,
    category,
    location,
    date_occurred,
    summary,
    status
FROM user_reports
WHERE
    summary ILIKE '%<KEYWORD>%'
    OR location ILIKE '%<KEYWORD>%'
ORDER BY created_at DESC;

-- ============================================================================
-- 12. VIEW RECENT SUBMISSIONS (Last 7 Days)
-- ============================================================================

SELECT
    id,
    incident_case,
    category,
    location,
    date_occurred,
    status,
    created_at
FROM user_reports
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- ============================================================================
-- 13. VIEW REJECTED REPORTS (for review)
-- ============================================================================

SELECT
    id,
    incident_case,
    category,
    location,
    date_occurred,
    summary,
    created_at
FROM user_reports
WHERE status = 'rejected'
ORDER BY created_at DESC;

-- ============================================================================
-- 14. DELETE A REPORT (use with caution!)
-- ============================================================================
-- Only use this if you need to permanently remove a report
-- Replace <REPORT_ID> with the actual ID

-- DELETE FROM user_reports WHERE id = <REPORT_ID>;

-- ============================================================================
-- 15. RESET A PROCESSED REPORT (for re-syncing)
-- ============================================================================
-- Mark a report as not processed so it will be synced again
-- Replace <REPORT_ID> with the actual ID

UPDATE user_reports
SET processed = FALSE
WHERE id = <REPORT_ID>;

-- ============================================================================
-- 16. VIEW SYNC HISTORY
-- ============================================================================
-- Shows when reports were last synced

SELECT
    COUNT(*) as total_synced,
    MAX(updated_at) as last_sync_time,
    COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '24 hours') as synced_last_24h
FROM user_reports
WHERE processed = TRUE;

-- ============================================================================
-- 17. BULK APPROVE BY CATEGORY
-- ============================================================================
-- Approve all pending reports of a specific category
-- Replace <CATEGORY> with the actual category (e.g., 'Safety Concern')

UPDATE user_reports
SET status = 'approved'
WHERE status = 'pending'
  AND category = '<CATEGORY>';

-- ============================================================================
-- 18. VIEW REPORTS WITH CONTACT INFO
-- ============================================================================
-- Shows reports where users provided contact information

SELECT
    id,
    incident_case,
    category,
    location,
    date_occurred,
    contact_info,
    status,
    created_at
FROM user_reports
WHERE contact_info IS NOT NULL
  AND contact_info != ''
ORDER BY created_at DESC;

-- ============================================================================
-- 19. UPDATE REPORT DETAILS (if needed)
-- ============================================================================
-- Edit specific fields of a report
-- Replace <REPORT_ID> and field values as needed

UPDATE user_reports
SET
    category = '<NEW_CATEGORY>',
    location = '<NEW_LOCATION>',
    summary = '<NEW_SUMMARY>'
WHERE id = <REPORT_ID>;

-- ============================================================================
-- 20. GET NEXT INCIDENT CASE NUMBER (Preview)
-- ============================================================================
-- See what the next case number will be without creating a report

SELECT get_next_incident_case();

-- ============================================================================
-- 21. VIEW PROCESSED REPORTS (Successfully Synced)
-- ============================================================================

SELECT
    id,
    incident_case,
    category,
    location,
    date_occurred,
    updated_at as synced_at
FROM user_reports
WHERE status = 'approved'
  AND processed = TRUE
ORDER BY updated_at DESC
LIMIT 50;

-- ============================================================================
-- 22. MONTHLY STATISTICS
-- ============================================================================
-- Shows submission counts by month

SELECT
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE status = 'approved') as approved,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected
FROM user_reports
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- ============================================================================
-- Notes:
-- ============================================================================
-- - Always preview queries with SELECT before running UPDATE/DELETE
-- - Take database backups before bulk operations
-- - Consider creating a simple admin dashboard for easier management
-- - Monitor the sync_state.json file to verify sync operations are working
-- ============================================================================
