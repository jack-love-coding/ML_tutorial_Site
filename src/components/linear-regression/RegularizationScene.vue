<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RegularizationInteractionAsset } from '../../types/linearRegressionInteraction'
import { paddedDomain, scaleLinear, svgPolyline } from '../../utils/linearRegressionSvg'

const props = defineProps<{ asset: RegularizationInteractionAsset }>()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')

type Model = 'ols' | 'ridge' | 'lasso'
const copy = computed(() => zh.value
  ? {
      title: '共线性与正则化路径观察台', model: '模型类型', alpha: '正则强度 α', playback: '路径播放',
      play: '播放', pause: '暂停', step: '单步', reset: '回到起点', reduced: '系统已启用减少动态效果；请使用“单步”查看路径。',
      scatter: 'temp 与 atemp 的训练样本', path: '系数收缩路径', rmse: '验证 RMSE', coefficient: '系数',
      correlation: '训练集相关系数', selected: '当前路径点', noPenalty: 'OLS 不使用 α；它作为无惩罚基线。',
      explanation: 'Ridge 让相关特征共同收缩；Lasso 可能把部分系数压到零。系数更小不自动代表预测更好，仍应检查验证 RMSE。',
      fallback: '数据表：当前模型与系数', feature: '特征', value: '系数值', source: 'Notebook 单元',
    }
  : {
      title: 'Collinearity and regularization path lab', model: 'Model', alpha: 'Regularization strength α', playback: 'Path playback',
      play: 'Play', pause: 'Pause', step: 'Step', reset: 'Return to start', reduced: 'Reduced motion is enabled; use Step to inspect the path.',
      scatter: 'Training sample: temp versus atemp', path: 'Coefficient shrinkage path', rmse: 'Validation RMSE', coefficient: 'Coefficient',
      correlation: 'Training correlation', selected: 'Selected path point', noPenalty: 'OLS does not use α; it is the unpenalized baseline.',
      explanation: 'Ridge shrinks correlated features together; Lasso may drive some coefficients to zero. Smaller coefficients do not automatically improve prediction, so validation RMSE still matters.',
      fallback: 'Data table: current model and coefficients', feature: 'Feature', value: 'Coefficient value', source: 'Notebook cell',
    })

const model = ref<Model>('ridge')
const pathIndex = ref(0)
const playing = ref(false)
const reducedMotion = ref(false)
let timer: number | undefined
let mediaQuery: MediaQueryList | undefined

const path = computed(() => model.value === 'ols'
  ? []
  : props.asset.paths.filter((row) => row.model === model.value).slice().sort((a, b) => a.alpha - b.alpha))
const maxIndex = computed(() => Math.max(0, path.value.length - 1))
const pathRow = computed(() => path.value[pathIndex.value])
const selectedCoefficients = computed(() => model.value === 'ols' ? props.asset.ols.coefficients : (pathRow.value?.coefficients ?? {}))
const selectedRmse = computed(() => model.value === 'ols' ? props.asset.ols.validationRmse : pathRow.value?.validationRmse)

function stop() {
  playing.value = false
  if (timer !== undefined && typeof window !== 'undefined') window.clearInterval(timer)
  timer = undefined
}
function step() {
  if (!path.value.length) return
  pathIndex.value = pathIndex.value >= maxIndex.value ? 0 : pathIndex.value + 1
}
function play() {
  if (reducedMotion.value || model.value === 'ols' || path.value.length < 2) return
  stop()
  playing.value = true
  timer = window.setInterval(() => {
    if (pathIndex.value >= maxIndex.value) {
      stop()
      return
    }
    pathIndex.value += 1
  }, 650)
}
function reset() {
  stop()
  pathIndex.value = 0
}
function updateReducedMotion(event: MediaQueryListEvent | MediaQueryList) {
  reducedMotion.value = event.matches
  if (event.matches) stop()
}

watch(model, () => reset())
watch(path, (rows) => {
  if (pathIndex.value >= rows.length) pathIndex.value = Math.max(0, rows.length - 1)
})
onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateReducedMotion(mediaQuery)
  mediaQuery.addEventListener('change', updateReducedMotion)
})
onBeforeUnmount(() => {
  stop()
  mediaQuery?.removeEventListener('change', updateReducedMotion)
})

