import type { LocalizedCopy } from '../types/ml.ts'

export type PythonDataToolsChapterId =
  | 'notebook-workflow'
  | 'numpy-foundations'
  | 'pandas-structures'
  | 'pandas-analysis'
  | 'matplotlib-visualization'
  | 'seaborn-statistics'
  | 'plotly-exploration'
  | 'analysis-report'

export type NotebookCellRole =
  | 'question'
  | 'setup'
  | 'data'
  | 'compute'
  | 'visualize'
  | 'interpret'
  | 'limit'
  | 'handoff'

export type PythonDataToolsOutputId =
  | 'dataset-shape-schema'
  | 'hourly-demand-profile'
  | 'workingday-comparison'
  | 'season-weather-distribution'
  | 'rider-composition'
  | 'pearson-correlation-matrix'
  | 'plotly-hourly-explorer'
  | 'final-analysis-evidence'

export type PythonDataToolsExerciseKind =
  | 'shape-index'
  | 'filter-groupby'
  | 'chart-choice'
  | 'interpret-correlation'
  | 'interactive-encoding'

export interface PythonDataToolsChapterContract {
  id: PythonDataToolsChapterId
  title: LocalizedCopy
  question: LocalizedCopy
}

export type PythonDataToolsOutputContract = {
  [Id in PythonDataToolsOutputId]: {
    id: Id
    cellId: `output-${Id}`
    chapterId: PythonDataToolsChapterId
    kind: 'json' | 'png' | 'plotly-json'
    generator: `scripts/python-data-tools/${string}`
    datasetBinding: 'manifest:file.sha256'
    environmentContractVersion: 'python-data-tools-v1'
  }
}[PythonDataToolsOutputId]

export interface PythonDataToolsContract {
  version: 'python-data-tools-v1'
  moduleId: 'python-notebook'
  route: '/learn/python-notebook'
  datasetPath: string
  environmentPath: string
  cellRoles: readonly NotebookCellRole[]
  chapters: readonly PythonDataToolsChapterContract[]
  exerciseMounts: readonly {
    chapterId: PythonDataToolsChapterId
    kind: PythonDataToolsExerciseKind
  }[]
  outputs: readonly PythonDataToolsOutputContract[]
  finalReport: {
    question: LocalizedCopy
    handoffRoute: '/data-lab'
    handoff: LocalizedCopy
  }
}

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

export const pythonDataToolsOutputIds = [
  'dataset-shape-schema',
  'hourly-demand-profile',
  'workingday-comparison',
  'season-weather-distribution',
  'rider-composition',
  'pearson-correlation-matrix',
  'plotly-hourly-explorer',
  'final-analysis-evidence',
] as const satisfies readonly PythonDataToolsOutputId[]

