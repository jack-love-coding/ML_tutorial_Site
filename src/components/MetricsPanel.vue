<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ModuleSlug, TrainingSnapshot } from '../types/ml'
import { round } from '../utils/math'

const props = defineProps<{
  slug: ModuleSlug
  snapshot?: TrainingSnapshot
  emphasizedMetrics?: string[]
}>()

const { t } = useI18n()

const items = computed(() => {
  if (!props.snapshot) return []

  if (props.slug === 'gradient-descent') {
    return [
      { id: 'loss', label: t('metrics.loss'), value: round(props.snapshot.loss) },
      { id: 'step', label: t('metrics.step'), value: props.snapshot.step },
      { id: 'gradientNorm', label: t('metrics.gradientNorm'), value: round(props.snapshot.extraMetric ?? 0) },
      {
        id: 'stepSize',
        label: t('metrics.stepSize'),
        value: round(Number(props.snapshot.derivedMetrics?.stepSize ?? 0)),
      },
      {
        id: 'referenceDistance',
        label: t('metrics.referenceDistance'),
        value:
          props.snapshot.referenceDistance === undefined
            ? '-'
            : round(props.snapshot.referenceDistance),
      },
      {
        id: 'status',
        label: t('metrics.status'),
        value: t(String(props.snapshot.derivedMetrics?.statusKey ?? 'observations.gradientStable')),
      },
    ]
  }

  return [
    { id: 'loss', label: t('metrics.loss'), value: round(props.snapshot.loss) },
    { id: 'accuracy', label: t('metrics.accuracy'), value: `${Math.round((props.snapshot.accuracy ?? 0) * 100)}%` },
    {
      id: props.slug === 'mlp' ? 'hiddenUnits' : 'boundaryStrength',
      label: props.slug === 'mlp' ? t('metrics.hiddenUnits') : t('metrics.boundaryStrength'),
      value: props.slug === 'mlp' ? props.snapshot.extraMetric ?? 0 : round(props.snapshot.extraMetric ?? 0),
    },
  ]
})
</script>

<template>
  <section class="metrics-grid">
    <article
      v-for="item in items"
      :key="item.label"
      class="metric-card"
      :class="{
        'is-emphasized': props.emphasizedMetrics?.includes(item.id),
        'is-muted': props.emphasizedMetrics?.length && !props.emphasizedMetrics.includes(item.id),
      }"
    >
      <span>{{ item.label }}</span>
      <strong>{{ item.value }}</strong>
    </article>
  </section>
</template>
