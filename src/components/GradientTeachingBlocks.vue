<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, StorySection } from '../types/ml'
import MarkdownMathContent from './MarkdownMathContent.vue'

const props = defineProps<{
  section: StorySection
}>()

const { locale } = useI18n()

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        concept: 'Concept',
        workedExample: 'Worked Example',
        formula: 'Formula',
        commonMistake: 'Common Mistake',
        rememberThis: 'Remember This',
      }
    : {
        concept: 'Concept',
        workedExample: 'Worked Example',
        formula: 'Formula',
        commonMistake: 'Common Mistake',
        rememberThis: 'Remember This',
      },
)

function localizedText(entry?: { 'zh-CN': string; en: string }) {
  if (!entry) return ''
  return entry[locale.value as AppLocale]
}

const blocks = computed(() => {
  if (!props.section.teachingBlocks) return []

  return [
    {
      id: 'concept',
      label: copy.value.concept,
      source: localizedText(props.section.teachingBlocks.concept),
      tone: 'concept',
    },
    {
      id: 'worked-example',
      label: copy.value.workedExample,
      source: localizedText(props.section.teachingBlocks.workedExample),
      tone: 'worked',
    },
    {
      id: 'formula',
      label: copy.value.formula,
      source: localizedText(props.section.teachingBlocks.formula),
      tone: 'formula',
    },
    {
      id: 'common-mistake',
      label: copy.value.commonMistake,
      source: localizedText(props.section.teachingBlocks.commonMistake),
      tone: 'mistake',
    },
    {
      id: 'remember',
      label: copy.value.rememberThis,
      source: localizedText(props.section.teachingBlocks.rememberThis),
      tone: 'remember',
    },
  ]
})
</script>

<template>
  <section v-if="blocks.length" class="gradient-teaching-blocks">
    <article
      v-for="block in blocks"
      :key="block.id"
      class="gradient-teaching-block"
      :class="`gradient-teaching-block--${block.tone}`"
    >
      <span>{{ block.label }}</span>
      <MarkdownMathContent :source="block.source" />
    </article>
  </section>
</template>
