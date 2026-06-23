# Calculus Learning Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a seven-chapter beginner calculus route that starts with functions and rate of change, then connects derivatives, gradients, gradient descent, SGD, optimizers, and training diagnostics.

**Architecture:** Keep the existing `MathLabModule` schema, page component, and lab registry. Add a focused `calculusRouteModules.ts` data file, register those modules in the explicit `aiMathPath`, and update navigation so the learner-facing calculus route is a visible sequence while existing calculus-related modules remain available as advanced follow-ups.

**Tech Stack:** Vue 3, TypeScript, Vite, Node test runner, existing Math Lab typed data, existing public image/Manim assets, existing lab components (`LocalChangeStoryLab`, `MathGradientLab`, `BackpropBlockLab`, `TrainingDiagnosticsLab`, and fallback `NumericalMiniLab` if needed).

---

## File Structure

Create:

- `src/modules/math-lab/data/calculusRouteModules.ts`
  - Owns the seven new beginner calculus route modules:
    - `calculus-functions-rate-change`
    - `calculus-derivatives-local-change`
    - `calculus-partial-derivatives-gradients`
    - `calculus-gradient-descent`
    - `calculus-sgd-batch-noise`
    - `calculus-optimizer-comparison`
    - `calculus-training-code-diagnostics`
  - Uses local helper constructors matching `linearAlgebraRouteModules.ts`: `copy`, `section`, `concept`, `imageAsset`, `manimAsset`, `lab`, `quiz`, `misconception`, and `moduleDefinition`.
  - Reuses existing public assets where available and keeps any missing visual requirement satisfied by an existing interactive lab.

- `docs/math-lab-calculus-route-sources.md`
  - Records route design, reused source modules, reused public assets, source references, and first-pass media boundaries.

Modify:

- `src/modules/math-lab/data/modules.ts`
  - Import `calculusRouteModules`.
  - Replace `beginner-calculus` in `aiMathPath` with the seven new route module IDs.
  - Include `calculusRouteModules` in `allModulesById`.
  - Leave `beginnerFoundationModules` imported because it still provides beginner linear algebra and probability modules.

- `src/data/navigationMenus.ts`
  - Remove `beginner-calculus` from the `zero-foundation` navigation group.
  - Add a new `calculus-route` group with the seven route modules in order.
  - Keep advanced calculus/numerical modules in `calculus-optimization`, starting at `taylor-series`.

- `src/modules/math-lab/pages/MathLabHome.vue`
  - Update the beginner calculus card route from `/math-lab/modules/beginner-calculus` to `/math-lab/modules/calculus-functions-rate-change`.
  - Keep the existing beginner calculus image and copy as the route entry point.

- `tests/math-lab-core.test.ts`
  - Update module count and route order.
  - Add a calculus route completeness test.

- `tests/site-navigation.test.ts`
  - Update expected math-lab navigation routes and add a calculus route group order assertion.

- `tests/math-lab-layout.test.mjs`
  - Update home route assertions and source-doc existence checks.

No page-component change is expected. `MathLabModulePage.vue` already registers all lab components needed for the first pass.

## Content Contract

Every new module must satisfy this contract:

- `enhancementTier`: use `interactive`.
- `difficulty`: use `foundation`.
- `sourceNoteFile`: use `math-lab-calculus-route-sources.md`.
- `sections`: at least 4 sections, including a final review section whose English text contains `Review Questions`.
- `learningObjectives`: at least 3 localized objectives.
- `concepts`: at least 1 localized concept with variable explanations.
- `labs`: at least 1 lab entry, reusing an existing registered component.
- `quizzes`: at least 2 quiz items with explanations and misconception tags.
- `misconceptions`: at least 2 misconception records.
- `sourceReferences`: at least one source reference.
- All `visualIds` and `labIds` referenced by sections must exist in the module's `visuals` and `labs`.

Use these exact chapter IDs, titles, primary labs, and required content anchors:

| Order | ID | Chinese title | English title | Primary lab | Required Chinese content anchors |
| ---: | --- | --- | --- | --- | --- |
| 1 | `calculus-functions-rate-change` | 函数和变化率 | Functions and Rate of Change | `LocalChangeStoryLab` | `买菜`, `小车`, `平均变化率` |
| 2 | `calculus-derivatives-local-change` | 导数：当前点附近的变化 | Derivatives as Local Change | `LocalChangeStoryLab` | `观察窗口`, `割线`, `切线` |
| 3 | `calculus-partial-derivatives-gradients` | 偏导数和梯度 | Partial Derivatives and Gradients | `MathGradientLab` | `旋钮`, `偏导数`, `梯度指向` |
| 4 | `calculus-gradient-descent` | 梯度下降 | Gradient Descent | `MathGradientLab` | `负梯度`, `学习率`, `震荡` |
| 5 | `calculus-sgd-batch-noise` | Full Batch、Mini-Batch 和 SGD | Full Batch, Mini-Batch, and SGD | `MathGradientLab` | `batch size`, `iteration`, `epoch` |
| 6 | `calculus-optimizer-comparison` | 优化器比较 | Optimizer Comparison | `MathGradientLab` | `Momentum`, `RMSProp`, `Adam` |
| 7 | `calculus-training-code-diagnostics` | 训练代码和曲线诊断 | Training Code and Curve Diagnostics | `TrainingDiagnosticsLab` | `zero_grad`, `loss.backward`, `optimizer.step` |

