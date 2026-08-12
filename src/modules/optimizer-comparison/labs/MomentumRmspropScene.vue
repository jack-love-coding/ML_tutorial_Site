<script setup lang="ts">
import { computed, ref } from 'vue'
import { momentumRmspropModel } from './sceneModels'
const update = ref(1)
const model = computed(() => momentumRmspropModel(update.value))
</script>
<template>
  <section class="optimizer-scene" tabindex="0" aria-label="Momentum and RMSProp state" @keydown.self.space.prevent="update = Math.min(8, update + 1)" @keydown.self.right.prevent="update = Math.min(8, update + 1)" @keydown.self.r.prevent="update = 1">
    <header class="optimizer-scene__header"><div><span>Shared-engine state contrast</span><h4>Velocity versus squared-gradient average</h4></div><p>Space / Right Arrow: next update. R: reset.</p></header>
    <div class="optimizer-scene__actions"><button type="button" @click="update = Math.min(8, update + 1)">Step state</button><button type="button" @click="update = 1">Reset</button></div>
    <div class="optimizer-state-cards"><article><h5>Momentum velocity v</h5><output>{{ model.momentum.state.kind === 'momentum' ? model.momentum.state.velocity.map((v) => v.toFixed(5)).join(', ') : '' }}</output><small>θ after: {{ model.momentum.parametersAfter.map((v) => v.toFixed(5)).join(', ') }}</small></article><article><h5>RMSProp square average s</h5><output>{{ model.rmsprop.state.kind === 'rmsprop' ? model.rmsprop.state.squareAverage.map((v) => v.toFixed(5)).join(', ') : '' }}</output><small>effective ηg/(√s+ε): {{ model.effectiveStep.map((v) => v.toFixed(5)).join(', ') }}</small></article></div>
    <table class="optimizer-scene__table"><caption>Same state transition at update {{ model.update }}</caption><thead><tr><th>rule</th><th>state step</th><th>gradient</th><th>learning rate</th></tr></thead><tbody><tr><td>Momentum</td><td>{{ model.momentum.state.step }}</td><td>{{ model.momentum.gradients.map((v) => v.toFixed(4)).join(', ') }}</td><td>{{ model.momentum.learningRate }}</td></tr><tr><td>RMSProp</td><td>{{ model.rmsprop.state.step }}</td><td>{{ model.rmsprop.gradients.map((v) => v.toFixed(4)).join(', ') }}</td><td>{{ model.rmsprop.learningRate }}</td></tr></tbody></table>
  </section>
</template>
