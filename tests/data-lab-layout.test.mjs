import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)
const rootPath = fileURLToPath(root)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('data lab lazy routes and nav entries are wired independently of math lab', () => {
  const routerSource = read('src/router/index.ts')
  const appShellSource = read('src/components/AppShell.vue')
  const messagesSource = read('src/i18n/messages.ts')
  const navigationSource = read('src/data/navigationMenus.ts')

  assert.match(routerSource, /path: '\/data-lab'/)
  assert.match(routerSource, /path: '\/data-lab\/modules\/:moduleId'/)
  assert.match(routerSource, /modules\/data-lab\/pages\/DataLabHome\.vue/)
  assert.match(routerSource, /modules\/data-lab\/pages\/DataLabModulePage\.vue/)

  assert.match(appShellSource, /site-data-lab-navigation/)
  assert.match(appShellSource, /dataLabNavigationGroups/)
  assert.doesNotMatch(appShellSource, /dataLabModules/)
  assert.match(navigationSource, /route: '\/data-lab'/)
  assert.match(navigationSource, /dataModule\('numerical-data'/)
  assert.match(navigationSource, /dataModule\('complexity-regularization'/)
  assert.match(appShellSource, /t\('nav\.dataLab'\)/)
  assert.match(messagesSource, /dataLab: '数据实验室'/)
  assert.match(messagesSource, /dataLab: 'Data Lab'/)
})

test('pages fallback generation covers data lab home and module routes', () => {
  const tempDist = mkdtempSync(join(tmpdir(), 'ml-atlas-fallback-'))

  try {
    writeFileSync(join(tempDist, 'index.html'), '<!doctype html><title>ML Atlas</title>')
    execFileSync(process.execPath, ['scripts/create-pages-fallbacks.mjs', tempDist], {
      cwd: rootPath,
      stdio: 'pipe',
    })

    assert.ok(existsSync(join(tempDist, 'data-lab', 'index.html')), 'data lab home fallback should exist')
    assert.ok(
      existsSync(join(tempDist, 'data-lab', 'modules', 'numerical-data', 'index.html')),
      'numerical data module fallback should exist',
    )
    assert.ok(
      existsSync(join(tempDist, 'data-lab', 'modules', 'categorical-data', 'index.html')),
      'categorical data module fallback should exist',
    )
  } finally {
    rmSync(tempDist, { force: true, recursive: true })
  }
})

test('data lab components, labs, generated images, and manim assets exist', () => {
  const componentPaths = [
    'src/modules/data-lab/pages/DataLabHome.vue',
    'src/modules/data-lab/pages/DataLabModulePage.vue',
    'src/modules/data-lab/components/DataCheckpointQuiz.vue',
    'src/modules/data-lab/components/DataTableView.vue',
    'src/modules/data-lab/components/DataVisualFigure.vue',
    'src/modules/data-lab/components/DataManimPlayer.vue',
    'src/modules/data-lab/utils/progress.ts',
    'src/modules/data-lab/utils/quiz.ts',
    'src/modules/data-lab/labs/ColumnTypeLab.vue',
    'src/modules/data-lab/labs/CleaningPipelineLab.vue',
    'src/modules/data-lab/labs/EdaWorkbenchLab.vue',
    'src/modules/data-lab/labs/PandasPipelineLab.vue',
    'src/modules/data-lab/labs/CategoricalEncodingLab.vue',
    'src/modules/data-lab/utils/tableTransforms.ts',
    'src/modules/data-lab/data/modules.ts',
    'src/modules/data-lab/data/categoricalDataModule.ts',
    'scripts/manim/scenes/data_lab.py',
    'scripts/manim/render_data_lab.py',
  ]

  for (const path of componentPaths) {
    assert.ok(existsSync(new URL(path, root)), `${path} should exist`)
  }

  for (const assetPath of [
    'public/data-lab/generated/data-types-feature-vectors.png',
    'public/data-lab/generated/data-cleaning-preprocessing.png',
    'public/data-lab/generated/exploratory-data-analysis.png',
    'public/data-lab/generated/pandas-workflow.png',
    'public/data-lab/generated/categorical-semantics.png',
    'public/data-lab/generated/categorical-vocabulary-one-hot.png',
    'public/data-lab/generated/categorical-feature-cross-sparsity.png',
  ]) {
    assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
  }

  const metadata = JSON.parse(read('public/manim/data-lab/metadata.json'))
  assert.equal(metadata.generatedBy, 'scripts/manim/render_data_lab.py')
  assert.equal(metadata.scenes.length, 6)
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'DataTypesFeatureFlowScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'DataCleaningFlowScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'EdaSplitApplyScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'PandasMethodChainScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'CategoricalOneHotFlowScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'FeatureCrossSparsityScene'))

  for (const scene of metadata.scenes) {
    const assetPath = scene.assetPath.replace(/^\//, 'public/')
    const posterPath = scene.posterPath.replace(/^\//, 'public/')
    assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
    assert.ok(existsSync(new URL(posterPath, root)), `${posterPath} should exist`)
  }
})

test('data lab labs use D3, Three.js, and deterministic TS table transforms', () => {
  const columnTypeSource = read('src/modules/data-lab/labs/ColumnTypeLab.vue')
  const cleaningSource = read('src/modules/data-lab/labs/CleaningPipelineLab.vue')
  const edaSource = read('src/modules/data-lab/labs/EdaWorkbenchLab.vue')
  const pipelineSource = read('src/modules/data-lab/labs/PandasPipelineLab.vue')
  const categoricalSource = read('src/modules/data-lab/labs/CategoricalEncodingLab.vue')
  const modulePageSource = read('src/modules/data-lab/pages/DataLabModulePage.vue')

  assert.match(columnTypeSource, /import \* as d3 from 'd3'/)
  assert.match(columnTypeSource, /import \* as THREE from 'three'/)
  assert.match(columnTypeSource, /oneHotDimension/)
  assert.match(cleaningSource, /fillMissing/)
  assert.match(cleaningSource, /dropDuplicates/)
  assert.match(cleaningSource, /clipColumn/)
  assert.match(edaSource, /import \* as d3 from 'd3'/)
  assert.match(edaSource, /groupByAggregate/)
  assert.match(pipelineSource, /deriveColumn/)
  assert.match(pipelineSource, /mergeLookup/)
  assert.match(categoricalSource, /import \* as d3 from 'd3'/)
  assert.match(categoricalSource, /import \* as THREE from 'three'/)
  assert.match(categoricalSource, /buildCategoryVocabulary/)
  assert.match(categoricalSource, /encodeOneHot/)
  assert.match(modulePageSource, /DataManimPlayer/)
  assert.match(modulePageSource, /DataVisualFigure/)
  assert.match(modulePageSource, /DataCheckpointQuiz/)
  assert.match(modulePageSource, /loadDataLabProgress/)
  assert.match(modulePageSource, /appendDataQuizAttempt/)
  assert.match(modulePageSource, /markDataLabModuleComplete/)
  assert.match(modulePageSource, /completedModuleIds\.includes\(moduleDefinition\.id\)/)
  assert.match(modulePageSource, /defineAsyncComponent/)
  assert.match(modulePageSource, /labComponentRegistry/)
  assert.match(modulePageSource, /:is="labComponentFor\(lab\.componentName\)"/)
  assert.doesNotMatch(modulePageSource, /v-else-if="lab\.componentName/)
  assert.doesNotMatch(modulePageSource, /import .*Lab from '\.\.\/labs\//)
  assert.match(modulePageSource, /sourceReferences/)
  assert.match(modulePageSource, /参考资料/)
  assert.match(modulePageSource, /Further reading/)
  assert.doesNotMatch(modulePageSource, /sourcePages|sourceMode|DataSourceMode|Sources and licenses|原文\/文档时间/)
  assert.match(modulePageSource, /上一章/)
  assert.match(modulePageSource, /下一章/)
  assert.doesNotMatch(`${columnTypeSource}\n${cleaningSource}\n${edaSource}\n${pipelineSource}\n${categoricalSource}`, /pyodide|Pyodide/)
})

test('data lab home exposes continue-learning and completion state', () => {
  const homeSource = read('src/modules/data-lab/pages/DataLabHome.vue')

  assert.match(homeSource, /loadDataLabProgress/)
  assert.match(homeSource, /continueRoute/)
  assert.match(homeSource, /completedModuleIds/)
  assert.match(homeSource, /is-complete/)
  assert.match(homeSource, /Continue learning/)
})

test('home page and README describe the zero-foundation learning path', () => {
  const homeSource = read('src/views/HomeView.vue')
  const readmeSource = read('README.md')

  assert.match(homeSource, /Math Lab/)
  assert.match(homeSource, /Data Lab/)
  assert.match(homeSource, /ML Models/)
  assert.match(homeSource, /Deep Learning/)
  assert.match(homeSource, /\/math-lab/)
  assert.match(homeSource, /beginnerRoadmap/)
  assert.match(homeSource, /readinessChecks/)
  assert.match(homeSource, /scrollToRoadmap/)
  assert.match(homeSource, /history\.replaceState/)
  assert.match(homeSource, /roadmap-stage__body/)
  assert.match(homeSource, /roadmapStage\.route/)
  assert.match(homeSource, /\/data-lab/)
  assert.match(homeSource, /\/learn\/loss-functions/)

  assert.match(readmeSource, /ML Atlas/)
  assert.match(readmeSource, /Math Lab/)
  assert.match(readmeSource, /Data Lab/)
  assert.match(readmeSource, /npm test/)
  assert.doesNotMatch(readmeSource, /Vue 3 \+ TypeScript \+ Vite|template should help get you started/)
})
