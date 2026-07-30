import type { LocalizedCopy } from '../types/ml.ts'

export const linearRegressionAssetIds = [
  'bike-linear-regression-notebook-zh-CN',
  'bike-linear-regression-notebook-en',
  'linear-regression-summary',
  'linear-regression-gradient-descent-trace',
  'linear-regression-coefficients',
  'linear-regression-heldout-residuals',
  'linear-regression-requirements',
  'linear-regression-environment',
  'linear-regression-output-manifest',
] as const

export type LinearRegressionAssetId = (typeof linearRegressionAssetIds)[number]

export type LinearRegressionAssetKind =
  | 'executed-notebook'
  | 'locked-summary'
  | 'complete-gradient-trace'
  | 'complete-coefficient-table'
  | 'complete-heldout-residuals'
  | 'requirements'
  | 'environment'
  | 'output-manifest'

export const linearRegressionChapterIds = [
  'fit-line',
  'multivariate',
  'residual-loss',
  'training-motion',
  'polynomial',
  'model-limits',
  'overfitting',
  'regularization',
] as const

export type LinearRegressionChapterId = (typeof linearRegressionChapterIds)[number]

export type LinearRegressionOutputId =
  | 'linear-regression-summary'
  | 'linear-regression-gradient-descent-trace'
  | 'linear-regression-coefficients'
  | 'linear-regression-heldout-residuals'
  | 'linear-regression-output-manifest'

export type LinearRegressionChapterOutputId =
  | 'representative-training-row'
  | 'batch-contract'
  | 'residuals-and-metrics'
  | 'gradient-descent-result'
  | 'method-comparison'
  | 'coefficient-table'
  | 'heldout-diagnostics'
  | 'named-cases'
  | 'model-limit-review'

export interface LinearRegressionAssetDescriptor {
  readonly id: LinearRegressionAssetId
  readonly kind: LinearRegressionAssetKind
  readonly publicPath: `/notebooks/linear-regression/${string}`
  readonly filename: string
  readonly manifestRole: string
  readonly bundleId: 'linear-regression-phase-27'
  readonly label: LocalizedCopy
  readonly description: LocalizedCopy
  readonly topicId?: 'bike-linear-regression'
  readonly locale?: 'zh-CN' | 'en'
}

export interface LinearRegressionNotebookDescriptor
  extends LinearRegressionAssetDescriptor {
  readonly kind: 'executed-notebook'
  readonly topicId: 'bike-linear-regression'
  readonly locale: 'zh-CN' | 'en'
}

export interface LinearRegressionChapterAssetBinding {
  readonly summaryAssetId: 'linear-regression-summary'
  readonly outputIds: readonly LinearRegressionChapterOutputId[]
  readonly assetIds: readonly LinearRegressionAssetId[]
}

const localized = (zhCN: string, en: string): LocalizedCopy => ({
  'zh-CN': zhCN,
  en,
})

function asset<
  Id extends LinearRegressionAssetId,
  Kind extends LinearRegressionAssetKind,
  Path extends `/notebooks/linear-regression/${string}`,
>(
  id: Id,
  kind: Kind,
  publicPath: Path,
  manifestRole: string,
  label: LocalizedCopy,
  description: LocalizedCopy,
): LinearRegressionAssetDescriptor & {
  readonly id: Id
  readonly kind: Kind
  readonly publicPath: Path
} {
  return Object.freeze({
    id,
    kind,
    publicPath,
    filename: publicPath.slice(publicPath.lastIndexOf('/') + 1),
    manifestRole,
    bundleId: 'linear-regression-phase-27',
    label: Object.freeze({ ...label }),
    description: Object.freeze({ ...description }),
  })
}

const notebookZh = Object.freeze({
  ...asset(
    'bike-linear-regression-notebook-zh-CN',
    'executed-notebook',
    '/notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb',
    'executed-notebook',
    localized('下载中文 Bike 线性回归 Notebook', 'Download the Chinese Bike linear-regression Notebook'),
    localized(
      '在独立干净内核中运行固定 Bike Sharing 数据、时间切分和三种拟合方法。',
      'Runs the locked Bike Sharing data, chronological split, and three fitting methods in an independent clean kernel.',
    ),
  ),
  topicId: 'bike-linear-regression',
  locale: 'zh-CN',
}) satisfies LinearRegressionNotebookDescriptor

const notebookEn = Object.freeze({
  ...asset(
    'bike-linear-regression-notebook-en',
    'executed-notebook',
    '/notebooks/linear-regression/bike-linear-regression.en.ipynb',
    'executed-notebook',
    localized('下载英文 Bike 线性回归 Notebook', 'Download the English Bike linear-regression Notebook'),
    localized(
      '代码和数值输出与中文版本一致，并由另一独立干净内核生成。',
      'Uses code and numerical outputs identical to the Chinese version, generated in a separate clean kernel.',
    ),
  ),
  topicId: 'bike-linear-regression',
  locale: 'en',
}) satisfies LinearRegressionNotebookDescriptor

const summary = asset(
  'linear-regression-summary',
  'locked-summary',
  '/notebooks/linear-regression/linear-regression-summary.json',
  'locked-summary',
  localized('下载线性回归结果摘要', 'Download the linear-regression result summary'),
  localized(
    '包含固定切分、预处理、三种方法、系数、代表行和留出诊断。',
    'Contains the locked split, preprocessing, three methods, coefficients, representative row, and held-out diagnostics.',
  ),
)

const gradientTrace = asset(
  'linear-regression-gradient-descent-trace',
  'complete-gradient-trace',
  '/notebooks/linear-regression/gradient-descent-trace.csv',
  'complete-gradient-trace',
  localized('下载完整梯度下降轨迹', 'Download the complete gradient-descent trace'),
  localized(
    '保存从零初始化到第 772 次更新的 MSE、梯度范数和全部参数。',
    'Stores MSE, gradient norm, and every parameter from zero initialization through update 772.',
  ),
)

const coefficients = asset(
  'linear-regression-coefficients',
  'complete-coefficient-table',
  '/notebooks/linear-regression/coefficients.csv',
  'complete-coefficient-table',
  localized('下载完整系数表', 'Download the complete coefficient table'),
  localized(
    '列出三种 OLS 方法的模型空间系数和 NumPy 参考的原始数据单位系数。',
    'Lists model-space coefficients for all three OLS methods and original-data-unit coefficients for the NumPy reference.',
  ),
)

const heldoutResiduals = asset(
  'linear-regression-heldout-residuals',
  'complete-heldout-residuals',
  '/notebooks/linear-regression/heldout-residuals.csv',
  'complete-heldout-residuals',
  localized('下载完整留出残差', 'Download the complete held-out residuals'),
  localized(
    '保存按原始顺序排列的 3,476 行预测、实际值和 prediction - actual 残差。',
    'Stores all 3,476 ordered held-out predictions, actual values, and prediction-minus-actual residuals.',
  ),
)

const requirements = asset(
  'linear-regression-requirements',
  'requirements',
  '/notebooks/linear-regression/requirements.txt',
  'requirements',
  localized('下载固定 Python 依赖', 'Download the pinned Python requirements'),
  localized(
    '记录离线复现使用的八个精确 Python 依赖版本。',
    'Records the eight exact Python dependency versions used for offline reproduction.',
  ),
)

const environment = asset(
  'linear-regression-environment',
  'environment',
  '/notebooks/linear-regression/environment.json',
  'environment',
  localized('下载执行环境说明', 'Download the execution environment record'),
  localized(
    '记录 Python、平台、离线 wheel 清单和依赖文件身份。',
    'Records Python, platform, offline-wheel inventory, and requirements identity.',
  ),
)

const outputManifest = asset(
  'linear-regression-output-manifest',
  'output-manifest',
  '/notebooks/linear-regression/output-manifest.json',
  'candidate-manifest',
  localized('下载完整输出清单', 'Download the complete output manifest'),
  localized(
    '锁定九个发布成员、双语代码与输出一致性、来源哈希和教学行选择规则。',
    'Locks all nine published members, bilingual code/output parity, source hashes, and teaching-row selection rules.',
  ),
)

export const linearRegressionAssets = Object.freeze([
  notebookZh,
  notebookEn,
  summary,
  gradientTrace,
  coefficients,
  heldoutResiduals,
  requirements,
  environment,
  outputManifest,
]) satisfies readonly LinearRegressionAssetDescriptor[]

export const linearRegressionAssetById: ReadonlyMap<
  LinearRegressionAssetId,
  LinearRegressionAssetDescriptor
> = new Map(linearRegressionAssets.map((entry) => [entry.id, entry] as const))

