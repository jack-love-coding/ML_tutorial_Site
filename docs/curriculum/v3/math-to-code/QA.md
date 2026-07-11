# Mathematics-to-Code Pilot QA

**Date:** 2026-07-11
**Status:** Passed; reviewed-version progress remains local and formative
**Scope:** Six promoted Math Lab modules and the `math-to-code-pilot` route

## Environment

- Workspace: `/Users/jackky/Desktop/ML_tutorial_Site/.worktrees/math-to-code-pilot`
- Served artifact: output of `npm run build`
- Server: production `vite preview` at `http://127.0.0.1:4173`
- Browser driver: Playwright CLI wrapper from `~/.codex/skills/playwright/scripts/playwright_cli.sh`
- Locales: `zh-CN` and `en`
- Viewports: desktop `1440 × 1000`; mobile `390 × 844`
- Motion modes: default and `prefers-reduced-motion: reduce`

No screenshot or trace was created for this pass. The complete 28-case result table and probe interpretation are in [browser-evidence.md](./browser-evidence.md).

## Replay commands

The preview was started in a PTY session so the long-running server did not block the QA turn:

```bash
cd /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/math-to-code-pilot
command -v npx >/dev/null 2>&1
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

In a second terminal:

```bash
cd /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/math-to-code-pilot
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
export PLAYWRIGHT_CLI_SESSION=math-to-code-task8-review

"$PWCLI" open 'http://127.0.0.1:4173/math-lab/modules/calculus-functions-rate-change?route=math-to-code-pilot' --headed
"$PWCLI" resize 1440 1000
"$PWCLI" snapshot
"$PWCLI" run-code --filename scripts/qa/mathToCodePilotBrowserMatrix.js
```

The matrix command returns `{"cases":28,"failures":0,...}` and exits with an error if any dashboard order, chapter order, exact adjacent href, title, locale, overflow, fragment, empty link, overlap, console error, page error, or console warning contract fails. Each case includes `warningCount`; production returned zero for all 28 cases.

## Automated interaction checks

The same matrix script now automates the route dashboard, matrix A-contract, local-storage boundary, and versioned 6/6 completion checks. The earlier functions/studio exploratory steps remain useful semantic selectors, but final-fix evidence no longer depends on manual replay.

Snapshot refs are intentionally not recorded because they change after navigation. The manual CLI steps used these semantic selectors:

- Functions slider: `page.getByRole('slider', { name: /第一个权重/ })`
- Functions reset: `page.getByRole('button', { name: /重置为 w1/ })`
- Studio first input: `page.getByRole('spinbutton', { name: 'X[0,0]' })`
- Studio reset: `page.getByRole('button', { name: 'Reset inputs' })`
- Self-paced completion: `page.getByRole('button', { name: 'Mark as reviewed' })`
- Route return: `page.getByRole('link', { name: 'Back to path' })`
- Static result surfaces: `.prediction-mapping-lab__fallback table` and `.math-to-code-studio-lab__results tr`

Keyboard activation used `locator.focus()` followed by `page.keyboard.press('ArrowRight')` or `page.keyboard.press('Enter')`. Reduced motion used `page.emulateMedia({ reducedMotion: 'reduce' })` and then checked `matchMedia('(prefers-reduced-motion: reduce)').matches`.

## Probe implementation

The committed probe at `scripts/qa/mathToCodePilotBrowserMatrix.js` performs the following on every route/locale/viewport case:

```js
const overflow = document.documentElement.scrollWidth > innerWidth
const deadFragments = [...document.querySelectorAll('a[href]')]
  .map((anchor) => anchor.getAttribute('href'))
  .filter((href) => href?.startsWith('#') && !document.getElementById(href.slice(1)))
const emptyLinks = [...document.querySelectorAll('a[href]')]
  .map((anchor) => anchor.getAttribute('href'))
  .filter((href) => !href || href === '#')
