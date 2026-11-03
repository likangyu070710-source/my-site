/* quotes.js — one of the fifteen, drawn at random when the page arrives,
   and drawn again every time the button in the head of the box is
   pressed.

   Two rules hold it together.

   1. The box is never empty. One quotation is already written into the
      HTML, so the page says something before this file runs — and still
      says something if it never runs. That is the point of progressive
      enhancement: the page works first, and this is added on top.

   2. A draw never repeats what is already on screen. Drawing from all
      fifteen would come back with the same sentence roughly one press in
      fifteen, and a button that appears to do nothing is worse than no
      button at all.

   The box is not a live region: it would read a long sentence out the
   moment the page opened, whether or not anyone wanted it. So a press,
   and only a press, writes one line into the hidden status region — the
   sentence on arrival is left to be found by reading. */

(function () {
  var box = document.querySelector('[data-random-quote]');
  var list = document.querySelectorAll('.quotes li');

  if (!box || !list.length) { return; }

  /* The button is in the markup so it can be styled with the rest of the
     box, but it is only shown once this file has run: with JavaScript off
     it would be a control that does nothing. */
  box.classList.add('has-draw');

  var button = box.querySelector('[data-draw]');
  var status = box.querySelector('[data-quote-status]');
  var textBox = box.querySelector('blockquote p');
  var sourceBox = box.querySelector('cite');

  /* The fifteen are read out of the list rather than copied into this
     file: add a quotation to the page and the draw already knows it. */
  var quotes = Array.prototype.map.call(list, function (item) {
    return {
      text: item.querySelector('blockquote p').textContent.trim(),
      source: item.querySelector('cite').textContent.trim()
    };
  });

  /* Which of them is printed in the box right now. -1 means none of them
     is, and then nothing needs excluding. */
  function indexOf(text) {
    for (var i = 0; i < quotes.length; i += 1) {
      if (quotes[i].text === text) { return i; }
    }
    return -1;
  }

  var current = indexOf(textBox.textContent.trim());

  /* Every index but the one on screen. */
  function drawIndex() {
    var pool = [];

    for (var i = 0; i < quotes.length; i += 1) {
      if (i !== current) { pool.push(i); }
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* Replaying a CSS animation asks the browser to start it again. It only
     does that if it has seen the class missing, so the class comes off,
     one style calculation is forced by reading offsetWidth, and the class
     goes back on. Without the middle step the two class lists look the
     same and nothing moves. */
  function fadeIn() {
    box.classList.remove('is-drawn');
    void box.offsetWidth;
    box.classList.add('is-drawn');
  }

  function show(index, byVisitor) {
    var quote = quotes[index];

    textBox.textContent = quote.text;
    sourceBox.textContent = quote.source;
    current = index;

    if (!byVisitor) { return; }

    fadeIn();

    /* The number is the same one printed in the list, so a visitor can
       find the sentence again further down the page. */
    if (status) {
      status.textContent = 'Quotation ' + (index + 1) + ' of ' + quotes.length +
        '. ' + quote.text + ' \u2014 ' + quote.source;
    }
  }

  /* The draw on arrival carries no fade: the page is still settling, and
     a second animation on top of the first paint is only noise. */
  if (quotes.length > 1) { show(drawIndex(), false); }

  if (!button) { return; }

  button.addEventListener('click', function () {
    if (quotes.length > 1) { show(drawIndex(), true); }
  });
})();
