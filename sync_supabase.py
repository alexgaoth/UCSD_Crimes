

import io
import os
import sys
import json
import logging
from datetime import datetime, timezone
from collections import defaultdict
from typing import List, Dict, Any, Optional

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('sync_supabase.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)

POLICE_REPORTS_JSON = 'app/public/police_reports.json'
SYNC_STATE_JSON = 'app/public/sync_state.json'

def check_dependencies():

    try:
        import supabase
        logger.info("✓ Supabase client library is installed")
    except ImportError:
        logger.error("✗ Supabase client library not found. Install with: pip install supabase")
        sys.exit(1)

def load_json_file(filepath: str) -> Dict[str, Any]:

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logger.info(f" Loaded {filepath}")
        return data
    except FileNotFoundError:
        logger.error(f" File not found: {filepath}")
        raise
    except json.JSONDecodeError as e:
        logger.error(f" Invalid JSON in {filepath}: {e}")
        raise

def save_json_file(filepath: str, data: Dict[str, Any]) -> None:

    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"✓ Saved {filepath}")
    except Exception as e:
        logger.error(f"✗ Failed to save {filepath}: {e}")
        raise

def get_supabase_client():

    from supabase import create_client, Client

    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_KEY')

    if not url or not key:
        logger.error("✗ Missing required environment variables: SUPABASE_URL and/or SUPABASE_KEY")
        raise ValueError("Missing Supabase credentials in environment variables")

    try:
        client: Client = create_client(url, key)
        logger.info("✓ Connected to Supabase")
        return client
    except Exception as e:
        logger.error(f"✗ Failed to connect to Supabase: {e}")
        raise

def fetch_approved_reports(client, last_processed_id: int) -> List[Dict[str, Any]]:

    try:
        response = client.table('user_reports')\
            .select('*')\
            .eq('status', 'approved')\
            .eq('processed', False)\
            .gt('id', last_processed_id)\
            .order('id', desc=False)\
            .execute()

        reports = response.data
        logger.info(f"✓ Fetched {len(reports)} approved reports from Supabase")
        return reports
    except Exception as e:
        logger.error(f"✗ Failed to fetch reports from Supabase: {e}")
        raise

def format_time(time_str: Optional[str]) -> str:

    if not time_str:
        return ""

    try:

        time_parts = time_str.split(':')
        hours = int(time_parts[0])
        minutes = int(time_parts[1])

        period = 'AM' if hours < 12 else 'PM'
        if hours == 0:
            hours = 12
        elif hours > 12:
            hours -= 12

        return f"{hours}:{minutes:02d} {period}"
    except (ValueError, IndexError) as e:
        logger.warning(f"⚠ Invalid time format: {time_str} - {e}")
        return time_str  

def format_date(date_str: str) -> str:

    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        return date_obj.strftime('%m/%d/%Y')
    except ValueError as e:
        logger.warning(f"⚠ Invalid date format: {date_str} - {e}")
        return date_str  

def transform_report_to_incident(report: Dict[str, Any]) -> Dict[str, Any]:

    return {
        'incident_case': report['incident_case'],
        'category': report['category'],
        'location': report['location'],
        'date_occurred': format_date(report['date_occurred']),
        'time_occurred': format_time(report.get('time_occurred')),
        'date_reported': format_date(report['date_reported']),
        'summary': report['summary'],
        'disposition': report.get('disposition', 'Under Review')
    }

