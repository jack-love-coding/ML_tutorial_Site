import type { AlgorithmModuleDefinition } from '../types/ml'
import { lossFunctionsModule } from './lossFunctionsModule'
import { gradientDescentModule } from './gradientDescentModule'
import { linearRegressionModule } from './linearRegressionModule'
import { mlpModule } from './mlpModule'
import { moduleOrder as legacyModuleOrder } from './modules'

export const moduleOrder: AlgorithmModuleDefinition[] = [
  lossFunctionsModule,
  gradientDescentModule,
  linearRegressionModule,
  ...legacyModuleOrder.filter(
    (moduleDefinition) =>
      moduleDefinition.slug !== 'gradient-descent' &&
      moduleDefinition.slug !== 'loss-functions' &&
      moduleDefinition.slug !== 'mlp',
  ),
  mlpModule,
]

export const moduleRegistry = Object.fromEntries(
  moduleOrder.map((moduleDefinition) => [moduleDefinition.slug, moduleDefinition]),
) as Record<(typeof moduleOrder)[number]['slug'], AlgorithmModuleDefinition>
