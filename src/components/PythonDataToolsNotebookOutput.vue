<script setup lang="ts">
import { ref } from 'vue'
import type { AppLocale } from '../types/ml.ts'
import type { PythonDataToolsCellOutputPreview } from '../utils/pythonDataToolsOutputs.ts'
import { withPublicBase } from '../utils/publicPath.ts'
import PythonDataToolsNotebookPlotlyPreview from './PythonDataToolsNotebookPlotlyPreview.vue'

defineProps<{
  preview?: PythonDataToolsCellOutputPreview
  locale: AppLocale
}>()

const failedImages = ref<ReadonlySet<string>>(new Set())

function markImageFailed(publicPath: string) {
  failedImages.value = new Set([...failedImages.value, publicPath])
}
</script>

<template>
  <section v-if="preview" class="python-data-tools-cell-output" :data-cell-output-id="preview.sourceCellId">
    <header>
      <strong>{{ locale === 'zh-CN' ? '代码运行输出' : 'Code output' }}</strong>
      <span>
        {{ locale === 'zh-CN' ? `Notebook 第 ${preview.executionCount} 次执行` : `Notebook execution ${preview.executionCount}` }}
      </span>
    </header>

    <template v-for="(item, index) in preview.items" :key="`${item.kind}-${index}`">
      <p v-if="item.kind === 'success'" class="python-data-tools-cell-output__success">
        {{ locale === 'zh-CN' ? '运行成功；这个单元格只完成设置或写入文件，没有直接显示输出。' : 'Ran successfully; this cell only performs setup or writes a file, so it has no direct display output.' }}
      </p>

      <pre v-else-if="item.kind === 'text'" tabindex="0"><code>{{ item.text }}</code></pre>

      <figure v-else-if="item.kind === 'image'">
        <img
          v-if="!failedImages.has(item.publicPath)"
          :src="withPublicBase(item.publicPath)"
          :alt="item.description[locale]"
          :width="item.width"
          :height="item.height"
          loading="lazy"
          @error="markImageFailed(item.publicPath)"
        />
        <p v-else role="status">
          {{ locale === 'zh-CN' ? '图像输出暂时无法显示。' : 'The image output is temporarily unavailable.' }}
          {{ item.description[locale] }}
        </p>
        <figcaption>{{ item.description[locale] }}</figcaption>
      </figure>

      <PythonDataToolsNotebookPlotlyPreview
        v-else
        :output="item"
        :locale="locale"
      />
    </template>
  </section>
</template>
