import { curriculumV3FoundationModules } from './modules/foundations.ts'
import { curriculumV3MachineLearningModules } from './modules/machineLearning.ts'
import { curriculumV3DeepLearningModules } from './modules/deepLearning.ts'

export const curriculumV3InstructionalModules = [
  ...curriculumV3FoundationModules,
  ...curriculumV3MachineLearningModules,
  ...curriculumV3DeepLearningModules,
]

export const curriculumV3InstructionalModuleById = new Map(
  curriculumV3InstructionalModules.map((module) => [module.id, module]),
)
