/*
 * Two-state theme toggle: light <-> dark.
 *
 * Until the visitor clicks, nothing is stored and no data-theme attribute is
 * set, so the stylesheet's prefers-color-scheme rule decides and the page
 * follows the operating system. The first click pins an explicit choice,
 * which then persists in localStorage.
 *
 * Loaded from <head> without defer, so the attribute is set before the first
 * paint and the page never flashes the wrong palette.
 */
(function () {
  var KEY = 'theme';

  // Half-filled circle: the standard alternative to the sun/moon pair, and
  // the one Bootstrap, Material and Phosphor all ship. The fill sits on the
  // left in light mode and flips to the right in dark.
  var GLYPH = {
    light: '<circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
           '<path d="M12 3.6A8.4 8.4 0 0 0 12 20.4Z" fill="currentColor"/>',
    dark:  '<circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
           '<path d="M12 3.6A8.4 8.4 0 0 1 12 20.4Z" fill="currentColor"/>'
  };

  var root = document.documentElement;
  var media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

  function stored() {
    try {
      var v = localStorage.getItem(KEY);
      return (v === 'light' || v === 'dark') ? v : null;
    } catch (e) {
      return null;                             // private mode, storage blocked
    }
  }

  function effective() {
    return stored() || (media && media.matches ? 'dark' : 'light');
  }

  function favicon(theme) {
    var link = document.getElementById('theme-favicon');
    if (!link) {
      link = document.createElement('link');
      link.id = 'theme-favicon';
      link.rel = 'shortcut icon';
      link.type = 'image/png';
      document.head.appendChild(link);
    }
    link.href = theme === 'dark'
      ? './assets/img/favicon-dark.png'
      : './assets/img/favicon.png';
  }

  function apply(theme, explicit) {
    if (explicit) {
      root.setAttribute('data-theme', theme);
    } else {
      root.removeAttribute('data-theme');
    }
    favicon(theme);
  }

  function paint(theme) {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + GLYPH[theme] + '</svg>';
    var next = theme === 'dark' ? 'light' : 'dark';
    var label = 'Switch to ' + next + ' mode';
    btn.setAttribute('title', label);
    btn.setAttribute('aria-label', label);
  }

  apply(effective(), stored() !== null);

  document.addEventListener('DOMContentLoaded', function () {
    paint(effective());

    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var next = effective() === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {}
      apply(next, true);
      paint(next);
    });
  });

  // Follow the OS while the visitor has not chosen for themselves.
  if (media && media.addEventListener) {
    media.addEventListener('change', function () {
      if (stored() === null) {
        var t = effective();
        favicon(t);
        paint(t);
      }
    });
  }
})();
