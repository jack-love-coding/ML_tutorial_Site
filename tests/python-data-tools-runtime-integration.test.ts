import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { pythonDataToolsContract } from '../src/data/pythonNotebookContract.ts'
import { pythonDataToolsRuntimeChapters } from '../src/data/generated/pythonDataToolsRuntime.generated.ts'
import { pythonNotebookModule } from '../src/data/pythonNotebookModule.ts'
import { algorithmCheckpointsBySlug } from '../src/data/algorithmCheckpoints.ts'
import { messages } from '../src/i18n/messages.ts'

const root = new URL('../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')

const expectedCopy = {
  'zh-CN': {
    title: 'Python 数据分析工具：从 Notebook 到可复现报告',
    kicker: 'Python Data Tools',
    intro: '使用共享单车数据快照，依次学习 Notebook、NumPy、pandas、Matplotlib、Seaborn 和 Plotly，完成一轮可复现的描述性分析。',
    summary: '八章课程把数组、表格、分组统计、静态图表、交互探索与分析报告连成一条完整的数据分析路径。',
    sections: {
      notebookWorkflow: { title: 'Notebook 工作流：让每个 cell 回答一个问题' },
      numpyFoundations: { title: 'NumPy 基础：用 shape、索引和向量化理解数组' },
      pandasStructures: { title: 'pandas 数据结构：从列、类型到表格语义' },
      pandasAnalysis: { title: 'pandas 分析：筛选、分组与比较' },
      matplotlibVisualization: { title: 'Matplotlib：把问题变成清晰图表' },
      seabornStatistics: { title: 'Seaborn：读取分布、关系与相关性' },
      plotlyExploration: { title: 'Plotly：用受控交互探索小时模式' },
      analysisReport: { title: '分析报告：整理发现、限制与复现说明' },
    },
  },
  en: {
    title: 'Python Data Tools: From Notebook to Reproducible Report',
    kicker: 'Python Data Tools',
    intro: 'Use a shared-bike dataset snapshot to learn Notebook workflow, NumPy, pandas, Matplotlib, Seaborn, and Plotly through one reproducible descriptive analysis.',
    summary: 'Eight chapters connect arrays, tables, grouped summaries, static charts, interactive exploration, and an analysis report into one complete data-analysis path.',
    sections: {
      notebookWorkflow: { title: 'Notebook workflow: make each cell answer a question' },
      numpyFoundations: { title: 'NumPy foundations: understand arrays through shape, indexing, and vectorization' },
      pandasStructures: { title: 'pandas structures: columns, dtypes, and table meaning' },
      pandasAnalysis: { title: 'pandas analysis: filter, group, and compare' },
      matplotlibVisualization: { title: 'Matplotlib: turn questions into clear charts' },
      seabornStatistics: { title: 'Seaborn: read distributions, relationships, and correlation' },
      plotlyExploration: { title: 'Plotly: explore hourly patterns with controlled interaction' },
      analysisReport: { title: 'Analysis report: organize findings, limits, and reproducibility' },
    },
  },
} as const

test('live module keeps its identity and registers the eight generated chapters in contract order', () => {
  const expectedIds = pythonDataToolsContract.chapters.map(({ id }) => id)
  assert.equal(pythonNotebookModule.slug, 'python-notebook')
  assert.equal(pythonNotebookModule.route, '/learn/python-notebook')
  assert.deepEqual(pythonNotebookModule.chapters.map(({ id }) => id), expectedIds)
  assert.deepEqual(pythonDataToolsRuntimeChapters.map(({ id }) => id), expectedIds)
  assert.equal(new Set(expectedIds).size, 8)

  const moduleSource = read('src/data/pythonNotebookModule.ts')
  assert.match(moduleSource, /pythonDataToolsRuntimeChapters\.map/)
  assert.doesNotMatch(moduleSource, /bike-sharing-hour|authoritative-outputs|dataset-shape-schema\s*:/)
})

