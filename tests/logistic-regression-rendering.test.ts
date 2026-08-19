import test from 'node:test'
import assert from 'node:assert/strict'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

const coursePath = new URL('../src/modules/logistic-regression/data/course.ts', import.meta.url)

test('Phase 29 formula-bearing bilingual content renders through safe Markdown and KaTeX', async () => {
  const { logisticCourseChapters } = await import(coursePath.href) as {
    logisticCourseChapters: readonly { blocks: readonly { body?: { 'zh-CN': string; en: string } }[] }[]
  }
  for (const chapter of logisticCourseChapters) {
    for (const block of chapter.blocks) {
      for (const locale of ['zh-CN', 'en'] as const) {
        if (!block.body) continue
        const html = renderMarkdownWithMath(block.body[locale])
        assert.doesNotMatch(html, /katex-error|\\\\\(|\\\\\[|\$\$/)
        assert.doesNotMatch(html, /<script|onerror=|javascript:/i)
      }
    }
  }
})

test('Phase 29 rendering contract keeps code-copy feedback bilingual and blocks raw HTML bypasses', async () => {
  const html = renderMarkdownWithMath(`\`\`\`python
print(1)
\`\`\`

<img src=x onerror=alert(1)>`)
  assert.match(html, /<pre>/)
  assert.doesNotMatch(html, /onerror|alert\(/)
  const source = await import('node:fs').then(({ readFileSync }) => readFileSync(new URL('../src/components/LogisticRegressionPagedLesson.vue', import.meta.url), 'utf8'))
  assert.match(source, /MarkdownMathContent/)
  assert.match(source, /copied|已复制|Copy|复制/)
})

test('Phase 29 course source uses String.raw for TeX-bearing blocks instead of raw delimiters at runtime', async () => {
  const { readFileSync } = await import('node:fs')
  const source = readFileSync(coursePath, 'utf8')
  assert.match(source, /String\.raw/)
  assert.doesNotMatch(source, /<script|sanitize-html.*bypass/i)
})
