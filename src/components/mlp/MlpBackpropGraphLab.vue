<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createMlpBackpropGraphState,
  evaluateMlpBackpropGraph,
  normalizeMlpBackpropValues,
  valuesForMlpBackpropPreset,
  type MlpBackpropEdgeSnapshot,
  type MlpBackpropGraphMode,
  type MlpBackpropGraphState,
  type MlpBackpropParameterId,
  type MlpBackpropPhase,
  type MlpBackpropPresetId,
} from '../../simulations/mlpBackpropGraph'

const props = defineProps<{ accent: string }>()
const { locale } = useI18n()

type SelectionKind = 'node' | 'edge' | 'parameter'
type EditableId = 'x1' | 'x2' | 'target' | MlpBackpropParameterId | 'learningRate'
interface Position { x: number; y: number }

const state = ref<MlpBackpropGraphState>(createMlpBackpropGraphState())
const selected = ref<{ kind: SelectionKind; id: string }>({ kind: 'node', id: 'loss' })
const playing = ref(false)
const compact = ref(false)
const reducedMotion = ref(false)
let timer: number | undefined
let compactQuery: MediaQueryList | undefined
let motionQuery: MediaQueryList | undefined

const copy = computed(() => locale.value === 'zh-CN' ? {
  eyebrow: '反向传播交互计算图',
  title: '让每一个梯度都有可追踪的来路',
  intro: '先运行前向缓存，再沿逆拓扑顺序回传伴随量，最后检查每个参数为什么这样更新。',
  preset: '引导场景', normal: '正常传播', saturated: 'tanh 饱和', branching: '分支累加',
  mode: '计算图规模', scalar: '单路径 1→1→1', expanded: '展开 2→2→1',
  playback: '传播阶段', forward: '前向', backward: '反向', update: '更新',
  play: '播放', pause: '暂停', step: '单步', reset: '重置阶段',
  selected: '当前检查对象', value: '前向值', adjoint: '伴随量', local: '局部导数', contribution: '反向贡献',
  parameter: '关联参数', gradient: '梯度', before: '更新前', delta: '−ηg', after: '更新后',
  lossBefore: '更新前损失', lossAfter: '更新后损失', gradientNorm: '梯度范数',
  branchTitle: '共享输入的梯度必须相加', branchBody: 'x₁ 同时流向两个隐藏单元，因此 x̄₁ 等于两条反向贡献之和。',
  custom: '展开自定义参数', customHint: '输入无效值时会恢复最近一次有效结果。',
  fallback: '完整数值表', gradientCheck: '梯度检查', analytic: '解析梯度', numerical: '中心差分', relativeError: '相对误差',
  graphLabel: 'MLP 前向与反向传播计算图', noSelection: '选择一个节点、边或参数查看细节。',
  motion: '系统已启用减少动态效果；播放按钮将改为单步。',
  updateWarning: '当前学习率使单步后损失上升。这是需要观察的训练现象，不是计算错误。',
} : {
  eyebrow: 'Interactive backpropagation graph',
  title: 'Give every gradient a traceable origin',
  intro: 'Run the forward cache, propagate adjoints in reverse topological order, then inspect why every parameter changes.',
  preset: 'Guided scenario', normal: 'Normal flow', saturated: 'Saturated tanh', branching: 'Branch accumulation',
  mode: 'Graph size', scalar: 'Single path 1→1→1', expanded: 'Expand to 2→2→1',
  playback: 'Propagation phase', forward: 'Forward', backward: 'Backward', update: 'Update',
  play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset phase',
  selected: 'Selected object', value: 'Forward value', adjoint: 'Adjoint', local: 'Local derivative', contribution: 'Backward contribution',
  parameter: 'Parameter', gradient: 'Gradient', before: 'Before', delta: '−ηg', after: 'After',
  lossBefore: 'Loss before update', lossAfter: 'Loss after update', gradientNorm: 'Gradient norm',
  branchTitle: 'A shared input accumulates gradients', branchBody: 'x₁ feeds both hidden units, so x̄₁ is the sum of two backward contributions.',
  custom: 'Open custom parameters', customHint: 'Invalid input restores the most recent valid result.',
  fallback: 'Complete numeric table', gradientCheck: 'Gradient check', analytic: 'Analytic', numerical: 'Central difference', relativeError: 'Relative error',
  graphLabel: 'MLP forward and backpropagation computation graph', noSelection: 'Select a node, edge, or parameter to inspect it.',
  motion: 'Reduced motion is enabled; Play advances one step instead.',
  updateWarning: 'This learning rate raises the loss after one step. That is a training behavior to inspect, not a calculation error.',
})

