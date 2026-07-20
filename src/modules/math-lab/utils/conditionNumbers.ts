export type ConditionVector2 = [number, number]
export type ConditionMatrix2x2 = [[number, number], [number, number]]

export interface ConditioningInput {
  columnAngleDegrees: number
  secondColumnScale: number
  perturbationPower: number
  perturbationAngleDegrees: number
  inputDigits: number
}

export interface ConditioningEvaluation {
  matrix: ConditionMatrix2x2
  exactX: ConditionVector2
  exactB: ConditionVector2
  perturbedB: ConditionVector2
  perturbedX: ConditionVector2
  deltaB: ConditionVector2
  deltaX: ConditionVector2
  determinant: number
  columnAngleDegrees: number
  conditionNumber: number
  relativeInputError: number
  relativeOutputError: number
  residualNorm: number
  relativeResidual: number
  solveResidualNorm: number
  relativeSolveResidual: number
  errorBound: number
  digitsLost: number
  expectedDigits: number
  singularValues: ConditionVector2
}

const MIN_SINGULAR_VALUE = 1e-14

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

export function formatConditionAngleDegrees(value: number) {
  const magnitude = Math.abs(value)
  if (magnitude < 0.1) return value.toFixed(3)
  if (magnitude < 1) return value.toFixed(2)
  if (Number.isInteger(value)) return value.toFixed(0)
  return value.toFixed(1)
}

export function norm2(vector: ConditionVector2) {
  return Math.hypot(vector[0], vector[1])
}

export function subtract2(left: ConditionVector2, right: ConditionVector2): ConditionVector2 {
  return [left[0] - right[0], left[1] - right[1]]
}

export function add2(left: ConditionVector2, right: ConditionVector2): ConditionVector2 {
  return [left[0] + right[0], left[1] + right[1]]
}

export function multiplyMatrixVector2x2(matrix: ConditionMatrix2x2, vector: ConditionVector2): ConditionVector2 {
  return [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
  ]
}

export function determinant2x2(matrix: ConditionMatrix2x2) {
  return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
}

export function solve2x2(matrix: ConditionMatrix2x2, rhs: ConditionVector2): ConditionVector2 {
  const [[a, b], [c, d]] = matrix
  const det = determinant2x2(matrix)

  if (Math.abs(det) <= MIN_SINGULAR_VALUE) {
    return [Number.NaN, Number.NaN]
  }

  return [
    (d * rhs[0] - b * rhs[1]) / det,
    (-c * rhs[0] + a * rhs[1]) / det,
  ]
}

export function singularValues2x2(matrix: ConditionMatrix2x2): ConditionVector2 {
  const [[a, b], [c, d]] = matrix
  const ata00 = a * a + c * c
  const ata01 = a * b + c * d
  const ata11 = b * b + d * d
  const trace = ata00 + ata11
  const determinant = Math.max(0, ata00 * ata11 - ata01 * ata01)
  const discriminant = Math.max(0, trace * trace - 4 * determinant)
  const largestEigenvalue = (trace + Math.sqrt(discriminant)) / 2
  const smallestEigenvalue = (trace - Math.sqrt(discriminant)) / 2

  return [
    Math.sqrt(Math.max(0, largestEigenvalue)),
    Math.sqrt(Math.max(0, smallestEigenvalue)),
  ]
}

export function conditionNumber2x2(matrix: ConditionMatrix2x2) {
  const [sigmaMax, sigmaMin] = singularValues2x2(matrix)
  if (sigmaMin <= MIN_SINGULAR_VALUE) return Number.POSITIVE_INFINITY
  return sigmaMax / sigmaMin
}

export function makeColumnMatrix(columnAngleDegrees: number, secondColumnScale: number): ConditionMatrix2x2 {
  const angle = toRadians(columnAngleDegrees)
  return [
    [1, secondColumnScale * Math.cos(angle)],
    [0, secondColumnScale * Math.sin(angle)],
  ]
}

export function evaluateConditioning(input: ConditioningInput): ConditioningEvaluation {
  const matrix = makeColumnMatrix(input.columnAngleDegrees, input.secondColumnScale)
  const exactX: ConditionVector2 = [0.9, 0.7]
  const exactB = multiplyMatrixVector2x2(matrix, exactX)
  const relativeInputError = 10 ** input.perturbationPower
  const perturbationMagnitude = relativeInputError * norm2(exactB)
  const perturbationAngle = toRadians(input.perturbationAngleDegrees)
  const deltaB: ConditionVector2 = [
    perturbationMagnitude * Math.cos(perturbationAngle),
    perturbationMagnitude * Math.sin(perturbationAngle),
  ]
  const perturbedB = add2(exactB, deltaB)
  const perturbedX = solve2x2(matrix, perturbedB)
  const deltaX = subtract2(perturbedX, exactX)
  const residual = subtract2(multiplyMatrixVector2x2(matrix, perturbedX), exactB)
  const solveResidual = subtract2(multiplyMatrixVector2x2(matrix, perturbedX), perturbedB)
  const conditionNumber = conditionNumber2x2(matrix)
  const relativeOutputError = norm2(deltaX) / norm2(exactX)
  const residualNorm = norm2(residual)
  const relativeResidual = residualNorm / norm2(exactB)
  const solveResidualNorm = norm2(solveResidual)
  const relativeSolveResidual = solveResidualNorm / norm2(perturbedB)
  const errorBound = conditionNumber * relativeInputError
  const digitsLost = Number.isFinite(conditionNumber) ? Math.max(0, Math.log10(conditionNumber)) : Number.POSITIVE_INFINITY

  return {
    matrix,
    exactX,
    exactB,
    perturbedB,
    perturbedX,
    deltaB,
    deltaX,
    determinant: determinant2x2(matrix),
    columnAngleDegrees: input.columnAngleDegrees,
    conditionNumber,
    relativeInputError,
    relativeOutputError,
    residualNorm,
    relativeResidual,
    solveResidualNorm,
    relativeSolveResidual,
    errorBound,
    digitsLost,
    expectedDigits: Number.isFinite(digitsLost) ? Math.max(0, input.inputDigits - digitsLost) : 0,
    singularValues: singularValues2x2(matrix),
  }
}
