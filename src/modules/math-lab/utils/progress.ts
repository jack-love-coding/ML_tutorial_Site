import type {
  DiagnosticResult,
  MathLabModuleId,
  MathLabProgress,
  QuizAttempt,
  RouteCompletionProgress,
} from '../types/mathLab'
import {
  clearJsonProgress,
  loadJsonProgress,
  saveJsonProgress,
  type StorageLike,
} from '../../../utils/progressStorage.ts'

const STORAGE_KEY = 'ml-atlas:math-lab-progress:v1'

export type { StorageLike } from '../../../utils/progressStorage.ts'

export function createDefaultProgress(now = new Date().toISOString()): MathLabProgress {
  return {
    completedModuleIds: [],
    quizAttempts: [],
    weakConceptTags: [],
    mastery: [],
    routeCompletions: {},
    updatedAt: now,
  }
}

export function loadMathLabProgress(storage?: StorageLike): MathLabProgress {
  return loadJsonProgress(
    STORAGE_KEY,
    createDefaultProgress,
    (parsed, fallback) => ({
      ...fallback,
      ...parsed,
      completedModuleIds: parsed.completedModuleIds ?? [],
      quizAttempts: parsed.quizAttempts ?? [],
      weakConceptTags: parsed.weakConceptTags ?? [],
      mastery: parsed.mastery ?? [],
      routeCompletions: sanitizeRouteCompletions(parsed.routeCompletions),
    }),
    storage,
  )
}

function sanitizeRouteCompletions(value: unknown): MathLabProgress['routeCompletions'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const entries: Array<[string, RouteCompletionProgress]> = []
  for (const [routeId, candidate] of Object.entries(value)) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue
    const record = candidate as Record<string, unknown>
    if (typeof record.version !== 'string' || !Array.isArray(record.completedModuleIds)) continue
    entries.push([routeId, {
      version: record.version,
      completedModuleIds: Array.from(new Set(record.completedModuleIds.filter((id): id is string => typeof id === 'string'))),
    }])
  }
  return Object.fromEntries(entries)
}

export function saveMathLabProgress(progress: MathLabProgress, storage?: StorageLike) {
  return saveJsonProgress(STORAGE_KEY, progress, storage)
}

export function clearMathLabProgress(storage?: StorageLike) {
  clearJsonProgress(STORAGE_KEY, storage)
}

export function setDiagnosticResult(
  progress: MathLabProgress,
  diagnosticResult: DiagnosticResult,
): MathLabProgress {
  return {
    ...progress,
    diagnosticResult,
    weakConceptTags: Array.from(
      new Set([...progress.weakConceptTags, ...diagnosticResult.weakConcepts]),
    ),
  }
}

export function setLastVisitedModule(
  progress: MathLabProgress,
  moduleId: MathLabModuleId,
): MathLabProgress {
  return {
    ...progress,
    lastVisitedModuleId: moduleId,
  }
}

export function markModuleComplete(
  progress: MathLabProgress,
  moduleId: MathLabModuleId,
): MathLabProgress {
  return {
    ...progress,
    completedModuleIds: Array.from(new Set([...progress.completedModuleIds, moduleId])),
    lastVisitedModuleId: moduleId,
  }
}

export function markRouteModuleComplete(
  progress: MathLabProgress,
  routeId: string,
  version: string,
  moduleId: MathLabModuleId,
): MathLabProgress {
  const current = progress.routeCompletions?.[routeId as keyof NonNullable<MathLabProgress['routeCompletions']>]
  const completedModuleIds = current?.version === version ? current.completedModuleIds : []
  return {
    ...progress,
    routeCompletions: {
      ...progress.routeCompletions,
      [routeId]: {
        version,
        completedModuleIds: Array.from(new Set([...completedModuleIds, moduleId])),
      },
    },
    lastVisitedModuleId: moduleId,
  }
}

export function appendQuizAttempt(
  progress: MathLabProgress,
  attempt: QuizAttempt,
): MathLabProgress {
  return {
    ...progress,
    quizAttempts: [...progress.quizAttempts, attempt],
    weakConceptTags: Array.from(new Set([...progress.weakConceptTags, ...attempt.misconceptionTags])),
    lastVisitedModuleId: attempt.moduleId,
  }
}

export const mathLabProgressStorageKey = STORAGE_KEY
