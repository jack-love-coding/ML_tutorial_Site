# Phase 26: Loss Functions Rebuild - Pattern Map

**Mapped:** 2026-07-28
**Scope:** Planning analogs only; no product implementation
**Files/groups classified:** 27
**Strong analog coverage:** 24 / 27

## File Classification

| New/Modified File or Group | Role | Data Flow | Closest Existing Analog | Match |
|---|---|---|---|---|
| `scripts/loss-functions/build-phase-26-assets.py` | service / build generator | batch + file-I/O | `scripts/numerical-methods/generate-batch-4-notebook.py` | exact role |
| `public/datasets/loss-functions/lade-delivery-jilin.csv` | static model | file-I/O | `public/datasets/numerical-methods/banknote-authentication.csv` | exact role |
| `public/datasets/loss-functions/secom-manufacturing.csv` | static model | file-I/O | `public/datasets/numerical-methods/banknote-authentication.csv` | exact role |
| both dataset manifests | config / integrity contract | file-I/O | `public/datasets/numerical-methods/banknote-authentication-manifest.json` | exact role |
| `public/datasets/loss-functions/ATTRIBUTION.md` | documentation / license record | file-I/O | Batch 4 data dictionary plus source/license fields | role match |
| `public/notebooks/loss-functions/requirements.txt` | config | batch | `public/notebooks/numerical-methods/requirements.txt` | exact role |
| `public/notebooks/loss-functions/environment.json` | config | batch | `public/notebooks/numerical-methods/environment.json` | exact role |
| four `delivery-losses.*.ipynb` / `manufacturing-bce-gradients.*.ipynb` files | executable course asset | batch + file-I/O | Batch 3/4 generated executed Notebooks | role match |
| `outputs/regression-loss-summary.json` | static model | transform + file-I/O | `batch-3-outputs/finite-difference-calibration-summary.json` | role match |
| `outputs/bce-gradient-summary.json` | static model | transform + file-I/O | `batch-4-outputs/optimization-summary.json` | role match |
| `outputs/finite-difference-summary.json` | static model | transform + file-I/O | `batch-3-outputs/finite-difference-calibration-summary.json` | exact role |
| `outputs/manifest.json` | config / integrity contract | file-I/O | `public/notebooks/numerical-methods/batch-4-outputs/manifest.json` | exact role |
| `outputs/*.png` | static visual asset | batch + file-I/O | existing Notebook plots under `public/notebooks/**/outputs/` | exact role |
| `src/data/lossFunctionsAssets.ts` | typed model / registry | request-response | `src/modules/math-lab/data/numericalBatch4Notebook.ts` | exact role |
| `src/simulations/lossFunctionsMath.ts` | pure utility | transform | `src/modules/math-lab/utils/banknoteLogistic.ts` + `finiteDifference.ts` | exact role |
| `src/simulations/lossFunctions.ts` | simulation service | transform | current file plus Batch 4 pure-engine split | exact role |
| `src/data/lossFunctionsModule.ts` | typed content config | request-response | current file and `AlgorithmModuleDefinition` | exact |
| six existing `*LossLab.vue` / likelihood / NLL / MLE labs | component | event-driven + transform | their current implementations | exact |
| `src/components/LossGradientVerificationLab.vue` | component | event-driven + transform | `src/modules/math-lab/labs/FiniteDifferenceLab.vue` | role match |
| `src/components/LossFunctionsLessonLab.vue` | component registry | event-driven | current explicit chapter registry | exact |
| `src/components/LossFunctionsResults.vue` | presentation component | request-response | current section-keyed result panel | exact |
| `src/views/AlgorithmView.vue` | page controller | event-driven + request-response | current loss-functions branch | exact |
| `src/styles/modules/loss-functions*.css` and responsive/reduced-motion rules | config / presentation | event-driven | current loss styles and shared responsive overrides | exact |
| `tests/loss-functions-math.test.ts` | unit test | transform | Batch 4 stable-BCE and Batch 3 finite-difference tests | exact role |
| `tests/loss-functions-content.test.mjs` | content contract test | request-response | `tests/algorithm-progress.test.ts` + safe-markdown tests | role match |
| `tests/loss-functions-notebook-assets.test.ts` | asset/integration test | batch + file-I/O | `tests/numerical-methods-batch-3.test.ts` / Batch 4 test | exact role |
| `tests/loss-functions-compatibility.test.ts` and focused edit to `tests/algorithm-progress.test.ts` | compatibility test | request-response | current algorithm progress/route assertions | exact role |

