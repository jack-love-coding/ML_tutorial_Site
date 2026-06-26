import { dataLabProgressStorageKey } from '../modules/data-lab/utils/progress.ts'
import { mathLabProgressStorageKey } from '../modules/math-lab/utils/progress.ts'
import { algorithmProgressStorageKey } from '../utils/algorithmProgress.ts'
import type { StorageLike } from '../utils/progressStorage.ts'
import {
  coreLearningPathModuleIds,
  curriculumRouteManifestById,
} from './routeManifest.ts'
import { resolveCanonicalLearnRoute } from './routes.ts'
import type { CurriculumSourceNamespace } from './types.ts'

export const learningProgressV2StorageKey = 'ml-atlas:learning-progress:v2'
export const learningProgressV2MigrationKey = 'ml-atlas:learning-progress:v2:migration'

export interface LearningProgressQuizAttempt {
  id: string
  source: CurriculumSourceNamespace
  moduleId: string
  quizId: string
  correct: boolean
  attemptedAt: string
  misconceptionTags: string[]
}

export interface LearningProgressModuleState {
  moduleId: string
  source: CurriculumSourceNamespace
  completed: boolean
  completedAt?: string
  lastVisitedAt?: string
  attempts: LearningProgressQuizAttempt[]
}

export interface LearningProgressLastVisited {
  moduleId: string
  source: CurriculumSourceNamespace
  route: string
  visitedAt: string
}

export interface LearningProgressMigrationMarker {
  schemaVersion: 1
  sourceFingerprint: string
  migratedAt: string
  sourceKeys: string[]
}

export interface LearningProgressV2 {
  schemaVersion: 1
  modules: Record<string, LearningProgressModuleState>
  weakConceptTags: string[]
  lastVisited?: LearningProgressLastVisited
  migration?: LearningProgressMigrationMarker
  updatedAt: string
}

export interface ContinueLearningTarget {
  moduleId: string
  lessonId?: string
  route: string
  reason: 'last-visited' | 'first-incomplete'
}

const v1SourceKeys = [
  algorithmProgressStorageKey,
  mathLabProgressStorageKey,
  dataLabProgressStorageKey,
]

const legacyModuleRedirects: Record<string, string> = {
  'beginner-calculus': 'calculus-functions-rate-change',
}

