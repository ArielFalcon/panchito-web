/* ═══════════════════════════════════════════════════════════════════════
   Panchito landing — boot. Wires i18n, nav, the four demo players, the
   scenario engine, comparison table, waitlist, and the hero loop.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const S = window.LandingScenarios;
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

    // ── reveal on scroll (rect-driven; robust where IO is unavailable) ──
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

    // ── demo players ──
    players.demo1 = window.createPlayer($('#stage-1'), S.demo1());
    players.demo2 = window.createPlayer($('#stage-2'), S.demo2());
    players.demo3 = window.createPlayer($('#stage-3'), S.demo3());
    players.demo4 = window.createPlayer($('#stage-4'), S.demo4());

    // replay buttons
    $$('[data-replay]').forEach((b) => b.addEventListener('click', () => { const p = players[b.dataset.replay]; p && p.restart(); }));

    // demo2 ending toggle
    $$('#demo-2 [data-ending]').forEach((b) => b.addEventListener('click', () => {
      $$('#demo-2 [data-ending]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      window.LandingState.d2ending = b.dataset.ending;
      players.demo2.restart();
    }));

    // ── scenario engine ──
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
      enginePlayer = window.createPlayer($('#eng-output'), scen, { autoplayOnVisible: false, loop: false });
      enginePlayer.restart();
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

    // ── hero loop ──
    S.heroLoop($('#hero-demo-body'));

    // ── language change → re-render dynamic copy ──
    window.addEventListener('langchange', () => {
      window.lucide && lucide.createIcons();
      renderCompare();
      // refresh demos that have already finished so copy matches language
      ['demo1', 'demo2', 'demo3', 'demo4'].forEach((k) => { const p = players[k]; if (p && p.done) p.restart(); });
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