export function getLinearRegressionAsset(
  id: LinearRegressionAssetId | string,
): LinearRegressionAssetDescriptor {
  const entry = linearRegressionAssetById.get(id as LinearRegressionAssetId)
  if (!entry) {
    throw new TypeError(`Unknown linear-regression asset id: ${id}`)
  }
  return entry
}

export const linearRegressionChapterAssets = Object.freeze({
  'fit-line': Object.freeze({
    summaryAssetId: 'linear-regression-summary',
    outputIds: Object.freeze(['representative-training-row'] as const),
    assetIds: Object.freeze([
      'linear-regression-summary',
      'bike-linear-regression-notebook-zh-CN',
      'bike-linear-regression-notebook-en',
    ] as const),
  }),
  multivariate: Object.freeze({
    summaryAssetId: 'linear-regression-summary',
    outputIds: Object.freeze(['batch-contract'] as const),
    assetIds: Object.freeze(['linear-regression-summary'] as const),
  }),
  'residual-loss': Object.freeze({
    summaryAssetId: 'linear-regression-summary',
    outputIds: Object.freeze(['residuals-and-metrics'] as const),
    assetIds: Object.freeze([
      'linear-regression-summary',
      'linear-regression-heldout-residuals',
    ] as const),
  }),
  'training-motion': Object.freeze({
    summaryAssetId: 'linear-regression-summary',
    outputIds: Object.freeze(['gradient-descent-result'] as const),
    assetIds: Object.freeze([
      'linear-regression-summary',
      'linear-regression-gradient-descent-trace',
    ] as const),
  }),
  polynomial: Object.freeze({
    summaryAssetId: 'linear-regression-summary',
    outputIds: Object.freeze(['method-comparison'] as const),
    assetIds: Object.freeze([
      'linear-regression-summary',
      'linear-regression-coefficients',
    ] as const),
  }),
  'model-limits': Object.freeze({
    summaryAssetId: 'linear-regression-summary',
    outputIds: Object.freeze(['coefficient-table'] as const),
    assetIds: Object.freeze([
      'linear-regression-summary',
      'linear-regression-coefficients',
    ] as const),
  }),
  overfitting: Object.freeze({
    summaryAssetId: 'linear-regression-summary',
    outputIds: Object.freeze(['heldout-diagnostics', 'named-cases'] as const),
    assetIds: Object.freeze([
      'linear-regression-summary',
      'linear-regression-heldout-residuals',
    ] as const),
  }),
  regularization: Object.freeze({
    summaryAssetId: 'linear-regression-summary',
    outputIds: Object.freeze(['model-limit-review'] as const),
    assetIds: Object.freeze([
      'linear-regression-summary',
      'linear-regression-coefficients',
      'linear-regression-requirements',
      'linear-regression-environment',
      'linear-regression-output-manifest',
    ] as const),
  }),
}) satisfies Readonly<
  Record<LinearRegressionChapterId, LinearRegressionChapterAssetBinding>
>

export interface LinearRegressionMetricSet {
  readonly mae: number
  readonly mse: number
  readonly r2: number
}

export interface LinearRegressionMethodResult {
  readonly intercept: number
  readonly weights: readonly number[]
}

export type LinearRegressionNamedCaseRole =
  | 'negative-prediction'
  | 'morning-peak-underprediction'
  | 'evening-peak-underprediction'
  | 'large-residual'

export interface LinearRegressionNamedCase {
  readonly actual: number
  readonly explanationRole: LocalizedCopy
  readonly hour: number
  readonly instant: number
  readonly prediction: number
  readonly residual: number
  readonly role: LinearRegressionNamedCaseRole
  readonly timestamp: string
}

export interface LinearRegressionDiagnostics {
  readonly residualSign: 'prediction - actual'
  readonly stagedOrder: readonly [
    'optimization-complete',
    'hourly-residual-shape',
    'prediction-bin-spread',
    'named-heldout-cases',
    'coefficient-stability',
    'log1p-comparison',
    'combined-review',
  ]
  readonly hourlyResiduals: readonly {
    readonly hour: number
    readonly meanResidual: number
  }[]
  readonly predictionBins: readonly {
    readonly bin: number
    readonly lowerPrediction: number
    readonly mae: number
    readonly residualStdDev: number
    readonly rows: number
    readonly upperPrediction: number
  }[]
  readonly namedCases: readonly LinearRegressionNamedCase[]
  readonly collinearity: Readonly<Record<string, unknown>>
  readonly log1p: Readonly<Record<string, unknown>>
}

export interface LinearRegressionLockedSummary {
  readonly contractVersion: 'linear-regression-phase-27-summary-v1'
  readonly source: {
    readonly path: 'datasets/python-data-tools/bike-sharing-hour.csv'
    readonly sha256: 'e03de4ee4ef4dc376ac6e04bf829673c6269e8eba5c60fa121640fa2f829504f'
    readonly rows: 17379
    readonly target: 'cnt'
    readonly targetRelationship: 'cnt = casual + registered'
  }
  readonly features: {
    readonly order: readonly ['temp', 'hum', 'windspeed', 'workingday', 'hr']
    readonly continuous: readonly ['temp', 'hum', 'windspeed', 'hr']
    readonly binaryUnscaled: readonly ['workingday']
    readonly collinearityOnly: readonly ['atemp']
    readonly leakageExcluded: readonly ['casual', 'registered']
  }
  readonly split: Readonly<Record<string, unknown>>
  readonly preprocessing: Readonly<Record<string, unknown>>
  readonly coefficients: Readonly<Record<string, unknown>>
  readonly methods: Readonly<Record<string, unknown>>
  readonly metrics: {
    readonly train: LinearRegressionMetricSet
    readonly test: LinearRegressionMetricSet
  }
  readonly optimization: Readonly<Record<string, unknown>>
  readonly representativeTrainingRow: Readonly<Record<string, unknown>> & {
    readonly instant: 11550
    readonly role: 'representative-training-row'
  }
  readonly diagnostics: LinearRegressionDiagnostics
  readonly selectionRuleVersion: 'bike-linear-regression-teaching-rows-v1'
}

export interface LinearRegressionGradientTraceRow {
  readonly update: number
  readonly mse: number
  readonly gradientNorm: number
  readonly intercept: number
  readonly weights: readonly [number, number, number, number, number]
}

export interface LinearRegressionCoefficientRow {
  readonly method:
    | 'numpy-batch-gradient-descent'
    | 'numpy-lstsq'
    | 'sklearn-linear-regression'
  readonly space: 'model' | 'original-dataset-unit'
  readonly feature: 'intercept' | 'temp' | 'hum' | 'windspeed' | 'workingday' | 'hr'
  readonly coefficient: number
}

export interface LinearRegressionResidualRow {
  readonly instant: number
  readonly timestamp: string
  readonly hour: number
  readonly actual: number
  readonly prediction: number
  readonly residual: number
}

export interface LinearRegressionManifestContract {
  readonly contractVersion: 'linear-regression-phase-27-candidate-v1'
  readonly packageComplete: true
  readonly publicationAllowed: false
  readonly source: Readonly<Record<string, unknown>>
  readonly contract: Readonly<Record<string, unknown>>
  readonly inventory: readonly Readonly<Record<string, unknown>>[]
  readonly executionProofs: readonly Readonly<Record<string, unknown>>[]
  readonly localeParity: Readonly<Record<string, unknown>>
  readonly teachingRows: readonly Readonly<Record<string, unknown>>[]
  readonly resolvedInstants: readonly [11550, 17213, 15628, 14965, 15604]
  readonly selectionRuleVersion: 'bike-linear-regression-teaching-rows-v1'
  readonly [key: string]: unknown
}

const SUMMARY_CONTRACT = 'linear-regression-phase-27-summary-v1'
const MANIFEST_CONTRACT = 'linear-regression-phase-27-candidate-v1'
const SOURCE_SHA256 = 'e03de4ee4ef4dc376ac6e04bf829673c6269e8eba5c60fa121640fa2f829504f'
const METHOD_TOLERANCE = 1e-6

const FEATURE_ORDER = ['temp', 'hum', 'windspeed', 'workingday', 'hr'] as const
const CONTINUOUS_FEATURES = ['temp', 'hum', 'windspeed', 'hr'] as const
const NAMED_CASES = [
  ['negative-prediction', 17_213],
  ['morning-peak-underprediction', 15_628],
  ['evening-peak-underprediction', 14_965],
  ['large-residual', 15_604],
] as const
const STAGED_ORDER = [
  'optimization-complete',
  'hourly-residual-shape',
  'prediction-bin-spread',
  'named-heldout-cases',
  'coefficient-stability',
  'log1p-comparison',
  'combined-review',
] as const

