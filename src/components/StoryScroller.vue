<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, StorySection } from '../types/ml'
import MarkdownMathContent from './MarkdownMathContent.vue'

const props = defineProps<{
  sections: StorySection[]
  activeId: string
}>()

const emit = defineEmits<{
  change: [id: string]
}>()

const { t, locale } = useI18n()
const sectionRefs = ref<HTMLElement[]>([])
let scrollFrame = 0

function localizedText(copy?: { 'zh-CN': string; en: string }) {
  if (!copy) return ''
  return copy[locale.value as AppLocale]
}

function setSectionRef(element: Element | ComponentPublicInstance | null, index: number) {
  if (!element) return
  sectionRefs.value[index] = ('$el' in element ? element.$el : element) as HTMLElement
}

function jumpToSection(index: number) {
  sectionRefs.value[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function updateActiveSection() {
  const anchor = window.innerHeight * 0.28
  let nextSection = props.sections[0]

  for (const [index, sectionElement] of sectionRefs.value.entries()) {
    const rect = sectionElement.getBoundingClientRect()
    if (rect.top <= anchor) {
      nextSection = props.sections[index]
    } else {
      break
    }
  }

  emit('change', nextSection.id)
}

function queueActiveSectionUpdate() {
  if (scrollFrame) return

  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = 0
    updateActiveSection()
  })
}

onMounted(async () => {
  await nextTick()
  updateActiveSection()
  window.addEventListener('scroll', queueActiveSectionUpdate, { passive: true })
  window.addEventListener('resize', queueActiveSectionUpdate)
})

onBeforeUnmount(() => {
  if (scrollFrame) {
    window.cancelAnimationFrame(scrollFrame)
  }
  window.removeEventListener('scroll', queueActiveSectionUpdate)
  window.removeEventListener('resize', queueActiveSectionUpdate)
})
</script>

<template>
  <section class="story-column">
    <nav class="story-progress" aria-label="chapter progress">
      <button
        v-for="(section, index) in props.sections"
        :key="`${section.id}-nav`"
        type="button"
        class="story-progress__item"
        :class="{ 'is-active': props.activeId === section.id }"
        @click="jumpToSection(index)"
      >
        <span>{{ `0${index + 1}` }}</span>
        <small>{{ t(section.titleKey) }}</small>
      </button>
    </nav>

    <div class="story-flow">
      <article
        v-for="(section, index) in props.sections"
        :key="section.id"
        :ref="(element) => setSectionRef(element, index)"
        class="story-card"
        :class="{ 'is-active': props.activeId === section.id }"
        :data-section-id="section.id"
      >
        <div class="story-card__meta">
          <span class="story-card__eyebrow">
            {{ t(section.eyebrowKey) }} {{ index + 1 }}
          </span>
          <span class="story-card__count">{{ index + 1 }} / {{ props.sections.length }}</span>
        </div>
        <slot
          name="section"
          :section="section"
          :index="index"
          :is-active="props.activeId === section.id"
          :localized-text="localizedText"
        >
          <h3>{{ t(section.titleKey) }}</h3>
          <MarkdownMathContent :source="localizedText(section.markdown)" />
        </slot>
      </article>
    </div>
  </section>
</template>
