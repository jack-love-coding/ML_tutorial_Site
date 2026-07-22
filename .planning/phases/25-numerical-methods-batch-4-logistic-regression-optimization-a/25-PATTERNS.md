# Phase 25: Numerical Methods Batch 4 — Logistic Regression Optimization and Training Diagnostics - Pattern Map

**Mapped:** 2026-07-21

**Scope source:** `25-CONTEXT.md` and `25-RESEARCH.md`

**Individual files/file slots classified:** 55

**Primary analog families:** Numerical Methods Batch 3 enhancer/Notebook/generator/media/tests; current optimization and training-diagnostics surfaces

**Rule:** This map describes implementation patterns only. Phase 25 must not replace module IDs, routes, checkpoints, Progress storage, or the existing lab component identities.

## File Classification

Grouped rows expand wildcards explicitly in the notes below. “Exact” means the role and data flow match an implemented Batch 3 seam. “Partial” means the project has reusable sub-patterns but no existing real-data logistic state machine.

| New/Modified File(s) | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `docs/curriculum-v3/numerical-methods/batch-4-contract.md` | config/documentation | batch | `docs/curriculum-v3/numerical-methods/batch-3-contract.md` | exact |
| `docs/curriculum-v3/numerical-methods/batch-4-imagegen-prompts.md` | documentation/config | batch | `docs/curriculum-v3/numerical-methods/batch-3-imagegen-prompts.md` | exact |
| `docs/curriculum-v3/numerical-methods/manim/{banknote-feature-scaling,banknote-fixed-vs-armijo,banknote-training-diagnostics}-{transcript.zh-CN.md,summary.en.md,labels.json}` (9 files) | media documentation/config | batch | Existing `logit-calibration-finite-difference-*` and `logit-calibration-root-finding-*` document packages | role-match |
| `public/datasets/numerical-methods/banknote-authentication.csv` | static dataset | file-I/O | `public/datasets/numerical-methods/sms-spam.csv` plus the Batch 3 fixture contract | role-match |
| `public/datasets/numerical-methods/banknote-authentication-manifest.json` | config/manifest | file-I/O | `public/datasets/numerical-methods/logit-calibration-manifest.json` | exact |
| `public/datasets/numerical-methods/banknote-authentication-data-dictionary.json` | config/data dictionary | file-I/O | `public/datasets/numerical-methods/sms-spam-data-dictionary.json` | exact |
| `public/notebooks/numerical-methods/banknote-logistic-optimization.zh-CN.ipynb` | generated teaching notebook | batch | `public/notebooks/numerical-methods/logit-bias-calibration.zh-CN.ipynb` | exact |
| `public/notebooks/numerical-methods/requirements.txt` | config | batch | same file, lines 1-7 | exact |
| `public/notebooks/numerical-methods/batch-4-outputs/{optimization-summary.json,training-diagnostics-summary.json,banknote-training-traces.json,banknote-training-traces.csv,manifest.json}` (5 files) | generated fixtures/manifests | batch | `public/notebooks/numerical-methods/batch-3-outputs/*` | exact structure; expanded trace schema |
| `public/math-lab/numerical-methods/banknote-optimization-diagnostics.png` | static visual asset | file-I/O | `public/math-lab/numerical-methods/finite-difference-root-finding-calibration.png` | exact |
| `public/manim/numerical-methods/{banknote-feature-scaling,banknote-fixed-vs-armijo,banknote-training-diagnostics}.{mp4,png}` (6 files) | generated media | streaming/static file-I/O | Batch 3 MP4/poster pairs | exact |
| `public/manim/numerical-methods/batch-4-metadata.json` | media manifest | file-I/O | `public/manim/numerical-methods/batch-3-metadata.json` | exact |
| `scripts/numerical-methods/generate-batch-4-notebook.py` | build utility | batch/file-I/O | `scripts/numerical-methods/generate-batch-3-notebook.py` | exact |
| `scripts/manim/render_numerical_methods_batch_4.py` | build utility | batch/file-I/O | `scripts/manim/render_numerical_methods_batch_3.py` | exact |
| `scripts/manim/numerical_methods_batch_4/{common.py,palette.py}` | media utility/config | transform | Batch 3 `common.py` and `palette.py` | exact |
| `scripts/manim/numerical_methods_batch_4/{banknote_feature_scaling,banknote_fixed_vs_armijo}.py` (2 files) | media scene | batch/transform | Existing `scripts/manim/numerical_methods_batch_3/calibration_finite_difference.py` and `calibration_root_finding.py` | role-match |
| `scripts/manim/numerical_methods_batch_4/banknote_training_diagnostics.py` | media scene | batch/transform | No exact Batch 3 trace scene; use `25-RESEARCH.md`, `scripts/manim/scenes/ai_bridge_math.py` curve staging, and `scripts/manim/ai_overview/linear_regression_parameter_search.py` marker staging | partial |
| `scripts/manim/numerical_methods_batch_4/{banknote_feature_scaling,banknote_fixed_vs_armijo}_{prompt.md,tree.json}` (4 files) | media source/config | batch | Existing Batch 3 `calibration_finite_difference_{prompt.md,tree.json}` and `calibration_root_finding_{prompt.md,tree.json}` pairs | exact |
| `scripts/manim/numerical_methods_batch_4/banknote_training_diagnostics_{prompt.md,tree.json}` (2 files) | media source/config | batch | `25-RESEARCH.md` exact diagnostic contract plus the closest real curve/marker sources above | partial |
| `src/modules/math-lab/data/numericalBatch4Modules.ts` | content enhancer/provider | transform | `src/modules/math-lab/data/numericalBatch3Modules.ts` | exact |
| `src/modules/math-lab/data/numericalBatch4Notebook.ts` | typed data/provider | request-response | `src/modules/math-lab/data/numericalBatch3Notebook.ts` | exact |
| `src/modules/math-lab/utils/banknoteDataset.ts` | utility/data loader | file-I/O/request-response | `scripts/python-data-tools/bikeSharingContract.mjs` + `src/utils/pythonDataToolsOutputs.ts` | partial |
| `src/modules/math-lab/utils/banknoteLogistic.ts` | utility/service | transform/batch | `src/modules/math-lab/utils/optimizers.ts` + `logitCalibration.ts`; numerical contract in `25-RESEARCH.md` | partial |
| `src/modules/math-lab/labs/MathGradientLab.vue` | component | event-driven | current file plus `OptimizerRaceLab.vue` preset conventions | self-extension |
| `src/modules/math-lab/labs/TrainingDiagnosticsLab.vue` | component | event-driven/transform | current file | self-extension |
| `src/modules/math-lab/utils/aiBridgeMath.ts` | utility | transform | current `evaluateTrainingScenario` implementation | preserve; optional additive typing only |
| `src/modules/math-lab/components/MathLabNotebookCompanion.vue` | component | request-response | current file | self-extension |
| `src/modules/math-lab/pages/MathLabModulePage.vue` | page/route composition | request-response | current Batch 1-3 companion resolver and async lab registry | self-extension |
| `src/modules/math-lab/data/modules.ts` | config/provider composition | transform | current enhancer chain | exact extension |
| `src/styles/modules/math-lab.css` | shared module styles | responsive layout | current notebook companion block and mobile collapse | self-extension |
| `tests/numerical-methods-batch-4.test.ts` | test | batch/CRUD-like fixture assertions | `tests/numerical-methods-batch-3.test.ts` | exact, with new engine/state tests |
| `tests/numerical-methods-batch-4-manim.test.ts` | test | batch/file-I/O | `tests/numerical-methods-batch-3-manim.test.ts` | exact |

