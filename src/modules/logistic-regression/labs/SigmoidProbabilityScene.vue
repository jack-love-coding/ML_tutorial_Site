<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AppLocale } from '../../../types/ml.ts'
import type { LogisticPublishedInteractionAsset } from '../types.ts'
import { buildSigmoidProbabilitySceneModel, sceneNumber } from './sceneModels.ts'

const props = defineProps<{ asset: LogisticPublishedInteractionAsset; locale: AppLocale }>()
const logit = ref(0); const lastValid = ref(0); const representation = ref<'probability' | 'odds'>('probability'); const detailsOpen = ref(false)
const model = computed(() => buildSigmoidProbabilitySceneModel(props.asset as LogisticPublishedInteractionAsset & { sceneId: 'sigmoid-probability' }, Number(logit.value), lastValid.value, representation.value))
const copy = computed(() => props.locale === 'zh-CN' ? { title:'把分数压缩为概率', input:'logit z', probability:'概率', odds:'赔率', details:'展开数值明细', reset:'重置', table:'概率与赔率表', read:'曲线和表格同时保留；0 是概率 0.5 与默认阈值的桥梁。', invalid:'输入超出范围，已保留上一次有效值。' } : { title:'Compress a score into probability', input:'logit z', probability:'Probability', odds:'Odds', details:'Show numeric detail', reset:'Reset', table:'Probability and odds table', read:'The curve and table remain together; zero is the bridge from probability 0.5 to the default threshold.', invalid:'The input was out of range; the last valid value remains.' })
function update() { if (model.value.inputValid) lastValid.value = model.value.lastValid; else logit.value = model.value.lastValid }
function reset() { logit.value=0; lastValid.value=0; representation.value='probability'; detailsOpen.value=false }
function onKey(event: KeyboardEvent) { if (event.key === 'ArrowLeft') logit.value=Math.max(-20, Number(logit.value)-.1); if (event.key === 'ArrowRight') logit.value=Math.min(20, Number(logit.value)+.1); if (event.key === 'r') reset(); update() }
</script>

<template>
  <section class="logistic-scene" tabindex="0" :aria-label="copy.title" @keydown="onKey">
    <header><p>σ(z) = 1 / (1 + e⁻ᶻ)</p><h4>{{ copy.title }}</h4><p class="logistic-scene__read">{{ copy.read }}</p></header>
    <div class="logistic-scene__controls" role="group" :aria-label="copy.title"><label>{{ copy.input }} <input v-model.number="logit" type="range" min="-20" max="20" step="0.1" @change="update" /></label><output aria-live="polite">{{ sceneNumber(model.logit, 1) }}</output><fieldset><legend>{{ copy.title }}</legend><label><input v-model="representation" type="radio" value="probability" /> {{ copy.probability }}</label><label><input v-model="representation" type="radio" value="odds" /> {{ copy.odds }}</label></fieldset><button type="button" @click="reset">{{ copy.reset }}</button></div>
    <p v-if="!model.inputValid" class="logistic-scene__warning" role="status">{{ copy.invalid }}</p>
    <svg class="logistic-scene__svg" viewBox="0 0 300 170" role="img" :aria-label="`${copy.title}: z ${model.logit}`"><title>{{ copy.title }}</title><path :d="`M ${model.curve.map(point => `${point.x} ${point.y}`).join(' L ')}`" class="curve" fill="none" /><line x1="18" y1="150" x2="282" y2="150" class="axis"/><line x1="150" y1="18" x2="150" y2="150" class="axis dashed"/><circle :cx="model.point.x" :cy="model.point.y" r="6" class="current"/><text :x="model.point.x" :y="model.point.y - 10" text-anchor="middle">σ(z)={{ sceneNumber(model.terms.probability,3) }}</text><text x="150" y="165" text-anchor="middle">z = 0 → p = 0.5 → class {{ model.terms.defaultClass }}</text></svg>
    <button type="button" :aria-expanded="detailsOpen" @click="detailsOpen=!detailsOpen">{{ copy.details }}</button>
    <table class="logistic-scene__table"><caption>{{ copy.table }}</caption><thead><tr><th scope="col">Term</th><th scope="col">Value</th></tr></thead><tbody><tr v-for="item in model.table" :key="item.label"><th scope="row">{{ item.label }}</th><td>{{ item.value }}</td></tr></tbody></table>
  </section>
</template>

<style scoped>
@import './scene.css'; .curve { stroke:#2563eb; stroke-width:3 }.current { fill:#b45309; stroke:#172033; stroke-width:2 }.axis { stroke:#475569; stroke-width:1.5 }.dashed { stroke-dasharray:4 3 }.logistic-scene__svg text { fill:#172033; font-size:9px }.logistic-scene__warning { padding:.6rem; border-left:4px solid #b45309; background:#fff7ed }
</style>
