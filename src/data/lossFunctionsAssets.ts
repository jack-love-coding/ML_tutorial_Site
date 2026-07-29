import type { LocalizedCopy } from '../types/ml.ts'

export const lossFunctionsTopicIds = [
  'delivery-losses',
  'manufacturing-bce-gradients',
] as const

export type LossFunctionsTopicId = (typeof lossFunctionsTopicIds)[number]

export const lossFunctionsChapterIds = [
  'why-loss',
  'regression-losses',
  'classification-losses',
  'likelihood-intuition',
  'negative-log',
  'mle-bridge',
  'gradient-verification',
] as const

export type LossFunctionsChapterId = (typeof lossFunctionsChapterIds)[number]

export type LossFunctionsSummaryOutputId =
  | 'regression-loss-summary'
  | 'bce-gradient-summary'

export type LossFunctionsOutputId =
  | 'delivery-representative-rows'
  | 'delivery-loss-distribution'
  | 'delivery-high-contribution-rows'
  | 'manufacturing-bce-contributions'
  | 'manufacturing-confident-error'
  | 'bce-stability-probes'
  | 'loss-gradient-sweeps'

export type LossFunctionsAssetKind =
  | 'dataset'
  | 'dataset-manifest'
  | 'attribution'
  | 'executed-notebook'
  | 'locked-summary'
  | 'plot'
  | 'requirements'
  | 'environment'
  | 'output-manifest'

export type LossFunctionsAssetId =
  | 'lade-delivery-dataset'
  | 'lade-delivery-manifest'
  | 'secom-manufacturing-dataset'
  | 'secom-manufacturing-manifest'
  | 'loss-functions-attribution'
  | 'delivery-losses-notebook-zh-CN'
  | 'delivery-losses-notebook-en'
  | 'manufacturing-bce-gradients-notebook-zh-CN'
  | 'manufacturing-bce-gradients-notebook-en'
  | 'regression-loss-summary'
  | 'bce-gradient-summary'
  | 'delivery-losses-plot'
  | 'manufacturing-bce-gradients-plot'
  | 'loss-functions-requirements'
  | 'loss-functions-environment'
  | 'loss-functions-output-manifest'

export interface DownloadableCourseAsset {
  id: LossFunctionsAssetId
  kind: LossFunctionsAssetKind
  publicPath: `/${string}`
  filename: string
  label: LocalizedCopy
  description: LocalizedCopy
}

export interface LossFunctionsNotebookDescriptor extends DownloadableCourseAsset {
  kind: 'executed-notebook'
  locale: 'zh-CN' | 'en'
  topicId: LossFunctionsTopicId
}

export interface LossFunctionsTopicDescriptor {
  id: LossFunctionsTopicId
  dataset: DownloadableCourseAsset
  datasetManifest: DownloadableCourseAsset
  notebooks: readonly [
    LossFunctionsNotebookDescriptor,
    LossFunctionsNotebookDescriptor,
  ]
  summary: DownloadableCourseAsset
  plot: DownloadableCourseAsset
  codeCellIds: readonly string[]
  codeSha256: string
}

export interface LossFunctionsChapterBinding {
  topicIds: readonly LossFunctionsTopicId[]
  outputIds: readonly LossFunctionsOutputId[]
  assetIds: readonly LossFunctionsAssetId[]
  codeCellIds: readonly string[]
}

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

const asset = <
  Id extends LossFunctionsAssetId,
  Kind extends LossFunctionsAssetKind,
  PublicPath extends `/${string}`,
>(
  id: Id,
  kind: Kind,
  publicPath: PublicPath,
  label: LocalizedCopy,
  description: LocalizedCopy,
): DownloadableCourseAsset & { id: Id; kind: Kind; publicPath: PublicPath } => ({
  id,
  kind,
  publicPath,
  filename: publicPath.slice(publicPath.lastIndexOf('/') + 1),
  label,
  description,
})

const ladeDataset = asset(
  'lade-delivery-dataset',
  'dataset',
  '/datasets/loss-functions/lade-delivery-jilin.csv',
  copy('下载 LaDe-D 吉林配送数据', 'Download the LaDe-D Jilin delivery data'),
  copy(
    '包含 31,415 行隐私最小化配送记录和固定配送时长字段；课程运行时不访问远程数据源。',
    'Contains 31,415 privacy-minimized delivery rows and the fixed duration field; the course never fetches the remote source at runtime.',
  ),
)

