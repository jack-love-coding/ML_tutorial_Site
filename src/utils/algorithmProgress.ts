import type { AlgorithmProgress, AlgorithmQuizAttempt, ModuleSlug } from '../types/ml'

const STORAGE_KEY = 'ml-atlas:algorithm-progress:v1'

export interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export function createDefaultAlgorithmProgress(now = new Date().toISOString()): AlgorithmProgress {
  return {
    completedModuleSlugs: [],
    quizAttempts: [],
    updatedAt: now,
  }
}

function getStorage(storage?: StorageLike) {
  if (storage) return storage
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

export function loadAlgorithmProgress(storage?: StorageLike): AlgorithmProgress {
  const resolvedStorage = getStorage(storage)
  if (!resolvedStorage) return createDefaultAlgorithmProgress()

  try {
    const raw = resolvedStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultAlgorithmProgress()
    const parsed = JSON.parse(raw) as AlgorithmProgress

    return {
      ...createDefaultAlgorithmProgress(parsed.updatedAt),
      ...parsed,
      completedModuleSlugs: parsed.completedModuleSlugs ?? [],
      quizAttempts: parsed.quizAttempts ?? [],
    }
  } catch {
    return createDefaultAlgorithmProgress()
  }
}

export function saveAlgorithmProgress(progress: AlgorithmProgress, storage?: StorageLike) {
  const resolvedStorage = getStorage(storage)
  if (!resolvedStorage) return progress

  const nextProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  }
  resolvedStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress))
  return nextProgress
}

export function clearAlgorithmProgress(storage?: StorageLike) {
  getStorage(storage)?.removeItem(STORAGE_KEY)
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
