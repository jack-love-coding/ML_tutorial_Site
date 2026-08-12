<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '../../../types/ml'
import { withPublicBase } from '../../../utils/publicPath'
import { publishedOptimizerSnapshot, publishedOptimizerSnapshotHash } from './publishedSnapshot'
import { copy, localizeScene, playbackCopy, type SceneCopy } from './sceneCopy'
import { useScenePlayback } from './useScenePlayback'

type TrajectoryRow = typeof publishedOptimizerSnapshot.trajectories[number]
type Banknote = typeof publishedOptimizerSnapshot.banknote
const { locale } = useI18n()
const mode = ref<'matched' | 'practical'>('matched')
const update = ref(1)
const trajectory = ref<TrajectoryRow[]>([...publishedOptimizerSnapshot.trajectories])
const banknote = ref<Banknote>(publishedOptimizerSnapshot.banknote)
const dataUnavailable = ref(false)
const playback = useScenePlayback({ value: update, initial: 1, maximum: 40 })
const comparison = computed(() => mode.value === 'matched' ? 'first-step-norm-matched' : 'predeclared-practical')
const rows = computed(() => trajectory.value.filter((row) => row.comparison === comparison.value && row.update === update.value))
const text = computed(() => localizeScene(locale.value as AppLocale, {
  eyebrow: copy('两块刻意分开的学习表面', 'Two deliberately separate learning surfaces'), title: copy('受控 MLP 轨迹与冻结的 Banknote 迁移', 'Controlled MLP trajectories and frozen Banknote transfer'), comparison: copy('受控比较', 'Controlled comparison'), matched: copy('首步范数匹配', 'first-step norm matched'), practical: copy('预先声明的实用设置', 'predeclared practical'), published: copy('已发布', 'Published'), snapshot: copy('已发布快照', 'Published snapshot'), atUpdate: copy('在更新', 'at update'), fallback: copy('已发布资产无法加载；正在显示与已发布资源 hash 绑定的快照。', 'Published assets could not load; showing the hash-bound published snapshot.'), optimizer: copy('优化器', 'optimizer'), loss: copy('训练损失', 'train loss'), norm: copy('‖Δθ‖', '‖Δθ‖'), banknote: copy('真实 Banknote 结果——与受控 MLP 曲线分开', 'Real Banknote result — separate from controlled MLP curves'), partition: copy('划分', 'partition'), examples: copy('样本数', 'examples'), accuracy: copy('准确率', 'accuracy'), validation: copy('验证集（测试前）', 'validation (before test)'), test: copy('最终测试（冻结后仅评估一次）', 'final test (one evaluation after freeze)'), details: copy('冻结', 'Frozen'), trainOnly: copy('仅训练集标准化', 'train-only standardization'), ...playbackCopy,
} satisfies SceneCopy))

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
  } catch {
    dataUnavailable.value = true
    trajectory.value = [...publishedOptimizerSnapshot.trajectories]
    banknote.value = publishedOptimizerSnapshot.banknote
  }
}
onMounted(() => { void load() })
</script>
<template>
  <section class="optimizer-scene" tabindex="0" :aria-label="text.title" @keydown.self.right.prevent="playback.step" @keydown.self.space.prevent="playback.step" @keydown.self.r.prevent="playback.reset">
    <header class="optimizer-scene__header"><div><span>{{ text.eyebrow }}</span><h4>{{ text.title }}</h4></div><p>{{ text.keys }}</p></header>
    <p v-if="playback.reducedMotion" class="optimizer-scene__notice" role="status">{{ text.reducedMotion }}</p><p v-if="dataUnavailable" class="optimizer-scene__notice" role="status">{{ text.fallback }} {{ text.snapshot }} · {{ publishedOptimizerSnapshotHash.slice(0, 12) }}.</p>
    <div class="optimizer-scene__controls"><div class="optimizer-scene__actions" role="group" :aria-label="text.title"><button type="button" :aria-pressed="playback.playing" :disabled="playback.reducedMotion" @click="playback.playing ? playback.pause() : playback.play()">{{ playback.playing ? text.pause : text.play }}</button><button type="button" @click="playback.step">{{ text.step }}</button><button type="button" @click="playback.reset">{{ text.reset }}</button></div><label>{{ text.comparison }}<select :value="mode" :aria-label="text.comparison" @change="mode = ($event.target as HTMLSelectElement).value as 'matched' | 'practical'; playback.reset()"><option value="matched">{{ text.matched }}</option><option value="practical">{{ text.practical }}</option></select></label></div>
    <table class="optimizer-scene__table"><caption>{{ dataUnavailable ? text.snapshot : text.published }} {{ comparison }} MLP {{ text.atUpdate }} {{ update }}</caption><thead><tr><th>{{ text.optimizer }}</th><th>{{ text.loss }}</th><th>{{ text.norm }}</th></tr></thead><tbody><tr v-for="row in rows" :key="row.optimizer"><td>{{ row.optimizer }}</td><td>{{ row.trainLoss.toFixed(6) }}</td><td>{{ row.updateNorm.toFixed(6) }}</td></tr></tbody></table>
    <table class="optimizer-scene__table"><caption>{{ text.banknote }}</caption><thead><tr><th>{{ text.partition }}</th><th>{{ text.examples }}</th><th>{{ text.loss }}</th><th>{{ text.accuracy }}</th></tr></thead><tbody><tr><td>{{ text.validation }}</td><td>{{ banknote.validationEvaluation.metrics.examples }}</td><td>{{ banknote.validationEvaluation.metrics.loss.toFixed(6) }}</td><td>{{ (banknote.validationEvaluation.metrics.accuracy * 100).toFixed(2) }}%</td></tr><tr><td>{{ text.test }}</td><td>{{ banknote.finalTestEvaluation.metrics.examples }}</td><td>{{ banknote.finalTestEvaluation.metrics.loss.toFixed(6) }}</td><td>{{ (banknote.finalTestEvaluation.metrics.accuracy * 100).toFixed(2) }}%</td></tr></tbody></table>
    <p class="optimizer-scene__notice">{{ text.details }} {{ banknote.frozenSelection.optimizer }}: lr={{ banknote.frozenSelection.learningRate }}, batch={{ banknote.frozenSelection.batchSize }}, epochs={{ banknote.frozenSelection.epochs }}. Split: {{ banknote.splitCounts.train }}/{{ banknote.splitCounts.validation }}/{{ banknote.splitCounts.test }}; {{ text.trainOnly }}; test count={{ banknote.finalTestEvaluation.evaluationCount }}, selectionUsedTest={{ banknote.finalTestEvaluation.selectionUsedTest }}.</p>
  </section>
</template>
