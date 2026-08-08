/*
 * Sticky in-page navigation.
 *
 * Builds itself from the top-level (h2) headings inside <section>, so adding
 * a section to index.md adds a link with no other change. Subsection headings
 * (h3) are deliberately ignored.
 *
 * The bar is sticky within the right-hand column on desktop and spans the
 * full width on narrow screens, where the layout stops floating.
 */
(function () {
  function build() {
    var section = document.querySelector('.wrapper section');
    var nav = document.getElementById('section-nav');
    if (!nav || !section) return;

    var heads = Array.prototype.slice.call(section.querySelectorAll('h2[id]'));

    // With fewer than two sections a nav is just clutter.
    if (heads.length < 2) {
      nav.parentNode.removeChild(nav);
      return;
    }

    var links = [];
    heads.forEach(function (h) {
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = (h.textContent || '').trim();
      nav.appendChild(a);
      links.push(a);
    });

    // Highlight whichever section the reader is currently in.
    var ticking = false;

    function top(el) {
      return el.getBoundingClientRect().top + window.pageYOffset;
    }

    function mark() {
      ticking = false;
      var line = window.pageYOffset + nav.offsetHeight + 12;
      var current = 0;
      for (var i = 0; i < heads.length; i++) {
        if (top(heads[i]) <= line) current = i;
      }
      // Past the end of the page, the last section is the active one.
      if (window.innerHeight + window.pageYOffset >= document.body.scrollHeight - 2) {
        current = heads.length - 1;
      }
      for (var j = 0; j < links.length; j++) {
        links[j].className = (j === current) ? 'current' : '';
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame ? window.requestAnimationFrame(mark) : mark();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    mark();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
