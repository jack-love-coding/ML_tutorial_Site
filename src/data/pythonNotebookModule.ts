import type {
  AlgorithmModuleDefinition,
  LocalizedCopy,
  ModuleSimulation,
  StorySection,
} from '../types/ml.ts'
import type { PythonDataToolsChapterId } from './pythonNotebookContract.ts'
import { pythonDataToolsRuntimeChapters } from './generated/pythonDataToolsRuntime.generated.ts'
import { algorithmCheckpointsBySlug } from './algorithmCheckpoints.ts'

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

const sectionTitleKeys = {
  'notebook-workflow': 'modules.pythonNotebook.sections.notebookWorkflow.title',
  'numpy-foundations': 'modules.pythonNotebook.sections.numpyFoundations.title',
  'pandas-structures': 'modules.pythonNotebook.sections.pandasStructures.title',
  'pandas-analysis': 'modules.pythonNotebook.sections.pandasAnalysis.title',
  'matplotlib-visualization': 'modules.pythonNotebook.sections.matplotlibVisualization.title',
  'seaborn-statistics': 'modules.pythonNotebook.sections.seabornStatistics.title',
  'plotly-exploration': 'modules.pythonNotebook.sections.plotlyExploration.title',
  'analysis-report': 'modules.pythonNotebook.sections.analysisReport.title',
} as const satisfies Record<PythonDataToolsChapterId, string>

const chapters: StorySection[] = pythonDataToolsRuntimeChapters.map((chapter) => ({
  id: chapter.id,
  eyebrowKey: 'common.chapter',
  titleKey: sectionTitleKeys[chapter.id],
  title: chapter.title,
  markdown: chapter.question,
  callout: chapter.question,
}))

function simulatePythonNotebook(): ModuleSimulation {
  return {
    snapshots: [
      {
        step: 0,
        loss: 0,
        accuracy: 0,
        derivedMetrics: {
          moduleType: 'descriptive-data-tools',
          chapterCount: pythonDataToolsRuntimeChapters.length,
        },
      },
    ],
  }
}

export const pythonNotebookModule: AlgorithmModuleDefinition = {
  slug: 'python-notebook',
  route: '/learn/python-notebook',
  titleKey: 'modules.pythonNotebook.title',
  kickerKey: 'modules.pythonNotebook.kicker',
  introKey: 'modules.pythonNotebook.intro',
  summaryKey: 'modules.pythonNotebook.summary',
  theme: '#f3f7ff',
  accent: '#2f6fed',
  checkpoints: algorithmCheckpointsBySlug['python-notebook'],
  chapters,
  controls: [],
  presets: [],
  sourceNote: loc(
    '课程正文由中英文母版生成，并与已执行的中文 Notebook 保持同一分析顺序。',
    'The lesson is generated from paired masters and follows the same analysis order as the executed Chinese Notebook.',
  ),
  createDefaultConfig: () => ({ playbackMs: 900 }),
  simulate: simulatePythonNotebook,
}
