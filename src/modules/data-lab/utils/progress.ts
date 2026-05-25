import type { DataLabModuleId, DataLabProgress, DataQuizAttempt } from '../types/dataLab'
import {
  clearJsonProgress,
  loadJsonProgress,
  saveJsonProgress,
  type StorageLike,
} from '../../../utils/progressStorage.ts'

const STORAGE_KEY = 'ml-atlas:data-lab-progress:v1'

export type { StorageLike } from '../../../utils/progressStorage.ts'

export function createDefaultDataLabProgress(now = new Date().toISOString()): DataLabProgress {
  return {
    completedModuleIds: [],
    quizAttempts: [],
    updatedAt: now,
  }
}

export function loadDataLabProgress(storage?: StorageLike): DataLabProgress {
  return loadJsonProgress(
    STORAGE_KEY,
    createDefaultDataLabProgress,
    (parsed, fallback) => ({
      ...fallback,
      ...parsed,
      completedModuleIds: parsed.completedModuleIds ?? [],
      quizAttempts: parsed.quizAttempts ?? [],
    }),
    storage,
  )
}

export function saveDataLabProgress(progress: DataLabProgress, storage?: StorageLike) {
  return saveJsonProgress(STORAGE_KEY, progress, storage)
}

export function clearDataLabProgress(storage?: StorageLike) {
  clearJsonProgress(STORAGE_KEY, storage)
}

export function setLastVisitedDataLabModule(
  progress: DataLabProgress,
  moduleId: DataLabModuleId,
): DataLabProgress {
  return {
    ...progress,
    lastVisitedModuleId: moduleId,
  }
}

export function markDataLabModuleComplete(
  progress: DataLabProgress,
  moduleId: DataLabModuleId,
): DataLabProgress {
  return {
    ...progress,
    completedModuleIds: Array.from(new Set([...progress.completedModuleIds, moduleId])),
    lastVisitedModuleId: moduleId,
  }
}

export function appendDataQuizAttempt(
  progress: DataLabProgress,
  attempt: DataQuizAttempt,
): DataLabProgress {
  return {
    ...progress,
    quizAttempts: [...progress.quizAttempts, attempt],
    lastVisitedModuleId: attempt.moduleId,
  }
}

export const dataLabProgressStorageKey = STORAGE_KEY

