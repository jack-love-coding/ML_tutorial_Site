import {
  pythonDataToolsContract,
  pythonDataToolsOutputIds,
  type PythonDataToolsChapterId,
  type PythonDataToolsOutputId,
} from '../data/pythonNotebookContract.ts'
import type { LocalizedCopy } from '../types/ml.ts'
import { withPublicBase } from './publicPath.ts'

const manifestPublicPath = '/notebooks/python-data-tools/outputs/manifest.json'
const contractVersion = 'python-data-tools-v1'

type OutputKind = 'json' | 'png' | 'plotly-json'
type JsonScalar = string | number | boolean | null

export type PythonDataToolsErrorCode =
  | 'aborted'
  | 'http-error'
  | 'invalid-json'
  | 'invalid-schema'
  | 'unknown-output'

export type PythonDataToolsLoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; code: PythonDataToolsErrorCode; message: LocalizedCopy }

interface ManifestFileReference {
  publicPath: string
  sha256: string
}

interface ManifestPathReference {
  path: string
  sha256: string
}

interface ManifestCellOutputsReference extends ManifestFileReference {
  assetCount: number
  bytes: number
  cellCount: number
}

interface PythonDataToolsManifestOutputBase {
  bytes: number
  cellId: string
  id: PythonDataToolsOutputId
  kind: OutputKind
  publicPath: string
  sha256: string
  sourceCellId: string
}

export interface PythonDataToolsManifestJsonOutput extends PythonDataToolsManifestOutputBase {
  kind: 'json' | 'plotly-json'
}

export interface PythonDataToolsManifestPngOutput extends PythonDataToolsManifestOutputBase {
  kind: 'png'
  alt: string
  dpi: number
  fontPublicPath: string
  height: number
  width: number
}

export type PythonDataToolsManifestOutput =
  | PythonDataToolsManifestJsonOutput
  | PythonDataToolsManifestPngOutput

export interface PythonDataToolsManifest {
  contractVersion: typeof contractVersion
  cellOutputs: ManifestCellOutputsReference
  dataset: ManifestFileReference
  environment: ManifestPathReference
  font: ManifestPathReference
  notebook: ManifestFileReference
  outputs: readonly PythonDataToolsManifestOutput[]
}

export interface PythonDataToolsCellTextOutput {
  kind: 'text'
  text: string
}

export interface PythonDataToolsCellSuccessOutput {
  kind: 'success'
}

interface PythonDataToolsCellAssetOutputBase {
  publicPath: string
  sha256: string
  bytes: number
  description: LocalizedCopy
}

export interface PythonDataToolsCellImageOutput extends PythonDataToolsCellAssetOutputBase {
  kind: 'image'
  width: number
  height: number
}

export interface PythonDataToolsCellPlotlyOutput extends PythonDataToolsCellAssetOutputBase {
  kind: 'plotly'
}

export type PythonDataToolsCellOutputItem =
  | PythonDataToolsCellSuccessOutput
  | PythonDataToolsCellTextOutput
  | PythonDataToolsCellImageOutput
  | PythonDataToolsCellPlotlyOutput

export interface PythonDataToolsCellOutputPreview {
  sourceCellId: `ch${number}-${string}`
  executionCount: number
  items: readonly PythonDataToolsCellOutputItem[]
}

export interface PythonDataToolsTeachingTable {
  id: string
  columns: readonly string[]
  rows: readonly (readonly JsonScalar[])[]
}

export interface PythonDataToolsTeachingKeyValue {
  key: string
  value: JsonScalar
}

export interface PythonDataToolsJsonOutputViewModel {
  id: PythonDataToolsOutputId
  kind: 'json'
  keyValues: readonly PythonDataToolsTeachingKeyValue[]
  tables: readonly PythonDataToolsTeachingTable[]
  raw: Readonly<Record<string, unknown>>
}

export interface PythonDataToolsPngOutputViewModel {
  id: PythonDataToolsOutputId
  kind: 'png'
  imageUrl: string
}

