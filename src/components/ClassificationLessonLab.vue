<script setup lang="ts">
import * as d3 from 'd3'
import * as THREE from 'three'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  AppLocale,
  ExperimentConfig,
  ExperimentPreset,
  StorySection,
  TrainingSnapshot,
} from '../types/ml'
import { round } from '../utils/math'
import LessonWorkbench from './LessonWorkbench.vue'

const props = defineProps<{
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  currentStep: number
  isPlaying: boolean
  accent: string
  section: StorySection
  presets: ExperimentPreset[]
}>()

const emit = defineEmits<{
  'patch-config': [config: Partial<ExperimentConfig>]
  'toggle-play': []
  step: []
  replay: []
  reset: []
  'apply-preset': [config: Partial<ExperimentConfig>]
}>()

const { t, locale } = useI18n()
const scoreSvgRef = ref<SVGSVGElement>()
const simplexCanvasRef = ref<HTMLCanvasElement>()

let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene | undefined
let camera: THREE.OrthographicCamera | undefined
let probabilityDot: THREE.Mesh | undefined

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        badge: '分类评估实验',
        task: '当前教学任务',
        scoreStrip: '阈值分数带',
        threshold: '当前阈值',
        predictedPositive: '预测正类',
        actualPositive: '真实正类',
        confusion: '混淆矩阵',
        metrics: '指标读数',
        roc: 'ROC / AUC',
        calibration: '校准分箱',
        multiclass: '多分类 softmax',
        controls: '核心控制',
        presets: '章节预设',
        sources: '来源',
        thresholdSweep: '阈值扫描',
        scoreLow: '低概率',
        scoreHigh: '高概率',
        negative: '负类',
        positive: '正类',
        predictedNegative: '预测负类',
        trueNegative: '真实负类',
        truePositive: '真实正类',
        labelNegative: '实际负类',
        labelPositive: '实际正类',
        tp: 'TP',
        fp: 'FP',
        tn: 'TN',
        fn: 'FN',
        accuracy: 'Accuracy',
        precision: 'Precision',
        recall: 'Recall',
        specificity: 'Specificity',
        f1: 'F1',
        cost: 'Expected cost',
        auc: 'AUC',
        bias: 'Prediction bias',
        macroF1: 'Macro F1',
        microF1: 'Micro F1',
        fpr: 'FPR',
        tpr: 'TPR',
        observed: '真实比例',
        predicted: '预测均值',
        bin: '分箱',
        probability: '概率',
        logit: 'logit',
        classLabel: '类别',
        topClass: 'Top-1',
        temperature: 'Temperature',
        nearThreshold: '靠近阈值的样本',
        sourceNote: '本页内容为公开资料改写和重组，指标命名与课程引用见章节来源。',
        labels: {
          threshold: '阈值',
          prevalence: '正例比例',
          separability: '可分性',
          falsePositiveCost: '误报成本',
          falseNegativeCost: '漏报成本',
          calibrationShift: '校准偏移',
          temperature: 'Temperature',
          logitA: 'Logit A',
          logitB: 'Logit B',
          logitC: 'Logit C',
        } as Record<string, string>,
      }
    : {
        badge: 'Classification lab',
        task: 'Current teaching task',
        scoreStrip: 'Threshold score strip',
        threshold: 'Current threshold',
        predictedPositive: 'Predicted positives',
        actualPositive: 'Actual positives',
        confusion: 'Confusion matrix',
        metrics: 'Metric readout',
        roc: 'ROC / AUC',
        calibration: 'Calibration bins',
        multiclass: 'Multiclass softmax',
        controls: 'Core controls',
        presets: 'Chapter presets',
        sources: 'Sources',
        thresholdSweep: 'Threshold sweep',
        scoreLow: 'Low probability',
        scoreHigh: 'High probability',
        negative: 'Negative',
        positive: 'Positive',
        predictedNegative: 'Predicted negative',
        trueNegative: 'True negative',
        truePositive: 'True positive',
        labelNegative: 'Actual negative',
        labelPositive: 'Actual positive',
        tp: 'TP',
        fp: 'FP',
        tn: 'TN',
        fn: 'FN',
        accuracy: 'Accuracy',
        precision: 'Precision',
        recall: 'Recall',
        specificity: 'Specificity',
        f1: 'F1',
        cost: 'Expected cost',
        auc: 'AUC',
        bias: 'Prediction bias',
        macroF1: 'Macro F1',
        microF1: 'Micro F1',
        fpr: 'FPR',
        tpr: 'TPR',
        observed: 'Observed',
        predicted: 'Predicted mean',
        bin: 'Bin',
        probability: 'Probability',
        logit: 'logit',
        classLabel: 'Class',
        topClass: 'Top-1',
        temperature: 'Temperature',
        nearThreshold: 'Near-threshold examples',
        sourceNote: 'This page rewrites and reorganizes public references; metric naming and citations live in the chapter sources.',
        labels: {
          threshold: 'Threshold',
          prevalence: 'Prevalence',
          separability: 'Separability',
          falsePositiveCost: 'False-positive cost',
          falseNegativeCost: 'False-negative cost',
          calibrationShift: 'Calibration shift',
          temperature: 'Temperature',
          logitA: 'Logit A',
          logitB: 'Logit B',
          logitC: 'Logit C',
        } as Record<string, string>,
      },
)

