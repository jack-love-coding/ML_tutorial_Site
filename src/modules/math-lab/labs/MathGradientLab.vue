<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import {
  loadBanknoteDataset,
  type BanknoteDatasetLoadState,
  type BanknoteRow,
} from '../utils/banknoteDataset.ts'
import {
  BANKNOTE_TRAINING_CONSTANTS,
  BANKNOTE_TRAINING_PRESETS,
  terminalSuggestions,
  trainLogistic,
  type TrainingConfig,
  type TrainingPresetId,
  type TrainingRun,
} from '../utils/banknoteLogistic.ts'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const presetIds = [
  'raw-fixed',
  'standardized-too-small',
  'standardized-stable',
  'standardized-too-large',
  'standardized-armijo',
] as const satisfies readonly TrainingPresetId[]
const defaultPresetId: TrainingPresetId = 'standardized-stable'

function clonePresetConfig(presetId: TrainingPresetId): TrainingConfig {
  const config = BANKNOTE_TRAINING_PRESETS[presetId].config
  return {
    ...config,
    armijo: config.armijo ? { ...config.armijo } : null,
  }
}

const selectedPresetId = ref<TrainingPresetId>(defaultPresetId)
const draftConfig = reactive<TrainingConfig>(clonePresetConfig(defaultPresetId))
const draftStep = ref(String(draftConfig.step))
const advancedControlsOpen = ref(false)
const committedRun = ref<TrainingRun | null>(null)
const validationIssues = ref<string[]>([])
const datasetRows = ref<readonly BanknoteRow[]>([])
const datasetLoadState = ref<BanknoteDatasetLoadState>({ status: 'loading' })
let loadController: AbortController | null = null

function replaceDraft(config: TrainingConfig): void {
  Object.assign(draftConfig, config)
  draftConfig.armijo = config.armijo ? { ...config.armijo } : null
  draftStep.value = String(config.step)
}

function applySelectedPreset(): void {
  replaceDraft(clonePresetConfig(selectedPresetId.value))
  validationIssues.value = []
}

function syncMethodSettings(): void {
  draftConfig.armijo = draftConfig.method === 'armijo'
    ? { ...BANKNOTE_TRAINING_CONSTANTS.armijo, initialStep: Number(draftStep.value) }
    : null
}

function runExperiment(): void {
  if (datasetLoadState.value.status !== 'ready') return
  const parsedStep = Number(draftStep.value)
  draftConfig.step = parsedStep
  syncMethodSettings()
  const result = trainLogistic(datasetRows.value, {
    ...draftConfig,
    armijo: draftConfig.armijo ? { ...draftConfig.armijo } : null,
  })
  if (result.status === 'invalid-config') {
    validationIssues.value = result.issues.map(({ field, message }) => `${field}: ${message}`)
    return
  }
  validationIssues.value = []
  committedRun.value = result
}

function resetExperiment(): void {
  selectedPresetId.value = defaultPresetId
  replaceDraft(clonePresetConfig(defaultPresetId))
  advancedControlsOpen.value = false
  validationIssues.value = []
  runExperiment()
}

async function loadDataset(): Promise<void> {
  loadController?.abort()
  const controller = new AbortController()
  loadController = controller
  datasetLoadState.value = { status: 'loading' }
  const result = await loadBanknoteDataset({ signal: controller.signal })
  if (controller.signal.aborted) return
  datasetLoadState.value = result
  if (result.status === 'ready') {
    datasetRows.value = result.data.rows
    resetExperiment()
  }
}

onMounted(loadDataset)
onBeforeUnmount(() => loadController?.abort())

const startState = computed(() => committedRun.value?.start ?? null)
const firstBacktrackState = computed(() => committedRun.value?.firstBacktrack ?? null)
const bestValidationState = computed(() => committedRun.value?.bestValidation ?? null)
const terminalState = computed(() => committedRun.value?.terminal ?? null)
const lastFiniteState = computed(() => committedRun.value?.trace.at(-1) ?? null)
const suggestedVariable = computed(() => {
  const reason = terminalState.value?.reason
  if (!reason || !(reason in terminalSuggestions)) return null
  return terminalSuggestions[reason as keyof typeof terminalSuggestions].variable
})

const tracePlot = computed(() => {
  const trace = committedRun.value?.trace ?? []
  const width = 460
  const height = 250
  const margin = { top: 22, right: 22, bottom: 36, left: 46 }
  const xMax = Math.max(1, trace.at(-1)?.iteration ?? 1)
  const yMax = Math.max(1e-9, ...trace.flatMap((point) => [point.trainBce, point.validationBce]))
  const point = (iteration: number, value: number) => ({
    x: margin.left + (iteration / xMax) * (width - margin.left - margin.right),
    y: height - margin.bottom - (value / yMax) * (height - margin.top - margin.bottom),
  })
  const pathFor = (field: 'trainBce' | 'validationBce') => trace
    .map((item, index) => {
      const position = point(item.iteration, item[field])
      return `${index === 0 ? 'M' : 'L'} ${position.x} ${position.y}`
    })
    .join(' ')
  return {
    width,
    height,
    margin,
    xAxisY: height - margin.bottom,
    trainPath: pathFor('trainBce'),
    validationPath: pathFor('validationBce'),
  }
})

