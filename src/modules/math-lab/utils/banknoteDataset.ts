import { withPublicBase } from '../../../utils/publicPath.ts'

export const BANKNOTE_CONTRACT_VERSION = 'numerical-methods-batch-4-v1' as const
export const BANKNOTE_DATASET_PUBLIC_PATH = '/datasets/numerical-methods/banknote-authentication.csv' as const
export const BANKNOTE_FEATURES = ['variance', 'skewness', 'curtosis', 'entropy'] as const
export const BANKNOTE_DATASET_COLUMNS = [
  'banknote_id',
  ...BANKNOTE_FEATURES,
  'class',
  'split',
] as const

export type BanknoteFeature = typeof BANKNOTE_FEATURES[number]
export type BanknoteSplit = 'train' | 'validation' | 'test'
export type BanknoteTarget = 0 | 1

export interface BanknoteRow {
  banknoteId: number
  variance: number
  skewness: number
  curtosis: number
  entropy: number
  target: BanknoteTarget
  split: BanknoteSplit
}

export interface BanknotePreprocessing {
  fitSplit: 'train'
  ddof: 0
  features: typeof BANKNOTE_FEATURES
  means: Record<BanknoteFeature, number>
  scales: Record<BanknoteFeature, number>
}

export interface BanknoteDataset {
  contractVersion: typeof BANKNOTE_CONTRACT_VERSION
  rows: readonly BanknoteRow[]
  preprocessing: BanknotePreprocessing
}

export type BanknoteDatasetErrorCode = 'parse-error' | 'schema-error'
export type BanknoteDatasetLoadErrorCode = 'aborted' | 'http-error' | BanknoteDatasetErrorCode

export type BanknoteDatasetLoadState =
  | { status: 'loading' }
  | { status: 'ready'; data: BanknoteDataset }
  | {
      status: 'error'
      code: BanknoteDatasetLoadErrorCode
      message: string
      line?: number
      column?: number
    }

export interface BanknoteDatasetLoadOptions {
  fetch?: typeof fetch
  baseUrl?: string
  signal?: AbortSignal
}

const EXPECTED_SPLIT_COUNTS: Record<BanknoteSplit, number> = {
  train: 960,
  validation: 206,
  test: 206,
}

const EXPECTED_SPLIT_CLASS_COUNTS: Record<BanknoteSplit, Record<BanknoteTarget, number>> = {
  train: { 0: 533, 1: 427 },
  validation: { 0: 115, 1: 91 },
  test: { 0: 114, 1: 92 },
}

const numericCellPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/

export class BanknoteDatasetError extends Error {
  readonly code: BanknoteDatasetErrorCode
  readonly line: number
  readonly column: number

  constructor(code: BanknoteDatasetErrorCode, line: number, column: number, detail: string) {
    super(`Banknote dataset ${code} at line ${line}, column ${column}: ${detail}`)
    this.name = 'BanknoteDatasetError'
    this.code = code
    this.line = line
    this.column = column
  }
}

function fail(
  code: BanknoteDatasetErrorCode,
  line: number,
  column: number,
  detail: string,
): never {
  throw new BanknoteDatasetError(code, line, column, detail)
}

function parseFiniteFeature(value: string, line: number, column: number, feature: BanknoteFeature): number {
  if (value.trim() !== value || !numericCellPattern.test(value)) {
    fail('schema-error', line, column, `${feature} must be a finite decimal number; received ${JSON.stringify(value)}`)
  }
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    fail('schema-error', line, column, `${feature} must be finite; received ${JSON.stringify(value)}`)
  }
  return numeric
}

function countSnapshot(rows: readonly BanknoteRow[]) {
  const splitCounts: Record<BanknoteSplit, number> = { train: 0, validation: 0, test: 0 }
  const splitClassCounts: Record<BanknoteSplit, Record<BanknoteTarget, number>> = {
    train: { 0: 0, 1: 0 },
    validation: { 0: 0, 1: 0 },
    test: { 0: 0, 1: 0 },
  }
  for (const row of rows) {
    splitCounts[row.split] += 1
    splitClassCounts[row.split][row.target] += 1
  }
  return { splitCounts, splitClassCounts }
}

function validateSnapshotCounts(rows: readonly BanknoteRow[], lastLine: number): void {
  if (rows.length !== 1372) {
    fail('schema-error', lastLine, 1, `expected 1372 data rows; received ${rows.length}`)
  }
  const { splitCounts, splitClassCounts } = countSnapshot(rows)
  for (const split of ['train', 'validation', 'test'] as const) {
    if (splitCounts[split] !== EXPECTED_SPLIT_COUNTS[split]) {
      fail(
        'schema-error',
        lastLine,
        7,
        `expected ${EXPECTED_SPLIT_COUNTS[split]} ${split} rows; received ${splitCounts[split]}`,
      )
    }
    for (const target of [0, 1] as const) {
      if (splitClassCounts[split][target] !== EXPECTED_SPLIT_CLASS_COUNTS[split][target]) {
        fail(
          'schema-error',
          lastLine,
          6,
          `expected ${EXPECTED_SPLIT_CLASS_COUNTS[split][target]} ${split} class ${target} rows; received ${splitClassCounts[split][target]}`,
        )
      }
    }
  }
}

