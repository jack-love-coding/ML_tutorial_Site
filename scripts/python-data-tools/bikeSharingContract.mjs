import { createHash } from 'node:crypto'

export const BIKE_SHARING_COLUMNS = Object.freeze([
  'instant',
  'dteday',
  'season',
  'yr',
  'mnth',
  'hr',
  'holiday',
  'weekday',
  'workingday',
  'weathersit',
  'temp',
  'atemp',
  'hum',
  'windspeed',
  'casual',
  'registered',
  'cnt',
])

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function parseCsvRows(source) {
  const rows = []
  let row = []
  let cell = ''
  let index = 0
  let line = 1
  let rowLine = 1
  let quoted = false
  let closedQuote = false

  const finishCell = () => {
    row.push(cell)
    cell = ''
    closedQuote = false
  }
  const finishRow = () => {
    finishCell()
    rows.push({ cells: row, line: rowLine })
    row = []
    rowLine = line + 1
  }

  while (index < source.length) {
    const character = source[index]

    if (quoted) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          cell += '"'
          index += 2
          continue
        }
        quoted = false
        closedQuote = true
        index += 1
        continue
      }
      if (character === '\r' && source[index + 1] === '\n') {
        cell += '\r\n'
        line += 1
        index += 2
        continue
      }
      if (character === '\n' || character === '\r') {
        cell += character
        line += 1
        index += 1
        continue
      }
      cell += character
      index += 1
      continue
    }

    if (closedQuote && character !== ',' && character !== '\r' && character !== '\n') {
      throw new Error(`CSV row ${rowLine}: unexpected character ${JSON.stringify(character)} after closing quote`)
    }
    if (character === '"') {
      if (cell.length > 0 || closedQuote) {
        throw new Error(`CSV row ${rowLine}: unexpected quote in unquoted cell`)
      }
      quoted = true
      index += 1
      continue
    }
    if (character === ',') {
      finishCell()
      index += 1
      continue
    }
    if (character === '\r' || character === '\n') {
      finishRow()
      if (character === '\r' && source[index + 1] === '\n') index += 1
      line += 1
      rowLine = line
      index += 1
      continue
    }
    cell += character
    index += 1
  }

  if (quoted) throw new Error(`CSV row ${rowLine}: unterminated quoted cell`)
  finishRow()
  return rows
}

export function parseBikeSharingCsv(source) {
  if (typeof source !== 'string') throw new TypeError('Bike Sharing CSV source must be a string')
  const normalized = source.replace(/^\uFEFF/, '').replace(/(?:\r\n|\n|\r)+$/, '')
  if (!normalized) throw new Error('Bike Sharing CSV is empty; expected a header and data rows')

  const parsedRows = parseCsvRows(normalized)
  const header = parsedRows[0].cells
  const headerWidth = Math.max(header.length, BIKE_SHARING_COLUMNS.length)
  for (let index = 0; index < headerWidth; index += 1) {
    if (header[index] !== BIKE_SHARING_COLUMNS[index]) {
      throw new Error(
        `Bike Sharing header column ${index + 1}: expected ${JSON.stringify(BIKE_SHARING_COLUMNS[index] ?? '<no column>')}, received ${JSON.stringify(header[index] ?? '<missing>')} (expected ${BIKE_SHARING_COLUMNS.length} columns, received ${header.length})`,
      )
    }
  }
  if (parsedRows.length === 1) {
    throw new Error('Bike Sharing CSV has no data rows')
  }

  const records = parsedRows.slice(1).map(({ cells, line }) => {
    if (cells.length !== BIKE_SHARING_COLUMNS.length) {
      throw new Error(
        `Bike Sharing CSV source row ${line} has ${cells.length} columns; expected ${BIKE_SHARING_COLUMNS.length}`,
      )
    }
    return Object.fromEntries(BIKE_SHARING_COLUMNS.map((column, index) => [column, cells[index]]))
  })

  return { columns: [...BIKE_SHARING_COLUMNS], records }
}

