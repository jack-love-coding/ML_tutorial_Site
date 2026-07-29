# Phase 27: Linear Regression Rebuild - Pattern Map

**Mapped:** 2026-07-29  
**Files analyzed:** 25 implementation/source groups  
**Analogs found:** 25 / 25

## Scope Interpreted from Context and Research

Phase 27 should rebuild the existing `linear-regression` lesson in place. It keeps the module slug, route, eight chapter IDs, checkpoint identities, and progress records, while replacing the current California-housing/synthetic primary story with one immutable Bike Sharing data contract and a generated bilingual notebook evidence bundle.

The planner should treat files under `public/notebooks/linear-regression/` as generated outputs, never as hand-authored source. The source of truth is the Phase 27 generator plus the already-committed Bike CSV and its existing contract.

Expected public bundle:

- `public/notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb`
- `public/notebooks/linear-regression/bike-linear-regression.en.ipynb`
- `public/notebooks/linear-regression/linear-regression-summary.json`
- `public/notebooks/linear-regression/gradient-descent-trace.csv`
- `public/notebooks/linear-regression/coefficients.csv`
- `public/notebooks/linear-regression/heldout-residuals.csv`
- `public/notebooks/linear-regression/output-manifest.json`
- the generator-declared environment/requirements records

The locked chapter order is:

1. `fit-line`
2. `multivariate`
3. `residual-loss`
4. `training-motion`
5. `polynomial`
6. `model-limits`
7. `overfitting`
8. `regularization`

## File Classification

| New/Modified File or Group | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `.gitignore` | config | file-I/O | existing Phase 26 staging exclusion in `.gitignore` | exact |
| `scripts/linear-regression/requirements.txt`, environment contract | config | batch | `scripts/loss-functions/requirements.txt` and Phase 26 environment contract | exact |
| `scripts/linear-regression/build-phase-27-assets.py` | utility/build pipeline | file-I/O, batch | `scripts/loss-functions/build-phase-26-assets.py` | exact |
| `public/notebooks/linear-regression/**` | generated data/assets | file-I/O, batch | `public/notebooks/loss-functions/**` | exact |
| `src/data/linearRegressionAssets.ts` | model/registry | file-I/O, transform | `src/data/lossFunctionsAssets.ts` | exact |
| `src/simulations/linearRegressionBike.ts` | service/utility | batch, transform | `src/simulations/lossFunctionsMath.ts` plus `scripts/python-data-tools/bikeSharingContract.mjs` | role + data-flow match |
| `src/simulations/linearRegression.ts` | service facade | request-response, transform | its existing scenario dispatcher at lines 887-899 | exact boundary match |
| `src/data/linearRegressionModule.ts` | model/content config | request-response | current module plus typed content in `src/data/lossFunctionsAssets.ts` | exact |
| `src/i18n/messages.ts` | config/content | request-response | existing linear-regression message keys | exact |
| `src/curriculum/adapters/algorithmAdapter.ts` | adapter | transform | existing `linearRegressionManifest` at lines 257-274 | exact |
| `src/components/LinearRegressionPagedLesson.vue` | page component | request-response, file-I/O | current page shell plus `LossFunctionsLessonLab.vue` loading pattern | exact |
| `src/components/LinearRegressionLessonLab.vue` | component | event-driven, request-response | current cockpit/workbench composition | exact |
| `src/components/LinearRegressionResults.vue` | component | transform | current presentation-only metric cards | exact |
| `src/components/LinearRegressionDownloads.vue` | component | file-I/O, request-response | `src/components/LossFunctionsDownloads.vue` | exact |
| `src/components/LinearRegressionUnivariateView.vue` | component | transform | current deterministic SVG view | role match |
| `src/components/LinearRegressionMultivariateView.vue` | component | transform | current SVG teaching views; `ThreeSceneShell.vue` only if 3D is retained | role match |
| `src/styles/modules/linear-regression.css` | config/style | request-response | current module stylesheet | exact |
| `src/styles/modules/linear-regression-responsive.css` | config/style | request-response | current breakpoints plus loss-functions reduced-motion rule | exact |
| `tests/linear-regression-math.test.ts` | test | batch, transform | `tests/loss-functions-math.test.ts` | exact |
| `tests/linear-regression-simulation.test.ts` | test | batch, transform | current test file, replacing California assertions | exact |
| `tests/linear-regression-assets.test.ts` | test | file-I/O, transform | `tests/loss-functions-compatibility.test.ts` | exact |
| `tests/linear-regression-notebook-assets.test.ts` | test | file-I/O, batch | `tests/loss-functions-notebook-assets.test.ts` | exact |
| `tests/linear-regression-layout.test.mjs` | test | file-I/O, transform | current layout/route structure test | exact |
| `tests/algorithm-progress.test.ts` | test | CRUD, transform | existing algorithm progress persistence tests | exact |
| `tests/curriculumProgress.test.ts` | test | CRUD, transform | existing V1-to-V2 migration tests | exact |

