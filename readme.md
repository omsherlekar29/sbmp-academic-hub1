# SBMP Academic Hub

A student-built academic portal for First-Year Computer Engineering students at Shri Bhagubhai Mafatlal Polytechnic & College of Engineering (SBMP), Mumbai.

Team: TechNova
Semester: I / 1B
Division: B
Academic Year: 2026-2027

Live Site: https://omsherlekar29.github.io/sbmp-academic-hub1/
Source: https://github.com/omsherlekar29/sbmp-academic-hub1

---

## Table of Contents

1. About the Project
2. Live Site
3. Features
4. Team TechNova
5. Tech Stack
6. Project Structure
7. Subject Coverage
8. Running Locally
9. Deployment
10. Local Data Storage
11. Design System
12. Accessibility
13. Performance
14. Syllabus Coverage
15. How to Update Content
16. Browser Support
17. Known Limitations
18. License
19. Links

---

## 1. About the Project

Semester I students juggle information across 5+ scattered sources - timetable forwarded on WhatsApp, syllabus PDFs, notice board screenshots, faculty contacts, and student lists. Nothing lives in one place.

SBMP Academic Hub consolidates every academic resource into a single, mobile-first portal - designed for Division B but extensible to any batch.

It is a static website. No backend, no database, no login. All data is either bundled in the source (subjects, students, faculty, timetable) or stored locally in the user's browser via localStorage (planner, attendance, theme).

---

## 2. Live Site

https://omsherlekar29.github.io/sbmp-academic-hub1/

Hosted on GitHub Pages with HTTPS. Works on any device.

---

## 3. Features

Home Dashboard
- Splash screen on first visit per session
- Live analog + digital clock
- Exam countdown widget
- Quick access tiles
- Semester context cards
- Recent notices preview
- Upcoming academic events strip
- Subject preview grid

Timetable
- Full Division B grid with Full / S1 / S2 batch filter
- 2-hour labs spanned with rowspan
- Remembers last batch choice
- Current period highlighted with NOW badge
- Mobile day-view (Mon-Sat tabs + vertical list)
- Print-friendly

Subject Pages (7 pages)
- Objective, outcomes, units, practicals
- Downloadable resources section
- Per-subject attendance tracker
- Per-subject task planner
- Print Subject button for clean output

Attendance Tracker
- Per-subject panel: mark present, mark absent, add past dates, edit, delete
- Dashboard with all subjects, percentages, and status badges
- 75% threshold warnings
- CSV export
- PDF import from the SBMP attendance report (with manual fallback)

Resources Page
- All downloadable files across subjects in one grid
- Subject filter chips
- Live search
- File type icons (PDF, PPT, DOC)
- Works on desktop and mobile

Student Directory
- Table: Roll, Name, Batch, Programme
- Filter: All / S1 / S2
- Live search by name or roll
- Self-service SAP lookup (SAP numbers not displayed in bulk)

Faculty Directory
- 9 faculty members with initials, name, department, subjects, role

Notices
- Academic calendar events with Add to Calendar
- ICS export supports single-day, multi-day, and all-day events

Task Planner
- All-subject and per-subject views
- Add, edit, delete, mark complete
- Priority, due date, filters
- Persists via localStorage
- Recovers gracefully from corrupted localStorage

Feedback Form
- Client-side validation
- Saved locally in the browser (not sent to a server)

Dark Mode
- Toggle in header
- Persisted to localStorage
- No flash on page load
- Proper variants for every component

Other
- Floating back-to-top button
- Floating watermark (TechNova)
- Custom 404 page
- About page with team info, tech stack, stats, and QR code

---

## 4. Team TechNova

B053 - Om Bharat Sherlekar - Full-Stack Developer & Team Lead
B041 - Chitraksh Vijay Raikar - QA & Testing
B056 - Gunja Rajesh Soni - UI / UX Design
B060 - Karan Ashok Tiwari - Content & Data
B052 - Mohammedabdullah Mohammedimran Shaikh - Documentation & Deployment

Faculty Guide: Mrs. Geetha Subramaniam
Subject: WSD260802 - Website Designing
Institution: Shri Bhagubhai Mafatlal Polytechnic & College of Engineering
Trust: Shri Vile Parle Kelavani Mandal (SVKM)

---

## 5. Tech Stack

- HTML5 (semantic markup)
- CSS3 (custom properties, Flexbox, CSS Grid, media queries)
- Vanilla JavaScript (ES Modules)
- localStorage for persistence
- PDF.js (from CDN) for attendance PDF parsing
- GitHub Pages for hosting

No frameworks. No backend. No database. No login.

---

## 6. Project Structure

