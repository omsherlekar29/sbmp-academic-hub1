import { DAYS, TIME_SLOTS, TIMETABLE_DIV_B } from '../data/timetable.js';
let activeBatch='ALL';

export function initTimetable(){
  const root=document.getElementById('timetable-root');
  if(!root)return;
  renderControls();
  renderGrid();
  document.querySelectorAll('.tt-tab').forEach(t=>t.addEventListener('click',()=>{
    activeBatch=t.dataset.batch;
    document.querySelectorAll('.tt-tab').forEach(x=>x.classList.toggle('active',x===t));
    renderGrid();
  }));
}

function renderControls(){
  const c=document.getElementById('tt-controls');
  if(!c)return;
  c.innerHTML=`
    <div class="tt-tabs" role="tablist">
      <button class="tt-tab active" data-batch="ALL">Full Division B</button>
      <button class="tt-tab" data-batch="S1">Batch S1</button>
      <button class="tt-tab" data-batch="S2">Batch S2</button>
    </div>
    <button class="btn btn-secondary btn-sm" onclick="window.print()" style="margin-left:auto;">Print</button>
    <div class="badge badge-primary">AY 2026-27 · Effective 10.08.2026</div>`;
}

function currentSlot(){
  const now=new Date();
  const day=now.toLocaleDateString('en-US',{weekday:'long'});
  const t=now.getHours()*60+now.getMinutes();
  const slots=[
    ['08:00 - 09:00',480,540],
    ['09:00 - 10:00',540,600],
    ['10:00 - 11:00',600,660],
    ['11:00 - 12:00',660,720],
    ['12:00 - 01:00',720,780],
    ['01:00 - 02:00',780,840],
    ['02:00 - 03:00',840,900],
    ['03:00 - 04:00',900,960],
    ['04:00 - 05:00',960,1020]
  ];
  for(const [label,s,e] of slots)if(t>=s&&t<e)return {day,label};
  return null;
}

function getEntries(day, slot){
  const c = TIMETABLE_DIV_B[day][slot];
  if (!c) return [{type:'FREE'}];
  if (Array.isArray(c)) return c;
  return [c];
}

// Returns true if the SAME lab entry exists in both this slot and the previous slot.
// "Same lab" means same code AND same batch.
function isLabContinuationOfPrevious(day, slot, batchFilter){
  const idx = TIME_SLOTS.indexOf(slot);
  if (idx === 0) return false;
  const prevSlot = TIME_SLOTS[idx-1];

  const curEntries  = getEntries(day, slot);
  const prevEntries = getEntries(day, prevSlot);

  // All lab entries in current slot that are labs
  const curLabs = curEntries.filter(e => e.type==='CLASS' && e.mode==='LL');
  const prevLabs = prevEntries.filter(e => e.type==='CLASS' && e.mode==='LL');

  if (!curLabs.length || !prevLabs.length) return false;

  // Which labs do we care about in this cell?
  const relevant = (batchFilter === 'ALL')
    ? curLabs
    : curLabs.filter(l => l.batch === batchFilter);

  if (!relevant.length) return false;

  // We consider this slot covered IF every relevant lab also existed in the previous slot
  // (same code + same batch) — i.e., it's the 2nd hour of the same lab.
  return relevant.every(lab =>
    prevLabs.some(p => p.code === lab.code && p.batch === lab.batch)
  );
}

// Does the current slot have a lab that starts a NEW 2-hour block?
function isLabStart(day, slot, batchFilter){
  const idx = TIME_SLOTS.indexOf(slot);
  if (idx === TIME_SLOTS.length-1) return false;
  const nextSlot = TIME_SLOTS[idx+1];

  const curEntries  = getEntries(day, slot);
  const nextEntries = getEntries(day, nextSlot);

  const curLabs  = curEntries.filter(e => e.type==='CLASS' && e.mode==='LL');
  const nextLabs = nextEntries.filter(e => e.type==='CLASS' && e.mode==='LL');

  if (!curLabs.length || !nextLabs.length) return false;

  const relevant = (batchFilter === 'ALL')
    ? curLabs
    : curLabs.filter(l => l.batch === batchFilter);

  if (!relevant.length) return false;

  // It's a start if at least one relevant lab also appears in the NEXT slot with same code+batch
  return relevant.some(lab =>
    nextLabs.some(n => n.code === lab.code && n.batch === lab.batch)
  );
}

function renderGrid(){
  const root=document.getElementById('timetable-root');
  if(!root)return;
  const cur = currentSlot();

  let h = '<div class="tt-wrap"><table class="tt-table">';
  h += '<thead><tr><th class="tt-th-time">Time</th>';
  DAYS.forEach(d => { h += `<th class="tt-th-day">${d}</th>`; });
  h += '</tr></thead><tbody>';

  for (let i=0; i<TIME_SLOTS.length; i++){
    const slot = TIME_SLOTS[i];
    h += `<tr><td class="tt-td-time">${slot}</td>`;

    for (const day of DAYS){
      const isNow = cur && day===cur.day && slot===cur.label;

      // Skip this cell entirely if the row above already rendered it via rowspan=2
      if (isLabContinuationOfPrevious(day, slot, activeBatch)){
        continue;
      }

      h += renderCell(day, slot, isNow);
    }
    h += '</tr>';
  }
  h += '</tbody></table></div>';
  root.innerHTML = h;
}