function fail(path: string, reason: string): never {
  throw new TypeError(`Invalid linear-regression output at ${path}: ${reason}`)
}

function object(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, 'expected an object')
  }
  return value as Record<string, unknown>
}

function array(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(path, 'expected an array')
  return value
}

function exactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
  path: string,
): void {
  const observed = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (
    observed.length !== wanted.length
    || observed.some((key, index) => key !== wanted[index])
  ) {
    fail(path, `expected keys ${wanted.join(', ')}`)
  }
}

function exact(value: unknown, expected: unknown, path: string): void {
  if (value !== expected) fail(path, `expected ${String(expected)}`)
}

function finite(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(path, 'expected a finite number')
  }
  return value
}

function integer(value: unknown, path: string): number {
  const result = finite(value, path)
  if (!Number.isInteger(result)) fail(path, 'expected an integer')
  return result
}

function nonEmptyString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    fail(path, 'expected a non-empty string')
  }
  return value
}

function exactArray(
  value: unknown,
  expected: readonly unknown[],
  path: string,
): void {
  const observed = array(value, path)
  if (
    observed.length !== expected.length
    || observed.some((entry, index) => entry !== expected[index])
  ) {
    fail(path, `expected [${expected.join(', ')}]`)
  }
}

function finiteArray(value: unknown, length: number, path: string): void {
  const values = array(value, path)
  if (values.length !== length) fail(path, `expected ${length} entries`)
  values.forEach((entry, index) => finite(entry, `${path}[${index}]`))
}

