<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '../types/ml'
import { withPublicBase } from '../utils/publicPath'

interface MetricSet {
  mse: number
  rmse: number
  mae: number
  r2: number
}

interface StageResult {
  id: string
  order: number
  features: string[]
  estimator: string
  alpha: number | null
  trainMetrics: MetricSet
  validationMetrics: MetricSet
}

interface NamedCase {
  role: string
  instant: number
  timestamp: string
  hour: number
  actual: number
  prediction: number
  residual: number
}

interface CoefficientSpace {
  intercept: number
  rows: Array<{ feature: string; coefficient: number }>
}

interface RegularizationPathRow {
  model: string
  alpha: number
  validationRmse: number
  coefficients: Record<string, number>
}

interface Phase27aSummary {
  contractVersion: string
  split: Record<'train' | 'validation' | 'test', { rows: number; instantRange: [number, number] }>
  featureStages: StageResult[]
  polynomialDiagnostics: Array<{ degree: number; trainRmse: number; validationRmse: number }>
  selection: { selectedStageId: string; selectedValidationMetrics: MetricSet; simplicityTolerance: number }
  gradientDescent: { learningRate: number; updates: number; finalMse: number; maxParameterDeltaVsSklearn: number }
  coefficientInterpretation: {
    selectedStageSpaces: { modelSpace: CoefficientSpace; rawContinuousUnits: CoefficientSpace }
    tempAtempTrainingCorrelation: number
  }
  validationDiagnostics: { metrics: MetricSet; namedFailureCases: NamedCase[] }
  regularization: { ridge: RegularizationPathRow[]; lasso: RegularizationPathRow[] }
  finalTest: { metrics: MetricSet; evaluatedRows: number; evaluationCount: number }
  figures: Array<{ id: string; fallback: Record<string, number> }>
}

interface TraceRow {
  update: number
  mse: number
  gradientNorm: number
}

interface Option {
  value: string
  label: string
}

interface ControlSpec {
  label: string
  options?: Option[]
  min?: number
  max?: number
  step?: number
  suffix?: string
}

const props = defineProps<{ chapterId: string; controlLabels: Array<{ 'zh-CN': string; en: string }> }>()
const { locale } = useI18n()
const activeLocale = computed(() => locale.value as AppLocale)
const zh = computed(() => activeLocale.value === 'zh-CN')
const state = ref<'loading' | 'ready' | 'error'>('loading')
const summary = ref<Phase27aSummary>()
const trace = ref<TraceRow[]>([])
const primary = ref<string | number>('')
const secondary = ref<string | number>('')
let controller: AbortController | undefined

const chapterDefaults: Record<string, [string | number, string | number]> = {
  'fit-line': [0.5, 1],
  multivariate: ['train', 'core-five'],
  'residual-loss': [-200, 'mse'],
  'training-motion': ['765', '0.1'],
  polynomial: ['3', 'calendar-weather-cycle'],
  'model-limits': ['yr', 'modelSpace'],
  overfitting: ['named-case', 'morning-peak-underprediction'],
  regularization: ['ridge', '10'],
}

const labels = computed(() => ({
  loading: zh.value ? '正在读取 v2 本地运行结果…' : 'Loading local v2 runtime results…',
  error: zh.value ? '本地结果暂时不可用，请参考本章紧邻代码的运行输出。' : 'Local results are unavailable; use the runtime output beside the chapter code.',
  ready: zh.value ? '以下数值来自已执行 Notebook 和发布资产。' : 'The values below come from the executed notebooks and published assets.',
  reset: zh.value ? '重置观察台' : 'Reset lab',
  result: zh.value ? '观察结果' : 'Observation result',
  published: zh.value ? '已发布数值' : 'Published value',
  illustrative: zh.value ? '参数观察' : 'Parameter observation',
}))

function localized(copy: { 'zh-CN': string; en: string }) {
  return copy[activeLocale.value]
}

function format(value: number, digits = 3) {
  return Number.isFinite(value) ? value.toFixed(digits) : '—'
}

function parseTrace(source: string): TraceRow[] {
  const [header, ...lines] = source.trim().split(/\r?\n/)
  const columns = header?.split(',') ?? []
  const index = (name: string) => columns.indexOf(name)
  return lines.map((line) => {
    const values = line.split(',')
    return {
      update: Number(values[index('update')]),
      mse: Number(values[index('mse')]),
      gradientNorm: Number(values[index('gradientNorm')]),
    }
  }).filter((row) => Object.values(row).every(Number.isFinite))
}