const threshold = computed(() => Number(props.snapshot?.derivedMetrics?.threshold ?? props.config.threshold ?? 0.5))
const matrix = computed(() => props.snapshot?.confusionMatrix ?? { tp: 0, fp: 0, tn: 0, fn: 0 })
const metrics = computed(() => props.snapshot?.classificationMetrics)
const examples = computed(() => props.snapshot?.classificationExamples ?? [])
const rocPoints = computed(() => props.snapshot?.rocPoints ?? [])
const calibrationBins = computed(() => props.snapshot?.calibrationBins ?? [])
const multiclassRows = computed(() => props.snapshot?.multiclassRows ?? [])
const topClass = computed(() => {
  const [first] = multiclassRows.value
  if (!first) return undefined
  return multiclassRows.value.reduce((best, row) => (row.probability > best.probability ? row : best), first)
})

const chapterTitle = computed(() =>
  props.section.title?.[locale.value as AppLocale] ?? t(props.section.titleKey),
)

const nearThresholdExamples = computed(() =>
  [...examples.value]
    .sort((left, right) => Math.abs(left.probability - threshold.value) - Math.abs(right.probability - threshold.value))
    .slice(0, 5),
)

const metricCards = computed(() => [
  { id: 'accuracy', label: copy.value.accuracy, value: formatPercent(metrics.value?.accuracy) },
  { id: 'precision', label: copy.value.precision, value: formatPercent(metrics.value?.precision) },
  { id: 'recall', label: copy.value.recall, value: formatPercent(metrics.value?.recall) },
  { id: 'f1', label: copy.value.f1, value: formatPercent(metrics.value?.f1) },
  { id: 'expectedCost', label: copy.value.cost, value: round(metrics.value?.expectedCost ?? 0, 3) },
  { id: 'auc', label: copy.value.auc, value: round(metrics.value?.auc ?? 0, 3) },
  { id: 'predictionBias', label: copy.value.bias, value: signedPercent(metrics.value?.predictionBias) },
  { id: 'macroF1', label: copy.value.macroF1, value: formatPercent(metrics.value?.macroF1) },
  { id: 'microF1', label: copy.value.microF1, value: formatPercent(metrics.value?.microF1) },
])

const confusionCells = computed(() => [
  {
    id: 'tp',
    label: copy.value.tp,
    value: matrix.value.tp,
    tone: 'good',
    row: copy.value.labelPositive,
    column: copy.value.predictedPositive,
  },
  {
    id: 'fn',
    label: copy.value.fn,
    value: matrix.value.fn,
    tone: 'bad',
    row: copy.value.labelPositive,
    column: copy.value.predictedNegative,
  },
  {
    id: 'fp',
    label: copy.value.fp,
    value: matrix.value.fp,
    tone: 'bad',
    row: copy.value.labelNegative,
    column: copy.value.predictedPositive,
  },
  {
    id: 'tn',
    label: copy.value.tn,
    value: matrix.value.tn,
    tone: 'good',
    row: copy.value.labelNegative,
    column: copy.value.predictedNegative,
  },
])