function isIntegerInRange(value, minimum, maximum = Number.POSITIVE_INFINITY) {
  return /^\d+$/.test(value) && Number(value) >= minimum && Number(value) <= maximum
}

function isCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
}

export function validateBikeSharingRecords(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return ['Bike Sharing dataset has no records']
  }

  const issues = []
  const seenInstants = new Set()
  const integerRanges = {
    season: [1, 4],
    yr: [0, 1],
    mnth: [1, 12],
    hr: [0, 23],
    holiday: [0, 1],
    weekday: [0, 6],
    workingday: [0, 1],
    weathersit: [1, 4],
  }
  const normalizedColumns = ['temp', 'atemp', 'hum', 'windspeed']
  const countColumns = ['casual', 'registered', 'cnt']

  records.forEach((record, index) => {
    const row = index + 2
    const instant = record?.instant
    if (!isIntegerInRange(instant, 1)) {
      issues.push(`Row ${row}, instant: expected a positive integer; observed ${JSON.stringify(instant)}`)
    } else if (seenInstants.has(Number(instant))) {
      issues.push(`Row ${row}, instant: duplicate value ${JSON.stringify(instant)}`)
    } else {
      seenInstants.add(Number(instant))
    }

    if (!isCalendarDate(record?.dteday)) {
      issues.push(`Row ${row}, dteday: expected a valid YYYY-MM-DD calendar date; observed ${JSON.stringify(record?.dteday)}`)
    }

    for (const [column, [minimum, maximum]] of Object.entries(integerRanges)) {
      const value = record?.[column]
      if (!isIntegerInRange(value, minimum, maximum)) {
        issues.push(`Row ${row}, ${column}: expected an integer from ${minimum} to ${maximum}; observed ${JSON.stringify(value)}`)
      }
    }
    for (const column of normalizedColumns) {
      const value = record?.[column]
      const numeric = Number(value)
      if (value === '' || !Number.isFinite(numeric) || numeric < 0 || numeric > 1) {
        issues.push(`Row ${row}, ${column}: expected a finite normalized value from 0 to 1; observed ${JSON.stringify(value)}`)
      }
    }
    for (const column of countColumns) {
      const value = record?.[column]
      if (!isIntegerInRange(value, 0)) {
        issues.push(`Row ${row}, ${column}: expected a nonnegative integer; observed ${JSON.stringify(value)}`)
      }
    }
    if (countColumns.every((column) => isIntegerInRange(record?.[column], 0))) {
      const expected = Number(record.casual) + Number(record.registered)
      if (Number(record.cnt) !== expected) {
        issues.push(`Row ${row}, cnt: expected casual + registered = ${expected}; observed ${JSON.stringify(record.cnt)}`)
      }
    }
  })

  return issues
}

export function verifyBikeSharingSnapshot(bytes, manifest) {
  const byteView = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  const source = new TextDecoder('utf-8', { fatal: true }).decode(byteView)
  const { columns, records } = parseBikeSharingCsv(source)
  const observed = {
    sha256: sha256(byteView),
    bytes: byteView.byteLength,
    rows: records.length,
    columns: columns.length,
    columnOrder: columns,
  }
  const issues = validateBikeSharingRecords(records)
  const expected = manifest?.file ?? {}

  for (const field of ['sha256', 'bytes', 'rows', 'columns']) {
    if (observed[field] !== expected[field]) {
      issues.push(
        `Manifest file.${field} mismatch: expected ${JSON.stringify(expected[field])}, observed ${JSON.stringify(observed[field])}`,
      )
    }
  }
  if (!Array.isArray(expected.columnOrder)
    || expected.columnOrder.length !== observed.columnOrder.length
    || expected.columnOrder.some((column, index) => column !== observed.columnOrder[index])) {
    issues.push(
      `Manifest file.columnOrder mismatch: expected ${JSON.stringify(expected.columnOrder)}, observed ${JSON.stringify(observed.columnOrder)}`,
    )
  }

  return { observed, issues }
}
