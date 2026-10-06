/* SBMP Academic Hub · Team TechNova · (c) 2026 */

import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';
import { SUBJECT_TYPES, TYPE_LABELS } from '../data/attendance-config.js';
import { getAttendanceRaw, saveAttendanceRaw } from './attendance.js';

/* Loads PDF.js from CDN on first use.
   If it fails, the manual entry form still works. */
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

/* Keyword patterns for the SBMP attendance report.
   Each subject/type has unique text so we don't confuse TH with PR. */
var SUBJECT_KEYWORDS = {
  ASC268902: { TH: ['APPLIED SCIENCE TH'], PR: ['APPLIED SCIENCE PR'] },
  CMS268903: { TH: ['COMMUNICATION SKILLS TH'], TU: ['COMMUNICATION SKILLS TU'] },
  EMT268901: { TH: ['ENGINEERING MATHEMATICS TH'], TU: ['ENGINEERING MATHEMATICS TU'] },
  ENG268904: { PR: ['ENGINEERING GRAPHICS PR'], TH: ['ENGINEERING GRAPHICS TH'] },
  FCS260801: { PR: ['COMPUTING SYST PR', 'COMPUTING SYSTEM PR'], TH: ['COMPUTING SYST TH', 'COMPUTING SYSTEM TH'] },
  UHV268905: { TH: ['UNIVERSAL HUMAN VALUES TH'], TU: ['UNIVERSAL HUMAN VALUES TU'] },
  WSD260802: { PR: ['WEBSITE DESIGNING PR'], TH: ['WEBSITE DESIGNING TH'] }
};

/* Removes percentage values and takes the last two integers on the line.
   In the SBMP PDF, the last two ints are (Total Conducted, Attended). */
function extractCounts(line) {
  var stripped = line.replace(/\d+\.\d+/g, '');
  var raw = stripped.match(/\d+/g) || [];
  var ints = [];
  for (var i = 0; i < raw.length; i++) {
    var n = parseInt(raw[i], 10);
    if (n >= 0 && n <= 500) ints.push(n);
  }
  if (ints.length < 2) return null;
  var lastTwo = ints.slice(-2);
  return { total: lastTwo[0], attended: lastTwo[1] };
}

function parseAttendanceText(text) {
  var result = {};
  var lines = text.split('\n');
  for (var i = 0; i < lines.length; i++) {
    lines[i] = lines[i].replace(/\s+/g, ' ').trim();
  }
  lines = lines.filter(function (l) { return l.length > 0; });

  for (var s = 0; s < SUBJECT_ORDER.length; s++) {
    var code = SUBJECT_ORDER[s];
    result[code] = {};
    var keywords = SUBJECT_KEYWORDS[code] || {};
    var types = Object.keys(keywords);
    for (var t = 0; t < types.length; t++) {
      var type = types[t];
      var kws = keywords[type];
      var dataLines = [];
      for (var l = 0; l < lines.length; l++) {
        var up = lines[l].toUpperCase();
        var match = false;
        for (var k = 0; k < kws.length; k++) {
          if (up.indexOf(kws[k].toUpperCase()) > -1) { match = true; break; }
        }
        if (match) {
          var counts = extractCounts(lines[l]);
          if (counts) dataLines.push(counts);
        }
      }
      if (dataLines.length > 0) {
        result[code][type] = dataLines[dataLines.length - 1];
      }
    }
  }
  return result;
}

/* ---------- UI ---------- */

