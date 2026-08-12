<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withPublicBase } from '../../../utils/publicPath'
type TrajectoryRow = { optimizer: string; update: number; trainLoss: number; updateNorm: number; comparison: 'first-step-norm-matched' | 'predeclared-practical' }
type Banknote = { splitCounts: Record<string, number>; frozenSelection: { optimizer: string; learningRate: number; batchSize: number; epochs: number }; validationEvaluation: { metrics: { examples: number; loss: number; accuracy: number } }; finalTestEvaluation: { evaluationCount: number; selectionUsedTest: boolean; metrics: { examples: number; loss: number; accuracy: number } } }
const mode = ref<'matched' | 'practical'>('matched')
const update = ref(1)
const trajectory = ref<TrajectoryRow[]>([])
const banknote = ref<Banknote | null>(null)
const dataUnavailable = ref(false)
const comparison = computed(() => mode.value === 'matched' ? 'first-step-norm-matched' : 'predeclared-practical')
const rows = computed(() => trajectory.value.filter((row) => row.comparison === comparison.value && row.update === update.value))
const fallbackRows = computed(() => rows.value.length ? rows.value : [{ optimizer: 'Published data unavailable', update: update.value, trainLoss: Number.NaN, updateNorm: Number.NaN }])
async function load() {
  try {
    const [trajectoryResponse, banknoteResponse] = await Promise.all([
      fetch(withPublicBase('/notebooks/optimizer-comparison/optimizer-comparison-trajectories.json')),
      fetch(withPublicBase('/datasets/optimizer-comparison/banknote-transfer.json')),
    ])
    if (!trajectoryResponse.ok || !banknoteResponse.ok) throw new Error('asset request failed')
    const trajectoryPayload = await trajectoryResponse.json() as { rows?: TrajectoryRow[] }
    const banknotePayload = await banknoteResponse.json() as Banknote
    if (!Array.isArray(trajectoryPayload.rows) || !banknotePayload.finalTestEvaluation?.metrics) throw new Error('asset shape failed')
    trajectory.value = trajectoryPayload.rows.filter((row) => Number.isFinite(row.trainLoss) && Number.isFinite(row.updateNorm))
    banknote.value = banknotePayload
  } catch { dataUnavailable.value = true }
}
onMounted(() => { void load() })
</script>
<template>
  <section class="optimizer-scene" tabindex="0" aria-label="Controlled curves and Banknote transfer" @keydown.self.right.prevent="update = Math.min(40, update + 1)" @keydown.self.space.prevent="update = Math.min(40, update + 1)" @keydown.self.r.prevent="update = 1">
    <header class="optimizer-scene__header"><div><span>Two deliberately separate evidence surfaces</span><h4>Controlled MLP trajectories and frozen Banknote transfer</h4></div><p>Space / Right Arrow: next published update. R: reset.</p></header>
    <p v-if="dataUnavailable" class="optimizer-scene__notice" role="status">Published data could not load; the semantic fallback table is retained and no Banknote metric is invented.</p>
    <div class="optimizer-scene__controls"><div class="optimizer-scene__actions"><button type="button" @click="update = Math.min(40, update + 1)">Step published update</button><button type="button" @click="update = 1">Reset</button></div><label>Controlled comparison<select v-model="mode"><option value="matched">first-step norm matched</option><option value="practical">predeclared practical</option></select></label></div>
    <table class="optimizer-scene__table"><caption>Published {{ comparison }} MLP values at update {{ update }}</caption><thead><tr><th>optimizer</th><th>train loss</th><th>‖Δθ‖</th></tr></thead><tbody><tr v-for="row in fallbackRows" :key="row.optimizer"><td>{{ row.optimizer }}</td><td>{{ Number.isFinite(row.trainLoss) ? row.trainLoss.toFixed(6) : 'unavailable' }}</td><td>{{ Number.isFinite(row.updateNorm) ? row.updateNorm.toFixed(6) : 'unavailable' }}</td></tr></tbody></table>
    <table class="optimizer-scene__table"><caption>Real Banknote result — separate from controlled MLP curves</caption><thead><tr><th>partition</th><th>examples</th><th>loss</th><th>accuracy</th></tr></thead><tbody><template v-if="banknote"><tr><td>validation (before test)</td><td>{{ banknote.validationEvaluation.metrics.examples }}</td><td>{{ banknote.validationEvaluation.metrics.loss.toFixed(6) }}</td><td>{{ (banknote.validationEvaluation.metrics.accuracy * 100).toFixed(2) }}%</td></tr><tr><td>final test (one evaluation after freeze)</td><td>{{ banknote.finalTestEvaluation.metrics.examples }}</td><td>{{ banknote.finalTestEvaluation.metrics.loss.toFixed(6) }}</td><td>{{ (banknote.finalTestEvaluation.metrics.accuracy * 100).toFixed(2) }}%</td></tr></template><tr v-else><td colspan="4">Unavailable — no metric is substituted for failed data loading.</td></tr></tbody></table>
    <p v-if="banknote" class="optimizer-scene__notice">Frozen {{ banknote.frozenSelection.optimizer }}: lr={{ banknote.frozenSelection.learningRate }}, batch={{ banknote.frozenSelection.batchSize }}, epochs={{ banknote.frozenSelection.epochs }}. Split: {{ banknote.splitCounts.train }}/{{ banknote.splitCounts.validation }}/{{ banknote.splitCounts.test }}; train-only standardization; test count={{ banknote.finalTestEvaluation.evaluationCount }}, selectionUsedTest={{ banknote.finalTestEvaluation.selectionUsedTest }}.</p>
  </section>
</template>
