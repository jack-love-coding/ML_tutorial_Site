<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ExperimentEvidence, MathLabLocale } from '../types/mathLab'
import {
  evaluatePcaProjection,
  type PcaDatasetKind,
  type PcaPoint2,
} from '../utils/pca'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const emit = defineEmits<{
  'evidence-change': [evidence: ExperimentEvidence]
}>()

const datasetKind = ref<PcaDatasetKind>('lecture')
const keptComponents = ref(1)
const meanShift = ref(0)

const origin = { x: 210, y: 160 }

const labels = computed(() => {
  const zh = props.locale === 'zh-CN'
  return {
    eyebrow: zh ? '互动实验' : 'Interactive lab',
    title: zh ? 'PCA 投影与重建实验' : 'PCA Projection and Reconstruction Lab',
    subtitle: zh
      ? '选择点云、保留主成分个数，并给所有点加入同一个平移，观察中心化、主方向和解释方差如何变化。'
      : 'Choose a point cloud, keep one or two principal components, and add a common shift to see how centering, directions, and explained variance behave.',
    dataset: zh ? '点云类型' : 'Point cloud',
    lecture: zh ? '六点中心化例子' : 'Six-point centering example',
    correlated: zh ? '强相关特征' : 'Strongly correlated features',
    orthogonal: zh ? '两向方差接近' : 'Two comparable variances',
    keptComponents: zh ? '保留主成分' : 'Kept components',
    meanShift: zh ? '整体平移' : 'Common shift',
    visualLabel: zh
      ? '中心化后的二维点云、PCA 主方向，以及只保留前 k 个主方向后的重建点'
      : 'Centered two-dimensional point cloud, PCA directions, and reconstructions after keeping the first k directions',
    mean: zh ? '被减去的均值' : 'removed mean',
    covariance: zh ? '协方差' : 'covariance',
    lambdaOne: zh ? '第一方差' : 'first variance',
    lambdaTwo: zh ? '第二方差' : 'second variance',
    retained: zh ? '解释方差' : 'explained variance',
    rmse: zh ? '重建 RMSE' : 'reconstruction RMSE',
    directionOne: zh ? '第一主方向' : 'first direction',
    directionTwo: zh ? '第二主方向' : 'second direction',
    centeredPoints: zh ? '中心化点' : 'centered points',
    reconPoints: zh ? '重建点' : 'reconstructed points',
    strongNote: zh
      ? '第一主方向已经保留了大部分方差。把二维点投影到一条线会压缩数据，但垂直于这条线的残差仍会留下。'
      : 'The first direction already keeps most variance. Projecting 2D points onto one line compresses the data, but residuals perpendicular to that line remain.',
    balancedNote: zh
      ? '两个方向都携带明显方差。只保留一个主成分会丢掉较多结构；这就是用解释方差选择 k 的原因。'
      : 'Both directions carry visible variance. Keeping only one component loses more structure, which is why explained variance is used to choose k.',
    fullNote: zh
      ? '保留两个主方向时，二维中心化点可以被完整重建；此时 PCA 只是换了一个正交坐标系。'
      : 'Keeping both directions reconstructs the centered 2D points exactly; PCA is then only an orthogonal coordinate change.',
  }
})

const evaluation = computed(() =>
  evaluatePcaProjection({
    datasetKind: datasetKind.value,
    keptComponents: keptComponents.value,
    meanShift: meanShift.value,
  }),
)

const plotScale = computed(() => {
  const allPoints = [
    ...evaluation.value.centeredPoints,
    ...evaluation.value.reconstructedPoints,
  ]
  const maxExtent = allPoints.reduce(
    (largest, point) => Math.max(largest, Math.abs(point.x), Math.abs(point.y)),
    1,
  )
  return 118 / Math.max(1, maxExtent)
})

function plot(point: PcaPoint2) {
  return {
    x: origin.x + point.x * plotScale.value,
    y: origin.y - point.y * plotScale.value,
  }
}

const componentLines = computed(() =>
  evaluation.value.principalDirections.map((direction) => {
    const halfLength = 134 / plotScale.value
    const start = plot({ x: -direction.x * halfLength, y: -direction.y * halfLength })
    const end = plot({ x: direction.x * halfLength, y: direction.y * halfLength })
    return { start, end }
  }),
)

