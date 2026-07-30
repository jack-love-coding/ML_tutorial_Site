<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PlotPoint, TrainingSnapshot } from '../types/ml'

const props = defineProps<{
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  currentStep: number
  sectionId: string
}>()

const { locale } = useI18n()

const dataWidth = 660
const dataHeight = 360
const dataPadding = 48
const evidenceWidth = 420
const evidenceHeight = 240
const evidencePadding = 34

interface EvidenceItem {
  readonly id: string
  readonly label: string
  readonly value: number
  readonly cue: 'solid' | 'dash' | 'shape'
}

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        dataSpace: 'Bike 单车租赁测试切片',
        dataHeading: '小时 → 租赁数量',
        xAxis: '小时（hr）',
        yAxis: '租赁数量（cnt）',
        actual: '真实值：实心圆',
        fit: '模型路径：实线',
        residual: '选中残差：虚线',
        staticNote: '静态 SVG 与数据表保留全部教学信息；动画只改变选中快照。',
        evidence: '锁定结果',
        evidenceHeadings: {
          convergence: '优化收敛检查点',
          method: '方法系数最大差异',
          coefficient: '模型空间系数',
          diagnostic: '留出集分阶段诊断',
          row: '逐行损失结果',
        },
        empty: '当前图表没有可展示的锁定结果。',
        label: '结果',
        value: '锁定值',
        cue: '非颜色线型 / 形状',
        selected: '选中的测试行',
        instant: 'instant',
        actualValue: '真实租赁量',
        prediction: '预测租赁量',
        residualValue: '残差（预测值 − 真实值）',
        solid: '实线',
        dash: '虚线',
        shape: '形状',
      }
    : {
        dataSpace: 'Bike rental test slice',
        dataHeading: 'hour → rental count',
        xAxis: 'Hour (hr)',
        yAxis: 'Rental count (cnt)',
        actual: 'Actual: solid circle',
        fit: 'Model path: solid line',
        residual: 'Selected residual: dashed line',
        staticNote: 'Static SVG and the data table preserve the lesson; motion only changes the selected snapshot.',
        evidence: 'Locked result',
        evidenceHeadings: {
          convergence: 'Optimizer convergence checkpoints',
          method: 'Maximum coefficient delta by method',
          coefficient: 'Model-space coefficients',
          diagnostic: 'Staged held-out diagnosis',
          row: 'Per-row loss result',
        },
        empty: 'This chart has no locked result to display for the selected view.',
        label: 'Result',
        value: 'Locked value',
        cue: 'Non-color line / shape cue',
        selected: 'Selected test row',
        instant: 'instant',
        actualValue: 'Actual rentals',
        prediction: 'Predicted rentals',
        residualValue: 'Residual (prediction − actual)',
        solid: 'solid line',
        dash: 'dashed line',
        shape: 'shape',
      },
)

const currentSnapshot = computed(
  () =>
    props.snapshot
    ?? props.snapshots[Math.min(Math.max(props.currentStep, 0), Math.max(props.snapshots.length - 1, 0))],
)
const samples = computed(() => currentSnapshot.value?.regressionSamples ?? [])
const fitCurve = computed(() => currentSnapshot.value?.fitCurve ?? [])
const selectedObservation = computed(() => currentSnapshot.value?.selectedObservation)

const selectedResidual = computed(() => {
  const row = selectedObservation.value
  if (!row) return undefined
  const x = finiteValue(row.area)
  const actual = finiteValue(row.actualPrice)
  const prediction = finiteValue(row.predictedPrice)
  if (x === undefined || actual === undefined || prediction === undefined) return undefined
  return { x, actual, prediction }
})

