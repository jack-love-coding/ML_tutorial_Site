import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import test from 'node:test'
import { resolve } from 'node:path'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'

const root = resolve(import.meta.dirname, '..')
const metadataPath = resolve(root, 'public/manim/numerical-methods/batch-4-metadata.json')
const contractPath = resolve(root, 'docs/curriculum-v3/numerical-methods/batch-4-contract.md')

type SceneRecord = {
  id: string
  className: string
  durationSeconds: number
  storyboardCuts: number[]
  posterSecond: number
  outputIds: string[]
  moduleIds: string[]
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

const expectedSceneIds = [
  'banknote-feature-scaling',
  'banknote-fixed-vs-armijo',
  'banknote-training-diagnostics',
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

test('Batch 4 media contract scaffold locks three canonical Notebook-bound packages', () => {
  const contract = readFileSync(contractPath, 'utf8')
  assert.match(contract, /numerical-methods-batch-4-v1/)
  for (const decision of ['D-26', 'D-27', 'D-28', 'D-29']) {
    assert.match(contract, new RegExp(`\\*\\*${decision}:\\*\\*`))
  }
  for (const sceneId of expectedSceneIds) assert.match(contract, new RegExp(`\\b${sceneId}\\b`))
  assert.match(contract, /exactly three short Notebook-bound Manim packages/i)
  assert.match(contract, /Chinese transcripts, English summaries, label tables, local posters, reduced-motion fallback/)
  assert.deepEqual(sixRolePipeline, [
    'ConceptAnalyzer',
    'PrerequisiteExplorer',
    'MathematicalEnricher',
    'VisualDesigner',
    'NarrativeComposer',
    'CodeGenerator',
  ])
})

test('[Plans 25-06/07/08/10] future P25-SC5: three six-role source packages are complete', () => {
  const sourceDirectory = resolve(root, 'scripts/manim/numerical_methods_batch_4')
  const documentDirectory = resolve(root, 'docs/curriculum-v3/numerical-methods/manim')
  for (const sceneId of expectedSceneIds) {
    const stem = sceneId.replaceAll('-', '_')
    const paths = [
      resolve(sourceDirectory, `${stem}.py`),
      resolve(sourceDirectory, `${stem}_prompt.md`),
      resolve(sourceDirectory, `${stem}_tree.json`),
      resolve(documentDirectory, `${sceneId}-transcript.zh-CN.md`),
      resolve(documentDirectory, `${sceneId}-summary.en.md`),
      resolve(documentDirectory, `${sceneId}-labels.json`),
    ]
    paths.forEach((path) => assert.equal(existsSync(path), true, `${path} has an explicit later-plan owner`))
    const tree = JSON.parse(readFileSync(paths[2]!, 'utf8'))
    assert.deepEqual(tree.pipeline, sixRolePipeline)
    assert.equal(tree.maxDepth, 3)
    assert.equal(tree.topologicalOrder.at(-1), tree.root)
  }
})

test('[Plan 25-11] future P25-SC5: metadata, videos, posters, and hashes form three complete packages', () => {
  assert.equal(existsSync(metadataPath), true, `${metadataPath} is owned by Plan 25-11`)
  const metadata = readMetadata()
  assert.equal(metadata.schemaVersion, 1)
  assert.equal(metadata.batchId, 'numerical-methods-batch-4')
  assert.deepEqual(metadata.scenes.map(({ id }) => id), expectedSceneIds)
  assert.deepEqual(metadata.render, {
    width: 1920,
    height: 1080,
    fps: 30,
    videoCodec: 'h264',
    localeInVideo: 'zh-CN',
    command: 'python scripts/manim/render_numerical_methods_batch_4.py',
    checkCommand: 'python scripts/manim/render_numerical_methods_batch_4.py --check',
    publication: 'validated temporary copy followed by atomic numerical-method directory replacement',
  })
  for (const scene of metadata.scenes) {
    assert.equal(scene.storyboardCuts.at(0), 0)
    assert.equal(scene.storyboardCuts.at(-1), scene.durationSeconds)
    for (const path of [scene.source, scene.tree, scene.prompt, scene.transcript, scene.englishSummary, scene.labels, scene.mp4, scene.poster]) {
      assert.equal(existsSync(absolute(path)), true, `${path} must exist`)
      assert.ok(statSync(absolute(path)).size > 0, `${path} must not be empty`)
    }
  }
  for (const [path, expectedHash] of Object.entries(metadata.integrity)) {
    assert.equal(sha256(absolute(path)), expectedHash, `${path} hash drifted`)
  }
})

test('[Plan 25-05/11] future P25-SC5: both route chapters bind the declared local packages', () => {
  const metadata = readMetadata()
  for (const scene of metadata.scenes) {
    for (const moduleId of scene.moduleIds) {
      const moduleDefinition = mathLabModuleRegistry[moduleId]
      assert.ok(moduleDefinition, `${moduleId} must remain registered`)
      const animation = moduleDefinition.visuals.find(({ assetPath }) => assetPath === scene.mp4)
      assert.ok(animation, `${moduleId} must bind ${scene.mp4}`)
      assert.equal(animation.posterPath, scene.poster)
      assert.ok(moduleDefinition.importedAssetPaths.includes(scene.mp4))
      assert.ok(moduleDefinition.importedAssetPaths.includes(scene.poster))
    }
  }
})

test('[Plan 25-11] future P25-SC5: renderer check and ffprobe verify deterministic H.264 packages', () => {
  const result = spawnSync('python3', ['scripts/manim/render_numerical_methods_batch_4.py', '--check'], {
    cwd: root,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  assert.match(result.stdout, /Numerical-method Batch 4 Manim assets are in sync/)
  for (const scene of readMetadata().scenes) {
    const probe = spawnSync('ffprobe', [
      '-v', 'error', '-select_streams', 'v:0', '-show_entries',
      'stream=codec_name,width,height,r_frame_rate', '-of', 'json', absolute(scene.mp4),
    ], { cwd: root, encoding: 'utf8' })
    assert.equal(probe.status, 0, `${probe.stdout}\n${probe.stderr}`)
    const stream = JSON.parse(probe.stdout).streams[0]
    assert.deepEqual(stream, { codec_name: 'h264', width: 1920, height: 1080, r_frame_rate: '30/1' })
  }
})
