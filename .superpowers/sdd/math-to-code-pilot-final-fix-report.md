# Math-to-Code Pilot Final Fix Report

**Date:** 2026-07-11
**Result:** DONE
**Scope:** Four Important and two Minor final-review findings for the six-step Math-to-Code pilot.

## Finding-to-fix map

1. **Matrix lab contract isolation**
   - `MatrixTransformLab` now accepts backward-compatible `symbol="W"` and `emitEvidence=true` defaults.
   - All visible matrix labels and explanatory copy derive from the symbol.
   - `MathToCodeMatrixLab` is a thin wrapper using `A` and disabling evidence; the Task 6 module lazy-loads the wrapper without duplicating the lab.
   - Mounted tests preserve legacy W/evidence behavior and prove pilot A/zero-evidence/zero-storage behavior.

2. **Route-relative display semantics**
   - Dashboard cards and module heroes use route positions 1–6 when route context is valid.
   - Exact route previous/next links retain the route query; invalid or missing route context retains global order and navigation.
   - The page displays effective route prerequisites and entry assumptions without mutating global module prerequisites.

3. **Closed prerequisite override chain**
   - `LearningRoute` supports typed prerequisite overrides and localized entry assumptions.
   - The pilot declares `[]` for step 1 and the immediately previous route module for steps 2–6.
   - Pure validation rejects missing override entries, unknown assumptions/modules, and same-step or forward dependencies.

4. **Versioned local route completion**
   - Pilot completion version is `math-to-code-v1`.
   - The existing Math Lab v1 store remains in place and now optionally contains sanitized `routeCompletions`; old stores and corrupted entries load safely.
   - Legacy global completion does not count toward the pilot. Version mismatch yields 0/6. Quiz completion and studio self-review write route-specific completion while retaining compatible global markers.
   - Dashboard/summary reads route completion for versioned routes and global completion for unversioned routes.
   - UI copy says this is reviewed-version local navigation state, not grading or formal acceptance.

5. **Production browser QA depth**
   - The committed probe covers 24 module cases plus 4 Math Lab home cases across both locales and desktop/mobile viewports.
   - It checks route order 1–6, exact previous/next href maps, chapter order, 0/6 isolation from legacy global progress, matrix A copy/local-only behavior, and route-version 6/6 completion.
   - Final production preview result: 28 cases, 0 failures, zero console warnings/errors.

6. **Independent English masters**
   - Lessons 02–05 now have full `.en.md` masters beside the Chinese masters.
   - The generator only parses paired masters; the hard-coded English title/body arrays and polish rewrites were removed.
   - Tests compare every English section ID, title, and body byte-for-byte with runtime projection, and `--check` remains read-only.

## TDD evidence

- Matrix/route/progress RED: focused tests failed for missing wrapper, completion helper, validator, route display metadata, and route persistence.
- English-master RED: manuscript test failed with `ENOENT` for `02-vectors-samples.en.md`.
- Browser-probe RED: contract test failed until dashboard order, exact hrefs, A-contract, and versioned completion checks existed.
- Focused final: `node --test tests/math-to-code-*.test.ts tests/math-lab-core.test.ts tests/math-lab-layout.test.mjs` — 186 passed, 0 failed.

## Final verification

- `npm test` — 425 passed, 0 failed, 0 skipped.
- `npm run build` — passed; 2412 modules transformed. Existing chunk-size advisory only.
- `npm run build:pages` — passed; 2412 modules transformed. Existing chunk-size advisory only.
- `node scripts/generateMathToCodeRuntimeContent.mjs --check` — current.
- `node scripts/generateCurriculumV3Docs.ts` plus `git diff --exit-code -- docs/curriculum-v3` — deterministic docs current.
- `npm run security:audit` — 0 vulnerabilities.
- `node --check scripts/qa/mathToCodePilotBrowserMatrix.js` — passed.
- Fresh standard build + production preview Playwright probe — 28/28, with `matrixAContract`, `matrixLocalOnly`, and `versionedCompletion` all true.
- `git diff --check` — passed.

## Guardrails preserved

- Formal `project-math-to-code` prerequisites remain exactly Gradient Descent and Monte Carlo.
- No formal assessment, evidence persistence, uploads, grading, certificates, or backend state were introduced.
- Existing global module prerequisites, old routes, and the Math Lab v1 localStorage key remain intact.
- `docs/gpt_advice.md` was not read, modified, staged, or committed.
