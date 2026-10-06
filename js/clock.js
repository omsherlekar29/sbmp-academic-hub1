/* SBMP Academic Hub · Team TechNova · (c) 2026 */

export function initClock() {
  var host = document.getElementById('clock-host');
  if (!host) return;

  host.innerHTML = '' +
    '<div class="clock-card clock-card-lg">' +
      '<div class="clock-card-head"><span class="clock-label">Live · Local Time</span></div>' +
      '<div class="clock-grid">' +
        '<div class="clock-analog">' +
          '<svg viewBox="0 0 220 220" class="clock-svg">' +
            '<circle cx="110" cy="110" r="106" fill="none" stroke="rgba(255,255,255,.10)" stroke-width="1"/>' +
            '<circle cx="110" cy="110" r="100" fill="none" stroke="rgba(184,135,58,.35)" stroke-width="1.5"/>' +
            '<g id="clock-ticks"></g>' +
            '<g id="clock-numerals"></g>' +
            '<g id="hand-hour" style="transform-origin:110px 110px">' +
              '<line x1="110" y1="110" x2="110" y2="58" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>' +
            '</g>' +
            '<g id="hand-minute" style="transform-origin:110px 110px">' +
              '<line x1="110" y1="110" x2="110" y2="32" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>' +
            '</g>' +
            '<g id="hand-second" style="transform-origin:110px 110px">' +
              '<line x1="110" y1="118" x2="110" y2="26" stroke="#d4a84b" stroke-width="1.6" stroke-linecap="round"/>' +
              '<circle cx="110" cy="110" r="4.5" fill="#d4a84b"/>' +
            '</g>' +
            '<circle cx="110" cy="110" r="6" fill="#05122e"/>' +
            '<circle cx="110" cy="110" r="2.5" fill="#d4a84b"/>' +
          '</svg>' +
        '</div>' +
        '<div class="clock-digital">' +
          '<div class="clock-time-lg" id="clock-time">--:--:--</div>' +
          '<div class="clock-date-lg" id="clock-date">—</div>' +
          '<div class="clock-academic-lg" id="clock-period">—</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  drawTicksAndNumerals(host);

  var hourHand = host.querySelector('#hand-hour');
  var minuteHand = host.querySelector('#hand-minute');
  var secondHand = host.querySelector('#hand-second');
  var timeEl = host.querySelector('#clock-time');
  var dateEl = host.querySelector('#clock-date');
  var periodEl = host.querySelector('#clock-period');

  // Analog hands — smooth sweep via rAF (only transforms, no DOM text writes)
  function animateAnalog() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();
    var ms = now.getMilliseconds();

    var secAngle = (s + ms / 1000) * 6;
    var minAngle = (m + s / 60) * 6;
    var hourAngle = ((h % 12) + m / 60) * 30;

    secondHand.style.transform = 'rotate(' + secAngle + 'deg)';
    minuteHand.style.transform = 'rotate(' + minAngle + 'deg)';
    hourHand.style.transform = 'rotate(' + hourAngle + 'deg)';

    requestAnimationFrame(animateAnalog);
  }
  requestAnimationFrame(animateAnalog);

  // Digital time — update once per second
  function updateDigital() {
    var now = new Date();
    var h = now.getHours();
    var h12 = h % 12 || 12;
    var ampm = h >= 12 ? 'PM' : 'AM';
    var mm = String(now.getMinutes()).padStart(2, '0');
    var ss = String(now.getSeconds()).padStart(2, '0');
    timeEl.innerHTML = String(h12).padStart(2, '0') + ':' + mm + ':' + ss +
      '<span class="ampm">' + ampm + '</span>';
  }
  updateDigital();
  setInterval(updateDigital, 1000);

  // Date — update once per minute (day changes are slow, but easier to keep it in sync)
  var lastDate = '';
  function updateDate() {
    var now = new Date();
    var str = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (str !== lastDate) {
      lastDate = str;
      dateEl.textContent = str;
    }
  }
  updateDate();
  setInterval(updateDate, 60000);

  // Academic period — update once per minute
  var lastPeriod = '';
  function updatePeriod() {
    var str = getCurrentPeriod(new Date());
    if (str !== lastPeriod) {
      lastPeriod = str;
      periodEl.textContent = str;
    }
  }
  updatePeriod();
  setInterval(updatePeriod, 60000);
}

function drawTicksAndNumerals(host) {
  var cx = 110;
  var cy = 110;
  var ticks = host.querySelector('#clock-ticks');
  var numerals = host.querySelector('#clock-numerals');

  for (var i = 0; i < 60; i++) {
    var angleRad = (i * 6 - 90) * (Math.PI / 180);
    var isHour = i % 5 === 0;
    var inner = isHour ? 82 : 89;
    var outer = 96;
    var x1 = cx + Math.cos(angleRad) * inner;
    var y1 = cy + Math.sin(angleRad) * inner;
    var x2 = cx + Math.cos(angleRad) * outer;
    var y2 = cy + Math.sin(angleRad) * outer;
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', isHour ? '#d4a84b' : 'rgba(255,255,255,.28)');
    line.setAttribute('stroke-width', isHour ? '2.4' : '1');
    line.setAttribute('stroke-linecap', 'round');
    ticks.appendChild(line);
  }

  var positions = [{ n: '12', a: -90 }, { n: '3', a: 0 }, { n: '6', a: 90 }, { n: '9', a: 180 }];
  for (var k = 0; k < positions.length; k++) {
    var rad = positions[k].a * (Math.PI / 180);
    var x = cx + Math.cos(rad) * 70;
    var y = cy + Math.sin(rad) * 70;
    var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dominant-baseline', 'central');
    t.setAttribute('fill', '#ffffff');
    t.setAttribute('font-size', '18');
    t.setAttribute('font-weight', '600');
    t.setAttribute('font-family', "'Source Serif 4', Georgia, serif");
    t.textContent = positions[k].n;
    numerals.appendChild(t);
  }
}

function getCurrentPeriod(now) {
  var day = now.toLocaleDateString('en-US', { weekday: 'long' });
  var t = now.getHours() * 60 + now.getMinutes();
  var slots = [
    ['08:00 - 09:00', 480, 540], ['09:00 - 10:00', 540, 600],
    ['10:00 - 11:00', 600, 660], ['11:00 - 12:00', 660, 720],
    ['12:00 - 01:00', 720, 780], ['01:00 - 02:00', 780, 840],
    ['02:00 - 03:00', 840, 900], ['03:00 - 04:00', 900, 960],
    ['04:00 - 05:00', 960, 1020]
  ];
  for (var i = 0; i < slots.length; i++) {
    if (t >= slots[i][1] && t < slots[i][2]) return day + ' · ' + slots[i][0];
  }
  return day + ' · Outside scheduled hours';
}