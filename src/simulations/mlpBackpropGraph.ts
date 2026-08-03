export type MlpBackpropGraphMode = 'scalar' | 'expanded'
export type MlpBackpropPresetId = 'normal' | 'saturated' | 'branching'
export type MlpBackpropPhase = 'idle' | 'forward' | 'backward' | 'update'

export type MlpBackpropParameterId =
  | 'w1_11'
  | 'w1_12'
  | 'w1_21'
  | 'w1_22'
  | 'b1_1'
  | 'b1_2'
  | 'w2_1'
  | 'w2_2'
  | 'b2'

export interface MlpBackpropValues {
  inputs: [number, number]
  target: number
  w1: [[number, number], [number, number]]
  b1: [number, number]
  w2: [number, number]
  b2: number
  learningRate: number
}

export interface MlpBackpropGraphState {
  mode: MlpBackpropGraphMode
  preset: MlpBackpropPresetId
  phase: MlpBackpropPhase
  cursor: number
  values: MlpBackpropValues
}

export interface MlpBackpropNodeSnapshot {
  id: string
  label: string
  kind: 'input' | 'affine' | 'activation' | 'prediction' | 'target' | 'loss'
  value: number
  adjoint: number
  stage: number
}

export interface MlpBackpropEdgeSnapshot {
  id: string
  sourceId: string
  targetId: string
  label: string
  localDerivative: number
  backwardContribution: number
  parameterId?: MlpBackpropParameterId
}

export interface MlpBackpropParameterUpdate {
  id: MlpBackpropParameterId
  label: string
  before: number
  gradient: number
  delta: number
  after: number
}

export interface MlpBackpropTapeStep {
  id: string
  phase: Exclude<MlpBackpropPhase, 'idle'>
  targetId: string
  kind: 'node' | 'edge' | 'parameter'
}

export interface MlpBackpropGradientCheck {
  parameterId: MlpBackpropParameterId
  analytic: number
  numerical: number
  relativeError: number
}

export interface MlpBackpropGraphSnapshot {
  state: MlpBackpropGraphState
  forward: {
    z1: [number, number]
    hidden: [number, number]
    z2: number
    prediction: number
    error: number
    loss: number
  }
  reverse: {
    outputDelta: number
    hiddenAdjoints: [number, number]
    hiddenDeltas: [number, number]
    inputAdjoints: [number, number]
    gradientNorm: number
  }
  nodes: MlpBackpropNodeSnapshot[]
  edges: MlpBackpropEdgeSnapshot[]
  updates: MlpBackpropParameterUpdate[]
  updatedValues: MlpBackpropValues
  lossAfterUpdate: number
  tape: MlpBackpropTapeStep[]
  gradientChecks: MlpBackpropGradientCheck[]
}

const NORMAL_VALUES: MlpBackpropValues = {
  inputs: [1.2, -0.6],
  target: 0.4,
  w1: [[0.7, -0.4], [0.3, 0.6]],
  b1: [-0.2, 0.1],
  w2: [1.1, -0.8],
  b2: 0.05,
  learningRate: 0.1,
}

const SATURATED_VALUES: MlpBackpropValues = {
  inputs: [2, 1],
  target: 0.6,
  w1: [[4, 2], [-4, -2]],
  b1: [2, -2],
  w2: [0.7, -0.5],
  b2: 0.1,
  learningRate: 0.1,
}

const BRANCHING_VALUES: MlpBackpropValues = {
  inputs: [1, -0.5],
  target: 0.8,
  w1: [[0.6, -0.4], [-0.3, 0.8]],
  b1: [0.1, -0.2],
  w2: [0.9, -0.7],
  b2: 0.05,
  learningRate: 0.1,
}

const PRESETS: Record<MlpBackpropPresetId, MlpBackpropValues> = {
  normal: NORMAL_VALUES,
  saturated: SATURATED_VALUES,
  branching: BRANCHING_VALUES,
}

const PARAMETER_IDS: MlpBackpropParameterId[] = [
  'w1_11', 'w1_12', 'w1_21', 'w1_22', 'b1_1', 'b1_2', 'w2_1', 'w2_2', 'b2',
]

function copyValues(values: MlpBackpropValues): MlpBackpropValues {
  return {
    inputs: [...values.inputs] as [number, number],
    target: values.target,
    w1: values.w1.map((row) => [...row]) as MlpBackpropValues['w1'],
    b1: [...values.b1] as [number, number],
    w2: [...values.w2] as [number, number],
    b2: values.b2,
    learningRate: values.learningRate,
  }
}

function finiteInRange(value: number, fallback: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value)) return fallback
  return Math.min(maximum, Math.max(minimum, value))
}

