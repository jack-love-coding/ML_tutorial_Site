# Phase 29: Logistic Regression Rebuild - Pattern Map

**Mapped:** 2026-08-19  
**Files analyzed:** 27 planned new/modified source, asset, script, and test files  
**Analogs found:** 26 / 27

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match quality |
|---|---|---|---|---|
| `src/modules/logistic-regression/types.ts` | model | transform | `src/modules/optimizer-comparison/data/course.ts` | role-match |
| `src/modules/logistic-regression/data/course.ts` | model/content registry | transform | `src/modules/optimizer-comparison/data/course.ts` | exact |
| `src/modules/logistic-regression/data/media.ts` | model/media registry | file-I/O metadata | `src/modules/optimizer-comparison/data/media.ts` | exact |
| `src/modules/logistic-regression/engine.ts` | utility | transform | `src/modules/math-lab/utils/banknoteLogistic.ts` | exact |
| `src/modules/logistic-regression/assets.ts` | service | file-I/O/request-response | `src/simulations/linearRegressionInteraction.ts` | exact |
| `src/modules/logistic-regression/labs/LogisticLessonLab.vue` | component | event-driven + request-response | `src/components/LinearRegressionObservationLab.vue` | exact |
| `src/modules/logistic-regression/labs/{LinearScore,SigmoidProbability,Likelihood,LogLossGradient,TrainingParity,CalibrationLimits}Scene.vue` | component | event-driven | `src/modules/optimizer-comparison/labs/TrainingLedgerScene.vue` | role-match |
| `src/components/LogisticRegressionPagedLesson.vue` | component/page shell | event-driven | `src/modules/optimizer-comparison/OptimizerPagedLesson.vue` | exact |
| `src/data/logisticRegressionModule.ts` | module config | transform | existing `src/data/logisticRegressionModule.ts` | modification |
| `src/views/AlgorithmView.vue` | route integration component | request-response | existing `src/views/AlgorithmView.vue` logistic branch | modification |
| `src/styles/modules/logistic-regression.css` | style config | event-driven presentation | existing file + optimizer course classes | modification |
| `scripts/logistic-regression/phase29_analysis.py` | utility | batch transform | `scripts/linear-regression/phase27a_analysis.py` | role-match |
| `scripts/logistic-regression/build-phase-29-assets.py` | asset publisher | batch + file-I/O | `scripts/linear-regression/build-phase-27a-assets.py` | exact |
| `scripts/manim/scenes/logistic_regression.py` | media scene | batch transform | existing same file / `optimizer_comparison.py` | modification |
| `scripts/manim/render_logistic_regression.py` | media renderer/validator | batch + file-I/O | `scripts/manim/render_optimizer_comparison.py` | exact |
| `public/logistic-regression/phase-29/{manifest,interactions/*,frozen-predictions}.{json,csv}` | generated static assets | file-I/O | `public/linear-regression/phase-27a/` generated bundle | exact |
| `public/manim/logistic-regression/{mp4,svg,metadata}.json` | generated media assets | file-I/O | `public/manim/optimizer-comparison/` | exact |
| `public/notebooks/logistic-regression/banknote-logistic-regression.{zh-CN,en}.ipynb` | generated notebook | batch + file-I/O | Phase 27A notebook builder | role-match |
| `docs/curriculum-v3/logistic-regression/manim/*` | media source records | file-I/O | `docs/curriculum-v3/optimizer-comparison/manim/*` | exact |
| `tests/logistic-regression-{math,assets,parity,calibration,content,rendering,media}.test.*` | test | transform/file-I/O | Phase 27A + optimizer media tests | role-match |
| `tests/logistic-regression-cockpit.test.mjs` | test | structural | existing same file | modification |

## Pattern Assignments

### `src/modules/logistic-regression/types.ts` and `data/course.ts` (typed content registry, transform)

**Analog:** `src/modules/optimizer-comparison/data/course.ts`

**Imports and local bilingual helper** (lines 1–35):

```ts
import type { LocalizedCopy } from '../../../types/ml'

export interface OptimizerCourseBlock {
  kind: OptimizerCourseBlockKind
  title: LocalizedCopy
  body: LocalizedCopy
  code?: string
}

const loc = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })
```

**Course composition pattern** (lines 32–45): use a local `block()` factory with fixed bilingual labels, then make each of the six preserved IDs a typed chapter. Put TeX-bearing prose in `String.raw`, retain the fixed block order, and reserve references/downloads for the final chapter.

