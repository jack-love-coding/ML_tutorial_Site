import type { ModuleSlug } from '../types/ml'

export type LessonLabPlacement = 'section' | 'top'
export type LessonBlockRenderMode = 'standard' | 'gradient'

export interface LessonLabRegistryEntry {
  moduleSlug: ModuleSlug
  labId: string
  placement: LessonLabPlacement
  renderMode: LessonBlockRenderMode
  showVisuals?: boolean
  showSources?: boolean
}

export const lessonPagePilotSlugs = [
  'ai-overview',
  'gradient-descent',
  'mlp',
] as const

export type LessonPagePilotSlug = typeof lessonPagePilotSlugs[number]

export const lessonLabRegistry: Record<LessonPagePilotSlug, LessonLabRegistryEntry> = {
  'ai-overview': {
    moduleSlug: 'ai-overview',
    labId: 'ai-overview-task-lab',
    placement: 'section',
    renderMode: 'standard',
  },
  'gradient-descent': {
    moduleSlug: 'gradient-descent',
    labId: 'gradient-chapter-lab',
    placement: 'section',
    renderMode: 'gradient',
  },
  mlp: {
    moduleSlug: 'mlp',
    labId: 'mlp-playground-cockpit',
    placement: 'top',
    renderMode: 'standard',
    showVisuals: true,
    showSources: true,
  },
}

export function isLessonPagePilotSlug(moduleSlug: ModuleSlug): moduleSlug is LessonPagePilotSlug {
  return lessonPagePilotSlugs.includes(moduleSlug as LessonPagePilotSlug)
}
