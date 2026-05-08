import { importedMathNotes } from './importedMathNotes.generated.ts'
import { mathFoundationsModules } from './mathFoundationsModules.ts'
import { buildMonteCarloModule } from './monteCarloModule.ts'
import { buildTaylorSeriesModule } from './taylorSeriesModule.ts'
import type { MathLabModule, MathLabModuleId } from '../types/mathLab'

const supplementalModules = Object.fromEntries(
  mathFoundationsModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
) as Record<MathLabModuleId, MathLabModule | undefined>

export const mathLabModules: MathLabModule[] = importedMathNotes.map((moduleDefinition) => {
  if (moduleDefinition.id === 'taylor-series') {
    return buildTaylorSeriesModule(moduleDefinition)
  }

  if (moduleDefinition.id === 'monte-carlo') {
    return buildMonteCarloModule(moduleDefinition)
  }

  const supplement = supplementalModules[moduleDefinition.id]

  return {
    ...moduleDefinition,
    visuals: supplement?.visuals ?? [],
    labs: supplement?.labs ?? [],
  }
})

export const mathLabModuleRegistry = Object.fromEntries(
  mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
) as Record<MathLabModuleId, MathLabModule>
