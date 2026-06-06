/* Panchito landing — bilingual dictionary + persisted language toggle.
   Static nodes use [data-i18n] / [data-i18n-ph]; dynamic demo strings are
   resolved through window.t(key). Brand name stays "panchito" in both. */
(function () {
  const DICT = {
    en: {
      'nav.how': 'how it works', 'nav.engine': 'live engine', 'nav.compare': 'compare', 'nav.cta': 'Run a scenario',

      'hero.kicker': 'Autonomous E2E QA',
      'hero.h1': 'Tests every deploy.\nTrusts none of them.',
      'hero.sub': "When a commit lands on your DEV environment, panchito reads the change, writes the Playwright tests for what could break, and runs them against the live site, before you've opened the PR.",
      'hero.cta1': 'Run a live scenario', 'hero.cta2': 'See it work',
      'hero.m1': 'triggers on merge to main', 'hero.m2': 'PRs into your own git', 'hero.m3': 'open source',
      'hero.cmd': 'panchito qa shop · feat(checkout): coupon field',
      'hero.classify': 'classify · feat(checkout) → generate',
      'hero.generate': 'generate · wrote 3 specs · qa-reviewer approved',
      'hero.validate': 'validate · 3/3 specs pass static gate',
      'hero.execute': 'execute · 2 passed · 1 failed',
      'hero.verdict': '✗ verdict: fail — coupon discount not applied to total',
      'hero.pr': 'PR #182 · auto-merge', 'hero.prsub': 'tests committed to your repo',

      'replay': 'Replay',

      'd1.tag': 'analysis', 'd1.kicker': 'Blast radius',
      'd1.h2': "It doesn't test everything. It tests what your change can break.",
      'd1.sub': 'panchito maps your code, across every repo from frontend to microservices, into a dependency graph. When a commit lands, it grows the blast radius through real relationships: a class you changed, injected three services away, still lights up. Then it writes a focused test plan, before running a single test.',
      'd1.capk': 'Default: diff', 'd1.cap': '(blast radius of one change). Also: manual (test what you ask) · complete (audit the whole suite).',
      'd1.plantitle': 'test plan · 3 flows', 'd1.plan1': 'checkout with coupon', 'd1.plan2': 'refund a paid order', 'd1.plan3': 'price display updates',

      'd2.tag': 'the full flow', 'd2.kicker': 'Proof, not green',
      'd2.h2': "A test that runs green isn't proof. panchito proves it.",
      'd2.sub': 'It writes the spec, a different model reviews it for real assertions, and change-coverage confirms the test actually executes the lines you changed. Then it runs against your live DEV and tells you, in plain language, what broke. Green and approved becomes a PR into your repo. Broken becomes a GitHub Issue. Your tests, your git, no lock-in.',
      'd2.ending': 'Ending:', 'd2.green': 'green → PR', 'd2.red': 'broken → Issue',
      'd2.rej': 'clicks the button but never asserts the result', 'd2.appr': 'asserts the discount is applied to the total',
      'd2.cov': '8 / 8 changed lines covered',
      'd2.err': "Coupon never applied: the 'Apply' button stayed disabled after a valid code. Likely a 500 from the discount API.",
      'd2.prtitle': 'Add E2E: checkout coupon flow', 'd2.issuetitle': 'Coupon not applied on checkout',

      'd3.tag': 'memory + chat', 'd3.kicker': 'Ask it anything',
      'd3.h2': 'Your test suite, now something you can talk to.',
      'd3.sub': 'panchito remembers every run: fragile flows, flaky selectors, what fixed them last time, and answers from memory. Reach it where you already work: the CLI, Slack, or Telegram.',
      'd3.recall': 'recalling run #314 from memory',
      'd3.t_q': 'panchito why did checkout fail yesterday?',
      'd3.t_a1': 'coupon test, flaky 3 of 8 runs. selector ambiguity on the pay button.',
      'd3.t_a2': 'stable since abc123 added data-testid=pay-now.',
      'd3.s_q': '@panchito which tests are flaky right now?',
      'd3.s_a': '2 in <code>web-app</code>, both selector-related. Want a stabilization PR?',
      'd3.g_q': 're-run the coupon test on staging',
      'd3.g_a': "Running <code>coupon.spec</code> on staging. I'll post the verdict right here.",
      'd3.act1': 'open PR', 'd3.act2': 'show run',
      'd3.r1': 'Opening PR #214 with the selector fix. Requesting review now.',
      'd3.r2': 'Run #318: 12 passed, 1 flaky (quarantined). Want the trace?',
      'd3.try': 'Live · switch channels or tap an action.',

      'd4.tag': 'recursive', 'd4.kicker': 'It tests itself',
      'd4.h2': 'The first thing panchito tests is panchito.',
      'd4.sub': 'While testing your project, panchito hits a bug in its own suite. It hands the failure to a maintainer agent, which writes the fix and pushes it to main. The code that uses itself to get better, every day. (Like building git in git.)',
      'd4.qarole': 'tests your repo',
      'd4.maintrole': 'fixes panchito',
      'd4.pr': 'fix: stabilize flaky selector in own suite',
      'd4.e1': 'testing your-org/shop on dev',
      'd4.e2': 'running own e2e suite',
      'd4.e3': "flaky selector in panchito's own test",
      'd4.e4': 'reported to qa-maintainer',
      'd4.e5': 'received failure report',
      'd4.e6': 'writing fix: scope the selector',
      'd4.e7': 'fix verified green',
      'd4.e8': 'merged to main, auto-deploy',

      'eng.kicker': 'Live engine', 'eng.h2': "Don't take our word for it. Run it.",
      'eng.sub': 'Point it at a repo, pick how deep to look, and watch the whole pipeline work, live.',
      'eng.repo': 'Repository', 'eng.depth': 'Analyze the last N commits', 'eng.or': '· or ·',
      'eng.full': 'Full analysis: audit the whole repo', 'eng.run': 'Run pipeline',
      'eng.cap': 'Demo mode is capped to a few commits and a handful of tests, so you get the feel in seconds, not an 80-test marathon.',
      'eng.idle': 'configure a run and press play', 'eng.running': 'running…',

      'cmp.kicker': "Where it's different", 'cmp.h2': 'Built for the part no one else proves.',
      'cmp.sub': "Honest about what's table stakes, and where panchito stands alone.",
      'cmp.f1': 'Commit-aware blast radius', 'cmp.f2': 'Independent 2nd-model review',
      'cmp.f3': 'Tests live in your git', 'cmp.f4': 'Change-coverage proof',
      'cmp.f5': 'Runs vs your real env', 'cmp.f6': 'Ask-it-anything + memory', 'cmp.f7': 'Self-improving (tests itself)',
      'cmp.human': 'human', 'cmp.single': 'single-model', 'cmp.partial': 'partial',
      'cmp.serviceowned': 'service-owned', 'cmp.theircloud': 'their cloud', 'cmp.replay': 'replay',

      'cta.kicker': 'Get started', 'cta.h2': 'Run it on your real repo.',
      'cta.sub': 'panchito is open source. Self-host the engine, or join the waitlist for the hosted beta.',
      'cta.ph': 'you@team.dev', 'cta.join': 'Join the waitlist', 'cta.gh': 'Star on GitHub',
      'cta.ok': "✓ you're on the list. We'll be in touch.",
      'cta.note': 'no backend in this demo; submission is stored locally.',
      'footer.wink': 'made with panchito',
    },
    es: {
      'nav.how': 'cómo funciona', 'nav.engine': 'motor en vivo', 'nav.compare': 'comparar', 'nav.cta': 'Ejecutar un escenario',

      'hero.kicker': 'QA E2E autónomo',
      'hero.h1': 'Prueba cada deploy.\nNo confía en ninguno.',
      'hero.sub': 'Cuando un commit entra a tu entorno DEV, panchito lee el cambio, escribe los tests de Playwright para lo que podría romperse, y los ejecuta contra el sitio vivo, antes de que abras el PR.',
      'hero.cta1': 'Ejecutar un escenario', 'hero.cta2': 'Verlo funcionar',
      'hero.m1': 'se dispara al hacer merge a main', 'hero.m2': 'PRs a tu propio git', 'hero.m3': 'código abierto',
      'hero.cmd': 'panchito qa shop · feat(checkout): campo de cupón',
      'hero.classify': 'classify · feat(checkout) → generate',
      'hero.generate': 'generate · escribió 3 specs · qa-reviewer aprobó',
      'hero.validate': 'validate · 3/3 specs pasan validación',
      'hero.execute': 'execute · 2 pasaron · 1 falló',
      'hero.verdict': '✗ veredicto: falló — el descuento no se aplicó al total',
      'hero.pr': 'PR #182 · auto-merge', 'hero.prsub': 'tests commiteados a tu repo',

      'replay': 'Repetir',

      'd1.tag': 'análisis', 'd1.kicker': 'Blast radius',
      'd1.h2': 'No prueba todo. Prueba lo que tu cambio puede romper.',
      'd1.sub': 'panchito mapea tu código, en todos tus repos del frontend a los microservicios, como un grafo de dependencias. Cuando entra un commit, hace crecer el blast-radius a través de relaciones reales: una clase que cambiaste, inyectada tres servicios más allá, igual se enciende. Después arma un plan de tests enfocado, antes de ejecutar un solo test.',
      'd1.capk': 'Por defecto: diff', 'd1.cap': '(blast radius de un cambio). También: manual (prueba lo que pidas) | complete (auditar toda la suite).',
      'd1.plantitle': 'plan de tests | 3 flujos', 'd1.plan1': 'checkout con cupón', 'd1.plan2': 'reembolso de una orden', 'd1.plan3': 'actualización de precios',

      'd2.tag': 'el flujo completo', 'd2.kicker': 'Prueba, no verde',
      'd2.h2': 'Un test en verde no es una prueba. panchito lo demuestra.',
      'd2.sub': 'Escribe el spec, un modelo distinto lo revisa buscando asserts reales, y el change-coverage confirma que el test realmente ejecuta las líneas que cambiaste. Después ejecuta contra tu DEV vivo y te dice, en lenguaje claro, qué se rompió. Verde y aprobado se vuelve un PR a tu repo. Roto se vuelve un GitHub Issue. Tus tests, tu git, sin lock-in.',
      'd2.ending': 'Final:', 'd2.green': 'verde → PR', 'd2.red': 'roto → Issue',
      'd2.rej': 'hace clic en el botón pero nunca verifica el resultado', 'd2.appr': 'verifica que el descuento se aplica al total',
      'd2.cov': '8 / 8 líneas cambiadas cubiertas',
      'd2.err': "El cupón nunca se aplicó: el botón 'Aplicar' quedó deshabilitado tras un código válido. Probablemente un 500 de la API de descuentos.",
      'd2.prtitle': 'Add E2E: flujo de cupón en checkout', 'd2.issuetitle': 'Cupón no se aplica en checkout',

      'd3.tag': 'memoria + chat', 'd3.kicker': 'Pregúntale lo que sea',
      'd3.h2': 'Tu suite de tests, ahora algo con lo que puedes hablar.',
      'd3.sub': 'panchito recuerda cada ejecución: flujos frágiles, selectores flaky, qué los arregló la última vez, y responde desde su memoria. Comunícate con él desde donde ya trabajas: la CLI, Slack o Telegram.',
      'd3.recall': 'recordando ejecución #314 desde memoria',
      'd3.t_q': 'panchito ¿por qué falló checkout ayer?',
      'd3.t_a1': 'test de cupón, flaky 3 de 8 ejecuciones. ambigüedad de selector en el botón de pago.',
      'd3.t_a2': 'estable desde que abc123 agregó data-testid=pay-now.',
      'd3.s_q': '@panchito ¿qué tests están flaky ahora?',
      'd3.s_a': '2 en <code>web-app</code>, ambos por selectores. ¿Abro un PR de estabilización?',
      'd3.g_q': 'vuelve a ejecutar el test de cupón en staging',
      'd3.g_a': 'Ejecutando <code>coupon.spec</code> en staging. Te dejo el veredicto aquí mismo.',
      'd3.act1': 'abrir PR', 'd3.act2': 'ver ejecución',
      'd3.r1': 'Abriendo PR #214 con el fix del selector. Pido review ahora.',
      'd3.r2': 'Ejecución #318: 12 en verde, 1 flaky (en cuarentena). ¿Te paso el trace?',
      'd3.try': 'En vivo | cambia de canal o toca una acción.',

      'd4.tag': 'recursivo', 'd4.kicker': 'Se prueba a sí mismo',
      'd4.h2': 'Lo primero que panchito prueba es panchito.',
      'd4.sub': 'Mientras prueba tu proyecto, panchito encuentra un bug en su propia suite. Le pasa el fallo a un agente de mantenimiento, que escribe el fix y lo sube a main. El código que se usa a sí mismo para mejorar, cada día. (Como construir git en git.)',
      'd4.qarole': 'prueba tu repo',
      'd4.maintrole': 'arregla panchito',
      'd4.pr': 'fix: estabilizar selector flaky en su propia suite',
      'd4.e1': 'probando your-org/shop en dev',
      'd4.e2': 'ejecutando su propia suite e2e',
      'd4.e3': 'selector flaky en un test propio',
      'd4.e4': 'reportado a qa-maintainer',
      'd4.e5': 'recibió el reporte de fallo',
      'd4.e6': 'escribiendo fix: acota el selector',
      'd4.e7': 'fix verificado en verde',
      'd4.e8': 'mergeado a main, auto-deploy',

      'eng.kicker': 'Motor en vivo', 'eng.h2': 'No nos creas. Pruébalo.',
      'eng.sub': 'Apúntalo a un repo, elige hasta qué profundidad mirar, y mira todo el pipeline trabajar, en vivo.',
      'eng.repo': 'Repositorio', 'eng.depth': 'Analizar los últimos N commits', 'eng.or': '| o |',
      'eng.full': 'Análisis completo: auditar todo el repo', 'eng.run': 'Ejecutar pipeline',
      'eng.cap': 'El modo demo está limitado a unos pocos commits y un puñado de tests, para que sientas cómo es en segundos, no en una maratón de 80 tests.',
      'eng.idle': 'configura una ejecución y presiona play', 'eng.running': 'ejecutando…',

      'cmp.kicker': 'En qué se diferencia', 'cmp.h2': 'Hecho para la parte que nadie más demuestra.',
      'cmp.sub': 'Honesto sobre lo que es estándar, y dónde panchito está solo.',
      'cmp.f1': 'Blast radius por commit', 'cmp.f2': 'Revisión de un 2.º modelo independiente',
      'cmp.f3': 'Tests viven en tu git', 'cmp.f4': 'Prueba de change-coverage',
      'cmp.f5': 'Ejecuta contra tu entorno real', 'cmp.f6': 'Pregúntale lo que sea + memoria', 'cmp.f7': 'Se mejora solo (se prueba a sí mismo)',
      'cmp.human': 'humano', 'cmp.single': 'un solo modelo', 'cmp.partial': 'parcial',
      'cmp.serviceowned': 'del servicio', 'cmp.theircloud': 'su nube', 'cmp.replay': 'replay',

      'cta.kicker': 'Empezar', 'cta.h2': 'Ejecútalo en tu repo real.',
      'cta.sub': 'panchito es código abierto. Auto-aloja el motor, o únete a la lista de espera de la beta alojada.',
      'cta.ph': 'tu@equipo.dev', 'cta.join': 'Unirme a la lista de espera', 'cta.gh': 'Star en GitHub',
      'cta.ok': '✓ estás en la lista. Te contactamos.',
      'cta.note': 'sin backend en esta demo; el envío se guarda localmente.',
      'footer.wink': 'hecho con panchito',
    },
  };

  let lang = (function () {
    const saved = localStorage.getItem('panchito.lang');
    if (saved === 'en' || saved === 'es') return saved;
    return (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
  })();

  function t(key) { return (DICT[lang] && DICT[lang][key]) || (DICT.en[key]) || key; }

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.getAttribute('data-i18n');
      const val = t(k);
      if (val.indexOf('\n') >= 0) el.innerHTML = val.split('\n').map(s => s).join('<br>');
      else el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    document.querySelectorAll('.lang button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  function setLang(next) {
    if (next === lang) return;
    lang = next; localStorage.setItem('panchito.lang', lang); apply();
  }

  window.PanchitoI18n = { t, setLang, get lang() { return lang; }, apply };
  window.t = t;
})();