const presets = computed<Array<{ id: MlpBackpropPresetId; label: string }>>(() => [
  { id: 'normal', label: copy.value.normal },
  { id: 'saturated', label: copy.value.saturated },
  { id: 'branching', label: copy.value.branching },
])
const phases = computed<Array<{ id: Exclude<MlpBackpropPhase, 'idle'>; label: string }>>(() => [
  { id: 'forward', label: copy.value.forward },
  { id: 'backward', label: copy.value.backward },
  { id: 'update', label: copy.value.update },
])

const snapshot = computed(() => evaluateMlpBackpropGraph(state.value))
const phaseSteps = computed(() => snapshot.value.tape.filter((step) => step.phase === state.value.phase))
const activeStep = computed(() => phaseSteps.value[state.value.cursor])
const maxGradientError = computed(() => Math.max(...snapshot.value.gradientChecks.map((item) => item.relativeError), 0))

const customFields = computed<Array<{ id: EditableId; label: string; min: number; max: number; step: number; value: number }>>(() => {
  const values = state.value.values
  const fields: Array<{ id: EditableId; label: string; min: number; max: number; step: number; value: number }> = [
    { id: 'x1', label: 'x₁', min: -2, max: 2, step: 0.1, value: values.inputs[0] },
  ]
  if (state.value.mode === 'expanded') fields.push({ id: 'x2', label: 'x₂', min: -2, max: 2, step: 0.1, value: values.inputs[1] })
  fields.push(
    { id: 'target', label: 'y', min: -1, max: 1, step: 0.1, value: values.target },
    { id: 'w1_11', label: 'W¹₁₁', min: -5, max: 5, step: 0.1, value: values.w1[0][0] },
  )
  if (state.value.mode === 'expanded') {
    fields.push(
      { id: 'w1_12', label: 'W¹₁₂', min: -5, max: 5, step: 0.1, value: values.w1[0][1] },
      { id: 'w1_21', label: 'W¹₂₁', min: -5, max: 5, step: 0.1, value: values.w1[1][0] },
      { id: 'w1_22', label: 'W¹₂₂', min: -5, max: 5, step: 0.1, value: values.w1[1][1] },
    )
  }
  fields.push({ id: 'b1_1', label: 'b¹₁', min: -3, max: 3, step: 0.1, value: values.b1[0] })
  if (state.value.mode === 'expanded') fields.push({ id: 'b1_2', label: 'b¹₂', min: -3, max: 3, step: 0.1, value: values.b1[1] })
  fields.push({ id: 'w2_1', label: 'W²₁', min: -5, max: 5, step: 0.1, value: values.w2[0] })
  if (state.value.mode === 'expanded') fields.push({ id: 'w2_2', label: 'W²₂', min: -5, max: 5, step: 0.1, value: values.w2[1] })
  fields.push(
    { id: 'b2', label: 'b²', min: -3, max: 3, step: 0.1, value: values.b2 },
    { id: 'learningRate', label: 'η', min: 0, max: 1, step: 0.01, value: values.learningRate },
  )
  return fields
})