## Pattern Assignments

### Contract, dataset, Notebook, outputs, and requirements

**Apply to:** `batch-4-contract.md`, the three dataset files, executed Notebook, five output files, and `requirements.txt`.

**Analog:** `docs/curriculum-v3/numerical-methods/batch-3-contract.md`

**Locked-artifact inventory pattern** (lines 23-32):

```markdown
## Locked artifacts

- Fixture: `public/datasets/numerical-methods/logit-calibration-fixture.json`
- Fixture manifest: `public/datasets/numerical-methods/logit-calibration-manifest.json`
- Shared executed Notebook: `public/notebooks/numerical-methods/logit-bias-calibration.zh-CN.ipynb`
- Finite-difference output: `public/notebooks/numerical-methods/batch-3-outputs/finite-difference-calibration-summary.json`
- Root-finding output: `public/notebooks/numerical-methods/batch-3-outputs/nonlinear-calibration-summary.json`
- Batch output manifest: `public/notebooks/numerical-methods/batch-3-outputs/manifest.json`
```

**Acceptance boundary pattern** (lines 74-82): hashes are deterministic, the downloaded Notebook reruns, formulas/code/page/lab/media agree, public paths are base-safe, and tests/build/Pages/generator/media/security/browser checks all pass.

**Exact reuse/adaptation boundary:**

- Copy the contract organization, not Batch 3’s scalar calibration values.
- Batch 4’s authoritative contract version is `numerical-methods-batch-4-v1` across dataset, Notebook, output, media, and TypeScript records.
- Dataset manifest must lock the official UCI page, DOI `10.24432/C55P57`, CC BY 4.0, ZIP/member hashes and bytes, exact seven-column normalized CSV schema, 1,372 rows, class counts, and persisted 960/206/206 assignments.
- The CSV must carry `banknote_id,variance,skewness,curtosis,entropy,class,split` in original UCI row order. Do not assert a “genuine/forged” class mapping that UCI does not define.
- The data dictionary is separate from the manifest and must describe source-spelled `curtosis` without silently correcting the runtime column name.
- Outputs expand Batch 3’s summary-only convention: two summaries plus one complete JSON trace and one normalized CSV trace. The CSV contains accepted finite states only; terminal/failure metadata remains in JSON.
- Keep media hashes out of the Notebook output manifest; Batch 4 media metadata references output IDs and owns media integrity, avoiding a hash cycle.
- `requirements.txt` currently contains NumPy, pandas, SciPy, nbformat, nbclient, JupyterLab, and ipykernel at lines 1-7. Add exactly one `scikit-learn==1.9.0` line only after the required human legitimacy checkpoint; do not duplicate a pin on rerun.

