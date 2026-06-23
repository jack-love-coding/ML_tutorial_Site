import { mathLabModuleRegistry, mathLabModules } from '../data/modules.ts'
import type { MathLabModuleId, MathLabProgress } from '../types/mathLab'

const legacyModuleRedirects: Record<string, MathLabModuleId> = {
  'beginner-calculus': 'calculus-functions-rate-change',
}

export function resolveMathLabModuleId(moduleId?: MathLabModuleId): MathLabModuleId | undefined {
  if (!moduleId) return undefined
  const redirectedModuleId = legacyModuleRedirects[moduleId] ?? moduleId
  return mathLabModuleRegistry[redirectedModuleId] ? redirectedModuleId : undefined
}

export function continueMathLabModuleId(progress: Pick<MathLabProgress, 'diagnosticResult' | 'lastVisitedModuleId'>): MathLabModuleId {
  return resolveMathLabModuleId(progress.lastVisitedModuleId)
    ?? resolveMathLabModuleId(progress.diagnosticResult?.recommendedStartModuleId)
    ?? mathLabModules[0]?.id
    ?? 'taylor-series'
}