const ladeManifest = asset(
  'lade-delivery-manifest',
  'dataset-manifest',
  '/datasets/loss-functions/lade-delivery-jilin-manifest.json',
  copy('下载 LaDe-D 数据说明', 'Download the LaDe-D data manifest'),
  copy(
    '记录固定来源版本、哈希、字段删除边界、行数和代表行。',
    'Records the pinned source revision, hashes, field-removal boundary, row count, and representative rows.',
  ),
)

const secomDataset = asset(
  'secom-manufacturing-dataset',
  'dataset',
  '/datasets/loss-functions/secom-manufacturing.csv',
  copy('下载 SECOM 制造数据', 'Download the SECOM manufacturing data'),
  copy(
    '包含 1,567 行制造测量、原始缺失值和 0/1 缺陷标签；课程运行时只读取本地文件。',
    'Contains 1,567 manufacturing rows, preserved missing values, and 0/1 defect labels; runtime reads only this local file.',
  ),
)

const secomManifest = asset(
  'secom-manufacturing-manifest',
  'dataset-manifest',
  '/datasets/loss-functions/secom-manufacturing-manifest.json',
  copy('下载 SECOM 数据说明', 'Download the SECOM data manifest'),
  copy(
    '记录来源、许可、哈希、声明 591 与实际 590 个测量字段的差异，以及固定辅助预测。',
    'Records source, license, hashes, the declared-591 versus observed-590 measurement difference, and fixed auxiliary predictions.',
  ),
)

const attribution = asset(
  'loss-functions-attribution',
  'attribution',
  '/datasets/loss-functions/ATTRIBUTION.md',
  copy('查看数据来源与许可', 'View dataset sources and licenses'),
  copy(
    '汇总 LaDe-D 与 UCI SECOM 的来源、版本和再分发说明。',
    'Summarizes the source, version, and redistribution notes for LaDe-D and UCI SECOM.',
  ),
)

const deliveryNotebookZh = {
  ...asset(
    'delivery-losses-notebook-zh-CN',
    'executed-notebook',
    '/notebooks/loss-functions/delivery-losses.zh-CN.ipynb',
    copy('下载中文配送损失 Notebook', 'Download the Chinese delivery-loss Notebook'),
    copy(
      '从本地配送数据计算逐行和总体 MSE、MAE、输出梯度与分布图。',
      'Computes per-row and aggregate MSE, MAE, output gradients, and the distribution plot from the local delivery data.',
    ),
  ),
  locale: 'zh-CN',
  topicId: 'delivery-losses',
} as const satisfies LossFunctionsNotebookDescriptor

const deliveryNotebookEn = {
  ...asset(
    'delivery-losses-notebook-en',
    'executed-notebook',
    '/notebooks/loss-functions/delivery-losses.en.ipynb',
    copy('下载英文配送损失 Notebook', 'Download the English delivery-loss Notebook'),
    copy(
      '代码与中文版本完全一致，并从干净内核生成同一组数值输出。',
      'Uses code identical to the Chinese version and generates the same numerical outputs from a clean kernel.',
    ),
  ),
  locale: 'en',
  topicId: 'delivery-losses',
} as const satisfies LossFunctionsNotebookDescriptor

const manufacturingNotebookZh = {
  ...asset(
    'manufacturing-bce-gradients-notebook-zh-CN',
    'executed-notebook',
    '/notebooks/loss-functions/manufacturing-bce-gradients.zh-CN.ipynb',
    copy('下载中文 BCE 与梯度 Notebook', 'Download the Chinese BCE and gradient Notebook'),
    copy(
      '计算真实 SECOM BCE、稳定性探针以及 MSE、MAE、BCE 的中心差分检查。',
      'Computes real SECOM BCE, stability probes, and central-difference checks for MSE, MAE, and BCE.',
    ),
  ),
  locale: 'zh-CN',
  topicId: 'manufacturing-bce-gradients',
} as const satisfies LossFunctionsNotebookDescriptor