export interface PythonDataToolsPlotlyOutputViewModel {
  id: PythonDataToolsOutputId
  kind: 'plotly-json'
  figure: {
    data: readonly Record<string, unknown>[]
    layout: Readonly<Record<string, unknown>>
  }
  defaultFilterState: Readonly<Record<string, unknown>>
}

export type PythonDataToolsOutputViewModel =
  | PythonDataToolsJsonOutputViewModel
  | PythonDataToolsPngOutputViewModel
  | PythonDataToolsPlotlyOutputViewModel

export interface PythonDataToolsOutputRegistryEntry {
  id: PythonDataToolsOutputId
  kind: OutputKind
  chapterId: PythonDataToolsChapterId
  primaryOrder: number
  fallbackSourceIds: readonly PythonDataToolsOutputId[]
}

const pngFallbackSources = {
  'hourly-demand-profile': ['workingday-comparison'],
  'season-weather-distribution': ['final-analysis-evidence'],
  'rider-composition': ['final-analysis-evidence'],
} as const satisfies Partial<Record<PythonDataToolsOutputId, readonly PythonDataToolsOutputId[]>>

export const pythonDataToolsOutputRegistry = pythonDataToolsContract.outputs.map((output, primaryOrder) => ({
  id: output.id,
  kind: output.kind,
  chapterId: output.chapterId,
  primaryOrder,
  fallbackSourceIds: pngFallbackSources[output.id as keyof typeof pngFallbackSources] ?? [],
})) as readonly PythonDataToolsOutputRegistryEntry[]

interface LoaderOptions {
  fetch?: typeof fetch
  baseUrl?: string
  signal?: AbortSignal
}

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

const errorCopyByCode: Record<PythonDataToolsErrorCode, LocalizedCopy> = {
  aborted: copy('本次读取已取消。', 'This read was cancelled.'),
  'http-error': copy('这项运行结果暂时无法读取，请稍后再试。', 'This result is temporarily unavailable. Please try again later.'),
  'invalid-json': copy('这项运行结果暂时无法解析，其他课程内容仍可继续阅读。', 'This result cannot be read right now. The rest of the lesson remains available.'),
  'invalid-schema': copy('这项运行结果的结构与课程版本不一致，其他内容不受影响。', 'This result does not match the course version. Other content is unaffected.'),
  'unknown-output': copy('没有找到这项运行结果，其他内容不受影响。', 'This result was not found. Other content is unaffected.'),
}

const errorState = <T>(code: PythonDataToolsErrorCode): PythonDataToolsLoadState<T> => ({
  status: 'error',
  code,
  message: errorCopyByCode[code],
})

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

const isNonEmptyString = (value: unknown): value is string => (
  typeof value === 'string' && value.trim().length > 0
)

const isFiniteNumber = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value)
)

const isPositiveInteger = (value: unknown): value is number => (
  Number.isInteger(value) && Number(value) > 0
)

const isRootPublicPath = (value: unknown): value is string => (
  isNonEmptyString(value) && value.startsWith('/') && !value.startsWith('//')
)

const isSha256 = (value: unknown): value is string => (
  typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)
)

function hasOnlyFiniteJson(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every(hasOnlyFiniteJson)
  if (isRecord(value)) return Object.values(value).every(hasOnlyFiniteJson)
  return value === null || typeof value === 'string' || typeof value === 'boolean'
}

function parseFileReference(value: unknown): ManifestFileReference | undefined {
  if (!isRecord(value) || !isRootPublicPath(value.publicPath) || !isSha256(value.sha256)) return undefined
  return { publicPath: value.publicPath, sha256: value.sha256 }
}

function parsePathReference(value: unknown): ManifestPathReference | undefined {
  if (!isRecord(value) || !isRootPublicPath(value.path) || !isSha256(value.sha256)) return undefined
  return { path: value.path, sha256: value.sha256 }
}

function parseCellOutputsReference(value: unknown): ManifestCellOutputsReference | undefined {
  const reference = parseFileReference(value)
  if (
    !reference
    || !isRecord(value)
    || reference.publicPath !== '/notebooks/python-data-tools/outputs/cell-output-previews.json'
    || !isPositiveInteger(value.assetCount)
    || !isPositiveInteger(value.bytes)
    || !isPositiveInteger(value.cellCount)
  ) return undefined
  return {
    ...reference,
    assetCount: value.assetCount,
    bytes: value.bytes,
    cellCount: value.cellCount,
  }
}

