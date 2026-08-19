<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AppLocale } from '../../../types/ml.ts'
import type { LogisticPublishedInteractionAsset } from '../types.ts'
import { buildLogLossGradientSceneModel, sceneNumber } from './sceneModels.ts'

const props = defineProps<{ asset: LogisticPublishedInteractionAsset; locale: AppLocale }>()
const selectedStep = ref(1e-6); const lastValid = ref(1e-6); const detailsOpen = ref(false)
const model = computed(() => buildLogLossGradientSceneModel(props.asset as LogisticPublishedInteractionAsset & { sceneId: 'log-loss' }, Number(selectedStep.value), lastValid.value))
const copy = computed(() => props.locale === 'zh-CN' ? { title:'从单行残差到批量梯度', step:'中心差分步长 h', details:'展开梯度明细', reset:'重置', table:'解析梯度与数值梯度', read:'柱形长度和表格同时对照解析梯度与中心差分；这里回放已发布的全批检查。', batch:'批量梯度是每一行 (p−y)x 的平均。', row:'单行贡献', finite:'有限差分检查' } : { title:'From one-row residual to batch gradient', step:'Centered-difference step h', details:'Show gradient details', reset:'Reset', table:'Analytic and numeric gradients', read:'Bar lengths and the table compare analytic and centered differences; this replays the published full-batch check.', batch:'The batch gradient averages each row contribution (p−y)x.', row:'One-row contribution', finite:'Finite-difference check' })
const options = computed(() => props.asset.controls[0]?.options ?? [])
function update(){ if(model.value.inputValid) lastValid.value=model.value.lastValid; else selectedStep.value=model.value.lastValid }
function reset(){ selectedStep.value=1e-6;lastValid.value=1e-6;detailsOpen.value=false }
function onKey(event:KeyboardEvent){ if(event.key==='r')reset(); if(event.key==='ArrowLeft'||event.key==='ArrowRight'){const values=options.value.map(option=>Number(option.value)).filter(Number.isFinite);const index=Math.max(0,values.indexOf(Number(selectedStep.value)));selectedStep.value=values[Math.min(values.length-1,Math.max(0,index+(event.key==='ArrowRight'?1:-1)))] ?? lastValid.value;update()} }
</script>

<template>
  <section class="logistic-scene" tabindex="0" :aria-label="copy.title" @keydown="onKey"><header><p>∂BCE/∂w = Xᵀ(p−y)/n</p><h4>{{ copy.title }}</h4><p class="logistic-scene__read">{{ copy.read }}</p></header><div class="logistic-scene__controls" role="group" :aria-label="copy.step"><label>{{ copy.step }}<select v-model.number="selectedStep" @change="update"><option v-for="option in options" :key="String(option.value)" :value="Number(option.value)">{{ option.label[props.locale] }}</option></select></label><button type="button" @click="reset">{{ copy.reset }}</button></div><p class="logistic-scene__result"><strong>{{ copy.row }}</strong>: (p−y)x → <code>{{ model.rowGradient.map(value=>sceneNumber(value,8)).join(', ') }}</code><br />{{ copy.batch }}</p><svg class="logistic-scene__svg" viewBox="0 0 360 205" role="img" :aria-label="copy.finite"><title>{{ copy.finite }}</title><line x1="25" y1="176" x2="340" y2="176" class="axis"/><g v-for="(item,index) in model.parameterRows" :key="item.label"><rect :x="32+index*62" :y="176-Math.min(130,Math.abs(item.analytic)*220)" width="18" :height="Math.min(130,Math.abs(item.analytic)*220)" class="analytic"/><rect :x="52+index*62" :y="176-Math.min(130,Math.abs(item.numeric)*220)" width="18" :height="Math.min(130,Math.abs(item.numeric)*220)" class="numeric"/><text :x="50+index*62" y="193" text-anchor="middle">{{ item.label.slice(0,4) }}</text><text :x="50+index*62" y="18" text-anchor="middle">Δ {{ sceneNumber(item.error,2) }}</text></g><text x="27" y="32">solid = analytic · striped = centered difference</text></svg><button type="button" :aria-expanded="detailsOpen" @click="detailsOpen=!detailsOpen">{{ copy.details }}</button><table class="logistic-scene__table"><caption>{{ copy.table }}</caption><thead><tr><th>Parameter</th><th>Analytic</th><th>Centered</th><th>Absolute error</th></tr></thead><tbody><tr v-for="item in model.parameterRows" :key="item.label"><th scope="row">{{ item.label }}</th><td>{{ sceneNumber(item.analytic,10) }}</td><td>{{ sceneNumber(item.numeric,10) }}</td><td>{{ sceneNumber(item.error,12) }}</td></tr></tbody></table></section>
</template>

<style scoped>
@import './scene.css'; .axis{stroke:#475569;stroke-width:2}.analytic{fill:#0f766e;stroke:#172033;stroke-width:1}.numeric{fill:#f59e0b;stroke:#172033;stroke-width:1;stroke-dasharray:3 2}.logistic-scene__svg text{font-size:8px;fill:#172033}.logistic-scene__result{padding:.75rem;background:#eff6ff;border-left:4px solid #2563eb;overflow-wrap:anywhere}
</style>
