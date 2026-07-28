import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')
const generatorPath = resolve(root, 'scripts/loss-functions/build-phase-26-assets.py')
const stagingRoot = resolve(root, '.cache/loss-functions/phase-26-staging')

function runGenerator(args: readonly string[]) {
  return spawnSync('python3', [generatorPath, ...args], {
    cwd: root,
    encoding: 'utf8',
  })
}

function runProbe(source: string, args: readonly string[] = []) {
  const loader = [
    'import importlib.util, json, pathlib, sys',
    'generator_path = pathlib.Path(sys.argv[1])',
    'spec = importlib.util.spec_from_file_location("phase26_assets", generator_path)',
    'module = importlib.util.module_from_spec(spec)',
    'sys.modules[spec.name] = module',
    'spec.loader.exec_module(module)',
    source,
  ].join('\n')
  return spawnSync('python3', ['-c', loader, generatorPath, ...args], {
    cwd: root,
    encoding: 'utf8',
  })
}

function readContractSnapshot() {
  const probe = runProbe([
    'snapshot = module.candidate_contract_snapshot()',
    'print(json.dumps(snapshot, ensure_ascii=False, sort_keys=True, allow_nan=False))',
  ].join('\n'))
  assert.equal(probe.status, 0, probe.stderr)
  return JSON.parse(probe.stdout)
}

test('candidate inventory is complete and indivisible', () => {
  const snapshot = readContractSnapshot()
  assert.deepEqual(snapshot.inventory.paths, [
    'datasets/loss-functions/lade-delivery-jilin.csv',
    'datasets/loss-functions/lade-delivery-jilin-manifest.json',
    'datasets/loss-functions/secom-manufacturing.csv',
    'datasets/loss-functions/secom-manufacturing-manifest.json',
    'datasets/loss-functions/ATTRIBUTION.md',
    'notebooks/loss-functions/delivery-losses.zh-CN.ipynb',
    'notebooks/loss-functions/delivery-losses.en.ipynb',
    'notebooks/loss-functions/manufacturing-bce-gradients.zh-CN.ipynb',
    'notebooks/loss-functions/manufacturing-bce-gradients.en.ipynb',
    'notebooks/loss-functions/outputs/regression-loss-summary.json',
    'notebooks/loss-functions/outputs/bce-gradient-summary.json',
    'notebooks/loss-functions/outputs/delivery-losses.png',
    'notebooks/loss-functions/outputs/manufacturing-bce-gradients.png',
    'notebooks/loss-functions/requirements.txt',
    'notebooks/loss-functions/environment.json',
    'notebooks/loss-functions/outputs/manifest.json',
  ])
  assert.deepEqual(snapshot.inventory.topicIds, [
    'delivery-losses',
    'manufacturing-bce-gradients',
  ])
  assert.deepEqual(snapshot.inventory.locales, ['zh-CN', 'en'])
  assert.equal(snapshot.inventory.partialSelectionAllowed, false)
  assert.equal(snapshot.inventory.publicationAllowed, false)
})

test('shared code and locale dictionaries produce paired notebooks with exact code parity', () => {
  const snapshot = readContractSnapshot()
  for (const topicId of ['delivery-losses', 'manufacturing-bce-gradients']) {
    const topic = snapshot.topics[topicId]
    assert.ok(topic)
    assert.ok(topic.codeCells.length >= 3)
    assert.deepEqual(Object.keys(topic.markdownByLocale).sort(), ['en', 'zh-CN'])
    assert.deepEqual(
      Object.keys(topic.markdownByLocale['zh-CN']).sort(),
      Object.keys(topic.markdownByLocale.en).sort(),
    )

    const zh = topic.blueprints['zh-CN']
    const en = topic.blueprints.en
    assert.deepEqual(zh.map((cell: { id: string }) => cell.id), en.map((cell: { id: string }) => cell.id))
    assert.deepEqual(
      zh.filter((cell: { kind: string }) => cell.kind === 'code'),
      en.filter((cell: { kind: string }) => cell.kind === 'code'),
    )
    assert.notDeepEqual(
      zh.filter((cell: { kind: string }) => cell.kind === 'markdown').map((cell: { source: string }) => cell.source),
      en.filter((cell: { kind: string }) => cell.kind === 'markdown').map((cell: { source: string }) => cell.source),
    )
  }
})

