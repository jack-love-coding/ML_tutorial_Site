<script setup lang="ts">
import * as d3 from 'd3'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { evaluateTrainingScenario, type TrainingScenario } from '../utils/aiBridgeMath'
import {
  loadBanknoteDataset,
  type BanknoteDatasetLoadState,
} from '../utils/banknoteDataset.ts'
import {
  BANKNOTE_TRAINING_PRESETS,
  runBanknotePreset,
  type TracePoint,
  type TrainingPresetId,
  type TrainingRun,
} from '../utils/banknoteLogistic.ts'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const presetIds = Object.keys(BANKNOTE_TRAINING_PRESETS) as TrainingPresetId[]
const syntheticModes = [
  'healthy',
  'high-learning-rate',
  'overfitting',
  'vanishing-gradient',
  'exploding-gradient',
] as const satisfies readonly TrainingScenario[]
type CurveKey = 'trainBce' | 'validationBce' | 'gradientNorm'

const datasetLoadState = ref<BanknoteDatasetLoadState>({ status: 'loading' })
const realRuns = ref<Partial<Record<TrainingPresetId, TrainingRun>>>({})
const primaryRunId = ref<TrainingPresetId>('standardized-armijo')
const comparisonRunId = ref<TrainingPresetId>('standardized-too-large')
const curveVisibility = reactive<Record<CurveKey, boolean>>({
  trainBce: true,
  validationBce: true,
  gradientNorm: true,
})
const syntheticScenario = ref<TrainingScenario>('healthy')
const syntheticEvaluation = computed(() => evaluateTrainingScenario(syntheticScenario.value, 42))
let loadController: AbortController | null = null

async function loadDataset(): Promise<void> {
  loadController?.abort()
  const controller = new AbortController()
  loadController = controller
  datasetLoadState.value = { status: 'loading' }
  const result = await loadBanknoteDataset({ signal: controller.signal })
  if (controller.signal.aborted) return
  if (result.status === 'ready') {
    realRuns.value = Object.fromEntries(
      presetIds.map((runId) => [runId, runBanknotePreset(runId, result.data.rows)]),
    ) as Record<TrainingPresetId, TrainingRun>
  }
  datasetLoadState.value = result
}

function resetDiagnostics(): void {
  primaryRunId.value = 'standardized-armijo'
  comparisonRunId.value = 'standardized-too-large'
  curveVisibility.trainBce = true
  curveVisibility.validationBce = true
  curveVisibility.gradientNorm = true
  syntheticScenario.value = 'healthy'
}

onMounted(loadDataset)
onBeforeUnmount(() => loadController?.abort())

const primaryRun = computed(() => realRuns.value[primaryRunId.value] ?? null)
const comparisonRun = computed(() => realRuns.value[comparisonRunId.value] ?? null)
const curveKeys = ['trainBce', 'validationBce', 'gradientNorm'] as const

const realPlot = computed(() => {
  const width = 520
  const height = 310
  const margin = { top: 26, right: 24, bottom: 42, left: 50 }
  const selected = [
    { role: 'primary' as const, run: primaryRun.value },
    { role: 'comparison' as const, run: comparisonRun.value },
  ].filter((item): item is { role: 'primary' | 'comparison'; run: TrainingRun } => Boolean(item.run))
  const visibleCurves = curveKeys.filter((curve) => curveVisibility[curve])
  const maxIteration = Math.max(1, ...selected.map(({ run }) => run.trace.at(-1)?.iteration ?? 1))
  const maxValue = Math.max(
    1e-9,
    d3.max(selected.flatMap(({ run }) => run.trace.flatMap((point) => (
      visibleCurves.map((curve) => point[curve])
    )))) ?? 1,
  )
  const x = d3.scaleLinear().domain([0, maxIteration]).range([margin.left, width - margin.right])
  const y = d3.scaleLinear().domain([0, maxValue * 1.05]).range([height - margin.bottom, margin.top])
  const line = d3.line<TracePoint>()
    .x((point) => x(point.iteration))
    .curve(d3.curveMonotoneX)
  const lines = selected.flatMap(({ role, run }) => visibleCurves.map((curve) => ({
    id: `${role}-${curve}`,
    role,
    curve,
    runId: run.runId ?? (role === 'primary' ? primaryRunId.value : comparisonRunId.value),
    path: line.y((point) => y(point[curve]))(run.trace) ?? '',
  })))
  return {
    width,
    height,
    margin,
    lines,
    xAxisY: height - margin.bottom,
  }
})

