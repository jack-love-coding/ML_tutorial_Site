import { dataLabModules } from './modules.ts'

const categoricalModule = dataLabModules.find((moduleDefinition) => moduleDefinition.id === 'categorical-data')

if (!categoricalModule) {
  throw new Error('Categorical data module is missing from the Data Lab curriculum.')
}

export const categoricalDataModule = categoricalModule