## Pattern Assignments

### `scripts/linear-regression/build-phase-27-assets.py` (build utility, file-I/O/batch)

**Primary analog:** `scripts/loss-functions/build-phase-26-assets.py`

Copy the Phase 26 architecture, renaming the owned paths and contract identifiers rather than simplifying it:

- repository, phase, requirements, staging, and public-root constants: lines 33-53;
- frozen source/job/transaction dataclasses: lines 60-127;
- exact candidate inventory declaration: lines 158-190;
- shared-code safety validation: lines 947-981;
- staging-root and `.gitignore` validation: lines 1156-1183;
- candidate cleanup on every exception: lines 1595-1610;
- locale-independent code blueprint and locale-specific markdown assembly: lines 3027-3070;
- isolated notebook execution and environment capture: lines 3073-3147;
- normalized code/output parity: lines 3150-3244;
- exact hashes, inventory, proof records, and rerun contract: lines 3246-3324;
- complete manifest verification: lines 3924-4023;
- transaction publish, re-verification, rollback, and cleanup: lines 4329-4515.

The key pairing pattern is one code blueprint used by both locales:

```python
# Phase 26 pattern, build-phase-26-assets.py lines 3027-3070
# Build locale-specific markdown around the same ordered code-cell blueprint.
notebook = nbformat.v4.new_notebook(
    cells=[
        *locale_markdown_cells,
        *shared_code_cells,
    ],
)
```

The planner should require equivalent Phase 27 proofs:

- both notebooks are executed independently in fresh kernels;
- ordered code cells are byte-identical across locales;
- normalized outputs are identical across locales;
- the public bundle has an exact allowlist and content hashes;
- staging occurs outside `public/`;
- publication is atomic and rolls back to the prior complete public bundle on any validation or swap failure;
- no partial selector can publish only one notebook or only selected artifacts.

Do not add a second CSV parser. Invoke or import the existing Bike contract from `scripts/python-data-tools/bikeSharingContract.mjs`, and fail before notebook execution if its schema, invariant, byte size, row count, or SHA-256 validation fails.

### `scripts/linear-regression/requirements.txt` and environment contract (config, batch)

**Analog:** Phase 26 generator configuration and its environment record, especially `build-phase-26-assets.py` lines 3119-3147.

Pin the notebook runtime used by the generator. The manifest must record the exact pins and execution identity, and verification must reject an environment record that does not match the declared requirements. Use the locked stack from research: NumPy for `lstsq`, scikit-learn for the comparison fit, and the notebook execution packages already used by Phase 26.

Add `/.cache/linear-regression/phase-27-staging` beside the existing Phase 26 staging exclusion in `.gitignore`. The generator must assert that exact entry exists and that the resolved staging root is outside `public/`.

### `public/notebooks/linear-regression/**` (generated assets, file-I/O/batch)

**Analog:** `public/notebooks/loss-functions/**`

Generate, validate, then publish this directory as one ownership unit. The manifest should enumerate every expected file, byte size, SHA-256, artifact role, and semantic contract version. Runtime code may read these files, but source modules and Vue components must not duplicate their locked numeric results.

The summary and CSV outputs must encode at least:

- source CSV hash and chronological split boundary;
- feature order `temp`, `hum`, `windspeed`, `workingday`, `hr`;
- `atemp` as a collinearity comparison only;
- `casual` and `registered` as leakage columns, never model inputs;
- train-only continuous-feature mean/scale, with `workingday` untouched;
- GD configuration and convergence reason;
- NumPy, scikit-learn, and GD coefficient/intercept vectors in one common transformed design;
- maximum method delta;
- train/test MSE, MAE, and R²;
- prediction-minus-actual residual rows;
- gradient trace and original-unit coefficient conversion.

