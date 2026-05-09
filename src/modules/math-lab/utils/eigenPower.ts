export type EigenPowerMatrixKind = 'well-separated' | 'slow-gap' | 'sign-flip'

export interface EigenPowerEvaluationInput {
  matrixKind: EigenPowerMatrixKind
  iterations: number
  initialAngleRadians: number
}

export interface EigenPowerEvaluation {
  matrix: [[number, number], [number, number]]
  vector: [number, number]
  dominantEigenvalue: number
  secondaryEigenvalue: number
  dominantEigenvector: [number, number]
  rayleighQuotient: number
  residualNorm: number
  spectralRatio: number
  iterates: Array<[number, number]>
}

export function matrixForEigenPowerKind(kind: EigenPowerMatrixKind): [[number, number], [number, number]] {
  if (kind === 'slow-gap') {
    return [
      [2.1, 0.15],
      [0.15, 1.9],
    ]
  }

  if (kind === 'sign-flip') {
    return [
      [-3, 0],
      [0, 1.2],
    ]
  }

  return [
    [2, 1],
    [1, 3],
  ]
}

function multiply2x2(matrix: [[number, number], [number, number]], vector: [number, number]): [number, number] {
  return [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
  ]
}

function dot(a: [number, number], b: [number, number]) {
  return a[0] * b[0] + a[1] * b[1]
}

function norm2(vector: [number, number]) {
  return Math.hypot(vector[0], vector[1])
}

function normalize(vector: [number, number]): [number, number] {
  const length = norm2(vector)
  if (length === 0) return [1, 0]
  return [vector[0] / length, vector[1] / length]
}

function eigenvalues2x2(matrix: [[number, number], [number, number]]): [number, number] {
  const trace = matrix[0][0] + matrix[1][1]
  const determinant = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
  const discriminant = Math.max(trace * trace - 4 * determinant, 0)
  const root = Math.sqrt(discriminant)
  const first = (trace + root) / 2
  const second = (trace - root) / 2
  return Math.abs(first) >= Math.abs(second) ? [first, second] : [second, first]
}

function eigenvectorFor(matrix: [[number, number], [number, number]], eigenvalue: number): [number, number] {
  const aMinusLambda = matrix[0][0] - eigenvalue
  const b = matrix[0][1]
  const c = matrix[1][0]
  const dMinusLambda = matrix[1][1] - eigenvalue

  if (Math.abs(b) + Math.abs(aMinusLambda) > Math.abs(c) + Math.abs(dMinusLambda)) {
    return normalize([b, -aMinusLambda])
  }

  return normalize([-dMinusLambda, c])
}

export function evaluatePowerIteration(input: EigenPowerEvaluationInput): EigenPowerEvaluation {
  const matrix = matrixForEigenPowerKind(input.matrixKind)
  const [dominantEigenvalue, secondaryEigenvalue] = eigenvalues2x2(matrix)
  const dominantEigenvector = eigenvectorFor(matrix, dominantEigenvalue)
  const iterations = Math.max(0, Math.floor(input.iterations))

  let vector = normalize([Math.cos(input.initialAngleRadians), Math.sin(input.initialAngleRadians)])
  const iterates: Array<[number, number]> = [vector]

  for (let step = 0; step < iterations; step += 1) {
    vector = normalize(multiply2x2(matrix, vector))
    iterates.push(vector)
  }

  const av = multiply2x2(matrix, vector)
  const rayleighQuotient = dot(vector, av) / dot(vector, vector)
  const residual = [av[0] - rayleighQuotient * vector[0], av[1] - rayleighQuotient * vector[1]] as [number, number]

  return {
    matrix,
    vector,
    dominantEigenvalue,
    secondaryEigenvalue,
    dominantEigenvector,
    rayleighQuotient,
    residualNorm: norm2(residual),
    spectralRatio: Math.abs(secondaryEigenvalue) / Math.abs(dominantEigenvalue),
    iterates,
  }
}
