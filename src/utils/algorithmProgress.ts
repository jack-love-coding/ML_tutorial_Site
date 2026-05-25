import type { AlgorithmProgress, AlgorithmQuizAttempt, ModuleSlug } from '../types/ml'
import {
  clearJsonProgress,
  loadJsonProgress,
  saveJsonProgress,
  type StorageLike,
} from './progressStorage.ts'

export type { StorageLike } from './progressStorage.ts'

const STORAGE_KEY = 'ml-atlas:algorithm-progress:v1'

export function createDefaultAlgorithmProgress(now = new Date().toISOString()): AlgorithmProgress {
  return {
    completedModuleSlugs: [],
    quizAttempts: [],
    updatedAt: now,
  }
}

export function loadAlgorithmProgress(storage?: StorageLike): AlgorithmProgress {
  return loadJsonProgress(
    STORAGE_KEY,
    createDefaultAlgorithmProgress,
    (parsed, fallback) => ({
      ...fallback,
      ...parsed,
      completedModuleSlugs: parsed.completedModuleSlugs ?? [],
      quizAttempts: parsed.quizAttempts ?? [],
    }),
    storage,
  )
}

export function saveAlgorithmProgress(progress: AlgorithmProgress, storage?: StorageLike) {
  return saveJsonProgress(STORAGE_KEY, progress, storage)
}

export function clearAlgorithmProgress(storage?: StorageLike) {
  clearJsonProgress(STORAGE_KEY, storage)
}

export function setLastVisitedAlgorithmModule(
  progress: AlgorithmProgress,
  moduleSlug: ModuleSlug,
): AlgorithmProgress {
  return {
    ...progress,
    lastVisitedModuleSlug: moduleSlug,
  }
}

export function markAlgorithmModuleComplete(
  progress: AlgorithmProgress,
  moduleSlug: ModuleSlug,
): AlgorithmProgress {
  return {
    ...progress,
    completedModuleSlugs: Array.from(new Set([...progress.completedModuleSlugs, moduleSlug])),
    lastVisitedModuleSlug: moduleSlug,
  }
}

export function appendAlgorithmQuizAttempt(
  progress: AlgorithmProgress,
  attempt: AlgorithmQuizAttempt,
): AlgorithmProgress {
  return {
    ...progress,
    quizAttempts: [...progress.quizAttempts, attempt],
    lastVisitedModuleSlug: attempt.moduleSlug,
  }
}

export function shouldCompleteAlgorithmModule(
  attempts: Array<Pick<AlgorithmQuizAttempt, 'correct'>>,
  requiredRatio = 0.66,
) {
  if (!attempts.length) return false
  const correct = attempts.filter((attempt) => attempt.correct).length
  return correct / attempts.length >= requiredRatio
}

export const algorithmProgressStorageKey = STORAGE_KEY