### Notebook generator and deterministic publication

**Apply to:** `scripts/numerical-methods/generate-batch-4-notebook.py`, the executed Notebook, dataset publication, and all Batch 4 output files.

**Analog:** `scripts/numerical-methods/generate-batch-3-notebook.py`

**Imports and deterministic JSON pattern** (lines 4-20 and 36-42):

```python
import argparse
import hashlib
import json
import math
import os
import shutil
import sys
import tempfile
import uuid
from pathlib import Path
from typing import Any

import nbformat
from nbclient import NotebookClient

def json_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode("utf-8")
```

**Clean-kernel execution pattern** (lines 453-463):

```python
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

**Finite-output validation pattern** (lines 466-486): recursively reject non-finite floats before publication, then validate contract/output/hash fields.

**Transactional environment and cleanup pattern** (lines 498-580): generate into a UUID temp directory; capture old scoped environment values; set scoped `ML_ATLAS_*` paths; validate outputs; delete temp artifacts on error; restore every environment value in `finally`.

**Check/publish split** (lines 583-689): `--check` regenerates and byte-compares committed files, reruns the downloaded Notebook standalone, and never publishes; normal mode performs a rollback-capable atomic directory/notebook replacement.

**Exact reuse/adaptation boundary:**

- Retain `sha256_file`, stable cell IDs, `allow_nan=False`, `assert_finite`, `artifact_entry`, temp transaction, standalone rerun, byte drift comparison, rollback, and `--check` structure.
- Expand validation before publish to cover CSV header/row/class/split checks, train-only mean/scale, finite-difference gradient check, extreme-logit comparison, five run IDs, six terminal reasons through fixtures, accepted-state trace/CSV parity, final report eligibility, and the scikit-learn endpoint mapping.
- Normal generation must be offline against the committed local snapshot. Any source-refresh mode must be explicit and hash gated; runtime and ordinary `--check` must not depend on UCI availability.
- Persist Python-generated split labels. Do not port scikit-learn RNG behavior to TypeScript.
- Restore scoped variables such as `ML_ATLAS_BANKNOTE_DATA_PATH` and `ML_ATLAS_NUMERICAL_BATCH4_OUTPUT_DIR`; never record environment values in manifests.
- Choose an appropriate larger Notebook timeout if clean execution needs it, but keep errors forbidden and timing metadata stripped.

### Pure Banknote dataset and logistic engine

#### `src/modules/math-lab/utils/banknoteDataset.ts` (utility, file-I/O/request-response)

**Composite analogs:**

- Strict CSV boundary: `scripts/python-data-tools/bikeSharingContract.mjs`, lines 179-208.
- Base-safe abortable loader: `src/utils/pythonDataToolsOutputs.ts`, lines 414-469.
- Public path helper: `src/utils/publicPath.ts`, lines 17-30.

**Strict parser pattern** (Bike Sharing lines 179-207):

```javascript
const normalized = source.replace(/^\uFEFF/, '').replace(/(?:\r\n|\n|\r)+$/, '')
if (!normalized) throw new Error('... CSV is empty; expected a header and data rows')
// compare each header position, reject row-width drift, return typed records
```

**Loader result pattern** (`pythonDataToolsOutputs.ts`, lines 422-443):

```typescript
const response = await resolveFetch(options)(
  withPublicBase(manifestPublicPath, options.baseUrl),
  { signal: options.signal },
)
if (!response.ok) return errorState('http-error')
// parse, schema-check, then return { status: 'ready', data }
```

**Exact reuse/adaptation boundary:**

- Define typed rows and explicit load states; accept an injectable `fetch`, optional `AbortSignal`, and optional base URL so Node tests do not depend on a browser.
- Validate the exact seven-column header, unique one-based IDs, finite four-feature values, target in `{0,1}`, split in `{train,validation,test}`, exact 1,372/960/206/206 counts, and exact per-split class counts.
- Recompute train means and population scales from parsed training rows. Stored manifest statistics are comparison anchors, not inputs to browser computation.
- Use `withPublicBase('/datasets/numerical-methods/banknote-authentication.csv', baseUrl)`; never concatenate `BASE_URL`, fetch UCI at runtime, or fall back to a remote URL.
- A hand-written general CSV framework is unnecessary for this numeric, unquoted schema. Still handle BOM and CRLF and produce line/column-specific errors.

#### `src/modules/math-lab/utils/banknoteLogistic.ts` (utility/service, transform/batch)

**Composite analogs:**

- Pure typed run records, bounded inputs, and no Vue/D3/DOM: `src/modules/math-lab/utils/optimizers.ts`, lines 7-71 and 94-169.
- Stable sigmoid branch: `src/modules/math-lab/utils/logitCalibration.ts`, lines 8-12.
- Authoritative new math/state contract: `25-RESEARCH.md`, “Exact Numerical Contract,” “Output and Manifest Schema,” and “Code Examples.”

**Input guard pattern** (`optimizers.ts`, lines 98-107 and 162-169):

```typescript
function finiteOr(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? value! : fallback
}

