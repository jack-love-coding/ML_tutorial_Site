import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { pythonDataToolsContract } from '../src/data/pythonNotebookContract.ts'
import { pythonDataToolsRuntimeChapters } from '../src/data/generated/pythonDataToolsRuntime.generated.ts'
import { pythonNotebookModule } from '../src/data/pythonNotebookModule.ts'
import { algorithmCheckpointsBySlug } from '../src/data/algorithmCheckpoints.ts'
import { messages } from '../src/i18n/messages.ts'
import { curriculumRoleForModule } from '../src/curriculum/roles.ts'
import { curriculumV3FoundationModules } from '../src/curriculum/v3/modules/foundations.ts'

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

test('live switch preserves the catalog identity and required-core curriculum role', () => {
  const role = curriculumRoleForModule('python-notebook')
  const v3Module = curriculumV3FoundationModules.find(({ id }) => id === 'python-notebook')

  assert.equal(pythonDataToolsContract.moduleId, 'python-notebook')
  assert.equal(pythonDataToolsContract.route, '/learn/python-notebook')
  assert.deepEqual(role && { moduleId: role.moduleId, role: role.role }, {
    moduleId: 'python-notebook',
    role: 'required-core',
  })
  assert.deepEqual(v3Module && { id: v3Module.id, role: v3Module.role }, {
    id: 'python-notebook',
    role: 'required-core',
  })
})

test('live Python catalog copy is exact, bilingual, and free of the retired modeling lesson', () => {
  assert.deepEqual(messages['zh-CN'].modules.pythonNotebook, expectedCopy['zh-CN'])
  assert.deepEqual(messages.en.modules.pythonNotebook, expectedCopy.en)
  for (const locale of ['zh-CN', 'en'] as const) {
    const visibleCopy = JSON.stringify(messages[locale].modules.pythonNotebook)
    assert.doesNotMatch(
      visibleCopy,
      /sklearn|\bsplit\b|\bfit\b|\bpredict\b|\bmetric\b|\bmodel\b|\btraining\b|模型|训练/i,
    )
  }
})

test('dedicated course view selects the generated current chapter without a simulation shell', () => {
  const source = read('src/views/PythonDataToolsCourseView.vue')

  assert.match(source, /import PythonDataToolsPagedLesson/)
  assert.match(source, /pythonDataToolsRuntimeChapters/)
  assert.match(source, /activeChapter/)
  assert.match(source, /:chapter="activeChapter"/)
  assert.match(source, /:locale="currentLocale"/)
  assert.doesNotMatch(source, /useExperimentStore|TrainingSnapshot|loss|accuracy|simulate|PlaybackDock/)
})

test('only the final report exposes the two-question teaching review without a submit handler', () => {
  const checkpoints = algorithmCheckpointsBySlug['python-notebook']
  assert.deepEqual(checkpoints.map(({ id }) => id), [
    'python-data-tools-grouped-analysis-interpretation',
    'python-data-tools-correlation-not-causation',
  ])
  assert.deepEqual(checkpoints.map(({ revisitChapterId }) => revisitChapterId), [
    'pandas-analysis',
    'seaborn-statistics',
  ])
  assert.deepEqual(
    checkpoints.map(({ revisitChapterId }) => `${pythonDataToolsContract.route}/${revisitChapterId}`),
    [
      '/learn/python-notebook/pandas-analysis',
      '/learn/python-notebook/seaborn-statistics',
    ],
  )

  const viewSource = read('src/views/PythonDataToolsCourseView.vue')
  const quizSource = read('src/components/AlgorithmCheckpointQuiz.vue')
  assert.match(viewSource, /activeChapter\.id === 'analysis-report'/)
  assert.match(viewSource, /mode="course-review"/)
  assert.doesNotMatch(viewSource, /@submit|onAlgorithmQuizSubmit|saveAlgorithmProgress/)
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

test('final runtime audit preserves the five Stage 4 prohibition families', () => {
  const moduleSource = read('src/data/pythonNotebookModule.ts')
  const pageSource = read('src/components/PythonDataToolsPagedLesson.vue')
  const promptSource = read('src/components/PythonDataToolsTeachingPrompt.vue')
  const resultSource = read('src/components/PythonDataToolsResultBlock.vue')
  const plotlySource = read('src/components/PythonDataToolsPlotlyFigure.vue')
  const sessionSource = read('src/composables/usePythonDataToolsOutputSession.ts')
  const packageSource = read('package.json')

  assert.doesNotMatch(moduleSource, /bike-sharing-hour|python-data-tools\/outputs|python-data-tools-bike-sharing/)
  assert.match(pageSource, /block\.kind === 'result-presentation'/)
  assert.match(pageSource, /:presentation="block"/)
  assert.match(resultSource, /presentation: PythonDataToolsResultPresentationBlock/)

  assert.doesNotMatch(promptSource, /<input|<textarea|<button|defineEmits|fetch\s*\(|localStorage|sessionStorage/)
  assert.doesNotMatch(pageSource, /score|submitted|persistedToProgress|gatesChapter|mark.*Complete/)
  assert.doesNotMatch(sessionSource, /algorithmProgress|learningProgress|localStorage|sessionStorage/)

  for (const source of [moduleSource, pageSource, promptSource, resultSource, plotlySource, sessionSource]) {
    assert.doesNotMatch(source, /pyodide|jupyter\s*server|backend\s*kernel|type=["']file["']|\.fit\(|\.predict\(/i)
  }
  assert.doesNotMatch(packageSource, /pyodide/i)

  assert.match(pageSource, /withPublicBase\(manifest\.notebook\.publicPath\)/)
  assert.match(pageSource, /withPublicBase\(manifest\.environment\.path\)/)
  assert.equal((pageSource.match(/@click="outputSession\.reloadRuntimeResults"/g) ?? []).length, 1)
  assert.match(sessionSource, /let automaticLoadStarted = false/)
  assert.match(sessionSource, /let manualReloadConsumed = false/)
  assert.match(sessionSource, /activeController\?\.abort\(\)/)

  assert.match(plotlySource, /await import\('plotly\.js-basic-dist-min'\)/)
  assert.match(plotlySource, /Plotly\.react/)
  assert.match(plotlySource, /Plotly\.purge/)
  assert.match(plotlySource, /ResizeObserver/)
})

test('all generated result presentations retain one authority-owned path to their renderer', () => {
  const presentationBlocks = pythonDataToolsRuntimeChapters.flatMap((chapter) =>
    chapter.blocks.filter((block) => block.kind === 'result-presentation'),
  )
  assert.deepEqual(
    presentationBlocks.map(({ outputId }) => outputId),
    pythonDataToolsContract.chapters.flatMap(({ id }) =>
      pythonDataToolsContract.outputs.filter(({ chapterId }) => chapterId === id).map(({ id: outputId }) => outputId),
    ),
  )
  assert.equal(new Set(presentationBlocks.map(({ outputId }) => outputId)).size, 8)

  const generatedSource = read('src/data/generated/pythonDataToolsRuntime.generated.ts')
  const pageSource = read('src/components/PythonDataToolsPagedLesson.vue')
  const resultSource = read('src/components/PythonDataToolsResultBlock.vue')
  assert.match(generatedSource, /Generated by scripts\/python-data-tools\/build-runtime-content\.mjs/)
  assert.match(pageSource, /<PythonDataToolsResultBlock/)
  assert.match(resultSource, /<PythonDataToolsPlotlyFigure/)
  assert.doesNotMatch(resultSource, /const\s+(?:copy|presentations|resultCopy)\s*=/)
})
