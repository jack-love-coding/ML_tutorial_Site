import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { resolve } from 'node:path'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'

const root = resolve(import.meta.dirname, '..')
const metadataPath = resolve(root, 'public/manim/numerical-methods/metadata.json')

type SceneRecord = {
  id: string
  className: string
  durationSeconds: number
  storyboardCuts: number[]
  posterSecond: number
  outputId: string
  source: string
  tree: string
  prompt: string
  transcript: string
  englishSummary: string
  labels: string
  mp4: string
  poster: string
}

type Metadata = {
  schemaVersion: number
  render: {
    width: number
    height: number
    fps: number
    videoCodec: string
    localeInVideo: string
    command: string
    checkCommand: string
    publication: string
  }
  notebookOutputs: string[]
  scenes: SceneRecord[]
  integrity: Record<string, string>
}

const expectedScenes = [
  {
    id: 'least-squares-projection',
    className: 'LeastSquaresProjectionScene',
    durationSeconds: 78,
    storyboardCuts: [0, 7, 18, 34, 48, 61, 70, 78],
    posterSecond: 56,
    outputId: 'ames-least-squares-summary',
    moduleId: 'least-squares-fitting',
  },
  {
    id: 'lup-factor-reuse',
    className: 'LupFactorReuseScene',
    durationSeconds: 80,
    storyboardCuts: [0, 8, 21, 36, 50, 62, 74, 80],
    posterSecond: 70,
    outputId: 'ames-lu-summary',
    moduleId: 'lu-decomposition',
  },
  {
    id: 'condition-number-sensitivity',
    className: 'ConditionNumberSensitivityScene',
    durationSeconds: 82,
    storyboardCuts: [0, 8, 22, 34, 49, 62, 76, 82],
    posterSecond: 80,
    outputId: 'ames-conditioning-summary',
    moduleId: 'condition-numbers',
  },
] as const

const sixRolePipeline = [
  'ConceptAnalyzer',
  'PrerequisiteExplorer',
  'MathematicalEnricher',
  'VisualDesigner',
  'NarrativeComposer',
  'CodeGenerator',
]

function absolute(repoOrPublicPath: string): string {
  return repoOrPublicPath.startsWith('/')
    ? resolve(root, 'public', repoOrPublicPath.slice(1))
    : resolve(root, repoOrPublicPath)
}