type DiagnosticChain = {
  visibleSymptom: string
  plausibleCause: string
  oneVariableChange: string
  expectedNextRun: string
}

const diagnosticChains = computed<Record<TrainingPresetId, DiagnosticChain>>(() => props.locale === 'zh-CN'
  ? {
      'raw-fixed': {
        visibleSymptom: '原始尺度下 validation 最佳点出现在 52，随后到 112 因耐心耗尽停止。',
        plausibleCause: '不同量纲让同一固定步长在各权重方向上条件不均。',
        oneVariableChange: '只把 feature space 从 raw 改为 standardized。',
        expectedNextRun: '轨迹应更平滑；再比较 standardized-stable 的收敛状态。',
      },
      'standardized-too-small': {
        visibleSymptom: '到 500 次迭代仍触发 max-iterations，梯度下降但进展很慢。',
        plausibleCause: '学习率 0.02 太保守，每一步的参数位移过小。',
        oneVariableChange: '只把 learning rate 从 0.02 提到 4。',
        expectedNextRun: '应在容差内收敛，而不是耗尽迭代预算。',
      },
      'standardized-stable': {
        visibleSymptom: '轨迹稳定下降，并在 484 由 gradient-norm 判断数学收敛。',
        plausibleCause: '标准化后固定步长 4 与当前曲率匹配，但仍较慢。',
        oneVariableChange: '只把 method 从 fixed 改为 Armijo。',
        expectedNextRun: '回溯应自动寻找更大的可接受步长并更早收敛。',
      },
      'standardized-too-large': {
        visibleSymptom: 'validation 在 13 短暂更低，但运行在 73 因 validation-patience 停止。',
        plausibleCause: '固定步长 32 跨过稳定下降区；短暂最佳点不等于合格终点。',
        oneVariableChange: '只把 learning rate 从 32 降到 4。',
        expectedNextRun: '应恢复单调、可复现的数学收敛，并保留最后有限状态。',
      },
      'standardized-armijo': {
        visibleSymptom: '第一次拒绝 32、接受 16，随后在 48 由 gradient-norm 收敛。',
        plausibleCause: '回溯用充分下降把曲率信息转成了安全步长。',
        oneVariableChange: '保持训练不变，只把它与 standardized-stable 并排比较。',
        expectedNextRun: '最佳 validation 与合格终点都应可复现；这是最终选择候选。',
      },
    }
  : {
      'raw-fixed': {
        visibleSymptom: 'In raw space, validation is best at 52, then patience stops the run at 112.',
        plausibleCause: 'Unequal feature scales make one fixed step poorly conditioned across weight directions.',
        oneVariableChange: 'Change only feature space from raw to standardized.',
        expectedNextRun: 'The trace should smooth out; compare next with standardized-stable convergence.',
      },
      'standardized-too-small': {
        visibleSymptom: 'The run reaches max-iterations at 500: gradient shrinks, but progress is slow.',
        plausibleCause: 'Learning rate 0.02 is too conservative, so every parameter step is tiny.',
        oneVariableChange: 'Change only learning rate from 0.02 to 4.',
        expectedNextRun: 'It should converge within tolerance instead of exhausting the iteration budget.',
      },
      'standardized-stable': {
        visibleSymptom: 'The trace falls steadily and reaches mathematical gradient-norm convergence at 484.',
        plausibleCause: 'After standardization, fixed step 4 matches the local curvature but remains slow.',
        oneVariableChange: 'Change only method from fixed to Armijo.',
        expectedNextRun: 'Backtracking should find a larger acceptable step and converge earlier.',
      },
      'standardized-too-large': {
        visibleSymptom: 'Validation is briefly lower at 13, but validation-patience stops the run at 73.',
        plausibleCause: 'Fixed step 32 crosses the stable descent region; a transient winner is not an eligible endpoint.',
        oneVariableChange: 'Change only learning rate from 32 to 4.',
        expectedNextRun: 'Steady mathematical convergence should return while preserving the last finite state.',
      },
      'standardized-armijo': {
        visibleSymptom: 'The first search rejects 32, accepts 16, and reaches gradient-norm convergence at 48.',
        plausibleCause: 'Sufficient decrease turns local curvature information into a safe step.',
        oneVariableChange: 'Keep training fixed and compare it directly with standardized-stable.',
        expectedNextRun: 'Best validation and an eligible endpoint should reproduce; this is the final-selection candidate.',
      },
    },
)
const activeDiagnostic = computed(() => diagnosticChains.value[primaryRunId.value])

