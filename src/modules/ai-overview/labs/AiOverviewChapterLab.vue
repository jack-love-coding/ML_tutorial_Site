<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, StorySection } from '../../../types/ml'
import AiWorldMap from '../components/AiWorldMap.vue'
import CourseKnowledgeMap from '../components/CourseKnowledgeMap.vue'
import LearningAssistantMap from '../components/LearningAssistantMap.vue'
import LlmRouteMap from '../components/LlmRouteMap.vue'
import MlProcessTracer from '../components/MlProcessTracer.vue'
import ParadigmComparison from '../components/ParadigmComparison.vue'
import ParadigmDecisionTree from '../components/ParadigmDecisionTree.vue'
import TraditionalAiStepper from '../components/TraditionalAiStepper.vue'
import AlgorithmStaticFallback from './AlgorithmStaticFallback.vue'
import KMeansLab from './KMeansLab.vue'
import QLearningLab from './QLearningLab.vue'
import RegressionLab from './RegressionLab.vue'

const props = defineProps<{ section: StorySection }>()
const { locale } = useI18n()
const staticMode = ref(false)
let mobileQuery: MediaQueryList | undefined
let motionQuery: MediaQueryList | undefined
const algorithm = computed(() => ({
  'supervised-linear-regression': 'regression',
  'unsupervised-kmeans': 'kmeans',
  'reinforcement-q-learning': 'qLearning',
}[props.section.id] as 'regression' | 'kmeans' | 'qLearning' | undefined))

function syncMediaMode() { staticMode.value = Boolean(mobileQuery?.matches || motionQuery?.matches) }
onMounted(() => {
  if (typeof window === 'undefined') return
  mobileQuery = window.matchMedia('(max-width: 760px)')
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncMediaMode()
  mobileQuery.addEventListener('change', syncMediaMode)
  motionQuery.addEventListener('change', syncMediaMode)
})
onBeforeUnmount(() => {
  mobileQuery?.removeEventListener('change', syncMediaMode)
  motionQuery?.removeEventListener('change', syncMediaMode)
})
</script>

<template>
  <AlgorithmStaticFallback v-if="algorithm && staticMode" :algorithm="algorithm" />
  <div v-else-if="section.id === 'supervised-linear-regression'" class="algorithm-lab--desktop"><RegressionLab /></div>
  <div v-else-if="section.id === 'unsupervised-kmeans'" class="algorithm-lab--desktop"><KMeansLab /></div>
  <div v-else-if="section.id === 'reinforcement-q-learning'" class="algorithm-lab--desktop"><QLearningLab /></div>
  <TraditionalAiStepper v-else-if="section.id === 'three-problems'" :locale="locale as AppLocale" />
  <AiWorldMap v-else-if="section.id === 'ai-world-map'" :locale="locale as AppLocale" />
  <MlProcessTracer v-else-if="section.id === 'ml-common-language'" :locale="locale as AppLocale" />
  <div v-else-if="section.id === 'learning-paradigms'" class="chapter-visual-stack"><ParadigmComparison :locale="locale as AppLocale" /><ParadigmDecisionTree :locale="locale as AppLocale" /></div>
  <div v-else-if="section.id === 'choose-learning-approach'" class="chapter-visual-stack"><LearningAssistantMap :locale="locale as AppLocale" /><LlmRouteMap :locale="locale as AppLocale" /><CourseKnowledgeMap :locale="locale as AppLocale" /></div>
</template>

<style scoped>
.chapter-visual-stack { display:grid; gap:1rem; }
@media (max-width:760px) { .algorithm-lab--desktop { display:none; } }
@media (prefers-reduced-motion:reduce) { .algorithm-lab--desktop { display:none; } }
</style>
