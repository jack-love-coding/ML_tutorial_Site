<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TrainingMotionInteractionAsset } from '../../types/linearRegressionInteraction'
import { paddedDomain, svgPolyline } from '../../utils/linearRegressionSvg'

const props = defineProps<{ asset: TrainingMotionInteractionAsset }>()
const { locale } = useI18n()
const width = 760
const height = 460
const learningRate = ref(props.asset.traces[0]?.learningRate ?? 0)
const stepIndex = ref(0)
const playing = ref(false)
const reducedMotion = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const copy = computed(() => locale.value === 'zh-CN'
  ? { title:'梯度下降训练轨迹', rate:'学习率 η', step:'更新步数', play:'播放', pause:'暂停', next:'单步', reset:'回到起点', parameters:'参数路径：weightTemp × intercept', loss:'MSE 轨迹（实线）与梯度范数（虚线）', mse:'MSE', gradient:'梯度范数', weight:'温度权重', intercept:'截距', update:'更新', status:'训练状态', converged:'已收敛', maximum:'达到最大步数', diverged:'发散', motion:'系统开启了减少动态效果；请使用单步按钮观察训练。', fallback:'轨迹数据表', cue:'圆点是当前更新；实线表示 MSE，虚线和方形表示梯度范数。' }
  : { title:'Gradient-descent training trajectory', rate:'Learning rate η', step:'Update', play:'Play', pause:'Pause', next:'Step', reset:'Return to start', parameters:'Parameter path: weightTemp × intercept', loss:'MSE path (solid) and gradient norm (dashed)', mse:'MSE', gradient:'Gradient norm', weight:'Temperature weight', intercept:'Intercept', update:'Update', status:'Training status', converged:'converged', maximum:'maximum updates reached', diverged:'diverged', motion:'Reduced motion is enabled; use the step button to inspect training.', fallback:'Trajectory data table', cue:'The circle marks the current update; the solid line is MSE, while the dashed line and square show gradient norm.' })

const trace = computed(() => props.asset.traces.find(item => item.learningRate===learningRate.value) ?? props.asset.traces[0])
const points = computed(() => trace.value?.points ?? [])
const current = computed(() => points.value[Math.min(stepIndex.value,Math.max(points.value.length-1,0))])
const maxIndex = computed(() => Math.max(points.value.length-1,0))
const visiblePoints = computed(() => points.value.slice(0,stepIndex.value+1))
const parameterXDomain = computed(() => paddedDomain(points.value.map(point=>point.weightTemp),{minimum:-1,maximum:1}))
const parameterYDomain = computed(() => paddedDomain(points.value.map(point=>point.intercept),{minimum:-1,maximum:1}))
const parameterPath = computed(() => svgPolyline(visiblePoints.value.map(point=>({x:point.weightTemp,y:point.intercept})),parameterXDomain.value,parameterYDomain.value,width/2-20,190,30))
const updateDomain = computed(() => ({minimum:points.value[0]?.update ?? 0,maximum:points.value.at(-1)?.update ?? 1}))
const mseDomain = computed(() => paddedDomain(points.value.map(point=>point.mse),{minimum:0,maximum:1}))
const gradientDomain = computed(() => paddedDomain(points.value.map(point=>point.gradientNorm),{minimum:0,maximum:1}))
const msePath = computed(() => svgPolyline(visiblePoints.value.map(point=>({x:point.update,y:point.mse})),updateDomain.value,mseDomain.value,width-40,190,30))
const gradientPath = computed(() => svgPolyline(visiblePoints.value.map(point=>({x:point.update,y:point.gradientNorm})),updateDomain.value,gradientDomain.value,width-40,190,30))
const currentParameter = computed(() => {
  const item=current.value;if(!item)return{x:30,y:160}
  const pair=svgPolyline([{x:item.weightTemp,y:item.intercept}],parameterXDomain.value,parameterYDomain.value,width/2-20,190,30).split(',').map(Number)
  return{x:pair[0]??30,y:pair[1]??160}
})
const statusText = computed(() => trace.value?.status==='converged'?copy.value.converged:trace.value?.status==='diverged'?copy.value.diverged:copy.value.maximum)

