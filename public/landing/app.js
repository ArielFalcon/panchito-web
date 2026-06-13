/* ═══════════════════════════════════════════════════════════════════════
   Panchito landing — boot. Wires i18n, nav, the hero + four demo players (all
   driven by the AnimationDirector), the scenario engine, comparison, waitlist.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const S = window.LandingScenarios;
  const D = window.AnimationDirector;
  const players = {};

  function boot() {
    window.lucide && lucide.createIcons();
    window.PanchitoI18n.apply();

    // ── language toggle (nav + footer) ──
    $$('.lang button').forEach((b) => b.addEventListener('click', () => window.PanchitoI18n.setLang(b.dataset.lang)));

    // ── nav solidify on scroll ──
    const nav = $('#nav');
    const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > 24);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

    // ── reveal copy on scroll ──
    const revealEls = $$('.demo__text, .engine__head, .cta, #compare .kicker, #compare .section-title, #compare .lede');
    revealEls.forEach((e) => e.classList.add('reveal'));
    let rafR = 0;
    function revealCheck() {
      const h = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach((e) => {
        if (e.classList.contains('in')) return;
        const r = e.getBoundingClientRect();
        if (r.top < h * 0.9 && r.bottom > 0) e.classList.add('in');
      });
    }
    const onRevealScroll = () => { if (rafR) return; rafR = requestAnimationFrame(() => { rafR = 0; revealCheck(); }); };
    window.addEventListener('scroll', onRevealScroll, { passive: true });
    window.addEventListener('resize', onRevealScroll, { passive: true });
    revealCheck(); setTimeout(revealCheck, 300); window.addEventListener('load', () => setTimeout(revealCheck, 60));

    // ── players — register the hero FIRST so it wins ties against Demo 1 just
    //    below it; each player's REGION is its whole section (the reader's focus). ──
    players.hero = S.heroLoop($('#hero-demo-body'), { region: $('#hero') });
    players.demo1 = window.createPlayer($('#stage-1'), S.demo1(), { region: $('#demo-1') });
    players.demo2 = window.createPlayer($('#stage-2'), S.demo2(), { region: $('#demo-2') });
    players.demoSdk = window.createPlayer($('#stage-sdk'), S.demoSDK(), { region: $('#demo-sdk') });
    players.demo3 = window.createPlayer($('#stage-3'), S.demo3(), { region: $('#demo-3') });
    players.demo4 = window.createPlayer($('#stage-4'), S.demo4(), { region: $('#demo-4') });
    players.demo5 = window.createPlayer($('#stage-5'), S.demo5(), { region: $('#demo-5') });
    D.start();

    // replay buttons — force that demo to replay, taking the slot
    $$('[data-replay]').forEach((b) => b.addEventListener('click', () => {
      const p = players[b.dataset.replay];
      if (p) D.forcePlay(p);
    }));

    // demo2 ending toggle
    $$('#demo-2 [data-ending]').forEach((b) => b.addEventListener('click', () => {
      $$('#demo-2 [data-ending]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      window.LandingState.d2ending = b.dataset.ending;
      D.forcePlay(players.demo2);
    }));

    // ── scenario engine (on-demand; preempts the auto demos via claim/release) ──
    const rail = window.PUI.Rail();
    $('#eng-rail').appendChild(rail.el);
    const makeEngine = S.makeEngine(rail);
    let depth = 10;
    const depthVal = $('#depth-val');
    $('#depth-dec').addEventListener('click', () => { depth = Math.max(1, depth - 1); depthVal.textContent = depth; $('#eng-full').checked = false; });
    $('#depth-inc').addEventListener('click', () => { depth = Math.min(50, depth + 1); depthVal.textContent = depth; $('#eng-full').checked = false; });
    let enginePlayer = null;
    $('#eng-run').addEventListener('click', () => {
      const empty = $('#eng-empty'); if (empty) empty.style.display = 'none';
      const repo = ($('#eng-repo').value || 'your-org/shop').trim();
      const full = $('#eng-full').checked;
      const scen = makeEngine({ repo, depth, full });
      if (enginePlayer) enginePlayer.pause();
      enginePlayer = window.createPlayer($('#eng-output'), scen, {
        autoRegister: false,
        onDone: () => D.release(enginePlayer),
      });
      D.claim(enginePlayer);
      enginePlayer.reset();
      enginePlayer.start();
    });

    // ── comparison table ──
    renderCompare();

    // ── waitlist ──
    $('#waitlist').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#wl-email').value.trim();
      if (!email || email.indexOf('@') < 0) { $('#wl-email').focus(); return; }
      try { localStorage.setItem('panchito.waitlist', email); } catch (err) {}
      $('#wl-ok').classList.add('show'); $('#wl-email').value = '';
    });

    // ── language change → re-render dynamic copy in the new language ──
    window.addEventListener('langchange', () => {
      window.lucide && lucide.createIcons();
      renderCompare();
      D.players.forEach((p) => { if (p !== D.active) p.reset(); });
      if (D.active) D.forcePlay(D.active);
    });
  }

  function cell(c) {
    if (c.t === 'ck') return '<span class="ck" aria-label="yes">✓</span>';
    if (c.t === 'no') return '<span class="no" aria-label="not supported"></span>';
    if (c.t === 'partial') return `<span class="partial">${window.t(c.k)}</span>`;
    return `<span class="human">${window.t(c.k)}</span>`;
  }
  function renderCompare() {
    const body = $('#cmp-body'); if (!body) return;
    body.innerHTML = S.COMPARE.map((row) => {
      const us = `<td class="us">${cell(row.cells[0])}</td>`;
      const rest = row.cells.slice(1).map((c) => `<td>${cell(c)}</td>`).join('');
      return `<tr><td class="feat">${window.t(row.feat)}</td>${us}${rest}</tr>`;
    }).join('');
    window.lucide && lucide.createIcons();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
