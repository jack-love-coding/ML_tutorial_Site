import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { pythonDataToolsContract } from '../src/data/pythonNotebookContract.ts'
import type {
  PythonDataToolsResultPresentationBlock,
  PythonDataToolsRuntimeChapter,
  PythonDataToolsTeachingPromptBlock,
} from '../src/types/pythonDataToolsRuntime.ts'

async function loadGenerated(): Promise<readonly PythonDataToolsRuntimeChapter[]> {
  try {
    const generated = await import('../src/data/generated/pythonDataToolsRuntime.generated.ts')
    return generated.pythonDataToolsRuntimeChapters
  } catch {
    assert.fail('generated result presentation projection is missing')
  }
}

test('generated projection contains exactly five complete stateless prompts in contract order', async () => {
  const chapters = await loadGenerated()
  const prompts = chapters.flatMap((chapter) => chapter.blocks.filter(
    (block): block is PythonDataToolsTeachingPromptBlock => block.kind === 'teaching-prompt',
  ))
  assert.deepEqual(prompts.map(({ id }) => id), pythonDataToolsContract.exerciseMounts.map(({ kind }) => kind))
  for (const prompt of prompts) {
    for (const locale of ['zh-CN', 'en'] as const) {
      assert.ok(prompt.question[locale])
      assert.ok(prompt.referenceReasoning[locale])
      assert.ok(prompt.misconception[locale])
      assert.ok(prompt.revisit[locale])
    }
    assert.deepEqual(
      [prompt.scored, prompt.submitted, prompt.persistedToProgress, prompt.gatesChapter],
      [false, false, false, false],
    )
  }
})

test('generated projection contains eight localized result presentations bound to contract results', async () => {
  const chapters = await loadGenerated()
  const results = chapters.flatMap((chapter) => chapter.blocks.filter(
    (block): block is PythonDataToolsResultPresentationBlock => block.kind === 'result-presentation',
  ))
  const expected = pythonDataToolsContract.chapters.flatMap((chapter) => pythonDataToolsContract.outputs.filter(({ chapterId }) => chapterId === chapter.id))
  assert.deepEqual(results.map(({ outputId }) => outputId), expected.map(({ id }) => id))
  for (const [index, result] of results.entries()) {
    assert.equal(result.outputKind, expected[index].kind)
    for (const field of ['title', 'alt', 'interpretation', 'limitation', 'fallbackSummary'] as const) {
      assert.ok(result[field]['zh-CN'])
      assert.ok(result[field].en)
    }
    if (result.outputKind === 'json') assert.deepEqual(result.axisLegendTranslations, [])
    else assert.ok(result.axisLegendTranslations.length > 0)
  }
})

test('handwritten runtime sources do not become a second learner-copy or asset-path registry', () => {
  const typeSource = readFileSync(new URL('../src/types/pythonDataToolsRuntime.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(typeSource, /bike-sharing-hour|authoritative-outputs|public\/notebooks|\/notebooks\/python-data-tools/)
  assert.doesNotMatch(typeSource, /平均|mean demand|correlation coefficient\s*[=:]\s*-?\d/i)
  assert.match(typeSource, /PythonDataToolsTeachingPromptBlock/)
  assert.match(typeSource, /PythonDataToolsResultPresentationBlock/)
})
