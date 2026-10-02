# SBMP Academic Hub

A student-built academic portal for First-Year Computer Engineering students at Shri Bhagubhai Mafatlal Polytechnic & College of Engineering (SBMP), Mumbai.

Team: TechNova
Semester: I / 1B
Division: B
Academic Year: 2026-2027

Live Site: https://omsherlekar29.github.io/sbmp-academic-hub1/
Source: https://github.com/omsherlekar29/sbmp-academic-hub1

---

## About the Project

Semester I students juggle information across 5+ scattered sources — timetable forwarded on WhatsApp, syllabus PDFs, notice board screenshots, faculty contacts, and student lists. Nothing lives in one place.

SBMP Academic Hub consolidates every academic resource into a single, mobile-first portal — designed for Division B but extensible to any batch.

### What it does

- Home Dashboard — live analog + digital clock, quick-access tiles, notices preview, upcoming academic events
- Timetable — Full Division B schedule with Full / S1 / S2 batch filter, 2-hour labs spanning correctly, current-period highlighting
- Subject Directory — all 7 subjects with full unit-wise syllabus, outcomes, practicals, and per-subject resources
- Portion Viewer — unit-wise syllabus in expandable accordions per subject
- Faculty Directory — all 9 faculty members with initials, roles, and subjects taught
- Student Directory — 63 students (B001-B063) with live search and batch filter
- Notices — academic calendar events with Add to Calendar (.ics export — works with Google Calendar, Apple Calendar, Outlook)
- Attendance Tracker — per-subject attendance with 75% threshold warnings, PDF auto-import from the college portal, CSV export
- Resources — 39 downloadable study files across 6 subjects (notes, slides, question banks, assignments, tutorials)
- Task Planner — per-subject and all-subject planner with priority, due dates, and persistent storage
- Feedback Form — validated form with local persistence
- Dark Mode — full dark theme with no flash on navigation
- Splash Screen — banner animation on first visit per session
- QR Code — on the About page, scan to open the site
- Responsive Design — mobile-first, 6 breakpoints (1100px to 360px)

---

## Team TechNova

B053 — Om Bharat Sherlekar — Full-Stack Developer & Team Lead
B041 — Chitraksh Vijay Raikar — QA & Testing
B056 — Gunja Rajesh Soni — UI / UX Design
B060 — Karan Ashok Tiwari — Content & Data
B052 — Mohammedabdullah Mohammedimran Shaikh — Documentation & Deployment

Faculty Guide: Mrs. Geetha Subramaniam
Subject: WSD260802 — Website Designing
Institution: Shri Bhagubhai Mafatlal Polytechnic & College of Engineering
Trust: Shri Vile Parle Kelavani Mandal (SVKM)

---

## Tech Stack

- HTML5 — semantic markup, tables, forms, lists
- CSS3 — custom properties, Flexbox, CSS Grid, media queries, dark mode
- JavaScript (ES Modules) — DOM manipulation, event handling, modular architecture
- localStorage — client-side persistence for planner, attendance, theme, feedback
- PDF.js — in-browser parsing of college attendance PDFs
- GitHub Pages — free HTTPS hosting with automatic deployment

No frameworks. No backend. No database. No login.

Everything runs entirely in the browser and persists locally on each user's device.

---

## Project Structure

SBMP-Academic-Hub/
- index.html — Homepage
- sitemap.xml — SEO sitemap
- robots.txt — SEO crawl directives
- README.md — This file

- css/
  - style.css — Main design system (royal theme)
  - themes.css — Dark mode overrides
  - responsive.css — Media queries
  - print.css — Print styles

- js/
  - main.js — Entry point, boots all modules
  - layout.js — Header + footer + watermark injection
  - theme.js — Dark / light toggle
  - clock.js — Analog + digital clock
  - splash.js — Homepage splash screen
  - timetable.js — Timetable with rowspan logic
  - attendance.js — Attendance tracker (localStorage)
  - pdf-import.js — PDF auto-import for attendance
  - planner.js — Task planner (localStorage)
  - students.js — Student directory + search
  - subjects.js — Subject directory + detail pages
  - notices.js — Notices + calendar events
  - calendar-ics.js — .ics generator (Add to Calendar)
  - downloads.js — Resources page logic
  - feedback.js — Feedback form validation
  - animations.js — Scroll reveal animations

- data/
  - timetable.js — Full Division B timetable
  - subjects.js — 7 subjects, units, outcomes, books
  - faculty.js — 9 faculty members
  - students.js — 63 students, SAP, roll, batch
  - notices.js — Notice entries
  - calendar.js — Academic calendar events
  - notes.js — Resource file metadata
  - team.js — Team TechNova info + tech stack
  - portion.js — Derived from subjects.js
  - attendance-config.js — Attendance thresholds + types

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
  - mathematics/ (13 PDFs)
  - applied-science/ (4 files: PPT + DOCX)
  - communication-skills/ (6 files)
  - engineering-graphics/ (8 PDFs)
  - fundamentals-of-computing/ (2 PDFs)
  - website-designing/ (6 files)

- assets/
  - logos/svkm-logo.jpg
  - logos/sbmp-logo.jpg
  - sbmp-banner.png
  - og-image.jpg
  - qr-code.png
  - icons/
  - campus/

Total: ~50 files across 8 folders.

---

## Subject Coverage

EMT268901 — Engineering Mathematics — Basic — 3 credits — 13 files
ASC268902 — Applied Science — DSC — 3 credits — 4 files
CMS268903 — Communication Skills — AEC — 3 credits — 6 files
ENG268904 — Engineering Graphics — DSC — 2 credits — 8 files
FCS260801 — Fundamentals of Computing System — SEC — 3 credits — 2 files
UHV268905 — Universal Human Values — VEC — 2 credits — no files
WSD260802 — Website Designing — SEC — 4 credits — 6 files

