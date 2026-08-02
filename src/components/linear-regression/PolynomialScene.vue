<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PolynomialInteractionAsset } from '../../types/linearRegressionInteraction'
import { paddedDomain, scaleLinear, svgPolyline } from '../../utils/linearRegressionSvg'

const props = defineProps<{ asset: PolynomialInteractionAsset }>()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')

const copy = computed(() => zh.value
  ? {
      title: '复杂度与特征表达观察台', degree: '多项式次数', stage: '特征阶段',
      temperature: '温度曲线', hourly: '小时需求曲线', actual: '真实训练样本', prediction: '模型预测',
      train: '训练 RMSE', validation: '验证 RMSE', gap: '验证－训练差距',
      conclusion: '判断模型是否更好，要看验证集，而不是只看训练误差。曲线更弯或特征更多，并不保证泛化更好。',
      fallback: '数值表：当前两个实验的真实运行结果', degreeColumn: '次数 / 阶段', source: 'Notebook 单元',
    }
  : {
      title: 'Complexity and feature representation lab', degree: 'Polynomial degree', stage: 'Feature stage',
      temperature: 'Temperature curve', hourly: 'Hourly demand curve', actual: 'Actual training sample', prediction: 'Model prediction',
      train: 'Train RMSE', validation: 'Validation RMSE', gap: 'Validation − train gap',
      conclusion: 'Judge improvement on validation data, not training error alone. A bendier curve or more features does not guarantee better generalization.',
      fallback: 'Data table: published results for the two current experiments', degreeColumn: 'Degree / stage', source: 'Notebook cell',
    })

const degrees = computed(() => props.asset.polynomialCurves.slice().sort((a, b) => a.degree - b.degree))
const stages = computed(() => props.asset.stageHourlyPredictions)
const selectedDegree = ref(0)
const selectedStage = ref('')

watch(degrees, (rows) => {
  if (!rows.some((row) => row.degree === selectedDegree.value)) {
    selectedDegree.value = rows.find((row) => row.degree === 3)?.degree ?? rows[0]?.degree ?? 0
  }
}, { immediate: true })
watch(stages, (rows) => {
  if (!rows.some((row) => row.id === selectedStage.value)) selectedStage.value = rows.at(-1)?.id ?? ''
}, { immediate: true })

const degreeRow = computed(() => degrees.value.find((row) => row.degree === selectedDegree.value) ?? degrees.value[0])
const stageRow = computed(() => stages.value.find((row) => row.id === selectedStage.value) ?? stages.value[0])

const width = 720
const height = 270
const pad = 42
const tempXDomain = computed(() => paddedDomain([
  ...props.asset.temperaturePoints.map((point) => point.x),
  ...(degreeRow.value?.points ?? []).map((point) => point.x),
], { minimum: 0, maximum: 1 }))
const tempYDomain = computed(() => paddedDomain([
  ...props.asset.temperaturePoints.map((point) => point.y),
  ...(degreeRow.value?.points ?? []).map((point) => point.y),
], { minimum: 0, maximum: 1 }))
const hourXDomain = { minimum: 0, maximum: 23 }
const hourYDomain = computed(() => paddedDomain([
  ...props.asset.hourlyActual.map((point) => point.y),
  ...(stageRow.value?.points ?? []).map((point) => point.y),
], { minimum: 0, maximum: 1 }))

const temperaturePath = computed(() => degreeRow.value
  ? svgPolyline(degreeRow.value.points, tempXDomain.value, tempYDomain.value, width, height, pad)
  : '')
const hourlyPath = computed(() => stageRow.value
  ? svgPolyline(stageRow.value.points, hourXDomain, hourYDomain.value, width, height, pad)
  : '')

const sampledTemperature = computed(() => {
  const points = props.asset.temperaturePoints
  const step = Math.max(1, Math.ceil(points.length / 80))
  return points.filter((_, index) => index % step === 0)
})
const sampledHourly = computed(() => {
  const points = props.asset.hourlyActual
  const step = Math.max(1, Math.ceil(points.length / 48))
  return points.filter((_, index) => index % step === 0)
})

function x(value: number, domain: { minimum: number; maximum: number }) {
  return scaleLinear(value, domain, { minimum: pad, maximum: width - pad })
}
function y(value: number, domain: { minimum: number; maximum: number }) {
  return scaleLinear(value, domain, { minimum: height - pad, maximum: pad })
}
function format(value: number | undefined, digits = 2) {
  return Number.isFinite(value) ? Number(value).toFixed(digits) : '—'
}
function humanize(value: string) {
  return value.replaceAll('-', ' ')
}
</script>