const steps = Math.max(0, Math.min(60, Math.floor(finiteOr(input.steps, 20))))
const learningRate = clamp(finiteOr(input.learningRate, 0.08), 0.001, 0.35)
```

**Stable sigmoid pattern** (`logitCalibration.ts`, lines 8-12):

```typescript
export function stableSigmoid(value: number) {
  if (value >= 0) return 1 / (1 + Math.exp(-value))
  const exponential = Math.exp(value)
  return exponential / (1 + exponential)
}
```

**New stable BCE signature to implement from research:**

```typescript
export function softplus(value: number): number {
  return Math.max(value, 0) + Math.log1p(Math.exp(-Math.abs(value)))
}

export function stableBinaryCrossEntropy(logit: number, target: 0 | 1): number {
  return softplus(logit) - target * logit
}
```

**Exact reuse/adaptation boundary:**

- Export locked constants, row/matrix/config/preset/trace/terminal types, stable sigmoid/BCE, train-only standardization, `lossAndGrad`, `armijoStep`, `shouldStop`, and `trainLogistic` from a DOM-free module.
- Keep the intercept as the fifth parameter and exclude it from L2. Validation/test BCE excludes L2. Armijo uses the penalized training objective only.
- Trace iteration 0 and every accepted finite update. Never append a rejected or non-finite candidate. Preserve `attemptedIteration` separately when a safety failure occurs.
- After each accepted update: record trace/update validation checkpoint, then check `gradient-norm`, then conjunctive `loss-and-step`, then `validation-patience`, then emit `max-iterations` after the final allowed update.
- Terminal types must distinguish mathematical (`gradient-norm`, `loss-and-step`), model selection (`validation-patience`), and safety (`max-iterations`, `non-finite`, `line-search-failed`).
- Five preset IDs and constants must match the manifest exactly. Extreme-logit and forced-failure probes are test fixtures, not extra run presets.
- Do not copy the optimizer-family implementation from `optimizers.ts`; Phase 25 must not add Momentum/RMSProp/Adam controls or compare solver traces.
- Do not put Banknote logic in `aiBridgeMath.ts`. That file remains the synthetic support engine.

### Typed content enhancer and module registration

#### `src/modules/math-lab/data/numericalBatch4Modules.ts` (provider/enhancer, transform)

**Analog:** `src/modules/math-lab/data/numericalBatch3Modules.ts`

**Imports/localized constructor/section helpers** (lines 1-29):

```typescript
import type {
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
  MathLabTocItem,
  VisualAsset,
} from '../types/mathLab.ts'

const md = String.raw
const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

