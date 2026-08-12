import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const publicRoot = join(root, 'public')
const outputRoot = join(publicRoot, 'notebooks/optimizer-comparison')
const datasetRoot = join(publicRoot, 'datasets/optimizer-comparison')
const canonicalBanknotePath = join(publicRoot, 'datasets/numerical-methods/banknote-authentication.csv')
const write = (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, value) }
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`
const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const rounded = (value) => Number(value.toFixed(12))

function readTrajectoryPackage() {
  const runner = join(root, 'scripts/optimizer-comparison/trajectory-runner.ts')
  return JSON.parse(execFileSync(process.execPath, ['--experimental-strip-types', runner], { cwd: root, encoding: 'utf8' }))
}

function sourceOverride() {
  const argument = process.argv.find((value) => value.startsWith('--banknote-source='))
  return argument ? resolve(root, argument.slice('--banknote-source='.length)) : canonicalBanknotePath
}

function banknoteTransfer(sourcePath = canonicalBanknotePath) {
  const sourceText = readFileSync(sourcePath, 'utf8')
  const source = sourceText.trim().split('\n')
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
    sourceSha256: sha256(sourceText),
    splitCounts: { train: train.length, validation: validation.length, test: test.length },
    preprocessing: { fitSplit: 'train', ddof: 0, means, scales },
    frozenSelection: { optimizer: 'adamw', learningRate: 0.01, reason: 'predeclared practical setting; validation only before freeze' },
    finalTestEvaluation: { permittedAfterSelectionFreeze: true, evaluatedInPr1: false, reason: 'course UI owns the final displayed evaluation in Plan 03' },
  }
}

function notebook() {
  const finder = [
    'import json',
    'from pathlib import Path',
    'import numpy as np',
    '',
    'def resolve_asset_dir():',
    '    for root in [Path.cwd(), *Path.cwd().parents]:',
    '        for candidate in (root, root / "public" / "notebooks" / "optimizer-comparison"):',
    '            if (candidate / "optimizer-comparison-trajectories.json").is_file():',
    '                return candidate',
    '    raise FileNotFoundError("Could not find optimizer-comparison trajectories from the kernel working directory")',
    '',
    'asset_dir = resolve_asset_dir()',
    'payload = json.loads((asset_dir / "optimizer-comparison-trajectories.json").read_text(encoding="utf-8"))',
    'rows = payload["rows"]',
    'assert len(rows) == 328',
  ]
  const replay = [
    ...finder,
    'matched = [row for row in rows if row["comparison"] == "first-step-norm-matched" and row["update"] == 1]',
    'practical = [row for row in rows if row["comparison"] == "predeclared-practical" and row["update"] == 1]',
    'matched_norms = np.array([row["updateNorm"] for row in matched], dtype=float)',
    'assert len(matched) == 4 and np.ptp(matched_norms) < 1e-10',
    'assert len(practical) == 4',
    'print(f"Replayed {len(rows)} rows from {asset_dir.name}; matched first-step norm = {matched_norms[0]:.12f}")',
  ]
  const banknote = [
    'banknote_path = asset_dir.parents[1] / "datasets" / "optimizer-comparison" / "banknote-transfer.json"',
    'banknote = json.loads(banknote_path.read_text(encoding="utf-8"))',
    'assert banknote["preprocessing"]["fitSplit"] == "train"',
    'assert banknote["splitCounts"] == {"train": 960, "validation": 206, "test": 206}',
    'print("Banknote replay uses the fixed split and train-only standardization.")',
  ]
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: { kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' }, language_info: { name: 'python' } },
    cells: [
      { cell_type: 'markdown', metadata: { id: 'bilingual-introduction' }, source: [
        '# Optimizer comparison: reproducible MLP traces / 优化器比较：可复现 MLP 轨迹\n',
        'This bilingual NumPy notebook replays two clearly separated comparisons from the shared TypeScript engine. / 本双语 NumPy Notebook 从共享 TypeScript 引擎重放两组清晰区分的比较。\n',
        '\n',
        '- **First-step norm matched / 首步范数匹配：** all optimizers receive learning rates derived from the same initial full-batch gradient, so their first full-vector update norms agree. / 所有优化器的学习率都由同一个初始全批梯度推导，因此首个完整向量更新范数一致。\n',
        '- **Predeclared practical / 预先声明的实用设置：** independently chosen practical learning rates are retained as a separate result and must not be compared as if they were norm matched. / 独立选择的实用学习率作为单独结果保留，不能与范数匹配结果混为一谈。\n',
        '- The fixed Banknote split fits standardization on training rows only. / 固定的 Banknote 划分仅用训练行拟合标准化。\n',
      ] },
      { cell_type: 'code', execution_count: null, metadata: { id: 'replay-shared-engine-assets' }, source: replay.map((line) => `${line}\n`), outputs: [] },
      { cell_type: 'code', execution_count: null, metadata: { id: 'banknote-train-only-contract' }, source: banknote.map((line) => `${line}\n`), outputs: [] },
    ],
  }
}

function validateManifest(manifest) {
  const program = "import { assertOptimizerBenchmarkManifest } from './src/types/optimizer.ts'; assertOptimizerBenchmarkManifest(JSON.parse(process.argv[1]));"
  execFileSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '--eval', program, JSON.stringify(manifest)], { cwd: root, stdio: 'pipe' })
}

function executeNotebook(inPlace) {
  const kernels = JSON.parse(execFileSync('jupyter', ['kernelspec', 'list', '--json'], { encoding: 'utf8', stdio: 'pipe' })).kernelspecs
  const kernelName = process.env.OPTIMIZER_NOTEBOOK_KERNEL
    ?? (kernels.python3 ? 'python3' : Object.keys(kernels)[0])
  if (!kernelName) throw new Error('no Jupyter Python kernel is available for clean-kernel notebook validation')
  const args = ['nbconvert', '--to', 'notebook', '--execute', `--ExecutePreprocessor.kernel_name=${kernelName}`, '--ExecutePreprocessor.timeout=60']
  if (inPlace) args.push('--inplace')
  else args.push('--stdout')
  args.push('optimizer-comparison.zh-CN.ipynb')
  execFileSync('jupyter', args, { cwd: outputRoot, stdio: 'pipe' })
}

function build() {
  const trajectoryPackage = readTrajectoryPackage()
  const rows = trajectoryPackage.rows
  const csv = ['benchmark,comparison,optimizer,update,parameter,train_loss,update_norm', ...rows.map((row) => `${row.benchmark},${row.comparison},${row.optimizer},${row.update},${row.parameter},${row.trainLoss},${row.updateNorm}`)].join('\n') + '\n'
  const trajectories = stableJson({ version: trajectoryPackage.version, rows })
  const banknoteObject = banknoteTransfer()
  const banknote = stableJson(banknoteObject)
  write(join(outputRoot, 'optimizer-comparison-trajectories.json'), trajectories)
  write(join(outputRoot, 'optimizer-comparison-trajectories.csv'), csv)
  write(join(datasetRoot, 'banknote-transfer.json'), banknote)
  write(join(outputRoot, 'optimizer-comparison.zh-CN.ipynb'), stableJson(notebook()))
  executeNotebook(true)
  const notebookSource = readFileSync(join(outputRoot, 'optimizer-comparison.zh-CN.ipynb'), 'utf8')
  const fileValues = {
    '/notebooks/optimizer-comparison/optimizer-comparison-trajectories.json': trajectories,
    '/notebooks/optimizer-comparison/optimizer-comparison-trajectories.csv': csv,
    '/notebooks/optimizer-comparison/optimizer-comparison.zh-CN.ipynb': notebookSource,
    '/datasets/optimizer-comparison/banknote-transfer.json': banknote,
  }
  const manifestObject = {
    version: trajectoryPackage.version,
    dataset: {
      id: 'fixed-circle-and-banknote',
      splitPolicy: 'Banknote standardization fits train only; test is never used for selection.',
      banknote: {
        sourceDataset: banknoteObject.sourceDataset,
        sourceSha256: banknoteObject.sourceSha256,
        splitCounts: banknoteObject.splitCounts,
        preprocessing: banknoteObject.preprocessing,
      },
    },
    model: { id: 'circle-2-4-1-tanh', shape: [2, 4, 1], activation: 'tanh', seed: 31415, initialization: trajectoryPackage.initialization, batchOrder: 'fixed-full-batch' },
    benchmarks: trajectoryPackage.benchmarks,
    files: Object.fromEntries(Object.entries(fileValues).map(([path, value]) => [path, { path, sha256: sha256(value) }])),
  }
  validateManifest(manifestObject)
  write(join(datasetRoot, 'benchmark-manifest.json'), stableJson(manifestObject))
}

function check() {
  const manifest = JSON.parse(readFileSync(join(datasetRoot, 'benchmark-manifest.json'), 'utf8'))
  validateManifest(manifest)
  for (const [publicPath, detail] of Object.entries(manifest.files)) {
    if (sha256(readFileSync(join(publicRoot, publicPath))) !== detail.sha256) throw new Error(`asset drift: ${publicPath}`)
  }
  const storedTransfer = JSON.parse(readFileSync(join(datasetRoot, 'banknote-transfer.json'), 'utf8'))
  const actualTransfer = banknoteTransfer(sourceOverride())
  if (JSON.stringify(storedTransfer) !== JSON.stringify(actualTransfer)) throw new Error('Banknote source, fixed split, or train-only preprocessing drift')
  if (JSON.stringify(manifest.dataset.banknote) !== JSON.stringify({
    sourceDataset: actualTransfer.sourceDataset,
    sourceSha256: actualTransfer.sourceSha256,
    splitCounts: actualTransfer.splitCounts,
    preprocessing: actualTransfer.preprocessing,
  })) throw new Error('Banknote manifest contract drift')
  executeNotebook(false)
}

if (process.argv.includes('--check')) check()
else build()
