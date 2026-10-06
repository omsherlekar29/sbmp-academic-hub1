/* SBMP Academic Hub · Team TechNova · (c) 2026 */

import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';

var KEY = 'sbmp-planner-tasks-v1';
var tasks = loadTasks();
var currentFilter = 'all';

export function initPlanner() {
  var r = document.getElementById('planner-root');
  if (!r) return;
  renderForm();
  renderFilters();
  renderList();
}

export function initSubjectPlanner(code) {
  var r = document.getElementById('subject-planner');
  if (!r) return;
  renderSubjectForm(code);
  renderSubjectList(code);
}

function loadTasks() {
  try {
    var raw = JSON.parse(localStorage.getItem(KEY));
    if (!Array.isArray(raw)) return [];
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var t = raw[i];
      if (t && typeof t === 'object' && t.id && t.title && t.subject) out.push(t);
    }
    return out;
  } catch (e) { return []; }
}

function saveTasks() {
  try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) { /* quota exceeded */ }
}

function makeId() {
  return 't' + Date.now() + Math.random().toString(36).slice(2, 7);
}

function renderForm() {
  var f = document.getElementById('task-form');
  if (!f) return;

  var subjHtml = '<option value="">Select subject...</option>';
  for (var i = 0; i < SUBJECT_ORDER.length; i++) {
    var c = SUBJECT_ORDER[i];
    subjHtml += '<option value="' + c + '">' + SUBJECTS[c].name + '</option>';
  }

  f.innerHTML = '' +
    '<select id="tf-subject" required>' + subjHtml + '</select>' +
    '<input id="tf-title" placeholder="Task title" required maxlength="100">' +
    '<input id="tf-desc" placeholder="Description (optional)" maxlength="200">' +
    '<input id="tf-due" type="date">' +
    '<select id="tf-priority"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select>' +
    '<button type="submit" class="btn btn-primary">Add Task</button>';

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var subj = f.querySelector('#tf-subject').value;
    var title = f.querySelector('#tf-title').value.trim();
    if (!subj || !title) return;
    tasks.push({
      id: makeId(),
      subject: subj,
      title: title,
      desc: f.querySelector('#tf-desc').value.trim(),
      due: f.querySelector('#tf-due').value,
      priority: f.querySelector('#tf-priority').value,
      done: false,
      createdAt: Date.now()
    });
    saveTasks();
    f.reset();
    renderList();
  });
}

function renderFilters() {
  var h = document.getElementById('planner-filters');
  if (!h) return;
  h.innerHTML = '' +
    '<button class="filter-tab active" data-filter="all">All</button>' +
    '<button class="filter-tab" data-filter="pending">Pending</button>' +
    '<button class="filter-tab" data-filter="done">Completed</button>';
  var tabs = h.querySelectorAll('.filter-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function (e) {
      for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');
      e.currentTarget.classList.add('active');
      currentFilter = e.currentTarget.getAttribute('data-filter');
      renderList();
    });
  }
}

function renderList() {
  var h = document.getElementById('task-list');
  if (!h) return;

  var list = tasks.slice();
  if (currentFilter === 'pending') list = list.filter(function (t) { return !t.done; });
  if (currentFilter === 'done') list = list.filter(function (t) { return t.done; });

  list.sort(function (a, b) {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.due && b.due) return a.due.localeCompare(b.due);
    if (a.due) return -1;
    if (b.due) return 1;
    return b.createdAt - a.createdAt;
  });

  if (!list.length) {
    h.innerHTML = '<div class="task-empty">No tasks here yet.<br><span class="text-mute" style="font-size:.85rem">Add your first task above.</span></div>';
    return;
  }
  var html = '';
  for (var i = 0; i < list.length; i++) html += taskHTML(list[i]);
  h.innerHTML = html;
  bindTaskActions(h, renderList);
}

function taskHTML(t) {
  var subj = SUBJECTS[t.subject] || { name: t.subject };
  var dueLabel = t.due ? 'Due ' + new Date(t.due).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'No due date';
  var doneClass = t.done ? ' done' : '';
  return '<div class="task-item priority-' + t.priority + doneClass + '" data-id="' + t.id + '">' +
    '<input type="checkbox" class="task-checkbox" ' + (t.done ? 'checked' : '') + ' data-action="toggle" aria-label="Toggle done">' +
    '<div>' +
      '<div class="task-title">' + esc(t.title) + '</div>' +
      (t.desc ? '<div class="task-desc">' + esc(t.desc) + '</div>' : '') +
      '<div class="task-meta"><span class="badge">' + subj.name + '</span><span>' + dueLabel + '</span><span>· ' + t.priority + '</span></div>' +
    '</div>' +
    '<div class="task-actions">' +
      '<button class="btn btn-ghost btn-sm" data-action="edit">Edit</button>' +
      '<button class="btn btn-ghost btn-sm" data-action="delete" style="color:var(--danger)">Delete</button>' +
    '</div>' +
  '</div>';
}

function bindTaskActions(host, rerender) {
  var items = host.querySelectorAll('.task-item');
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var id = item.getAttribute('data-id');
    item.querySelector('[data-action="toggle"]').addEventListener('change', function () {
      var t = findTask(id);
      if (t) { t.done = !t.done; saveTasks(); rerender(); }
    });
    item.querySelector('[data-action="delete"]').addEventListener('click', function () {
      if (!confirm('Delete this task?')) return;
      tasks = tasks.filter(function (x) { return x.id !== id; });
      saveTasks();
      rerender();
    });
    item.querySelector('[data-action="edit"]').addEventListener('click', function () {
      var t = findTask(id);
      if (!t) return;
      var nt = prompt('Task title:', t.title);
      if (nt === null) return;
      t.title = nt.trim() || t.title;
      saveTasks();
      rerender();
    });
  }
}

function findTask(id) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) return tasks[i];
  }
  return null;
}

function renderSubjectForm(code) {
  var h = document.getElementById('subject-planner-form');
  if (!h) return;
  h.innerHTML = '' +
    '<form class="task-form" style="grid-template-columns:3fr 1fr 1fr auto;">' +
      '<input id="sf-title" placeholder="Task title" required maxlength="100">' +
      '<input id="sf-due" type="date">' +
      '<select id="sf-priority"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select>' +
      '<button type="submit" class="btn btn-primary">Add</button>' +
    '</form>';
  h.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var t = h.querySelector('#sf-title').value.trim();
    if (!t) return;
    tasks.push({
      id: makeId(),
      subject: code,
      title: t,
      desc: '',
      due: h.querySelector('#sf-due').value,
      priority: h.querySelector('#sf-priority').value,
      done: false,
      createdAt: Date.now()
    });
    saveTasks();
    h.querySelector('form').reset();
    renderSubjectList(code);
  });
}

function renderSubjectList(code) {
  var h = document.getElementById('subject-task-list');
  if (!h) return;
  var list = tasks.filter(function (t) { return t.subject === code; });
  if (!list.length) {
    h.innerHTML = '<div class="task-empty">No tasks for this subject yet.</div>';
    return;
  }
  list.sort(function (a, b) {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.due && b.due) return a.due.localeCompare(b.due);
    if (a.due) return -1;
    if (b.due) return 1;
    return b.createdAt - a.createdAt;
  });
  var html = '';
  for (var i = 0; i < list.length; i++) html += taskHTML(list[i]);
  h.innerHTML = html;
  bindTaskActions(h, function () { renderSubjectList(code); });
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}