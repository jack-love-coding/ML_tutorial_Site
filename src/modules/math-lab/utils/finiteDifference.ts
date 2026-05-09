export type FiniteDifferenceMethod = 'forward' | 'backward' | 'central'

export type FiniteDifferenceFunctionKind = 'exp-shift' | 'quadratic'

export type Vector2Tuple = [number, number]

export type Matrix2Tuple = [[number, number], [number, number]]

export interface FiniteDifferenceEvaluationInput {
  functionKind: FiniteDifferenceFunctionKind
  method: FiniteDifferenceMethod
  x: number
  h: number
}

export interface FiniteDifferenceEvaluation {
  functionValue: number
  exactDerivative: number
  approximation: number
  absoluteError: number
  truncationOrder: 1 | 2
  functionEvaluations: number
  roundingEstimate: number
  totalErrorEstimate: number
  stencil: Array<{ x: number; y: number }>
  curve: Array<{ x: number; y: number }>
}

export interface FiniteDifferenceGradientEvaluation {
  approximation: Vector2Tuple
  exact: Vector2Tuple
  absoluteError: Vector2Tuple
  errorNorm: number
}

export interface FiniteDifferenceJacobianEvaluation {
  approximation: Matrix2Tuple
  exact: Matrix2Tuple
  absoluteError: Matrix2Tuple
  maxError: number
}

const MACHINE_EPSILON = Number.EPSILON

function lectureFunction(kind: FiniteDifferenceFunctionKind, x: number) {
  if (kind === 'quadratic') return 2 * x ** 2 + 15 * x + 1
  return Math.exp(x) - 2
}

function lectureDerivative(kind: FiniteDifferenceFunctionKind, x: number) {
  if (kind === 'quadratic') return 4 * x + 15
  return Math.exp(x)
}

function estimateCurvatureBound(kind: FiniteDifferenceFunctionKind, x: number) {
  if (kind === 'quadratic') return 4
  return Math.exp(Math.abs(x) + 1)
}

export function finiteDifferenceDerivative(
  fn: (x: number) => number,
  x: number,
  h: number,
  method: FiniteDifferenceMethod,
) {
  if (h <= 0) return Number.NaN

  if (method === 'central') {
    return (fn(x + h) - fn(x - h)) / (2 * h)
  }

  if (method === 'backward') {
    return (fn(x) - fn(x - h)) / h
  }

  return (fn(x + h) - fn(x)) / h
}

export function evaluateFiniteDifference(input: FiniteDifferenceEvaluationInput): FiniteDifferenceEvaluation {
  const h = Math.max(input.h, Number.MIN_VALUE)
  const fn = (value: number) => lectureFunction(input.functionKind, value)
  const exactDerivative = lectureDerivative(input.functionKind, input.x)
  const approximation = finiteDifferenceDerivative(fn, input.x, h, input.method)
  const functionValue = fn(input.x)
  const absoluteError = Math.abs(approximation - exactDerivative)
  const truncationOrder = input.method === 'central' ? 2 : 1
  const functionEvaluations = input.method === 'central' ? 2 : 1
  const curvatureBound = estimateCurvatureBound(input.functionKind, input.x)
  const truncationEstimate = truncationOrder === 2 ? curvatureBound * h ** 2 : curvatureBound * h
  const roundingEstimate = (MACHINE_EPSILON * Math.max(1, Math.abs(functionValue))) / h

  return {
    functionValue,
    exactDerivative,
    approximation,
    absoluteError,
    truncationOrder,
    functionEvaluations,
    roundingEstimate,
    totalErrorEstimate: truncationEstimate + roundingEstimate,
    stencil: stencilPoints(fn, input.x, h, input.method),
    curve: sampleCurve(fn, input.x),
  }
}

export function finiteDifferenceGradient2D(
  fn: (point: Vector2Tuple) => number,
  point: Vector2Tuple,
  h: number,
  method: FiniteDifferenceMethod,
): Vector2Tuple {
  const [x1, x2] = point
  return [
    finiteDifferenceDerivative((value) => fn([value, x2]), x1, h, method),
    finiteDifferenceDerivative((value) => fn([x1, value]), x2, h, method),
  ]
}

