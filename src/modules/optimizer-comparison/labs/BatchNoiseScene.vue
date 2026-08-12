<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '../../../types/ml'
import { batchNoiseModel } from './sceneModels'
import { copy, localizeScene, playbackCopy, type SceneCopy } from './sceneCopy'
import { useScenePlayback } from './useScenePlayback'

const { locale } = useI18n()
const batchSize = ref<1 | 64 | 960>(64)
const update = ref(0)
const model = computed(() => batchNoiseModel(batchSize.value, update.value))
const playback = useScenePlayback({ value: update, initial: 0, maximum: 12 })
const text = computed(() => localizeScene(locale.value as AppLocale, {
  eyebrow: copy('确定性梯度子集', 'Deterministic gradient subset'), title: copy('全批量、小批量与随机 SGD', 'Full, mini-batch, and stochastic SGD'), batch: copy('批量大小', 'Batch size'), full: copy('全量 (960)', 'full (960)'), mini: copy('小批量 (64)', 'mini (64)'), stochastic: copy('随机 (1)', 'stochastic (1)'), coordinates: copy('梯度坐标', 'Gradient coordinates'), table: copy('同一子集梯度数值', 'Same subset-gradient values'), update: copy('更新', 'update'), epoch: copy('epoch 进度', 'epoch progress'), indices: copy('子集索引', 'subset indices'), mean: copy('平均梯度', 'mean gradient'), norm: copy('‖Δθ‖', '‖Δθ‖'), ...playbackCopy,
} satisfies SceneCopy))
</script>
<template>
  <section class="optimizer-scene" tabindex="0" :aria-label="text.title" @keydown.self.space.prevent="playback.step" @keydown.self.right.prevent="playback.step" @keydown.self.r.prevent="playback.reset">
    <header class="optimizer-scene__header"><div><span>{{ text.eyebrow }}</span><h4>{{ text.title }}</h4></div><p>{{ text.keys }}</p></header>
    <p v-if="playback.reducedMotion" class="optimizer-scene__notice" role="status">{{ text.reducedMotion }}</p>
    <div class="optimizer-scene__controls"><div class="optimizer-scene__actions" role="group" :aria-label="text.title"><button type="button" :aria-pressed="playback.playing" :disabled="playback.reducedMotion" @click="playback.playing ? playback.pause() : playback.play()">{{ playback.playing ? text.pause : text.play }}</button><button type="button" @click="playback.step">{{ text.step }}</button><button type="button" @click="playback.reset">{{ text.reset }}</button></div><label>{{ text.batch }}<select :value="batchSize" :aria-label="text.batch" @change="batchSize = Number(($event.target as HTMLSelectElement).value) as 1 | 64 | 960; playback.reset()"><option :value="960">{{ text.full }}</option><option :value="64">{{ text.mini }}</option><option :value="1">{{ text.stochastic }}</option></select></label></div>
    <div class="optimizer-batch-bars" :aria-label="text.coordinates"><div v-for="(value, index) in model.gradient" :key="index"><span>g{{ index }}</span><meter min="-1" max="1" :value="value">{{ value }}</meter><strong>{{ value.toFixed(4) }}</strong></div></div>
    <table class="optimizer-scene__table"><caption>{{ text.table }}</caption><thead><tr><th>{{ text.update }}</th><th>{{ text.epoch }}</th><th>{{ text.indices }}</th><th>{{ text.mean }}</th><th>{{ text.norm }}</th></tr></thead><tbody><tr><td>{{ model.update }}</td><td>{{ model.epoch.toFixed(3) }}</td><td>{{ model.indices.slice(0, 6).join(', ') }}…</td><td>{{ model.gradient.map((v) => v.toFixed(4)).join(', ') }}</td><td>{{ model.updateNorm.toFixed(6) }}</td></tr></tbody></table>
  </section>
</template>