Generated CSV, JSON, PNG, and Notebook files are generator-owned outputs. They should not be edited independently.

## Pattern Assignments

### 1. `scripts/loss-functions/build-phase-26-assets.py`

**Primary analog:** `scripts/numerical-methods/generate-batch-4-notebook.py`

Use the Batch 4 split between pinned source identity, strict validation, isolated execution, and atomic publication:

```python
# scripts/numerical-methods/generate-batch-4-notebook.py:29-56
REPO_ROOT = Path(__file__).resolve().parents[2]
CONTRACT_VERSION = "numerical-methods-batch-4-v1"
DATASET_PATH = DATASET_DIR / "banknote-authentication.csv"
DATASET_MANIFEST_PATH = DATASET_DIR / "banknote-authentication-manifest.json"
SOURCE_URL = "https://archive.ics.uci.edu/static/public/267/banknote+authentication.zip"
SOURCE_DOI = "10.24432/C55P57"
SOURCE_LICENSE = "CC BY 4.0"
SOURCE_ZIP_SHA256 = "..."
```

Copy the strict JSON rule so `NaN` and `Infinity` can never leak into standards JSON:

```python
# scripts/numerical-methods/generate-batch-4-notebook.py:141-150
def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()

def json_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode("utf-8")
```

Copy the fail-closed normalized-data validation shape:

```python
# scripts/numerical-methods/generate-batch-4-notebook.py:605-629
with path.open(encoding="utf-8", newline="") as handle:
    reader = csv.DictReader(handle)
    if reader.fieldnames != DATASET_HEADER:
        raise Batch4Error(...)
    rows = list(reader)
if len(rows) != 1372:
    raise Batch4Error(...)
...
if not all(math.isfinite(value) for value in values):
    raise Batch4Error(...)
```

Phase 26 must adapt that pattern to two independent contracts:

- LaDe: pinned revision and source hash, 31,415 rows, timestamp derivation, stable course IDs, privacy field-removal list, finite durations, frozen representative IDs.
- SECOM: pinned ZIP hash/DOI/license, 1,567 labels, observed 590 raw fields, explicit `-1 -> 0` and `1 -> 1`, missing values preserved, no invented 591st column.

Copy the manifest ownership pattern:

```python
# scripts/numerical-methods/generate-batch-4-notebook.py:657-704
return {
    "contractVersion": CONTRACT_VERSION,
    "source": {...},
    "normalizedDataset": {
        "publicPath": "...",
        "sha256": sha256_file(csv_path),
        "bytes": csv_path.stat().st_size,
        "schema": DATASET_HEADER,
        "rowCount": 1372,
    },
    "environment": {
        "requirementsSha256": sha256_file(REQUIREMENTS_PATH),
        "packages": isolated.observed_versions,
    },
}
```

Copy atomic replacement with rollback:

```python
# scripts/numerical-methods/generate-batch-4-notebook.py:765-787
for destination, backup in zip(destinations, backups, strict=True):
    if destination.exists():
        destination.replace(backup)
for source, destination in zip(sources, destinations, strict=True):
    source.replace(destination)
...
if backup.exists():
    backup.replace(destination)
```

Copy clean execution from Batch 3:

```python
# scripts/numerical-methods/generate-batch-3-notebook.py:453-463
client = NotebookClient(
    source,
    timeout=180,
    kernel_name="python3",
    allow_errors=False,
    record_timing=False,
    resources={"metadata": {"path": str(working_directory)}},
)
client.execute(cwd=str(working_directory))
```

Copy the Batch 4 transaction order:

```python
# scripts/numerical-methods/generate-batch-4-notebook.py:2081-2119
validate_environment_cache(...)
with isolated_environment(...) as isolated:
    run_notebook_worker(...)
    validate_executed_notebook(...)
    validated = validate_generated_outputs(...)
    validate_standalone(...)
    manifest = output_manifest(...)
```

Mode boundary to retain:

```python
# scripts/numerical-methods/generate-batch-4-notebook.py:2200-2231
modes.add_argument("--bootstrap-environment-cache", action="store_true")
modes.add_argument("--verify-environment", action="store_true")
modes.add_argument("--refresh-source", action="store_true")
modes.add_argument("--check", action="store_true")
...
generate_or_check(args.wheel_cache, check=args.check)
```

Phase-specific assignment:

