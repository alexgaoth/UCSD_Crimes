# 🔱UCSD🔱 Crime Logs

A comprehensive web application for tracking, visualizing, and analyzing UCSD campus security incidents and crime reports. 
Built by a UCSD student for UCSD students to stay informed about campus safety.

**[Visit UCSD Crime Logs](https://alexgaoth.github.io/UCSD_Crimes/)**

##  Overview

UCSD Crime Logs provides an accessible, user-friendly interface to explore campus security incidents reported by the UCSD Police Department. The application features interactive maps, comprehensive statistics, timeline visualizations, and powerful search capabilities to help students, faculty, and community members stay informed about campus safety.

## Developer

Created by a UCSD student passionate about campus safety and web development.

**Portfolio**: [alexgaoth.github.io/](https://alexgaoth.github.io/)

## Tech Stack

### Frontend
- **React 18**: Modern component-based UI framework
- **React Router**: Client-side routing
- **CSS3**: Custom styling with responsive design
- **Google Maps API**: Interactive mapping functionality

### Tools & Libraries
- **Vite**: Fast build tool and development server
- **html2canvas**: Screenshot and sharing functionality
- **Context API**: Global state management

### Deployment
- **GitHub Pages**: Free, reliable hosting
- **HashRouter**: Client-side routing for static hosting

## Data Source

Crime data is sourced from UCSD Police Department public reports.

**Note**: This is an independent student project and is not officially affiliated with UCSD or the UCSD Police Department.

## User Report Submissions

The application now supports user-submitted crime reports! Community members can submit incidents through the website, which are reviewed and added to the database.

### Features

- **Public Submission Form**: Users can submit crime reports at `/report-case`
- **Approval Workflow**: All submissions are reviewed before being displayed
- **Automated Sync**: Approved reports are automatically synced to the website every 8 hours
- **Case Number Tracking**: Each submission receives a unique case number (e.g., `USER-2025-001`)

### Supabase Integration

This application uses [Supabase](https://supabase.com/) for user report management.

**Viewing Submissions:**
- Log into your Supabase dashboard
- Go to Table Editor > `user_reports`
- View all submissions with their status (pending/approved/rejected)

**Approving Reports:**
- Use the SQL Editor with queries from `admin_queries.sql`
- Example: `UPDATE user_reports SET status = 'approved' WHERE id = 1;`
- Or build a custom admin interface (see roadmap)

**Automatic Sync:**
- GitHub Actions runs every 8 hours
- Fetches approved, unprocessed reports from Supabase
- Adds them to `police_reports.json`
- Marks them as processed in Supabase
- Deploys updated site

#### Row Level Security (RLS)

The database is configured with RLS policies for security:
- **Public INSERT**: Anyone can submit a report (INSERT only)
- **Public SELECT**: Anyone can view reports (read-only)
- **Service Role**: Full access for sync script (server-side only)
- **Authenticated**: UPDATE access for admin operations

This ensures:
- Users can submit reports without authentication
- Users cannot modify or delete existing reports
- Only the server-side sync script can mark reports as processed
- Admin operations require authentication

#### Files Reference

- `supabase_schema.sql`: Database schema and setup
- `sync_supabase.py`: Python script that syncs reports from Supabase to JSON
- `app/src/lib/supabaseClient.js`: Frontend Supabase client configuration
- `app/src/pages/ReportCase.jsx`: User submission form
- `app/public/sync_state.json`: Tracks sync progress
- `admin_queries.sql`: Helpful SQL queries for managing submissions
- `.env.example`: Environment variable template
- `app/.env.example`: Frontend environment variable template

## Privacy & Safety

- No personal information is collected or stored
- All data is sourced from public police reports
- Reports can be shared to increase community awareness
- Emergency contacts are prominently displayed

## Contributing

Contributions are welcome! If you'd like to improve UCSD Crime Logs:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- UCSD Police Department for public crime data
- UCSD community for support and feedback
- Open source contributors and libraries

## Roadmap

- [x] User-submitted crime reports via Supabase
- [x] Automated sync of approved reports
- [ ] Admin dashboard for managing submissions
- [ ] Real-time notifications for new incidents
- [ ] Email/SMS alert subscriptions
- [ ] Export functionality for data analysis
- [ ] Integration with campus safety apps
- [ ] Dark mode support
- [ ] User authentication for report tracking
- [ ] Email notifications to users when reports are approved/rejected

## Known Issues

- Some building names may not geocode precisely on the map
- Historical data is limited to available public records
- Map requires Google Maps API key for full functionality

## Feedback

Have suggestions or found a bug? Please [open an issue](https://github.com/alexgaoth/UCSD_Crimes/issues) on GitHub.

---

**Disclaimer**: This application is an independent student project and is not officially endorsed by or affiliated with the University of California San Diego or the UCSD Police Department. All data is sourced from publicly available police reports.

**Stay Safe, Tritons!** 🔱
