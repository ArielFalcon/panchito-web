/* ═══════════════════════════════════════════════════════════════════════
   Panchito landing — shared scenario player + renderer factories.
   One timeline runtime drives every demo AND the engine. Renderers are dumb
   DOM builders returning a control API; scenarios script them via timed steps.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const ic = (n, attrs) => `<i data-lucide="${n}"${attrs ? ' ' + attrs : ''}></i>`;
  const refreshIcons = () => { try { window.lucide && lucide.createIcons(); } catch (e) {} };

  /* ── createPlayer ──────────────────────────────────────────────────────
     scenario = { mount(root)->ctx, steps:[{at, run(ctx)}], duration }
     Plays ONCE each time the stage enters the viewport. When it fully leaves
     and returns, it resets and plays again. Visibility is rect-driven (scroll
     + resize) so it works even where IntersectionObserver is unavailable.    */
  function createPlayer(root, scenario, opts = {}) {
    let ctx = null, timers = [], playing = false, finished = false, onscreen = false;

    function ensureMount() { if (!ctx) { root.innerHTML = ''; ctx = scenario.mount(root); if (ctx.reset) ctx.reset(); refreshIcons(); } }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function lastAt() { return scenario.steps.reduce((m, s) => Math.max(m, s.at), 0); }

    function runCycle() {
      ensureMount();
      if (playing) return;
      playing = true; finished = false;
      root.classList.remove('stage-fade');
      if (ctx.reset) ctx.reset();
      scenario.steps.forEach((s) => { timers.push(setTimeout(() => { s.run(ctx); refreshIcons(); }, s.at)); });
      const total = (scenario.duration || lastAt()) + 80;
      timers.push(setTimeout(() => { playing = false; finished = true; opts.onDone && opts.onDone(); }, total));
    }

    function restart() { clearTimers(); playing = false; finished = false; ensureMount(); root.classList.remove('stage-fade'); if (ctx && ctx.reset) ctx.reset(); if (reduce) return seekToEnd(); runCycle(); }
    function play() { if (!playing && !finished) restart(); }   // one play until reset
    function pause() { clearTimers(); playing = false; }
    function reset() { clearTimers(); playing = false; finished = false; if (ctx && ctx.reset) ctx.reset(); }
    function seekToEnd() {
      ensureMount(); clearTimers(); playing = false; finished = true;
      if (ctx.reset) ctx.reset();
      scenario.steps.forEach((s) => s.run(ctx));
      refreshIcons(); opts.onDone && opts.onDone();
    }

    function inView() {
      const r = root.getBoundingClientRect();
      const h = window.innerHeight || document.documentElement.clientHeight;
      return r.top < h * 0.8 && r.bottom > h * 0.2;     // a solid band on screen
    }
    function fullyOut() {
      const r = root.getBoundingClientRect();
      const h = window.innerHeight || document.documentElement.clientHeight;
      return r.bottom <= 0 || r.top >= h;                // completely off screen
    }
    function check() {
      if (!onscreen && inView()) { onscreen = true; play(); }   // entered → play once
      else if (onscreen && fullyOut()) { onscreen = false; pause(); reset(); }  // left fully → arm replay
    }

    if (opts.eager !== false) ensureMount();
    if (opts.autoplayOnVisible !== false) {
      let raf = 0;
      const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; check(); }); };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      requestAnimationFrame(check);
      setTimeout(check, 400);
      window.addEventListener('load', () => setTimeout(check, 60));
    }
    return { play, pause, restart, seekToEnd, get done() { return finished; } };
  }

  /* ── PipelineRail ─────────────────────────────────────────────────────── */
  const RAIL_STAGES = ['gate', 'classify', 'generate', 'review', 'coverage', 'execute', 'decide'];
  function Rail(stages) {
    stages = stages || RAIL_STAGES;
    const wrap = el('div', 'rail');
    const map = {};
    stages.forEach((name, i) => {
      const s = el('div', 'rail__stage');
      s.innerHTML = `<span class="rdot"></span>${name}`;
      map[name] = s; wrap.appendChild(s);
      if (i < stages.length - 1) wrap.appendChild(el('span', 'rail__sep'));
    });
    return {
      el: wrap,
      set(name, state) { const s = map[name]; if (!s) return; s.classList.remove('is-active', 'is-done', 'is-fail'); if (state) s.classList.add('is-' + state); },
      reset() { Object.values(map).forEach((s) => s.classList.remove('is-active', 'is-done', 'is-fail')); },
    };
  }

  /* ── Terminal ─────────────────────────────────────────────────────────── */
  function Terminal(title) {
    const wrap = el('div', 'term');
    wrap.innerHTML = `<div class="term__head"><span class="dot3"><i></i><i></i><i></i></span><span class="term__title">${title || 'panchito · run'}</span></div>`;
    const body = el('div', 'term__body'); wrap.appendChild(body);
    let t0 = Date.now();
    function ts() { const s = ((Date.now() - t0) / 1000).toFixed(1); return s.padStart(4, '0'); }
    return {
      el: wrap,
      line(g, text, cls) {
        const ln = el('div', 'term__line' + (cls ? ' ' + cls : ''));
        ln.innerHTML = `<span class="ts">${ts()}s</span><span class="g">${g || ''}</span><span class="txt">${text}</span>`;
        body.appendChild(ln); body.scrollTop = body.scrollHeight;
        setTimeout(() => ln.classList.add('in'), 16);
        return ln;
      },
      reset() { body.innerHTML = ''; t0 = Date.now(); },
    };
  }

  /* ── CodeDiff (typing + coverage glow) ────────────────────────────────── */
  function CodeDiff(lines) {
    const wrap = el('div', 'code');
    const rows = lines.map((ln, i) => {
      const row = el('div', 'code__line');
      row.innerHTML = `<span class="ln">${i + 1}</span><span class="src"></span>`;
      wrap.appendChild(row);
      return { row, src: row.querySelector('.src'), full: ln, glowable: /assert|expect|toHave|discount|coupon/i.test(ln) };
    });
    return {
      el: wrap,
      typeAll(done) {
        let i = 0;
        const step = () => {
          if (i >= rows.length) { done && done(); return; }
          const r = rows[i];
          r.src.innerHTML = highlight(r.full);
          r.row.classList.add('typed'); i++;
          setTimeout(step, 95);
        };
        step();
      },
      showAll() { rows.forEach((r) => r.src.innerHTML = highlight(r.full)); },
      glow(idxs) { rows.forEach((r, i) => { if (idxs.includes(i + 1)) r.row.classList.add('glow'); }); },
      reset() { rows.forEach((r) => { r.src.textContent = ''; r.row.classList.remove('glow', 'typed'); }); },
    };
  }
  function highlight(s) {
    // Stash string literals FIRST so the keyword/fn passes can't match (and
    // break) the quotes in the class attributes they inject. Restore last.
    const strings = [];
    s = s.replace(/('[^']*'|"[^"]*"|`[^`]*`)/g, (m) => { strings.push(m); return ' ' + (strings.length - 1) + ' '; });
    s = s
      .replace(/\b(await|const|async|import|from|export)\b/g, '<span class="code__kw">$1</span>')
      .replace(/\b(test|expect|click|fill|goto|locator|getByTestId|toBeVisible|toHaveText)\b/g, '<span class="code__fn">$1</span>');
    return s.replace(/ (\d+) /g, (_, i) => '<span class="code__str">' + strings[+i] + '</span>');
  }

  /* ── ReviewVerdict ────────────────────────────────────────────────────── */
  function Verdict() {
    const v = el('div', 'verdict');
    v.innerHTML = `<div class="verdict__top"><span class="verdict__model">qa-reviewer · qwen3.7-max</span><span class="vtag"></span></div><div class="verdict__reason"></div>`;
    const tag = v.querySelector('.vtag'), reason = v.querySelector('.verdict__reason');
    return {
      el: v,
      show(ok, reasonText) {
        v.classList.add('show');
        tag.className = 'vtag vtag--nodot ' + (ok ? 'vtag--pass' : 'vtag--fail');
        tag.textContent = ok ? 'approved' : 'rejected';
        reason.innerHTML = `<span class="k">reason:</span> ${reasonText}`;
      },
      hide() { v.classList.remove('show'); },
      reset() { v.classList.remove('show'); reason.innerHTML = ''; tag.textContent = ''; },
    };
  }

  /* ── HumanError callout ───────────────────────────────────────────────── */
  function HumanError() {
    const w = el('div', 'humanerr');
    w.innerHTML = `<div class="humanerr__label">${window.t('d2.tag') ? 'plain language' : 'plain language'}</div><div class="humanerr__text"></div>`;
    return { el: w, show(text) { w.querySelector('.humanerr__text').textContent = text; w.classList.add('show'); }, reset() { w.classList.remove('show'); } };
  }

  /* ── PR / Issue card ──────────────────────────────────────────────────── */
  function GHCard() {
    const w = el('div', 'ghcard');
    return {
      el: w,
      show(kind, title, opts2 = {}) {
        w.className = 'ghcard ghcard--' + (kind === 'pr' ? 'pr' : 'issue');
        const meta = kind === 'pr'
          ? `<span class="ghcard__branch">qa/${opts2.branch || 'e2e-coupon'}</span><span>→ ${opts2.base || 'main'}</span><span class="ghcard__automerge">${ic('check', 'style="width:13px;height:13px"')} auto-merge</span>`
          : `<span class="vtag vtag--nodot vtag--fail">issue</span><span>${opts2.sub || 'sanitized logs attached'}</span>`;
        w.innerHTML = `<div class="ghcard__head">${ic(kind === 'pr' ? 'git-pull-request' : 'circle-dot', 'class="ghcard__icon"')}<span class="ghcard__title">${title}</span></div><div class="ghcard__meta">${meta}</div>`;
        setTimeout(() => w.classList.add('show'), 16);
        refreshIcons();
      },
      reset() { w.className = 'ghcard'; w.innerHTML = ''; },
    };
  }

  /* ── ChatPanel (multi-channel: terminal / slack / telegram) ──────────── */
  const CHANNELS = {
    terminal: { icon: 'terminal', label: 'terminal', ctx: 'panchito · CLI', ph: 'panchito ❯ ask anything', tui: true },
    slack:    { icon: 'slack',    label: 'slack',    ctx: 'Slack · #qa-bots', ph: 'Message #qa-bots' },
    telegram: { icon: 'send',     label: 'telegram', ctx: 'Telegram · @panchito_bot', ph: 'Message panchito' },
  };
  function ChatPanel(opts = {}) {
    const wrap = el('div', 'chatpanel');
    wrap.innerHTML = `
      <div class="chatpanel__head">
        <div class="chatpanel__avatar"><img src="/assets/panchito-mark.svg" alt=""></div>
        <div class="chatpanel__id">
          <span class="chatpanel__name">panchito</span>
          <span class="chatpanel__ctx"><span class="dot"></span><span class="ctxlabel"></span></span>
        </div>
        <div class="chatpanel__switch">
          ${Object.keys(CHANNELS).map((k) => `<button data-ch="${k}" type="button">${ic(CHANNELS[k].icon)}<span class="chsw__l">${CHANNELS[k].label}</span></button>`).join('')}
        </div>
      </div>
      <div class="chatpanel__thread"></div>
      <div class="chatpanel__actions"></div>
      <div class="composer">
        <div class="composer__box"><span class="composer__ph"></span></div>
        <div class="composer__send">${ic('arrow-up')}</div>
      </div>`;
    const thread = wrap.querySelector('.chatpanel__thread');
    const actions = wrap.querySelector('.chatpanel__actions');
    const ctxLabel = wrap.querySelector('.ctxlabel');
    const phEl = wrap.querySelector('.composer__ph');
    const switchBtns = wrap.querySelectorAll('.chatpanel__switch button');
    let typingEl = null;
    function setChannel(key) {
      const ch = CHANNELS[key]; if (!ch) return;
      ctxLabel.textContent = ch.ctx;
      phEl.textContent = ch.ph;
      thread.className = 'chatpanel__thread' + (ch.tui ? ' thread--terminal' : '');
      switchBtns.forEach((b) => b.classList.toggle('is-on', b.dataset.ch === key));
    }
    // Clickable channel tabs (interactive mode)
    switchBtns.forEach((b) => b.addEventListener('click', () => opts.onChannel && opts.onChannel(b.dataset.ch)));
    const avatarBot = '<span class="msg__av msg__av--bot"><img src="/assets/panchito-mark.svg" alt=""></span>';
    const avatarUser = (who) => `<span class="msg__av msg__av--user">${who || 'me'}</span>`;
    return {
      el: wrap,
      setChannel,
      clearThread() { thread.innerHTML = ''; actions.innerHTML = ''; typingEl = null; },
      // Slow, appreciable cross-fade between channels. cb runs once content is cleared.
      crossfade(key, cb) {
        thread.style.transition = 'opacity 0.34s var(--ease)';
        actions.style.transition = 'opacity 0.34s var(--ease)';
        thread.style.opacity = '0'; actions.style.opacity = '0';
        setTimeout(() => {
          thread.innerHTML = ''; actions.innerHTML = ''; typingEl = null;
          setChannel(key);
          thread.style.opacity = '1'; actions.style.opacity = '1';
          cb && cb();
        }, 360);
      },
      user(text, who, time) {
        const m = el('div', 'msg msg--out');
        m.innerHTML = `${avatarUser(who)}<div><div class="msg__bubble">${text}</div></div>`;
        thread.appendChild(m); thread.scrollTop = thread.scrollHeight;
        setTimeout(() => m.classList.add('in'), 16);
      },
      bot(html, time) {
        const m = el('div', 'msg msg--in');
        m.innerHTML = `${avatarBot}<div><div class="msg__bubble">${html}${time ? `<span class="msg__time">${time}</span>` : ''}</div></div>`;
        thread.appendChild(m); thread.scrollTop = thread.scrollHeight;
        setTimeout(() => m.classList.add('in'), 16);
      },
      tui(prompt, out, cls) {
        const l = el('div', 'tui');
        l.innerHTML = prompt != null ? `<span class="p">❯</span><span>${prompt}</span>` : `<span class="p"> </span><span class="${cls || 'out'}">${out}</span>`;
        thread.appendChild(l); thread.scrollTop = thread.scrollHeight;
        setTimeout(() => l.classList.add('in'), 16);
      },
      typing(on) {
        if (on) { typingEl = el('div', 'typing', '<i></i><i></i><i></i>'); thread.appendChild(typingEl); thread.scrollTop = thread.scrollHeight; }
        else if (typingEl) { typingEl.remove(); typingEl = null; }
      },
      recall(text) {
        const r = el('div', 'recall', `${ic('database')}<span>${text}</span>`);
        thread.appendChild(r); refreshIcons(); setTimeout(() => r.classList.add('show'), 16); thread.scrollTop = thread.scrollHeight;
        return r;
      },
      actionChips(arr) {
        actions.innerHTML = '';
        arr.forEach((a, i) => {
          const c = el('button', 'act-chip', `${ic(a.icon || 'zap')}<span>${a.label}</span>`);
          c.type = 'button';
          c.addEventListener('click', () => opts.onAction && opts.onAction(a));
          actions.appendChild(c); refreshIcons();
          setTimeout(() => c.classList.add('show'), 90 * i);
        });
      },
      hint(show) { wrap.classList.toggle('is-live', !!show); },
      reset() {
        thread.innerHTML = ''; actions.innerHTML = ''; typingEl = null;
        thread.style.opacity = '1'; actions.style.opacity = '1';
        wrap.classList.remove('is-live');
        setChannel('terminal');
      },
    };
  }

  /* ── Graph (blast radius) ─────────────────────────────────────────────── */
  function Graph(model) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'graph');
    svg.setAttribute('viewBox', '0 0 480 330');
    const elem = (t, attrs) => { const e = document.createElementNS(NS, t); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
    // clusters
    model.clusters.forEach((c) => {
      svg.appendChild(elem('rect', { class: 'gcluster', x: c.x, y: c.y, width: c.w, height: c.h, rx: 12 }));
      const lbl = elem('text', { class: 'gcluster__label', x: c.x + 8, y: c.y + 16 }); lbl.textContent = c.label; svg.appendChild(lbl);
    });
    const edgeEls = {}, labelEls = {};
    model.edges.forEach((e) => {
      const a = model.nodes.find((n) => n.id === e.from), b = model.nodes.find((n) => n.id === e.to);
      const line = elem('line', { class: 'gedge', x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      svg.appendChild(line); edgeEls[e.from + '>' + e.to] = line;
      if (e.label) { const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; const lb = elem('text', { class: 'gedge__label', x: mx, y: my - 4, 'text-anchor': 'middle' }); lb.textContent = e.label; svg.appendChild(lb); labelEls[e.from + '>' + e.to] = lb; }
    });
    const nodeEls = {};
    model.nodes.forEach((n) => {
      const g = elem('g', { class: 'gnode' });
      g.appendChild(elem('circle', { cx: n.x, cy: n.y, r: n.r || 9, fill: '#3a382f' }));
      const tx = elem('text', { class: 'gnode__label', x: n.x, y: n.y + (n.r || 9) + 12, 'text-anchor': 'middle' }); tx.textContent = n.label; g.appendChild(tx);
      svg.appendChild(g); nodeEls[n.id] = g;
    });
    return {
      el: svg,
      pulse(id) { const g = nodeEls[id]; if (!g) return; g.classList.add('changed'); const c = g.querySelector('circle'); c.animate ? c.animate([{ r: c.getAttribute('r') }, { r: (+c.getAttribute('r') + 6) }, { r: c.getAttribute('r') }], { duration: 700 }) : 0; },
      litNode(id) { nodeEls[id] && nodeEls[id].classList.add('lit'); },
      litEdge(from, to) { const e = edgeEls[from + '>' + to]; e && e.classList.add('lit'); const l = labelEls[from + '>' + to]; l && l.classList.add('show'); },
      reset() { Object.values(nodeEls).forEach((g) => g.classList.remove('lit', 'changed')); Object.values(edgeEls).forEach((e) => e.classList.remove('lit')); Object.values(labelEls).forEach((l) => l.classList.remove('show')); },
    };
  }

  /* ── Plan list ────────────────────────────────────────────────────────── */
  function Plan(title) {
    const w = el('div', 'plan');
    w.innerHTML = `<div class="plan__title">${title}</div>`;
    return {
      el: w,
      add(text) { const i = el('div', 'plan__item', `<span class="pdot"></span>${text}`); w.appendChild(i); setTimeout(() => i.classList.add('show'), 16); },
      setTitle(t) { w.querySelector('.plan__title').textContent = t; },
      reset() { w.querySelectorAll('.plan__item').forEach((i) => i.remove()); },
    };
  }

  window.PUI = { el, ic, refreshIcons, Rail, Terminal, CodeDiff, Verdict, HumanError, GHCard, ChatPanel, Graph, Plan, RAIL_STAGES, reduce };
  window.createPlayer = createPlayer;
})();
