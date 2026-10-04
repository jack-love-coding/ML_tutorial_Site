import type { MathLabModule, MathLabModuleSummary } from '../types/mathLab.ts'

export function summarizeMathModule(module: MathLabModule): MathLabModuleSummary {
  const { id, order, title, subtitle, difficulty, estimatedMinutes, prerequisites, nextModuleIds, accent, theme } = module
  return { id, order, title, subtitle, difficulty, estimatedMinutes, prerequisites, nextModuleIds, accent, theme }
}
