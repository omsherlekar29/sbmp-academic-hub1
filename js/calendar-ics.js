/* SBMP Academic Hub · Team TechNova · (c) 2026 */

function parseDate(input){
  if (!input) return new Date();
  if (input.includes('-')) return new Date(input);
  const months = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, sept:8, oct:9, nov:10, dec:11 };
  const m = input.match(/^(\d{1,2})\s+([A-Za-z]+)/);
  if (!m) return new Date();
  const day = parseInt(m[1], 10);
  const key = m[2].toLowerCase().slice(0,4);
  const mon = months[key] !== undefined ? months[key] : (months[key.slice(0,3)] || 0);
  return new Date(2026, mon, day);
}

function toICSDate(d){
  const pad = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T090000`;
}

function escapeICS(s){
  return String(s || '').replace(/\\/g,'\\\\').replace(/,/g,'\\,').replace(/;/g,'\\;').replace(/\n/g,'\\n');
}

function slug(s){
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
}

export function generateICS({ title, description, date, durationHours = 2, location = 'SBMP Campus' }){
  const start = parseDate(date);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  const stamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SBMP Academic Hub//TechNova//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@sbmp-academic-hub`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `LOCATION:${escapeICS(location)}`,
    'BEGIN:VALARM','TRIGGER:-PT1H','ACTION:DISPLAY','DESCRIPTION:Reminder','END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function downloadICS(event){
  const ics = generateICS(event);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug(event.title)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}