const graphSize = computed(() => compact.value ? { width: 360, height: 760 } : { width: 960, height: 360 })
const nodePositions = computed<Record<string, Position>>(() => {
  if (compact.value) {
    if (state.value.mode === 'scalar') return {
      x1: { x: 180, y: 54 }, z1_1: { x: 180, y: 164 }, h1: { x: 180, y: 274 },
      z2: { x: 180, y: 384 }, prediction: { x: 180, y: 494 }, target: { x: 300, y: 604 }, loss: { x: 180, y: 654 },
    } as Record<string, Position>
    return {
      x1: { x: 90, y: 54 }, x2: { x: 270, y: 54 }, z1_1: { x: 90, y: 174 }, z1_2: { x: 270, y: 174 },
      h1: { x: 90, y: 294 }, h2: { x: 270, y: 294 }, z2: { x: 180, y: 414 }, prediction: { x: 180, y: 524 },
      target: { x: 300, y: 624 }, loss: { x: 180, y: 674 },
    } as Record<string, Position>
  }
  if (state.value.mode === 'scalar') return {
    x1: { x: 70, y: 145 }, z1_1: { x: 245, y: 145 }, h1: { x: 410, y: 145 }, z2: { x: 575, y: 145 },
    prediction: { x: 735, y: 145 }, target: { x: 735, y: 285 }, loss: { x: 900, y: 145 },
  } as Record<string, Position>
  return {
    x1: { x: 70, y: 80 }, x2: { x: 70, y: 250 }, z1_1: { x: 245, y: 80 }, z1_2: { x: 245, y: 250 },
    h1: { x: 410, y: 80 }, h2: { x: 410, y: 250 }, z2: { x: 575, y: 165 }, prediction: { x: 735, y: 165 },
    target: { x: 735, y: 300 }, loss: { x: 900, y: 165 },
  } as Record<string, Position>
})

function format(value: number, digits = 4) {
  if (!Number.isFinite(value)) return '—'
  const normalized = Math.abs(value) < 10 ** -(digits + 1) ? 0 : value
  return normalized.toFixed(digits).replace(/\.?0+$/, '')
}

function edgeGeometry(edge: MlpBackpropEdgeSnapshot) {
  const source = nodePositions.value[edge.sourceId]
  const target = nodePositions.value[edge.targetId]
  return {
    x1: source.x, y1: source.y, x2: target.x, y2: target.y,
    labelX: (source.x + target.x) / 2,
    labelY: (source.y + target.y) / 2 - (compact.value ? 0 : 9),
  }
}

function isStepActive(kind: SelectionKind, id: string) {
  return activeStep.value?.kind === kind && activeStep.value.targetId === id
}

const selectionDetail = computed(() => {
  if (selected.value.kind === 'node') {
    const node = snapshot.value.nodes.find((item) => item.id === selected.value.id)
    if (!node) return undefined
    return { title: node.label, rows: [[copy.value.value, node.value], [copy.value.adjoint, node.adjoint]] }
  }
  if (selected.value.kind === 'edge') {
    const edge = snapshot.value.edges.find((item) => item.id === selected.value.id)
    if (!edge) return undefined
    return {
      title: edge.label,
      rows: [[copy.value.local, edge.localDerivative], [copy.value.contribution, edge.backwardContribution]],
      parameter: edge.parameterId,
    }
  }
  const update = snapshot.value.updates.find((item) => item.id === selected.value.id)
  if (!update) return undefined
  return {
    title: update.label,
    rows: [[copy.value.before, update.before], [copy.value.gradient, update.gradient], [copy.value.delta, update.delta], [copy.value.after, update.after]],
  }
})

const branchContributions = computed(() => snapshot.value.edges.filter((edge) => edge.sourceId === 'x1').map((edge) => edge.backwardContribution))

function stopPlayback() {
  playing.value = false
  if (timer !== undefined) window.clearInterval(timer)
  timer = undefined
}

function choosePreset(preset: MlpBackpropPresetId) {
  stopPlayback()
  const mode: MlpBackpropGraphMode = preset === 'branching' ? 'expanded' : state.value.mode
  state.value = { ...createMlpBackpropGraphState(preset, mode), values: valuesForMlpBackpropPreset(preset) }
  selected.value = { kind: 'node', id: 'loss' }
}

function chooseMode(mode: MlpBackpropGraphMode) {
  stopPlayback()
  state.value = { ...state.value, mode, phase: 'idle', cursor: -1 }
  if (mode === 'scalar' && ['x2', 'z1_2', 'h2'].includes(selected.value.id)) selected.value = { kind: 'node', id: 'loss' }
}