---

## Running Locally

The project uses ES Modules, which browsers block over file://. You need a local server.

Option 1 - Python:
  cd SBMP-Academic-Hub
  python -m http.server 8000
  Open http://localhost:8000

Option 2 - Node.js:
  npx http-server

Option 3 - VS Code:
  Install the Live Server extension
  Right-click index.html
  Open with Live Server

---

## Deployment

Hosted on GitHub Pages — no build step, no backend, free HTTPS.

First-time setup:
1. Push all files to the repository
2. Go to Settings, then Pages
3. Set Source: main branch, root folder
4. Save. GitHub builds within 1-2 minutes
5. Site live at https://username.github.io/repo/

Updating the site:
1. Edit files locally
2. Push via GitHub Desktop (recommended) or the web editor
3. GitHub Pages rebuilds automatically. Refresh after about 1 minute.

---

## Local Data Storage

All user data stays in the browser via localStorage. Nothing leaves the device.

sbmp-theme — Selected theme (light or dark)
sbmp-splash — Splash screen shown flag (session-only)
sbmp-planner-tasks-v1 — Task planner entries
sbmp-attendance-v2 — Attendance tracker entries
sbmp-feedback — Submitted feedback

Clearing browser data erases this information. No account, no sync, no cloud.

---

## Design System

Palette (Royal):

Light mode:
  Background: #f6f4ee (cream)
  Surface: #ffffff
  Primary: #0a1f4a (deep navy)
  Accent: #b8873a (royal gold)
  Text: #0d1a33

Dark mode:
  Background: #060b1a (midnight)
  Surface: #0f1830
  Primary: #6b8ce0
  Accent: #d4a84b
  Text: #f0f2f8

Typography:
  Headings: Source Serif 4
  Display: Cormorant Garamond
  Body: Inter
  Monospace: JetBrains Mono

Spacing base: 4px, 8, 12, 16, 20, 24, 32, 40, 48, 64
Radius: 10px small, 16px default, 22px large

Motion:
  Duration: 180-420ms
  Easing: cubic-bezier(.22, 1, .36, 1)
  Full prefers-reduced-motion support

---

## Accessibility

- Semantic HTML5 (header, main, nav, footer, section)
- ARIA labels on icon-only buttons
- Keyboard accessible interactive elements
- Visible focus states
- Minimum touch target: 40x40px
- Colour contrast ratio 4.5:1 or higher for body text

---

## Performance

- Total page weight: under 300 KB (excluding fonts and downloadable resources)
- No build step, no bundler, no framework overhead
- No blocking animations
- Lazy scroll-reveal animations
- Efficient DOM rendering (no full re-renders per interaction)

---

## Syllabus Coverage (WSD260802)

Unit 2 - HTML (tags, attributes, lists, images, links) — Every page, forms, tables
Unit 3 - Tables and formatting — Timetable grid, practicals tables
Unit 4 - Forms and inputs — Task planner, feedback, attendance, PDF import
Unit 5 - CSS (selectors, font/text/box/color properties) — Full design system, dark mode
Unit 6 - JavaScript (variables, operators, control structures, events) — Every interactive feature

Extended beyond syllabus (industry standard):
ES Modules, localStorage, CSS Grid and Flexbox, responsive design, PDF parsing, .ics calendar export, GitHub Pages deployment, SEO.

---

## How to Update Content

Add a student:
Open data/students.js and add an entry:
{sap:'57507260140', roll:'B064', salutation:'Mr', last:'SHARMA', first:'RAHUL', middle:'KUMAR', division:'B', batch:'S1'}

Add a subject:
Open data/subjects.js and add a new object keyed by the course code. Follow the structure of existing subjects.

Add a resource file:
1. Save the file in resources/subject-slug/
2. Add an entry to data/notes.js:
   {title:'Unit 3 - Notes', file:'unit3-notes.pdf', type:'PDF', size:'1.2 MB'}

Update the timetable:
Open data/timetable.js and edit TIMETABLE_DIV_B. Each cell is one of:
- {type:'CLASS', code, name, mode, faculty, room, batch}
- {type:'RECESS'} or {type:'LIBRARY'} or {type:'FREE'}
- An array of two objects for simultaneous 2-hour labs

---

## Browser Support

Tested and working on:
- Chrome (Windows, Android, macOS)
- Firefox (Windows, macOS)
- Edge
- Safari (iOS, macOS)

Requires a modern browser with ES Modules support (2020 or newer).

---

## Known Limitations

- Data is per-browser. Attendance and planner do not sync across devices.
- No user accounts. No login, no cross-device sync.
- PDF import relies on the current college portal format. May need adjustment if the format changes.
- iOS Safari may require an extra tap to open .ics files.

---

## License

Copyright 2026 TechNova — All rights reserved.

This project was created as part of the Website Designing (WSD260802) micro-project for Semester I, Division B, Computer Engineering, at Shri Bhagubhai Mafatlal Polytechnic & College of Engineering, Academic Year 2026-2027.

Unauthorised copying or redistribution of this project is prohibited.

---

## Links

Live Site: https://omsherlekar29.github.io/sbmp-academic-hub1/
Source: https://github.com/omsherlekar29/sbmp-academic-hub1
Institution: https://sbmp.ac.in/
Author: https://github.com/omsherlekar29

---

Built with care by Team TechNova.

B041 - B052 - B053 - B056 - B060