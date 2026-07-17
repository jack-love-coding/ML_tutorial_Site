import type { AlgorithmModuleDefinition, ModuleSlug } from '../types/ml'

export interface AlgorithmModuleLoader {
  slug: ModuleSlug
  load: () => Promise<AlgorithmModuleDefinition>
}

function defineModuleLoader(
  slug: ModuleSlug,
  load: () => Promise<AlgorithmModuleDefinition>,
): AlgorithmModuleLoader {
  return { slug, load }
}

const aiOverviewModule = defineModuleLoader('ai-overview', async () =>
  (await import('./aiOverviewModule')).aiOverviewModule,
)
const pythonNotebookModule = defineModuleLoader('python-notebook', async () =>
  (await import('./pythonNotebookModule')).pythonNotebookModule,
)
const housingPriceProjectModule = defineModuleLoader('housing-price-project', async () =>
  (await import('./housingPriceProjectModule')).housingPriceProjectModule,
)
const classificationProjectModule = defineModuleLoader('classification-project', async () =>
  (await import('./classificationProjectModule')).classificationProjectModule,
)
const modelSelectionModule = defineModuleLoader('model-selection', async () =>
  (await import('./modelSelectionModule')).modelSelectionModule,
)
const treeForestModule = defineModuleLoader('tree-forest', async () =>
  (await import('./treeForestModule')).treeForestModule,
)
const cnnVisualizationModule = defineModuleLoader('cnn-visualization', async () =>
  (await import('./cnnVisualizationModule')).cnnVisualizationModule,
)
const sequenceEmbeddingBridgeModule = defineModuleLoader('sequence-embedding-bridge', async () =>
  (await import('./sequenceEmbeddingBridgeModule')).sequenceEmbeddingBridgeModule,
)
const attentionTransformerModule = defineModuleLoader('attention-transformer', async () =>
  (await import('./attentionTransformerModule')).attentionTransformerModule,
)
const optimizerComparisonModule = defineModuleLoader('optimizer-comparison', async () =>
  (await import('./optimizerComparisonModule')).optimizerComparisonModule,
)
const llmRagModule = defineModuleLoader('llm-rag', async () =>
  (await import('./llmRagModule')).llmRagModule,
)
const lossFunctionsModule = defineModuleLoader('loss-functions', async () =>
  (await import('./lossFunctionsModule')).lossFunctionsModule,
)
const gradientDescentModule = defineModuleLoader('gradient-descent', async () =>
  (await import('./gradientDescentModule')).gradientDescentModule,
)
const linearRegressionModule = defineModuleLoader('linear-regression', async () =>
  (await import('./linearRegressionModule')).linearRegressionModule,
)
const logisticRegressionModule = defineModuleLoader('logistic-regression', async () =>
  (await import('./logisticRegressionModule')).logisticRegressionModule,
)
const classificationModule = defineModuleLoader('classification', async () =>
  (await import('./classificationModule')).classificationModule,
)
const mlpModule = defineModuleLoader('mlp', async () =>
  (await import('./mlpModule')).mlpModule,
)

export const moduleOrder: readonly AlgorithmModuleLoader[] = [
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
]

export const moduleRegistry = Object.fromEntries(
  moduleOrder.map((moduleLoader) => [moduleLoader.slug, moduleLoader]),
) as Record<ModuleSlug, AlgorithmModuleLoader>

const loadedModules = new Map<ModuleSlug, Promise<AlgorithmModuleDefinition>>()

export function isAlgorithmModuleSlug(value: string): value is ModuleSlug {
  return Object.hasOwn(moduleRegistry, value)
}

export function loadAlgorithmModule(slug: string) {
  if (!isAlgorithmModuleSlug(slug)) return Promise.resolve(undefined)

  const cached = loadedModules.get(slug)
  if (cached) return cached

  const definition = moduleRegistry[slug]
    .load()
    .then((moduleDefinition) => {
      if (moduleDefinition.slug === slug) return moduleDefinition

      loadedModules.delete(slug)
      throw new Error(
        `Algorithm module loader mismatch: expected ${slug}, received ${moduleDefinition.slug}`,
      )
    })
    .catch((error: unknown) => {
      loadedModules.delete(slug)
      throw error
    })
  loadedModules.set(slug, definition)
  return definition
}
