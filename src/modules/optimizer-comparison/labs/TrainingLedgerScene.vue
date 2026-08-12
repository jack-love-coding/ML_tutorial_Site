<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '../../../types/ml'
import { trainingLedgerModel } from './sceneModels'
import { copy, localizeScene, playbackCopy, type SceneCopy } from './sceneCopy'
import { useScenePlayback } from './useScenePlayback'

const { locale } = useI18n()
const stage = ref(0)
const model = computed(() => trainingLedgerModel(stage.value))
const playback = useScenePlayback({ value: stage, initial: 0, maximum: 4 })
const text = computed(() => localizeScene(locale.value as AppLocale, {
  eyebrow: copy('引擎操作账本', 'Engine operation ledger'), title: copy('forward → loss → zero_grad → backward → step', 'forward → loss → zero_grad → backward → step'),
  operations: copy('训练操作', 'Training operations'), ledger: copy('同一数值账本', 'Same numerical ledger'), before: copy('更新前参数', 'parameter before'), gradient: copy('反向传播后梯度', 'gradient after backward'), after: copy('更新后参数', 'parameter after step'),
  ...playbackCopy,
} satisfies SceneCopy))
</script>
<template>
  <section class="optimizer-scene" tabindex="0" :aria-label="text.title" @keydown.self.space.prevent="playback.step" @keydown.self.right.prevent="playback.step" @keydown.self.r.prevent="playback.reset">
    <header class="optimizer-scene__header"><div><span>{{ text.eyebrow }}</span><h4>{{ text.title }}</h4></div><p>{{ text.keys }}</p></header>
    <p v-if="playback.reducedMotion" class="optimizer-scene__notice" role="status">{{ text.reducedMotion }}</p>
    <div class="optimizer-scene__actions" role="group" :aria-label="text.title"><button type="button" :aria-pressed="playback.playing" :disabled="playback.reducedMotion" @click="playback.playing ? playback.pause() : playback.play()">{{ playback.playing ? text.pause : text.play }}</button><button type="button" @click="playback.step">{{ text.step }}</button><button type="button" @click="playback.reset">{{ text.reset }}</button></div>
    <ol class="optimizer-ledger" :aria-label="text.operations"><li v-for="entry in model.operations" :key="entry.operation" :data-status="entry.status"><strong>{{ entry.operation }}</strong><span>{{ entry.detail }}</span><code>{{ entry.value }}</code></li></ol>
    <table class="optimizer-scene__table"><caption>{{ text.ledger }}</caption><thead><tr><th>{{ text.before }}</th><th>{{ text.gradient }}</th><th>{{ text.after }}</th></tr></thead><tbody><tr><td>{{ model.trace.parametersBefore.map((v) => v.toFixed(5)).join(', ') }}</td><td>{{ model.trace.gradients.map((v) => v.toFixed(5)).join(', ') }}</td><td>{{ model.trace.parametersAfter.map((v) => v.toFixed(5)).join(', ') }}</td></tr></tbody></table>
  </section>
</template>