function parseManifestOutput(
  value: unknown,
  expected: PythonDataToolsOutputRegistryEntry,
): PythonDataToolsManifestOutput | undefined {
  if (!isRecord(value)) return undefined
  if (
    value.id !== expected.id
    || value.kind !== expected.kind
    || value.cellId !== `output-${expected.id}`
    || !isNonEmptyString(value.sourceCellId)
    || !isRootPublicPath(value.publicPath)
    || !isSha256(value.sha256)
    || !isPositiveInteger(value.bytes)
  ) return undefined

  const base = {
    bytes: value.bytes,
    cellId: `output-${expected.id}`,
    id: expected.id,
    kind: expected.kind,
    publicPath: value.publicPath,
    sha256: value.sha256,
    sourceCellId: value.sourceCellId,
  }

  if (value.kind !== 'png') return base as PythonDataToolsManifestJsonOutput
  if (
    !isNonEmptyString(value.alt)
    || !isRootPublicPath(value.fontPublicPath)
    || !isPositiveInteger(value.width)
    || !isPositiveInteger(value.height)
    || !isPositiveInteger(value.dpi)
  ) return undefined

  return {
    ...base,
    kind: 'png',
    alt: value.alt,
    dpi: value.dpi,
    fontPublicPath: value.fontPublicPath,
    height: value.height,
    width: value.width,
  }
}

function parseManifest(value: unknown): PythonDataToolsManifest | undefined {
  if (!isRecord(value) || value.contractVersion !== contractVersion || !Array.isArray(value.outputs)) {
    return undefined
  }

  const dataset = parseFileReference(value.dataset)
  const cellOutputs = parseCellOutputsReference(value.cellOutputs)
  const environment = parsePathReference(value.environment)
  const font = parsePathReference(value.font)
  const notebook = parseFileReference(value.notebook)
  if (!cellOutputs || !dataset || !environment || !font || !notebook) return undefined
  if (value.outputs.length !== pythonDataToolsOutputRegistry.length) return undefined

  const outputs = value.outputs.map((entry, index) => (
    parseManifestOutput(entry, pythonDataToolsOutputRegistry[index]!)
  ))
  if (outputs.some((entry) => !entry)) return undefined
  if (new Set(outputs.map((entry) => entry!.id)).size !== pythonDataToolsOutputIds.length) return undefined

  return {
    contractVersion,
    cellOutputs,
    dataset,
    environment,
    font,
    notebook,
    outputs: outputs as PythonDataToolsManifestOutput[],
  }
}

function parseDescription(value: unknown): LocalizedCopy | undefined {
  if (!isRecord(value) || !isNonEmptyString(value['zh-CN']) || !isNonEmptyString(value.en)) return undefined
  return { 'zh-CN': value['zh-CN'], en: value.en }
}

function parseCellOutputItem(value: unknown): PythonDataToolsCellOutputItem | undefined {
  if (!isRecord(value)) return undefined
  if (value.kind === 'success') {
    return Object.keys(value).length === 1 ? { kind: 'success' } : undefined
  }
  if (value.kind === 'text') {
    return isNonEmptyString(value.text) ? { kind: 'text', text: value.text } : undefined
  }
  if (value.kind !== 'image' && value.kind !== 'plotly') return undefined
  const description = parseDescription(value.description)
  const expectedPath = value.kind === 'image'
    ? /^\/notebooks\/python-data-tools\/outputs\/cell-previews\/ch\d{2}-[a-z0-9-]+-\d+\.png$/
    : /^\/notebooks\/python-data-tools\/outputs\/cell-previews\/ch\d{2}-[a-z0-9-]+-\d+\.plotly\.json$/
  if (
    !description
    || !isRootPublicPath(value.publicPath)
    || !expectedPath.test(value.publicPath)
    || !isSha256(value.sha256)
    || !isPositiveInteger(value.bytes)
  ) return undefined
  const base = {
    publicPath: value.publicPath,
    sha256: value.sha256,
    bytes: value.bytes,
    description,
  }
  if (value.kind === 'plotly') return { kind: 'plotly', ...base }
  if (!isPositiveInteger(value.width) || !isPositiveInteger(value.height)) return undefined
  return { kind: 'image', ...base, width: value.width, height: value.height }
}

