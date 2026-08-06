/*
 * Three-state theme toggle: system -> dark -> light -> system.
 *
 * The choice is stored in localStorage and expressed as data-theme on
 * <html>. "system" removes the attribute entirely, which hands control
 * back to the @media (prefers-color-scheme: dark) rule in the stylesheet.
 *
 * This file is loaded from <head> without defer, so the attribute is set
 * before the first paint and the page never flashes the wrong palette.
 */
(function () {
  var KEY = 'theme';
  var ORDER = ['system', 'dark', 'light'];
  var TEXT = { system: 'Auto', dark: 'Dark', light: 'Light' };
  var LABELS = {
    system: 'Theme: following your system',
    dark: 'Theme: dark',
    light: 'Theme: light'
  };

  var root = document.documentElement;
  var media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

  function stored() {
    try {
      var v = localStorage.getItem(KEY);
      return ORDER.indexOf(v) === -1 ? 'system' : v;
    } catch (e) {
      return 'system';                       // private mode, storage blocked
    }
  }

  function effective(pref) {
    if (pref !== 'system') return pref;
    return media && media.matches ? 'dark' : 'light';
  }

  // The <link rel="icon" media="..."> tags in the head only follow the OS, so
  // an explicit choice needs the icon set directly.
  function favicon(pref) {
    var link = document.getElementById('theme-favicon');
    if (!link) {
      link = document.createElement('link');
      link.id = 'theme-favicon';
      link.rel = 'shortcut icon';
      link.type = 'image/png';
      document.head.appendChild(link);
    }
    link.href = effective(pref) === 'dark'
      ? './assets/img/favicon-dark.png'
      : './assets/img/favicon.png';
  }

  function apply(pref) {
    if (pref === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', pref);
    }
    favicon(pref);
  }

  function paint(pref) {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.textContent = TEXT[pref];
    btn.setAttribute('title', LABELS[pref]);
    btn.setAttribute('aria-label', LABELS[pref] + '. Click to change.');
  }

  // Runs while <head> is parsing, before anything is drawn.
  apply(stored());

  document.addEventListener('DOMContentLoaded', function () {
    paint(stored());

    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var next = ORDER[(ORDER.indexOf(stored()) + 1) % ORDER.length];
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {}
      apply(next);
      paint(next);
    });
  });

  // Keep the icon honest if the OS flips while we are following it.
  if (media && media.addEventListener) {
    media.addEventListener('change', function () {
      if (stored() === 'system') {
        paint('system');
        favicon('system');
      }
    });
  }
})();