export const pythonDataToolsContract = {
  version: 'python-data-tools-v1',
  moduleId: 'python-notebook',
  route: '/learn/python-notebook',
  datasetPath: '/datasets/python-data-tools/bike-sharing-hour.csv',
  environmentPath: '/notebooks/python-data-tools/environment.json',
  cellRoles: [
    'question', 'setup', 'data', 'compute', 'visualize', 'interpret', 'limit', 'handoff',
  ],
  chapters: [
    {
      id: 'notebook-workflow',
      title: copy('Notebook 环境与可复现执行', 'Notebook Environment and Reproducible Execution'),
      question: copy('怎样让分析从干净内核按顺序重跑？', 'How can an analysis rerun in order from a clean kernel?'),
    },
    {
      id: 'numpy-foundations',
      title: copy('NumPy 数组与向量化统计', 'NumPy Arrays and Vectorized Statistics'),
      question: copy('怎样用形状、索引和向量化计算读懂一列需求数据？', 'How do shape, indexing, and vectorized operations explain a demand column?'),
    },
    {
      id: 'pandas-structures',
      title: copy('Pandas 表格结构', 'Pandas Table Structures'),
      question: copy('怎样保留共享单车字段的名称、类型和语义？', 'How do we preserve bike-sharing field names, types, and meaning?'),
    },
    {
      id: 'pandas-analysis',
      title: copy('Pandas 分组分析', 'Pandas Grouped Analysis'),
      question: copy('怎样按时间、工作日和天气比较需求？', 'How can demand be compared by time, working day, and weather?'),
    },
    {
      id: 'matplotlib-visualization',
      title: copy('Matplotlib 解释型图表', 'Explanatory Charts with Matplotlib'),
      question: copy('哪种图表能诚实地表达时段差异？', 'Which chart honestly communicates hourly differences?'),
    },
    {
      id: 'seaborn-statistics',
      title: copy('Seaborn 分布、关系与相关', 'Distributions, Relationships, and Correlation with Seaborn'),
      question: copy('变量共同变化说明了什么，又不能说明什么？', 'What does co-variation show, and what can it not show?'),
    },
    {
      id: 'plotly-exploration',
      title: copy('Plotly 交互探索', 'Interactive Exploration with Plotly'),
      question: copy('交互编码怎样帮助比较人群与条件？', 'How can interactive encodings compare rider groups and conditions?'),
    },
    {
      id: 'analysis-report',
      title: copy('共享单车需求分析报告', 'Bike Sharing Demand Analysis Report'),
      question: copy('哪些证据可以支持对需求规律的解释？', 'Which evidence supports an explanation of demand patterns?'),
    },
  ],
  exerciseMounts: [
    { chapterId: 'numpy-foundations', kind: 'shape-index' },
    { chapterId: 'pandas-analysis', kind: 'filter-groupby' },
    { chapterId: 'matplotlib-visualization', kind: 'chart-choice' },
    { chapterId: 'seaborn-statistics', kind: 'interpret-correlation' },
    { chapterId: 'plotly-exploration', kind: 'interactive-encoding' },
  ],
  outputs: [
    {
      id: 'dataset-shape-schema',
      cellId: 'output-dataset-shape-schema',
      chapterId: 'pandas-structures',
      kind: 'json',
      generator: 'scripts/python-data-tools/generate-authoritative-outputs.py',
      datasetBinding: 'manifest:file.sha256',
      environmentContractVersion: 'python-data-tools-v1',
    },
    {
      id: 'hourly-demand-profile',
      cellId: 'output-hourly-demand-profile',
      chapterId: 'matplotlib-visualization',
      kind: 'png',
      generator: 'scripts/python-data-tools/generate-authoritative-outputs.py',
      datasetBinding: 'manifest:file.sha256',
      environmentContractVersion: 'python-data-tools-v1',
    },
    {
      id: 'workingday-comparison',
      cellId: 'output-workingday-comparison',
      chapterId: 'pandas-analysis',
      kind: 'json',
      generator: 'scripts/python-data-tools/generate-authoritative-outputs.py',
      datasetBinding: 'manifest:file.sha256',
      environmentContractVersion: 'python-data-tools-v1',
    },
    {
      id: 'season-weather-distribution',
      cellId: 'output-season-weather-distribution',
      chapterId: 'seaborn-statistics',
      kind: 'png',
      generator: 'scripts/python-data-tools/generate-authoritative-outputs.py',
      datasetBinding: 'manifest:file.sha256',
      environmentContractVersion: 'python-data-tools-v1',
    },
    {
      id: 'rider-composition',
      cellId: 'output-rider-composition',
      chapterId: 'matplotlib-visualization',
      kind: 'png',
      generator: 'scripts/python-data-tools/generate-authoritative-outputs.py',
      datasetBinding: 'manifest:file.sha256',
      environmentContractVersion: 'python-data-tools-v1',
    },
    {
      id: 'pearson-correlation-matrix',
      cellId: 'output-pearson-correlation-matrix',
      chapterId: 'seaborn-statistics',
      kind: 'json',
      generator: 'scripts/python-data-tools/generate-authoritative-outputs.py',
      datasetBinding: 'manifest:file.sha256',
      environmentContractVersion: 'python-data-tools-v1',
    },
    {
      id: 'plotly-hourly-explorer',
      cellId: 'output-plotly-hourly-explorer',
      chapterId: 'plotly-exploration',
      kind: 'plotly-json',
      generator: 'scripts/python-data-tools/generate-authoritative-outputs.py',
      datasetBinding: 'manifest:file.sha256',
      environmentContractVersion: 'python-data-tools-v1',
    },
    {
      id: 'final-analysis-evidence',
      cellId: 'output-final-analysis-evidence',
      chapterId: 'analysis-report',
      kind: 'json',
      generator: 'scripts/python-data-tools/generate-authoritative-outputs.py',
      datasetBinding: 'manifest:file.sha256',
      environmentContractVersion: 'python-data-tools-v1',
    },
  ],
  finalReport: {
    question: copy('时间、工作日、季节、天气和用户构成怎样共同解释需求变化？', 'How do time, working days, seasons, weather, and rider composition explain demand changes?'),
    handoffRoute: '/data-lab',
    handoff: copy('本课程使用已准备好的快照；缺失、重复、异常类型和离群值处理请进入 Data Lab。', 'This course uses a prepared snapshot; use Data Lab for missing, duplicate, invalid-type, and outlier handling.'),
  },
} as const satisfies PythonDataToolsContract
