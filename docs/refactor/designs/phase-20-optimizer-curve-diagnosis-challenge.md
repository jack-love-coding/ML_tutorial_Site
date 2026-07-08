# Phase 20: Optimizer Curve Diagnosis Challenge Design

**Created:** 2026-07-08
**Status:** Draft for review.
**Branch:** `codex/phase-20-optimizer-curve-diagnosis-design`

## Decision

Phase 20 should add one narrow required-core task inside `optimizer-comparison`:

> Learners inspect a controlled training-curve pattern, predict the likely optimization issue, choose the next single-variable experiment, and then compare their answer with computed evidence.

The task belongs in the existing `curve-diagnosis` chapter. It should improve optimizer teaching depth without adding backend, database, durable progress, project readiness, new route inventory, or a broad `LessonPage` migration.

Phase 19 implementation is already represented by draft PR #29. Phase 20 implementation should start from updated `main` after Phase 19 merges, but this design can be reviewed independently because it targets `optimizer-comparison`, not CNN runtime code.

## Context

Phase 15 classified `optimizer-comparison` as required core and noted that several algorithm modules still rely on stage-switch explanation. Phase 18 found:

- `optimizer-comparison` already teaches loop order, batch noise, Momentum/RMSProp, AdamW, learning-rate schedules, and curve diagnosis;
- the route into visual deep learning is coherent: `optimizer-comparison -> tensor-shapes-vectorization -> cnn-visualization`;
- optimizer comparison remains a later interaction-upgrade candidate because the learner mostly reads or switches stages instead of completing a constrained diagnostic task.

Current source evidence:

- `src/data/optimizerComparisonModule.ts` includes a `curve-diagnosis` chapter that asks for "curve pattern -> likely cause -> next experiment".
- `src/components/AppliedWorkflowLessonLab.vue` renders optimizer content through `optimizerStages` and `selectedOptimizerStage`.
- `src/data/algorithmCheckpoints.ts` checks loop order and the simple "learning rate too high" failure, but not controlled experiment choice across multiple curve patterns.

## Goals

1. Make optimizer comparison an active diagnostic task, not another stage switch.
2. Require a prediction before revealing evidence.
3. Teach controlled-variable thinking: same task and metric, one knob changed at a time.
4. Cover the four optimizer signals already implied by the chapter: learning rate, batch noise, momentum/adaptive behavior, and scheduling.
5. Keep implementation narrow enough for one helper, one local component, one wiring point, focused tests, and summary/state docs.

## Non-Goals

- Do not add backend, database, account, or durable progress behavior.
- Do not add project readiness checklist work.
- Do not add a general experiment notebook, chart builder, or freeform optimizer simulator.
- Do not move `optimizer-comparison` into `LessonPage`.
- Do not rewrite `AppliedWorkflowLessonLab.vue` beyond one section-level conditional.
- Do not migrate Math Lab `calculus-optimizer-comparison`; it remains a support/overlap surface.
- Do not compare every optimizer on every model or add a new course module.

## Teaching Contract

The learner question:

> Given this training curve, what is the most likely optimization issue, what is the next controlled experiment, and which evidence supports that decision?

The task loop:

1. **Inspect:** Read one fixed scenario with train loss, validation loss, learning-rate trace, batch size, optimizer, and short experiment note.
2. **Predict:** Choose the likely issue before seeing the answer.
3. **Plan:** Choose the next single-variable experiment.
4. **Verify:** Reveal evidence metrics such as volatility, plateau delta, final loss, or post-schedule improvement.
5. **Explain:** Connect the evidence to learning rate, batch noise, momentum/adaptive behavior, or scheduling.

## Scenario Set

| Scenario | Visible Pattern | Likely Issue | Next Experiment | Teaching Point |
| --- | --- | --- | --- | --- |
| `lr-divergence` | Train and validation loss spike upward and one step becomes non-finite. | Learning rate too high. | Lower only `lr` and rerun with the same optimizer, batch size, and seed. | Direction can be right while step size is unstable. |
| `small-batch-noise` | Training curve jitters strongly but the smoothed trend still falls; validation is less jagged. | Batch size too small / gradient estimate too noisy. | Increase only `batch_size` or compare gradient accumulation with the same `lr`. | Noise is not automatically failure if the trend improves. |
| `ravine-zigzag` | SGD descends slowly with alternating high/low steps; Momentum/Adam-style evidence would damp it. | Momentum/adaptive state is missing for a ravine-like landscape. | Change only optimizer state, such as SGD -> SGD+momentum, while keeping `lr` comparable. | Optimizer choice is not just "larger lr"; it changes update history. |
| `schedule-plateau` | Loss drops early, then plateaus while `lr` stays constant; a decay point would allow fine adjustment. | Learning-rate schedule is missing or too late. | Add only a decay schedule or move the decay earlier with the same optimizer. | Schedule changes step-size over time, not the model family. |

The first implementation should keep these scenarios deterministic and synthetic. The goal is diagnosis literacy, not high-fidelity training.

## Helper Contract

Create a deterministic helper in `src/simulations/optimizerCurveDiagnosisChallenge.ts`.