function parseCellOutputPreviews(
  value: unknown,
  manifest: PythonDataToolsManifest,
): readonly PythonDataToolsCellOutputPreview[] | undefined {
  if (
    !isRecord(value)
    || value.contractVersion !== contractVersion
    || value.notebookSha256 !== manifest.notebook.sha256
    || !Array.isArray(value.cells)
    || value.cells.length !== manifest.cellOutputs.cellCount
  ) return undefined

  const previews: PythonDataToolsCellOutputPreview[] = []
  const seen = new Set<string>()
  for (const candidate of value.cells) {
    if (
      !isRecord(candidate)
      || !isNonEmptyString(candidate.sourceCellId)
      || !/^ch\d{2}-[a-z0-9-]+$/.test(candidate.sourceCellId)
      || seen.has(candidate.sourceCellId)
      || !isPositiveInteger(candidate.executionCount)
      || !Array.isArray(candidate.items)
      || candidate.items.length === 0
    ) return undefined
    const items = candidate.items.map(parseCellOutputItem)
    if (items.some((item) => !item)) return undefined
    seen.add(candidate.sourceCellId)
    previews.push({
      sourceCellId: candidate.sourceCellId as `ch${number}-${string}`,
      executionCount: candidate.executionCount,
      items: items as PythonDataToolsCellOutputItem[],
    })
  }
  const assetCount = previews.flatMap(({ items }) => items)
    .filter((item) => item.kind === 'image' || item.kind === 'plotly')
    .length
  if (assetCount !== manifest.cellOutputs.assetCount) return undefined
  return previews
}

function resolveFetch(options: LoaderOptions) {
  return options.fetch ?? globalThis.fetch
}

function isAbort(error: unknown, signal?: AbortSignal) {
  return signal?.aborted || (error instanceof DOMException && error.name === 'AbortError')
}

export async function loadPythonDataToolsManifest(
  options: LoaderOptions = {},
): Promise<PythonDataToolsLoadState<PythonDataToolsManifest>> {
  if (options.signal?.aborted) return errorState('aborted')
  try {
    const response = await resolveFetch(options)(
      withPublicBase(manifestPublicPath, options.baseUrl),
      { signal: options.signal },
    )
    if (!response.ok) return errorState('http-error')

    let value: unknown
    try {
      value = await response.json()
    } catch {
      return errorState('invalid-json')
    }
    const manifest = parseManifest(value)
    return manifest ? { status: 'ready', data: manifest } : errorState('invalid-schema')
  } catch (error) {
    return errorState(isAbort(error, options.signal) ? 'aborted' : 'http-error')
  }
}

export async function loadPythonDataToolsCellOutputs(
  manifest: PythonDataToolsManifest,
  options: LoaderOptions = {},
): Promise<PythonDataToolsLoadState<readonly PythonDataToolsCellOutputPreview[]>> {
  if (options.signal?.aborted) return errorState('aborted')
  try {
    const response = await resolveFetch(options)(
      withPublicBase(manifest.cellOutputs.publicPath, options.baseUrl),
      { signal: options.signal },
    )
    if (!response.ok) return errorState('http-error')

    let value: unknown
    try {
      value = await response.json()
    } catch {
      return errorState('invalid-json')
    }
    const previews = parseCellOutputPreviews(value, manifest)
    return previews ? { status: 'ready', data: previews } : errorState('invalid-schema')
  } catch (error) {
    return errorState(isAbort(error, options.signal) ? 'aborted' : 'http-error')
  }
}

function table(
  id: string,
  columns: readonly string[],
  rows: readonly (readonly JsonScalar[])[],
): PythonDataToolsTeachingTable {
  return { id, columns, rows }
}

