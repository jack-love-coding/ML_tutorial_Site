<script setup lang="ts">
import type { ExperimentConfig, ExperimentConfigValue, StorySection, TrainingSnapshot } from '../types/ml'
import WhyLossLab from './WhyLossLab.vue'
import RegressionLossLab from './RegressionLossLab.vue'
import ClassificationLossLab from './ClassificationLossLab.vue'
import LikelihoodIntuitionLab from './LikelihoodIntuitionLab.vue'
import NegativeLogLab from './NegativeLogLab.vue'
import MleBridgeLab from './MleBridgeLab.vue'

const props = defineProps<{
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
  accent: string
  section: StorySection
}>()

const emit = defineEmits<{
  'update-config': [key: string, value: ExperimentConfigValue]
  'patch-config': [config: Partial<ExperimentConfig>]
}>()
</script>

<template>
  <WhyLossLab
    v-if="props.section.id === 'why-loss'"
    :config="props.config"
    :snapshot="props.snapshot"
    @update-config="(key, value) => emit('update-config', key, value)"
    @patch-config="emit('patch-config', $event)"
  />

  <RegressionLossLab
    v-else-if="props.section.id === 'regression-losses'"
    :config="props.config"
    :snapshot="props.snapshot"
    @update-config="(key, value) => emit('update-config', key, value)"
    @patch-config="emit('patch-config', $event)"
  />

  <ClassificationLossLab
    v-else-if="props.section.id === 'classification-losses'"
    :config="props.config"
    :snapshot="props.snapshot"
    :accent="props.accent"
    @update-config="(key, value) => emit('update-config', key, value)"
    @patch-config="emit('patch-config', $event)"
  />

  <LikelihoodIntuitionLab
    v-else-if="props.section.id === 'likelihood-intuition'"
    :config="props.config"
    :snapshot="props.snapshot"
    @update-config="(key, value) => emit('update-config', key, value)"
    @patch-config="emit('patch-config', $event)"
  />

  <NegativeLogLab
    v-else-if="props.section.id === 'negative-log'"
    :config="props.config"
    :snapshot="props.snapshot"
    @update-config="(key, value) => emit('update-config', key, value)"
    @patch-config="emit('patch-config', $event)"
  />

  <MleBridgeLab
    v-else
    :config="props.config"
    :snapshot="props.snapshot"
    @update-config="(key, value) => emit('update-config', key, value)"
    @patch-config="emit('patch-config', $event)"
  />
</template>
