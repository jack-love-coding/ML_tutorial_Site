import type { AlgorithmModuleDefinition } from '../types/ml'
import { aiOverviewModule } from './aiOverviewModule'
import { pythonNotebookModule } from './pythonNotebookModule'
import { housingPriceProjectModule } from './housingPriceProjectModule'
import { classificationProjectModule } from './classificationProjectModule'
import { modelSelectionModule } from './modelSelectionModule'
import { treeForestModule } from './treeForestModule'
import { cnnVisualizationModule } from './cnnVisualizationModule'
import { sequenceEmbeddingBridgeModule } from './sequenceEmbeddingBridgeModule'
import { attentionTransformerModule } from './attentionTransformerModule'
import { optimizerComparisonModule } from './optimizerComparisonModule'
import { llmRagModule } from './llmRagModule'
import { lossFunctionsModule } from './lossFunctionsModule'
import { gradientDescentModule } from './gradientDescentModule'
import { linearRegressionModule } from './linearRegressionModule'
import { logisticRegressionModule } from './logisticRegressionModule'
import { classificationModule } from './classificationModule'
import { mlpModule } from './mlpModule'
import { moduleOrder as legacyModuleOrder } from './modules'

export const moduleOrder: AlgorithmModuleDefinition[] = [
  aiOverviewModule,
  pythonNotebookModule,
  lossFunctionsModule,
  gradientDescentModule,
  linearRegressionModule,
  logisticRegressionModule,
  classificationModule,
  housingPriceProjectModule,
  classificationProjectModule,
  modelSelectionModule,
  treeForestModule,
  mlpModule,
  optimizerComparisonModule,
  cnnVisualizationModule,
  sequenceEmbeddingBridgeModule,
  attentionTransformerModule,
  llmRagModule,
  ...legacyModuleOrder.filter(
    (moduleDefinition) =>
      moduleDefinition.slug !== 'gradient-descent' &&
      moduleDefinition.slug !== 'loss-functions' &&
      moduleDefinition.slug !== 'logistic-regression' &&
      moduleDefinition.slug !== 'classification' &&
      moduleDefinition.slug !== 'mlp',
  ),
]

export const moduleRegistry = Object.fromEntries(
  moduleOrder.map((moduleDefinition) => [moduleDefinition.slug, moduleDefinition]),
) as Record<(typeof moduleOrder)[number]['slug'], AlgorithmModuleDefinition>