export function initPdfImport() {
  var host = document.getElementById('attendance-import');
  if (!host) return;

  host.innerHTML = '' +
    '<div class="import-panel">' +
      '<div class="import-panel-head">' +
        '<h3>Import from College Portal</h3>' +
        '<p class="import-sub">Upload your SBMP attendance report (PDF). The site reads it and pre-fills the numbers — you review before saving. If parsing fails, enter the numbers manually.</p>' +
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
      var parsed = parseAttendanceText(text);
      var nonEmpty = false;
      var codes = Object.keys(parsed);
      for (var i = 0; i < codes.length; i++) {
        if (Object.keys(parsed[codes[i]]).length > 0) { nonEmpty = true; break; }
      }
      if (nonEmpty) {
        var count = 0;
        for (var j = 0; j < codes.length; j++) {
          count += Object.keys(parsed[codes[j]]).length;
        }
        status.textContent = 'PDF read — ' + count + ' values extracted. Please review before saving.';
        status.className = 'import-status ok';
        showForm(parsed, true);
      } else {
        status.textContent = 'Could not read the PDF automatically. Please enter the numbers manually.';
        status.className = 'import-status warn';
        showForm({}, false);
      }
    }).catch(function (err) {
      console.error('PDF import error:', err);
      status.textContent = 'PDF could not be loaded. Please enter the numbers manually.';
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
        for (var k = 0; k < savedArr.length; k++) {
          if (savedArr[k].status === 'present') savedAttended++;
        }
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
        '<div class="review-fields">' + fieldHTML + '</div>' +
        '</div>';
    }

    review.innerHTML = '' +
      '<div class="review-head">' +
        '<h3>' + (autoParsed ? 'Review Extracted Values' : 'Enter Attendance Manually') + '</h3>' +
        '<p class="review-sub">Values are <strong>Attended</strong> / <strong>Total</strong>. Edit if needed. Leave blank to skip a subject.</p>' +
      '</div>' +
      '<div class="review-rows">' + rowsHTML + '</div>' +
      '<div id="review-error" class="alert alert-danger" style="display:none;margin-top:16px;"></div>' +
      '<div class="review-actions">' +
        '<button class="btn btn-primary" id="review-save">Save Attendance</button>' +
        '<button class="btn btn-ghost" id="review-cancel">Cancel</button>' +
      '</div>';

    document.getElementById('review-cancel').addEventListener('click', function () {
      review.style.display = 'none';
      review.innerHTML = '';
      status.textContent = '';
    });

    document.getElementById('review-save').addEventListener('click', function () {
      saveFromForm(review, status);
    });
  }
}

/* Reads every input, validates, and saves.
   Rejects negative numbers, non-numeric values, and attended > total. */
function saveFromForm(review, status) {
  var inputs = review.querySelectorAll('input[type="number"]');
  var grouped = {};

  for (var i = 0; i < inputs.length; i++) {
    var inp = inputs[i];
    var v = inp.value.trim();
    if (v === '') continue;
    var num = parseInt(v, 10);
    if (isNaN(num) || num < 0) {
      showError(review, 'Invalid value: "' + v + '". Please enter a non-negative number.');
      return;
    }
    var code = inp.getAttribute('data-code');
    var type = inp.getAttribute('data-type');
    var field = inp.getAttribute('data-field');
    if (!grouped[code]) grouped[code] = {};
    if (!grouped[code][type]) grouped[code][type] = {};
    grouped[code][type][field] = num;
  }

  /* Validate: attended cannot exceed total. */
  var codes = Object.keys(grouped);
  for (var c = 0; c < codes.length; c++) {
    var code = codes[c];
    var types = Object.keys(grouped[code]);
    for (var t = 0; t < types.length; t++) {
      var type = types[t];
      var g = grouped[code][type];
      if (g.attended !== undefined && g.total !== undefined) {
        if (g.attended > g.total) {
          showError(review, 'Attended cannot be greater than Total for ' + code + ' · ' + type + '.');
          return;
        }
      }
    }
  }

  var data = getAttendanceRaw();

  for (var c2 = 0; c2 < codes.length; c2++) {
    var code2 = codes[c2];
    var types2 = Object.keys(grouped[code2]);
    for (var t2 = 0; t2 < types2.length; t2++) {
      var type2 = types2[t2];
      var g2 = grouped[code2][type2];
      if (g2.attended === undefined || g2.total === undefined) continue;
      if (g2.total === 0) continue;

      /* Replace existing entries for this code/type with synthetic ones. */
      var arr = [];
      for (var n = 0; n < g2.total; n++) {
        arr.push({
          date: 'pdf-' + n + '-' + Date.now(),
          status: n < g2.attended ? 'present' : 'absent'
        });
      }
      if (!data[code2]) data[code2] = {};
      data[code2][type2] = arr;
    }
  }

  saveAttendanceRaw(data);
  status.textContent = 'Attendance saved.';
  status.className = 'import-status ok';
  review.style.display = 'none';
  review.innerHTML = '';
  window.dispatchEvent(new CustomEvent('sbmp:attendance-updated'));
}

function showError(review, message) {
  var box = review.querySelector('#review-error');
  if (!box) return;
  box.textContent = message;
  box.style.display = 'block';
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* Reads PDF text, sorting items by Y (top to bottom) then X (left to right). */
function readPdfText(file) {
  return file.arrayBuffer().then(function (buf) {
    return window.pdfjsLib.getDocument({ data: buf }).promise;
  }).then(function (pdf) {
    var pages = [];
    for (var i = 1; i <= pdf.numPages; i++) pages.push(i);

    var full = '';
    var chain = Promise.resolve();

    pages.forEach(function (pageNum) {
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
    });

    return chain.then(function () { return full; });
  });
}