function adaptDatasetShape(value: unknown): Omit<PythonDataToolsJsonOutputViewModel, 'id'> | undefined {
  if (
    !isRecord(value)
    || value.contractVersion !== contractVersion
    || !isPositiveInteger(value.rows)
    || !isPositiveInteger(value.columns)
    || !Array.isArray(value.column_order)
    || !value.column_order.every(isNonEmptyString)
    || !isRecord(value.dtypes)
    || !isRecord(value.field_roles)
    || typeof value.all_counts_reconcile !== 'boolean'
  ) return undefined

  const dtypes = value.dtypes
  const fieldRoles = value.field_roles
  const roleByColumn = new Map<string, string>()
  for (const [role, columns] of Object.entries(fieldRoles)) {
    if (!isNonEmptyString(role) || !Array.isArray(columns) || !columns.every(isNonEmptyString)) return undefined
    for (const column of columns) {
      if (roleByColumn.has(column)) return undefined
      roleByColumn.set(column, role)
    }
  }
  const rows = value.column_order.map((column) => [
    column,
    isNonEmptyString(dtypes[column]) ? dtypes[column] : '',
    roleByColumn.get(column) ?? '',
  ])
  if (rows.some((row) => row.some((cell) => cell === ''))) return undefined

  return {
    kind: 'json',
    keyValues: [
      { key: 'rows', value: value.rows },
      { key: 'columns', value: value.columns },
      { key: 'all_counts_reconcile', value: value.all_counts_reconcile },
    ],
    tables: [table('field-schema', ['field', 'dtype', 'role'], rows)],
    raw: value,
  }
}

function adaptWorkingDay(value: unknown): Omit<PythonDataToolsJsonOutputViewModel, 'id'> | undefined {
  if (
    !isRecord(value)
    || value.contractVersion !== contractVersion
    || !isNonEmptyString(value.aggregation)
    || !Array.isArray(value.records)
  ) return undefined

  const aggregation = value.aggregation
  const rows: JsonScalar[][] = []
  for (const record of value.records) {
    if (
      !isRecord(record)
      || (record.workingday !== 0 && record.workingday !== 1)
      || !isFiniteNumber(record.hr)
      || !Number.isInteger(record.hr)
      || record.hr < 0
      || record.hr > 23
      || !isNonEmptyString(record.workingdayLabel)
      || !isPositiveInteger(record.observations)
      || !isFiniteNumber(record.meanRentals)
      || !isFiniteNumber(record.medianRentals)
      || !isFiniteNumber(record.totalRentals)
    ) return undefined
    rows.push([
      record.workingday,
      record.workingdayLabel,
      record.hr,
      record.observations,
      record.meanRentals,
      record.medianRentals,
      record.totalRentals,
    ])
  }
  if (rows.length === 0) return undefined

  return {
    kind: 'json',
    keyValues: [{ key: 'aggregation', value: aggregation }],
    tables: [table(
      'workingday-hourly',
      ['workingday', 'workingdayLabel', 'hr', 'observations', 'meanRentals', 'medianRentals', 'totalRentals'],
      rows,
    )],
    raw: value,
  }
}

function adaptCorrelation(value: unknown): Omit<PythonDataToolsJsonOutputViewModel, 'id'> | undefined {
  if (
    !isRecord(value)
    || value.contractVersion !== contractVersion
    || value.method !== 'pearson'
    || !Array.isArray(value.columns)
    || !value.columns.every(isNonEmptyString)
    || !Array.isArray(value.matrix)
    || !isRecord(value.guardrail)
    || !isNonEmptyString(value.guardrail['zh-CN'])
    || !isNonEmptyString(value.guardrail.en)
  ) return undefined

  const columns = value.columns
  const matrix = value.matrix
  if (
    matrix.length !== columns.length
    || !matrix.every((row) => (
      Array.isArray(row)
      && row.length === columns.length
      && row.every(isFiniteNumber)
    ))
  ) return undefined

  return {
    kind: 'json',
    keyValues: [{ key: 'method', value: value.method }],
    tables: [table(
      'correlation-matrix',
      ['field', ...columns],
      matrix.map((row, index) => [columns[index]!, ...(row as number[])]),
    )],
    raw: value,
  }
}