function format(value: number | null | undefined, digits = 6): string {
  return value === null || value === undefined ? '—' : value.toPrecision(digits)
}

const copy = computed(() => props.locale === 'zh-CN'
  ? {
      eyebrow: 'Banknote 真实案例 · 交互实验',
      title: '优化轨迹：先改草稿，再明确运行',
      subtitle: '选择 preset 只填入草稿；只有“运行实验”才会调用同一确定性 TypeScript 引擎并更新结果。',
      loading: '正在从站点内加载固定的 1,372 行 Banknote 数据快照…',
      loadError: '本地 Banknote 数据无法加载。请重试；当前不会用模拟数据替代。',
      retry: '重试加载',
      preset: '运行 preset',
      advanced: '高级控制',
      hideAdvanced: '收起高级控制',
      featureSpace: '特征空间',
      method: '步长方法',
      learningRate: '学习率 / 初始步长',
      gradientTolerance: '梯度容差',
      maxIterations: '最大迭代数',
      raw: '原始特征',
      standardized: '仅用 train 拟合的标准化特征',
      fixed: '固定步长',
      armijo: 'Armijo 回溯',
      run: '运行实验',
      reset: '重置并运行稳定 preset',
      invalid: '配置未运行；请修正以下输入：',
      chartAria: '当前已提交运行的训练与验证 BCE 轨迹',
      trainCurve: '实线：train BCE',
      validationCurve: '虚线：validation BCE',
      milestones: '可审计里程碑',
      start: '起点',
      firstBacktrack: '第一次回溯',
      notApplicable: '不适用：此运行没有接受回溯步',
      bestValidation: '最佳 validation',
      terminal: '终止状态',
      lastFinite: '最后一个有限状态',
      suggestion: '下一次只改一个变量',
      iteration: '迭代',
      attempted: '失败尝试',
      variableLabels: {
        learningRate: 'learning rate',
        initialStep: 'initial step',
        maxIterations: 'max iterations',
      },
      presetLabels: {
        'raw-fixed': 'raw-fixed · 原始特征固定步长',
        'standardized-too-small': 'standardized-too-small · 太小',
        'standardized-stable': 'standardized-stable · 稳定基准',
        'standardized-too-large': 'standardized-too-large · 太大',
        'standardized-armijo': 'standardized-armijo · 回溯',
      },
    }
  : {
      eyebrow: 'Real Banknote case · Interactive lab',
      title: 'Optimization trace: Edit a draft, then run explicitly',
      subtitle: 'Selecting a preset only fills the draft. “Run experiment” calls the same deterministic TypeScript engine and commits a new result.',
      loading: 'Loading the fixed 1,372-row Banknote snapshot from this site…',
      loadError: 'The local Banknote data could not be loaded. Retry; this lab will not substitute simulated data.',
      retry: 'Retry loading',
      preset: 'run preset',
      advanced: 'Advanced controls',
      hideAdvanced: 'Hide advanced controls',
      featureSpace: 'feature space',
      method: 'step method',
      learningRate: 'learning rate / initial step',
      gradientTolerance: 'gradient tolerance',
      maxIterations: 'maximum iterations',
      raw: 'raw features',
      standardized: 'train-only standardized features',
      fixed: 'fixed step',
      armijo: 'Armijo backtracking',
      run: 'Run experiment',
      reset: 'Reset and run stable preset',
      invalid: 'The configuration was not run. Fix these inputs:',
      chartAria: 'Training and validation BCE traces for the committed run',
      trainCurve: 'solid: train BCE',
      validationCurve: 'dashed: validation BCE',
      milestones: 'Auditable milestones',
      start: 'start state',
      firstBacktrack: 'first backtrack',
      notApplicable: 'Not applicable: this run accepted no backtracked step',
      bestValidation: 'best validation',
      terminal: 'terminal state',
      lastFinite: 'last finite state',
      suggestion: 'change one variable next',
      iteration: 'iteration',
      attempted: 'failed attempt',
      variableLabels: {
        learningRate: 'learning rate',
        initialStep: 'initial step',
        maxIterations: 'max iterations',
      },
      presetLabels: {
        'raw-fixed': 'raw-fixed · raw fixed step',
        'standardized-too-small': 'standardized-too-small · too small',
        'standardized-stable': 'standardized-stable · stable baseline',
        'standardized-too-large': 'standardized-too-large · too large',
        'standardized-armijo': 'standardized-armijo · backtracking',
      },
    },
)
</script>