Use these exact next-module edges through `aiMathPath`:

```ts
[
  'calculus-functions-rate-change',
  'calculus-derivatives-local-change',
  'calculus-partial-derivatives-gradients',
  'calculus-gradient-descent',
  'calculus-sgd-batch-noise',
  'calculus-optimizer-comparison',
  'calculus-training-code-diagnostics',
  'taylor-series',
]
```

---

### Task 1: Add Failing Route and Navigation Tests

**Files:**
- Modify: `tests/math-lab-core.test.ts`
- Modify: `tests/site-navigation.test.ts`
- Modify: `tests/math-lab-layout.test.mjs`

- [ ] **Step 1: Update the expected Math Lab module order**

In `tests/math-lab-core.test.ts`, find the test named `math lab modules include the zero-base AI math path with the linear algebra route split`.

Change:

```ts
assert.equal(mathLabModules.length, 25)
```

to:

```ts
assert.equal(mathLabModules.length, 31)
```

Change:

```ts
Array.from({ length: 25 }, (_, index) => index + 1)
```

to:

```ts
Array.from({ length: 31 }, (_, index) => index + 1)
```

Replace the `beginner-calculus` item in the expected `mathLabModules.map((moduleDefinition) => moduleDefinition.id)` array with these seven items:

```ts
'calculus-functions-rate-change',
'calculus-derivatives-local-change',
'calculus-partial-derivatives-gradients',
'calculus-gradient-descent',
'calculus-sgd-batch-noise',
'calculus-optimizer-comparison',
'calculus-training-code-diagnostics',
```

Keep `taylor-series` immediately after `calculus-training-code-diagnostics`.

- [ ] **Step 2: Add a calculus route completeness test**

Append this test after the existing `linear algebra route split exposes seven ordered case-driven chapters` test:

```ts
test('calculus route exposes seven ordered beginner chapters from change to training code', () => {
  const routeIds = [
    'calculus-functions-rate-change',
    'calculus-derivatives-local-change',
    'calculus-partial-derivatives-gradients',
    'calculus-gradient-descent',
    'calculus-sgd-batch-noise',
    'calculus-optimizer-comparison',
    'calculus-training-code-diagnostics',
  ]
  const byId = Object.fromEntries(mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))

  assert.deepEqual(
    routeIds.map((id) => byId[id]?.nextModuleIds[0]),
    [
      'calculus-derivatives-local-change',
      'calculus-partial-derivatives-gradients',
      'calculus-gradient-descent',
      'calculus-sgd-batch-noise',
      'calculus-optimizer-comparison',
      'calculus-training-code-diagnostics',
      'taylor-series',
    ],
  )

  for (const id of routeIds) {
    const moduleDefinition = byId[id]
    assert.ok(moduleDefinition, `${id} should be registered`)
    assert.equal(moduleDefinition.difficulty, 'foundation')
    assert.ok(moduleDefinition.title['zh-CN'])
    assert.ok(moduleDefinition.title.en)
    assert.ok(moduleDefinition.subtitle['zh-CN'])
    assert.ok(moduleDefinition.subtitle.en)
    assert.ok(moduleDefinition.learningObjectives.length >= 3, `${id} should define learning objectives`)
    assert.ok(moduleDefinition.concepts.length >= 1, `${id} should define concepts`)
    assert.ok(moduleDefinition.sections.length >= 4, `${id} should define route sections`)
    assert.ok(moduleDefinition.labs.length >= 1, `${id} should expose one primary lab`)
    assert.ok(moduleDefinition.quizzes.length >= 2, `${id} should include checkpoint questions`)
    assert.ok(moduleDefinition.misconceptions.length >= 2, `${id} should include misconception feedback`)
    assert.equal(moduleDefinition.sourceNoteFile, 'math-lab-calculus-route-sources.md')
    assert.ok(moduleDefinition.sourceReferences?.length, `${id} should have source references`)

    const englishBody = moduleDefinition.sections.map((section) => `${section.title.en}\n${section.content.en}`).join('\n')
    assert.match(englishBody, /Review Questions/)
  }

  assert.match(
    byId['calculus-functions-rate-change']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /买菜|小车|平均变化率/,
  )
  assert.match(
    byId['calculus-derivatives-local-change']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /观察窗口|割线|切线/,
  )
  assert.match(
    byId['calculus-partial-derivatives-gradients']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /旋钮|偏导数|梯度指向/,
  )
  assert.match(
    byId['calculus-gradient-descent']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /负梯度|学习率|震荡/,
  )
  assert.match(
    byId['calculus-sgd-batch-noise']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /batch size|iteration|epoch/,
  )
  assert.match(
    byId['calculus-optimizer-comparison']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /Momentum|RMSProp|Adam/,
  )
  assert.match(
    byId['calculus-training-code-diagnostics']!.sections.map((section) => section.content['zh-CN']).join('\n'),
    /zero_grad|loss\.backward|optimizer\.step/,
  )
})
```