function choosePhase(phase: Exclude<MlpBackpropPhase, 'idle'>) {
  stopPlayback()
  state.value = { ...state.value, phase, cursor: -1 }
}

function stepOnce() {
  if (state.value.phase === 'idle') choosePhase('forward')
  const next = Math.min(state.value.cursor + 1, phaseSteps.value.length - 1)
  state.value = { ...state.value, cursor: next }
  const step = phaseSteps.value[next]
  if (step) selected.value = { kind: step.kind, id: step.targetId }
  if (next >= phaseSteps.value.length - 1) stopPlayback()
}

function togglePlayback() {
  if (playing.value) return stopPlayback()
  if (reducedMotion.value) return stepOnce()
  if (!phaseSteps.value.length) choosePhase('forward')
  if (state.value.cursor >= phaseSteps.value.length - 1) state.value = { ...state.value, cursor: -1 }
  playing.value = true
  timer = window.setInterval(stepOnce, 850)
}

function resetPhase() {
  stopPlayback()
  state.value = { ...state.value, phase: 'idle', cursor: -1 }
  selected.value = { kind: 'node', id: 'loss' }
}

function select(kind: SelectionKind, id: string) {
  selected.value = { kind, id }
}

const selectableItems = computed(() => [
  ...snapshot.value.nodes.map((item) => ({ kind: 'node' as const, id: item.id })),
  ...snapshot.value.edges.map((item) => ({ kind: 'edge' as const, id: item.id })),
  ...snapshot.value.updates.map((item) => ({ kind: 'parameter' as const, id: item.id })),
])

function handleSelectableKeydown(event: KeyboardEvent, kind: SelectionKind, id: string) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    select(kind, id)
    return
  }
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
  event.preventDefault()
  const currentIndex = selectableItems.value.findIndex((item) => item.kind === kind && item.id === id)
  const delta = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1
  const nextIndex = (currentIndex + delta + selectableItems.value.length) % selectableItems.value.length
  const next = selectableItems.value[nextIndex]
  select(next.kind, next.id)
  nextTick(() => document.querySelector<HTMLElement>(`[data-backprop-selectable="${next.kind}:${next.id}"]`)?.focus())
}

function onNumericChange(id: EditableId, event: Event) {
  const raw = Number((event.target as HTMLInputElement).value)
  if (!Number.isFinite(raw)) {
    ;(event.target as HTMLInputElement).value = String(customFields.value.find((field) => field.id === id)?.value ?? 0)
    return
  }
  const values = structuredClone(state.value.values)
  if (id === 'x1') values.inputs[0] = raw
  else if (id === 'x2') values.inputs[1] = raw
  else if (id === 'target') values.target = raw
  else if (id === 'learningRate') values.learningRate = raw
  else if (id === 'b2') values.b2 = raw
  else if (id === 'b1_1') values.b1[0] = raw
  else if (id === 'b1_2') values.b1[1] = raw
  else if (id === 'w2_1') values.w2[0] = raw
  else if (id === 'w2_2') values.w2[1] = raw
  else {
    const [, hidden, input] = id.match(/^w1_(\d)(\d)$/) ?? []
    values.w1[Number(hidden) - 1][Number(input) - 1] = raw
  }
  state.value = { ...state.value, values: normalizeMlpBackpropValues(values, state.value.values), phase: 'idle', cursor: -1 }
  stopPlayback()
}

function updateMediaPreferences() {
  compact.value = compactQuery?.matches ?? false
  reducedMotion.value = motionQuery?.matches ?? false
  if (reducedMotion.value) stopPlayback()
}

onMounted(() => {
  compactQuery = window.matchMedia('(max-width: 720px)')
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  compactQuery.addEventListener?.('change', updateMediaPreferences)
  motionQuery.addEventListener?.('change', updateMediaPreferences)
  updateMediaPreferences()
})

onBeforeUnmount(() => {
  stopPlayback()
  compactQuery?.removeEventListener?.('change', updateMediaPreferences)
  motionQuery?.removeEventListener?.('change', updateMediaPreferences)
})
</script>

