import { messages } from '../../i18n/messages.ts'
import type { AlgorithmModuleDefinition, LocalizedCopy } from '../../types/ml.ts'
import { algorithmCurriculumMetadata } from '../algorithmMetadata.ts'
import { algorithmCatalog } from '../generated/algorithmCatalog.ts'
import type { CurriculumModule } from '../types.ts'

function messageCopy(key: string): LocalizedCopy {
  const read = (locale: keyof typeof messages) => {
    let value: unknown = messages[locale]
    for (const part of key.split('.')) {
      value = value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined
    }
    if (typeof value !== 'string') throw new Error(`Missing ${locale} curriculum message: ${key}`)
    return value
  }
  return { 'zh-CN': read('zh-CN'), en: read('en') }
}

// Used by the build-time generator and parity tests, never by an overview page.
export function adaptAlgorithmModule(module: AlgorithmModuleDefinition): CurriculumModule {
  const metadata = algorithmCurriculumMetadata[module.slug]
  const summary = messageCopy(module.summaryKey)
  const lessons = module.chapters.map((chapter) => ({
    id: chapter.id,
    sourceId: chapter.id,
    title: chapter.title ?? messageCopy(chapter.titleKey),
    summary: chapter.pageSummary ?? summary,
    route: `${module.route}/${chapter.id}`,
    estimatedMinutes: chapter.estimatedMinutes ?? 12,
  }))
  return {
    id: module.slug,
    source: { namespace: 'algorithm', id: module.slug },
    domain: metadata.domain,
    level: metadata.level,
    title: messageCopy(module.titleKey),
    summary,
    route: module.route,
    estimatedMinutes: lessons.reduce((total, lesson) => total + lesson.estimatedMinutes, 0),
    prerequisiteIds: metadata.prerequisites ?? [],
    outcomeIds: (module.checkpoints ?? []).map((checkpoint) => checkpoint.id),
    lessons,
    relatedModuleIds: metadata.related ?? [],
    legacyRoute: module.route,
  }
}

export function adaptAlgorithmModules(): CurriculumModule[] {
  return algorithmCatalog
}
