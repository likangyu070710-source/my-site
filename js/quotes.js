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

  var chosen = list[Math.floor(Math.random() * list.length)];

  var text = chosen.querySelector('blockquote p');
  var source = chosen.querySelector('cite');

  var textTarget = box.querySelector('blockquote p');
  var sourceTarget = box.querySelector('cite');

  if (text && textTarget) { textTarget.textContent = text.textContent; }
  if (source && sourceTarget) { sourceTarget.textContent = source.textContent; }
})();
