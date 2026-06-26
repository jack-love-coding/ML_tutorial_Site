<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GradientTeachingBlocks from '../components/GradientTeachingBlocks.vue'
import MarkdownMathContent from '../components/MarkdownMathContent.vue'
import type { AlgorithmModuleDefinition, AppLocale, LocalizedCopy, StorySection } from '../types/ml'
import { withPublicBase } from '../utils/publicPath'
import LessonInteractionProtocolPanel from './LessonInteractionProtocolPanel.vue'
import type { TeachingInteractionProtocol } from './interactionProtocol'
import type { LessonBlockRenderMode } from './labRegistry'

const props = withDefaults(defineProps<{
  moduleDefinition: AlgorithmModuleDefinition
  section: StorySection
  renderMode?: LessonBlockRenderMode
  showVisuals?: boolean
  showSources?: boolean
  interactionProtocol?: TeachingInteractionProtocol
}>(), {
  renderMode: 'standard',
  showVisuals: false,
  showSources: false,
})

const { t, locale } = useI18n()

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        sources: '来源',
        attribution: '改写与归因',
      }
    : {
        sources: 'Sources',
        attribution: 'Rewrite and attribution',
      },
)

function localizedText(value?: LocalizedCopy) {
  if (!value) return ''
  return value[locale.value as AppLocale]
}

function publicAsset(path?: string) {
  return withPublicBase(path)
}

const sectionTitle = computed(() => localizedText(props.section.title) || t(props.section.titleKey))

const visualAssets = computed(() => {
  if (!props.showVisuals || !props.section.visualIds?.length) return []
  const visualIds = new Set(props.section.visualIds)
  return props.moduleDefinition.visuals?.filter((asset) => visualIds.has(asset.id)) ?? []
})
</script>

<template>
  <div class="lesson-block-renderer" :data-section-id="props.section.id">
    <h3>{{ sectionTitle }}</h3>

    <GradientTeachingBlocks
      v-if="props.renderMode === 'gradient' && props.section.teachingBlocks"
      :section="props.section"
    />
    <MarkdownMathContent v-else :source="localizedText(props.section.markdown)" />

    <div v-if="visualAssets.length" class="lesson-block-renderer__visuals mlp-story-visuals">
      <figure
        v-for="asset in visualAssets"
        :key="asset.id"
        class="lesson-block-renderer__visual mlp-story-visual"
        :class="`mlp-story-visual--${asset.type}`"
      >
        <video
          v-if="asset.type === 'manim-video'"
          controls
          preload="metadata"
          playsinline
          :poster="publicAsset(asset.posterPath)"
        >
          <source :src="publicAsset(asset.assetPath)" type="video/mp4" />
        </video>
        <img v-else :src="publicAsset(asset.assetPath)" :alt="localizedText(asset.title)" loading="lazy" />
        <figcaption>
          <strong>{{ localizedText(asset.title) }}</strong>
          <span>{{ localizedText(asset.caption) }}</span>
        </figcaption>
      </figure>
    </div>

    <div class="story-companion story-companion--lesson lesson-block-renderer__companion">
      <section class="story-companion__panel story-companion__panel--guide">
        <div class="panel__heading">
          <span>{{ t('common.readingGuide') }}</span>
          <strong>{{ localizedText(props.section.callout) }}</strong>
        </div>
        <div v-if="localizedText(props.section.experimentPrompt)" class="guide-prompt">
          {{ localizedText(props.section.experimentPrompt) }}
        </div>
      </section>

      <section
        v-if="props.showSources && props.section.sources?.length"
        class="story-companion__panel story-companion__panel--sources"
      >
        <div class="panel__heading">
          <span>{{ copy.sources }}</span>
          <strong>{{ copy.attribution }}</strong>
        </div>
        <ul class="mlp-source-list">
          <li v-for="source in props.section.sources" :key="source.href">
            <a :href="source.href" target="_blank" rel="noreferrer">{{ localizedText(source.label) }}</a>
            <small v-if="source.license">{{ source.license }}</small>
          </li>
        </ul>
      </section>
    </div>

    <LessonInteractionProtocolPanel
      v-if="props.interactionProtocol"
      :protocol="props.interactionProtocol"
    />

    <slot name="lab" :section="props.section" />
  </div>
</template>
