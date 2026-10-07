/* SBMP Academic Hub · Team TechNova · (c) 2026 */

import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';
import { SUBJECT_TYPES, TYPE_LABELS } from '../data/attendance-config.js';
import { getAttendanceRaw, saveAttendanceRaw } from './attendance.js';

var pdfJsLoaded = false;

function loadPdfJs() {
  if (pdfJsLoaded || window.pdfjsLib) { pdfJsLoaded = true; return Promise.resolve(); }
  return new Promise(function (resolve, reject) {
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = function () {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      pdfJsLoaded = true;
      resolve();
    };
    s.onerror = function () { reject(new Error('PDF.js could not be loaded')); };
    document.head.appendChild(s);
  });
}

/* ================================================================
   PARSER
   Matches the exact SBMP attendance report format:

   Each row starts with an S.No (1-14), followed by:
   - Subject name (may be wrapped across lines)
   - Total Conducted
   - Total Attended
   - Optional Percentage (decimal)
   - Class type marker (TH-CSE-B / PR-CSE-B-S2 / TU-CSE-B)
     which may appear on the same line or wrap to a following line.

   Strategy:
   1. Split into lines
   2. Group lines into "rows" — each row begins with a line starting
      with an S.No
   3. For each row: detect subject, class type, and the last two integers
   ================================================================ */

function detectSubject(rowText) {
  if (/\bMATHEMATICS\b/i.test(rowText)) return 'EMT268901';
  if (/\bGRAPHICS\b/i.test(rowText)) return 'ENG268904';
  if (/\bAPPLIED\b/i.test(rowText)) return 'ASC268902';
  if (/\bCOMMUNICATION\b/i.test(rowText)) return 'CMS268903';
  if (/\bFUNDAMENTALS\b/i.test(rowText)) return 'FCS260801';
  if (/\bUNIVERSAL\b/i.test(rowText)) return 'UHV268905';
  if (/\bWEBSITE\b/i.test(rowText)) return 'WSD260802';
  return null;
}

function detectType(rowText) {
  if (/\bTH-CSE-B\b/i.test(rowText)) return 'TH';
  if (/\bTU-CSE-B\b/i.test(rowText)) return 'TU';
  if (/\bPR-CSE-B\b/i.test(rowText)) return 'PR';
  return null;
}

function parseReport(text) {
  var lines = text.split('\n');
  var cleaned = [];
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i].replace(/\s+/g, ' ').trim();
    if (l.length > 0) cleaned.push(l);
  }

  /* Group into rows */
  var rows = [];
  var current = null;

  for (var j = 0; j < cleaned.length; j++) {
    var line = cleaned[j];
    var sNoMatch = line.match(/^(\d{1,2})\s/);
    if (sNoMatch) {
      var n = parseInt(sNoMatch[1], 10);
      if (n >= 1 && n <= 30) {
        if (current) rows.push(current);
        current = line;
        continue;
      }
    }
    if (current) current += ' ' + line;
  }
  if (current) rows.push(current);

  console.log('[pdf-import] Rows grouped:', rows.length);

  /* Process rows */
  var result = {};

  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var code = detectSubject(row);
    var type = detectType(row);

    if (!code || !type) {
      console.log('[pdf-import] Skipped row:', row.substring(0, 60));
      continue;
    }

    /* Remove class markers and decimal percentages before extracting numbers */
    var prepared = row
      .replace(/TH-CSE-B/gi, ' ')
      .replace(/TU-CSE-B/gi, ' ')
      .replace(/PR-CSE-B-S2/gi, ' ')
      .replace(/PR-CSE-B/gi, ' ')
      .replace(/\d+\.\d+/g, ' ');

    var nums = prepared.match(/\d+/g) || [];
    nums = nums.map(Number);

    /* First number is the S.No — drop it. Last two are total + attended. */
    if (nums.length < 3) {
      console.log('[pdf-import] Not enough numbers in row:', row.substring(0, 60), nums);
      continue;
    }

    var lastTwo = nums.slice(-2);
    var total = lastTwo[0];
    var attended = lastTwo[1];

    /* Sanity checks */
    if (total < 1 || total > 300) continue;
    if (attended < 0 || attended > total) continue;

    if (!result[code]) result[code] = {};
    result[code][type] = { total: total, attended: attended };

    console.log('[pdf-import] Matched', code, type, '→', attended + '/' + total);
  }

  return result;
}

