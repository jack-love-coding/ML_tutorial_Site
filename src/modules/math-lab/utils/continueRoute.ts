import { mathLabModuleSummaries as mathLabModules } from '../../../curriculum/generated/mathSummaries.ts'
import type { MathLabModuleId, MathLabProgress } from '../types/mathLab'

const legacyModuleRedirects: Record<string, MathLabModuleId> = {
  'beginner-calculus': 'calculus-functions-rate-change',
}

export function resolveMathLabModuleId(moduleId?: MathLabModuleId): MathLabModuleId | undefined {
  if (!moduleId) return undefined
  const redirectedModuleId = legacyModuleRedirects[moduleId] ?? moduleId
  return mathLabModules.some(module => module.id === redirectedModuleId) ? redirectedModuleId : undefined
}

export function continueMathLabModuleId(progress: Pick<MathLabProgress, 'diagnosticResult' | 'lastVisitedModuleId'>): MathLabModuleId {
  return resolveMathLabModuleId(progress.lastVisitedModuleId)
    ?? resolveMathLabModuleId(progress.diagnosticResult?.recommendedStartModuleId)
    ?? mathLabModules[0]?.id
    ?? 'taylor-series'
}
