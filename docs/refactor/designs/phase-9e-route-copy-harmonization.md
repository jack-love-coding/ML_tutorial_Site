# Phase 9E: Route Copy Harmonization Design Draft

**Created:** 2026-06-27  
**Status:** Implemented after review approval.

**Scope:** Stage-level route copy, bridge copy, and validation criteria for the Curriculum Spine V1 learner route.

## Context

Phase 9A through 9D made the route structurally coherent:

- Phase 9A added the typed `curriculumSpineStages` contract.
- Phase 9B aligned homepage and navigation around the Default Spine.
- Phase 9C added `/spine` as the stage landing view.
- Phase 9D filled the sequence/embedding bridge gap before Attention/Transformer.

The next problem is not missing modules. It is route narration. A learner can now see the right modules in the right order, but several transitions still rely on the learner inferring why one stage follows another.

## Problem

The `/spine` page currently explains each stage with:

- title,
- learner question,
- required modules,
- support lenses,
- project validation,
- outcomes.

That is enough for structure, but not enough for teaching momentum. The page still has three copy problems:

1. **Transitions are implicit.**  
   A learner sees "Data Becomes Features" followed by "Feature Space and Loss", but the page does not explicitly say why data choices become loss behavior.

2. **Some completion standards read like topic lists.**  
   Outcomes often name concepts, but do not always tell the learner what they should be able to do with those concepts.

3. **Hero and support copy still reflects earlier gap-tracking language.**  
   After Phase 9D, known gaps are no longer the main story. The page should feel like a guided route, not an audit report.

## Design Goal

Make `/spine` read like a guided learning route:

- The learner understands why each stage exists.
- The learner understands what prior stage it builds on.
- The learner understands what later stage it unlocks.
- The copy stays bilingual, concise, and testable.
- The implementation remains small and data-first.

## Non-Goals

- Do not rewrite lesson bodies.
- Do not migrate modules into a new lesson renderer.
- Do not add backend, accounts, database, or progress tracking.
- Do not add new curriculum modules.
- Do not redesign the `/spine` layout.
- Do not turn support lenses into hard blockers.
- Do not remove legacy routes or flat `/tracks/core-learning-path`.

## Recommended Product Shape

### 1. Add one typed bridge sentence per stage

Add a required localized field to each `CurriculumSpineStage`:

```ts
bridge: LocalizedCopy
```

Purpose:

- Explain why this stage comes now.
- Connect the previous learning object to the next learning object.
- Keep this as one short paragraph, not a new content block system.

Why this is not over-designed:

- It is a single field on an existing typed object.
- It avoids a separate route-copy registry.
- It avoids rewriting module summaries.
- It gives tests a concrete contract for stage transition copy.

### 2. Render bridge copy in the existing stage header

Place the bridge paragraph directly under `learnerQuestion` in `CurriculumSpineView.vue`.

Suggested structure:

```vue
<p class="spine-stage-card__bridge">
  {{ localizedText(stage.bridge) }}
</p>
```

No new cards, tabs, modals, or controls. This is route narration, not a new interaction layer.

### 3. Harmonize hero and labels

Update `/spine` hero body so it no longer frames the page around known gaps.

Current direction:

> each stage shows the guiding question, required modules, support lenses, recommended project validation, and known coverage gaps

Recommended direction:

> each stage shows the guiding question, why it comes next, required modules, support lenses, project validation, and completion standards

Keep the known-gaps UI path available for future gaps, but do not mention it in hero copy when it is not the central learner task.

### 4. Tighten completion standards

Outcomes should be action-shaped:

- Prefer "can explain why X changes Y" over "can explain X, Y, Z".
- Prefer "can diagnose" or "can trace" when the stage is about process.
- Keep one outcome per stage for now.

Do not add multi-item rubrics in Phase 9E. That would drift toward progress/checklist scope.

## Proposed Bridge Copy

These are draft strings for review. They are intentionally short enough to fit inside the existing stage card.

### Stage 0 - Orientation

**zh-CN:** 先建立共同词汇：样本、特征、标签、预测、误差和训练循环。后面的数据、模型和数学都会反复回到这几个词。  
**en:** Start with the shared vocabulary: sample, feature, label, prediction, error, and training loop. Later data, model, and math stages keep returning to these words.

