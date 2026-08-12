<script setup lang="ts">
import { computed, ref } from 'vue'
import { scheduleModel, type ScheduleKind } from './sceneModels'
const kind = ref<ScheduleKind>('constant')
const update = ref(0)
const model = computed(() => scheduleModel(kind.value, update.value))
</script>
<template>
  <section class="optimizer-scene" tabindex="0" aria-label="Scheduled optimizer update" @keydown.self.space.prevent="update = Math.min(11, update + 1)" @keydown.self.right.prevent="update = Math.min(11, update + 1)" @keydown.self.r.prevent="update = 0">
    <header class="optimizer-scene__header"><div><span>Actual scheduled engine update</span><h4>optimizer.step() before scheduler.step()</h4></div><p>Space / Right Arrow: next update. R: reset.</p></header>
    <div class="optimizer-scene__controls"><div class="optimizer-scene__actions"><button type="button" @click="update = Math.min(11, update + 1)">Step update</button><button type="button" @click="update = 0">Reset</button></div><label>Schedule<select v-model="kind"><option value="constant">constant</option><option value="step">step decay</option><option value="warmup-cosine">warmup + cosine</option></select></label></div>
    <div class="optimizer-schedule-strip" aria-label="Learning rate sequence"><span v-for="item in model.transitions" :key="item.update" :class="{ 'is-current': item.update === model.update }">{{ item.update }}: {{ item.learningRate.toFixed(4) }}</span></div>
    <table class="optimizer-scene__table"><caption>{{ model.schedulerOrder }}</caption><thead><tr><th>current update</th><th>learningRateForStep</th><th>parameters after update</th></tr></thead><tbody><tr><td>{{ model.update }}</td><td>{{ model.learningRate.toFixed(6) }}</td><td>{{ model.transitions.at(-1)?.parameters.map((v) => v.toFixed(6)).join(', ') }}</td></tr></tbody></table>
  </section>
</template>
