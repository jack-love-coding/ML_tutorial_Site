import type { LocalizedCopy } from '../types/ml.ts'

export type CurriculumLibraryDomainId = 'math' | 'data' | 'model' | 'deep-learning' | 'project'

export interface CurriculumLibraryDomain {
  id: CurriculumLibraryDomainId
  title: LocalizedCopy
  summary: LocalizedCopy
}

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

export const curriculumLibraryDomains: CurriculumLibraryDomain[] = [
  {
    id: 'math',
    title: copy('数学专题', 'Math Topics'),
    summary: copy('连接数学直觉与模型行为。', 'Connect mathematical intuition to model behavior.'),
  },
  {
    id: 'data',
    title: copy('数据专题', 'Data Topics'),
    summary: copy('理解原始数据如何成为模型输入。', 'Understand how raw data becomes model input.'),
  },
  {
    id: 'model',
    title: copy('模型与训练', 'Models and Training'),
    summary: copy('观察损失、优化、边界与评估。', 'Study loss, optimization, boundaries, and evaluation.'),
  },
  {
    id: 'deep-learning',
    title: copy('深度学习', 'Deep Learning'),
    summary: copy('从 MLP 延伸到 CNN 与 Transformer。', 'Extend from MLPs to CNNs and Transformers.'),
  },
  {
    id: 'project',
    title: copy('项目实战', 'Projects'),
    summary: copy('在端到端任务中整合知识。', 'Integrate knowledge in end-to-end tasks.'),
  },
]

const domainIds = new Set(curriculumLibraryDomains.map((domain) => domain.id))

export function isCurriculumLibraryDomain(value: unknown): value is CurriculumLibraryDomainId {
  return typeof value === 'string' && domainIds.has(value as CurriculumLibraryDomainId)
}

export function resolveCurriculumLibraryDomain(value: unknown): CurriculumLibraryDomainId {
  return isCurriculumLibraryDomain(value) ? value : 'math'
}
