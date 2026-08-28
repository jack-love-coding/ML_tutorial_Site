<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AppLocale } from '../../../types/ml.ts'
import type { LogisticPublishedInteractionAsset } from '../types.ts'
import { buildLinearScoreSceneModel, sceneNumber } from './sceneModels.ts'

const props = defineProps<{ asset: LogisticPublishedInteractionAsset; locale: AppLocale }>()
const row = ref('canonical')
const model = computed(() => buildLinearScoreSceneModel(props.asset as LogisticPublishedInteractionAsset & { sceneId: 'linear-score' }, row.value))
const copy = computed(() => props.locale === 'zh-CN' ? {
  title: '一行数据如何累加成线性分数', row: '比较样本', table: '分数累加表', read: '每一根竖线同时写明正负方向；最终分数来自特征贡献和截距的相加。', reset: '重置', target: '真实类别', predicted: '默认类别',
} : {
  title: 'How one row accumulates into a linear score', row: 'Comparison row', table: 'Score accumulation table', read: 'Each vertical mark labels its sign; the final score adds feature contributions and the intercept.', reset: 'Reset', target: 'Target class', predicted: 'Default class',
})
const options = computed(() => props.asset.controls[0]?.options ?? [])
function reset() { row.value = 'canonical' }
function onKey(event: KeyboardEvent) { if (event.key === 'r') reset() }
</script>

<template>
  <section class="logistic-scene" tabindex="0" :aria-label="copy.title" @keydown="onKey">
    <header><p>z = Σwᵢxᵢ + b</p><h4>{{ copy.title }}</h4><p class="logistic-scene__read">{{ copy.read }}</p></header>
    <div class="logistic-scene__controls" role="group" :aria-label="copy.row">
      <label>{{ copy.row }}
        <select v-model="row" :aria-label="copy.row">
          <option v-for="option in options" :key="String(option.value)" :value="String(option.value)">{{ option.label[props.locale] }}</option>
        </select>
      </label>
      <button type="button" @click="reset">{{ copy.reset }}</button>
    </div>
    <svg class="logistic-scene__svg" viewBox="0 0 320 205" role="img" :aria-label="`${copy.title}: ${model.rowName}`">
      <title>{{ copy.title }}</title><line x1="20" y1="166" x2="300" y2="166" class="axis" />
      <g v-for="term in model.terms" :key="term.label"><line :x1="term.x" y1="166" :x2="term.x" :y2="term.y" :class="term.value >= 0 ? 'positive' : 'negative'" /><circle :cx="term.x" :cy="term.y" r="4" :class="term.value >= 0 ? 'positive-fill' : 'negative-fill'" /><text :x="term.x" y="185" text-anchor="middle">{{ term.label.slice(0, 4) }}</text><text :x="term.x" :y="term.y - 8" text-anchor="middle">{{ term.value >= 0 ? '+' : '−' }}</text></g>
      <line x1="276" y1="166" x2="276" :y2="model.intercept >= 0 ? 110 : 190" class="intercept" stroke-dasharray="4 3" /><text x="276" y="24" text-anchor="middle">z = {{ sceneNumber(model.total, 3) }}</text>
    </svg>
    <p class="logistic-scene__result"><strong>{{ copy.target }}: class {{ model.target }}</strong> · {{ copy.predicted }}: class {{ model.defaultClass }} · σ(z) = {{ sceneNumber(model.probability, 8) }}</p>
    <table class="logistic-scene__table"><caption>{{ copy.table }}</caption><thead><tr><th scope="col">Term</th><th scope="col">Value</th></tr></thead><tbody><tr v-for="item in model.table" :key="item.label"><th scope="row">{{ item.label }}</th><td>{{ item.value }}</td></tr></tbody></table>
  </section>
</template>

<style scoped>
.logistic-scene { display:grid; gap:.9rem; min-width:0; padding:1rem; border:1px solid var(--color-border, #cbd5e1); border-radius:1rem; background:var(--color-surface, #fff); color:var(--color-text, #172033) }
.logistic-scene h4,.logistic-scene p { margin:.2rem 0 }.logistic-scene__read { color:var(--color-muted, #526277) }.logistic-scene__controls { display:flex; flex-wrap:wrap; gap:.75rem; align-items:end }.logistic-scene label { display:grid; gap:.3rem; font-weight:700 }.logistic-scene select,.logistic-scene button { min-height:2.5rem; padding:.4rem .65rem; border:1px solid #718096; border-radius:.5rem; background:#fff; color:inherit }.logistic-scene button:focus-visible,.logistic-scene select:focus-visible { outline:3px solid #f59e0b; outline-offset:2px }.logistic-scene__svg { width:100%; max-width:520px; height:auto; background:#f8fafc; border-radius:.7rem }.axis { stroke:#475569; stroke-width:2 }.positive { stroke:#0f766e; stroke-width:5 }.negative { stroke:#b45309; stroke-width:5; stroke-dasharray:5 2 }.positive-fill { fill:#0f766e }.negative-fill { fill:#b45309 }.intercept { stroke:#475569; stroke-width:3 }.logistic-scene__svg text { fill:#172033; font-size:10px }.logistic-scene__result { padding:.75rem; background:#eff6ff; border-left:4px solid #2563eb }.logistic-scene__table { width:100%; border-collapse:collapse; font-size:.9rem }.logistic-scene__table caption { text-align:left; font-weight:700; margin:.5rem 0 }.logistic-scene__table th,.logistic-scene__table td { border:1px solid #cbd5e1; padding:.45rem; text-align:left; overflow-wrap:anywhere } @media (max-width:390px) { .logistic-scene { padding:.75rem }.logistic-scene__controls { display:grid }.logistic-scene select,.logistic-scene button { width:100% } }
</style>
