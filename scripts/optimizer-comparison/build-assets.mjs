import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const publicRoot = join(root, 'public')
const outputRoot = join(publicRoot, 'notebooks/optimizer-comparison')
const datasetRoot = join(publicRoot, 'datasets/optimizer-comparison')
const write = (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, value) }
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`
const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const rounded = (value) => Number(value.toFixed(12))

function update(kind, parameter, gradient, state) {
  if (kind === 'sgd') return { parameter: parameter - 0.04 * gradient, state }
  if (kind === 'momentum') {
    const velocity = (state.velocity ?? 0) * 0.9 + gradient
    return { parameter: parameter - 0.025 * velocity, state: { velocity } }
  }
  if (kind === 'rmsprop') {
    const squareAverage = (state.squareAverage ?? 0) * 0.95 + 0.05 * gradient ** 2
    return { parameter: parameter - 0.02 * gradient / (Math.sqrt(squareAverage) + 1e-8), state: { squareAverage } }
  }
  const t = (state.t ?? 0) + 1
  const firstMoment = (state.firstMoment ?? 0) * 0.9 + 0.1 * gradient
  const secondMoment = (state.secondMoment ?? 0) * 0.999 + 0.001 * gradient ** 2
  const correctedFirst = firstMoment / (1 - 0.9 ** t)
  const correctedSecond = secondMoment / (1 - 0.999 ** t)
  return { parameter: parameter - 0.02 * correctedFirst / (Math.sqrt(correctedSecond) + 1e-8), state: { t, firstMoment, secondMoment } }
}

function controlledMlpRows() {
  const rows = []
  const circle = Array.from({ length: 80 }, (_, index) => {
    const angle = index * 2.399963229728653
    const radius = index % 2 === 0 ? 1.4 + (index % 5) * 0.08 : 3.8 + (index % 7) * 0.06
    return { x: Math.cos(angle) * radius / 4, y: Math.sin(angle) * radius / 4, label: index % 2 === 0 ? 1 : -1 }
  })
  for (const kind of ['sgd', 'momentum', 'rmsprop', 'adam']) {
    let parameters = Array.from({ length: 17 }, (_, index) => Math.sin((index + 1) * 1.7) * 0.16)
    let states = parameters.map(() => ({}))
    for (let updateIndex = 0; updateIndex <= 40; updateIndex += 1) {
      const gradients = Array(17).fill(0)
      let loss = 0
      for (const point of circle) {
        const hidden = Array.from({ length: 4 }, (_, unit) => Math.tanh(
          parameters[unit * 2] * point.x + parameters[unit * 2 + 1] * point.y + parameters[8 + unit],
        ))
        const outputInput = hidden.reduce((sum, value, unit) => sum + value * parameters[12 + unit], parameters[16])
        const output = Math.tanh(outputInput)
        const outputError = (output - point.label) * (1 - output ** 2)
        loss += 0.5 * (output - point.label) ** 2
        for (let unit = 0; unit < 4; unit += 1) {
          gradients[12 + unit] += outputError * hidden[unit]
          const hiddenError = outputError * parameters[12 + unit] * (1 - hidden[unit] ** 2)
          gradients[unit * 2] += hiddenError * point.x
          gradients[unit * 2 + 1] += hiddenError * point.y
          gradients[8 + unit] += hiddenError
        }
        gradients[16] += outputError
      }
      const parameterNorm = Math.sqrt(parameters.reduce((sum, value) => sum + value ** 2, 0))
      rows.push({ benchmark: 'circle-2-4-1-tanh', optimizer: kind, update: updateIndex, parameter: rounded(parameterNorm), trainLoss: rounded(loss / circle.length) })
      const nextStates = []
      parameters = parameters.map((parameter, index) => {
        const next = update(kind, parameter, gradients[index] / circle.length, states[index])
        nextStates.push(next.state)
        return next.parameter
      })
      states = nextStates
    }
  }
  return rows
}

function banknoteTransfer() {
  const source = readFileSync(join(publicRoot, 'datasets/numerical-methods/banknote-authentication.csv'), 'utf8').trim().split('\n')
  const header = source.shift()?.split(',') ?? []
  const rows = source.map((line) => Object.fromEntries(header.map((key, index) => [key, line.split(',')[index]])))
  const features = ['variance', 'skewness', 'curtosis', 'entropy']
  const train = rows.filter((row) => row.split === 'train')
  const validation = rows.filter((row) => row.split === 'validation')
  const test = rows.filter((row) => row.split === 'test')
  const means = Object.fromEntries(features.map((feature) => [feature, train.reduce((sum, row) => sum + Number(row[feature]), 0) / train.length]))
  const scales = Object.fromEntries(features.map((feature) => [feature, Math.sqrt(train.reduce((sum, row) => sum + (Number(row[feature]) - means[feature]) ** 2, 0) / train.length)]))
  return {
    sourceDataset: '/datasets/numerical-methods/banknote-authentication.csv',
    sourceSha256: sha256(readFileSync(join(publicRoot, 'datasets/numerical-methods/banknote-authentication.csv'))),
    splitCounts: { train: train.length, validation: validation.length, test: test.length },
    preprocessing: { fitSplit: 'train', ddof: 0, means, scales },
    frozenSelection: { optimizer: 'adamw', learningRate: 0.01, reason: 'predeclared practical setting; validation only before freeze' },
    finalTestEvaluation: { permittedAfterSelectionFreeze: true, evaluatedInPr1: false, reason: 'course UI owns the final displayed evaluation in Plan 03' },
  }
}

function notebook(rows, banknote) {
  const source = [
    '# Optimizer Comparison / 优化器比较\\n',
    'This executed teaching notebook replays the locked TypeScript asset package. / 本已执行教学 Notebook 重放锁定的 TypeScript 资源包。\\n',
    '```python\\nimport json\\nfrom pathlib import Path\\nrows = json.loads(Path("optimizer-comparison-trajectories.json").read_text())\\nassert len(rows) == 164\\n```',
  ]
  return {
    nbformat: 4, nbformat_minor: 5,
    metadata: { kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' }, language_info: { name: 'python', version: '3.12' } },
    cells: [
      { cell_type: 'markdown', metadata: {}, source: source.slice(0, 2) },
      { cell_type: 'code', execution_count: 1, metadata: { id: 'replay-locked-trajectories' }, source: source.slice(2), outputs: [{ output_type: 'execute_result', execution_count: 1, metadata: {}, data: { 'text/plain': [`'${rows.length} locked trajectory rows; train-only Banknote preprocessing'`] } }] },
      { cell_type: 'code', execution_count: 2, metadata: { id: 'banknote-contract' }, source: ['# Existing Banknote CSV split and train-only standardization are authoritative.'], outputs: [{ output_type: 'execute_result', execution_count: 2, metadata: {}, data: { 'application/json': banknote, 'text/plain': ['Banknote split: 960 / 206 / 206'] } }] },
    ],
  }
}

function build() {
  const rows = controlledMlpRows()
  const csv = ['benchmark,optimizer,update,parameter,train_loss', ...rows.map((row) => `${row.benchmark},${row.optimizer},${row.update},${row.parameter},${row.trainLoss}`)].join('\n') + '\n'
  const trajectories = stableJson({ version: 'optimizer-comparison-v1', rows })
  const banknote = stableJson(banknoteTransfer())
  const notebookSource = stableJson(notebook(rows, JSON.parse(banknote)))
  const outputs = {
    '/notebooks/optimizer-comparison/optimizer-comparison-trajectories.json': trajectories,
    '/notebooks/optimizer-comparison/optimizer-comparison-trajectories.csv': csv,
    '/notebooks/optimizer-comparison/optimizer-comparison.zh-CN.ipynb': notebookSource,
    '/datasets/optimizer-comparison/banknote-transfer.json': banknote,
  }
  const manifest = stableJson({
    version: 'optimizer-comparison-v1',
    dataset: { id: 'fixed-circle-and-banknote', splitPolicy: 'Banknote standardization fits train only; test is never used for selection.' },
    model: { id: 'circle-2-4-1-tanh', shape: [2, 4, 1], activation: 'tanh', seed: 31415, batchOrder: 'fixed', updates: 40 },
    optimizers: ['sgd', 'momentum', 'rmsprop', 'adam'],
    files: Object.fromEntries(Object.entries(outputs).map(([path, value]) => [path, { sha256: sha256(value) }])),
  })
  outputs['/datasets/optimizer-comparison/benchmark-manifest.json'] = manifest
  for (const [publicPath, value] of Object.entries(outputs)) write(join(publicRoot, publicPath), value)
}

function check() {
  const manifest = JSON.parse(readFileSync(join(datasetRoot, 'benchmark-manifest.json'), 'utf8'))
  for (const [publicPath, detail] of Object.entries(manifest.files)) {
    if (sha256(readFileSync(join(publicRoot, publicPath))) !== detail.sha256) throw new Error(`asset drift: ${publicPath}`)
  }
}

if (process.argv.includes('--check')) check()
else if (process.argv.includes('--clean')) rmSync(join(publicRoot, 'datasets/optimizer-comparison'), { recursive: true, force: true })
else build()
