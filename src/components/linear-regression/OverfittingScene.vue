<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { OverfittingInteractionAsset } from '../../types/linearRegressionInteraction'
import { paddedDomain, scaleLinear, svgPolyline } from '../../utils/linearRegressionSvg'

const props = defineProps<{ asset: OverfittingInteractionAsset }>()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')

type DiagnosticView = 'complexity' | 'hourly' | 'prediction' | 'case'
const copy = computed(() => zh.value
  ? {
      title: '泛化与残差诊断台', view: '诊断视图', complexity: '训练／验证差距', hourly: '分小时残差',
      prediction: '预测值—实际值', case: '具名失败案例', model: '模型复杂度', namedCase: '案例',
      train: '训练 RMSE', validation: '验证 RMSE', gap: '泛化差距', actual: '实际值', predicted: '预测值', residual: '残差',
      mean: '平均残差', mae: '平均绝对残差', identity: '理想预测线', selected: '当前复杂度', hour: '小时',
      under: '模型低估', over: '模型高估', balanced: '预测接近实际',
      conclusion: '训练误差低并不等于模型可靠。要把训练—验证差距、残差结构和具体失败案例放在一起判断。',
      fallback: '数据表：当前诊断视图', source: 'Notebook 单元', timestamp: '时间', instant: 'instant',
    }
  : {
      title: 'Generalization and residual diagnostics', view: 'Diagnostic view', complexity: 'Train/validation gap', hourly: 'Hourly residuals',
      prediction: 'Predicted versus actual', case: 'Named failure case', model: 'Model complexity', namedCase: 'Case',
      train: 'Train RMSE', validation: 'Validation RMSE', gap: 'Generalization gap', actual: 'Actual', predicted: 'Predicted', residual: 'Residual',
      mean: 'Mean residual', mae: 'Mean absolute residual', identity: 'Ideal prediction line', selected: 'Selected complexity', hour: 'Hour',
      under: 'Model underpredicts', over: 'Model overpredicts', balanced: 'Prediction is close to actual',
      conclusion: 'Low training error does not make a model reliable. Read the train-validation gap together with residual structure and concrete failure cases.',
      fallback: 'Data table: current diagnostic view', source: 'Notebook cell', timestamp: 'Timestamp', instant: 'instant',
    })

const view = ref<DiagnosticView>('complexity')
const selectedComplexity = ref('')
const selectedCaseRole = ref('')

watch(() => props.asset.complexity, (rows) => {
  if (!rows.some((row) => row.id === selectedComplexity.value)) {
    selectedComplexity.value = rows.reduce((best, row) => row.validationRmse < best.validationRmse ? row : best, rows[0]!)?.id ?? ''
  }
}, { immediate: true })
watch(() => props.asset.namedCases, (rows) => {
  if (!rows.some((row) => row.role === selectedCaseRole.value)) selectedCaseRole.value = rows[0]?.role ?? ''
}, { immediate: true })

const complexityRow = computed(() => props.asset.complexity.find((row) => row.id === selectedComplexity.value) ?? props.asset.complexity[0])
const namedCase = computed(() => props.asset.namedCases.find((row) => row.role === selectedCaseRole.value) ?? props.asset.namedCases[0])
const gap = computed(() => (complexityRow.value?.validationRmse ?? 0) - (complexityRow.value?.trainRmse ?? 0))

const width = 760
const height = 310
const pad = 48
const complexityX = (index: number) => scaleLinear(index, { minimum: 0, maximum: Math.max(1, props.asset.complexity.length - 1) }, { minimum: pad, maximum: width - pad })
const complexityYDomain = computed(() => paddedDomain(props.asset.complexity.flatMap((row) => [row.trainRmse, row.validationRmse]), { minimum: 0, maximum: 1 }))
const complexityY = (value: number) => scaleLinear(value, complexityYDomain.value, { minimum: height - pad, maximum: pad })
const trainPath = computed(() => props.asset.complexity.map((row, index) => `${complexityX(index)},${complexityY(row.trainRmse)}`).join(' '))
const validationPath = computed(() => props.asset.complexity.map((row, index) => `${complexityX(index)},${complexityY(row.validationRmse)}`).join(' '))

