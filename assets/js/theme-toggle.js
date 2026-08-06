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

  // A lightbulb: filled and lit in light mode, hollow and off in dark. Same
  // glass and cap in both states, so only the fill changes when it flips.
  var GLASS = 'M12 2.6a5.9 5.9 0 0 0-3.1 10.9v1.3h6.2v-1.3A5.9 5.9 0 0 0 12 2.6z';
  var CAP = '<path d="M9.7 16.8h4.6M10.8 19.3h2.4" fill="none" stroke="currentColor"' +
            ' stroke-width="1.5" stroke-linecap="round"/>';

  var GLYPH = {
    light: '<path d="' + GLASS + '" fill="currentColor"/>' + CAP,
    dark:  '<path d="' + GLASS + '" fill="none" stroke="currentColor"' +
           ' stroke-width="1.6" stroke-linejoin="round"/>' + CAP
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