- [ ] **Step 3: Update the generic body expectations for new route IDs**

Inside the loop in `tests/math-lab-core.test.ts` that checks `englishBody`, add these `else if` branches near the existing `beginner-calculus` branch:

```ts
} else if (moduleDefinition.id === 'calculus-functions-rate-change') {
  assert.match(englishBody, /average rate of change|function|input-output/i)
} else if (moduleDefinition.id === 'calculus-derivatives-local-change') {
  assert.match(englishBody, /derivative|secant|tangent/i)
} else if (moduleDefinition.id === 'calculus-partial-derivatives-gradients') {
  assert.match(englishBody, /partial derivative|gradient|parameter/i)
} else if (moduleDefinition.id === 'calculus-gradient-descent') {
  assert.match(englishBody, /negative gradient|learning rate|oscillation/i)
} else if (moduleDefinition.id === 'calculus-sgd-batch-noise') {
  assert.match(englishBody, /mini-batch|SGD|epoch/i)
} else if (moduleDefinition.id === 'calculus-optimizer-comparison') {
  assert.match(englishBody, /Momentum|RMSProp|Adam/)
} else if (moduleDefinition.id === 'calculus-training-code-diagnostics') {
  assert.match(englishBody, /loss\.backward|optimizer\.step|gradient norm/)
```

- [ ] **Step 4: Update site navigation route expectations**

In `tests/site-navigation.test.ts`, inside the expected `routes` array:

Remove:

```ts
'/math-lab/modules/beginner-calculus',
```

Add these routes after `/math-lab/modules/condition-numbers` and before `/math-lab/modules/taylor-series`:

```ts
'/math-lab/modules/calculus-functions-rate-change',
'/math-lab/modules/calculus-derivatives-local-change',
'/math-lab/modules/calculus-partial-derivatives-gradients',
'/math-lab/modules/calculus-gradient-descent',
'/math-lab/modules/calculus-sgd-batch-noise',
'/math-lab/modules/calculus-optimizer-comparison',
'/math-lab/modules/calculus-training-code-diagnostics',
```

Add this assertion before the full routes assertion:

```ts
const calculusRouteGroup = mathLabNavigationGroups.find((group) => group.id === 'calculus-route')
assert.ok(calculusRouteGroup)
assert.deepEqual(
  calculusRouteGroup.items.map((item) => item.id),
  [
    'calculus-functions-rate-change',
    'calculus-derivatives-local-change',
    'calculus-partial-derivatives-gradients',
    'calculus-gradient-descent',
    'calculus-sgd-batch-noise',
    'calculus-optimizer-comparison',
    'calculus-training-code-diagnostics',
  ],
)
```

- [ ] **Step 5: Update layout/source smoke checks**

In `tests/math-lab-layout.test.mjs`, update the home card route assertion:

```js
assert.match(homeSource, /\/math-lab\/modules\/calculus-functions-rate-change/)
assert.doesNotMatch(homeSource, /\/math-lab\/modules\/beginner-calculus/)
```

Inside the `math lab uses generated imported notes and local migrated assets` test, add:

```js
assert.ok(existsSync(new URL('src/modules/math-lab/data/calculusRouteModules.ts', root)))
assert.ok(existsSync(new URL('docs/math-lab-calculus-route-sources.md', root)))
```

Add one source check:

```js
assert.match(modulesSource, /calculusRouteModules/)
```

- [ ] **Step 6: Run focused tests and verify they fail**

Run:

```bash
npm test -- tests/math-lab-core.test.ts tests/site-navigation.test.ts tests/math-lab-layout.test.mjs
```

Expected: FAIL because `calculusRouteModules.ts` and `docs/math-lab-calculus-route-sources.md` do not exist, route IDs are not registered, navigation has no `calculus-route` group, and home still links to `beginner-calculus`.

- [ ] **Step 7: Commit failing tests**

```bash
git add tests/math-lab-core.test.ts tests/site-navigation.test.ts tests/math-lab-layout.test.mjs
git commit -m "Add calculus learning route tests"
```

---

### Task 2: Create the Calculus Route Data

**Files:**
- Create: `src/modules/math-lab/data/calculusRouteModules.ts`
- Test: `tests/math-lab-core.test.ts`

- [ ] **Step 1: Create the data file with shared helpers**

Create `src/modules/math-lab/data/calculusRouteModules.ts` with helpers that mirror the existing route data style:

```ts
import type {
  LabConfig,
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
  Misconception,
  QuizItem,
  SourceReference,
  VisualAsset,
} from '../types/mathLab'

const md = String.raw

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function section(
  id: string,
  title: LocalizedCopy,
  content: LocalizedCopy,
  placements: Pick<MathLabSection, 'visualIds' | 'labIds'> = {},
): MathLabSection {
  return { id, level: 2, title, content, ...placements }
}

function variable(symbol: string, zh: string, en: string) {
  return { symbol, description: copy(zh, en) }
}

function concept(
  id: string,
  name: LocalizedCopy,
  formulaLatex: string,
  variables: MathConcept['variables'],
  plainExplanation: LocalizedCopy,
  geometricIntuition: LocalizedCopy,
  numericalExample: LocalizedCopy,
  modelConnection: LocalizedCopy,
  codeExample?: string,
): MathConcept {
  return {
    id,
    name,
    formulaLatex,
    variables,
    plainExplanation,
    geometricIntuition,
    numericalExample,
    modelConnection,
    codeExample,
  }
}

function imageAsset(id: string, filename: string, title: LocalizedCopy, transcript: LocalizedCopy): VisualAsset {
  return {
    id,
    type: 'image',
    title,
    assetPath: `/math-lab/generated/${filename}`,
    transcript,
    alt: transcript,
    caption: transcript,
    learningPurpose: copy(
      '作为微积分路线的视觉锚点，帮助学生先看见变化，再进入公式。',
      'Serve as a visual anchor for the calculus route before formulas appear.',
    ),
  }
}

function manimAsset(id: string, filename: string, title: LocalizedCopy, transcript: LocalizedCopy): VisualAsset {
  return {
    id,
    type: 'manim-video',
    title,
    assetPath: `/manim/math-lab/${filename}.mp4`,
    posterPath: `/manim/math-lab/${filename}.svg`,
    transcript,
    alt: transcript,
    caption: transcript,
    learningPurpose: copy(
      '用短动画展示静态图难以表达的连续变化。',
      'Use a short animation to show continuous change that a static image cannot show.',
    ),
  }
}

function lab(id: string, title: LocalizedCopy, componentName: string, successCriteria: LocalizedCopy[]): LabConfig {
  return {
    id,
    title,
    type: 'interactive-visual',
    componentName,
    successCriteria,
  }
}

function quiz(
  id: string,
  prompt: LocalizedCopy,
  correctId: string,
  correct: LocalizedCopy,
  distractor: LocalizedCopy,
  explanation: LocalizedCopy,
  tag: string,
  revisitVisualId?: string,
): QuizItem {
  return {
    id,
    type: 'single-choice',
    prompt,
    choices: [
      { id: correctId, label: correct },
      { id: 'distractor', label: distractor },
    ],
    answer: correctId,
    explanation,
    misconceptionTags: [tag],
    revisitVisualId,
  }
}

function misconception(id: string, statement: LocalizedCopy, correction: LocalizedCopy, example: LocalizedCopy): Misconception {
  return { id, statement, correction, example }
}

function moduleDefinition(input: Omit<MathLabModule, 'order' | 'toc' | 'nextModuleIds'>): MathLabModule {
  return {
    ...input,
    order: 0,
    toc: input.sections.map((item) => ({ id: item.id, level: item.level, title: item.title })),
    nextModuleIds: [],
    importedAssetPaths:
      input.importedAssetPaths ??
      input.visuals.flatMap((visual) => [visual.assetPath, visual.posterPath]).filter((path): path is string => Boolean(path)),
  }
}
```

- [ ] **Step 2: Add shared source references**

Below the helpers, add:

```ts
const sources: Record<string, SourceReference> = {
  essenceCalculus: {
    label: copy('3Blue1Brown：微积分的本质', '3Blue1Brown: Essence of Calculus'),
    href: 'https://www.3blue1brown.com/topics/calculus',
    usage: copy(
      '参考从局部变化率、切线和直觉图像进入微积分的组织方式。',
      'Reference for introducing calculus through local rates, tangents, and intuitive visuals.',
    ),
  },
  d2lOptimization: {
    label: copy('Dive into Deep Learning：优化算法', 'Dive into Deep Learning: Optimization Algorithms'),
    href: 'https://d2l.ai/chapter_optimization/index.html',
    license: 'CC BY-SA 4.0',
    usage: copy(
      '参考 full batch、SGD、Momentum、RMSProp 和 Adam 的机器学习语境。',
      'Reference for full batch, SGD, Momentum, RMSProp, and Adam in machine-learning context.',
    ),
  },
  pytorchOptimization: {
    label: copy('PyTorch：优化模型参数', 'PyTorch: Optimizing Model Parameters'),
    href: 'https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html',
    usage: copy(
      '参考训练循环中 zero_grad、backward 和 optimizer step 的顺序。',
      'Reference for the order of zero_grad, backward, and optimizer step in the training loop.',
    ),
  },
  mml: {
    label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'),
    href: 'https://mml-book.github.io/',
    usage: copy(
      '校准微积分、梯度和优化在机器学习数学基础中的边界。',
      'Calibrate boundaries among calculus, gradients, and optimization in machine-learning math.',
    ),
  },
}
```