function finiteTree(value: unknown, path = '$'): void {
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

function localizedCopy(value: unknown, path: string): void {
  const copy = object(value, path)
  exactKeys(copy, ['zh-CN', 'en'], path)
  nonEmptyString(copy['zh-CN'], `${path}.zh-CN`)
  nonEmptyString(copy.en, `${path}.en`)
}

function metricSet(value: unknown, path: string): void {
  const metrics = object(value, path)
  exactKeys(metrics, ['mae', 'mse', 'r2'], path)
  finite(metrics.mae, `${path}.mae`)
  finite(metrics.mse, `${path}.mse`)
  finite(metrics.r2, `${path}.r2`)
}

function residualMatches(
  predictionValue: unknown,
  actualValue: unknown,
  residualValue: unknown,
  path: string,
  tolerance = 1e-12,
): void {
  const prediction = finite(predictionValue, `${path}.prediction`)
  const actual = finite(actualValue, `${path}.actual`)
  const residual = finite(residualValue, `${path}.residual`)
  if (Math.abs(residual - (prediction - actual)) > tolerance) {
    fail(`${path}.residual`, 'must equal prediction - actual')
  }
}

function methodResult(value: unknown, path: string): void {
  const result = object(value, path)
  exactKeys(result, ['intercept', 'weights'], path)
  finite(result.intercept, `${path}.intercept`)
  finiteArray(result.weights, 5, `${path}.weights`)
}

function validateSummarySource(value: unknown): void {
  const source = object(value, '$.source')
  exactKeys(source, ['path', 'sha256', 'rows', 'target', 'targetRelationship'], '$.source')
  exact(source.path, 'datasets/python-data-tools/bike-sharing-hour.csv', '$.source.path')
  exact(source.sha256, SOURCE_SHA256, '$.source.sha256')
  exact(source.rows, 17_379, '$.source.rows')
  exact(source.target, 'cnt', '$.source.target')
  exact(source.targetRelationship, 'cnt = casual + registered', '$.source.targetRelationship')
}

function validateFeatures(value: unknown, path = '$.features'): void {
  const features = object(value, path)
  exactKeys(
    features,
    ['order', 'continuous', 'binaryUnscaled', 'collinearityOnly', 'leakageExcluded'],
    path,
  )
  exactArray(features.order, FEATURE_ORDER, `${path}.order`)
  exactArray(features.continuous, CONTINUOUS_FEATURES, `${path}.continuous`)
  exactArray(features.binaryUnscaled, ['workingday'], `${path}.binaryUnscaled`)
  exactArray(features.collinearityOnly, ['atemp'], `${path}.collinearityOnly`)
  exactArray(features.leakageExcluded, ['casual', 'registered'], `${path}.leakageExcluded`)
}

function validateSummarySplit(value: unknown): void {
  const split = object(value, '$.split')
  exactKeys(
    split,
    ['index', 'kind', 'testRows', 'testStart', 'trainEnd', 'trainRows'],
    '$.split',
  )
  exact(split.index, 13_903, '$.split.index')
  exact(split.kind, 'chronological-first-80-percent', '$.split.kind')
  exact(split.trainRows, 13_903, '$.split.trainRows')
  exact(split.testRows, 3_476, '$.split.testRows')

  const trainEnd = object(split.trainEnd, '$.split.trainEnd')
  exactKeys(trainEnd, ['instant', 'timestamp'], '$.split.trainEnd')
  exact(trainEnd.instant, 13_903, '$.split.trainEnd.instant')
  exact(trainEnd.timestamp, '2012-08-07 11:00', '$.split.trainEnd.timestamp')

  const testStart = object(split.testStart, '$.split.testStart')
  exactKeys(testStart, ['instant', 'timestamp'], '$.split.testStart')
  exact(testStart.instant, 13_904, '$.split.testStart.instant')
  exact(testStart.timestamp, '2012-08-07 12:00', '$.split.testStart.timestamp')
}

function validatePreprocessing(value: unknown): void {
  const preprocessing = object(value, '$.preprocessing')
  exactKeys(
    preprocessing,
    ['ddof', 'fitPartition', 'means', 'scales', 'standardized', 'unscaled'],
    '$.preprocessing',
  )
  exact(preprocessing.ddof, 0, '$.preprocessing.ddof')
  exact(preprocessing.fitPartition, 'train-only', '$.preprocessing.fitPartition')
  exactArray(
    preprocessing.standardized,
    CONTINUOUS_FEATURES,
    '$.preprocessing.standardized',
  )
  exactArray(preprocessing.unscaled, ['workingday'], '$.preprocessing.unscaled')
  for (const field of ['means', 'scales'] as const) {
    const values = object(preprocessing[field], `$.preprocessing.${field}`)
    exactKeys(values, CONTINUOUS_FEATURES, `$.preprocessing.${field}`)
    for (const feature of CONTINUOUS_FEATURES) {
      const number = finite(values[feature], `$.preprocessing.${field}.${feature}`)
      if (field === 'scales' && number <= 0) {
        fail(`$.preprocessing.scales.${feature}`, 'expected a positive scale')
      }
    }
  }
}

function validateCoefficientSpace(
  value: unknown,
  path: string,
  original = false,
): void {
  const coefficientSpace = object(value, path)
  exactKeys(
    coefficientSpace,
    original
      ? ['featureOrder', 'intercept', 'interpretation', 'weights']
      : ['featureOrder', 'intercept', 'weights'],
    path,
  )
  exactArray(coefficientSpace.featureOrder, FEATURE_ORDER, `${path}.featureOrder`)
  finite(coefficientSpace.intercept, `${path}.intercept`)
  finiteArray(coefficientSpace.weights, 5, `${path}.weights`)
  if (original) {
    exact(
      coefficientSpace.interpretation,
      'conditional association holding modeled features fixed; not causal',
      `${path}.interpretation`,
    )
  }
}

function validateCoefficients(value: unknown): void {
  const coefficientSet = object(value, '$.coefficients')
  exactKeys(coefficientSet, ['modelSpace', 'originalDatasetUnits'], '$.coefficients')
  validateCoefficientSpace(coefficientSet.modelSpace, '$.coefficients.modelSpace')
  validateCoefficientSpace(
    coefficientSet.originalDatasetUnits,
    '$.coefficients.originalDatasetUnits',
    true,
  )
}

function validateNormalEquation(value: unknown, path: string): void {
  const normal = object(value, path)
  exactKeys(
    normal,
    [
      'augmentedDesign',
      'conditionNumber',
      'formula',
      'implementation',
      'intercept',
      'interceptMapping',
      'rank',
      'rationale',
      'singularValues',
      'term',
      'weightMapping',
      'weights',
    ],
    path,
  )
  exact(normal.augmentedDesign, 'X_tilde = [1, X]', `${path}.augmentedDesign`)
  exact(
    normal.formula,
    'theta = (X_tilde^T X_tilde)^+ X_tilde^T y',
    `${path}.formula`,
  )
  exact(normal.implementation, 'numpy.linalg.lstsq', `${path}.implementation`)
  exact(normal.interceptMapping, 'theta[0] = b', `${path}.interceptMapping`)
  exact(normal.weightMapping, 'theta[1:] = w', `${path}.weightMapping`)
  exact(normal.rank, 6, `${path}.rank`)
  finite(normal.conditionNumber, `${path}.conditionNumber`)
  finite(normal.intercept, `${path}.intercept`)
  nonEmptyString(normal.rationale, `${path}.rationale`)
  finiteArray(normal.singularValues, 6, `${path}.singularValues`)
  finiteArray(normal.weights, 5, `${path}.weights`)
  const term = object(normal.term, `${path}.term`)
  exactKeys(term, ['en', 'zh-CN'], `${path}.term`)
  exact(term.en, 'normal equation', `${path}.term.en`)
  exact(term['zh-CN'], '正规方程', `${path}.term.zh-CN`)
}

function validateAgreement(value: unknown): void {
  const agreement = object(value, '$.methods.agreement')
  exactKeys(
    agreement,
    [
      'agrees',
      'byMethod',
      'maxCoefficientDelta',
      'maxPredictionDelta',
      'tolerance',
    ],
    '$.methods.agreement',
  )
  exact(agreement.agrees, true, '$.methods.agreement.agrees')
  exact(agreement.tolerance, METHOD_TOLERANCE, '$.methods.agreement.tolerance')
  for (const key of ['maxCoefficientDelta', 'maxPredictionDelta'] as const) {
    const delta = finite(agreement[key], `$.methods.agreement.${key}`)
    if (delta > METHOD_TOLERANCE) {
      fail(`$.methods.agreement.${key}`, `must be within tolerance ${METHOD_TOLERANCE}`)
    }
  }

  const byMethod = object(agreement.byMethod, '$.methods.agreement.byMethod')
  const methodIds = [
    'numpyBatchGradientDescent',
    'numpyLstsq',
    'sklearnLinearRegression',
  ] as const
  exactKeys(byMethod, methodIds, '$.methods.agreement.byMethod')
  for (const methodId of methodIds) {
    const result = object(byMethod[methodId], `$.methods.agreement.byMethod.${methodId}`)
    exactKeys(
      result,
      ['maxCoefficientDelta', 'maxPredictionDelta'],
      `$.methods.agreement.byMethod.${methodId}`,
    )
    for (const key of ['maxCoefficientDelta', 'maxPredictionDelta'] as const) {
      const delta = finite(
        result[key],
        `$.methods.agreement.byMethod.${methodId}.${key}`,
      )
      if (delta > METHOD_TOLERANCE) {
        fail(
          `$.methods.agreement.byMethod.${methodId}.${key}`,
          `must be within tolerance ${METHOD_TOLERANCE}`,
        )
      }
    }
  }
}

function validateMethods(value: unknown): void {
  const methods = object(value, '$.methods')
  exactKeys(
    methods,
    [
      'agreement',
      'normalEquation',
      'numpyBatchGradientDescent',
      'roles',
      'scikitLearnLinearRegression',
      'tolerance',
    ],
    '$.methods',
  )
  exact(methods.tolerance, METHOD_TOLERANCE, '$.methods.tolerance')
  validateAgreement(methods.agreement)
  validateNormalEquation(methods.normalEquation, '$.methods.normalEquation')
  methodResult(
    methods.numpyBatchGradientDescent,
    '$.methods.numpyBatchGradientDescent',
  )

  const sklearn = object(
    methods.scikitLearnLinearRegression,
    '$.methods.scikitLearnLinearRegression',
  )
  exactKeys(
    sklearn,
    ['fitIntercept', 'intercept', 'rank', 'singularValues', 'weights'],
    '$.methods.scikitLearnLinearRegression',
  )
  exact(sklearn.fitIntercept, true, '$.methods.scikitLearnLinearRegression.fitIntercept')
  exact(sklearn.rank, 5, '$.methods.scikitLearnLinearRegression.rank')
  finite(sklearn.intercept, '$.methods.scikitLearnLinearRegression.intercept')
  finiteArray(sklearn.singularValues, 5, '$.methods.scikitLearnLinearRegression.singularValues')
  finiteArray(sklearn.weights, 5, '$.methods.scikitLearnLinearRegression.weights')

  const roles = object(methods.roles, '$.methods.roles')
  exactKeys(
    roles,
    [
      'normalEquation',
      'numpyBatchGradientDescent',
      'scikitLearnLinearRegression',
    ],
    '$.methods.roles',
  )
  exact(
    roles.normalEquation,
    'non-iterative numerical reference',
    '$.methods.roles.normalEquation',
  )
  exact(
    roles.numpyBatchGradientDescent,
    'transparent iterative parameter learning',
    '$.methods.roles.numpyBatchGradientDescent',
  )
  exact(
    roles.scikitLearnLinearRegression,
    'practical API counterpart',
    '$.methods.roles.scikitLearnLinearRegression',
  )
}

function validateOptimization(value: unknown): void {
  const optimization = object(value, '$.optimization')
  exactKeys(optimization, ['config', 'result'], '$.optimization')

  const config = object(optimization.config, '$.optimization.config')
  exactKeys(
    config,
    ['gradientTolerance', 'initialization', 'learningRate', 'maxUpdates'],
    '$.optimization.config',
  )
  exact(config.gradientTolerance, 1e-8, '$.optimization.config.gradientTolerance')
  exact(config.initialization, 'zeros', '$.optimization.config.initialization')
  exact(config.learningRate, 0.1, '$.optimization.config.learningRate')
  exact(config.maxUpdates, 5_000, '$.optimization.config.maxUpdates')

  const result = object(optimization.result, '$.optimization.result')
  exactKeys(
    result,
    ['gradientNorm', 'intercept', 'mse', 'reason', 'updates', 'weights'],
    '$.optimization.result',
  )
  const gradientNorm = finite(result.gradientNorm, '$.optimization.result.gradientNorm')
  if (gradientNorm > 1e-8) {
    fail('$.optimization.result.gradientNorm', 'must satisfy gradient tolerance')
  }
  finite(result.intercept, '$.optimization.result.intercept')
  finite(result.mse, '$.optimization.result.mse')
  exact(result.reason, 'gradient-tolerance', '$.optimization.result.reason')
  exact(result.updates, 772, '$.optimization.result.updates')
  finiteArray(result.weights, 5, '$.optimization.result.weights')
}

function validateRepresentativeRow(value: unknown): void {
  const row = object(value, '$.representativeTrainingRow')
  exactKeys(
    row,
    [
      'actual',
      'explanationRole',
      'hour',
      'instant',
      'lossContribution',
      'prediction',
      'rawFeatures',
      'residual',
      'role',
      'timestamp',
      'transformedValues',
      'unaveragedInterceptGradientContribution',
      'unaveragedWeightGradientContribution',
    ],
    '$.representativeTrainingRow',
  )
  exact(row.instant, 11_550, '$.representativeTrainingRow.instant')
  exact(
    row.role,
    'representative-training-row',
    '$.representativeTrainingRow.role',
  )
  exact(row.hour, 10, '$.representativeTrainingRow.hour')
  nonEmptyString(row.timestamp, '$.representativeTrainingRow.timestamp')
  localizedCopy(row.explanationRole, '$.representativeTrainingRow.explanationRole')
  residualMatches(
    row.prediction,
    row.actual,
    row.residual,
    '$.representativeTrainingRow',
  )
  const residual = finite(row.residual, '$.representativeTrainingRow.residual')
  const loss = finite(
    row.lossContribution,
    '$.representativeTrainingRow.lossContribution',
  )
  if (Math.abs(loss - residual * residual) > 1e-12) {
    fail(
      '$.representativeTrainingRow.lossContribution',
      'must equal squared residual',
    )
  }
  const interceptContribution = finite(
    row.unaveragedInterceptGradientContribution,
    '$.representativeTrainingRow.unaveragedInterceptGradientContribution',
  )
  if (Math.abs(interceptContribution - 2 * residual) > 1e-12) {
    fail(
      '$.representativeTrainingRow.unaveragedInterceptGradientContribution',
      'must equal 2 * residual',
    )
  }

  const rawFeatures = object(row.rawFeatures, '$.representativeTrainingRow.rawFeatures')
  exactKeys(rawFeatures, FEATURE_ORDER, '$.representativeTrainingRow.rawFeatures')
  for (const feature of FEATURE_ORDER) {
    finite(rawFeatures[feature], `$.representativeTrainingRow.rawFeatures.${feature}`)
  }
  finiteArray(row.transformedValues, 5, '$.representativeTrainingRow.transformedValues')
  finiteArray(
    row.unaveragedWeightGradientContribution,
    5,
    '$.representativeTrainingRow.unaveragedWeightGradientContribution',
  )
}

function validateNamedCases(value: unknown): void {
  const cases = array(value, '$.diagnostics.namedCases')
  if (cases.length !== NAMED_CASES.length) {
    fail('$.diagnostics.namedCases', `expected ${NAMED_CASES.length} entries`)
  }
  cases.forEach((caseValue, index) => {
    const path = `$.diagnostics.namedCases[${index}]`
    const namedCase = object(caseValue, path)
    exactKeys(
      namedCase,
      [
        'actual',
        'explanationRole',
        'hour',
        'instant',
        'prediction',
        'residual',
        'role',
        'timestamp',
      ],
      path,
    )
    exact(namedCase.role, NAMED_CASES[index]?.[0], `${path}.role`)
    exact(namedCase.instant, NAMED_CASES[index]?.[1], `${path}.instant`)
    const hour = integer(namedCase.hour, `${path}.hour`)
    if (hour < 0 || hour > 23) fail(`${path}.hour`, 'expected hour 0-23')
    nonEmptyString(namedCase.timestamp, `${path}.timestamp`)
    localizedCopy(namedCase.explanationRole, `${path}.explanationRole`)
    residualMatches(
      namedCase.prediction,
      namedCase.actual,
      namedCase.residual,
      path,
    )
  })
}

function validateHourlyResiduals(value: unknown): void {
  const rows = array(value, '$.diagnostics.hourlyResiduals')
  if (rows.length !== 24) fail('$.diagnostics.hourlyResiduals', 'expected 24 entries')
  rows.forEach((rowValue, index) => {
    const path = `$.diagnostics.hourlyResiduals[${index}]`
    const row = object(rowValue, path)
    exactKeys(row, ['hour', 'meanResidual'], path)
    exact(row.hour, index, `${path}.hour`)
    finite(row.meanResidual, `${path}.meanResidual`)
  })
}

function validatePredictionBins(value: unknown): void {
  const bins = array(value, '$.diagnostics.predictionBins')
  if (bins.length !== 4) fail('$.diagnostics.predictionBins', 'expected 4 entries')
  let rowCount = 0
  bins.forEach((binValue, index) => {
    const path = `$.diagnostics.predictionBins[${index}]`
    const bin = object(binValue, path)
    exactKeys(
      bin,
      [
        'bin',
        'lowerPrediction',
        'mae',
        'residualStdDev',
        'rows',
        'upperPrediction',
      ],
      path,
    )
    exact(bin.bin, index + 1, `${path}.bin`)
    const rows = integer(bin.rows, `${path}.rows`)
    if (rows !== 869) fail(`${path}.rows`, 'expected 869 held-out rows')
    rowCount += rows
    finite(bin.lowerPrediction, `${path}.lowerPrediction`)
    finite(bin.upperPrediction, `${path}.upperPrediction`)
    finite(bin.mae, `${path}.mae`)
    finite(bin.residualStdDev, `${path}.residualStdDev`)
  })
  if (rowCount !== 3_476) {
    fail('$.diagnostics.predictionBins', 'row total must equal testRows 3476')
  }
}

function validateCollinearityModel(
  value: unknown,
  path: string,
  kind: 'ols' | 'ridge' | 'lasso',
): void {
  const model = object(value, path)
  const expectedKeys =
    kind === 'ols'
      ? [
          'atempCoefficient',
          'baseTestMse',
          'intercept',
          'objective',
          'perturbationL2',
          'tempCoefficient',
          'testMetrics',
          'weights',
        ]
      : kind === 'ridge'
        ? ['alpha', 'intercept', 'objective', 'perturbationL2', 'testMetrics', 'weights']
        : [
            'alpha',
            'intercept',
            'objective',
            'sameObjectiveAsOls',
            'testMetrics',
            'weights',
          ]
  exactKeys(model, expectedKeys, path)
  exact(
    model.objective,
    kind === 'ols' ? 'mse' : kind === 'ridge' ? 'mse-plus-l2' : 'mse-plus-l1',
    `${path}.objective`,
  )
  finite(model.intercept, `${path}.intercept`)
  finiteArray(model.weights, 6, `${path}.weights`)
  metricSet(model.testMetrics, `${path}.testMetrics`)
  if (kind === 'ols') {
    for (const key of [
      'atempCoefficient',
      'baseTestMse',
      'perturbationL2',
      'tempCoefficient',
    ]) {
      finite(model[key], `${path}.${key}`)
    }
  } else {
    finite(model.alpha, `${path}.alpha`)
    if (kind === 'ridge') {
      finite(model.perturbationL2, `${path}.perturbationL2`)
    } else {
      exact(model.sameObjectiveAsOls, false, `${path}.sameObjectiveAsOls`)
    }
  }
}

function validateCollinearity(value: unknown): void {
  const path = '$.diagnostics.collinearity'
  const collinearity = object(value, path)
  exactKeys(
    collinearity,
    [
      'addedFeature',
      'conditionNumber',
      'featureOrder',
      'lasso',
      'ols',
      'perturbation',
      'ridge',
      'tempAtempTrainingCorrelation',
      'unchangedContract',
    ],
    path,
  )
  exact(collinearity.addedFeature, 'atemp', `${path}.addedFeature`)
  exactArray(
    collinearity.featureOrder,
    ['temp', 'atemp', 'hum', 'windspeed', 'workingday', 'hr'],
    `${path}.featureOrder`,
  )
  exactArray(
    collinearity.unchangedContract,
    ['rows', 'split', 'target', 'base-features', 'preprocessing'],
    `${path}.unchangedContract`,
  )
  finite(collinearity.conditionNumber, `${path}.conditionNumber`)
  finite(
    collinearity.tempAtempTrainingCorrelation,
    `${path}.tempAtempTrainingCorrelation`,
  )
  validateCollinearityModel(collinearity.ols, `${path}.ols`, 'ols')
  validateCollinearityModel(collinearity.ridge, `${path}.ridge`, 'ridge')
  validateCollinearityModel(collinearity.lasso, `${path}.lasso`, 'lasso')

  const perturbation = object(collinearity.perturbation, `${path}.perturbation`)
  exactKeys(perturbation, ['formula', 'version'], `${path}.perturbation`)
  exact(
    perturbation.version,
    'alternating-day-plus-linear-v1',
    `${path}.perturbation.version`,
  )
  nonEmptyString(perturbation.formula, `${path}.perturbation.formula`)
}

function validateLog1p(value: unknown): void {
  const path = '$.diagnostics.log1p'
  const comparison = object(value, path)
  exactKeys(
    comparison,
    [
      'coefficientScale',
      'intercept',
      'inverseTransform',
      'inverseTransformedCountMetrics',
      'logSpaceMetrics',
      'rawTargetObjectiveComparable',
      'targetTransform',
      'weights',
    ],
    path,
  )
  exact(comparison.coefficientScale, 'log1p-rental-count', `${path}.coefficientScale`)
  exact(comparison.inverseTransform, 'expm1', `${path}.inverseTransform`)
  exact(comparison.rawTargetObjectiveComparable, false, `${path}.rawTargetObjectiveComparable`)
  exact(comparison.targetTransform, 'log1p', `${path}.targetTransform`)
  finite(comparison.intercept, `${path}.intercept`)
  finiteArray(comparison.weights, 5, `${path}.weights`)
  metricSet(comparison.inverseTransformedCountMetrics, `${path}.inverseTransformedCountMetrics`)
  metricSet(comparison.logSpaceMetrics, `${path}.logSpaceMetrics`)
}

function validateDiagnostics(value: unknown): void {
  const diagnostics = object(value, '$.diagnostics')
  exactKeys(
    diagnostics,
    [
      'collinearity',
      'hourlyResiduals',
      'log1p',
      'namedCases',
      'predictionBins',
      'residualSign',
      'stagedOrder',
    ],
    '$.diagnostics',
  )
  exact(diagnostics.residualSign, 'prediction - actual', '$.diagnostics.residualSign')
  exactArray(diagnostics.stagedOrder, STAGED_ORDER, '$.diagnostics.stagedOrder')
  validateHourlyResiduals(diagnostics.hourlyResiduals)
  validatePredictionBins(diagnostics.predictionBins)
  validateNamedCases(diagnostics.namedCases)
  validateCollinearity(diagnostics.collinearity)
  validateLog1p(diagnostics.log1p)
}

function frozenCopy(value: unknown): unknown {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry) => frozenCopy(entry)))
  }
  if (typeof value === 'object' && value !== null) {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [key, frozenCopy(entry)]),
      ),
    )
  }
  return value
}