- Network access belongs only to an explicit source-bootstrap mode.
- Ordinary generation and Notebook execution use committed local CSVs.
- `--check` must be offline and must not mutate committed/public artifacts.
- Build all two datasets, four Notebooks, summaries, figures, and manifests in staging; publish only after the complete contract passes.
- Reuse the already pinned Numerical Methods requirements and audited wheel-cache mechanics; add no package.
- Encode naive BCE failures as `{ "status": "inf" | "nan", "value": null }`.
- Do not copy Batch 4's Banknote model/training scope; Phase 26 only creates auxiliary frozen logits and output-level loss gradients.

### 2. Four locale Notebooks and output parity

**Closest analogs:** Batch 3 cell builders and Batch 4 isolated execution.
**No exact repository analog exists for two topics × two separately executed locales.**

Reuse stable cell IDs and programmatic cells:

```python
# scripts/numerical-methods/generate-batch-3-notebook.py:44-63
def markdown(cell_id: str, source: str):
    cell = nbformat.v4.new_markdown_cell(source.strip())
    cell["id"] = cell_id
    return cell

def code(cell_id: str, source: str):
    cell = nbformat.v4.new_code_cell(source.strip())
    cell["id"] = cell_id
    return cell
```

New Phase 26 logic must provide:

1. one shared ordered code-cell source per topic;
2. separate zh-CN/en markdown dictionaries only;
3. four fresh `NotebookClient` executions, never output copying;
4. exact paired cell-ID and code-source equality;
5. normalized semantic output equality and hashes per locale pair;
6. no runtime `requests`, `urllib`, Hugging Face, or UCI fetch cell;
7. execution counts beginning at 1, no error outputs, stripped timing/widget state.

The parity implementation must follow `26-RESEARCH.md`; it cannot be inferred by copying one existing file.

### 3. `src/data/lossFunctionsAssets.ts`

**Analog:** `src/modules/math-lab/data/numericalBatch4Notebook.ts`

Reuse the shared downloadable asset type:

```typescript
// src/modules/math-lab/data/amesNumericalNotebook.ts:9-14
export interface DownloadableCourseAsset {
  publicPath: string
  filename: string
  label: LocalizedCopy
  description: LocalizedCopy
}
```

Reuse the typed chapter/output lookup:

```typescript
// src/modules/math-lab/data/numericalBatch4Notebook.ts:9-21, 180-186
export interface NumericalBatch4NotebookCompanion {
  moduleId: (typeof numericalBatch4ChapterIds)[number]
  title: LocalizedCopy
  description: LocalizedCopy
  notebook: DownloadableCourseAsset
  dataset: DownloadableCourseAsset
  requirements: DownloadableCourseAsset
  supportingDownloads: readonly DownloadableCourseAsset[]
  outputId: '...' | '...'
}

const companions = { ... } as const satisfies Record<..., NumericalBatch4NotebookCompanion>
```

Phase 26 should define its own algorithm-course asset types rather than importing a Math Lab-specific companion union. Keep:

- root-relative `publicPath`;
- exact `filename`;
- bilingual label and description;
- topic ID / chapter ID / output ID unions;
- two locale-specific Notebook assets per topic;
- dataset, manifest, attribution, requirements, environment, summaries, and plots as typed supporting downloads;
- a chapter-keyed resolver consumed by the loss page.

Do not copy Notebook-derived numeric values into this descriptor. Numeric authority remains locked JSON plus the independently tested TypeScript math.

Resolve every rendered link through:

```typescript
// src/utils/publicPath.ts:17-29
export function withPublicBase(path?: string, baseUrl = getBaseUrl()) {
  if (!path || !path.startsWith('/') || isExternalOrSpecialPath(path)) return path
  if (baseUrl === '/' || path.startsWith(baseUrl)) return path
  return `${baseUrl.replace(/\/$/, '')}${path}`
}
```

### 4. `src/simulations/lossFunctionsMath.ts`

**Primary analogs:** `src/modules/math-lab/utils/banknoteLogistic.ts` and `src/modules/math-lab/utils/finiteDifference.ts`.

Reuse the stable formulas:

```typescript
// src/modules/math-lab/utils/banknoteLogistic.ts:245-256
export function stableSigmoid(value: number): number {
  if (value >= 0) return 1 / (1 + Math.exp(-value))
  const exponential = Math.exp(value)
  return exponential / (1 + exponential)
}

export function softplus(value: number): number {
  return Math.max(value, 0) + Math.log1p(Math.exp(-Math.abs(value)))
}

export function stableBinaryCrossEntropy(logit: number, target: 0 | 1): number {
  return softplus(logit) - target * logit
}
```

