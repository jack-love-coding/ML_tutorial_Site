<script setup lang="ts">
import { pythonDataToolsContract } from '../data/pythonNotebookContract.ts'
import type { AppLocale } from '../types/ml.ts'
import type { PythonDataToolsTeachingPromptBlock } from '../types/pythonDataToolsRuntime.ts'
import MarkdownMathContent from './MarkdownMathContent.vue'

defineProps<{
  prompt: PythonDataToolsTeachingPromptBlock
  locale: AppLocale
}>()
</script>

<template>
  <article
    class="python-data-tools-prompt"
    :data-prompt-id="prompt.id"
    :aria-labelledby="`${prompt.id}-question`"
  >
    <header class="python-data-tools-prompt__header">
      <p class="python-data-tools-prompt__eyebrow">
        {{ locale === 'zh-CN' ? '想一想' : 'Think about it' }}
      </p>
      <h3 :id="`${prompt.id}-question`">
        {{ prompt.question[locale] }}
      </h3>
    </header>

    <section class="python-data-tools-prompt__reasoning">
      <h4>{{ locale === 'zh-CN' ? '参考思路' : 'Reasoning guide' }}</h4>
      <MarkdownMathContent :source="prompt.referenceReasoning[locale]" />
    </section>

    <section class="python-data-tools-prompt__misconception">
      <h4>{{ locale === 'zh-CN' ? '常见误区' : 'Common misconception' }}</h4>
      <MarkdownMathContent :source="prompt.misconception[locale]" />
    </section>

    <router-link
      class="python-data-tools-prompt__revisit"
      :to="`${pythonDataToolsContract.route}/${prompt.chapterId}`"
    >
      {{ prompt.revisit[locale] }}
    </router-link>
  </article>
</template>