test('live Python catalog copy is exact, bilingual, and free of the retired modeling lesson', () => {
  assert.deepEqual(messages['zh-CN'].modules.pythonNotebook, expectedCopy['zh-CN'])
  assert.deepEqual(messages.en.modules.pythonNotebook, expectedCopy.en)
  for (const locale of ['zh-CN', 'en'] as const) {
    const visibleCopy = JSON.stringify(messages[locale].modules.pythonNotebook)
    assert.doesNotMatch(visibleCopy, /sklearn|train_test_split|\bfit\b|\bpredict\b|\bmetric\b|模型训练|model training/i)
  }
})

test('AlgorithmView selects the generated current chapter and omits its generic hero for Python only', () => {
  const source = read('src/views/AlgorithmView.vue')
  const heroIndex = source.indexOf('class="algorithm-hero"')
  const pythonPageIndex = source.indexOf('<PythonDataToolsPagedLesson')

  assert.match(source, /import PythonDataToolsPagedLesson/)
  assert.match(source, /pythonDataToolsRuntimeChapters/)
  assert.match(source, /activePythonDataToolsChapter/)
  assert.match(source, /v-if="!isPythonNotebookPage"[\s\S]*class="algorithm-hero"/)
  assert.ok(heroIndex >= 0 && pythonPageIndex > heroIndex)
  assert.match(source, /v-if="isPythonNotebookPage && activePythonDataToolsChapter"/)
  assert.match(source, /:chapter="activePythonDataToolsChapter"/)
  assert.match(source, /:locale="currentLocale"/)
  assert.match(source, /isLinearRegressionPage/)
  assert.match(source, /algorithm-hero__status/)
  assert.match(source, /algorithm-hero__stats/)
})

test('only the final report exposes the two-question course review through the existing submit handler', () => {
  const checkpoints = algorithmCheckpointsBySlug['python-notebook']
  assert.deepEqual(checkpoints.map(({ id }) => id), [
    'python-data-tools-grouped-analysis-interpretation',
    'python-data-tools-correlation-not-causation',
  ])
  assert.deepEqual(checkpoints.map(({ revisitChapterId }) => revisitChapterId), [
    'pandas-analysis',
    'seaborn-statistics',
  ])

  const viewSource = read('src/views/AlgorithmView.vue')
  const quizSource = read('src/components/AlgorithmCheckpointQuiz.vue')
  assert.match(viewSource, /activeSection\?\.id === 'analysis-report'/)
  assert.match(viewSource, /mode="course-review"|isPythonNotebookPage \? 'course-review'/)
  assert.match(viewSource, /@submit="onAlgorithmQuizSubmit"/)
  assert.match(quizSource, /'course-review'/)
  assert.match(quizSource, /课程回顾/)
  assert.match(quizSource, /Course Review/)
  assert.match(quizSource, /props\.moduleSlug === 'python-notebook'/)
  assert.doesNotMatch(quizSource, /saveAlgorithmProgress|appendAlgorithmQuizAttempt|localStorage/)
})

test('generated presentations stay on the PagedLesson to ResultBlock path without a handwritten registry', () => {
  const pageSource = read('src/components/PythonDataToolsPagedLesson.vue')
  const resultSource = read('src/components/PythonDataToolsResultBlock.vue')
  const promptSource = read('src/components/PythonDataToolsTeachingPrompt.vue')
  assert.match(pageSource, /block\.kind === 'result-presentation'/)
  assert.match(pageSource, /:presentation="block"/)
  assert.match(resultSource, /presentation: PythonDataToolsResultPresentationBlock/)
  assert.doesNotMatch(resultSource, /dataset-shape-schema|plotly-hourly-explorer|final-analysis-evidence/)
  assert.doesNotMatch(promptSource, /defineEmits|localStorage|sessionStorage|fetch\s*\(/)
})