function validateSummary(value: unknown): Phase27aSummary {
  if (!value || typeof value !== 'object') throw new TypeError('summary must be an object')
  const candidate = value as Phase27aSummary
  if (candidate.contractVersion !== 'linear-regression-phase-27a-summary-v2') throw new TypeError('summary version mismatch')
  if (!Array.isArray(candidate.featureStages) || candidate.featureStages.length !== 6) throw new TypeError('feature stages missing')
  if (candidate.split.train.rows !== 10427 || candidate.split.validation.rows !== 3476 || candidate.split.test.rows !== 3476) throw new TypeError('split drifted')
  return candidate
}

async function loadResults() {
  controller?.abort()
  controller = new AbortController()
  state.value = 'loading'
  try {
    const [summaryResponse, traceResponse] = await Promise.all([
      fetch(withPublicBase('/linear-regression/phase-27a/linear-regression-course-summary.json'), { signal: controller.signal }),
      fetch(withPublicBase('/linear-regression/phase-27a/gradient-descent-trace.csv'), { signal: controller.signal }),
    ])
    if (!summaryResponse.ok || !traceResponse.ok) throw new Error('asset request failed')
    summary.value = validateSummary(await summaryResponse.json())
    trace.value = parseTrace(await traceResponse.text())
    state.value = 'ready'
  } catch (error) {
    if (!controller.signal.aborted) state.value = 'error'
  }
}

function reset() {
  const [nextPrimary, nextSecondary] = chapterDefaults[props.chapterId] ?? ['', '']
  primary.value = nextPrimary
  secondary.value = nextSecondary
}

watch(() => props.chapterId, reset, { immediate: true })
void loadResults()
onBeforeUnmount(() => controller?.abort())

const stageOptions = computed<Option[]>(() => summary.value?.featureStages.map((stage) => ({
  value: stage.id,
  label: stage.id.replaceAll('-', ' '),
})) ?? [])

const coefficientOptions = computed<Option[]>(() => {
  const rows = summary.value?.coefficientInterpretation.selectedStageSpaces.modelSpace.rows ?? []
  return rows.slice().sort((left, right) => Math.abs(right.coefficient) - Math.abs(left.coefficient)).slice(0, 12).map((row) => ({ value: row.feature, label: row.feature }))
})

const caseOptions = computed<Option[]>(() => summary.value?.validationDiagnostics.namedFailureCases.map((row) => ({
  value: row.role,
  label: row.role.replaceAll('-', ' '),
})) ?? [])

const primarySpec = computed<ControlSpec>(() => {
  switch (props.chapterId) {
    case 'fit-line': return { label: localized(props.controlLabels[0]!), min: 0.1, max: 0.9, step: 0.05 }
    case 'multivariate': return { label: localized(props.controlLabels[0]!), options: ['train', 'validation', 'test'].map((value) => ({ value, label: value })) }
    case 'residual-loss': return { label: localized(props.controlLabels[0]!), min: -600, max: 600, step: 25 }
    case 'training-motion': return { label: localized(props.controlLabels[1]!), options: trace.value.map((row) => ({ value: String(row.update), label: String(row.update) })) }
    case 'polynomial': return { label: localized(props.controlLabels[1]!), options: (summary.value?.polynomialDiagnostics ?? []).map((row) => ({ value: String(row.degree), label: String(row.degree) })) }
    case 'model-limits': return { label: localized(props.controlLabels[1]!), options: coefficientOptions.value }
    case 'overfitting': return { label: localized(props.controlLabels[0]!), options: [{ value: 'metrics', label: zh.value ? '训练/验证指标' : 'train/validation metrics' }, { value: 'named-case', label: zh.value ? '具名失败案例' : 'named failure case' }] }
    case 'regularization': return { label: localized(props.controlLabels[0]!), options: ['ols', 'ridge', 'lasso'].map((value) => ({ value, label: value.toUpperCase() })) }
    default: return { label: localized(props.controlLabels[0] ?? { 'zh-CN': '观察项', en: 'View' }), options: [] }
  }
})

