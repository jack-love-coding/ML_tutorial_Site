<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ModelLimitsInteractionAsset } from '../../types/linearRegressionInteraction'
import { paddedDomain, scaleLinear, svgPolyline } from '../../utils/linearRegressionSvg'

const props = defineProps<{ asset: ModelLimitsInteractionAsset }>()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')

const copy = computed(() => zh.value
  ? {
      title: '系数解释边界观察台', feature: '观察特征', space: '系数空间', value: '特征取值',
      modelSpace: '模型空间', rawContinuousUnits: '原始连续单位', coefficients: '条件系数对照',
      relationship: '边际关系与条件线', marginal: '训练集边际均值', conditional: '保持其他入模特征固定',
      coefficient: '当前系数', contribution: '相对参考值的线性贡献', reference: '参考值',
      warning: '这里展示的是模型中的条件关联，不是干预后的因果效应。改变一个输入并不能证明现实世界会按同样幅度变化。',
      fallback: '数据表：当前系数和关系曲线', source: 'Notebook 单元', unavailable: '此空间没有发布该特征的系数',
    }
  : {
      title: 'Coefficient interpretation boundaries', feature: 'Feature', space: 'Coefficient space', value: 'Feature value',
      modelSpace: 'Model space', rawContinuousUnits: 'Raw continuous units', coefficients: 'Conditional coefficient comparison',
      relationship: 'Marginal relationship and conditional line', marginal: 'Training marginal mean', conditional: 'Holding other modeled features fixed',
      coefficient: 'Current coefficient', contribution: 'Linear contribution from reference', reference: 'Reference',
      warning: 'This view shows a conditional association inside the model, not the causal effect of an intervention. Changing an input does not prove the real world changes by the same amount.',
      fallback: 'Data table: current coefficient and relationship curve', source: 'Notebook cell', unavailable: 'No coefficient for this feature was published in this space',
    })

type Space = 'modelSpace' | 'rawContinuousUnits'
const selectedSpace = ref<Space>('modelSpace')
const selectedFeature = ref('')
const featureValue = ref(0)

const featureProfiles = computed(() => props.asset.featureProfiles)
watch(featureProfiles, (rows) => {
  if (!rows.some((row) => row.feature === selectedFeature.value)) selectedFeature.value = rows[0]?.feature ?? ''
}, { immediate: true })

const profile = computed(() => featureProfiles.value.find((row) => row.feature === selectedFeature.value) ?? featureProfiles.value[0])
watch(profile, (row) => {
  if (!row) return
  if (!Number.isFinite(featureValue.value) || featureValue.value < row.domain[0] || featureValue.value > row.domain[1]) {
    featureValue.value = row.reference
  }
}, { immediate: true })

const space = computed(() => props.asset.spaces[selectedSpace.value])
const coefficientRow = computed(() => space.value.rows.find((row) => row.feature === selectedFeature.value))
const coefficient = computed(() => coefficientRow.value?.coefficient)
const contribution = computed(() => coefficient.value === undefined || !profile.value
  ? undefined
  : coefficient.value * (featureValue.value - profile.value.reference))

const bars = computed(() => {
  const sorted = space.value.rows.slice().sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient)).slice(0, 10)
  const chosen = coefficientRow.value
  if (chosen && !sorted.some((row) => row.feature === chosen.feature)) sorted.push(chosen)
  return sorted
})

const width = 720
const height = 300
const pad = 48
const barMax = computed(() => Math.max(1e-9, ...bars.value.map((row) => Math.abs(row.coefficient))))
const barCenter = width / 2
function barX(value: number) {
  return value >= 0 ? barCenter : barCenter - Math.abs(value) / barMax.value * (barCenter - pad)
}
function barWidth(value: number) {
  return Math.abs(value) / barMax.value * (barCenter - pad)
}