export function parseLinearRegressionSummary(
  value: unknown,
): LinearRegressionLockedSummary {
  finiteTree(value)
  const output = object(value, '$')
  exactKeys(
    output,
    [
      'coefficients',
      'contractVersion',
      'diagnostics',
      'features',
      'methods',
      'metrics',
      'optimization',
      'preprocessing',
      'representativeTrainingRow',
      'selectionRuleVersion',
      'source',
      'split',
    ],
    '$',
  )
  exact(output.contractVersion, SUMMARY_CONTRACT, '$.contractVersion')
  exact(
    output.selectionRuleVersion,
    'bike-linear-regression-teaching-rows-v1',
    '$.selectionRuleVersion',
  )
  validateSummarySource(output.source)
  validateFeatures(output.features)
  validateSummarySplit(output.split)
  validatePreprocessing(output.preprocessing)
  validateCoefficients(output.coefficients)
  validateMethods(output.methods)

  const metrics = object(output.metrics, '$.metrics')
  exactKeys(metrics, ['test', 'train'], '$.metrics')
  metricSet(metrics.train, '$.metrics.train')
  metricSet(metrics.test, '$.metrics.test')

  validateOptimization(output.optimization)
  validateRepresentativeRow(output.representativeTrainingRow)
  validateDiagnostics(output.diagnostics)

  return frozenCopy(output) as unknown as LinearRegressionLockedSummary
}

