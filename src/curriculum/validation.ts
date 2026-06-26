import type { CurriculumModule } from './types.ts'

function hasBothLocales(copy: { 'zh-CN': string; en: string }) {
  return copy['zh-CN'].trim().length > 0 && copy.en.trim().length > 0
}

export function validateCurriculumLocalization(modules: CurriculumModule[]) {
  const errors: string[] = []

  for (const moduleDefinition of modules) {
    if (!hasBothLocales(moduleDefinition.title)) errors.push(`${moduleDefinition.id}:title`)
    if (!hasBothLocales(moduleDefinition.summary)) errors.push(`${moduleDefinition.id}:summary`)

    for (const lesson of moduleDefinition.lessons) {
      if (!hasBothLocales(lesson.title)) errors.push(`${moduleDefinition.id}/${lesson.id}:title`)
      if (!hasBothLocales(lesson.summary)) errors.push(`${moduleDefinition.id}/${lesson.id}:summary`)
    }
  }

  return errors
}

export function validateUniqueCurriculumIds(modules: CurriculumModule[]) {
  const seen = new Set<string>()
  const duplicates: string[] = []

  for (const moduleDefinition of modules) {
    if (seen.has(moduleDefinition.id)) duplicates.push(moduleDefinition.id)
    seen.add(moduleDefinition.id)
  }

  return duplicates
}