Reuse the guard style, upgraded for each public scalar/vector function:

```typescript
// src/modules/math-lab/utils/banknoteLogistic.ts:271-292
if (features.length === 0 || features.length !== targets.length) {
  throw new RangeError('Features and targets must have the same non-zero row count.')
}
if (!Number.isFinite(l2) || l2 < 0) throw new RangeError(...)
...
if (targets[index] !== 0 && targets[index] !== 1) throw new RangeError(...)
```

Reuse the central-difference structure, not its permissive `NaN` return:

```typescript
// src/modules/math-lab/utils/finiteDifference.ts:65-82
if (method === 'central') {
  return (fn(x + h) - fn(x - h)) / (2 * h)
}
```

Required Phase 26 exports should cover:

- per-element and mean MSE/MAE;
- `d(loss_i)/d(yhat_i)` and `d(mean)/d(yhat_i)`;
- MAE `{ gradient, differentiable }` with zero residual convention `0`;
- stable sigmoid/softplus/BCE from logits;
- BCE per-element and mean gradients;
- ordinary probability-BCE comparison only;
- coordinate central difference and `h` sweep;
- absolute and scaled relative error;
- explicit fixed-probe status objects.

Reject empty arrays, unequal shapes, non-finite values, non-positive steps, and non-binary labels. Never use `nan_to_num`, silent clipping, or `Number.NaN` as an invalid-input fallback. The existing `finiteDifferenceDerivative()` line 71 returns `NaN` for bad `h`; do **not** copy that behavior.

### 5. `src/simulations/lossFunctions.ts`

**Analog:** current deterministic snapshot composition.

The current file already demonstrates the service boundary:

```typescript
// src/simulations/lossFunctions.ts:228-247
export function simulateLossFunctions(config: ExperimentConfig): ModuleSimulation {
  const regressionLossKind = String(config.regressionLossKind ?? 'mse') as 'mse' | 'mae'
  ...
  const targetValue = Number(config.targetValue ?? 1.2)
  ...
}
```

and one composed typed snapshot:

```typescript
// src/simulations/lossFunctions.ts:357-425
const snapshot: TrainingSnapshot = {
  step: 0,
  loss: ...,
  lossCurves: ...,
  selectedObservation: ...,
  sampleLossBreakdown,
}
return { snapshots: [snapshot] }
```

Refactor it to import pure primitives from `lossFunctionsMath.ts`; do not leave duplicate `mse`, `mae`, probability clipping, or gradient code in this orchestration file. Preserve the existing snapshot/preset consumer contract where possible. Use frozen representative rows/output IDs, not a second handwritten numeric fixture.

Important replacement: current BCE clamps probabilities to `0.01..0.99` (`src/simulations/lossFunctions.ts:11-13, 27-41`). That is not the Phase 26 canonical BCE and must survive only as an explicitly labeled clipped-comparison branch if retained.

### 6. `src/data/lossFunctionsModule.ts`

**Analogs:** current module plus `src/types/ml.ts`.

Keep the outer typed identity unchanged:

```typescript
// src/data/lossFunctionsModule.ts:1-15
export const lossFunctionsModule: AlgorithmModuleDefinition = {
  slug: 'loss-functions',
  route: '/learn/loss-functions',
  ...
  checkpoints: algorithmCheckpointsBySlug['loss-functions'],
  chapters: [
```

Continue to use the existing schema:

```typescript
// src/types/ml.ts:390-424, 461-478
export interface StorySection {
  id: string
  markdown: LocalizedCopy
  callout: LocalizedCopy
  experimentPrompt?: LocalizedCopy
  layoutMode?: 'story' | 'embedded-lab'
  embeddedLabId?: string
  sources?: ModuleSourceReference[]
}

export interface AlgorithmModuleDefinition {
  slug: ModuleSlug
  route: string
  chapters: StorySection[]
  ...
}
```

Preserve these six IDs and embedded-lab identities:

| Chapter | Current lab ID |
|---|---|
| `why-loss` | `loss-functions-overview` |
| `regression-losses` | `regression-loss-lab` |
| `classification-losses` | `classification-loss-lab` |
| `likelihood-intuition` | `likelihood-intuition-lab` |
| `negative-log` | `negative-log-lab` |
| `mle-bridge` | `mle-bridge-lab` |

