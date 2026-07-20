export type LuMatrix2x2 = [[number, number], [number, number]]
export type LuVector2 = [number, number]

export interface Lu2x2Input {
  a11: number
  a12: number
  a21: number
  a22: number
  b1: number
  b2: number
}

export interface Lu2x2Factorization {
  matrix: LuMatrix2x2
  l: LuMatrix2x2
  u: LuMatrix2x2
  multiplier: number
  schurComplement: number
  determinant: number
  needsPivot: boolean
  singular: boolean
}

export interface Lu2x2Evaluation extends Lu2x2Factorization {
  rhs: LuVector2
  y: LuVector2
  x: LuVector2
  residual: LuVector2
  residualNorm: number
}

export interface Lup2x2Evaluation extends Lu2x2Evaluation {
  permutation: LuMatrix2x2
  permutedMatrix: LuMatrix2x2
  permutedRhs: LuVector2
  pivoted: boolean
}

export interface LuReuseCostEstimate {
  factorizationCost: number
  triangularSolveCost: number
  refactorEachSolveCost: number
  factorOnceCost: number
  speedup: number
}

const DEFAULT_EPSILON = 1e-10

export function factorLu2x2(matrix: LuMatrix2x2, epsilon = DEFAULT_EPSILON): Lu2x2Factorization {
  const [[a11, a12], [a21, a22]] = matrix
  const pivotTooSmall = Math.abs(a11) <= epsilon
  const multiplier = pivotTooSmall ? Number.NaN : a21 / a11
  const schurComplement = pivotTooSmall ? Number.NaN : a22 - multiplier * a12
  const determinant = pivotTooSmall ? 0 : a11 * schurComplement

  return {
    matrix,
    l: [
      [1, 0],
      [multiplier, 1],
    ],
    u: [
      [a11, a12],
      [0, schurComplement],
    ],
    multiplier,
    schurComplement,
    determinant,
    needsPivot: Math.abs(a21) > Math.abs(a11),
    singular: pivotTooSmall || Math.abs(schurComplement) <= epsilon,
  }
}

export function forwardSubstituteUnitLower2x2(l: LuMatrix2x2, b: LuVector2): LuVector2 {
  const y1 = b[0]
  const y2 = b[1] - l[1][0] * y1
  return [y1, y2]
}

export function backSubstituteUpper2x2(u: LuMatrix2x2, y: LuVector2, epsilon = DEFAULT_EPSILON): LuVector2 {
  if (Math.abs(u[1][1]) <= epsilon || Math.abs(u[0][0]) <= epsilon) {
    return [Number.NaN, Number.NaN]
  }

  const x2 = y[1] / u[1][1]
  const x1 = (y[0] - u[0][1] * x2) / u[0][0]
  return [x1, x2]
}

export function multiplyMatrixVector2x2(matrix: LuMatrix2x2, vector: LuVector2): LuVector2 {
  return [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
  ]
}

export function subtractVector2(left: LuVector2, right: LuVector2): LuVector2 {
  return [left[0] - right[0], left[1] - right[1]]
}

export function evaluateLu2x2(input: Lu2x2Input, epsilon = DEFAULT_EPSILON): Lu2x2Evaluation {
  const matrix: LuMatrix2x2 = [
    [input.a11, input.a12],
    [input.a21, input.a22],
  ]
  const rhs: LuVector2 = [input.b1, input.b2]
  const factorization = factorLu2x2(matrix, epsilon)
  const y = forwardSubstituteUnitLower2x2(factorization.l, rhs)
  const x = backSubstituteUpper2x2(factorization.u, y, epsilon)
  const residual: LuVector2 = Number.isFinite(x[0]) && Number.isFinite(x[1])
    ? subtractVector2(multiplyMatrixVector2x2(matrix, x), rhs)
    : [Number.NaN, Number.NaN]

  return {
    ...factorization,
    rhs,
    y,
    x,
    residual,
    residualNorm: Math.hypot(residual[0], residual[1]),
  }
}

export function evaluateLup2x2(input: Lu2x2Input, epsilon = DEFAULT_EPSILON): Lup2x2Evaluation {
  const matrix: LuMatrix2x2 = [
    [input.a11, input.a12],
    [input.a21, input.a22],
  ]
  const rhs: LuVector2 = [input.b1, input.b2]
  const pivoted = Math.abs(input.a21) > Math.abs(input.a11)
  const permutation: LuMatrix2x2 = pivoted
    ? [[0, 1], [1, 0]]
    : [[1, 0], [0, 1]]
  const permutedMatrix: LuMatrix2x2 = pivoted
    ? [[input.a21, input.a22], [input.a11, input.a12]]
    : matrix
  const permutedRhs: LuVector2 = pivoted
    ? [input.b2, input.b1]
    : rhs
  const factorization = factorLu2x2(permutedMatrix, epsilon)
  const y = forwardSubstituteUnitLower2x2(factorization.l, permutedRhs)
  const x = backSubstituteUpper2x2(factorization.u, y, epsilon)
  const residual: LuVector2 = Number.isFinite(x[0]) && Number.isFinite(x[1])
    ? subtractVector2(multiplyMatrixVector2x2(matrix, x), rhs)
    : [Number.NaN, Number.NaN]
  const determinant = input.a11 * input.a22 - input.a12 * input.a21

  return {
    ...factorization,
    matrix,
    determinant,
    rhs,
    y,
    x,
    residual,
    residualNorm: Math.hypot(residual[0], residual[1]),
    permutation,
    permutedMatrix,
    permutedRhs,
    pivoted,
    needsPivot: pivoted,
  }
}

export function estimateLuReuseCost(n: number, rightHandSides: number): LuReuseCostEstimate {
  const safeN = Math.max(1, Math.floor(n))
  const safeRhs = Math.max(1, Math.floor(rightHandSides))
  const factorizationCost = (2 / 3) * safeN ** 3
  const triangularSolveCost = 2 * safeN ** 2
  const refactorEachSolveCost = safeRhs * (factorizationCost + triangularSolveCost)
  const factorOnceCost = factorizationCost + safeRhs * triangularSolveCost

  return {
    factorizationCost,
    triangularSolveCost,
    refactorEachSolveCost,
    factorOnceCost,
    speedup: refactorEachSolveCost / factorOnceCost,
  }
}