function section(/* ... */): MathLabSection {
  return { id, level: 2, title, content, ...placements }
}
```

**One-primary-lab deduplication** (lines 31-41):

```typescript
function keepFirstLabPlacement(sections: readonly MathLabSection[]): MathLabSection[] {
  const seen = new Set<string>()
  return sections.map((item) => {
    if (!item.labIds?.length) return item
    const labIds = item.labIds.filter((labId) => {
      if (seen.has(labId)) return false
      seen.add(labId)
      return true
    })
    return labIds.length ? { ...item, labIds } : { ...item, labIds: undefined }
  })
}
```

**Dispatch boundary** (lines 387-391):

```typescript
export function enhanceNumericalBatch3Module(moduleDefinition: MathLabModule): MathLabModule {
  if (moduleDefinition.id === 'finite-difference-methods') return enhanceFiniteDifference(moduleDefinition)
  if (moduleDefinition.id === 'nonlinear-equations') return enhanceNonlinearEquations(moduleDefinition)
  return moduleDefinition
}
```

**Exact reuse/adaptation boundary:**

- Create analogous enhancers for only `optimization` and `training-diagnostics`; return every other module object unchanged.
- Prepend/insert detailed bilingual sections, concepts, the shared illustration, and chapter-specific Manim assets while preserving all base quizzes, misconceptions, labs, IDs, and source references.
- Preserve exactly one placement of `optimization-gradient-lab` and `training-diagnostics-lab`. Existing placements are in `optimizationModule.ts` line 770 and `aiBridgeModules.ts` line 689; their definitions are at `optimizationModule.ts` lines 1214-1224 and `aiBridgeModules.ts` lines 1068-1073.
- `optimization` owns the five-run comparison and numeric mechanics. `training-diagnostics` owns cross-run reading, four-step diagnosis, and the final report connection.
- Existing synthetic support content must remain accessible and explicitly labeled synthetic; it must not inherit Banknote provenance.
- Learner-facing copy uses both `'zh-CN'` and `en` and avoids generic “证据” wording.

#### `src/modules/math-lab/data/modules.ts` (config/provider composition, transform)

**Analog:** current enhancer chain, lines 199-218.

```typescript
const moduleDefinition = enhanceNumericalBatch3Module(
  enhanceAmesNumericalMethodsModule(
    enhanceNumericalBatch2Module(
      enhanceProbabilityUncertaintyModule(sourceModuleDefinition),
    ),
  ),
)
```

**Exact reuse/adaptation boundary:** import `enhanceNumericalBatch4Module` and wrap the existing expression outermost. Do not add a provider, duplicate either canonical module, change provider identity/order, alter `mathLabModuleOverridePolicy`, or introduce IDs such as `numerical-optimization`.

### Notebook companion, page resolver, downloads, lazy loading, and public base

#### `src/modules/math-lab/data/numericalBatch4Notebook.ts`

**Analog:** `src/modules/math-lab/data/numericalBatch3Notebook.ts`, lines 4-21, 25-53, and 130-134.

```typescript
export const numericalBatch3ChapterIds = [
  'finite-difference-methods',
  'nonlinear-equations',
] as const satisfies readonly MathLabModuleId[]

