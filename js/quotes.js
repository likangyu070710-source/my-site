/* quotes.js — one of the fifteen, chosen at random each time the page
   loads, and put into the box at the top.

   The first quotation is already written in the HTML. This file only
   swaps it for another, so if the script fails — or JavaScript is off —
   the box still says something. That is the point of progressive
   enhancement: the page works first, and this is added on top. */

(function () {
  var box = document.querySelector('[data-random-quote]');
  var list = document.querySelectorAll('.quotes li');

  if (!box || !list.length) { return; }

  /* The last quotation in the list is the one already printed in the box
     above it, so it is left out of the draw: otherwise one visit in
     fifteen shows the same sentence twice on one screen. */
  var pool = Array.prototype.slice.call(list, 0, -1);
  var chosen = pool[Math.floor(Math.random() * pool.length)];

  var text = chosen.querySelector('blockquote p');
  var source = chosen.querySelector('cite');

  var textTarget = box.querySelector('blockquote p');
  var sourceTarget = box.querySelector('cite');

  if (text && textTarget) { textTarget.textContent = text.textContent; }
  if (source && sourceTarget) { sourceTarget.textContent = source.textContent; }
})();
