import { importedMathNotes } from './importedMathNotes.generated.ts'
import { buildLuDecompositionModule } from './luDecompositionModule.ts'
import { mathFoundationsModules } from './mathFoundationsModules.ts'
import { buildMonteCarloModule } from './monteCarloModule.ts'
import { buildSparseMatricesModule } from './sparseMatricesModule.ts'
import { buildTaylorSeriesModule } from './taylorSeriesModule.ts'
import { buildVectorMatrixNormsModule } from './vectorMatrixNormsModule.ts'
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

  if (moduleDefinition.id === 'vectors-matrices-norms') {
    return buildVectorMatrixNormsModule(moduleDefinition)
  }

  if (moduleDefinition.id === 'lu-decomposition') {
    return buildLuDecompositionModule(moduleDefinition)
  }

  if (moduleDefinition.id === 'sparse-matrices') {
    return buildSparseMatricesModule(moduleDefinition)
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
