import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const chapterIds = [
  'fit-line',
  'multivariate',
  'residual-loss',
  'training-motion',
  'polynomial',
  'model-limits',
  'overfitting',
  'regularization',
]

const protectedStatusLines = new Set([
  ' M .planning/config.json',
  '?? docs/gpt_advice.md',
])

const phasePathPatterns = [
  /^\.planning\/phases\/27-linear-regression-rebuild\//,
  /^\.gitignore$/,
  /^scripts\/linear-regression\//,
  /^scripts\/qa\/linearRegressionBrowserMatrix\.js$/,
  /^tests\/linear-regression-/,
  /^tests\/algorithm-progress\.test\.ts$/,
  /^tests\/curriculumProgress\.test\.ts$/,
  /^src\/simulations\/linearRegression(?:Bike|Workbench)?\.ts$/,
  /^src\/data\/linearRegression(?:Assets|Module)\.ts$/,
  /^src\/i18n\/messages\.ts$/,
  /^src\/curriculum\/adapters\/algorithmAdapter\.ts$/,
  /^src\/components\/LinearRegression.*\.vue$/,
  /^src\/views\/AlgorithmView\.vue$/,
  /^src\/styles\/modules\/linear-regression.*\.css$/,
  /^public\/notebooks\/linear-regression\//,
]

const forbiddenPathPatterns = [
  /^dist\//,
  /^\.cache\//,
  /^\.playwright-cli\//,
  /screenshot/i,
  /^public\/[^/]+\/generated\//,
]

function source(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8')
}

function scriptBlock(componentSource) {
  return componentSource.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)?.[1] ?? ''
}

function statusPath(line) {
  return line.slice(3)
}

function classifyScopeStatusLine(line) {
  if (protectedStatusLines.has(line)) return { allowed: true, reason: 'protected-baseline' }
  const relativePath = statusPath(line)
  if (forbiddenPathPatterns.some((pattern) => pattern.test(relativePath))) {
    return { allowed: false, reason: 'forbidden-output' }
  }
  if (phasePathPatterns.some((pattern) => pattern.test(relativePath))) {
    return { allowed: true, reason: 'phase-27' }
  }
  return { allowed: false, reason: 'unrelated' }
}

