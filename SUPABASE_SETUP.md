# Supabase Integration Setup Guide

This guide walks you through setting up Supabase for the UCSD Crime Logs user report submission feature.

## Prerequisites

- A [Supabase](https://supabase.com/) account (free tier is sufficient)
- GitHub repository access (for setting secrets)
- Python 3.11+ installed locally
- Node.js 20+ installed locally

## Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign up/login
2. Click "New Project"
3. Fill in the details:
   - **Name**: UCSD Crime Logs (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., West US)
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

### 2. Initialize Database

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Open the file `supabase_schema.sql` from this repository
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify success - you should see:
   ```
   Success. No rows returned
   ```

### 3. Verify Database Setup

1. Click **Table Editor** in the left sidebar
2. You should see a new table: `user_reports`
3. Click on the table to view its structure
4. Verify columns exist: id, incident_case, category, location, etc.

### 4. Get API Credentials

1. Click **Settings** (gear icon) in the left sidebar
2. Click **API** under Project Settings
3. Copy the following values:

   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon/public key: eyJhbGc...
   service_role key: eyJhbGc...
   ```

   **Important**:
   - The `anon` key is safe for public use (frontend)
   - The `service_role` key must be kept secret (backend only)

### 5. Configure Local Development

#### Backend (Python sync script)

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```bash
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_KEY=eyJhbGc...YOUR_SERVICE_ROLE_KEY...
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Test the sync script:
   ```bash
   python sync_supabase.py
   ```

   You should see:
   ```
   ✓ Connected to Supabase
   ✓ No new approved reports to sync
   ```

#### Frontend (React app)

1. Navigate to the app directory:
   ```bash
   cd app
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Edit `app/.env` and add your credentials:
   ```bash
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...YOUR_ANON_KEY...
   ```

4. Install Node dependencies:
   ```bash
   npm install
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. Test the submission form:
   - Navigate to http://localhost:5173/report-case
   - Fill out and submit a test report
   - Check your Supabase dashboard to see the submission

### 6. Configure GitHub Actions

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add the first secret:
   - **Name**: `SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - Click **Add secret**

5. Add the second secret:
   - **Name**: `SUPABASE_KEY`
   - **Value**: Your Supabase service role key
   - Click **Add secret**

### 7. Test End-to-End Workflow

1. **Submit a test report** via the frontend form
2. **Check Supabase**:
   - Go to Table Editor > user_reports
   - You should see your report with status = 'pending'

3. **Approve the report**:
   - In Supabase, click on SQL Editor
   - Run: `UPDATE user_reports SET status = 'approved' WHERE id = 1;`
   - Or use queries from `admin_queries.sql`

4. **Run sync locally**:
   ```bash
   python sync_supabase.py
   ```
   - Check `app/public/police_reports.json` - your report should be added
   - Check `app/public/sync_state.json` - should show last_processed_index = 1

5. **Verify on GitHub Actions** (optional):
   - Push your changes to trigger the workflow
   - Go to Actions tab in your GitHub repo
   - Wait for the workflow to complete
   - Verify the report appears on the live site

## Common Issues & Solutions

### Issue: "Missing Supabase credentials"

**Solution**: Verify your .env files exist and have the correct variable names:
- Root: `SUPABASE_URL` and `SUPABASE_KEY`
- App: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Issue: "Failed to connect to Supabase"

**Solutions**:
- Verify your Supabase project is active (not paused)
- Check that the URL is correct (no trailing slash)
- Verify the key is copied completely (they're very long!)
- Check your internet connection

### Issue: "Permission denied" when inserting reports

**Solution**: Verify RLS policies are enabled:
1. Go to Table Editor > user_reports
2. Click the shield icon (RLS)
3. Verify "Row Level Security" is enabled
4. Check that the "Allow public insert" policy exists

### Issue: Reports not syncing

**Solutions**:
1. Verify reports are marked as 'approved':
   ```sql
   SELECT * FROM user_reports WHERE status = 'approved';
   ```
2. Check the sync_state.json file
3. Run sync script manually to see error messages
4. Verify GitHub secrets are set correctly

### Issue: "function get_next_incident_case() does not exist"

**Solution**: Re-run the `supabase_schema.sql` script - the function may not have been created.

## Managing Submissions

### View All Pending Reports

```sql
SELECT id, incident_case, category, location, summary, created_at
FROM user_reports
WHERE status = 'pending'
ORDER BY created_at ASC;
```

### Approve a Report

```sql
UPDATE user_reports
SET status = 'approved'
WHERE id = <REPORT_ID>;
```

### Reject a Report

```sql
UPDATE user_reports
SET status = 'rejected'
WHERE id = <REPORT_ID>;
```

### View Sync Statistics

```sql
SELECT * FROM report_statistics;
```

See `admin_queries.sql` for more helpful queries!

## Security Best Practices

1. ✅ **Never commit .env files** - they're in .gitignore
2. ✅ **Use service_role key only server-side** - never in frontend code
3. ✅ **Use anon key in frontend** - it has limited permissions via RLS
4. ✅ **Keep GitHub secrets secure** - only admins should access them
5. ✅ **Regularly review submissions** - check for spam/abuse
6. ✅ **Monitor Supabase usage** - free tier has limits (500MB DB, 2GB bandwidth)

## Architecture Overview

```
User Submission Flow:
1. User fills form → ReportCase.jsx
2. Frontend submits → Supabase (via anon key)
3. Report saved with status='pending'
4. Admin reviews in Supabase dashboard
5. Admin approves → status='approved'
6. GitHub Action runs sync_supabase.py (every 8 hours)
7. Script fetches approved reports
8. Adds to police_reports.json
9. Marks as processed=true in Supabase
10. Site redeploys with new data
```

## Next Steps

- [ ] Submit a test report and verify it works
- [ ] Set up a regular review schedule for submissions
- [ ] Consider building an admin dashboard for easier management
- [ ] Monitor Supabase usage and upgrade if needed
- [ ] Add email notifications for report status updates (future enhancement)

## Support

- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: https://github.com/alexgaoth/UCSD_Crimes/issues
- **Admin Queries**: See `admin_queries.sql` for helpful SQL queries

---

**Questions?** Open an issue on GitHub or consult the main README.md file.
