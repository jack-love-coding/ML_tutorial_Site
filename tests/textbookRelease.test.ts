import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pagesEntrypoints } from '../scripts/pages-entrypoints.mjs'
import { lossDisplayFiles } from '../scripts/generate-loss-display.mjs'
import { curriculumLessonDirectory } from '../src/curriculum/generated/lessonDirectory.ts'
import { teachingUnits } from '../src/curriculum/reading.ts'
import { curriculumModuleById } from '../src/curriculum/catalog.ts'
import { loadAlgorithmModule } from '../src/data/moduleCatalog.ts'
import { dataLabModuleRegistry } from '../src/modules/data-lab/data/modules.ts'

const hash = (data: Buffer | string) => createHash('sha256').update(data).digest('hex')
test('Pages entries cover every module, chapter, short URL, and compatibility redirect', () => {
  const paths = new Set(pagesEntrypoints())
  for (const module of curriculumLessonDirectory) {
    assert.ok(paths.has(module.route))
    for (const lesson of module.lessons) assert.ok(paths.has(`/learn/${module.id}/${lesson.id}`))
  }
  for (const path of ['/python/notebook-rhythm', '/learn/ai-overview/what-is-ml', '/progress', '/math-lab/diagnostic', '/library/math', '/library/deep-learning', '/learn/mlp/explore', '/courses/ai-foundation/units/14-tabular-pipeline']) assert.ok(paths.has(path), path)
  for (const path of paths) assert.ok(path.startsWith('/') && !path.includes('..'))
})
test('loss display data preserves every shown value and aggregate from the downloadable results', () => {
  for (const [path, expected] of lossDisplayFiles()) {
    assert.equal(readFileSync(path, 'utf8'), expected, `${path}: regenerate display data`)
    assert.ok(Buffer.byteLength(expected) < 25000, path)
    const data = JSON.parse(expected)
    for (const source of data.sources) {
      const raw = readFileSync(resolve('public', '.' + source.publicPath))
      assert.equal(source.sha256, hash(raw))
      const full = JSON.parse(raw.toString())
      const displayed = data.summaries[source.id]
      assert.deepEqual(displayed, { ...full, rows: full.rows.slice(0, 3), highContributionRows: full.highContributionRows.slice(0, 5) })
      assert.equal(displayed.aggregate.rowCount, full.rows.length)
    }
  }
})
let referencedAssets = 0
function verifyReferences(value: unknown) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/\/(?:ai-overview|math-lab|data-lab|manim|notebooks|datasets|images)\/[\w./-]+\.(?:png|jpg|jpeg|svg|webp|mp4|json|ipynb|csv)/g)) { assert.ok(existsSync(resolve('public', '.' + match[0])), match[0]); referencedAssets++ }
  } else if (Array.isArray(value)) value.forEach(verifyReferences)
  else if (value && typeof value === 'object') Object.values(value).forEach(verifyReferences)
}
test('pilot content references existing local assets', async () => {
  for (const unit of teachingUnits.slice(0, 2)) for (const step of unit.readings) {
    const metadata = curriculumModuleById.get(step.moduleId)!
    const content = metadata.source.namespace === 'algorithm' ? await loadAlgorithmModule(step.moduleId as never) : dataLabModuleRegistry[step.moduleId]
    assert.ok(content, step.moduleId)
    verifyReferences(content)
  }
  assert.ok(referencedAssets > 5, 'asset scan must not be vacuous')
})
test('published Notebook manifests and hashes are verified without regenerating notebooks', () => {
  const manifests = ['notebooks/python-data-tools/outputs/manifest.json', 'notebooks/loss-functions/outputs/manifest.json', 'notebooks/linear-regression/output-manifest.json']
  let verified = 0
  function visit(value: unknown) {
    if (Array.isArray(value)) return value.forEach(visit)
    if (!value || typeof value !== 'object') return
    const entry = value as Record<string, unknown>
    const name = entry.publicPath ?? entry.path
    if (typeof name === 'string' && typeof entry.sha256 === 'string' && !name.startsWith('scripts/') && !name.startsWith('docs/')) {
      const path = name.startsWith('scripts/') || name.startsWith('docs/') ? name : resolve('public', name.replace(/^\//, ''))
      assert.ok(existsSync(path), path)
      const bytes = readFileSync(path)
      assert.equal(hash(bytes), entry.sha256, path)
      if (typeof entry.bytes === 'number') assert.equal(bytes.length, entry.bytes, path)
      verified++
    }
    Object.values(value).forEach(visit)
  }
  for (const manifest of manifests) visit(JSON.parse(readFileSync(resolve('public', manifest), 'utf8')))
  assert.ok(verified > 25)
})
