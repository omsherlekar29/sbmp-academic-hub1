/* SBMP Academic Hub · Team TechNova · (c) 2026 */

var UPCOMING = [
  { date: '2026-09-21', title: 'Periodical Test I' },
  { date: '2026-11-04', title: 'Periodical Test II' },
  { date: '2026-11-16', title: 'Practical Examination' },
  { date: '2026-12-02', title: 'Theory Examination' }
];

export function initCountdown() {
  var host = document.getElementById('exam-countdown');
  if (!host) return;

  var next = findNext();
  if (!next) {
    host.innerHTML = '';
    return;
  }

  render(host, next);
  setInterval(function () { render(host, findNext() || next); }, 60000);
}

function findNext() {
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  for (var i = 0; i < UPCOMING.length; i++) {
    var d = parseDate(UPCOMING[i].date);
    if (d.getTime() >= now.getTime()) {
      return { date: d, title: UPCOMING[i].title };
    }
  }
  return null;
}

function parseDate(s) {
  var parts = s.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

function render(host, next) {
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  var diff = next.date.getTime() - now.getTime();
  var days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  var label;
  if (days === 0) label = 'Today';
  else if (days === 1) label = 'Tomorrow';
  else label = 'in ' + days + ' days';

  var dateStr = next.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  host.innerHTML = '' +
    '<div class="countdown-card">' +
      '<div class="countdown-label">Next Exam</div>' +
      '<div class="countdown-title">' + next.title + '</div>' +
      '<div class="countdown-body">' +
        '<div class="countdown-days">' + days + '</div>' +
        '<div class="countdown-meta">' +
          '<div class="countdown-when">' + label + '</div>' +
          '<div class="countdown-date">' + dateStr + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}