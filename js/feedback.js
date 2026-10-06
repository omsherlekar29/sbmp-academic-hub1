/* SBMP Academic Hub · Team TechNova · (c) 2026 */

var KEY = 'sbmp-feedback';

export function initFeedback() {
  var f = document.getElementById('feedback-form');
  if (!f) return;
  var s = document.getElementById('feedback-success');

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate(f)) return;

    var ratingInput = f.querySelector('input[name="rating"]:checked');
    var data = {
      name: f.name.value.trim(),
      roll: f.roll.value.trim(),
      category: f.category.value,
      type: f.type.value,
      rating: ratingInput ? ratingInput.value : '',
      message: f.message.value.trim(),
      submittedAt: new Date().toISOString()
    };

    var list = loadList();
    list.push(data);
    saveList(list);

    f.reset();
    s.style.display = 'block';
    s.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () { s.style.display = 'none'; }, 6000);
  });

  f.addEventListener('reset', function () {
    var fields = f.querySelectorAll('.field');
    for (var i = 0; i < fields.length; i++) fields[i].classList.remove('error');
  });
}

function loadList() {
  try {
    var raw = JSON.parse(localStorage.getItem(KEY));
    if (!Array.isArray(raw)) return [];
    return raw;
  } catch (e) { return []; }
}

function saveList(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
}

function validate(f) {
  var ok = true;
  var fields = f.querySelectorAll('.field');
  for (var i = 0; i < fields.length; i++) fields[i].classList.remove('error');

  var required = ['name', 'roll', 'category', 'type', 'message'];
  for (var j = 0; j < required.length; j++) {
    var el = f[required[j]];
    if (!el || !el.value.trim()) {
      if (el && el.parentNode) el.parentNode.classList.add('error');
      ok = false;
    }
  }
  if (!f.querySelector('input[name="rating"]:checked')) {
    var rf = document.getElementById('rating-field');
    if (rf) rf.classList.add('error');
    ok = false;
  }
  return ok;
}