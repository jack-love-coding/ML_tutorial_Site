import './register-ts-resolver.mjs'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'
import { curriculumModuleById } from '../src/curriculum/catalog.ts'
import { releasedModuleIds } from '../src/curriculum/publication.ts'
import { algorithmReleaseManifests } from '../src/curriculum/releaseAssets.ts'
import { teachingUnits, type TeachingUnit } from '../src/curriculum/reading.ts'
import { loadAlgorithmModule } from '../src/data/moduleCatalog.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'
import { dataLabModuleRegistry } from '../src/modules/data-lab/data/modules.ts'
import type { ModuleSlug } from '../src/types/ml.ts'

// These are the same typed providers consumed by the specialized runtime renderers.
const specializedContent: Partial<Record<ModuleSlug, () => Promise<unknown>>> = {
  'python-notebook': () => import('../src/data/generated/pythonDataToolsRuntime.generated.ts'),
  'linear-regression': () => import('../src/data/linearRegressionLesson.ts'),
  'gradient-descent': () => import('../src/data/gradientDescentLesson.ts'),
  'housing-price-project': () => import('../src/data/housingProjectLesson.ts'),
  'loss-functions': () => import('../src/data/lossFunctionsAssets.ts'),
  'logistic-regression': () => import('../src/modules/logistic-regression/data/course.ts'),
}
const publicRoot = resolve(import.meta.dirname, '../public')
const publicFolders = new Set(readdirSync(publicRoot))
const assetPattern = new RegExp(`/(?:${[...publicFolders].map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})/[\\w./-]+\\.(?:png|jpe?g|svg|webp|mp4|json|ipynb|csv|txt|woff2?|pdf)`, 'g')

export function publicFile(path: string, relativeTo = publicRoot) {
  const name = path.replace(/^\//, '')
  const absolute = resolve(path.startsWith('/') || publicFolders.has(name.split('/')[0]!) ? publicRoot : relativeTo, name)
  if (!absolute.startsWith(publicRoot + sep)) throw new Error(`Asset escapes public/: ${path}`)
  return absolute
}

export function referencedPublicAssets(value: unknown, found = new Set<string>()): Set<string> {
  if (typeof value === 'string') for (const match of value.matchAll(assetPattern)) found.add(match[0])
  else if (Array.isArray(value)) value.forEach(entry => referencedPublicAssets(entry, found))
  else if (value && typeof value === 'object') Object.values(value).forEach(entry => referencedPublicAssets(entry, found))
  return found
}

export async function releaseResources(units: readonly TeachingUnit[] = teachingUnits) {
  const moduleIds = releasedModuleIds(units)
  const assets = new Set<string>()
  const manifests = new Set<string>()
  for (const id of moduleIds) {
    const metadata = curriculumModuleById.get(id)
    if (!metadata) throw new Error(`Unknown released module: ${id}`)
    let content: unknown
    switch (metadata.source.namespace) {
      case 'algorithm': {
        content = await loadAlgorithmModule(id as ModuleSlug)
        const extra = specializedContent[id as ModuleSlug]
        if (extra) referencedPublicAssets(await extra(), assets)
        for (const path of algorithmReleaseManifests[id as ModuleSlug] ?? []) manifests.add(path)
        break
      }
      case 'math-lab': {
        content = mathLabModuleRegistry[id]
        const companion = mathLabModuleRegistry[id]?.notebookCompanion
        if (companion) {
          if (!companion.manifestPath) throw new Error(`Notebook lacks release manifest: ${id}`)
          manifests.add(companion.manifestPath)
        }
        break
      }
      case 'data-lab': content = dataLabModuleRegistry[id]; break
    }
    if (!content) throw new Error(`Missing released content: ${id}`)
    referencedPublicAssets(content, assets)
  }
  return { moduleIds, assets: [...assets].sort(), manifests: [...manifests].sort() }
}

export function verifyReleaseManifest(publicPath: string) {
  const manifestFile = publicFile(publicPath)
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'))
  let verified = 0
  const check = (name: string, expected: string, bytes?: number) => {
    if (/^(scripts|docs)\//.test(name)) return // Source provenance is validated by each offline contract.
    const path = publicFile(name, dirname(manifestFile))
    if (!existsSync(path)) throw new Error(`Missing manifest asset: ${publicPath} -> ${name}`)
    const data = readFileSync(path)
    if (createHash('sha256').update(data).digest('hex') !== expected) throw new Error(`Hash mismatch: ${name}`)
    if (bytes !== undefined && data.length !== bytes) throw new Error(`Byte length mismatch: ${name}`)
    verified++
  }
  function visit(value: unknown) {
    if (Array.isArray(value)) return value.forEach(visit)
    if (!value || typeof value !== 'object') return
    const entry = value as Record<string, unknown>
    const path = entry.publicPath ?? entry.path
    if (typeof path === 'string' && typeof entry.sha256 === 'string') check(path, entry.sha256, typeof entry.bytes === 'number' ? entry.bytes : undefined)
    if (entry.fileHashes && typeof entry.fileHashes === 'object') {
      for (const [name, hash] of Object.entries(entry.fileHashes)) if (typeof hash === 'string') check(name, hash)
    }
    Object.values(entry).forEach(visit)
  }
  visit(manifest)
  if (!verified) throw new Error(`Manifest verifies no assets: ${publicPath}`)
  return verified
}
