/* nav.js — the site navigation lives in nav.html, once, and nowhere else.
   Every page leaves a placeholder; this file fetches the one copy and
   puts it in. Change a link in nav.html and every page changes with it.

   The index at the foot of each page is built from the same list, so
   there is still only one place to edit.

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
      buildPager(nav);
    }
  })
  .catch(function () {
    /* Left out on purpose: no nav is better than a broken page. */
  });

/* The name of the file the visitor is looking at. On the home page the
   address ends in a slash, which gives an empty string. */
function currentPage() {
  return location.pathname.split('/').pop() || 'index.html';
}

/* The link pointing at the page you are already on gets aria-current,
   so a screen reader announces it instead of leaving you to guess.
   The site name is left alone: it is a label, not one of the links. */
function markCurrentPage(nav) {
  var here = currentPage();

  nav.querySelectorAll('a:not(.brand)').forEach(function (link) {
    var target = link.getAttribute('href');

    if (target === here) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* The index at the foot of the page: one step back, one step on, taken
   from the same links the nav uses. The home page is not a nav link —
   it is the site name — so it is added here, once, to close the ring. */
function buildPager(nav) {
  var slot = document.querySelector('[data-pager]');
  if (!slot) { return; }

  var pages = [{ href: 'index.html', label: 'Home' }].concat(
    Array.prototype.map.call(nav.querySelectorAll('a:not(.brand)'), function (link) {
      return { href: link.getAttribute('href'), label: link.textContent.trim() };
    })
  );

  var here = currentPage();
  var index = -1;

  for (var i = 0; i < pages.length; i += 1) {
    if (pages[i].href === here) { index = i; }
  }

  if (index === -1) { return; }   /* this page is not part of the ring */

  var previous = pages[(index - 1 + pages.length) % pages.length];
  var next = pages[(index + 1) % pages.length];

  slot.className = 'pager';
  slot.appendChild(pagerLink(previous, 'prev', '\u2190 ' + previous.label));
  slot.appendChild(pagerLink(next, 'next', next.label + ' \u2192'));
}

function pagerLink(page, className, text) {
  var link = document.createElement('a');

  link.href = page.href;
  link.className = className;
  link.textContent = text;

  return link;
}