const statusNote = computed(() => {
  if (keptComponents.value === 2) return labels.value.fullNote
  if (evaluation.value.retainedVariance > 0.86) return labels.value.strongNote
  return labels.value.balancedNote
})

const evidence = computed<ExperimentEvidence>(() => ({
  moduleId: 'pca',
  sourceId: 'pca-projection-lab',
  summary: {
    'zh-CN': 'PCA 实验显示中心化后投影、解释方差和重建误差。',
    en: 'The PCA lab shows centered projection, explained variance, and reconstruction error.',
  },
  metrics: [
    { label: { 'zh-CN': '保留主成分', en: 'Kept components' }, value: keptComponents.value },
    { label: { 'zh-CN': 'explainedVariance', en: 'explainedVariance' }, value: `${(evaluation.value.retainedVariance * 100).toFixed(1)}%` },
    { label: { 'zh-CN': 'reconstructionError', en: 'reconstructionError' }, value: evaluation.value.reconstructionRmse.toFixed(3) },
    { label: { 'zh-CN': '整体平移', en: 'Common shift' }, value: meanShift.value.toFixed(2) },
    { label: { 'zh-CN': '点云类型', en: 'Point cloud' }, value: datasetKind.value },
  ],
  prompt: {
    'zh-CN': '解释中心化、解释方差和重建误差如何共同说明 PCA 投影。',
    en: 'Explain how centering, explained variance, and reconstruction error together explain PCA projection.',
  },
}))

watch(
  evidence,
  (nextEvidence) => emit('evidence-change', nextEvidence),
  { immediate: true },
)

