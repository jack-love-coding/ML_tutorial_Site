<script setup lang="ts">
import { computed, ref } from 'vue'
import { trainingLedgerModel } from './sceneModels'
const stage = ref(0)
const model = computed(() => trainingLedgerModel(stage.value))
const step = () => { stage.value = Math.min(4, stage.value + 1) }
</script>
<template>
  <section class="optimizer-scene" tabindex="0" aria-label="Training loop ledger" @keydown.self.space.prevent="step" @keydown.self.right.prevent="step" @keydown.self.r.prevent="stage = 0">
    <header class="optimizer-scene__header"><div><span>Engine operation ledger</span><h4>forward → loss → zero_grad → backward → step</h4></div><p>Space / Right Arrow: next operation. R: reset.</p></header>
    <div class="optimizer-scene__actions"><button type="button" @click="step">Step operation</button><button type="button" @click="stage = 0">Reset</button></div>
    <ol class="optimizer-ledger" aria-label="Training operations">
      <li v-for="entry in model.operations" :key="entry.operation" :data-status="entry.status"><strong>{{ entry.operation }}</strong><span>{{ entry.detail }}</span><code>{{ entry.value }}</code></li>
    </ol>
    <table class="optimizer-scene__table"><caption>Same numerical ledger</caption><thead><tr><th>parameter before</th><th>gradient after backward</th><th>parameter after step</th></tr></thead><tbody><tr><td>{{ model.trace.parametersBefore.map((v) => v.toFixed(3)).join(', ') }}</td><td>{{ model.trace.gradients.map((v) => v.toFixed(3)).join(', ') }}</td><td>{{ model.trace.parametersAfter.map((v) => v.toFixed(3)).join(', ') }}</td></tr></tbody></table>
  </section>
</template>