const secondarySpec = computed<ControlSpec>(() => {
  switch (props.chapterId) {
    case 'fit-line': return { label: localized(props.controlLabels[1]!), min: 0.5, max: 1.5, step: 0.1, suffix: '×' }
    case 'multivariate': return { label: localized(props.controlLabels[1]!), options: stageOptions.value }
    case 'residual-loss': return { label: localized(props.controlLabels[1]!), options: [{ value: 'mse', label: 'squared error' }, { value: 'mae', label: 'absolute error' }] }
    case 'training-motion': return { label: localized(props.controlLabels[0]!), options: [{ value: '0.01', label: '0.01' }, { value: '0.1', label: '0.1' }, { value: '0.5', label: '0.5' }] }
    case 'polynomial': return { label: localized(props.controlLabels[0]!), options: stageOptions.value }
    case 'model-limits': return { label: localized(props.controlLabels[0]!), options: [{ value: 'modelSpace', label: zh.value ? '模型空间' : 'model space' }, { value: 'rawContinuousUnits', label: zh.value ? '原始连续单位' : 'raw continuous units' }] }
    case 'overfitting': return { label: localized(props.controlLabels[1]!), options: caseOptions.value }
    case 'regularization': return { label: localized(props.controlLabels[1]!), options: ['0.01', '0.1', '1', '10', '100', '1000'].map((value) => ({ value, label: value })) }
    default: return { label: localized(props.controlLabels[1] ?? { 'zh-CN': '参数', en: 'Parameter' }), options: [] }
  }
})

const resultLines = computed<string[]>(() => {
  const value = summary.value
  if (!value) return []
  if (props.chapterId === 'fit-line') {
    const fallback = value.figures.find((figure) => figure.id === 'fit-line-temp')?.fallback ?? {}
    const intercept = Number(fallback.intercept)
    const slope = Number(fallback.slope) * Number(secondary.value)
    const prediction = intercept + slope * Number(primary.value)
    return [
      `ŷ = ${format(intercept)} + ${format(slope)} × ${format(Number(primary.value), 2)}`,
      `${zh.value ? '预测 cnt' : 'predicted cnt'} = ${format(prediction)}`,
      Number(secondary.value) === 1 ? labels.value.published : labels.value.illustrative,
    ]
  }
  if (props.chapterId === 'multivariate') {
    const partition = value.split[String(primary.value) as 'train' | 'validation' | 'test']
    const stage = value.featureStages.find((entry) => entry.id === secondary.value)
    return [
      `${primary.value}: ${partition.rows.toLocaleString()} rows · instant ${partition.instantRange.join('–')}`,
      `${stage?.id}: ${stage?.features.join(' · ')}`,
      `${zh.value ? '禁用列' : 'forbidden columns'}: casual · registered`,
    ]
  }
  if (props.chapterId === 'residual-loss') {
    const residual = Number(primary.value)
    const contribution = secondary.value === 'mse' ? residual ** 2 : Math.abs(residual)
    return [
      `residual = ${format(residual, 0)} (${residual >= 0 ? (zh.value ? '预测偏高' : 'overprediction') : (zh.value ? '预测偏低' : 'underprediction')})`,
      `${secondary.value === 'mse' ? 'residual²' : '|residual|'} = ${format(contribution, 0)}`,
      zh.value ? '平方误差会更快放大大残差。' : 'Squared error magnifies large residuals faster.',
    ]
  }
  if (props.chapterId === 'training-motion') {
    const row = trace.value.find((entry) => entry.update === Number(primary.value)) ?? trace.value.at(-1)
    return [
      `update ${row?.update ?? '—'} · MSE ${row ? format(row.mse, 6) : '—'} · ||gradient|| ${row ? row.gradientNorm.toExponential(3) : '—'}`,
      `η = ${secondary.value}`,
      Number(secondary.value) === value.gradientDescent.learningRate
        ? `${labels.value.published} · max Δ vs sklearn ${value.gradientDescent.maxParameterDeltaVsSklearn.toExponential(3)}`
        : (zh.value ? '轨迹文件固定 η=0.1；其他学习率用于比较步长含义，不冒充发布结果。' : 'The published trace fixes η=0.1; other rates illustrate step size and are not presented as published results.'),
    ]
  }
  if (props.chapterId === 'polynomial') {
    const degree = value.polynomialDiagnostics.find((entry) => entry.degree === Number(primary.value))
    const stage = value.featureStages.find((entry) => entry.id === secondary.value)
    return [
      `degree ${degree?.degree}: train RMSE ${degree ? format(degree.trainRmse) : '—'} · validation RMSE ${degree ? format(degree.validationRmse) : '—'}`,
      `${stage?.id}: train ${stage ? format(stage.trainMetrics.rmse) : '—'} · validation ${stage ? format(stage.validationMetrics.rmse) : '—'}`,
      zh.value ? '选择看验证 RMSE；复杂度相近时保留更简单方案。' : 'Select by validation RMSE; keep the simpler design when performance is close.',
    ]
  }
  if (props.chapterId === 'model-limits') {
    const spaces = value.coefficientInterpretation.selectedStageSpaces
    const space = spaces[String(secondary.value) as keyof typeof spaces]
    const row = space.rows.find((entry) => entry.feature === primary.value)
    return [
      `${primary.value}: ${format(row?.coefficient ?? Number.NaN, 6)}`,
      `intercept: ${format(space.intercept, 6)}`,
      zh.value ? '这是保持其他入模特征不变时的条件关联，不是因果效应。' : 'This is a conditional association holding other modeled features fixed, not a causal effect.',
    ]
  }
  if (props.chapterId === 'overfitting') {
    if (primary.value === 'metrics') {
      const selected = value.featureStages.find((entry) => entry.id === value.selection.selectedStageId)
      return [
        `train RMSE ${selected ? format(selected.trainMetrics.rmse) : '—'} · validation RMSE ${format(value.validationDiagnostics.metrics.rmse)}`,
        `validation MAE ${format(value.validationDiagnostics.metrics.mae)} · R² ${format(value.validationDiagnostics.metrics.r2)}`,
        zh.value ? '训练—验证差距与分时残差结构需要一起解释。' : 'Interpret the train-validation gap together with hourly residual structure.',
      ]
    }
    const row = value.validationDiagnostics.namedFailureCases.find((entry) => entry.role === secondary.value)
    return row ? [
      `${row.role} · instant ${row.instant} · ${row.timestamp}`,
      `actual ${format(row.actual, 0)} · prediction ${format(row.prediction)} · residual ${format(row.residual)}`,
      row.residual < 0 ? (zh.value ? '负残差：模型低估。' : 'Negative residual: the model underpredicts.') : (zh.value ? '正残差：模型高估。' : 'Positive residual: the model overpredicts.'),
    ] : []
  }
  const model = String(primary.value)
  if (model === 'ols') {
    const stage = value.featureStages.find((entry) => entry.id === value.selection.selectedStageId)
    return [
      `OLS · validation RMSE ${stage ? format(stage.validationMetrics.rmse) : '—'}`,
      `${zh.value ? '最终测试' : 'final test'} RMSE ${format(value.finalTest.metrics.rmse)} · MAE ${format(value.finalTest.metrics.mae)} · R² ${format(value.finalTest.metrics.r2)}`,
      `${zh.value ? '测试评价次数' : 'test evaluation count'} = ${value.finalTest.evaluationCount}`,
    ]
  }
  const path = value.regularization[model as 'ridge' | 'lasso']
  const requestedAlpha = Number(secondary.value)
  const row = path.reduce((best, entry) => Math.abs(Math.log10(entry.alpha) - Math.log10(requestedAlpha)) < Math.abs(Math.log10(best.alpha) - Math.log10(requestedAlpha)) ? entry : best)
  return [
    `${model.toUpperCase()} · alpha ${format(row.alpha, 3)} · validation RMSE ${format(row.validationRmse)}`,
    `temp ${format(row.coefficients.temp, 4)} · atemp ${format(row.coefficients.atemp, 4)}`,
    `${zh.value ? '训练集 temp/atemp 相关系数' : 'training temp/atemp correlation'} = ${format(value.coefficientInterpretation.tempAtempTrainingCorrelation, 4)}`,
  ]
})
</script>

