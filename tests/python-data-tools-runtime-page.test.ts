import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8')

test('dedicated page renders one supplied chapter with an eight-entry bilingual navigation', async () => {
  const source = await read('../src/components/PythonDataToolsPagedLesson.vue')

  assert.match(source, /chapter: PythonDataToolsRuntimeChapter/)
  assert.match(source, /locale: AppLocale/)
  assert.match(source, /pythonDataToolsRuntimeChapters/)
  assert.match(source, /v-for="\(chapterEntry, index\) in pythonDataToolsRuntimeChapters"/)
  assert.match(source, /data-testid="python-data-tools-current-chapter"/)
  assert.match(source, /v-for="block in chapter\.blocks"/)
  assert.match(source, /currentIndex \+ 1/)
  assert.match(source, /pythonDataToolsRuntimeChapters\.length/)
  assert.match(source, /mobileMenuOpen/)
  assert.match(source, /closeMobileMenu/)
  assert.match(source, /previousChapter/)
  assert.match(source, /nextChapter/)
  assert.doesNotMatch(source, /progressPercent|mastery|pass(ed)?|gatesChapter/i)
})

test('generated blocks remain inline and forward presentation plus typed session state', async () => {
  const source = await read('../src/components/PythonDataToolsPagedLesson.vue')

  assert.match(source, /<MarkdownMathContent/)
  assert.match(source, /block\.kind === 'code'/)
  assert.match(source, /<PythonDataToolsResultBlock/)
  assert.match(source, /:presentation="block"/)
  assert.match(source, /:state="outputSession\.stateFor\(block\.outputId\)"/)
  assert.match(source, /:fallback-results="fallbackResultsFor\(block\.outputId\)"/)
  assert.match(source, /@fallback-needed="loadFallbackResults\(block\.outputId\)"/)
  assert.match(source, /usePythonDataToolsOutputSession\(\{ outputIds: chapterOutputIds \}\)/)
  assert.match(source, /<PythonDataToolsTeachingPrompt/)
  assert.match(source, /:prompt="block"/)
  assert.doesNotMatch(source, /dataset-shape-schema\s*:/)
  assert.doesNotMatch(source, /<[^>]+>[^<{]*(证据|manifest)[^<{]*<\//i)
})

test('page exposes two base-safe Notebook placements and one session-level reload action', async () => {
  const source = await read('../src/components/PythonDataToolsPagedLesson.vue')
  const styles = await read('../src/styles/modules/python-data-tools.css')
  const styleIndex = await read('../src/styles/index.css')

  assert.match(source, /usePythonDataToolsOutputSession/)
  assert.match(source, /withPublicBase/)
  assert.match(source, /manifest\.notebook\.publicPath/)
  assert.match(source, /manifest\.environment\.path/)
  assert.equal((source.match(/class="python-data-tools-page__download"/g) ?? []).length, 2)
  assert.match(source, /下载完整中文 Notebook/)
  assert.match(source, /Download the complete Chinese Notebook/)
  assert.match(source, /已执行并包含运行结果/)
  assert.match(source, /executed and contains its runtime results/i)
  assert.match(source, /本地 Python 环境/)
  assert.match(source, /local Python environment/i)
  assert.match(source, /重新加载运行结果/)
  assert.match(source, /Reload runtime results/)
  assert.equal((source.match(/outputSession\.reloadRuntimeResults/g) ?? []).length, 1)
  assert.doesNotMatch(source, /setTimeout|setInterval|watchEffect/)

  assert.match(styleIndex, /modules\/python-data-tools\.css/)
  assert.match(styles, /position:\s*sticky/)
  assert.match(styles, /:focus-visible/)
  assert.match(styles, /overflow-wrap:\s*anywhere/)
  assert.match(styles, /@media \(max-width:\s*1080px\)/)
  assert.match(styles, /@media \(max-width:\s*720px\)/)
  assert.match(styles, /prefers-reduced-motion:\s*reduce/)
})
