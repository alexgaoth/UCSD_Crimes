#!/usr/bin/env node

/**
 * Sitemap Generator for UCSD Crime Logs
 *
 * This script generates a sitemap.xml file that includes:
 * - All static pages
 * - Top 20 most recent incidents with their individual URLs
 *
 * Usage: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://alexgaoth.github.io/UCSD_Crimes';
const OUTPUT_PATH = path.join(__dirname, '../app/public/sitemap.xml');
const REPORTS_PATH = path.join(__dirname, '../app/public/police_reports.json');

// Static pages with their priorities and change frequencies
const STATIC_PAGES = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'daily'
  },
  {
    path: '/timeline',
    priority: '0.8',
    changefreq: 'daily'
  },
  {
    path: '/search',
    priority: '0.8',
    changefreq: 'weekly'
  },
  {
    path: '/statistics',
    priority: '0.8',
    changefreq: 'weekly'
  },
  {
    path: '/campus-map',
    priority: '0.8',
    changefreq: 'weekly'
  },
  {
    path: '/report-case',
    priority: '0.7',
    changefreq: 'monthly'
  }
];

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Parse date string and return Date object
 */
function parseDate(dateStr) {
  try {
    return new Date(dateStr);
  } catch (e) {
    return new Date();
  }
}

/**
 * Generate URL entry for sitemap
 */
function generateUrlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Load and parse police reports
 */
function loadReports() {
  try {
    if (!fs.existsSync(REPORTS_PATH)) {
      console.warn('Warning: police_reports.json not found');
      return [];
    }

    const data = fs.readFileSync(REPORTS_PATH, 'utf8');
    const jsonData = JSON.parse(data);

    // Handle both flat array and nested structure
    let incidents = [];

    if (Array.isArray(jsonData)) {
      // Flat array structure
      incidents = jsonData;
    } else if (jsonData.reports && Array.isArray(jsonData.reports)) {
      // Nested structure - extract all incidents from all reports
      jsonData.reports.forEach(report => {
        if (report.incidents && Array.isArray(report.incidents)) {
          incidents = incidents.concat(report.incidents);
        }
      });
    } else {
      console.warn('Warning: Unrecognized police_reports.json structure');
      return [];
    }

    return incidents;
  } catch (error) {
    console.error('Error loading reports:', error.message);
    return [];
  }
}

/**
 * Get top N most recent incidents
 */
function getTopRecentIncidents(reports, count = 20) {
  return reports
    .filter(report => report.incident_case && report.date_occurred)
    .sort((a, b) => {
      const dateA = parseDate(a.date_occurred);
      const dateB = parseDate(b.date_occurred);
      return dateB - dateA; // Sort descending (most recent first)
    })
    .slice(0, count);
}

/**
 * Generate incident URL from incident case number
 */
function generateIncidentUrl(incidentCase) {
  // Clean the incident case number for URL
  const cleanCase = incidentCase.toString().replace(/[^a-zA-Z0-9-]/g, '-');
  return `${BASE_URL}/incident/${cleanCase}`;
}

/**
 * Generate sitemap XML
 */
function generateSitemap() {
  console.log('Generating sitemap...');

  const currentDate = getCurrentDate();
  const urlEntries = [];

  // Add static pages
  console.log(`Adding ${STATIC_PAGES.length} static pages...`);
  STATIC_PAGES.forEach(page => {
    const url = `${BASE_URL}${page.path}`;
    urlEntries.push(generateUrlEntry(
      url,
      currentDate,
      page.changefreq,
      page.priority
    ));
  });

  // Load reports and add top 20 incidents
  const reports = loadReports();
  if (reports.length > 0) {
    const topIncidents = getTopRecentIncidents(reports, 20);
    console.log(`Adding ${topIncidents.length} recent incidents...`);

    topIncidents.forEach(incident => {
      const url = generateIncidentUrl(incident.incident_case);
      const lastmod = incident.date_occurred ?
        incident.date_occurred.split(' ')[0] :
        currentDate;

      urlEntries.push(generateUrlEntry(
        url,
        lastmod,
        'monthly',
        '0.6'
      ));
    });
  }

  // Build complete sitemap XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Static Pages -->
${urlEntries.slice(0, STATIC_PAGES.length).join('\n  \n')}

  <!-- Recent Incidents -->
${urlEntries.slice(STATIC_PAGES.length).join('\n  \n')}

</urlset>`;

  // Write sitemap to file
  try {
    fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
    console.log(`✓ Sitemap generated successfully at: ${OUTPUT_PATH}`);
    console.log(`✓ Total URLs: ${urlEntries.length}`);
  } catch (error) {
    console.error('Error writing sitemap:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateSitemap();
}

module.exports = { generateSitemap };
