import { importedMathNotes } from './importedMathNotes.generated.ts'
import { aiBridgeModules } from './aiBridgeModules.ts'
import { buildConditionNumbersModule } from './conditionNumbersModule.ts'
import { buildEigenvaluesModule } from './eigenvaluesModule.ts'
import { buildFiniteDifferenceModule } from './finiteDifferenceModule.ts'
import { buildLeastSquaresModule } from './leastSquaresModule.ts'
import { buildLuDecompositionModule } from './luDecompositionModule.ts'
import { buildMarkovChainsModule } from './markovChainsModule.ts'
import { mathFoundationsModules } from './mathFoundationsModules.ts'
import { buildMonteCarloModule } from './monteCarloModule.ts'
import { buildNonlinearEquationsModule } from './nonlinearEquationsModule.ts'
import { buildOptimizationModule } from './optimizationModule.ts'
import { buildPcaModule } from './pcaModule.ts'
import { buildSparseMatricesModule } from './sparseMatricesModule.ts'
import { buildSvdModule } from './svdModule.ts'
import { buildTaylorSeriesModule } from './taylorSeriesModule.ts'
import { buildVectorMatrixNormsModule } from './vectorMatrixNormsModule.ts'
import type { MathLabModule, MathLabModuleId } from '../types/mathLab'

const supplementalModules = Object.fromEntries(
  mathFoundationsModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
) as Record<MathLabModuleId, MathLabModule | undefined>

const aiMathPath: MathLabModuleId[] = [
  'vectors-matrices-norms',
  'tensor-shapes-vectorization',
  'taylor-series',
  'matrix-calculus-autodiff',
  'monte-carlo',
  'probability-likelihood-entropy',
  'lu-decomposition',
  'sparse-matrices',
  'condition-numbers',
  'eigenvalues-eigenvectors',
  'markov-chains',
  'finite-difference-methods',
  'nonlinear-equations',
  'optimization',
  'training-diagnostics',
  'least-squares-fitting',
  'svd',
  'pca',
  'deep-architecture-math',
]

const importedFoundationModules: MathLabModule[] = importedMathNotes.map((moduleDefinition) => {
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

  if (moduleDefinition.id === 'condition-numbers') {
    return buildConditionNumbersModule(moduleDefinition)
  }

  if (moduleDefinition.id === 'eigenvalues-eigenvectors') {
    return buildEigenvaluesModule(moduleDefinition)
  }

  if (moduleDefinition.id === 'markov-chains') {
    return buildMarkovChainsModule(moduleDefinition)
  }

  if (moduleDefinition.id === 'finite-difference-methods') {
    return buildFiniteDifferenceModule(moduleDefinition)
  }

  if (moduleDefinition.id === 'nonlinear-equations') {
    return buildNonlinearEquationsModule(moduleDefinition)
  }

  if (moduleDefinition.id === 'optimization') {
    return buildOptimizationModule(moduleDefinition)
  }

  if (moduleDefinition.id === 'least-squares-fitting') {
    return buildLeastSquaresModule(moduleDefinition)
  }

  if (moduleDefinition.id === 'svd') {
    return buildSvdModule(moduleDefinition)
  }

  if (moduleDefinition.id === 'pca') {
    return buildPcaModule(moduleDefinition)
  }

  const supplement = supplementalModules[moduleDefinition.id]

  return {
    ...moduleDefinition,
    visuals: supplement?.visuals ?? [],
    labs: supplement?.labs ?? [],
  }
})

const allModulesById = Object.fromEntries(
  [...importedFoundationModules, ...aiBridgeModules].map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
) as Record<MathLabModuleId, MathLabModule | undefined>

export const mathLabModules: MathLabModule[] = aiMathPath.map((moduleId, index) => {
  const moduleDefinition = allModulesById[moduleId]

  if (!moduleDefinition) {
    throw new Error(`Missing math lab module: ${moduleId}`)
  }

  return {
    ...moduleDefinition,
    order: index + 6,
    nextModuleIds: aiMathPath[index + 1] ? [aiMathPath[index + 1]] : [],
  }
})

export const mathLabModuleRegistry = Object.fromEntries(
  mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
) as Record<MathLabModuleId, MathLabModule>
