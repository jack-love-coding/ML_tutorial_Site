import {
  angleBetween,
  dot,
  matrixVectorMultiply,
  norm,
  type Matrix2x2,
  type Vector2,
} from './math.ts'
import {
  matrixForEigenPowerKind,
  type EigenPowerMatrixKind,
} from './eigenPower.ts'

export interface EigenDirectionInput {
  matrixKind: EigenPowerMatrixKind
  vector: Vector2
  iterations: number
}

export interface EigenDirectionEvaluation {
  matrix: Matrix2x2
  normalizedVector: Vector2
  imageVector: Vector2
  rayleighQuotient: number
  residualVector: Vector2
  residualNorm: number
  angleToImage: number
  nearEigenDirection: boolean
  powerPath: Vector2[]
}

function finiteOr(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? value! : fallback
}

function normalize(vector: Vector2): Vector2 {
  const length = norm(vector)
  if (length <= 1e-12) return { x: 1, y: 0 }
  return {
    x: vector.x / length,
    y: vector.y / length,
  }
}

function safeVector(vector: Vector2): Vector2 {
  return normalize({
    x: finiteOr(vector.x, 1),
    y: finiteOr(vector.y, 0),
  })
}

function signedLineAngle(left: Vector2, right: Vector2) {
  const angle = angleBetween(left, right)
  return Math.min(angle, Math.abs(180 - angle))
}

export function evaluateEigenDirection(input: EigenDirectionInput): EigenDirectionEvaluation {
  const matrix = matrixForEigenPowerKind(input.matrixKind) as Matrix2x2
  const steps = Math.max(0, Math.min(40, Math.floor(finiteOr(input.iterations, 0))))
  let vector = safeVector(input.vector)
  const powerPath: Vector2[] = [vector]

  for (let index = 0; index < steps; index += 1) {
    vector = normalize(matrixVectorMultiply(matrix, vector))
    powerPath.push(vector)
  }

  const imageVector = matrixVectorMultiply(matrix, vector)
  const denominator = dot(vector, vector) || 1
  const rayleighQuotient = dot(vector, imageVector) / denominator
  const residualVector = {
    x: imageVector.x - rayleighQuotient * vector.x,
    y: imageVector.y - rayleighQuotient * vector.y,
  }
  const residualNorm = norm(residualVector)
  const angleToImage = signedLineAngle(vector, imageVector)

  return {
    matrix,
    normalizedVector: vector,
    imageVector,
    rayleighQuotient,
    residualVector,
    residualNorm,
    angleToImage,
    nearEigenDirection: residualNorm < 0.05 || angleToImage < 2,
    powerPath,
  }
}