SBMP-Academic-Hub/
- index.html                Homepage
- 404.html                  Custom 404
- sitemap.xml               SEO sitemap
- robots.txt                SEO crawl directives
- README.md                 This file

- css/
  - style.css               Base + components + royal theme
  - themes.css              Dark mode overrides
  - responsive.css          Media queries
  - print.css               Print styles

- js/
  - main.js                 Entry point - boots all modules
  - layout.js               Header, footer, watermark injection
  - theme.js                Dark / light toggle
  - clock.js                Analog + digital clock
  - splash.js               Homepage splash screen
  - timetable.js            Timetable rendering + batch memory + mobile view
  - attendance.js           Attendance tracker + dashboard + CSV export
  - pdf-import.js           PDF parser with validation and fallback
  - planner.js              Task planner with localStorage
  - students.js             Student directory + SAP lookup
  - subjects.js             Subject directory + subject detail pages
  - notices.js              Notices + calendar events
  - calendar-ics.js         ICS generator (single and multi-day)
  - downloads.js            Resources page logic
  - feedback.js             Feedback form validation
  - animations.js           Scroll reveal animations
  - countdown.js            Exam countdown timer

- data/
  - timetable.js            Full Division B timetable
  - subjects.js             7 subjects with units, outcomes, books
  - faculty.js              9 faculty members
  - students.js             63 students (no SAP in public data)
  - sap-lookup.js           Private SAP map for the lookup feature
  - notices.js              Notice entries
  - calendar.js             Academic calendar events
  - notes.js                Resource file metadata
  - team.js                 Team TechNova + tech stack + stats
  - portion.js              Derived from subjects.js
  - attendance-config.js    Attendance thresholds and types

- pages/
  - academics.html
  - timetable.html
  - subjects.html
  - portion.html
  - faculty.html
  - students.html
  - notices.html
  - department.html
  - planner.html
  - feedback.html
  - attendance.html
  - resources.html
  - about.html

- subjects/
  - mathematics.html
  - applied-science.html
  - communication-skills.html
  - engineering-graphics.html
  - fundamentals-of-computing.html
  - universal-human-values.html
  - website-designing.html

- resources/
  - mathematics/
  - applied-science/
  - communication-skills/
  - engineering-graphics/
  - fundamentals-of-computing/
  - website-designing/

- assets/
  - logos/
    - svkm-logo.jpg
    - sbmp-logo.jpg
  - sbmp-banner.png
  - og-image.jpg
  - qr-code.png
  - icons/

Total: around 50 files across 8 folders.

---

## 7. Subject Coverage

EMT268901 - Engineering Mathematics - Basic - 3 credits - 13 resource files
ASC268902 - Applied Science - DSC - 3 credits - 4 resource files
CMS268903 - Communication Skills - AEC - 3 credits - 6 resource files
ENG268904 - Engineering Graphics - DSC - 2 credits - 8 resource files
FCS260801 - Fundamentals of Computing System - SEC - 3 credits - 2 resource files
UHV268905 - Universal Human Values - VEC - 2 credits - no files
WSD260802 - Website Designing - SEC - 4 credits - 6 resource files

---

## 8. Running Locally

The project uses ES Modules, which browsers block over file://. A local server is required.

Option 1 - Python:
  cd SBMP-Academic-Hub
  python -m http.server 8000
  Open http://localhost:8000

Option 2 - Node.js:
  npx http-server

Option 3 - VS Code:
  Install the Live Server extension.
  Right-click index.html and choose Open with Live Server.

---

## 9. Deployment

Hosted on GitHub Pages. No build step. No backend. Free HTTPS.

First-time setup:
1. Push all files to the repository.
2. Go to Settings, then Pages.
3. Set Source: main branch, root folder.
4. Save. GitHub builds within 1-2 minutes.
5. Site is live at https://username.github.io/repo/

Updating the site:
1. Edit files locally.
2. Push via GitHub Desktop (recommended) or the web editor.
3. GitHub Pages rebuilds automatically. Refresh after about 1 minute.

---

## 10. Local Data Storage

All user data stays in the browser via localStorage. Nothing leaves the device.

sbmp-theme                Selected theme (light or dark)
sbmp-splash               Splash shown flag for the session
sbmp-planner-tasks-v1     Task planner entries
sbmp-attendance-v2        Attendance tracker entries
sbmp-feedback             Submitted feedback
sbmp-batch-preference     Last batch selected on the timetable

Clearing browser data erases this information. There is no account, no sync, no cloud.

---

## 11. Design System

