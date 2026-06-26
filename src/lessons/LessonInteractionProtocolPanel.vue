<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import type { TeachingInteractionProtocol } from './interactionProtocol'

const props = defineProps<{
  protocol: TeachingInteractionProtocol
}>()

const { locale } = useI18n()

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        badge: '实验任务',
        learningGoal: '目标',
        predictionPrompt: '先预测',
        manipulableVariables: '可操作变量',
        observableMetrics: '观察指标',
        successCriteria: '成功标准',
        evidence: '证据记录',
        reflectionPrompt: '解释与反思',
        level: `L${props.protocol.level}`,
      }
    : {
        badge: 'Lab task',
        learningGoal: 'Goal',
        predictionPrompt: 'Predict first',
        manipulableVariables: 'Manipulable variables',
        observableMetrics: 'Observable metrics',
        successCriteria: 'Success criteria',
        evidence: 'Evidence to record',
        reflectionPrompt: 'Explain and reflect',
        level: `L${props.protocol.level}`,
      },
)

const headingId = computed(() => `lesson-interaction-protocol-${props.protocol.id.replace(/[^a-z0-9]+/gi, '-')}`)

function localizedText(value: LocalizedCopy) {
  return value[locale.value as AppLocale]
}
</script>

<template>
  <section class="lesson-interaction-protocol" :aria-labelledby="headingId">
    <header class="lesson-interaction-protocol__header">
      <div>
        <span>{{ copy.badge }} · {{ copy.level }}</span>
        <h4 :id="headingId">{{ localizedText(props.protocol.learningGoal) }}</h4>
      </div>
      <p>
        <strong>{{ copy.predictionPrompt }}</strong>
        {{ localizedText(props.protocol.predictionPrompt) }}
      </p>
    </header>

    <div class="lesson-interaction-protocol__grid">
      <article>
        <span>{{ copy.manipulableVariables }}</span>
        <ul>
          <li v-for="variable in props.protocol.manipulableVariables" :key="variable.id">
            <strong>{{ localizedText(variable.label) }}</strong>
            <small>{{ localizedText(variable.description) }}</small>
          </li>
        </ul>
      </article>

      <article>
        <span>{{ copy.observableMetrics }}</span>
        <ul>
          <li v-for="metric in props.protocol.observableMetrics" :key="metric.id">
            <strong>{{ localizedText(metric.label) }}</strong>
            <small>{{ localizedText(metric.description) }}</small>
          </li>
        </ul>
      </article>

      <article>
        <span>{{ copy.successCriteria }}</span>
        <ol>
          <li v-for="criterion in props.protocol.successCriteria" :key="localizedText(criterion)">
            {{ localizedText(criterion) }}
          </li>
        </ol>
      </article>

      <article>
        <span>{{ copy.evidence }}</span>
        <ul>
          <li v-for="item in props.protocol.evidence" :key="item.id">
            <strong>{{ localizedText(item.label) }}</strong>
            <small>{{ localizedText(item.source) }}</small>
          </li>
        </ul>
      </article>
    </div>

    <footer class="lesson-interaction-protocol__reflection">
      <span>{{ copy.reflectionPrompt }}</span>
      <strong>{{ localizedText(props.protocol.reflectionPrompt) }}</strong>
    </footer>
  </section>
</template>