- [ ] **Step 3: Add reusable visuals and lab IDs inside each module**

Use these existing assets and component names:

```ts
imageAsset('calculus-route-story', 'beginner-calculus-story.png', copy('微积分路线总览', 'Calculus Route Overview'), copy('小车路径、切线斜率、局部变化框和 loss 山谷中的梯度步。', 'A car path, tangent slope, local-change boxes, and a gradient step in a loss valley.'))
imageAsset('derivative-window-image', 'beginner-derivative-window-longform.png', copy('导数窗口', 'Derivative Window'), copy('割线窗口逐步缩小，平均变化率靠近当前点斜率。', 'The secant window shrinks and the average rate approaches the current-point slope.'))
imageAsset('partial-gradient-image', 'beginner-partial-gradient-longform.png', copy('偏导数和梯度', 'Partial Derivatives and Gradient'), copy('多个参数旋钮分别产生偏导，合成 loss 地形中的梯度箭头。', 'Several parameter knobs produce partial derivatives that combine into a gradient arrow on the loss landscape.'))
imageAsset('learning-rate-image', 'beginner-learning-rate-behavior-longform.png', copy('学习率行为', 'Learning-Rate Behavior'), copy('小学习率、合适学习率和过大学习率在同一 loss 谷中的轨迹对比。', 'Small, suitable, and too-large learning rates are compared in the same loss valley.'))
manimAsset('derivative-window-video', 'beginner-derivative-window', copy('导数窗口动画', 'Derivative Window Animation'), copy('动画展示割线窗口缩小到当前点切线附近。', 'Animation showing a secant window shrinking toward the tangent at the current point.'))
manimAsset('learning-rate-video', 'beginner-learning-rate-behavior', copy('学习率动画', 'Learning-Rate Animation'), copy('动画对比小步、合适步长和过大步长的训练轨迹。', 'Animation comparing small, suitable, and too-large step sizes.'))
```

Use these lab IDs and component names:

```ts
lab('calculus-local-change-lab', copy('局部变化故事实验', 'Local Change Story Lab'), 'LocalChangeStoryLab', [
  copy('能说明两个点之间的平均变化率。', 'Explain the average rate of change between two points.'),
  copy('能说明观察窗口缩小时斜率读法怎样改变。', 'Explain how slope reading changes as the observation window shrinks.'),
])

lab('calculus-gradient-path-lab', copy('梯度路径实验', 'Gradient Path Lab'), 'MathGradientLab', [
  copy('能指出负梯度方向和学习率控制的步长。', 'Point out the negative-gradient direction and the step length controlled by learning rate.'),
  copy('能解释稳定下降、震荡和发散的区别。', 'Explain the difference between stable descent, oscillation, and divergence.'),
])

lab('calculus-training-diagnostics-lab', copy('训练曲线诊断', 'Training Curve Diagnostics'), 'TrainingDiagnosticsLab', [
  copy('能同时读取 train loss、validation loss 和 gradient norm。', 'Read train loss, validation loss, and gradient norm together.'),
  copy('能把曲线模式连接到学习率、过拟合或梯度问题。', 'Connect curve patterns to learning-rate, overfitting, or gradient issues.'),
])
```

- [ ] **Step 4: Add the seven module definitions**

Export `calculusRouteModules` as an array of seven complete `moduleDefinition({...})` calls in this exact order:

```ts
export const calculusRouteModules: MathLabModule[] = [
  firstChapter,
  secondChapter,
  thirdChapter,
  fourthChapter,
  fifthChapter,
  sixthChapter,
  seventhChapter,
]
```

Define `firstChapter` through `seventhChapter` as `MathLabModule` values produced by `moduleDefinition({...})` immediately above the export. Each value must include every required `MathLabModule` field except `order`, `toc`, and `nextModuleIds`, which the local `moduleDefinition` helper supplies.

For `calculus-functions-rate-change`, use:

- `estimatedMinutes: 32`
- `prerequisites: ['tensor-shapes-vectorization']`
- concept ID: `function-average-rate`
- formula: `\\frac{f(x+h)-f(x)}{h}`
- sections:
  - `function-machine-case`: include `买菜`, `小车`, `input-output`, and `function`.
  - `average-rate-secant`: include `平均变化率`, `average rate of change`, and `secant`.
  - `loss-as-function-preview`: include `loss` and `parameter`.
  - `function-rate-review`: include `Review Questions`.
- labs: `calculus-local-change-lab`
- quizzes:
  - `function-rate-interval`
  - `function-input-output`
- misconceptions:
  - `function-is-only-formula`
  - `average-is-current-point`

