<script setup lang="ts">
import ReferenceExample from './ReferenceExample.vue'
import type { AlgorithmCheckpointItem, AppLocale, ModuleSlug } from '../types/ml'
import { resolveCheckpointRevisitRoute } from '../utils/checkpointRoutes'

const props = withDefaults(defineProps<{
  moduleSlug: ModuleSlug
  moduleRoute: string
  checkpoints: AlgorithmCheckpointItem[]
  locale: AppLocale
  variant?: 'lesson' | 'course-review'
  chapterRouteBase?: string
}>(), {
  variant: 'lesson',
})


function revisitRoute(checkpoint: AlgorithmCheckpointItem) {
  // Keep chapter-based feedback explicit at the component boundary; this also documents why
  // Python and optimizer review links cannot use the generic hash-anchor route.
  if (
    props.moduleSlug === 'linear-regression'
    || props.moduleSlug === 'logistic-regression'
    || props.moduleSlug === 'python-notebook'
    || props.moduleSlug === 'optimizer-comparison'
  ) {
    return resolveCheckpointRevisitRoute(props.moduleSlug, props.moduleRoute, checkpoint, props.chapterRouteBase)
  }
  return { path: props.moduleRoute, hash: `#${checkpoint.revisitChapterId}` }
}
</script>

<template>
  <section class="reference-examples algorithm-checkpoint">
    <h2>{{ locale === 'zh-CN' ? '例题与讲解' : 'Examples and explanations' }}</h2>
    <ReferenceExample v-for="checkpoint in checkpoints" :key="checkpoint.id" :example="checkpoint" :locale="locale" :revisit="revisitRoute(checkpoint)" />
  </section>
</template>
