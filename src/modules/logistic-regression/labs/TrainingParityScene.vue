<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { AppLocale } from '../../../types/ml.ts'
import type { LogisticPublishedInteractionAsset } from '../types.ts'
import { buildTrainingParitySceneModel, sceneNumber } from './sceneModels.ts'

const props = defineProps<{ asset: LogisticPublishedInteractionAsset; locale: AppLocale }>()
const mode = ref<'scratch'|'sklearn'|'l2'>('scratch'); const traceIndex=ref(0); const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
let timer: ReturnType<typeof setInterval> | undefined
const model = computed(()=>buildTrainingParitySceneModel(props.asset as LogisticPublishedInteractionAsset & {sceneId:'regularization'},mode.value,mode.value,traceIndex.value))
const copy=computed(()=>props.locale==='zh-CN'?{title:'训练轨迹、库对照与 L2',mode:'对照模式',play:'播放轨迹',pause:'暂停',step:'单步',reset:'重置',details:'展开数值明细',table:'已发布的训练结果',read:'Scratch 与 sklearn 首先在相同目标下对齐；L2 是不同目标，不能当作同一次拟合。',motion:'已遵循减少动态效果偏好：请使用单步。',replay:'浏览器仅回放固定轨迹，不重新训练模型。'}:{title:'Training trace, library parity, and L2',mode:'Comparison mode',play:'Play trace',pause:'Pause',step:'Step',reset:'Reset',details:'Show numeric detail',table:'Published training result',read:'Scratch and sklearn align on the same objective first; L2 changes the objective and is not the same fit.',motion:'Reduced motion is enabled: use Step.',replay:'The browser replays a frozen trace and never refits a model.'})
function step(){ if(mode.value==='scratch')traceIndex.value=Math.min(Math.max(0,model.value.traceLength-1),traceIndex.value+1) }
function toggle(){if(timer){clearInterval(timer);timer=undefined;return}if(reducedMotion||mode.value!=='scratch')return;timer=setInterval(()=>{if(traceIndex.value>=model.value.traceLength-1){clearInterval(timer!);timer=undefined}else step()},500)}
function stop(){if(timer)clearInterval(timer);timer=undefined}
function reset(){stop();mode.value='scratch';traceIndex.value=0}
function changeMode(){stop();traceIndex.value=0}
function onKey(event:KeyboardEvent){if(event.key==='ArrowRight'||event.key===' '){event.preventDefault();step()}if(event.key==='r')reset()}
onBeforeUnmount(()=>{if(timer)clearInterval(timer)})
</script>

<template>
  <section class="logistic-scene" tabindex="0" :aria-label="copy.title" @keydown="onKey"><header><p>objective → gradient → accepted step</p><h4>{{ copy.title }}</h4><p class="logistic-scene__read">{{ copy.read }}</p></header><p v-if="reducedMotion" class="logistic-scene__notice" role="status">{{ copy.motion }}</p><div class="logistic-scene__controls" role="group" :aria-label="copy.mode"><fieldset><legend>{{ copy.mode }}</legend><label v-for="option in props.asset.controls[0]?.options ?? []" :key="String(option.value)"><input v-model="mode" type="radio" :value="option.value" @change="changeMode"/>{{ option.label[props.locale] }}</label></fieldset><button type="button" :disabled="reducedMotion||mode!=='scratch'" @click="toggle">{{ timer?copy.pause:copy.play }}</button><button type="button" :disabled="mode!=='scratch'" @click="step">{{ copy.step }}</button><button type="button" @click="reset">{{ copy.reset }}</button></div><p class="logistic-scene__notice">{{ copy.replay }}</p><svg class="logistic-scene__svg" viewBox="0 0 360 175" role="img" :aria-label="model.title"><title>{{ model.title }}</title><line x1="24" y1="148" x2="335" y2="148" class="axis"/><path v-if="mode==='scratch'" :d="`M ${Array.from({length:Math.max(1,traceIndex+1)},(_,index)=>{const trace=(props.asset.data as any).scratch.trace[index]??{};return `${30+index/Math.max(1,model.traceLength-1)*290} ${142-Math.min(115,Number(trace.objective??0)*150)}`}).join(' L ')}`" class="trace" fill="none"/><text x="24" y="22">{{ model.title }}</text><text x="24" y="42">objective = {{ sceneNumber(model.objective,8) }}</text><text x="24" y="62">state {{ traceIndex + 1 }} / {{ Math.max(1,model.traceLength) }}</text></svg><table class="logistic-scene__table"><caption>{{ copy.table }}</caption><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr v-for="item in model.table" :key="item.label"><th scope="row">{{ item.label }}</th><td>{{ item.value }}</td></tr></tbody></table></section>
</template>

<style scoped>
@import './scene.css'; .axis{stroke:#475569;stroke-width:2}.trace{stroke:#0f766e;stroke-width:3}.logistic-scene__svg text{fill:#172033;font-size:10px}.logistic-scene__notice{padding:.6rem;background:#eff6ff;border-left:4px solid #2563eb}.logistic-scene fieldset{display:flex;gap:.45rem;flex-wrap:wrap;border:1px solid #94a3b8;border-radius:.5rem}.logistic-scene fieldset label{display:flex;font-weight:400}
</style>
