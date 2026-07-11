(function () {
  var r = document.documentElement;
  var key = 'skills-zoo-theme';
  var colors = { dark: '#121311', light: '#f6f5f1' };
  var saved = null;
  try { saved = localStorage.getItem(key); } catch (e) {}
  var d = saved || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');

  function apply() {
    r.setAttribute('data-theme', d);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', colors[d]);
  }
  apply();

  var sun = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var moon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';
  var copyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var checkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';

  function paint(btn) { btn.innerHTML = d === 'dark' ? sun : moon; btn.setAttribute('aria-label', 'Switch to ' + (d === 'dark' ? 'light' : 'dark') + ' mode'); }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      paint(btn);
      btn.addEventListener('click', function () {
        d = d === 'dark' ? 'light' : 'dark';
        apply();
        try { localStorage.setItem(key, d); } catch (e) {}
        paint(btn);
      });
    }

    var copy = document.querySelector('[data-copy-command]');
    var command = document.querySelector('.install-hint code');
    if (copy && command && navigator.clipboard) {
      copy.hidden = false;
      copy.addEventListener('click', function () {
        navigator.clipboard.writeText(command.textContent).then(function () {
          copy.innerHTML = checkIcon;
          copy.classList.add('is-copied');
          copy.setAttribute('aria-label', 'Clone command copied');
          copy.setAttribute('title', 'Copied');
          window.setTimeout(function () {
            copy.innerHTML = copyIcon;
            copy.classList.remove('is-copied');
            copy.setAttribute('aria-label', 'Copy clone command');
            copy.setAttribute('title', 'Copy clone command');
          }, 1600);
        });
      });
    }
  });
})();