const manufacturingNotebookEn = {
  ...asset(
    'manufacturing-bce-gradients-notebook-en',
    'executed-notebook',
    '/notebooks/loss-functions/manufacturing-bce-gradients.en.ipynb',
    copy('下载英文 BCE 与梯度 Notebook', 'Download the English BCE and gradient Notebook'),
    copy(
      '代码与中文版本完全一致，并从独立干净内核生成同一组输出。',
      'Uses code identical to the Chinese version and generates the same outputs in an independent clean kernel.',
    ),
  ),
  locale: 'en',
  topicId: 'manufacturing-bce-gradients',
} as const satisfies LossFunctionsNotebookDescriptor

const regressionSummary = asset(
  'regression-loss-summary',
  'locked-summary',
  '/notebooks/loss-functions/outputs/regression-loss-summary.json',
  copy('下载配送损失结果', 'Download the delivery-loss results'),
  copy(
    '包含固定预测下逐行残差、MSE、MAE、两种梯度尺度、总体目标和代表行。',
    'Contains per-row residuals, MSE, MAE, both gradient scales, aggregate objectives, and representative rows under the fixed prediction.',
  ),
)

const bceSummary = asset(
  'bce-gradient-summary',
  'locked-summary',
  '/notebooks/loss-functions/outputs/bce-gradient-summary.json',
  copy('下载 BCE 与梯度结果', 'Download the BCE and gradient results'),
  copy(
    '包含真实逐行 BCE、稳定性探针和固定步长的有限差分检查。',
    'Contains real per-row BCE, stability probes, and finite-difference checks over the locked step sizes.',
  ),
)

const deliveryPlot = asset(
  'delivery-losses-plot',
  'plot',
  '/notebooks/loss-functions/outputs/delivery-losses.png',
  copy('下载配送损失图', 'Download the delivery-loss plot'),
  copy(
    '用实线菱形和虚线方形区分 MSE 与 MAE，不依赖颜色传达差异。',
    'Distinguishes MSE and MAE with solid diamonds and dashed squares, without relying on color alone.',
  ),
)

const manufacturingPlot = asset(
  'manufacturing-bce-gradients-plot',
  'plot',
  '/notebooks/loss-functions/outputs/manufacturing-bce-gradients.png',
  copy('下载 BCE 梯度检查图', 'Download the BCE gradient-check plot'),
  copy(
    '用实线圆点和虚线方形区分光滑损失与 MAE 尖点。',
    'Distinguishes smooth losses and the MAE kink with solid circles and dashed squares.',
  ),
)

const requirements = asset(
  'loss-functions-requirements',
  'requirements',
  '/notebooks/loss-functions/requirements.txt',
  copy('下载固定 Python 依赖', 'Download the pinned Python requirements'),
  copy(
    '锁定 NumPy、pandas、scikit-learn 与 Notebook 执行环境。',
    'Pins NumPy, pandas, scikit-learn, and the Notebook execution stack.',
  ),
)

const environment = asset(
  'loss-functions-environment',
  'environment',
  '/notebooks/loss-functions/environment.json',
  copy('下载执行环境说明', 'Download the execution environment record'),
  copy(
    '记录 Python、平台、离线 wheel 和依赖文件的精确哈希。',
    'Records the exact Python, platform, offline-wheel, and requirements hashes.',
  ),
)

const outputManifest = asset(
  'loss-functions-output-manifest',
  'output-manifest',
  '/notebooks/loss-functions/outputs/manifest.json',
  copy('下载完整输出清单', 'Download the complete output manifest'),
  copy(
    '锁定 16 个发布文件、四次独立执行、双语代码一致性和输出哈希。',
    'Locks the 16 published files, four independent executions, bilingual code parity, and output hashes.',
  ),
)

export const lossFunctionsAssets = [
  ladeDataset,
  ladeManifest,
  secomDataset,
  secomManifest,
  attribution,
  deliveryNotebookZh,
  deliveryNotebookEn,
  manufacturingNotebookZh,
  manufacturingNotebookEn,
  regressionSummary,
  bceSummary,
  deliveryPlot,
  manufacturingPlot,
  requirements,
  environment,
  outputManifest,
] as const satisfies readonly DownloadableCourseAsset[]

export const lossFunctionsAssetById = new Map(
  lossFunctionsAssets.map((entry) => [entry.id, entry] as const),
)

