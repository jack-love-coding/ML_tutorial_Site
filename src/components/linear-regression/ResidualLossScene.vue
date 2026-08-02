<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ResidualLossInteractionAsset } from '../../types/linearRegressionInteraction'
import { clampFinite, fitUnivariateFromStatistics } from '../../simulations/linearRegressionInteraction'
import { scaleLinear } from '../../utils/linearRegressionSvg'

const props = defineProps<{ asset: ResidualLossInteractionAsset }>()
const { locale } = useI18n()
const width = 760
const height = 410
const margin = { top: 34, right: 34, bottom: 56, left: 62 }
const metric = ref<'mse' | 'mae'>('mse')
const sampleIndex = ref(0)
const teachingPoint = ref({
  x: props.asset.domain.x[0] + (props.asset.domain.x[1] - props.asset.domain.x[0]) * 0.8,
  y: props.asset.domain.y[0] + (props.asset.domain.y[1] - props.asset.domain.y[0]) * 0.85,
})
const dragging = ref(false)

const copy = computed(() => locale.value === 'zh-CN'
  ? {
      title:'残差、异常点与损失函数', metric:'损失观察方式', sample:'真实样本', mse:'平方误差 MSE', mae:'绝对误差 MAE',
      baseline:'原始拟合（虚线）', refit:'加入教学样本后（实线）', real:'真实 Bike 样本（圆点）', selected:'选中真实样本（方形）',
      teaching:'教学新增样本（可拖动菱形）', keyboard:'使用方向键移动教学样本；按住 Shift 可增大步幅。',
      xAxis:'标准化温度 temp', yAxis:'每小时租赁量 cnt', residual:'选中真实样本残差', contribution:'教学样本损失贡献',
      modelMse:'重拟合后全训练集 MSE', slope:'重拟合斜率', change:'相对原模型变化', reset:'重置教学样本', fallback:'数值与文字对照',
      over:'预测偏高', under:'预测偏低', exact:'直线与 MSE 使用全训练集充分统计量精确重算。',
    }
  : {
      title:'Residuals, outliers, and loss', metric:'Loss view', sample:'Real sample', mse:'Squared error (MSE)', mae:'Absolute error (MAE)',
      baseline:'Original fit (dashed)', refit:'Refit with teaching point (solid)', real:'Real Bike samples (circles)', selected:'Selected real sample (square)',
      teaching:'Added teaching sample (draggable diamond)', keyboard:'Use arrow keys to move the teaching point; hold Shift for a larger step.',
      xAxis:'Normalized temperature (temp)', yAxis:'Hourly rentals (cnt)', residual:'Selected real-sample residual', contribution:'Teaching-point loss contribution',
      modelMse:'Full-training MSE after refit', slope:'Refitted slope', change:'Change from original model', reset:'Reset teaching point', fallback:'Numeric and text fallback',
      over:'overprediction', under:'underprediction', exact:'The line and MSE are recomputed exactly from full-training sufficient statistics.',
    })