```

It also:

- opens Math Lab home in both locales and viewports, requiring route-relative card order `1..6`, exact six hrefs, and `0 / 6` when only legacy global completion exists;
- compares every previous/next href to the exact route edge map instead of accepting any HTTP-200 link;
- requires each module hero to show its route-relative chapter number;
- compares each visible `h1` with the exact localized module title;
- compares `document.documentElement.lang` with the requested locale;
- checks pairwise rectangles of visible `button`, `a`, and `input` elements for overlap;
- records browser `console.error`, console `warning`, and uncaught `pageerror` events per case, including `warningCount`;
- throws with the failing case payload instead of returning a false-positive success.

## Production preview observations

- Browser matrix: 28/28 passed: 24 module cases plus 4 Math Lab home dashboard cases.
- Every module was opened four times: Chinese desktop, Chinese mobile, English desktop, English mobile.
- Every document response was HTTP 200; every route href exactly matched the expected previous/next module.
- Every localized title and document language matched.
- Desktop `scrollWidth` was `1440`; mobile `scrollWidth` was `390`.
- Dead fragments, empty links, interactive overlaps, browser console errors, page errors, and console warnings were zero in all cases; every `warningCount` was 0.
- Production preview console after interaction QA: 0 errors and 0 warnings.

## Functions interaction evidence

At Chinese desktop width:

- keyboard `ArrowRight` changed `w1` from `4` to `4.5`;
- visible readouts changed to prediction `11`, residual `2`, MSE `4`;
- focusing reset and pressing `Enter` restored `w1 = 4`, prediction `10`, residual `1`, MSE `1`;
- reduced-motion matched, one static fallback table remained, and running animations were zero;
- next href was `/math-lab/modules/linear-algebra-feature-space?route=math-to-code-pilot`;
- page-level overflow was false.

## Matrix and versioned 6/6 evidence

The matrix wrapper displayed `A e1`, `A e2`, `det(A)`, and `A x`, used the geometric-transform explanation, displayed no legacy W-contract copy, and created no new local-storage key after an input edit.

The browser local progress fixture contained the first five pilot IDs under `routeCompletions.math-to-code-pilot` with version `math-to-code-v1` before the self-paced action. At English mobile width:

- filling `X[0,0]` with `3` produced predictions `[14,5]`, residuals `[5,-2]`, squares `[25,4]`, MSE `14.5`, weight derivatives `[13,7]`, and bias derivative `3`;
- focusing reset and pressing `Enter` restored predictions `[10,5]`, residuals `[1,-2]`, squares `[1,4]`, MSE `2.5`, weight derivatives `[0,-5]`, and bias derivative `-1`;
- reduced-motion matched, the static fallback remained, and running animations were zero;
- activating “Mark as reviewed” produced six distinct route-version completion IDs;
- local-storage keys before and after were only `ml-atlas-locale` and `ml-atlas:math-lab-progress:v1`; no evidence, submission, or learning-progress key was created;
- returning to Math Lab displayed `6 / 6 completed` from the route-version store.

This status means “reviewed against `math-to-code-v1`.” It is local navigation state, not grading, formal acceptance, project submission, or a certificate. A future route version mismatch intentionally starts at `0 / 6` for re-review without deleting legacy storage.

## Automated contract boundary

`tests/math-to-code-content-contract.test.ts` is a cross-unit static/SSR contract. It checks exact concept formulas, concept code, named sections, worked outputs, ID/reference namespaces, safe Markdown, asset declarations, control source contracts, and route source contracts. It does not claim to simulate client events.

Existing mounted-client behavior tests in `tests/math-lab-layout.test.mjs` independently drive the functions lab, studio invalid-input/reset behavior, and self-paced completion. The production Playwright pass above adds real built-artifact coverage; these three layers are reported separately.

## Remaining warnings

Two existing warning classes remain, with distinct scopes:

1. Production builds warn that some minified chunks exceed `1400 kB`. Both standard and GitHub Pages builds complete successfully.
2. A Vite development server may emit browser-externalization warnings for Node-oriented dependencies such as `path`, `fs`, `url`, and `source-map-js`. This is development-only context; it was not emitted by the production preview QA, whose console reported zero warnings.
