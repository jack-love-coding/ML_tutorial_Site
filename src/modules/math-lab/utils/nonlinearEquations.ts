import {
  LOGIT_CALIBRATION_ROOT,
  logitCalibrationDerivative,
  logitCalibrationResidual,
} from './logitCalibration.ts'

export type NonlinearFunctionKind = 'calibration' | 'cubic' | 'cosine' | 'flat'

export type RootMethodStatus = 'converged' | 'running' | 'stalled' | 'diverged'

export interface RootIterationPoint {
  iteration: number
  x: number
  fx: number
}

export interface BisectionTrace {
  method: 'bisection'
  approximation: number
  residual: number
  interval: [number, number]
  intervalWidth: number
  functionEvaluations: number
  points: RootIterationPoint[]
  status: RootMethodStatus
}

export interface NewtonTrace {
  method: 'newton'
  approximation: number
  residual: number
  lastStep: number
  functionEvaluations: number
  points: RootIterationPoint[]
  status: RootMethodStatus
}

export interface SecantTrace {
  method: 'secant'
  approximation: number
  residual: number
  lastStep: number
  functionEvaluations: number
  points: RootIterationPoint[]
  status: RootMethodStatus
}

export interface NonlinearRootFindingInput {
  functionKind: NonlinearFunctionKind
  iterations: number
  newtonStart: number
  secantPrevious: number
  secantCurrent?: number
}

export interface NonlinearRootFindingEvaluation {
  functionKind: NonlinearFunctionKind
  trueRoot: number
  domain: [number, number]
  bracket: [number, number]
  bisection: BisectionTrace
  newton: NewtonTrace
  secant: SecantTrace
}

export interface NonlinearFunctionDefinition {
  kind: NonlinearFunctionKind
  label: string
  formula: string
  domain: [number, number]
  bracket: [number, number]
  trueRoot: number
  f: (x: number) => number
  derivative: (x: number) => number
}

export interface NewtonSystemStepInput {
  x: number
  y: number
}

export interface NewtonSystemStepEvaluation {
  value: [number, number]
  jacobian: [[number, number], [number, number]]
  step: [number, number]
  next: [number, number]
  residualNorm: number
  nextResidualNorm: number
  determinant: number
}

const ROOT_TOLERANCE = 1e-10
const SMALL_DENOMINATOR = 1e-12

export const nonlinearFunctionDefinitions: Record<NonlinearFunctionKind, NonlinearFunctionDefinition> = {
  calibration: {
    kind: 'calibration',
    label: 'mean(sigmoid(z+b)) - 0.62',
    formula: 'F(b)=\\operatorname{mean}(\\sigma(z+b))-0.62',
    domain: [-4, 4],
    bracket: [-4, 4],
    trueRoot: LOGIT_CALIBRATION_ROOT,
    f: logitCalibrationResidual,
    derivative: logitCalibrationDerivative,
  },
  cubic: {
    kind: 'cubic',
    label: 'x^3 - x - 1',
    formula: 'f(x)=x^3-x-1',
    domain: [0.6, 2],
    bracket: [1, 2],
    trueRoot: 1.324717957244746,
    f: (x) => x ** 3 - x - 1,
    derivative: (x) => 3 * x ** 2 - 1,
  },
  cosine: {
    kind: 'cosine',
    label: 'cos(x) - x',
    formula: 'f(x)=\\cos(x)-x',
    domain: [-0.1, 1.4],
    bracket: [0, 1],
    trueRoot: 0.739085133215161,
    f: (x) => Math.cos(x) - x,
    derivative: (x) => -Math.sin(x) - 1,
  },
  flat: {
    kind: 'flat',
    label: 'x^3',
    formula: 'f(x)=x^3',
    domain: [-1.3, 1.3],
    bracket: [-1, 1],
    trueRoot: 0,
    f: (x) => x ** 3,
    derivative: (x) => 3 * x ** 2,
  },
}

function clampIterations(iterations: number) {
  return Math.max(0, Math.min(24, Math.round(iterations)))
}

function normalizeX(value: number, domain: [number, number]) {
  if (!Number.isFinite(value)) return (domain[0] + domain[1]) / 2
  return Math.max(domain[0], Math.min(domain[1], value))
}

function rootStatus(residual: number, failed = false): RootMethodStatus {
  if (failed) return 'diverged'
  if (Number.isFinite(residual) && residual <= ROOT_TOLERANCE) return 'converged'
  if (!Number.isFinite(residual)) return 'diverged'
  return 'running'
}

export function iterateBisection(functionKind: NonlinearFunctionKind, iterations: number): BisectionTrace {
  const definition = nonlinearFunctionDefinitions[functionKind]
  let [a, b] = definition.bracket
  let fa = definition.f(a)
  let fb = definition.f(b)
  const points: RootIterationPoint[] = []

  if (Math.sign(fa) === Math.sign(fb)) {
    const midpoint = (a + b) / 2
    return {
      method: 'bisection',
      approximation: midpoint,
      residual: Math.abs(definition.f(midpoint)),
      interval: [a, b],
      intervalWidth: Math.abs(b - a),
      functionEvaluations: 2,
      points,
      status: 'stalled',
    }
  }

  let functionEvaluations = 2
  const totalIterations = clampIterations(iterations)

  for (let iteration = 1; iteration <= totalIterations; iteration += 1) {
    const c = (a + b) / 2
    const fc = definition.f(c)
    functionEvaluations += 1
    points.push({ iteration, x: c, fx: fc })

    if (Math.abs(fc) <= ROOT_TOLERANCE) {
      a = c
      b = c
      break
    }

    if (Math.sign(fa) === Math.sign(fc)) {
      a = c
      fa = fc
    } else {
      b = c
      fb = fc
    }
  }

  const approximation = (a + b) / 2
  const residual = Math.abs(definition.f(approximation))

  return {
    method: 'bisection',
    approximation,
    residual,
    interval: [a, b],
    intervalWidth: Math.abs(b - a),
    functionEvaluations,
    points,
    status: rootStatus(residual),
  }
}

