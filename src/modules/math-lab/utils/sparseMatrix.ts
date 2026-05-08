export type DenseMatrix = number[][]

export interface SparseEntry {
  row: number
  column: number
  value: number
}

export interface CooMatrix {
  rows: number
  columns: number
  data: number[]
  row: number[]
  col: number[]
  entries: SparseEntry[]
}

export interface CsrMatrix {
  rows: number
  columns: number
  data: number[]
  col: number[]
  rowptr: number[]
  rowCounts: number[]
}

export interface SparseStorageEstimateInput {
  size: number
  nonzerosPerRow: number
  valueBytes?: number
  indexBytes?: number
}

export interface SparseStorageEstimate {
  size: number
  nonzerosPerRow: number
  nnz: number
  density: number
  denseElements: number
  cooElements: number
  csrElements: number
  denseBytes: number
  cooBytes: number
  csrBytes: number
  denseMatVecOps: number
  sparseMatVecOps: number
}

export const sparseLectureMatrix: DenseMatrix = [
  [1, 0, 0, 2, 0],
  [3, 4, 0, 5, 0],
  [6, 0, 7, 8, 9],
  [0, 0, 10, 11, 0],
  [0, 0, 0, 0, 12],
]

export function denseToCoo(matrix: DenseMatrix): CooMatrix {
  const rows = matrix.length
  const columns = matrix[0]?.length ?? 0
  const entries: SparseEntry[] = []

  matrix.forEach((matrixRow, rowIndex) => {
    matrixRow.forEach((value, columnIndex) => {
      if (value !== 0) {
        entries.push({ row: rowIndex, column: columnIndex, value })
      }
    })
  })

  return {
    rows,
    columns,
    data: entries.map((entry) => entry.value),
    row: entries.map((entry) => entry.row),
    col: entries.map((entry) => entry.column),
    entries,
  }
}

export function denseToCsr(matrix: DenseMatrix): CsrMatrix {
  const rows = matrix.length
  const columns = matrix[0]?.length ?? 0
  const data: number[] = []
  const col: number[] = []
  const rowptr = [0]
  const rowCounts: number[] = []

  matrix.forEach((matrixRow) => {
    let count = 0
    matrixRow.forEach((value, columnIndex) => {
      if (value !== 0) {
        data.push(value)
        col.push(columnIndex)
        count += 1
      }
    })
    rowCounts.push(count)
    rowptr.push(data.length)
  })

  return {
    rows,
    columns,
    data,
    col,
    rowptr,
    rowCounts,
  }
}

export function csrMatVec(csr: CsrMatrix, vector: number[]): number[] {
  return Array.from({ length: csr.rows }, (_, rowIndex) => {
    let total = 0
    for (let entryIndex = csr.rowptr[rowIndex]; entryIndex < csr.rowptr[rowIndex + 1]; entryIndex += 1) {
      total += csr.data[entryIndex] * (vector[csr.col[entryIndex]] ?? 0)
    }
    return total
  })
}

export function generateBandedSparseMatrix(size: number, nonzerosPerRow: number): DenseMatrix {
  const safeSize = Math.max(1, Math.floor(size))
  const safeNonzeros = Math.max(1, Math.min(safeSize, Math.floor(nonzerosPerRow)))

  return Array.from({ length: safeSize }, (_, rowIndex) => {
    const row = Array.from({ length: safeSize }, () => 0)
    const offsets = Array.from({ length: safeNonzeros }, (_, offsetIndex) => {
      if (offsetIndex === 0) return 0
      const distance = Math.ceil(offsetIndex / 2)
      return offsetIndex % 2 === 1 ? distance : -distance
    })

    for (const offset of offsets) {
      const columnIndex = Math.min(safeSize - 1, Math.max(0, rowIndex + offset))
      row[columnIndex] = Number((1 + ((rowIndex + columnIndex) % 7) / 3).toFixed(2))
    }

    return row
  })
}

export function estimateSparseStorage(input: SparseStorageEstimateInput): SparseStorageEstimate {
  const valueBytes = input.valueBytes ?? 8
  const indexBytes = input.indexBytes ?? 4
  const size = Math.max(1, Math.floor(input.size))
  const nonzerosPerRow = Math.max(1, Math.min(size, Math.floor(input.nonzerosPerRow)))
  const nnz = size * nonzerosPerRow
  const denseElements = size * size
  const cooElements = 3 * nnz
  const csrElements = 2 * nnz + size + 1

  return {
    size,
    nonzerosPerRow,
    nnz,
    density: nnz / denseElements,
    denseElements,
    cooElements,
    csrElements,
    denseBytes: denseElements * valueBytes,
    cooBytes: nnz * (valueBytes + 2 * indexBytes),
    csrBytes: nnz * (valueBytes + indexBytes) + (size + 1) * indexBytes,
    denseMatVecOps: 2 * denseElements,
    sparseMatVecOps: 2 * nnz,
  }
}