/* ---------------- PDF READING ---------------- */

function readPdfText(file) {
  return file.arrayBuffer().then(function (buf) {
    return window.pdfjsLib.getDocument({ data: buf }).promise;
  }).then(function (pdf) {
    var full = '';
    var chain = Promise.resolve();

    for (var i = 1; i <= pdf.numPages; i++) {
      (function (pageNum) {
        chain = chain.then(function () {
          return pdf.getPage(pageNum).then(function (page) {
            return page.getTextContent().then(function (content) {
              var items = content.items.slice().sort(function (a, b) {
                var ya = a.transform[5], yb = b.transform[5];
                if (Math.abs(ya - yb) > 3) return yb - ya;
                return a.transform[4] - b.transform[4];
              });

              var lastY = null;
              var line = '';
              for (var k = 0; k < items.length; k++) {
                var y = items[k].transform[5];
                if (lastY !== null && Math.abs(y - lastY) > 3) {
                  full += line.trim() + '\n';
                  line = '';
                }
                line += items[k].str + ' ';
                lastY = y;
              }
              full += line.trim() + '\n';
            });
          });
        });
      })(i);
    }

    return chain.then(function () { return full; });
  });
}

/* ---------------- UI ---------------- */

export function initPdfImport() {
  var host = document.getElementById('attendance-import');
  if (!host) return;

  host.innerHTML = '' +
    '<div class="import-panel">' +
      '<div class="import-panel-head">' +
        '<h3>Import from College Portal</h3>' +
        '<p class="import-sub">Upload your SBMP attendance report (PDF). The site reads it and pre-fills the numbers. If parsing fails, use the manual form.</p>' +
      '</div>' +
      '<div class="import-actions">' +
        '<input type="file" id="pdf-file" accept="application/pdf" style="display:none">' +
        '<button class="btn btn-primary btn-sm" id="pdf-pick">Choose PDF File</button>' +
        '<button class="btn btn-ghost btn-sm" id="pdf-manual">Enter Manually</button>' +
        '<span id="pdf-status" class="import-status"></span>' +
      '</div>' +
    '</div>' +
    '<div id="pdf-review" class="import-review" style="display:none"></div>';

  var fileInput = document.getElementById('pdf-file');
  var pickBtn = document.getElementById('pdf-pick');
  var manualBtn = document.getElementById('pdf-manual');
  var status = document.getElementById('pdf-status');
  var review = document.getElementById('pdf-review');

  pickBtn.addEventListener('click', function () { fileInput.click(); });
  manualBtn.addEventListener('click', function () { showForm({}, false); });

  fileInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    status.textContent = 'Reading PDF…';
    status.className = 'import-status';

    loadPdfJs().then(function () {
      return readPdfText(file);
    }).then(function (text) {
      var parsed = parseReport(text);

      var total = 0;
      var codes = Object.keys(parsed);
      for (var c = 0; c < codes.length; c++) total += Object.keys(parsed[codes[c]]).length;

      console.log('[pdf-import] Total values extracted:', total);

      if (total > 0) {
        status.textContent = 'PDF read — ' + total + ' values extracted. Review below.';
        status.className = 'import-status ok';
        showForm(parsed, true);
      } else {
        status.textContent = 'Could not read automatically. Please enter the numbers manually.';
        status.className = 'import-status warn';
        showForm({}, false);
      }
    }).catch(function (err) {
      console.error('[pdf-import] Error:', err);
      status.textContent = 'PDF could not be loaded. Please enter manually.';
      status.className = 'import-status warn';
      showForm({}, false);
    });
  });

  function showForm(prefill, autoParsed) {
    var existing = getAttendanceRaw();
    review.style.display = 'block';

    var rowsHTML = '';
    for (var i = 0; i < SUBJECT_ORDER.length; i++) {
      var code = SUBJECT_ORDER[i];
      var s = SUBJECTS[code];
      var types = SUBJECT_TYPES[code] || ['CL'];
      var pref = prefill[code] || {};
      var saved = existing[code] || {};

      var fieldHTML = '';
      for (var t = 0; t < types.length; t++) {
        var type = types[t];
        var p = pref[type] || {};
        var savedArr = Array.isArray(saved[type]) ? saved[type] : [];
        var savedAttended = 0;
        for (var k = 0; k < savedArr.length; k++) if (savedArr[k].status === 'present') savedAttended++;
        var savedTotal = savedArr.length;
        var attendedVal = (p.attended !== undefined) ? p.attended : (savedTotal > 0 ? savedAttended : '');
        var totalVal = (p.total !== undefined) ? p.total : (savedTotal > 0 ? savedTotal : '');
        fieldHTML += '<div class="review-field">' +
          '<label>' + (TYPE_LABELS[type] || type) + ' (' + type + ')</label>' +
          '<input type="number" min="0" placeholder="Attended" data-code="' + code + '" data-type="' + type + '" data-field="attended" value="' + attendedVal + '">' +
          '<span class="review-sep">/</span>' +
          '<input type="number" min="0" placeholder="Total" data-code="' + code + '" data-type="' + type + '" data-field="total" value="' + totalVal + '">' +
          '</div>';
      }
      rowsHTML += '<div class="review-subject">' +
        '<div class="review-subject-name">' + s.name + ' <span class="review-code">' + s.code + '</span></div>' +
        '<div class="review-fields">' + fieldHTML + '</div></div>';
    }

    review.innerHTML = '' +
      '<div class="review-head"><h3>' + (autoParsed ? 'Review Extracted Values' : 'Enter Attendance Manually') + '</h3>' +
      '<p class="review-sub">Values are <strong>Attended</strong> / <strong>Total</strong>.</p></div>' +
      '<div class="review-rows">' + rowsHTML + '</div>' +
      '<div id="review-error" class="alert alert-danger" style="display:none;margin-top:16px;"></div>' +
      '<div class="review-actions"><button class="btn btn-primary" id="review-save">Save Attendance</button>' +
      '<button class="btn btn-ghost" id="review-cancel">Cancel</button></div>';

    document.getElementById('review-cancel').addEventListener('click', function () {
      review.style.display = 'none'; review.innerHTML = ''; status.textContent = '';
    });
    document.getElementById('review-save').addEventListener('click', function () { saveFromForm(review, status); });
  }
}

