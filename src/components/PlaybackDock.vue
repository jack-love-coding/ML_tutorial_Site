<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ModuleSlug, TrainingSnapshot } from '../types/ml'
import { round } from '../utils/math'

const props = defineProps<{
  slug: ModuleSlug
  snapshot?: TrainingSnapshot
  isPlaying: boolean
}>()

const emit = defineEmits<{
  'toggle-play': []
  step: []
  replay: []
  reset: []
}>()

const { t } = useI18n()

const dockMetrics = computed(() => {
  if (!props.snapshot) return []

  const items: Array<{ id: string; label: string; value: string | number }> = [
    { id: 'step', label: t('metrics.step'), value: props.snapshot.step },
    { id: 'loss', label: t('metrics.loss'), value: round(props.snapshot.loss) },
  ]

  if (props.slug === 'gradient-descent') {
    items.push({
      id: 'gradientNorm',
      label: t('metrics.gradientNorm'),
      value: round(props.snapshot.extraMetric ?? 0),
    })
    items.push({
      id: 'stepSize',
      label: t('metrics.stepSize'),
      value: round(Number(props.snapshot.derivedMetrics?.stepSize ?? 0)),
    })
    return items
  }

  items.push({
    id: 'accuracy',
    label: t('metrics.accuracy'),
    value: `${Math.round((props.snapshot.accuracy ?? 0) * 100)}%`,
  })
  return items
})
</script>

<template>
  <section class="panel playback-dock">
    <div class="panel__heading">
      <span>{{ t('common.playground') }}</span>
      <strong>{{ t('chart.playback') }}</strong>
    </div>

    <div class="playback-dock__body">
      <div class="playback-dock__metrics">
        <article v-for="item in dockMetrics" :key="item.id" class="playback-dock__metric">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </div>

      <div class="playback-dock__actions">
        <button type="button" class="action-button action-button--primary" @click="emit('toggle-play')">
          {{ props.isPlaying ? t('actions.pause') : t('actions.play') }}
        </button>
        <button type="button" class="action-button" @click="emit('step')">
          {{ t('actions.step') }}
        </button>
        <button type="button" class="action-button" @click="emit('replay')">
          {{ t('actions.replay') }}
        </button>
        <button type="button" class="action-button" @click="emit('reset')">
          {{ t('actions.reset') }}
        </button>
      </div>
    </div>
  </section>
</template>