For `calculus-derivatives-local-change`, use:

- `estimatedMinutes: 34`
- `prerequisites: ['calculus-functions-rate-change']`
- concept ID: `derivative-local-change`
- formula: `f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}`
- sections:
  - `derivative-speedometer-case`: include `speedometer`, `this moment`, and `这一刻`.
  - `derivative-window-shrinks`: include `观察窗口`, `h=2,1,0.5,0.1`, `secant`, and `tangent`.
  - `derivative-signs-local`: include positive slope, negative slope, and flat neighborhood.
  - `derivative-review`: include `Review Questions`.
- visuals: `derivative-window-image`, `derivative-window-video`
- labs: `calculus-local-change-lab`
- quizzes:
  - `derivative-not-global-average`
  - `derivative-sign-reading`
- misconceptions:
  - `derivative-global-average`
  - `tangent-is-whole-curve`

For `calculus-partial-derivatives-gradients`, use:

- `estimatedMinutes: 36`
- `prerequisites: ['calculus-derivatives-local-change']`
- concept ID: `partial-gradient-list`
- formula: `\\nabla L(\\theta)=\\left[\\frac{\\partial L}{\\partial \\theta_1},\\frac{\\partial L}{\\partial \\theta_2},\\ldots\\right]`
- sections:
  - `partial-knob-case`: include `旋钮`, `weight`, `bias`, and `parameter`.
  - `partial-one-direction`: include `偏导数` and `hold the others fixed`.
  - `gradient-collects-partials`: include `梯度指向` and `fastest increase`.
  - `partial-gradient-review`: include `Review Questions`.
- visuals: `partial-gradient-image`
- labs: `calculus-gradient-path-lab`
- quizzes:
  - `partial-one-knob`
  - `gradient-points-uphill`
- misconceptions:
  - `partial-moves-all-parameters`
  - `gradient-is-downhill`

For `calculus-gradient-descent`, use:

- `estimatedMinutes: 38`
- `prerequisites: ['calculus-partial-derivatives-gradients']`
- concept ID: `negative-gradient-step`
- formula: `\\theta_{new}=\\theta-\\eta\\nabla L(\\theta)`
- sections:
  - `descent-loss-valley-case`: include `loss valley` and `负梯度`.
  - `descent-minus-sign`: include `subtract` and `not every parameter gets smaller`.
  - `descent-learning-rate`: include `学习率`, `oscillation`, `divergence`, and `震荡`.
  - `descent-review`: include `Review Questions`.
- visuals: `learning-rate-image`, `learning-rate-video`
- labs: `calculus-gradient-path-lab`
- quizzes:
  - `descent-subtract-gradient`
  - `descent-large-learning-rate`
- misconceptions:
  - `minus-means-parameters-smaller`
  - `learning-rate-is-speed-only`

For `calculus-sgd-batch-noise`, use:

- `estimatedMinutes: 36`
- `prerequisites: ['calculus-gradient-descent']`
- concept ID: `mini-batch-gradient-estimate`
- formula: `g_B(\\theta)=\\frac{1}{|B|}\\sum_{i\\in B}\\nabla_\\theta L_i(\\theta)`
- sections:
  - `sgd-full-batch-case`: include `full batch` and whole dataset average.
  - `sgd-mini-batch-estimate`: include `mini-batch`, `SGD`, and noisy estimate.
  - `sgd-iteration-epoch`: include `batch size`, `iteration`, and `epoch`.
  - `sgd-review`: include `Review Questions`.
- labs: `calculus-gradient-path-lab`
- quizzes:
  - `sgd-noisy-not-wrong`
  - `sgd-iteration-epoch`
- misconceptions:
  - `sgd-is-broken-gradient`
  - `epoch-equals-update`

For `calculus-optimizer-comparison`, use:

- `estimatedMinutes: 40`
- `prerequisites: ['calculus-sgd-batch-noise']`
- concept ID: `optimizer-problem-map`
- formula: `\\theta_{t+1}=\\theta_t-\\eta\\,\\operatorname{update}(g_t,\\text{state}_t)`
- sections:
  - `optimizer-baseline-sgd`: include plain SGD baseline.
  - `optimizer-momentum-ravine`: include `Momentum`, ravine, and direction memory.
  - `optimizer-rmsprop-adam`: include `RMSProp`, `Adam`, squared-gradient history, and scale adaptation.
  - `optimizer-review`: include `Review Questions`.
- labs: `calculus-gradient-path-lab`
- quizzes:
  - `optimizer-momentum-problem`
  - `optimizer-adam-combines`
- misconceptions:
  - `optimizer-removes-learning-rate`
  - `adam-always-best`

For `calculus-training-code-diagnostics`, use:

- `estimatedMinutes: 42`
- `prerequisites: ['calculus-optimizer-comparison']`
- concept ID: `training-loop-gradient-step`
- formula: `\\texttt{zero\\_grad()}\\rightarrow\\texttt{loss.backward()}\\rightarrow\\texttt{optimizer.step()}`
- sections:
  - `training-loop-order`: include `zero_grad`, `loss.backward`, and `optimizer.step`.
  - `training-backward-meaning`: include gradient computation through the computation graph.
  - `training-curves-diagnostics`: include `gradient norm`, validation loss, overfitting, exploding gradients, and vanishing gradients.
  - `training-code-review`: include `Review Questions`.
- labs: `calculus-training-diagnostics-lab`
- quizzes:
  - `training-loop-order`
  - `training-curve-diagnosis`
- misconceptions:
  - `backward-updates-parameters`
  - `train-longer-fixes-all`

- [ ] **Step 5: Run the route data test and verify it still fails before registration**

Run:

```bash
npm test -- tests/math-lab-core.test.ts
```

Expected: FAIL because the file exists but `modules.ts` does not import/register `calculusRouteModules` yet.

- [ ] **Step 6: Commit the unregistered route data**

```bash
git add src/modules/math-lab/data/calculusRouteModules.ts
git commit -m "Add calculus route module data"
```

---

### Task 3: Register the Route, Navigation, and Home Entry

**Files:**
- Modify: `src/modules/math-lab/data/modules.ts`
- Modify: `src/data/navigationMenus.ts`
- Modify: `src/modules/math-lab/pages/MathLabHome.vue`
- Test: `tests/math-lab-core.test.ts`
- Test: `tests/site-navigation.test.ts`
- Test: `tests/math-lab-layout.test.mjs`

- [ ] **Step 1: Import the route modules**

In `src/modules/math-lab/data/modules.ts`, add:

```ts
import { calculusRouteModules } from './calculusRouteModules.ts'
```

- [ ] **Step 2: Replace `beginner-calculus` in `aiMathPath`**

In `src/modules/math-lab/data/modules.ts`, replace:

```ts
'beginner-calculus',
```

with:

```ts
'calculus-functions-rate-change',
'calculus-derivatives-local-change',
'calculus-partial-derivatives-gradients',
'calculus-gradient-descent',
'calculus-sgd-batch-noise',
'calculus-optimizer-comparison',
'calculus-training-code-diagnostics',
```

- [ ] **Step 3: Add `calculusRouteModules` to `allModulesById`**

Change:

```ts
[...beginnerFoundationModules, ...linearAlgebraRouteModules, ...importedFoundationModules, ...aiBridgeModules]
```

to:

```ts
[
  ...beginnerFoundationModules,
  ...linearAlgebraRouteModules,
  ...calculusRouteModules,
  ...importedFoundationModules,
  ...aiBridgeModules,
]
```

Keep this formatting if the project formatter preserves it. If the file stays single-line after formatting, keep the order exactly the same.

- [ ] **Step 4: Update Math Lab navigation groups**

In `src/data/navigationMenus.ts`, remove this item from `zero-foundation`:

```ts
mathModule('beginner-calculus', 'AI 零基础微积分', 'Calculus for AI Beginners'),
```

Add this group after `linear-algebra-tools` and before `calculus-optimization`:

```ts
{
  id: 'calculus-route',
  label: copy('微积分学习路线', 'Calculus Learning Route'),
  items: [
    mathModule('calculus-functions-rate-change', '函数和变化率', 'Functions and Rate of Change'),
    mathModule('calculus-derivatives-local-change', '导数：当前点附近的变化', 'Derivatives as Local Change'),
    mathModule('calculus-partial-derivatives-gradients', '偏导数和梯度', 'Partial Derivatives and Gradients'),
    mathModule('calculus-gradient-descent', '梯度下降', 'Gradient Descent'),
    mathModule('calculus-sgd-batch-noise', 'Full Batch、Mini-Batch 和 SGD', 'Full Batch, Mini-Batch, and SGD'),
    mathModule('calculus-optimizer-comparison', '优化器比较', 'Optimizer Comparison'),
    mathModule('calculus-training-code-diagnostics', '训练代码和曲线诊断', 'Training Code and Curve Diagnostics'),
  ],
},
```

- [ ] **Step 5: Update the Math Lab home card route**

In `src/modules/math-lab/pages/MathLabHome.vue`, replace every occurrence of:

```ts
route: '/math-lab/modules/beginner-calculus',
```

with:

```ts
route: '/math-lab/modules/calculus-functions-rate-change',
```

- [ ] **Step 6: Run focused tests**

Run:

```bash
npm test -- tests/math-lab-core.test.ts tests/site-navigation.test.ts tests/math-lab-layout.test.mjs
```

Expected: PASS for route order, navigation coverage, and home route checks if the route data meets the content contract.

- [ ] **Step 7: Commit registration and navigation**

```bash
git add src/modules/math-lab/data/modules.ts src/data/navigationMenus.ts src/modules/math-lab/pages/MathLabHome.vue
git commit -m "Register calculus learning route"
```

---