function executableViolations(text, label) {
  const checks = [
    ['remote URL', /https?:\s*(?:\/\/|['"`]\s*\+\s*['"`]\/\/)/i],
    ['remote client import', /\b(?:requests|urllib3?|httpx|aiohttp|node:https?|WebSocket)\b/i],
    ['remote-capable call', /\b(?:requests\.(?:get|post)|fetch|axios|WebSocket|createConnection)\s*\(/i],
    ['shell escape', /(?:^|\n)\s*!|%\s*(?:pip|conda)|\b(?:curl|wget)\b/i],
    ['package install', /\b(?:pip|pip3|conda|npm|pnpm|yarn)\s+(?:install|add)\b/i],
    ['process escape', /\b(?:child_process|spawn|execFile|execSync|shell\s*=\s*True)\b/i],
  ]
  return checks
    .filter(([, pattern]) => pattern.test(text))
    .map(([kind]) => `${label}: ${kind}`)
}

function runtimeUrlViolations(text, label) {
  const violations = []
  const urlPattern = /https?:\/\/[^\s'"`)<>\]]+/g
  for (const match of text.matchAll(urlPattern)) {
    if (match[0].startsWith('http://127.0.0.1:4173')) continue
    violations.push(`${label}: executable remote URL ${match[0]}`)
  }
  return violations
}

function notebookCodeCells(relativePath) {
  const notebook = JSON.parse(source(relativePath))
  return notebook.cells
    .filter((cell) => cell.cell_type === 'code')
    .map((cell) => Array.isArray(cell.source) ? cell.source.join('') : String(cell.source ?? ''))
}

function collectPhaseRuntimeFiles() {
  const fixed = [
    'src/simulations/linearRegression.ts',
    'src/simulations/linearRegressionBike.ts',
    'src/simulations/linearRegressionWorkbench.ts',
    'src/data/linearRegressionAssets.ts',
    'src/data/linearRegressionModule.ts',
    'src/components/LinearRegressionPagedLesson.vue',
    'src/components/LinearRegressionLessonLab.vue',
    'src/components/LinearRegressionResults.vue',
    'src/components/LinearRegressionUnivariateView.vue',
    'src/components/LinearRegressionMultivariateView.vue',
    'src/views/AlgorithmView.vue',
    'scripts/qa/linearRegressionBrowserMatrix.js',
  ]
  return fixed.filter((relativePath) => existsSync(resolve(root, relativePath)))
}

test('release scaffold names Task 27-08-02 as production owner and Task 27-08-03 as execution owner', () => {
  const release = source('tests/linear-regression-release.test.mjs')
  const matrix = source('scripts/qa/linearRegressionBrowserMatrix.js')

  assert.match(release, /Task 27-08-02/)
  assert.match(release, /Task 27-08-03/)
  assert.match(release, /classifyScopeStatusLine/)
  assert.match(release, /no remote runtime/)
  assert.match(matrix, /^async \(page\) => \{/)
})

test('browser matrix source defines the exact 36-case bilingual responsive contract', () => {
  const matrix = source('scripts/qa/linearRegressionBrowserMatrix.js')

  assert.match(matrix, /http:\/\/127\.0\.0\.1:4173/)
  assert.match(matrix, /ml-atlas-locale/)
  assert.match(matrix, /1440/)
  assert.match(matrix, /390/)
  assert.match(matrix, /844/)
  assert.match(matrix, /emulateMedia\(\{\s*reducedMotion:\s*'reduce'/)
  assert.match(matrix, /cases:\s*results\.length/)
  assert.match(matrix, /expectedCaseCount\s*=\s*36/)
  assert.match(matrix, /summary-failure/)
  assert.match(matrix, /summary-corruption/)
  for (const chapterId of chapterIds) {
    assert.match(matrix, new RegExp(`['"]${chapterId}['"]`))
  }
})

test('route matrix contract probes navigation interactions downloads fallbacks and release failures', () => {
  const matrix = source('scripts/qa/linearRegressionBrowserMatrix.js')

  for (const token of [
    'linear-course-sidebar',
    'linear-course-pager',
    'linear-mobile-toc',
    'rowBatchChanged',
    'gdStepChanged',
    'methodChanged',
    'coefficientSpaceChanged',
    'diagnosticChanged',
    'namedCaseChanged',
    'codeCopyWorked',
    'checkpointSubmissionWorked',
    'downloadCount',
    'fallbackVisible',
    'nextStepPresent',
    'deadFragments',
    'emptyLinks',
    'overlaps',
    'localAssetViolations',
    'consoleErrors',
    'warningCount',
  ]) {
    assert.match(matrix, new RegExp(token))
  }
})

test('Phase 28 bridge names the exact housing project route and bilingual handoff', () => {
  const page = source('src/components/LinearRegressionPagedLesson.vue')
  const matrix = source('scripts/qa/linearRegressionBrowserMatrix.js')
  const housing = source('src/data/housingPriceProjectModule.ts')
  const routeManifest = source('src/curriculum/routeManifest.ts')
  const adapter = source('src/curriculum/adapters/algorithmAdapter.ts')
  const v3Audit = source('src/curriculum/v3/audit.ts')

  for (const token of [
    'data-testid="linear-phase-28-bridge"',
    'to="/learn/housing-price-project"',
    "nextLesson: zh ? '阶段 28' : 'Phase 28'",
    "'继续进入表格回归项目'",
    "'Continue to the tabular-regression project'",
    "'把本课确认的线性模型边界带入现有房价项目：使用冻结本地数据、防泄漏流水线、诚实基线、受控改进与残差复盘。'",
    "\"Carry this lesson's linear-model boundary into the existing housing project with frozen local data, a leakage-safe pipeline, an honest baseline, controlled improvement, and residual review.\"",
    "'进入房价预测项目'",
    "'Open Housing Price Project'",
  ]) {
    assert.match(page, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }

  assert.match(housing, /slug:\s*'housing-price-project'/)
  assert.match(housing, /route:\s*'\/learn\/housing-price-project'/)
  assert.match(routeManifest, /id:\s*'housing-price-project'[\s\S]*route:\s*'\/learn\/housing-price-project'/)
  assert.match(adapter, /slug:\s*'housing-price-project'[\s\S]*route:\s*'\/learn\/housing-price-project'/)
  assert.match(v3Audit, /'housing-price-project':\s*\['project-tabular-regression'\]/)
  assert.match(matrix, /const phase28BridgeText\s*=\s*await phase28Bridge\.textContent\(\)/)
  assert.doesNotMatch(matrix, /const phase28BridgeText\s*=\s*await phase28Bridge\.innerText\(\)/)
  assert.ok(matrix.includes('linear[- ]model'))
  assert.ok(matrix.includes('tabular[- ]regression'))
})

test('browser matrix records exact package-backed semantic changes for all six controls', () => {
  const matrix = source('scripts/qa/linearRegressionBrowserMatrix.js')

  assert.match(
    matrix,
    /const readSemanticOutput[\s\S]{0,160}\.textContent\(\)/,
    'semantic hooks must include compact headings that remain in the DOM but are visually hidden',
  )
  assert.doesNotMatch(
    matrix,
    /const readSemanticOutput[\s\S]{0,160}\.innerText\(\)/,
  )

  for (const hook of [
    'linear-output-row-batch',
    'linear-output-gd-trace',
    'linear-output-method',
    'linear-output-coefficient-space',
    'linear-output-heldout-case',
    'linear-output-atemp-comparison',
  ]) {
    assert.match(matrix, new RegExp(hook))
  }

  assert.match(matrix, /const semanticChecks = \{[\s\S]*rowBatch[\s\S]*gdTrace[\s\S]*method[\s\S]*coefficientSpace[\s\S]*heldoutCase[\s\S]*atempComparison[\s\S]*\}/)
  assert.match(matrix, /expectedInteractionCount\s*=\s*4/)
  assert.match(matrix, /expectedFailureInjectionCount\s*=\s*8/)
  assert.match(matrix, /interactions\.length\s*!==\s*expectedInteractionCount/)
  assert.match(matrix, /failureInjections\.length\s*!==\s*expectedFailureInjectionCount/)
  assert.match(matrix, /Object\.values\(interactionResult\.semanticChecks\)\.every/)
  assert.match(matrix, /11550/)
  assert.match(matrix, /13903/)
  assert.match(matrix, /3476/)
  assert.match(matrix, /772/)
  assert.match(matrix, /17213/)
  assert.match(matrix, /15628/)
  assert.match(matrix, /14965/)
  assert.match(matrix, /15604/)
  assert.match(matrix, /0\.9923834525986027/)
  assert.match(matrix, /17\.240661944055777/)
})

test('scope classifier fixtures allow only Phase 27 paths and the exact protected baseline', () => {
  for (const line of [
    ' M src/components/LinearRegressionPagedLesson.vue',
    ' M src/simulations/linearRegressionWorkbench.ts',
    '?? src/components/LinearRegressionDownloads.vue',
    ' M src/styles/modules/linear-regression-responsive.css',
    '?? scripts/qa/linearRegressionBrowserMatrix.js',
    ' M .planning/config.json',
    '?? docs/gpt_advice.md',
  ]) {
    assert.equal(classifyScopeStatusLine(line).allowed, true, line)
  }

  for (const line of [
    '?? dist/assets/index.js',
    '?? .cache/linear-regression/result.json',
    '?? .playwright-cli/session.json',
    '?? tests/screenshots/linear.png',
    ' M public/data-lab/generated/unrelated.png',
    ' M src/router/index.ts',
    '?? docs/unrelated.md',
  ]) {
    assert.equal(classifyScopeStatusLine(line).allowed, false, line)
  }
})

test('no remote runtime scanner rejects injected URL network shell install and process escapes', () => {
  const fixtureViolations = [
    "fetch('https://example.com/data.json')",
    'import requests\nrequests.get(remote_url)',
    '!pip install numpy',
    'import { spawn } from "node:child_process"',
    "const remote = 'https:' + '//' + host",
  ].map((fixture, index) => executableViolations(fixture, `fixture-${index}`))

  assert.ok(fixtureViolations.every((violations) => violations.length > 0))
  assert.deepEqual(
    executableViolations("const local = '/notebooks/linear-regression/summary.json'", 'local'),
    [],
  )
})

test('no remote runtime exists in Phase 27 executable sources or generated Notebook code cells', () => {
  const violations = []
  const attributionFiles = new Set([
    'src/simulations/linearRegression.ts',
    'src/data/linearRegressionModule.ts',
    'src/data/linearRegressionAssets.ts',
  ])

  for (const relativePath of collectPhaseRuntimeFiles()) {
    const fileSource = source(relativePath)
    if (!attributionFiles.has(relativePath)) {
      violations.push(...runtimeUrlViolations(fileSource, relativePath))
    }
    if (
      relativePath.endsWith('.vue')
      || relativePath.endsWith('.ts')
      || relativePath.endsWith('linearRegressionBrowserMatrix.js')
    ) {
      const withoutLocalPreview = fileSource.replaceAll('http://127.0.0.1:4173', '')
      assert.doesNotMatch(withoutLocalPreview, /\b(?:requests|urllib3?|httpx|aiohttp|WebSocket)\b/)
      assert.doesNotMatch(withoutLocalPreview, /\b(?:child_process|spawn|execFile|execSync)\b/)
    }
  }

  for (const relativePath of [
    'public/notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb',
    'public/notebooks/linear-regression/bike-linear-regression.en.ipynb',
  ]) {
    notebookCodeCells(relativePath).forEach((cellSource, index) => {
      violations.push(...executableViolations(cellSource, `${relativePath}#code-${index}`))
    })
  }

  const manifest = JSON.parse(source('public/notebooks/linear-regression/output-manifest.json'))
  const auditedMetadata = JSON.stringify({
    source: manifest.source,
    dataset: manifest.dataset,
  })
  for (const url of auditedMetadata.match(/https?:\/\/[^"\\]+/g) ?? []) {
    assert.match(url, /(?:archive\.ics\.uci\.edu|doi\.org)/)
  }

  assert.deepEqual(violations, [])
})

test('Task 27-08-02 production page composes typed chapter-local results and safe loading', () => {
  const page = source('src/components/LinearRegressionPagedLesson.vue')
  const pageScript = scriptBlock(page)

  assert.match(page, /linearRegressionChapterAssets/)
  assert.match(page, /activeChapterAssetBinding/)
  assert.match(page, /loadChapterSummary/)
  assert.match(page, /abortActiveLoad/)
  assert.match(page, /parseLinearRegressionSummary/)
  assert.match(page, /withPublicBase\(.*publicPath/)
  assert.match(page, /new AbortController\(\)/)
  assert.match(page, /CodeLab/)
  assert.match(page, /build-phase-27-assets\.py --check --offline/)
  assert.match(page, /data-testid="linear-course-lab"/)
  assert.match(page, /data-testid="linear-course-results"/)
  assert.match(page, /LinearRegressionLessonLab[\s\S]*LinearRegressionResults/)
  assert.doesNotMatch(page, /fuelRows|residualRows|California|MPG|fuel/i)
  assert.doesNotMatch(pageScript, /\*\*\s*2|reduce\([^)]*residual|solveLinearSystem|matrixInverse/)
  assert.doesNotMatch(page, /v-html|<iframe/)
})

test('Task 27-08-02 production download surface appears once after the unchanged checkpoint', () => {
  const downloadsPath = resolve(root, 'src/components/LinearRegressionDownloads.vue')
  assert.ok(existsSync(downloadsPath), 'LinearRegressionDownloads.vue must exist')

  const downloads = readFileSync(downloadsPath, 'utf8')
  const algorithmView = source('src/views/AlgorithmView.vue')
  const checkpointIndex = algorithmView.indexOf('<AlgorithmCheckpointQuiz')
  const downloadIndex = algorithmView.indexOf('<LinearRegressionDownloads')

  assert.match(downloads, /linearRegressionAssets/)
  assert.match(downloads, /downloadGroups/)
  assert.match(downloads, /localizedAssetLabel/)
  assert.match(downloads, /withPublicBase\(asset\.publicPath\)/)
  assert.match(downloads, /data-linear-regression-downloads/)
  assert.equal((algorithmView.match(/<LinearRegressionDownloads/g) ?? []).length, 1)
  assert.ok(checkpointIndex >= 0 && downloadIndex > checkpointIndex)
})

test('Task 27-08-02 production styles preserve focus mobile non-color and reduced-motion meaning', () => {
  const desktop = source('src/styles/modules/linear-regression.css')
  const responsive = source('src/styles/modules/linear-regression-responsive.css')
  const combined = `${desktop}\n${responsive}`

  assert.match(responsive, /@media \(max-width: 1080px\)[\s\S]*linear-course-page__review/)
  assert.match(responsive, /@media \(max-width: 720px\)[\s\S]*linear-course-page__pager/)
  assert.match(responsive, /@media \(max-width: 390px\)/)
  assert.match(combined, /:focus-visible/)
  assert.match(combined, /linear-results__gate[\s\S]*(?:border|outline)/)
  assert.match(combined, /(?:dash|pattern|shape|线型|形状)/i)
  assert.match(responsive, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(responsive, /animation-duration:\s*0\.001ms/)
  assert.match(responsive, /transition-duration:\s*0\.001ms/)
})

test('Task 27-08-03 release command and protected scope ownership remain explicit', () => {
  const plan = source('.planning/phases/27-linear-regression-rebuild/27-08-PLAN.md')

  assert.match(plan, /build-phase-27-assets\.py --check --offline/)
  assert.match(plan, /npm test/)
  assert.match(plan, /npm run build:pages/)
  assert.match(plan, /npm run security:audit/)
  assert.match(plan, /a30166790b1080df599345c645cd3b38a797d2c8f9ce42bad32075f76d4e958a/)
  assert.match(plan, /31958b9a46fe97c6770228109d47594846ab26b3cdeed4be9bcb3b9d9b729f86/)
})

test('release test owns no generated runtime outputs', () => {
  const releaseDirectory = resolve(root, 'tests')
  const residue = readdirSync(releaseDirectory)
    .filter((entry) => extname(entry) === '.png' || /screenshot/i.test(entry))

  assert.deepEqual(residue, [])
})