### Stage 1 - Data Becomes Features

**zh-CN:** 知道模型会学习之后，先看它到底吃进去什么。原始表格的列、缺失、类别和标签质量会决定后面所有模型的输入。  
**en:** Once learning is defined, inspect what the model actually consumes. Raw columns, missing values, categories, and label quality shape every later model input.

### Stage 2 - Feature Space and Loss

**zh-CN:** 当数据变成特征向量，下一步就是给预测错误一个评分规则。loss 把数据选择、模型输出和训练反馈连起来。  
**en:** Once data becomes feature vectors, the next step is scoring prediction error. Loss connects data choices, model output, and training feedback.

### Stage 3 - First Interpretable Model

**zh-CN:** 有了特征和 loss，线性回归就是第一个能手算、能画图、能复盘误差的完整模型。房价项目用它做诚实 baseline。  
**en:** With features and loss in place, linear regression becomes the first complete model you can calculate, draw, and review. The housing project uses it as an honest baseline.

### Stage 4 - Training Motion

**zh-CN:** 线性模型让误差可见，梯度下降解释参数为什么会动。这里把 loss surface、学习率和 batch noise 变成训练轨迹。  
**en:** Linear models make error visible; gradient descent explains why parameters move. This stage turns loss surfaces, learning rate, and batch noise into training motion.

### Stage 5 - Classification and Probability Outputs

**zh-CN:** 回归预测连续数值，分类要把分数或概率变成决策。这里先建立概率、阈值和错误成本，再进入分类项目复盘。  
**en:** Regression predicts continuous values; classification turns scores or probabilities into decisions. This stage builds probability, threshold, and error-cost intuition before the project review.

### Stage 6 - Generalization and Model Selection

**zh-CN:** 能训练一个模型还不够，还要知道它离开训练集后会不会可靠。这里把 split、泄漏、交叉验证和正则化放成同一条评估协议。  
**en:** Training a model is not enough; you need to know whether it stays reliable beyond the training set. This stage turns splits, leakage, cross-validation, and regularization into one evaluation protocol.

### Stage 7 - Nonlinear Tabular Models

**zh-CN:** 在进入神经网络前，先看不用梯度也能学习非线性规则的模型。树和森林帮助区分规则、交互、复杂度和特征重要性。  
**en:** Before neural networks, study models that learn nonlinear rules without gradients. Trees and forests separate rules, interactions, complexity, and feature importance.

### Stage 8 - Neural Network Foundations

**zh-CN:** 树模型会切规则，神经网络会学习表示。这里把层、激活函数、反向传播和优化器状态接成可诊断的训练系统。  
**en:** Trees cut rules; neural networks learn representations. This stage connects layers, activations, backpropagation, and optimizer state into a diagnosable training system.

### Stage 9 - Visual Deep Learning

**zh-CN:** 理解 MLP 后，再看图像为什么需要空间结构。CNN 把 H×W×C、局部窗口、参数共享和 shape 变化连成视觉模型。  
**en:** After MLPs, study why images need spatial structure. CNNs connect H×W×C, local windows, weight sharing, and shape changes into visual models.

### Stage 10 - Sequences, Attention, and Transformers

**zh-CN:** 图像强调空间位置，序列强调 token 位置。先把 token id、embedding、position 和 mask 接成 [B,T,H]，再进入 attention。  
**en:** Images emphasize spatial position; sequences emphasize token position. First connect token ids, embeddings, position, and mask into [B,T,H], then enter attention.

## Proposed Outcome Tightening

Implementation should update outcomes only where the current text reads like a topic list.

| Stage | Current Issue | Recommended Direction |
| --- | --- | --- |
| `feature-space-and-loss` | Good but broad | Say the learner can trace a row into a feature vector and explain how loss scores a prediction. |
| `classification-probability` | Lists many metrics | Say the learner can choose a threshold by error cost and explain confusion-matrix tradeoffs. |
| `generalization-selection` | Good concepts, weak action | Say the learner can separate training, validation, and final test responsibilities. |
| `neural-network-foundations` | Lists components | Say the learner can connect hidden representations, optimizer state, and loss curves. |
| `sequence-attention` | Dense list | Say the learner can trace token ids to `[B,T,H]`, then explain how attention mixes context. |

