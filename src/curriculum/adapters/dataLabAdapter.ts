import type { DataLabModule } from '../../modules/data-lab/types/dataLab.ts'
import type { CurriculumModule } from '../types.ts'

export function adaptDataLabModule(moduleDefinition: DataLabModule): CurriculumModule {
  return {
    id: moduleDefinition.id,
    source: { namespace: 'data-lab', id: moduleDefinition.id },
    domain: 'data',
    level: moduleDefinition.order <= 2 ? 'beginner' : 'intermediate',
    title: moduleDefinition.title,
    summary: moduleDefinition.subtitle,
    route: `/data-lab/modules/${moduleDefinition.id}`,
    estimatedMinutes: moduleDefinition.estimatedMinutes,
    prerequisiteIds: [],
    outcomeIds: moduleDefinition.learningObjectives.map(
      (_objective, index) => `${moduleDefinition.id}:objective-${index + 1}`,
    ),
    lessons: moduleDefinition.sections.map((section) => ({
      id: section.id,
      sourceId: section.id,
      title: section.title,
      summary: section.content,
    })),
    relatedModuleIds: [],
    legacyRoute: `/data-lab/modules/${moduleDefinition.id}`,
  }
}

export function adaptDataLabModules(modules: DataLabModule[]) {
  return modules.map(adaptDataLabModule)
}