Append one explicit gradient-verification chapter/lab. Do not reorder or rename the six existing chapters. Keep every learner-facing object bilingual and render formulas through `MarkdownMathContent`; do not introduce raw HTML.

Prefer the separate `lossFunctionsAssets.ts` resolver over extending global `StorySection` solely for one module. Extend `src/types/ml.ts` only if multiple algorithm modules need the same typed asset contract.

### 7. Loss labs, result panel, and chapter registry

**Current registry analog:** `src/components/LossFunctionsLessonLab.vue`.

Reuse typed props/emits:

```typescript
// src/components/LossFunctionsLessonLab.vue:10-20
const props = defineProps<{
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
  accent: string
  section: StorySection
}>()
const emit = defineEmits<{
  'update-config': [key: string, value: ExperimentConfigValue]
  'patch-config': [config: Partial<ExperimentConfig>]
}>()
```

Preserve explicit chapter routing. The current final catch-all is unsafe:

```vue
<!-- src/components/LossFunctionsLessonLab.vue:65-71 -->
<MleBridgeLab v-else ... />
```

Replace it with explicit `mle-bridge` and gradient-verification branches. Unknown IDs must not silently mount MLE.

**Interaction analog:** `RegressionLossLab.vue`.

Keep controls bounded and labelled with current values:

```vue
<!-- src/components/RegressionLossLab.vue:225-255 -->
<label class="control">
  <span class="control__row">
    <span>{{ copy.target }}</span>
    <strong>{{ round(targetValue) }}</strong>
  </span>
  <input type="range" min="-2.5" max="2.5" step="0.05" ... />
</label>
```

Vue owns current selection and display only; it must call pure math/simulation functions rather than reproduce formulas.

**Gradient lab analog:** `src/modules/math-lab/labs/FiniteDifferenceLab.vue`.

Reuse its pure-utility import and readable bounded `h` slider:

```typescript
// src/modules/math-lab/labs/FiniteDifferenceLab.vue:4-9, 79-88
import { evaluateFiniteDifference, evaluateLectureGradient } from '../utils/finiteDifference'
const evaluation = computed(() => evaluateFiniteDifference({...}))
```

```vue
<!-- src/modules/math-lab/labs/FiniteDifferenceLab.vue:183-239 -->
<input v-model.number="hPower" type="range" min="-12" max="-1" step="1" />
...
<strong>{{ formatNumber(evaluation.absoluteError, 5) }}</strong>
```

Phase 26 should show loss kind, selected element, analytic per-element/mean gradient, central difference, error, tolerance/status, and an `h` sweep. At MAE residual zero, render a text `nondifferentiable` state rather than a pass badge.

**Results analog:** `src/components/LossFunctionsResults.vue:27-244`.

Continue its `activeSectionId`-keyed panel pattern, but consume typed locked summary entries instead of copying Notebook values into computed blocks. Keep the Softmax result concise; make the seventh chapter own gradient-verification results.

For interleaved code and fixed outputs, reuse:

```vue
<!-- src/modules/math-lab/components/CodeLab.vue:16-39 -->
await navigator.clipboard.writeText(props.code)
...
<button v-if="code" type="button" ...>{{ copied ? copiedLabel : copyLabel }}</button>
<pre><code>{{ code }}</code></pre>
<div v-if="output">...</div>
```

The consolidated download area may follow `MathLabNotebookCompanion.vue:20-30, 41-100`: resolve all links with `withPublicBase`, localize asset text, and render supporting downloads plus `CodeLab`. Keep this loss-specific unless a genuinely shared algorithm companion emerges.

### 8. `src/views/AlgorithmView.vue`

Reuse the existing lazy boundary:

```typescript
// src/views/AlgorithmView.vue:31-40
const LossFunctionsLessonLab = defineAsyncComponent(
  () => import('../components/LossFunctionsLessonLab.vue'),
)
const LossFunctionsResults = defineAsyncComponent(
  () => import('../components/LossFunctionsResults.vue'),
)
```

Keep deep-link behavior untouched:

```typescript
// src/views/AlgorithmView.vue:134-170
const nextModuleDefinition = await loadAlgorithmModule(nextSlug)
...
const matchedChapter = nextModuleDefinition.chapters.find(
  (chapter) => chapter.id === nextChapterId,
)
if (!matchedChapter) router.replace(`/learn/${nextSlug}/${firstChapterId}`)
```

