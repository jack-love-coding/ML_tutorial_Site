export interface LeastSquaresPoint {
  t: number
  y: number
}

export interface LeastSquaresLineInput {
  slope: number
  intercept: number
  outlierLift?: number
}

export interface LeastSquaresLineEvaluation {
  points: LeastSquaresPoint[]
  current: LeastSquaresLineSummary
  optimal: LeastSquaresLineSummary
  normalMatrix: [[number, number], [number, number]]
  normalRightHandSide: [number, number]
  conditionEstimate: number
}

export interface LeastSquaresLineSummary {
  slope: number
  intercept: number
  predictions: number[]
  residuals: number[]
  residualNorm: number
  sse: number
  normalResidual: [number, number]
  normalResidualNorm: number
}

const BASE_POINTS: LeastSquaresPoint[] = [
  { t: 0, y: 1.2 },
  { t: 1, y: 1.9 },
  { t: 2, y: 2.35 },
  { t: 3, y: 3.25 },
  { t: 4, y: 3.85 },
]

export function leastSquaresLecturePoints(outlierLift = 0): LeastSquaresPoint[] {
  return BASE_POINTS.map((point, index) => ({
    ...point,
    y: index === BASE_POINTS.length - 1 ? point.y + outlierLift : point.y,
  }))
}

export function evaluateLeastSquaresLine(input: LeastSquaresLineInput): LeastSquaresLineEvaluation {
  const points = leastSquaresLecturePoints(input.outlierLift ?? 0)
  const normalMatrix = normalEquationMatrix(points)
  const normalRightHandSide = normalEquationRightHandSide(points)
  const [optimalIntercept, optimalSlope] = solve2x2(normalMatrix, normalRightHandSide)

  return {
    points,
    current: summarizeLine(points, input.intercept, input.slope),
    optimal: summarizeLine(points, optimalIntercept, optimalSlope),
    normalMatrix,
    normalRightHandSide,
    conditionEstimate: conditionNumber2x2(normalMatrix),
  }
}

export function normalEquationMatrix(points: LeastSquaresPoint[]): [[number, number], [number, number]] {
  const count = points.length
  const sumT = points.reduce((acc, point) => acc + point.t, 0)
  const sumT2 = points.reduce((acc, point) => acc + point.t ** 2, 0)
  return [
    [count, sumT],
    [sumT, sumT2],
  ]
}

export function normalEquationRightHandSide(points: LeastSquaresPoint[]): [number, number] {
  return [
    points.reduce((acc, point) => acc + point.y, 0),
    points.reduce((acc, point) => acc + point.t * point.y, 0),
  ]
}

function summarizeLine(points: LeastSquaresPoint[], intercept: number, slope: number): LeastSquaresLineSummary {
  const predictions = points.map((point) => intercept + slope * point.t)
  const residuals = points.map((point, index) => point.y - predictions[index]!)
  const sse = residuals.reduce((acc, residual) => acc + residual ** 2, 0)
  const normalResidual: [number, number] = [
    residuals.reduce((acc, residual) => acc + residual, 0),
    residuals.reduce((acc, residual, index) => acc + points[index]!.t * residual, 0),
  ]

  return {
    slope,
    intercept,
    predictions,
    residuals,
    residualNorm: Math.sqrt(sse),
    sse,
    normalResidual,
    normalResidualNorm: Math.hypot(normalResidual[0], normalResidual[1]),
  }
}

function solve2x2(matrix: [[number, number], [number, number]], rhs: [number, number]): [number, number] {
  const [[a, b], [c, d]] = matrix
  const determinant = a * d - b * c
  if (Math.abs(determinant) < 1e-12) return [Number.NaN, Number.NaN]
  return [
    (d * rhs[0] - b * rhs[1]) / determinant,
    (-c * rhs[0] + a * rhs[1]) / determinant,
  ]
}

function conditionNumber2x2(matrix: [[number, number], [number, number]]) {
  const [[a, b], [c, d]] = matrix
  const ata00 = a * a + c * c
  const ata01 = a * b + c * d
  const ata11 = b * b + d * d
  const trace = ata00 + ata11
  const determinant = Math.max(0, ata00 * ata11 - ata01 * ata01)
  const discriminant = Math.max(0, trace * trace - 4 * determinant)
  const largest = Math.sqrt((trace + Math.sqrt(discriminant)) / 2)
  const smallest = Math.sqrt((trace - Math.sqrt(discriminant)) / 2)
  if (smallest < 1e-12) return Number.POSITIVE_INFINITY
  return largest / smallest
}