const width = 720
const height = 320
const pad = 46
const scatterXDomain = computed(() => paddedDomain(props.asset.temperatureSample.map((point) => point.temp), { minimum: 0, maximum: 1 }))
const scatterYDomain = computed(() => paddedDomain(props.asset.temperatureSample.map((point) => point.atemp), { minimum: 0, maximum: 1 }))
const scatterX = (value: number) => scaleLinear(value, scatterXDomain.value, { minimum: pad, maximum: width - pad })
const scatterY = (value: number) => scaleLinear(value, scatterYDomain.value, { minimum: height - pad, maximum: pad })
const sampledTemperature = computed(() => {
  const rows = props.asset.temperatureSample
  const step = Math.max(1, Math.ceil(rows.length / 140))
  return rows.filter((_, index) => index % step === 0)
})

const pathXDomain = computed(() => {
  const logs = path.value.map((row) => Math.log10(row.alpha)).filter(Number.isFinite)
  return paddedDomain(logs, { minimum: -2, maximum: 3 })
})
const coefficientYDomain = computed(() => paddedDomain(path.value.flatMap((row) => [row.coefficients.temp ?? 0, row.coefficients.atemp ?? 0, 0]), { minimum: -1, maximum: 1 }))
const rmseYDomain = computed(() => paddedDomain(path.value.map((row) => row.validationRmse), { minimum: 0, maximum: 1 }))
const pathX = (alpha: number) => scaleLinear(Math.log10(alpha), pathXDomain.value, { minimum: pad, maximum: width - pad })
const coefficientY = (value: number) => scaleLinear(value, coefficientYDomain.value, { minimum: 178, maximum: 25 })
const rmseY = (value: number) => scaleLinear(value, rmseYDomain.value, { minimum: height - 32, maximum: 222 })
const tempPath = computed(() => svgPolyline(
  path.value.map((row) => ({ x: Math.log10(row.alpha), y: row.coefficients.temp ?? 0 })),
  pathXDomain.value, coefficientYDomain.value, width, 202, pad,
))
const atempPath = computed(() => svgPolyline(
  path.value.map((row) => ({ x: Math.log10(row.alpha), y: row.coefficients.atemp ?? 0 })),
  pathXDomain.value, coefficientYDomain.value, width, 202, pad,
))
const rmsePath = computed(() => path.value.map((row) => `${pathX(row.alpha)},${rmseY(row.validationRmse)}`).join(' '))
const olsBars = computed(() => ['temp', 'atemp'].map((feature) => ({ feature, coefficient: props.asset.ols.coefficients[feature] ?? 0 })))
const olsMax = computed(() => Math.max(1e-9, ...olsBars.value.map((row) => Math.abs(row.coefficient))))
function format(value: number | undefined, digits = 4) {
  return value !== undefined && Number.isFinite(value) ? value.toFixed(digits) : '—'
}
</script>