Keep the existing loss page composition:

```vue
<!-- src/views/AlgorithmView.vue:590-611 -->
<StoryScroller :sections="moduleDefinition.chapters" ...>
  <MarkdownMathContent :source="slotLocalizedText(section.markdown)" />
  <LossFunctionsLessonLab
    v-if="section.layoutMode === 'embedded-lab'"
    :config="experiment.config"
    :snapshot="snapshot"
    :section="section"
  />
</StoryScroller>
```

Keep checkpoint wiring:

```vue
<!-- src/views/AlgorithmView.vue:795-808 -->
<AlgorithmCheckpointQuiz
  :module-slug="moduleDefinition.slug"
  :module-route="moduleDefinition.route"
  :checkpoints="moduleDefinition.checkpoints"
/>
<LossFunctionsResults ... />
```

Do not move large dataset or Notebook code into `AlgorithmView.vue`. Limit changes to mounting the typed companion/download output at the correct chapter/end position and adding the seventh chapter guide/bridge copy if needed.

### 9. Styles

Reuse existing module-local files:

- `src/styles/modules/loss-functions.css` for course panels and controls.
- `src/styles/modules/loss-functions-visuals.css` for charts/tables/gradient visual semantics.
- existing responsive collapse pattern in `src/styles/modules/linear-regression-responsive.css:1-66`.
- existing loss reduced-motion list in `src/styles/overrides/final-shell.css:1050-1069`.

New tables must scroll or stack at 390 px; labels/shapes must accompany color. Add any new animated class to the existing reduced-motion rule. Do not create a UI framework or place a large global style block in the Vue component.

### 10. Tests

**Asset/integrity analog:** `tests/numerical-methods-batch-3.test.ts`.

```typescript
// tests/numerical-methods-batch-3.test.ts:24-40, 68-87
function absolutePublicPath(publicPath: string): string {
  assert.match(publicPath, /^\//)
  return resolve(root, 'public', publicPath.slice(1))
}
function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}
...
for (const item of [manifest.notebook, ...manifest.outputs]) {
  const path = absolutePublicPath(item.publicPath)
  assert.equal(existsSync(path), true)
  assert.equal(sha256(path), item.sha256)
  assert.equal(statSync(path).size, item.bytes)
}
```

**Numerical parity analogs:**

```typescript
// tests/numerical-methods-batch-3.test.ts:188-202
assert.ok(Math.abs(logitCalibrationResidual(0.35) - expected) < tolerance)
const finite = evaluateFiniteDifference({...})
assert.ok(finite.absoluteError < 5e-12)
```

```typescript
// tests/numerical-methods-batch-4.test.ts:650-677
assert.equal(engine.stableBinaryCrossEntropy(1000, 0), 1000)
assert.equal(engine.stableBinaryCrossEntropy(-1000, 1), 1000)
...
const centeredDifference = parameters.map((_, index) => ...)
assert.ok(maximumError <= 2e-9)
```

Phase 26 must additionally assert:

- per-example and mean objective values match TS and locked JSON;
- mean gradients include the `1/n` factor;
- zero-residual MAE is nondifferentiable and excluded from equality acceptance;
- all 10 `(logit, label)` fixed probes have explicit naive/clipped/stable status;
- stable BCE stays finite at `±1000`; clipping is labelled objective-changing;
- four Notebooks exist, run cleanly, have identical locale-pair code cells and normalized outputs;
- no Notebook runtime network code;
- dataset source/normalized/generator/requirements/Notebook/output/figure hashes and schemas;
- LaDe removed-field contract and SECOM observed 590-column discrepancy;
- both `/` and `/ML_tutorial_Site/` paths via `withPublicBase`;
- failure injections for hash, schema, missing license, locale code/output drift, missing asset, and route/checkpoint rename.

**Compatibility analog:** `tests/algorithm-progress.test.ts`.

Keep all storage keys exact (`lines 79-90`) and update only the loss chapter set at line 240 to append the seventh ID. Preserve the existing completion/quiz persistence assertions at lines 158-186.

## Compatibility Boundaries: Verify, Do Not Rebuild