## Files To Touch In Implementation

- `src/curriculum/types.ts`  
  Add `bridge: LocalizedCopy` to `CurriculumSpineStage`.

- `src/curriculum/spine.ts`  
  Add bilingual `bridge` copy for all 11 stages. Tighten selected outcomes.

- `src/views/CurriculumSpineView.vue`  
  Render stage bridge text under the learner question. Update hero body to remove gap-first framing.

- `src/styles/views/curriculum.css`  
  Add one small `.spine-stage-card__bridge` rule if existing text styles do not cover it.

- `tests/curriculumSpine.test.ts`  
  Assert every stage has localized bridge copy, no empty strings, no duplicate required modules, and current validation still passes.

- `tests/curriculumSpineLanding.test.ts`  
  Assert the stage landing source renders bridge copy and the hero no longer depends on known-gap framing.

- `tests/homeCurriculumIA.test.ts` or `tests/data-lab-layout.test.mjs` only if shared README/home copy changes.

- `docs/refactor/summaries/phase-9.md`  
  Record Phase 9E implementation and verification after the work ships.

## Implementation Tasks

### Task 1 - Contract and Tests

- Add failing tests for stage bridge copy.
- Add `bridge` to `CurriculumSpineStage`.
- Add bridge copy to all stages.
- Run:

```bash
node --test tests/curriculumSpine.test.ts
```

Expected result after implementation: pass.

### Task 2 - Spine Landing Rendering

- Render bridge copy in `CurriculumSpineView.vue`.
- Update hero body in both locales.
- Add minimal CSS only if spacing needs it.
- Run:

```bash
node --test tests/curriculumSpineLanding.test.ts tests/curriculumRoutingNavigation.test.ts
```

Expected result after implementation: pass.

### Task 3 - Outcome Copy Tightening

- Update selected `outcomes` in `src/curriculum/spine.ts`.
- Keep one outcome per stage.
- Avoid introducing checklist/progress semantics.
- Run:

```bash
node --test tests/curriculumSpine.test.ts tests/curriculumCatalog.test.ts
```

Expected result after implementation: pass.

### Task 4 - Browser Verification

- Start dev server:

```bash
npm run dev -- --host 127.0.0.1
```

- Verify `/spine` at desktop and mobile widths:
  - 11 stage cards render.
  - Each visible stage has bridge copy.
  - Stage 10 still lists `sequence-embedding-bridge` before `attention-transformer`.
  - No horizontal overflow.
  - No console errors.

### Task 5 - Final Verification

Run:

```bash
git diff --check
npm test
npm run build
npm run build:pages
node scripts/create-pages-fallbacks.mjs
```

Expected result:

- all tests pass,
- builds pass with only the existing large-chunk warning,
- fallback route count remains at least 46 and includes existing core routes.

## Acceptance Criteria

- Every `curriculumSpineStages` item has bilingual `bridge` copy.
- `/spine` shows the stage bridge copy without adding a new navigation concept.
- Hero copy describes route guidance rather than known-gap auditing.
- Required module order is unchanged.
- No new modules are added.
- No progress/backend scope is introduced.
- Existing `/tracks/core-learning-path` remains reachable.
- `npm test`, `npm run build`, and `npm run build:pages` pass.

## Open Review Questions

1. Should the bridge field be named `bridge`, `whyNow`, or `transition`?
   - Recommendation: `bridge`, because it is short and matches the learner-facing purpose.

2. Should support lens copy remain generic or become stage-specific?
   - Recommendation: keep it generic in Phase 9E. Stage-specific support copy risks expanding into a second curriculum schema.

3. Should bridge copy appear on the flat `/tracks/core-learning-path` page?
   - Recommendation: no. Keep Phase 9E focused on `/spine`; the flat list is for quick jumping.

4. Should projects get their own bridge copy?
   - Recommendation: no for Phase 9E. Project validation copy already exists and should stay as a recommended capstone note.