function format(value: number | null | undefined, digits = 5): string {
  return value === null || value === undefined ? '—' : value.toPrecision(digits)
}

const copy = computed(() => props.locale === 'zh-CN'
  ? {
      eyebrow: 'Banknote 真实案例 · 训练诊断',
      title: '用同一批真实轨迹做受控比较',
      subtitle: '五条运行只在数据加载后计算一次；选择器与曲线开关只切换已计算结果，不会隐式重训。',
      loading: '正在加载本地 Banknote 数据并计算五条固定训练轨迹…',
      loadError: '无法加载本地数据，因此真实案例区不显示替代曲线。',
      retry: '重试加载',
      primary: '主诊断运行',
      comparison: '对照运行',
      curves: '显示曲线',
      trainBce: 'train BCE',
      validationBce: 'validation BCE',
      gradientNorm: 'gradient norm',
      chartAria: '两条真实 Banknote 运行的可选训练曲线',
      primaryLegend: 'P 主运行（实线）',
      comparisonLegend: 'C 对照运行（虚线）',
      best: '最佳 validation',
      terminal: '终止',
      lastFinite: '最后有限状态',
      eligible: '可进入最终选择',
      yes: '是',
      no: '否',
      fourStep: '四步诊断链',
      visibleSymptom: '1 · 可见现象',
      plausibleCause: '2 · 可能原因',
      oneVariableChange: '3 · 只改一个变量',
      expectedNextRun: '4 · 预期下一次运行',
      reset: '重置比较视图',
      syntheticEyebrow: '确定性合成辅助示例',
      syntheticTitle: '这些模式帮助练习辨认，不是 Banknote 结果',
      syntheticDescription: '五种合成模式保留为辅助练习，并与上方真实运行明显分区。',
      syntheticMode: '合成模式',
      syntheticFinalTrain: '最终 train loss',
      syntheticFinalValidation: '最终 validation loss',
      syntheticFinalGradient: '最终 gradient norm',
      presetLabels: {
        'raw-fixed': 'raw-fixed',
        'standardized-too-small': 'standardized-too-small',
        'standardized-stable': 'standardized-stable',
        'standardized-too-large': 'standardized-too-large',
        'standardized-armijo': 'standardized-armijo',
      },
      syntheticLabels: {
        healthy: '健康收敛',
        'high-learning-rate': '学习率过大',
        overfitting: '过拟合',
        'vanishing-gradient': '梯度消失',
        'exploding-gradient': '梯度爆炸',
      },
    }
  : {
      eyebrow: 'Real Banknote case · Training diagnostics',
      title: 'Compare controlled runs from the same real traces',
      subtitle: 'Five runs are computed once after data load. Selectors and curve toggles only view cached results; they never retrain implicitly.',
      loading: 'Loading local Banknote data and computing five locked training traces…',
      loadError: 'The local data could not be loaded, so the real-case area will not show substitute curves.',
      retry: 'Retry loading',
      primary: 'primary diagnostic run',
      comparison: 'comparison run',
      curves: 'visible curves',
      trainBce: 'train BCE',
      validationBce: 'validation BCE',
      gradientNorm: 'gradient norm',
      chartAria: 'Selectable training curves for two real Banknote runs',
      primaryLegend: 'P primary run (solid)',
      comparisonLegend: 'C comparison run (dashed)',
      best: 'best validation',
      terminal: 'terminal',
      lastFinite: 'last finite state',
      eligible: 'eligible for final selection',
      yes: 'yes',
      no: 'no',
      fourStep: 'Four-step diagnostic chain',
      visibleSymptom: '1 · visible symptom',
      plausibleCause: '2 · plausible cause',
      oneVariableChange: '3 · change one variable',
      expectedNextRun: '4 · expected next run',
      reset: 'Reset comparison view',
      syntheticEyebrow: 'Deterministic synthetic support examples',
      syntheticTitle: 'These patterns teach recognition; they are not Banknote results',
      syntheticDescription: 'Five synthetic modes remain as support practice, visibly separated from the real runs above.',
      syntheticMode: 'synthetic mode',
      syntheticFinalTrain: 'final train loss',
      syntheticFinalValidation: 'final validation loss',
      syntheticFinalGradient: 'final gradient norm',
      presetLabels: {
        'raw-fixed': 'raw-fixed',
        'standardized-too-small': 'standardized-too-small',
        'standardized-stable': 'standardized-stable',
        'standardized-too-large': 'standardized-too-large',
        'standardized-armijo': 'standardized-armijo',
      },
      syntheticLabels: {
        healthy: 'healthy convergence',
        'high-learning-rate': 'learning rate too high',
        overfitting: 'overfitting',
        'vanishing-gradient': 'vanishing gradient',
        'exploding-gradient': 'exploding gradient',
      },
    },
)
</script>

