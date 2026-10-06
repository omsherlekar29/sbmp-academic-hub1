/* SBMP Academic Hub · Team TechNova · (c) 2026 */

var SVKM_LOGO = 'assets/logos/svkm-logo.jpg';
var SBMP_LOGO = 'assets/logos/sbmp-logo.jpg';
var OFFICIAL_URL = 'https://sbmp.ac.in/';

export function renderLayout() {
  injectHeader();
  injectFooter();
  setupMobileMenu();
  setupMoreMenu();
  setActiveNav();
  injectWatermark();
}

function rp() {
  var p = window.location.pathname;
  if (p.indexOf('/pages/') > -1 || p.indexOf('/subjects/') > -1) return '../';
  return '';
}

function injectHeader() {
  var host = document.getElementById('site-header');
  if (!host) return;

  var r = rp();
  host.innerHTML = '' +
    '<header class="site-header">' +
     '<div class="header-inner">' +
      '<a class="brand-block" href="' + r + 'index.html">' +
       '<img class="brand-logo" src="' + r + SVKM_LOGO + '" alt="SVKM" onerror="this.style.display=\'none\'">' +
       '<div class="logo-sep"></div>' +
       '<img class="brand-logo" src="' + r + SBMP_LOGO + '" alt="SBMP" onerror="this.style.display=\'none\'">' +
       '<div class="brand-text">' +
        '<span class="inst">Shri Bhagubhai Mafatlal Polytechnic</span>' +
        '<span class="portal">SBMP Academic Hub</span>' +
       '</div>' +
      '</a>' +
      '<button class="icon-btn menu-toggle" id="menu-toggle" aria-label="Menu" aria-expanded="false" aria-controls="header-nav">' +
       '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>' +
      '</button>' +
      '<nav class="header-nav" id="header-nav">' +
       '<a class="nav-link" href="' + r + 'index.html" data-nav="home">Home</a>' +
       '<a class="nav-link" href="' + r + 'pages/timetable.html" data-nav="timetable">Timetable</a>' +
       '<a class="nav-link" href="' + r + 'pages/subjects.html" data-nav="subjects">Subjects</a>' +
       '<a class="nav-link" href="' + r + 'pages/attendance.html" data-nav="attendance">Attendance</a>' +
       '<a class="nav-link" href="' + r + 'pages/resources.html" data-nav="resources">Resources</a>' +
       '<a class="nav-link" href="' + r + 'pages/about.html" data-nav="about">About</a>' +
       '<div class="nav-dropdown">' +
        '<button class="nav-link nav-drop-btn" id="more-btn" aria-haspopup="true" aria-expanded="false">More ▾</button>' +
        '<div class="nav-drop-menu" id="more-menu">' +
         '<a class="nav-drop-link" href="' + r + 'pages/notices.html" data-nav="notices">Notices</a>' +
         '<a class="nav-drop-link" href="' + r + 'pages/planner.html" data-nav="planner">Task Planner</a>' +
         '<a class="nav-drop-link" href="' + r + 'pages/students.html" data-nav="students">Students</a>' +
         '<a class="nav-drop-link" href="' + r + 'pages/faculty.html" data-nav="faculty">Faculty</a>' +
         '<a class="nav-drop-link" href="' + r + 'pages/portion.html" data-nav="portion">Portion</a>' +
         '<a class="nav-drop-link" href="' + r + 'pages/academics.html" data-nav="academics">Academics</a>' +
         '<a class="nav-drop-link" href="' + r + 'pages/department.html" data-nav="department">Department</a>' +
         '<a class="nav-drop-link" href="' + r + 'pages/feedback.html" data-nav="feedback">Feedback</a>' +
        '</div>' +
       '</div>' +
      '</nav>' +
      '<div class="header-utility">' +
       '<button class="icon-btn" id="theme-toggle" aria-label="Toggle theme">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
       '</button>' +
       '<a class="icon-btn" href="' + OFFICIAL_URL + '" target="_blank" rel="noopener noreferrer" title="Official SBMP Website" aria-label="Official SBMP Website">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>' +
       '</a>' +
      '</div>' +
     '</div>' +
    '</header>';
}

