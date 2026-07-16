import test from 'node:test'
import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pythonDataToolsContract } from '../src/data/pythonNotebookContract.ts'
import type { PythonDataToolsRuntimeChapter } from '../src/types/pythonDataToolsRuntime.ts'

const authorityRoot = new URL('../docs/curriculum-v3/python-data-tools/', import.meta.url)

async function loadCompiler() {
  try {
    return await import('../scripts/python-data-tools/build-runtime-content.mjs')
  } catch {
    assert.fail('paired compiler implementation is missing')
  }
}

async function loadGenerated(): Promise<readonly PythonDataToolsRuntimeChapter[]> {
  try {
    const generated = await import('../src/data/generated/pythonDataToolsRuntime.generated.ts')
    return generated.pythonDataToolsRuntimeChapters
  } catch {
    assert.fail('generated result presentation projection is missing')
  }
}

function withFixture(run: (root: string) => Promise<void>) {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'python-data-tools-compiler-'))
  const root = join(temporaryDirectory, 'python-data-tools')
  cpSync(authorityRoot, root, { recursive: true })
  return run(root).finally(() => rmSync(temporaryDirectory, { recursive: true, force: true }))
}

function stripNonLearnerSyntax(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/`[^`\n]+`/g, '')
}

function assertLearnerTerminology(source: string, locale: 'zh-CN' | 'en', label: string) {
  const visible = stripNonLearnerSyntax(source)
  const forbidden = locale === 'zh-CN'
    ? /证据|清单文件|输出文件/u
    : /\b(?:evidence|manifest|output)\b/iu
  assert.doesNotMatch(visible, forbidden, `${label} exposes internal implementation vocabulary`)
}

test('paired compiler projects eight localized chapters in contract order', async () => {
  const compiler = await loadCompiler()
  const chapters = compiler.compileRuntimeContent()
  assert.deepEqual(chapters.map(({ id }: PythonDataToolsRuntimeChapter) => id), pythonDataToolsContract.chapters.map(({ id }) => id))
  assert.equal(chapters.length, 8)
  for (const chapter of chapters) {
    assert.ok(chapter.title['zh-CN'])
    assert.ok(chapter.title.en)
    assert.ok(chapter.question['zh-CN'])
    assert.ok(chapter.question.en)
    assert.ok(chapter.blocks.length > 0)
  }
})

test('compiled code, formulas, marker order, and output ownership remain paired', async () => {
  const compiler = await loadCompiler()
  const chapters = compiler.compileRuntimeContent()
  const codeBlocks = chapters.flatMap((chapter: PythonDataToolsRuntimeChapter) => chapter.blocks.filter(({ kind }) => kind === 'code'))
  assert.equal(codeBlocks.length, 48)
  assert.equal(new Set(codeBlocks.map(({ id }) => id)).size, 48)
  assert.deepEqual(
    codeBlocks.filter(({ outputId }) => outputId).map(({ outputId }) => outputId),
    pythonDataToolsContract.chapters.flatMap((chapter) => pythonDataToolsContract.outputs.filter(({ chapterId }) => chapterId === chapter.id).map(({ id }) => id)),
  )
})

test('the committed generated projection is typed and matches a fresh compilation', async () => {
  const compiler = await loadCompiler()
  const generated = await loadGenerated()
  assert.deepEqual(generated, compiler.compileRuntimeContent())
})

test('compiler fixtures reject duplicate and reordered IDs with first-mismatch diagnostics', async () => {
  const compiler = await loadCompiler()
  await withFixture(async (root) => {
    const file = join(root, 'english-master', '02-numpy-foundations.md')
    const source = readFileSync(file, 'utf8')
    writeFileSync(file, source.replace('ch02-index-slice', 'ch02-demand-array'), 'utf8')
    assert.throws(
      () => compiler.compileRuntimeContent({ root }),
      /\[en\].*02-numpy-foundations\.md.*numpy-foundations.*cell.*first mismatch|duplicate/si,
    )
  })
})

test('compiler fixtures reject missing locale content and stale generated targets read-only', async () => {
  const compiler = await loadCompiler()
  await withFixture(async (root) => {
    const file = join(root, 'english-master', '01-notebook-workflow.md')
    writeFileSync(file, '', 'utf8')
    assert.throws(() => compiler.compileRuntimeContent({ root }), /\[en\].*01-notebook-workflow\.md.*empty/si)
  })

  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'python-data-tools-target-'))
  const target = join(temporaryDirectory, 'runtime.generated.ts')
  try {
    writeFileSync(target, '// stale\n', 'utf8')
    assert.throws(() => compiler.checkRuntimeContent({ target }), /out of date/i)
    assert.equal(readFileSync(target, 'utf8'), '// stale\n')
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

test('all sixteen masters and generated learner copy pass the parser-aware terminology gate', async () => {
  const generated = await loadGenerated()
  const localeDirectories = { 'zh-CN': 'chinese-master', en: 'english-master' } as const

  for (const [index, chapter] of pythonDataToolsContract.chapters.entries()) {
    const filename = `${String(index + 1).padStart(2, '0')}-${chapter.id}.md`
    for (const locale of ['zh-CN', 'en'] as const) {
      const master = readFileSync(new URL(`${localeDirectories[locale]}/${filename}`, authorityRoot), 'utf8')
      assertLearnerTerminology(master, locale, `${locale}/${filename}`)
    }
  }

  for (const chapter of generated) {
    for (const locale of ['zh-CN', 'en'] as const) {
      const learnerCopy = [chapter.title[locale], chapter.question[locale]]
      for (const block of chapter.blocks) {
        if (block.kind === 'markdown') learnerCopy.push(block.markdown[locale])
        if (block.kind === 'result-presentation') {
          learnerCopy.push(
            block.title[locale],
            block.alt[locale],
            block.interpretation[locale],
            block.limitation[locale],
            block.fallbackSummary[locale],
            ...block.axisLegendTranslations.map(({ label }) => label[locale]),
          )
        }
        if (block.kind === 'teaching-prompt') {
          learnerCopy.push(
            block.question[locale],
            block.referenceReasoning[locale],
            block.misconception[locale],
            block.revisit[locale],
          )
        }
      }
      assertLearnerTerminology(learnerCopy.join('\n'), locale, `generated/${chapter.id}/${locale}`)
    }
  }
})