export function normalizeMlpBackpropValues(
  candidate: Partial<MlpBackpropValues> | undefined,
  fallback: MlpBackpropValues = NORMAL_VALUES,
): MlpBackpropValues {
  const input = candidate ?? {}
  const inputs = input.inputs ?? fallback.inputs
  const w1 = input.w1 ?? fallback.w1
  const b1 = input.b1 ?? fallback.b1
  const w2 = input.w2 ?? fallback.w2

  return {
    inputs: [
      finiteInRange(inputs[0], fallback.inputs[0], -2, 2),
      finiteInRange(inputs[1], fallback.inputs[1], -2, 2),
    ],
    target: finiteInRange(input.target ?? fallback.target, fallback.target, -1, 1),
    w1: [
      [
        finiteInRange(w1[0]?.[0], fallback.w1[0][0], -5, 5),
        finiteInRange(w1[0]?.[1], fallback.w1[0][1], -5, 5),
      ],
      [
        finiteInRange(w1[1]?.[0], fallback.w1[1][0], -5, 5),
        finiteInRange(w1[1]?.[1], fallback.w1[1][1], -5, 5),
      ],
    ],
    b1: [
      finiteInRange(b1[0], fallback.b1[0], -3, 3),
      finiteInRange(b1[1], fallback.b1[1], -3, 3),
    ],
    w2: [
      finiteInRange(w2[0], fallback.w2[0], -5, 5),
      finiteInRange(w2[1], fallback.w2[1], -5, 5),
    ],
    b2: finiteInRange(input.b2 ?? fallback.b2, fallback.b2, -3, 3),
    learningRate: finiteInRange(input.learningRate ?? fallback.learningRate, fallback.learningRate, 0, 1),
  }
}

export function createMlpBackpropGraphState(
  preset: MlpBackpropPresetId = 'normal',
  mode: MlpBackpropGraphMode = preset === 'branching' ? 'expanded' : 'scalar',
): MlpBackpropGraphState {
  return {
    mode,
    preset,
    phase: 'idle',
    cursor: -1,
    values: copyValues(PRESETS[preset]),
  }
}

export function valuesForMlpBackpropPreset(preset: MlpBackpropPresetId) {
  return copyValues(PRESETS[preset])
}

function activeCounts(mode: MlpBackpropGraphMode) {
  return mode === 'scalar' ? { inputs: 1, hidden: 1 } : { inputs: 2, hidden: 2 }
}

function forwardOnly(values: MlpBackpropValues, mode: MlpBackpropGraphMode) {
  const counts = activeCounts(mode)
  const z1: [number, number] = [0, 0]
  const hidden: [number, number] = [0, 0]

  for (let hiddenIndex = 0; hiddenIndex < counts.hidden; hiddenIndex += 1) {
    let total = values.b1[hiddenIndex]
    for (let inputIndex = 0; inputIndex < counts.inputs; inputIndex += 1) {
      total += values.w1[hiddenIndex][inputIndex] * values.inputs[inputIndex]
    }
    z1[hiddenIndex] = total
    hidden[hiddenIndex] = Math.tanh(total)
  }

  let z2 = values.b2
  for (let hiddenIndex = 0; hiddenIndex < counts.hidden; hiddenIndex += 1) {
    z2 += values.w2[hiddenIndex] * hidden[hiddenIndex]
  }
  const prediction = Math.tanh(z2)
  const error = prediction - values.target
  const loss = 0.5 * error ** 2

  return { z1, hidden, z2, prediction, error, loss }
}

function parameterValue(values: MlpBackpropValues, id: MlpBackpropParameterId) {
  if (id === 'b2') return values.b2
  if (id === 'b1_1') return values.b1[0]
  if (id === 'b1_2') return values.b1[1]
  if (id === 'w2_1') return values.w2[0]
  if (id === 'w2_2') return values.w2[1]
  const [, hidden, input] = id.match(/^w1_(\d)(\d)$/) ?? []
  return values.w1[Number(hidden) - 1][Number(input) - 1]
}

function setParameter(values: MlpBackpropValues, id: MlpBackpropParameterId, value: number) {
  if (id === 'b2') values.b2 = value
  else if (id === 'b1_1') values.b1[0] = value
  else if (id === 'b1_2') values.b1[1] = value
  else if (id === 'w2_1') values.w2[0] = value
  else if (id === 'w2_2') values.w2[1] = value
  else {
    const [, hidden, input] = id.match(/^w1_(\d)(\d)$/) ?? []
    values.w1[Number(hidden) - 1][Number(input) - 1] = value
  }
}

function parameterLabel(id: MlpBackpropParameterId) {
  const labels: Record<MlpBackpropParameterId, string> = {
    w1_11: 'W¹₁₁', w1_12: 'W¹₁₂', w1_21: 'W¹₂₁', w1_22: 'W¹₂₂',
    b1_1: 'b¹₁', b1_2: 'b¹₂', w2_1: 'W²₁', w2_2: 'W²₂', b2: 'b²',
  }
  return labels[id]
}