| Boundary | Existing Authority | Required Phase 26 Behavior |
|---|---|---|
| module/route | `lossFunctionsModule.ts:5-14` | keep `loss-functions` and `/learn/loss-functions` |
| curriculum manifest | `src/curriculum/routeManifest.ts:107-113` | keep route and `firstLessonId: 'why-loss'` |
| canonical deep links | `src/curriculum/routes.ts:16-43` | seventh `/learn/loss-functions/<id>` resolves through existing algorithm path |
| lazy module load | `src/data/moduleCatalog.ts:48-50` | keep one loader; no duplicate module |
| navigation identity | `src/data/navigationMenus.ts:90-93` | keep one Model Foundations entry |
| checkpoints | `src/data/algorithmCheckpoints.ts:472-505` | keep IDs `loss-error-rule`, `loss-nll-scale` and current revisit targets |
| Progress V1 | `src/utils/algorithmProgress.ts:11-41` | keep `ml-atlas:algorithm-progress:v1`; no migration |
| Progress V2 | existing curriculum progress adapters/tests | no key/schema deletion or migration |
| safe rendering | `MarkdownMathContent` / `markdownMath.ts` | no unsanitized raw HTML |
| public base | `src/utils/publicPath.ts:17-29` | all public links base-safe |
| reduced motion | `final-shell.css:1050-1069` | new animation is optional and cannot carry unique teaching meaning |

No edits should be required in `src/router/index.ts`, `src/curriculum/routeManifest.ts`, `src/curriculum/routes.ts`, `src/data/moduleCatalog.ts`, `src/data/navigationMenus.ts`, `src/utils/algorithmProgress.ts`, or `src/data/algorithmCheckpoints.ts`. Lock them with compatibility tests instead.

## Shared Patterns

### Validation and error handling

- Generator: dedicated phase error type, fail closed, include artifact/file context.
- Pure TypeScript: throw `RangeError`/`TypeError` for invalid public inputs.
- Vue: bounded controls and readable status; do not repair invalid math silently.
- JSON: `allow_nan=False`; non-finite demonstrations use status + `null`.

### Single numerical authority

- Python generator owns local datasets, representative row IDs, OOF logits, locked output JSON, plots, and Notebook execution.
- TypeScript independently recomputes only the page/lab fixtures from the same frozen contract.
- Components reference typed output IDs and pure functions, never freehand duplicated numbers.

### Accessibility and fallback

- Range/select labels include current values.
- SVG has localized text context/`aria-label`.
- Status is text plus shape/label, not color alone.
- The fixed extreme table remains readable without animation.
- Dataset/Notebook load failure leaves the conceptual lesson and worked calculation visible.

## No Exact Analog Found

| File/Concern | Why | Planner Direction |
|---|---|---|
| four separately executed bilingual Notebooks with exact code/output parity | existing Numerical Methods Notebooks are single-locale | implement the explicit shared-code/locale-markdown parity contract from `26-RESEARCH.md` |
| one generator publishing two independently licensed datasets plus four Notebooks atomically | Batch 4 owns one dataset/one Notebook | extend the transaction inventory; never publish a partial topic |
| LaDe privacy-minimized redistribution and ambiguous README wording | no equivalent data-policy edge in current assets | require the documented pre-publication human license checkpoint; fail rather than synthesize |

## Anti-Patterns to Reject in Plans

- Canonical BCE implemented by clipping probabilities.
- Full logistic-regression parameter-gradient or training lesson.
- Full multiclass Softmax expansion.
- Runtime external dataset fetch.
- Browser loading the full 590-feature SECOM table when the page only needs locked summaries.
- One executed locale with outputs copied into the other.
- Notebook/output numbers pasted manually into Vue or prose.
- Unknown chapter falling through to `MleBridgeLab`.
- Renaming module, route, checkpoints, progress keys, or the six current chapter IDs.
- Modifying `src/types/ml.ts` for a loss-only descriptor when a local typed registry suffices.
- New media before labs/plots reveal a specific explanatory gap.

## Metadata

**Primary analogs read:** Batch 3/4 generators and tests, numerical Notebook descriptors/companion, loss module/simulation/labs/results, finite-difference and stable-BCE utilities, Algorithm view, public path, route manifest, progress/checkpoint contracts, and loss styles.
**Search scope:** `scripts/`, `public/notebooks/`, `src/data/`, `src/simulations/`, `src/components/`, `src/modules/math-lab/`, `src/curriculum/`, `src/utils/`, `src/styles/`, `tests/`.
**Protected unrelated work:** `.planning/config.json`, `docs/gpt_advice.md`, and `.planning/research/` were not modified.