export const lossFunctionsTopics = {
  'delivery-losses': {
    id: 'delivery-losses',
    dataset: ladeDataset,
    datasetManifest: ladeManifest,
    notebooks: [deliveryNotebookZh, deliveryNotebookEn],
    summary: regressionSummary,
    plot: deliveryPlot,
    codeCellIds: [
      'delivery-imports',
      'delivery-loss-functions',
      'delivery-artifact-helpers',
      'delivery-local-paths',
      'delivery-build-output',
    ],
    codeSha256: 'ee8d7ff2d4d60cf2eb3d968084e84ea5e71a53efc900cc9f16bb30b25dd969a4',
  },
  'manufacturing-bce-gradients': {
    id: 'manufacturing-bce-gradients',
    dataset: secomDataset,
    datasetManifest: secomManifest,
    notebooks: [manufacturingNotebookZh, manufacturingNotebookEn],
    summary: bceSummary,
    plot: manufacturingPlot,
    codeCellIds: [
      'manufacturing-imports',
      'manufacturing-stable-bce',
      'manufacturing-central-difference',
      'manufacturing-gradient-sweeps',
      'manufacturing-artifact-helpers',
      'manufacturing-local-paths',
      'manufacturing-build-output',
    ],
    codeSha256: '232b082c43cba555ea56834e39bc825569a1ee637bbb4ffbac38cf83285548ef',
  },
} as const satisfies Record<LossFunctionsTopicId, LossFunctionsTopicDescriptor>

export const lossFunctionsChapterBindings = {
  'why-loss': {
    topicIds: ['delivery-losses'],
    outputIds: ['delivery-representative-rows'],
    assetIds: ['regression-loss-summary'],
    codeCellIds: ['delivery-loss-functions', 'delivery-build-output'],
  },
  'regression-losses': {
    topicIds: ['delivery-losses'],
    outputIds: [
      'delivery-representative-rows',
      'delivery-loss-distribution',
      'delivery-high-contribution-rows',
    ],
    assetIds: ['regression-loss-summary', 'delivery-losses-plot'],
    codeCellIds: ['delivery-loss-functions', 'delivery-build-output'],
  },
  'classification-losses': {
    topicIds: ['manufacturing-bce-gradients'],
    outputIds: [
      'manufacturing-bce-contributions',
      'manufacturing-confident-error',
      'bce-stability-probes',
    ],
    assetIds: ['bce-gradient-summary', 'manufacturing-bce-gradients-plot'],
    codeCellIds: ['manufacturing-stable-bce', 'manufacturing-build-output'],
  },
  'likelihood-intuition': {
    topicIds: ['manufacturing-bce-gradients'],
    outputIds: ['manufacturing-bce-contributions'],
    assetIds: ['bce-gradient-summary'],
    codeCellIds: ['manufacturing-stable-bce'],
  },
  'negative-log': {
    topicIds: ['manufacturing-bce-gradients'],
    outputIds: ['bce-stability-probes'],
    assetIds: ['bce-gradient-summary'],
    codeCellIds: ['manufacturing-stable-bce'],
  },
  'mle-bridge': {
    topicIds: ['delivery-losses', 'manufacturing-bce-gradients'],
    outputIds: ['delivery-representative-rows', 'manufacturing-bce-contributions'],
    assetIds: ['regression-loss-summary', 'bce-gradient-summary'],
    codeCellIds: ['delivery-loss-functions', 'manufacturing-stable-bce'],
  },
  'gradient-verification': {
    topicIds: ['delivery-losses', 'manufacturing-bce-gradients'],
    outputIds: ['loss-gradient-sweeps'],
    assetIds: ['bce-gradient-summary', 'manufacturing-bce-gradients-plot'],
    codeCellIds: ['manufacturing-central-difference', 'manufacturing-gradient-sweeps'],
  },
} as const satisfies Record<LossFunctionsChapterId, LossFunctionsChapterBinding>

export interface RegressionLossRow {
  courseRowId: string
  targetMinutes: number
  predictionMinutes: number
  residualMinutes: number
  mseLoss: number
  maeLoss: number
  msePerElementGradient: number
  maePerElementSubgradient: number
  maeDifferentiable: boolean
  mseMeanObjectiveGradient: number
  maeMeanObjectiveSubgradient: number
}