export function numericalBatch3NotebookForModule(
  moduleId: MathLabModuleId,
): NumericalBatch3NotebookCompanion | undefined {
  return companions[moduleId as (typeof numericalBatch3ChapterIds)[number]]
}
```

**Exact reuse/adaptation boundary:** define chapter IDs `['optimization', 'training-diagnostics']`; share one Notebook, dataset, requirements, trace JSON/CSV, and data dictionary; give each module its own summary/output ID, code block, and fixed output. Use typed `DownloadableCourseAsset` records with leading-slash public paths.

#### `src/modules/math-lab/components/MathLabNotebookCompanion.vue`

**Analog:** current file, lines 1-18 and 28-62.

```typescript
const notebookHref = computed(() => withPublicBase(props.companion.notebook.publicPath))
const datasetHref = computed(() => withPublicBase(props.companion.dataset.publicPath))
const requirementsHref = computed(() => withPublicBase(props.companion.requirements.publicPath))
```

**Exact reuse/adaptation boundary:** add the Batch 4 companion type to the union and render an optional supporting-download list by iterating assets and applying `withPublicBase` to every path. Existing three primary downloads and old companion rendering must remain unchanged. Do not special-case raw string concatenation.

#### `src/modules/math-lab/pages/MathLabModulePage.vue`

**Lazy lab pattern** (lines 50-83):

```typescript
MathGradientLab: defineAsyncComponent(() => import('../labs/MathGradientLab.vue')),
TrainingDiagnosticsLab: defineAsyncComponent(() => import('../labs/TrainingDiagnosticsLab.vue')),
```

**Companion resolver pattern** (lines 88-92):

```typescript
const notebookCompanion = computed(() =>
  amesNumericalNotebookForModule(moduleId.value)
    ?? numericalBatch2NotebookForModule(moduleId.value)
    ?? numericalBatch3NotebookForModule(moduleId.value),
)
```

**Asset resolution pattern** (lines 272-281): image and concept-illustration paths pass through `withPublicBase`.

**Exact reuse/adaptation boundary:** append `?? numericalBatch4NotebookForModule(moduleId.value)` to the companion resolver. Keep both lab registry entries lazy and do not add new components or eager imports. Keep page-level progress/checkpoint composition untouched.

#### `src/styles/modules/math-lab.css`

**Analog:** notebook block at lines 874-927 and mobile collapse at lines 2815-2829.

**Exact reuse/adaptation boundary:** extend existing `.math-notebook-companion__*` selectors for a wrapping supporting-download list and reuse the one-column mobile collapse. Lab-specific chart/control styles may remain scoped in their Vue files. Do not introduce a new UI framework or a broad global reset.

### Existing labs and synthetic support boundary

#### `src/modules/math-lab/labs/MathGradientLab.vue`

**Current identity/shell pattern:** `<script setup lang="ts">` with locale prop (lines 1-16), `math-lab-card` visual/control split (lines 86-146), labeled bounded controls (lines 127-143).

**Current limitation:** the trajectory is a reactive quadratic computed value (lines 35-56). That computation is not the Phase 25 authority.

**Exact reuse/adaptation boundary:**

- Preserve filename, component identity, locale prop, card shell, accessible SVG/readout/control idioms, and existing base lab ID.
- Load the local dataset asynchronously; keep a committed result separate from editable control drafts. Preset buttons load settings; only explicit Run computes up to 500 full-batch steps. Reset restores the locked default preset/result.
- Expose only feature space, fixed/Armijo method, learning rate, gradient tolerance, and maximum iterations in bounded advanced controls. Keep L2, Armijo `c`, `rho`, and validation patience fixed in the primary UI.
- Render start, first backtrack when present, best validation, terminal state, exact reason/kind, and one single-variable suggestion. A failure displays the last finite state; it never substitutes parameters silently.
- Core computation, parsing, and stopping stay in `banknoteDataset.ts`/`banknoteLogistic.ts`, not in the component or template.

#### `src/modules/math-lab/labs/TrainingDiagnosticsLab.vue`

**Current D3 derivation pattern** (lines 82-119): compute scales and paths from an already-derived series, including train, validation, gradient, gap, and best-validation point.

**Current synthetic engine boundary** (lines 5, 13-14, and 74-80):

```typescript
import { evaluateTrainingScenario, type TrainingScenario } from '../utils/aiBridgeMath'
const scenario = ref<TrainingScenario>('healthy')
const evaluation = computed(() => evaluateTrainingScenario(scenario.value, 42))
```

**Exact reuse/adaptation boundary:**

- Preserve D3 as presentation-only; run/trace derivation belongs to the pure engine.
- Add separate “Banknote real-data runs” primary/comparison selectors and curve toggles. Do not merge them into the synthetic scenario union.
- Retain all five synthetic modes and label them deterministic synthetic support examples; overfitting, vanishing-gradient, and exploding-gradient are not Banknote results.
- Present the locked four-step chain: visible pattern → plausible cause → one variable to change → expected next-run result. This is instruction, not a scored diagnosis exercise or dashboard builder.
- Use text/markers/labels in addition to color; keep numeric/table summaries usable on mobile and with reduced motion.

#### `src/modules/math-lab/utils/aiBridgeMath.ts`

**Preserve pattern:** `TrainingScenario` remains the five-ID union at lines 3-8; `evaluateTrainingScenario` remains the deterministic synthetic generator at lines 195-258.

**Exact reuse/adaptation boundary:** no Banknote data, run IDs, metrics, or provenance may enter this function. Modify only if additive typing is strictly required by the component; otherwise leave the file unchanged and assert all five modes in Batch 4 tests.

### Manim, poster, metadata, transcript, prompt, tree, and shared illustration

**Apply to:** renderer, Batch 4 scene package, nine docs files, six public media files, metadata, imagegen prompt record, and shared PNG.

**Analog:** `scripts/manim/render_numerical_methods_batch_3.py`

**Scene manifest pattern** (lines 27-46): one record per scene with stable ID/stem/class/duration/poster/cuts/output ID.

**Source/package validation pattern** (lines 133-173): require the six-role pipeline, depth 3, non-empty source/prompt/transcript/English summary, bilingual label tables, and exact Notebook-bound values in scene source.

**Path and integrity pattern** (lines 176-253): map leading-slash public paths to `public/`, enumerate all source/docs/output/media dependencies, and SHA-256 each required file.

**Render/probe pattern** (lines 261-333): render 1920×1080 at 30 fps with caching disabled; extract a 1920×1080 poster; use `ffprobe` to require one silent H.264 stream and expected duration, and verify the poster codec/dimensions.

**Atomic preserve-existing-media pattern** (lines 346-383): copy the existing `public/manim/numerical-methods` directory into a temp package before adding Batch 4, verify the whole temporary directory, and then replace atomically with rollback. This prevents deleting Batch 1–3 media.

**Shared scene helper pattern:** Batch 3 `common.py` lines 10-58 provides Chinese text, Unicode equation, fit-width, title/card, and disclaimer helpers; `palette.py` lines 9-25 centralizes visual tokens and Chinese-font fallback.

**Exact reuse/adaptation boundary:**

- Create three scenes, not two: feature scaling; fixed step versus Armijo; traces/best-validation/terminal/next variable.
- Read locked Batch 4 outputs and dataset/manifest anchors. Do not hand-copy or invent schematic replacement numbers in scene code.
- Keep short Chinese in-video labels, bilingual label tables, Chinese transcript, English summary, local poster, and page-level fallback/summary.
- Batch 4 metadata references Batch 4 output IDs and records every source/prompt/tree/transcript/summary/labels/video/poster hash.
- Preserve existing media while publishing. Never replace the public directory with a Batch 4-only directory.
- The shared illustration follows Batch 3’s single-image/multiple-module pattern and must have bilingual page alt/transcript/caption even though its internal labels are Chinese.

### Tests

#### `tests/numerical-methods-batch-4.test.ts`

**Analog:** `tests/numerical-methods-batch-3.test.ts`

**Imports/helpers pattern** (lines 1-40): Node `assert`, crypto hash, fs existence/bytes, `node:test`, typed project imports, `absolutePublicPath`, JSON reader, SHA-256, and bilingual assertions.

**Artifact drift pattern** (lines 68-116): assert contract/module IDs/output IDs, existence, hash, bytes, generator hash, exact numeric anchors, and failure checks.

**Companion/content/one-lab pattern** (lines 118-186): assert two companions share the Notebook/dataset, paths exist, copy is bilingual, each visual and lab placement occurs exactly once, and imported assets are registered.

**Cross-runtime numeric pattern** (lines 188-220): compare TypeScript values to locked Notebook outputs with explicit tolerances.

**Safe Markdown pattern** (lines 222-231): render the new bilingual formula content through `renderMarkdownWithMath`, require KaTeX, and reject raw delimiters/script/event-handler output.

**Exact reuse/adaptation boundary:** add strict dataset/provenance/schema/hash/split/preprocessing assertions; stable BCE `±1000`; analytic/finite-difference gradient; Armijo first reject/accept and sufficient decrease; all six stop reasons and priority; last-finite invariant; five run parity; complete JSON/CSV row parity; final-report-only-on-selected-run; base URL behavior; unchanged IDs/order/lab placement/routes/checkpoints/progress; all five synthetic modes and provenance labels. Use `1e-9` displayed-scalar and `1e-8` parameter tolerances where research specifies, not byte equality for cross-language floats.

#### `tests/numerical-methods-batch-4-manim.test.ts`

**Analog:** `tests/numerical-methods-batch-3-manim.test.ts`

**Metadata type and scene contract pattern** (lines 12-57); **six-role/bilingual source assertions** (lines 59-66 and 120-154); **route-to-media binding** (lines 156-167); **hash and renderer check** (lines 169-180).

**Exact reuse/adaptation boundary:** expect three packages, exact Batch 4 output IDs/anchors, one route binding for each chapter-specific asset as specified by the enhancer, full hash coverage, 1920×1080/30fps/H.264/poster checks, and a passing `python3 scripts/manim/render_numerical_methods_batch_4.py --check`.

## Shared Patterns

### Route and course order preservation

**Source:** `src/modules/math-lab/data/mathCourseOrder.ts`, lines 39-49.

```typescript
export const numericalDeepeningModuleIds: readonly MathLabModuleId[] = [
  // ...
  'finite-difference-methods',
  'nonlinear-equations',
  'optimization',
  'training-diagnostics',
]
```

Do not edit this order. Both canonical URLs remain `/math-lab/modules/{moduleId}?route=numerical-deepening-path`; `MathLabModulePage.vue` lines 119-123 already preserves the active route query when navigating.

### Progress and checkpoints

**Source:** `src/modules/math-lab/utils/progress.ts`, lines 15-44 and 93-123.

```typescript
const STORAGE_KEY = 'ml-atlas:math-lab-progress:v1'