Palette - Light Mode
  Background:    #f6f4ee (warm cream)
  Surface:       #ffffff
  Primary:       #0a1f4a (deep navy)
  Accent:        #b8873a (royal gold)
  Text:          #0d1a33
  Text soft:     #3d4a63
  Border:        #e2ddd0

Palette - Dark Mode
  Background:    #060b1a
  Surface:       #0f1830
  Primary:       #6b8ce0
  Accent:        #d4a84b
  Text:          #f0f2f8
  Text soft:     #b8c0d6

Typography
  Headings:      Source Serif 4
  Display:       Cormorant Garamond
  Body:          Inter
  Monospace:     JetBrains Mono

Radius
  Small: 10px
  Default: 16px
  Large: 22px

Motion
  Ease: cubic-bezier(.19, 1, .22, .1)
  Micro transitions: 180-280ms
  Hover: 380-480ms
  Scroll reveal: 620ms
  All animations respect prefers-reduced-motion.

---

## 12. Accessibility

- Semantic HTML5 (header, main, nav, footer, section)
- ARIA labels on icon-only buttons
- aria-expanded on mobile menu toggle
- Skip to content link as the first focusable element
- Visible focus outlines
- Keyboard accessible interactive elements
- Escape closes open menus and dropdowns
- Colour contrast ratio 4.5:1 or higher for body text
- Minimum touch target 40x40px
- prefers-reduced-motion support across the site

---

## 13. Performance

- Page weight under 300 KB (excluding fonts and downloads)
- No blocking animations
- No backdrop-filter on sticky headers
- Scroll reveals via IntersectionObserver
- Clock uses requestAnimationFrame only for the analog sweep
- Digital clock updates once per second
- All scripts use type module for native deferral
- No inline event handlers in HTML

---

## 14. Syllabus Coverage (WSD260802)

Unit 2 - HTML (tags, attributes, forms, tables, lists, links, images) - used everywhere
Unit 3 - Tables and formatting - used in the timetable grid and practicals table
Unit 4 - Forms and inputs - used in the planner, feedback, attendance, PDF import
Unit 5 - CSS (selectors, font/text/box/color properties) - full design system and dark mode
Unit 6 - JavaScript (variables, operators, control structures, events) - every interactive feature

Extended beyond the syllabus:
- ES Modules for code organisation
- localStorage for persistence
- CSS Grid and Flexbox for layout
- Media queries for responsive design
- PDF parsing in the browser with PDF.js
- ICS generation for calendar export
- GitHub Pages deployment
- SEO (sitemap.xml, robots.txt, Open Graph meta tags)

---

## 15. How to Update Content

Add a student
Open data/students.js and add an entry:
  { roll:'B064', salutation:'Mr', first:'RAHUL', middle:'KUMAR', last:'SHARMA', batch:'S1' }
Then add the SAP to data/sap-lookup.js.

Add a subject
Open data/subjects.js and add a new object keyed by the course code. Follow the existing structure.

Add a resource file
1. Save the file in resources/subject-slug/.
2. Add an entry to data/notes.js:
  { title:'Unit 3 - Notes', file:'unit3-notes.pdf', type:'PDF', size:'1.2 MB' }

Update the timetable
Open data/timetable.js and edit TIMETABLE_DIV_B. Each cell is one of:
  { type:'CLASS', code, name, mode, faculty, room, batch }
  { type:'RECESS' } or { type:'LIBRARY' } or { type:'FREE' }
  An array of two objects for simultaneous 2-hour labs.

---

## 16. Browser Support

Tested on:
- Chrome (Windows, Android, macOS)
- Firefox (Windows, macOS)
- Edge
- Safari (iOS, macOS)

Requires a modern browser with ES Modules support (2020 or newer).

---

## 17. Known Limitations

- Data is per-browser. Attendance and planner do not sync across devices.
- No user accounts. No login. No cross-device sync.
- PDF import relies on the current SBMP attendance-report format. Other formats may not parse automatically, in which case the manual entry form is used.
- iOS Safari may require an extra tap to open .ics files.
- The feedback form saves locally in the browser. It does not send data to a server.

---

## 18. License

Copyright 2026 TechNova - All rights reserved.

This project was created as part of the Website Designing (WSD260802) micro-project for Semester I, Division B, Computer Engineering, at Shri Bhagubhai Mafatlal Polytechnic & College of Engineering, Academic Year 2026-2027.

Unauthorised copying or redistribution of this project is prohibited.

---

## 19. Links

Live Site: https://omsherlekar29.github.io/sbmp-academic-hub1/
Source: https://github.com/omsherlekar29/sbmp-academic-hub1
Institution: https://sbmp.ac.in/

---

Built with care by Team TechNova.

B041 - B052 - B053 - B056 - B060