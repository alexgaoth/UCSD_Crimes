import os
import json
import re
from pathlib import Path
import pdfplumber

def parse_pdf_content(text):
    incidents = []
    lines = text.split('\n')
    
    # Find all incident starting points (lines with "Date Reported")
    incident_indices = []
    for i, line in enumerate(lines):
        if 'Date Reported' in line:
            incident_indices.append(i)
    
    # Process each incident
    for idx, start_i in enumerate(incident_indices):
        incident = {}
        
        # Determine the end of this incident (start of next incident or end of document)
        end_i = incident_indices[idx + 1] if idx + 1 < len(incident_indices) else len(lines)
        
        # Extract category and location (lines before Date Reported)
        category = ""
        location = ""
        if start_i >= 2:
            potential_location = lines[start_i - 1].strip()
            potential_category = lines[start_i - 2].strip()
            
            # Category is usually a shorter descriptor line
            if potential_category and not any(x in potential_category for x in ['UCSD POLICE', 'CRIME AND FIRE', 'Date', 'Incident', 'Summary', 'Disposition']):
                category = potential_category
            
            # Location is the line immediately before Date Reported
            if potential_location and not any(x in potential_location for x in ['UCSD POLICE', 'CRIME AND FIRE', 'Date', 'Incident', 'Summary', 'Disposition']):
                location = potential_location
        
        incident['category'] = category
        incident['location'] = location
        
        # Process lines within this incident's range
        i = start_i
        while i < end_i:
            line = lines[i]
            
            # Extract Date Reported
            if 'Date Reported' in line:
                date_reported = re.search(r'Date Reported\s+(\d{1,2}/\d{1,2}/\d{4})', line)
                incident['date_reported'] = date_reported.group(1) if date_reported else ""
                i += 1
                continue
            
            # Extract Incident/Case#
            if 'Incident/Case#' in line:
                incident_case = re.search(r'Incident/Case#\s+([\w\d\-]+)', line)
                incident['incident_case'] = incident_case.group(1) if incident_case else ""
                i += 1
                continue
            
            # Extract Date Occurred
            if 'Date Occurred' in line:
                date_occurred = re.search(r'Date Occurred\s+(\d{1,2}/\d{1,2}/\d{4})', line)
                incident['date_occurred'] = date_occurred.group(1) if date_occurred else ""
                i += 1
                continue
            
            # Extract Time Occurred
            if 'Time Occurred' in line:
                time_occurred = re.search(r'Time Occurred\s+(.+)', line)
                incident['time_occurred'] = time_occurred.group(1).strip() if time_occurred else ""
                i += 1
                continue
            
            # Extract Summary
            if 'Summary:' in line:
                summary_lines = []
                
                # Check if summary is on the same line as "Summary:"
                summary_match = re.search(r'Summary:\s*(.+)', line)
                if summary_match and summary_match.group(1).strip():
                    summary_lines.append(summary_match.group(1).strip())
                
                # Move to next line and collect until we hit Disposition
                i += 1
                while i < end_i and 'Disposition:' not in lines[i]:
                    line_text = lines[i].strip()
                    if line_text and 'Date Reported' not in line_text:
                        summary_lines.append(line_text)
                    i += 1
                
                incident['summary'] = " ".join(summary_lines)
                continue
            
            # Extract Disposition
            if 'Disposition:' in line:
                disposition = re.search(r'Disposition:\s*(.+)', line)
                incident['disposition'] = disposition.group(1).strip() if disposition else ""
                i += 1
                continue
            
            i += 1
        
        # Set defaults for missing fields
        incident.setdefault('incident_case', '')
        incident.setdefault('date_occurred', '')
        incident.setdefault('time_occurred', '')
        incident.setdefault('summary', '')
        incident.setdefault('disposition', '')
        
        incidents.append(incident)
    
    return incidents

def parse_pdfs_to_json(pdf_dir="ucsd_police_reports", output_file="app/public/police_reports.json"):
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