<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownMathContent from '../components/MarkdownMathContent.vue'
import type {
  AlgorithmModuleDefinition,
  AppLocale,
  LocalizedCopy,
  ModuleSlug,
} from '../types/ml'
import { withPublicBase } from '../utils/publicPath'
import type { NeuralLabMode } from './neuralGuided'

const props = defineProps<{
  moduleDefinition: AlgorithmModuleDefinition
  activeId: string
  variant: Extract<ModuleSlug, 'mlp' | 'cnn-visualization'>
}>()

const emit = defineEmits<{
  change: [id: string]
}>()

const { locale } = useI18n()
const mode = ref<NeuralLabMode>('guided')

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        guided: '引导模式',
        explore: '深入探索',
        task: '本章动手任务',
        takeaway: '理解目标',
        details: '公式、例子与来源',
        sources: '参考来源',
        previous: '上一章',
        next: '下一章',
        chapter: '章节',
      }
    : {
        guided: 'Guided',
        explore: 'Explore',
        task: 'Try it now',
        takeaway: 'Learning target',
        details: 'Formula, examples, and sources',
        sources: 'Sources',
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

function localizedText(value?: LocalizedCopy) {
  if (!value) return ''
  return value[locale.value as AppLocale]
}

function sectionTitle(section = activeSection.value) {
  return localizedText(section?.title)
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

      <div class="neural-mode-switch" role="group" :aria-label="copy.explore">
        <button
          type="button"
          :class="{ 'is-active': mode === 'guided' }"
          :aria-pressed="mode === 'guided'"
          @click="mode = 'guided'"
        >
          {{ copy.guided }}
        </button>
        <button
          type="button"
          :class="{ 'is-active': mode === 'explore' }"
          :aria-pressed="mode === 'explore'"
          @click="mode = 'explore'"
        >
          {{ copy.explore }}
        </button>
      </div>
    </header>

    <article v-if="activeSection" :id="activeSection.id" class="neural-current-lesson">
      <header class="neural-current-lesson__brief">
        <div>
          <span>{{ copy.chapter }} {{ activeIndex + 1 }} / {{ props.moduleDefinition.chapters.length }}</span>
          <h2>{{ sectionTitle() }}</h2>
          <p>{{ localizedText(activeSection.callout) }}</p>
        </div>
        <aside>
          <span>{{ copy.task }}</span>
          <strong>{{ localizedText(activeSection.experimentPrompt) }}</strong>
        </aside>
      </header>

      <slot name="lab" :section="activeSection" :mode="mode" />

      <details class="neural-lesson-details">
        <summary>
          <span>{{ copy.details }}</span>
          <strong>{{ copy.takeaway }}</strong>
        </summary>
        <div class="neural-lesson-details__body">
          <MarkdownMathContent :source="localizedText(activeSection.markdown)" />

          <figure v-for="asset in activeVisuals" :key="asset.id" class="neural-lesson-details__visual">
            <video
              v-if="asset.type === 'manim-video'"
              controls
              preload="metadata"
              playsinline
              :poster="withPublicBase(asset.posterPath)"
            >
              <source :src="withPublicBase(asset.assetPath)" type="video/mp4" />
            </video>
            <img
              v-else
              :src="withPublicBase(asset.assetPath)"
              :alt="localizedText(asset.title)"
              loading="lazy"
            />
            <figcaption>
              <strong>{{ localizedText(asset.title) }}</strong>
              <span>{{ localizedText(asset.caption) }}</span>
            </figcaption>
          </figure>

          <section v-if="activeSection.sources?.length" class="neural-lesson-sources">
            <strong>{{ copy.sources }}</strong>
            <ul>
              <li v-for="source in activeSection.sources" :key="source.href">
                <a :href="source.href" target="_blank" rel="noreferrer">{{ localizedText(source.label) }}</a>
                <small v-if="source.license">{{ source.license }}</small>
              </li>
            </ul>
          </section>
        </div>
      </details>

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
