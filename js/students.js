/* SBMP Academic Hub · Team TechNova · (c) 2026 */

import { STUDENTS } from '../data/students.js';
import { SAP_MAP } from '../data/sap-lookup.js';

var filter = 'all';
var query = '';

export function initStudents() {
  var host = document.getElementById('students-root');
  if (!host) return;

  document.getElementById('student-count').textContent = STUDENTS.length;

  var filters = document.querySelectorAll('.student-filter');
  for (var i = 0; i < filters.length; i++) {
    filters[i].addEventListener('click', onFilterClick);
  }

  var search = document.getElementById('student-search');
  if (search) {
    search.addEventListener('input', function (e) {
      query = e.target.value.toLowerCase().trim();
      render();
    });
  }

  render();
  initSapLookup();
}

function onFilterClick(e) {
  var filters = document.querySelectorAll('.student-filter');
  for (var i = 0; i < filters.length; i++) {
    if (filters[i] === e.currentTarget) filters[i].classList.add('active');
    else filters[i].classList.remove('active');
  }
  filter = e.currentTarget.getAttribute('data-filter');
  render();
}

function render() {
  var host = document.getElementById('students-list');
  if (!host) return;

  var list = STUDENTS.slice();
  if (filter !== 'all') {
    list = list.filter(function (s) { return s.batch === filter; });
  }
  if (query) {
    list = list.filter(function (s) {
      var full = (s.first + ' ' + s.middle + ' ' + s.last).toLowerCase();
      return full.indexOf(query) > -1 ||
             s.roll.toLowerCase().indexOf(query) > -1;
    });
  }

  if (list.length === 0) {
    host.innerHTML = '<tr><td colspan="4" class="text-center text-mute" style="padding:30px;">No students match your filter.</td></tr>';
    return;
  }

  var html = '';
  for (var i = 0; i < list.length; i++) {
    var s = list[i];
    html += '<tr>';
    html += '<td><span class="badge badge-primary">' + s.roll + '</span></td>';
    html += '<td>' + escapeHTML(s.salutation) + ' ' + escapeHTML(s.first) + ' ' + escapeHTML(s.middle) + ' ' + escapeHTML(s.last) + '</td>';
    html += '<td>' + s.batch + '</td>';
    html += '<td class="text-mute">Computer Engineering</td>';
    html += '</tr>';
  }
  host.innerHTML = html;
}

/* Self-service SAP lookup */
function initSapLookup() {
  var host = document.getElementById('sap-lookup');
  if (!host) return;

  host.innerHTML = '' +
    '<div class="sap-lookup-panel">' +
      '<div class="sap-lookup-head">' +
        '<h3>Looking for your SAP number?</h3>' +
        '<p class="text-mute" style="font-size:.85rem;margin:4px 0 0;">SAP numbers are not displayed publicly. Enter your roll number to see your own.</p>' +
      '</div>' +
      '<form class="sap-lookup-form" id="sap-form">' +
        '<input type="text" id="sap-input" placeholder="Enter your roll number (e.g. B053)" autocomplete="off">' +
        '<button type="submit" class="btn btn-primary btn-sm">Show my SAP</button>' +
      '</form>' +
      '<div class="sap-result" id="sap-result"></div>' +
    '</div>';

  var form = host.querySelector('#sap-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = document.getElementById('sap-input').value.trim().toUpperCase();
    var result = document.getElementById('sap-result');

    if (!input) {
      result.innerHTML = '<div class="alert alert-warning" style="margin:0;">Please enter your roll number.</div>';
      return;
    }

    var sap = SAP_MAP[input];
    var student = null;
    for (var i = 0; i < STUDENTS.length; i++) {
      if (STUDENTS[i].roll === input) {
        student = STUDENTS[i];
        break;
      }
    }

    if (!sap || !student) {
      result.innerHTML = '<div class="alert alert-danger" style="margin:0;">Roll number not found. Please check and try again.</div>';
      return;
    }

    var name = student.first + ' ' + student.middle + ' ' + student.last;
    result.innerHTML = '' +
      '<div class="sap-card">' +
        '<div class="sap-card-row"><span class="sap-card-label">Roll</span><span class="sap-card-value">' + escapeHTML(student.roll) + '</span></div>' +
        '<div class="sap-card-row"><span class="sap-card-label">Name</span><span class="sap-card-value">' + escapeHTML(name) + '</span></div>' +
        '<div class="sap-card-row"><span class="sap-card-label">Batch</span><span class="sap-card-value">' + escapeHTML(student.batch) + '</span></div>' +
        '<div class="sap-card-row sap-card-highlight"><span class="sap-card-label">SAP Number</span><span class="sap-card-value sap-card-sap">' + escapeHTML(sap) + '</span></div>' +
      '</div>';
  });
}

function escapeHTML(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}