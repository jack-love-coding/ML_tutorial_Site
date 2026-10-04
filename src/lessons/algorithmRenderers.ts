import { defineAsyncComponent, type Component } from 'vue'
import type { AlgorithmRenderer } from './algorithmTeaching'

// Importing the registry never loads a specialized lesson. Vue resolves only the selected one.
export const pagedAlgorithmRenderers: Partial<Record<AlgorithmRenderer, Component>> = {
  gradient: defineAsyncComponent(() => import('../components/GradientDescentPagedLesson.vue')),
  optimizer: defineAsyncComponent(() => import('../modules/optimizer-comparison/OptimizerPagedLesson.vue')),
  housing: defineAsyncComponent(() => import('../components/HousingProjectPagedLesson.vue')),
  linear: defineAsyncComponent(() => import('../components/LinearRegressionPagedLesson.vue')),
  logistic: defineAsyncComponent(() => import('../components/LogisticRegressionPagedLesson.vue')),
}
