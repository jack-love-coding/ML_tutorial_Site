import { checkpointReportForModule } from '../data/checkpointReports.ts'
import type {
  CheckpointReportFieldKey,
  ExperimentEvidence,
  LocalizedCopy,
  MathLabLocale,
  MathLabModule,
  MathLabModuleId,
  SavedCheckpointReport,
} from '../types/mathLab'
import type { StorageLike } from '../../../utils/progressStorage.ts'

export const fieldKeys = ['setup', 'observation', 'explanation', 'nextStep'] as const satisfies readonly CheckpointReportFieldKey[]

const fallbackFieldLabels: Record<CheckpointReportFieldKey, LocalizedCopy> = {
  setup: { 'zh-CN': '设置', en: 'Setup' },
  observation: { 'zh-CN': '观察', en: 'Observation' },
  explanation: { 'zh-CN': '解释', en: 'Explanation' },
  nextStep: { 'zh-CN': '下一步', en: 'Next Step' },
}

function storageFor(storage?: StorageLike) {
  if (storage) return storage
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

export function checkpointReportStorageKey(moduleId: MathLabModuleId) {
  return `ml-atlas:checkpoint-report:${moduleId}`
}

function emptyAnswers(): Record<CheckpointReportFieldKey, string> {
  return {
    setup: '',
    observation: '',
    explanation: '',
    nextStep: '',
  }
}

export function createDefaultCheckpointReport(
  routeId: string,
  moduleId: MathLabModuleId,
  now = new Date().toISOString(),
): SavedCheckpointReport {
  return {
    routeId,
    moduleId,
    answers: emptyAnswers(),
    completed: false,
    updatedAt: now,
  }
}

export function isCheckpointReportComplete(report: SavedCheckpointReport) {
  return fieldKeys.every((key) => report.answers[key]?.trim())
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeAnswers(value: unknown): Record<CheckpointReportFieldKey, string> {
  const source = isRecord(value) ? value : {}
  return {
    setup: typeof source.setup === 'string' ? source.setup : '',
    observation: typeof source.observation === 'string' ? source.observation : '',
    explanation: typeof source.explanation === 'string' ? source.explanation : '',
    nextStep: typeof source.nextStep === 'string' ? source.nextStep : '',
  }
}

export function loadCheckpointReport(moduleId: MathLabModuleId, storage?: StorageLike): SavedCheckpointReport | undefined {
  const resolvedStorage = storageFor(storage)
  if (!resolvedStorage) return undefined

  try {
    const raw = resolvedStorage.getItem(checkpointReportStorageKey(moduleId))
    if (!raw) return undefined

    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return undefined
    if (parsed.moduleId !== moduleId || typeof parsed.routeId !== 'string') return undefined

    const report: SavedCheckpointReport = {
      routeId: parsed.routeId,
      moduleId,
      answers: normalizeAnswers(parsed.answers),
      evidence: isRecord(parsed.evidence) ? parsed.evidence as unknown as ExperimentEvidence : undefined,
      completed: Boolean(parsed.completed),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    }

    return {
      ...report,
      completed: isCheckpointReportComplete(report) && report.completed,
    }
  } catch {
    return undefined
  }
}

export function saveCheckpointReport(report: SavedCheckpointReport, storage?: StorageLike): SavedCheckpointReport {
  const nextReport: SavedCheckpointReport = {
    ...report,
    answers: normalizeAnswers(report.answers),
    completed: isCheckpointReportComplete(report),
    updatedAt: new Date().toISOString(),
  }

  storageFor(storage)?.setItem(checkpointReportStorageKey(report.moduleId), JSON.stringify(nextReport))
  return nextReport
}

function localized(copy: LocalizedCopy, locale: MathLabLocale) {
  return copy[locale] || copy.en || copy['zh-CN']
}

export function valueText(value: string | number | LocalizedCopy, locale: MathLabLocale) {
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value
  return localized(value, locale)
}

function routeReportTitle(routeId: string, locale: MathLabLocale) {
  if (routeId === 'linear-algebra-route') {
    return locale === 'zh-CN' ? '线性代数路线报告' : 'Linear Algebra Route Report'
  }
  return locale === 'zh-CN' ? `${routeId} 报告` : `${routeId} Report`
}

function moduleTitle(moduleId: MathLabModuleId, modules: readonly MathLabModule[], locale: MathLabLocale) {
  return localized(
    modules.find((moduleDefinition) => moduleDefinition.id === moduleId)?.title ?? { 'zh-CN': moduleId, en: moduleId },
    locale,
  )
}

export function buildCheckpointReportMarkdown(
  routeId: string,
  reports: readonly SavedCheckpointReport[],
  modules: readonly MathLabModule[],
  locale: MathLabLocale,
  generatedAt = new Date().toISOString(),
) {
  const missingAnswer = locale === 'zh-CN' ? '尚未作答' : 'Not answered yet'
  const generatedLabel = locale === 'zh-CN' ? '生成时间' : 'Generated at'
  const evidenceLabel = locale === 'zh-CN' ? '证据' : 'Evidence'
  const summaryLabel = locale === 'zh-CN' ? '摘要' : 'Summary'
  const promptLabel = locale === 'zh-CN' ? '观察提示' : 'Observation prompt'
  const metricLabel = locale === 'zh-CN' ? '指标' : 'Metrics'
  const lines = [`# ${routeReportTitle(routeId, locale)}`, '', `_${generatedLabel}: ${generatedAt}_`]

  for (const report of reports) {
    const prompt = checkpointReportForModule(report.moduleId)
    const evidence = report.evidence ?? prompt?.staticEvidence
    lines.push('', `## ${moduleTitle(report.moduleId, modules, locale)}`)

    if (evidence) {
      lines.push('', `### ${evidenceLabel}`, '', `**${summaryLabel}:** ${localized(evidence.summary, locale)}`)
      if (evidence.metrics.length > 0) {
        lines.push('', `**${metricLabel}:**`)
        for (const metric of evidence.metrics) {
          const unit = metric.unit ? ` ${localized(metric.unit, locale)}` : ''
          lines.push(`- ${localized(metric.label, locale)}: ${valueText(metric.value, locale)}${unit}`)
        }
      }
      lines.push('', `**${promptLabel}:** ${localized(evidence.prompt, locale)}`)
    } else {
      lines.push('', `### ${evidenceLabel}`, '', locale === 'zh-CN' ? '暂无静态证据。' : 'No static evidence recorded.')
    }

    const fieldLabels = new Map(prompt?.fields.map((field) => [field.key, field.label]))
    for (const key of fieldKeys) {
      const answer = report.answers[key]?.trim() || missingAnswer
      const label = localized(fieldLabels.get(key) ?? fallbackFieldLabels[key], locale)
      lines.push('', `### ${label}`, '', answer)
    }
  }

  return `${lines.join('\n')}\n`
}
