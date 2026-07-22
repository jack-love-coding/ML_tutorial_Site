<script setup lang="ts">
import { computed } from 'vue'
import { withPublicBase } from '../../../utils/publicPath.ts'
import type { AmesNumericalNotebookCompanion } from '../data/amesNumericalNotebook.ts'
import type { NumericalBatch2NotebookCompanion } from '../data/numericalBatch2Notebook.ts'
import type { NumericalBatch3NotebookCompanion } from '../data/numericalBatch3Notebook.ts'
import type { NumericalBatch4NotebookCompanion } from '../data/numericalBatch4Notebook.ts'
import type { MathLabLocale } from '../types/mathLab.ts'
import CodeLab from './CodeLab.vue'

const props = defineProps<{
  companion:
    | AmesNumericalNotebookCompanion
    | NumericalBatch2NotebookCompanion
    | NumericalBatch3NotebookCompanion
    | NumericalBatch4NotebookCompanion
  locale: MathLabLocale
}>()

const notebookHref = computed(() => withPublicBase(props.companion.notebook.publicPath))
const datasetHref = computed(() => withPublicBase(props.companion.dataset.publicPath))
const requirementsHref = computed(() => withPublicBase(props.companion.requirements.publicPath))
const supportingDownloadLinks = computed(() => (
  'supportingDownloads' in props.companion
    ? props.companion.supportingDownloads.map((asset) => ({
        asset,
        href: withPublicBase(asset.publicPath),
      }))
    : []
))
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

    <section
      v-if="supportingDownloadLinks.length"
      class="math-notebook-companion__supporting"
      :aria-labelledby="`${companion.moduleId}-supporting-downloads-title`"
    >
      <header>
        <span>{{ locale === 'zh-CN' ? '已执行结果与审计文件' : 'Executed results and audit files' }}</span>
        <h3 :id="`${companion.moduleId}-supporting-downloads-title`">
          {{ locale === 'zh-CN' ? '继续检查完整运行' : 'Inspect the complete run' }}
        </h3>
      </header>
      <ul class="math-notebook-companion__supporting-list">
        <li v-for="{ asset, href } in supportingDownloadLinks" :key="asset.publicPath">
          <a
            class="math-notebook-companion__download"
            :href="href"
            :download="asset.filename"
          >
            <strong>{{ asset.label[locale] }}</strong>
            <span>{{ asset.description[locale] }}</span>
          </a>
        </li>
      </ul>
    </section>

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
