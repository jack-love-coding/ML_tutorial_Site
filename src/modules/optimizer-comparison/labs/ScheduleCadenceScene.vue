<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '../../../types/ml'
import { scheduleModel, type ScheduleKind } from './sceneModels'
import { copy, localizeScene, playbackCopy, type SceneCopy } from './sceneCopy'
import { useScenePlayback } from './useScenePlayback'
const { locale } = useI18n()
const kind = ref<ScheduleKind>('constant')
const update = ref(0)
const model = computed(() => scheduleModel(kind.value, update.value))
const playback = useScenePlayback({ value: update, initial: 0, maximum: 11 })
const text = computed(() => localizeScene(locale.value as AppLocale, {
  eyebrow: copy('实际调度的引擎更新', 'Actual scheduled engine update'), title: copy('optimizer.step() 在 scheduler.step() 之前', 'optimizer.step() before scheduler.step()'), schedule: copy('调度器', 'Schedule'), constant: copy('恒定', 'constant'), stepDecay: copy('阶梯衰减', 'step decay'), warmupCosine: copy('预热 + 余弦', 'warmup + cosine'), sequence: copy('学习率序列', 'Learning rate sequence'), current: copy('当前更新', 'current update'), rate: copy('learningRateForStep', 'learningRateForStep'), parameters: copy('更新后参数', 'parameters after update'), ...playbackCopy,
} satisfies SceneCopy))
</script>
<template>
  <section class="optimizer-scene" tabindex="0" :aria-label="text.title" @keydown.self.space.prevent="playback.step" @keydown.self.right.prevent="playback.step" @keydown.self.r.prevent="playback.reset">
    <header class="optimizer-scene__header"><div><span>{{ text.eyebrow }}</span><h4>{{ text.title }}</h4></div><p>{{ text.keys }}</p></header><p v-if="playback.reducedMotion" class="optimizer-scene__notice" role="status">{{ text.reducedMotion }}</p>
    <div class="optimizer-scene__controls"><div class="optimizer-scene__actions" role="group" :aria-label="text.title"><button type="button" :aria-pressed="playback.playing" :disabled="playback.reducedMotion" @click="playback.playing ? playback.pause() : playback.play()">{{ playback.playing ? text.pause : text.play }}</button><button type="button" @click="playback.step">{{ text.step }}</button><button type="button" @click="playback.reset">{{ text.reset }}</button></div><label>{{ text.schedule }}<select :value="kind" :aria-label="text.schedule" @change="kind = ($event.target as HTMLSelectElement).value as ScheduleKind; playback.reset()"><option value="constant">{{ text.constant }}</option><option value="step">{{ text.stepDecay }}</option><option value="warmup-cosine">{{ text.warmupCosine }}</option></select></label></div>
    <div class="optimizer-schedule-strip" :aria-label="text.sequence"><span v-for="item in model.transitions" :key="item.update" :class="{ 'is-current': item.update === model.update }">{{ item.update }}: {{ item.learningRate.toFixed(4) }}</span></div>
    <table class="optimizer-scene__table"><caption>{{ model.schedulerOrder }}</caption><thead><tr><th>{{ text.current }}</th><th>{{ text.rate }}</th><th>{{ text.parameters }}</th></tr></thead><tbody><tr><td>{{ model.update }}</td><td>{{ model.learningRate.toFixed(6) }}</td><td>{{ model.transitions.at(-1)?.parameters.map((v) => v.toFixed(6)).join(', ') }}</td></tr></tbody></table>
  </section>
</template>