<template>
  <section class="math-lab-card math-gradient-lab banknote-gradient-lab">
    <div class="math-lab-card__visual banknote-gradient-lab__visual">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <p v-if="datasetLoadState.status === 'loading'" class="banknote-gradient-lab__state" role="status">
        {{ copy.loading }}
      </p>
      <div v-else-if="datasetLoadState.status === 'error'" class="banknote-gradient-lab__state is-error" role="alert">
        <strong>{{ copy.loadError }}</strong>
        <small>{{ datasetLoadState.code }} · {{ datasetLoadState.message }}</small>
        <button type="button" @click="loadDataset">{{ copy.retry }}</button>
      </div>
      <template v-else>
        <svg
          :viewBox="`0 0 ${tracePlot.width} ${tracePlot.height}`"
          role="img"
          :aria-label="copy.chartAria"
          class="banknote-gradient-lab__plot"
        >
          <line
            :x1="tracePlot.margin.left"
            :y1="tracePlot.xAxisY"
            :x2="tracePlot.width - tracePlot.margin.right"
            :y2="tracePlot.xAxisY"
            class="banknote-gradient-lab__axis"
          />
          <line
            :x1="tracePlot.margin.left"
            :y1="tracePlot.margin.top"
            :x2="tracePlot.margin.left"
            :y2="tracePlot.xAxisY"
            class="banknote-gradient-lab__axis"
          />
          <path :d="tracePlot.trainPath" class="banknote-gradient-lab__curve is-train" />
          <path :d="tracePlot.validationPath" class="banknote-gradient-lab__curve is-validation" />
        </svg>
        <div class="banknote-gradient-lab__legend" aria-hidden="true">
          <span>— {{ copy.trainCurve }}</span>
          <span>- - {{ copy.validationCurve }}</span>
        </div>

        <section v-if="committedRun" class="banknote-gradient-lab__milestones" :aria-label="copy.milestones">
          <article>
            <span>{{ copy.start }}</span>
            <strong>{{ copy.iteration }} {{ startState?.iteration }} · BCE {{ format(startState?.trainBce) }}</strong>
          </article>
          <article>
            <span>{{ copy.firstBacktrack }}</span>
            <strong v-if="firstBacktrackState">
              {{ copy.iteration }} {{ firstBacktrackState.iteration }} · α {{ format(firstBacktrackState.acceptedStepSize) }} · {{ firstBacktrackState.backtrackCount }}×
            </strong>
            <strong v-else>{{ copy.notApplicable }}</strong>
          </article>
          <article>
            <span>{{ copy.bestValidation }}</span>
            <strong>{{ copy.iteration }} {{ bestValidationState?.iteration }} · BCE {{ format(bestValidationState?.bce) }}</strong>
          </article>
          <article>
            <span>{{ copy.terminal }}</span>
            <strong>
              {{ terminalState?.kind }} · {{ terminalState?.reason }} @ {{ terminalState?.iteration }}
              <template v-if="terminalState?.attemptedIteration"> · {{ copy.attempted }} {{ terminalState.attemptedIteration }}</template>
            </strong>
          </article>
          <article>
            <span>{{ copy.lastFinite }}</span>
            <strong>{{ copy.iteration }} {{ lastFiniteState?.iteration }} · BCE {{ format(lastFiniteState?.trainBce) }} · ‖g‖ {{ format(lastFiniteState?.gradientNorm) }}</strong>
          </article>
          <article>
            <span>{{ copy.suggestion }}</span>
            <strong>{{ suggestedVariable ? copy.variableLabels[suggestedVariable] : '—' }}</strong>
          </article>
        </section>
      </template>
    </div>

    <div class="math-lab-card__controls banknote-gradient-lab__controls">
      <label>
        {{ copy.preset }}
        <select v-model="selectedPresetId" :disabled="datasetLoadState.status !== 'ready'" @change="applySelectedPreset">
          <option v-for="presetId in presetIds" :key="presetId" :value="presetId">
            {{ copy.presetLabels[presetId] }}
          </option>
        </select>
      </label>

      <button
        type="button"
        class="banknote-gradient-lab__advanced-toggle"
        :aria-expanded="advancedControlsOpen"
        @click="advancedControlsOpen = !advancedControlsOpen"
      >
        {{ advancedControlsOpen ? copy.hideAdvanced : copy.advanced }}
      </button>

      <fieldset v-if="advancedControlsOpen" class="banknote-gradient-lab__advanced">
        <legend>{{ copy.advanced }}</legend>
        <label>
          {{ copy.featureSpace }}
          <select v-model="draftConfig.featureSpace">
            <option value="raw">{{ copy.raw }}</option>
            <option value="standardized">{{ copy.standardized }}</option>
          </select>
        </label>
        <label>
          {{ copy.method }}
          <select v-model="draftConfig.method" @change="syncMethodSettings">
            <option value="fixed">{{ copy.fixed }}</option>
            <option value="armijo">{{ copy.armijo }}</option>
          </select>
        </label>
        <label>
          {{ copy.learningRate }}
          <input
            v-model="draftStep"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            :aria-describedby="`${selectedPresetId}-step-boundary`"
          />
          <small :id="`${selectedPresetId}-step-boundary`">0 &lt; α ≤ {{ Number.MAX_VALUE }}</small>
        </label>
        <label>
          {{ copy.gradientTolerance }}
          <input v-model.number="draftConfig.gradientTolerance" type="number" min="5e-324" max="1" step="any" />
        </label>
        <label>
          {{ copy.maxIterations }}
          <input v-model.number="draftConfig.maxIterations" type="number" min="1" max="500" step="1" />
        </label>
      </fieldset>

      <div v-if="validationIssues.length" class="banknote-gradient-lab__validation" role="alert">
        <strong>{{ copy.invalid }}</strong>
        <ul>
          <li v-for="issue in validationIssues" :key="issue">{{ issue }}</li>
        </ul>
      </div>

      <div class="banknote-gradient-lab__actions">
        <button type="button" :disabled="datasetLoadState.status !== 'ready'" @click="runExperiment">
          {{ copy.run }}
        </button>
        <button type="button" :disabled="datasetLoadState.status !== 'ready'" @click="resetExperiment">
          {{ copy.reset }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.banknote-gradient-lab {
  align-items: start;
}

.banknote-gradient-lab__visual,
.banknote-gradient-lab__controls,
.banknote-gradient-lab__visual header,
.banknote-gradient-lab__milestones,
.banknote-gradient-lab__advanced {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.banknote-gradient-lab__visual header p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.banknote-gradient-lab__plot {
  display: block;
  width: 100%;
  min-height: 250px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 18px;
  background:
    linear-gradient(rgba(15, 23, 42, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.055) 1px, transparent 1px),
    #ffffff;
  background-size: 28px 28px;
}

.banknote-gradient-lab__axis {
  stroke: #334155;
  stroke-width: 1.5;
}

.banknote-gradient-lab__curve {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 4;
}

.banknote-gradient-lab__curve.is-train {
  stroke: #2563eb;
}

.banknote-gradient-lab__curve.is-validation {
  stroke: #c2410c;
  stroke-dasharray: 9 7;
}

.banknote-gradient-lab__legend,
.banknote-gradient-lab__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
}

.banknote-gradient-lab__legend {
  color: var(--muted);
  font-size: 0.84rem;
  font-weight: 700;
}

.banknote-gradient-lab__milestones {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.banknote-gradient-lab__milestones article,
.banknote-gradient-lab__state,
.banknote-gradient-lab__validation {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.09);
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.9);
}

