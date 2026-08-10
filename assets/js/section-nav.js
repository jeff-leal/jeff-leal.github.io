/*
 * Sticky in-page navigation.
 *
 * Builds itself from the top-level (h2) headings inside <section>, so adding
 * a section to index.md adds a link with no other change. Subsection headings
 * (h3) are deliberately ignored.
 *
 * A heading whose full wording is too long for the bar can carry a shorter
 * label with a kramdown attribute list: {: data-nav="Policy"}.
 *
 * The bar is sticky within the right-hand column on desktop and spans the
 * full width on narrow screens, where the layout stops floating.
 */
(function () {
  // The first link returns to the top of the page, where the opening
  // biography sits. Rename it here and nowhere else.
  var TOP_LABEL = 'About';

  function build() {
    var section = document.querySelector('.wrapper section');
    var nav = document.getElementById('section-nav');
    var list = document.getElementById('section-nav-links');
    if (!nav || !list || !section) return;

    var heads = Array.prototype.slice.call(section.querySelectorAll('h2[id]'));

    // With fewer than two sections the links are just clutter. The bar itself
    // stays, stripped of its rule, because the theme toggle lives in it.
    if (heads.length < 2) {
      list.parentNode.removeChild(list);
      nav.className = 'bare';
      return;
    }

    // Sits ahead of the section links. It has no heading of its own, so it
    // scrolls rather than jumping to an anchor, and leaves no hash behind.
    var toTop = document.createElement('a');
    toTop.href = '#';
    toTop.textContent = TOP_LABEL;
    toTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo(0, 0);
    });
    list.appendChild(toTop);

    var links = [];
    heads.forEach(function (h) {
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = (h.getAttribute('data-nav') || h.textContent || '').trim();
      list.appendChild(a);
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
      // -1 means the reader is still above the first section, in the bio.
      var current = -1;
      for (var i = 0; i < heads.length; i++) {
        if (top(heads[i]) <= line) current = i;
      }
      // Past the end of the page, the last section is the active one.
      if (window.innerHeight + window.pageYOffset >= document.body.scrollHeight - 2) {
        current = heads.length - 1;
      }
      toTop.className = (current === -1) ? 'current' : '';
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
