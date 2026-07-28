<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  RegressionLossRow,
  RegressionLossSummary,
} from '../data/lossFunctionsAssets'
import { evaluateLossGradient } from '../simulations/lossFunctionsMath'
import type {
  ExperimentConfig,
  ExperimentConfigValue,
  TrainingSnapshot,
} from '../types/ml'

type RegressionLossKind = 'mse' | 'mae'
type ComparisonRow = RegressionLossRow & {
  role: string
  source: 'locked-real-row' | 'teaching-fallback'
}

const props = defineProps<{
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
  regressionSummary?: RegressionLossSummary
}>()

const emit = defineEmits<{
  'update-config': [key: string, value: ExperimentConfigValue]
  'patch-config': [config: Partial<ExperimentConfig>]
}>()

const { locale } = useI18n()
const selectedRowId = ref('')

const fallbackRows: readonly ComparisonRow[] = [
  {
    courseRowId: 'fallback-zero-duration',
    role: 'zero-duration',
    targetMinutes: 0,
    predictionMinutes: 175,
    residualMinutes: -175,
    mseLoss: 30_625,
    maeLoss: 175,
    msePerElementGradient: 350,
    maePerElementSubgradient: 1,
    maeDifferentiable: true,
    mseMeanObjectiveGradient: 116.6666667,
    maeMeanObjectiveSubgradient: 0.3333333,
    source: 'teaching-fallback',
  },
  {
    courseRowId: 'fallback-typical',
    role: 'typical-zero-residual',
    targetMinutes: 175,
    predictionMinutes: 175,
    residualMinutes: 0,
    mseLoss: 0,
    maeLoss: 0,
    msePerElementGradient: 0,
    maePerElementSubgradient: 0,
    maeDifferentiable: false,
    mseMeanObjectiveGradient: 0,
    maeMeanObjectiveSubgradient: 0,
    source: 'teaching-fallback',
  },
  {
    courseRowId: 'fallback-long-duration',
    role: 'long-duration',
    targetMinutes: 3573,
    predictionMinutes: 175,
    residualMinutes: 3398,
    mseLoss: 11_546_404,
    maeLoss: 3398,
    msePerElementGradient: -6796,
    maePerElementSubgradient: -1,
    maeDifferentiable: true,
    mseMeanObjectiveGradient: -2265.3333333,
    maeMeanObjectiveSubgradient: -0.3333333,
    source: 'teaching-fallback',
  },
]

const representativeRows = computed<readonly ComparisonRow[]>(() => {
  const rows = props.regressionSummary?.representativeRows
  if (!rows?.length) return fallbackRows
  return rows
    .filter((row) =>
      [row.targetMinutes, row.predictionMinutes].every(Number.isFinite),
    )
    .map((row) => ({ ...row, source: 'locked-real-row' as const }))
})

watch(
  () => representativeRows.value.map((row) => row.courseRowId).join('|'),
  () => {
    if (!representativeRows.value.some((row) => row.courseRowId === selectedRowId.value)) {
      selectedRowId.value =
        representativeRows.value.find((row) => row.role === 'typical-zero-residual')
          ?.courseRowId ??
        representativeRows.value[0]?.courseRowId ??
        ''
    }
  },
  { immediate: true },
)

const targets = computed(() => representativeRows.value.map((row) => row.targetMinutes))
const predictions = computed(() =>
  representativeRows.value.map((row) => row.predictionMinutes),
)
const mseEvaluation = computed(() =>
  evaluateLossGradient('mse', targets.value, predictions.value),
)
const maeEvaluation = computed(() =>
  evaluateLossGradient('mae', targets.value, predictions.value),
)
const selectedIndex = computed(() => {
  const index = representativeRows.value.findIndex(
    (row) => row.courseRowId === selectedRowId.value,
  )
  return index < 0 ? 0 : index
})
const selectedRow = computed(() => representativeRows.value[selectedIndex.value]!)
const msePerElementGradient = computed(
  () => mseEvaluation.value.perElementGradients[selectedIndex.value] ?? 0,
)
const maePerElementSubgradient = computed(
  () => maeEvaluation.value.perElementGradients[selectedIndex.value] ?? 0,
)
const differentiable = computed(
  () => maeEvaluation.value.differentiable[selectedIndex.value] ?? false,
)
const regressionLossKind = computed<RegressionLossKind>(() =>
  props.config.regressionLossKind === 'mae' ? 'mae' : 'mse',
)

