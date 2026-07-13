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

type GridCell = { row: number; column: number }

type QLearningSnapshot = {
  episode: number
  trajectory: GridCell[]
  cumulativeReward: number
  reachedGoal: boolean
  qTable: Record<string, Record<'up' | 'right' | 'down' | 'left', number>>
  policy: Record<string, 'up' | 'right' | 'down' | 'left'>
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

  const { candidateTimeline: _candidateTimeline, ...regressionFixture } = fixture.regression
  assert.deepEqual(regressionFixture, {
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
  const { snapshots: _snapshots, ...qLearningFixture } = fixture.qLearning
  assert.deepEqual(qLearningFixture, {
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

test('regression fixture and scene synchronize line, residuals, MSE, and current-best state for every candidate', () => {
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as Metadata
  const fixture = JSON.parse(readFileSync(absolute(metadata.fixture), 'utf8'))
  const candidates = fixture.regression.candidates as Array<{ w: number; b: number }>
  const timeline = fixture.regression.candidateTimeline as Array<{
    w: number
    b: number
    predictions: number[]
    residuals: number[]
    mse: number
    currentBest: { w: number; b: number; mse: number }
  }>

  assert.equal(timeline.length, candidates.length)
  let best = { w: Number.NaN, b: Number.NaN, mse: Number.POSITIVE_INFINITY }
  for (const [index, candidate] of candidates.entries()) {
    const predictions = fixture.regression.samples.map(({ x }: { x: number }) => candidate.w * x + candidate.b)
    const residuals = fixture.regression.samples.map(({ y }: { y: number }, sampleIndex: number) => y - predictions[sampleIndex])
    const mse = residuals.reduce((sum: number, residual: number) => sum + residual ** 2, 0) / residuals.length
    if (mse < best.mse) best = { ...candidate, mse }
    assert.deepEqual(timeline[index], { ...candidate, predictions, residuals, mse, currentBest: best })
  }

  const source = readFileSync(resolve(root, 'scripts/manim/ai_overview/linear_regression_parameter_search.py'), 'utf8')
  assert.match(source, /candidate\["residuals"\]/)
  assert.match(source, /Transform\(current_residuals/)
  assert.match(source, /Transform\(current_mse/)
  assert.match(source, /Transform\(current_best/)
})

test('Q-learning snapshots are exact episode 1/5/20/50 states from one continuous engine stream', () => {
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as Metadata
  const fixture = JSON.parse(readFileSync(absolute(metadata.fixture), 'utf8'))
  const snapshots = fixture.qLearning.snapshots as QLearningSnapshot[]

  assert.deepEqual(snapshots.map(({ episode, trajectory, cumulativeReward, reachedGoal }) => ({
    episode,
    steps: trajectory.length - 1,
    cumulativeReward,
    reachedGoal,
  })), [
    { episode: 1, steps: 26, cumulativeReward: -25, reachedGoal: true },
    { episode: 5, steps: 17, cumulativeReward: -6, reachedGoal: true },
    { episode: 20, steps: 6, cumulativeReward: 5, reachedGoal: true },
    { episode: 50, steps: 12, cumulativeReward: -1, reachedGoal: true },
  ])
  assert.deepEqual(snapshots[0].trajectory, [
    { row: 3, column: 0 }, { row: 2, column: 0 }, { row: 1, column: 0 }, { row: 2, column: 0 },
    { row: 2, column: 1 }, { row: 2, column: 1 }, { row: 2, column: 1 }, { row: 3, column: 1 },
    { row: 2, column: 1 }, { row: 2, column: 0 }, { row: 3, column: 0 }, { row: 3, column: 1 },
    { row: 3, column: 2 }, { row: 3, column: 2 }, { row: 3, column: 2 }, { row: 3, column: 3 },
    { row: 2, column: 3 }, { row: 1, column: 3 }, { row: 2, column: 3 }, { row: 2, column: 3 },
    { row: 3, column: 3 }, { row: 3, column: 3 }, { row: 3, column: 3 }, { row: 2, column: 3 },
    { row: 2, column: 3 }, { row: 1, column: 3 }, { row: 0, column: 3 },
  ])
  assert.equal(snapshots[0].qTable['1,3'].up, 5)
  assert.equal(snapshots[1].qTable['0,2'].right, 7.5)
  assert.equal(snapshots[2].qTable['0,2'].right, 9.998779296875)
  assert.equal(snapshots[3].qTable['0,2'].right, 9.999999999990905)
  assert.equal(snapshots[0].policy['3,0'], 'down')
  assert.equal(snapshots[1].policy['3,0'], 'up')
  assert.equal(snapshots[2].policy['3,0'], 'up')
  assert.equal(snapshots[3].policy['3,0'], 'up')

  const generated = spawnSync('node', ['--experimental-strip-types', 'scripts/manim/ai_overview/generate_q_learning_fixture.ts'], {
    cwd: root,
    encoding: 'utf8',
  })
  assert.equal(generated.status, 0, generated.stderr)
  assert.deepEqual(JSON.parse(generated.stdout), snapshots)

  const source = readFileSync(resolve(root, 'scripts/manim/ai_overview/q_learning_strategy.py'), 'utf8')
  assert.doesNotMatch(source, /^SNAPSHOTS\s*=/m)
  assert.doesNotMatch(source, /^LEARNED_PATH\s*=/m)
  assert.match(source, /snapshot\["trajectory"\]/)
  assert.match(source, /snapshot\["qTable"\]/)
  assert.match(source, /snapshot\["policy"\]/)
})

test('Q-learning labels use the authoritative episode-1 evidence without stale 8-step copy', () => {
  const docsLabels = readFileSync(resolve(root, 'docs/curriculum-v3/ai-overview/manim/q-learning-strategy-labels.json'), 'utf8')
  const runtime = readFileSync(resolve(root, 'src/modules/ai-overview/data/manimRuntimeContent.ts'), 'utf8')
  for (const source of [docsLabels, runtime]) {
    assert.match(source, /26 (?:步|steps).*reward(?:=| )-25/i)
    assert.doesNotMatch(source, /8 (?:步|steps).*reward(?:=| )-8/i)
  }
})

test('Q-learning renderer preserves obstacle cells and fixture policy excludes non-navigable states', () => {
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as Metadata
  const fixture = JSON.parse(readFileSync(absolute(metadata.fixture), 'utf8'))
  const snapshots = fixture.qLearning.snapshots as QLearningSnapshot[]
  const obstacleStates = ['1,1', '2,2']

  for (const snapshot of snapshots) {
    assert.equal(Object.keys(snapshot.qTable).length, 16)
    for (const state of obstacleStates) {
      assert.deepEqual(snapshot.qTable[state], { up: 0, right: 0, down: 0, left: 0 })
      assert.equal(snapshot.policy[state], undefined, `${state} must not receive a policy arrow`)
    }
    assert.equal(snapshot.policy['0,3'], undefined, 'goal state must not receive a policy arrow')
  }

  const source = readFileSync(resolve(root, 'scripts/manim/ai_overview/q_learning_strategy.py'), 'utf8')
  assert.match(source, /if \(row, column\) == GOAL or \(row, column\) in OBSTACLES:\s*continue/g)
  assert.equal(source.match(/if \(row, column\) == GOAL or \(row, column\) in OBSTACLES:\s*continue/g)?.length, 2)
})

test('Q-learning transcript and bilingual labels agree with every generated snapshot', () => {
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as Metadata
  const fixture = JSON.parse(readFileSync(absolute(metadata.fixture), 'utf8'))
  const scene = metadata.scenes.find(({ id }) => id === 'q-learning-strategy')!
  const transcript = readFileSync(absolute(scene.transcript), 'utf8')
  const labels = JSON.parse(readFileSync(absolute(scene.labels), 'utf8')).labels as Array<Record<'zh-CN' | 'en', string>>
  const chineseLabels = new Set(labels.map((label) => label['zh-CN']))

  for (const snapshot of fixture.qLearning.snapshots as QLearningSnapshot[]) {
    const status = snapshot.reachedGoal ? '到达目标' : '未到达目标'
    const detail = `episode ${snapshot.episode}：轨迹步数 ${snapshot.trajectory.length - 1}｜累计 reward ${snapshot.cumulativeReward}｜${status}`
    assert.match(transcript, new RegExp(detail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.equal(chineseLabels.has(detail), true, `labels must include ${detail}`)
    assert.equal(chineseLabels.has(`轨迹步数：${snapshot.trajectory.length - 1}`), true)
    assert.equal(chineseLabels.has(`累计 reward：${snapshot.cumulativeReward}`), true)
    assert.equal(chineseLabels.has(`状态：${status}`), true)
  }
})

test('bilingual label JSON covers every embedded Chinese source string in all three scenes', () => {
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as Metadata

  for (const scene of metadata.scenes) {
    const result = spawnSync('python', ['-c', [
      'import ast, json, pathlib, sys',
      'tree = ast.parse(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))',
      'parents = {child: parent for parent in ast.walk(tree) for child in ast.iter_child_nodes(parent)}',
      'values = sorted({node.value for node in ast.walk(tree) if isinstance(node, ast.Constant) and not isinstance(parents.get(node), ast.JoinedStr) and isinstance(node.value, str) and any("\\u4e00" <= char <= "\\u9fff" for char in node.value)})',
      'print(json.dumps(values, ensure_ascii=False))',
    ].join('; '), absolute(scene.source)], { cwd: root, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    const embedded = JSON.parse(result.stdout) as string[]
    const labelRecord = JSON.parse(readFileSync(absolute(scene.labels), 'utf8'))
    const covered = new Set((labelRecord.labels as Array<Record<'zh-CN' | 'en', string>>).map((label) => label['zh-CN']))
    assert.deepEqual(embedded.filter((copy) => !covered.has(copy)), [], `${scene.id} has uncovered embedded Chinese copy`)
  }
})

test('bilingual labels cover every fixture-derived regression and K-means dynamic string', () => {
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as Metadata
  const fixture = JSON.parse(readFileSync(absolute(metadata.fixture), 'utf8'))
  const labelSet = (sceneId: string) => {
    const scene = metadata.scenes.find(({ id }) => id === sceneId)!
    const record = JSON.parse(readFileSync(absolute(scene.labels), 'utf8'))
    return new Set((record.labels as Array<Record<'zh-CN' | 'en', string>>).map((label) => label['zh-CN']))
  }

  const regressionLabels = labelSet('linear-regression-parameter-search')
  for (const candidate of fixture.regression.candidateTimeline as Array<{
    mse: number
    currentBest: { w: number; b: number; mse: number }
  }>) {
    const best = candidate.currentBest
    const renderedMse = `当前 MSE = ${candidate.mse.toFixed(2)}`
    const renderedBest = `当前最佳：w=${best.w}, b=${best.b}, MSE=${best.mse.toFixed(2)}`
    assert.equal(regressionLabels.has(renderedMse), true, `labels must include ${renderedMse}`)
    assert.equal(regressionLabels.has(renderedBest), true, `labels must include ${renderedBest}`)
  }

  const kmeansLabels = labelSet('kmeans-convergence')
  for (const group of [1, 2, 3]) {
    assert.equal(kmeansLabels.has(`中心 ${group}`), true, `labels must include 中心 ${group}`)
    assert.equal(kmeansLabels.has(`● 第 ${group} 组`), true, `labels must include ● 第 ${group} 组`)
  }
})