<template>
  <section class="training-diagnostics-lab">
    <section class="math-lab-card training-diagnostics-lab__real-case">
      <div class="math-lab-card__visual training-diagnostics-lab__visual">
        <header>
          <span>{{ copy.eyebrow }}</span>
          <strong>{{ copy.title }}</strong>
          <p>{{ copy.subtitle }}</p>
        </header>

        <p v-if="datasetLoadState.status === 'loading'" class="training-diagnostics-lab__state" role="status">
          {{ copy.loading }}
        </p>
        <div v-else-if="datasetLoadState.status === 'error'" class="training-diagnostics-lab__state is-error" role="alert">
          <strong>{{ copy.loadError }}</strong>
          <small>{{ datasetLoadState.code }} · {{ datasetLoadState.message }}</small>
          <button type="button" @click="loadDataset">{{ copy.retry }}</button>
        </div>
        <template v-else>
          <svg :viewBox="`0 0 ${realPlot.width} ${realPlot.height}`" role="img" :aria-label="copy.chartAria">
            <line
              :x1="realPlot.margin.left"
              :y1="realPlot.xAxisY"
              :x2="realPlot.width - realPlot.margin.right"
              :y2="realPlot.xAxisY"
              class="training-diagnostics-lab__axis"
            />
            <line
              :x1="realPlot.margin.left"
              :y1="realPlot.margin.top"
              :x2="realPlot.margin.left"
              :y2="realPlot.xAxisY"
              class="training-diagnostics-lab__axis"
            />
            <path
              v-for="line in realPlot.lines"
              :key="line.id"
              :d="line.path"
              :class="[
                'training-diagnostics-lab__line',
                `is-${line.role}`,
                `is-${line.curve}`,
              ]"
            >
              <title>{{ line.runId }} · {{ copy[line.curve] }}</title>
            </path>
          </svg>
          <div class="training-diagnostics-lab__legend">
            <span>— {{ copy.primaryLegend }}</span>
            <span>- - {{ copy.comparisonLegend }}</span>
            <span v-for="curve in curveKeys" :key="curve">{{ copy[curve] }}</span>
          </div>
        </template>
      </div>

      <div class="math-lab-card__controls training-diagnostics-lab__controls">
        <div class="training-diagnostics-lab__selectors">
          <label>
            {{ copy.primary }}
            <select v-model="primaryRunId" :disabled="datasetLoadState.status !== 'ready'">
              <option v-for="presetId in presetIds" :key="presetId" :value="presetId">
                {{ copy.presetLabels[presetId] }}
              </option>
            </select>
          </label>
          <label>
            {{ copy.comparison }}
            <select v-model="comparisonRunId" :disabled="datasetLoadState.status !== 'ready'">
              <option v-for="presetId in presetIds" :key="presetId" :value="presetId">
                {{ copy.presetLabels[presetId] }}
              </option>
            </select>
          </label>
        </div>

        <fieldset class="training-diagnostics-lab__curve-toggles" :disabled="datasetLoadState.status !== 'ready'">
          <legend>{{ copy.curves }}</legend>
          <label v-for="curve in curveKeys" :key="curve">
            <input v-model="curveVisibility[curve]" type="checkbox" />
            <span>{{ copy[curve] }}</span>
          </label>
        </fieldset>

        <div v-if="primaryRun" class="training-diagnostics-lab__run-readouts">
          <article>
            <span>{{ copy.best }}</span>
            <strong>{{ primaryRun.bestValidation.iteration }} · {{ format(primaryRun.bestValidation.bce) }}</strong>
          </article>
          <article>
            <span>{{ copy.terminal }}</span>
            <strong>{{ primaryRun.terminal.kind }} · {{ primaryRun.terminal.reason }} @ {{ primaryRun.terminal.iteration }}</strong>
          </article>
          <article>
            <span>{{ copy.lastFinite }}</span>
            <strong>{{ primaryRun.trace.at(-1)?.iteration }} · ‖g‖ {{ format(primaryRun.trace.at(-1)?.gradientNorm) }}</strong>
          </article>
          <article>
            <span>{{ copy.eligible }}</span>
            <strong>{{ primaryRun.eligibleForFinalSelection ? copy.yes : copy.no }}</strong>
          </article>
        </div>

        <section v-if="primaryRun" class="training-diagnostics-lab__diagnostic-chain" :aria-label="copy.fourStep">
          <article>
            <span>{{ copy.visibleSymptom }}</span>
            <p>{{ activeDiagnostic.visibleSymptom }}</p>
          </article>
          <article>
            <span>{{ copy.plausibleCause }}</span>
            <p>{{ activeDiagnostic.plausibleCause }}</p>
          </article>
          <article>
            <span>{{ copy.oneVariableChange }}</span>
            <p>{{ activeDiagnostic.oneVariableChange }}</p>
          </article>
          <article>
            <span>{{ copy.expectedNextRun }}</span>
            <p>{{ activeDiagnostic.expectedNextRun }}</p>
          </article>
        </section>

        <button type="button" class="training-diagnostics-lab__reset" @click="resetDiagnostics">
          {{ copy.reset }}
        </button>
      </div>
    </section>

    <section class="math-lab-panel training-diagnostics-lab__synthetic-support">
      <header>
        <span>{{ copy.syntheticEyebrow }}</span>
        <h3>{{ copy.syntheticTitle }}</h3>
        <p>{{ copy.syntheticDescription }}</p>
      </header>
      <label>
        {{ copy.syntheticMode }}
        <select v-model="syntheticScenario">
          <option v-for="mode in syntheticModes" :key="mode" :value="mode">
            {{ copy.syntheticLabels[mode] }}
          </option>
        </select>
      </label>
      <div class="training-diagnostics-lab__synthetic-readouts">
        <article>
          <span>{{ copy.syntheticFinalTrain }}</span>
          <strong>{{ format(syntheticEvaluation.last.trainLoss) }}</strong>
        </article>
        <article>
          <span>{{ copy.syntheticFinalValidation }}</span>
          <strong>{{ format(syntheticEvaluation.last.valLoss) }}</strong>
        </article>
        <article>
          <span>{{ copy.syntheticFinalGradient }}</span>
          <strong>{{ format(syntheticEvaluation.last.gradientNorm) }}</strong>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.training-diagnostics-lab,
