<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
import DataCheckpointQuiz from '../components/DataCheckpointQuiz.vue'
import DataManimPlayer from '../components/DataManimPlayer.vue'
import DataVisualFigure from '../components/DataVisualFigure.vue'
import { dataLabModuleRegistry, dataLabModules } from '../data/modules'
import type {
  DataLabConfig,
  DataLabLocale,
  DataLabModuleId,
  DataLabSection,
  DataQuizAttempt,
} from '../types/dataLab'
import {
  appendDataQuizAttempt,
  loadDataLabProgress,
  markDataLabModuleComplete,
  saveDataLabProgress,
  setLastVisitedDataLabModule,
} from '../utils/progress'

const labComponentRegistry = {
  ColumnTypeLab: defineAsyncComponent(() => import('../labs/ColumnTypeLab.vue')),
  CleaningPipelineLab: defineAsyncComponent(() => import('../labs/CleaningPipelineLab.vue')),
  EdaWorkbenchLab: defineAsyncComponent(() => import('../labs/EdaWorkbenchLab.vue')),
  PandasPipelineLab: defineAsyncComponent(() => import('../labs/PandasPipelineLab.vue')),
  DataPipelineTaskLab: defineAsyncComponent(() => import('../labs/DataPipelineTaskLab.vue')),
  CategoricalVocabularyTaskLab: defineAsyncComponent(() => import('../labs/CategoricalVocabularyTaskLab.vue')),
  CategoricalEncodingLab: defineAsyncComponent(() => import('../labs/CategoricalEncodingLab.vue')),
} satisfies Record<DataLabConfig['componentName'], ReturnType<typeof defineAsyncComponent>>

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()
const progress = ref(loadDataLabProgress())

const currentLocale = computed(() => locale.value as DataLabLocale)
const moduleId = computed(() => route.params.moduleId as DataLabModuleId)
const moduleDefinition = computed(() => dataLabModuleRegistry[moduleId.value])
const moduleIndex = computed(() =>
  dataLabModules.findIndex((candidate) => candidate.id === moduleDefinition.value?.id),
)
const previousModule = computed(() => (moduleIndex.value > 0 ? dataLabModules[moduleIndex.value - 1] : undefined))
const nextModule = computed(() => (moduleIndex.value >= 0 ? dataLabModules[moduleIndex.value + 1] : undefined))

const imageAssets = computed(() => moduleDefinition.value?.visuals.filter((asset) => asset.type === 'image') ?? [])
const videoAssets = computed(() => moduleDefinition.value?.visuals.filter((asset) => asset.type === 'manim-video') ?? [])
const inlineVisualIds = computed(
  () => new Set(moduleDefinition.value?.sections.flatMap((section) => section.visualIds ?? []) ?? []),
)
const inlineLabIds = computed(
  () => new Set(moduleDefinition.value?.sections.flatMap((section) => section.labIds ?? []) ?? []),
)
const remainingImages = computed(() => imageAssets.value.filter((asset) => !inlineVisualIds.value.has(asset.id)))
const remainingVideos = computed(() => videoAssets.value.filter((asset) => !inlineVisualIds.value.has(asset.id)))
const remainingLabs = computed(() =>
  moduleDefinition.value?.labs.filter((lab) => !inlineLabIds.value.has(lab.id)) ?? [],
)

watch(
  moduleId,
  (nextModuleId) => {
    if (!dataLabModuleRegistry[nextModuleId]) {
      router.replace('/data-lab')
      return
    }
    progress.value = saveDataLabProgress(setLastVisitedDataLabModule(loadDataLabProgress(), nextModuleId))
  },
  { immediate: true },
)

function imagesForSection(section: DataLabSection) {
  if (!section.visualIds?.length) return []
  const ids = new Set(section.visualIds)
  return imageAssets.value.filter((asset) => ids.has(asset.id))
}

function videosForSection(section: DataLabSection) {
  if (!section.visualIds?.length) return []
  const ids = new Set(section.visualIds)
  return videoAssets.value.filter((asset) => ids.has(asset.id))
}

function labsForSection(section: DataLabSection): DataLabConfig[] {
  if (!section.labIds?.length) return []
  const ids = new Set(section.labIds)
  return moduleDefinition.value?.labs.filter((lab) => ids.has(lab.id)) ?? []
}