const rocPath = computed(() => buildPath(rocPoints.value, 'fpr', 'tpr'))
const rocAreaPath = computed(() => {
  if (!rocPoints.value.length) return ''
  const points = [...rocPoints.value].sort((left, right) => left.fpr - right.fpr)
  const mapped = points.map((point) => `${mapRocX(point.fpr)},${mapRocY(point.tpr)}`).join(' L ')
  return `M ${mapRocX(0)},${mapRocY(0)} L ${mapped} L ${mapRocX(1)},${mapRocY(0)} Z`
})
const rocCurrent = computed(() => ({
  x: mapRocX(Number(props.snapshot?.selectedObservation?.selectedFpr ?? metrics.value?.fpr ?? 0)),
  y: mapRocY(Number(props.snapshot?.selectedObservation?.selectedTpr ?? metrics.value?.tpr ?? 0)),
}))

const controlSpecs = computed(() => [
  { key: 'threshold', min: 0.05, max: 0.95, step: 0.01, value: Number(props.config.threshold ?? 0.5), format: 'percent' },
  { key: 'prevalence', min: 0.08, max: 0.72, step: 0.01, value: Number(props.config.prevalence ?? 0.36), format: 'percent' },
  { key: 'separability', min: 0.35, max: 2.4, step: 0.05, value: Number(props.config.separability ?? 1.35), format: 'number' },
  { key: 'falsePositiveCost', min: 0.5, max: 8, step: 0.5, value: Number(props.config.falsePositiveCost ?? 1), format: 'number' },
  { key: 'falseNegativeCost', min: 0.5, max: 12, step: 0.5, value: Number(props.config.falseNegativeCost ?? 4), format: 'number' },
  { key: 'calibrationShift', min: -1.4, max: 1.4, step: 0.05, value: Number(props.config.calibrationShift ?? 0), format: 'number' },
  { key: 'temperature', min: 0.35, max: 2.2, step: 0.05, value: Number(props.config.temperature ?? 1), format: 'number' },
  { key: 'logitA', min: -1.5, max: 3.2, step: 0.1, value: Number(props.config.logitA ?? 2.2), format: 'number' },
  { key: 'logitB', min: -1.5, max: 3.2, step: 0.1, value: Number(props.config.logitB ?? 1.1), format: 'number' },
  { key: 'logitC', min: -1.5, max: 3.2, step: 0.1, value: Number(props.config.logitC ?? 0.2), format: 'number' },
])

function formatPercent(value = 0) {
  return `${round(value * 100, 1)}%`
}

function signedPercent(value = 0) {
  const rounded = round(value * 100, 1)
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}

function formatControlValue(value: number, format: string) {
  return format === 'percent' ? formatPercent(value) : String(round(value, 2))
}

function onRangeInput(key: string, event: Event) {
  const target = event.target as HTMLInputElement
  emit('patch-config', { [key]: Number(target.value) })
}

function localizedPreset(preset: ExperimentPreset) {
  return {
    label: preset.label[locale.value as AppLocale],
    description: preset.description[locale.value as AppLocale],
  }
}

function localizedText(copyItem?: { 'zh-CN': string; en: string }) {
  return copyItem?.[locale.value as AppLocale] ?? ''
}

