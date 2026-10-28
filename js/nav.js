/* nav.js — the site navigation lives in nav.html, once, and nowhere else.
   Every page leaves a placeholder; this file fetches the one copy and
   puts it in. Change a link in nav.html and every page changes with it.

   The index at the foot of each page is built from the same list, so
   there is still only one place to edit.

   fetch() needs http://, so opening the file directly leaves the nav
   placeholder alone — and the placeholder now carries one link home, so a
   visitor who lands on machine.html from the file system is not stranded. */

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
    /* Left out on purpose: the fallback link is better than a broken page. */
  });

/* The name of the file the visitor is looking at. On the home page the
   address ends in a slash, which gives an empty string. */
function currentPage() {
  return location.pathname.split('/').pop() || 'index.html';
}

/* The link pointing at the page you are already on gets aria-current,
   so a screen reader announces it instead of leaving you to guess.
   The site name is included: on the home page it is the only thing that
   can say where you are. */
function markCurrentPage(nav) {
  var here = currentPage();

  nav.querySelectorAll('a').forEach(function (link) {
    if (link.getAttribute('href') === here) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* The index at the foot of the page: one step back, one step on, taken
   from the same links the nav uses. Linear, not circular — the home page
   has nothing before it, and the last page has nothing after it. A ring
   would have printed "← Ideas" at the top of the site, which is a link
   to the end of it. */
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

  if (index === -1) { return; }   /* this page is not in the list */

  slot.className = 'pager';

  if (index > 0) {
    slot.appendChild(pagerLink(pages[index - 1], 'prev', '\u2190', true));
  }

  if (index < pages.length - 1) {
    slot.appendChild(pagerLink(pages[index + 1], 'next', '\u2192', false));
  }
}

/* The arrow is a drawing, not a word, so it goes inside an aria-hidden
   span and the link is announced as "Ideas", not "Ideas rightwards arrow". */
function pagerLink(page, className, arrow, arrowFirst) {
  var link = document.createElement('a');
  var mark = document.createElement('span');

  link.href = page.href;
  link.className = className;

  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = arrow;

  if (arrowFirst) {
    link.appendChild(mark);
    link.appendChild(document.createTextNode(' ' + page.label));
  } else {
    link.appendChild(document.createTextNode(page.label + ' '));
    link.appendChild(mark);
  }

  return link;
}
