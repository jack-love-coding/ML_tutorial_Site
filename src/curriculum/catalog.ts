import { dataLabModules } from '../modules/data-lab/data/modules.ts'
import { mathLabModules } from '../modules/math-lab/data/modules.ts'
import { adaptAlgorithmModules } from './adapters/algorithmAdapter.ts'
import { adaptDataLabModules } from './adapters/dataLabAdapter.ts'
import { adaptMathLabModules } from './adapters/mathLabAdapter.ts'
import type { CurriculumModule } from './types.ts'

const algorithmModules = adaptAlgorithmModules()
const mathModules = adaptMathLabModules(mathLabModules)
const dataModules = adaptDataLabModules(dataLabModules)

export const curriculumCatalog: CurriculumModule[] = [
  ...algorithmModules,
  ...mathModules,
  ...dataModules,
]

export const curriculumModuleById = new Map(
  curriculumCatalog.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
)

export const curriculumModulesBySource = {
  algorithm: new Map(algorithmModules.map((moduleDefinition) => [moduleDefinition.source.id, moduleDefinition])),
  mathLab: new Map(mathModules.map((moduleDefinition) => [moduleDefinition.source.id, moduleDefinition])),
  dataLab: new Map(dataModules.map((moduleDefinition) => [moduleDefinition.source.id, moduleDefinition])),
}