function labComponentFor(componentName: DataLabConfig['componentName']) {
  return labComponentRegistry[componentName]
}

function onQuizSubmit(attempts: DataQuizAttempt[]) {
  const correct = attempts.filter((attempt) => attempt.correct).length
  const enoughToComplete = attempts.length > 0 && correct / attempts.length >= 0.66
  let nextProgress = loadDataLabProgress()

  for (const attempt of attempts) {
    nextProgress = appendDataQuizAttempt(nextProgress, attempt)
  }

  if (enoughToComplete) {
    nextProgress = markDataLabModuleComplete(nextProgress, moduleId.value)
  }

  progress.value = saveDataLabProgress(nextProgress)
}

</script>

<template>
  <div v-if="moduleDefinition" class="data-lab-page">
    <section
      class="data-lab-module-hero"
      :style="{ '--data-accent': moduleDefinition.accent, '--data-theme': moduleDefinition.theme }"
    >
      <div>
        <span class="eyebrow">
          {{ currentLocale === 'zh-CN' ? `第 ${moduleDefinition.order} 章` : `Chapter ${moduleDefinition.order}` }}
        </span>
        <h1>{{ moduleDefinition.title[currentLocale] }}</h1>
        <p>{{ moduleDefinition.subtitle[currentLocale] }}</p>
      </div>
      <aside>
        <span>{{ currentLocale === 'zh-CN' ? '预计时间' : 'Estimated time' }}</span>
        <strong>{{ moduleDefinition.estimatedMinutes }} min</strong>
        <p>
          {{
            currentLocale === 'zh-CN'
              ? '本章用浏览器实验模拟 pandas 行为，帮助学生把概念、表格变化和模型输入联系起来。'
              : 'This chapter uses browser labs to simulate pandas behavior and connect concepts, table changes, and model inputs.'
          }}
        </p>
      </aside>
    </section>

    <section class="data-module-layout">
      <main class="data-module-main">
        <section class="data-lab-panel">
          <header class="section-header">
            <span class="eyebrow">{{ currentLocale === 'zh-CN' ? '学习目标' : 'Learning goals' }}</span>
            <h2>{{ currentLocale === 'zh-CN' ? '读完后应该能做到' : 'What this chapter should unlock' }}</h2>
          </header>
          <div class="data-objective-list">
            <article v-for="objective in moduleDefinition.learningObjectives" :key="objective.en">
              <MarkdownMathContent :source="objective[currentLocale]" />
            </article>
          </div>
        </section>

        <section class="data-lab-panel">
          <header>
            <span>{{ currentLocale === 'zh-CN' ? '核心概念' : 'Core concepts' }}</span>
            <h2>{{ currentLocale === 'zh-CN' ? '先建立术语边界' : 'Set the vocabulary boundary first' }}</h2>
          </header>
          <div class="data-concept-grid">
            <article v-for="concept in moduleDefinition.concepts" :key="concept.id">
              <strong>{{ concept.name[currentLocale] }}</strong>
              <MarkdownMathContent :source="concept.plainExplanation[currentLocale]" />
              <small>{{ concept.example[currentLocale] }}</small>
              <pre v-if="concept.pandasExample" class="data-code-block"><code>{{ concept.pandasExample }}</code></pre>
            </article>
          </div>
        </section>

        <template v-for="section in moduleDefinition.sections" :key="section.id">
          <article :id="section.id" class="data-lab-panel data-article-section">
            <header>
              <span>{{ currentLocale === 'zh-CN' ? '章节内容' : 'Section' }}</span>
              <h2>{{ section.title[currentLocale] }}</h2>
            </header>
            <MarkdownMathContent :source="section.content[currentLocale]" />
          </article>

          <section
            v-if="imagesForSection(section).length || videosForSection(section).length || labsForSection(section).length"
            class="data-inline-supplement-section"
          >
            <DataVisualFigure
              v-for="asset in imagesForSection(section)"
              :key="asset.id"
              :asset="asset"
              :locale="currentLocale"
            />
            <DataManimPlayer
              v-for="asset in videosForSection(section)"
              :key="asset.id"
              :asset="asset"
              :accent="moduleDefinition.accent"
              :locale="currentLocale"
            />
            <component
              :is="labComponentFor(lab.componentName)"
              v-for="lab in labsForSection(section)"
              :key="lab.id"
              :locale="currentLocale"
            />
          </section>
        </template>

        <section
          v-if="remainingImages.length || remainingVideos.length || remainingLabs.length"
          class="data-lab-panel data-inline-supplement-section"
        >
          <DataVisualFigure
            v-for="asset in remainingImages"
            :key="asset.id"
            :asset="asset"
            :locale="currentLocale"
          />
          <DataManimPlayer
            v-for="asset in remainingVideos"
            :key="asset.id"
            :asset="asset"
            :accent="moduleDefinition.accent"
            :locale="currentLocale"
          />
          <component
            :is="labComponentFor(lab.componentName)"
            v-for="lab in remainingLabs"
            :key="lab.id"
            :locale="currentLocale"
          />
        </section>

        <section class="data-misconception-grid">
          <article v-for="item in moduleDefinition.misconceptions" :key="item.id" class="data-lab-panel">
            <span>{{ currentLocale === 'zh-CN' ? '常见误解' : 'Misconception' }}</span>
            <strong>{{ item.statement[currentLocale] }}</strong>
            <MarkdownMathContent :source="item.correction[currentLocale]" />
            <small>{{ item.example[currentLocale] }}</small>
          </article>
        </section>

        <DataCheckpointQuiz
          v-if="moduleDefinition.quizzes.length"
          :module-id="moduleDefinition.id"
          :quizzes="moduleDefinition.quizzes"
          :locale="currentLocale"
          @submit="onQuizSubmit"
        />

        <section class="data-lab-panel data-source-section">
          <header>
            <span>{{ currentLocale === 'zh-CN' ? '参考资料' : 'References' }}</span>
            <h2>{{ currentLocale === 'zh-CN' ? '课后延伸阅读' : 'Further reading' }}</h2>
            <p>
              {{
                currentLocale === 'zh-CN'
                  ? '这些链接用于教师备课和学生课后查阅；正文已经按本站课程顺序重新组织。'
                  : 'These links support lesson preparation and after-class reading; the lesson body is organized for this course.'
              }}
            </p>
          </header>
          <a
            v-for="source in moduleDefinition.sourceReferences"
            :key="source.href"
            :href="source.href"
            target="_blank"
            rel="noreferrer"
          >
            <strong>{{ source.label[currentLocale] }}</strong>
            <span>{{ source.usage[currentLocale] }}</span>
          </a>
          <a v-if="moduleDefinition.notebookUrl" :href="moduleDefinition.notebookUrl" target="_blank" rel="noreferrer">
            Colab Notebook
          </a>
        </section>
      </main>

      <aside class="data-module-side">
        <div class="data-lab-panel data-lab-panel--sticky">
          <span>{{ currentLocale === 'zh-CN' ? '章节目录' : 'Chapter contents' }}</span>
          <nav class="data-article-nav">
            <a v-for="section in moduleDefinition.sections" :key="section.id" :href="`#${section.id}`">
              {{ section.title[currentLocale] }}
            </a>
          </nav>
          <div class="data-article-actions">
            <router-link v-if="previousModule" class="action-button" :to="`/data-lab/modules/${previousModule.id}`">
              {{ currentLocale === 'zh-CN' ? '上一章' : 'Previous' }}
            </router-link>
            <router-link v-if="nextModule" class="action-button action-button--primary" :to="`/data-lab/modules/${nextModule.id}`">
              {{ currentLocale === 'zh-CN' ? '下一章' : 'Next' }}
            </router-link>
            <router-link v-else class="action-button action-button--primary" to="/data-lab">
              {{ currentLocale === 'zh-CN' ? '返回路径' : 'Back to path' }}
            </router-link>
          </div>
          <div class="data-article-meta">
            <strong>
              {{
                progress.completedModuleIds.includes(moduleDefinition.id)
                  ? currentLocale === 'zh-CN'
                    ? '已完成'
                    : 'Completed'
                  : currentLocale === 'zh-CN'
                    ? '学习中'
                    : 'In progress'
              }}
            </strong>
            <span>{{ currentLocale === 'zh-CN' ? '预计' : 'Estimated' }} {{ moduleDefinition.estimatedMinutes }} min</span>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>