const EXPECTED_MANIFEST_INVENTORY = [
  {
    bytes: 160_533,
    path: 'notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb',
    role: 'executed-notebook',
    sha256: '852368fb5ffa67748db4bcff1267dad8c0361fcbafc32945f10066057a9d024a',
  },
  {
    bytes: 160_687,
    path: 'notebooks/linear-regression/bike-linear-regression.en.ipynb',
    role: 'executed-notebook',
    sha256: '4ae8c98201f8d921dfb2b48b3f49e852fa1452e439818b573176547355d5616c',
  },
  {
    bytes: 14_653,
    path: 'notebooks/linear-regression/linear-regression-summary.json',
    role: 'locked-summary',
    sha256: 'd37e97507f58901b57db68f36bfd0c88e70ce86fbe2e57e14a1d41c95960e0aa',
  },
  {
    bytes: 123_442,
    path: 'notebooks/linear-regression/gradient-descent-trace.csv',
    role: 'complete-gradient-trace',
    sha256: '6085708a783132c94e290d7062ecebcaa783914d7456a2d462243acb60c9f300',
  },
  {
    bytes: 1_381,
    path: 'notebooks/linear-regression/coefficients.csv',
    role: 'complete-coefficient-table',
    sha256: '8d6bac211861ae4129e2425e981b9cf9007665f084be3d4486fddb687072f7fd',
  },
  {
    bytes: 234_990,
    path: 'notebooks/linear-regression/heldout-residuals.csv',
    role: 'complete-heldout-residuals',
    sha256: 'a44b5d32f83cd36d814921f1a5ef28fc5623d80800e83fc022a7692e06463932',
  },
  {
    bytes: 130,
    path: 'notebooks/linear-regression/requirements.txt',
    role: 'requirements',
    sha256: '6aa97ceaa992923a5543e778113fb12bb87144f1e082d9a38457a5f55c1c1530',
  },
  {
    bytes: 1_368,
    path: 'notebooks/linear-regression/environment.json',
    role: 'environment',
    sha256: '73ff1158e9fdf34ca4a1fadc43ce18592f280d3a0024c68d186113a1696565d2',
  },
] as const

const EXPECTED_TEACHING_ROWS = [
  {
    instant: 11_550,
    partition: 'train',
    role: 'representative-training-row',
    rule: 'inclusive training cnt IQR, minimum absolute base-OLS residual, lowest instant tie-break',
  },
  {
    instant: 17_213,
    partition: 'held-out',
    role: 'negative-prediction',
    rule: 'minimum raw-count prediction, lowest instant tie-break',
  },
  {
    instant: 15_628,
    partition: 'held-out',
    role: 'morning-peak-underprediction',
    rule: 'hr 7-9, maximum positive actual - prediction, lowest instant tie-break',
  },
  {
    instant: 14_965,
    partition: 'held-out',
    role: 'evening-peak-underprediction',
    rule: 'hr 16-19, maximum positive actual - prediction, lowest instant tie-break',
  },
  {
    instant: 15_604,
    partition: 'held-out',
    role: 'large-residual',
    rule: 'exclude prior named rows, maximum absolute residual, lowest instant tie-break',
  },
] as const

function validateManifestFeatures(value: unknown): void {
  const features = object(value, '$.contract.features')
  exactKeys(
    features,
    ['binaryUnscaled', 'collinearityOnly', 'continuous', 'leakageExcluded', 'order'],
    '$.contract.features',
  )
  exactArray(features.order, FEATURE_ORDER, '$.contract.features.order')
  exactArray(features.continuous, CONTINUOUS_FEATURES, '$.contract.features.continuous')
  exactArray(features.binaryUnscaled, ['workingday'], '$.contract.features.binaryUnscaled')
  exactArray(features.collinearityOnly, ['atemp'], '$.contract.features.collinearityOnly')
  exactArray(
    features.leakageExcluded,
    ['casual', 'registered'],
    '$.contract.features.leakageExcluded',
  )
}

function validateManifestSplit(value: unknown): void {
  const split = object(value, '$.contract.split')
  exactKeys(
    split,
    ['index', 'kind', 'testRows', 'testStartInstant', 'trainEndInstant', 'trainRows'],
    '$.contract.split',
  )
  exact(split.index, 13_903, '$.contract.split.index')
  exact(split.kind, 'chronological-first-80-percent', '$.contract.split.kind')
  exact(split.trainRows, 13_903, '$.contract.split.trainRows')
  exact(split.testRows, 3_476, '$.contract.split.testRows')
  exact(split.trainEndInstant, 13_903, '$.contract.split.trainEndInstant')
  exact(split.testStartInstant, 13_904, '$.contract.split.testStartInstant')
}

function validateManifestContract(value: unknown): void {
  const contract = object(value, '$.contract')
  exactKeys(
    contract,
    [
      'features',
      'methodTolerance',
      'normalEquation',
      'residualSign',
      'scalerFit',
      'split',
    ],
    '$.contract',
  )
  exact(contract.methodTolerance, METHOD_TOLERANCE, '$.contract.methodTolerance')
  exact(contract.residualSign, 'prediction - actual', '$.contract.residualSign')
  exact(contract.scalerFit, 'train-only', '$.contract.scalerFit')
  validateManifestFeatures(contract.features)
  validateManifestSplit(contract.split)

  const normal = object(contract.normalEquation, '$.contract.normalEquation')
  exactKeys(
    normal,
    [
      'augmentedDesign',
      'explicitInverseUsed',
      'formula',
      'implementation',
      'interceptMapping',
      'term',
      'weightMapping',
    ],
    '$.contract.normalEquation',
  )
  exact(normal.augmentedDesign, 'X_tilde = [1, X]', '$.contract.normalEquation.augmentedDesign')
  exact(normal.explicitInverseUsed, false, '$.contract.normalEquation.explicitInverseUsed')
  exact(
    normal.formula,
    'theta = (X_tilde^T X_tilde)^+ X_tilde^T y',
    '$.contract.normalEquation.formula',
  )
  exact(normal.implementation, 'numpy.linalg.lstsq', '$.contract.normalEquation.implementation')
  exact(normal.interceptMapping, 'theta[0] = b', '$.contract.normalEquation.interceptMapping')
  exact(normal.weightMapping, 'theta[1:] = w', '$.contract.normalEquation.weightMapping')
  const term = object(normal.term, '$.contract.normalEquation.term')
  exactKeys(term, ['en', 'zh-CN'], '$.contract.normalEquation.term')
  exact(term.en, 'normal equation', '$.contract.normalEquation.term.en')
  exact(term['zh-CN'], '正规方程', '$.contract.normalEquation.term.zh-CN')
}

function validateManifestInventory(value: unknown): void {
  const inventory = array(value, '$.inventory')
  if (inventory.length !== 9) fail('$.inventory', 'expected exact nine-member inventory')
  EXPECTED_MANIFEST_INVENTORY.forEach((expected, index) => {
    const path = `$.inventory[${index}]`
    const entry = object(inventory[index], path)
    exactKeys(entry, ['bytes', 'path', 'role', 'sha256'], path)
    exact(entry.path, expected.path, `${path}.path`)
    exact(entry.role, expected.role, `${path}.role`)
    exact(entry.bytes, expected.bytes, `${path}.bytes`)
    exact(entry.sha256, expected.sha256, `${path}.sha256`)
  })
  const selfPath = '$.inventory[8]'
  const self = object(inventory[8], selfPath)
  exactKeys(
    self,
    ['bytes', 'path', 'role', 'selfHashExcluded', 'sha256'],
    selfPath,
  )
  exact(
    self.path,
    'notebooks/linear-regression/output-manifest.json',
    `${selfPath}.path`,
  )
  exact(self.role, 'candidate-manifest', `${selfPath}.role`)
  exact(self.bytes, null, `${selfPath}.bytes`)
  exact(self.sha256, null, `${selfPath}.sha256`)
  exact(self.selfHashExcluded, true, `${selfPath}.selfHashExcluded`)
}

