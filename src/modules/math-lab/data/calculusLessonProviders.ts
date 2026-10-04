import { calculusGradientDescentModule } from './calculusGradientDescentModule.ts'
import { calculusOptimizerComparisonModule } from './calculusOptimizerComparisonModule.ts'

// Each migrated lesson owns its final typed body, independently of historical batches.
export const calculusLessonProviders = [
  { name: 'calculusGradientDescentModule', modules: [calculusGradientDescentModule] },
  { name: 'calculusOptimizerComparisonModule', modules: [calculusOptimizerComparisonModule] },
] as const

export const standaloneCalculusModuleIds = new Set<string>(
  calculusLessonProviders.flatMap(provider => provider.modules.map(module => module.id)),
)