```ts
const block = (kind, zhCN, en, code?) => ({
  kind,
  title: loc(labelsZh[kind], labelsEn[kind]),
  body: loc(zhCN, en),
  code,
})
```

**Apply:** define phase-local `LogisticCourseBlockKind`, `LogisticCourseBlock`, chapter IDs, scene IDs, interaction controls and discriminated interaction assets here. Do not migrate the global `AlgorithmModuleDefinition` contract.

---

### `src/modules/logistic-regression/engine.ts` (pure math utility, transform)

**Analog:** `src/modules/math-lab/utils/banknoteLogistic.ts`

**Stable scalar math** (lines 245–257):

```ts
export function stableSigmoid(value: number): number {
  if (value >= 0) return 1 / (1 + Math.exp(-value))
  const exponential = Math.exp(value)
  return exponential / (1 + exponential)
}

export function stableBinaryCrossEntropy(logit: number, target: BanknoteTarget): number {
  return softplus(logit) - target * logit
}
```

**Finite input validation before batch work** (lines 271–291):

```ts
if (features.length === 0 || features.length !== targets.length) {
  throw new RangeError('Features and targets must have the same non-zero row count.')
}
if (parameters.length !== 5 || !allFinite(parameters)) {
  throw new RangeError('Logistic parameters must contain five finite values.')
}
```

**Vectorized-equivalent explicit accumulation** (lines 294–332): initialize a fixed gradient vector, calculate `probability - target`, accumulate each feature residual and intercept residual, average once, then add L2 only to coefficients.

**Apply:** reuse/re-export existing stable primitives where possible. Keep row score, odds, likelihood/log-likelihood, BCE, analytical gradient, central difference, temperature transform, XOR/circle diagnostic helpers independent of Vue and range/finite guarded. Preserve Banknote parameter order and existing training behavior behind an adapter.

---

### `src/modules/logistic-regression/assets.ts` (validated JSON loader, file-I/O/request-response)

**Analog:** `src/simulations/linearRegressionInteraction.ts`

**Validate a finite tree and declared contract** (lines 17–91):

```ts
function assertFiniteTree(value: unknown, path = '$'): void {
  if (typeof value === 'number') { finite(value, path); return }
  if (Array.isArray(value)) { value.forEach((entry, index) => assertFiniteTree(entry, `${path}[${index}]`)); return }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, entry]) => assertFiniteTree(entry, `${path}.${key}`))
  }
}
```

**Pages-safe async fetch** (lines 96–106):

```ts
const response = await fetch(
  withPublicBase(`/linear-regression/phase-27a/interactions/${sceneId}.json`),
  { signal, headers: { Accept: 'application/json' } },
)
if (!response.ok) throw new Error(`interaction asset request failed: ${response.status}`)
return parseLinearRegressionInteractionAsset(await response.json(), sceneId)
```

**Apply:** validate Phase 29 contract version, expected scene ID, source cell ID/hash, schema and finite leaves before a scene receives data. Use `AbortSignal`; never parse CSV or fit sklearn inside a component.

---

### `src/modules/logistic-regression/labs/LogisticLessonLab.vue` (lazy scene shell, request-response)

**Analog:** `src/components/LinearRegressionObservationLab.vue`

**Route-lazy scene map** (lines 23–32):

```ts
const sceneComponents: Record<LinearRegressionObservationSceneId, Component> = {
  'fit-line': defineAsyncComponent(() => import('./linear-regression/FitLineScene.vue')),
  // one async component per preserved chapter ID
}
```

**Cancellation-safe state machine** (lines 34–69):

```ts
type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; asset: LinearRegressionInteractionAsset }
  | { status: 'error' }

controller?.abort()
controller = new AbortController()
// ignore AbortError; expose localized retry for actual failure
watch(() => props.sceneId, () => void load(), { immediate: true })
onBeforeUnmount(() => controller?.abort())
```

**Apply:** one scene component per logistic chapter, loading/error/retry labels in both languages, dynamic `component`, and no eager imports. Keep older `LogisticRegressionLessonLab.vue` only as compatibility surface; do not mount its old cockpit from the rebuilt course.

---

### Six logistic `*Scene.vue` components (interactive component, event-driven)

**Analog:** `src/modules/optimizer-comparison/labs/TrainingLedgerScene.vue`

**Small state composition and keyboard support** (lines 1–26):

```ts
const stage = ref(0)
const model = computed(() => trainingLedgerModel(stage.value))
const playback = useScenePlayback({ value: stage, initial: 0, maximum: 4 })

<section tabindex="0" @keydown.self.space.prevent="playback.step"
  @keydown.self.right.prevent="playback.step" @keydown.self.r.prevent="playback.reset">
```