.banknote-gradient-lab__milestones span {
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.banknote-gradient-lab__milestones strong,
.banknote-gradient-lab__state small {
  overflow-wrap: anywhere;
}

.banknote-gradient-lab__state.is-error,
.banknote-gradient-lab__validation {
  border-color: rgba(190, 18, 60, 0.28);
  background: rgba(190, 18, 60, 0.08);
}

.banknote-gradient-lab__controls > label,
.banknote-gradient-lab__advanced label {
  display: grid;
  gap: 7px;
  min-width: 0;
  color: var(--muted);
  font-size: 0.88rem;
  font-weight: 700;
}

.banknote-gradient-lab select,
.banknote-gradient-lab input {
  width: 100%;
  min-height: 42px;
  padding: 0 11px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: 10px;
  background: white;
  color: var(--ink);
  font: inherit;
}

.banknote-gradient-lab button {
  min-height: 42px;
  padding: 8px 13px;
  border: 1px solid rgba(37, 99, 235, 0.3);
  border-radius: 10px;
  background: white;
  color: var(--ink);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.banknote-gradient-lab button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.banknote-gradient-lab__actions button:first-child {
  color: white;
  background: #2563eb;
}

.banknote-gradient-lab__advanced {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  padding: 14px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 14px;
}

.banknote-gradient-lab__advanced legend {
  padding: 0 6px;
  font-weight: 800;
}

.banknote-gradient-lab__advanced label:nth-of-type(3) {
  grid-column: 1 / -1;
}

.banknote-gradient-lab__validation ul {
  margin: 0;
  padding-left: 1.1rem;
}

@media (max-width: 560px) {
  .banknote-gradient-lab__milestones,
  .banknote-gradient-lab__advanced {
    grid-template-columns: 1fr;
  }

  .banknote-gradient-lab__advanced label:nth-of-type(3) {
    grid-column: auto;
  }
}
</style>
