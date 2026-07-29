<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  BceGradientSummary,
  RegressionLossSummary,
} from '../data/lossFunctionsAssets'
import {
  evaluateLossGradient,
  evaluateStepSweep,
  LOCKED_FINITE_DIFFERENCE_STEPS,
  LOCKED_FINITE_DIFFERENCE_TOLERANCE,
  type LossKind,
} from '../simulations/lossFunctionsMath'

interface GradientScenarioRow {
  id: string
  label: string
  target: number
  output: number
  source: 'locked-real-row' | 'teaching-fallback'
}

const props = defineProps<{
  regressionSummary?: RegressionLossSummary
  bceSummary?: BceGradientSummary
}>()

const { locale } = useI18n()
const lossKind = ref<LossKind>('mse')
const selectedElementId = ref('')
const selectedStep = ref(1e-5)

const fallbackRegressionRows: readonly GradientScenarioRow[] = [
  {
    id: 'fallback-short',
    label: 'target 0 / prediction 175',
    target: 0,
    output: 175,
    source: 'teaching-fallback',
  },
  {
    id: 'fallback-kink',
    label: 'target 175 / prediction 175',
    target: 175,
    output: 175,
    source: 'teaching-fallback',
  },
  {
    id: 'fallback-long',
    label: 'target 3573 / prediction 175',
    target: 3573,
    output: 175,
    source: 'teaching-fallback',
  },
]

const fallbackBceRows: readonly GradientScenarioRow[] = [
  {
    id: 'fallback-bce-correct',
    label: 'label 0 / logit -2',
    target: 0,
    output: -2,
    source: 'teaching-fallback',
  },
  {
    id: 'fallback-bce-wrong',
    label: 'label 1 / logit -3',
    target: 1,
    output: -3,
    source: 'teaching-fallback',
  },
]

const regressionRows = computed<readonly GradientScenarioRow[]>(() => {
  const rows = props.regressionSummary?.representativeRows
  if (!rows?.length) return fallbackRegressionRows
  return rows.map((row) => ({
    id: row.courseRowId,
    label: `${row.courseRowId} · ${row.role}`,
    target: row.targetMinutes,
    output: row.predictionMinutes,
    source: 'locked-real-row',
  }))
})

const bceRows = computed<readonly GradientScenarioRow[]>(() => {
  if (!props.bceSummary) return fallbackBceRows
  const candidates = [
    ...props.bceSummary.rows.slice(0, 3),
    props.bceSummary.confidentError,
  ]
  const unique = new Map(candidates.map((row) => [row.courseRowId, row]))
  return [...unique.values()].map((row) => ({
    id: row.courseRowId,
    label: `${row.courseRowId} · y=${row.label}, z=${formatNumber(row.logit)}`,
    target: row.label,
    output: row.logit,
    source: 'locked-real-row',
  }))
})

const scenarioRows = computed(() =>
  lossKind.value === 'bce' ? bceRows.value : regressionRows.value,
)

watch(
  [lossKind, () => scenarioRows.value.map((row) => row.id).join('|')],
  () => {
    if (!scenarioRows.value.some((row) => row.id === selectedElementId.value)) {
      const kink = lossKind.value === 'mae'
        ? scenarioRows.value.find((row) => row.target === row.output)
        : undefined
      selectedElementId.value = (kink ?? scenarioRows.value[0])?.id ?? ''
    }
  },
  { immediate: true },
)

const selectedIndex = computed(() => {
  const index = scenarioRows.value.findIndex((row) => row.id === selectedElementId.value)
  return index < 0 ? 0 : index
})

const targets = computed(() => scenarioRows.value.map((row) => row.target))
const outputs = computed(() => scenarioRows.value.map((row) => row.output))
const evaluation = computed(() =>
  evaluateLossGradient(lossKind.value, targets.value, outputs.value),
)
const sweep = computed(() =>
  evaluateStepSweep({
    kind: lossKind.value,
    targets: targets.value,
    outputs: outputs.value,
    index: selectedIndex.value,
    tolerance: LOCKED_FINITE_DIFFERENCE_TOLERANCE,
  }),
)
const selectedSweep = computed(
  () => sweep.value.find((row) => row.step === selectedStep.value) ?? sweep.value[0]!,
)
const selectedScenario = computed(() => scenarioRows.value[selectedIndex.value]!)
const isKink = computed(() => selectedSweep.value.status === 'kink')

const copy = computed(() => {
  const zh = locale.value === 'zh-CN'
  return {
    eyebrow: zh ? '互动实验 · 输出梯度' : 'Interactive lab · output gradients',
    title: zh ? '解析梯度与中心差分核对' : 'Analytic gradient versus central difference',
    intro: zh
      ? '先选择损失和代表行，再改变 h。页面调用同一套纯 TypeScript 计算；MAE 零残差会明确标成不可微。'
      : 'Choose a loss and representative row, then change h. The page calls the same pure TypeScript authority; zero-residual MAE is explicitly nondifferentiable.',
    loss: zh ? '损失类型' : 'Loss kind',
    element: zh ? '代表元素' : 'Representative element',
    step: zh ? '中心差分步长 h' : 'Central-difference step h',
    reset: zh ? '重置实验' : 'Reset lab',
    current: zh ? '当前选择' : 'Current selection',
    perElement: zh ? '逐元素解析梯度' : 'Per-element analytic gradient',
    mean: zh ? '均值目标解析梯度' : 'Mean-objective analytic gradient',
    numerical: zh ? '中心差分梯度' : 'Central-difference gradient',
    error: zh ? '绝对误差' : 'Absolute error',
    tolerance: zh ? '容差' : 'Tolerance',
    pass: zh ? '通过' : 'pass',
    fail: zh ? '未通过' : 'fail',
    kink: zh ? '不可微（MAE 尖点）' : 'nondifferentiable (MAE kink)',
    real: zh ? '本地锁定真实行' : 'locked local real row',
    fallback: zh ? '内置教学回退值' : 'built-in teaching fallback',
    sweep: zh ? '固定 h 扫描' : 'Locked h sweep',
    sweepNote: zh
      ? '形状符号与文字共同表达状态：● 通过，▲ 未通过，◆ 不可微。'
      : 'Shape and text both carry status: ● pass, ▲ fail, ◆ nondifferentiable.',
    stepColumn: 'h',
    analyticColumn: zh ? '解析值' : 'Analytic',
    numericColumn: zh ? '差分值' : 'Numeric',
    errorColumn: zh ? '误差' : 'Error',
    statusColumn: zh ? '状态' : 'Status',
  }
})