**Visible semantic fallback** (lines 22–25): reduced-motion status, button group for play/step/reset, and a real `<table>` of values accompany the visual.

**Pure presentation-model analogue:** `src/modules/optimizer-comparison/labs/sceneModels.ts:25-46` computes all numeric values outside Vue and bounds user state before calling shared engine functions.

**Apply:** bind each scene to the typed fetched asset and engine helpers. Use at most 2–3 primary controls, preserve keyboard play/pause/step/reset and static table fallback, and communicate states with labels/line styles as well as color. Browser calculations are limited to simple exact terms; replay published Banknote/sklearn output for complex results.

---

### `src/components/LogisticRegressionPagedLesson.vue` (course page shell, event-driven)

**Analog:** `src/modules/optimizer-comparison/OptimizerPagedLesson.vue`

**Imports and compatibility props** (lines 1–19):

```ts
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import AlgorithmCheckpointQuiz from '../../components/AlgorithmCheckpointQuiz.vue'
import ChapteredMediaPlayer from '../../components/ChapteredMediaPlayer.vue'
import MarkdownMathContent from '../../components/MarkdownMathContent.vue'
import type { AlgorithmModuleDefinition, AppLocale, StorySection } from '../../types/ml'

const props = defineProps<{ moduleDefinition: AlgorithmModuleDefinition; section: StorySection }>()
```

**Safe fixed block renderer plus code copy** (lines 35–47, 50–60): check `navigator.clipboard?.writeText`, catch failure, reset copy state when chapter changes, render narrative through `MarkdownMathContent`, and dynamically render only the current chapter lab. Final-only resources and `AlgorithmCheckpointQuiz` are keyed by the last chapter.

```ts
if (!value || !navigator.clipboard?.writeText) { copyFailed.value = true; return }
try { await navigator.clipboard.writeText(value) } catch { copyFailed.value = true }
```

**Apply:** retain the logistic `data-testid`, desktop/mobile TOC, router links, six IDs, route order, pager and final checkpoint. Replace legacy D3/cockpit/inline-video mounting with phase-local course blocks, `LogisticLessonLab`, and `ChapteredMediaPlayer`.

---

### `src/modules/logistic-regression/data/media.ts` and Manim package files (media registry, file-I/O)

**Analog:** `src/modules/optimizer-comparison/data/media.ts`

**Runtime registry contract** (lines 10–28):

```ts
export interface OptimizerMediaConfig {
  assetPath: string
  posterPath: string
  title: LocalizedCopy
  alt: LocalizedCopy
  chapterMarkers: readonly { id: string; startSeconds: number; title: LocalizedCopy }[]
  transcript: LocalizedCopy
  package: { assetId: string; sha256: string; posterSha256: string; transcriptZhCN: { path: string; sha256: string }; transcriptEn: { path: string; sha256: string } }
}
```

**TeX-safe transcript source** (lines 30–59): use `String.raw` for Markdown/TeX transcripts and localize with existing `LocalizedCopy`.

**Player integration:** `src/components/ChapteredMediaPlayer.vue:18-66,71-115` already handles `withPublicBase`, failures, markers, transcript disclosure, reduced motion, user-controlled video enablement and cleanup. Pass the typed registry directly; do not write a second video player.

---

### `scripts/logistic-regression/build-phase-29-assets.py` and `phase29_analysis.py` (asset publisher, batch/file-I/O)

**Analog:** `scripts/linear-regression/build-phase-27a-assets.py`

**Dependency and pure-analysis import boundary** (lines 1–55): configure Matplotlib `Agg`, import analysis helpers from a separate file, and keep build orchestration outside numerical helpers.

**Interaction identity and manifest entries** (lines 104–109, 130–210):

```py
def interaction_base(scene_id: str, source_cell_id: str) -> dict[str, str]:
    return {"contractVersion": INTERACTION_CONTRACT_VERSION, "sceneId": scene_id, "sourceCellId": source_cell_id}
```

**Atomic publish pattern:** `build-phase-27a-assets.py:1068-1090` builds into `TemporaryDirectory`, compares tree hashes when output exists, then replaces/renames only the fully assembled package. Reuse this rather than partly overwriting `public/`.

