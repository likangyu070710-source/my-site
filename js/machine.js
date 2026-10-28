/* machine.js — the machine does nothing, and says so.

   The loop, drawn before it was built:
     waiting  →  pressed (a line appears, a sound plays)  →  waiting again
   The last state is the first state, which is what makes it start over.

   Every press clears the previous timer first, so clicking fast can never
   leave the machine halfway through its sentence. */

(function () {
  "use strict";

  var button = document.getElementById("press");
  var status = document.getElementById("status");
  if (!button || !status) { return; }

  var timer = null;
  var presses = 0;

  /* ---- the sound -------------------------------------------------------
     Synthesised, not loaded: no file, no licence, nothing to download.
     One short falling tone — the noise a machine makes when it switches
     itself off. Each press starts a little lower, as if it were tiring. */

  var AudioCtx = window.AudioContext || window.webkitAudioContext;
  var ctx = null;

  function thunk(count) {
    if (!AudioCtx) { return; }
    try {
      if (!ctx) { ctx = new AudioCtx(); }
      if (ctx.state === "suspended") { ctx.resume(); }

      var now = ctx.currentTime;
      var start = Math.max(100, 170 - count * 8);
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(start, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      /* Sound is a bonus. The machine still works in silence. */
    }
  }

  /* ---- the loop -------------------------------------------------------- */

  button.addEventListener("click", function () {
    presses += 1;

    if (presses === 1) {
      status.textContent = "Nothing happened.";
    } else if (presses === 2) {
      status.textContent = "Nothing happened again.";
    } else {
      status.textContent = "Why did you press it again?";
    }

    status.classList.add("show");
    thunk(presses);

    if (timer) { clearTimeout(timer); }

    /* Back to the start: the line fades out, then the box is empty again —
       exactly the state it was in before the first press. */
    timer = setTimeout(function () {
      status.classList.remove("show");
      setTimeout(function () {
        if (!status.classList.contains("show")) { status.textContent = ""; }
      }, 300);
      timer = null;
    }, 1400);
  });
})();
