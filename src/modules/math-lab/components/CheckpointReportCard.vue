<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type {
  CheckpointReportFieldKey,
  CheckpointReportPrompt,
  ExperimentEvidence,
  LocalizedCopy,
  MathLabLocale,
  MathLabModule,
  SavedCheckpointReport,
} from '../types/mathLab'
import {
  buildCheckpointReportMarkdown,
  createDefaultCheckpointReport,
  loadCheckpointReport,
  saveCheckpointReport,
  valueText,
} from '../utils/checkpointReports'

const props = defineProps<{
  prompt: CheckpointReportPrompt
  evidence?: ExperimentEvidence
  modules: MathLabModule[]
  locale: MathLabLocale
}>()

const saveMessage = ref('')
const liveEvidence = ref<ExperimentEvidence | undefined>()
const report = reactive<SavedCheckpointReport>(createDefaultCheckpointReport(props.prompt.routeId, props.prompt.moduleId))

const activeEvidence = computed(() => liveEvidence.value ?? report.evidence ?? props.prompt.staticEvidence)

function resetReportForPrompt() {
  const saved = loadCheckpointReport(props.prompt.moduleId)
  Object.assign(report, saved ?? createDefaultCheckpointReport(props.prompt.routeId, props.prompt.moduleId))
  liveEvidence.value = undefined
  saveMessage.value = ''
  applyEvidence(props.evidence)
}

function applyEvidence(evidence: ExperimentEvidence | undefined) {
  if (!evidence || evidence.moduleId !== props.prompt.moduleId) {
    liveEvidence.value = undefined
    return
  }

  liveEvidence.value = evidence
}

watch(
  () => props.evidence,
  (evidence) => applyEvidence(evidence),
  { immediate: true },
)

watch(
  () => props.prompt.moduleId,
  () => resetReportForPrompt(),
  { immediate: true },
)

function localized(copy: LocalizedCopy) {
  return copy[props.locale] || copy.en || copy['zh-CN']
}

function updateField(key: CheckpointReportFieldKey, value: string) {
  report.answers[key] = value
  saveMessage.value = ''
}

function updateFieldFromEvent(key: CheckpointReportFieldKey, event: Event) {
  updateField(key, (event.target as HTMLTextAreaElement).value)
}

function textareaId(key: CheckpointReportFieldKey) {
  return `${props.prompt.moduleId}-${key}-report-answer`
}

function textareaName(key: CheckpointReportFieldKey) {
  return `${props.prompt.moduleId}-${key}`
}

function saveDraft() {
  const savedReport = saveCheckpointReport({
    ...report,
    evidence: activeEvidence.value,
    completed: false,
  })
  Object.assign(report, savedReport)
  saveMessage.value = props.locale === 'zh-CN' ? '草稿已保存。' : 'Draft saved.'
  return savedReport
}

function downloadMarkdown() {
  const savedReport = saveDraft()
  const markdown = buildCheckpointReportMarkdown(
    props.prompt.routeId,
    [savedReport],
    props.modules,
    props.locale,
  )
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.prompt.moduleId}-learning-notes.md`
  link.hidden = true
  document.body.appendChild(link)
  link.click()
  queueMicrotask(() => {
    link.remove()
    URL.revokeObjectURL(url)
  })
}
</script>

<template>
  <section class="math-checkpoint-report">
    <header>
      <span>{{ locale === 'zh-CN' ? '学习记录 · 可选' : 'Learning notes · Optional' }}</span>
      <h2>{{ prompt.title[locale] }}</h2>
      <p>{{ prompt.task[locale] }}</p>
    </header>

    <article class="math-checkpoint-report__evidence">
      <span>{{ locale === 'zh-CN' ? '实验结果' : 'Experiment results' }}</span>
      <p>{{ activeEvidence.summary[locale] }}</p>
      <ul v-if="activeEvidence.metrics.length">
        <li v-for="metric in activeEvidence.metrics" :key="metric.label.en">
          <strong>{{ metric.label[locale] }}</strong>
          <span>
            {{ valueText(metric.value, locale) }}{{ metric.unit ? ` ${localized(metric.unit)}` : '' }}
          </span>
        </li>
      </ul>
      <p>{{ activeEvidence.prompt[locale] }}</p>
    </article>

    <div class="math-checkpoint-report__fields">
      <label
        v-for="field in prompt.fields"
        :key="field.key"
        class="math-checkpoint-report__field"
      >
        <span>{{ field.label[locale] }}</span>
        <small>{{ field.guidingPrompt[locale] }}</small>
        <textarea
          :id="textareaId(field.key)"
          :name="textareaName(field.key)"
          :value="report.answers[field.key]"
          rows="4"
          @input="updateFieldFromEvent(field.key, $event)"
        />
      </label>
    </div>

    <p class="math-checkpoint-report__helper">
      {{ locale === 'zh-CN'
        ? '这些记录用于整理思路，可以随时保存或导出，不在前端判定是否达标。'
        : 'These notes organize your thinking and can be saved or exported at any time; the frontend does not grade them.' }}
    </p>

    <div class="math-checkpoint-report__actions">
      <button type="button" class="action-button" @click="saveDraft">
        {{ locale === 'zh-CN' ? '保存草稿' : 'Save draft' }}
      </button>
      <button type="button" class="action-button action-button--primary" @click="downloadMarkdown">
        {{ locale === 'zh-CN' ? '导出 Markdown' : 'Export Markdown' }}
      </button>
      <span v-if="saveMessage" role="status" aria-live="polite">{{ saveMessage }}</span>
    </div>
  </section>
</template>
