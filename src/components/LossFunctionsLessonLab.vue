<script setup lang="ts">
import { computed } from 'vue'
import { useLossDisplay } from '../composables/useLossDisplay.ts'
import { useI18n } from 'vue-i18n'

import type {
  ExperimentConfig,
  ExperimentConfigValue,
  StorySection,
  TrainingSnapshot,
} from '../types/ml'
import WhyLossLab from './WhyLossLab.vue'
import RegressionLossLab from './RegressionLossLab.vue'
import ClassificationLossLab from './ClassificationLossLab.vue'
import LikelihoodIntuitionLab from './LikelihoodIntuitionLab.vue'
import NegativeLogLab from './NegativeLogLab.vue'
import MleBridgeLab from './MleBridgeLab.vue'
import LossGradientVerificationLab from './LossGradientVerificationLab.vue'

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

const { locale } = useI18n()
const { regressionSummary, bceSummary, summaryLoading, summaryError } = useLossDisplay(computed(() => props.section.id))

</script>

<template>
  <WhyLossLab
    v-if="props.section.id === 'why-loss'"
    :config="props.config"
    :snapshot="props.snapshot"
    :regression-summary="regressionSummary"
    @update-config="(key, value) => emit('update-config', key, value)"
    @patch-config="emit('patch-config', $event)"
  />

  <RegressionLossLab
    v-else-if="props.section.id === 'regression-losses'"
    :config="props.config"
    :snapshot="props.snapshot"
    :regression-summary="regressionSummary"
    @update-config="(key, value) => emit('update-config', key, value)"
    @patch-config="emit('patch-config', $event)"
  />

  <ClassificationLossLab
    v-else-if="props.section.id === 'classification-losses'"
    :config="props.config"
    :snapshot="props.snapshot"
    :accent="props.accent"
    :bce-summary="bceSummary"
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
    v-else-if="props.section.id === 'mle-bridge'"
    :config="props.config"
    :snapshot="props.snapshot"
    @update-config="(key, value) => emit('update-config', key, value)"
    @patch-config="emit('patch-config', $event)"
  />

  <LossGradientVerificationLab
    v-else-if="props.section.id === 'gradient-verification'"
    :regression-summary="regressionSummary"
    :bce-summary="bceSummary"
  />

  <section v-else class="panel loss-lab-unsupported" role="status">
    <strong>{{ locale === 'zh-CN' ? '这个章节没有可用实验' : 'No lab is available for this chapter' }}</strong>
    <p>
      {{
        locale === 'zh-CN'
          ? '请从课程目录选择七个已发布章节之一。'
          : 'Choose one of the seven published chapters from the lesson outline.'
      }}
    </p>
  </section>

  <p
    v-if="summaryLoading || summaryError"
    class="loss-lab-load-state"
    :class="{ 'is-error': summaryError }"
    role="status"
    aria-live="polite"
  >
    {{
      summaryLoading
        ? (locale === 'zh-CN' ? '正在读取本地运行结果；页面内计算仍可使用。' : 'Loading local run results; the worked calculation remains available.')
        : (locale === 'zh-CN' ? '本地运行结果暂时无法读取；你仍可使用页面内计算继续学习。' : 'Local run results are unavailable; continue with the built-in calculation.')
    }}
  </p>
</template>