function activeParameterIds(mode: MlpBackpropGraphMode) {
  return mode === 'scalar'
    ? (['w1_11', 'b1_1', 'w2_1', 'b2'] as MlpBackpropParameterId[])
    : PARAMETER_IDS
}

export function evaluateMlpBackpropGraph(inputState: MlpBackpropGraphState): MlpBackpropGraphSnapshot {
  const preset = inputState.preset in PRESETS ? inputState.preset : 'normal'
  const mode: MlpBackpropGraphMode = inputState.mode === 'expanded' ? 'expanded' : 'scalar'
  const values = normalizeMlpBackpropValues(inputState.values, PRESETS[preset])
  const state: MlpBackpropGraphState = {
    mode,
    preset,
    phase: ['idle', 'forward', 'backward', 'update'].includes(inputState.phase) ? inputState.phase : 'idle',
    cursor: Number.isFinite(inputState.cursor) ? Math.max(-1, Math.trunc(inputState.cursor)) : -1,
    values,
  }
  const counts = activeCounts(mode)
  const forward = forwardOnly(values, mode)

  const outputDelta = forward.error * (1 - forward.prediction ** 2)
  const hiddenAdjoints: [number, number] = [0, 0]
  const hiddenDeltas: [number, number] = [0, 0]
  const inputAdjoints: [number, number] = [0, 0]
  const gradients = new Map<MlpBackpropParameterId, number>()

  gradients.set('b2', outputDelta)
  for (let hiddenIndex = 0; hiddenIndex < counts.hidden; hiddenIndex += 1) {
    hiddenAdjoints[hiddenIndex] = outputDelta * values.w2[hiddenIndex]
    hiddenDeltas[hiddenIndex] = hiddenAdjoints[hiddenIndex] * (1 - forward.hidden[hiddenIndex] ** 2)
    gradients.set(`w2_${hiddenIndex + 1}` as MlpBackpropParameterId, outputDelta * forward.hidden[hiddenIndex])
    gradients.set(`b1_${hiddenIndex + 1}` as MlpBackpropParameterId, hiddenDeltas[hiddenIndex])
    for (let inputIndex = 0; inputIndex < counts.inputs; inputIndex += 1) {
      gradients.set(
        `w1_${hiddenIndex + 1}${inputIndex + 1}` as MlpBackpropParameterId,
        hiddenDeltas[hiddenIndex] * values.inputs[inputIndex],
      )
      inputAdjoints[inputIndex] += hiddenDeltas[hiddenIndex] * values.w1[hiddenIndex][inputIndex]
    }
  }

  const updatedValues = copyValues(values)
  const updates = activeParameterIds(mode).map<MlpBackpropParameterUpdate>((id) => {
    const before = parameterValue(values, id)
    const gradient = gradients.get(id) ?? 0
    const delta = -values.learningRate * gradient
    const after = before + delta
    setParameter(updatedValues, id, after)
    return { id, label: parameterLabel(id), before, gradient, delta, after }
  })

  const nodes: MlpBackpropNodeSnapshot[] = []
  for (let inputIndex = 0; inputIndex < counts.inputs; inputIndex += 1) {
    nodes.push({
      id: `x${inputIndex + 1}`, label: `x${inputIndex + 1}`, kind: 'input', value: values.inputs[inputIndex],
      adjoint: inputAdjoints[inputIndex], stage: 0,
    })
  }
  for (let hiddenIndex = 0; hiddenIndex < counts.hidden; hiddenIndex += 1) {
    nodes.push(
      { id: `z1_${hiddenIndex + 1}`, label: `z¹${hiddenIndex + 1}`, kind: 'affine', value: forward.z1[hiddenIndex], adjoint: hiddenDeltas[hiddenIndex], stage: 1 },
      { id: `h${hiddenIndex + 1}`, label: `h${hiddenIndex + 1}`, kind: 'activation', value: forward.hidden[hiddenIndex], adjoint: hiddenAdjoints[hiddenIndex], stage: 2 },
    )
  }
  nodes.push(
    { id: 'z2', label: 'z²', kind: 'affine', value: forward.z2, adjoint: outputDelta, stage: 3 },
    { id: 'prediction', label: 'ŷ', kind: 'prediction', value: forward.prediction, adjoint: forward.error, stage: 4 },
    { id: 'target', label: 'y', kind: 'target', value: values.target, adjoint: -forward.error, stage: 4 },
    { id: 'loss', label: 'L', kind: 'loss', value: forward.loss, adjoint: 1, stage: 5 },
  )

  const edges: MlpBackpropEdgeSnapshot[] = []
  for (let hiddenIndex = 0; hiddenIndex < counts.hidden; hiddenIndex += 1) {
    for (let inputIndex = 0; inputIndex < counts.inputs; inputIndex += 1) {
      const parameterId = `w1_${hiddenIndex + 1}${inputIndex + 1}` as MlpBackpropParameterId
      edges.push({
        id: `x${inputIndex + 1}-z1_${hiddenIndex + 1}`,
        sourceId: `x${inputIndex + 1}`,
        targetId: `z1_${hiddenIndex + 1}`,
        label: parameterLabel(parameterId),
        localDerivative: values.w1[hiddenIndex][inputIndex],
        backwardContribution: hiddenDeltas[hiddenIndex] * values.w1[hiddenIndex][inputIndex],
        parameterId,
      })
    }
    edges.push(
      {
        id: `z1_${hiddenIndex + 1}-h${hiddenIndex + 1}`,
        sourceId: `z1_${hiddenIndex + 1}`,
        targetId: `h${hiddenIndex + 1}`,
        label: '1-h²',
        localDerivative: 1 - forward.hidden[hiddenIndex] ** 2,
        backwardContribution: hiddenDeltas[hiddenIndex],
      },
      {
        id: `h${hiddenIndex + 1}-z2`,
        sourceId: `h${hiddenIndex + 1}`,
        targetId: 'z2',
        label: parameterLabel(`w2_${hiddenIndex + 1}` as MlpBackpropParameterId),
        localDerivative: values.w2[hiddenIndex],
        backwardContribution: hiddenAdjoints[hiddenIndex],
        parameterId: `w2_${hiddenIndex + 1}` as MlpBackpropParameterId,
      },
    )
  }
  edges.push(
    { id: 'z2-prediction', sourceId: 'z2', targetId: 'prediction', label: '1-ŷ²', localDerivative: 1 - forward.prediction ** 2, backwardContribution: outputDelta },
    { id: 'prediction-loss', sourceId: 'prediction', targetId: 'loss', label: 'ŷ-y', localDerivative: forward.error, backwardContribution: forward.error },
    { id: 'target-loss', sourceId: 'target', targetId: 'loss', label: 'y-ŷ', localDerivative: -forward.error, backwardContribution: -forward.error },
  )

  const forwardOrder = [
    ...Array.from({ length: counts.hidden }, (_, index) => [`z1_${index + 1}`, `h${index + 1}`]).flat(),
    'z2', 'prediction', 'loss',
  ]
  const backwardOrder = [
    'prediction-loss', 'z2-prediction',
    ...Array.from({ length: counts.hidden }, (_, index) => `h${index + 1}-z2`),
    ...Array.from({ length: counts.hidden }, (_, index) => `z1_${index + 1}-h${index + 1}`),
    ...Array.from({ length: counts.hidden }, (_, hiddenIndex) =>
      Array.from({ length: counts.inputs }, (_, inputIndex) => `x${inputIndex + 1}-z1_${hiddenIndex + 1}`),
    ).flat(),
  ]
  const tape: MlpBackpropTapeStep[] = [
    ...forwardOrder.map((targetId) => ({ id: `forward-${targetId}`, phase: 'forward' as const, targetId, kind: 'node' as const })),
    ...backwardOrder.map((targetId) => ({ id: `backward-${targetId}`, phase: 'backward' as const, targetId, kind: 'edge' as const })),
    ...updates.map((update) => ({ id: `update-${update.id}`, phase: 'update' as const, targetId: update.id, kind: 'parameter' as const })),
  ]

  const epsilon = 1e-5
  const gradientChecks = activeParameterIds(mode).map<MlpBackpropGradientCheck>((parameterId) => {
    const plus = copyValues(values)
    const minus = copyValues(values)
    const current = parameterValue(values, parameterId)
    setParameter(plus, parameterId, current + epsilon)
    setParameter(minus, parameterId, current - epsilon)
    const numerical = (forwardOnly(plus, mode).loss - forwardOnly(minus, mode).loss) / (2 * epsilon)
    const analytic = gradients.get(parameterId) ?? 0
    const scale = Math.max(1, Math.abs(analytic), Math.abs(numerical))
    return { parameterId, analytic, numerical, relativeError: Math.abs(analytic - numerical) / scale }
  })

  const gradientNorm = Math.sqrt(updates.reduce((sum, update) => sum + update.gradient ** 2, 0))

  return {
    state,
    forward,
    reverse: { outputDelta, hiddenAdjoints, hiddenDeltas, inputAdjoints, gradientNorm },
    nodes,
    edges,
    updates,
    updatedValues,
    lossAfterUpdate: forwardOnly(updatedValues, mode).loss,
    tape,
    gradientChecks,
  }
}