function drawScoreStrip() {
  const svgElement = scoreSvgRef.value
  if (!svgElement) return

  const width = 640
  const height = 148
  const margin = { left: 24, right: 24, top: 18, bottom: 34 }
  const svg = d3.select(svgElement)
  svg.selectAll('*').remove()
  svg.attr('viewBox', `0 0 ${width} ${height}`)

  const x = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right])
  const axisY = height - margin.bottom
  const data = examples.value

  svg
    .append('line')
    .attr('x1', x(0))
    .attr('x2', x(1))
    .attr('y1', axisY)
    .attr('y2', axisY)
    .attr('class', 'classification-score-axis')

  svg
    .append('rect')
    .attr('x', x(threshold.value))
    .attr('y', margin.top)
    .attr('width', x(1) - x(threshold.value))
    .attr('height', axisY - margin.top)
    .attr('class', 'classification-score-region classification-score-region--positive')

  svg
    .append('rect')
    .attr('x', x(0))
    .attr('y', margin.top)
    .attr('width', x(threshold.value) - x(0))
    .attr('height', axisY - margin.top)
    .attr('class', 'classification-score-region classification-score-region--negative')

  svg
    .append('line')
    .attr('x1', x(threshold.value))
    .attr('x2', x(threshold.value))
    .attr('y1', margin.top - 4)
    .attr('y2', axisY + 10)
    .attr('class', 'classification-threshold-line')

  svg
    .append('text')
    .attr('x', x(threshold.value))
    .attr('y', 14)
    .attr('text-anchor', 'middle')
    .attr('class', 'classification-score-label')
    .text(`${copy.value.threshold} ${round(threshold.value, 2)}`)

  svg
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (example) => x(example.probability))
    .attr('cy', (_example, index) => 42 + (index % 4) * 18)
    .attr('r', (example) => (example.split === 'validation' ? 5.5 : 4.6))
    .attr('class', (example) =>
      example.label === 1
        ? 'classification-score-dot classification-score-dot--positive'
        : 'classification-score-dot classification-score-dot--negative',
    )

  svg
    .append('text')
    .attr('x', x(0))
    .attr('y', height - 8)
    .attr('class', 'classification-score-label')
    .text(copy.value.scoreLow)

  svg
    .append('text')
    .attr('x', x(1))
    .attr('y', height - 8)
    .attr('text-anchor', 'end')
    .attr('class', 'classification-score-label')
    .text(copy.value.scoreHigh)
}

function initSimplex() {
  const canvas = simplexCanvasRef.value
  if (!canvas || renderer) return

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch {
    renderer = undefined
    return
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(320, 240, false)
  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1.25, 1.25, 0.95, -1.05, 0.1, 10)
  camera.position.z = 4

  const vertices = new Float32Array([
    0, 0.82, 0,
    -0.9, -0.72, 0,
    0.9, -0.72, 0,
  ])
  const triangle = new THREE.LineLoop(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(vertices, 3)),
    new THREE.LineBasicMaterial({ color: 0x172033, linewidth: 2 }),
  )
  scene.add(triangle)

  const fill = new THREE.Mesh(
    new THREE.BufferGeometry()
      .setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      .setIndex([0, 1, 2]),
    new THREE.MeshBasicMaterial({ color: 0xe6f4f2, transparent: true, opacity: 0.72, side: THREE.DoubleSide }),
  )
  scene.add(fill)

  const dotGeometry = new THREE.CircleGeometry(0.055, 32)
  probabilityDot = new THREE.Mesh(dotGeometry, new THREE.MeshBasicMaterial({ color: 0xf97352 }))
  scene.add(probabilityDot)
  updateSimplex()
}

function updateSimplex() {
  if (!renderer || !scene || !camera || !probabilityDot) return
  const [a = 0, b = 0, c = 0] = multiclassRows.value.map((row) => row.probability)
  probabilityDot.position.set(a * 0 + b * -0.9 + c * 0.9, a * 0.82 + b * -0.72 + c * -0.72, 0.02)
  renderer.render(scene, camera)
}

function disposeSimplex() {
  renderer?.dispose()
  renderer = undefined
  scene = undefined
  camera = undefined
  probabilityDot = undefined
}

function mapRocX(value: number) {
  return 28 + value * 204
}

function mapRocY(value: number) {
  return 224 - value * 196
}

