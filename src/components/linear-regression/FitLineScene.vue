<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FitLineInteractionAsset } from '../../types/linearRegressionInteraction'
import { clampFinite } from '../../simulations/linearRegressionInteraction'
import { scaleLinear } from '../../utils/linearRegressionSvg'

const props = defineProps<{ asset: FitLineInteractionAsset }>()
const { locale } = useI18n()

const width = 760
const height = 390
const margin = { top: 30, right: 34, bottom: 54, left: 62 }
const temperature = ref((props.asset.domain.x[0] + props.asset.domain.x[1]) / 2)
const slopeMultiplier = ref(1)
const interceptOffset = ref(0)

const copy = computed(() => locale.value === 'zh-CN'
  ? {
      title: '温度、参数与预测值', temperature: '温度 temp', slope: '斜率倍率', intercept: '截距偏移',
      baseline: '发布模型（虚线）', current: '当前模型（实线）', actual: '真实训练样本（圆点）',
      prediction: '当前预测（菱形）', xAxis: '标准化温度 temp', yAxis: '每小时租赁量 cnt',
      equation: '当前直线', predicted: '预测租赁量', reset: '重置参数', fallback: '数值与文字对照',
      cue: '圆点表示真实训练样本；虚线是发布模型；实线和菱形随参数变化。',
    }
  : {
      title: 'Temperature, parameters, and prediction', temperature: 'Temperature (temp)', slope: 'Slope multiplier', intercept: 'Intercept offset',
      baseline: 'Published model (dashed)', current: 'Current model (solid)', actual: 'Real training samples (circles)',
      prediction: 'Current prediction (diamond)', xAxis: 'Normalized temperature (temp)', yAxis: 'Hourly rentals (cnt)',
      equation: 'Current line', predicted: 'Predicted rentals', reset: 'Reset parameters', fallback: 'Numeric and text fallback',
      cue: 'Circles are real training samples; the dashed line is the published model; the solid line and diamond respond to the controls.',
    })

const xDomain = computed(() => ({ minimum: props.asset.domain.x[0], maximum: props.asset.domain.x[1] }))
const yDomain = computed(() => ({ minimum: props.asset.domain.y[0], maximum: props.asset.domain.y[1] }))
const x = (value: number) => scaleLinear(value, xDomain.value, { minimum: margin.left, maximum: width - margin.right })
const y = (value: number) => scaleLinear(value, yDomain.value, { minimum: height - margin.bottom, maximum: margin.top })

const slope = computed(() => props.asset.baseline.slope * slopeMultiplier.value)
const intercept = computed(() => props.asset.baseline.intercept + interceptOffset.value)
const predict = (value: number) => intercept.value + slope.value * value
const baselinePredict = (value: number) => props.asset.baseline.intercept + props.asset.baseline.slope * value
const prediction = computed(() => predict(temperature.value))
const lineEnds = computed(() => {
  const [left, right] = props.asset.domain.x
  return { x1: x(left), y1: y(predict(left)), x2: x(right), y2: y(predict(right)) }
})
const baselineEnds = computed(() => {
  const [left, right] = props.asset.domain.x
  return { x1: x(left), y1: y(baselinePredict(left)), x2: x(right), y2: y(baselinePredict(right)) }
})
const selectedPoint = computed(() => ({ x: x(temperature.value), y: y(prediction.value) }))
const xTicks = computed(() => Array.from({ length: 5 }, (_, index) => props.asset.domain.x[0] + index * (props.asset.domain.x[1] - props.asset.domain.x[0]) / 4))
const yTicks = computed(() => Array.from({ length: 5 }, (_, index) => props.asset.domain.y[0] + index * (props.asset.domain.y[1] - props.asset.domain.y[0]) / 4))

function format(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : '—'
}

function normalizeControls() {
  temperature.value = clampFinite(temperature.value, props.asset.domain.x[0], props.asset.domain.x[1], 0.5)
  slopeMultiplier.value = clampFinite(slopeMultiplier.value, 0.25, 1.75, 1)
  interceptOffset.value = clampFinite(interceptOffset.value, -250, 250, 0)
}

function reset() {
  temperature.value = (props.asset.domain.x[0] + props.asset.domain.x[1]) / 2
  slopeMultiplier.value = 1
  interceptOffset.value = 0
}
</script>

