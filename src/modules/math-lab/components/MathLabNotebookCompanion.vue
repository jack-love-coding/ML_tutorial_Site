<script setup lang="ts">
import { computed } from 'vue'
import { withPublicBase } from '../../../utils/publicPath.ts'
import type { AmesNumericalNotebookCompanion } from '../data/amesNumericalNotebook.ts'
import type { MathLabLocale } from '../types/mathLab.ts'
import CodeLab from './CodeLab.vue'

const props = defineProps<{
  companion: AmesNumericalNotebookCompanion
  locale: MathLabLocale
}>()

const notebookHref = computed(() => withPublicBase(props.companion.notebook.publicPath))
const datasetHref = computed(() => withPublicBase(props.companion.dataset.publicPath))
const requirementsHref = computed(() => withPublicBase(props.companion.requirements.publicPath))
</script>

<template>
  <section class="math-lab-panel math-notebook-companion" :aria-labelledby="`${companion.moduleId}-notebook-title`">
    <header>
      <span>{{ locale === 'zh-CN' ? '可复现课程文件' : 'Reproducible course files' }}</span>
      <h2 :id="`${companion.moduleId}-notebook-title`">{{ companion.title[locale] }}</h2>
      <p>{{ companion.description[locale] }}</p>
    </header>

    <div class="math-notebook-companion__downloads">
      <a
        class="math-notebook-companion__download is-primary"
        :href="notebookHref"
        :download="companion.notebook.filename"
      >
        <strong>{{ companion.notebook.label[locale] }}</strong>
        <span>{{ companion.notebook.description[locale] }}</span>
      </a>
      <a
        class="math-notebook-companion__download"
        :href="datasetHref"
        :download="companion.dataset.filename"
      >
        <strong>{{ companion.dataset.label[locale] }}</strong>
        <span>{{ companion.dataset.description[locale] }}</span>
      </a>
      <a
        class="math-notebook-companion__requirements"
        :href="requirementsHref"
        :download="companion.requirements.filename"
      >
        {{ companion.requirements.label[locale] }}
      </a>
    </div>

    <CodeLab
      :title="companion.codeTitle[locale]"
      :code="companion.codeExample"
      :output="companion.codeOutput[locale]"
      :label="locale === 'zh-CN' ? '与 Notebook 对齐的代码' : 'Notebook-aligned code'"
      :copy-label="locale === 'zh-CN' ? '复制代码' : 'Copy code'"
      :copied-label="locale === 'zh-CN' ? '已复制' : 'Copied'"
      :output-label="locale === 'zh-CN' ? '固定运行输出' : 'Reproducible output'"
    />
  </section>
</template>