```ts
export type OptimizerCurveScenarioId =
  | 'lr-divergence'
  | 'small-batch-noise'
  | 'ravine-zigzag'
  | 'schedule-plateau'

export type OptimizerCurveIssue =
  | 'learning-rate-too-high'
  | 'batch-noise-too-high'
  | 'momentum-or-adaptive-needed'
  | 'schedule-needed'

export type OptimizerCurveExperiment =
  | 'lower-learning-rate'
  | 'increase-batch-size'
  | 'add-momentum-or-adam'
  | 'add-or-move-lr-decay'

export interface OptimizerCurvePrediction {
  issue: OptimizerCurveIssue
  nextExperiment: OptimizerCurveExperiment
}

export interface OptimizerCurvePoint {
  step: number
  trainLoss: number
  validationLoss: number
  learningRate: number
}

export interface OptimizerCurveScenario {
  id: OptimizerCurveScenarioId
  optimizer: string
  batchSize: number
  learningRate: number
  note: string
  points: OptimizerCurvePoint[]
  expectedIssue: OptimizerCurveIssue
  expectedExperiment: OptimizerCurveExperiment
}

export interface OptimizerCurveDiagnosisSnapshot {
  scenario: OptimizerCurveScenario
  evidence: {
    finalTrainLoss: number
    finalValidationLoss: number
    trainVolatility: number
    validationVolatility: number
    plateauDelta: number
    hasNonFiniteLoss: boolean
    learningRateChanges: number
  }
  result: {
    issueCorrect: boolean
    experimentCorrect: boolean
    allCorrect: boolean
  }
}
```

Validation rules:

- Unknown scenario IDs fall back to `lr-divergence`.
- Unknown prediction values are normalized to a safe incorrect default rather than throwing.
- Numeric evidence is derived from the curve arrays, not hard-coded in the component.
- The helper is independent of Vue, DOM, D3, Three.js, TensorFlow, and browser APIs.

## Interaction Layout

Create `src/components/OptimizerCurveDiagnosisChallengeLab.vue`.

Panels:

- Scenario selector with the four fixed curve patterns.
- Compact curve chart with train loss, validation loss, and optional learning-rate trace.
- Prediction controls for likely issue and next controlled experiment.
- Evidence cards for volatility, plateau movement, non-finite loss, and learning-rate changes.
- Feedback panel that explains why the selected issue/experiment is correct or not.

The learner can change predictions at any time. There is no persistence and no required completion state in Phase 20.

## Wiring Choice

Unlike CNN, `optimizer-comparison` is currently rendered through `AppliedWorkflowLessonLab.vue`. The implementation should add one conditional inside the optimizer branch:

```vue
<OptimizerCurveDiagnosisChallengeLab
  v-if="props.moduleSlug === 'optimizer-comparison' && props.section.id === 'curve-diagnosis'"
  :accent="props.accent"
/>
```

Keep the existing `optimizerStages` stage list visible below or beside the challenge so the old explanatory surface remains available.

## Styling And Accessibility

- Use existing `algorithm-shell.css` and `workflow-lab` styling conventions.
- Keep the chart deterministic SVG, not an animated canvas.
- Use labels, legends, and text feedback; color cannot be the only signal.
- Use stable dimensions for the chart and controls at desktop and 390px mobile widths.
- Add keyboard-usable scenario and prediction controls.
- Keep reduced-motion behavior simple: no required animation.

## Files To Touch In Implementation

- Create `src/simulations/optimizerCurveDiagnosisChallenge.ts`.
- Create `src/components/OptimizerCurveDiagnosisChallengeLab.vue`.
- Modify `src/components/AppliedWorkflowLessonLab.vue`.
- Modify `src/styles/views/algorithm-shell.css`.
- Optionally modify `src/data/optimizerComparisonModule.ts` to make the `curve-diagnosis` experiment prompt point to the new prediction task.
- Add `tests/optimizer-curve-diagnosis-challenge.test.ts`.
- Update `tests/deep-learning-extension-modules.test.mjs` only if source-token coverage should lock the new wiring.
- Update `.planning/STATE.md` and `docs/refactor/summaries/phase-20.md` after implementation.

## Acceptance Criteria

- The optimizer `curve-diagnosis` chapter includes a prediction/evidence challenge.
- The task asks learners to choose likely issue and next controlled experiment before revealing evidence.
- Scenarios cover learning-rate divergence, batch noise, momentum/adaptive behavior, and schedule plateau.
- Core evidence calculations are tested outside Vue.
- Existing optimizer stage-switch explanation remains available.
- Existing spine, Topic Library roles, legacy routes, and checkpoint submissions remain intact.
- Runtime implementation PR runs targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks for `/learn/optimizer-comparison/curve-diagnosis`.

## Self-Review

- **Overdesign check:** This design adds one helper and one component. It rejects backend, durable progress, broad simulator work, route rewrites, new inventory, and `LessonPage` migration.
- **Quality check:** The learner must diagnose a curve and choose a controlled next experiment. This is stronger than clicking optimizer stage tabs.
- **Coverage check:** The four scenarios map to the current module's learning-rate, batch-size, Momentum/RMSProp/Adam, and schedule chapters.
- **Risk check:** The only runtime integration point should be one conditional in `AppliedWorkflowLessonLab.vue`; this keeps blast radius smaller than moving the module architecture.

## Proposed Implementation Sequence

1. Add failing helper tests for the four scenarios and invalid learner predictions.
2. Implement `optimizerCurveDiagnosisChallenge.ts`.
3. Add source tests for component tokens and `AppliedWorkflowLessonLab.vue` wiring.
4. Build `OptimizerCurveDiagnosisChallengeLab.vue` with localized copy, SVG chart, prediction controls, and feedback.
5. Add responsive styles.
6. Run targeted tests, full tests, builds, and browser checks.
