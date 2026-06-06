// Fake data for the Panchito Console UI kit.
window.PanchitoData = (function () {
  const apps = [
    { name: 'portfolio', repo: 'ArielFalcon/portfolio', stack: 'Astro · Vercel', shadow: true, watching: true },
    { name: 'checkout-api', repo: 'acme/checkout-api', stack: 'Spring · K8s', shadow: false, watching: true },
    { name: 'web-app', repo: 'acme/web-app', stack: 'Angular · Vercel', shadow: false, watching: true },
  ];

  const runs = [
    {
      id: 'r-1841', app: 'web-app', sha: '9f6edf2', verdict: 'pass', mode: 'diff',
      message: 'feat(map): cluster nearby pins at low zoom', author: 'maria',
      time: '4m ago', specs: 4, reviewer: 'approved', decision: 'PR #182 · auto-merge',
      branch: 'DEV', duration: '2m 18s',
      stages: [['classify','done'],['generate','done'],['validate','done'],['execute','done'],['decide','done']],
      changed: ['src/app/map/map.component.ts', 'src/app/map/cluster.service.ts'],
      newSpecs: [
        { file: 'e2e/map/cluster-pins.spec.ts', status: 'pass', n: 3 },
        { file: 'e2e/map/zoom-bounds.spec.ts', status: 'pass', n: 1 },
      ],
      log: [
        ['$', 'panchito qa --app web-app --sha 9f6edf2'],
        ['›', 'classify · feat → generate targeted'],
        ['›', 'blast radius · map.component.ts → /map route'],
        ['›', 'fe↔be · getPins() → GET /pins (checkout-api)'],
        ['›', 'generate · wrote 4 specs · reviewer approved'],
        ['›', 'execute · 4 passed · 0 flaky · 12.4s'],
        ['✓', 'verdict PASS → PR #182 opened, auto-merge enabled'],
      ],
    },
    {
      id: 'r-1840', app: 'checkout-api', sha: 'a1b2c3d', verdict: 'fail', mode: 'diff',
      message: 'fix(cart): reject negative quantities', author: 'devon',
      time: '22m ago', specs: 2, reviewer: 'approved', decision: 'Issue #91',
      branch: 'DEV', duration: '1m 47s',
      stages: [['classify','done'],['generate','done'],['validate','done'],['execute','fail'],['decide','done']],
      changed: ['src/cart/CartController.java', 'src/cart/CartService.java'],
      newSpecs: [
        { file: 'e2e/cart/negative-qty.spec.ts', status: 'fail', n: 2 },
      ],
      log: [
        ['$', 'panchito qa --app checkout-api --sha a1b2c3d'],
        ['›', 'classify · fix → generate targeted'],
        ['›', 'generate · wrote 2 specs · reviewer approved'],
        ['✗', 'execute · 1 failed · expected 400, got 200'],
        ['✗', 'verdict FAIL → Issue #91 opened with sanitized logs'],
      ],
    },
    {
      id: 'r-1839', app: 'web-app', sha: 'd4e5f6a', verdict: 'flaky', mode: 'diff',
      message: 'refactor(auth): extract token refresh', author: 'maria',
      time: '1h ago', specs: 1, reviewer: 'approved', decision: 'quarantined',
      branch: 'DEV', duration: '3m 02s',
      stages: [['classify','done'],['generate','done'],['validate','done'],['execute','flaky'],['decide','done']],
      changed: ['src/app/auth/token.service.ts'],
      newSpecs: [{ file: 'e2e/auth/token-refresh.spec.ts', status: 'flaky', n: 1 }],
      log: [
        ['$', 'panchito qa --app web-app --sha d4e5f6a'],
        ['›', 'classify · refactor → regression-only'],
        ['~', 'execute · passed on retry 2/3 → flaky'],
        ['~', 'verdict FLAKY → quarantined, no Issue'],
      ],
    },
    {
      id: 'r-1838', app: 'portfolio', sha: 'c0ffee1', verdict: 'skipped', mode: 'diff',
      message: 'style: format with prettier', author: 'ariel',
      time: '2h ago', specs: 0, reviewer: '—', decision: 'no tokens spent',
      branch: 'DEV', duration: '0.3s',
      stages: [['classify','skip'],['generate','skip'],['validate','skip'],['execute','skip'],['decide','skip']],
      changed: ['src/**/*.astro'],
      newSpecs: [],
      log: [
        ['$', 'panchito qa --app portfolio --sha c0ffee1'],
        ['›', 'classify · style: no logic change'],
        ['·', 'verdict SKIPPED → 0 tokens spent'],
      ],
    },
    {
      id: 'r-1837', app: 'checkout-api', sha: 'b4dc0de', verdict: 'infra-error', mode: 'diff',
      message: 'chore(deps): bump spring-boot', author: 'devon',
      time: '3h ago', specs: 0, reviewer: '—', decision: 'DEV unhealthy',
      branch: 'DEV', duration: '90s timeout',
      stages: [['classify','done'],['generate','done'],['validate','done'],['execute','infra'],['decide','skip']],
      changed: ['pom.xml'],
      newSpecs: [],
      log: [
        ['$', 'panchito qa --app checkout-api --sha b4dc0de'],
        ['›', 'health pre-flight · DEV /health → 503'],
        ['!', 'verdict INFRA-ERROR → not a code bug, no Issue'],
      ],
    },
    {
      id: 'r-1836', app: 'web-app', sha: 'feed123', verdict: 'pass', mode: 'complete',
      message: 'coverage sweep · uncovered flows', author: 'panchito',
      time: '5h ago', specs: 7, reviewer: 'approved', decision: 'PR #180 · auto-merge',
      branch: 'DEV', duration: '6m 41s',
      stages: [['classify','done'],['generate','done'],['validate','done'],['execute','done'],['decide','done']],
      changed: ['(whole repo)'],
      newSpecs: [
        { file: 'e2e/profile/edit.spec.ts', status: 'pass', n: 3 },
        { file: 'e2e/search/filters.spec.ts', status: 'pass', n: 4 },
      ],
      log: [
        ['$', 'panchito qa --app web-app --mode complete'],
        ['›', 'analyze · 11 routes · 6 uncovered flows'],
        ['›', 'generate · wrote 7 specs · reviewer approved'],
        ['✓', 'verdict PASS → PR #180 opened'],
      ],
    },
    {
      id: 'r-live', app: 'shop', sha: 'a1b2c3d', verdict: 'fail', mode: 'diff',
      message: 'feat(checkout): coupon field', author: 'demo',
      time: 'just now', specs: 3, reviewer: 'approved', decision: 'Issue #92 opened with sanitized logs · 1 test failed',
      branch: 'DEV', duration: '1m 12s',
      stages: [['classify','done'],['generate','done'],['validate','done'],['execute','fail'],['decide','done']],
      changed: ['src/checkout/CheckoutController.ts', 'src/checkout/CouponService.ts'],
      newSpecs: [
        { file: 'e2e/checkout/coupon.spec.ts', status: 'fail', n: 1 },
        { file: 'e2e/checkout/refund.spec.ts', status: 'pass', n: 2 },
        { file: 'e2e/checkout/tax-calc.spec.ts', status: 'pass', n: 1 },
      ],
      log: [
        ['$', 'panchito qa --app shop --sha a1b2c3d'],
        ['›', 'classify · feat → generate targeted'],
        ['›', 'blast radius · 3 routes · 1 cross-repo'],
        ['›', 'generate · wrote 3 specs · reviewer approved 2/3'],
        ['✗', 'execute · 2 passed · 1 failed · coupon not applied'],
        ['✗', 'verdict FAIL → Issue #92 opened'],
      ],
    },
  ];

  const stats = { runs7d: 128, passRate: 0.86, specsAdded: 41, openIssues: 3, watching: 3 };

  return { apps, runs, stats };
})();
