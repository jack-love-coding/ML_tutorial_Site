<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AlgorithmCheckpointQuiz from '../components/AlgorithmCheckpointQuiz.vue'
import PythonDataToolsPagedLesson from '../components/PythonDataToolsPagedLesson.vue'
import { algorithmCheckpointsBySlug } from '../data/algorithmCheckpoints.ts'
import { pythonDataToolsRuntimeChapters } from '../data/generated/pythonDataToolsRuntime.generated.ts'
import { pythonDataToolsContract } from '../data/pythonNotebookContract.ts'
import type { AppLocale } from '../types/ml.ts'

const route = useRoute()
const { locale } = useI18n()

const currentLocale = computed(() => locale.value as AppLocale)
const activeChapter = computed(() => {
  const chapterId = typeof route.params.chapterId === 'string' ? route.params.chapterId : ''
  return pythonDataToolsRuntimeChapters.find(({ id }) => id === chapterId)
    ?? pythonDataToolsRuntimeChapters[0]
})
</script>

<template>
  <div v-if="activeChapter" class="algorithm-view python-data-tools-course-view">
    <PythonDataToolsPagedLesson
      :key="activeChapter.id"
      :chapter="activeChapter"
      :locale="currentLocale"
    />

    <AlgorithmCheckpointQuiz
      v-if="activeChapter.id === 'analysis-report'"
      module-slug="python-notebook"
      :module-route="pythonDataToolsContract.route"
      :checkpoints="algorithmCheckpointsBySlug['python-notebook']"
      :locale="currentLocale"
      :completed="false"
      mode="course-review"
    />
  </div>
</template>