function renderCell(day, slot, isNow){
  const nowCls = isNow ? ' now-cell' : '';
  const entries = getEntries(day, slot);

  // ---- RECESS / LIBRARY ----
  const special = entries.find(e => e.type==='RECESS' || e.type==='LIBRARY');
  if (special){
    if (special.type==='RECESS') return `<td class="tt-td recess">RECESS</td>`;
    if (special.type==='LIBRARY') return `<td class="tt-td library">LIBRARY</td>`;
  }

  // ---- FILTERED BY BATCH (S1 or S2) ----
  if (activeBatch==='S1' || activeBatch==='S2'){
    const isStart = isLabStart(day, slot, activeBatch);
    const rowspan = isStart ? ' rowspan="2"' : '';

    const lab = entries.find(e => e.type==='CLASS' && e.mode==='LL' && e.batch===activeBatch);
    if (lab){
      return `<td class="tt-td lab-cell${nowCls}"${rowspan}>
        <div class="code">${lab.code}</div>
        <div class="name">${shortName(lab.name)} LL</div>
        <div class="meta">${lab.faculty} · ${lab.room} · ${activeBatch}</div>
      </td>`;
    }
    const reg = entries.find(e => e.type==='CLASS' && e.mode!=='LL' && (e.batch==='ALL' || e.batch===activeBatch));
    if (reg){
      const bt = reg.batch==='ALL' ? '' : `<span class="badge badge-primary" style="font-size:.62rem">${reg.batch}</span>`;
      return `<td class="tt-td${nowCls}">
        <div class="code">${reg.code} ${bt}</div>
        <div class="name">${reg.name}</div>
        <div class="meta">${reg.faculty} · ${reg.room} · ${reg.mode}</div>
      </td>`;
    }
    return '<td class="tt-td free">&mdash;</td>';
  }

  // ---- FULL DIVISION B VIEW ----
  const labs = entries.filter(e => e.type==='CLASS' && e.mode==='LL');
  const regs = entries.filter(e => e.type==='CLASS' && e.mode!=='LL');

  if (labs.length){
    // Rowspan applies if BOTH labs (S1 + S2) continue into next slot with same code+batch
    const idx = TIME_SLOTS.indexOf(slot);
    const nextSlot = TIME_SLOTS[idx+1];
    const nextEntries = nextSlot ? getEntries(day, nextSlot) : [];
    const nextLabs = nextEntries.filter(e => e.type==='CLASS' && e.mode==='LL');

    // Does each lab in this cell continue into the next slot?
    const allContinue = labs.every(lab =>
      nextLabs.some(n => n.code === lab.code && n.batch === lab.batch)
    );
    const rowspan = allContinue ? ' rowspan="2"' : '';

    const s1 = labs.find(l => l.batch==='S1');
    const s2 = labs.find(l => l.batch==='S2');

    if (s1 && s2){
      return `<td class="tt-td lab-cell${nowCls}"${rowspan}>
        <div class="lab-block">
          <div class="lab-tag">S1</div>
          <div class="code">${s1.code}</div>
          <div class="name">${shortName(s1.name)} LL</div>
          <div class="meta">${s1.faculty} · ${s1.room}</div>
        </div>
        <div class="lab-block">
          <div class="lab-tag">S2</div>
          <div class="code">${s2.code}</div>
          <div class="name">${shortName(s2.name)} LL</div>
          <div class="meta">${s2.faculty} · ${s2.room}</div>
        </div>
      </td>`;
    }
    const one = s1 || s2;
    return `<td class="tt-td lab-cell${nowCls}"${rowspan}>
      <div class="lab-tag">${one.batch}</div>
      <div class="code">${one.code}</div>
      <div class="name">${shortName(one.name)} LL</div>
      <div class="meta">${one.faculty} · ${one.room}</div>
    </td>`;
  }

  if (regs.length){
    const r = regs[0];
    const bt = r.batch==='ALL' ? '' : `<span class="badge badge-primary" style="font-size:.62rem">${r.batch}</span>`;
    return `<td class="tt-td${nowCls}">
      <div class="code">${r.code} ${bt}</div>
      <div class="name">${r.name}</div>
      <div class="meta">${r.faculty} · ${r.room} · ${r.mode}</div>
    </td>`;
  }

  return '<td class="tt-td free">&mdash;</td>';
}

function shortName(n){
  return n
    .replace('Engineering Mathematics','Engg Math')
    .replace('Engineering Graphics','Engg Graphics')
    .replace('Fundamentals of Computing System','Fund. Computing')
    .replace('Communication Skills','Comm. Skills')
    .replace('Universal Human Values','UHV')
    .replace('Website Designing','Web Design')
    .replace('Applied Science','Applied Sci');
}