<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { AppLocale } from '../../../types/ml.ts'
import type { LogisticPublishedInteractionAsset } from '../types.ts'
import { buildLikelihoodSceneModel, sceneNumber } from './sceneModels.ts'

const props = defineProps<{ asset: LogisticPublishedInteractionAsset; locale: AppLocale }>()
const rows = ref(1); const lastValid = ref(1); const detailsOpen = ref(false); const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
let timer: ReturnType<typeof setInterval> | undefined
const model = computed(() => buildLikelihoodSceneModel(props.asset as LogisticPublishedInteractionAsset & { sceneId: 'threshold-decisions' }, Number(rows.value), lastValid.value))
const copy = computed(() => props.locale === 'zh-CN' ? { title:'从 Bernoulli 项到对数似然', rows:'累计行数', play:'播放累加', pause:'暂停', step:'单步', reset:'重置', details:'展开数值明细', table:'似然累加表', read:'乘积会越来越小；对数把乘法转换为有限的加法。', motion:'已遵循减少动态效果偏好：请使用单步按钮。' } : { title:'From Bernoulli terms to log-likelihood', rows:'Rows accumulated', play:'Play accumulation', pause:'Pause', step:'Step', reset:'Reset', details:'Show numeric detail', table:'Likelihood accumulation table', read:'The product gets tiny; logarithms turn multiplication into finite addition.', motion:'Reduced motion is enabled: use Step instead.' })
function sync(){ if(model.value.inputValid) lastValid.value=model.value.lastValid; else rows.value=model.value.lastValid }
function step(){ rows.value=Math.min(4, Number(rows.value)+1); sync() }
function toggle(){ if(timer){clearInterval(timer);timer=undefined;return} if(reducedMotion)return; timer=setInterval(()=>{if(Number(rows.value)>=4){clearInterval(timer!);timer=undefined}else step()},800) }
function reset(){ if(timer)clearInterval(timer);timer=undefined;rows.value=1;lastValid.value=1;detailsOpen.value=false }
function onKey(event:KeyboardEvent){if(event.key==='ArrowRight'||event.key===' '){event.preventDefault();step()} if(event.key==='r')reset()}
onBeforeUnmount(()=>{if(timer)clearInterval(timer)})
</script>

<template>
  <section class="logistic-scene" tabindex="0" :aria-label="copy.title" @keydown="onKey"><header><p>L = Π pᵢʸⁱ(1−pᵢ)¹⁻ʸⁱ</p><h4>{{ copy.title }}</h4><p class="logistic-scene__read">{{ copy.read }}</p></header><p v-if="reducedMotion" class="logistic-scene__notice" role="status">{{ copy.motion }}</p><div class="logistic-scene__controls"><label>{{ copy.rows }}<input v-model.number="rows" type="range" min="1" max="4" step="1" @change="sync"/></label><output>{{ model.count }}</output><button type="button" :disabled="reducedMotion" @click="toggle">{{ timer ? copy.pause : copy.play }}</button><button type="button" @click="step">{{ copy.step }}</button><button type="button" @click="reset">{{ copy.reset }}</button></div><svg class="logistic-scene__svg" viewBox="0 0 340 170" role="img" :aria-label="copy.title"><title>{{ copy.title }}</title><line x1="25" y1="142" x2="315" y2="142" class="axis"/><g v-for="entry in model.steps" :key="entry.index"><circle :cx="45+entry.index*60" :cy="110-entry.probabilityTerm*70" r="7" :class="entry.label ? 'class-one':'class-zero'"/><text :x="45+entry.index*60" y="158" text-anchor="middle">row {{ entry.rowId }}</text><text :x="45+entry.index*60" :y="95-entry.probabilityTerm*70" text-anchor="middle">p={{ sceneNumber(entry.probabilityTerm,3) }}</text></g><text x="25" y="22">Σ log p = {{ sceneNumber(model.logLikelihood,5) }}</text><text x="25" y="40">mean BCE = {{ sceneNumber(model.meanBce,5) }}</text></svg><button type="button" :aria-expanded="detailsOpen" @click="detailsOpen=!detailsOpen">{{ copy.details }}</button><table class="logistic-scene__table"><caption>{{ copy.table }}</caption><thead><tr><th>Row</th><th>p(yᵢ)</th><th>log term</th><th>cumulative log L</th></tr></thead><tbody><tr v-for="entry in model.steps" :key="entry.index"><th scope="row">{{ entry.rowId }} ({{ entry.split }})</th><td>{{ sceneNumber(entry.probabilityTerm,8) }}</td><td>{{ sceneNumber(entry.logTerm,8) }}</td><td>{{ sceneNumber(entry.cumulativeLogLikelihood,8) }}</td></tr></tbody></table></section>
</template>

<style scoped>
@import './scene.css'; .axis{stroke:#475569;stroke-width:2}.class-one{fill:#0f766e;stroke:#172033;stroke-width:2}.class-zero{fill:#b45309;stroke:#172033;stroke-width:2}.logistic-scene__svg text{font-size:9px;fill:#172033}.logistic-scene__notice{padding:.6rem;background:#eff6ff;border-left:4px solid #2563eb}
</style>
