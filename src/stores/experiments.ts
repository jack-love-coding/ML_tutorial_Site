import { defineStore } from 'pinia'
import type {
  AlgorithmModuleDefinition,
  ExperimentConfigValue,
  ExperimentState,
  ModuleSlug,
} from '../types/ml'

const registeredModules = new Map<ModuleSlug, AlgorithmModuleDefinition>()

export function registerExperimentModule(moduleDefinition: AlgorithmModuleDefinition) {
  registeredModules.set(moduleDefinition.slug, moduleDefinition)
}

function requireModuleDefinition(slug: ModuleSlug) {
  const moduleDefinition = registeredModules.get(slug)
  if (!moduleDefinition) {
    throw new Error(`Algorithm module ${slug} must be loaded before its experiment is created`)
  }
  return moduleDefinition
}

function createExperimentState(slug: ModuleSlug): ExperimentState {
  const moduleDefinition = requireModuleDefinition(slug)
  const config = moduleDefinition.createDefaultConfig()
  return {
    config,
    snapshots: moduleDefinition.simulate(config).snapshots,
    currentStep: 0,
    isPlaying: false,
  }
}

export const useExperimentStore = defineStore('experiments', {
  state: () => ({
    experiments: {} as Partial<Record<ModuleSlug, ExperimentState>>,
  }),
  getters: {
    getExperiment: (state) => (slug: ModuleSlug) => state.experiments[slug],
  },
  actions: {
    ensureExperiment(slug: ModuleSlug) {
      if (!this.experiments[slug]) {
        this.experiments[slug] = createExperimentState(slug)
      }
      return this.experiments[slug] as ExperimentState
    },
    recompute(slug: ModuleSlug) {
      const experiment = this.ensureExperiment(slug)
      const moduleDefinition = requireModuleDefinition(slug)
      experiment.snapshots = moduleDefinition.simulate({ ...experiment.config }).snapshots
      experiment.currentStep = 0
      experiment.isPlaying = false
    },
    patchConfig(slug: ModuleSlug, partialConfig: Partial<Record<string, ExperimentConfigValue>>) {
      const experiment = this.ensureExperiment(slug)
      experiment.config = {
        ...experiment.config,
        ...partialConfig,
      } as typeof experiment.config
      this.recompute(slug)
    },
    updateConfig(slug: ModuleSlug, key: string, value: ExperimentConfigValue) {
      this.patchConfig(slug, { [key]: value })
    },
    applyPreset(slug: ModuleSlug, partialConfig: Partial<Record<string, ExperimentConfigValue>>) {
      this.patchConfig(slug, partialConfig)
    },
    togglePlayback(slug: ModuleSlug) {
      const experiment = this.ensureExperiment(slug)
      if (experiment.currentStep >= experiment.snapshots.length - 1) {
        experiment.currentStep = 0
      }
      experiment.isPlaying = !experiment.isPlaying
    },
    pause(slug: ModuleSlug) {
      this.ensureExperiment(slug).isPlaying = false
    },
    advance(slug: ModuleSlug) {
      const experiment = this.ensureExperiment(slug)
      if (experiment.currentStep >= experiment.snapshots.length - 1) {
        experiment.isPlaying = false
        return
      }
      experiment.currentStep += 1
    },
    replay(slug: ModuleSlug) {
      const experiment = this.ensureExperiment(slug)
      experiment.currentStep = 0
      experiment.isPlaying = false
    },
    reset(slug: ModuleSlug) {
      this.experiments[slug] = createExperimentState(slug)
    },
  },
})