function format(value:number|undefined,digits=4){return value!==undefined&&Number.isFinite(value)?value.toFixed(digits):'—'}
function stop(){playing.value=false;if(timer){clearInterval(timer);timer=undefined}}
function step(){stop();stepIndex.value=Math.min(stepIndex.value+1,maxIndex.value)}
function toggle(){
  if(playing.value){stop();return}
  if(reducedMotion.value)return
  if(stepIndex.value>=maxIndex.value)stepIndex.value=0
  playing.value=true
  timer=setInterval(()=>{if(stepIndex.value>=maxIndex.value){stop()}else{stepIndex.value+=1}},220)
}
function reset(){stop();stepIndex.value=0}
watch(learningRate,()=>{reset()})
onMounted(()=>{reducedMotion.value=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false})
onBeforeUnmount(stop)
</script>

<template>
  <section class="linear-interaction-scene" data-scene-id="training-motion">
    <div class="linear-interaction-scene__controls" :aria-label="copy.title">
      <label><span>{{ copy.rate }}</span><select v-model.number="learningRate" :aria-label="copy.rate"><option v-for="item in asset.traces" :key="item.learningRate" :value="item.learningRate">{{ item.learningRate }} · {{ item.status }}</option></select></label>
      <label><span>{{ copy.step }}</span><span class="range"><input v-model.number="stepIndex" type="range" min="0" :max="maxIndex" step="1" :aria-label="copy.step" @input="stop"><strong>{{ current?.update ?? 0 }}</strong></span></label>
      <div class="playback" role="group" :aria-label="copy.step"><button type="button" :disabled="reducedMotion" :aria-label="playing?copy.pause:copy.play" :aria-pressed="playing" @click="toggle">{{ playing?copy.pause:copy.play }}</button><button type="button" :disabled="stepIndex>=maxIndex" @click="step">{{ copy.next }}</button><button type="button" @click="reset">{{ copy.reset }}</button></div>
    </div>
    <p v-if="reducedMotion" class="motion-note" role="status">{{ copy.motion }}</p>
    <figure class="linear-interaction-scene__figure">
      <figcaption><strong>{{ copy.title }}</strong><span>{{ copy.cue }}</span></figcaption>
      <svg :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="`${copy.parameters}; ${copy.loss}`">
        <g transform="translate(16 46)">
          <text x="18" y="-14" class="heading">{{ copy.parameters }}</text><rect x="20" y="0" :width="width/2-60" height="190" class="panel"/>
          <polyline :points="parameterPath" class="parameter-path"/><circle :cx="currentParameter.x" :cy="currentParameter.y" r="8" class="current-dot"/>
          <text x="30" y="178" class="axis-label">{{ copy.weight }} →</text><text x="32" y="18" class="axis-label">↑ {{ copy.intercept }}</text>
        </g>
        <g transform="translate(16 260)">
          <text x="18" y="-14" class="heading">{{ copy.loss }}</text><rect x="20" y="0" :width="width-80" height="190" class="panel"/>
          <polyline :points="msePath" class="mse-path"/><polyline :points="gradientPath" class="gradient-path"/>
          <circle v-if="current" :cx="30+(current.update-updateDomain.minimum)/(updateDomain.maximum-updateDomain.minimum||1)*(width-100)" :cy="30+(mseDomain.maximum-current.mse)/(mseDomain.maximum-mseDomain.minimum||1)*130" r="7" class="mse-dot"/>
          <rect v-if="current" :x="25+(current.update-updateDomain.minimum)/(updateDomain.maximum-updateDomain.minimum||1)*(width-100)" :y="25+(gradientDomain.maximum-current.gradientNorm)/(gradientDomain.maximum-gradientDomain.minimum||1)*130" width="10" height="10" class="gradient-dot"/>
          <text x="30" y="178" class="axis-label">{{ copy.update }} →</text>
        </g>
      </svg>
    </figure>
    <div class="linear-interaction-scene__readout" aria-live="polite">
      <p><span>{{ copy.status }}</span><strong>{{ statusText }} · {{ copy.update }} {{ current?.update ?? '—' }}</strong></p><p><span>{{ copy.mse }}</span><strong>{{ format(current?.mse,6) }}</strong></p><p><span>{{ copy.gradient }}</span><strong>{{ current?.gradientNorm?.toExponential(3) ?? '—' }}</strong></p><p><span>{{ copy.weight }} / {{ copy.intercept }}</span><strong>{{ format(current?.weightTemp) }} / {{ format(current?.intercept) }}</strong></p>
    </div>
    <details><summary>{{ copy.fallback }}</summary><table><thead><tr><th>{{ copy.update }}</th><th>{{ copy.mse }}</th><th>{{ copy.gradient }}</th><th>{{ copy.weight }}</th><th>{{ copy.intercept }}</th></tr></thead><tbody><tr v-for="point in visiblePoints.slice(-8)" :key="point.update"><td>{{ point.update }}</td><td>{{ format(point.mse,6) }}</td><td>{{ point.gradientNorm.toExponential(3) }}</td><td>{{ format(point.weightTemp) }}</td><td>{{ format(point.intercept) }}</td></tr></tbody></table></details>
  </section>
