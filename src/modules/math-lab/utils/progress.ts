import type {
  DiagnosticResult,
  MathLabModuleId,
  MathLabProgress,
  QuizAttempt,
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
    }),
    storage,
  )
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
