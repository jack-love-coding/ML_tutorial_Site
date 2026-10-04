import type { ModuleSlug } from '../types/ml'
import { algorithmTeaching, type AlgorithmRenderer } from './algorithmTeaching.ts'

export type LessonLabPlacement = 'section' | 'top'
export type LessonBlockRenderMode = 'standard' | 'gradient'

export interface LessonLabRegistryEntry {
  moduleSlug: ModuleSlug
  labId: string
  placement: LessonLabPlacement
  renderer: AlgorithmRenderer
}

// Historical pilot membership stays compatible with interaction protocols.
// Actual teaching modes and lab IDs come from the rendering registry.
export const lessonPagePilotSlugs = ['ai-overview', 'gradient-descent', 'mlp'] as const
export type LessonPagePilotSlug = typeof lessonPagePilotSlugs[number]
export const lessonLabRegistry = Object.fromEntries(lessonPagePilotSlugs.map(moduleSlug => {
  const teaching = algorithmTeaching(moduleSlug)
  return [moduleSlug, { moduleSlug, labId: teaching.labId!, placement: 'section', renderer: teaching.renderer }]
})) as Record<LessonPagePilotSlug, LessonLabRegistryEntry>

export function isLessonPagePilotSlug(moduleSlug: ModuleSlug): moduleSlug is LessonPagePilotSlug {
  return lessonPagePilotSlugs.includes(moduleSlug as LessonPagePilotSlug)
}
