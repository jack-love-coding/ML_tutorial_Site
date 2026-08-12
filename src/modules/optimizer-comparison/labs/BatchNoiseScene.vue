<script setup lang="ts">
import { computed, ref } from 'vue'
import { batchNoiseModel } from './sceneModels'
const batchSize = ref<1 | 64 | 960>(64)
const update = ref(0)
const model = computed(() => batchNoiseModel(batchSize.value, update.value))
function advance() { update.value = Math.min(12, update.value + 1) }
</script>
<template>
  <section class="optimizer-scene" tabindex="0" aria-label="Deterministic batch gradient" @keydown.self.space.prevent="advance" @keydown.self.right.prevent="advance" @keydown.self.r.prevent="update = 0">
    <header class="optimizer-scene__header"><div><span>Deterministic gradient subset</span><h4>Full, mini-batch, and stochastic SGD</h4></div><p>Space / Right Arrow: next update. R: reset.</p></header>
    <div class="optimizer-scene__controls"><div class="optimizer-scene__actions"><button type="button" @click="advance">Step update</button><button type="button" @click="update = 0">Reset</button></div><label>Batch size<select v-model.number="batchSize"><option :value="960">full (960)</option><option :value="64">mini (64)</option><option :value="1">stochastic (1)</option></select></label></div>
    <div class="optimizer-batch-bars" aria-label="Gradient coordinates"><div v-for="(value, index) in model.gradient" :key="index"><span>g{{ index }}</span><meter min="-1" max="1" :value="value">{{ value }}</meter><strong>{{ value.toFixed(4) }}</strong></div></div>
    <table class="optimizer-scene__table"><caption>Same subset-gradient values</caption><thead><tr><th>update</th><th>epoch progress</th><th>subset indices</th><th>mean gradient</th><th>‖Δθ‖</th></tr></thead><tbody><tr><td>{{ model.update }}</td><td>{{ model.epoch.toFixed(3) }}</td><td>{{ model.indices.slice(0, 6).join(', ') }}…</td><td>{{ model.gradient.map((v) => v.toFixed(4)).join(', ') }}</td><td>{{ model.updateNorm.toFixed(6) }}</td></tr></tbody></table>
  </section>
</template>
