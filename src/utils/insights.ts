import type { ExperimentConfig, ModuleSlug, TeachingInsight, TrainingSnapshot } from '../types/ml'

export function getTeachingInsights(
  slug: ModuleSlug,
  snapshot: TrainingSnapshot | undefined,
  config: ExperimentConfig | undefined,
): TeachingInsight[] {
  if (!snapshot || !config) return []

  if (slug === 'loss-functions') {
    return []
  }

  if (slug === 'gradient-descent') {
    const statusKey = String(snapshot.derivedMetrics?.statusKey ?? 'observations.gradientStable')
    const functionObservationKey =
      String(config.lossFunction) === 'multi-well'
        ? 'observations.gradientNonConvex'
        : String(config.lossFunction) === 'saddle'
          ? 'observations.gradientSaddle'
          : String(config.lossFunction) === 'tilted-ravine' || String(config.lossFunction) === 'rosenbrock'
            ? 'observations.gradientRavine'
            : 'observations.gradientConvex'

    return [
      {
        id: 'gradient-status',
        tone:
          statusKey === 'observations.gradientOscillating' ||
          statusKey === 'observations.gradientTrappedLocal' ||
          statusKey === 'observations.gradientSaddle'
            ? 'caution'
            : 'positive',
        titleKey: 'insights.gradient.status',
        bodyKey: statusKey,
      },
      {
        id: 'gradient-speed',
        tone: String(config.batchMode) === 'full' ? 'neutral' : 'positive',
        titleKey: 'insights.gradient.speed',
        bodyKey: String(config.batchMode) !== 'full' ? 'observations.gradientNoisy' : 'observations.gradientStable',
      },
      {
        id: 'gradient-function',
        tone: String(config.lossFunction) === 'multi-well' || String(config.lossFunction) === 'saddle' ? 'caution' : 'neutral',
        titleKey: 'insights.gradient.function',
        bodyKey: functionObservationKey,
      },
      {
        id: 'gradient-topology',
        tone: snapshot.referenceDistance !== undefined && snapshot.referenceDistance < 0.45 ? 'positive' : 'neutral',
        titleKey: 'insights.gradient.topology',
        bodyKey:
          snapshot.referenceDistance !== undefined && snapshot.referenceDistance < 0.45
            ? 'observations.gradientReferenceNear'
            : 'observations.gradientReferenceFar',
      },
    ]
  }

  if (slug === 'logistic-regression') {
    return [
      {
        id: 'logistic-status',
        tone: (snapshot.accuracy ?? 0) > 0.82 ? 'positive' : 'neutral',
        titleKey: 'insights.logistic.status',
        bodyKey: (snapshot.accuracy ?? 0) > 0.82 ? 'observations.logisticStrong' : 'observations.logisticWeak',
      },
      {
        id: 'logistic-limits',
        tone: String(config.datasetKind) === 'xor' ? 'caution' : 'neutral',
        titleKey: 'insights.logistic.limits',
        bodyKey: 'observations.logisticLinear',
      },
    ]
  }

  return [
    {
      id: 'mlp-status',
      tone: String(config.activation) === 'relu' ? 'neutral' : 'positive',
      titleKey: 'insights.mlp.status',
      bodyKey: 'observations.mlpActivation',
    },
    {
      id: 'mlp-capacity',
      tone: Number(config.hiddenUnits) >= 7 ? 'positive' : 'neutral',
      titleKey: 'insights.mlp.capacity',
      bodyKey: Number(config.hiddenUnits) >= 7 ? 'observations.mlpCapacityHigh' : 'observations.mlpCapacityLow',
    },
  ]
}
