export type Matrix = number[][]
export type ProbabilityVector = number[]

export interface StationaryDistributionResult {
  vector: ProbabilityVector
  iterations: number
  residual: number
}

export interface PageRankTransition {
  linkMatrix: Matrix
  transitionMatrix: Matrix
  outDegrees: number[]
}

export const weatherBaseTransition: Matrix = [
  [0.6, 0.2, 0.3],
  [0.1, 0.4, 0.3],
  [0.3, 0.4, 0.4],
]

export const pageRankLectureAdjacency: Matrix = [
  [0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0],
  [0, 1, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [1, 0, 1, 0, 1, 0],
]

export function normalizeProbabilityVector(vector: ProbabilityVector): ProbabilityVector {
  const nonnegative = vector.map((value) => Math.max(0, value))
  const total = nonnegative.reduce((acc, value) => acc + value, 0)

  if (total === 0) {
    return Array.from({ length: vector.length }, () => 1 / Math.max(1, vector.length))
  }

  return nonnegative.map((value) => value / total)
}

export function multiplyMatrixVector(matrix: Matrix, vector: ProbabilityVector): ProbabilityVector {
  return matrix.map((row) => row.reduce((acc, value, columnIndex) => acc + value * (vector[columnIndex] ?? 0), 0))
}

export function l1Distance(a: ProbabilityVector, b: ProbabilityVector): number {
  return a.reduce((acc, value, index) => acc + Math.abs(value - (b[index] ?? 0)), 0)
}

export function maxColumnSumError(matrix: Matrix): number {
  const columnCount = matrix[0]?.length ?? 0
  let maxError = 0

  for (let column = 0; column < columnCount; column += 1) {
    const columnSum = matrix.reduce((acc, row) => acc + (row[column] ?? 0), 0)
    maxError = Math.max(maxError, Math.abs(1 - columnSum))
  }

  return maxError
}

export function buildWeatherTransition(stickiness = 0): Matrix {
  const safeStickiness = Math.min(0.95, Math.max(0, stickiness))

  return weatherBaseTransition.map((row, rowIndex) =>
    row.map((value, columnIndex) => (1 - safeStickiness) * value + (rowIndex === columnIndex ? safeStickiness : 0)),
  )
}

export function iterateMarkovChain(
  matrix: Matrix,
  initialVector: ProbabilityVector,
  steps: number,
): ProbabilityVector[] {
  const safeSteps = Math.max(0, Math.floor(steps))
  const history: ProbabilityVector[] = [normalizeProbabilityVector(initialVector)]

  for (let step = 0; step < safeSteps; step += 1) {
    history.push(normalizeProbabilityVector(multiplyMatrixVector(matrix, history[history.length - 1]!)))
  }

  return history
}

export function stationaryResidual(matrix: Matrix, vector: ProbabilityVector): number {
  return l1Distance(normalizeProbabilityVector(multiplyMatrixVector(matrix, vector)), normalizeProbabilityVector(vector))
}

export function stationaryDistributionPower(
  matrix: Matrix,
  initialVector?: ProbabilityVector,
  maxIterations = 800,
  tolerance = 1e-12,
): StationaryDistributionResult {
  const size = matrix.length
  let vector = normalizeProbabilityVector(initialVector ?? Array.from({ length: size }, () => 1 / Math.max(1, size)))
  let iterations = 0

  for (; iterations < maxIterations; iterations += 1) {
    const next = normalizeProbabilityVector(multiplyMatrixVector(matrix, vector))
    if (l1Distance(next, vector) < tolerance) {
      vector = next
      iterations += 1
      break
    }
    vector = next
  }

  return {
    vector,
    iterations,
    residual: stationaryResidual(matrix, vector),
  }
}

export function normalizeAdjacencyColumns(adjacency: Matrix): Matrix {
  const size = adjacency.length
  const columnSums = Array.from({ length: size }, (_, column) =>
    adjacency.reduce((acc, row) => acc + Math.max(0, row[column] ?? 0), 0),
  )

  return adjacency.map((row) =>
    row.map((value, column) => {
      const nonnegative = Math.max(0, value)
      const columnSum = columnSums[column] ?? 0
      return columnSum === 0 ? 1 / Math.max(1, size) : nonnegative / columnSum
    }),
  )
}

export function buildPageRankTransition(
  damping: number,
  adjacency: Matrix = pageRankLectureAdjacency,
): PageRankTransition {
  const safeDamping = Math.min(0.99, Math.max(0, damping))
  const size = adjacency.length
  const linkMatrix = normalizeAdjacencyColumns(adjacency)
  const teleport = 1 / Math.max(1, size)
  const transitionMatrix = linkMatrix.map((row) =>
    row.map((value) => safeDamping * value + (1 - safeDamping) * teleport),
  )
  const outDegrees = Array.from({ length: size }, (_, column) =>
    adjacency.reduce((acc, row) => acc + (row[column] > 0 ? 1 : 0), 0),
  )

  return {
    linkMatrix,
    transitionMatrix,
    outDegrees,
  }
}
