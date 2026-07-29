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
type LearningRow = RegressionLossRow & {
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

const fallbackRows: readonly LearningRow[] = [
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

const representativeRows = computed<readonly LearningRow[]>(() => {
  const rows = props.regressionSummary?.representativeRows
  if (!rows?.length) return fallbackRows
  return rows
    .filter((row) =>
      [
        row.targetMinutes,
        row.predictionMinutes,
        row.residualMinutes,
      ].every(Number.isFinite),
    )
    .map((row) => ({ ...row, source: 'locked-real-row' as const }))
})

watch(
  () => representativeRows.value.map((row) => row.courseRowId).join('|'),
  () => {
    if (!representativeRows.value.some((row) => row.courseRowId === selectedRowId.value)) {
      selectedRowId.value = representativeRows.value[0]?.courseRowId ?? ''
    }
  },
  { immediate: true },
)

const regressionLossKind = computed<RegressionLossKind>(() =>
  props.config.regressionLossKind === 'mae' ? 'mae' : 'mse',
)
const targets = computed(() => representativeRows.value.map((row) => row.targetMinutes))
const predictions = computed(() =>
  representativeRows.value.map((row) => row.predictionMinutes),
)
const evaluation = computed(() =>
  evaluateLossGradient(regressionLossKind.value, targets.value, predictions.value),
)
const selectedIndex = computed(() => {
  const index = representativeRows.value.findIndex(
    (row) => row.courseRowId === selectedRowId.value,
  )
  return index < 0 ? 0 : index
})
const selectedRow = computed(() => representativeRows.value[selectedIndex.value]!)
const perElementLosses = computed(() => evaluation.value.perElementLosses)
const perElementGradients = computed(() => evaluation.value.perElementGradients)
const meanObjective = computed(() => evaluation.value.meanObjective)

const copy = computed(() => {
  const zh = locale.value === 'zh-CN'
  return {
    eyebrow: zh ? '真实配送行 · 完整目标链' : 'Real delivery row · complete objective loop',
    title: zh ? '一条预测怎样进入训练目标' : 'How one prediction enters the training objective',
    intro: zh
      ? '选择一条本地锁定代表行，沿着目标、预测、残差、逐行损失、输出梯度和批次均值逐步核对。'
      : 'Choose a locked local representative row and trace target, prediction, residual, row loss, output gradient, and batch mean.',
    lossRule: zh ? '损失规则' : 'Loss rule',
    row: zh ? '代表行' : 'Representative row',
    current: zh ? '当前' : 'Current',
    reset: zh ? '重置实验' : 'Reset lab',
    target: zh ? '目标时长 y' : 'Target duration y',
    prediction: zh ? '预测时长 ŷ' : 'Predicted duration ŷ',
    residual: zh ? '残差 ŷ − y' : 'Residual ŷ − y',
    rowLoss: zh ? '逐行损失 ℓ' : 'Per-row loss ℓ',
    rowGradient: zh ? '输出梯度 ∂ℓ/∂ŷ' : 'Output gradient ∂ℓ/∂ŷ',
    objective: zh ? '代表批次均值 L' : 'Representative-batch mean L',
    sourceReal: zh ? '本地锁定真实行' : 'locked local real row',
    sourceFallback: zh ? '内置教学回退值' : 'built-in teaching fallback',
    note: zh
      ? '训练不会直接最小化“残差”这个标签；它先用损失规则把每条残差变成可比较的代价，再对批次取均值。梯度给出当前预测应调整的方向与尺度。'
      : 'Training does not minimize the residual label directly. A loss rule first turns every residual into a comparable cost, then the batch is averaged. The gradient supplies the direction and scale for changing the prediction.',
    kink: zh ? '此处是 MAE 尖点：子梯度取 0，但函数不可微。' : 'This is the MAE kink: the chosen subgradient is 0, but the function is nondifferentiable.',
  }
})

const flowCards = computed(() => [
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
    id: 'loss',
    label: copy.value.rowLoss,
    value: perElementLosses.value[selectedIndex.value] ?? 0,
  },
  {
    id: 'gradient',
    label: copy.value.rowGradient,
    value: perElementGradients.value[selectedIndex.value] ?? 0,
  },
  { id: 'objective', label: copy.value.objective, value: meanObjective.value },
])

function setLossKind(kind: RegressionLossKind) {
  emit('patch-config', {
    lossFamily: 'regression',
    regressionLossKind: kind,
  })
}

function reset() {
  selectedRowId.value = representativeRows.value[0]?.courseRowId ?? ''
  setLossKind('mse')
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'
  if (Math.abs(value) >= 1000 || Math.abs(value) < 0.001) return value.toExponential(4)
  return value.toFixed(4)
}
</script>

<template>
  <section class="lesson-lab lesson-lab--overview loss-real-row-lab">
    <header class="loss-real-row-lab__header">
      <span>{{ copy.eyebrow }}</span>
      <strong>{{ copy.title }}</strong>
      <p>{{ copy.intro }}</p>
    </header>

    <div class="lesson-lab__controls loss-real-row-controls">
      <label>
        <span>{{ copy.lossRule }} · {{ copy.current }}: {{ regressionLossKind.toUpperCase() }}</span>
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
        <span>{{ copy.row }} · {{ copy.current }}: {{ selectedRow.courseRowId }}</span>
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
          ? `● ${copy.sourceReal}`
          : `◇ ${copy.sourceFallback}`
      }}
      · n={{ representativeRows.length }}
    </p>

    <div class="loss-objective-flow" aria-label="target to mean objective">
      <article v-for="(card, index) in flowCards" :key="card.id">
        <span>{{ index + 1 }} · {{ card.label }}</span>
        <strong>{{ formatNumber(card.value) }}</strong>
      </article>
    </div>

    <p
      v-if="regressionLossKind === 'mae' && !evaluation.differentiable[selectedIndex]"
      class="loss-status-note is-kink"
    >
      ◆ {{ copy.kink }}
    </p>
    <p class="lesson-lab__note">{{ copy.note }}</p>
  </section>
</template>