<template>
  <section class="linear-interaction-scene linear-interaction-scene--regularization">
    <h3>{{ copy.title }}</h3>
    <div class="linear-interaction-scene__controls">
      <label>
        <span>{{ copy.model }}</span>
        <select v-model="model" :aria-label="copy.model"><option value="ols">OLS</option><option value="ridge">Ridge</option><option value="lasso">Lasso</option></select>
      </label>
      <label :class="{ 'is-disabled': model === 'ols' }">
        <span>{{ copy.alpha }}: <strong>{{ model === 'ols' ? '—' : format(pathRow?.alpha, 4) }}</strong></span>
        <input v-model.number="pathIndex" type="range" min="0" :max="maxIndex" step="1" :disabled="model === 'ols' || !path.length" :aria-label="copy.alpha">
      </label>
      <div class="playback" role="group" :aria-label="copy.playback">
        <span>{{ copy.playback }}</span>
        <div><button type="button" :aria-pressed="playing" :disabled="model === 'ols' || reducedMotion || playing" @click="play">▶ {{ copy.play }}</button><button type="button" :disabled="!playing" @click="stop">Ⅱ {{ copy.pause }}</button><button type="button" :disabled="model === 'ols' || !path.length" @click="step">› {{ copy.step }}</button><button type="button" @click="reset">↺ {{ copy.reset }}</button></div>
      </div>
    </div>
    <p v-if="reducedMotion" class="motion-note" role="status">{{ copy.reduced }}</p>

    <div class="scene-grid">
      <figure>
        <figcaption>{{ copy.scatter }} · r = {{ format(asset.correlation, 3) }}</figcaption>
        <svg class="linear-interaction-scene__chart" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="`${copy.scatter}, ${copy.correlation} ${format(asset.correlation, 3)}`">
          <line :x1="pad" :x2="width - pad" :y1="height - pad" :y2="height - pad" class="axis"/><line :x1="pad" :x2="pad" :y1="pad" :y2="height - pad" class="axis"/>
          <line :x1="scatterX(scatterXDomain.minimum)" :x2="scatterX(scatterXDomain.maximum)" :y1="scatterY(scatterXDomain.minimum)" :y2="scatterY(scatterXDomain.maximum)" class="identity-line"/>
          <circle v-for="(point, index) in sampledTemperature" :key="index" :cx="scatterX(point.temp)" :cy="scatterY(point.atemp)" r="4" class="temperature-point"/>
          <text :x="width / 2" :y="height - 10" class="axis-label">temp</text><text x="12" :y="pad - 12" class="axis-label">atemp</text>
        </svg>
      </figure>
      <figure>
        <figcaption>{{ model === 'ols' ? 'OLS' : `${model.toUpperCase()} · ${copy.path}` }}</figcaption>
        <svg class="linear-interaction-scene__chart" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="`${model.toUpperCase()}, ${copy.path}`">
          <template v-if="model === 'ols'">
            <line :x1="width / 2" :x2="width / 2" y1="45" :y2="height - 45" class="axis"/>
            <g v-for="(row, index) in olsBars" :key="row.feature">
              <rect :x="row.coefficient >= 0 ? width / 2 : width / 2 - Math.abs(row.coefficient) / olsMax * 230" :y="90 + index * 80" :width="Math.abs(row.coefficient) / olsMax * 230" height="44" :class="['ols-bar', row.feature]"/>
              <text :x="width / 2" :y="78 + index * 80" class="ols-label">{{ row.feature }} · {{ format(row.coefficient) }}</text>
            </g>
          </template>
          <template v-else>
            <line :x1="pad" :x2="width - pad" :y1="coefficientY(0)" :y2="coefficientY(0)" class="zero-line"/>
            <polyline :points="tempPath" class="temp-path"/><polyline :points="atempPath" class="atemp-path"/><polyline :points="rmsePath" class="rmse-path"/>
            <line :x1="pad" :x2="width - pad" y1="202" y2="202" class="divider"/>
            <line v-if="pathRow" :x1="pathX(pathRow.alpha)" :x2="pathX(pathRow.alpha)" y1="24" :y2="height - 28" class="selected-line"/>
            <circle v-if="pathRow" :cx="pathX(pathRow.alpha)" :cy="coefficientY(pathRow.coefficients.temp ?? 0)" r="7" class="selected-temp"/>
            <rect v-if="pathRow" :x="pathX(pathRow.alpha) - 7" :y="coefficientY(pathRow.coefficients.atemp ?? 0) - 7" width="14" height="14" class="selected-atemp"/>
            <text x="12" y="35" class="axis-label">{{ copy.coefficient }}</text><text x="12" y="230" class="axis-label">{{ copy.rmse }}</text><text :x="width / 2" :y="height - 8" class="axis-label">log₁₀(α)</text>
          </template>
        </svg>
      </figure>
    </div>

    <div class="legend" aria-label="legend"><span><i class="legend-line temp"></i>temp</span><span><i class="legend-line atemp"></i>atemp</span><span><i class="legend-line rmse"></i>{{ copy.rmse }}</span></div>
    <div class="linear-interaction-scene__readout" aria-live="polite">
      <p><strong>{{ model.toUpperCase() }}</strong> · {{ copy.alpha }} {{ model === 'ols' ? '—' : format(pathRow?.alpha, 4) }} · {{ copy.rmse }} {{ format(selectedRmse, 3) }}</p>
      <p>temp {{ format(selectedCoefficients.temp) }} · atemp {{ format(selectedCoefficients.atemp) }} · {{ copy.correlation }} {{ format(asset.correlation, 3) }}</p>
      <p v-if="model === 'ols'">{{ copy.noPenalty }}</p><p>{{ copy.explanation }}</p>
    </div>

    <details class="linear-interaction-scene__details">
      <summary>{{ copy.fallback }}</summary>
      <div class="table-wrap"><table class="linear-interaction-scene__table">
        <thead><tr><th>{{ copy.model }}</th><th>{{ copy.alpha }}</th><th>{{ copy.rmse }}</th><th>{{ copy.feature }}</th><th>{{ copy.value }}</th></tr></thead>
        <tbody><tr v-for="([feature, coefficientValue], index) in Object.entries(selectedCoefficients)" :key="feature"><td>{{ index === 0 ? model.toUpperCase() : '' }}</td><td>{{ index === 0 ? (model === 'ols' ? '—' : format(pathRow?.alpha, 4)) : '' }}</td><td>{{ index === 0 ? format(selectedRmse, 3) : '' }}</td><td>{{ feature }}</td><td>{{ format(coefficientValue) }}</td></tr></tbody>
      </table></div>
      <p>{{ copy.source }}: {{ asset.sourceCellId }}</p>
    </details>
  </section>
