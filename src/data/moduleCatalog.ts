import type { AlgorithmModuleDefinition } from '../types/ml'
import { lossFunctionsModule } from './lossFunctionsModule'
import { gradientDescentModule } from './gradientDescentModule'
import { linearRegressionModule } from './linearRegressionModule'
import { moduleOrder as legacyModuleOrder } from './modules'

export const moduleOrder: AlgorithmModuleDefinition[] = [
  lossFunctionsModule,
  gradientDescentModule,
  linearRegressionModule,
  ...legacyModuleOrder.filter(
    (moduleDefinition) =>
      moduleDefinition.slug !== 'gradient-descent' && moduleDefinition.slug !== 'loss-functions',
  ),
]

export const moduleRegistry = Object.fromEntries(
  moduleOrder.map((moduleDefinition) => [moduleDefinition.slug, moduleDefinition]),
) as Record<(typeof moduleOrder)[number]['slug'], AlgorithmModuleDefinition>