function adaptFinalAnalysis(value: unknown): Omit<PythonDataToolsJsonOutputViewModel, 'id'> | undefined {
  if (
    !isRecord(value)
    || value.contract_version !== contractVersion
    || !isNonEmptyString(value.question)
    || !isRootPublicPath(value.handoff_route)
    || !Array.isArray(value.source_outputs)
    || !value.source_outputs.every((id) => pythonDataToolsOutputIds.includes(id as PythonDataToolsOutputId))
    || !Array.isArray(value.excludes)
    || !value.excludes.every(isNonEmptyString)
    || !isRecord(value.evidence)
    || !hasOnlyFiniteJson(value)
  ) return undefined

  const evidenceRows = Object.entries(value.evidence).map(([topic, item]) => [
    topic,
    JSON.stringify(item),
  ] as const)

  return {
    kind: 'json',
    keyValues: [
      { key: 'question', value: value.question },
      { key: 'handoff_route', value: value.handoff_route },
      { key: 'excludes', value: value.excludes.join('、') },
    ],
    tables: [table('analysis-findings', ['topic', 'result'], evidenceRows)],
    raw: value,
  }
}

function adaptPlotly(value: unknown): Omit<PythonDataToolsPlotlyOutputViewModel, 'id'> | undefined {
  if (
    !isRecord(value)
    || !Array.isArray(value.data)
    || value.data.length === 0
    || !value.data.every(isRecord)
    || !isRecord(value.layout)
    || !isRecord(value.defaultFilterState)
    || !hasOnlyFiniteJson(value)
  ) return undefined

  return {
    kind: 'plotly-json',
    figure: { data: value.data, layout: value.layout },
    defaultFilterState: value.defaultFilterState,
  }
}

function adaptJsonOutput(
  id: PythonDataToolsOutputId,
  value: unknown,
): PythonDataToolsJsonOutputViewModel | PythonDataToolsPlotlyOutputViewModel | undefined {
  const adapted = id === 'dataset-shape-schema'
    ? adaptDatasetShape(value)
    : id === 'workingday-comparison'
      ? adaptWorkingDay(value)
      : id === 'pearson-correlation-matrix'
        ? adaptCorrelation(value)
        : id === 'final-analysis-evidence'
          ? adaptFinalAnalysis(value)
          : id === 'plotly-hourly-explorer'
            ? adaptPlotly(value)
            : undefined
  return adapted ? { id, ...adapted } : undefined
}

export async function loadPythonDataToolsOutput(
  manifest: PythonDataToolsManifest,
  outputId: string,
  options: LoaderOptions = {},
): Promise<PythonDataToolsLoadState<PythonDataToolsOutputViewModel>> {
  if (options.signal?.aborted) return errorState('aborted')
  const registryEntry = pythonDataToolsOutputRegistry.find(({ id }) => id === outputId)
  const manifestEntry = manifest.outputs.find(({ id }) => id === outputId)
  if (!registryEntry || !manifestEntry || registryEntry.kind !== manifestEntry.kind) {
    return errorState('unknown-output')
  }

  const publicUrl = withPublicBase(manifestEntry.publicPath, options.baseUrl)
  if (manifestEntry.kind === 'png') {
    return {
      status: 'ready',
      data: {
        id: manifestEntry.id,
        kind: 'png',
        imageUrl: publicUrl,
      },
    }
  }

  try {
    const response = await resolveFetch(options)(publicUrl, { signal: options.signal })
    if (!response.ok) return errorState('http-error')

    let value: unknown
    try {
      value = await response.json()
    } catch {
      return errorState('invalid-json')
    }
    const adapted = adaptJsonOutput(manifestEntry.id, value)
    return adapted ? { status: 'ready', data: adapted } : errorState('invalid-schema')
  } catch (error) {
    return errorState(isAbort(error, options.signal) ? 'aborted' : 'http-error')
  }
}
