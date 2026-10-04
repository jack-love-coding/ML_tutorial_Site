import type { CurriculumReadingStep } from '../../../curriculum/types.ts'
import type { MathLabModule } from '../types/mathLab.ts'

/** Project the final course without changing its authoritative body or resource ownership. */
export function projectMathReading(module: MathLabModule, step?: CurriculumReadingStep): MathLabModule {
  if (!step?.lessonIds || step.moduleId !== module.id) return module
  const sections = step.lessonIds.map(id => {
    const section = module.sections.find(candidate => candidate.id === id)
    if (!section) throw new Error(`Unknown reading section: ${module.id}/${id}`)
    return section
  })
  const allVisualIds = new Set(module.sections.flatMap(section => section.visualIds ?? []))
  const allLabIds = new Set(module.sections.flatMap(section => section.labIds ?? []))
  const visualIds = new Set(sections.flatMap(section => section.visualIds ?? []))
  const labIds = new Set(sections.flatMap(section => section.labIds ?? []))
  for (const id of step.supplementalLabIds ?? []) {
    if (!module.labs.some(lab => lab.id === id)) throw new Error(`Unknown supplemental lab: ${module.id}/${id}`)
    labIds.add(id)
  }
  return {
    ...module,
    sections,
    toc: sections.map(({ id, title, level }) => ({ id, title, level })),
    // Unmounted, course-wide resources stay available. Hidden sections' resources
    // must not become "unmounted" just because the selected sections omit them.
    visuals: module.visuals.filter(asset => visualIds.has(asset.id) || !allVisualIds.has(asset.id)),
    labs: module.labs.filter(lab => labIds.has(lab.id) || !allLabIds.has(lab.id)),
  }
}