export interface RegressionLossSummary {
  contractVersion: 'loss-functions-phase-26-output-v1'
  topicId: 'delivery-losses'
  dataset: {
    datasetId: 'lade-delivery-jilin'
    sha256: string
    rowCount: number
  }
  referencePredictionMinutes: number
  aggregate: {
    mse: number
    mae: number
    rowCount: number
  }
  rows: RegressionLossRow[]
  representativeRows: Array<RegressionLossRow & { role: string }>
  highContributionRows: RegressionLossRow[]
  distribution: {
    metric: string
    binEdges: number[]
    counts: number[]
  }
  plot: LossFunctionsPlotOutput
}

export interface BceContributionRow {
  courseRowId: string
  fold: number
  label: number
  logit: number
  probability: number
  stableBce: number
  perLogitGradient: number
  meanObjectiveGradient: number
}

export type LossFunctionsFiniteStatus = 'finite' | 'inf' | '-inf' | 'nan'
export type LossFunctionsGradientStatus = 'pass' | 'fail' | 'kink'

export interface LossFunctionsPlotOutput {
  path: string
  width: number
  height: number
  nonColorEncoding: string
}

export interface BceGradientSummary {
  contractVersion: 'loss-functions-phase-26-output-v1'
  topicId: 'manufacturing-bce-gradients'
  dataset: {
    datasetId: 'uci-secom'
    sha256: string
    rowCount: number
    declaredFeatureCount: number
    observedFeatureCount: number
  }
  aggregate: {
    meanStableBce: number
    rowCount: number
  }
  rows: BceContributionRow[]
  highContributionRows: BceContributionRow[]
  confidentError: BceContributionRow & {
    confidenceThreshold: number
    selectionStatus: string
    source: string
  }
  fixedProbes: Array<{
    source: string
    logit: number
    label: number
    probability: number
    naive: { status: LossFunctionsFiniteStatus; value: number | null }
    clipped: {
      method: 'clipped-probability-bce'
      status: 'finite'
      value: number
      probability: number
      clippedProbability: number
      epsilon: number
      objectiveChanged: boolean
    }
    stable: {
      method: 'stable-logit-bce'
      status: 'finite'
      value: number
    }
  }>
  finiteDifferenceSweeps: Record<
    'mse' | 'mae' | 'mae-kink' | 'bce',
    Array<{
      step: number
      analyticValue: number
      numericalValue: number
      absoluteError: number
      scaledRelativeError: number
      tolerance: number
      differentiable: boolean
      status: LossFunctionsGradientStatus
      note: string | null
    }>
  >
  plot: LossFunctionsPlotOutput
}

function fail(path: string, reason: string): never {
  throw new TypeError(`Invalid loss-functions output at ${path}: ${reason}`)
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, 'expected an object')
  }
  return value as Record<string, unknown>
}

function array(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(path, 'expected an array')
  return value
}

function string(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0) fail(path, 'expected a non-empty string')
  return value
}

function finite(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(path, 'expected a finite number')
  }
  return value
}

function boolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') fail(path, 'expected a boolean')
  return value
}

function exact(value: unknown, expected: string, path: string) {
  if (value !== expected) fail(path, `expected ${expected}`)
}

function keys(value: Record<string, unknown>, expected: readonly string[], path: string) {
  const observed = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (observed.length !== wanted.length || observed.some((key, index) => key !== wanted[index])) {
    fail(path, `expected keys ${wanted.join(', ')}`)
  }
}

function finiteTree(value: unknown, path = '$') {
  if (typeof value === 'number') {
    finite(value, path)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => finiteTree(entry, `${path}[${index}]`))
    return
  }
  if (typeof value === 'object' && value !== null) {
    for (const [key, entry] of Object.entries(value)) {
      finiteTree(entry, `${path}.${key}`)
    }
  }
}

const regressionRowKeys = [
  'courseRowId',
  'targetMinutes',
  'predictionMinutes',
  'residualMinutes',
  'mseLoss',
  'maeLoss',
  'msePerElementGradient',
  'maePerElementSubgradient',
  'maeDifferentiable',
  'mseMeanObjectiveGradient',
  'maeMeanObjectiveSubgradient',
] as const

function regressionRow(value: unknown, path: string, hasRole = false) {
  const row = record(value, path)
  keys(row, hasRole ? [...regressionRowKeys, 'role'] : regressionRowKeys, path)
  string(row.courseRowId, `${path}.courseRowId`)
  for (const key of regressionRowKeys.filter((entry) => !['courseRowId', 'maeDifferentiable'].includes(entry))) {
    finite(row[key], `${path}.${key}`)
  }
  boolean(row.maeDifferentiable, `${path}.maeDifferentiable`)
  if (hasRole) string(row.role, `${path}.role`)
}

