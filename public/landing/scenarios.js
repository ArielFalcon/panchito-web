/* ═══════════════════════════════════════════════════════════════════════
   Panchito landing — scenario scripts. Each demo + the engine is a timeline
   over the shared renderers in player.js. Translatable strings are resolved
   via window.t at run time so a language switch + replay re-renders copy.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  const { el, Rail, Terminal, CodeDiff, Verdict, HumanError, GHCard, ChatPanel, Graph, Plan } = window.PUI;
  const t = (k) => window.t(k);

  window.LandingState = { d2ending: 'fail' };

  /* ── DEMO 1 · blast radius ─────────────────────────────────────────── */
  const GRAPH_MODEL = {
    clusters: [
      { label: 'web-frontend', x: 18, y: 24, w: 190, h: 96 },
      { label: 'checkout-service', x: 250, y: 20, w: 212, h: 104 },
      { label: 'payments-service', x: 132, y: 188, w: 232, h: 120 },
    ],
    nodes: [
      { id: 'cart', label: 'cart', x: 66, y: 74, r: 9 },
      { id: 'ui', label: 'checkout-ui', x: 158, y: 64, r: 9 },
      { id: 'cc', label: 'CheckoutController', x: 300, y: 60, r: 9 },
      { id: 'dc', label: 'DiscountClient', x: 410, y: 92, r: 9 },
      { id: 'ds', label: 'DiscountService', x: 210, y: 252, r: 11 },
      { id: 'pg', label: 'PaymentGateway', x: 318, y: 262, r: 9 },
    ],
    edges: [
      { from: 'ds', to: 'dc', label: 'injected' },
      { from: 'dc', to: 'cc' },
      { from: 'cc', to: 'ui', label: 'calls API' },
      { from: 'ui', to: 'cart' },
      { from: 'ds', to: 'pg' },
    ],
  };
  function demo1() {
    return {
      mount(root) {
        const wrap = el('div', 'stage-surface');
        const graph = Graph(GRAPH_MODEL);
        const rail = Rail(['classify', 'generate', 'review', 'execute']);
        const plan = Plan(t('d1.plantitle'));
        wrap.appendChild(graph.el); wrap.appendChild(rail.el); wrap.appendChild(plan.el);
        root.appendChild(wrap);
        return { graph, rail, plan, reset() { graph.reset(); rail.reset(); plan.reset(); plan.setTitle(t('d1.plantitle')); } };
      },
      duration: 7000,
      steps: [
        { at: 300, run: (c) => { c.rail.set('classify', 'active'); c.graph.pulse('ds'); c.graph.litNode('ds'); } },
        { at: 1100, run: (c) => c.graph.litEdge('ds', 'dc') },
        { at: 1550, run: (c) => c.graph.litNode('dc') },
        { at: 2100, run: (c) => c.graph.litEdge('dc', 'cc') },
        { at: 2550, run: (c) => c.graph.litNode('cc') },
        { at: 3100, run: (c) => c.graph.litEdge('cc', 'ui') },
        { at: 3550, run: (c) => c.graph.litNode('ui') },
        { at: 4050, run: (c) => { c.graph.litEdge('ui', 'cart'); c.graph.litEdge('ds', 'pg'); } },
        { at: 4450, run: (c) => { c.graph.litNode('cart'); c.graph.litNode('pg'); c.rail.set('classify', 'done'); c.rail.set('generate', 'active'); } },
        { at: 5000, run: (c) => { c.plan.setTitle(t('d1.plantitle')); c.plan.add(t('d1.plan1')); } },
        { at: 5550, run: (c) => c.plan.add(t('d1.plan2')) },
        { at: 6100, run: (c) => { c.plan.add(t('d1.plan3')); c.rail.set('generate', 'done'); c.rail.set('review', 'active'); } },
      ],
    };
  }

  /* ── DEMO 2 · generate → review → coverage → run → record ──────────── */
  const SPEC = [
    "import { test, expect } from '@playwright/test';",
    "",
    "test('coupon applies discount', async ({ page }) => {",
    "  await page.goto('/cart');",
    "  await page.getByTestId('coupon').fill('SAVE10');",
    "  await page.getByText('Apply').click();",
    "  await expect(page.getByTestId('total'))",
    "    .toHaveText('$45.00');",
    "});",
  ];
  function demo2() {
    return {
      mount(root) {
        const wrap = el('div', 'stage-surface');
        const rail = Rail();
        const diff = CodeDiff(SPEC);
        const verdict = Verdict();
        const term = Terminal('playwright · dev.shop.app');
        const human = HumanError();
        const gh = GHCard();
        [rail.el, diff.el, verdict.el, term.el, human.el, gh.el].forEach((e) => wrap.appendChild(e));
        root.appendChild(wrap);
        return { rail, diff, verdict, term, human, gh, reset() { rail.reset(); diff.reset(); verdict.reset(); term.reset(); human.reset(); gh.reset(); } };
      },
      duration: 7400,
      steps: [
        { at: 250, run: (c) => { c.rail.set('gate', 'done'); c.rail.set('classify', 'active'); } },
        { at: 750, run: (c) => { c.rail.set('classify', 'done'); c.rail.set('generate', 'active'); c.diff.typeAll(); } },
        { at: 2050, run: (c) => { c.rail.set('generate', 'done'); c.rail.set('review', 'active'); c.verdict.show(false, t('d2.rej')); } },
        { at: 2950, run: (c) => c.verdict.show(true, t('d2.appr')) },
        { at: 3550, run: (c) => { c.rail.set('review', 'done'); c.rail.set('coverage', 'active'); c.diff.glow([4, 5, 6, 7, 8]); c.term.line('›', t('d2.cov'), 'is-pass'); } },
        { at: 4200, run: (c) => { c.rail.set('coverage', 'done'); c.rail.set('execute', 'active'); c.term.line('$', 'npx playwright test --grep coupon'); } },
        { at: 4700, run: (c) => c.term.line('›', 'running against dev.shop.app', 'is-mut') },
        { at: 5400, run: (c) => {
            if (window.LandingState.d2ending === 'pass') c.term.line('✓', '1 passed · 12.4s', 'is-pass');
            else c.term.line('✗', '1 failed · total was "$50.00", expected "$45.00"', 'is-fail');
          } },
        { at: 6100, run: (c) => {
            if (window.LandingState.d2ending === 'pass') { c.rail.set('execute', 'done'); c.rail.set('decide', 'active'); }
            else { c.rail.set('execute', 'fail'); c.rail.set('decide', 'active'); c.human.show(t('d2.err')); }
          } },
        { at: 6800, run: (c) => {
            c.rail.set('decide', 'done');
            if (window.LandingState.d2ending === 'pass') c.gh.show('pr', t('d2.prtitle'), { branch: 'e2e-coupon', base: 'main' });
            else c.gh.show('issue', t('d2.issuetitle'), { sub: 'sanitized logs attached' });
          } },
      ],
    };
  }

  /* ── DEMO 3 · ask it anything, on any channel ──────────────────────── */
  function demo3() {
    let chat = null, interactive = false, locals = [];
    const clearLocals = () => { locals.forEach(clearTimeout); locals = []; };
    const S = (ms, fn) => locals.push(setTimeout(fn, ms));
    const ACT = () => [
      { icon: 'git-pull-request', label: t('d3.act1'), reply: 'd3.r1' },
      { icon: 'list-checks', label: t('d3.act2'), reply: 'd3.r2' },
    ];
    // One canned exchange per channel — reused by the auto sequence AND manual clicks.
    const CONV = {
      terminal: () => { S(140, () => chat.tui(t('d3.t_q'))); S(880, () => chat.recall(t('d3.recall'))); S(1640, () => chat.tui(null, t('d3.t_a1'), 'out')); S(2000, () => chat.tui(null, t('d3.t_a2'), 'ok')); },
      slack: () => { S(160, () => chat.user(t('d3.s_q'), 'DK')); S(760, () => chat.typing(true)); S(1760, () => { chat.typing(false); chat.bot(t('d3.s_a'), '14:02'); }); S(2240, () => chat.actionChips(ACT())); },
      telegram: () => { S(160, () => chat.user(t('d3.g_q'), 'me')); S(760, () => chat.typing(true)); S(1760, () => { chat.typing(false); chat.bot(t('d3.g_a'), '14:03'); }); S(2240, () => chat.actionChips(ACT())); },
    };
    // Cross-fade to a channel then play its exchange (used by auto + manual).
    function playChannel(key) { clearLocals(); chat.crossfade(key, () => CONV[key]()); }
    // First channel: no fade-out flash, render straight in.
    function openFirst(key) { clearLocals(); chat.setChannel(key); chat.clearThread(); CONV[key](); }
    // Any manual touch drops into interactive mode and halts the auto timeline.
    function goInteractive(key) { interactive = true; chat.hint(true); playChannel(key); }
    function onAction(a) {
      interactive = true; chat.hint(true); clearLocals();
      S(60, () => chat.user(a.label, 'me'));
      S(640, () => chat.typing(true));
      S(1560, () => { chat.typing(false); chat.bot(t(a.reply), '14:0' + (Math.floor(Math.random() * 6) + 3)); });
    }
    return {
      mount(root) {
        const wrap = el('div', 'stage-surface');
        chat = ChatPanel({ onChannel: (key) => goInteractive(key), onAction: (a) => onAction(a) });
        wrap.appendChild(chat.el); root.appendChild(wrap);
        return { chat, reset() { interactive = false; clearLocals(); chat.reset(); } };
      },
      duration: 12200,
      steps: [
        { at: 150, run: () => { if (interactive) return; openFirst('terminal'); } },
        { at: 4400, run: () => { if (interactive) return; playChannel('slack'); } },
        { at: 8400, run: () => { if (interactive) return; playChannel('telegram'); } },
        { at: 11600, run: () => { if (interactive) return; chat.hint(true); } },
      ],
    };
  }

  /* ── DEMO 4 · it tests itself (run → error → maintainer → fix → main) ─ */
  function demo4() {
    return {
      mount(root) {
        const wrap = el('div', 'stage-surface');
        const stage = el('div', 'selfix');
        stage.innerHTML = `
          <div class="selfix__lane" data-lane="qa">
            <div class="selfix__who">
              <div class="selfix__avatar selfix__avatar--qa">${window.PUI.ic('bot')}</div>
              <span class="selfix__name">panchito</span>
              <span class="selfix__role">${t('d4.qarole')}</span>
            </div>
            <div class="selfix__body" data-body="qa"></div>
            <div class="selfix__arrow" data-arrow="qa">${window.PUI.ic('corner-down-right')}</div>
          </div>
          <div class="selfix__lane" data-lane="maint">
            <div class="selfix__who">
              <div class="selfix__avatar selfix__avatar--maint">${window.PUI.ic('wrench')}</div>
              <span class="selfix__name">qa-maintainer</span>
              <span class="selfix__role">${t('d4.maintrole')}</span>
            </div>
            <div class="selfix__body" data-body="maint"></div>
          </div>`;
        wrap.appendChild(stage); root.appendChild(wrap);
        const gh = GHCard(); gh.el.classList.add('selfix__pr');
        stage.querySelector('[data-body="maint"]').appendChild(gh.el);
        const qaBody = stage.querySelector('[data-body="qa"]');
        const maintBody = stage.querySelector('[data-body="maint"]');
        const arrow = stage.querySelector('[data-arrow="qa"]');
        function evt(body, kind, icon, text, spin) {
          const e = el('div', 'evt evt--' + kind);
          e.innerHTML = (spin ? '<span class="evt__spin"></span>' : window.PUI.ic(icon, 'class="evt__ic"')) + `<span>${text}</span>`;
          body.appendChild(e); window.PUI.refreshIcons();
          setTimeout(() => e.classList.add('show'), 16);
          return e;
        }
        return {
          gh, arrow,
          qa(kind, icon, text, spin) { return evt(qaBody, kind, icon, text, spin); },
          maint(kind, icon, text, spin) { return evt(maintBody, kind, icon, text, spin); },
          showArrow() { arrow.classList.add('show'); },
          swapSpin(e, icon, kind, text) { if (!e) return; e.className = 'evt evt--' + kind + ' show'; e.innerHTML = window.PUI.ic(icon, 'class="evt__ic"') + `<span>${text}</span>`; window.PUI.refreshIcons(); },
          reset() {
            qaBody.innerHTML = ''; maintBody.innerHTML = '';
            arrow.classList.remove('show');
            gh.reset(); gh.el.classList.add('selfix__pr'); maintBody.appendChild(gh.el);
          },
        };
      },
      duration: 7600,
      steps: [
        { at: 250, run: (c) => c.qa('run', 'play', t('d4.e1')) },
        { at: 1100, run: (c) => { c._w = c.qa('work', 'loader', t('d4.e2'), true); } },
        { at: 2000, run: (c) => c.swapSpin(c._w, 'circle-x', 'fail', t('d4.e3')) },
        { at: 2700, run: (c) => { c.qa('report', 'arrow-down-right', t('d4.e4')); c.showArrow(); } },
        { at: 3600, run: (c) => c.maint('run', 'inbox', t('d4.e5')) },
        { at: 4400, run: (c) => { c._m = c.maint('work', 'loader', t('d4.e6'), true); } },
        { at: 5500, run: (c) => c.swapSpin(c._m, 'check', 'commit', t('d4.e7')) },
        { at: 6300, run: (c) => c.gh.show('pr', t('d4.pr'), { branch: 'self/fix-selector', base: 'main' }) },
        { at: 7050, run: (c) => c.maint('commit', 'git-merge', t('d4.e8')) },
      ],
    };
  }

  /* ── ENGINE · full pipeline (capped) ───────────────────────────────── */
  function makeEngine(rail) {
    return function (opts) {
      const repo = opts.repo || 'your-org/shop';
      const scope = opts.full ? 'full' : ('last ' + opts.depth + ' commits');
      return {
        mount(root) {
          const wrap = el('div');
          const term = Terminal(repo + ' · dev');
          const gh1 = GHCard(), gh2 = GHCard();
          [term.el, gh1.el, gh2.el].forEach((e) => wrap.appendChild(e));
          root.innerHTML = ''; root.appendChild(wrap);
          rail.reset();
          return { term, gh1, gh2, reset() { term.reset(); gh1.reset(); gh2.reset(); rail.reset(); } };
        },
        duration: 6400,
        steps: [
          { at: 100, run: (c) => { rail.set('gate', 'active'); c.term.line('$', `panchito qa ${repo} · ${scope}`); } },
          { at: 600, run: (c) => { rail.set('gate', 'done'); rail.set('classify', 'active'); c.term.line('›', opts.full ? 'auditing whole repo · 6 flows' : `analyzing ${opts.depth} commits · 2 with logic changes`, 'is-info'); } },
          { at: 1500, run: (c) => { rail.set('classify', 'done'); rail.set('generate', 'active'); c.term.line('›', 'blast radius · 3 routes · 1 cross-repo (payments→checkout)', 'is-mut'); } },
          { at: 2300, run: (c) => { c.term.line('›', 'generate · wrote 3 specs'); rail.set('generate', 'done'); rail.set('review', 'active'); } },
          { at: 3000, run: (c) => { c.term.line('›', 'qa-reviewer · approved 3/3', 'is-pass'); rail.set('review', 'done'); rail.set('coverage', 'active'); } },
          { at: 3600, run: (c) => { c.term.line('›', 'change-coverage · 11/11 changed lines', 'is-pass'); rail.set('coverage', 'done'); rail.set('execute', 'active'); } },
          { at: 4200, run: (c) => c.term.line('›', `running against dev · ${repo.split('/')[1] || 'app'}`, 'is-mut') },
          { at: 4900, run: (c) => c.term.line('~', '3 specs · 2 passed · 1 failed', 'is-warn') },
          { at: 5400, run: (c) => { rail.set('execute', 'done'); rail.set('decide', 'active'); } },
          { at: 5800, run: (c) => c.gh1.show('pr', 'Add E2E: 2 green flows', { branch: 'qa/e2e-batch', base: 'main' }) },
          { at: 6100, run: (c) => { c.gh2.show('issue', 'Refund flow: total mismatch on partial refund'); rail.set('decide', 'done'); } },
        ],
      };
    };
  }

  /* ── HERO micro-demo · progressive terminal that grows smoothly ──────── */
  function heroLoop(body) {
    const reduce = window.PUI.reduce;
    body.style.overflow = 'hidden';
    body.style.transition = 'height 0.5s var(--ease)';

    function lineEl(g, txt, cls) {
      const l = el('div', 'term__line' + (cls ? ' ' + cls : ''));
      l.innerHTML = `<span class="g">${g}</span><span>${txt}</span>`;
      l.style.fontFamily = 'var(--font-mono)'; l.style.fontSize = '12px'; l.style.lineHeight = '1.9';
      return l;
    }
    function prCard() {
      const card = el('div', 'ghcard ghcard--pr');
      card.style.margin = '12px 0 0';
      card.innerHTML = `<div class="ghcard__head">${window.PUI.ic('git-pull-request', 'class="ghcard__icon"')}<span class="ghcard__title">${t('hero.pr')}</span></div><div class="ghcard__meta"><span class="ghcard__automerge">${window.PUI.ic('check', 'style="width:13px;height:13px"')} ${t('hero.prsub')}</span></div>`;
      return card;
    }
    // grow the container to fit its content with a smooth transition
    function grow() { body.style.height = body.scrollHeight + 'px'; }
    function append(node, reveal) {
      body.appendChild(node); grow();
      if (reveal) setTimeout(() => node.classList.add(reveal), 30);
      window.PUI.refreshIcons();
    }

    let timers = [];
    function clear() { timers.forEach(clearTimeout); timers = []; }
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));

    function build(animated) {
      body.innerHTML = ''; body.style.height = 'auto';
      append(lineEl('›', t('hero.commit'), 'is-mut'), animated ? 'in' : null);
      if (!animated) {
        append(lineEl('›', t('hero.reading'), 'is-info'), null);
        append(lineEl('✓', t('hero.writing'), 'is-pass'), null);
        const c = prCard(); c.classList.add('show'); append(c, null);
        body.querySelectorAll('.term__line').forEach((l) => l.classList.add('in'));
        body.style.height = 'auto';
        return;
      }
      at(950,  () => append(lineEl('›', t('hero.reading'), 'is-info'), 'in'));
      at(1900, () => append(lineEl('✓', t('hero.writing'), 'is-pass'), 'in'));
      at(2750, () => append(prCard(), 'show'));
      at(5200, () => {            // hold, fade the card out, loop
        body.style.transition = 'height 0.5s var(--ease), opacity 0.4s var(--ease)';
        body.style.opacity = '0';
        at(450, () => { body.style.opacity = '1'; build(true); });
      });
    }

    if (reduce) { build(false); return; }
    // rebuild copy on language switch
    window.addEventListener('langchange', () => { clear(); build(true); });
    build(true);
  }

  /* ── Comparison data ───────────────────────────────────────────────── */
  const CK = { t: 'ck' }, NO = { t: 'no' };
  const COMPARE = [
    { feat: 'cmp.f1', cells: [CK, NO, NO, NO, { t: 'partial', k: 'cmp.partial' }] },
    { feat: 'cmp.f2', cells: [CK, { t: 'word', k: 'cmp.human' }, { t: 'word', k: 'cmp.single' }, NO, { t: 'word', k: 'cmp.human' }] },
    { feat: 'cmp.f3', cells: [CK, { t: 'word', k: 'cmp.serviceowned' }, { t: 'word', k: 'cmp.theircloud' }, NO, CK] },
    { feat: 'cmp.f4', cells: [CK, NO, NO, NO, NO] },
    { feat: 'cmp.f5', cells: [CK, CK, { t: 'word', k: 'cmp.theircloud' }, { t: 'word', k: 'cmp.replay' }, CK] },
    { feat: 'cmp.f6', cells: [CK, NO, NO, NO, NO] },
    { feat: 'cmp.f7', cells: [CK, NO, NO, NO, NO] },
  ];

  window.LandingScenarios = { demo1, demo2, demo3, demo4, makeEngine, heroLoop, COMPARE };
})();
