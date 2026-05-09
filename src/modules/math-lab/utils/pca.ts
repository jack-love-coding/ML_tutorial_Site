export type PcaDatasetKind = 'lecture' | 'correlated' | 'orthogonal'

export interface PcaPoint2 {
  x: number
  y: number
}

export interface PcaEvaluationInput {
  datasetKind: PcaDatasetKind
  keptComponents: number
  meanShift?: number
}

export interface PcaEvaluation {
  rawPoints: PcaPoint2[]
  centeredPoints: PcaPoint2[]
  reconstructedPoints: PcaPoint2[]
  projectedScores: number[][]
  mean: PcaPoint2
  covariance: [[number, number], [number, number]]
  eigenvalues: [number, number]
  principalDirections: [PcaPoint2, PcaPoint2]
  explainedVariance: [number, number]
  retainedVariance: number
  reconstructionRmse: number
}

const DATASETS: Record<PcaDatasetKind, PcaPoint2[]> = {
  lecture: [
    { x: 8.6, y: 18.0 },
    { x: 3.4, y: 20.6 },
    { x: 4.6, y: 19.7 },
    { x: 3.4, y: 11.4 },
    { x: 5.4, y: 20.3 },
    { x: 2.2, y: 12.4 },
  ],
  correlated: [
    { x: -3.2, y: -2.55 },
    { x: -2.2, y: -1.35 },
    { x: -1.1, y: -0.95 },
    { x: 0.2, y: 0.18 },
    { x: 1.1, y: 0.95 },
    { x: 2.4, y: 1.52 },
    { x: 3.0, y: 2.45 },
  ],
  orthogonal: [
    { x: -2.4, y: -1.8 },
    { x: -1.8, y: 1.9 },
    { x: -0.7, y: -2.2 },
    { x: 0.6, y: 2.0 },
    { x: 1.8, y: -1.7 },
    { x: 2.5, y: 1.8 },
  ],
}

function clampKeptComponents(value: number) {
  return Math.max(1, Math.min(2, Math.round(value)))
}

function mean(points: PcaPoint2[]): PcaPoint2 {
  return {
    x: points.reduce((acc, point) => acc + point.x, 0) / points.length,
    y: points.reduce((acc, point) => acc + point.y, 0) / points.length,
  }
}

function normalize(vector: PcaPoint2): PcaPoint2 {
  const length = Math.hypot(vector.x, vector.y)
  if (length < 1e-12) return { x: 1, y: 0 }
  const normalized = { x: vector.x / length, y: vector.y / length }
  if (normalized.x < -1e-12 || (Math.abs(normalized.x) < 1e-12 && normalized.y < 0)) {
    return { x: -normalized.x, y: -normalized.y }
  }
  return normalized
}

function covariance(centeredPoints: PcaPoint2[]): [[number, number], [number, number]] {
  const scale = 1 / Math.max(1, centeredPoints.length - 1)
  const xx = centeredPoints.reduce((acc, point) => acc + point.x * point.x, 0) * scale
  const xy = centeredPoints.reduce((acc, point) => acc + point.x * point.y, 0) * scale
  const yy = centeredPoints.reduce((acc, point) => acc + point.y * point.y, 0) * scale
  return [
    [xx, xy],
    [xy, yy],
  ]
}

function eigSymmetric2x2(matrix: [[number, number], [number, number]]): {
  eigenvalues: [number, number]
  principalDirections: [PcaPoint2, PcaPoint2]
} {
  const [[a, b], [, d]] = matrix
  const trace = a + d
  const radius = Math.sqrt((a - d) ** 2 + 4 * b ** 2)
  const first = (trace + radius) / 2
  const second = (trace - radius) / 2

  let firstDirection: PcaPoint2
  if (Math.abs(b) > 1e-12) {
    firstDirection = normalize({ x: b, y: first - a })
  } else {
    firstDirection = a >= d ? { x: 1, y: 0 } : { x: 0, y: 1 }
  }

  const secondDirection = normalize({ x: -firstDirection.y, y: firstDirection.x })
  return {
    eigenvalues: [first, second],
    principalDirections: [firstDirection, secondDirection],
  }
}

function dot(point: PcaPoint2, direction: PcaPoint2) {
  return point.x * direction.x + point.y * direction.y
}

export function pcaLecturePoints(meanShift = 0): PcaPoint2[] {
  return DATASETS.lecture.map((point) => ({
    x: point.x + meanShift,
    y: point.y - meanShift * 0.35,
  }))
}

export function evaluatePcaProjection(input: PcaEvaluationInput): PcaEvaluation {
  const keptComponents = clampKeptComponents(input.keptComponents)
  const meanShift = input.meanShift ?? 0
  const rawPoints = DATASETS[input.datasetKind].map((point) => ({
    x: point.x + meanShift,
    y: point.y - meanShift * 0.35,
  }))
  const pointMean = mean(rawPoints)
  const centeredPoints = rawPoints.map((point) => ({
    x: point.x - pointMean.x,
    y: point.y - pointMean.y,
  }))
  const cov = covariance(centeredPoints)
  const { eigenvalues, principalDirections } = eigSymmetric2x2(cov)
  const totalVariance = Math.max(1e-12, eigenvalues[0] + eigenvalues[1])
  const explainedVariance: [number, number] = [
    eigenvalues[0] / totalVariance,
    eigenvalues[1] / totalVariance,
  ]
  const retainedVariance = explainedVariance.slice(0, keptComponents).reduce((acc, value) => acc + value, 0)

  const projectedScores = centeredPoints.map((point) =>
    principalDirections.map((direction) => dot(point, direction)),
  )
  const reconstructedPoints = projectedScores.map((scores) => {
    const retainedDirections = principalDirections.slice(0, keptComponents)
    return retainedDirections.reduce(
      (acc, direction, index) => ({
        x: acc.x + (scores[index] ?? 0) * direction.x,
        y: acc.y + (scores[index] ?? 0) * direction.y,
      }),
      { x: 0, y: 0 },
    )
  })
  const reconstructionRmse = Math.sqrt(
    centeredPoints.reduce((acc, point, index) => {
      const reconstructed = reconstructedPoints[index]!
      return acc + (point.x - reconstructed.x) ** 2 + (point.y - reconstructed.y) ** 2
    }, 0) / centeredPoints.length,
  )

  return {
    rawPoints,
    centeredPoints,
    reconstructedPoints,
    projectedScores,
    mean: pointMean,
    covariance: cov,
    eigenvalues,
    principalDirections,
    explainedVariance,
    retainedVariance,
    reconstructionRmse,
  }
}