const bceRowKeys = [
  'courseRowId',
  'fold',
  'label',
  'logit',
  'probability',
  'stableBce',
  'perLogitGradient',
  'meanObjectiveGradient',
] as const

function bceRow(value: unknown, path: string, extraKeys: readonly string[] = []) {
  const row = record(value, path)
  keys(row, [...bceRowKeys, ...extraKeys], path)
  string(row.courseRowId, `${path}.courseRowId`)
  for (const key of bceRowKeys.filter((entry) => entry !== 'courseRowId')) {
    finite(row[key], `${path}.${key}`)
  }
  for (const key of extraKeys) {
    if (key === 'confidenceThreshold') finite(row[key], `${path}.${key}`)
    else string(row[key], `${path}.${key}`)
  }
}

function plot(value: unknown, path: string) {
  const output = record(value, path)
  keys(output, ['path', 'width', 'height', 'nonColorEncoding'], path)
  string(output.path, `${path}.path`)
  finite(output.width, `${path}.width`)
  finite(output.height, `${path}.height`)
  string(output.nonColorEncoding, `${path}.nonColorEncoding`)
}

function parseRegressionLossSummary(value: unknown): RegressionLossSummary {
  finiteTree(value)
  const output = record(value, '$')
  exact(output.contractVersion, 'loss-functions-phase-26-output-v1', '$.contractVersion')
  exact(output.topicId, 'delivery-losses', '$.topicId')

  const dataset = record(output.dataset, '$.dataset')
  exact(dataset.datasetId, 'lade-delivery-jilin', '$.dataset.datasetId')
  string(dataset.sha256, '$.dataset.sha256')
  finite(dataset.rowCount, '$.dataset.rowCount')

  const aggregate = record(output.aggregate, '$.aggregate')
  finite(aggregate.mse, '$.aggregate.mse')
  finite(aggregate.mae, '$.aggregate.mae')
  finite(aggregate.rowCount, '$.aggregate.rowCount')
  finite(output.referencePredictionMinutes, '$.referencePredictionMinutes')

  const rows = array(output.rows, '$.rows')
  if (rows.length === 0) fail('$.rows', 'must not be empty')
  rows.forEach((row, index) => regressionRow(row, `$.rows[${index}]`))
  const representatives = array(output.representativeRows, '$.representativeRows')
  if (representatives.length === 0) fail('$.representativeRows', 'must not be empty')
  representatives.forEach((row, index) => regressionRow(row, `$.representativeRows[${index}]`, true))
  const high = array(output.highContributionRows, '$.highContributionRows')
  if (high.length === 0) fail('$.highContributionRows', 'must not be empty')
  high.forEach((row, index) => regressionRow(row, `$.highContributionRows[${index}]`))

  const distribution = record(output.distribution, '$.distribution')
  string(distribution.metric, '$.distribution.metric')
  const edges = array(distribution.binEdges, '$.distribution.binEdges')
  const counts = array(distribution.counts, '$.distribution.counts')
  if (edges.length !== counts.length + 1) fail('$.distribution', 'bin edge/count shape mismatch')
  edges.forEach((entry, index) => finite(entry, `$.distribution.binEdges[${index}]`))
  counts.forEach((entry, index) => finite(entry, `$.distribution.counts[${index}]`))
  plot(output.plot, '$.plot')

  return value as RegressionLossSummary
}