const domain = computed(() => {
  const points: PlotPoint[] = [
    ...samples.value,
    ...fitCurve.value,
    ...(selectedResidual.value
      ? [
          { x: selectedResidual.value.x, y: selectedResidual.value.actual },
          { x: selectedResidual.value.x, y: selectedResidual.value.prediction },
        ]
      : []),
  ]
  const finitePoints = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
  if (!finitePoints.length) return { xMin: 0, xMax: 23, yMin: 0, yMax: 800 }

  const xs = finitePoints.map((point) => point.x)
  const ys = finitePoints.map((point) => point.y)
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)
  const xGap = Math.max((xMax - xMin) * 0.08, 1)
  const yGap = Math.max((yMax - yMin) * 0.1, 20)
  return { xMin: xMin - xGap, xMax: xMax + xGap, yMin: yMin - yGap, yMax: yMax + yGap }
})

const evidenceMode = computed<keyof typeof copy.value.evidenceHeadings>(() => {
  if (props.sectionId === 'training-motion') return 'convergence'
  if (props.sectionId === 'polynomial') return 'method'
  if (props.sectionId === 'model-limits' || props.sectionId === 'regularization') {
    return 'coefficient'
  }
  if (props.sectionId === 'overfitting') return 'diagnostic'
  return 'row'
})

const evidenceItems = computed<EvidenceItem[]>(() => {
  if (evidenceMode.value === 'convergence') {
    return props.snapshots.map((snapshot, index) => ({
      id: `checkpoint-${snapshot.step}`,
      label: `stage ${snapshot.step}`,
      value: snapshot.loss,
      cue: index === props.currentStep % Math.max(props.snapshots.length, 1) ? 'shape' : 'solid',
    }))
  }

  if (evidenceMode.value === 'method') {
    const metrics = currentSnapshot.value?.derivedMetrics
    return [
      evidence('gradient-descent', 'Gradient descent', metrics?.gdMaxCoefficientDelta, 'solid'),
      evidence('normal-equation', 'Normal equation', metrics?.normalEquationMaxCoefficientDelta, 'dash'),
      evidence('scikit-learn', 'scikit-learn', metrics?.sklearnMaxCoefficientDelta, 'shape'),
    ].filter(isEvidenceItem)
  }

  if (evidenceMode.value === 'coefficient') {
    return metricArray(currentSnapshot.value, 'weights').map((value, index) => ({
      id: `weight-${index}`,
      label: ['season', 'yr', 'mnth', 'hr', 'workingday'][index] ?? `w${index}`,
      value,
      cue: index % 3 === 0 ? 'solid' : index % 3 === 1 ? 'dash' : 'shape',
    }))
  }

  if (evidenceMode.value === 'diagnostic') {
    const hourly = findSnapshotWithMetric('hourlyResidualMeans')
    const hourlyHours = metricArray(hourly, 'hourlyResidualHours')
    const hourlyMeans = metricArray(hourly, 'hourlyResidualMeans')
    if (hourlyMeans.length) {
      return hourlyMeans.map((value, index) => ({
        id: `hour-${hourlyHours[index] ?? index}`,
        label: `hr ${hourlyHours[index] ?? index}`,
        value,
        cue: index % 2 === 0 ? 'dash' : 'shape',
      }))
    }

    const spread = findSnapshotWithMetric('predictionBinResidualStdDev')
    const bins = metricStringArray(spread, 'predictionBinIds')
    return metricArray(spread, 'predictionBinResidualStdDev').map((value, index) => ({
      id: `bin-${index}`,
      label: bins[index] ?? `bin ${index + 1}`,
      value,
      cue: index % 2 === 0 ? 'solid' : 'dash',
    }))
  }

  return (currentSnapshot.value?.sampleLossBreakdown ?? []).map((row, index) => ({
    id: row.id,
    label: row.label,
    value: row.loss,
    cue: index % 2 === 0 ? 'solid' : 'shape',
  }))
})