.training-diagnostics-lab__visual,
.training-diagnostics-lab__controls,
.training-diagnostics-lab__visual header,
.training-diagnostics-lab__diagnostic-chain,
.training-diagnostics-lab__synthetic-support {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.training-diagnostics-lab__visual header p,
.training-diagnostics-lab__synthetic-support header p,
.training-diagnostics-lab__diagnostic-chain p {
  margin: 0;
  color: var(--muted);
  line-height: 1.55;
}

.training-diagnostics-lab__visual svg {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background:
    linear-gradient(rgba(16, 22, 47, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 22, 47, 0.08) 1px, transparent 1px),
    #fffef7;
  background-size: 26px 26px, 26px 26px, auto;
}

.training-diagnostics-lab__axis {
  stroke: #10162f;
  stroke-width: 1.7;
}

.training-diagnostics-lab__line {
  fill: none;
  stroke-linejoin: round;
  stroke-linecap: round;
  stroke-width: 3.5;
}

.training-diagnostics-lab__line.is-comparison {
  stroke-dasharray: 9 7;
  opacity: 0.82;
}

.training-diagnostics-lab__line.is-trainBce {
  stroke: #2563eb;
}

.training-diagnostics-lab__line.is-validationBce {
  stroke: #c2410c;
}

.training-diagnostics-lab__line.is-gradientNorm {
  stroke: #087a61;
}

.training-diagnostics-lab__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 13px;
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 800;
}