const hourXDomain = { minimum: 0, maximum: 23 }
const hourYDomain = computed(() => paddedDomain(props.asset.hourlyResiduals.flatMap((row) => [row.mean, row.mae, 0]), { minimum: -1, maximum: 1 }))
const hourMeanPath = computed(() => svgPolyline(props.asset.hourlyResiduals.map((row) => ({ x: row.hour, y: row.mean })), hourXDomain, hourYDomain.value, width, height, pad))
const hourMaePath = computed(() => svgPolyline(props.asset.hourlyResiduals.map((row) => ({ x: row.hour, y: row.mae })), hourXDomain, hourYDomain.value, width, height, pad))
const hourX = (value: number) => scaleLinear(value, hourXDomain, { minimum: pad, maximum: width - pad })
const hourY = (value: number) => scaleLinear(value, hourYDomain.value, { minimum: height - pad, maximum: pad })

const predictionDomain = computed(() => paddedDomain(props.asset.predictionSample.flatMap((row) => [row.actual, row.prediction]), { minimum: 0, maximum: 1 }))
const predictionX = (value: number) => scaleLinear(value, predictionDomain.value, { minimum: pad, maximum: width - pad })
const predictionY = (value: number) => scaleLinear(value, predictionDomain.value, { minimum: height - pad, maximum: pad })
const sampledPredictions = computed(() => {
  const rows = props.asset.predictionSample
  const step = Math.max(1, Math.ceil(rows.length / 120))
  return rows.filter((_, index) => index % step === 0)
})

const caseDomain = computed(() => paddedDomain(namedCase.value ? [namedCase.value.actual, namedCase.value.prediction, 0] : [0, 1], { minimum: 0, maximum: 1 }))
const caseY = (value: number) => scaleLinear(value, caseDomain.value, { minimum: height - pad, maximum: pad })
function caseStatus(residual: number | undefined) {
  if (residual === undefined || Math.abs(residual) < 1) return copy.value.balanced
  return residual < 0 ? copy.value.under : copy.value.over
}
function format(value: number | undefined, digits = 2) {
  return value !== undefined && Number.isFinite(value) ? value.toFixed(digits) : '—'
}
function humanize(value: string) {
  return value.replaceAll('-', ' ')
}
</script>

