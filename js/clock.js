/* SBMP Academic Hub · Om Sherlekar (B053) · CSE-B · (c) 2026 */

export function initClock(){
  const host = document.getElementById('clock-host');
  if (!host) return;

  // Build clock card structure
  host.innerHTML = `
    <div class="clock-card clock-card-lg">
      <div class="clock-card-head">
        <span class="clock-label">Live · Local Time</span>
      </div>
      <div class="clock-grid">
        <div class="clock-analog">
          <svg viewBox="0 0 220 220" class="clock-svg" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
            <!-- Outer rings -->
            <circle cx="110" cy="110" r="106" fill="none" stroke="rgba(255,255,255,.10)" stroke-width="1"/>
            <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(200,155,60,.35)" stroke-width="1.5"/>

            <!-- Ticks drawn by JS -->
            <g id="clock-ticks"></g>

            <!-- Numerals drawn by JS -->
            <g id="clock-numerals"></g>

            <!-- Hands — rotated via attribute set in JS -->
            <g id="hand-hour"   style="transform-origin:110px 110px">
              <line x1="110" y1="110" x2="110" y2="58" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
            </g>
            <g id="hand-minute" style="transform-origin:110px 110px">
              <line x1="110" y1="110" x2="110" y2="32" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
            </g>
            <g id="hand-second" style="transform-origin:110px 110px">
              <line x1="110" y1="118" x2="110" y2="26" stroke="#e8c368" stroke-width="1.6" stroke-linecap="round"/>
              <circle cx="110" cy="110" r="4.5" fill="#e8c368"/>
            </g>

            <!-- Centre hub -->
            <circle cx="110" cy="110" r="6" fill="#0a1b40"/>
            <circle cx="110" cy="110" r="2.5" fill="#e8c368"/>
          </svg>
        </div>
        <div class="clock-digital">
          <div class="clock-time-lg" id="clock-time">--:--:--</div>
          <div class="clock-date-lg" id="clock-date">—</div>
          <div class="clock-academic-lg" id="clock-period">—</div>
        </div>
      </div>
    </div>
  `;

  // ---------- Draw ticks ----------
  const ticks = host.querySelector('#clock-ticks');
  const cx = 110, cy = 110;
  for (let i = 0; i < 60; i++) {
    const angleRad = (i * 6 - 90) * (Math.PI / 180); // 0deg = 12 o'clock, clockwise
    const isHour = i % 5 === 0;
    const outer = 96;
    const inner = isHour ? 82 : 89;
    const x1 = cx + Math.cos(angleRad) * inner;
    const y1 = cy + Math.sin(angleRad) * inner;
    const x2 = cx + Math.cos(angleRad) * outer;
    const y2 = cy + Math.sin(angleRad) * outer;
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('stroke', isHour ? '#e8c368' : 'rgba(255,255,255,.28)');
    l.setAttribute('stroke-width', isHour ? '2.4' : '1');
    l.setAttribute('stroke-linecap', 'round');
    ticks.appendChild(l);
  }

  // ---------- Draw numerals ----------
  const numerals = host.querySelector('#clock-numerals');
  const numeralPositions = [
    { n: '12', angle: -90 },
    { n: '3',  angle: 0 },
    { n: '6',  angle: 90 },
    { n: '9',  angle: 180 }
  ];
  numeralPositions.forEach(({ n, angle }) => {
    const rad = angle * (Math.PI / 180);
    const r = 70;
    const x = cx + Math.cos(rad) * r;
    const y = cy + Math.sin(rad) * r;
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dominant-baseline', 'central');
    t.setAttribute('fill', '#ffffff');
    t.setAttribute('font-size', '18');
    t.setAttribute('font-weight', '600');
    t.setAttribute('font-family', "'Source Serif 4', Georgia, serif");
    t.textContent = n;
    numerals.appendChild(t);
  });

  // ---------- Hands ----------
  const hourHand   = host.querySelector('#hand-hour');
  const minuteHand = host.querySelector('#hand-minute');
  const secondHand = host.querySelector('#hand-second');

  const timeEl   = host.querySelector('#clock-time');
  const dateEl   = host.querySelector('#clock-date');
  const periodEl = host.querySelector('#clock-period');

  function update(){
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();

    // Angles
    const secAngle  = (s + ms / 1000) * 6;
    const minAngle  = (m + s / 60) * 6;
    const hourAngle = ((h % 12) + m / 60 + s / 3600) * 30;

    hourHand.style.transform   = `rotate(${hourAngle}deg)`;
    minuteHand.style.transform = `rotate(${minAngle}deg)`;
    secondHand.style.transform = `rotate(${secAngle}deg)`;

    // Digital
    const h12 = h % 12 || 12;
    const ap  = h >= 12 ? 'PM' : 'AM';
    timeEl.innerHTML = `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}<span class="ampm">${ap}</span>`;

    dateEl.textContent = now.toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    periodEl.textContent = getCurrentPeriod(now);
  }

  update();
  (function loop(){
    requestAnimationFrame(loop);
    update();
  })();
}

function getCurrentPeriod(now) {
  const day = now.toLocaleDateString('en-US', { weekday: 'long' });
  const t = now.getHours() * 60 + now.getMinutes();
  const slots = [
    ['08:00 - 09:00', 480, 540],
    ['09:00 - 10:00', 540, 600],
    ['10:00 - 11:00', 600, 660],
    ['11:00 - 12:00', 660, 720],
    ['12:00 - 01:00', 720, 780],
    ['01:00 - 02:00', 780, 840],
    ['02:00 - 03:00', 840, 900],
    ['03:00 - 04:00', 900, 960],
    ['04:00 - 05:00', 960, 1020]
  ];
  for (const [label, s, e] of slots) {
    if (t >= s && t < e) return `${day} · ${label}`;
  }
  return `${day} · Outside scheduled hours`;
}