.training-diagnostics-lab__selectors,
.training-diagnostics-lab__run-readouts,
.training-diagnostics-lab__synthetic-readouts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.training-diagnostics-lab__selectors label,
.training-diagnostics-lab__synthetic-support > label {
  display: grid;
  gap: 7px;
  color: var(--muted);
  font-size: 0.88rem;
  font-weight: 700;
}

.training-diagnostics-lab select {
  width: 100%;
  min-height: 42px;
  padding: 0 11px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: 10px;
  background: white;
  color: var(--ink);
  font: inherit;
}

.training-diagnostics-lab__curve-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 9px 14px;
  margin: 0;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
}

.training-diagnostics-lab__curve-toggles legend {
  padding: 0 6px;
  font-weight: 800;
}

.training-diagnostics-lab__curve-toggles label {
  display: inline-flex;
  gap: 7px;
  align-items: center;
}

.training-diagnostics-lab__run-readouts article,
.training-diagnostics-lab__diagnostic-chain article,
.training-diagnostics-lab__synthetic-readouts article,
.training-diagnostics-lab__state {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.09);
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.9);
}

.training-diagnostics-lab__run-readouts span,
.training-diagnostics-lab__diagnostic-chain span,
.training-diagnostics-lab__synthetic-readouts span {
  color: var(--muted);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.training-diagnostics-lab__run-readouts strong,
.training-diagnostics-lab__state small {
  overflow-wrap: anywhere;
}

.training-diagnostics-lab__state.is-error {
  border-color: rgba(190, 18, 60, 0.28);
  background: rgba(190, 18, 60, 0.08);
}

.training-diagnostics-lab button {
  justify-self: start;
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

.training-diagnostics-lab__synthetic-support {
  border-left: 4px dashed #64748b;
  background: rgba(248, 250, 252, 0.92);
}

.training-diagnostics-lab__synthetic-readouts {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 600px) {
  .training-diagnostics-lab__selectors,
  .training-diagnostics-lab__run-readouts,
  .training-diagnostics-lab__synthetic-readouts {
    grid-template-columns: 1fr;
  }
}
</style>
