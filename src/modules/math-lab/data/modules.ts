import { importedMathNotes } from './importedMathNotes.generated.ts'
import { aiBridgeModules } from './aiBridgeModules.ts'
import { enhanceAmesNumericalMethodsModule } from './amesNumericalMethodsModules.ts'
import { buildConditionNumbersModule } from './conditionNumbersModule.ts'
import { calculusOptimizationRouteModules } from './calculusOptimizationRouteModules.ts'
import { buildEigenvaluesModule } from './eigenvaluesModule.ts'
import { buildFiniteDifferenceModule } from './finiteDifferenceModule.ts'
import { buildLeastSquaresModule } from './leastSquaresModule.ts'
import { aiMathPathModuleIds } from './mathCourseOrder.ts'
import { buildLuDecompositionModule } from './luDecompositionModule.ts'
import { buildMarkovChainsModule } from './markovChainsModule.ts'
import { mathFoundationsModules } from './mathFoundationsModules.ts'
import { minimumFoundationBeginnerModules } from './minimumFoundationModules.ts'
import { buildMonteCarloModule } from './monteCarloModule.ts'
import { buildNonlinearEquationsModule } from './nonlinearEquationsModule.ts'
import { buildOptimizationModule } from './optimizationModule.ts'
import { buildPcaModule } from './pcaModule.ts'
import { enhanceProbabilityUncertaintyModule } from './probabilityUncertaintyRouteModules.ts'
import { buildSparseMatricesModule } from './sparseMatricesModule.ts'
import { enhanceSpectralRepresentationModule } from './spectralRepresentationModules.ts'
import { buildSvdModule } from './svdModule.ts'
import { buildTaylorSeriesModule } from './taylorSeriesModule.ts'
import { buildVectorMatrixNormsModule } from './vectorMatrixNormsModule.ts'
import {
  vectorMatrixLanguageMathToCodeModules,
  vectorMatrixLanguageRouteModules,
} from './vectorMatrixLanguageModules.ts'
import type { MathLabModule, MathLabModuleId } from '../types/mathLab'

export type MathLabModuleProviderName =
  | 'beginnerFoundationModules'
  | 'linearAlgebraRouteModules'
  | 'calculusRouteModules'
  | 'mathToCodeModules'
  | 'importedFoundationModules'
  | 'aiBridgeModules'

export interface MathLabModuleProvider {
  name: MathLabModuleProviderName
  modules: readonly MathLabModule[]
}

export interface MathLabModuleOverride {
  from: MathLabModuleProviderName
  to: MathLabModuleProviderName
}

export const mathLabModuleOverridePolicy = {
  'linear-algebra-feature-space': {
    from: 'linearAlgebraRouteModules',
    to: 'mathToCodeModules',
  },
  'linear-algebra-matrix-transformations': {
    from: 'linearAlgebraRouteModules',
    to: 'mathToCodeModules',
  },
  'calculus-functions-rate-change': {
    from: 'calculusRouteModules',
    to: 'mathToCodeModules',
  },
  'calculus-derivatives-local-change': {
    from: 'calculusRouteModules',
    to: 'mathToCodeModules',
  },
} as const satisfies Readonly<Record<MathLabModuleId, MathLabModuleOverride>>

export function assembleMathLabModules(
  providers: readonly MathLabModuleProvider[],
  overridePolicy: Readonly<Record<MathLabModuleId, MathLabModuleOverride>>,
) {
  const modulesById: Record<MathLabModuleId, MathLabModule | undefined> = {}
  const providerById: Record<MathLabModuleId, MathLabModuleProviderName | undefined> = {}
  const appliedOverrides = new Set<MathLabModuleId>()

  for (const provider of providers) {
    for (const moduleDefinition of provider.modules) {
      const previousProvider = providerById[moduleDefinition.id]

      if (previousProvider) {
        const expectedOverride = overridePolicy[moduleDefinition.id]
        if (
          !expectedOverride ||
          expectedOverride.from !== previousProvider ||
          expectedOverride.to !== provider.name
        ) {
          throw new Error(
            `Unexpected duplicate math lab module: ${moduleDefinition.id} (${previousProvider} -> ${provider.name})`,
          )
        }
        appliedOverrides.add(moduleDefinition.id)
      }

      modulesById[moduleDefinition.id] = moduleDefinition
      providerById[moduleDefinition.id] = provider.name
    }
  }

  for (const [moduleId, expectedOverride] of Object.entries(overridePolicy)) {
    if (!appliedOverrides.has(moduleId)) {
      throw new Error(
        `Expected math lab module override was not applied: ${moduleId} (${expectedOverride.from} -> ${expectedOverride.to})`,
      )
    }
  }

  return { modulesById, providerById }
}

const supplementalModules = Object.fromEntries(
  mathFoundationsModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
) as Record<MathLabModuleId, MathLabModule | undefined>

export { aiMathPathModuleIds } from './mathCourseOrder.ts'

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
}).map(enhanceSpectralRepresentationModule)

export const mathLabModuleProviders: readonly MathLabModuleProvider[] = [
  { name: 'beginnerFoundationModules', modules: minimumFoundationBeginnerModules },
  { name: 'linearAlgebraRouteModules', modules: vectorMatrixLanguageRouteModules },
  { name: 'calculusRouteModules', modules: calculusOptimizationRouteModules },
  { name: 'mathToCodeModules', modules: vectorMatrixLanguageMathToCodeModules },
  { name: 'importedFoundationModules', modules: importedFoundationModules },
  { name: 'aiBridgeModules', modules: aiBridgeModules },
]

const assembledMathLabModules = assembleMathLabModules(
  mathLabModuleProviders,
  mathLabModuleOverridePolicy,
)
const allModulesById = assembledMathLabModules.modulesById
export const mathLabModuleProviderById = assembledMathLabModules.providerById

const aiMathPathModules: MathLabModule[] = aiMathPathModuleIds.map((moduleId, index) => {
  const sourceModuleDefinition = allModulesById[moduleId]

  if (!sourceModuleDefinition) {
    throw new Error(`Missing math lab module: ${moduleId}`)
  }

  const moduleDefinition = enhanceAmesNumericalMethodsModule(
    enhanceProbabilityUncertaintyModule(sourceModuleDefinition),
  )

  return {
    ...moduleDefinition,
    order: index + 1,
    nextModuleIds: aiMathPathModuleIds[index + 1] ? [aiMathPathModuleIds[index + 1]!] : [],
  }
})

const routeOnlyModuleIds: readonly MathLabModuleId[] = [
  'numpy-mathematics-implementation',
  'math-to-code-guided-studio',
]

const routeOnlyModules: MathLabModule[] = routeOnlyModuleIds.map((moduleId, index) => {
  const moduleDefinition = allModulesById[moduleId]
  if (!moduleDefinition) throw new Error(`Missing route-only math lab module: ${moduleId}`)
  return { ...moduleDefinition, order: aiMathPathModules.length + index + 1 }
})

export const mathLabModules: MathLabModule[] = [...aiMathPathModules, ...routeOnlyModules]

export const mathLabModuleRegistry = Object.fromEntries(
  mathLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
) as Record<MathLabModuleId, MathLabModule>