### `src/data/linearRegressionAssets.ts` (typed registry/parser, file-I/O/transform)

**Analog:** `src/data/lossFunctionsAssets.ts`

Copy the registry shape and strict parser approach, not merely a list of strings.

**Typed IDs and descriptors** (`lossFunctionsAssets.ts` lines 1-119):

```ts
const assetIds = [
  // exact allowlisted IDs
] as const

export type AssetId = (typeof assetIds)[number]

function asset<T extends AssetDescriptor>(descriptor: T): T {
  return descriptor
}
```

Every `publicPath` should begin with `/`, every ID should be a literal union member, and chapter bindings should reference typed asset/output IDs. Use `satisfies` on the registry so missing or extra members fail during type checking.

**Strict validation helpers** (`lossFunctionsAssets.ts` lines 545-604):

```ts
function fail(path: string, message: string): never {
  throw new TypeError(`${path}: ${message}`)
}

function expectFinite(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(path, 'expected a finite number')
  }
  return value
}
```

The Phase 27 parser should:

- require the exact contract/version, dataset ID/hash, feature order, split rows, and residual sign;
- validate finite values recursively;
- reject missing keys, unexpected keys, wrong array lengths, non-finite values, incorrect row/bin shapes, and unknown statuses;
- return readonly typed data;
- dispatch only registered output IDs and throw for unknown IDs.

Pair the two notebook descriptors under the same topic/bundle ID, as Phase 26 does at lines 176-235, and connect each chapter to the minimum relevant summary/CSV/download IDs, as Phase 26 does at lines 373-424.

### `src/simulations/linearRegressionBike.ts` (pure math/service, batch/transform)

**Primary analog:** `src/simulations/lossFunctionsMath.ts`  
**Dataset analog:** `scripts/python-data-tools/bikeSharingContract.mjs`

Keep this module independent of Vue, DOM APIs, fetch, and filesystem access. Follow the finite-input/immutable-output pattern from `lossFunctionsMath.ts` lines 103-167:

```ts
function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${label} must be finite`)
  }
}

