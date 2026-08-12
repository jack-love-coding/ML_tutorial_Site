<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '../../../types/ml'
import { momentumRmspropModel } from './sceneModels'
import { copy, localizeScene, playbackCopy, type SceneCopy } from './sceneCopy'
import { useScenePlayback } from './useScenePlayback'
const { locale } = useI18n()
const update = ref(1)
const model = computed(() => momentumRmspropModel(update.value))
const playback = useScenePlayback({ value: update, initial: 1, maximum: 8 })
const text = computed(() => localizeScene(locale.value as AppLocale, {
  eyebrow: copy('共享引擎状态对照', 'Shared-engine state contrast'), title: copy('速度与平方梯度平均值', 'Velocity versus squared-gradient average'), momentum: copy('Momentum 速度 v', 'Momentum velocity v'), rmsprop: copy('RMSProp 平方平均值 s', 'RMSProp square average s'), after: copy('更新后 θ：', 'θ after:'), effective: copy('有效 ηg/(√s+ε)：', 'effective ηg/(√s+ε):'), table: copy('同一状态转移，更新', 'Same state transition at update'), rule: copy('规则', 'rule'), stepNumber: copy('状态步数', 'state step'), gradient: copy('梯度', 'gradient'), rate: copy('学习率', 'learning rate'), ...playbackCopy,
} satisfies SceneCopy))
</script>
<template>
  <section class="optimizer-scene" tabindex="0" :aria-label="text.title" @keydown.self.space.prevent="playback.step" @keydown.self.right.prevent="playback.step" @keydown.self.r.prevent="playback.reset">
    <header class="optimizer-scene__header"><div><span>{{ text.eyebrow }}</span><h4>{{ text.title }}</h4></div><p>{{ text.keys }}</p></header><p v-if="playback.reducedMotion" class="optimizer-scene__notice" role="status">{{ text.reducedMotion }}</p>
    <div class="optimizer-scene__actions" role="group" :aria-label="text.title"><button type="button" :aria-pressed="playback.playing" :disabled="playback.reducedMotion" @click="playback.playing ? playback.pause() : playback.play()">{{ playback.playing ? text.pause : text.play }}</button><button type="button" @click="playback.step">{{ text.step }}</button><button type="button" @click="playback.reset">{{ text.reset }}</button></div>
    <div class="optimizer-state-cards"><article><h5>{{ text.momentum }}</h5><output>{{ model.momentum.state.kind === 'momentum' ? model.momentum.state.velocity.map((v) => v.toFixed(5)).join(', ') : '' }}</output><small>{{ text.after }} {{ model.momentum.parametersAfter.map((v) => v.toFixed(5)).join(', ') }}</small></article><article><h5>{{ text.rmsprop }}</h5><output>{{ model.rmsprop.state.kind === 'rmsprop' ? model.rmsprop.state.squareAverage.map((v) => v.toFixed(5)).join(', ') : '' }}</output><small>{{ text.effective }} {{ model.effectiveStep.map((v) => v.toFixed(5)).join(', ') }}</small></article></div>
    <table class="optimizer-scene__table"><caption>{{ text.table }} {{ model.update }}</caption><thead><tr><th>{{ text.rule }}</th><th>{{ text.stepNumber }}</th><th>{{ text.gradient }}</th><th>{{ text.rate }}</th></tr></thead><tbody><tr><td>Momentum</td><td>{{ model.momentum.state.step }}</td><td>{{ model.momentum.gradients.map((v) => v.toFixed(4)).join(', ') }}</td><td>{{ model.momentum.learningRate }}</td></tr><tr><td>RMSProp</td><td>{{ model.rmsprop.state.step }}</td><td>{{ model.rmsprop.gradients.map((v) => v.toFixed(4)).join(', ') }}</td><td>{{ model.rmsprop.learningRate }}</td></tr></tbody></table>
  </section>
</template>