<template>
  <section class="linear-observation-lab" :data-chapter-id="chapterId">
    <p v-if="state === 'loading'" class="linear-observation-lab__state" role="status">{{ labels.loading }}</p>
    <p v-else-if="state === 'error'" class="linear-observation-lab__state is-error" role="status">{{ labels.error }}</p>
    <template v-else>
      <p class="linear-observation-lab__state" role="status">{{ labels.ready }}</p>
      <div class="linear-observation-lab__controls">
        <label>
          <span>{{ primarySpec.label }}</span>
          <select v-if="primarySpec.options" v-model="primary">
            <option v-for="option in primarySpec.options" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <span v-else class="linear-observation-lab__range">
            <input v-model.number="primary" type="range" :min="primarySpec.min" :max="primarySpec.max" :step="primarySpec.step">
            <strong>{{ primary }}{{ primarySpec.suffix }}</strong>
          </span>
        </label>
        <label>
          <span>{{ secondarySpec.label }}</span>
          <select v-if="secondarySpec.options" v-model="secondary">
            <option v-for="option in secondarySpec.options" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <span v-else class="linear-observation-lab__range">
            <input v-model.number="secondary" type="range" :min="secondarySpec.min" :max="secondarySpec.max" :step="secondarySpec.step">
            <strong>{{ secondary }}{{ secondarySpec.suffix }}</strong>
          </span>
        </label>
      </div>
      <section class="linear-observation-lab__result" aria-live="polite">
        <span>{{ labels.result }}</span>
        <p v-for="line in resultLines" :key="line">{{ line }}</p>
      </section>
      <button type="button" class="linear-observation-lab__reset" @click="reset">{{ labels.reset }}</button>
    </template>
  </section>
</template>
