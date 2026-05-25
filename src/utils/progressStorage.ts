export interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

function getProgressStorage(storage?: StorageLike) {
  if (storage) return storage
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

export function loadJsonProgress<TProgress extends { updatedAt: string }>(
  storageKey: string,
  createDefault: (now?: string) => TProgress,
  normalize: (parsed: Partial<TProgress>, fallback: TProgress) => TProgress,
  storage?: StorageLike,
): TProgress {
  const resolvedStorage = getProgressStorage(storage)
  if (!resolvedStorage) return createDefault()

  try {
    const raw = resolvedStorage.getItem(storageKey)
    if (!raw) return createDefault()

    const parsed = JSON.parse(raw) as Partial<TProgress> | null
    if (!parsed || typeof parsed !== 'object') return createDefault()

    const fallback = createDefault(typeof parsed.updatedAt === 'string' ? parsed.updatedAt : undefined)
    return normalize(parsed, fallback)
  } catch {
    return createDefault()
  }
}

export function saveJsonProgress<TProgress extends { updatedAt: string }>(
  storageKey: string,
  progress: TProgress,
  storage?: StorageLike,
): TProgress {
  const resolvedStorage = getProgressStorage(storage)
  if (!resolvedStorage) return progress

  const nextProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  }
  resolvedStorage.setItem(storageKey, JSON.stringify(nextProgress))
  return nextProgress
}

export function clearJsonProgress(storageKey: string, storage?: StorageLike) {
  getProgressStorage(storage)?.removeItem(storageKey)
}
