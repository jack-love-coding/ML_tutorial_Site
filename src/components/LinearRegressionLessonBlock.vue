<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { linearRegressionFigures } from '../data/linearRegressionLesson'
import type { AppLocale } from '../types/ml'
import type { LinearRegressionLessonBlock } from '../types/linearRegressionLesson'
import { withPublicBase } from '../utils/publicPath'
import CodeLab from '../modules/math-lab/components/CodeLab.vue'
import MarkdownMathContent from './MarkdownMathContent.vue'

const props = defineProps<{ block: LinearRegressionLessonBlock }>()
const { locale } = useI18n()
const imageUnavailable = ref(false)
const activeLocale = computed(() => locale.value as AppLocale)
const zh = computed(() => activeLocale.value === 'zh-CN')
const figure = computed(() =>
  props.block.kind === 'figure'
    ? linearRegressionFigures[props.block.figureId]
    : undefined,
)

function localized(copy: { 'zh-CN': string; en: string }) {
  return copy[activeLocale.value]
}

watch(() => props.block.id, () => {
  imageUnavailable.value = false
})
</script>

<template>
  <section
    v-if="block.kind === 'explanation'"
    class="linear-lesson-block linear-lesson-block--explanation"
    :class="`is-${block.tone ?? 'default'}`"
    :data-block-id="block.id"
  >
    <span class="linear-lesson-block__eyebrow">{{ localized(block.eyebrow) }}</span>
    <h3>{{ localized(block.title) }}</h3>
    <MarkdownMathContent :source="localized(block.body)" />
  </section>

  <section
    v-else-if="block.kind === 'formula'"
    class="linear-lesson-block linear-lesson-block--formula"
    :data-block-id="block.id"
  >
    <span class="linear-lesson-block__eyebrow">{{ zh ? '数学连接' : 'Mathematical connection' }}</span>
    <h3>{{ localized(block.title) }}</h3>
    <MarkdownMathContent :source="block.formula" />
    <p>{{ localized(block.explanation) }}</p>
    <dl class="linear-lesson-block__variables">
      <div v-for="variable in block.variables" :key="variable.symbol">
        <dt><MarkdownMathContent :source="variable.symbol" /></dt>
        <dd>{{ localized(variable.meaning) }}</dd>
      </div>
    </dl>
  </section>

  <section
    v-else-if="block.kind === 'code'"
    class="linear-lesson-block linear-lesson-block--code"
    :data-block-id="block.id"
  >
    <CodeLab
      :title="localized(block.title)"
      :label="zh ? 'Python 代码' : 'Python code'"
      :code="block.code"
      :copy-label="zh ? '复制代码' : 'Copy code'"
      :copied-label="zh ? '已复制' : 'Copied'"
    />
    <p v-if="block.note" class="linear-lesson-block__note">{{ localized(block.note) }}</p>
  </section>

  <section
    v-else-if="block.kind === 'runtime-output'"
    class="linear-lesson-block linear-lesson-block--runtime"
    :data-block-id="block.id"
  >
    <span class="linear-lesson-block__eyebrow">{{ zh ? '运行结果' : 'Runtime output' }}</span>
    <h3>{{ localized(block.title) }}</h3>
    <pre><code>{{ block.output }}</code></pre>
    <p>{{ localized(block.interpretation) }}</p>
  </section>

  <figure
    v-else-if="block.kind === 'figure' && figure"
    class="linear-lesson-block linear-lesson-block--figure"
    :data-block-id="block.id"
  >
    <div class="linear-lesson-block__figure-heading">
      <div>
        <span class="linear-lesson-block__eyebrow">{{ zh ? '真实数据图表' : 'Real-data figure' }}</span>
        <h3>{{ localized(figure.title) }}</h3>
      </div>
      <small>Notebook cell · {{ figure.sourceCellId }}</small>
    </div>
    <img
      v-if="!imageUnavailable"
      :src="withPublicBase(figure.publicPath)"
      :alt="localized(figure.alt)"
      loading="lazy"
      decoding="async"
      @error="imageUnavailable = true"
    />
    <div v-else class="linear-lesson-block__figure-fallback" role="img" :aria-label="localized(figure.alt)">
      <strong>{{ zh ? '图表文字版' : 'Text alternative' }}</strong>
      <p>{{ localized(figure.fallback) }}</p>
    </div>
    <figcaption>{{ localized(figure.caption) }}</figcaption>
    <p class="linear-lesson-block__reading-hint">
      <strong>{{ zh ? '阅读提示：' : 'Reading hint: ' }}</strong>{{ localized(figure.readingHint) }}
    </p>
    <details>
      <summary>{{ zh ? '查看图表文字版' : 'View text alternative' }}</summary>
      <p>{{ localized(figure.fallback) }}</p>
    </details>
  </figure>

  <section
    v-else-if="block.kind === 'table'"
    class="linear-lesson-block linear-lesson-block--table"
    :data-block-id="block.id"
  >
    <span class="linear-lesson-block__eyebrow">{{ zh ? '数据表' : 'Data table' }}</span>
    <h3>{{ localized(block.title) }}</h3>
    <div class="linear-lesson-block__table-scroll" tabindex="0">
      <table>
        <thead>
          <tr>
            <th v-for="(column, index) in block.columns" :key="index" scope="col">
              {{ localized(column) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in block.rows" :key="row.id">
            <td v-for="(cell, index) in row.cells" :key="index">{{ localized(cell) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="linear-lesson-block__note">{{ localized(block.caption) }}</p>
  </section>
</template>
