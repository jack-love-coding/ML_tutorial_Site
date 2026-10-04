import { readFileSync, writeFileSync } from 'node:fs'

import { curriculumCatalog } from '../src/curriculum/catalog.ts'
import type { CurriculumModuleMetadata } from '../src/curriculum/types.ts'

const GENERATED_NOTICE = '// Generated from src/curriculum/catalog.ts. Do not edit by hand.'

export function createCurriculumCatalogMetadata(catalog = curriculumCatalog): CurriculumModuleMetadata[] {
  return catalog.map(({ lessons: _lessons, ...metadata }) => metadata)
}

export function renderCurriculumCatalogMetadata(catalog = curriculumCatalog) {
  const metadata = JSON.stringify(createCurriculumCatalogMetadata(catalog), null, 2)
  return `${GENERATED_NOTICE}\n\nimport type { CurriculumModuleMetadata } from '../types.ts'\n\nexport const curriculumCatalogMetadata = ${metadata} satisfies CurriculumModuleMetadata[]\n`
}

export async function generateCurriculumFiles() {
  await import('./register-ts-resolver.mjs')
  const { moduleOrder } = await import('../src/data/moduleCatalog.ts')
  const { adaptAlgorithmModule } = await import('../src/curriculum/adapters/algorithmAdapter.ts')
  const algorithms = await Promise.all(moduleOrder.map(async (loader) => adaptAlgorithmModule(await loader.load())))
  const { algorithmCurriculumMetadata } = await import('../src/curriculum/algorithmMetadata.ts')
  const { mathLabModules } = await import('../src/modules/math-lab/data/modules.ts')
  const { summarizeMathModule } = await import('../src/modules/math-lab/utils/moduleSummary.ts')
  const order = Object.keys(algorithmCurriculumMetadata)
  algorithms.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
  const catalog = [...algorithms, ...curriculumCatalog.filter((module) => module.source.namespace !== 'algorithm')]
  const directory = catalog.map(({ id, source, route, lessons }) => ({
    id, source: source.namespace, route,
    lessons: lessons.map(({ id: lessonId, title }) => ({ id: lessonId, title })),
  }))
  return new Map([
    ['mathSummaries.ts', `// Generated from final math course definitions. Do not edit by hand.\nimport type { MathLabModuleSummary } from '../../modules/math-lab/types/mathLab.ts'\nexport const mathLabModuleSummaries = ${JSON.stringify(mathLabModules.map(summarizeMathModule), null, 2)} satisfies MathLabModuleSummary[]\n`],
    ['algorithmCatalog.ts', `// Generated from runtime algorithm definitions. Do not edit by hand.\nimport type { CurriculumModule } from '../types.ts'\nexport const algorithmCatalog = ${JSON.stringify(algorithms, null, 2)} satisfies CurriculumModule[]\n`],
    ['catalogMetadata.ts', renderCurriculumCatalogMetadata(catalog)],
    ['lessonDirectory.ts', `// Generated from runtime course definitions. Do not edit by hand.\nimport type { CurriculumLessonDirectoryEntry } from '../types.ts'\nexport const curriculumLessonDirectory = ${JSON.stringify(directory, null, 2)} satisfies CurriculumLessonDirectoryEntry[]\n`],
  ])
}

if (import.meta.main) {
  for (const [name, source] of await generateCurriculumFiles()) {
    const url = new URL(`../src/curriculum/generated/${name}`, import.meta.url)
    if (process.argv.includes('--check')) {
      if (readFileSync(url, 'utf8') !== source) throw new Error(`Stale curriculum projection: ${name}. Run npm run curriculum:generate.`)
    } else {
      writeFileSync(url, source)
    }
  }
}
