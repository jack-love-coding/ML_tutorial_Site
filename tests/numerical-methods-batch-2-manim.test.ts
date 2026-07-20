import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { resolve } from 'node:path'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'

const root = resolve(import.meta.dirname, '..')
const metadataPath = resolve(root, 'public/manim/numerical-methods/batch-2-metadata.json')

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
  batchId: string
  render: Record<string, unknown>
  notebookOutputs: string[]
  scenes: SceneRecord[]
  integrity: Record<string, string>
}

const expectedScenes = [
  {
    id: 'sms-csr-matvec',
    className: 'SmsCsrMatvecScene',
    durationSeconds: 75,
    storyboardCuts: [0, 7, 18, 31, 46, 59, 69, 75],
    posterSecond: 63,
    outputId: 'sms-sparse-summary',
    moduleId: 'sparse-matrices',
  },
  {
    id: 'ames-pca-projection',
    className: 'AmesPcaProjectionScene',
    durationSeconds: 80,
    storyboardCuts: [0, 8, 20, 34, 47, 62, 72, 80],
    posterSecond: 57,
    outputId: 'ames-pca-summary',
    moduleId: 'pca',
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

test('Batch 2 metadata declares two complete deterministic teaching packages', () => {
  assert.equal(existsSync(metadataPath), true)
  const metadata = readMetadata()
  assert.equal(metadata.schemaVersion, 1)
  assert.equal(metadata.batchId, 'numerical-methods-batch-2')
  assert.deepEqual(metadata.render, {
    width: 1920,
    height: 1080,
    fps: 30,
    videoCodec: 'h264',
    localeInVideo: 'zh-CN',
    command: 'python scripts/manim/render_numerical_methods_batch_2.py',
    checkCommand: 'python scripts/manim/render_numerical_methods_batch_2.py --check',
    publication: 'validated temporary copy followed by atomic numerical-method directory replacement',
  })
  assert.deepEqual(metadata.notebookOutputs, [
    '/notebooks/numerical-methods/batch-2-outputs/sms-sparse-summary.json',
    '/notebooks/numerical-methods/batch-2-outputs/ames-pca-summary.json',
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
    assert.equal(scene.storyboardCuts.at(0), 0)
    assert.equal(scene.storyboardCuts.at(-1), scene.durationSeconds)
    for (const path of [scene.source, scene.tree, scene.prompt, scene.transcript, scene.englishSummary, scene.labels, scene.mp4, scene.poster]) {
      assert.equal(existsSync(absolute(path)), true, `${path} must exist`)
      assert.ok(statSync(absolute(path)).size > 0, `${path} must not be empty`)
    }
  }
})

test('six-role source packages preserve mathematical and learner-boundary constraints', () => {
  const metadata = readMetadata()
  for (const scene of metadata.scenes) {
    const source = readFileSync(absolute(scene.source), 'utf8')
    const prompt = readFileSync(absolute(scene.prompt), 'utf8')
    const tree = JSON.parse(readFileSync(absolute(scene.tree), 'utf8'))
    const labels = JSON.parse(readFileSync(absolute(scene.labels), 'utf8'))
    assert.match(source, new RegExp(`class ${scene.className}\\(Scene\\):`))
    assert.ok(prompt.split(/\s+/).length >= 900)
    assert.deepEqual(tree.pipeline, sixRolePipeline)
    assert.equal(tree.maxDepth, 3)
    assert.equal(tree.topologicalOrder.at(-1), tree.root)
    assert.ok(tree.nodes.some((node: { isFoundation: boolean }) => node.isFoundation))
    assert.equal(labels.localeInVideo, 'zh-CN')
    assert.equal(labels.durationSeconds, scene.durationSeconds)
    for (const label of labels.labels) {
      assert.deepEqual(Object.keys(label).sort(), ['en', 'zh-CN'])
      assert.match(label['zh-CN'], /[\u3400-\u9fff]/)
      assert.match(label.en, /[A-Za-z]/)
    }
  }

  const sparse = readFileSync(absolute(readMetadata().scenes[0]!.source), 'utf8')
  assert.match(sparse, /\[283, 299\)/)
  assert.match(sparse, /−0\.497805956/)
  assert.match(sparse, /79\.992 MiB/)
  assert.match(sparse, /没有训练分类器/)
  const pca = readFileSync(absolute(readMetadata().scenes[1]!.source), 'utf8')
  assert.match(pca, /ddof = 0/)
  assert.match(pca, /二维点云仅解释方向/)
  assert.match(pca, /92\.15%/)
  assert.match(pca, /不使用房价标签/)
})

test('the two route chapters mount media matching the Batch 2 metadata', () => {
  const metadata = readMetadata()
  for (const [index, expected] of expectedScenes.entries()) {
    const moduleDefinition = mathLabModuleRegistry[expected.moduleId]
    const scene = metadata.scenes[index]!
    const animation = moduleDefinition.visuals.find(({ assetPath }) => assetPath === scene.mp4)
    assert.ok(animation)
    assert.equal(animation.posterPath, scene.poster)
    assert.ok(moduleDefinition.importedAssetPaths.includes(scene.mp4))
    assert.ok(moduleDefinition.importedAssetPaths.includes(scene.poster))
  }
})

test('Batch 2 integrity hashes and renderer check mode detect no package drift', () => {
  const metadata = readMetadata()
  for (const [path, expectedHash] of Object.entries(metadata.integrity)) {
    assert.equal(sha256(absolute(path)), expectedHash, `${path} hash drifted`)
  }
  const result = spawnSync('python3', ['scripts/manim/render_numerical_methods_batch_2.py', '--check'], {
    cwd: root,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  assert.match(result.stdout, /Numerical-method Batch 2 Manim assets are in sync/)
})