export function finiteDifferenceJacobian2D(
  fn: (point: Vector2Tuple) => Vector2Tuple,
  point: Vector2Tuple,
  h: number,
  method: FiniteDifferenceMethod,
): Matrix2Tuple {
  const [x1, x2] = point
  const columnOne = differenceVector(() => fn([x1 + h, x2]), () => fn([x1 - h, x2]), () => fn([x1, x2]), h, method)
  const columnTwo = differenceVector(() => fn([x1, x2 + h]), () => fn([x1, x2 - h]), () => fn([x1, x2]), h, method)

  return [
    [columnOne[0], columnTwo[0]],
    [columnOne[1], columnTwo[1]],
  ]
}

export function evaluateLectureGradient(h: number, method: FiniteDifferenceMethod): FiniteDifferenceGradientEvaluation {
  const point: Vector2Tuple = [1.3, 4.9]
  const approximation = finiteDifferenceGradient2D(lectureGradientFunction, point, h, method)
  const exact = exactLectureGradient(point)
  const absoluteError: Vector2Tuple = [
    Math.abs(approximation[0] - exact[0]),
    Math.abs(approximation[1] - exact[1]),
  ]

  return {
    approximation,
    exact,
    absoluteError,
    errorNorm: Math.hypot(absoluteError[0], absoluteError[1]),
  }
}

export function evaluateLectureJacobian(h: number, method: FiniteDifferenceMethod): FiniteDifferenceJacobianEvaluation {
  const point: Vector2Tuple = [3, 7]
  const approximation = finiteDifferenceJacobian2D(lectureJacobianFunction, point, h, method)
  const exact = exactLectureJacobian(point)
  const absoluteError = approximation.map((row, rowIndex) =>
    row.map((value, columnIndex) => Math.abs(value - exact[rowIndex]![columnIndex]!)),
  ) as Matrix2Tuple

  return {
    approximation,
    exact,
    absoluteError,
    maxError: Math.max(...absoluteError.flat()),
  }
}

function lectureGradientFunction(point: Vector2Tuple) {
  const [x1, x2] = point
  return 2 * x1 + x1 ** 2 * x2 + x2 ** 3
}

function exactLectureGradient(point: Vector2Tuple): Vector2Tuple {
  const [x1, x2] = point
  return [2 + 2 * x1 * x2, x1 ** 2 + 3 * x2 ** 2]
}

function lectureJacobianFunction(point: Vector2Tuple): Vector2Tuple {
  const [x1, x2] = point
  return [2 * x1 ** 2 + 6 * x1 * x2, 3 * x1 + 7 * x2]
}

function exactLectureJacobian(point: Vector2Tuple): Matrix2Tuple {
  const [x1, x2] = point
  return [
    [4 * x1 + 6 * x2, 6 * x1],
    [3, 7],
  ]
}

function differenceVector(
  forward: () => Vector2Tuple,
  backward: () => Vector2Tuple,
  current: () => Vector2Tuple,
  h: number,
  method: FiniteDifferenceMethod,
): Vector2Tuple {
  if (method === 'central') {
    const right = forward()
    const left = backward()
    return [(right[0] - left[0]) / (2 * h), (right[1] - left[1]) / (2 * h)]
  }

  if (method === 'backward') {
    const now = current()
    const left = backward()
    return [(now[0] - left[0]) / h, (now[1] - left[1]) / h]
  }

  const right = forward()
  const now = current()
  return [(right[0] - now[0]) / h, (right[1] - now[1]) / h]
}

function stencilPoints(fn: (x: number) => number, x: number, h: number, method: FiniteDifferenceMethod) {
  if (method === 'central') {
    return [
      { x: x - h, y: fn(x - h) },
      { x: x + h, y: fn(x + h) },
    ]
  }

  if (method === 'backward') {
    return [
      { x: x - h, y: fn(x - h) },
      { x, y: fn(x) },
    ]
  }

  return [
    { x, y: fn(x) },
    { x: x + h, y: fn(x + h) },
  ]
}

function sampleCurve(fn: (x: number) => number, center: number) {
  return Array.from({ length: 81 }, (_, index) => {
    const x = center - 1.2 + (index / 80) * 2.4
    return { x, y: fn(x) }
  })
}
