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
const rendererPath = resolve(root, 'scripts/manim/render_numerical_methods_batch_4.py')
const sourceDirectory = resolve(root, 'scripts/manim/numerical_methods_batch_4')
const documentDirectory = resolve(root, 'docs/curriculum-v3/numerical-methods/manim')
const outputDirectory = resolve(root, 'public/notebooks/numerical-methods/batch-4-outputs')
const outputManifestPath = resolve(outputDirectory, 'manifest.json')

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

const expectedScenes = [
  {
    id: 'banknote-feature-scaling',
    stem: 'banknote_feature_scaling',
    className: 'BanknoteFeatureScalingScene',
    durationSeconds: 72,
    storyboardCuts: [0, 8, 18, 29, 45, 57, 65, 72],
    posterSecond: 68,
    outputIds: ['banknote-logistic-optimization-summary', 'banknote-training-traces-json'],
    moduleIds: ['optimization'],
    valueBindingKeys: [
      'rowCount', 'splitCounts', 'trainScales', 'rawStep', 'standardizedStep',
      'rawBestValidation', 'standardizedBestValidation', 'rawTerminal',
      'standardizedTerminal', 'l2',
    ],
  },
  {
    id: 'banknote-fixed-vs-armijo',
    stem: 'banknote_fixed_vs_armijo',
    className: 'BanknoteFixedVsArmijoScene',
    durationSeconds: 72,
    storyboardCuts: [0, 8, 18, 30, 43, 55, 65, 72],
    posterSecond: 68,
    outputIds: ['banknote-logistic-optimization-summary', 'banknote-training-traces-json'],
    moduleIds: ['optimization'],
    valueBindingKeys: [
      'initialTrialStep', 'initialTrialAccepted', 'firstAcceptedStep',
      'firstBacktrackCount', 'allAcceptedRowsSatisfySufficientDecrease', 'c', 'rho',
      'startObjective', 'startGradientNorm', 'fixedFirstObjective', 'fixedFirstTrainBce',
      'fixedFirstStep', 'acceptedFirstObjective', 'acceptedFirstTrainBce',
      'acceptedFirstStep', 'acceptedFirstBacktracks', 'fixedTerminal', 'armijoTerminal',
      'armijoBestValidation',
    ],
  },
  {
    id: 'banknote-training-diagnostics',
    stem: 'banknote_training_diagnostics',
    className: 'BanknoteTrainingDiagnosticsScene',
    durationSeconds: 72,
    storyboardCuts: [0, 8, 18, 32, 46, 58, 65, 72],
    posterSecond: 68,
    outputIds: ['banknote-training-diagnostics-summary', 'banknote-training-traces-json'],
    moduleIds: ['training-diagnostics'],
    valueBindingKeys: [
      'runOrder', 'diagnosticChains', 'diagnosticTerminals', 'traceValues',
      'bestValidation', 'terminal', 'tooSmallStep', 'stableStep', 'tooLargeStep',
      'armijoInitialStep', 'armijoFirstAccepted', 'selectedRunId', 'finalReport',
      'baseline', 'endpointComparison',
    ],
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

function readJson(path: string): Record<string, any> {
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, any>
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

test('scene source contract locks three canonical Notebook-bound packages', () => {
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
  for (const expected of expectedScenes) {
    const sceneId = expected.id
    const stem = expected.stem
    const paths = [
      resolve(sourceDirectory, `${stem}.py`),
      resolve(sourceDirectory, `${stem}_prompt.md`),
      resolve(sourceDirectory, `${stem}_tree.json`),
      resolve(documentDirectory, `${sceneId}-transcript.zh-CN.md`),
      resolve(documentDirectory, `${sceneId}-summary.en.md`),
      resolve(documentDirectory, `${sceneId}-labels.json`),
    ]
    paths.forEach((path) => assert.equal(existsSync(path), true, `${path} has an explicit later-plan owner`))
    const tree = readJson(paths[2]!)
    assert.equal(tree.contractVersion, 'numerical-methods-batch-4-v1')
    assert.equal(tree.sceneId, sceneId)
    assert.equal(tree.sceneClass, expected.className)
    assert.equal(tree.durationSeconds, expected.durationSeconds)
    assert.equal(tree.posterSecond, expected.posterSecond)
    assert.deepEqual(tree.storyboardCuts, expected.storyboardCuts)
    assert.deepEqual(tree.pipeline, sixRolePipeline)
    assert.equal(tree.maxDepth, 3)
    assert.equal(tree.topologicalOrder.at(-1), tree.root)
    assert.equal(tree.nodes.find(({ id }: { id: string }) => id === tree.root)?.depth, 0)
    assert.equal(Math.max(...tree.nodes.map(({ depth }: { depth: number }) => depth)), 3)
    assert.ok(tree.nodes.every(({ depth }: { depth: number }) => Number.isInteger(depth) && depth >= 0 && depth <= 3))
    const source = readFileSync(paths[0]!, 'utf8')
    assert.match(source, /from common import \(/)
    assert.match(source, /from palette import /)
    assert.match(source, new RegExp(`class ${expected.className}\\(Scene\\):`))
    assert.match(source, /\b(disclaimer|status_label|square_marker|circle_marker)\b/)
  }
})

test('labels contract requires unique bilingual labels and static non-color fallbacks', () => {
  for (const expected of expectedScenes) {
    const labelsPath = resolve(documentDirectory, `${expected.id}-labels.json`)
    const labels = readJson(labelsPath)
    assert.equal(labels.contractVersion, 'numerical-methods-batch-4-v1')
    assert.equal(labels.schemaVersion, 1)
    assert.equal(labels.sceneId, expected.id)
    assert.equal(labels.sceneClass, expected.className)
    assert.equal(labels.durationSeconds, expected.durationSeconds)
    assert.equal(labels.localeInVideo, 'zh-CN')
    assert.deepEqual(Object.keys(labels.valueBindings).sort(), [...expected.valueBindingKeys].sort())
    const labelIds = labels.labels.map(({ id }: { id: string }) => id)
    assert.equal(new Set(labelIds).size, labelIds.length)
    for (const label of labels.labels) {
      assert.deepEqual(Object.keys(label).sort(), ['en', 'id', 'zh-CN'])
      assert.ok(Object.values(label).every((value) => typeof value === 'string' && value.trim().length > 0))
    }
    assert.equal(typeof labels.fallbacks.reducedMotion, 'string')
    assert.equal(labels.fallbacks.videoFailure.length, 3)
    assert.equal(typeof labels.fallbacks.nonColor, 'string')
    assert.match(labels.fallbacks.nonColor, /(square|circle|diamond|written|text)/i)
  }
})

test('Notebook anchors and hashes bind every scene dependency to the exact Batch 4 outputs', () => {
  const manifest = readJson(outputManifestPath)
  assert.equal(manifest.contractVersion, 'numerical-methods-batch-4-v1')
  const outputByPath = new Map(manifest.outputs.map((output: Record<string, any>) => [output.publicPath, output]))
  assert.deepEqual([...outputByPath.values()].map(({ outputId }) => outputId), [
    'banknote-logistic-optimization-summary',
    'banknote-training-diagnostics-summary',
    'banknote-training-traces-json',
    'banknote-training-traces-csv',
  ])
  for (const output of outputByPath.values()) {
    const path = absolute(output.publicPath)
    assert.equal(statSync(path).size, output.bytes)
    assert.equal(sha256(path), output.sha256)
  }

  for (const expected of expectedScenes) {
    const tree = readJson(resolve(sourceDirectory, `${expected.stem}_tree.json`))
    const dependencies = tree.outputDependencies.map(({ path, outputId }: Record<string, any>) => {
      const publicPath = `/${path.replace(/^public\//, '')}`
      const output = outputByPath.get(publicPath)
      assert.ok(output, `${expected.id} dependency ${publicPath} must be in the output manifest`)
      if (outputId !== undefined) assert.equal(outputId, output.outputId)
      return output.outputId
    })
    assert.deepEqual(dependencies, expected.outputIds)
  }

  const optimization = readJson(resolve(outputDirectory, 'optimization-summary.json'))
  const diagnostics = readJson(resolve(outputDirectory, 'training-diagnostics-summary.json'))
  const traces = readJson(resolve(outputDirectory, 'banknote-training-traces.json'))
  const fixedLabels = readJson(resolve(documentDirectory, 'banknote-fixed-vs-armijo-labels.json'))
  const diagnosticLabels = readJson(resolve(documentDirectory, 'banknote-training-diagnostics-labels.json'))
  assert.equal(fixedLabels.lockedAnchors.initialTrialStep, optimization.armijoCheck.initialTrialStep)
  assert.equal(fixedLabels.lockedAnchors.firstAcceptedStep, optimization.armijoCheck.firstAcceptedStep)
  assert.equal(fixedLabels.lockedAnchors.fixedTerminalIteration, optimization.runs['standardized-too-large'].terminal.iteration)
  assert.equal(fixedLabels.lockedAnchors.armijoTerminalIteration, optimization.runs['standardized-armijo'].terminal.iteration)
  assert.equal(diagnosticLabels.lockedAnchors.selectedRunId, diagnostics.selectedRunId)
  assert.equal(diagnosticLabels.lockedAnchors.armijoFirstAcceptedStep, traces.runs.find(({ runId }: { runId: string }) => runId === 'standardized-armijo').firstBacktrack.acceptedStepSize)
  assert.equal(diagnosticLabels.lockedAnchors.manualTestBce, diagnostics.finalReport.manual.testBce)
  assert.deepEqual(diagnosticLabels.lockedAnchors.manualConfusionMatrix, diagnostics.finalReport.manual.confusionMatrix)
})

test('renderer contract is exact, transactional, cache-disabled, and keeps check mode offline and write-free', () => {
  assert.equal(existsSync(rendererPath), true)
  const renderer = readFileSync(rendererPath, 'utf8')
  for (const expected of expectedScenes) {
    assert.match(renderer, new RegExp(`"id": "${expected.id}"`))
    assert.match(renderer, new RegExp(`"className": "${expected.className}"`))
  }
  assert.match(renderer, /if len\(SCENES\) != 3:/)
  assert.match(renderer, /--resolution[\s\S]*1920,1080/)
  assert.match(renderer, /--frame_rate[\s\S]*30/)
  assert.match(renderer, /--disable_caching/)
  assert.match(renderer, /audio_streams/)
  assert.match(renderer, /codec_name[\s\S]*h264/)
  assert.match(renderer, /copytree\(PUBLIC_DIR, batch_dir, dirs_exist_ok=True\)/)
  assert.match(renderer, /os\.replace\(PUBLIC_DIR, backup_dir\)/)
  assert.match(renderer, /os\.replace\(backup_dir, PUBLIC_DIR\)/)
  assert.match(renderer, /def check_all\(\) -> None:/)
  assert.doesNotMatch(renderer.slice(renderer.indexOf('def check_all'), renderer.indexOf('def main')), /write_|mkdir|copy|replace|rmtree|TemporaryDirectory|mkdtemp/)

  const validation = spawnSync('python3', ['-c', [
    'import importlib.util',
    `spec = importlib.util.spec_from_file_location("batch4_renderer", ${JSON.stringify(rendererPath)})`,
    'module = importlib.util.module_from_spec(spec)',
    'spec.loader.exec_module(module)',
    'module.validate_package_sources()',
  ].join('; ')], { cwd: root, encoding: 'utf8' })
  assert.equal(validation.status, 0, `${validation.stdout}\n${validation.stderr}`)
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