const evidencePath = computed(() => {
  const values = evidenceItems.value.map((item) => item.value)
  if (!values.length) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  return values
    .map((value, index) => {
      const x =
        evidencePadding
        + (index / Math.max(values.length - 1, 1)) * (evidenceWidth - evidencePadding * 2)
      const y =
        evidenceHeight
        - evidencePadding
        - ((value - min) / (max - min || 1)) * (evidenceHeight - evidencePadding * 2)
      return `${x},${y}`
    })
    .join(' ')
})

function finiteValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function evidence(
  id: string,
  label: string,
  value: unknown,
  cue: EvidenceItem['cue'],
): EvidenceItem | undefined {
  const numeric = finiteValue(value)
  return numeric === undefined ? undefined : { id, label, value: numeric, cue }
}

function isEvidenceItem(item: EvidenceItem | undefined): item is EvidenceItem {
  return item !== undefined
}

function metricArray(snapshot: TrainingSnapshot | undefined, key: string): number[] {
  const value = snapshot?.derivedMetrics?.[key]
  return Array.isArray(value)
    ? value.filter((entry): entry is number => typeof entry === 'number' && Number.isFinite(entry))
    : []
}

function metricStringArray(snapshot: TrainingSnapshot | undefined, key: string): string[] {
  const value = snapshot?.derivedMetrics?.[key]
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []
}

function findSnapshotWithMetric(key: string): TrainingSnapshot | undefined {
  return props.snapshots.find((snapshot) => Array.isArray(snapshot.derivedMetrics?.[key]))
}

function mapDataX(value: number): number {
  return (
    dataPadding
    + ((value - domain.value.xMin) / (domain.value.xMax - domain.value.xMin || 1))
      * (dataWidth - dataPadding * 2)
  )
}

function mapDataY(value: number): number {
  return (
    dataHeight
    - dataPadding
    - ((value - domain.value.yMin) / (domain.value.yMax - domain.value.yMin || 1))
      * (dataHeight - dataPadding * 2)
  )
}

function pointsToPolyline(points: PlotPoint[]): string {
  return points.map((point) => `${mapDataX(point.x)},${mapDataY(point.y)}`).join(' ')
}

function formatNumber(value: unknown): string {
  const numeric = finiteValue(value)
  if (numeric === undefined) return '—'
  if (Math.abs(numeric) > 99_999 || (numeric !== 0 && Math.abs(numeric) < 0.001)) {
    return numeric.toExponential(3)
  }
  return numeric.toLocaleString(locale.value, { maximumFractionDigits: 3 })
}
</script>