<template>
  <section class="linear-interaction-scene linear-interaction-scene--overfitting">
    <h3>{{ copy.title }}</h3>
    <div class="linear-interaction-scene__controls">
      <label>
        <span>{{ copy.view }}</span>
        <select v-model="view" :aria-label="copy.view">
          <option value="complexity">{{ copy.complexity }}</option><option value="hourly">{{ copy.hourly }}</option>
          <option value="prediction">{{ copy.prediction }}</option><option value="case">{{ copy.case }}</option>
        </select>
      </label>
      <label>
        <span>{{ copy.model }}</span>
        <select v-model="selectedComplexity" :aria-label="copy.model">
          <option v-for="row in asset.complexity" :key="row.id" :value="row.id">{{ humanize(row.id) }}</option>
        </select>
      </label>
      <label>
        <span>{{ copy.namedCase }}</span>
        <select v-model="selectedCaseRole" :aria-label="copy.namedCase">
          <option v-for="row in asset.namedCases" :key="`${row.role}-${row.instant}`" :value="row.role">{{ humanize(row.role) }}</option>
        </select>
      </label>
    </div>

    <figure>
      <figcaption>{{ copy[view] }}</figcaption>
      <svg class="linear-interaction-scene__chart" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="copy[view]">
        <template v-if="view === 'complexity'">
          <line :x1="pad" :x2="width - pad" :y1="height - pad" :y2="height - pad" class="axis"/><line :x1="pad" :x2="pad" :y1="pad" :y2="height - pad" class="axis"/>
          <polyline :points="trainPath" class="train-line"/><polyline :points="validationPath" class="validation-line"/>
          <g v-for="(row, index) in asset.complexity" :key="row.id">
            <circle :cx="complexityX(index)" :cy="complexityY(row.trainRmse)" :r="row.id === selectedComplexity ? 7 : 4" class="train-dot"/>
            <rect :x="complexityX(index) - (row.id === selectedComplexity ? 7 : 4)" :y="complexityY(row.validationRmse) - (row.id === selectedComplexity ? 7 : 4)" :width="row.id === selectedComplexity ? 14 : 8" :height="row.id === selectedComplexity ? 14 : 8" class="validation-dot"/>
            <text :x="complexityX(index)" :y="height - 14" class="x-label">{{ index + 1 }}</text>
          </g>
        </template>
        <template v-else-if="view === 'hourly'">
          <line :x1="pad" :x2="width - pad" :y1="hourY(0)" :y2="hourY(0)" class="zero-line"/><line :x1="pad" :x2="pad" :y1="pad" :y2="height - pad" class="axis"/>
          <polyline :points="hourMeanPath" class="train-line"/><polyline :points="hourMaePath" class="validation-line"/>
          <text v-for="tick in [0,6,12,18,23]" :key="tick" :x="hourX(tick)" :y="height - 14" class="x-label">{{ tick }}</text>
        </template>
        <template v-else-if="view === 'prediction'">
          <line :x1="pad" :x2="width - pad" :y1="height - pad" :y2="height - pad" class="axis"/><line :x1="pad" :x2="pad" :y1="pad" :y2="height - pad" class="axis"/>
          <line :x1="predictionX(predictionDomain.minimum)" :x2="predictionX(predictionDomain.maximum)" :y1="predictionY(predictionDomain.minimum)" :y2="predictionY(predictionDomain.maximum)" class="identity-line"/>
          <circle v-for="(row, index) in sampledPredictions" :key="index" :cx="predictionX(row.actual)" :cy="predictionY(row.prediction)" r="4" class="prediction-dot"/>
          <text :x="width / 2" :y="height - 10" class="x-label">{{ copy.actual }}</text><text x="10" :y="pad - 12" class="x-label">{{ copy.predicted }}</text>
        </template>
        <template v-else-if="namedCase">
          <line x1="190" x2="570" :y1="height - pad" :y2="height - pad" class="axis"/>
          <rect x="235" :y="caseY(namedCase.actual)" width="95" :height="height - pad - caseY(namedCase.actual)" class="case-actual"/>
          <rect x="430" :y="caseY(namedCase.prediction)" width="95" :height="height - pad - caseY(namedCase.prediction)" class="case-prediction"/>
          <line x1="330" x2="430" :y1="caseY(namedCase.actual)" :y2="caseY(namedCase.prediction)" class="residual-arrow" marker-end="url(#arrowhead)"/>
          <defs><marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#9f3d31"/></marker></defs>
          <text x="282" :y="height - 15" class="x-label">{{ copy.actual }}</text><text x="478" :y="height - 15" class="x-label">{{ copy.predicted }}</text>
          <text x="380" y="45" class="case-role">{{ humanize(namedCase.role) }}</text><text x="380" y="68" class="case-role">{{ caseStatus(namedCase.residual) }} · r = {{ format(namedCase.residual) }}</text>
        </template>
      </svg>
    </figure>

    <div class="legend" aria-label="legend">
      <template v-if="view === 'complexity'"><span><i class="legend-dot circle"></i>{{ copy.train }}</span><span><i class="legend-dot square"></i>{{ copy.validation }}</span></template>
      <template v-else-if="view === 'hourly'"><span><i class="legend-line mean"></i>{{ copy.mean }}</span><span><i class="legend-line mae"></i>{{ copy.mae }}</span></template>
      <template v-else-if="view === 'prediction'"><span><i class="legend-line identity"></i>{{ copy.identity }}</span></template>
    </div>

    <div class="linear-interaction-scene__readout" aria-live="polite">
      <p><strong>{{ humanize(selectedComplexity) }}</strong> · {{ copy.train }} {{ format(complexityRow?.trainRmse) }} · {{ copy.validation }} {{ format(complexityRow?.validationRmse) }} · {{ copy.gap }} {{ format(gap) }}</p>
      <p v-if="namedCase"><strong>{{ humanize(namedCase.role) }}</strong> · {{ namedCase.timestamp }} · {{ copy.actual }} {{ format(namedCase.actual, 0) }} · {{ copy.predicted }} {{ format(namedCase.prediction) }} · {{ copy.residual }} {{ format(namedCase.residual) }} ({{ caseStatus(namedCase.residual) }})</p>
      <p>{{ copy.conclusion }}</p>
    </div>

    <details class="linear-interaction-scene__details">
      <summary>{{ copy.fallback }}</summary>
      <div class="table-wrap"><table class="linear-interaction-scene__table">
        <thead><tr><th>{{ copy.model }}</th><th>{{ copy.train }}</th><th>{{ copy.validation }}</th><th>{{ copy.gap }}</th></tr></thead>
        <tbody><tr><td>{{ humanize(selectedComplexity) }}</td><td>{{ format(complexityRow?.trainRmse) }}</td><td>{{ format(complexityRow?.validationRmse) }}</td><td>{{ format(gap) }}</td></tr></tbody>
      </table></div>
      <div v-if="namedCase" class="table-wrap"><table class="linear-interaction-scene__table">
        <thead><tr><th>{{ copy.namedCase }}</th><th>{{ copy.timestamp }}</th><th>{{ copy.instant }}</th><th>{{ copy.hour }}</th><th>{{ copy.actual }}</th><th>{{ copy.predicted }}</th><th>{{ copy.residual }}</th></tr></thead>
        <tbody><tr><td>{{ humanize(namedCase.role) }}</td><td>{{ namedCase.timestamp }}</td><td>{{ namedCase.instant }}</td><td>{{ namedCase.hour }}</td><td>{{ format(namedCase.actual, 0) }}</td><td>{{ format(namedCase.prediction) }}</td><td>{{ format(namedCase.residual) }}</td></tr></tbody>
      </table></div>
      <p>{{ copy.source }}: {{ asset.sourceCellId }}</p>
    </details>
  </section>
