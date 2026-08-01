import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

function componentInventory() {
  return readdirSync(new URL('src/components/', root), { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^LinearRegression.*\.vue$/.test(entry.name))
    .map((entry) => entry.name)
    .sort()
}

function componentBlock(source, tagName) {
  return source.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`))?.[1] ?? ''
}

function constInitializer(source, name) {
  const declaration = new RegExp(`\\bconst\\s+${name}\\b`).exec(source)
  if (!declaration) return ''
  const assignment = source.indexOf('=', declaration.index + declaration[0].length)
  if (assignment < 0) return ''

  let roundDepth = 0
  let squareDepth = 0
  let curlyDepth = 0
  let quote = ''
  let escaped = false
  let enteredInitializer = false

  for (let index = assignment + 1; index < source.length; index += 1) {
    const character = source[index]
    if (quote) {
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === quote) {
        quote = ''
      }
      continue
    }
    if (character === "'" || character === '"' || character === '`') {
      quote = character
      continue
    }
    if (character === '(') roundDepth += 1
    if (character === ')') roundDepth -= 1
    if (character === '[') squareDepth += 1
    if (character === ']') squareDepth -= 1
    if (character === '{') curlyDepth += 1
    if (character === '}') curlyDepth -= 1
    if ('([{'.includes(character)) enteredInitializer = true
    if (
      character === '\n'
      && enteredInitializer
      && roundDepth === 0
      && squareDepth === 0
      && curlyDepth === 0
    ) {
      return source.slice(assignment + 1, index)
    }
  }
  return source.slice(assignment + 1)
}