export function iterateNewton(
  functionKind: NonlinearFunctionKind,
  start: number,
  iterations: number,
): NewtonTrace {
  const definition = nonlinearFunctionDefinitions[functionKind]
  let x = normalizeX(start, definition.domain)
  let lastStep = 0
  let functionEvaluations = 1
  let failed = false
  const points: RootIterationPoint[] = [{ iteration: 0, x, fx: definition.f(x) }]
  const totalIterations = clampIterations(iterations)

  for (let iteration = 1; iteration <= totalIterations; iteration += 1) {
    const fx = definition.f(x)
    const dfx = definition.derivative(x)
    functionEvaluations += 2

    if (Math.abs(dfx) <= SMALL_DENOMINATOR) {
      failed = true
      break
    }

    const next = x - fx / dfx
    lastStep = next - x

    if (!Number.isFinite(next) || Math.abs(next) > 100) {
      x = next
      failed = true
      break
    }

    x = next
    points.push({ iteration, x, fx: definition.f(x) })

    if (Math.abs(definition.f(x)) <= ROOT_TOLERANCE) break
  }

  const residual = Math.abs(definition.f(x))

  return {
    method: 'newton',
    approximation: x,
    residual,
    lastStep,
    functionEvaluations,
    points,
    status: rootStatus(residual, failed),
  }
}

export function iterateSecant(
  functionKind: NonlinearFunctionKind,
  previousStart: number,
  currentStart: number,
  iterations: number,
): SecantTrace {
  const definition = nonlinearFunctionDefinitions[functionKind]
  let previous = normalizeX(previousStart, definition.domain)
  let current = normalizeX(currentStart, definition.domain)

  if (Math.abs(previous - current) <= SMALL_DENOMINATOR) {
    previous = Math.max(definition.domain[0], current - 0.4)
  }

  let previousValue = definition.f(previous)
  let currentValue = definition.f(current)
  let lastStep = current - previous
  let functionEvaluations = 2
  let failed = false
  const points: RootIterationPoint[] = [
    { iteration: -1, x: previous, fx: previousValue },
    { iteration: 0, x: current, fx: currentValue },
  ]
  const totalIterations = clampIterations(iterations)

  for (let iteration = 1; iteration <= totalIterations; iteration += 1) {
    const denominator = currentValue - previousValue

    if (Math.abs(denominator) <= SMALL_DENOMINATOR) {
      failed = true
      break
    }

    const next = current - (currentValue * (current - previous)) / denominator
    lastStep = next - current

    if (!Number.isFinite(next) || Math.abs(next) > 100) {
      current = next
      failed = true
      break
    }

    previous = current
    previousValue = currentValue
    current = next
    currentValue = definition.f(current)
    functionEvaluations += 1
    points.push({ iteration, x: current, fx: currentValue })

    if (Math.abs(currentValue) <= ROOT_TOLERANCE) break
  }

  const residual = Math.abs(definition.f(current))

  return {
    method: 'secant',
    approximation: current,
    residual,
    lastStep,
    functionEvaluations,
    points,
    status: rootStatus(residual, failed),
  }
}

export function evaluateNonlinearRootFinding(input: NonlinearRootFindingInput): NonlinearRootFindingEvaluation {
  const definition = nonlinearFunctionDefinitions[input.functionKind]

  return {
    functionKind: input.functionKind,
    trueRoot: definition.trueRoot,
    domain: definition.domain,
    bracket: definition.bracket,
    bisection: iterateBisection(input.functionKind, input.iterations),
    newton: iterateNewton(input.functionKind, input.newtonStart, input.iterations),
    secant: iterateSecant(
      input.functionKind,
      input.secantPrevious,
      input.secantCurrent ?? input.newtonStart,
      input.iterations,
    ),
  }
}

function nonlinearSystemValue(x: number, y: number): [number, number] {
  return [x + 2 * y - 2, x ** 2 + 4 * y ** 2 - 4]
}

function nonlinearSystemJacobian(x: number, y: number): [[number, number], [number, number]] {
  return [
    [1, 2],
    [2 * x, 8 * y],
  ]
}

function vectorNorm2(vector: [number, number]) {
  return Math.hypot(vector[0], vector[1])
}

export function evaluateNewtonSystemStep(input: NewtonSystemStepInput): NewtonSystemStepEvaluation {
  const value = nonlinearSystemValue(input.x, input.y)
  const jacobian = nonlinearSystemJacobian(input.x, input.y)
  const [[a, b], [c, d]] = jacobian
  const determinant = a * d - b * c

  if (Math.abs(determinant) <= SMALL_DENOMINATOR) {
    return {
      value,
      jacobian,
      step: [Number.NaN, Number.NaN],
      next: [Number.NaN, Number.NaN],
      residualNorm: vectorNorm2(value),
      nextResidualNorm: Number.NaN,
      determinant,
    }
  }

  const rhs: [number, number] = [-value[0], -value[1]]
  const step: [number, number] = [
    (d * rhs[0] - b * rhs[1]) / determinant,
    (-c * rhs[0] + a * rhs[1]) / determinant,
  ]
  const next: [number, number] = [input.x + step[0], input.y + step[1]]
  const nextValue = nonlinearSystemValue(next[0], next[1])

  return {
    value,
    jacobian,
    step,
    next,
    residualNorm: vectorNorm2(value),
    nextResidualNorm: vectorNorm2(nextValue),
    determinant,
  }
}