completedModuleIds: Array.from(new Set([...progress.completedModuleIds, moduleId]))
```

Do not add, rename, migrate, or delete a storage key. Do not change module IDs, quiz/checkpoint IDs, lab IDs, or completion semantics. Phase tests should load/complete `optimization` and `training-diagnostics` through existing progress helpers and prove the same IDs are persisted. Progress V2 composition in `MathLabModulePage.vue` also remains untouched.

### Lazy loading

**Source:** `src/modules/math-lab/pages/MathLabModulePage.vue`, lines 50-83.

Both existing labs already use `defineAsyncComponent`. Upgrading their files requires no registry rename and no new eager import.

### Public base handling

**Source:** `src/utils/publicPath.ts`, lines 17-30.

```typescript
if (!path || !path.startsWith('/') || isExternalOrSpecialPath(path)) return path
if (baseUrl === '/' || path.startsWith(baseUrl)) return path
return `${baseUrl.replace(/\/$/, '')}${path}`
```

Every dataset, Notebook, JSON, CSV, image, poster, and video record stores a leading-slash public path. Vue/fetch consumers call `withPublicBase`; manifests keep canonical unbased paths.

### Validation and error handling

- Parser/loader errors are typed or status-based and learner-readable; abort is distinct from HTTP/schema failure.
- Numeric controls reject/clamp `NaN`, `Infinity`, and out-of-range values before a run.
- Logistic arithmetic returns terminal metadata and last finite state rather than throwing into the component for expected numerical failures.
- Build scripts fail closed, publish only validated transactions, restore environment state, and remove temp artifacts.
- JSON uses `null` for absent values and `allow_nan=False`; no nonstandard `NaN`/`Infinity` tokens.

### Safe localized content

- All new content uses typed `LocalizedCopy` with both locales.
- Formulas/Markdown flow through `MarkdownMathContent` / `markdownMath.ts`; no direct raw `v-html` or custom sanitizer.
- Media maintains one Chinese-label render with bilingual page copy, Chinese transcript, English summary, and bilingual label table.
- Failure/success state must not rely on color alone.

## Conflicts and Seams to Resolve Before Implementation

1. **Package legitimacy checkpoint (resolved 2026-07-22):** Research verified `scikit-learn==1.9.0` in a clean kernel and against official docs/PyPI metadata; the user then explicitly approved the exact official pin after the seam returned `SUS` for missing signals. Plan 01 machine-checks the durable approval record and must not prompt again; Plan 02 fails closed before editing/installing if that record is absent.
2. **Armijo scene naming (resolved for planning):** Use canonical scene ID/stem `banknote-fixed-vs-armijo` for source, prompt, tree, transcript, summary, labels, poster, video, and metadata while the lesson topic remains Armijo.
3. **No runtime network:** The Notebook generator may have an explicit maintenance refresh path, but normal generation/check and browser labs consume committed local files only.
4. **No raw-vs-standardized quality claim:** The same coefficient-space L2 changes geometry across units; use those runs to teach conditioning/trajectory, not to declare final model quality.
5. **No transient winner:** Final-model eligibility requires mathematical convergence before comparing best-validation checkpoints; this prevents the unstable too-large run from winning on a transient low validation BCE.
6. **No real/synthetic union:** Banknote run IDs never pass through `evaluateTrainingScenario`, and synthetic overfit/vanishing/exploding modes never receive Banknote labels.
7. **No sixth training run:** Extreme-logit and forced failure probes remain checks/fixtures outside the five locked runs.
8. **No route/progress migration:** Existing module/lab/checkpoint IDs and all Progress stores remain as-is.
9. **Do not touch user work:** `docs/gpt_advice.md` is untracked and user-owned. No Phase 25 generator or staging command may include or modify it.

## No Exact Analog Found

| File | Missing Exact Pattern | Planner Fallback |
|---|---|---|
| `src/modules/math-lab/utils/banknoteLogistic.ts` | No existing utility implements a real-data, five-run, accepted-state logistic trace with Armijo and typed terminal priority. | Treat `25-RESEARCH.md` numerical/state/output contract as authoritative; reuse only pure utility/type/input-guard conventions from `optimizers.ts` and stable sigmoid from `logitCalibration.ts`. |
| `src/modules/math-lab/utils/banknoteDataset.ts` | No Math Lab runtime utility currently fetches and strictly parses a local numeric CSV with split/count/hash-adjacent validation. | Combine the strict CSV boundary from `bikeSharingContract.mjs`, the base-safe abortable loader state from `pythonDataToolsOutputs.ts`, and Phase 25’s exact seven-column/count contract. |
| `MathGradientLab.vue` explicit Run state | Existing Math Lab optimization labs recompute reactively; no exact draft-controls-versus-committed-run component exists. | Implement separate draft config and committed result, following the research performance boundary. Preserve existing shell/control/accessibility conventions. |
| Batch 4 trace JSON/CSV | Batch 3 outputs are summary JSON only. | Follow the exact interfaces/header order in `25-RESEARCH.md`; generator and TypeScript tests jointly enforce accepted-row parity and terminal metadata. |
| `banknote_training_diagnostics.py` trace/best/terminal scene | No exact Batch 3 solver-trace scene exists. | Treat `25-RESEARCH.md` as the numerical/state authority; use `scripts/manim/scenes/ai_bridge_math.py` only for curve staging and `scripts/manim/ai_overview/linear_regression_parameter_search.py` only for best-marker staging, never for values. |

## Planner-Ready Dependency Order

1. Machine-verify the durable 2026-07-22 approval record for the Python pin without prompting, then lock contract, canonical scene IDs, local dataset, manifest, and dictionary.
2. Generate/execute/validate the shared Notebook and complete Batch 4 output transaction.
3. Implement strict dataset loading and the pure TypeScript engine; pass focused numeric/parity tests.
4. Add typed companions and outer enhancer; upgrade existing labs/component/page/styles without changing identities.
5. Create the shared illustration and three Notebook-output-bound Manim packages; then run media integrity tests.
6. Run focused tests, generator/media `--check`, full tests/build/Pages/security audit, and the 8-state locale/viewport browser matrix.

Do not parallelize media before Notebook outputs are locked or lab UI before the pure TypeScript engine is stable.

## Metadata

**Analog search scope:** `docs/curriculum-v3/numerical-methods`, `public/datasets/numerical-methods`, `public/notebooks/numerical-methods`, `public/math-lab/numerical-methods`, `public/manim/numerical-methods`, `scripts/numerical-methods`, `scripts/manim`, `src/modules/math-lab`, `src/utils`, and `tests`

**Primary concrete analogs read:** Batch 3 enhancer, companion, generator, renderer, contract, metadata, source/media helpers, and two tests; existing lab/page/module/progress/public-path surfaces; strict CSV and async loader seams

**Pattern extraction date:** 2026-07-21
