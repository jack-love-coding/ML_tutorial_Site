export type MlpBackpropBridgeParameter = 'w1' | 'b1' | 'w2' | 'b2'
export type MlpBackpropBridgeDirection = 'increase' | 'decrease' | 'flat'

export interface MlpBackpropBridgeInput {
  x: number
  target: number
  w1: number
  b1: number
  w2: number
  b2: number
  learningRate: number
  inspectedParameter: MlpBackpropBridgeParameter
  predictedDirection: MlpBackpropBridgeDirection
}

export interface MlpBackpropBridgeSnapshot {
  forward: {
    z1: number
    h: number
    yHat: number
    error: number
    loss: number
  }
  localDerivatives: {
    dLossDYHat: number
    dYHatDW2: number
    dYHatDB2: number
    dYHatDH: number
    dHDZ1: number
    dZ1DW1: number
    dZ1DB1: number
  }
  gradients: Record<MlpBackpropBridgeParameter, number>
  updates: Record<MlpBackpropBridgeParameter, {
    before: number
    gradient: number
    after: number
    direction: MlpBackpropBridgeDirection
  }>
  inspected: {
    parameter: MlpBackpropBridgeParameter
    predictedDirection: MlpBackpropBridgeDirection
    actualDirection: MlpBackpropBridgeDirection
    correct: boolean
    explanationKey: 'output-weight' | 'output-bias' | 'hidden-weight' | 'hidden-bias'
  }
}

const defaults: MlpBackpropBridgeInput = {
  x: 1,
  target: 0.5,
  w1: 0.8,
  b1: -0.1,
  w2: 1.2,
  b2: 0,
  learningRate: 0.1,
  inspectedParameter: 'w1',
  predictedDirection: 'decrease',
}

const parameterIds = new Set<MlpBackpropBridgeParameter>(['w1', 'b1', 'w2', 'b2'])
const directionIds = new Set<MlpBackpropBridgeDirection>(['increase', 'decrease', 'flat'])

function finite(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback
}

function safeParameter(value: MlpBackpropBridgeParameter): MlpBackpropBridgeParameter {
  return parameterIds.has(value) ? value : defaults.inspectedParameter
}

function safeDirection(value: MlpBackpropBridgeDirection): MlpBackpropBridgeDirection {
  return directionIds.has(value) ? value : defaults.predictedDirection
}

function direction(delta: number): MlpBackpropBridgeDirection {
  if (Math.abs(delta) < 1e-8) return 'flat'
  return delta > 0 ? 'increase' : 'decrease'
}

function explanationKey(parameter: MlpBackpropBridgeParameter): MlpBackpropBridgeSnapshot['inspected']['explanationKey'] {
  if (parameter === 'w2') return 'output-weight'
  if (parameter === 'b2') return 'output-bias'
  if (parameter === 'w1') return 'hidden-weight'
  return 'hidden-bias'
}

export function evaluateMlpBackpropBridge(input: MlpBackpropBridgeInput): MlpBackpropBridgeSnapshot {
  const safe = {
    x: finite(input.x, defaults.x),
    target: finite(input.target, defaults.target),
    w1: finite(input.w1, defaults.w1),
    b1: finite(input.b1, defaults.b1),
    w2: finite(input.w2, defaults.w2),
    b2: finite(input.b2, defaults.b2),
    learningRate: Math.max(0, finite(input.learningRate, defaults.learningRate)),
    inspectedParameter: safeParameter(input.inspectedParameter),
    predictedDirection: safeDirection(input.predictedDirection),
  }

  const z1 = safe.w1 * safe.x + safe.b1
  const h = Math.tanh(z1)
  const yHat = safe.w2 * h + safe.b2
  const error = yHat - safe.target
  const loss = 0.5 * error ** 2
  const dHDZ1 = 1 - h ** 2
  const dLossDZ1 = error * safe.w2 * dHDZ1
  const gradients: Record<MlpBackpropBridgeParameter, number> = {
    w1: dLossDZ1 * safe.x,
    b1: dLossDZ1,
    w2: error * h,
    b2: error,
  }
  const params: Record<MlpBackpropBridgeParameter, number> = {
    w1: safe.w1,
    b1: safe.b1,
    w2: safe.w2,
    b2: safe.b2,
  }
  const updates = Object.fromEntries(
    (Object.keys(params) as MlpBackpropBridgeParameter[]).map((parameter) => {
      const before = params[parameter]
      const gradient = gradients[parameter]
      const after = before - safe.learningRate * gradient

      return [parameter, { before, gradient, after, direction: direction(after - before) }]
    }),
  ) as MlpBackpropBridgeSnapshot['updates']

  const actualDirection = updates[safe.inspectedParameter].direction

  return {
    forward: { z1, h, yHat, error, loss },
    localDerivatives: {
      dLossDYHat: error,
      dYHatDW2: h,
      dYHatDB2: 1,
      dYHatDH: safe.w2,
      dHDZ1,
      dZ1DW1: safe.x,
      dZ1DB1: 1,
    },
    gradients,
    updates,
    inspected: {
      parameter: safe.inspectedParameter,
      predictedDirection: safe.predictedDirection,
      actualDirection,
      correct: safe.predictedDirection === actualDirection,
      explanationKey: explanationKey(safe.inspectedParameter),
    },
  }
}
