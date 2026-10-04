import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pagesEntrypoints } from '../scripts/pages-entrypoints.mjs'
import { lossDisplayFiles } from '../scripts/generate-loss-display.mjs'
import { curriculumLessonDirectory } from '../src/curriculum/generated/lessonDirectory.ts'
import { teachingUnits } from '../src/curriculum/reading.ts'
import { releaseResources, publicFile, verifyReleaseManifest } from '../scripts/textbook-release.ts'
import { textbookReadingManifest, releasedModuleIds } from '../src/curriculum/publication.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'

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
async function verifyReleased(units = teachingUnits) {
  const resources = await releaseResources(units)
  for (const path of resources.assets) assert.ok(existsSync(publicFile(path)), path)
  assert.ok(resources.assets.length > 5, 'asset scan must not be vacuous')
  const verified = resources.manifests.reduce((count, path) => count + verifyReleaseManifest(path), 0)
  assert.ok(resources.manifests.length > 0 && verified >= resources.manifests.length, 'manifest checks must not be vacuous')
  return resources
}

test('every pilot or published unit has local resources and verified manifest hashes', async () => {
  const resources = await verifyReleased()
  assert.deepEqual(resources.moduleIds, releasedModuleIds())
})

test('release coverage expands to math, paged lessons and projects when units 3 and 4 become pilot', async () => {
  const candidates = teachingUnits.map(unit => ['unit-3', 'unit-4'].includes(unit.id)
    ? { ...unit, publicationStatus: 'pilot' as const } : unit)
  const resources = await verifyReleased(candidates)
  assert.ok(resources.moduleIds.includes('calculus-functions-rate-change'))
  const bridgeAsset = mathLabModuleRegistry['calculus-functions-rate-change']!.visuals.find(asset => asset.id === 'minimum-function-machine')!.assetPath!
  assert.ok(resources.assets.includes(bridgeAsset), bridgeAsset)
  assert.ok(resources.manifests.includes('/gradient-descent/v1/output-manifest.json'))
  assert.ok(resources.manifests.includes('/notebooks/linear-regression/output-manifest.json'))
  assert.ok(resources.manifests.includes('/notebooks/tabular-regression/output-manifest.json'))
  assert.ok(!resources.moduleIds.includes('logistic-regression'))
})

test('math Notebook manifests come from course metadata when a math course is released', async () => {
  const candidates = [{ ...teachingUnits[0]!, readings: [{ moduleId: 'least-squares-fitting' }], optional: [] }]
  const resources = await releaseResources(candidates)
  assert.deepEqual(resources.manifests, ['/notebooks/numerical-methods/outputs/manifest.json'])
  assert.ok(resources.assets.some(path => path.endsWith('.ipynb')))
  for (const manifest of resources.manifests) assert.ok(verifyReleaseManifest(manifest) > 0)
})

test('browser reading manifests preserve unit order, selected chapters and publication labels', () => {
  const manifest = textbookReadingManifest()
  assert.equal(manifest.units.length, teachingUnits.length)
  for (const [index, unit] of manifest.units.entries()) {
    assert.equal(unit.publicationStatus, teachingUnits[index]!.publicationStatus)
    assert.ok(unit.readings.every(lesson => lesson.unitId === unit.id))
  }
  assert.equal(manifest.units[2]!.readings.length, 28)
  assert.equal(manifest.units[3]!.readings.length, 11)
  assert.throws(() => publicFile('/../outside.json'), /escapes public/)
})
