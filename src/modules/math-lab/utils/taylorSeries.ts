export type TaylorFunctionKey = 'sin' | 'cos' | 'exp'

export interface TaylorFunctionDefinition {
  key: TaylorFunctionKey
  label: string
  formula: string
}

export const taylorFunctionDefinitions: TaylorFunctionDefinition[] = [
  {
    key: 'sin',
    label: 'sin(x)',
    formula: '\\sin x',
  },
  {
    key: 'cos',
    label: 'cos(x)',
    formula: '\\cos x',
  },
  {
    key: 'exp',
    label: 'exp(x)',
    formula: 'e^x',
  },
]

export function factorial(n: number) {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error(`factorial expects a non-negative integer, received ${n}`)
  }

  let value = 1
  for (let index = 2; index <= n; index += 1) {
    value *= index
  }
  return value
}

export function evaluateTaylorFunction(functionKey: TaylorFunctionKey, x: number) {
  if (functionKey === 'sin') return Math.sin(x)
  if (functionKey === 'cos') return Math.cos(x)
  return Math.exp(x)
}

export function evaluateTaylorDerivative(functionKey: TaylorFunctionKey, x: number, order: number) {
  if (functionKey === 'exp') return Math.exp(x)

  const cycleIndex = ((order % 4) + 4) % 4
  if (functionKey === 'sin') {
    if (cycleIndex === 0) return Math.sin(x)
    if (cycleIndex === 1) return Math.cos(x)
    if (cycleIndex === 2) return -Math.sin(x)
    return -Math.cos(x)
  }

  if (cycleIndex === 0) return Math.cos(x)
  if (cycleIndex === 1) return -Math.sin(x)
  if (cycleIndex === 2) return -Math.cos(x)
  return Math.sin(x)
}

export function evaluateTaylorPolynomial(
  functionKey: TaylorFunctionKey,
  x: number,
  center: number,
  degree: number,
) {
  let total = 0
  const offset = x - center

  for (let order = 0; order <= degree; order += 1) {
    total += (evaluateTaylorDerivative(functionKey, center, order) / factorial(order)) * offset ** order
  }

  return total
}

export function estimateNextTaylorTerm(
  functionKey: TaylorFunctionKey,
  x: number,
  center: number,
  degree: number,
) {
  const nextOrder = degree + 1
  return Math.abs(
    (evaluateTaylorDerivative(functionKey, center, nextOrder) / factorial(nextOrder)) * (x - center) ** nextOrder,
  )
}

export function boundTaylorRemainder(
  functionKey: TaylorFunctionKey,
  x: number,
  center: number,
  degree: number,
) {
  const nextOrder = degree + 1
  const distance = Math.abs(x - center)
  if (distance === 0) return 0

  const derivativeBound = functionKey === 'exp' ? Math.exp(Math.max(x, center)) : 1
  return (derivativeBound * distance ** nextOrder) / factorial(nextOrder)
}

export function evaluateTaylorApproximation(
  functionKey: TaylorFunctionKey,
  x: number,
  center: number,
  degree: number,
) {
  const actual = evaluateTaylorFunction(functionKey, x)
  const approximation = evaluateTaylorPolynomial(functionKey, x, center, degree)

  return {
    actual,
    approximation,
    error: Math.abs(actual - approximation),
    nextTermEstimate: estimateNextTaylorTerm(functionKey, x, center, degree),
    remainderBound: boundTaylorRemainder(functionKey, x, center, degree),
  }
}