function reset() {
  lossKind.value = 'mse'
  selectedElementId.value = regressionRows.value[0]?.id ?? ''
  selectedStep.value = 1e-5
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'
  if (Math.abs(value) >= 1000 || Math.abs(value) < 0.001) return value.toExponential(4)
  return value.toFixed(6)
}

function statusLabel(status: 'pass' | 'fail' | 'kink') {
  if (status === 'kink') return `◆ ${copy.value.kink}`
  if (status === 'pass') return `● ${copy.value.pass}`
  return `▲ ${copy.value.fail}`
}
</script>

<template>
  <section class="panel loss-gradient-lab">
    <header class="loss-gradient-lab__header">
      <span>{{ copy.eyebrow }}</span>
      <strong>{{ copy.title }}</strong>
      <p>{{ copy.intro }}</p>
    </header>

    <div class="loss-gradient-lab__controls">
      <label>
        <span>{{ copy.loss }} · {{ copy.current }}: {{ lossKind.toUpperCase() }}</span>
        <select v-model="lossKind" aria-label="Loss kind">
          <option value="mse">MSE</option>
          <option value="mae">MAE</option>
          <option value="bce">BCE</option>
        </select>
      </label>

      <label>
        <span>{{ copy.element }} · {{ copy.current }}: {{ selectedScenario.label }}</span>
        <select v-model="selectedElementId" aria-label="Representative element">
          <option v-for="row in scenarioRows" :key="row.id" :value="row.id">
            {{ row.label }}
          </option>
        </select>
      </label>

      <label>
        <span>{{ copy.step }} · {{ copy.current }}: {{ selectedStep.toExponential(0) }}</span>
        <select v-model.number="selectedStep" aria-label="Central difference step">
          <option v-for="step in LOCKED_FINITE_DIFFERENCE_STEPS" :key="step" :value="step">
            {{ step.toExponential(0) }}
          </option>
        </select>
      </label>

      <button type="button" class="button-quiet" @click="reset">
        {{ copy.reset }}
      </button>
    </div>

    <p class="loss-gradient-lab__source">
      {{ selectedScenario.source === 'locked-real-row' ? copy.real : copy.fallback }}
      · n={{ scenarioRows.length }}
    </p>

    <div class="loss-gradient-lab__readouts">
      <article>
        <span>{{ copy.perElement }}</span>
        <strong>{{ formatNumber(evaluation.perElementGradients[selectedIndex]) }}</strong>
      </article>
      <article>
        <span>{{ copy.mean }}</span>
        <strong>{{ formatNumber(evaluation.meanObjectiveGradients[selectedIndex]) }}</strong>
      </article>
      <article>
        <span>{{ copy.numerical }}</span>
        <strong>{{ formatNumber(selectedSweep.numericalValue) }}</strong>
      </article>
      <article>
        <span>{{ copy.error }}</span>
        <strong>{{ formatNumber(selectedSweep.absoluteError) }}</strong>
      </article>
      <article>
        <span>{{ copy.tolerance }}</span>
        <strong>{{ formatNumber(selectedSweep.tolerance) }}</strong>
      </article>
    </div>

    <p
      class="loss-gradient-lab__status"
      :class="`is-${selectedSweep.status}`"
      role="status"
    >
      {{ statusLabel(selectedSweep.status) }}
      <span v-if="isKink">
        {{
          locale === 'zh-CN'
            ? '中心差分为 0 也不能证明这里存在唯一导数；页面采用子梯度 0。'
            : 'A zero central difference does not prove a unique derivative here; the page uses subgradient 0.'
        }}
      </span>
    </p>

    <div class="loss-table-scroll">
      <table class="loss-gradient-lab__sweep">
        <caption>
          <strong>{{ copy.sweep }}</strong>
          <span>{{ copy.sweepNote }}</span>
        </caption>
        <thead>
          <tr>
            <th scope="col">{{ copy.stepColumn }}</th>
            <th scope="col">{{ copy.analyticColumn }}</th>
            <th scope="col">{{ copy.numericColumn }}</th>
            <th scope="col">{{ copy.errorColumn }}</th>
            <th scope="col">{{ copy.statusColumn }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in sweep"
            :key="row.step"
            :class="{ 'is-current': row.step === selectedStep }"
          >
            <td>{{ row.step.toExponential(0) }}</td>
            <td>{{ formatNumber(row.analyticValue) }}</td>
            <td>{{ formatNumber(row.numericalValue) }}</td>
            <td>{{ formatNumber(row.absoluteError) }}</td>
            <td>{{ statusLabel(row.status) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