const longDurationIndex = computed(() =>
  Math.max(
    0,
    representativeRows.value.findIndex((row) => row.role === 'long-duration'),
  ),
)
const baselineIndex = computed(() => {
  const nonLong = representativeRows.value.findIndex(
    (row) =>
      row.role !== 'long-duration' &&
      Math.abs(row.predictionMinutes - row.targetMinutes) > 0,
  )
  return nonLong < 0 ? 0 : nonLong
})
const outlierInfluence = computed(() => {
  const longMse = mseEvaluation.value.perElementLosses[longDurationIndex.value] ?? 0
  const longMae = maeEvaluation.value.perElementLosses[longDurationIndex.value] ?? 0
  const baseMse = mseEvaluation.value.perElementLosses[baselineIndex.value] ?? 0
  const baseMae = maeEvaluation.value.perElementLosses[baselineIndex.value] ?? 0
  return {
    mseRatio: baseMse > 0 ? longMse / baseMse : null,
    maeRatio: baseMae > 0 ? longMae / baseMae : null,
    longMse,
    longMae,
  }
})

const copy = computed(() => {
  const zh = locale.value === 'zh-CN'
  return {
    eyebrow: zh ? '真实配送行 · MSE 与 MAE' : 'Real delivery rows · MSE versus MAE',
    title: zh ? '同一批残差，两种不同的训练压力' : 'The same residuals create two different training pressures',
    intro: zh
      ? '代表行来自本地锁定的 LaDe-D 运行结果。切换行与损失，观察普通行、零残差行和长时长行如何改变逐行代价与梯度。'
      : 'Representative rows come from the locked local LaDe-D run. Switch rows and losses to compare ordinary, zero-residual, and long-duration examples.',
    row: zh ? '代表行' : 'Representative row',
    loss: zh ? '当前损失' : 'Active loss',
    reset: zh ? '重置实验' : 'Reset lab',
    target: zh ? '目标时长' : 'Target duration',
    prediction: zh ? '预测时长' : 'Predicted duration',
    residual: zh ? '残差 ŷ − y' : 'Residual ŷ − y',
    mseLoss: zh ? 'MSE 逐行代价' : 'MSE row loss',
    maeLoss: zh ? 'MAE 逐行代价' : 'MAE row loss',
    mseGradient: zh ? 'MSE 输出梯度' : 'MSE output gradient',
    maeGradient: zh ? 'MAE 子梯度' : 'MAE subgradient',
    batchMean: zh ? '代表批次均值' : 'Representative-batch mean',
    outlierTitle: zh ? '长时长行的影响' : 'Long-duration row influence',
    squared: zh ? 'MSE：残差平方，尺度会快速放大' : 'MSE: residual is squared, so scale grows rapidly',
    linear: zh ? 'MAE：残差绝对值，保持线性增长' : 'MAE: absolute residual keeps linear growth',
    ratioUnavailable: zh ? '基准行损失为 0，比例不定义' : 'Ratio is undefined because the baseline loss is zero',
    kink: zh
      ? '◆ MAE 在零残差处不可微；这里显示约定子梯度 0。'
      : '◆ MAE is nondifferentiable at zero residual; the displayed convention uses subgradient 0.',
    smooth: zh ? '● 当前行处两种损失都可微' : '● Both losses are differentiable at the selected row',
    real: zh ? '本地锁定真实行' : 'locked local real row',
    fallback: zh ? '内置教学回退值' : 'built-in teaching fallback',
    note: zh
      ? 'MSE 会让大残差拥有更大的梯度尺度，因此更容易被少数极端行牵动；MAE 的非零逐元素梯度只有方向，通常更稳健。'
      : 'MSE gives large residuals a larger gradient scale, so a few extreme rows can pull harder. MAE keeps only the direction away from its kink and is often more robust.',
  }
})

const selectedMetrics = computed(() => [
  { id: 'target', label: copy.value.target, value: selectedRow.value.targetMinutes },
  {
    id: 'prediction',
    label: copy.value.prediction,
    value: selectedRow.value.predictionMinutes,
  },
  {
    id: 'residual',
    label: copy.value.residual,
    value: selectedRow.value.predictionMinutes - selectedRow.value.targetMinutes,
  },
  {
    id: 'mse-loss',
    label: copy.value.mseLoss,
    value: mseEvaluation.value.perElementLosses[selectedIndex.value] ?? 0,
  },
  {
    id: 'mae-loss',
    label: copy.value.maeLoss,
    value: maeEvaluation.value.perElementLosses[selectedIndex.value] ?? 0,
  },
  { id: 'mse-gradient', label: copy.value.mseGradient, value: msePerElementGradient.value },
  {
    id: 'mae-gradient',
    label: copy.value.maeGradient,
    value: maePerElementSubgradient.value,
  },
])

