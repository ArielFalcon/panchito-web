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
    // Each stage is an animated segment over the graph/plan. The pipeline rail
    // doubles as a stepper: clicking a stage replays prior state instantly, then
    // animates ONLY that stage (no auto-advance), without breaking the graph.
    // Graph beats are quick; the plan text below appears more slowly.
    const STAGES = ['classify', 'generate', 'review', 'execute'];
    const SEG = {
      classify: { dur: 2400, beats: [
        { dt: 0,    fn: (c) => { c.pulse('ds'); c.graph.litNode('ds'); } },
        { dt: 320,  fn: (c) => c.graph.litEdge('ds', 'dc') },
        { dt: 600,  fn: (c) => { c.graph.litNode('dc'); c.pulse('dc'); } },
        { dt: 900,  fn: (c) => c.graph.litEdge('dc', 'cc') },
        { dt: 1180, fn: (c) => { c.graph.litNode('cc'); c.pulse('cc'); } },
        { dt: 1460, fn: (c) => c.graph.litEdge('cc', 'ui') },
        { dt: 1740, fn: (c) => { c.graph.litNode('ui'); c.pulse('ui'); } },
        { dt: 2060, fn: (c) => { c.graph.litEdge('ui', 'cart'); c.graph.litEdge('ds', 'pg'); } },
        { dt: 2400, fn: (c) => { c.graph.litNode('cart'); c.graph.litNode('pg'); c.pulse('cart'); c.pulse('pg'); } },
      ] },
      generate: { dur: 1500, beats: [
        { dt: 0,    fn: (c) => { c.plan.setTitle(t('d1.plantitle')); c.plan.add(t('d1.plan1')); } },
        { dt: 750,  fn: (c) => c.plan.add(t('d1.plan2')) },
        { dt: 1500, fn: (c) => c.plan.add(t('d1.plan3')) },
      ] },
      review: { dur: 1500, beats: [
        { dt: 0,    fn: (c) => c.plan.addFeedback(0, t('d1.rev1')) },
        { dt: 750,  fn: (c) => c.plan.addFeedback(1, t('d1.rev2')) },
        { dt: 1500, fn: (c) => c.plan.addFeedback(2, t('d1.rev3')) },
      ] },
      execute: { dur: 1500, beats: [
        { dt: 0,    fn: (c) => c.plan.setVerdict(0, true, t('d1.ex1')) },
        { dt: 750,  fn: (c) => c.plan.setVerdict(1, false, t('d1.ex2')) },
        { dt: 1500, fn: (c) => c.plan.setVerdict(2, true, t('d1.ex3')) },
      ] },
    };
    const GAP = 350;
    const starts = {}; let tcur = 300;
    STAGES.forEach((n) => { starts[n] = tcur; tcur += SEG[n].dur + GAP; });

    // auto-play timeline (paused the moment the user steps in manually)
    const steps = [];
    STAGES.forEach((name) => {
      const s = starts[name], seg = SEG[name];
      steps.push({ at: s, run: (c) => { if (c._interactive) return; c.rail.set(name, 'active'); } });
      seg.beats.forEach((b) => steps.push({ at: s + b.dt, run: (c) => { if (c._interactive) return; b.fn(c); } }));
      steps.push({ at: s + seg.dur + 140, run: (c) => { if (c._interactive) return; c.rail.set(name, 'done'); } });
    });

    return {
      mount(root, player) {
        const wrap = el('div', 'stage-surface');
        const graph = Graph(GRAPH_MODEL);
        const rail = Rail(STAGES);
        const plan = Plan(t('d1.plantitle'));
        wrap.appendChild(graph.el); wrap.appendChild(rail.el); wrap.appendChild(plan.el);
        root.appendChild(wrap);

        let locals = [];
        const clearLocals = () => { locals.forEach(clearTimeout); locals = []; };

        const ctx = {
          graph, rail, plan, _interactive: false, _seeking: false,
          pulse(id) { if (ctx._seeking) return; graph.pulse(id); },
          reset() {
            clearLocals();
            ctx._interactive = false; ctx._seeking = false;
            graph.reset(); rail.reset(); plan.reset(); plan.setTitle(t('d1.plantitle'));
          },
          playStage(name) {
            ctx.reset();
            ctx._interactive = true;          // take over from the auto timeline
            ctx._seeking = true;              // seed prior stages with no flourish
            for (let i = 0; i < STAGES.length && STAGES[i] !== name; i++) {
              SEG[STAGES[i]].beats.forEach((b) => b.fn(ctx));
              rail.set(STAGES[i], 'done');
            }
            ctx._seeking = false;
            rail.set(name, 'active');
            SEG[name].beats.forEach((b) => locals.push(setTimeout(() => { b.fn(ctx); refreshIcons(); }, b.dt)));
            locals.push(setTimeout(() => rail.set(name, 'done'), SEG[name].dur + 180));
          },
        };

        // rail = interactive stepper
        rail.el.querySelectorAll('.rail__stage').forEach((s, i) => {
          const name = STAGES[i];
          s.classList.add('rail__stage--clickable');
          s.setAttribute('role', 'button');
          s.setAttribute('tabindex', '0');
          s.setAttribute('aria-label', 'play stage ' + name);
          const go = () => {
            const D = window.AnimationDirector;
            if (D && player && D.active !== player) { D._deactivate(); D.active = player; }
            ctx.playStage(name);
          };
          s.addEventListener('click', go);
          s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        });

        return ctx;
      },
      duration: tcur,
      steps,
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

  /* ── DEMO 5 · the learning layer (flywheel feeds a growing rulebook) ─ */
  function demo5() {
    const ic = window.PUI.ic;
    const NS = 'http://www.w3.org/2000/svg';
    return {
      mount(root) {
        const wrap = el('div', 'stage-surface');
        const L = el('div', 'learn');
        L.innerHTML = `
          <div class="learn__head">
            <span class="learn__intake">${ic('repeat', 'style="width:14px;height:14px"')}<span class="t-loop"></span></span>
            <span class="learn__hint t-hint"></span>
          </div>
          <div class="wheelwrap"></div>
          <div class="wread" data-k="read"><span class="wread__p">›</span><b class="wread__stage"></b><span class="wread__txt"></span></div>
          <div class="wbook">
            <div class="wbook__head">
              <span class="wbook__title t-book"></span>
              <span class="wbook__rule"></span>
              <span class="wbook__count"><b data-k="count">46</b> <span class="t-rulesword"></span></span>
            </div>
            <div class="wstack">
              <div class="wreject is-hidden" data-k="reject">${ic('x', 'style="width:14px;height:14px"')}<span><b class="wreject__id">R-048</b> <span class="t-discarded"></span></span></div>
              <div class="wcard wcard--new is-hidden" data-k="newcard">
                <span class="wcard__rid">R-047</span>
                <span class="wcard__text t-rulenew"></span>
                <span class="lstamp lstamp--new t-stamp"></span>
              </div>
              <div class="wcard wcard--old"><span class="wcard__rid">R-046</span><span class="wcard__text t-rule2"></span></div>
              <div class="wcard wcard--old"><span class="wcard__rid">R-045</span><span class="wcard__text t-rule1"></span></div>
            </div>
          </div>
          <div class="learn__foot" data-k="foot">${ic('check-check', 'style="width:15px;height:15px"')}<b class="t-foot"></b></div>`;
        wrap.appendChild(L);
        root.appendChild(wrap);

        // ── build the flywheel ──
        const cx = 180, cy = 122, R = 84;
        const mk = (tag, a) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); return e; };
        const svg = mk('svg', { class: 'wheel', viewBox: '0 0 360 256' });
        svg.appendChild(mk('circle', { class: 'wtrack', cx, cy, r: R }));
        const prog = mk('circle', { class: 'wprog', cx, cy, r: R, pathLength: '100', transform: `rotate(-90 ${cx} ${cy})` });
        prog.style.strokeDasharray = '100'; prog.style.strokeDashoffset = '100'; svg.appendChild(prog);
        const blob = mk('g', { class: 'wblob' });
        const disc = mk('circle', { class: 'wblob__disc', cx, cy }); blob.appendChild(disc);
        const blobId = mk('text', { class: 'wblob__id', x: cx, y: cy }); blob.appendChild(blobId);
        svg.appendChild(blob);
        const NODES = {
          lab: { x: cx, y: cy - R, n: '1', name: 'labeler', lx: cx, ly: cy - R - 24, anc: 'middle' },
          ora: { x: cx + R, y: cy, n: '2', name: 'oracle', lx: cx + R + 20, ly: cy + 4, anc: 'start' },
          ref: { x: cx, y: cy + R, n: '3', name: 'reflector', lx: cx, ly: cy + R + 30, anc: 'middle' },
          dis: { x: cx - R, y: cy, n: '4', name: 'distiller', lx: cx - R - 20, ly: cy + 4, anc: 'end' },
        };
        const nodeEls = {};
        Object.keys(NODES).forEach((k) => {
          const nd = NODES[k]; const g = mk('g', { class: 'wnode' });
          g.appendChild(mk('circle', { class: 'wnode__pulse', cx: nd.x, cy: nd.y, r: 15 }));
          g.appendChild(mk('circle', { class: 'wnode__pulse wnode__pulse--2', cx: nd.x, cy: nd.y, r: 15 }));
          g.appendChild(mk('circle', { class: 'wnode__c', cx: nd.x, cy: nd.y, r: 13 }));
          const num = mk('text', { class: 'wnode__n', x: nd.x, y: nd.y, 'text-anchor': 'middle', 'dominant-baseline': 'central' }); num.textContent = nd.n; g.appendChild(num);
          const lb = mk('text', { class: 'wnode__lbl', x: nd.lx, y: nd.ly, 'text-anchor': nd.anc }); lb.textContent = nd.name; g.appendChild(lb);
          svg.appendChild(g); nodeEls[k] = g;
        });
        L.querySelector('.wheelwrap').appendChild(svg);

        const q = (s) => L.querySelector(s);
        const readStage = q('.wread__stage'), readTxt = q('.wread__txt'), count = q('[data-k="count"]');
        const newcard = q('[data-k="newcard"]'), reject = q('[data-k="reject"]');
        let cur = null;

        function paint() {
          q('.t-loop').textContent = t('d5.loop');
          q('.t-hint').textContent = t('d5.hint');
          q('.t-book').textContent = t('d5.ledger');
          q('.t-rulesword').textContent = t('d5.rulesword');
          q('.t-rulenew').textContent = t('d5.rulenew');
          q('.t-rule1').textContent = t('d5.rule1');
          q('.t-rule2').textContent = t('d5.rule2');
          q('.t-stamp').textContent = t('d5.new');
          q('.t-discarded').textContent = t('d5.discarded');
          q('.t-foot').textContent = t('d5.never');
        }
        function setRead(stage, key) { readStage.textContent = stage || ''; readTxt.textContent = key ? t(key) : ''; }
        function clearNodes() { Object.values(nodeEls).forEach((g) => g.classList.remove('active', 'lit', 'done')); cur = null; }
        function snapArc(v) { prog.style.transition = 'none'; prog.style.strokeDashoffset = v; void prog.getBoundingClientRect(); prog.style.transition = ''; }
        function hideAll() {
          clearNodes();
          snapArc('100'); prog.classList.remove('done');
          blob.classList.remove('in', 'sent', 'validated', 'rejected', 'discard'); blobId.textContent = '';
          count.textContent = '46'; count.classList.remove('pop');
          q('[data-k="read"]').classList.remove('show', 'is-fail', 'is-grow'); setRead('', '');
          newcard.classList.add('is-hidden'); newcard.classList.remove('show', 'validated');
          reject.classList.add('is-hidden'); reject.classList.remove('show');
          const st = q('.t-stamp'); st.className = 'lstamp lstamp--new t-stamp'; st.textContent = t('d5.new');
          q('[data-k="foot"]').classList.remove('show');
        }
        return {
          read(stage, key, mod) { const r = q('[data-k="read"]'); r.classList.add('show'); r.classList.remove('is-fail', 'is-grow'); if (mod) r.classList.add(mod); setRead(stage, key); },
          enter(k, nextOff) {
            if (cur && nodeEls[cur]) { nodeEls[cur].classList.remove('active'); nodeEls[cur].classList.add('lit'); }
            nodeEls[k] && nodeEls[k].classList.add('active'); cur = k;
            if (nextOff != null) prog.style.strokeDashoffset = String(nextOff);
          },
          complete() {
            Object.values(nodeEls).forEach((g) => { g.classList.remove('active', 'lit'); g.classList.add('done'); });
            cur = null; prog.style.strokeDashoffset = '0'; prog.classList.add('done');
          },
          bloom(id) {
            blob.classList.remove('sent', 'validated', 'rejected', 'discard');
            blobId.textContent = id; void blob.getBoundingClientRect(); blob.classList.add('in');
          },
          transfer() {
            blob.classList.add('validated'); void blob.getBoundingClientRect(); blob.classList.add('sent');
            newcard.classList.remove('is-hidden'); void newcard.offsetWidth; newcard.classList.add('show');
            count.textContent = '47'; count.classList.remove('pop'); void count.getBoundingClientRect(); count.classList.add('pop');
          },
          promote() {
            newcard.classList.add('validated');
            const st = q('.t-stamp'); st.className = 'lstamp lstamp--ok t-stamp'; st.textContent = t('d5.promoted');
          },
          discard() {
            blob.classList.add('rejected'); void blob.getBoundingClientRect(); blob.classList.add('discard');
            reject.classList.remove('is-hidden'); void reject.offsetWidth; reject.classList.add('show');
          },
          cycleReset() {
            clearNodes();
            snapArc('100'); prog.classList.remove('done');
            blob.classList.remove('in', 'sent', 'validated', 'rejected', 'discard'); blobId.textContent = '';
            reject.classList.add('is-hidden'); reject.classList.remove('show');
            q('[data-k="foot"]').classList.remove('show');
          },
          show(k) { const n = q('[data-k="' + k + '"]'); n && n.classList.add('show'); },
          reset() { paint(); hideAll(); },
        };
      },
      duration: 14000,
      steps: [
        { at: 300,   run: (c) => c.read('run', 'd5.run', 'is-fail') },
        { at: 1000,  run: (c) => { c.enter('lab', 75); c.read('labeler', 'd5.lab'); } },
        { at: 1950,  run: (c) => { c.enter('ora', 50); c.read('oracle', 'd5.ora'); } },
        { at: 2900,  run: (c) => { c.enter('ref', 25); c.read('reflector', 'd5.ref'); } },
        { at: 3850,  run: (c) => { c.enter('dis', 0); c.read('distiller', 'd5.dis'); } },
        { at: 4800,  run: (c) => { c.complete(); c.bloom('R-047'); c.read('distill', 'd5.loopmsg', 'is-grow'); } },
        { at: 5650,  run: (c) => { c.transfer(); c.read('attribution', 'd5.attrib', 'is-grow'); } },
        { at: 6450,  run: (c) => c.promote() },
        { at: 7450,  run: (c) => { c.cycleReset(); c.read('run', 'd5.run2', 'is-fail'); } },
        { at: 8150,  run: (c) => { c.enter('lab', 75); c.read('labeler', 'd5.lab2'); } },
        { at: 9050,  run: (c) => { c.enter('ora', 50); c.read('oracle', 'd5.ora2'); } },
        { at: 9950,  run: (c) => { c.enter('ref', 25); c.read('reflector', 'd5.ref2'); } },
        { at: 10850, run: (c) => { c.enter('dis', 0); c.read('distiller', 'd5.dis2'); } },
        { at: 11800, run: (c) => { c.complete(); c.bloom('R-048'); c.read('candidate', 'd5.candidate', 'is-grow'); } },
        { at: 12650, run: (c) => { c.discard(); c.read('discard', 'd5.discard', 'is-fail'); } },
        { at: 13450, run: (c) => c.show('foot') },
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
          var wrap = el('div');
          var term = Terminal(repo + ' · dev');
          var gh1 = GHCard(), gh2 = GHCard();
          var dashLink = el('a', 'engine__dash');
          dashLink.href = '/dashboard?run=r-live';
          dashLink.innerHTML = window.PUI.ic('external-link') + '<span>' + t('eng.report') + '</span>';
          [term.el, gh1.el, gh2.el, dashLink].forEach(function (e) { wrap.appendChild(e); });
          root.innerHTML = ''; root.appendChild(wrap);
          rail.reset();
          return { term: term, gh1: gh1, gh2: gh2, dashLink: dashLink, reset: function () { term.reset(); gh1.reset(); gh2.reset(); rail.reset(); dashLink.classList.remove('show'); } };
        },
        duration: 6800,
        steps: [
          { at: 100, run: function (c) { rail.set('gate', 'active'); c.term.line('$', 'panchito qa ' + repo + ' · ' + scope); } },
          { at: 600, run: function (c) { rail.set('gate', 'done'); rail.set('classify', 'active'); c.term.line('›', opts.full ? 'auditing whole repo · 6 flows' : 'analyzing ' + opts.depth + ' commits · 2 with logic changes', 'is-info'); } },
          { at: 1500, run: function (c) { rail.set('classify', 'done'); rail.set('generate', 'active'); c.term.line('›', 'blast radius · 3 routes · 1 cross-repo (payments→checkout)', 'is-mut'); } },
          { at: 2300, run: function (c) { c.term.line('›', 'generate · wrote 3 specs'); rail.set('generate', 'done'); rail.set('review', 'active'); } },
          { at: 3000, run: function (c) { c.term.line('›', 'qa-reviewer · approved 3/3', 'is-pass'); rail.set('review', 'done'); rail.set('coverage', 'active'); } },
          { at: 3600, run: function (c) { c.term.line('›', 'change-coverage · 11/11 changed lines', 'is-pass'); rail.set('coverage', 'done'); rail.set('execute', 'active'); } },
          { at: 4200, run: function (c) { c.term.line('›', 'running against dev · ' + (repo.split('/')[1] || 'app'), 'is-mut'); } },
          { at: 4900, run: function (c) { c.term.line('~', '3 specs · 2 passed · 1 failed', 'is-warn'); } },
          { at: 5400, run: function (c) { rail.set('execute', 'done'); rail.set('decide', 'active'); } },
          { at: 5800, run: function (c) { c.gh1.show('pr', 'Add E2E: 2 green flows', { branch: 'qa/e2e-batch', base: 'main' }); } },
          { at: 6100, run: function (c) { c.gh2.show('issue', 'Refund flow: total mismatch on partial refund'); rail.set('decide', 'done'); } },
          { at: 6500, run: function (c) { c.dashLink.classList.add('show'); } },
        ],
      };
    };
  }

  /* ── HERO micro-demo · a director-managed player like the demos ── */
  function heroLoop(body, opts) {
    opts = opts || {};
    var reduce = window.PUI.reduce;

    function lineEl(g, txt, cls) {
      var l = el('div', 'term__line' + (cls ? ' ' + cls : ''));
      l.innerHTML = '<span class="g">' + g + '</span><span>' + txt + '</span>';
      l.style.fontFamily = 'var(--font-mono)'; l.style.fontSize = '12px'; l.style.lineHeight = '1.9';
      return l;
    }
    function prCard() {
      var card = el('div', 'ghcard ghcard--pr');
      card.style.margin = '12px 0 0';
      card.innerHTML = '<div class="ghcard__head">' + window.PUI.ic('git-pull-request', 'class="ghcard__icon"') + '<span class="ghcard__title">' + t('hero.pr') + '</span></div><div class="ghcard__meta"><span class="ghcard__automerge">' + window.PUI.ic('check', 'style="width:13px;height:13px"') + ' ' + t('hero.prsub') + '</span></div>';
      return card;
    }
    function append(node, reveal) {
      body.appendChild(node);
      if (reveal) setTimeout(function () { node.classList.add(reveal); }, 30);
      window.PUI.refreshIcons();
    }

    var timers = [];
    var playing = false;
    var finished = false;
    function clearTimers() { timers.forEach(clearTimeout); timers = []; playing = false; }
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };

    function build(animated) {
      body.innerHTML = '';
      append(lineEl('$', t('hero.cmd'), 'is-mut'), animated ? 'in' : null);
      if (!animated) {
        append(lineEl('›', t('hero.classify'), 'is-info'), null);
        append(lineEl('›', t('hero.generate'), 'is-mut'), null);
        append(lineEl('✓', t('hero.validate'), 'is-pass'), null);
        append(lineEl('✗', t('hero.execute'), 'is-fail'), null);
        append(lineEl('', t('hero.verdict'), 'is-fail'), null);
        var c = prCard(); c.classList.add('show'); append(c, null);
        body.querySelectorAll('.term__line').forEach(function (l) { l.classList.add('in'); });
        return;
      }
      playing = true;
      at(950,  function () { append(lineEl('›', t('hero.classify'), 'is-info'), 'in'); });
      at(1900, function () { append(lineEl('›', t('hero.generate'), 'is-mut'), 'in'); });
      at(2950, function () { append(lineEl('✓', t('hero.validate'), 'is-pass'), 'in'); });
      at(4000, function () { append(lineEl('✗', t('hero.execute'), 'is-fail'), 'in'); });
      at(5050, function () { append(lineEl('', t('hero.verdict'), 'is-fail'), 'in'); });
      at(6100, function () { append(prCard(), 'show'); });
      at(8600, function () { playing = false; finished = true; });
    }

    function start() {
      clearTimers(); finished = false;
      if (reduce) { build(false); finished = true; return; }
      build(true);
    }
    function pause() { clearTimers(); }
    function reset() { clearTimers(); body.innerHTML = ''; body.style.opacity = '1'; finished = false; }

    var player = { region: opts.region || body, start: start, pause: pause, reset: reset, isFinished: function () { return finished; } };
    if (opts.autoRegister !== false) window.AnimationDirector.register(player);
    return player;
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

  window.LandingScenarios = { demo1, demo2, demo3, demo4, demo5, makeEngine, heroLoop, COMPARE };
})();