def group_reports_by_date(reports: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:

    grouped = defaultdict(list)

    for report in reports:
        date_occurred = report['date_occurred']
        incident = transform_report_to_incident(report)
        grouped[date_occurred].append(incident)

    logger.info(f"✓ Grouped reports into {len(grouped)} date(s)")
    return grouped

def format_report_filename(date_str: str) -> str:

    return f"user-submitted-{date_str}.pdf"

def format_report_date(date_str: str) -> str:

    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        return date_obj.strftime('%B %d, %Y')
    except ValueError as e:
        logger.warning(f"⚠ Invalid date format: {date_str} - {e}")
        return date_str

def integrate_reports_into_json(
    police_reports: Dict[str, Any],
    grouped_reports: Dict[str, List[Dict[str, Any]]]
) -> int:

    added_count = 0

    for date_occurred, incidents in grouped_reports.items():

        existing_report = None
        for report in police_reports['reports']:

            if report.get('date') == format_report_date(date_occurred):
                existing_report = report
                break

        if existing_report:

            logger.info(f"  Adding {len(incidents)} incident(s) to existing report for {date_occurred}")
            existing_report['incidents'].extend(incidents)
            existing_report['incident_count'] = len(existing_report['incidents'])
            added_count += len(incidents)
        else:

            logger.info(f"  Creating new report for {date_occurred} with {len(incidents)} incident(s)")
            new_report = {
                'filename': format_report_filename(date_occurred),
                'date': format_report_date(date_occurred),
                'page_count': 1,  
                'incident_count': len(incidents),
                'incidents': incidents
            }
            police_reports['reports'].append(new_report)
            added_count += len(incidents)

    def safe_date_parse(report):

        try:
            date_str = report['date'].strip()

            parts = date_str.split()
            if len(parts) > 3:

                date_str = ' '.join(parts[:3])
            return datetime.strptime(date_str, '%B %d, %Y')
        except (ValueError, AttributeError) as e:
            logger.warning(f"⚠ Could not parse date '{report.get('date', 'N/A')}': {e}")

            return datetime(1900, 1, 1)

    police_reports['reports'].sort(key=safe_date_parse, reverse=True)

    logger.info(f"✓ Added {added_count} total incident(s) to JSON")
    return added_count

def mark_reports_as_processed(client, report_ids: List[int]) -> None:

    if not report_ids:
        return

    try:
        response = client.table('user_reports')\
            .update({'processed': True})\
            .in_('id', report_ids)\
            .execute()

        logger.info(f"✓ Marked {len(report_ids)} report(s) as processed in Supabase")
    except Exception as e:
        logger.error(f"✗ Failed to mark reports as processed: {e}")
        raise

def update_sync_state(sync_state: Dict[str, Any], max_id: int, count: int) -> None:

    sync_state['last_processed_index'] = max_id
    sync_state['last_sync_timestamp'] = datetime.now(timezone.utc).isoformat()
    sync_state['total_synced'] += count

def main():

    logger.info("=" * 70)
    logger.info("UCSD Crime Logs - Supabase Sync")
    logger.info("=" * 70)

    try:

        logger.info("\n[Step 1/8] Checking dependencies...")
        check_dependencies()

        logger.info("\n[Step 2/8] Loading sync state...")
        sync_state = load_json_file(SYNC_STATE_JSON)
        last_processed_id = sync_state.get('last_processed_index', 0)
        logger.info(f"  Last processed ID: {last_processed_id}")

        logger.info("\n[Step 3/8] Connecting to Supabase...")
        client = get_supabase_client()

        logger.info("\n[Step 4/8] Fetching approved reports...")
        reports = fetch_approved_reports(client, last_processed_id)

        if not reports:
            logger.info("✓ No new approved reports to sync")
            logger.info("=" * 70)
            return 0

        logger.info("\n[Step 5/8] Processing reports...")
        grouped_reports = group_reports_by_date(reports)

        logger.info("\n[Step 6/8] Updating police reports JSON...")
        police_reports = load_json_file(POLICE_REPORTS_JSON)
        added_count = integrate_reports_into_json(police_reports, grouped_reports)
        save_json_file(POLICE_REPORTS_JSON, police_reports)

        logger.info("\n[Step 7/8] Marking reports as processed...")
        report_ids = [r['id'] for r in reports]
        max_id = max(report_ids)
        mark_reports_as_processed(client, report_ids)

        logger.info("\n[Step 8/8] Updating sync state...")
        update_sync_state(sync_state, max_id, len(reports))
        save_json_file(SYNC_STATE_JSON, sync_state)

        logger.info("\n" + "=" * 70)
        logger.info("✓ SYNC COMPLETED SUCCESSFULLY")
        logger.info("=" * 70)
        logger.info(f"  Reports synced: {len(reports)}")
        logger.info(f"  Incidents added: {added_count}")
        logger.info(f"  Last processed ID: {max_id}")
        logger.info(f"  Total synced (all time): {sync_state['total_synced']}")
        logger.info("=" * 70)

        return 0

    except Exception as e:
        logger.error("\n" + "=" * 70)
        logger.error("✗ SYNC FAILED")
        logger.error("=" * 70)
        logger.error(f"  Error: {e}")
        logger.error("=" * 70)
        return 1

if __name__ == '__main__':
    sys.exit(main())