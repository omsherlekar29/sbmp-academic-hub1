/* SBMP Academic Hub · Om Sherlekar (B053) · CSE-B · (c) 2026 */

import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';
import { SUBJECT_TYPES, TYPE_LABELS } from '../data/attendance-config.js';
import { getAttendanceRaw, saveAttendanceRaw } from './attendance.js';

// Load PDF.js from CDN
let pdfJsLoaded = false;
function loadPdfJs() {
  if (pdfJsLoaded || window.pdfjsLib) { pdfJsLoaded = true; return Promise.resolve(); }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      pdfJsLoaded = true;
      resolve();
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ---------- SUBJECT DETECTION ----------
// Uses a single unique word per subject that appears in the extracted text
const SUBJECT_MATCHERS = [
  { code: 'ASC268902', keywords: ['APPLIED SCIENCE'] },
  { code: 'CMS268903', keywords: ['COMMUNICATION'] },
  { code: 'EMT268901', keywords: ['MATHEMATICS'] },
  { code: 'ENG268904', keywords: ['GRAPHICS'] },
  { code: 'FCS260801', keywords: ['FUNDAMENTALS'] },
  { code: 'UHV268905', keywords: ['UNIVERSAL HUMAN'] },
  { code: 'WSD260802', keywords: ['WEBSITE DESIGNING'] }
];

// Type detection — these suffixes are on the same row
const TYPE_MATCHERS = [
  { type: 'TH', pattern: /TH-CSE-B/i },
  { type: 'PR', pattern: /PR-CSE-B/i },
  { type: 'TU', pattern: /TU-CSE-B/i }
];

// ---------- ROW BUILDER ----------
// The PDF text is scrambled: each row's data is split across 2-3 lines.
// A "row" starts with an S.No (a line beginning with a digit) and continues
// until the next S.No line. Join these into one logical row.
function buildRows(lines) {
  const rows = [];
  let current = '';
  for (const line of lines) {
    if (/^\d+\s/.test(line)) {
      if (current) rows.push(current);
      current = line;
    } else {
      current += ' ' + line;
    }
  }
  if (current) rows.push(current);
  return rows.map(r => r.replace(/\s+/g, ' ').trim());
}

// ---------- PARSE ----------
function parseAttendanceText(text) {
  const result = {};
  const rawLines = text.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const rows = buildRows(rawLines);

  console.log('[pdf-import] Total logical rows:', rows.length);
  console.log('[pdf-import] Rows:', rows);

  for (const row of rows) {
    const upper = row.toUpperCase();

    // 1) Detect subject
    const subjMatch = SUBJECT_MATCHERS.find(m => m.keywords.some(k => upper.includes(k)));
    if (!subjMatch) continue;
    const code = subjMatch.code;

    // 2) Detect type
    const typeMatch = TYPE_MATCHERS.find(m => m.pattern.test(row));
    if (!typeMatch) continue;
    const type = typeMatch.type;

    // 3) Extract integers (strip decimals like 94.29 first)
    const stripped = row.replace(/\d+\.\d+/g, ' ');
    const allInts = (stripped.match(/\d+/g) || []).map(Number)
      .filter(n => Number.isInteger(n) && n >= 0 && n <= 500);

    if (allInts.length < 3) {
      console.warn('[pdf-import] Skipping row (not enough numbers):', row);
      continue;
    }

    // First integer is the S.No — drop it
    const data = allInts.slice(1);
    const total = data[0];
    const attended = data[1];

    if (total === undefined || attended === undefined) continue;
    if (attended > total) continue; // sanity check

    if (!result[code]) result[code] = {};
    result[code][type] = { total, attended };

    console.log(`[pdf-import] ✓ ${code} ${type}: ${attended}/${total}`);
  }

  return result;
}

// ---------- UI ----------
export function initPdfImport() {
  const host = document.getElementById('attendance-import');
  if (!host) return;

  host.innerHTML = `
    <div class="import-panel">
      <div class="import-panel-head">
        <h3>Import from College Portal</h3>
        <p class="import-sub">Upload your attendance PDF from the college portal. The site reads it and pre-fills the numbers — you review before saving.</p>
      </div>
      <div class="import-actions">
        <input type="file" id="pdf-file" accept="application/pdf" style="display:none">
        <button class="btn btn-primary btn-sm" id="pdf-pick">Choose PDF File</button>
        <button class="btn btn-ghost btn-sm" id="pdf-manual">Enter Manually</button>
        <button class="btn btn-ghost btn-sm" id="pdf-debug" style="display:none">View Raw PDF Text</button>
        <span id="pdf-status" class="import-status"></span>
      </div>
    </div>
    <div id="pdf-debug-panel" style="display:none;margin-bottom:22px;">
      <div class="import-review">
        <div class="review-head">
          <h3>Raw PDF Text (Debug)</h3>
          <p class="review-sub">If the numbers didn't parse correctly, copy this and share it.</p>
        </div>
        <textarea id="pdf-raw-text" style="width:100%;height:280px;padding:12px;font-family:Consolas,Monaco,monospace;font-size:.78rem;background:var(--surface-2);color:var(--text);border:1px solid var(--border-strong);border-radius:8px;" readonly></textarea>
        <div class="review-actions" style="margin-top:12px;">
          <button class="btn btn-secondary btn-sm" id="pdf-copy-raw">Copy</button>
          <button class="btn btn-ghost btn-sm" id="pdf-close-debug">Close</button>
        </div>
      </div>
    </div>
    <div id="pdf-review" class="import-review" style="display:none"></div>
  `;

  const fileInput = document.getElementById('pdf-file');
  const pickBtn = document.getElementById('pdf-pick');
  const manualBtn = document.getElementById('pdf-manual');
  const status = document.getElementById('pdf-status');
  const review = document.getElementById('pdf-review');
  const debugBtn = document.getElementById('pdf-debug');
  const debugPanel = document.getElementById('pdf-debug-panel');
  const rawTextArea = document.getElementById('pdf-raw-text');

  pickBtn.addEventListener('click', () => fileInput.click());
  manualBtn.addEventListener('click', () => showForm({}, false));

  debugBtn.addEventListener('click', () => {
    debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('pdf-close-debug').addEventListener('click', () => {
    debugPanel.style.display = 'none';
  });
  document.getElementById('pdf-copy-raw').addEventListener('click', () => {
    rawTextArea.select();
    document.execCommand('copy');
    alert('Raw PDF text copied.');
  });

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    status.textContent = 'Reading PDF…';
    status.className = 'import-status';
    debugBtn.style.display = 'none';
    debugPanel.style.display = 'none';

    try {
      await loadPdfJs();
      const text = await readPdfText(file);
      rawTextArea.value = text;

      const parsed = parseAttendanceText(text);
      const count = Object.values(parsed).reduce((sum, obj) => sum + Object.keys(obj).length, 0);

      if (count > 0) {
        status.textContent = `PDF read — ${count} values extracted. Review before saving.`;
        status.className = 'import-status ok';
        showForm(parsed, true);
      } else {
        status.textContent = 'Could not read the PDF automatically. Please enter the numbers manually.';
        status.className = 'import-status warn';
        showForm({}, false);
      }
      debugBtn.style.display = 'inline-flex';
    } catch (err) {
      console.error('PDF parse error:', err);
      status.textContent = 'PDF parsing failed. Please enter the numbers manually.';
      status.className = 'import-status warn';
      showForm({}, false);
      debugBtn.style.display = 'inline-flex';
    }
  });

  function showForm(prefill, autoParsed) {
    const existing = getAttendanceRaw();
    review.style.display = 'block';

    review.innerHTML = `
      <div class="review-head">
        <h3>${autoParsed ? 'Review Extracted Values' : 'Enter Attendance Manually'}</h3>
        <p class="review-sub">Values are <strong>Attended</strong> / <strong>Total</strong>. Edit if needed. Leave blank to skip.</p>
      </div>
      <div class="review-rows">
        ${SUBJECT_ORDER.map(code => {
          const s = SUBJECTS[code];
          const types = SUBJECT_TYPES[code] || ['CL'];
          const pref = prefill[code] || {};
          const saved = existing[code] || {};
          return `
            <div class="review-subject">
              <div class="review-subject-name">${s.name} <span class="review-code">${s.code}</span></div>
              <div class="review-fields">
                ${types.map(t => {
                  const p = pref[t] || {};
                  const sv = saved[t] || [];
                  const savedAttended = sv.filter(e => e.status === 'present').length;
                  const savedTotal = sv.length;
                  const attendedVal = (p.attended !== undefined) ? p.attended : (savedTotal > 0 ? savedAttended : '');
                  const totalVal = (p.total !== undefined) ? p.total : (savedTotal > 0 ? savedTotal : '');
                  return `
                    <div class="review-field">
                      <label>${TYPE_LABELS[t] || t} (${t})</label>
                      <input type="number" min="0" placeholder="Attended"
                             data-code="${code}" data-type="${t}" data-field="attended"
                             value="${attendedVal}">
                      <span class="review-sep">/</span>
                      <input type="number" min="0" placeholder="Total"
                             data-code="${code}" data-type="${t}" data-field="total"
                             value="${totalVal}">
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="review-actions">
        <button class="btn btn-primary" id="review-save">Save Attendance</button>
        <button class="btn btn-ghost" id="review-cancel">Cancel</button>
      </div>
    `;

    document.getElementById('review-cancel').addEventListener('click', () => {
      review.style.display = 'none';
      review.innerHTML = '';
      status.textContent = '';
    });

    document.getElementById('review-save').addEventListener('click', () => {
      const data = getAttendanceRaw();
      const inputs = review.querySelectorAll('input[type="number"]');
      const grouped = {};
      inputs.forEach(inp => {
        const { code, type, field } = inp.dataset;
        const v = inp.value.trim();
        if (v === '') return;
        if (!grouped[code]) grouped[code] = {};
        if (!grouped[code][type]) grouped[code][type] = {};
        grouped[code][type][field] = parseInt(v, 10);
      });

      Object.keys(grouped).forEach(code => {
        Object.keys(grouped[code]).forEach(type => {
          const g = grouped[code][type];
          if (g.attended === undefined || g.total === undefined) return;
          if (g.attended > g.total) g.attended = g.total;
          if (g.total < 0) return;
          const arr = [];
          for (let i = 0; i < g.total; i++) {
            arr.push({
              date: `pdf-${i}-${Date.now()}`,
              status: i < g.attended ? 'present' : 'absent'
            });
          }
          if (!data[code]) data[code] = {};
          data[code][type] = arr;
        });
      });

      saveAttendanceRaw(data);
      status.textContent = 'Attendance saved.';
      status.className = 'import-status ok';
      review.style.display = 'none';
      review.innerHTML = '';
      window.dispatchEvent(new CustomEvent('sbmp:attendance-updated'));
    });
  }
}

// ---------- READ PDF (Y then X sorted) ----------
async function readPdfText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
  let full = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Sort items top-to-bottom, then left-to-right
    const items = content.items.slice().sort((a, b) => {
      const ya = a.transform[5], yb = b.transform[5];
      if (Math.abs(ya - yb) > 3) return yb - ya;
      return a.transform[4] - b.transform[4];
    });

    let lastY = null, line = '';
    for (const item of items) {
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 3) {
        full += line.trim() + '\n';
        line = '';
      }
      line += item.str + ' ';
      lastY = y;
    }
    full += line.trim() + '\n';
  }
  return full;
}