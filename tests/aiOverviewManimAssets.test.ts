import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const metadataPath = resolve(root, 'public/manim/ai-overview/metadata.json')

type SceneRecord = {
  id: string
  className: string
  durationSeconds: number
  source: string
  tree: string
  prompt: string
  transcript: string
  englishSummary: string
  labels: string
  mp4: string
  poster: string
  keyframes: Array<{ id: string; timestampSeconds: number; path: string }>
  contract: Record<string, unknown>
}

type Metadata = {
  schemaVersion: number
  render: { width: number; height: number; fps: number; command: string }
  fixture: string
  palette: string
  scenes: SceneRecord[]
}

const absolute = (publicOrRepoPath: string) => resolve(root, publicOrRepoPath.replace(/^\//, 'public/'))

test('AI Overview Manim metadata declares exactly three complete 1080p teaching packages', () => {
  assert.equal(existsSync(metadataPath), true, 'metadata.json must exist')
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as Metadata

  assert.equal(metadata.schemaVersion, 1)
  assert.deepEqual(metadata.render, {
    width: 1920,
    height: 1080,
    fps: 30,
    command: 'python scripts/manim/render_ai_overview.py',
  })
  assert.equal(metadata.fixture, '/manim/ai-overview/experiment-fixture.json')
  assert.equal(metadata.palette, 'scripts/manim/ai_overview/palette.py')
  assert.deepEqual(metadata.scenes.map((scene) => scene.id), [
    'linear-regression-parameter-search',
    'kmeans-convergence',
    'q-learning-strategy',
  ])

  for (const scene of metadata.scenes) {
    assert.ok(scene.durationSeconds >= 60 && scene.durationSeconds <= 90, `${scene.id} duration must be 60–90 seconds`)
    assert.equal(scene.keyframes.length >= 3, true, `${scene.id} needs named keyframes`)
    for (const path of [
      scene.source,
      scene.tree,
      scene.prompt,
      scene.transcript,
      scene.englishSummary,
      scene.labels,
      scene.mp4,
      scene.poster,
      ...scene.keyframes.map((frame) => frame.path),
    ]) {
      assert.equal(existsSync(absolute(path)), true, `${path} must exist`)
    }
    assert.ok(statSync(absolute(scene.mp4)).size > 0, `${scene.mp4} must not be empty`)
  }
})

test('Manim fixture and metadata preserve exact lab data, seeds, rewards, and storyboard timing', () => {
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as Metadata
  const fixture = JSON.parse(readFileSync(absolute(metadata.fixture), 'utf8'))

  assert.deepEqual(fixture.regression, {
    presetId: 'clear-trend',
    samples: [
      { id: 's1', x: 1, y: 52 }, { id: 's2', x: 2, y: 59 }, { id: 's3', x: 3, y: 65 },
      { id: 's4', x: 4, y: 72 }, { id: 's5', x: 5, y: 78 },
    ],
    candidates: [
      { w: 4, b: 48 }, { w: 5, b: 48 }, { w: 6, b: 47 }, { w: 6.5, b: 46 },
      { w: 6.6, b: 45.8 }, { w: 7, b: 45 }, { w: 5.5, b: 50 },
    ],
  })
  assert.equal(fixture.kmeans.seed, 3103)
  assert.equal(fixture.kmeans.k, 3)
  assert.equal(fixture.kmeans.points.length, 12)
  assert.deepEqual(fixture.qLearning, {
    seed: 7107,
    environment: {
      width: 4, height: 4,
      start: { row: 3, column: 0 }, goal: { row: 0, column: 3 },
      obstacles: [{ row: 1, column: 1 }, { row: 2, column: 2 }],
      rewards: { goal: 10, step: -1, collision: -3 },
    },
    training: { episodes: 50, explorationRate: 0.3, learningRate: 0.5, discountFactor: 0.9 },
  })

  const [regression, kmeans, qLearning] = metadata.scenes
  assert.deepEqual(regression.contract, { presetId: 'clear-trend', durationSeconds: 85, storyboardCuts: [0, 8, 18, 30, 44, 55, 75, 85] })
  assert.deepEqual(kmeans.contract, { seed: 3103, k: 3, durationSeconds: 88, storyboardCuts: [0, 8, 16, 28, 38, 52, 72, 80, 88] })
  assert.deepEqual(qLearning.contract, { seed: 7107, rewards: { goal: 10, step: -1, collision: -3 }, durationSeconds: 90, storyboardCuts: [0, 8, 18, 34, 44, 70, 82, 90] })
})

test('each Manim source uses CE, shared palette, raw MathTex strings, and each tree records all six roles', () => {
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as Metadata

  for (const scene of metadata.scenes) {
    const source = readFileSync(absolute(scene.source), 'utf8')
    assert.match(source, /from manim import/)
    assert.match(source, /from palette import/)
    assert.match(source, new RegExp(`class ${scene.className}\\(Scene\\):`))
    assert.match(source, /MathTex\(r["']/)

    const tree = JSON.parse(readFileSync(absolute(scene.tree), 'utf8'))
    assert.deepEqual(tree.pipeline, [
      'ConceptAnalyzer', 'PrerequisiteExplorer', 'MathematicalEnricher',
      'VisualDesigner', 'NarrativeComposer', 'CodeGenerator',
    ])
    assert.equal(tree.analysis.level, 'beginner')
    assert.equal(tree.topologicalOrder.at(-1), tree.analysis.coreConcept)
    assert.ok(tree.nodes.some((node: { isFoundation: boolean }) => node.isFoundation))

    const prompt = readFileSync(absolute(scene.prompt), 'utf8')
    assert.match(prompt, /## Overview/)
    assert.match(prompt, /## Scene Sequence/)
    assert.match(prompt, /Manim Community Edition/)
  }
})

test('renderer check mode detects no source, fixture, metadata, or output drift', () => {
  const result = spawnSync('python', ['scripts/manim/render_ai_overview.py', '--check'], {
    cwd: root,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  assert.match(result.stdout, /AI Overview Manim assets are in sync/)
})