export function parseBanknoteDataset(source: string): BanknoteRow[] {
  if (typeof source !== 'string') {
    throw new TypeError('Banknote dataset source must be a string')
  }
  const normalized = source.replace(/^\uFEFF/, '').replace(/(?:\r\n|\n|\r)+$/, '')
  if (!normalized) fail('parse-error', 1, 1, 'expected a header and 1372 data rows')

  const lines = normalized.split(/\r\n|\n|\r/)
  const header = lines[0]!.split(',')
  const headerWidth = Math.max(header.length, BANKNOTE_DATASET_COLUMNS.length)
  for (let index = 0; index < headerWidth; index += 1) {
    if (header[index] !== BANKNOTE_DATASET_COLUMNS[index]) {
      fail(
        'parse-error',
        1,
        index + 1,
        `expected ${JSON.stringify(BANKNOTE_DATASET_COLUMNS[index] ?? '<no column>')}; received ${JSON.stringify(header[index] ?? '<missing>')}`,
      )
    }
  }
  if (lines.length === 1) fail('parse-error', 2, 1, 'dataset has no data rows')

  const rows = lines.slice(1).map((line, index): BanknoteRow => {
    const lineNumber = index + 2
    const fields = line.split(',')
    if (fields.length !== BANKNOTE_DATASET_COLUMNS.length) {
      fail(
        'parse-error',
        lineNumber,
        Math.min(fields.length + 1, BANKNOTE_DATASET_COLUMNS.length),
        `expected ${BANKNOTE_DATASET_COLUMNS.length} columns; received ${fields.length}`,
      )
    }

    const banknoteIdText = fields[0]!
    const expectedId = index + 1
    if (!/^\d+$/.test(banknoteIdText) || Number(banknoteIdText) !== expectedId) {
      fail('schema-error', lineNumber, 1, `expected ordered unique banknote_id ${expectedId}; received ${JSON.stringify(banknoteIdText)}`)
    }

    const targetText = fields[5]!
    if (targetText !== '0' && targetText !== '1') {
      fail('schema-error', lineNumber, 6, `class must be 0 or 1; received ${JSON.stringify(targetText)}`)
    }
    const split = fields[6]
    if (split !== 'train' && split !== 'validation' && split !== 'test') {
      fail('schema-error', lineNumber, 7, `split must be train, validation, or test; received ${JSON.stringify(split)}`)
    }

    return {
      banknoteId: expectedId,
      variance: parseFiniteFeature(fields[1]!, lineNumber, 2, 'variance'),
      skewness: parseFiniteFeature(fields[2]!, lineNumber, 3, 'skewness'),
      curtosis: parseFiniteFeature(fields[3]!, lineNumber, 4, 'curtosis'),
      entropy: parseFiniteFeature(fields[4]!, lineNumber, 5, 'entropy'),
      target: Number(targetText) as BanknoteTarget,
      split,
    }
  })

  validateSnapshotCounts(rows, lines.length)
  return rows
}

export function computeBanknotePreprocessing(rows: readonly BanknoteRow[]): BanknotePreprocessing {
  if (!Array.isArray(rows)) throw new TypeError('Banknote rows must be an array')
  const trainingRows = rows.filter(({ split }) => split === 'train')
  if (trainingRows.length !== EXPECTED_SPLIT_COUNTS.train) {
    fail('schema-error', Math.max(1, rows.length + 1), 7, `expected 960 training rows; received ${trainingRows.length}`)
  }

  const means = {} as Record<BanknoteFeature, number>
  const scales = {} as Record<BanknoteFeature, number>
  for (const feature of BANKNOTE_FEATURES) {
    const values = trainingRows.map((row, index) => {
      const value = row[feature]
      if (!Number.isFinite(value)) {
        fail('schema-error', rows.indexOf(row) + 2 || index + 2, BANKNOTE_FEATURES.indexOf(feature) + 2, `${feature} must be finite`)
      }
      return value
    })
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
    const scale = Math.sqrt(variance)
    if (!Number.isFinite(mean) || !Number.isFinite(scale) || scale <= 0) {
      fail('schema-error', 1, BANKNOTE_FEATURES.indexOf(feature) + 2, `${feature} preprocessing is non-finite or has zero scale`)
    }
    means[feature] = mean
    scales[feature] = scale
  }

  return {
    fitSplit: 'train',
    ddof: 0,
    features: BANKNOTE_FEATURES,
    means,
    scales,
  }
}

function isAbort(error: unknown, signal?: AbortSignal): boolean {
  return signal?.aborted === true
    || (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError')
}

function errorState(
  code: BanknoteDatasetLoadErrorCode,
  message: string,
  location?: Pick<BanknoteDatasetError, 'line' | 'column'>,
): BanknoteDatasetLoadState {
  return { status: 'error', code, message, ...location }
}

export async function loadBanknoteDataset(
  options: BanknoteDatasetLoadOptions = {},
): Promise<BanknoteDatasetLoadState> {
  if (options.signal?.aborted) return errorState('aborted', 'Banknote dataset loading was cancelled.')
  const fetchImplementation = options.fetch ?? globalThis.fetch
  if (typeof fetchImplementation !== 'function') {
    return errorState('http-error', 'No fetch implementation is available for the local Banknote dataset.')
  }

  try {
    const response = await fetchImplementation(
      withPublicBase(BANKNOTE_DATASET_PUBLIC_PATH, options.baseUrl),
      { signal: options.signal },
    )
    if (!response.ok) {
      return errorState('http-error', `Banknote dataset request failed with HTTP ${response.status}.`)
    }
    const source = await response.text()
    try {
      const rows = parseBanknoteDataset(source)
      return {
        status: 'ready',
        data: {
          contractVersion: BANKNOTE_CONTRACT_VERSION,
          rows,
          preprocessing: computeBanknotePreprocessing(rows),
        },
      }
    } catch (error) {
      if (error instanceof BanknoteDatasetError) {
        return errorState(error.code, error.message, { line: error.line, column: error.column })
      }
      throw error
    }
  } catch (error) {
    return isAbort(error, options.signal)
      ? errorState('aborted', 'Banknote dataset loading was cancelled.')
      : errorState('http-error', 'The local Banknote dataset could not be loaded.')
  }
}