<template>
  <section class="mlp-backprop-graph-lab" :style="{ '--mlp-backprop-accent': props.accent }">
    <header class="mlp-backprop-graph-lab__header">
      <span>{{ copy.eyebrow }}</span>
      <h3>{{ copy.title }}</h3>
      <p>{{ copy.intro }}</p>
    </header>

    <div class="mlp-backprop-graph-lab__controls">
      <label>
        <span>{{ copy.preset }}</span>
        <select :value="state.preset" @change="choosePreset(($event.target as HTMLSelectElement).value as MlpBackpropPresetId)">
          <option v-for="preset in presets" :key="preset.id" :value="preset.id">{{ preset.label }}</option>
        </select>
      </label>

      <fieldset>
        <legend>{{ copy.mode }}</legend>
        <button type="button" :class="{ 'is-active': state.mode === 'scalar' }" @click="chooseMode('scalar')">{{ copy.scalar }}</button>
        <button type="button" :class="{ 'is-active': state.mode === 'expanded' }" @click="chooseMode('expanded')">{{ copy.expanded }}</button>
      </fieldset>

      <fieldset>
        <legend>{{ copy.playback }}</legend>
        <button v-for="phase in phases" :key="phase.id" type="button" :class="{ 'is-active': state.phase === phase.id }" @click="choosePhase(phase.id)">{{ phase.label }}</button>
        <button type="button" @click="togglePlayback">{{ playing ? copy.pause : copy.play }}</button>
        <button type="button" @click="stepOnce">{{ copy.step }}</button>
        <button type="button" @click="resetPhase">{{ copy.reset }}</button>
      </fieldset>
    </div>

    <p v-if="reducedMotion" class="mlp-backprop-graph-lab__motion-note">{{ copy.motion }}</p>

    <div class="mlp-backprop-graph-lab__workspace">
      <figure>
        <svg
          class="mlp-backprop-graph-lab__graph"
          :viewBox="`0 0 ${graphSize.width} ${graphSize.height}`"
          role="group"
          :aria-label="copy.graphLabel"
        >
          <defs>
            <marker id="mlp-forward-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" />
            </marker>
          </defs>
          <g
            v-for="edge in snapshot.edges"
            :key="edge.id"
            class="mlp-backprop-edge"
            :class="{ 'is-selected': selected.kind === 'edge' && selected.id === edge.id, 'is-step-active': isStepActive('edge', edge.id) }"
            role="button"
            tabindex="0"
            :aria-label="`${edge.label}; ${copy.local} ${format(edge.localDerivative)}; ${copy.contribution} ${format(edge.backwardContribution)}`"
            :data-backprop-selectable="`edge:${edge.id}`"
            @click="select('edge', edge.id)"
            @keydown="handleSelectableKeydown($event, 'edge', edge.id)"
          >
            <line class="mlp-backprop-edge__hit" v-bind="edgeGeometry(edge)" />
            <line class="mlp-backprop-edge__line" v-bind="edgeGeometry(edge)" marker-end="url(#mlp-forward-arrow)" />
            <text :x="edgeGeometry(edge).labelX" :y="edgeGeometry(edge).labelY">{{ edge.label }}</text>
          </g>

          <g
            v-for="node in snapshot.nodes"
            :key="node.id"
            class="mlp-backprop-node"
            :class="[`is-${node.kind}`, { 'is-selected': selected.kind === 'node' && selected.id === node.id, 'is-step-active': isStepActive('node', node.id) }]"
            role="button"
            tabindex="0"
            :aria-label="`${node.label}; ${copy.value} ${format(node.value)}; ${copy.adjoint} ${format(node.adjoint)}`"
            :data-backprop-selectable="`node:${node.id}`"
            :transform="`translate(${nodePositions[node.id].x} ${nodePositions[node.id].y})`"
            @click="select('node', node.id)"
            @keydown="handleSelectableKeydown($event, 'node', node.id)"
          >
            <circle r="31" />
            <text class="mlp-backprop-node__label" y="-5">{{ node.label }}</text>
            <text class="mlp-backprop-node__value" y="15">{{ format(node.value, 3) }}</text>
            <text class="mlp-backprop-node__adjoint" y="51">bar={{ format(node.adjoint, 3) }}</text>
          </g>
        </svg>
        <figcaption>{{ copy.graphLabel }}</figcaption>
      </figure>

      <aside class="mlp-backprop-graph-lab__selection" aria-live="polite">
        <span>{{ copy.selected }}</span>
        <template v-if="selectionDetail">
          <strong>{{ selectionDetail.title }}</strong>
          <dl>
            <template v-for="row in selectionDetail.rows" :key="row[0]">
              <dt>{{ row[0] }}</dt><dd>{{ format(row[1] as number, 6) }}</dd>
            </template>
          </dl>
          <small v-if="selectionDetail.parameter">{{ copy.parameter }}：{{ selectionDetail.parameter }}</small>
        </template>
        <p v-else>{{ copy.noSelection }}</p>
      </aside>
    </div>

    <section v-if="state.mode === 'expanded'" class="mlp-backprop-graph-lab__branch">
      <div><strong>{{ copy.branchTitle }}</strong><p>{{ copy.branchBody }}</p></div>
      <code>{{ branchContributions.map((value) => format(value, 6)).join(' + ') }} = {{ format(snapshot.reverse.inputAdjoints[0], 6) }}</code>
    </section>

    <section class="mlp-backprop-graph-lab__metrics">
      <div><span>{{ copy.lossBefore }}</span><strong>{{ format(snapshot.forward.loss, 6) }}</strong></div>
      <div><span>{{ copy.gradientNorm }}</span><strong>{{ format(snapshot.reverse.gradientNorm, 6) }}</strong></div>
      <div><span>{{ copy.lossAfter }}</span><strong>{{ format(snapshot.lossAfterUpdate, 6) }}</strong></div>
    </section>
    <p v-if="snapshot.lossAfterUpdate > snapshot.forward.loss" class="mlp-backprop-graph-lab__warning">{{ copy.updateWarning }}</p>

    <div class="mlp-backprop-graph-lab__table-wrap">
      <table>
        <thead><tr><th>{{ copy.parameter }}</th><th>{{ copy.before }}</th><th>{{ copy.gradient }}</th><th>{{ copy.delta }}</th><th>{{ copy.after }}</th></tr></thead>
        <tbody>
          <tr
            v-for="update in snapshot.updates"
            :key="update.id"
            :class="{ 'is-selected': selected.kind === 'parameter' && selected.id === update.id, 'is-step-active': isStepActive('parameter', update.id) }"
          >
            <th>
              <button
                type="button"
                :data-backprop-selectable="`parameter:${update.id}`"
                @click="select('parameter', update.id)"
                @keydown="handleSelectableKeydown($event, 'parameter', update.id)"
              >{{ update.label }}</button>
            </th>
            <td>{{ format(update.before, 6) }}</td><td>{{ format(update.gradient, 6) }}</td><td>{{ format(update.delta, 6) }}</td><td>{{ format(update.after, 6) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <details class="mlp-backprop-graph-lab__custom">
      <summary>{{ copy.custom }}</summary>
      <p>{{ copy.customHint }}</p>
      <div>
        <label v-for="field in customFields" :key="field.id">
          <span>{{ field.label }}</span>
          <input type="number" :min="field.min" :max="field.max" :step="field.step" :value="field.value" @change="onNumericChange(field.id, $event)" />
        </label>
      </div>
    </details>

    <details class="mlp-backprop-graph-lab__fallback">
      <summary>{{ copy.fallback }} · {{ copy.gradientCheck }} ≤ {{ maxGradientError.toExponential(2) }}</summary>
      <div class="mlp-backprop-graph-lab__table-wrap">
        <table>
          <thead><tr><th>{{ copy.parameter }}</th><th>{{ copy.analytic }}</th><th>{{ copy.numerical }}</th><th>{{ copy.relativeError }}</th></tr></thead>
          <tbody><tr v-for="check in snapshot.gradientChecks" :key="check.parameterId"><th>{{ check.parameterId }}</th><td>{{ format(check.analytic, 8) }}</td><td>{{ format(check.numerical, 8) }}</td><td>{{ check.relativeError.toExponential(2) }}</td></tr></tbody>
        </table>
      </div>
    </details>
  </section>
</template>
