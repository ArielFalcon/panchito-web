/* ═══════════════════════════════════════════════════════════════════════
   panchito console — vanilla render of the QA control panel.
   Reads window.PanchitoData (mock for now; swap for a real API later) and
   renders runs, results, apps, suite and memory into #app. Deep-linkable via
   ?run=<id> so the live engine can open a result directly.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  const D = window.PanchitoData;
  const root = document.getElementById('app');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ic = (n, cls) => `<i data-lucide="${n}"${cls ? ' class="' + cls + '"' : ''}></i>`;
  const refreshIcons = () => { try { window.lucide && lucide.createIcons(); } catch (e) {} };

  const NAV = [
    { id: 'runs', label: 'Runs', icon: 'activity' },
    { id: 'suite', label: 'Suite', icon: 'list-checks' },
    { id: 'memory', label: 'Memory', icon: 'database' },
    { id: 'apps', label: 'Apps', icon: 'boxes' },
  ];
  const TITLES = {
    runs: ['Runs', 'pipeline · all repos'],
    suite: ['Suite', 'committed e2e specs'],
    memory: ['Memory', 'engram · persistent context'],
    apps: ['Apps', 'watched repositories'],
  };
  const STAGE_IC = { done: 'check', fail: 'x', flaky: 'rotate-cw', infra: 'unplug', skip: 'minus' };
  const VLABEL = { pass: 'pass', fail: 'fail', flaky: 'flaky', skipped: 'skipped', 'infra-error': 'infra' };
  const LOG_CLS = { '✓': 'ok', '✗': 'bad', '~': 'warn', '!': 'info' };

  const state = { section: 'runs', runId: null, dialog: false, dialogApp: D.apps[0].name, dialogMode: 'diff', toast: null };
  let toastTimer = 0;

  /* ── components ──────────────────────────────────────────────────────── */
  const vtag = (v, opts) => {
    const o = opts || {};
    const label = o.label || VLABEL[v] || v;
    return `<span class="vtag ${esc(v)}${o.sm ? ' vtag--sm' : ''}${o.nodot ? ' vtag--nodot' : ''}"><span class="dot"></span>${esc(label)}</span>`;
  };
  const card = ({ eyebrow, title, action, body, foot }) => `
    <div class="dcard">
      <div class="dcard__head">
        <div>${eyebrow ? `<div class="dcard__eyebrow">${esc(eyebrow)}</div>` : ''}<div class="dcard__title">${esc(title)}</div></div>
        ${action ? `<div>${action}</div>` : ''}
      </div>
      <div class="dcard__body">${body}</div>
      ${foot ? `<div class="dcard__foot">${foot}</div>` : ''}
    </div>`;
  const stepper = (stages) => `<div class="stepper">${stages.map(([name, st], i) =>
    `<span class="stepper__stage ${st}">${ic(STAGE_IC[st] || 'minus')}<span>${esc(name)}</span></span>${i < stages.length - 1 ? '<span class="stepper__sep"></span>' : ''}`
  ).join('')}</div>`;
  const terminal = (lines) => `<div class="dterm pa-dot-bg">${lines.map(([g, txt]) =>
    `<div class="dterm__line"><span class="dterm__g ${LOG_CLS[g] || ''}">${esc(g)}</span>${esc(txt)}</div>`
  ).join('')}</div>`;
  const stat = (label, value, sub) => `<div class="stat"><span class="stat__label">${esc(label)}</span><span class="stat__value">${esc(value)}</span><span class="stat__sub">${esc(sub)}</span></div>`;

  /* ── views ───────────────────────────────────────────────────────────── */
  function runsFeed() {
    const s = D.stats;
    return `<div class="view">
      <div class="stats">
        ${stat('Runs · 7d', s.runs7d, 'across ' + s.watching + ' repos')}
        ${stat('Pass rate', Math.round(s.passRate * 100) + '%', 'green + approved')}
        ${stat('Specs added', '+' + s.specsAdded, 'merged to suites')}
        ${stat('Open issues', s.openIssues, 'awaiting fix')}
      </div>
      <div class="feed">
        <div class="feed__head"><span class="col-verdict">verdict</span><span class="col-app">app</span><span class="col-commit">commit</span><span class="col-mode">mode</span><span class="col-specs">specs</span><span class="col-when">when</span></div>
        ${D.runs.map((r) => `<button class="feed__row" data-action="open" data-id="${esc(r.id)}">
          <span class="col-verdict">${vtag(r.verdict, { sm: true })}</span>
          <span class="col-app">${esc(r.app)}</span>
          <span class="col-commit"><span class="sha">${esc(r.sha)}</span><span class="msg">${esc(r.message)}</span></span>
          <span class="col-mode">${esc(r.mode)}</span>
          <span class="col-specs${r.specs ? '' : ' none'}">${r.specs ? '+' + r.specs : '—'}</span>
          <span class="col-when">${esc(r.time)}</span>
        </button>`).join('')}
      </div>
    </div>`;
  }

  function runDetail(r) {
    const tone = r.verdict === 'pass' ? 'tip' : r.verdict === 'fail' ? 'warning' : 'note';
    const specs = r.newSpecs.length === 0
      ? `<span style="font-family:var(--font-mono);font-size:12.5px;color:var(--text-faint)">no specs written — valid no-op</span>`
      : r.newSpecs.map((sp) => `<div class="filerow">${vtag(sp.status, { sm: true, nodot: true })}<span class="grow">${esc(sp.file)}</span><span class="n">${sp.n} test${sp.n > 1 ? 's' : ''}</span></div>`).join('');
    return `<div class="view view--detail">
      <button class="back" data-action="back">${ic('arrow-left')} all runs</button>
      <div class="det__head">
        <div class="det__meta">
          <div class="det__line">${vtag(r.verdict)}<span class="det__sha">${esc(r.sha)}</span><span class="det__ctx">${esc(r.app)} · ${esc(r.branch)} · ${esc(r.mode)}</span></div>
          <h2 class="det__title">${esc(r.message)}</h2>
          <span class="det__by">by ${esc(r.author)} · ${esc(r.time)} · ${esc(r.duration)}</span>
        </div>
        <button class="dbtn dbtn--secondary dbtn--sm" data-action="trigger">${ic('rotate-cw')} Re-run</button>
      </div>
      ${card({ eyebrow: 'pipeline', title: 'Run stages', body: stepper(r.stages) })}
      <div class="det__cols">
        ${card({ eyebrow: 'blast radius', title: 'Changed files', body: r.changed.map((f) => `<div class="filerow">${ic('file-code-2')}<span class="grow">${esc(f)}</span></div>`).join('') })}
        ${card({ eyebrow: 'generation', title: 'Generated specs', action: `<span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">reviewer ${esc(r.reviewer)}</span>`, body: specs })}
      </div>
      <div class="callout callout--${tone}"><div class="callout__label">decision · ${esc(r.verdict)}</div><div class="callout__body">${esc(r.decision)}</div></div>
      <div style="display:flex;flex-direction:column;gap:var(--space-2)"><span class="pa-eyebrow">run log</span>${terminal(r.log)}</div>
    </div>`;
  }

  function appsView() {
    return `<div class="view"><div class="apps">
      ${D.apps.map((a) => card({
        eyebrow: a.stack, title: a.name,
        action: a.shadow ? vtag('skipped', { sm: true, nodot: true, label: 'shadow' }) : vtag('pass', { sm: true, nodot: true, label: 'live' }),
        body: `<div style="display:flex;flex-direction:column;gap:9px">
          <div class="kv"><span class="k">baseBranch</span><span class="v">main</span></div>
          <div class="kv"><span class="k">dev.baseUrl</span><span class="v">dev.${esc(a.name)}.internal</span></div>
          <div class="kv"><span class="k">onFailure</span><span class="v">github-issue</span></div></div>`,
        foot: `<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">${esc(a.repo)}</span><button class="dbtn dbtn--ghost dbtn--sm" data-action="trigger">Run</button></div>`,
      })).join('')}
      <button class="app-onboard" data-action="trigger">${ic('plus')}<span class="lbl">onboard a repo</span><span class="sub">config/apps/&lt;name&gt;.yaml</span></button>
    </div></div>`;
  }

  function suiteView() {
    const specs = [
      ['e2e/map/cluster-pins.spec.ts', 'web-app', 'pass', 3],
      ['e2e/map/zoom-bounds.spec.ts', 'web-app', 'pass', 1],
      ['e2e/profile/edit.spec.ts', 'web-app', 'pass', 3],
      ['e2e/search/filters.spec.ts', 'web-app', 'pass', 4],
      ['e2e/auth/token-refresh.spec.ts', 'web-app', 'flaky', 1],
      ['e2e/cart/negative-qty.spec.ts', 'checkout-api', 'fail', 2],
      ['e2e/cart/coupon.spec.ts', 'checkout-api', 'pass', 5],
    ];
    return `<div class="view"><div class="suite">${specs.map(([f, app, st, n]) =>
      `<div class="suite__row">${vtag(st, { sm: true, nodot: true })}${ic('file-code-2')}<span class="file">${esc(f)}</span><span class="app">${esc(app)}</span><span class="n">${n} test${n > 1 ? 's' : ''}</span></div>`
    ).join('')}</div></div>`;
  }

  function memoryView() {
    const notes = [
      ['web-app', 'Login form posts to Keycloak; wait for redirect to /dashboard before asserting.'],
      ['web-app', 'Map tiles lazy-load — assert pins after networkidle, not on load.'],
      ['checkout-api', 'Cart totals round half-up; expect "12.35" not "12.345".'],
    ];
    return `<div class="view">
      <div style="display:flex;align-items:center;gap:8px">${ic('database')}<span class="pa-eyebrow">engram · episodic memory · persisted across runs</span></div>
      ${notes.map(([app, txt]) => `<div class="note"><span class="app">${esc(app)}</span><span class="txt">${esc(txt)}</span></div>`).join('')}
    </div>`;
  }

  /* ── shell ───────────────────────────────────────────────────────────── */
  function dialog() {
    if (!state.dialog) return '';
    const modes = ['diff', 'complete', 'exhaustive', 'manual'];
    return `<div class="dialog-bg" data-action="dialog-bg">
      <div class="dialog">
        <div class="dialog__head"><div><span class="pa-eyebrow">manual trigger</span><h3 class="dialog__title">Run QA</h3></div>
          <button class="dialog__x" data-action="dialog-close">${ic('x')}</button></div>
        <div class="dialog__body">
          <div style="display:flex;flex-direction:column;gap:6px"><span class="pa-eyebrow">app</span>
            <div class="chipset">${D.apps.map((a) => `<button class="chip-opt${a.name === state.dialogApp ? ' is-on' : ''}" data-action="dialog-app" data-id="${esc(a.name)}">${esc(a.name)}</button>`).join('')}</div></div>
          <div style="display:flex;flex-direction:column;gap:6px"><span class="pa-eyebrow">commit SHA</span>
            <div class="dinput">${ic('git-commit-horizontal')}<input type="text" placeholder="HEAD" spellcheck="false"></div></div>
          <div style="display:flex;flex-direction:column;gap:6px"><span class="pa-eyebrow">mode</span>
            <div class="chipset">${modes.map((m) => `<button class="chip-opt mode${m === state.dialogMode ? ' is-on' : ''}" data-action="dialog-mode" data-id="${m}">${m}</button>`).join('')}</div></div>
        </div>
        <div class="dialog__foot"><button class="dbtn dbtn--ghost" data-action="dialog-close">Cancel</button>
          <button class="dbtn dbtn--primary" data-action="dialog-submit">${ic('play')} Run ${esc(state.dialogApp)}</button></div>
      </div>
    </div>`;
  }

  function render() {
    const openRun = state.runId ? D.runs.find((r) => r.id === state.runId) : null;
    let main;
    if (openRun) main = runDetail(openRun);
    else if (state.section === 'apps') main = appsView();
    else if (state.section === 'suite') main = suiteView();
    else if (state.section === 'memory') main = memoryView();
    else main = runsFeed();
    const [title, sub] = openRun ? ['Run ' + openRun.id, 'pipeline · ' + openRun.app] : TITLES[state.section];

    root.innerHTML = `
      <div class="dash">
        <aside class="dash__side">
          <a class="side__brand" href="/"><img src="/assets/panchito-mark.svg" alt=""><span class="side__word">Panchito</span></a>
          <nav class="side__nav" id="side-nav">
            ${NAV.map((n) => `<button class="side__link${!openRun && n.id === state.section ? ' is-active' : ''}" data-action="nav" data-id="${n.id}">${ic(n.icon)}${n.label}</button>`).join('')}
          </nav>
          <button class="side__burger" id="side-burger" aria-label="Menu">${ic('menu')}</button>
          <div class="side__watch">
            <div class="side__watch-h">Watching ${D.apps.length}</div>
            ${D.apps.map((a) => `<div class="side__app"><span class="dot${a.shadow ? ' shadow' : ''}"></span><span class="name">${esc(a.name)}</span>${a.shadow ? '<span class="tag">shadow</span>' : ''}</div>`).join('')}
            <a class="side__home" href="/">${ic('arrow-left')} back to site</a>
          </div>
        </aside>
        <div class="dash__main">
          <header class="top">
            <div><div class="top__eyebrow">${esc(sub)}</div><h1 class="top__title">${esc(title)}</h1></div>
            <button class="dbtn dbtn--primary" data-action="trigger">${ic('play')} Trigger run</button>
          </header>
          <div class="dash__body">${main}</div>
        </div>
      </div>
      ${dialog()}
      ${state.toast ? `<div class="toast">${ic('check')}${esc(state.toast)}</div>` : ''}`;
    refreshIcons();
  }

  /* ── routing + events ────────────────────────────────────────────────── */
  function syncFromUrl() {
    const params = new URLSearchParams(location.search);
    const run = params.get('run');
    const hash = (location.hash || '').replace('#', '');
    if (run && D.runs.some((r) => r.id === run)) { state.runId = run; state.section = 'runs'; }
    else { state.runId = null; state.section = TITLES[hash] ? hash : 'runs'; }
  }
  function openRun(id) {
    state.runId = id;
    history.pushState({ run: id }, '', '?run=' + encodeURIComponent(id));
    render();
  }
  function go(section) {
    state.section = section; state.runId = null;
    history.pushState({ section }, '', '#' + section);
    render();
  }
  function back() { history.back(); }
  function showToast(msg) {
    state.toast = msg; render();
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { state.toast = null; render(); }, 2600);
  }

  root.addEventListener('click', (e) => {
    // hamburger toggle
    if (e.target.closest('#side-burger')) {
      var nav = document.getElementById('side-nav');
      if (nav) nav.classList.toggle('is-open');
      return;
    }
    var el = e.target.closest('[data-action]');
    if (!el) {
      var nav2 = document.getElementById('side-nav');
      var burger = document.getElementById('side-burger');
      if (nav2 && nav2.classList.contains('is-open') && burger && !burger.contains(e.target)) {
        nav2.classList.remove('is-open');
      }
      return;
    }
    var action = el.dataset.action, id = el.dataset.id;
    if (action === 'open') openRun(id);
    else if (action === 'nav') go(id);
    else if (action === 'back') back();
    else if (action === 'trigger') { state.dialog = true; render(); }
    else if (action === 'dialog-bg') { if (e.target.classList && e.target.classList.contains('dialog-bg')) { state.dialog = false; render(); } }
    else if (action === 'dialog-close') { state.dialog = false; render(); }
    else if (action === 'dialog-app') { state.dialogApp = id; render(); }
    else if (action === 'dialog-mode') { state.dialogMode = id; render(); }
    else if (action === 'dialog-submit') { const a = state.dialogApp, m = state.dialogMode; state.dialog = false; showToast(`queued ${a} · ${m} mode`); }
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.dialog) { state.dialog = false; render(); } });
  window.addEventListener('popstate', () => { syncFromUrl(); render(); });

  syncFromUrl();
  render();
})();
