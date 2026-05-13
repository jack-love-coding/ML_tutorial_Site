import type {
  ColumnProfile,
  ColumnSemanticType,
  DataCell,
  DataColumn,
  DataRow,
  DataTable,
  LocalizedCopy,
} from '../types/dataLab'

type AggregateOperation = 'count' | 'sum' | 'mean' | 'min' | 'max'

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

export const housingTeachingTable: DataTable = {
  columns: [
    { key: 'id', label: copy('记录 ID', 'record id'), semanticType: 'identifier' },
    { key: 'district', label: copy('街区', 'district'), semanticType: 'categorical' },
    { key: 'rooms', label: copy('房间数', 'rooms'), semanticType: 'numeric' },
    { key: 'price', label: copy('价格', 'price'), semanticType: 'numeric' },
    { key: 'listed_at', label: copy('挂牌日期', 'listed date'), semanticType: 'datetime' },
    { key: 'has_school', label: copy('学区', 'school zone'), semanticType: 'boolean' },
  ],
  rows: [
    { id: 'A-01', district: 'north', rooms: 3, price: 420, listed_at: '2026-01-02', has_school: true },
    { id: 'A-02', district: 'north', rooms: 2, price: 310, listed_at: '2026-01-03', has_school: true },
    { id: 'B-03', district: 'west', rooms: null, price: 275, listed_at: 'bad-date', has_school: false },
    { id: 'B-03', district: 'west', rooms: null, price: 275, listed_at: 'bad-date', has_school: false },
    { id: 'C-04', district: 'east', rooms: 9, price: 9800, listed_at: '2026-01-05', has_school: false },
    { id: 'D-05', district: '', rooms: 4, price: 530, listed_at: '2026-01-06', has_school: true },
  ],
}

function cloneRows(rows: DataRow[]): DataRow[] {
  return rows.map((row) => ({ ...row }))
}

function cloneColumns(columns: DataColumn[]): DataColumn[] {
  return columns.map((column) => ({
    ...column,
    label: { ...column.label },
  }))
}

export function cloneTable(table: DataTable): DataTable {
  return {
    columns: cloneColumns(table.columns),
    rows: cloneRows(table.rows),
  }
}

export function isMissing(value: DataCell | undefined): boolean {
  return value === null || value === undefined || value === '' || (typeof value === 'number' && Number.isNaN(value))
}

function coerceNumber(value: DataCell | undefined): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function isDateLike(value: DataCell) {
  return typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Date.parse(value))
}

export function inferColumnType(values: DataCell[], key = ''): ColumnSemanticType {
  const presentValues = values.filter((value) => !isMissing(value))
  if (presentValues.length === 0) return 'missing'

  const lowerKey = key.toLowerCase()
  if (lowerKey === 'id' || lowerKey.endsWith('_id') || lowerKey.includes('zip') || lowerKey.includes('postal')) {
    return 'identifier'
  }

  if (presentValues.every((value) => typeof value === 'boolean')) return 'boolean'
  if (presentValues.every((value) => coerceNumber(value) !== undefined)) return 'numeric'
  if (presentValues.every(isDateLike)) return 'datetime'

  const uniqueCount = new Set(presentValues.map(String)).size
  if (uniqueCount <= Math.max(8, presentValues.length * 0.6)) return 'categorical'

  return 'text'
}

export function profileColumns(table: DataTable): ColumnProfile[] {
  return table.columns.map((column) => {
    const values = table.rows.map((row) => row[column.key])
    const presentValues = values.filter((value) => !isMissing(value))
    const numbers = presentValues
      .map((value) => coerceNumber(value))
      .filter((value): value is number => value !== undefined)
    const uniqueCount = new Set(presentValues.map(String)).size
    const base = {
      key: column.key,
      label: column.label,
      inferredType: inferColumnType(values, column.key),
      missingCount: values.length - presentValues.length,
      uniqueCount,
    }

    if (!numbers.length) {
      return base
    }

    return {
      ...base,
      numericMin: Math.min(...numbers),
      numericMax: Math.max(...numbers),
      mean: numbers.reduce((sum, value) => sum + value, 0) / numbers.length,
    }
  })
}

export function fillMissing(table: DataTable, columnKey: string, replacement: DataCell): DataTable {
  return {
    columns: cloneColumns(table.columns),
    rows: table.rows.map((row) => ({
      ...row,
      [columnKey]: isMissing(row[columnKey]) ? replacement : row[columnKey],
    })),
  }
}

export function dropMissingRows(table: DataTable, columnKey?: string): DataTable {
  return {
    columns: cloneColumns(table.columns),
    rows: table.rows
      .filter((row) => {
        if (columnKey) return !isMissing(row[columnKey])
        return table.columns.every((column) => !isMissing(row[column.key]))
      })
      .map((row) => ({ ...row })),
  }
}

export function dropDuplicates(table: DataTable, keys = table.columns.map((column) => column.key)): DataTable {
  const seen = new Set<string>()
  const rows: DataRow[] = []

  for (const row of table.rows) {
    const signature = JSON.stringify(keys.map((key) => row[key] ?? null))
    if (!seen.has(signature)) {
      seen.add(signature)
      rows.push({ ...row })
    }
  }

  return {
    columns: cloneColumns(table.columns),
    rows,
  }
}

