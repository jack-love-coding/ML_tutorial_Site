<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { LearningProgressLabEvidence, LearningProgressLabTaskInput } from '../../../curriculum/progress'
import type { ExperimentEvidence, LabConfig, LocalizedCopy, MathLabLocale } from '../types/mathLab'

const props = defineProps<{
  lab: LabConfig
  locale: MathLabLocale
  evidence?: ExperimentEvidence
  savedEvidence?: LearningProgressLabEvidence
}>()

const emit = defineEmits<{
  'task-save': [payload: {
    lab: LabConfig
    evidence: ExperimentEvidence
    task: LearningProgressLabTaskInput
  }]
}>()

const prediction = ref('')
const explanation = ref('')
const saveMessage = ref('')

const activeEvidence = computed<ExperimentEvidence | undefined>(() => {
  if (props.evidence) return props.evidence
  if (!props.savedEvidence) return undefined

  return {
    moduleId: props.savedEvidence.moduleId,
    sourceId: props.savedEvidence.sourceId,
    summary: props.savedEvidence.summary,
    metrics: props.savedEvidence.metrics,
    prompt: props.savedEvidence.prompt,
  }
})
const hasDraft = computed(() => prediction.value.trim().length > 0 || explanation.value.trim().length > 0)
const canSave = computed(() => Boolean(activeEvidence.value) && hasDraft.value)
const statusText = computed(() => {
  if (!activeEvidence.value) {
    return props.locale === 'zh-CN' ? '先运行一次实验，再保存任务记录。' : 'Run the lab once before saving the task note.'
  }
  return props.locale === 'zh-CN'
    ? '可以随时保存预测或观察；是否达标由后续教学环节判断。'
    : 'Save a prediction or observation at any time; later teaching workflows can assess it.'
})

watch(
  () => props.savedEvidence?.task,
  (task, previousTask) => {
    if (!task) {
      if (!previousTask && !hasDraft.value) {
        prediction.value = ''
        explanation.value = ''
      }
      return
    }

    if (task.savedAt !== previousTask?.savedAt) {
      prediction.value = task.prediction
      explanation.value = task.explanation
    }
  },
  { immediate: true },
)

function localized(copy: LocalizedCopy) {
  return copy[props.locale] || copy.en || copy['zh-CN']
}

function metricValue(value: string | number | LocalizedCopy) {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return localized(value)
}

function saveTask() {
  if (!activeEvidence.value || !canSave.value) return

  emit('task-save', {
    lab: props.lab,
    evidence: activeEvidence.value,
    task: {
      prediction: prediction.value.trim(),
      explanation: explanation.value.trim(),
      completed: false,
    },
  })

  saveMessage.value = props.locale === 'zh-CN' ? '任务记录已保存。' : 'Task note saved.'
}
</script>

<template>
  <section v-if="lab.task" class="lab-task-card" :aria-labelledby="`${lab.id}-task-title`">
    <header>
      <span>{{ locale === 'zh-CN' ? '实验任务' : 'Lab task' }}</span>
      <h3 :id="`${lab.id}-task-title`">{{ localized(lab.title) }}</h3>
    </header>

    <label class="lab-task-card__field" :for="`${lab.id}-prediction`">
      <span>{{ localized(lab.task.predictionPrompt) }}</span>
      <textarea
        :id="`${lab.id}-prediction`"
        v-model="prediction"
        rows="3"
        :placeholder="locale === 'zh-CN' ? '先写下你的预测和理由' : 'Write your prediction and reason first'"
      />
    </label>

    <div class="lab-task-card__evidence">
      <span>{{ locale === 'zh-CN' ? '实验快照' : 'Experiment snapshot' }}</span>
      <p v-if="!activeEvidence">{{ statusText }}</p>
      <ul v-else>
        <li v-for="metric in activeEvidence.metrics.slice(0, 3)" :key="metric.label.en">
          <strong>{{ localized(metric.label) }}</strong>
          <span>
            {{ metricValue(metric.value) }}{{ metric.unit ? ` ${localized(metric.unit)}` : '' }}
          </span>
        </li>
      </ul>
    </div>

    <label class="lab-task-card__field" :for="`${lab.id}-reflection`">
      <span>{{ localized(lab.task.reflectionPrompt) }}</span>
      <textarea
        :id="`${lab.id}-reflection`"
        v-model="explanation"
        rows="4"
        :placeholder="locale === 'zh-CN' ? '用实验指标解释你的判断' : 'Explain your judgment with the observed metrics'"
      />
    </label>

    <div class="lab-task-card__criteria">
      <span>{{ locale === 'zh-CN' ? '观察建议' : 'Observation prompts' }}</span>
      <ul>
        <li v-for="criterion in lab.successCriteria" :key="criterion.en">
          {{ localized(criterion) }}
        </li>
      </ul>
    </div>

    <div class="lab-task-card__actions">
      <span>{{ statusText }}</span>
      <button type="button" class="action-button action-button--primary" :disabled="!canSave" @click="saveTask">
        {{ locale === 'zh-CN' ? '保存任务记录' : 'Save task note' }}
      </button>
    </div>

    <p class="lab-task-card__status" role="status">{{ saveMessage }}</p>
  </section>
</template>
