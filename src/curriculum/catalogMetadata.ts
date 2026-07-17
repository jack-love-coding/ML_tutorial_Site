import { curriculumCatalogMetadata as generatedCurriculumCatalogMetadata } from './generated/catalogMetadata.ts'
import type { CurriculumModuleMetadata } from './types.ts'

export const curriculumCatalogMetadata: readonly CurriculumModuleMetadata[] =
  generatedCurriculumCatalogMetadata

export const curriculumMetadataById = new Map<string, CurriculumModuleMetadata>(
  curriculumCatalogMetadata.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
)