</template>

<style scoped>
.linear-interaction-scene{display:grid;gap:16px;min-width:0}.linear-interaction-scene__controls{display:grid;grid-template-columns:minmax(0,.7fr) minmax(0,1fr) auto;gap:12px;align-items:stretch}.linear-interaction-scene__controls>label,.playback{display:grid;gap:7px;padding:12px;border:1px solid rgba(15,23,40,.1);border-radius:8px;background:#f7f9fc}.linear-interaction-scene__controls span{color:var(--muted);font-size:.78rem;font-weight:800}.linear-interaction-scene__controls select{min-height:42px;padding:7px;border:1px solid rgba(15,23,40,.16);border-radius:6px;background:#fff}.range{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center}.playback{grid-template-columns:repeat(3,auto);align-content:center}.playback button{min-height:40px;padding:0 10px;border:1px solid rgba(15,23,40,.15);border-radius:6px;background:#fff;font-weight:800}.playback button:disabled{opacity:.45}.motion-note{margin:0;padding:10px 12px;border-left:4px solid #8b6a24;background:#fff8df}.linear-interaction-scene__figure{display:grid;gap:10px;margin:0;padding:12px;border:1px solid rgba(15,23,40,.09);border-radius:8px;background:#fbfcfe}.linear-interaction-scene__figure figcaption{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.linear-interaction-scene__figure figcaption span{color:var(--muted);font-size:.82rem}.linear-interaction-scene__figure svg{width:100%;height:auto;max-height:520px}.heading{fill:#182130;font-size:14px;font-weight:800}.panel{fill:#fff;stroke:#d6dde6;stroke-width:2}.parameter-path,.mse-path{fill:none;stroke:var(--linear-accent,#db6c3a);stroke-width:4}.gradient-path{fill:none;stroke:#2b6f9c;stroke-width:3;stroke-dasharray:8 6}.current-dot,.mse-dot{fill:#fff;stroke:#101827;stroke-width:3}.gradient-dot{fill:#fff;stroke:#2b6f9c;stroke-width:3}.axis-label{fill:#647085;font-size:11px;font-weight:700}.linear-interaction-scene__readout{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.linear-interaction-scene__readout p{display:grid;gap:4px;margin:0;padding:12px;border-left:4px solid var(--linear-accent,#db6c3a);background:#f7f9fc}.linear-interaction-scene__readout span{color:var(--muted);font-size:.74rem;font-weight:800}.linear-interaction-scene__readout strong{overflow-wrap:anywhere;font-family:monospace}details{padding:10px 12px;border:1px solid rgba(15,23,40,.09);border-radius:7px}summary{cursor:pointer;font-weight:800}table{width:100%;margin-top:10px;border-collapse:collapse;font-size:.88rem}th,td{padding:6px;border-top:1px solid rgba(15,23,40,.08);text-align:right;font-family:monospace}@media(max-width:850px){.linear-interaction-scene__controls{grid-template-columns:1fr 1fr}.playback{grid-column:1/-1}.linear-interaction-scene__readout{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.linear-interaction-scene__controls,.linear-interaction-scene__readout{grid-template-columns:1fr}.playback{grid-column:auto}.linear-interaction-scene__figure{overflow-x:auto}.linear-interaction-scene__figure figcaption{display:grid}.linear-interaction-scene__figure svg{min-width:620px}details{overflow-x:auto}}
</style>
