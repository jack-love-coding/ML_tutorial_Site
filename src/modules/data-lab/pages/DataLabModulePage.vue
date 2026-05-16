<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
import CleaningPipelineLab from '../labs/CleaningPipelineLab.vue'
import ColumnTypeLab from '../labs/ColumnTypeLab.vue'
import EdaWorkbenchLab from '../labs/EdaWorkbenchLab.vue'
import PandasPipelineLab from '../labs/PandasPipelineLab.vue'
import CategoricalEncodingLab from '../labs/CategoricalEncodingLab.vue'
import DataManimPlayer from '../components/DataManimPlayer.vue'
import DataVisualFigure from '../components/DataVisualFigure.vue'
import { dataLabModuleRegistry, dataLabModules } from '../data/modules'
import type { DataLabConfig, DataLabLocale, DataLabModuleId, DataLabSection } from '../types/dataLab'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()

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
    }
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
              ? '实验在浏览器中模拟 pandas 行为，重点是理解表格变化和代码语义。'
              : 'Labs simulate pandas behavior in-browser, emphasizing table changes and code semantics.'
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
            <template v-for="lab in labsForSection(section)" :key="lab.id">
              <ColumnTypeLab v-if="lab.componentName === 'ColumnTypeLab'" :locale="currentLocale" />
              <CleaningPipelineLab v-else-if="lab.componentName === 'CleaningPipelineLab'" :locale="currentLocale" />
              <EdaWorkbenchLab v-else-if="lab.componentName === 'EdaWorkbenchLab'" :locale="currentLocale" />
              <PandasPipelineLab v-else-if="lab.componentName === 'PandasPipelineLab'" :locale="currentLocale" />
              <CategoricalEncodingLab v-else-if="lab.componentName === 'CategoricalEncodingLab'" :locale="currentLocale" />
            </template>
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
          <template v-for="lab in remainingLabs" :key="lab.id">
            <ColumnTypeLab v-if="lab.componentName === 'ColumnTypeLab'" :locale="currentLocale" />
            <CleaningPipelineLab v-else-if="lab.componentName === 'CleaningPipelineLab'" :locale="currentLocale" />
            <EdaWorkbenchLab v-else-if="lab.componentName === 'EdaWorkbenchLab'" :locale="currentLocale" />
            <PandasPipelineLab v-else-if="lab.componentName === 'PandasPipelineLab'" :locale="currentLocale" />
            <CategoricalEncodingLab v-else-if="lab.componentName === 'CategoricalEncodingLab'" :locale="currentLocale" />
          </template>
        </section>

        <section class="data-misconception-grid">
          <article v-for="item in moduleDefinition.misconceptions" :key="item.id" class="data-lab-panel">
            <span>{{ currentLocale === 'zh-CN' ? '常见误解' : 'Misconception' }}</span>
            <strong>{{ item.statement[currentLocale] }}</strong>
            <MarkdownMathContent :source="item.correction[currentLocale]" />
            <small>{{ item.example[currentLocale] }}</small>
          </article>
        </section>

        <section class="data-lab-panel data-source-section">
          <header>
            <span>{{ currentLocale === 'zh-CN' ? '参考来源' : 'Source references' }}</span>
            <h2>{{ currentLocale === 'zh-CN' ? '用于校准，不直接搬运' : 'Used for calibration, not copied prose' }}</h2>
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
        </div>
      </aside>
    </section>
  </div>
</template>