function formatNumber(value: number, digits = 3) {
  if (Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
    return value.toExponential(2)
  }
  return value.toFixed(digits)
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

function formatPoint(point: PcaPoint2) {
  return `(${formatNumber(point.x, 2)}, ${formatNumber(point.y, 2)})`
}
</script>

<template>
  <section class="math-lab-card pca-projection-lab">
    <div class="math-lab-card__visual pca-projection-lab__visual">
      <svg class="pca-projection-lab__plot" viewBox="0 0 420 320" role="img" :aria-label="labels.visualLabel">
        <title>{{ labels.visualLabel }}</title>
        <line x1="36" :y1="origin.y" x2="384" :y2="origin.y" class="pca-projection-lab__axis" />
        <line :x1="origin.x" y1="34" :x2="origin.x" y2="286" class="pca-projection-lab__axis" />
        <line
          :x1="componentLines[0].start.x"
          :y1="componentLines[0].start.y"
          :x2="componentLines[0].end.x"
          :y2="componentLines[0].end.y"
          class="pca-projection-lab__component pca-projection-lab__component--primary"
        />
        <line
          :x1="componentLines[1].start.x"
          :y1="componentLines[1].start.y"
          :x2="componentLines[1].end.x"
          :y2="componentLines[1].end.y"
          class="pca-projection-lab__component pca-projection-lab__component--secondary"
        />
        <template v-for="(point, index) in evaluation.centeredPoints" :key="`residual-${index}`">
          <line
            :x1="plot(point).x"
            :y1="plot(point).y"
            :x2="plot(evaluation.reconstructedPoints[index]).x"
            :y2="plot(evaluation.reconstructedPoints[index]).y"
            class="pca-projection-lab__residual"
          />
        </template>
        <circle
          v-for="(point, index) in evaluation.reconstructedPoints"
          :key="`reconstructed-${index}`"
          :cx="plot(point).x"
          :cy="plot(point).y"
          r="5.5"
          class="pca-projection-lab__point pca-projection-lab__point--reconstructed"
        />
        <circle
          v-for="(point, index) in evaluation.centeredPoints"
          :key="`point-${index}`"
          :cx="plot(point).x"
          :cy="plot(point).y"
          r="7"
          class="pca-projection-lab__point pca-projection-lab__point--centered"
        />
        <circle :cx="origin.x" :cy="origin.y" r="5" class="pca-projection-lab__origin" />
      </svg>

      <div class="pca-projection-lab__legend" aria-hidden="true">
        <span><i class="is-primary" />{{ labels.directionOne }}</span>
        <span><i class="is-secondary" />{{ labels.directionTwo }}</span>
        <span><i class="is-centered" />{{ labels.centeredPoints }}</span>
        <span><i class="is-reconstructed" />{{ labels.reconPoints }}</span>
      </div>
    </div>

    <div class="math-lab-card__controls pca-projection-lab__controls">
      <header>
        <span>{{ labels.eyebrow }}</span>
        <strong>{{ labels.title }}</strong>
        <p>{{ labels.subtitle }}</p>
      </header>

      <div class="math-mini-controls pca-projection-lab__control-grid">
        <label>
          {{ labels.dataset }}
          <select v-model="datasetKind">
            <option value="lecture">{{ labels.lecture }}</option>
            <option value="correlated">{{ labels.correlated }}</option>
            <option value="orthogonal">{{ labels.orthogonal }}</option>
          </select>
        </label>
        <label>
          {{ labels.keptComponents }}: {{ keptComponents }}
          <input v-model.number="keptComponents" type="range" min="1" max="2" step="1" />
        </label>
        <label>
          {{ labels.meanShift }}: {{ meanShift.toFixed(1) }}
          <input v-model.number="meanShift" type="range" min="-4" max="4" step="0.5" />
        </label>
      </div>

      <div class="math-readout-grid">
        <article>
          <span>{{ labels.mean }}</span>
          <strong>{{ formatPoint(evaluation.mean) }}</strong>
        </article>
        <article>
          <span>{{ labels.lambdaOne }}</span>
          <strong>{{ formatNumber(evaluation.eigenvalues[0], 3) }}</strong>
        </article>
        <article>
          <span>{{ labels.lambdaTwo }}</span>
          <strong>{{ formatNumber(evaluation.eigenvalues[1], 3) }}</strong>
        </article>
        <article>
          <span>{{ labels.retained }}</span>
          <strong>{{ formatPercent(evaluation.retainedVariance) }}</strong>
        </article>
        <article>
          <span>{{ labels.rmse }}</span>
          <strong>{{ formatNumber(evaluation.reconstructionRmse, 3) }}</strong>
        </article>
        <article>
          <span>{{ labels.covariance }}</span>
          <strong>
            [{{ formatNumber(evaluation.covariance[0][0], 2) }},
            {{ formatNumber(evaluation.covariance[0][1], 2) }}]
          </strong>
        </article>
      </div>

      <p class="math-lab-note pca-projection-lab__status">
        {{ statusNote }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.pca-projection-lab__plot {
  display: block;
  width: 100%;
  min-height: 320px;
  border: 1px solid rgba(15, 23, 40, 0.08);
  border-radius: 22px;
  background:
    linear-gradient(rgba(15, 23, 40, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 40, 0.055) 1px, transparent 1px),
    linear-gradient(180deg, #ffffff, #f8fbff);
  background-size: 28px 28px, 28px 28px, auto;
}

.pca-projection-lab__axis {
  stroke: rgba(15, 23, 40, 0.16);
  stroke-width: 1.6;
}

.pca-projection-lab__component {
  stroke-linecap: round;
}

.pca-projection-lab__component--primary {
  stroke: #0f766e;
  stroke-width: 4;
}

.pca-projection-lab__component--secondary {
  stroke: rgba(226, 109, 61, 0.72);
  stroke-width: 3;
  stroke-dasharray: 8 7;
}

.pca-projection-lab__residual {
  stroke: rgba(190, 18, 60, 0.48);
  stroke-width: 2.2;
  stroke-dasharray: 4 5;
}

.pca-projection-lab__point {
  stroke: white;
  stroke-width: 2;
}

.pca-projection-lab__point--centered {
  fill: #3868ff;
}

.pca-projection-lab__point--reconstructed {
  fill: #e26d3d;
}

.pca-projection-lab__origin {
  fill: #0f1728;
  stroke: white;
  stroke-width: 2;
}

.pca-projection-lab__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  padding-top: 12px;
  color: var(--muted);
  font-size: 0.84rem;
}

.pca-projection-lab__legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pca-projection-lab__legend i {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 999px;
}

.pca-projection-lab__legend .is-primary {
  background: #0f766e;
}

.pca-projection-lab__legend .is-secondary {
  background: #e26d3d;
}

.pca-projection-lab__legend .is-centered {
  background: #3868ff;
}

.pca-projection-lab__legend .is-reconstructed {
  background: #e26d3d;
  opacity: 0.72;
}

.pca-projection-lab__control-grid {
  grid-template-columns: 1fr;
}

.pca-projection-lab__status {
  margin: 0;
}
</style>