### Task 4: Add Source Record and Asset Coverage

**Files:**
- Create: `docs/math-lab-calculus-route-sources.md`
- Modify: `tests/math-lab-layout.test.mjs`

- [ ] **Step 1: Create the source record**

Create `docs/math-lab-calculus-route-sources.md` with:

```md
# Calculus Learning Route Sources

Date: 2026-06-23

This record documents the beginner-friendly calculus learning route added for ML Atlas. The route splits the former one-page calculus bridge into seven learner-facing chapters:

1. Functions and Rate of Change
2. Derivatives as Local Change
3. Partial Derivatives and Gradients
4. Gradient Descent
5. Full Batch, Mini-Batch, and SGD
6. Optimizer Comparison
7. Training Code and Curve Diagnostics

## Teaching Sources

- 3Blue1Brown, Essence of Calculus: https://www.3blue1brown.com/topics/calculus
- Dive into Deep Learning, Optimization Algorithms: https://d2l.ai/chapter_optimization/index.html
- PyTorch, Optimizing Model Parameters: https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html
- Mathematics for Machine Learning: https://mml-book.github.io/

## Reused Source Modules

- `src/modules/math-lab/data/beginnerFoundationModules.ts`: source material for functions, average change, derivatives, partial derivatives, gradients, chain rule, learning rate, and beginner misconceptions.
- `src/modules/math-lab/data/optimizationModule.ts`: source material for steepest descent, learning rate, local and global minima, and optimization terminology.
- `src/data/gradientDescentModule.ts`: source material for loss landscapes, negative gradients, learning-rate behavior, and batch noise.
- `src/data/optimizerComparisonModule.ts`: source material for training-loop order, SGD, Momentum, RMSProp, Adam, and optimizer state.
- `src/modules/math-lab/data/aiBridgeModules.ts`: source material for training diagnostics and gradient norm interpretation.

## Reused Public Assets

- `/math-lab/generated/beginner-calculus-story.png`
- `/math-lab/generated/beginner-derivative-window-longform.png`
- `/math-lab/generated/beginner-partial-gradient-longform.png`
- `/math-lab/generated/beginner-learning-rate-behavior-longform.png`
- `/manim/math-lab/beginner-derivative-window.mp4`
- `/manim/math-lab/beginner-derivative-window.svg`
- `/manim/math-lab/beginner-learning-rate-behavior.mp4`
- `/manim/math-lab/beginner-learning-rate-behavior.svg`

## First-Pass Boundary

The first implementation reuses existing labs and assets. It does not add a new optimizer visualization, new Manim scenes, or a new training-loop ordering component. Those can be added after the route is visible and tested.
```

- [ ] **Step 2: Add asset existence checks**

In `tests/math-lab-layout.test.mjs`, inside `migrated note figures are stored locally`, add these paths to `keyAssets` if they are not already listed:

```js
'public/math-lab/generated/beginner-learning-rate-behavior-longform.png',
'public/manim/math-lab/beginner-derivative-window.mp4',
'public/manim/math-lab/beginner-derivative-window.svg',
'public/manim/math-lab/beginner-learning-rate-behavior.mp4',
'public/manim/math-lab/beginner-learning-rate-behavior.svg',
```

- [ ] **Step 3: Run layout/source tests**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: PASS.

- [ ] **Step 4: Commit source record**

```bash
git add docs/math-lab-calculus-route-sources.md tests/math-lab-layout.test.mjs
git commit -m "Document calculus route sources"
```

---

### Task 5: Final Verification and Cleanup

**Files:**
- Verify: full repository test/build surface

- [ ] **Step 1: Run focused Math Lab tests**

Run:

```bash
npm test -- tests/math-lab-core.test.ts tests/site-navigation.test.ts tests/math-lab-layout.test.mjs
```

Expected: PASS.

- [ ] **Step 2: Run full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: PASS, with no TypeScript or Vite build errors.

- [ ] **Step 4: Inspect git status and diff**

Run:

```bash
git status --short
git diff --stat HEAD
```

Expected after commits: `git status --short` shows no unstaged/uncommitted work. If there is work, inspect it and commit only route-related files.

- [ ] **Step 5: Summarize the implementation**

Report:

- New route module file and seven module IDs.
- Navigation and home entry changes.
- Source document path.
- Verification commands and results.
- Any checks not run, with reason.

No extra commit is needed if all task commits are already made and the working tree is clean.

---

## Self-Review Checklist

- Spec coverage: tasks cover seven independent modules, route navigation, home entry, source documentation, tests, and build verification.
- Route shape: tasks replace `beginner-calculus` in the primary path with the approved seven-chapter sequence.
- Type consistency: all module IDs in tests, navigation, and `aiMathPath` match the content contract.
- Existing component reuse: no new lab component is required in the first pass.
- Scope control: finite differences, Jacobian/VJP/Hessian, new optimizer visuals, and new training-loop UI remain outside the first implementation.
