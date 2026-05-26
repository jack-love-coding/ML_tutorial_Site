import type { AlgorithmModuleDefinition } from '../types/ml'
import { aiOverviewModule } from './aiOverviewModule'
import { lossFunctionsModule } from './lossFunctionsModule'
import { gradientDescentModule } from './gradientDescentModule'
import { linearRegressionModule } from './linearRegressionModule'
import { logisticRegressionModule } from './logisticRegressionModule'
import { classificationModule } from './classificationModule'
import { mlpModule } from './mlpModule'
import { moduleOrder as legacyModuleOrder } from './modules'

export const moduleOrder: AlgorithmModuleDefinition[] = [
  aiOverviewModule,
  lossFunctionsModule,
  gradientDescentModule,
  linearRegressionModule,
  logisticRegressionModule,
  classificationModule,
  ...legacyModuleOrder.filter(
    (moduleDefinition) =>
      moduleDefinition.slug !== 'gradient-descent' &&
      moduleDefinition.slug !== 'loss-functions' &&
      moduleDefinition.slug !== 'logistic-regression' &&
      moduleDefinition.slug !== 'classification' &&
      moduleDefinition.slug !== 'mlp',
  ),
  mlpModule,
]

export const moduleRegistry = Object.fromEntries(
  moduleOrder.map((moduleDefinition) => [moduleDefinition.slug, moduleDefinition]),
) as Record<(typeof moduleOrder)[number]['slug'], AlgorithmModuleDefinition>