function validateExecutionProofs(value: unknown): void {
  const proofs = array(value, '$.executionProofs')
  if (proofs.length !== 2) fail('$.executionProofs', 'expected two locale proofs')
  const locales = ['zh-CN', 'en'] as const
  const notebookHashes = [
    '852368fb5ffa67748db4bcff1267dad8c0361fcbafc32945f10066057a9d024a',
    '4ae8c98201f8d921dfb2b48b3f49e852fa1452e439818b573176547355d5616c',
  ] as const
  proofs.forEach((proofValue, index) => {
    const path = `$.executionProofs[${index}]`
    const proof = object(proofValue, path)
    exactKeys(
      proof,
      [
        'allowErrors',
        'codeSha256',
        'executionCountStartsAt',
        'freshKernel',
        'kernelNamePublished',
        'locale',
        'normalizedOutputSha256',
        'notebookPath',
        'notebookSha256',
        'proofId',
        'recordTiming',
        'stripWidgetState',
        'timeoutSeconds',
        'workingDirectory',
      ],
      path,
    )
    exact(proof.locale, locales[index], `${path}.locale`)
    exact(
      proof.codeSha256,
      '23e6735a4153a459606c0e7a7e83699b8611908f600890c2d0790fcfdbcf2349',
      `${path}.codeSha256`,
    )
    exact(
      proof.normalizedOutputSha256,
      'ed1547c13fe5d70cc760ee85c6f3269d4a312fa24b543659916be7f313ad6480',
      `${path}.normalizedOutputSha256`,
    )
    exact(proof.notebookSha256, notebookHashes[index], `${path}.notebookSha256`)
    exact(
      proof.notebookPath,
      `notebooks/linear-regression/bike-linear-regression.${locales[index]}.ipynb`,
      `${path}.notebookPath`,
    )
    exact(
      proof.proofId,
      `clean-kernel-bike-linear-regression-${locales[index]}`,
      `${path}.proofId`,
    )
    exact(proof.freshKernel, true, `${path}.freshKernel`)
    exact(proof.allowErrors, false, `${path}.allowErrors`)
    exact(proof.executionCountStartsAt, 1, `${path}.executionCountStartsAt`)
    exact(proof.kernelNamePublished, false, `${path}.kernelNamePublished`)
    exact(proof.recordTiming, false, `${path}.recordTiming`)
    exact(proof.stripWidgetState, true, `${path}.stripWidgetState`)
    exact(proof.timeoutSeconds, 180, `${path}.timeoutSeconds`)
    exact(proof.workingDirectory, 'notebooks/linear-regression', `${path}.workingDirectory`)
  })
}

function validateTeachingRows(value: unknown): void {
  const rows = array(value, '$.teachingRows')
  if (rows.length !== EXPECTED_TEACHING_ROWS.length) {
    fail('$.teachingRows', `expected ${EXPECTED_TEACHING_ROWS.length} entries`)
  }
  rows.forEach((rowValue, index) => {
    const path = `$.teachingRows[${index}]`
    const row = object(rowValue, path)
    exactKeys(row, ['instant', 'partition', 'role', 'rule'], path)
    const expected = EXPECTED_TEACHING_ROWS[index]
    exact(row.instant, expected?.instant, `${path}.instant`)
    exact(row.partition, expected?.partition, `${path}.partition`)
    exact(row.role, expected?.role, `${path}.role`)
    exact(row.rule, expected?.rule, `${path}.rule`)
  })
}

export function validateLinearRegressionManifestContract(
  value: unknown,
): LinearRegressionManifestContract {
  finiteTree(value)
  const manifest = object(value, '$')
  exactKeys(
    manifest,
    [
      'canonicalPayloadSha256',
      'contract',
      'contractVersion',
      'environment',
      'executionProofs',
      'generator',
      'inventory',
      'localeParity',
      'packageComplete',
      'publicationAllowed',
      'requirements',
      'rerun',
      'resolvedInstants',
      'selectionRuleVersion',
      'source',
      'teachingRows',
    ],
    '$',
  )
  exact(manifest.contractVersion, MANIFEST_CONTRACT, '$.contractVersion')
  exact(manifest.packageComplete, true, '$.packageComplete')
  exact(manifest.publicationAllowed, false, '$.publicationAllowed')
  exact(
    manifest.canonicalPayloadSha256,
    '7d1f238681839ac3494166fed55b85c538320098490a9c84d79ce37d85911272',
    '$.canonicalPayloadSha256',
  )
  exactArray(manifest.requirements, ['LINR-02', 'LINR-03', 'LINR-04'], '$.requirements')
  exact(
    manifest.selectionRuleVersion,
    'bike-linear-regression-teaching-rows-v1',
    '$.selectionRuleVersion',
  )
  exactArray(
    manifest.resolvedInstants,
    [11_550, 17_213, 15_628, 14_965, 15_604],
    '$.resolvedInstants',
  )

  const source = object(manifest.source, '$.source')
  exactKeys(source, ['path', 'rows', 'sha256'], '$.source')
  exact(source.path, 'datasets/python-data-tools/bike-sharing-hour.csv', '$.source.path')
  exact(source.rows, 17_379, '$.source.rows')
  exact(source.sha256, SOURCE_SHA256, '$.source.sha256')

  validateManifestContract(manifest.contract)
  validateManifestInventory(manifest.inventory)
  validateExecutionProofs(manifest.executionProofs)
  validateTeachingRows(manifest.teachingRows)

  const environmentRecord = object(manifest.environment, '$.environment')
  exactKeys(environmentRecord, ['path', 'requirementsSha256', 'sha256'], '$.environment')
  exact(
    environmentRecord.path,
    'notebooks/linear-regression/environment.json',
    '$.environment.path',
  )
  exact(
    environmentRecord.requirementsSha256,
    '6aa97ceaa992923a5543e778113fb12bb87144f1e082d9a38457a5f55c1c1530',
    '$.environment.requirementsSha256',
  )
  exact(
    environmentRecord.sha256,
    '73ff1158e9fdf34ca4a1fadc43ce18592f280d3a0024c68d186113a1696565d2',
    '$.environment.sha256',
  )

  const generator = object(manifest.generator, '$.generator')
  exactKeys(generator, ['path', 'sha256'], '$.generator')
  exact(
    generator.path,
    'scripts/linear-regression/build-phase-27-assets.py',
    '$.generator.path',
  )
  exact(
    generator.sha256,
    'c7220cb2c10bc73cfe1ec68de023e0f64e873c44218dc1692e31ffbd8b0e5047',
    '$.generator.sha256',
  )

  const parity = object(manifest.localeParity, '$.localeParity')
  exactKeys(
    parity,
    ['codeCellIds', 'codeSha256', 'locales', 'normalizedOutputSha256'],
    '$.localeParity',
  )
  exactArray(
    parity.codeCellIds,
    [
      'imports-and-contract',
      'load-local-source',
      'split-and-scale',
      'batch-gradient-descent',
      'three-method-fit',
      'diagnostics-and-teaching-rows',
      'assertions-and-complete-outputs',
    ],
    '$.localeParity.codeCellIds',
  )
  exactArray(parity.locales, ['zh-CN', 'en'], '$.localeParity.locales')
  exact(
    parity.codeSha256,
    '23e6735a4153a459606c0e7a7e83699b8611908f600890c2d0790fcfdbcf2349',
    '$.localeParity.codeSha256',
  )
  exact(
    parity.normalizedOutputSha256,
    'ed1547c13fe5d70cc760ee85c6f3269d4a312fa24b543659916be7f313ad6480',
    '$.localeParity.normalizedOutputSha256',
  )

  const rerun = object(manifest.rerun, '$.rerun')
  exactKeys(
    rerun,
    [
      'allowErrors',
      'command',
      'freshKernelEach',
      'normalizedOutputsMustMatch',
      'offline',
    ],
    '$.rerun',
  )
  exact(rerun.allowErrors, false, '$.rerun.allowErrors')
  exact(rerun.freshKernelEach, true, '$.rerun.freshKernelEach')
  exact(rerun.normalizedOutputsMustMatch, true, '$.rerun.normalizedOutputsMustMatch')
  exact(rerun.offline, true, '$.rerun.offline')
  exact(
    rerun.command,
    'python3 scripts/linear-regression/build-phase-27-assets.py --prepare-candidates --staging-root .cache/linear-regression/phase-27-staging --offline',
    '$.rerun.command',
  )

  return frozenCopy(manifest) as unknown as LinearRegressionManifestContract
}