</template>

<style scoped>
.linear-interaction-scene{display:grid;gap:1rem;min-width:0}.linear-interaction-scene h3,.linear-interaction-scene figure,.linear-interaction-scene p{margin:0}.linear-interaction-scene__controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem}.linear-interaction-scene__controls label,.playback{display:grid;gap:.4rem;padding:.75rem;border:1px solid #d9dee8;border-radius:.5rem;background:#f7f9fc;font-weight:800}.linear-interaction-scene__controls select,.linear-interaction-scene__controls input{width:100%;min-width:0}.linear-interaction-scene__controls select{min-height:2.6rem;padding:.4rem;border:1px solid #b8c0cc;border-radius:.4rem;background:#fff}.is-disabled{opacity:.65}.playback>div{display:flex;flex-wrap:wrap;gap:.35rem}.playback button{min-height:2.25rem;padding:.3rem .55rem;border:1px solid #aeb7c5;border-radius:.35rem;background:#fff;color:#172234;font-weight:750}.playback button:disabled{opacity:.5}.motion-note{padding:.7rem;border-left:4px solid #52657b;background:#f7f9fc}.scene-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.scene-grid figure{min-width:0;padding:.75rem;border:1px solid #d9dee8;border-radius:.55rem;background:#fff}.scene-grid figcaption{font-weight:850}.linear-interaction-scene__chart{display:block;width:100%;height:auto;min-height:235px}.axis,.zero-line,.divider{stroke:#536071;stroke-width:1.5}.zero-line{stroke-dasharray:4 4}.identity-line{stroke:#657181;stroke-width:2;stroke-dasharray:8 5}.temperature-point{fill:#fff;stroke:#385f7d;stroke-width:2;opacity:.72}.temp-path{fill:none;stroke:#2f6386;stroke-width:4}.atemp-path{fill:none;stroke:#c65028;stroke-width:4;stroke-dasharray:10 5}.rmse-path{fill:none;stroke:#654887;stroke-width:3;stroke-dasharray:3 5}.selected-line{stroke:#172234;stroke-width:2}.selected-temp{fill:#fff;stroke:#2f6386;stroke-width:4}.selected-atemp{fill:#fff3eb;stroke:#c65028;stroke-width:4}.ols-bar{fill:#2f6386}.ols-bar.atemp{fill:#fff3eb;stroke:#c65028;stroke-width:3}.ols-label{fill:#172234;font-size:15px;font-weight:800;text-anchor:middle}.axis-label{fill:#435064;font-size:12px;text-anchor:middle}.legend{display:flex;flex-wrap:wrap;gap:1rem;font-size:.9rem;font-weight:750}.legend span{display:flex;align-items:center;gap:.45rem}.legend-line{display:inline-block;width:2rem;border-top:4px solid #2f6386}.legend-line.atemp{border-top-color:#c65028;border-top-style:dashed}.legend-line.rmse{border-top-color:#654887;border-top-width:3px;border-top-style:dotted}.linear-interaction-scene__readout{display:grid;gap:.5rem;padding:1rem;border-left:5px solid #c65028;border-radius:.45rem;background:#f7f9fc}.linear-interaction-scene__details{padding:.8rem;border:1px solid #d9dee8;border-radius:.45rem}.linear-interaction-scene__details summary{cursor:pointer;font-weight:850}.table-wrap{max-width:100%;overflow:auto;margin-top:.75rem}.linear-interaction-scene__table{width:100%;border-collapse:collapse}.linear-interaction-scene__table th,.linear-interaction-scene__table td{padding:.55rem;border:1px solid #d9dee8;text-align:left;white-space:nowrap}@media(max-width:850px){.linear-interaction-scene__controls,.scene-grid{grid-template-columns:minmax(0,1fr)}.linear-interaction-scene__chart{min-height:190px}}@media(prefers-reduced-motion:no-preference){.temp-path,.atemp-path,.rmse-path,.selected-line,.selected-temp,.selected-atemp{transition:all .2s ease}}
</style>
