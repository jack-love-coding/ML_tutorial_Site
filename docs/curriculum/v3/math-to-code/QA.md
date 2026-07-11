# Mathematics-to-Code Pilot QA

**Date:** 2026-07-11
**Status:** Passed with one existing development/build warning class
**Scope:** Six promoted Math Lab modules and the `math-to-code-pilot` route

## Environment

- macOS workspace: `/Users/jackky/Desktop/ML_tutorial_Site/.worktrees/math-to-code-pilot`
- App server: Vite development server at `http://127.0.0.1:4173`
- Browser driver: Playwright CLI wrapper from `~/.codex/skills/playwright/scripts/playwright_cli.sh`
- Browser user agent reported by the session: `HeadlessChrome/150.0.0.0`
- Locales: `zh-CN` and `en`
- Viewports: desktop `1440 × 1000`; mobile `390 × 844`
- Motion modes: default and `prefers-reduced-motion: reduce`

The browser session used a temporary local Math Lab progress record to put the first five pilot modules in the completed set. The studio completion control then produced the sixth local completion. No screenshots or traces were retained.

## Paths inspected

- `/math-lab/modules/calculus-functions-rate-change?route=math-to-code-pilot`
- `/math-lab/modules/linear-algebra-feature-space?route=math-to-code-pilot`
- `/math-lab/modules/numpy-mathematics-implementation?route=math-to-code-pilot`
- `/math-lab/modules/math-to-code-guided-studio?route=math-to-code-pilot`
- `/math-lab`

The remaining matrix and derivative route edges are covered by the route contract test, which verifies all six previous/next positions.

## Browser steps and observations

1. Opened the Chinese functions lesson at desktop width and took a CLI snapshot before interaction.
   - The range exposed a visible label, current value, bounds-backed native slider, reset button, prediction/residual/MSE text, and the full static table.
   - Keyboard `ArrowRight` changed `w1` from `4` to `4.5`; prediction became `11`, residual `2`, and the row labelled “当前设置” moved to `4.5`.
   - Reset restored `w1 = 4`.
   - The pilot “下一章” link opened the vector lesson and preserved `?route=math-to-code-pilot`; the vector page exposed both route-relative previous and next links.

2. Switched the vector lesson to English, then inspected it at mobile width.
   - English title, body, previous link, and next link were visible.
   - `document.documentElement.scrollWidth` equalled `390`; the interactive-element overlap probe returned no overlaps.

3. Opened NumPy at mobile width in both Chinese and English.
   - The page exposed the Task 1 outputs `predictions=[10,5]`, `MSE=2.5`, the shared `x`, `X`, `w`, `b`, `y_hat`, `y`, `L` ledger, and route-relative links to derivatives and the studio.
   - All same-page review links resolved to existing elements.
   - There was no page-level horizontal overflow at `390` px.

4. Followed the NumPy “Next chapter” link to the English guided studio.
   - The nine-stage lesson, nine labelled number inputs, reset button, static intermediate table, and route-relative previous link were present.
   - Editing `X[0,0]` from `2` to `3` changed the visible results to predictions `[14, 5]`, residuals `[5, -2]`, squared errors `[25, 4]`, MSE `14.5`, weight derivatives `[13, 7]`, and bias derivative `3`.
   - Focusing Reset and pressing `Enter` restored the baseline: predictions `[10, 5]`, residuals `[1, -2]`, squared errors `[1, 4]`, MSE `2.5`, weight derivatives `[0, -5]`, and bias derivative `-1`.
   - The browser local-storage inspection showed only locale and Math Lab progress keys; the lab interactions did not create learning-evidence or submission storage.

5. Emulated `prefers-reduced-motion: reduce` after a fresh snapshot.
   - `matchMedia('(prefers-reduced-motion: reduce)').matches` returned `true`.
   - The studio's static fallback remained a `TABLE` and the page reported zero running animations.

6. Focused “Mark as reviewed” and pressed `Enter`.
   - The control changed to “Reviewed locally” and retained the statement that the state is not graded or formal acceptance.
   - The local completed-module set contained the six distinct pilot IDs.
   - Returning to Math Lab displayed `6 / 6 completed` on the Math-to-Code Pilot Route.
   - All six dashboard links included `?route=math-to-code-pilot`.

7. Rechecked the route home at desktop width.
   - `scrollWidth` equalled the `1440` px viewport width.
   - The interactive-element overlap probe returned no overlaps.
   - No empty or `#`-only links were found in the inspected route surface.

## Automated contract observations

- All six module IDs are registered in exact pilot order.
- Section, concept, lab, quiz, and misconception IDs are globally unique across the six modules.
- Section-to-lab/visual links, quiz-to-misconception links, quiz review links, Markdown anchors, prerequisites, and next-module references resolve in their correct scopes.
- Both locales have paired section titles and bodies, and every body passes the repository Markdown/KaTeX sanitizer path.
- Task 1 remains the numerical oracle: prediction `10`, batch predictions `[10,5]`, MSE `2.5`, scalar derivative `6`, weight sensitivities `[0,-5]`, and bias sensitivity `-1`.
- Public paths preserve GitHub Pages base rebasing; source links use deployable HTTPS URLs.
- Both pilot labs retain bounded/finite input handling, reset controls, text/table fallbacks, reduced-motion CSS, and no evidence-emission contract.

## Fixes made during Task 8

- Added `tests/math-to-code-content-contract.test.ts` for the cross-unit contract.
- The first focused run exposed an over-strict test assumption that a promoted module and its runtime registry record must be the same object. Existing architecture intentionally preserves global-route `order` and `nextModuleIds` while reusing the promoted teaching collections. The test was corrected to assert registration plus shared section, concept, lab, quiz, and misconception records. No production code was changed.
- No runtime content, component, route, utility, or style defect was evidenced by Task 8, so no production fix was made.

## Remaining warnings

- Standard and GitHub Pages builds retain the existing warning that some minified chunks exceed `1400 kB`.
- The Vite development browser session emitted 19 warnings that Node modules such as `path`, `fs`, `url`, and `source-map-js` were externalized for browser compatibility. The browser console reported zero errors, the production builds completed, and this warning class was not introduced or changed by Task 8.