function csvLines(value: unknown, path: string): string[] {
  if (typeof value !== 'string') fail(path, 'expected CSV text')
  const normalized = value.replace(/\r\n/g, '\n')
  if (!normalized.endsWith('\n')) fail(path, 'expected a final newline')
  const lines = normalized.slice(0, -1).split('\n')
  if (lines.length === 0 || lines.some((line) => line.length === 0)) {
    fail(path, 'expected non-empty CSV rows')
  }
  return lines
}

function csvCells(line: string, count: number, path: string): string[] {
  const cells = line.split(',')
  if (cells.length !== count) fail(path, `expected ${count} columns`)
  return cells
}

function csvNumber(value: string | undefined, path: string): number {
  if (value === undefined || value.trim().length === 0) {
    fail(path, 'expected a finite number')
  }
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) fail(path, 'expected a finite number')
  return parsed
}

function csvInteger(value: string | undefined, path: string): number {
  const parsed = csvNumber(value, path)
  if (!Number.isInteger(parsed)) fail(path, 'expected an integer')
  return parsed
}

function parseGradientTrace(value: unknown): readonly LinearRegressionGradientTraceRow[] {
  const lines = csvLines(value, '$.gradientDescentTrace')
  exact(
    lines[0],
    'update,mse,gradient_norm,intercept,temp,hum,windspeed,workingday,hr',
    '$.gradientDescentTrace.header',
  )
  const rows = lines.slice(1)
  if (rows.length !== 773) {
    fail('$.gradientDescentTrace.rows', 'expected 773 rows')
  }
  const parsed = rows.map((line, index) => {
    const path = `$.gradientDescentTrace.rows[${index}]`
    const cells = csvCells(line, 9, path)
    const update = csvInteger(cells[0], `${path}.update`)
    if (update !== index) fail(`${path}.update`, `expected ${index}`)
    return {
      update,
      mse: csvNumber(cells[1], `${path}.mse`),
      gradientNorm: csvNumber(cells[2], `${path}.gradientNorm`),
      intercept: csvNumber(cells[3], `${path}.intercept`),
      weights: [
        csvNumber(cells[4], `${path}.temp`),
        csvNumber(cells[5], `${path}.hum`),
        csvNumber(cells[6], `${path}.windspeed`),
        csvNumber(cells[7], `${path}.workingday`),
        csvNumber(cells[8], `${path}.hr`),
      ] as const,
    }
  })
  if ((parsed.at(-1)?.gradientNorm ?? Number.POSITIVE_INFINITY) > 1e-8) {
    fail('$.gradientDescentTrace.rows[772].gradientNorm', 'must satisfy tolerance 1e-8')
  }
  return frozenCopy(parsed) as readonly LinearRegressionGradientTraceRow[]
}

const COEFFICIENT_FEATURES = [
  'intercept',
  'temp',
  'hum',
  'windspeed',
  'workingday',
  'hr',
] as const

const COEFFICIENT_ROW_ORDER = [
  ...COEFFICIENT_FEATURES.map((feature) => [
    'numpy-batch-gradient-descent',
    'model',
    feature,
  ] as const),
  ...COEFFICIENT_FEATURES.map((feature) => [
    'numpy-lstsq',
    'model',
    feature,
  ] as const),
  ...COEFFICIENT_FEATURES.map((feature) => [
    'sklearn-linear-regression',
    'model',
    feature,
  ] as const),
  ...COEFFICIENT_FEATURES.map((feature) => [
    'numpy-lstsq',
    'original-dataset-unit',
    feature,
  ] as const),
] as const

function parseCoefficientTable(value: unknown): readonly LinearRegressionCoefficientRow[] {
  const lines = csvLines(value, '$.coefficients')
  exact(
    lines[0],
    'method,space,feature,coefficient',
    '$.coefficients.header',
  )
  const rows = lines.slice(1)
  if (rows.length !== 24) fail('$.coefficients.rows', 'expected 24 rows')
  const parsed = rows.map((line, index) => {
    const path = `$.coefficients.rows[${index}]`
    const cells = csvCells(line, 4, path)
    const expected = COEFFICIENT_ROW_ORDER[index]
    exact(cells[0], expected?.[0], `${path}.method`)
    exact(cells[1], expected?.[1], `${path}.space`)
    exact(cells[2], expected?.[2], `${path}.feature`)
    return {
      method: cells[0] as LinearRegressionCoefficientRow['method'],
      space: cells[1] as LinearRegressionCoefficientRow['space'],
      feature: cells[2] as LinearRegressionCoefficientRow['feature'],
      coefficient: csvNumber(cells[3], `${path}.coefficient`),
    }
  })
  return frozenCopy(parsed) as readonly LinearRegressionCoefficientRow[]
}

function parseHeldoutResiduals(value: unknown): readonly LinearRegressionResidualRow[] {
  const lines = csvLines(value, '$.heldoutResiduals')
  exact(
    lines[0],
    'instant,timestamp,hr,actual,prediction,residual',
    '$.heldoutResiduals.header',
  )
  const rows = lines.slice(1)
  if (rows.length !== 3_476) {
    fail('$.heldoutResiduals.rows', 'expected 3476 rows')
  }
  const parsed = rows.map((line, index) => {
    const path = `$.heldoutResiduals.rows[${index}]`
    const cells = csvCells(line, 6, path)
    const instant = csvInteger(cells[0], `${path}.instant`)
    if (instant !== 13_904 + index) {
      fail(`${path}.instant`, `expected ${13_904 + index}`)
    }
    const timestamp = nonEmptyString(cells[1], `${path}.timestamp`)
    const hour = csvInteger(cells[2], `${path}.hour`)
    if (hour < 0 || hour > 23) fail(`${path}.hour`, 'expected hour 0-23')
    const actual = csvNumber(cells[3], `${path}.actual`)
    const prediction = csvNumber(cells[4], `${path}.prediction`)
    const residual = csvNumber(cells[5], `${path}.residual`)
    if (Math.abs(residual - (prediction - actual)) > 1e-9) {
      fail(`${path}.residual`, 'must equal prediction - actual')
    }
    return { instant, timestamp, hour, actual, prediction, residual }
  })
  return frozenCopy(parsed) as readonly LinearRegressionResidualRow[]
}

export function parseLinearRegressionOutput(
  outputId: 'linear-regression-summary',
  value: unknown,
): LinearRegressionLockedSummary
export function parseLinearRegressionOutput(
  outputId: 'linear-regression-output-manifest',
  value: unknown,
): LinearRegressionManifestContract
export function parseLinearRegressionOutput(
  outputId: 'linear-regression-gradient-descent-trace',
  value: unknown,
): readonly LinearRegressionGradientTraceRow[]
export function parseLinearRegressionOutput(
  outputId: 'linear-regression-coefficients',
  value: unknown,
): readonly LinearRegressionCoefficientRow[]
export function parseLinearRegressionOutput(
  outputId: 'linear-regression-heldout-residuals',
  value: unknown,
): readonly LinearRegressionResidualRow[]
export function parseLinearRegressionOutput(
  outputId: string,
  value: unknown,
):
  | LinearRegressionLockedSummary
  | LinearRegressionManifestContract
  | readonly LinearRegressionGradientTraceRow[]
  | readonly LinearRegressionCoefficientRow[]
  | readonly LinearRegressionResidualRow[]
export function parseLinearRegressionOutput(
  outputId: string,
  value: unknown,
):
  | LinearRegressionLockedSummary
  | LinearRegressionManifestContract
  | readonly LinearRegressionGradientTraceRow[]
  | readonly LinearRegressionCoefficientRow[]
  | readonly LinearRegressionResidualRow[] {
  switch (outputId) {
    case 'linear-regression-summary':
      return parseLinearRegressionSummary(value)
    case 'linear-regression-output-manifest':
      return validateLinearRegressionManifestContract(value)
    case 'linear-regression-gradient-descent-trace':
      return parseGradientTrace(value)
    case 'linear-regression-coefficients':
      return parseCoefficientTable(value)
    case 'linear-regression-heldout-residuals':
      return parseHeldoutResiduals(value)
    default:
      throw new TypeError(`Unknown linear-regression output id: ${outputId}`)
  }
}
