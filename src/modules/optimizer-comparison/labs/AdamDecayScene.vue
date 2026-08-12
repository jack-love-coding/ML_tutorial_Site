<script setup lang="ts">
import { computed, ref } from 'vue'
import { adamDecayModel } from './sceneModels'
const update = ref(1)
const model = computed(() => adamDecayModel(update.value))
</script>
<template>
  <section class="optimizer-scene" tabindex="0" aria-label="Adam, L2, and AdamW transitions" @keydown.self.space.prevent="update = Math.min(8, update + 1)" @keydown.self.right.prevent="update = Math.min(8, update + 1)" @keydown.self.r.prevent="update = 1">
    <header class="optimizer-scene__header"><div><span>Adam state and decay separation</span><h4>m, v, m̂, v̂, t — then L2 versus AdamW</h4></div><p>Space / Right Arrow: next update. R: reset.</p></header>
    <div class="optimizer-scene__actions"><button type="button" @click="update = Math.min(8, update + 1)">Step transition</button><button type="button" @click="update = 1">Reset</button></div>
    <div class="optimizer-state-cards"><article><h5>Adam moments, t={{ model.adam.t }}</h5><output>m={{ model.adam.m.join(', ') }} · v={{ model.adam.v.join(', ') }}</output><small>m̂={{ model.adam.mhat.join(', ') }} · v̂={{ model.adam.vhat.join(', ') }}</small></article><article><h5>Separate parameter transitions</h5><output>Adam: {{ model.adam.trace.parametersAfter.map((v) => v.toFixed(5)).join(', ') }}</output><small>L2: {{ model.l2.trace.parametersAfter.map((v) => v.toFixed(5)).join(', ') }} · AdamW: {{ model.adamw.trace.parametersAfter.map((v) => v.toFixed(5)).join(', ') }}</small></article></div>
    <table class="optimizer-scene__table"><caption>Same engine transition at update {{ model.update }}</caption><thead><tr><th>strategy</th><th>effective gradient</th><th>parameters after</th></tr></thead><tbody><tr><td>Adam</td><td>{{ model.adam.trace.effectiveGradients.map((v) => v.toFixed(5)).join(', ') }}</td><td>{{ model.adam.trace.parametersAfter.map((v) => v.toFixed(5)).join(', ') }}</td></tr><tr><td>Adam + L2 (coupled)</td><td>{{ model.l2.trace.effectiveGradients.map((v) => v.toFixed(5)).join(', ') }}</td><td>{{ model.l2.trace.parametersAfter.map((v) => v.toFixed(5)).join(', ') }}</td></tr><tr><td>AdamW (decoupled)</td><td>{{ model.adamw.trace.effectiveGradients.map((v) => v.toFixed(5)).join(', ') }}</td><td>{{ model.adamw.trace.parametersAfter.map((v) => v.toFixed(5)).join(', ') }}</td></tr></tbody></table>
  </section>
</template>
