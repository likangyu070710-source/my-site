/* nav.js — the site navigation lives in nav.html, once, and nowhere else.
   Every page leaves a placeholder; this file fetches the one copy and
   puts it in. Change a link in nav.html and every page changes with it.

   fetch() needs http://, so opening the file directly will leave the page
   without a nav. The page still reads — the nav is an addition, not a
   requirement for the content. */

fetch('nav.html')
  .then(function (response) {
    if (!response.ok) { throw new Error('nav.html: ' + response.status); }
    return response.text();
  })
  .then(function (markup) {
    var parsed = new DOMParser().parseFromString(markup, 'text/html');
    var nav = parsed.querySelector('nav');
    var slot = document.querySelector('[data-nav]');

    if (nav && slot) {
      /* Replace the placeholder rather than filling it, so the page does
         not end up with a nav inside a div. */
      slot.replaceWith(nav);
      markCurrentPage(nav);
    }
  })
  .catch(function () {
    /* Left out on purpose: no nav is better than a broken page. */
  });

/* The link pointing at the page you are already on gets aria-current,
   so a screen reader announces it instead of leaving you to guess.
   The site name is left alone: it is a label, not one of the links. */
function markCurrentPage(nav) {
  var here = location.pathname.split('/').pop() || 'index.html';

  nav.querySelectorAll('a:not(.brand)').forEach(function (link) {
    var target = link.getAttribute('href');

    if (target === here) {
      link.setAttribute('aria-current', 'page');
    }
  });
}
