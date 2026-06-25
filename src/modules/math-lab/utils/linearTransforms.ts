import {
  determinant2x2,
  isInvertible2x2,
  matrixColumns2x2,
  matrixVectorMultiply,
  rank2x2,
  type Matrix2x2,
  type Vector2,
} from './math.ts'

export type MatrixOrientation = 'preserved' | 'flipped' | 'collapsed'

export interface MatrixTransformPreset {
  id: string
  label: {
    'zh-CN': string
    en: string
  }
  matrix: Matrix2x2
}

export interface MatrixTransformEvaluationInput {
  matrix?: Matrix2x2
  basisI?: Vector2
  basisJ?: Vector2
  probe?: Vector2
}

export interface MatrixTransformEvaluation {
  matrix: Matrix2x2
  basisI: Vector2
  basisJ: Vector2
  determinant: number
  rank: 0 | 1 | 2
  areaScale: number
  orientation: MatrixOrientation
  invertible: boolean
  probe: Vector2
  transformedProbe: Vector2
}

const defaultProbe: Vector2 = { x: 1.5, y: -0.5 }

function finiteOr(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback
}

function sanitizeVector(vector: Vector2 | undefined, fallback: Vector2): Vector2 {
  return {
    x: finiteOr(vector?.x ?? fallback.x, fallback.x),
    y: finiteOr(vector?.y ?? fallback.y, fallback.y),
  }
}

export function matrixFromBasisVectors(basisI: Vector2, basisJ: Vector2): Matrix2x2 {
  return [
    [finiteOr(basisI.x), finiteOr(basisJ.x)],
    [finiteOr(basisI.y), finiteOr(basisJ.y)],
  ]
}

export function basisVectorsFromMatrix(matrix: Matrix2x2): [Vector2, Vector2] {
  return matrixColumns2x2(matrix)
}

export const matrixTransformPresets: MatrixTransformPreset[] = [
  {
    id: 'linear-layer',
    label: { 'zh-CN': '线性层', en: 'linear layer' },
    matrix: [[1.2, 0.6], [-0.3, 1]],
  },
  {
    id: 'stretch-shear',
    label: { 'zh-CN': '拉伸剪切', en: 'stretch + shear' },
    matrix: [[1.8, 0.45], [0.2, 0.85]],
  },
  {
    id: 'reflection',
    label: { 'zh-CN': '反射', en: 'reflection' },
    matrix: [[1, 0.35], [0, -1]],
  },
  {
    id: 'projection',
    label: { 'zh-CN': '投影塌缩', en: 'projection collapse' },
    matrix: [[1, 0.5], [0.5, 0.25]],
  },
]

export function evaluateMatrixTransform(input: MatrixTransformEvaluationInput): MatrixTransformEvaluation {
  const fallbackMatrix = matrixTransformPresets[0]!.matrix
  const basisI = input.matrix
    ? basisVectorsFromMatrix(input.matrix)[0]
    : sanitizeVector(input.basisI, basisVectorsFromMatrix(fallbackMatrix)[0])
  const basisJ = input.matrix
    ? basisVectorsFromMatrix(input.matrix)[1]
    : sanitizeVector(input.basisJ, basisVectorsFromMatrix(fallbackMatrix)[1])
  const matrix = input.matrix ?? matrixFromBasisVectors(basisI, basisJ)
  const determinant = determinant2x2(matrix)
  const rank = rank2x2(matrix)
  const orientation: MatrixOrientation = rank < 2
    ? 'collapsed'
    : determinant > 0
      ? 'preserved'
      : 'flipped'
  const probe = sanitizeVector(input.probe, defaultProbe)

  return {
    matrix,
    basisI,
    basisJ,
    determinant,
    rank,
    areaScale: Math.abs(determinant),
    orientation,
    invertible: isInvertible2x2(matrix),
    probe,
    transformedProbe: matrixVectorMultiply(matrix, probe),
  }
}