const xDomain = computed(() => ({ minimum: props.asset.domain.x[0], maximum: props.asset.domain.x[1] }))
const yDomain = computed(() => ({ minimum: props.asset.domain.y[0], maximum: props.asset.domain.y[1] }))
const x = (value:number) => scaleLinear(value,xDomain.value,{minimum:margin.left,maximum:width-margin.right})
const y = (value:number) => scaleLinear(value,yDomain.value,{minimum:height-margin.bottom,maximum:margin.top})
const selectableSamples = computed(() => {
  const limit = 24
  const step = Math.max(1, Math.ceil(props.asset.points.length / limit))
  const samples = props.asset.points
    .map((point, index) => ({ point, index }))
    .filter(({ index }) => index % step === 0)
  const lastIndex = props.asset.points.length - 1
  if (lastIndex >= 0 && samples.at(-1)?.index !== lastIndex) {
    samples.push({ point: props.asset.points[lastIndex], index: lastIndex })
  }
  return samples
})
const selected = computed(() => props.asset.points[Math.min(Math.max(sampleIndex.value,0),Math.max(props.asset.points.length-1,0))])
const fit = computed(() => fitUnivariateFromStatistics(props.asset.statistics,teachingPoint.value))
const baselinePredict = (value:number) => props.asset.baseline.intercept + props.asset.baseline.slope*value
const currentPredict = (value:number) => fit.value.intercept + fit.value.slope*value
const selectedPrediction = computed(() => selected.value ? currentPredict(selected.value.x) : 0)
const selectedResidual = computed(() => selected.value ? selectedPrediction.value-selected.value.y : 0)
const teachingPrediction = computed(() => currentPredict(teachingPoint.value.x))
const teachingResidual = computed(() => teachingPrediction.value-teachingPoint.value.y)
const contribution = computed(() => metric.value==='mse' ? teachingResidual.value**2 : Math.abs(teachingResidual.value))
const slopeDelta = computed(() => fit.value.slope-props.asset.baseline.slope)
const mseDelta = computed(() => fit.value.mse-props.asset.baseline.mse)
const lineEnds = computed(() => {const [left,right]=props.asset.domain.x;return{x1:x(left),y1:y(currentPredict(left)),x2:x(right),y2:y(currentPredict(right))}})
const baselineEnds = computed(() => {const [left,right]=props.asset.domain.x;return{x1:x(left),y1:y(baselinePredict(left)),x2:x(right),y2:y(baselinePredict(right))}})
const teachingSvg = computed(() => ({ x:x(teachingPoint.value.x), y:y(teachingPoint.value.y) }))
const xTicks = computed(() => Array.from({length:5},(_,i)=>props.asset.domain.x[0]+i*(props.asset.domain.x[1]-props.asset.domain.x[0])/4))
const yTicks = computed(() => Array.from({length:5},(_,i)=>props.asset.domain.y[0]+i*(props.asset.domain.y[1]-props.asset.domain.y[0])/4))

function format(value:number,digits=2){return Number.isFinite(value)?value.toFixed(digits):'—'}
function clampPoint(point:{x:number;y:number}){return{x:clampFinite(point.x,props.asset.domain.x[0],props.asset.domain.x[1],teachingPoint.value.x),y:clampFinite(point.y,props.asset.domain.y[0],props.asset.domain.y[1],teachingPoint.value.y)}}
function reset(){teachingPoint.value={x:props.asset.domain.x[0]+(props.asset.domain.x[1]-props.asset.domain.x[0])*.8,y:props.asset.domain.y[0]+(props.asset.domain.y[1]-props.asset.domain.y[0])*.85}}
function eventPoint(event:PointerEvent){
  const svg=event.currentTarget as SVGSVGElement;const bounds=svg.getBoundingClientRect();
  const svgX=(event.clientX-bounds.left)*width/Math.max(bounds.width,1);const svgY=(event.clientY-bounds.top)*height/Math.max(bounds.height,1)
  return clampPoint({x:scaleLinear(svgX,{minimum:margin.left,maximum:width-margin.right},xDomain.value),y:scaleLinear(svgY,{minimum:height-margin.bottom,maximum:margin.top},yDomain.value)})
}
function startDrag(event:PointerEvent){dragging.value=true;(event.currentTarget as SVGElement).setPointerCapture?.(event.pointerId);teachingPoint.value=eventPointFromTarget(event)}
function eventPointFromTarget(event:PointerEvent){
  const target=event.currentTarget as SVGElement;const svg=target.ownerSVGElement; if(!svg)return teachingPoint.value
  const bounds=svg.getBoundingClientRect();const svgX=(event.clientX-bounds.left)*width/Math.max(bounds.width,1);const svgY=(event.clientY-bounds.top)*height/Math.max(bounds.height,1)
  return clampPoint({x:scaleLinear(svgX,{minimum:margin.left,maximum:width-margin.right},xDomain.value),y:scaleLinear(svgY,{minimum:height-margin.bottom,maximum:margin.top},yDomain.value)})
}
function drag(event:PointerEvent){if(dragging.value)teachingPoint.value=eventPoint(event)}
function stopDrag(event:PointerEvent){dragging.value=false;(event.currentTarget as SVGSVGElement).releasePointerCapture?.(event.pointerId)}
function moveWithKeyboard(event:KeyboardEvent){
  const xStep=(props.asset.domain.x[1]-props.asset.domain.x[0])*(event.shiftKey?.05:.01)
  const yStep=(props.asset.domain.y[1]-props.asset.domain.y[0])*(event.shiftKey?.05:.01)
  const delta:Record<string,[number,number]>={ArrowLeft:[-xStep,0],ArrowRight:[xStep,0],ArrowUp:[0,yStep],ArrowDown:[0,-yStep]}
  const next=delta[event.key];if(!next)return;event.preventDefault();teachingPoint.value=clampPoint({x:teachingPoint.value.x+next[0],y:teachingPoint.value.y+next[1]})
}
</script>

