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

var SUBJECT_KEYWORDS = {
  ASC268902: { TH: ['APPLIED SCIENCE TH'], PR: ['APPLIED SCIENCE PR'] },
  CMS268903: { TH: ['COMMUNICATION SKILLS TH'], TU: ['COMMUNICATION SKILLS TU'] },
  EMT268901: { TH: ['ENGINEERING MATHEMATICS TH'], TU: ['ENGINEERING MATHEMATICS TU'] },
  ENG268904: { PR: ['ENGINEERING GRAPHICS PR'], TH: ['ENGINEERING GRAPHICS TH'] },
  FCS260801: { PR: ['COMPUTING SYST PR'], TH: ['COMPUTING SYST TH'] },
  UHV268905: { TH: ['UNIVERSAL HUMAN VALUES TH'], TU: ['UNIVERSAL HUMAN VALUES TU'] },
  WSD260802: { PR: ['WEBSITE DESIGNING PR'], TH: ['WEBSITE DESIGNING TH'] }
};

function normalize(str) {
  return String(str).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

function readCountsAfter(tail) {
  var match = tail.match(/\d+/);
  if (!match) return null;
  var numStr = match[0];
  var limit = Math.min(numStr.length, 8);
  for (var split = 1; split < limit; split++) {
    var a = numStr.substring(0, split);
    var b = numStr.substring(split);
    if (!a || !b) continue;
    var total = parseInt(a, 10);
    var attended = parseInt(b.substring(0, 3), 10);
    if (isNaN(total) || isNaN(attended)) continue;
    if (total < 1 || total > 200) continue;
    if (attended < 0 || attended > 200) continue;
    if (attended > total) continue;
    return { total: total, attended: attended };
  }
  return null;
}

function findCounts(normalizedText, keywords) {
  for (var k = 0; k < keywords.length; k++) {
    var kw = normalize(keywords[k]);
    var idx = normalizedText.indexOf(kw);
    if (idx === -1) continue;
    var tail = normalizedText.substring(idx + kw.length, idx + kw.length + 40);
    var counts = readCountsAfter(tail);
    if (counts) return counts;
  }
  return null;
}

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
        '<button class="btn btn-ghost btn-sm" id="pdf-debug" style="display:none">Show PDF Text</button>' +
        '<span id="pdf-status" class="import-status"></span>' +
      '</div>' +
    '</div>' +
    '<div id="pdf-debug-panel" style="display:none;margin-bottom:22px;">' +
      '<div class="import-review">' +
        '<div class="review-head"><h3>Raw PDF Text</h3>' +
        '<p class="review-sub">Copy this and send it to the developer.</p></div>' +
        '<textarea id="pdf-raw" style="width:100%;height:300px;padding:12px;font-family:Consolas,monospace;font-size:.78rem;background:var(--surface-2);color:var(--text);border:1px solid var(--border-strong);border-radius:8px;" readonly></textarea>' +
        '<div class="review-actions" style="margin-top:12px;">' +
          '<button class="btn btn-secondary btn-sm" id="pdf-copy">Copy</button>' +
          '<button class="btn btn-ghost btn-sm" id="pdf-close-debug">Close</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div id="pdf-review" class="import-review" style="display:none"></div>';

  var fileInput = document.getElementById('pdf-file');
  var pickBtn = document.getElementById('pdf-pick');
  var manualBtn = document.getElementById('pdf-manual');
  var debugBtn = document.getElementById('pdf-debug');
  var debugPanel = document.getElementById('pdf-debug-panel');
  var rawArea = document.getElementById('pdf-raw');
  var status = document.getElementById('pdf-status');
  var review = document.getElementById('pdf-review');

  pickBtn.addEventListener('click', function () { fileInput.click(); });
  manualBtn.addEventListener('click', function () { showForm({}, false); });
  debugBtn.addEventListener('click', function () {
    debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('pdf-close-debug').addEventListener('click', function () {
    debugPanel.style.display = 'none';
  });
  document.getElementById('pdf-copy').addEventListener('click', function () {
    rawArea.select();
    document.execCommand('copy');
    status.textContent = 'PDF text copied to clipboard.';
    status.className = 'import-status ok';
  });

  fileInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    status.textContent = 'Reading PDF…';
    status.className = 'import-status';
    debugBtn.style.display = 'none';

    loadPdfJs().then(function () {
      return readPdfText(file);
    }).then(function (text) {
      console.log('[pdf-import] Raw extracted text length:', text.length);
      console.log('[pdf-import] First 500 chars:', text.substring(0, 500));
      rawArea.value = text;
      debugBtn.style.display = 'inline-flex';

      var normalized = normalize(text);
      console.log('[pdf-import] Normalized length:', normalized.length);

      var parsed = {};
      for (var i = 0; i < SUBJECT_ORDER.length; i++) {
        var code = SUBJECT_ORDER[i];
        var keywords = SUBJECT_KEYWORDS[code] || {};
        var types = Object.keys(keywords);
        if (types.length === 0) continue;
        parsed[code] = {};
        for (var t = 0; t < types.length; t++) {
          var type = types[t];
          var counts = findCounts(normalized, keywords[type]);
          if (counts) parsed[code][type] = counts;
        }
      }

      var total = 0;
      var codes = Object.keys(parsed);
      for (var c = 0; c < codes.length; c++) total += Object.keys(parsed[codes[c]]).length;
      console.log('[pdf-import] Total values extracted:', total);

      if (total > 0) {
        status.textContent = 'PDF read — ' + total + ' values extracted. Review below.';
        status.className = 'import-status ok';
        showForm(parsed, true);
      } else {
        status.textContent = 'Could not read automatically. Click "Show PDF Text" and copy the text for debugging.';
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