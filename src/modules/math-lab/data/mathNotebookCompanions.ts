import type { MathNotebookCompanion } from '../types/mathLab.ts'
import { amesNumericalChapterIds, amesNumericalNotebookForModule } from './amesNumericalNotebook.ts'
import { numericalBatch2ChapterIds, numericalBatch2NotebookForModule } from './numericalBatch2Notebook.ts'
import { numericalBatch3ChapterIds, numericalBatch3NotebookForModule } from './numericalBatch3Notebook.ts'
import { numericalBatch4ChapterIds, numericalBatch4NotebookForModule } from './numericalBatch4Notebook.ts'

// Historical assets stay at their published URLs. Only this adapter knows their batch names.
const companions: MathNotebookCompanion[] = [
  ...amesNumericalChapterIds.map(id => ({ ...amesNumericalNotebookForModule(id)!, manifestPath: '/notebooks/numerical-methods/outputs/manifest.json' })),
  ...numericalBatch2ChapterIds.map(id => ({ ...numericalBatch2NotebookForModule(id)!, manifestPath: '/notebooks/numerical-methods/batch-2-outputs/manifest.json' })),
  ...numericalBatch3ChapterIds.map(id => ({ ...numericalBatch3NotebookForModule(id)!, manifestPath: '/notebooks/numerical-methods/batch-3-outputs/manifest.json' })),
  ...numericalBatch4ChapterIds.map(id => ({ ...numericalBatch4NotebookForModule(id)!, manifestPath: '/notebooks/numerical-methods/batch-4-outputs/manifest.json' })),
]
const registry = new Map<string, MathNotebookCompanion>()
for (const companion of companions) {
  if (registry.has(companion.moduleId)) throw new Error(`Duplicate math Notebook companion: ${companion.moduleId}`)
  registry.set(companion.moduleId, companion)
}

export function mathNotebookCompanionForModule(moduleId: string) {
  return registry.get(moduleId)
}
