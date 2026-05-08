import type {
  DiagnosticResult,
  MathLabModuleId,
  MathLabProgress,
  QuizAttempt,
} from '../types/mathLab'

const STORAGE_KEY = 'ml-atlas:math-lab-progress:v1'

export interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export function createDefaultProgress(now = new Date().toISOString()): MathLabProgress {
  return {
    completedModuleIds: [],
    quizAttempts: [],
    weakConceptTags: [],
    mastery: [],
    updatedAt: now,
  }
}

function getStorage(storage?: StorageLike) {
  if (storage) return storage
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

export function loadMathLabProgress(storage?: StorageLike): MathLabProgress {
  const resolvedStorage = getStorage(storage)
  if (!resolvedStorage) return createDefaultProgress()

  try {
    const raw = resolvedStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultProgress()
    const parsed = JSON.parse(raw) as MathLabProgress
    return {
      ...createDefaultProgress(parsed.updatedAt),
      ...parsed,
      completedModuleIds: parsed.completedModuleIds ?? [],
      quizAttempts: parsed.quizAttempts ?? [],
      weakConceptTags: parsed.weakConceptTags ?? [],
      mastery: parsed.mastery ?? [],
    }
  } catch {
    return createDefaultProgress()
  }
}

export function saveMathLabProgress(progress: MathLabProgress, storage?: StorageLike) {
  const resolvedStorage = getStorage(storage)
  if (!resolvedStorage) return progress

  const nextProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  }
  resolvedStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress))
  return nextProgress
}

export function clearMathLabProgress(storage?: StorageLike) {
  getStorage(storage)?.removeItem(STORAGE_KEY)
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
