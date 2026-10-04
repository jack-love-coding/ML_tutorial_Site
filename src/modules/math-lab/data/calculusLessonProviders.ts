import { calculusGradientDescentModule } from './calculusGradientDescentModule.ts'
import { calculusOptimizerComparisonModule } from './calculusOptimizerComparisonModule.ts'
import { calculusTrainingCodeDiagnosticsModule } from './calculusTrainingCodeDiagnosticsModule.ts'
import { calculusFunctionsModule } from './calculusFunctionsModule.ts'

// Each migrated lesson owns its final typed body, independently of historical batches.
export const calculusLessonProviders = [
  { name: 'calculusFunctionsModule', modules: [calculusFunctionsModule] },
  { name: 'calculusGradientDescentModule', modules: [calculusGradientDescentModule] },
  { name: 'calculusOptimizerComparisonModule', modules: [calculusOptimizerComparisonModule] },
  { name: 'calculusTrainingCodeDiagnosticsModule', modules: [calculusTrainingCodeDiagnosticsModule] },
] as const

export const standaloneCalculusModuleIds = new Set<string>(
  calculusLessonProviders.flatMap(provider => provider.modules.map(module => module.id)),
)
