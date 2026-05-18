import type { DataLabModuleId, DataLabProgress, DataQuizAttempt } from '../types/dataLab'

const STORAGE_KEY = 'ml-atlas:data-lab-progress:v1'

export interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export function createDefaultDataLabProgress(now = new Date().toISOString()): DataLabProgress {
  return {
    completedModuleIds: [],
    quizAttempts: [],
    updatedAt: now,
  }
}

function getStorage(storage?: StorageLike) {
  if (storage) return storage
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

export function loadDataLabProgress(storage?: StorageLike): DataLabProgress {
  const resolvedStorage = getStorage(storage)
  if (!resolvedStorage) return createDefaultDataLabProgress()

  try {
    const raw = resolvedStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultDataLabProgress()
    const parsed = JSON.parse(raw) as DataLabProgress

    return {
      ...createDefaultDataLabProgress(parsed.updatedAt),
      ...parsed,
      completedModuleIds: parsed.completedModuleIds ?? [],
      quizAttempts: parsed.quizAttempts ?? [],
    }
  } catch {
    return createDefaultDataLabProgress()
  }
}

export function saveDataLabProgress(progress: DataLabProgress, storage?: StorageLike) {
  const resolvedStorage = getStorage(storage)
  if (!resolvedStorage) return progress

  const nextProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  }
  resolvedStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress))
  return nextProgress
}

export function clearDataLabProgress(storage?: StorageLike) {
  getStorage(storage)?.removeItem(STORAGE_KEY)
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

