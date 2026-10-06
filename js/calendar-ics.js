/* SBMP Academic Hub · Team TechNova · (c) 2026 */

/* Generates .ics files for calendar apps.
   Supports single-day (timed or all-day) and multi-day events. */

function parseDateOnly(input) {
  // Accepts "2026-09-21" or "21 Sept" and returns a Date at 00:00
  if (input.indexOf('-') > -1) {
    var parts = input.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  var months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
  var match = input.match(/^(\d{1,2})\s+([A-Za-z]+)/);
  if (match) {
    var day = parseInt(match[1], 10);
    var key = match[2].toLowerCase().slice(0, 4);
    var mon = months[key];
    if (mon === undefined) mon = months[key.slice(0, 3)];
    if (mon === undefined) mon = 0;
    return new Date(2026, mon, day);
  }
  return new Date();
}

function toICSDate(date, allDay) {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, '0');
  var d = String(date.getDate()).padStart(2, '0');
  if (allDay) return y + m + d;
  return y + m + d + 'T090000';
}

function addDays(date, days) {
  var d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function escapeICS(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

function slug(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

/* Main entry — call with event data.

   event = {
     title: 'Periodical Test I',
     description: 'Optional summary',
     date: '2026-09-21',
     endDate: '2026-09-23',   // optional — if present, multi-day
     timeStart: '09:00',      // optional — if present, timed event
     timeEnd: '12:00',        // optional
     location: 'SBMP Campus'
   }

   If timeStart is missing → creates an all-day event.
   If endDate is present and different from date → creates a multi-day
   all-day event that spans the range.
*/
export function generateICS(event) {
  var start = parseDateOnly(event.date);
  var isMultiDay = event.endDate && event.endDate !== event.date;
  var hasTime = !!event.timeStart;

  var allDay = !hasTime;
  var dtStart, dtEnd;

  if (isMultiDay) {
    // Multi-day: all-day spanning from start to end (end is exclusive in ICS)
    allDay = true;
    dtStart = toICSDate(start, true);
    var endDate = parseDateOnly(event.endDate);
    dtEnd = toICSDate(addDays(endDate, 1), true);
  } else if (hasTime) {
    dtStart = toICSDateWithTime(start, event.timeStart);
    var endTime = event.timeEnd || event.timeStart;
    var end = new Date(start.getTime());
    var parts = endTime.split(':');
    end.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0);
    dtEnd = toICSDateWithTime(end, null, true);
  } else {
    // All-day single
    dtStart = toICSDate(start, true);
    dtEnd = toICSDate(addDays(start, 1), true);
  }

  var stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  var lines = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//SBMP Academic Hub//Team TechNova//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('BEGIN:VEVENT');
  lines.push('UID:' + Date.now() + '-' + Math.random().toString(36).slice(2) + '@sbmp-academic-hub');
  lines.push('DTSTAMP:' + stamp);
  lines.push('DTSTART' + (allDay ? ';VALUE=DATE' : '') + ':' + dtStart);
  lines.push('DTEND' + (allDay ? ';VALUE=DATE' : '') + ':' + dtEnd);
  lines.push('SUMMARY:' + escapeICS(event.title));
  if (event.description) lines.push('DESCRIPTION:' + escapeICS(event.description));
  if (event.location) lines.push('LOCATION:' + escapeICS(event.location));
  lines.push('BEGIN:VALARM');
  lines.push('TRIGGER:-PT1H');
  lines.push('ACTION:DISPLAY');
  lines.push('DESCRIPTION:Reminder');
  lines.push('END:VALARM');
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

function toICSDateWithTime(date, timeStr, isEnd) {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, '0');
  var d = String(date.getDate()).padStart(2, '0');
  var hh = '09';
  var mm = '00';
  if (timeStr) {
    var parts = timeStr.split(':');
    hh = String(parseInt(parts[0], 10)).padStart(2, '0');
    mm = String(parseInt(parts[1], 10)).padStart(2, '0');
  } else if (isEnd) {
    hh = String(date.getHours()).padStart(2, '0');
    mm = String(date.getMinutes()).padStart(2, '0');
  }
  return y + m + d + 'T' + hh + mm + '00';
}

export function downloadICS(event) {
  var ics = generateICS(event);
  var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = slug(event.title) + '.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}