<template>
  <section class="linear-interaction-scene" data-scene-id="fit-line">
    <div class="linear-interaction-scene__controls" :aria-label="copy.title">
      <label>
        <span>{{ copy.temperature }}</span>
        <input v-model.number="temperature" type="range" :min="asset.domain.x[0]" :max="asset.domain.x[1]" step="0.01" :aria-label="copy.temperature" @change="normalizeControls">
        <strong>{{ format(temperature) }}</strong>
      </label>
      <label>
        <span>{{ copy.slope }}</span>
        <input v-model.number="slopeMultiplier" type="range" min="0.25" max="1.75" step="0.05" :aria-label="copy.slope" @change="normalizeControls">
        <strong>{{ format(slopeMultiplier) }}×</strong>
      </label>
      <label>
        <span>{{ copy.intercept }}</span>
        <input v-model.number="interceptOffset" type="range" min="-250" max="250" step="10" :aria-label="copy.intercept" @change="normalizeControls">
        <strong>{{ interceptOffset > 0 ? '+' : '' }}{{ format(interceptOffset, 0) }}</strong>
      </label>
    </div>

    <figure class="linear-interaction-scene__figure">
      <figcaption><strong>{{ copy.title }}</strong><span>{{ copy.cue }}</span></figcaption>
      <svg :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="`${copy.title}. ${copy.cue}`">
        <g class="grid">
          <line v-for="tick in yTicks" :key="`y-${tick}`" :x1="margin.left" :x2="width - margin.right" :y1="y(tick)" :y2="y(tick)" />
          <line v-for="tick in xTicks" :key="`x-${tick}`" :x1="x(tick)" :x2="x(tick)" :y1="margin.top" :y2="height - margin.bottom" />
        </g>
        <g class="axis-labels">
          <text v-for="tick in xTicks" :key="`xl-${tick}`" :x="x(tick)" :y="height - 27">{{ format(tick, 1) }}</text>
          <text v-for="tick in yTicks" :key="`yl-${tick}`" :x="margin.left - 10" :y="y(tick) + 4" text-anchor="end">{{ format(tick, 0) }}</text>
          <text :x="width / 2" :y="height - 5">{{ copy.xAxis }}</text>
          <text :x="18" :y="height / 2" :transform="`rotate(-90 18 ${height / 2})`">{{ copy.yAxis }}</text>
        </g>
        <circle v-for="(point, index) in asset.points" :key="point.instant ?? index" class="sample" :cx="x(point.x)" :cy="y(point.y)" r="4" />
        <line class="baseline" v-bind="baselineEnds" />
        <line class="current" v-bind="lineEnds" />
        <line class="cursor" :x1="selectedPoint.x" :x2="selectedPoint.x" :y1="selectedPoint.y" :y2="height - margin.bottom" />
        <rect class="prediction" :x="selectedPoint.x - 7" :y="selectedPoint.y - 7" width="14" height="14" :transform="`rotate(45 ${selectedPoint.x} ${selectedPoint.y})`" />
      </svg>
    </figure>

    <div class="linear-interaction-scene__readout" aria-live="polite">
      <p><span>{{ copy.equation }}</span><strong>ŷ = {{ format(intercept) }} + {{ format(slope) }} × temp</strong></p>
      <p><span>{{ copy.predicted }}</span><strong>{{ format(prediction, 1) }} cnt</strong></p>
      <button type="button" @click="reset">{{ copy.reset }}</button>
    </div>
    <details>
      <summary>{{ copy.fallback }}</summary>
      <table>
        <tbody>
          <tr><th>{{ copy.temperature }}</th><td>{{ format(temperature) }}</td></tr>
          <tr><th>{{ copy.slope }}</th><td>{{ format(slope) }}</td></tr>
          <tr><th>{{ copy.intercept }}</th><td>{{ format(intercept) }}</td></tr>
          <tr><th>{{ copy.predicted }}</th><td>{{ format(prediction, 1) }}</td></tr>
        </tbody>
      </table>
    </details>
  </section>
</template>

<style scoped>
.linear-interaction-scene{display:grid;gap:16px;min-width:0}.linear-interaction-scene__controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.linear-interaction-scene__controls label{display:grid;gap:7px;padding:12px;border:1px solid rgba(15,23,40,.1);border-radius:8px;background:#f7f9fc}.linear-interaction-scene__controls span{color:var(--muted);font-size:.78rem;font-weight:800}.linear-interaction-scene__controls strong{font-variant-numeric:tabular-nums}.linear-interaction-scene__figure{display:grid;gap:10px;margin:0;padding:12px;border:1px solid rgba(15,23,40,.09);border-radius:8px;background:#fbfcfe}.linear-interaction-scene__figure figcaption{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.linear-interaction-scene__figure figcaption span{max-width:64ch;color:var(--muted);font-size:.82rem}.linear-interaction-scene__figure svg{display:block;width:100%;height:auto;max-height:440px}.grid line{stroke:#dce2ea;stroke-width:1}.axis-labels text{fill:#647085;font-size:12px;text-anchor:middle}.sample{fill:#fff;stroke:#2b6f9c;stroke-width:2;opacity:.8}.baseline{stroke:#657083;stroke-width:3;stroke-dasharray:10 7}.current{stroke:var(--linear-accent,#db6c3a);stroke-width:4}.cursor{stroke:#262f3d;stroke-width:2;stroke-dasharray:3 5}.prediction{fill:#fff;stroke:#101827;stroke-width:3}.linear-interaction-scene__readout{display:flex;flex-wrap:wrap;gap:12px;align-items:stretch}.linear-interaction-scene__readout p{display:grid;gap:4px;min-width:220px;margin:0;padding:12px 14px;border-left:4px solid var(--linear-accent,#db6c3a);background:#f7f9fc}.linear-interaction-scene__readout button{min-height:42px;padding:0 14px;border:1px solid rgba(15,23,40,.15);border-radius:7px;background:#fff;font-weight:800}details{padding:10px 12px;border:1px solid rgba(15,23,40,.09);border-radius:7px}summary{cursor:pointer;font-weight:800}table{width:100%;margin-top:10px;border-collapse:collapse}th,td{padding:7px 10px;border-top:1px solid rgba(15,23,40,.08);text-align:left}td{text-align:right;font-family:monospace}@media(max-width:720px){.linear-interaction-scene__controls{grid-template-columns:1fr}.linear-interaction-scene__figure figcaption{display:grid}.linear-interaction-scene__figure{overflow-x:auto}.linear-interaction-scene__figure svg{min-width:560px}}
</style>
