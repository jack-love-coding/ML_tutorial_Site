<script setup lang="ts">
import StoryScroller from '../components/StoryScroller.vue'
import type { AlgorithmModuleDefinition, ModuleSlug } from '../types/ml'
import LessonBlockRenderer from './LessonBlockRenderer.vue'
import { getLessonInteractionProtocol } from './interactionProtocol'
import type { LessonBlockRenderMode } from './labRegistry'

const props = withDefaults(defineProps<{
  moduleDefinition: AlgorithmModuleDefinition
  activeId: string
  variant: ModuleSlug
  renderMode?: LessonBlockRenderMode
  showVisuals?: boolean
  showSources?: boolean
}>(), {
  renderMode: 'standard',
  showVisuals: false,
  showSources: false,
})

const emit = defineEmits<{
  change: [id: string]
}>()

function variantClass() {
  if (props.variant === 'ai-overview') return 'algorithm-layout--ai-overview-story'
  if (props.variant === 'gradient-descent') return 'algorithm-layout--gradient-story'
  if (props.variant === 'mlp') return 'algorithm-layout--mlp-story'
  return ''
}
</script>

<template>
  <section
    class="algorithm-layout algorithm-layout--lesson-story lesson-page"
    :class="[variantClass(), `lesson-page--${props.variant}`]"
  >
    <slot name="before-story" />

    <StoryScroller
      :sections="props.moduleDefinition.chapters"
      :active-id="props.activeId"
      @change="(id) => emit('change', id)"
    >
      <template #section="{ section }">
        <LessonBlockRenderer
          :module-definition="props.moduleDefinition"
          :section="section"
          :render-mode="props.renderMode"
          :show-visuals="props.showVisuals"
          :show-sources="props.showSources"
          :interaction-protocol="getLessonInteractionProtocol(props.variant, section.id)"
        >
          <template #lab="{ section: labSection }">
            <slot name="lab" :section="labSection" />
          </template>
        </LessonBlockRenderer>
      </template>
    </StoryScroller>
  </section>
</template>
