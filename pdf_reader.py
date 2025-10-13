import os
import json
import re
from pathlib import Path
import pdfplumber

def parse_pdf_content(text):
    incidents = []
    
    lines = text.split('\n')
    i = 0
    
    while i < len(lines):
        if 'Date Reported' in lines[i]:
            incident = {}            
            category = ""
            location = ""
            if i >= 2:
                potential_location = lines[i-1].strip()
                potential_category = lines[i-2].strip()
                
                # Category is usually a shorter descriptor line
                if potential_category and not any(x in potential_category for x in ['UCSD POLICE', 'CRIME AND FIRE', 'Date', 'Incident', 'Summary', 'Disposition']):
                    category = potential_category
                
                # Location is the line immediately before Date Reported
                if potential_location and not any(x in potential_location for x in ['UCSD POLICE', 'CRIME AND FIRE', 'Date', 'Incident', 'Summary', 'Disposition']):
                    location = potential_location
            
            incident['category'] = category
            incident['location'] = location
            
            # Extract Date Reported
            date_reported = re.search(r'Date Reported\s+(\d{1,2}/\d{1,2}/\d{4})', lines[i])
            incident['date_reported'] = date_reported.group(1) if date_reported else ""
            i += 1
            
            # Extract Incident/Case#
            if i < len(lines) and 'Incident/Case#' in lines[i]:
                incident_case = re.search(r'Incident/Case#\s+([\w\d\-]+)', lines[i])
                incident['incident_case'] = incident_case.group(1) if incident_case else ""
                i += 1
            else:
                incident['incident_case'] = ""
            
            # Extract Date Occurred
            if i < len(lines) and 'Date Occurred' in lines[i]:
                date_occurred = re.search(r'Date Occurred\s+(\d{1,2}/\d{1,2}/\d{4})', lines[i])
                incident['date_occurred'] = date_occurred.group(1) if date_occurred else ""
                i += 1
            else:
                incident['date_occurred'] = ""
            
            # Extract Time Occurred
            if i < len(lines) and 'Time Occurred' in lines[i]:
                time_occurred = re.search(r'Time Occurred\s+(.+)', lines[i])
                incident['time_occurred'] = time_occurred.group(1).strip() if time_occurred else ""
                i += 1
            else:
                incident['time_occurred'] = ""
            
            # Extract Summary
            summary = ""
            if i < len(lines) and 'Summary:' in lines[i]:
                # Check if summary is on the same line as "Summary:"
                summary_match = re.search(r'Summary:\s*(.+)', lines[i])
                if summary_match and summary_match.group(1).strip():
                    summary = summary_match.group(1).strip()
                i += 1
                # If not on same line, look at next lines until Disposition
                if not summary:
                    while i < len(lines) and 'Disposition:' not in lines[i]:
                        line = lines[i].strip()
                        if line:
                            summary = line
                            break
                        i += 1
            incident['summary'] = summary
            
            # Extract Disposition
            disposition = ""
            while i < len(lines):
                if 'Disposition:' in lines[i]:
                    disposition = re.search(r'Disposition:\s*(.+)', lines[i])
                    incident['disposition'] = disposition.group(1).strip() if disposition else ""
                    i += 1
                    break
                i += 1
            
            if 'disposition' not in incident:
                incident['disposition'] = ""
            
            incidents.append(incident)
        else:
            i += 1
    
    return incidents

def parse_pdfs_to_json(pdf_dir="ucsd_police_reports", output_file="police_reports.json"):
    pdf_path = Path(pdf_dir)
    
    if os.path.exists(output_file):
        with open(output_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {"reports": [], "processed_files": []}
    
    processed = set(data.get("processed_files", []))
    pdf_files = sorted(pdf_path.glob("*.pdf"))
    
    stats = {"new": 0, "skipped": 0, "failed": 0}
    
    for pdf_file in pdf_files:
        filename = pdf_file.name
        
        if filename in processed:
            stats["skipped"] += 1
            print(f"SKIP {filename}")
            continue
        
        try:
            with pdfplumber.open(pdf_file) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
            
            incidents = parse_pdf_content(text)
            
            report = {
                "filename": filename,
                "date": filename.replace(".pdf", ""),
                "page_count": len(pdf.pages),
                "incident_count": len(incidents),
                "incidents": incidents
            }
            
            data["reports"].append(report)
            data["processed_files"].append(filename)
            
            stats["new"] += 1
            print(f"READ {filename} ({report['page_count']} pages, {len(incidents)} incidents)")
            
        except Exception as e:
            stats["failed"] += 1
            print(f"FAIL {filename}: {e}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\nCompleted: {stats['new']} new, {stats['skipped']} skipped, {stats['failed']} failed")
    print(f"Output: {os.path.abspath(output_file)}")
    print(f"Total reports in JSON: {len(data['reports'])}")

if __name__ == "__main__":
    parse_pdfs_to_json()