function progressStorage(storage?: StorageLike) {
  if (storage) return storage
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function booleanValue(value: unknown) {
  return value === true
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function objectArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    : []
}

function objectRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function parseJsonObject(raw: string | null) {
  if (!raw) return undefined

  try {
    return objectRecord(JSON.parse(raw))
  } catch {
    return undefined
  }
}

function canonicalModuleId(moduleId: string | undefined) {
  if (!moduleId) return undefined
  const redirectedModuleId = legacyModuleRedirects[moduleId] ?? moduleId
  return curriculumRouteManifestById.has(redirectedModuleId) ? redirectedModuleId : undefined
}

function moduleSource(moduleId: string) {
  return curriculumRouteManifestById.get(moduleId)?.source
}

function moduleRoute(moduleId: string) {
  return resolveCanonicalLearnRoute(moduleId) ?? curriculumRouteManifestById.get(moduleId)?.route ?? '/'
}

function createModuleState(moduleId: string): LearningProgressModuleState | undefined {
  const source = moduleSource(moduleId)
  if (!source) return undefined

  return {
    moduleId,
    source,
    completed: false,
    attempts: [],
  }
}

function createAttemptId(
  source: CurriculumSourceNamespace,
  moduleId: string,
  quizId: string,
  attemptedAt: string,
) {
  return `${source}:${moduleId}:${quizId}:${attemptedAt}`
}

function sortAttempts(attempts: LearningProgressQuizAttempt[]) {
  return [...attempts].sort(
    (left, right) =>
      left.attemptedAt.localeCompare(right.attemptedAt) || left.id.localeCompare(right.id),
  )
}

function mergeAttempts(
  existingAttempts: LearningProgressQuizAttempt[],
  incomingAttempts: LearningProgressQuizAttempt[],
) {
  const byId = new Map(existingAttempts.map((attempt) => [attempt.id, attempt]))

  for (const attempt of incomingAttempts) {
    byId.set(attempt.id, attempt)
  }

  return sortAttempts([...byId.values()])
}

function addUniqueStrings(existing: string[], incoming: string[]) {
  return Array.from(new Set([...existing, ...incoming]))
}

function upsertModule(
  progress: LearningProgressV2,
  moduleId: string,
  patch: Partial<Omit<LearningProgressModuleState, 'moduleId' | 'source'>>,
) {
  const initialState = progress.modules[moduleId] ?? createModuleState(moduleId)
  if (!initialState) return

  const attempts = mergeAttempts(initialState.attempts, patch.attempts ?? [])
  progress.modules[moduleId] = {
    ...initialState,
    completed: initialState.completed || patch.completed === true,
    completedAt: initialState.completedAt ?? patch.completedAt,
    lastVisitedAt: latestTimestamp(initialState.lastVisitedAt, patch.lastVisitedAt),
    attempts,
  }
}

function latestTimestamp(left?: string, right?: string) {
  if (!left) return right
  if (!right) return left
  return left >= right ? left : right
}

function setLastVisited(progress: LearningProgressV2, moduleId: string, visitedAt: string) {
  const source = moduleSource(moduleId)
  if (!source) return

  if (progress.lastVisited && progress.lastVisited.visitedAt > visitedAt) return

  progress.lastVisited = {
    moduleId,
    source,
    route: moduleRoute(moduleId),
    visitedAt,
  }
  upsertModule(progress, moduleId, { lastVisitedAt: visitedAt })
}

export function createDefaultLearningProgressV2(now = new Date().toISOString()): LearningProgressV2 {
  return {
    schemaVersion: 1,
    modules: {},
    weakConceptTags: [],
    updatedAt: now,
  }
}

function normalizeAttempt(value: unknown) {
  const attempt = objectRecord(value)
  if (!attempt) return undefined

  const source = stringValue(attempt.source)
  const moduleId = canonicalModuleId(stringValue(attempt.moduleId))
  const quizId = stringValue(attempt.quizId)
  const attemptedAt = stringValue(attempt.attemptedAt)

  if (
    !moduleId ||
    !quizId ||
    !attemptedAt ||
    (source !== 'algorithm' && source !== 'math-lab' && source !== 'data-lab')
  ) {
    return undefined
  }

  return {
    id: stringValue(attempt.id) ?? createAttemptId(source, moduleId, quizId, attemptedAt),
    source,
    moduleId,
    quizId,
    correct: booleanValue(attempt.correct),
    attemptedAt,
    misconceptionTags: stringArray(attempt.misconceptionTags),
  } satisfies LearningProgressQuizAttempt
}

function normalizeModuleState(value: unknown) {
  const state = objectRecord(value)
  if (!state) return undefined

  const moduleId = canonicalModuleId(stringValue(state.moduleId))
  if (!moduleId) return undefined

  const initialState = createModuleState(moduleId)
  if (!initialState) return undefined

  return {
    ...initialState,
    completed: booleanValue(state.completed),
    completedAt: stringValue(state.completedAt),
    lastVisitedAt: stringValue(state.lastVisitedAt),
    attempts: sortAttempts(objectArray(state.attempts).flatMap((attempt) => {
      const normalized = normalizeAttempt(attempt)
      return normalized ? [normalized] : []
    })),
  } satisfies LearningProgressModuleState
}

export function loadLearningProgressV2(storage?: StorageLike, now = new Date().toISOString()): LearningProgressV2 {
  const resolvedStorage = progressStorage(storage)
  if (!resolvedStorage) return createDefaultLearningProgressV2(now)

  const parsed = parseJsonObject(resolvedStorage.getItem(learningProgressV2StorageKey))
  if (!parsed) return createDefaultLearningProgressV2(now)

  const modules: Record<string, LearningProgressModuleState> = {}
  const parsedModules = objectRecord(parsed.modules) ?? {}

  for (const value of Object.values(parsedModules)) {
    const moduleState = normalizeModuleState(value)
    if (moduleState) modules[moduleState.moduleId] = moduleState
  }

  const progress: LearningProgressV2 = {
    schemaVersion: 1,
    modules,
    weakConceptTags: stringArray(parsed.weakConceptTags),
    updatedAt: stringValue(parsed.updatedAt) ?? now,
  }

  const lastVisited = objectRecord(parsed.lastVisited)
  const lastVisitedModuleId = canonicalModuleId(stringValue(lastVisited?.moduleId))
  const lastVisitedAt = stringValue(lastVisited?.visitedAt)
  if (lastVisitedModuleId && lastVisitedAt) {
    setLastVisited(progress, lastVisitedModuleId, lastVisitedAt)
  }

  const migration = objectRecord(parsed.migration)
  const sourceFingerprint = stringValue(migration?.sourceFingerprint)
  const migratedAt = stringValue(migration?.migratedAt)
  if (sourceFingerprint && migratedAt) {
    progress.migration = {
      schemaVersion: 1,
      sourceFingerprint,
      migratedAt,
      sourceKeys: stringArray(migration?.sourceKeys),
    }
  }

  return progress
}

function writeLearningProgressV2(progress: LearningProgressV2, storage: StorageLike) {
  storage.setItem(learningProgressV2StorageKey, JSON.stringify(progress))
}

export function saveLearningProgressV2(
  progress: LearningProgressV2,
  storage?: StorageLike,
  now = new Date().toISOString(),
) {
  const resolvedStorage = progressStorage(storage)
  const nextProgress = { ...progress, updatedAt: now }
  if (resolvedStorage) writeLearningProgressV2(nextProgress, resolvedStorage)
  return nextProgress
}

function cloneProgress(progress: LearningProgressV2): LearningProgressV2 {
  return {
    schemaVersion: 1,
    modules: Object.fromEntries(
      Object.entries(progress.modules).map(([moduleId, state]) => [
        moduleId,
        {
          ...state,
          attempts: state.attempts.map((attempt) => ({
            ...attempt,
            misconceptionTags: [...attempt.misconceptionTags],
          })),
        },
      ]),
    ),
    weakConceptTags: [...progress.weakConceptTags],
    lastVisited: progress.lastVisited ? { ...progress.lastVisited } : undefined,
    migration: progress.migration
      ? {
          ...progress.migration,
          sourceKeys: [...progress.migration.sourceKeys],
        }
      : undefined,
    updatedAt: progress.updatedAt,
  }
}

function sourceFingerprint(storage: StorageLike) {
  return v1SourceKeys.map((key) => `${key}:${storage.getItem(key) ?? ''}`).join('\n')
}

function loadMigrationMarker(storage: StorageLike): LearningProgressMigrationMarker | undefined {
  const parsed = parseJsonObject(storage.getItem(learningProgressV2MigrationKey))
  const sourceFingerprintValue = stringValue(parsed?.sourceFingerprint)
  const migratedAt = stringValue(parsed?.migratedAt)

  if (!sourceFingerprintValue || !migratedAt) return undefined

  return {
    schemaVersion: 1,
    sourceFingerprint: sourceFingerprintValue,
    migratedAt,
    sourceKeys: stringArray(parsed?.sourceKeys),
  }
}

function writeMigrationMarker(marker: LearningProgressMigrationMarker, storage: StorageLike) {
  storage.setItem(learningProgressV2MigrationKey, JSON.stringify(marker))
}

function mergeCompletedModules(
  progress: LearningProgressV2,
  moduleIds: string[],
  completedAt: string,
) {
  for (const sourceModuleId of moduleIds) {
    const moduleId = canonicalModuleId(sourceModuleId)
    if (moduleId) upsertModule(progress, moduleId, { completed: true, completedAt })
  }
}

function mergeAlgorithmProgress(progress: LearningProgressV2, parsed: Record<string, unknown>, now: string) {
  const updatedAt = stringValue(parsed.updatedAt) ?? now
  mergeCompletedModules(progress, stringArray(parsed.completedModuleSlugs), updatedAt)

  const lastVisitedModuleId = canonicalModuleId(stringValue(parsed.lastVisitedModuleSlug))
  if (lastVisitedModuleId) setLastVisited(progress, lastVisitedModuleId, updatedAt)

  for (const attempt of objectArray(parsed.quizAttempts)) {
    const moduleId = canonicalModuleId(stringValue(attempt.moduleSlug))
    const quizId = stringValue(attempt.quizId)
    const attemptedAt = stringValue(attempt.attemptedAt) ?? updatedAt
    if (!moduleId || !quizId) continue

    upsertModule(progress, moduleId, {
      attempts: [
        {
          id: createAttemptId('algorithm', moduleId, quizId, attemptedAt),
          source: 'algorithm',
          moduleId,
          quizId,
          correct: booleanValue(attempt.correct),
          attemptedAt,
          misconceptionTags: stringArray(attempt.misconceptionTags),
        },
      ],
    })
  }
}

function mergeMathLabProgress(progress: LearningProgressV2, parsed: Record<string, unknown>, now: string) {
  const updatedAt = stringValue(parsed.updatedAt) ?? now
  mergeCompletedModules(progress, stringArray(parsed.completedModuleIds), updatedAt)
  progress.weakConceptTags = addUniqueStrings(progress.weakConceptTags, stringArray(parsed.weakConceptTags))

  const lastVisitedModuleId = canonicalModuleId(stringValue(parsed.lastVisitedModuleId))
  if (lastVisitedModuleId) setLastVisited(progress, lastVisitedModuleId, updatedAt)

  for (const attempt of objectArray(parsed.quizAttempts)) {
    const moduleId = canonicalModuleId(stringValue(attempt.moduleId))
    const quizId = stringValue(attempt.quizId)
    const attemptedAt = stringValue(attempt.attemptedAt) ?? updatedAt
    if (!moduleId || !quizId) continue

    upsertModule(progress, moduleId, {
      attempts: [
        {
          id: createAttemptId('math-lab', moduleId, quizId, attemptedAt),
          source: 'math-lab',
          moduleId,
          quizId,
          correct: booleanValue(attempt.correct),
          attemptedAt,
          misconceptionTags: stringArray(attempt.misconceptionTags),
        },
      ],
    })
  }
}

function mergeDataLabProgress(progress: LearningProgressV2, parsed: Record<string, unknown>, now: string) {
  const updatedAt = stringValue(parsed.updatedAt) ?? now
  mergeCompletedModules(progress, stringArray(parsed.completedModuleIds), updatedAt)

  const lastVisitedModuleId = canonicalModuleId(stringValue(parsed.lastVisitedModuleId))
  if (lastVisitedModuleId) setLastVisited(progress, lastVisitedModuleId, updatedAt)

  for (const attempt of objectArray(parsed.quizAttempts)) {
    const moduleId = canonicalModuleId(stringValue(attempt.moduleId))
    const quizId = stringValue(attempt.quizId)
    const attemptedAt = stringValue(attempt.attemptedAt) ?? updatedAt
    if (!moduleId || !quizId) continue

    upsertModule(progress, moduleId, {
      attempts: [
        {
          id: createAttemptId('data-lab', moduleId, quizId, attemptedAt),
          source: 'data-lab',
          moduleId,
          quizId,
          correct: booleanValue(attempt.correct),
          attemptedAt,
          misconceptionTags: [],
        },
      ],
    })
  }
}

function latestV1UpdatedAt(storage: StorageLike, now: string) {
  return v1SourceKeys.reduce((latest, key) => {
    const updatedAt = stringValue(parseJsonObject(storage.getItem(key))?.updatedAt)
    return latestTimestamp(latest, updatedAt) ?? latest
  }, now)
}

export function migrateLearningProgressV2(
  storage?: StorageLike,
  now = new Date().toISOString(),
): LearningProgressV2 {
  const resolvedStorage = progressStorage(storage)
  if (!resolvedStorage) return createDefaultLearningProgressV2(now)

  const fingerprint = sourceFingerprint(resolvedStorage)
  const existingRaw = resolvedStorage.getItem(learningProgressV2StorageKey)
  const marker = loadMigrationMarker(resolvedStorage)
  const existing = loadLearningProgressV2(resolvedStorage, now)

  if (existingRaw && marker?.sourceFingerprint === fingerprint) {
    return existing
  }

  const nextProgress = cloneProgress(existing)
  const algorithmProgress = parseJsonObject(resolvedStorage.getItem(algorithmProgressStorageKey))
  const mathLabProgress = parseJsonObject(resolvedStorage.getItem(mathLabProgressStorageKey))
  const dataLabProgress = parseJsonObject(resolvedStorage.getItem(dataLabProgressStorageKey))

  if (algorithmProgress) mergeAlgorithmProgress(nextProgress, algorithmProgress, now)
  if (mathLabProgress) mergeMathLabProgress(nextProgress, mathLabProgress, now)
  if (dataLabProgress) mergeDataLabProgress(nextProgress, dataLabProgress, now)

  const migratedAt = latestV1UpdatedAt(resolvedStorage, now)
  const migration: LearningProgressMigrationMarker = {
    schemaVersion: 1,
    sourceFingerprint: fingerprint,
    migratedAt,
    sourceKeys: [...v1SourceKeys],
  }

  nextProgress.migration = migration
  nextProgress.updatedAt = migratedAt
  writeLearningProgressV2(nextProgress, resolvedStorage)
  writeMigrationMarker(migration, resolvedStorage)

  return nextProgress
}

function targetForModule(moduleId: string, reason: ContinueLearningTarget['reason']) {
  const moduleDefinition = curriculumRouteManifestById.get(moduleId)
  if (!moduleDefinition) return undefined

  const lessonId = moduleDefinition.firstLessonId
  const route = resolveCanonicalLearnRoute(moduleId, lessonId) ?? moduleDefinition.route

  return {
    moduleId,
    lessonId,
    route,
    reason,
  } satisfies ContinueLearningTarget
}

export function selectContinueLearning(progress: LearningProgressV2): ContinueLearningTarget | undefined {
  const lastVisitedModuleId = progress.lastVisited?.moduleId
  if (lastVisitedModuleId && !progress.modules[lastVisitedModuleId]?.completed) {
    return targetForModule(lastVisitedModuleId, 'last-visited')
  }

  for (const moduleId of coreLearningPathModuleIds) {
    if (!progress.modules[moduleId]?.completed) {
      return targetForModule(moduleId, 'first-incomplete')
    }
  }

  return undefined
}