function saveFromForm(review, status) {
  var inputs = review.querySelectorAll('input[type="number"]');
  var grouped = {};
  for (var i = 0; i < inputs.length; i++) {
    var inp = inputs[i];
    var v = inp.value.trim();
    if (v === '') continue;
    var num = parseInt(v, 10);
    if (isNaN(num) || num < 0) {
      showError(review, 'Invalid value: "' + v + '".');
      return;
    }
    var code = inp.getAttribute('data-code');
    var type = inp.getAttribute('data-type');
    var field = inp.getAttribute('data-field');
    if (!grouped[code]) grouped[code] = {};
    if (!grouped[code][type]) grouped[code][type] = {};
    grouped[code][type][field] = num;
  }

  var codes = Object.keys(grouped);
  for (var c = 0; c < codes.length; c++) {
    var types = Object.keys(grouped[codes[c]]);
    for (var t = 0; t < types.length; t++) {
      var g = grouped[codes[c]][types[t]];
      if (g.attended !== undefined && g.total !== undefined && g.attended > g.total) {
        showError(review, 'Attended cannot be greater than Total.');
        return;
      }
    }
  }

  var data = getAttendanceRaw();
  for (var c2 = 0; c2 < codes.length; c2++) {
    var types2 = Object.keys(grouped[codes[c2]]);
    for (var t2 = 0; t2 < types2.length; t2++) {
      var g2 = grouped[codes[c2]][types2[t2]];
      if (g2.attended === undefined || g2.total === undefined || g2.total === 0) continue;
      var arr = [];
      for (var n = 0; n < g2.total; n++) {
        arr.push({ date: 'pdf-' + n + '-' + Date.now(), status: n < g2.attended ? 'present' : 'absent' });
      }
      if (!data[codes[c2]]) data[codes[c2]] = {};
      data[codes[c2]][types2[t2]] = arr;
    }
  }

  saveAttendanceRaw(data);
  status.textContent = 'Attendance saved.';
  status.className = 'import-status ok';
  review.style.display = 'none'; review.innerHTML = '';
  window.dispatchEvent(new CustomEvent('sbmp:attendance-updated'));
}

function showError(review, message) {
  var box = review.querySelector('#review-error');
  if (!box) return;
  box.textContent = message; box.style.display = 'block';
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}