const marginalAtReference = computed(() => {
  const row = profile.value
  if (!row?.marginal.length) return 0
  return row.marginal.reduce((best, point) => Math.abs(point.x - row.reference) < Math.abs(best.x - row.reference) ? point : best).y
})
const conditionalPoints = computed(() => {
  const row = profile.value
  const slope = coefficient.value
  if (!row || slope === undefined) return []
  return Array.from({ length: 33 }, (_, index) => {
    const x = row.domain[0] + (row.domain[1] - row.domain[0]) * index / 32
    return { x, y: marginalAtReference.value + slope * (x - row.reference) }
  })
})
const relationXDomain = computed(() => ({ minimum: profile.value?.domain[0] ?? 0, maximum: profile.value?.domain[1] ?? 1 }))
const relationYDomain = computed(() => paddedDomain([
  ...(profile.value?.marginal ?? []).map((point) => point.y),
  ...conditionalPoints.value.map((point) => point.y),
], { minimum: 0, maximum: 1 }))
const marginalPath = computed(() => svgPolyline(profile.value?.marginal ?? [], relationXDomain.value, relationYDomain.value, width, height, pad))
const conditionalPath = computed(() => svgPolyline(conditionalPoints.value, relationXDomain.value, relationYDomain.value, width, height, pad))
function relationX(value: number) {
  return scaleLinear(value, relationXDomain.value, { minimum: pad, maximum: width - pad })
}
function relationY(value: number) {
  return scaleLinear(value, relationYDomain.value, { minimum: height - pad, maximum: pad })
}
function conditionalYAt(value: number) {
  return marginalAtReference.value + (coefficient.value ?? 0) * (value - (profile.value?.reference ?? 0))
}
function format(value: number | undefined, digits = 4) {
  return value !== undefined && Number.isFinite(value) ? value.toFixed(digits) : '—'
}
</script>

<template>
  <section class="linear-interaction-scene linear-interaction-scene--model-limits">
    <h3>{{ copy.title }}</h3>
    <div class="linear-interaction-scene__controls">
      <label>
        <span>{{ copy.feature }}</span>
        <select v-model="selectedFeature" :aria-label="copy.feature">
          <option v-for="row in featureProfiles" :key="row.feature" :value="row.feature">{{ row.feature }}</option>
        </select>
      </label>
      <label>
        <span>{{ copy.space }}</span>
        <select v-model="selectedSpace" :aria-label="copy.space">
          <option value="modelSpace">{{ copy.modelSpace }}</option>
          <option value="rawContinuousUnits">{{ copy.rawContinuousUnits }}</option>
        </select>
      </label>
      <label v-if="profile">
        <span>{{ copy.value }}: <strong>{{ format(featureValue, 3) }}</strong></span>
        <input v-model.number="featureValue" type="range" :min="profile.domain[0]" :max="profile.domain[1]" :step="Math.max((profile.domain[1] - profile.domain[0]) / 100, 0.001)" :aria-label="copy.value">
      </label>
    </div>

    <div class="scene-grid">
      <figure>
        <figcaption>{{ copy.coefficients }} · {{ copy[selectedSpace] }}</figcaption>
        <svg class="linear-interaction-scene__chart" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="`${copy.coefficients}, ${copy[selectedSpace]}`">
          <defs><pattern id="selected-coefficient-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#fff5ef"/><line x1="0" y1="0" x2="0" y2="8" stroke="#bd4f28" stroke-width="4"/></pattern></defs>
          <line :x1="barCenter" :x2="barCenter" y1="24" :y2="height - 20" class="zero-line" />
          <g v-for="(row, index) in bars" :key="row.feature">
            <rect :x="barX(row.coefficient)" :y="28 + index * 24" :width="barWidth(row.coefficient)" height="15" :class="['coefficient-bar', { 'is-selected': row.feature === selectedFeature }]" />
            <text :x="row.coefficient >= 0 ? barCenter - 8 : barCenter + 8" :y="40 + index * 24" :text-anchor="row.coefficient >= 0 ? 'end' : 'start'" class="bar-label">{{ row.feature }} · {{ format(row.coefficient, 3) }}</text>
          </g>
        </svg>
      </figure>
      <figure>
        <figcaption>{{ copy.relationship }} · {{ selectedFeature }}</figcaption>
        <svg class="linear-interaction-scene__chart" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="`${copy.relationship}, ${selectedFeature}`">
          <line :x1="pad" :x2="width - pad" :y1="height - pad" :y2="height - pad" class="axis" />
          <line :x1="pad" :x2="pad" :y1="pad" :y2="height - pad" class="axis" />
          <polyline :points="marginalPath" class="marginal-line" />
          <polyline v-if="conditionalPath" :points="conditionalPath" class="conditional-line" />
          <line v-if="profile" :x1="relationX(profile.reference)" :x2="relationX(profile.reference)" :y1="pad" :y2="height - pad" class="reference-line" />
          <circle v-if="profile && coefficient !== undefined" :cx="relationX(featureValue)" :cy="relationY(conditionalYAt(featureValue))" r="8" class="value-marker" />
          <text :x="width / 2" :y="height - 10" class="axis-label">{{ selectedFeature }}</text>
          <text x="9" :y="pad - 10" class="axis-label">cnt</text>
        </svg>
      </figure>
    </div>

    <div class="legend" aria-label="legend">
      <span><i class="legend-line marginal"></i>{{ copy.marginal }}</span>
      <span><i class="legend-line conditional"></i>{{ copy.conditional }}</span>
    </div>
    <div class="linear-interaction-scene__readout" aria-live="polite">
      <p><strong>{{ copy.coefficient }}:</strong> {{ format(coefficient) }} · <strong>{{ copy.reference }}:</strong> {{ format(profile?.reference, 3) }} · <strong>{{ copy.contribution }}:</strong> {{ format(contribution, 2) }}</p>
      <p v-if="coefficient === undefined">{{ copy.unavailable }}</p>
      <p class="warning">{{ copy.warning }}</p>
    </div>

    <details class="linear-interaction-scene__details">
      <summary>{{ copy.fallback }}</summary>
      <div class="table-wrap"><table class="linear-interaction-scene__table">
        <thead><tr><th>{{ copy.feature }}</th><th>{{ copy.space }}</th><th>{{ copy.coefficient }}</th><th>{{ copy.value }}</th><th>{{ copy.contribution }}</th></tr></thead>
        <tbody><tr><td>{{ selectedFeature }}</td><td>{{ copy[selectedSpace] }}</td><td>{{ format(coefficient) }}</td><td>{{ format(featureValue, 3) }}</td><td>{{ format(contribution, 2) }}</td></tr></tbody>
      </table></div>
      <p>{{ copy.source }}: {{ asset.sourceCellId }}</p>
    </details>
  </section>
