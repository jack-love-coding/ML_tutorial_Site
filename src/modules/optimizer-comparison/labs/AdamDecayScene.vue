<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '../../../types/ml'
import { adamDecayModel } from './sceneModels'
import { copy, localizeScene, playbackCopy, type SceneCopy } from './sceneCopy'
import { useScenePlayback } from './useScenePlayback'
const { locale } = useI18n()
const update = ref(1)
const model = computed(() => adamDecayModel(update.value))
const playback = useScenePlayback({ value: update, initial: 1, maximum: 8 })
const text = computed(() => localizeScene(locale.value as AppLocale, {
  eyebrow: copy('Adam 状态与衰减分离', 'Adam state and decay separation'), title: copy('m、v、m̂、v̂、t —— 再比较 L2 与 AdamW', 'm, v, m̂, v̂, t — then L2 versus AdamW'), moments: copy('Adam 矩，t=', 'Adam moments, t='), transitions: copy('独立参数转移', 'Separate parameter transitions'), table: copy('同一引擎转移，更新', 'Same engine transition at update'), strategy: copy('策略', 'strategy'), effective: copy('有效梯度', 'effective gradient'), after: copy('更新后参数', 'parameters after'), coupled: copy('Adam + L2（耦合）', 'Adam + L2 (coupled)'), decoupled: copy('AdamW（解耦）', 'AdamW (decoupled)'), ...playbackCopy,
} satisfies SceneCopy))
</script>
<template>
  <section class="optimizer-scene" tabindex="0" :aria-label="text.title" @keydown.self.space.prevent="playback.step" @keydown.self.right.prevent="playback.step" @keydown.self.r.prevent="playback.reset">
    <header class="optimizer-scene__header"><div><span>{{ text.eyebrow }}</span><h4>{{ text.title }}</h4></div><p>{{ text.keys }}</p></header><p v-if="playback.reducedMotion" class="optimizer-scene__notice" role="status">{{ text.reducedMotion }}</p>
    <div class="optimizer-scene__actions" role="group" :aria-label="text.title"><button type="button" :aria-pressed="playback.playing" :disabled="playback.reducedMotion" @click="playback.playing ? playback.pause() : playback.play()">{{ playback.playing ? text.pause : text.play }}</button><button type="button" @click="playback.step">{{ text.step }}</button><button type="button" @click="playback.reset">{{ text.reset }}</button></div>
    <div class="optimizer-state-cards"><article><h5>{{ text.moments }}{{ model.adam.t }}</h5><output>m={{ model.adam.m.join(', ') }} · v={{ model.adam.v.join(', ') }}</output><small>m̂={{ model.adam.mhat.join(', ') }} · v̂={{ model.adam.vhat.join(', ') }}</small></article><article><h5>{{ text.transitions }}</h5><output>Adam: {{ model.adam.trace.parametersAfter.map((v) => v.toFixed(5)).join(', ') }}</output><small>L2: {{ model.l2.trace.parametersAfter.map((v) => v.toFixed(5)).join(', ') }} · AdamW: {{ model.adamw.trace.parametersAfter.map((v) => v.toFixed(5)).join(', ') }}</small></article></div>
    <table class="optimizer-scene__table"><caption>{{ text.table }} {{ model.update }}</caption><thead><tr><th>{{ text.strategy }}</th><th>{{ text.effective }}</th><th>{{ text.after }}</th></tr></thead><tbody><tr><td>Adam</td><td>{{ model.adam.trace.effectiveGradients.map((v) => v.toFixed(5)).join(', ') }}</td><td>{{ model.adam.trace.parametersAfter.map((v) => v.toFixed(5)).join(', ') }}</td></tr><tr><td>{{ text.coupled }}</td><td>{{ model.l2.trace.effectiveGradients.map((v) => v.toFixed(5)).join(', ') }}</td><td>{{ model.l2.trace.parametersAfter.map((v) => v.toFixed(5)).join(', ') }}</td></tr><tr><td>{{ text.decoupled }}</td><td>{{ model.adamw.trace.effectiveGradients.map((v) => v.toFixed(5)).join(', ') }}</td><td>{{ model.adamw.trace.parametersAfter.map((v) => v.toFixed(5)).join(', ') }}</td></tr></tbody></table>
  </section>
</template>