<template>
  <div class="linear-regression-lab__viz">
    <section class="linear-regression-lab__panel linear-regression-lab__panel--data">
      <div class="linear-regression-lab__heading">
        <span>{{ copy.dataSpace }}</span>
        <strong>{{ copy.dataHeading }}</strong>
      </div>
      <svg
        :viewBox="`0 0 ${dataWidth} ${dataHeight}`"
        class="linear-regression-lab__data-svg"
        role="img"
        :aria-label="`${copy.dataSpace}: ${copy.actual}; ${copy.fit}; ${copy.residual}`"
      >
        <line
          :x1="dataPadding"
          :x2="dataWidth - dataPadding"
          :y1="dataHeight - dataPadding"
          :y2="dataHeight - dataPadding"
          class="linear-axis"
        />
        <line
          :x1="dataPadding"
          :x2="dataPadding"
          :y1="dataPadding"
          :y2="dataHeight - dataPadding"
          class="linear-axis"
        />
        <text :x="dataWidth - 12" :y="dataHeight - 14" class="linear-axis-label" text-anchor="end">
          {{ copy.xAxis }}
        </text>
        <text x="12" y="28" class="linear-axis-label">{{ copy.yAxis }}</text>
        <line
          v-if="selectedResidual"
          :x1="mapDataX(selectedResidual.x)"
          :x2="mapDataX(selectedResidual.x)"
          :y1="mapDataY(selectedResidual.actual)"
          :y2="mapDataY(selectedResidual.prediction)"
          class="linear-residual is-emphasis"
          stroke-dasharray="8 5"
        />
        <polyline
          v-if="fitCurve.length"
          :points="pointsToPolyline(fitCurve)"
          class="linear-fit-line"
        />
        <circle
          v-for="(sample, index) in samples"
          :key="`${sample.x}-${sample.y}-${index}`"
          :cx="mapDataX(sample.x)"
          :cy="mapDataY(sample.y)"
          :r="index === props.currentStep % Math.max(samples.length, 1) ? 7 : 5"
          class="linear-sample"
          :class="{ 'is-highlight': index === props.currentStep % Math.max(samples.length, 1) }"
        />
      </svg>
      <div class="linear-state-legend">
        <span><i class="legend-dot legend-dot--train"></i>{{ copy.actual }}</span>
        <span>━ {{ copy.fit }}</span>
        <span>┊ {{ copy.residual }}</span>
      </div>
      <p class="linear-regression-lab__source-note">{{ copy.staticNote }}</p>
    </section>

    <section class="linear-regression-lab__panel linear-regression-lab__panel--state">
      <div class="linear-regression-lab__heading">
        <span>{{ copy.evidence }}</span>
        <strong>{{ copy.evidenceHeadings[evidenceMode] }}</strong>
      </div>
      <svg
        v-if="evidenceItems.length"
        :viewBox="`0 0 ${evidenceWidth} ${evidenceHeight}`"
        class="linear-regression-lab__state-svg"
        role="img"
        :aria-label="`${copy.evidence}: ${copy.evidenceHeadings[evidenceMode]}; ${copy.cue}`"
      >
        <line
          :x1="evidencePadding"
          :x2="evidenceWidth - evidencePadding"
          :y1="evidenceHeight - evidencePadding"
          :y2="evidenceHeight - evidencePadding"
          class="linear-axis"
        />
        <line
          :x1="evidencePadding"
          :x2="evidencePadding"
          :y1="evidencePadding"
          :y2="evidenceHeight - evidencePadding"
          class="linear-axis"
        />
        <polyline
          :points="evidencePath"
          class="linear-state-line"
          stroke-dasharray="9 4"
        />
        <circle
          v-for="(item, index) in evidenceItems"
          :key="item.id"
          :cx="evidencePadding + (index / Math.max(evidenceItems.length - 1, 1)) * (evidenceWidth - evidencePadding * 2)"
          :cy="evidencePath.split(' ')[index]?.split(',')[1] ?? evidenceHeight - evidencePadding"
          :r="item.cue === 'shape' ? 7 : 5"
          class="linear-state-dot"
        />
      </svg>
      <p v-else class="linear-regression-lab__source-note">{{ copy.empty }}</p>
      <table v-if="evidenceItems.length" class="linear-regression-results__table">
        <thead>
          <tr>
            <th scope="col">{{ copy.label }}</th>
            <th scope="col">{{ copy.value }}</th>
            <th scope="col">{{ copy.cue }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in evidenceItems" :key="`table-${item.id}`">
            <th scope="row">{{ item.label }}</th>
            <td>{{ formatNumber(item.value) }}</td>
            <td>{{ copy[item.cue] }}</td>
          </tr>
        </tbody>
      </table>
      <dl v-if="selectedObservation" class="linear-regression-results__metric-grid">
        <div>
          <dt>{{ copy.instant }}</dt>
          <dd>{{ selectedObservation.instant }}</dd>
        </div>
        <div>
          <dt>{{ copy.actualValue }}</dt>
          <dd>{{ formatNumber(selectedObservation.actualPrice) }}</dd>
        </div>
        <div>
          <dt>{{ copy.prediction }}</dt>
          <dd>{{ formatNumber(selectedObservation.predictedPrice) }}</dd>
        </div>
        <div>
          <dt>{{ copy.residualValue }}</dt>
          <dd>{{ formatNumber(selectedObservation.residual) }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>
