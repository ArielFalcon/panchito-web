/* Panchito landing — bilingual dictionary + persisted language toggle.
   Static nodes use [data-i18n] / [data-i18n-ph]; dynamic demo strings are
   resolved through window.t(key). Brand name stays "panchito" in both. */
(function () {
  const DICT = {
    en: {
      'nav.how': 'how it works', 'nav.engine': 'live engine', 'nav.compare': 'compare', 'nav.cta': 'Try it!', 'nav.console': 'console',

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
      'd1.rev1': 'asserts discount applied to total · approved',
      'd1.rev2': 'covers full refund path · approved',
      'd1.rev3': 'never asserts the new price · rejected',
      'd1.ex1': 'discount correctly applied, total $45.00',
      'd1.ex2': 'refund total off by $2.50 — partial refund edge case',
      'd1.ex3': 'price change reflected in cart after refresh',

      'd2.tag': 'the full flow', 'd2.kicker': 'Proof, not green', 'd2.plain': 'plain language',
      'd2.h2': "A test that runs green isn't proof. panchito proves it.",
      'd2.sub': 'It writes the spec, a different model reviews it for real assertions, and change-coverage confirms the test actually executes the lines you changed. Then it runs against your live DEV and tells you, in plain language, what broke. Green and approved becomes a PR into your repo. Broken becomes a GitHub Issue. Your tests, your git, no lock-in.',
      'd2.ending': 'Ending:', 'd2.green': 'green → PR', 'd2.red': 'broken → Issue',
      'd2.rej': 'clicks the button but never asserts the result', 'd2.appr': 'asserts the discount is applied to the total',
      'd2.cov': '8 / 8 changed lines covered',
      'd2.err': "Coupon never applied: the 'Apply' button stayed disabled after a valid code. Likely a 500 from the discount API.",
      'd2.prtitle': 'Add E2E: checkout coupon flow', 'd2.issuetitle': 'Coupon not applied on checkout',

      'sdk.tag': 'engine choice', 'sdk.kicker': 'opencode · codex · dual',
      'sdk.h2': 'Pick your engine. Or run both.',
      'sdk.sub': 'Choose opencode or codex as your SDK and configure the model behind it. Flip on DUAL to run both inside one synchronized process, and swap engines hot, mid-run, with state carried over.',
      'sdk.capk': 'Hot-swappable:', 'sdk.cap': 'change SDK or model mid-run; state is preserved. DUAL runs both, synchronized, in one process.',
      'sdk.opencode': 'opencode', 'sdk.codex': 'codex', 'sdk.dual': 'DUAL',
      'sdk.hotbadge': 'hot-swap',
      'sdk.idle': 'idle', 'sdk.active': 'running', 'sdk.handed': 'handed off', 'sdk.donelbl': 'done',
      'sdk.swap': 'hot-swap · state preserved', 'sdk.dualon': 'DUAL · both SDKs, one process',
      'sdk.tagok': 'green', 'sdk.tagdual': 'dual',
      'sdk.o1': 'reading change · blast radius', 'sdk.o2': 'opencode · wrote the spec', 'sdk.o3': 'running against dev', 'sdk.o4': 'green · 1 passed',
      'sdk.mo': 'opencode · 1 SDK · green',
      'sdk.c_recv': 'state received from opencode',
      'sdk.c1': 'reading change · blast radius', 'sdk.c2': 'codex · wrote the spec', 'sdk.c3': 'running against dev', 'sdk.c4': 'green · 1 passed',
      'sdk.mc': 'codex · 1 SDK · green',
      'sdk.d_o1': 'spec drafted, review the edge cases?', 'sdk.d_c1': 'assertion too loose, check the total',
      'sdk.d_o2': 'fixed, asserts the total now, re-verify?', 'sdk.d_c2': 'verified · 0 mutants survived',
      'sdk.md': '2 SDKs · 1 process · hardened together',

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

      'd5.tag': 'learning', 'd5.kicker': 'The learning layer',
      'd5.h2': "Every failure becomes a rule it won't break twice.",
      'd5.sub': "panchito doesn't just pass or fail a run, it learns from it. A labeler classifies the error, an oracle scores test quality with mutation testing, and a reflector traces the root cause to real artifacts. A distiller turns that into a reusable rule, injected into every future run. Attribution promotes the rules that lead to good outcomes; a curriculum keeps only the probes that have caught real bugs.",
      'd5.capk': 'Deterministic where it counts:', 'd5.cap': 'the labeler and oracle use zero LLM. Only the reflection step asks a model.',
      'd5.intake': 'one failed run', 'd5.counter': 'rules learned',
      'd5.loop': 'the learning loop', 'd5.hint': 'every run makes the next one smarter', 'd5.rulesword': 'rules',
      'd5.run': 'run #318 · checkout coupon → false-positive',
      'd5.loopmsg': 'distilled rule injected into every future run',
      'd5.lab': 'classified · E-FALSE-POSITIVE',
      'd5.ora': 'mutation score 62% · 3 mutants survived',
      'd5.ref': 'root cause · asserted on stale DOM before reload',
      'd5.dis': 'distilled into a reusable rule',
      'd5.ledger': 'rulebook', 'd5.ledgersub': 'injected into every run',
      'd5.rulenew': 'await navigation before asserting post-mutation DOM',
      'd5.rule1': 'scope selectors to data-testid, never visible text',
      'd5.rule2': 'a 5xx during checkout is a fail, not flaky',
      'd5.new': 'new', 'd5.promoted': 'promoted',
      'd5.attrib': 'retrieved on run #319 → good outcome',
      'd5.curric': 'proven probes', 'd5.never': 'the same mistake never ships twice',
      'd5.run2': 'run #321 · cart quantity → flaky retry',
      'd5.lab2': 'classified · E-FLAKY-RETRY',
      'd5.ora2': 'mutation score 88% · suite already strong',
      'd5.ref2': 'root cause · network jitter, not a real defect',
      'd5.dis2': 'reflection overlaps existing rule R-047',
      'd5.candidate': 'candidate rule R-048 formed',
      'd5.discard': 'duplicate of R-047 · discarded, rulebook unchanged',
      'd5.discarded': 'discarded',

      'eng.kicker': 'Live engine', 'eng.h2': "Don't take our word for it. Run it.",
      'eng.sub': 'Point it at a repo, pick how deep to look, and watch the whole pipeline work, live.',
      'eng.repo': 'Repository', 'eng.depth': 'Analyze the last N commits', 'eng.run': 'Run pipeline',
      'eng.cap': 'Demo mode is capped to a few commits and a handful of tests, so you get the feel in seconds, not an 80-test marathon.',
      'eng.idle': 'configure a run and press play', 'eng.running': 'running…',
      'eng.report': 'View full result in console →',

      'cmp.kicker': "Where it's different", 'cmp.h2': 'Built for the part no one else proves.',
      'cmp.sub': "Honest about what's table stakes, and where panchito stands alone.",
      'cmp.f1': 'Commit-aware blast radius', 'cmp.f2': 'Independent 2nd-model review',
      'cmp.f3': 'Tests live in your git', 'cmp.f4': 'Change-coverage proof',
      'cmp.f5': 'Runs vs your real env', 'cmp.f6': 'Ask-it-anything + memory', 'cmp.f7': 'Self-improving (tests itself)',
      'cmp.human': 'human', 'cmp.single': 'single-model', 'cmp.partial': 'partial',
      'cmp.serviceowned': 'service-owned', 'cmp.theircloud': 'their cloud', 'cmp.replay': 'replay',

      'footer.wink': 'made with panchito',
    },
    es: {
      'nav.how': 'cómo funciona', 'nav.engine': 'motor en vivo', 'nav.compare': 'comparar', 'nav.cta': 'Pruébalo', 'nav.console': 'consola',

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
      'd1.capk': 'Por defecto: diff', 'd1.cap': '(blast radius de un cambio). También: manual (prueba lo que pidas) · complete (auditar toda la suite).',
      'd1.plantitle': 'plan de tests · 3 flujos', 'd1.plan1': 'checkout con cupón', 'd1.plan2': 'reembolso de una orden', 'd1.plan3': 'actualización de precios',
      'd1.rev1': 'verifica el descuento aplicado al total · aprobado',
      'd1.rev2': 'cubre el flujo completo de reembolso · aprobado',
      'd1.rev3': 'nunca verifica el nuevo precio · rechazado',
      'd1.ex1': 'descuento aplicado correctamente, total $45.00',
      'd1.ex2': 'total de reembolso con $2.50 de diferencia — caso borde de reembolso parcial',
      'd1.ex3': 'cambio de precio reflejado en el carrito tras actualizar',

      'd2.tag': 'el flujo completo', 'd2.kicker': 'Prueba, no verde', 'd2.plain': 'lenguaje claro',
      'd2.h2': 'Un test en verde no es una prueba. panchito lo demuestra.',
      'd2.sub': 'Escribe el spec, un modelo distinto lo revisa buscando asserts reales, y el change-coverage confirma que el test realmente ejecuta las líneas que cambiaste. Después ejecuta contra tu DEV vivo y te dice, en lenguaje claro, qué se rompió. Verde y aprobado se vuelve un PR a tu repo. Roto se vuelve un GitHub Issue. Tus tests, tu git, sin lock-in.',
      'd2.ending': 'Final:', 'd2.green': 'verde → PR', 'd2.red': 'roto → Issue',
      'd2.rej': 'hace clic en el botón pero nunca verifica el resultado', 'd2.appr': 'verifica que el descuento se aplica al total',
      'd2.cov': '8 / 8 líneas cambiadas cubiertas',
      'd2.err': "El cupón nunca se aplicó: el botón 'Aplicar' quedó deshabilitado tras un código válido. Probablemente un 500 de la API de descuentos.",
      'd2.prtitle': 'Add E2E: flujo de cupón en checkout', 'd2.issuetitle': 'Cupón no se aplica en checkout',

      'sdk.tag': 'elección de motor', 'sdk.kicker': 'opencode · codex · dual',
      'sdk.h2': 'Elige tu motor. O ejecuta los dos.',
      'sdk.sub': 'Elige opencode o codex como SDK y configura el modelo detrás. Activa DUAL para ejecutar ambos dentro de un mismo proceso sincronizado, e intercambia de motor en caliente, a mitad de ejecución, conservando el estado.',
      'sdk.capk': 'Intercambiable en caliente:', 'sdk.cap': 'cambia de SDK o modelo a mitad de ejecución; el estado se preserva. DUAL ejecuta ambos, sincronizados, en un proceso.',
      'sdk.opencode': 'opencode', 'sdk.codex': 'codex', 'sdk.dual': 'DUAL',
      'sdk.hotbadge': 'en caliente',
      'sdk.idle': 'en espera', 'sdk.active': 'ejecutando', 'sdk.handed': 'transferido', 'sdk.donelbl': 'listo',
      'sdk.swap': 'en caliente · estado preservado', 'sdk.dualon': 'DUAL · dos SDK, un proceso',
      'sdk.tagok': 'verde', 'sdk.tagdual': 'dual',
      'sdk.o1': 'leyendo cambio · blast radius', 'sdk.o2': 'opencode · escribió el spec', 'sdk.o3': 'ejecutando contra dev', 'sdk.o4': 'verde · 1 pasó',
      'sdk.mo': 'opencode · 1 SDK · verde',
      'sdk.c_recv': 'estado recibido de opencode',
      'sdk.c1': 'leyendo cambio · blast radius', 'sdk.c2': 'codex · escribió el spec', 'sdk.c3': 'ejecutando contra dev', 'sdk.c4': 'verde · 1 pasó',
      'sdk.mc': 'codex · 1 SDK · verde',
      'sdk.d_o1': 'spec listo, ¿revisas los edge cases?', 'sdk.d_c1': 'assert muy débil, revisa el total',
      'sdk.d_o2': 'corregido, ya verifica el total, ¿lo re-verificas?', 'sdk.d_c2': 'verificado · 0 mutantes sobreviven',
      'sdk.md': '2 SDK · 1 proceso · reforzado entre ambos',

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
      'd3.try': 'En vivo · cambia de canal o toca una acción.',

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

      'd5.tag': 'aprendizaje', 'd5.kicker': 'La capa de aprendizaje',
      'd5.h2': 'Cada fallo se vuelve una regla que no rompe dos veces.',
      'd5.sub': 'panchito no solo aprueba o falla una ejecución: aprende de ella. Un labeler clasifica el error, un oracle mide la calidad del test con mutation testing, y un reflector rastrea la causa raíz hasta artefactos reales. Un distiller lo convierte en una regla reutilizable, inyectada en cada ejecución futura. La attribution promueve las reglas que llevan a buenos resultados; un curriculum conserva solo las pruebas que cazaron bugs reales.',
      'd5.capk': 'Determinista donde importa:', 'd5.cap': 'el labeler y el oracle no usan LLM. Solo la reflexión consulta a un modelo.',
      'd5.intake': 'una ejecución fallida', 'd5.counter': 'reglas aprendidas',
      'd5.loop': 'el ciclo de aprendizaje', 'd5.hint': 'cada ejecución hace más lista a la siguiente', 'd5.rulesword': 'reglas',
      'd5.run': 'ejecución #318 · cupón checkout → falso-positivo',
      'd5.loopmsg': 'regla destilada inyectada en cada ejecución futura',
      'd5.lab': 'clasificado · E-FALSE-POSITIVE',
      'd5.ora': 'score de mutación 62% · 3 mutantes sobrevivieron',
      'd5.ref': 'causa raíz · assert sobre DOM viejo antes del reload',
      'd5.dis': 'destilado en una regla reutilizable',
      'd5.ledger': 'rulebook', 'd5.ledgersub': 'inyectado en cada ejecución',
      'd5.rulenew': 'esperar la navegación antes de assert sobre DOM post-mutación',
      'd5.rule1': 'acotar selectores a data-testid, nunca al texto visible',
      'd5.rule2': 'un 5xx en checkout es fail, no flaky',
      'd5.new': 'nueva', 'd5.promoted': 'promovida',
      'd5.attrib': 'recuperada en ejecución #319 → buen resultado',
      'd5.curric': 'pruebas comprobadas', 'd5.never': 'el mismo error no llega dos veces',
      'd5.run2': 'ejecución #321 · cantidad carrito → reintento flaky',
      'd5.lab2': 'clasificado · E-FLAKY-RETRY',
      'd5.ora2': 'score de mutación 88% · la suite ya es sólida',
      'd5.ref2': 'causa raíz · jitter de red, no un defecto real',
      'd5.dis2': 'la reflexión se solapa con la regla R-047',
      'd5.candidate': 'regla candidata R-048 formada',
      'd5.discard': 'duplicada de R-047 · descartada, rulebook sin cambios',
      'd5.discarded': 'descartada',

      'eng.kicker': 'Motor en vivo', 'eng.h2': 'No nos creas. Pruébalo.',
      'eng.sub': 'Apúntalo a un repo, elige hasta qué profundidad mirar, y mira todo el pipeline trabajar, en vivo.',
      'eng.repo': 'Repositorio', 'eng.depth': 'Analizar los últimos N commits', 'eng.run': 'Ejecutar pipeline',
      'eng.cap': 'El modo demo está limitado a unos pocos commits y un puñado de tests, para que sientas cómo es en segundos, no en una maratón de 80 tests.',
      'eng.idle': 'configura una ejecución y presiona play', 'eng.running': 'ejecutando…',
      'eng.report': 'Ver el resultado completo en la consola →',

      'cmp.kicker': 'En qué se diferencia', 'cmp.h2': 'Hecho para la parte que nadie más demuestra.',
      'cmp.sub': 'Honesto sobre lo que es estándar, y dónde panchito está solo.',
      'cmp.f1': 'Blast radius por commit', 'cmp.f2': 'Revisión de un 2.º modelo independiente',
      'cmp.f3': 'Tests viven en tu git', 'cmp.f4': 'Prueba de change-coverage',
      'cmp.f5': 'Ejecuta contra tu entorno real', 'cmp.f6': 'Pregúntale lo que sea + memoria', 'cmp.f7': 'Se mejora solo (se prueba a sí mismo)',
      'cmp.human': 'humano', 'cmp.single': 'un solo modelo', 'cmp.partial': 'parcial',
      'cmp.serviceowned': 'del servicio', 'cmp.theircloud': 'su nube', 'cmp.replay': 'replay',

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
      if (val.indexOf('\n') >= 0) el.innerHTML = val.split('\n').join('<br>');
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