</template>

<style scoped>
.linear-interaction-scene{display:grid;gap:1rem;min-width:0}.linear-interaction-scene h3,.linear-interaction-scene figure,.linear-interaction-scene p{margin:0}.linear-interaction-scene__controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem}.linear-interaction-scene__controls label{display:grid;gap:.4rem;padding:.75rem;border:1px solid #d9dee8;border-radius:.5rem;background:#f7f9fc;font-weight:800}.linear-interaction-scene__controls select,.linear-interaction-scene__controls input{width:100%;min-width:0}.linear-interaction-scene__controls select{min-height:2.6rem;padding:.4rem;border:1px solid #b8c0cc;border-radius:.4rem;background:#fff}.scene-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.scene-grid figure{min-width:0;padding:.75rem;border:1px solid #d9dee8;border-radius:.55rem;background:#fff}.scene-grid figcaption{font-weight:850}.linear-interaction-scene__chart{display:block;width:100%;height:auto;min-height:220px}.zero-line,.axis{stroke:#536071;stroke-width:1.5}.coefficient-bar{fill:#50647a}.coefficient-bar.is-selected{fill:url(#selected-coefficient-hatch);stroke:#9d3d20;stroke-width:2}.bar-label{fill:#172234;font-size:11px}.axis-label{fill:#435064;font-size:12px;text-anchor:middle}.marginal-line{fill:none;stroke:#50647a;stroke-width:4}.conditional-line{fill:none;stroke:#c65028;stroke-width:4;stroke-dasharray:10 5}.reference-line{stroke:#6f7782;stroke-width:2;stroke-dasharray:3 5}.value-marker{fill:#fff;stroke:#b94725;stroke-width:4}.legend{display:flex;flex-wrap:wrap;gap:1rem;font-size:.9rem;font-weight:750}.legend span{display:flex;align-items:center;gap:.45rem}.legend-line{display:inline-block;width:2rem;border-top:4px solid #50647a}.legend-line.conditional{border-top-color:#c65028;border-top-style:dashed}.linear-interaction-scene__readout{display:grid;gap:.5rem;padding:1rem;border-left:5px solid #c65028;border-radius:.45rem;background:#f7f9fc}.warning{font-weight:750}.linear-interaction-scene__details{padding:.8rem;border:1px solid #d9dee8;border-radius:.45rem}.linear-interaction-scene__details summary{cursor:pointer;font-weight:850}.table-wrap{max-width:100%;overflow:auto;margin-top:.75rem}.linear-interaction-scene__table{width:100%;border-collapse:collapse}.linear-interaction-scene__table th,.linear-interaction-scene__table td{padding:.55rem;border:1px solid #d9dee8;text-align:left;white-space:nowrap}@media(max-width:800px){.linear-interaction-scene__controls,.scene-grid{grid-template-columns:minmax(0,1fr)}.linear-interaction-scene__chart{min-height:180px}}@media(prefers-reduced-motion:no-preference){.coefficient-bar,.conditional-line,.value-marker{transition:all .22s ease}}
</style>
