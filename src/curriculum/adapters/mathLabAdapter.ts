import type { MathLabModule } from '../../modules/math-lab/types/mathLab.ts'
import type { CurriculumLevel, CurriculumModule } from '../types.ts'

const prerequisiteIdMap: Record<string, string> = {
  'vectors-matrices-norms': 'linear-algebra-distance-similarity',
}

function mathLevel(level: MathLabModule['difficulty']): CurriculumLevel {
  return level === 'foundation' ? 'beginner' : level
}

function canonicalPrerequisites(prerequisites: string[]) {
  return prerequisites.map((prerequisiteId) => prerequisiteIdMap[prerequisiteId] ?? prerequisiteId)
}

export function adaptMathLabModule(moduleDefinition: MathLabModule): CurriculumModule {
  return {
    id: moduleDefinition.id,
    source: { namespace: 'math-lab', id: moduleDefinition.id },
    domain: 'math',
    level: mathLevel(moduleDefinition.difficulty),
    title: moduleDefinition.title,
    summary: moduleDefinition.subtitle,
    route: `/math-lab/modules/${moduleDefinition.id}`,
    estimatedMinutes: moduleDefinition.estimatedMinutes,
    prerequisiteIds: canonicalPrerequisites(moduleDefinition.prerequisites),
    outcomeIds: moduleDefinition.learningObjectives.map(
      (_objective, index) => `${moduleDefinition.id}:objective-${index + 1}`,
    ),
    lessons: moduleDefinition.sections.map((section) => ({
      id: section.id,
      sourceId: section.id,
      title: section.title,
      summary: section.content,
    })),
    relatedModuleIds: moduleDefinition.nextModuleIds,
    legacyRoute: `/math-lab/modules/${moduleDefinition.id}`,
  }
}

export function adaptMathLabModules(modules: MathLabModule[]) {
  return modules.map(adaptMathLabModule)
}