<template>
  <section class="linear-interaction-scene" data-scene-id="residual-loss">
    <div class="linear-interaction-scene__controls" :aria-label="copy.title">
      <label><span>{{ copy.metric }}</span><select v-model="metric" :aria-label="copy.metric"><option value="mse">{{ copy.mse }}</option><option value="mae">{{ copy.mae }}</option></select></label>
      <label><span>{{ copy.sample }}</span><select v-model.number="sampleIndex" :aria-label="copy.sample"><option v-for="sample in selectableSamples" :key="sample.point.instant ?? sample.index" :value="sample.index">{{ sample.point.instant ? `instant ${sample.point.instant}` : `${copy.sample} ${sample.index+1}` }} · temp {{ format(sample.point.x) }} · cnt {{ format(sample.point.y,0) }}</option></select></label>
    </div>
    <figure class="linear-interaction-scene__figure">
      <figcaption><strong>{{ copy.title }}</strong><span>{{ copy.keyboard }} {{ copy.exact }}</span></figcaption>
      <svg :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="`${copy.title}. ${copy.teaching}`" @pointermove="drag" @pointerup="stopDrag" @pointercancel="stopDrag">
        <g class="grid"><line v-for="tick in yTicks" :key="`y-${tick}`" :x1="margin.left" :x2="width-margin.right" :y1="y(tick)" :y2="y(tick)"/><line v-for="tick in xTicks" :key="`x-${tick}`" :x1="x(tick)" :x2="x(tick)" :y1="margin.top" :y2="height-margin.bottom"/></g>
        <g class="axis-labels"><text v-for="tick in xTicks" :key="`xl-${tick}`" :x="x(tick)" :y="height-28">{{ format(tick,1) }}</text><text v-for="tick in yTicks" :key="`yl-${tick}`" :x="margin.left-10" :y="y(tick)+4" text-anchor="end">{{ format(tick,0) }}</text><text :x="width/2" :y="height-6">{{ copy.xAxis }}</text><text x="18" :y="height/2" :transform="`rotate(-90 18 ${height/2})`">{{ copy.yAxis }}</text></g>
        <circle v-for="(point,index) in asset.points" :key="point.instant ?? index" class="sample" :cx="x(point.x)" :cy="y(point.y)" r="4"/>
        <line class="baseline" v-bind="baselineEnds"/><line class="current" v-bind="lineEnds"/>
        <template v-if="selected"><line class="residual" :x1="x(selected.x)" :x2="x(selected.x)" :y1="y(selected.y)" :y2="y(selectedPrediction)"/><rect class="selected" :x="x(selected.x)-6" :y="y(selected.y)-6" width="12" height="12"/></template>
        <line class="teaching-residual" :x1="teachingSvg.x" :x2="teachingSvg.x" :y1="teachingSvg.y" :y2="y(teachingPrediction)"/>
        <g class="teaching" role="slider" tabindex="0" :aria-label="`${copy.teaching}. temp ${format(teachingPoint.x)}, cnt ${format(teachingPoint.y,0)}`" :aria-valuemin="asset.domain.y[0]" :aria-valuemax="asset.domain.y[1]" :aria-valuenow="teachingPoint.y" :aria-valuetext="`temp ${format(teachingPoint.x)}, cnt ${format(teachingPoint.y,0)}`" @pointerdown.stop="startDrag" @keydown="moveWithKeyboard">
          <rect :x="teachingSvg.x-9" :y="teachingSvg.y-9" width="18" height="18" :transform="`rotate(45 ${teachingSvg.x} ${teachingSvg.y})`"/><text :x="teachingSvg.x+15" :y="teachingSvg.y-12">{{ locale==='zh-CN'?'教学新增':'teaching' }}</text>
        </g>
      </svg>
    </figure>
    <div class="linear-interaction-scene__readout" aria-live="polite">
      <p><span>{{ copy.residual }}</span><strong>{{ format(selectedResidual,1) }} · {{ selectedResidual>=0?copy.over:copy.under }}</strong></p>
      <p><span>{{ copy.contribution }}</span><strong>{{ metric==='mse'?'r²':'|r|' }} = {{ format(contribution,1) }}</strong></p>
      <p><span>{{ copy.modelMse }}</span><strong>{{ format(fit.mse,2) }} · Δ {{ format(mseDelta,2) }}</strong></p>
      <p><span>{{ copy.slope }}</span><strong>{{ format(fit.slope,3) }} · Δ {{ slopeDelta>=0?'+':'' }}{{ format(slopeDelta,3) }}</strong></p>
      <button type="button" @click="reset">{{ copy.reset }}</button>
    </div>
    <details><summary>{{ copy.fallback }}</summary><table><tbody><tr><th>{{ copy.teaching }}</th><td>temp {{ format(teachingPoint.x) }} · cnt {{ format(teachingPoint.y,0) }}</td></tr><tr><th>{{ copy.contribution }}</th><td>{{ format(contribution,2) }}</td></tr><tr><th>{{ copy.residual }}</th><td>{{ format(selectedResidual,2) }}</td></tr><tr><th>{{ copy.modelMse }}</th><td>{{ format(fit.mse,3) }} (Δ {{ format(mseDelta,3) }})</td></tr><tr><th>{{ copy.slope }}</th><td>{{ format(fit.slope,3) }} (Δ {{ format(slopeDelta,3) }})</td></tr></tbody></table></details>
  </section>
