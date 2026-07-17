<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AlgorithmCheckpointQuiz from '../../../components/AlgorithmCheckpointQuiz.vue'
import { chapterCompanionKinds } from '../../../data/aiOverviewModule'
import { algorithmCheckpointsBySlug } from '../../../data/algorithmCheckpoints'
import type { AppLocale, StorySection } from '../../../types/ml'
import AiWorldMap from '../components/AiWorldMap.vue'
import CourseKnowledgeMap from '../components/CourseKnowledgeMap.vue'
import LearningAssistantMap from '../components/LearningAssistantMap.vue'
import LlmRouteMap from '../components/LlmRouteMap.vue'
import MlProcessTracer from '../components/MlProcessTracer.vue'
import OverviewMediaFigure from '../components/OverviewMediaFigure.vue'
import ParadigmComparison from '../components/ParadigmComparison.vue'
import ParadigmDecisionTree from '../components/ParadigmDecisionTree.vue'
import TraditionalAiStepper from '../components/TraditionalAiStepper.vue'
import { aiOverviewRuntimeMediaAssets } from '../data/media'
import type { AiOverviewChapterId, AiOverviewMediaAsset } from '../types'
import AlgorithmStaticFallback from './AlgorithmStaticFallback.vue'
import KMeansLab from './KMeansLab.vue'
import QLearningLab from './QLearningLab.vue'
import RegressionLab from './RegressionLab.vue'

const props = defineProps<{ section: StorySection }>()
const { locale } = useI18n()
const staticMode = ref(false)
let mobileQuery: MediaQueryList | undefined
let motionQuery: MediaQueryList | undefined

const chapterId = computed(() => props.section.id as AiOverviewChapterId)
const companionKinds = computed(() => chapterCompanionKinds[chapterId.value] ?? [])
const checkpointIdsByChapter = {
  'ml-common-language': ['ai-overview-training-loop-order', 'ai-overview-field-roles'],
  'learning-paradigms': ['ai-overview-paradigm-signal'],
  'reinforcement-q-learning': ['ai-overview-kmeans-direction', 'ai-overview-q-value-direction'],
} as const satisfies Partial<Record<AiOverviewChapterId, readonly string[]>>
const localCheckpoints = computed(() => {
  const ids = checkpointIdsByChapter[chapterId.value as keyof typeof checkpointIdsByChapter] ?? []
  return ids.map((id) => {
    const checkpoint = algorithmCheckpointsBySlug['ai-overview'].find((item) => item.id === id)
    if (!checkpoint) throw new Error(`Missing AI Overview formative checkpoint: ${id}`)
    return checkpoint
  })
})
const mediaById = new Map(aiOverviewRuntimeMediaAssets.map((asset) => [asset.id, asset]))
const taskMedia = mediaAssets('ai-overview-hero', 'score-prediction', 'pattern-discovery', 'exercise-selection')
const applicationMedia = mediaAssets('spam-detection', 'electricity-demand', 'news-topics', 'color-compression', 'robot-control', 'traffic-signals')
const regressionVideo = mediaAsset('linear-regression-video')
const housePriceCard = mediaAsset('house-price')
const kmeansVideo = mediaAsset('kmeans-video')
const userSegmentationCard = mediaAsset('user-segmentation')
const qLearningVideo = mediaAsset('q-learning-video')

function mediaAsset(id: string): AiOverviewMediaAsset {
  const asset = mediaById.get(id)
  if (!asset) throw new Error(`Missing AI overview runtime media asset: ${id}`)
  return asset
}

function mediaAssets(...ids: string[]) { return ids.map(mediaAsset) }
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
  <section class="ai-overview-chapter-companions" :data-chapter-id="chapterId" :data-companion-kinds="companionKinds.join(' ')">
    <div v-if="chapterId === 'three-problems'" class="chapter-media-grid chapter-media-grid--tasks">
      <OverviewMediaFigure v-for="asset in taskMedia" :key="asset.id" :asset="asset" :locale="locale as AppLocale" />
    </div>

    <div v-else-if="chapterId === 'ai-world-map'" class="chapter-visual-stack">
      <AiWorldMap :locale="locale as AppLocale" />
      <TraditionalAiStepper :locale="locale as AppLocale" />
    </div>

    <MlProcessTracer v-else-if="chapterId === 'ml-common-language'" :locale="locale as AppLocale" />

    <div v-else-if="chapterId === 'supervised-linear-regression'" class="chapter-visual-stack">
      <OverviewMediaFigure :asset="regressionVideo" :locale="locale as AppLocale" />
      <div v-if="!staticMode" class="algorithm-lab--desktop"><RegressionLab /></div>
      <AlgorithmStaticFallback class="algorithm-static-fallback" algorithm="regression" />
      <OverviewMediaFigure :asset="housePriceCard" :locale="locale as AppLocale" />
    </div>

    <div v-else-if="chapterId === 'learning-paradigms'" class="chapter-visual-stack">
      <ParadigmComparison :locale="locale as AppLocale" />
      <div class="chapter-media-grid chapter-media-grid--applications">
        <OverviewMediaFigure v-for="asset in applicationMedia" :key="asset.id" :asset="asset" :locale="locale as AppLocale" />
      </div>
    </div>

    <div v-else-if="chapterId === 'unsupervised-kmeans'" class="chapter-visual-stack">
      <OverviewMediaFigure :asset="kmeansVideo" :locale="locale as AppLocale" />
      <div v-if="!staticMode" class="algorithm-lab--desktop"><KMeansLab /></div>
      <AlgorithmStaticFallback class="algorithm-static-fallback" algorithm="kmeans" />
      <OverviewMediaFigure :asset="userSegmentationCard" :locale="locale as AppLocale" />
    </div>

    <div v-else-if="chapterId === 'reinforcement-q-learning'" class="chapter-visual-stack">
      <OverviewMediaFigure :asset="qLearningVideo" :locale="locale as AppLocale" />
      <div v-if="!staticMode" class="algorithm-lab--desktop"><QLearningLab /></div>
      <AlgorithmStaticFallback class="algorithm-static-fallback" algorithm="qLearning" />
    </div>

    <div v-else-if="chapterId === 'choose-learning-approach'" class="chapter-visual-stack">
      <ParadigmDecisionTree :locale="locale as AppLocale" />
      <LearningAssistantMap :locale="locale as AppLocale" />
      <LlmRouteMap :locale="locale as AppLocale" />
      <CourseKnowledgeMap :locale="locale as AppLocale" />
    </div>

    <AlgorithmCheckpointQuiz
      v-if="localCheckpoints.length"
      module-slug="ai-overview"
      module-route="/learn/ai-overview"
      :checkpoints="localCheckpoints"
      :locale="locale as AppLocale"
    />
  </section>
</template>

<style scoped>
.chapter-visual-stack { display: grid; gap: 1rem; }
@media (max-width:760px) { .algorithm-lab--desktop { display:none; } }
@media (prefers-reduced-motion:reduce) { .algorithm-lab--desktop { display:none; } }
</style>