function parseBceGradientSummary(value: unknown): BceGradientSummary {
  finiteTree(value)
  const output = record(value, '$')
  exact(output.contractVersion, 'loss-functions-phase-26-output-v1', '$.contractVersion')
  exact(output.topicId, 'manufacturing-bce-gradients', '$.topicId')

  const dataset = record(output.dataset, '$.dataset')
  exact(dataset.datasetId, 'uci-secom', '$.dataset.datasetId')
  string(dataset.sha256, '$.dataset.sha256')
  for (const key of ['rowCount', 'declaredFeatureCount', 'observedFeatureCount']) {
    finite(dataset[key], `$.dataset.${key}`)
  }
  const aggregate = record(output.aggregate, '$.aggregate')
  finite(aggregate.meanStableBce, '$.aggregate.meanStableBce')
  finite(aggregate.rowCount, '$.aggregate.rowCount')

  const rows = array(output.rows, '$.rows')
  if (rows.length === 0) fail('$.rows', 'must not be empty')
  rows.forEach((row, index) => bceRow(row, `$.rows[${index}]`))
  const high = array(output.highContributionRows, '$.highContributionRows')
  if (high.length === 0) fail('$.highContributionRows', 'must not be empty')
  high.forEach((row, index) => bceRow(row, `$.highContributionRows[${index}]`))
  bceRow(
    output.confidentError,
    '$.confidentError',
    ['confidenceThreshold', 'selectionStatus', 'source'],
  )

  const probes = array(output.fixedProbes, '$.fixedProbes')
  if (probes.length === 0) fail('$.fixedProbes', 'must not be empty')
  probes.forEach((probeValue, index) => {
    const path = `$.fixedProbes[${index}]`
    const probe = record(probeValue, path)
    string(probe.source, `${path}.source`)
    finite(probe.logit, `${path}.logit`)
    finite(probe.label, `${path}.label`)
    finite(probe.probability, `${path}.probability`)

    const naive = record(probe.naive, `${path}.naive`)
    const naiveStatus = naive.status
    if (!['finite', 'inf', '-inf', 'nan'].includes(String(naiveStatus))) {
      fail(`${path}.naive.status`, 'unsupported status')
    }
    if (naiveStatus === 'finite') finite(naive.value, `${path}.naive.value`)
    else if (naive.value !== null) fail(`${path}.naive.value`, 'non-finite status requires null')

    const clipped = record(probe.clipped, `${path}.clipped`)
    exact(clipped.status, 'finite', `${path}.clipped.status`)
    exact(clipped.method, 'clipped-probability-bce', `${path}.clipped.method`)
    for (const key of ['value', 'probability', 'clippedProbability', 'epsilon']) {
      finite(clipped[key], `${path}.clipped.${key}`)
    }
    boolean(clipped.objectiveChanged, `${path}.clipped.objectiveChanged`)

    const stable = record(probe.stable, `${path}.stable`)
    exact(stable.status, 'finite', `${path}.stable.status`)
    exact(stable.method, 'stable-logit-bce', `${path}.stable.method`)
    finite(stable.value, `${path}.stable.value`)
  })

  const sweeps = record(output.finiteDifferenceSweeps, '$.finiteDifferenceSweeps')
  for (const sweepId of ['mse', 'mae', 'mae-kink', 'bce'] as const) {
    const sweepRows = array(sweeps[sweepId], `$.finiteDifferenceSweeps.${sweepId}`)
    if (sweepRows.length === 0) fail(`$.finiteDifferenceSweeps.${sweepId}`, 'must not be empty')
    sweepRows.forEach((rowValue, index) => {
      const path = `$.finiteDifferenceSweeps.${sweepId}[${index}]`
      const row = record(rowValue, path)
      for (const key of [
        'step',
        'analyticValue',
        'numericalValue',
        'absoluteError',
        'scaledRelativeError',
        'tolerance',
      ]) {
        finite(row[key], `${path}.${key}`)
      }
      boolean(row.differentiable, `${path}.differentiable`)
      if (!['pass', 'fail', 'kink'].includes(String(row.status))) {
        fail(`${path}.status`, 'unsupported status')
      }
      if (row.note !== null && typeof row.note !== 'string') fail(`${path}.note`, 'expected string or null')
    })
  }
  plot(output.plot, '$.plot')

  return value as BceGradientSummary
}

export function parseLossFunctionsOutput(
  outputId: 'regression-loss-summary',
  value: unknown,
): RegressionLossSummary
export function parseLossFunctionsOutput(
  outputId: 'bce-gradient-summary',
  value: unknown,
): BceGradientSummary
export function parseLossFunctionsOutput(
  outputId: string,
  value: unknown,
): RegressionLossSummary | BceGradientSummary
export function parseLossFunctionsOutput(
  outputId: string,
  value: unknown,
): RegressionLossSummary | BceGradientSummary {
  if (outputId === 'regression-loss-summary') return parseRegressionLossSummary(value)
  if (outputId === 'bce-gradient-summary') return parseBceGradientSummary(value)
  throw new TypeError(`Unknown loss-functions output id: ${outputId}`)
}