</template>

<style scoped>
.linear-interaction-scene{display:grid;gap:1rem;min-width:0}.linear-interaction-scene h3,.linear-interaction-scene figure,.linear-interaction-scene p{margin:0}.linear-interaction-scene__controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem}.linear-interaction-scene__controls label{display:grid;gap:.4rem;padding:.75rem;border:1px solid #d9dee8;border-radius:.5rem;background:#f7f9fc;font-weight:800}.linear-interaction-scene__controls select{width:100%;min-width:0;min-height:2.6rem;padding:.4rem;border:1px solid #b8c0cc;border-radius:.4rem;background:#fff}.linear-interaction-scene figure{min-width:0;padding:.75rem;border:1px solid #d9dee8;border-radius:.55rem;background:#fff}.linear-interaction-scene figcaption{font-weight:850}.linear-interaction-scene__chart{display:block;width:100%;height:auto;min-height:240px}.axis,.zero-line{stroke:#536071;stroke-width:1.5}.zero-line{stroke-dasharray:4 4}.train-line{fill:none;stroke:#365f80;stroke-width:4}.validation-line{fill:none;stroke:#c65028;stroke-width:4;stroke-dasharray:10 5}.train-dot{fill:#fff;stroke:#365f80;stroke-width:3}.validation-dot{fill:#fff4eb;stroke:#c65028;stroke-width:3}.x-label{fill:#435064;font-size:12px;text-anchor:middle}.identity-line{stroke:#4e5968;stroke-width:2;stroke-dasharray:8 6}.prediction-dot{fill:#fff;stroke:#415e76;stroke-width:2;opacity:.7}.case-actual{fill:#385f7d}.case-prediction{fill:#fff4eb;stroke:#c65028;stroke-width:4}.residual-arrow{stroke:#9f3d31;stroke-width:3}.case-role{fill:#172234;font-size:15px;font-weight:800;text-anchor:middle}.legend{display:flex;flex-wrap:wrap;gap:1rem;font-size:.9rem;font-weight:750}.legend span{display:flex;align-items:center;gap:.45rem}.legend-dot{display:inline-block;width:.8rem;height:.8rem;border:3px solid #365f80;background:#fff}.legend-dot.circle{border-radius:50%}.legend-dot.square{border-color:#c65028;background:#fff4eb}.legend-line{display:inline-block;width:2rem;border-top:4px solid #365f80}.legend-line.mae{border-top-color:#c65028;border-top-style:dashed}.legend-line.identity{border-top-color:#4e5968;border-top-width:2px;border-top-style:dashed}.linear-interaction-scene__readout{display:grid;gap:.5rem;padding:1rem;border-left:5px solid #c65028;border-radius:.45rem;background:#f7f9fc}.linear-interaction-scene__details{padding:.8rem;border:1px solid #d9dee8;border-radius:.45rem}.linear-interaction-scene__details summary{cursor:pointer;font-weight:850}.table-wrap{max-width:100%;overflow:auto;margin-top:.75rem}.linear-interaction-scene__table{width:100%;border-collapse:collapse}.linear-interaction-scene__table th,.linear-interaction-scene__table td{padding:.55rem;border:1px solid #d9dee8;text-align:left;white-space:nowrap}@media(max-width:800px){.linear-interaction-scene__controls{grid-template-columns:minmax(0,1fr)}.linear-interaction-scene__chart{min-height:190px}}@media(prefers-reduced-motion:no-preference){.train-line,.validation-line,.prediction-dot,.case-actual,.case-prediction{transition:all .22s ease}}
</style>