function freezeVector(values: readonly number[]): readonly number[] {
  return Object.freeze([...values])
}
```

Follow the residual convention already present in both math modules:

```ts
// lossFunctionsMath.ts lines 242-305
const residual = output[index] - target[index]
const loss = residual * residual
const gradient = 2 * residual
```

Expose pure functions for:

- chronological split metadata and transformed design construction;
- train-only means/scales and application to held-out rows;
- prediction, residual, MSE, MAE, and R²;
- batch-gradient step/trace;
- coefficient conversion back to original units;
- comparison of GD, NumPy, and scikit-learn results represented by the locked asset;
- chart-ready deterministic data derivations.

Lock these values in tests and validate them in the runtime parser:

- train rows `13_903`, test rows `3_476`;
- train boundary instant `13903` at `2012-08-07 11:00`;
- test boundary instant `13904` at `2012-08-07 12:00`;
- feature order exactly `temp`, `hum`, `windspeed`, `workingday`, `hr`;
- residual = prediction − actual;
- zero initialization, learning rate `0.1`, cap `5_000`, gradient tolerance `1e-8`;
- expected convergence at `772` updates;
- maximum cross-method delta `<= 1e-6`.

Do not copy `solveLinearSystem` from `src/simulations/linearRegression.ts` lines 75-104. The authoritative full-data solution is `numpy.linalg.lstsq`; no explicit inverse or custom normal-equation solver belongs in the production evidence path.

### `src/simulations/linearRegression.ts` (stable facade, request-response/transform)

**Analog:** its current public composition boundary at lines 887-899.

Keep existing imports stable for consuming components/tests. Replace California-specific authority and duplicated calculations with delegation to `linearRegressionBike.ts` and parsed locked outputs. The facade may adapt chapter presets into pure computation calls, but it should not:

- fetch assets;
- parse CSV;
- hard-code a second set of locked metrics;
- implement matrix inversion;
- contain UI labels or locale decisions.

Retain deterministic snapshots and readonly result shapes so `LinearRegressionLessonLab.vue` and `LinearRegressionResults.vue` remain presentation/state composition layers.

### `src/data/linearRegressionModule.ts` (typed course content, request-response)

**Analog:** the current module identity and `withTeachingFrame` boundary.

Preserve this exact identity pattern (`linearRegressionModule.ts` lines 448-458):

```ts
export const linearRegressionModule: AlgorithmModuleDefinition = {
  slug: 'linear-regression',
  route: '/learn/linear-regression',
  // ...
  checkpoints: algorithmCheckpointsBySlug['linear-regression'],
  chapters: [
```

Retain `loc(...)`, typed `AlgorithmModuleDefinition`, and the `withTeachingFrame(...)` final mapping. Rewrite the content around Bike Sharing and reorder, rather than rename, the eight existing IDs. Controls and presets remain typed (`ExperimentControl`, `ExperimentPreset`, `TrainingSnapshot`) and call the stable simulation facade.

Each chapter should close the teaching loop: question, Bike role/data, formula/variable mapping, visual or experiment, concrete numeric/code connection, misconception feedback, checkpoint/revisit path, and next step. Keep all `'zh-CN'` and `en` branches complete.

### `src/i18n/messages.ts` and `src/curriculum/adapters/algorithmAdapter.ts` (content config/adapter)

**Analogs:** existing linear-regression locale blocks (`messages.ts` lines 556-586 and 1277-1307) and `linearRegressionManifest` (`algorithmAdapter.ts` lines 257-274).

Reuse existing locale keys so callers do not break; replace housing-oriented labels with the Bike Sharing story in both locales. In the curriculum manifest, preserve the route and lesson IDs but change the array order to the locked order above.

Do not change:

- `/learn/linear-regression`;
- the eight lesson IDs;
- checkpoint IDs such as `linear-residual-mse` and `linear-regularization-validation`;
- progress storage keys or record schemas.

### `src/components/LinearRegressionPagedLesson.vue` (page component, request-response/file-I/O)

**Shell analog:** current component  
**Asset-loading analog:** `src/components/LossFunctionsLessonLab.vue`

Keep:

- `<script setup lang="ts">`;
- typed props/emits;
- sidebar generated from `module.chapters`;
- route construction `/learn/linear-regression/${section.id}`;
- `<MarkdownMathContent>` for safe rendered teaching text;
- `withPublicBase(...)` for public URLs;
- lab/results/pager composition.

Remove the hard-coded fuel/residual rows at lines 39-53 and the residual MSE computed in Vue at lines 207-209. Replace the hard-coded visual block around lines 335-443 with typed chart-ready data from the pure simulation module and locked asset registry.

Use the Phase 26 runtime loading pattern (`LossFunctionsLessonLab.vue` lines 59-113):

```ts
activeController?.abort()
activeController = new AbortController()

const response = await fetch(withPublicBase(asset.publicPath), {
  signal: activeController.signal,
  headers: { Accept: 'application/json' },
})

if (!response.ok) {
  throw new Error(`Failed to load ${asset.id}: ${response.status}`)
}

const parsed = parseLockedOutput(asset.id, await response.json())
```

Abort stale requests on chapter change and unmount. On missing, corrupt, or rejected assets, render a safe bilingual textual fallback; do not silently substitute unlocked metrics.

### `src/components/LinearRegressionLessonLab.vue` and `LinearRegressionResults.vue` (components, event-driven/transform)

**Analogs:** their current typed composition patterns.

`LinearRegressionLessonLab.vue` should retain the current pattern:

- typed props/emits at lines 1-33;
- localized labels in computed state;
- chapter predicates at lines 154-172;
- values derived from the passed snapshot at lines 174-262;
- typed control patches at lines 360-379;
- `LessonWorkbench` composition beginning around lines 382-416.

`LinearRegressionResults.vue` should continue to compute only display formatting from passed snapshots/results. It must not refit the model, recalculate the locked split, or contain duplicate numeric anchors.

Stage the lesson diagnostics in the agreed order:

1. target/feature roles and leakage warnings;
2. univariate fit/residual intuition;
3. multivariate coefficient interpretation;
4. GD trace and stop reason;
5. method-parity comparison;
6. chronological held-out metrics/residuals;
7. overfitting/regularization interpretation.

All controls need a visible label, current value, reset path, and keyboard access. Color must not be the only carrier of sign, split, leakage, or convergence state.

### `src/components/LinearRegressionDownloads.vue` (component, file-I/O)

**Analog:** `src/components/LossFunctionsDownloads.vue`

Group registered assets by kind and bind links from the registry, not literal duplicated paths. Copy the base-safe download pattern (`LossFunctionsDownloads.vue` lines 107-120):

```vue
<a
  :href="withPublicBase(asset.publicPath)"
  :download="asset.filename"
>
  {{ localized(asset.label) }}
</a>
```

Expose both executed notebooks and all declared CSV/JSON outputs. A download should only appear if the corresponding descriptor exists in the typed registry.

### `LinearRegressionUnivariateView.vue` and `LinearRegressionMultivariateView.vue` (visual components, transform)

**Primary analog:** the existing deterministic SVG derivations in `LinearRegressionUnivariateView.vue` (samples/fit/diagnostics around lines 51-133 and SVG templates around lines 299-393).

Feed chart-ready arrays from `linearRegressionBike.ts` or parsed locked outputs. Components may compute pixel scales, SVG paths, labels, focus state, and localized formatting; they should not compute regression coefficients, standardization, residual metrics, or gradient descent.

Do not extend the current hand-managed Three.js path in `LinearRegressionMultivariateView.vue`. Phase 27 needs deterministic SVG/table diagnostics and no new 3D or Manim critical path. If a retained view still uses Three.js, it must move to the project controller lifecycle:

```vue
<!-- ThreeSceneShell.vue lines 15-30 -->
onMounted(() => {
  if (containerRef.value) {
    props.controller.mount(containerRef.value)
    props.controller.update?.(props.params as TParams)
  }
})

onBeforeUnmount(() => {
  props.controller.dispose()
})
```

The controller's `dispose()` must release the renderer, animation frame, geometries, materials, textures, and listeners. The existing multivariate component's renderer-only disposal is not a sufficient pattern.

### `src/styles/modules/linear-regression*.css` (styles, request-response)

**Analogs:** current linear-regression breakpoints and `loss-functions-visuals.css` lines 936-945.

Reuse the current responsive structure:

- at `<=1080px`, stack the page/grid/results and reduce labs to one column;
- at `<=720px`, use single-column navigation/pager/actions and prevent labels or buttons from overflowing.

Add a module-local reduced-motion rule equivalent to:

```css
@media (prefers-reduced-motion: reduce) {
  .linear-regression-page * {
    scroll-behavior: auto !important;
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

Static labels, numeric values, and textual stop/error explanations must carry every key teaching fact when motion is disabled.

### `tests/linear-regression-math.test.ts` and `linear-regression-simulation.test.ts` (tests, batch/transform)

**Primary analog:** `tests/loss-functions-math.test.ts`

Copy its numerical helper and guard structure:

```ts
function closeTo(actual: number, expected: number, tolerance = 1e-9): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  )
}
```

Test independently:

- chronological split membership and exact boundary rows;
- train-only scaling and untouched `workingday`;
- exclusion of `atemp`, `casual`, and `registered` from the primary design;
- prediction-minus-actual residual sign;
- MSE, MAE, and R² formulas on small hand-checkable arrays;
- one GD update on a tiny hand-checkable design;
- zero-init locked GD trace, monotonic expected segments, finite values, stop reason, update count, and determinism;
- original-unit coefficient conversion;
- cross-method coefficient/intercept delta `<= 1e-6`;
- invalid lengths, NaN, Infinity, zero variance, empty partitions, and malformed design rows.

Replace the California-specific assertions in `tests/linear-regression-simulation.test.ts` with the Bike anchors from research. Do not make a single giant snapshot the only oracle; assert the formulas and transformations separately.

### `tests/linear-regression-assets.test.ts` (test, file-I/O/transform)

**Analog:** `tests/loss-functions-compatibility.test.ts` lines 93-203.

Assert:

- every registry path is local, begins with `/`, is represented in the manifest, and exists;
- the manifest has no unregistered or missing file;
- root and GitHub Pages `BASE_URL` resolution both work through `withPublicBase`;
- paired notebooks share a topic and code/output parity proof;
- published JSON passes the strict parser;
- wrong contract/version/hash/feature order/split/residual sign, malformed rows, non-finite values, and unknown statuses are rejected.

### `tests/linear-regression-notebook-assets.test.ts` (test, file-I/O/batch)

**Analog:** `tests/loss-functions-notebook-assets.test.ts`.

Copy these focused suites:

- paired notebooks use identical ordered code cells but localized markdown: lines 210-234;
- execution uses distinct fresh kernels: lines 236-257 and 484-524;
- public staging, partial selectors, network/shell install/raw HTML/widget code are rejected: lines 259-328;
- code and normalized outputs match across locales: lines 526-551;
- exact manifest inventory, hashes, and rerun contract: lines 665-699;
- corruption and unexpected files fail validation: lines 701-741 and 829-881;
- publish is atomic: lines 763-799;
- injected failure restores the prior bundle: lines 801-827;
- root and Pages public paths are base-safe and contain no remote runtime URLs: lines 964-990.

Add Bike-specific tampering cases: changed source SHA, shuffled rows, wrong split boundary, leakage feature added, `workingday` standardized, residual sign flipped, altered method tolerance, and edited locked metric.

### `tests/linear-regression-layout.test.mjs` (test, file-I/O/transform)

**Analog:** the existing file.

Preserve and update these contracts:

- lazy catalog load and module order: lines 10-28;
- dedicated algorithm view branch: lines 30-47;
- linear-regression routes remain before the generic algorithm route, including the base redirect: lines 49-67;
- exact eight IDs, sidebar, and pager: lines 69-102;
- cockpit/lab shell composition: lines 104-140;
- teaching-frame and animation/fallback structure: lines 190-220;
- chapter preset synchronization: lines 254-274.

Replace old California/media assertions at lines 142-188 with Bike asset registry, chapter order, bilingual copy, safe markdown, download, reduced-motion, and no-remote-runtime-asset assertions.

### `tests/algorithm-progress.test.ts` and `tests/curriculumProgress.test.ts` (tests, CRUD/transform)

**Analogs:** current persistence and migration suites.

Add a pre-rebuild `linear-regression` record containing completed lesson IDs and checkpoint attempts, then load the rebuilt manifest/order and assert:

- the same module slug resolves;
- every prior lesson ID still resolves;
- completed status and attempts remain intact;
- both checkpoint revisit targets still resolve;
- V1 source keys are left untouched while V2 state contains the merged record;
- changing lesson order does not create new IDs or discard progress.

Copy the migration invariant from `curriculumProgress.test.ts` lines 54-136: migration merges sources without mutating the original raw stores. Copy the persistence setup from `algorithm-progress.test.ts` lines 158-187, but use `linear-regression` rather than a generic module.

## Shared Patterns

### One Immutable Dataset Authority

**Source:** `scripts/python-data-tools/bikeSharingContract.mjs`

Apply to the generator, generated manifest, parser, pure simulation tests, and notebook tests.

The existing contract already owns:

- exact header/column order at lines 1-21;
- provenance/license/requirements at lines 23-48;
- field roles and normalization semantics at lines 59-86;
- the source SHA-256 at lines 88-90;
- strict parsing and validation at lines 92-324;
- artifact/manifest validation at lines 345-535;
- committed snapshot verification at lines 538-568.

Do not introduce a second source hash, alternate row count, reordered schema, or browser fetch of a remote dataset.

### Locked Mathematical Convention

Apply everywhere:

- transformed feature order is exactly `temp`, `hum`, `windspeed`, `workingday`, `hr`;
- continuous features use train-only mean/scale;
- `workingday` stays binary and unscaled;
- `atemp` is shown only for collinearity comparison;
- `casual` and `registered` are labeled leakage and excluded;
- residual means prediction − actual;
- MSE is the mean of squared residuals;
- NumPy `lstsq` is the authoritative full-data OLS reference;
- GD and scikit-learn use the exact same transformed design;
- coefficient order and intercept placement are identical in every JSON, CSV, TypeScript type, chart, and notebook table.

### Generated Evidence Has One Publication Boundary

**Source:** `build-phase-26-assets.py` lines 3207-3326, 3924-4023, and 4329-4515.

The candidate bundle must be complete and verified before public mutation. Runtime consumers trust only outputs that pass the typed parser; tests intentionally corrupt every contract layer. No Vue component may silently regenerate or “repair” a missing published result.

### Base-Safe, Abortable Runtime Loading

**Sources:** `LossFunctionsLessonLab.vue` lines 59-113 and `LossFunctionsDownloads.vue` lines 107-120.

Use `withPublicBase` for fetches, media, and downloads. Abort obsolete loads. Treat HTTP failure and parser rejection as explicit fallback states. Never embed a remote notebook, dataset, image, or iframe.

### Identity and Progress Compatibility

**Sources:** `src/router/index.ts` lines 142-149, `src/data/moduleCatalog.ts` lines 54-85, `src/utils/algorithmProgress.ts` lines 11-72, and existing progress tests.

The route stays lazy, the specific linear-regression route stays before the generic route, and storage schemas/keys are unchanged. The adapter order may change; identifiers may not.

### Safe Bilingual Rendering

Use the existing `LocalizedCopy`/`loc(...)` structures with both `'zh-CN'` and `en`. Render course markdown through `MarkdownMathContent`/`src/utils/markdownMath.ts`; do not use raw `v-html`, unsanitized notebook HTML, inline handlers, or iframes. Notebook markdown may differ by locale, while code and normalized outputs must remain identical.

## Do Not Copy

| Existing Pattern | Why It Is Not an Analog for Phase 27 |
|---|---|
| California-housing authority paths in `src/simulations/linearRegression.ts` lines 525-550 and 650-794 | Phase 27 has one Bike Sharing authority. |
| `solveLinearSystem` in `src/simulations/linearRegression.ts` lines 75-104 | Hand-rolled normal-equation solving conflicts with the locked `numpy.linalg.lstsq` reference and is numerically weaker. |
| Hard-coded fuel/residual rows and Vue-computed MSE in `LinearRegressionPagedLesson.vue` lines 39-53 and 207-209 | Core calculations and evidence must be pure, tested, and shared with generated artifacts. |
| Extending the manual Three.js lifecycle in `LinearRegressionMultivariateView.vue` | Phase 27 does not need 3D; if retained, the project requires `ThreeSceneShell` and complete disposal. |
| Hand-editing files under `public/notebooks/linear-regression/` | They are atomic generator outputs covered by hashes and parity proofs. |
| New Manim/media critical paths | The phase can satisfy every locked diagnostic with deterministic SVG, tables, JSON/CSV, and executed notebooks. |
| UI labels such as “evidence/证据” | Context explicitly rejects presenting the learner-facing UI as an evidence audit. Use teaching-oriented labels. |

## No Analog Found

There is no exact existing Bike-specific combined diagnostic view. Use the current SVG view components only for rendering mechanics and use `linearRegressionBike.ts` plus the locked asset parser for data. This is a role-match, not permission to preserve current synthetic/California values.

No new architecture is otherwise required: Phase 26 supplies the complete generation/publication/parity model, the current linear-regression lesson supplies the page/state/route shell, and the Bike contract supplies the data authority.

## Verification Sequence for Plans

1. Generate into fresh non-public staging and validate the candidate.
2. Run pure math, Bike contract, notebook parity, corruption, and rollback tests.
3. Atomically publish and re-verify the public bundle.
4. Run asset/parser/base-path tests.
5. Run simulation, content/layout, route, checkpoint, and progress migration tests.
6. Run `npm test`.
7. Run `npm run build`.
8. Run `npm run build:pages`.

The planner should keep generator/publication work earlier than frontend consumption work so UI plans can bind to a complete, typed, verified contract.

## Metadata

**Analog search scope:** `scripts/loss-functions`, `scripts/python-data-tools`, `src/data`, `src/simulations`, `src/components`, `src/modules/math-lab`, `src/styles/modules`, `src/curriculum`, `src/router`, `src/utils`, and focused `tests/` suites  
**Strong analog families:** 5  
**Files/groups scanned deeply:** 25+  
**Pattern extraction date:** 2026-07-29  
**Unrelated dirty files intentionally untouched:** `.planning/config.json`, `docs/gpt_advice.md`