export function clipColumn(table: DataTable, columnKey: string, min: number, max: number): DataTable {
  return {
    columns: cloneColumns(table.columns),
    rows: table.rows.map((row) => {
      const numericValue = coerceNumber(row[columnKey])
      return {
        ...row,
        [columnKey]: numericValue === undefined ? row[columnKey] : Math.min(max, Math.max(min, numericValue)),
      }
    }),
  }
}

export function castColumn(
  table: DataTable,
  columnKey: string,
  targetType: 'number' | 'string' | 'boolean' | 'datetime',
): DataTable {
  return {
    columns: cloneColumns(table.columns),
    rows: table.rows.map((row) => {
      const value = row[columnKey]
      let nextValue: DataCell = value ?? null

      if (isMissing(value)) {
        nextValue = null
      } else if (targetType === 'number') {
        nextValue = coerceNumber(value) ?? null
      } else if (targetType === 'string') {
        nextValue = String(value)
      } else if (targetType === 'boolean') {
        nextValue = value === true || value === 'true' || value === '1' || value === 1
      } else {
        nextValue = isDateLike(value) ? new Date(String(value)).toISOString().slice(0, 10) : null
      }

      return { ...row, [columnKey]: nextValue }
    }),
  }
}

export function selectColumns(table: DataTable, columnKeys: string[]): DataTable {
  const selected = new Set(columnKeys)
  return {
    columns: table.columns.filter((column) => selected.has(column.key)).map((column) => ({ ...column })),
    rows: table.rows.map((row) =>
      Object.fromEntries(columnKeys.map((key) => [key, row[key] ?? null])),
    ),
  }
}

export function filterRows(table: DataTable, predicate: (row: DataRow) => boolean): DataTable {
  return {
    columns: cloneColumns(table.columns),
    rows: table.rows.filter(predicate).map((row) => ({ ...row })),
  }
}

export function sortBy(table: DataTable, columnKey: string, direction: 'asc' | 'desc' = 'asc'): DataTable {
  const multiplier = direction === 'asc' ? 1 : -1
  return {
    columns: cloneColumns(table.columns),
    rows: cloneRows(table.rows).sort((left, right) => {
      const leftValue = left[columnKey]
      const rightValue = right[columnKey]
      if (isMissing(leftValue)) return 1
      if (isMissing(rightValue)) return -1
      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return (leftValue - rightValue) * multiplier
      }
      return String(leftValue).localeCompare(String(rightValue)) * multiplier
    }),
  }
}

export function deriveColumn(
  table: DataTable,
  column: DataColumn,
  compute: (row: DataRow) => DataCell,
): DataTable {
  return {
    columns: [...cloneColumns(table.columns), { ...column, label: { ...column.label } }],
    rows: table.rows.map((row) => ({ ...row, [column.key]: compute(row) })),
  }
}

function aggregate(values: number[], operation: AggregateOperation): number {
  if (operation === 'count') return values.length
  if (!values.length) return 0
  if (operation === 'sum') return values.reduce((sum, value) => sum + value, 0)
  if (operation === 'mean') return values.reduce((sum, value) => sum + value, 0) / values.length
  if (operation === 'min') return Math.min(...values)
  return Math.max(...values)
}

export function groupByAggregate(
  table: DataTable,
  groupKey: string,
  valueKey: string,
  operation: AggregateOperation,
): DataTable {
  const groups = new Map<string, number[]>()
  for (const row of table.rows) {
    if (isMissing(row[groupKey])) continue
    const numericValue = operation === 'count' ? 1 : coerceNumber(row[valueKey])
    if (numericValue === undefined) continue
    const key = String(row[groupKey])
    groups.set(key, [...(groups.get(key) ?? []), numericValue])
  }

  const metricKey = `${valueKey}_${operation}`
  return {
    columns: [
      { key: groupKey, label: copy('分组', 'group'), semanticType: 'categorical' },
      { key: metricKey, label: copy('聚合值', 'aggregate'), semanticType: 'numeric' },
    ],
    rows: [...groups.entries()].map(([group, values]) => ({
      [groupKey]: group,
      [metricKey]: Number(aggregate(values, operation).toFixed(3)),
    })),
  }
}

export function mergeLookup(left: DataTable, lookup: DataTable, key: string): DataTable {
  const lookupColumns = lookup.columns.filter((column) => column.key !== key)
  const lookupMap = new Map<string, DataRow>()
  for (const row of lookup.rows) {
    lookupMap.set(String(row[key]), row)
  }

  return {
    columns: [...cloneColumns(left.columns), ...cloneColumns(lookupColumns)],
    rows: left.rows.map((row) => {
      const match = lookupMap.get(String(row[key]))
      return {
        ...row,
        ...Object.fromEntries(lookupColumns.map((column) => [column.key, match?.[column.key] ?? null])),
      }
    }),
  }
}

export function tableShape(table: DataTable) {
  return {
    rows: table.rows.length,
    columns: table.columns.length,
  }
}

export function oneHotDimension(table: DataTable, columnKey: string): number {
  return new Set(
    table.rows
      .map((row) => row[columnKey])
      .filter((value) => !isMissing(value))
      .map(String),
  ).size
}
