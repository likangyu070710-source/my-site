/* machine.js — the whole behaviour of the machine.

   The loop was drawn on paper before any of this was written:

     waiting   — you switch it on  →   open
     open      — the lid lifts     →   reaching
     reaching  — the hand comes out and pushes the switch back  →   flipping
     flipping  — the hand leaves, the lid closes  →   waiting

   The last state is the first state. That is the whole machine.

   One rule holds the rest together: every press starts with reset().
   Without it, a click during the surprise would leave the box half open,
   because two cycles would be running at once. */

(function () {
  var box = document.querySelector('[data-box]');
  var power = document.getElementById('power');
  var status = document.querySelector('[data-status]');

  if (!box || !power || !status) { return; }

  var count = 0;      /* how many times it has switched itself off */
  var timers = [];    /* every pending timeout, so none outlives a reset */
  var audio = null;   /* made on the first press, if the browser allows */

  /* ---- helpers ---- */

  function later(action, ms) {
    timers.push(window.setTimeout(action, ms));
  }

  function clearAll() {
    timers.forEach(window.clearTimeout);
    timers = [];
  }

  function say(line) {
    status.textContent = line;
    status.classList.add('show');

    later(function () {
      status.classList.remove('show');
    }, 2800);
  }

  /* The hand is slower every time it is asked to do this — 380 ms at
     first, just under a second by the eighth press. */
  function reachTime() {
    return 380 + Math.min(count, 7) * 95;
  }

  /* Every line is different from the one before it. A live region does
     not re-read a sentence that has not changed, so the repeat lines
     carry their count: pressing six times says six things.

     Keep every line under 56 characters. The strip below the box is
     exactly two lines tall — calc(3em + 20px) at 15px/1.5 on a 320px
     screen — so a longer sentence makes it three lines and pushes the
     rest of the page down. Nothing in the stylesheet would catch that,
     because the stylesheet has not changed. The longest line here is 42,
     which leaves fourteen characters of room.

     The 56 assumes 0.6em per character, which is the widest the stack can
     produce. Consolas is narrower — it fits about 61 — but Menlo does not,
     so do not raise the limit to what one machine happens to show. */
  function lineFor(n) {
    if (n === 1) { return 'It switched itself off.'; }
    if (n === 2) { return 'It switched itself off again.'; }
    if (n === 3) { return 'Why did you switch it on again?'; }
    if (n === 7) { return 'The hand is not enjoying this.'; }
    return 'It switched itself off. As before. \u00B7 ' + n;
  }

  /* ---- sound: two short tones, made by the browser, no files ---- */

  function tone(kind) {
    try {
      if (!audio) {
        audio = new (window.AudioContext || window.webkitAudioContext)();
      }

      var now = audio.currentTime;
      var osc = audio.createOscillator();
      var gain = audio.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(kind === 'on' ? 300 : 180, now);
      osc.frequency.exponentialRampToValueAtTime(kind === 'on' ? 230 : 62, now + 0.16);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch (error) {
      /* No audio, no problem: the machine still works. */
    }
  }

  /* ---- the cycle ---- */

  function reset() {
    clearAll();
    box.classList.remove('is-open', 'is-reaching', 'is-flipping');
    status.classList.remove('show');
    /* Emptied, not just hidden: two identical lines in a row are one
       announcement, and a visitor pressing quickly would hear silence. */
    status.textContent = '';
  }

  function switchItselfOff(delay) {
    later(function () {
      box.classList.add('is-reaching');
    }, 150);

    later(function () {
      box.classList.add('is-flipping');
      power.checked = false;   /* the hand does this, not the visitor */
      tone('off');
    }, 150 + delay);

    later(function () {
      box.classList.remove('is-reaching', 'is-flipping');
    }, 150 + delay + 620);

    later(function () {
      box.classList.remove('is-open');
    }, 150 + delay + 900);
  }

  power.addEventListener('change', function () {

    /* Switched off by the visitor: nothing to do, back to waiting. */
    if (!power.checked) {
      reset();
      return;
    }

    /* A fresh press always starts from a clean state. */
    reset();

    count += 1;
    box.classList.add('is-open');
    tone('on');

    /* The eighth press: the machine gives up and stays on for three
       seconds before switching itself off as usual. */
    if (count % 8 === 0) {
      say('The machine has decided to think about it.');

      later(function () {
        power.checked = false;
        box.classList.remove('is-open');
        tone('off');
        say('It switched itself off, eventually.');
      }, 3000);

      return;
    }

    switchItselfOff(reachTime());

    later(function () {
      say(lineFor(count));
    }, 150 + reachTime() + 200);
  });
})();