test('locale jobs require four distinct fresh kernel proof records', () => {
  const snapshot = readContractSnapshot()
  assert.equal(snapshot.executionJobs.length, 4)
  assert.deepEqual(
    snapshot.executionJobs.map((job: { topicId: string, locale: string }) => [job.topicId, job.locale]),
    [
      ['delivery-losses', 'zh-CN'],
      ['delivery-losses', 'en'],
      ['manufacturing-bce-gradients', 'zh-CN'],
      ['manufacturing-bce-gradients', 'en'],
    ],
  )
  assert.equal(
    new Set(snapshot.executionJobs.map((job: { proofId: string }) => job.proofId)).size,
    4,
  )
  for (const job of snapshot.executionJobs) {
    assert.equal(job.freshKernel, true)
    assert.equal(job.executionCountStartsAt, 1)
    assert.equal(job.allowErrors, false)
  }
})

test('staging candidate modes reject public roots and partial locale or topic selectors', () => {
  const help = runGenerator(['--help'])
  assert.equal(help.status, 0, help.stderr)
  assert.match(help.stdout, /--prepare-candidates/)
  assert.match(help.stdout, /--verify-candidates/)

  const publicRoot = resolve(root, 'public/phase-26-candidate-test')
  const publicAttempt = runGenerator([
    '--prepare-candidates',
    '--offline',
    '--staging-root',
    publicRoot,
  ])
  assert.notEqual(publicAttempt.status, 0)
  assert.match(publicAttempt.stderr, /public|staging/i)
  assert.equal(existsSync(publicRoot), false)
  rmSync(publicRoot, { recursive: true, force: true })

  for (const selector of [
    ['--topic', 'delivery-losses'],
    ['--locale', 'zh-CN'],
  ]) {
    const partialAttempt = runGenerator([
      '--prepare-candidates',
      '--offline',
      '--staging-root',
      stagingRoot,
      ...selector,
    ])
    assert.notEqual(partialAttempt.status, 0)
    assert.match(partialAttempt.stderr, /partial|selector|topic|locale/i)
  }

  const exactRootProbe = runProbe(
    'module.validate_candidate_staging_root(pathlib.Path(sys.argv[2])); print("accepted")',
    [stagingRoot],
  )
  assert.equal(exactRootProbe.status, 0, exactRootProbe.stderr)
  assert.equal(exactRootProbe.stdout.trim(), 'accepted')
})

test('network shell HTML and widget code are forbidden from candidate notebooks', () => {
  const snapshot = readContractSnapshot()
  const forbidden = [
    /\brequests\b/i,
    /\burllib\b/i,
    /hugging\s*face|huggingface/i,
    /archive\.ics\.uci\.edu|fetch_ucirepo/i,
    /(?:^|\n)\s*[!%]\s*(?:pip|conda|uv)\b/i,
    /<script\b|javascript:/i,
    /\b(?:ipywidgets|widget_state|display\s*\(\s*HTML)\b/i,
  ]
  for (const topic of Object.values(snapshot.topics) as Array<{
    codeCells: Array<{ id: string, source: string }>
  }>) {
    for (const cell of topic.codeCells) {
      for (const pattern of forbidden) {
        assert.doesNotMatch(cell.source, pattern, `${cell.id} contains ${pattern}`)
      }
    }
  }

  const injection = runProbe([
    'bad = module.NotebookCodeCell("bad-network", "import requests")',
    'module.validate_notebook_code_cells((bad,))',
  ].join('\n'))
  assert.notEqual(injection.status, 0)
  assert.match(injection.stderr, /forbidden|network|requests/i)
})