function stringLiteralValues(source) {
  return [...source.matchAll(/(['"`])((?:\\[\s\S]|(?!\1)[\s\S])*?)\1/g)]
    .filter((match) => {
      const previous = source.slice(0, match.index).trimEnd().at(-1)
      const next = source.slice(match.index + match[0].length).trimStart()[0]
      return !(next === ':' && (previous === '{' || previous === ','))
    })
    .map((match) => match[2].replaceAll("\\'", "'").replaceAll('\\"', '"'))
}

function learnerFacingCopy(source) {
  const script = componentBlock(source, 'script')
  const template = componentBlock(source, 'template')
  const localizedRegions = [
    constInitializer(script, 'copy'),
    constInitializer(script, 'outputLabels'),
  ].filter(Boolean)
  const localizedStrings = localizedRegions.flatMap(stringLiteralValues)
  const accessibilityStrings = [
    ...template.matchAll(/(?<!:)\\b(?:aria-label|title|alt|placeholder)="([^"]+)"/g),
  ].map((match) => match[1].trim())
  const dynamicAccessibilityBindings = [
    ...template.matchAll(/:(?:aria-label|title|alt|placeholder)="([^"]+)"/g),
  ].map((match) => match[1].trim())
  const visibleTemplateText = template
    .replaceAll(/<!--[\s\S]*?-->/g, ' ')
    .replaceAll(/\{\{[\s\S]*?\}\}/g, ' ')
    .replaceAll(/<[^>]+>/g, '\n')
    .split('\n')
    .map((value) => value.replaceAll(/\s+/g, ' ').trim())
    .filter(Boolean)

  return {
    localizedRegions,
    localizedStrings,
    accessibilityStrings,
    dynamicAccessibilityBindings,
    visibleTemplateText,
    corpus: [...localizedStrings, ...accessibilityStrings, ...visibleTemplateText],
  }
}

const moduleSource = read('src/data/linearRegressionModule.ts')
const assetSource = read('src/data/linearRegressionAssets.ts')
const adapterSource = read('src/curriculum/adapters/algorithmAdapter.ts')
const routerSource = read('src/router/index.ts')
const checkpointSource = read('src/data/algorithmCheckpoints.ts')
const algorithmProgressSource = read('src/utils/algorithmProgress.ts')
const curriculumProgressSource = read('src/curriculum/progress.ts')

const expectedChapterIds = [
  'fit-line',
  'multivariate',
  'residual-loss',
  'training-motion',
  'polynomial',
  'model-limits',
  'overfitting',
  'regularization',
]

function moduleChapterArraySource() {
  const start = moduleSource.indexOf('chapters: [')
  const end = moduleSource.indexOf('\n  ],\n  controls:', start)
  assert.notEqual(start, -1, 'linear regression module should declare chapters')
  assert.notEqual(end, -1, 'linear regression chapter array should end before controls')
  return moduleSource.slice(start, end)
}

function chapterIdsIn(source) {
  return [...source.matchAll(/\bid: '([^']+)'/g)].map((match) => match[1])
}

function chapterBlock(id) {
  const source = moduleChapterArraySource()
  const positions = expectedChapterIds
    .map((candidate) => ({ candidate, index: source.indexOf(`id: '${candidate}'`) }))
    .filter(({ index }) => index >= 0)
    .sort((left, right) => left.index - right.index)
  const current = positions.find(({ candidate }) => candidate === id)
  assert.ok(current, `chapter ${id} should exist`)
  const next = positions.find(({ index }) => index > current.index)
  return source.slice(current.index, next?.index ?? source.length)
}

function assertBilingualLoop(id, requiredPatterns) {
  const source = chapterBlock(id)
  assert.match(source, /### 运行结果/)
  assert.match(source, /### Run Result/)
  assert.match(source, /### 解释/)
  assert.match(source, /### Interpretation/)
  assert.match(source, /### 下一步/)
  assert.match(source, /### Next Step/)
  assert.match(source, /\\`\\`\\`python/)
  assert.match(source, /experimentPrompt:/)
  assert.match(source, /callout:/)
  for (const pattern of requiredPatterns) {
    assert.match(source, pattern, `${id} should contain ${pattern}`)
  }
}

test('linear regression identity scaffold preserves module, route, chapters, checkpoints, and storage keys', () => {
  assert.match(moduleSource, /slug: 'linear-regression'/)
  assert.match(moduleSource, /route: '\/learn\/linear-regression'/)
  assert.deepEqual(
    [...new Set(chapterIdsIn(moduleChapterArraySource()))].sort(),
    [...expectedChapterIds].sort(),
  )
  assert.match(routerSource, /path: '\/learn\/linear-regression'/)
  assert.match(routerSource, /redirect: '\/learn\/linear-regression\/fit-line'/)
  assert.match(routerSource, /path: '\/learn\/linear-regression\/:chapterId'/)
  assert.match(checkpointSource, /'linear-residual-mse'/)
  assert.match(checkpointSource, /'linear-regularization-validation'/)
  assert.match(checkpointSource, /'residual-loss'/)
  assert.match(checkpointSource, /'regularization'/)
  assert.match(algorithmProgressSource, /ml-atlas:algorithm-progress:v1/)
  assert.match(curriculumProgressSource, /ml-atlas:learning-progress:v2/)
  assert.match(curriculumProgressSource, /ml-atlas:learning-progress:v2:migration/)
})

test('bilingual chapter order follows the locked one-Bike-case spine', () => {
  assert.deepEqual(chapterIdsIn(moduleChapterArraySource()), expectedChapterIds)
  assert.match(moduleSource, /linearRegressionChapterAssets/)
  assert.match(moduleSource, /linearRegressionChapterContentBindings/)
  assert.doesNotMatch(moduleSource, /California Housing|MedHouseVal|房屋面积|房价预测/)
})

test('fit-line connects the real Bike row, leakage guard, affine prediction, result, and sklearn', () => {
  assertBilingualLoop('fit-line', [
    /cnt/,
    /instant=11550/,
    /casual \+ registered = cnt/,
    /x.*w.*b/s,
    /LinearRegression/,
    /\.predict/,
    /representative-training-row/,
  ])
})

test('multivariate fixes feature order, chronological split, train-only preprocessing, and batch prediction', () => {
  assertBilingualLoop('multivariate', [
    /temp.*hum.*windspeed.*workingday.*hr/s,
    /chronological|时间顺序/,
    /80%/,
    /train-only|只在训练/,
    /workingday/,
    /X @ w \+ b/,
    /StandardScaler/,
    /\.transform/,
    /batch-contract/,
  ])
})

test('residual-loss keeps prediction-minus-actual sign from one contribution to batch metrics', () => {
  assertBilingualLoop('residual-loss', [
    /prediction - actual/,
    /r_i/,
    /MSE/,
    /2.*r_i.*x_i/s,
    /mean_squared_error/,
    /mean_absolute_error/,
    /r2_score/,
    /residuals-and-metrics/,
  ])
})

test('training-motion explains executable NumPy batch GD, stopping, finite guards, and sklearn fit check', () => {
  assertBilingualLoop('training-motion', [
    /NumPy/,
    /batch gradient descent|批量梯度下降/,
    /learning_rate/,
    /gradient_norm/,
    /stop|停止/,
    /isfinite/,
    /LinearRegression/,
    /gradient-descent-result/,
  ])
})

test('polynomial teaches normal equation and 正规方程 through augmented lstsq three-method agreement', () => {
  const source = chapterBlock('polynomial')
  assertBilingualLoop('polynomial', [
    /normal equation/,
    /正规方程/,
    /X_tilde = \[1, X\]/,
    /theta = \(X_tilde\^T X_tilde\)\^\+ X_tilde\^T y/,
    /theta\[0\] = b/,
    /theta\[1:\] = w/,
    /np\.linalg\.lstsq/,
    /stable|稳定/,
    /same split|相同切分/,
    /same design|相同设计矩阵/,
    /NumPy.*gradient descent.*lstsq.*scikit-learn|NumPy.*梯度下降.*lstsq.*scikit-learn/s,
    /method-comparison/,
  ])
  assert.doesNotMatch(source, /np\.linalg\.inv|numpy\.linalg\.inv/)
})

test('model-limits translates model-space coefficients to original units without causal overclaim', () => {
  assertBilingualLoop('model-limits', [
    /model space|模型空间/,
    /original unit|原始单位/,
    /holding.*fixed|保持.*不变/s,
    /causal|因果/,
    /coef_/,
    /intercept_/,
    /coefficient-table/,
  ])
})

test('overfitting diagnoses held-out residual shape, named cases, and concise log1p scope', () => {
  assertBilingualLoop('overfitting', [
    /MSE/,
    /MAE/,
    /R²|R2/,
    /hour|小时/,
    /spread|扩散|离散/,
    /17213/,
    /15628/,
    /14965/,
    /15604/,
    /negative prediction|负预测/,
    /log1p/,
    /heldout-diagnostics/,
    /named-cases/,
  ])
})

test('regularization isolates atemp instability and distinguishes Ridge and Lasso objectives from OLS', () => {
  assertBilingualLoop('regularization', [
    /atemp/,
    /temp/,
    /Ridge/,
    /Lasso/,
    /OLS/,
    /different objective|目标函数不同/,
    /combined review|综合复盘/,
    /linear.*boundary|线性.*边界/s,
    /Phase 28|阶段 28/,
    /model-limit-review/,
  ])
})

test('bilingual notation, typed output bindings, and safe rendering stay aligned', () => {
  assert.match(moduleSource, /linearRegressionChapterAssets/)
  for (const id of expectedChapterIds) {
    assert.match(assetSource, new RegExp(`['"]?${id}['"]?: Object\\.freeze`))
  }
  assert.match(moduleSource, /withTeachingFrame/)
  assert.match(moduleSource, /linearRegressionTeachingFrames/)
  assert.doesNotMatch(moduleSource, /<script|<iframe|onerror=|onclick=/i)
  assert.doesNotMatch(moduleSource, /https?:\/\//)
  assert.doesNotMatch(moduleSource, /证据/)
  assert.match(moduleSource, /结果|观察|对照|参考输出/)
  assert.match(moduleSource, /Run Result|Observation|Comparison|Reference Output/)
})

test('all linear-regression component learner copy uses plain result terminology', () => {
  const inventory = componentInventory()
  assert.equal(inventory.length, 8, 'the current LinearRegression*.vue inventory should be complete')
  assert.ok(inventory.includes('LinearRegressionUnivariateView.vue'))

  const violations = []
  for (const filename of inventory) {
    const source = read(`src/components/${filename}`)
    const learnerCopy = learnerFacingCopy(source)
    if (filename === 'LinearRegressionLessonBlock.vue' || filename === 'LinearRegressionObservationLab.vue') {
      if (filename === 'LinearRegressionObservationLab.vue') {
        assert.match(source, /sceneId: LinearRegressionObservationSceneId/)
        assert.match(source, /controls: LinearRegressionObservationControl\[\]/)
        assert.match(source, /locale\.value === 'zh-CN'/)
      } else {
        assert.match(source, /localized\(block\.|localized\(figure\./)
      }
      assert.doesNotMatch(source, /证据|\bEvidence\b/)
      continue
    }
    assert.ok(learnerCopy.localizedRegions.length > 0, `${filename} should expose localized copy`)
    assert.ok(
      learnerCopy.localizedStrings.some((value) => /[\u3400-\u9fff]/u.test(value)),
      `${filename} should scan the Chinese locale branch`,
    )
    assert.ok(
      learnerCopy.localizedStrings.some((value) => /[A-Za-z]{3}/.test(value)),
      `${filename} should scan the English locale branch`,
    )
    for (const binding of learnerCopy.dynamicAccessibilityBindings) {
      assert.match(binding, /\bcopy\./, `${filename} accessibility copy must use scanned localized fields`)
    }
    learnerCopy.corpus.forEach((value) => {
      if (/证据/u.test(value) || /\b[Ee]vidence\b/u.test(value)) {
        violations.push(`${filename}: ${JSON.stringify(value)}`)
      }
    })
  }

  const univariate = read('src/components/LinearRegressionUnivariateView.vue')
  assert.match(
    univariate,
    /:aria-label="`\$\{copy\.evidence\}: \$\{copy\.evidenceHeadings\[evidenceMode\]\}; \$\{copy\.cue\}`"/,
  )

  const structuralFixture = learnerFacingCopy(`
    <script setup lang="ts">
    import Evidence from './Evidence'
    const evidenceWidth = 420
    const evidence = () => 'internal-only'
    const copy = computed(() => ({ label: 'Result' }))
    </script>
    <template>
      <section class="evidence-panel" data-evidence="internal">
        <span>{{ copy.label }}</span>
      </section>
    </template>
  `)
  assert.deepEqual(structuralFixture.corpus, ['Result'])
  assert.deepEqual(violations, [], violations.join('\n'))
})

test('adapter order uses the same eight literal IDs and title keys without aliases', () => {
  const manifestStart = adapterSource.indexOf("slug: 'linear-regression'")
  const manifestEnd = adapterSource.indexOf("\n  {\n    slug: 'logistic-regression'", manifestStart)
  const manifestSource = adapterSource.slice(manifestStart, manifestEnd)

  assert.deepEqual(chapterIdsIn(manifestSource), expectedChapterIds)
  assert.equal(new Set(chapterIdsIn(manifestSource)).size, expectedChapterIds.length)
  for (const key of [
    'fitLine',
    'multivariate',
    'residualLoss',
    'trainingMotion',
    'polynomial',
    'modelLimits',
    'overfitting',
    'regularization',
  ]) {
    assert.match(manifestSource, new RegExp(`modules\\.linearRegression\\.sections\\.${key}\\.title`))
  }
})