function readMetadata(): Metadata {
  return JSON.parse(readFileSync(metadataPath, 'utf8')) as Metadata
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

test('Ames numerical-method metadata declares three complete deterministic teaching packages', () => {
  assert.equal(existsSync(metadataPath), true, 'metadata.json must exist')
  const metadata = readMetadata()

  assert.equal(metadata.schemaVersion, 1)
  assert.deepEqual(metadata.render, {
    width: 1920,
    height: 1080,
    fps: 30,
    videoCodec: 'h264',
    localeInVideo: 'zh-CN',
    command: 'python scripts/manim/render_ames_numerical_methods.py',
    checkCommand: 'python scripts/manim/render_ames_numerical_methods.py --check',
    publication: 'validated temporary batch followed by atomic directory replacement',
  })
  assert.deepEqual(metadata.notebookOutputs, [
    '/notebooks/numerical-methods/outputs/ames-least-squares-summary.json',
    '/notebooks/numerical-methods/outputs/ames-lu-summary.json',
    '/notebooks/numerical-methods/outputs/ames-conditioning-summary.json',
  ])
  assert.deepEqual(metadata.scenes.map((scene) => ({
    id: scene.id,
    className: scene.className,
    durationSeconds: scene.durationSeconds,
    storyboardCuts: scene.storyboardCuts,
    posterSecond: scene.posterSecond,
    outputId: scene.outputId,
  })), expectedScenes.map(({ moduleId: _moduleId, ...scene }) => scene))

  for (const scene of metadata.scenes) {
    assert.ok(scene.durationSeconds >= 60 && scene.durationSeconds <= 90)
    assert.equal(scene.storyboardCuts.at(0), 0)
    assert.equal(scene.storyboardCuts.at(-1), scene.durationSeconds)
    assert.ok(scene.posterSecond > 0 && scene.posterSecond < scene.durationSeconds)
    for (const path of [
      scene.source,
      scene.tree,
      scene.prompt,
      scene.transcript,
      scene.englishSummary,
      scene.labels,
      scene.mp4,
      scene.poster,
    ]) {
      const filePath = absolute(path)
      assert.equal(existsSync(filePath), true, `${path} must exist`)
      assert.ok(statSync(filePath).size > 0, `${path} must not be empty`)
    }
  }
})

test('Manim sources preserve the six-role learning design and the numerical truth constraints', () => {
  const metadata = readMetadata()

  for (const scene of metadata.scenes) {
    const source = readFileSync(absolute(scene.source), 'utf8')
    assert.match(source, /from manim import/)
    assert.match(source, /from palette import/)
    assert.match(source, new RegExp(`class ${scene.className}\\(Scene\\):`))

    const tree = JSON.parse(readFileSync(absolute(scene.tree), 'utf8'))
    assert.deepEqual(tree.pipeline, sixRolePipeline)
    assert.equal(tree.topologicalOrder.at(-1), tree.root)
    assert.ok(tree.nodes.some((node: { isFoundation: boolean }) => node.isFoundation))

    const labels = JSON.parse(readFileSync(absolute(scene.labels), 'utf8'))
    assert.equal(labels.localeInVideo, 'zh-CN')
    assert.equal(labels.durationSeconds, scene.durationSeconds)
    assert.ok(labels.labels.length > 0)
    for (const label of labels.labels) {
      assert.deepEqual(Object.keys(label).sort(), ['en', 'zh-CN'])
      assert.match(label['zh-CN'], /[\u3400-\u9fff]/)
      assert.match(label.en, /[A-Za-z]/)
    }
  }

  const commonSource = readFileSync(resolve(root, 'scripts/manim/ames_numerical_methods/common.py'), 'utf8')
  const leastSquaresSource = readFileSync(absolute(metadata.scenes[0].source), 'utf8')
  const lupSource = readFileSync(absolute(metadata.scenes[1].source), 'utf8')
  const conditionSource = readFileSync(absolute(metadata.scenes[2].source), 'utf8')
  assert.match(commonSource, /高维关系示意，不按实际尺度/)
  assert.match(leastSquaresSource, /RMSE.*35\.834182/s)
  assert.match(leastSquaresSource, /3\.726.*10/s)
  assert.match(lupSource, /\[0, 1, 2, 3, 4\]/)
  assert.match(lupSource, /本例未换行 ≠ 算法不检查主元/)
  assert.match(conditionSource, /329\.613418 不是条件数/)
  assert.match(conditionSource, /两个相邻系统/)
  const conditionPackageText = [
    conditionSource,
    readFileSync(absolute(metadata.scenes[2].prompt), 'utf8'),
    readFileSync(absolute(metadata.scenes[2].transcript), 'utf8'),
    readFileSync(absolute(metadata.scenes[2].labels), 'utf8'),
  ].join('\n')
  assert.doesNotMatch(conditionPackageText, /再次标准化|重新标准化|standardized again|re-standardization|restandard/i)
  assert.match(conditionPackageText, /不再(?:额外)?缩放|not rescaled after addition/i)
})

test('the first three route chapters mount one matching animation and one shared route illustration', () => {
  const metadata = readMetadata()

  for (const [index, expected] of expectedScenes.entries()) {
    const moduleDefinition = mathLabModuleRegistry[expected.moduleId]
    const animations = moduleDefinition.visuals.filter(({ type }) => type === 'manim-video')
    const routeIllustrations = moduleDefinition.visuals.filter(({ id }) => id === 'ames-numerical-methods-chain-image')
    const scene = metadata.scenes[index]

    assert.equal(moduleDefinition.estimatedMinutes, 70)
    assert.equal(animations.length, 1)
    assert.equal(routeIllustrations.length, 1)
    assert.equal(animations[0].assetPath, scene.mp4)
    assert.equal(animations[0].posterPath, scene.poster)
    assert.ok(moduleDefinition.importedAssetPaths.includes(scene.mp4))
    assert.ok(moduleDefinition.importedAssetPaths.includes(scene.poster))
    assert.ok(moduleDefinition.importedAssetPaths.includes('/math-lab/numerical-methods/ames-numerical-methods-chain.png'))
    assert.doesNotMatch(JSON.stringify(moduleDefinition), /证据/)
  }
})

test('metadata integrity hashes and renderer check mode detect no package drift', () => {
  const metadata = readMetadata()
  for (const [path, expectedHash] of Object.entries(metadata.integrity)) {
    assert.equal(sha256(absolute(path)), expectedHash, `${path} hash drifted`)
  }

  const result = spawnSync('python3', ['scripts/manim/render_ames_numerical_methods.py', '--check'], {
    cwd: root,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  assert.match(result.stdout, /Ames numerical-method Manim assets are in sync/)
})