**Apply:** make Phase 29-specific notebook and generated package so old Batch 4 final-test outputs cannot appear in learner-facing files. Generate manifest, scene JSON, figures, frozen predictions CSV/JSON, bilingual notebooks, hashes and source-cell identifiers from one analysis authority. Asset generator is also responsible for checking no test labels/metrics surface in Phase 29 presentation assets.

---

### `scripts/manim/render_logistic_regression.py` and `scripts/manim/scenes/logistic_regression.py` (media renderer, batch/file-I/O)

**Analog:** `scripts/manim/render_optimizer_comparison.py`

**Selective 1920×1080/30fps render** (lines 97–113):

```py
args = ["-ql"] if quality == "preview" else ["-r", "1920,1080", "--fps", "30"]
subprocess.run(["manim", *args, "--format", "mp4", "--media_dir", str(media_dir), str(SCENE_FILE), scene["className"]], cwd=ROOT, check=True)
```

**Metadata and integrity check** (lines 82–94, 133–174): hash video/poster, call `ffprobe`, validate 1920×1080/30fps, marker range, source prompt/tree/transcripts and numeric anchors before release.

**Apply:** replace the current `render_logistic_regression.py` preview-only loop (lines 54–87) with the selective renderer/checker convention. Rebuild three existing packages and add likelihood-to-BCE-gradient package, with source prompt/knowledge tree and bilingual transcripts. Keep the scene source numerically tethered to generated anchors.

---

### Logistic regression test suite (tests, transform/file-I/O/structural)

**Math/data test analog:** `src/modules/math-lab/utils/banknoteLogistic.ts:271-332` and existing Batch 4 tests; verify finite input guards, stable BCE, row/batch gradients and central differences against published assets.

**Media test analog:** `tests/optimizer-course-media.test.mjs:1-139`. It hashes metadata, compares typed registry paths/hashes/markers/transcript content, Vite-transforms the shared player and simulates normal, error, and reduced-motion states.

**Compatibility test analog:** `tests/logistic-regression-cockpit.test.mjs:77-143`. Retain assertions for async catalog, base redirect, chapter route ordering, six IDs, current-page/TOC/pager test IDs and styles; replace cockpit-only expectations and the obsolete Phase-30 metrics assertions (lines 174–194).

## Shared Patterns

### Safe Markdown and mathematics

**Source:** `src/components/ChapteredMediaPlayer.vue:1-6,111-114`; project rule `AGENTS.md`.

```ts
import MarkdownMathContent from './MarkdownMathContent.vue'
<MarkdownMathContent :source="localized(transcript)" />
```

Apply to all learner narrative, formulas, code explanations, figure captions and transcripts. Formula-bearing strings use `String.raw`; titles, labels and alt text remain plain localized text. Do not introduce raw HTML or bypass sanitizer.

### Public-base paths and static fetching

**Source:** `src/simulations/linearRegressionInteraction.ts:7,96-106`; `src/components/ChapteredMediaPlayer.vue:79-88`.

Every public asset URL goes through `withPublicBase`. JSON fetch must reject non-OK responses and propagate `AbortSignal`; direct absolute filesystem paths and arbitrary remote runtime assets are not allowed.

### Interaction safety and lifecycle

**Source:** `src/components/LinearRegressionObservationLab.vue:53-69`; `src/modules/math-lab/utils/banknoteLogistic.ts:271-291`.

Abort stale fetches on route changes/unmount. Keep computations pure, bound all controls, reject non-finite values and retain a localized error/fallback instead of emitting broken SVG values. No autoplay; reduced motion preserves step/reset/table fallback.

### Bilingual final-only resource and checkpoint placement

**Source:** `src/modules/optimizer-comparison/OptimizerPagedLesson.vue:55-59`.

Use `LocalizedCopy`, show public references/downloads and the unchanged algorithm checkpoint only in `linear-limits`, and route the final pager to Phase 30. Do not introduce chapter-level citations, `Ref ID`, “证据”, or “Evidence”.

## No Analog Found

| File/Concern | Role | Data Flow | Reason |
|---|---|---|---|
| Phase 29 sealed prediction-handoff schema with learner-facing test suppression | model/asset contract | batch + file-I/O | Existing Batch 4 has predictions/test evaluation, but no exact Phase 29/30 sealed-handoff boundary. Derive it from the Context decisions and add explicit absence tests. |

## Metadata

**Analog search scope:** `src/components`, `src/modules`, `src/simulations`, `src/data`, `src/styles`, `scripts`, `public`, `tests`  
**Files scanned:** 17 primary analogs plus project instructions and phase inputs  
**Pattern extraction date:** 2026-08-19
