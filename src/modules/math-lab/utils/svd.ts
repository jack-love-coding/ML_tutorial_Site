export type SvdSpectrumKind = 'lecture' | 'image' | 'ill-conditioned'

export interface SvdLowRankInput {
  spectrumKind: SvdSpectrumKind
  keptRank: number
  tolerance?: number
}

export interface SvdLowRankEvaluation {
  singularValues: number[]
  keptRank: number
  effectiveRank: number
  retainedEnergy: number
  spectralError: number
  frobeniusError: number
  conditionNumber: number
  originalMatrix: number[][]
  approximationMatrix: number[][]
  residualMatrix: number[][]
  originalStorage: number
  compressedStorage: number
}

const spectra: Record<SvdSpectrumKind, number[]> = {
  lecture: [20.916, 6.53207, 4.22807, 0],
  image: [9.2, 3.4, 1.25, 0.42],
  'ill-conditioned': [7.8, 0.78, 0.078, 0.0078],
}

const leftBasis = [
  [0.5, 0.5, 0.5, 0.5],
  [0.5, -0.5, 0.5, -0.5],
  [0.5, -0.5, -0.5, 0.5],
  [0.5, 0.5, -0.5, -0.5],
]

const rightBasis = [
  [0.5, 0.5, 0.5, 0.5],
  [0.5, 0.5, -0.5, -0.5],
  [0.5, -0.5, -0.5, 0.5],
  [0.5, -0.5, 0.5, -0.5],
]

function clampRank(keptRank: number, size: number) {
  return Math.max(1, Math.min(size, Math.round(keptRank)))
}

function zeros(rows: number, columns: number) {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => 0))
}

function outerProduct(left: number[], right: number[]) {
  return left.map((leftValue) => right.map((rightValue) => leftValue * rightValue))
}

function addScaled(target: number[][], matrix: number[][], scale: number) {
  for (let row = 0; row < target.length; row += 1) {
    for (let column = 0; column < target[row]!.length; column += 1) {
      target[row]![column] += scale * matrix[row]![column]!
    }
  }
}

function buildMatrix(singularValues: number[], terms: number) {
  const matrix = zeros(leftBasis.length, rightBasis.length)

  for (let index = 0; index < terms; index += 1) {
    addScaled(matrix, outerProduct(leftBasis[index]!, rightBasis[index]!), singularValues[index] ?? 0)
  }

  return matrix
}

function subtractMatrices(left: number[][], right: number[][]) {
  return left.map((row, rowIndex) => row.map((value, columnIndex) => value - right[rowIndex]![columnIndex]!))
}

export function evaluateSvdLowRank(input: SvdLowRankInput): SvdLowRankEvaluation {
  const singularValues = spectra[input.spectrumKind]
  const keptRank = clampRank(input.keptRank, singularValues.length)
  const tolerance = input.tolerance ?? 1e-10
  const totalEnergy = singularValues.reduce((acc, value) => acc + value ** 2, 0)
  const retainedEnergy = singularValues
    .slice(0, keptRank)
    .reduce((acc, value) => acc + value ** 2, 0) / totalEnergy
  const tail = singularValues.slice(keptRank)
  const positiveSingularValues = singularValues.filter((value) => value > tolerance)
  const effectiveRank = positiveSingularValues.length
  const smallestPositive = positiveSingularValues.at(-1)
  const conditionNumber = smallestPositive ? singularValues[0]! / smallestPositive : Number.POSITIVE_INFINITY
  const originalMatrix = buildMatrix(singularValues, singularValues.length)
  const approximationMatrix = buildMatrix(singularValues, keptRank)
  const residualMatrix = subtractMatrices(originalMatrix, approximationMatrix)

  return {
    singularValues: [...singularValues],
    keptRank,
    effectiveRank,
    retainedEnergy,
    spectralError: tail[0] ?? 0,
    frobeniusError: Math.sqrt(tail.reduce((acc, value) => acc + value ** 2, 0)),
    conditionNumber,
    originalMatrix,
    approximationMatrix,
    residualMatrix,
    originalStorage: 160 * 120,
    compressedStorage: keptRank * (160 + 120 + 1),
  }
}