<template>
  <section class="linear-interaction-scene linear-interaction-scene--polynomial">
    <h3>{{ copy.title }}</h3>
    <div class="linear-interaction-scene__controls">
      <label>
        <span>{{ copy.degree }}</span>
        <select v-model.number="selectedDegree" :aria-label="copy.degree">
          <option v-for="row in degrees" :key="row.degree" :value="row.degree">{{ row.degree }}</option>
        </select>
      </label>
      <label>
        <span>{{ copy.stage }}</span>
        <select v-model="selectedStage" :aria-label="copy.stage">
          <option v-for="row in stages" :key="row.id" :value="row.id">{{ humanize(row.id) }}</option>
        </select>
      </label>
    </div>

    <div class="scene-grid">
      <figure>
        <figcaption>{{ copy.temperature }} · degree {{ selectedDegree }}</figcaption>
        <svg class="linear-interaction-scene__chart" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="`${copy.temperature}, ${copy.degree} ${selectedDegree}`">
          <line :x1="pad" :x2="width - pad" :y1="height - pad" :y2="height - pad" class="axis" />
          <line :x1="pad" :x2="pad" :y1="pad" :y2="height - pad" class="axis" />
          <circle v-for="(point, index) in sampledTemperature" :key="index" :cx="x(point.x, tempXDomain)" :cy="y(point.y, tempYDomain)" r="3" class="actual-point" />
          <polyline :points="temperaturePath" class="prediction-line" />
          <text :x="width / 2" :y="height - 9" class="axis-label">temp</text>
          <text x="8" :y="pad - 10" class="axis-label">cnt</text>
        </svg>
      </figure>
      <figure>
        <figcaption>{{ copy.hourly }} · {{ humanize(selectedStage) }}</figcaption>
        <svg class="linear-interaction-scene__chart" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="`${copy.hourly}, ${copy.stage} ${humanize(selectedStage)}`">
          <line :x1="pad" :x2="width - pad" :y1="height - pad" :y2="height - pad" class="axis" />
          <line :x1="pad" :x2="pad" :y1="pad" :y2="height - pad" class="axis" />
          <circle v-for="(point, index) in sampledHourly" :key="index" :cx="x(point.x, hourXDomain)" :cy="y(point.y, hourYDomain)" r="3" class="actual-point" />
          <polyline :points="hourlyPath" class="prediction-line is-dashed" />
          <text v-for="tick in [0, 6, 12, 18, 23]" :key="tick" :x="x(tick, hourXDomain)" :y="height - 12" class="axis-label">{{ tick }}</text>
          <text x="8" :y="pad - 10" class="axis-label">cnt</text>
        </svg>
      </figure>
    </div>

    <div class="linear-interaction-scene__readout" aria-live="polite">
      <p><strong>degree {{ selectedDegree }}</strong> · {{ copy.train }} {{ format(degreeRow?.trainRmse) }} · {{ copy.validation }} {{ format(degreeRow?.validationRmse) }} · {{ copy.gap }} {{ format((degreeRow?.validationRmse ?? 0) - (degreeRow?.trainRmse ?? 0)) }}</p>
      <p><strong>{{ humanize(selectedStage) }}</strong> · {{ copy.train }} {{ format(stageRow?.trainRmse) }} · {{ copy.validation }} {{ format(stageRow?.validationRmse) }} · {{ copy.gap }} {{ format((stageRow?.validationRmse ?? 0) - (stageRow?.trainRmse ?? 0)) }}</p>
      <p>{{ copy.conclusion }}</p>
    </div>

    <details class="linear-interaction-scene__details">
      <summary>{{ copy.fallback }}</summary>
      <div class="table-wrap">
        <table class="linear-interaction-scene__table">
          <thead><tr><th>{{ copy.degreeColumn }}</th><th>{{ copy.train }}</th><th>{{ copy.validation }}</th><th>{{ copy.gap }}</th></tr></thead>
          <tbody>
            <tr><th>degree {{ selectedDegree }}</th><td>{{ format(degreeRow?.trainRmse) }}</td><td>{{ format(degreeRow?.validationRmse) }}</td><td>{{ format((degreeRow?.validationRmse ?? 0) - (degreeRow?.trainRmse ?? 0)) }}</td></tr>
            <tr><th>{{ humanize(selectedStage) }}</th><td>{{ format(stageRow?.trainRmse) }}</td><td>{{ format(stageRow?.validationRmse) }}</td><td>{{ format((stageRow?.validationRmse ?? 0) - (stageRow?.trainRmse ?? 0)) }}</td></tr>
          </tbody>
        </table>
      </div>
      <p>{{ copy.source }}: {{ asset.sourceCellId }}</p>
    </details>
  </section>
</template>

<style scoped>
.linear-interaction-scene{display:grid;gap:1rem;min-width:0}.linear-interaction-scene h3,.linear-interaction-scene figure,.linear-interaction-scene p{margin:0}.linear-interaction-scene__controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}.linear-interaction-scene__controls label{display:grid;gap:.4rem;padding:.75rem;border:1px solid #d9dee8;border-radius:.5rem;background:#f7f9fc;font-weight:800}.linear-interaction-scene__controls select{min-height:2.6rem;width:100%;padding:.4rem;border:1px solid #b8c0cc;border-radius:.4rem;background:#fff}.scene-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.scene-grid figure{min-width:0;padding:.75rem;border:1px solid #d9dee8;border-radius:.55rem;background:#fff}.scene-grid figcaption{font-weight:850}.linear-interaction-scene__chart{display:block;width:100%;height:auto;min-height:210px}.axis{stroke:#556170;stroke-width:1.5}.axis-label{fill:#435064;font-size:12px;text-anchor:middle}.actual-point{fill:#fff;stroke:#435064;stroke-width:1.5;opacity:.7}.prediction-line{fill:none;stroke:#d65f2e;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.prediction-line.is-dashed{stroke-dasharray:10 5}.linear-interaction-scene__readout{display:grid;gap:.45rem;padding:1rem;border-left:5px solid #d65f2e;border-radius:.45rem;background:#f7f9fc}.linear-interaction-scene__details{padding:.8rem;border:1px solid #d9dee8;border-radius:.45rem}.linear-interaction-scene__details summary{cursor:pointer;font-weight:850}.table-wrap{max-width:100%;overflow:auto;margin-top:.75rem}.linear-interaction-scene__table{width:100%;border-collapse:collapse}.linear-interaction-scene__table th,.linear-interaction-scene__table td{padding:.55rem;border:1px solid #d9dee8;text-align:left;white-space:nowrap}@media(max-width:720px){.linear-interaction-scene__controls,.scene-grid{grid-template-columns:minmax(0,1fr)}.linear-interaction-scene__chart{min-height:170px}}@media(prefers-reduced-motion:no-preference){.prediction-line{transition:all .25s ease}}
</style>
