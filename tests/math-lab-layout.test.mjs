import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('math lab lazy routes are wired outside AlgorithmView', () => {
  const routerSource = read('src/router/index.ts')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')

  assert.match(routerSource, /path: '\/math-lab'/)
  assert.match(routerSource, /path: '\/math-lab\/diagnostic'/)
  assert.match(routerSource, /path: '\/math-lab\/modules\/:moduleId'/)
  assert.match(routerSource, /modules\/math-lab\/pages\/MathLabHome\.vue/)
  assert.doesNotMatch(algorithmViewSource, /MathLabModulePage/)
})

test('app shell exposes one top-level math lab nav entry', () => {
  const appShellSource = read('src/components/AppShell.vue')
  const messagesSource = read('src/i18n/messages.ts')

  assert.match(appShellSource, /to="\/math-lab"/)
  assert.match(appShellSource, /t\('nav\.mathLab'\)/)
  assert.match(messagesSource, /mathLab: '数学直觉实验室'/)
  assert.match(messagesSource, /mathLab: 'Math Lab'/)
})

test('math lab components and labs exist with expected contracts', () => {
  const componentPaths = [
    'src/modules/math-lab/pages/MathLabHome.vue',
    'src/modules/math-lab/pages/DiagnosticPage.vue',
    'src/modules/math-lab/pages/MathLabModulePage.vue',
    'src/modules/math-lab/components/LearningPathMap.vue',
    'src/modules/math-lab/components/ManimPlayer.vue',
    'src/modules/math-lab/components/CheckpointQuiz.vue',
    'src/modules/math-lab/components/CodeLab.vue',
    'src/modules/math-lab/components/SkillRadarChart.vue',
    'src/modules/math-lab/components/MisconceptionCard.vue',
    'src/modules/math-lab/components/ThreeSceneShell.vue',
    'src/modules/math-lab/labs/VectorDotProductLab.vue',
    'src/modules/math-lab/labs/MatrixTransformLab.vue',
    'src/modules/math-lab/labs/MathGradientLab.vue',
    'src/modules/math-lab/labs/NumericalMiniLab.vue',
    'src/modules/math-lab/labs/TaylorSeriesLab.vue',
  ]

  for (const path of componentPaths) {
    assert.ok(existsSync(new URL(path, root)), `${path} should exist`)
  }

  const shellSource = read('src/modules/math-lab/components/ThreeSceneShell.vue')
  assert.match(shellSource, /onBeforeUnmount/)
  assert.match(shellSource, /controller\.dispose\(\)/)

  const playerSource = read('src/modules/math-lab/components/ManimPlayer.vue')
  assert.match(playerSource, /<video/)
  assert.match(playerSource, /data-asset-path/)
})

test('math lab uses generated imported notes and local migrated assets', () => {
  assert.ok(existsSync(new URL('src/modules/math-lab/data/mathFoundationsModules.ts', root)))
  assert.ok(existsSync(new URL('scripts/import-cs357-notes.mjs', root)))
  assert.ok(existsSync(new URL('src/modules/math-lab/data/importedMathNotes.generated.ts', root)))
  assert.ok(existsSync(new URL('public/math-lab/cs357-assets/figs', root)))

  const modulesSource = read('src/modules/math-lab/data/modules.ts')
  assert.match(modulesSource, /importedMathNotes/)
  assert.match(modulesSource, /mathFoundationsModules/)

  const generatedSource = read('src/modules/math-lab/data/importedMathNotes.generated.ts')
  assert.match(generatedSource, /Taylor Series/)
  assert.match(generatedSource, /Principal Component Analysis/)
  assert.match(generatedSource, /\/math-lab\/cs357-assets\/figs\/pca_center_combined\.png/)
  assert.doesNotMatch(generatedSource, /CS\s*357|Course Staff|changelog|site\.baseurl/)
})

test('migrated note figures are stored locally', () => {
  const keyAssets = [
    'public/math-lab/cs357-assets/figs/vector_example.png',
    'public/math-lab/cs357-assets/figs/lu_2x2.png',
    'public/math-lab/cs357-assets/figs/page_rank.png',
    'public/math-lab/cs357-assets/figs/finite_diff_errors.png',
    'public/math-lab/cs357-assets/figs/steepest_contour_map_1.png',
    'public/math-lab/cs357-assets/figs/svd_graph.png',
    'public/math-lab/cs357-assets/figs/reduced_svd.svg',
    'public/math-lab/cs357-assets/figs/pca_center_combined.png',
    'public/math-lab/cs357-assets/figs/pca_covar_diag.png',
  ]

  for (const assetPath of keyAssets) {
    assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
  }
})

test('manim pipeline and existing math lab video assets remain present', () => {
  assert.ok(existsSync(new URL('scripts/manim/scenes/math_lab_basics.py', root)))
  assert.ok(existsSync(new URL('scripts/manim/render_math_lab.py', root)))

  const metadata = JSON.parse(read('public/manim/math-lab/metadata.json'))
  assert.equal(metadata.scenes.length, 4)
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'TaylorPolynomialScene'))

  for (const scene of metadata.scenes) {
    const assetPath = scene.assetPath.replace(/^\//, 'public/')
    const posterPath = scene.posterPath.replace(/^\//, 'public/')
    assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
    assert.ok(existsSync(new URL(posterPath, root)), `${posterPath} should exist`)
  }
})
