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
  isCheckpointReportComplete,
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
const saved = loadCheckpointReport(props.prompt.moduleId)
const report = reactive<SavedCheckpointReport>(
  saved ?? createDefaultCheckpointReport(props.prompt.routeId, props.prompt.moduleId),
)

const activeEvidence = computed(() => report.evidence ?? props.prompt.staticEvidence)
const completed = computed(() => isCheckpointReportComplete(report))

watch(
  () => props.evidence,
  (evidence) => {
    if (evidence) {
      report.evidence = evidence
    }
  },
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

function saveDraft() {
  const savedReport = saveCheckpointReport({
    ...report,
    completed: completed.value,
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
  link.download = `${props.prompt.moduleId}-checkpoint-report.md`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="math-checkpoint-report">
    <header>
      <span>{{ locale === 'zh-CN' ? 'Checkpoint 报告' : 'Checkpoint report' }}</span>
      <h2>{{ prompt.title[locale] }}</h2>
      <p>{{ prompt.task[locale] }}</p>
    </header>

    <article class="math-checkpoint-report__evidence">
      <span>{{ locale === 'zh-CN' ? '实验证据' : 'Experiment evidence' }}</span>
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
          :value="report.answers[field.key]"
          rows="4"
          @input="updateFieldFromEvent(field.key, $event)"
        />
      </label>
    </div>

    <p class="math-checkpoint-report__helper">
      {{
        completed
          ? locale === 'zh-CN'
            ? '四个部分都达到最低长度，可以导出报告。'
            : 'All four sections meet the minimum length and are ready to export.'
          : locale === 'zh-CN'
            ? '先补全四个回答，保存后仪表盘会显示草稿或完成状态。'
            : 'Complete the four answers; saved drafts update the dashboard status.'
      }}
    </p>

    <div class="math-checkpoint-report__actions">
      <button type="button" class="action-button" @click="saveDraft">
        {{ locale === 'zh-CN' ? '保存草稿' : 'Save draft' }}
      </button>
      <button type="button" class="action-button action-button--primary" @click="downloadMarkdown">
        {{ locale === 'zh-CN' ? '导出 Markdown' : 'Export Markdown' }}
      </button>
      <span v-if="saveMessage">{{ saveMessage }}</span>
    </div>
  </section>
</template>