function buildPath<T extends object>(points: T[], xKey: keyof T, yKey: keyof T) {
  if (!points.length) return ''
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${mapRocX(Number(point[xKey]))} ${mapRocY(Number(point[yKey]))}`)
    .join(' ')
}

watch([examples, threshold, locale], drawScoreStrip, { deep: true })
watch(multiclassRows, updateSimplex, { deep: true })

onMounted(async () => {
  await nextTick()
  drawScoreStrip()
  initSimplex()
})

onBeforeUnmount(disposeSimplex)
</script>

<template>
  <LessonWorkbench
    class="classification-lab"
    :class="`classification-lab--${props.section.id}`"
    variant="cockpit"
    :accent="props.accent"
    :section-id="props.section.id"
  >
    <template #task>
      <div class="classification-lab__taskbar">
        <div class="classification-lab__task-main">
          <span class="story-chip">{{ copy.badge }}</span>
          <strong>{{ chapterTitle }}</strong>
          <p>{{ localizedText(props.section.experimentPrompt) }}</p>
        </div>
        <div class="classification-lab__task-meta">
          <span>{{ copy.threshold }}</span>
          <strong>{{ round(threshold, 2) }}</strong>
          <small>{{ copy.predictedPositive }} {{ props.snapshot?.derivedMetrics?.predictedPositive ?? 0 }} / {{ props.snapshot?.derivedMetrics?.totalExamples ?? 0 }}</small>
        </div>
        <button type="button" class="action-button action-button--primary" @click="emit('toggle-play')">
          {{ props.isPlaying ? t('actions.pause') : copy.thresholdSweep }}
        </button>
      </div>
    </template>

    <template #visual>
      <section class="classification-lab__visual-grid">
        <article class="classification-panel classification-panel--score">
          <div class="classification-lab__heading">
            <span>{{ copy.scoreStrip }}</span>
            <strong>{{ copy.threshold }} {{ round(threshold, 2) }}</strong>
          </div>
          <svg ref="scoreSvgRef" class="classification-score-svg" role="img" />
          <div class="classification-lab__legend">
            <span><i class="classification-legend-dot classification-legend-dot--negative" />{{ copy.negative }}</span>
            <span><i class="classification-legend-dot classification-legend-dot--positive" />{{ copy.positive }}</span>
          </div>
        </article>

        <article class="classification-panel classification-panel--confusion">
          <div class="classification-lab__heading">
            <span>{{ copy.confusion }}</span>
            <strong>{{ copy.tp }} / {{ copy.fp }} / {{ copy.tn }} / {{ copy.fn }}</strong>
          </div>
          <div class="classification-confusion-grid">
            <article
              v-for="cell in confusionCells"
              :key="cell.id"
              class="classification-confusion-cell"
              :class="`classification-confusion-cell--${cell.tone}`"
            >
              <span>{{ cell.row }} -> {{ cell.column }}</span>
              <strong>{{ cell.label }}</strong>
              <em>{{ cell.value }}</em>
            </article>
          </div>
        </article>

        <article class="classification-panel classification-panel--roc">
          <div class="classification-lab__heading">
            <span>{{ copy.roc }}</span>
            <strong>{{ copy.auc }} {{ round(metrics?.auc ?? 0, 3) }}</strong>
          </div>
          <svg viewBox="0 0 260 248" class="classification-roc-svg" role="img">
            <line x1="28" x2="232" y1="224" y2="224" class="classification-chart-axis" />
            <line x1="28" x2="28" y1="28" y2="224" class="classification-chart-axis" />
            <line x1="28" x2="232" y1="224" y2="28" class="classification-roc-baseline" />
            <path :d="rocAreaPath" class="classification-roc-area" />
            <path :d="rocPath" class="classification-roc-line" />
            <circle :cx="rocCurrent.x" :cy="rocCurrent.y" r="5.5" class="classification-roc-current" />
            <text x="232" y="242" class="classification-chart-label">{{ copy.fpr }}</text>
            <text x="4" y="30" class="classification-chart-label">{{ copy.tpr }}</text>
          </svg>
        </article>
      </section>
    </template>

    <template #controls>
      <section class="classification-lab__controls">
        <div class="classification-lab__actions">
          <button type="button" class="action-button" @click="emit('step')">{{ t('actions.step') }}</button>
          <button type="button" class="action-button" @click="emit('replay')">{{ t('actions.replay') }}</button>
          <button type="button" class="action-button" @click="emit('reset')">{{ t('actions.reset') }}</button>
        </div>

        <div class="classification-lab__control-grid">
          <label
            v-for="control in controlSpecs"
            :key="control.key"
            class="control"
            :class="`control--${control.key}`"
          >
            <span class="control__row">
              <span>{{ copy.labels[control.key] }}</span>
              <strong>{{ formatControlValue(control.value, control.format) }}</strong>
            </span>
            <input
              class="control__range"
              type="range"
              :min="control.min"
              :max="control.max"
              :step="control.step"
              :value="control.value"
              @input="onRangeInput(control.key, $event)"
            />
          </label>
        </div>
      </section>
    </template>

    <template #metrics>
      <section class="classification-lab__metrics">
        <article
          v-for="card in metricCards"
          :key="card.id"
          class="classification-metric-card"
          :class="{ 'is-emphasis': props.section.metricEmphasis?.includes(card.id) }"
        >
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </article>

        <section class="classification-panel classification-panel--calibration">
          <div class="classification-lab__heading">
            <span>{{ copy.calibration }}</span>
            <strong>{{ copy.bias }} {{ signedPercent(metrics?.predictionBias ?? 0) }}</strong>
          </div>
          <div class="classification-calibration-list">
            <article v-for="bin in calibrationBins" :key="bin.id" class="classification-calibration-bin">
              <span>{{ copy.bin }} {{ round(bin.start, 1) }}-{{ round(bin.end, 1) }}</span>
              <div class="classification-calibration-track">
                <i :style="{ width: `${Math.max(3, bin.predicted * 100)}%` }" />
                <b :style="{ width: `${Math.max(3, bin.observed * 100)}%` }" />
              </div>
              <small>{{ copy.predicted }} {{ round(bin.predicted, 2) }} / {{ copy.observed }} {{ round(bin.observed, 2) }}</small>
            </article>
          </div>
        </section>

        <section class="classification-panel classification-panel--near">
          <div class="classification-lab__heading">
            <span>{{ copy.nearThreshold }}</span>
            <strong>{{ copy.threshold }} {{ round(threshold, 2) }}</strong>
          </div>
          <div class="classification-near-list">
            <article v-for="example in nearThresholdExamples" :key="example.id">
              <span>{{ example.label === 1 ? copy.positive : copy.negative }}</span>
              <strong>{{ round(example.probability, 3) }}</strong>
              <small>{{ example.predicted === 1 ? copy.predictedPositive : copy.predictedNegative }}</small>
            </article>
          </div>
        </section>
      </section>
    </template>

    <template #presets>
      <section class="classification-lab__lower">
        <details class="classification-lab__details">
          <summary>
            <span>{{ copy.multiclass }}</span>
            <strong>{{ copy.topClass }} {{ topClass?.label ?? 'A' }} / {{ copy.temperature }} {{ round(Number(props.config.temperature ?? 1), 2) }}</strong>
          </summary>
          <div class="classification-softmax-grid">
            <canvas ref="simplexCanvasRef" width="320" height="240" class="classification-simplex-canvas" />
            <div class="classification-softmax-table">
              <article v-for="row in multiclassRows" :key="row.id" class="classification-softmax-row">
                <span>{{ copy.classLabel }} {{ row.label }}</span>
                <strong>{{ copy.probability }} {{ round(row.probability, 3) }}</strong>
                <small>{{ copy.logit }} {{ round(row.logit, 2) }} / F1 {{ round(row.f1, 3) }}</small>
              </article>
            </div>
          </div>
        </details>

        <details class="classification-lab__details">
          <summary>
            <span>{{ copy.presets }}</span>
            <strong>{{ t('common.presets') }}</strong>
          </summary>
          <div class="classification-preset-grid">
            <button
              v-for="preset in props.presets"
              :key="preset.id"
              type="button"
              class="preset-card"
              :class="{ 'is-linked': preset.id === props.section.presetId }"
              @click="emit('apply-preset', preset.config)"
            >
              <span>{{ t('actions.applyPreset') }}</span>
              <strong>{{ localizedPreset(preset).label }}</strong>
              <p>{{ localizedPreset(preset).description }}</p>
            </button>
          </div>
        </details>

        <details v-if="props.section.sources?.length" class="classification-lab__details">
          <summary>
            <span>{{ copy.sources }}</span>
            <strong>{{ copy.sourceNote }}</strong>
          </summary>
          <ul class="classification-source-list">
            <li v-for="source in props.section.sources" :key="source.href">
              <a :href="source.href" target="_blank" rel="noreferrer">
                {{ localizedText(source.label) }}
              </a>
              <small v-if="source.license">{{ source.license }}</small>
            </li>
          </ul>
        </details>
      </section>
    </template>
  </LessonWorkbench>
</template>