</template>

<style scoped>
.linear-interaction-scene{display:grid;gap:16px;min-width:0}.linear-interaction-scene__controls{display:grid;grid-template-columns:minmax(0,.7fr) minmax(0,1.3fr);gap:12px}.linear-interaction-scene__controls label{display:grid;gap:7px;padding:12px;border:1px solid rgba(15,23,40,.1);border-radius:8px;background:#f7f9fc}.linear-interaction-scene__controls span{color:var(--muted);font-size:.78rem;font-weight:800}.linear-interaction-scene__controls select{min-height:42px;padding:7px;border:1px solid rgba(15,23,40,.16);border-radius:6px;background:#fff}.linear-interaction-scene__figure{display:grid;gap:10px;margin:0;padding:12px;border:1px solid rgba(15,23,40,.09);border-radius:8px;background:#fbfcfe}.linear-interaction-scene__figure figcaption{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.linear-interaction-scene__figure figcaption span{max-width:62ch;color:var(--muted);font-size:.82rem}.linear-interaction-scene__figure svg{width:100%;height:auto;max-height:460px;touch-action:none}.grid line{stroke:#dce2ea}.axis-labels text{fill:#647085;font-size:12px;text-anchor:middle}.sample{fill:#fff;stroke:#2b6f9c;stroke-width:2;opacity:.75}.baseline{stroke:#657083;stroke-width:3;stroke-dasharray:10 7}.current{stroke:var(--linear-accent,#db6c3a);stroke-width:4}.residual,.teaching-residual{stroke:#a12a2a;stroke-width:3;stroke-dasharray:4 4}.teaching-residual{stroke:#101827;stroke-dasharray:2 5}.selected{fill:#fff;stroke:#a12a2a;stroke-width:3}.teaching{cursor:grab}.teaching:focus{outline:none}.teaching:focus rect{stroke-width:6}.teaching rect{fill:#ffe4a8;stroke:#101827;stroke-width:3}.teaching text{fill:#101827;font-size:12px;font-weight:900}.linear-interaction-scene__readout{display:flex;flex-wrap:wrap;gap:10px}.linear-interaction-scene__readout p{display:grid;gap:4px;flex:1 1 170px;margin:0;padding:12px;border-left:4px solid var(--linear-accent,#db6c3a);background:#f7f9fc}.linear-interaction-scene__readout span{color:var(--muted);font-size:.75rem;font-weight:800}.linear-interaction-scene__readout button{min-height:42px;padding:0 14px;border:1px solid rgba(15,23,40,.15);border-radius:7px;background:#fff;font-weight:800}details{padding:10px 12px;border:1px solid rgba(15,23,40,.09);border-radius:7px}summary{cursor:pointer;font-weight:800}table{width:100%;margin-top:10px;border-collapse:collapse}th,td{padding:7px;border-top:1px solid rgba(15,23,40,.08);text-align:left}td{text-align:right;font-family:monospace}@media(max-width:720px){.linear-interaction-scene__controls{grid-template-columns:1fr}.linear-interaction-scene__figure{overflow-x:auto}.linear-interaction-scene__figure figcaption{display:grid}.linear-interaction-scene__figure svg{min-width:580px}}
</style>
