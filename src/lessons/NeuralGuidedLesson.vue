<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownMathContent from '../components/MarkdownMathContent.vue'
import ChapteredMediaPlayer from '../components/ChapteredMediaPlayer.vue'
import type {
  AlgorithmModuleDefinition,
  AppLocale,
  LocalizedCopy,
  ModuleSlug,
} from '../types/ml'

const props = defineProps<{
  moduleDefinition: AlgorithmModuleDefinition
  activeId: string
  variant: Extract<ModuleSlug, 'mlp' | 'cnn-visualization'>
}>()

const emit = defineEmits<{
  change: [id: string]
}>()

const { locale, t } = useI18n()

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        task: '实验前预测',
        lesson: '完整讲解',
        observation: '观察结果',
        takeaway: '本章结论',
        sources: '课程参考资料',
        explore: '打开完整实验台',
        exploreHint: '在独立页面自由调整全部参数，不影响课程进度。',
        previous: '上一章',
        next: '下一章',
        chapter: '章节',
      }
    : {
        task: 'Predict before the lab',
        lesson: 'Full lesson',
        observation: 'What changed',
        takeaway: 'Chapter conclusion',
        sources: 'Course references',
        explore: 'Open the full playground',
        exploreHint: 'Adjust every parameter on a separate page without changing course progress.',
        previous: 'Previous',
        next: 'Next',
        chapter: 'Chapter',
      },
)

const activeIndex = computed(() => {
  const index = props.moduleDefinition.chapters.findIndex((section) => section.id === props.activeId)
  return index >= 0 ? index : 0
})
const activeSection = computed(() => props.moduleDefinition.chapters[activeIndex.value])
const previousSection = computed(() => props.moduleDefinition.chapters[activeIndex.value - 1])
const nextSection = computed(() => props.moduleDefinition.chapters[activeIndex.value + 1])
const activeVisuals = computed(() => {
  const visualIds = new Set(activeSection.value?.visualIds ?? [])
  return (props.moduleDefinition.visuals ?? []).filter((asset) => visualIds.has(asset.id)).slice(0, 1)
})
const activeVisual = computed(() => activeVisuals.value[0])
const explorerPath = computed(() => `/learn/${props.variant}/explore`)
const isLastChapter = computed(() => activeIndex.value === props.moduleDefinition.chapters.length - 1)
const courseSources = computed(() => {
  const seen = new Set<string>()
  return props.moduleDefinition.chapters.flatMap((section) => section.sources ?? []).filter((source) => {
    if (seen.has(source.href)) return false
    seen.add(source.href)
    return true
  })
})

function localizedText(value?: LocalizedCopy) {
  if (!value) return ''
  return value[locale.value as AppLocale]
}

function sectionTitle(section = activeSection.value) {
  if (!section) return ''
  return localizedText(section.title) || t(section.titleKey)
}

</script>

<template>
  <section class="neural-guided-lesson" :class="`neural-guided-lesson--${props.variant}`">
    <header class="neural-guided-lesson__header">
      <nav class="neural-guided-steps" :aria-label="copy.chapter">
        <button
          v-for="(section, index) in props.moduleDefinition.chapters"
          :key="section.id"
          type="button"
          :class="{ 'is-active': section.id === activeSection?.id }"
          :aria-current="section.id === activeSection?.id ? 'step' : undefined"
          @click="emit('change', section.id)"
        >
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <strong>{{ sectionTitle(section) }}</strong>
        </button>
      </nav>

      <RouterLink
        class="neural-explorer-link"
        :to="{ path: explorerPath, query: { chapter: activeSection?.id } }"
      >
        <strong>{{ copy.explore }}</strong>
        <span>{{ copy.exploreHint }}</span>
      </RouterLink>
    </header>

    <article v-if="activeSection" :id="activeSection.id" class="neural-current-lesson">
      <header class="neural-current-lesson__brief">
        <div>
          <span>{{ copy.chapter }} {{ activeIndex + 1 }} / {{ props.moduleDefinition.chapters.length }}</span>
          <h2>{{ sectionTitle() }}</h2>
          <p v-if="activeSection.pageSummary">{{ localizedText(activeSection.pageSummary) }}</p>
        </div>
      </header>

      <section class="neural-lesson-content" :aria-label="copy.lesson">
        <div class="neural-lesson-content__body">
          <MarkdownMathContent :source="localizedText(activeSection.markdown)" />

          <figure v-if="activeVisual" :key="activeVisual.id" class="neural-lesson-content__visual">
            <ChapteredMediaPlayer
              v-if="activeVisual.type === 'manim-video'"
              :asset-path="activeVisual.assetPath"
              :poster-path="activeVisual.posterPath ?? activeVisual.assetPath"
              :title="activeVisual.title"
              :alt="activeVisual.alt"
              :transcript="activeVisual.transcript"
              :chapter-markers="activeVisual.chapterMarkers"
            />
            <img v-else :src="activeVisual.assetPath" :alt="localizedText(activeVisual.alt ?? activeVisual.title)" loading="lazy" />
            <figcaption>
              <strong>{{ localizedText(activeVisual.title) }}</strong>
              <span>{{ localizedText(activeVisual.caption) }}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <aside v-if="activeSection.experimentPrompt" class="neural-experiment-prediction">
        <span>{{ copy.task }}</span>
        <strong>{{ localizedText(activeSection.experimentPrompt) }}</strong>
      </aside>

      <slot name="lab" :section="activeSection" />

      <section class="neural-chapter-conclusion" aria-live="polite">
        <span>{{ copy.observation }}</span>
        <strong>{{ localizedText(activeSection.callout) }}</strong>
        <small>{{ copy.takeaway }}</small>
      </section>

      <section v-if="isLastChapter && courseSources.length" class="neural-lesson-sources">
        <strong>{{ copy.sources }}</strong>
        <ul>
          <li v-for="source in courseSources" :key="source.href">
            <a :href="source.href" target="_blank" rel="noreferrer">{{ localizedText(source.label) }}</a>
            <small v-if="source.license">{{ source.license }}</small>
          </li>
        </ul>
      </section>

      <footer class="neural-current-lesson__navigation">
        <button
          type="button"
          :disabled="!previousSection"
          @click="previousSection && emit('change', previousSection.id)"
        >
          <span>{{ copy.previous }}</span>
          <strong>{{ sectionTitle(previousSection) }}</strong>
        </button>
        <button
          type="button"
          :disabled="!nextSection"
          @click="nextSection && emit('change', nextSection.id)"
        >
          <span>{{ copy.next }}</span>
          <strong>{{ sectionTitle(nextSection) }}</strong>
        </button>
      </footer>
    </article>
  </section>
</template>