function setLossKind(kind: RegressionLossKind) {
  emit('patch-config', {
    lossFamily: 'regression',
    regressionLossKind: kind,
  })
}

function reset() {
  selectedRowId.value =
    representativeRows.value.find((row) => row.role === 'typical-zero-residual')
      ?.courseRowId ??
    representativeRows.value[0]?.courseRowId ??
    ''
  setLossKind('mse')
}

function formatNumber(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '—'
  if (value === 0) return '0'
  if (Math.abs(value) >= 1000 || Math.abs(value) < 0.001) return value.toExponential(4)
  return value.toFixed(4)
}

function formatRatio(value: number | null) {
  return value === null || !Number.isFinite(value)
    ? copy.value.ratioUnavailable
    : `${formatNumber(value)}×`
}
</script>

<template>
  <section class="lesson-lab lesson-lab--regression loss-real-row-lab">
    <header class="loss-real-row-lab__header">
      <span>{{ copy.eyebrow }}</span>
      <strong>{{ copy.title }}</strong>
      <p>{{ copy.intro }}</p>
    </header>

    <div class="lesson-lab__controls loss-real-row-controls">
      <label>
        <span>{{ copy.loss }}: {{ regressionLossKind.toUpperCase() }}</span>
        <select
          class="loss-real-row-select"
          :value="regressionLossKind"
          @change="setLossKind(($event.target as HTMLSelectElement).value as RegressionLossKind)"
        >
          <option value="mse">MSE</option>
          <option value="mae">MAE</option>
        </select>
      </label>

      <label>
        <span>{{ copy.row }}: {{ selectedRow.courseRowId }}</span>
        <select v-model="selectedRowId" class="loss-real-row-select">
          <option
            v-for="row in representativeRows"
            :key="row.courseRowId"
            :value="row.courseRowId"
          >
            {{ row.courseRowId }} · {{ row.role }}
          </option>
        </select>
      </label>

      <button type="button" class="button-quiet" @click="reset">
        {{ copy.reset }}
      </button>
    </div>

    <p class="loss-real-row-lab__source">
      {{
        selectedRow.source === 'locked-real-row'
          ? `● ${copy.real}`
          : `◇ ${copy.fallback}`
      }}
      · {{ selectedRow.role }}
    </p>

    <div class="loss-comparison-grid">
      <article
        v-for="metric in selectedMetrics"
        :key="metric.id"
        :class="{ 'is-active': metric.id.startsWith(regressionLossKind) }"
      >
        <span>{{ metric.label }}</span>
        <strong>{{ formatNumber(metric.value) }}</strong>
      </article>
    </div>

    <p class="loss-status-note" :class="differentiable ? 'is-pass' : 'is-kink'">
      {{ differentiable ? copy.smooth : copy.kink }}
    </p>

    <section class="loss-outlier-comparison">
      <header>
        <span>{{ copy.outlierTitle }}</span>
        <strong>long-duration</strong>
      </header>
      <div>
        <article>
          <span>■ {{ copy.squared }}</span>
          <strong>{{ formatNumber(outlierInfluence.longMse) }}</strong>
          <small>{{ formatRatio(outlierInfluence.mseRatio) }}</small>
        </article>
        <article>
          <span>◆ {{ copy.linear }}</span>
          <strong>{{ formatNumber(outlierInfluence.longMae) }}</strong>
          <small>{{ formatRatio(outlierInfluence.maeRatio) }}</small>
        </article>
      </div>
    </section>

    <div class="loss-batch-objectives">
      <article>
        <span>MSE · {{ copy.batchMean }}</span>
        <strong>{{ formatNumber(mseEvaluation.meanObjective) }}</strong>
      </article>
      <article>
        <span>MAE · {{ copy.batchMean }}</span>
        <strong>{{ formatNumber(maeEvaluation.meanObjective) }}</strong>
      </article>
    </div>

    <p class="lesson-lab__note">{{ copy.note }}</p>
  </section>
</template>
