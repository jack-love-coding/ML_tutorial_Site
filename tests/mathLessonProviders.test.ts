import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import katex from 'katex'
import { mathLabModuleRegistry, mathLabModuleProviderById, mathLabModuleProviders } from '../src/modules/math-lab/data/modules.ts'
import { calculusLessonProviders } from '../src/modules/math-lab/data/calculusLessonProviders.ts'
import { amesNumericalChapterIds, amesNumericalNotebookForModule } from '../src/modules/math-lab/data/amesNumericalNotebook.ts'
import { numericalBatch2ChapterIds, numericalBatch2NotebookForModule } from '../src/modules/math-lab/data/numericalBatch2Notebook.ts'
import { numericalBatch3ChapterIds, numericalBatch3NotebookForModule } from '../src/modules/math-lab/data/numericalBatch3Notebook.ts'
import { numericalBatch4ChapterIds, numericalBatch4NotebookForModule } from '../src/modules/math-lab/data/numericalBatch4Notebook.ts'

const root = new URL('../', import.meta.url)
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([key, item]) => [key, stable(item)]))
  return value
}

// Frozen from the actual runtime at c1cb70a, before any provider migration.
// These are migration parity checks, not another copy of the lesson bodies.
const contentHashes = {
  'calculus-gradient-descent': 'd61a000aca097eb260854e7e8918c3f49643f01083e9b3fd84bb92ceffcfe704',
  'calculus-optimizer-comparison': '6f76a77f6150c331902f27af90636c34a2a309017dbf9c6f4d4815e885a2921f',
  'calculus-training-code-diagnostics': '100ea3ecc74c72a2133c4b28c180db7a517379e66936b455fe6cf6abffac4982',
}

test('provider migration preserves complete runtime copy, formulas, code, results, assets and navigation', () => {
  for (const [id, expected] of Object.entries(contentHashes)) {
    const actual = createHash('sha256').update(JSON.stringify(stable(mathLabModuleRegistry[id]))).digest('hex')
    assert.equal(actual, expected, `${id}: review intentional content edits separately from the provider migration`)
  }
})

test('each standalone lesson is supplied once and has no old body or enhancer entry', () => {
  const base = readFileSync(new URL('src/modules/math-lab/data/calculusRouteModules.ts', root), 'utf8')
  const enhancers = readFileSync(new URL('src/modules/math-lab/data/calculusOptimizationRouteModules.ts', root), 'utf8')
  for (const provider of calculusLessonProviders) {
    for (const module of provider.modules) {
      assert.equal(mathLabModuleProviderById[module.id], provider.name)
      assert.equal(mathLabModuleProviders.flatMap(provider => provider.modules).filter(item => item.id === module.id).length, 1)
      assert.ok(!base.includes(`id: '${module.id}'`))
      assert.ok(!enhancers.includes(`'${module.id}':`))
      assert.deepEqual(mathLabModuleRegistry[module.id].sections, module.sections)
    }
  }
})

test('all nine historical Notebook associations are preserved as typed course metadata', () => {
  const expected = [
    ...amesNumericalChapterIds.map(amesNumericalNotebookForModule),
    ...numericalBatch2ChapterIds.map(numericalBatch2NotebookForModule),
    ...numericalBatch3ChapterIds.map(numericalBatch3NotebookForModule),
    ...numericalBatch4ChapterIds.map(numericalBatch4NotebookForModule),
  ]
  assert.equal(expected.length, 9)
  for (const companion of expected) {
    assert.ok(companion)
    const actual = mathLabModuleRegistry[companion.moduleId].notebookCompanion
    assert.ok(actual?.manifestPath)
    const { manifestPath, ...preserved } = actual
    assert.deepEqual(preserved, companion)
    assert.ok(existsSync(new URL(`public${manifestPath}`, root)))
    for (const asset of [companion.notebook, companion.dataset, companion.requirements, ...('supportingDownloads' in companion ? companion.supportingDownloads : [])]) {
      assert.ok(existsSync(new URL(`public${asset.publicPath}`, root)), asset.publicPath)
      assert.ok(asset.label['zh-CN'] && asset.label.en)
    }
  }
  const page = readFileSync(new URL('src/modules/math-lab/pages/MathLabModulePage.vue', root), 'utf8')
  const component = readFileSync(new URL('src/modules/math-lab/components/MathLabNotebookCompanion.vue', root), 'utf8')
  assert.doesNotMatch(page + component, /numericalBatch[234]|amesNumerical/)
})

test('Notebook and provider concept formulas retain literal LaTeX escapes and render correctly', () => {
  for (const module of Object.values(mathLabModuleRegistry)) {
    if (!module.notebookCompanion && !(module.id in contentHashes)) continue
    for (const concept of module.concepts) {
      assert.doesNotMatch(concept.formulaLatex, /[\u0000-\u0008\u000b-\u001f]/, `${module.id}/${concept.id}`)
      assert.doesNotThrow(() => katex.renderToString(concept.formulaLatex, { throwOnError: true }), `${module.id}/${concept.id}`)
    }
  }
  assert.match(mathLabModuleRegistry['finite-difference-methods'].concepts[0]!.formulaLatex, /\\approx\\frac/)
})