function injectFooter() {
  var host = document.getElementById('site-footer');
  if (!host) return;
  var r = rp();
  host.innerHTML = '' +
    '<footer class="site-footer">' +
     '<div class="container">' +
      '<div class="footer-grid">' +
       '<div>' +
        '<div class="footer-brand">' +
         '<img src="' + r + SBMP_LOGO + '" alt="SBMP" onerror="this.style.display=\'none\'">' +
         '<div class="fb-text">' +
          '<strong>Shri Bhagubhai Mafatlal Polytechnic &amp; College of Engineering</strong>' +
          '<span>Under Shri Vile Parle Kelavani Mandal (SVKM)</span>' +
         '</div>' +
        '</div>' +
        '<p style="font-size:.82rem;margin:0;">Computer Engineering Department<br>Semester I &mdash; Division B &mdash; AY 2026&ndash;2027</p>' +
       '</div>' +
       '<div><h4>Academic</h4><div class="footer-links">' +
        '<a href="' + r + 'pages/timetable.html">Timetable</a>' +
        '<a href="' + r + 'pages/subjects.html">Subjects</a>' +
        '<a href="' + r + 'pages/portion.html">Portion</a>' +
        '<a href="' + r + 'pages/faculty.html">Faculty</a>' +
       '</div></div>' +
       '<div><h4>Students</h4><div class="footer-links">' +
        '<a href="' + r + 'pages/students.html">Directory</a>' +
        '<a href="' + r + 'pages/attendance.html">Attendance</a>' +
        '<a href="' + r + 'pages/resources.html">Resources</a>' +
        '<a href="' + r + 'pages/planner.html">Task Planner</a>' +
        '<a href="' + r + 'pages/notices.html">Notices</a>' +
       '</div></div>' +
       '<div><h4>Institution</h4><div class="footer-links">' +
        '<a href="' + r + 'pages/about.html">About TechNova</a>' +
        '<a href="' + r + 'pages/department.html">Department</a>' +
        '<a href="' + OFFICIAL_URL + '" target="_blank" rel="noopener noreferrer">sbmp.ac.in &nearr;</a>' +
       '</div></div>' +
      '</div>' +
      '<div class="footer-bottom">' +
       '<span>&copy; 2026 TechNova &middot; All rights reserved</span>' +
       '<span>Built by Team TechNova &mdash; B041 &middot; B052 &middot; B053 &middot; B056 &middot; B060</span>' +
      '</div>' +
     '</div>' +
    '</footer>';
}

function setupMobileMenu() {
  var b = document.getElementById('menu-toggle');
  var n = document.getElementById('header-nav');
  if (!b || !n) return;
  b.addEventListener('click', function () {
    var isOpen = n.classList.toggle('open');
    b.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && n.classList.contains('open')) {
      n.classList.remove('open');
      b.setAttribute('aria-expanded', 'false');
      b.focus();
    }
  });
}

function setupMoreMenu() {
  var btn = document.getElementById('more-btn');
  var menu = document.getElementById('more-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function () {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });
}

function setActiveNav() {
  var p = window.location.pathname;
  var f = p.split('/').pop() || 'index.html';
  var k = f.replace('.html', '');
  if (f === 'index.html' || f === '') k = 'home';
  if (p.indexOf('/subjects/') > -1) k = 'subjects';
  var links = document.querySelectorAll('.nav-link, .nav-drop-link');
  for (var i = 0; i < links.length; i++) {
    if (links[i].getAttribute('data-nav') === k) links[i].classList.add('active');
  }
}

function injectWatermark() {
  if (document.querySelector('.author-watermark')) return;
  var el = document.createElement('div');
  el.className = 'author-watermark';
  el.textContent = 'TechNova';
  document.body.appendChild(el);
}