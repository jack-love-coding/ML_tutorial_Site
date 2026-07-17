import { writeFileSync } from 'node:fs'

import { curriculumCatalog } from '../src/curriculum/catalog.ts'
import type { CurriculumModuleMetadata } from '../src/curriculum/types.ts'

const GENERATED_NOTICE = '// Generated from src/curriculum/catalog.ts. Do not edit by hand.'

export function createCurriculumCatalogMetadata(): CurriculumModuleMetadata[] {
  return curriculumCatalog.map(({ lessons: _lessons, ...metadata }) => metadata)
}

export function renderCurriculumCatalogMetadata() {
  const metadata = JSON.stringify(createCurriculumCatalogMetadata(), null, 2)
  return `${GENERATED_NOTICE}\n\nimport type { CurriculumModuleMetadata } from '../types.ts'\n\nexport const curriculumCatalogMetadata = ${metadata} satisfies CurriculumModuleMetadata[]\n`
}

if (import.meta.main) {
  writeFileSync(
    new URL('../src/curriculum/generated/catalogMetadata.ts', import.meta.url),
    renderCurriculumCatalogMetadata(),
  )
}
