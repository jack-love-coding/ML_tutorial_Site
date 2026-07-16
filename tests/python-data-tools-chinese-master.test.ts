import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  pythonDataToolsContract,
  type NotebookCellRole,
  type PythonDataToolsChapterId,
  type PythonDataToolsExerciseKind,
  type PythonDataToolsOutputId,
} from '../src/data/pythonNotebookContract.ts'

const masterDirectory = new URL(
  '../docs/curriculum-v3/python-data-tools/chinese-master/',
  import.meta.url,
)

const chapterFiles = [
  '01-notebook-workflow.md',
  '02-numpy-foundations.md',
  '03-pandas-structures.md',
  '04-pandas-analysis.md',
  '05-matplotlib-visualization.md',
  '06-seaborn-statistics.md',
  '07-plotly-exploration.md',
  '08-analysis-report.md',
] as const

const requiredSections = [
  '核心问题',
  '本章目标',
  '前置连接',
  '概念与直觉',
  '逐步代码',
  '限制或误区',
  '下一步',
] as const

const cellMarkerPattern = /<!-- cell: (ch\d{2}-[a-z0-9-]+) role: ([a-z]+)(?: output: ([a-z0-9-]+))? -->\n```python\n/g
const exerciseMarkerPattern = /<!-- exercise: ([a-z0-9-]+) -->/g
const teachingPromptMarkerPattern = /<!-- teaching-prompt: id=([a-z0-9-]+) kind=([a-z0-9-]+) chapter=([a-z0-9-]+) scored=(true|false) submitted=(true|false) persistedToProgress=(true|false) gatesChapter=(true|false) -->/g
const pythonBlockPattern = /```python\n[\s\S]*?```/g
const resultPresentationMarkerPattern = /<!-- result-presentation: ([a-z0-9-]+) -->/g
const analysisReportQuestion = '哪些运行结果可以支持对需求规律的解释？'

const stripAuthoringSyntax = (source: string): string => source
  .replace(/```[\s\S]*?```/g, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/`[^`\n]+`/g, '')

const parseResultPresentation = (source: string, outputId: string) => {
  const marker = `<!-- result-presentation: ${outputId} -->`
  const start = source.indexOf(marker)
  assert.ok(start >= 0, `missing result presentation for ${outputId}`)
  const remainder = source.slice(start + marker.length)
  const end = remainder.search(/\n## (?!#)/)
  const block = end >= 0 ? remainder.slice(0, end) : remainder
  const fields = [
    ['title', '运行结果标题'],
    ['alt', '无障碍说明'],
    ['axisLegendTranslations', '坐标轴与图例翻译'],
    ['interpretation', '分析发现'],
    ['limitation', '需要注意'],
    ['fallbackSummary', '静态摘要'],
  ] as const

  const parsed = new Map<string, string>()
  for (const [field, heading] of fields) {
    const fieldStart = block.indexOf(`### ${heading}`)
    assert.ok(fieldStart >= 0, `${outputId} result presentation is missing ${heading}`)
    const valueStart = fieldStart + `### ${heading}`.length
    const followingHeading = block.indexOf('\n### ', valueStart)
    const value = block.slice(valueStart, followingHeading >= 0 ? followingHeading : undefined).trim()
    assert.ok(value, `${outputId} result presentation has empty ${field}`)
    parsed.set(field, value)
  }
  return { markerIndex: start, fields: parsed }
}

const parseTeachingPrompt = (source: string, promptId: string) => {
  const markerPattern = new RegExp(
    `<!-- teaching-prompt: id=${promptId} kind=([a-z0-9-]+) chapter=([a-z0-9-]+) `
      + 'scored=(true|false) submitted=(true|false) persistedToProgress=(true|false) '
      + 'gatesChapter=(true|false) -->',
  )
  const marker = source.match(markerPattern)
  assert.ok(marker, `missing teaching prompt marker for ${promptId}`)
  const start = source.indexOf(marker[0]) + marker[0].length
  const remainder = source.slice(start)
  const promptHeading = remainder.indexOf('\n## 想一想')
  assert.ok(promptHeading >= 0, `${promptId} teaching prompt is missing 想一想`)
  const nextSection = remainder.indexOf('\n## ', promptHeading + '\n## 想一想'.length)
  const block = remainder.slice(promptHeading, nextSection >= 0 ? nextSection : undefined)
  const headings = ['想一想', '参考思路', '常见误区', '复看'] as const
  const values = new Map<string, string>()

  for (const [index, heading] of headings.entries()) {
    const prefix = index === 0 ? `## ${heading}` : `### ${heading}`
    const fieldStart = block.indexOf(prefix)
    assert.ok(fieldStart >= 0, `${promptId} teaching prompt is missing ${heading}`)
    const valueStart = fieldStart + prefix.length
    const followingHeading = block.indexOf('\n### ', valueStart)
    const value = block.slice(valueStart, followingHeading >= 0 ? followingHeading : undefined).trim()
    assert.ok(value, `${promptId} teaching prompt has empty ${heading}`)
    values.set(heading, value)
  }

  return {
    kind: marker[1],
    chapterId: marker[2],
    policy: {
      scored: marker[3] === 'true',
      submitted: marker[4] === 'true',
      persistedToProgress: marker[5] === 'true',
      gatesChapter: marker[6] === 'true',
    },
    block,
    values,
  }
}

const readMaster = async () => {
  const [index, ...chapters] = await Promise.all([
    readFile(new URL('README.md', masterDirectory), 'utf8'),
    ...chapterFiles.map((filename) => readFile(new URL(filename, masterDirectory), 'utf8')),
  ])
  return { index, chapters }
}

test('Chinese master index and chapter files follow the typed eight-chapter order', async () => {
  const { index, chapters } = await readMaster()
  const contractIds = pythonDataToolsContract.chapters.map(({ id }) => id)

  assert.equal(chapters.length, pythonDataToolsContract.chapters.length)
  assert.deepEqual(
    chapterFiles.map((filename) => filename.replace(/^\d{2}-|\.md$/g, '')),
    contractIds,
  )

  let previousIndex = -1
  for (const [chapterIndex, chapter] of pythonDataToolsContract.chapters.entries()) {
    const source = chapters[chapterIndex]
    const indexPosition = index.indexOf(`\`${chapter.id}\``)

    assert.ok(indexPosition > previousIndex, `README chapter order is wrong at ${chapter.id}`)
    previousIndex = indexPosition
    assert.ok(source.includes(`章节 ID：\`${chapter.id}\``))
    const expectedQuestion = chapter.id === 'analysis-report'
      ? analysisReportQuestion
      : chapter.question['zh-CN']
    assert.ok(source.includes(expectedQuestion), `${chapter.id} must use its approved question`)
    for (const section of requiredSections) {
      assert.ok(source.includes(`## ${section}`), `${chapter.id} is missing section: ${section}`)
    }
    const stageFourSections = ['运行结果与阅读', '分析发现']
    for (const section of stageFourSections) {
      assert.ok(source.includes(`## ${section}`), `${chapter.id} is missing section: ${section}`)
    }
  }

  assert.match(index, /只做描述性分析，不训练预测模型，不作因果识别，不教授数据清洗/)
  assert.match(index, /\/data-lab/)
})

test('every Python block has a unique stable cell id, legal role, and sufficient chapter depth', async () => {
  const { chapters } = await readMaster()
  const allowedRoles = new Set<NotebookCellRole>(pythonDataToolsContract.cellRoles)
  const seenCellIds = new Set<string>()

  for (const [index, source] of chapters.entries()) {
    const chapterId = pythonDataToolsContract.chapters[index].id
    const pythonBlocks = source.match(pythonBlockPattern) ?? []
    const markers = [...source.matchAll(cellMarkerPattern)]
    const minimum = chapterId === 'analysis-report' ? 2 : 5

    assert.equal(
      markers.length,
      pythonBlocks.length,
      `${chapterId} must put one valid cell marker immediately before every Python block`,
    )
    assert.ok(pythonBlocks.length >= minimum, `${chapterId} needs at least ${minimum} Python cells`)

    for (const [, cellId, role] of markers) {
      assert.ok(!seenCellIds.has(cellId), `duplicate cell id: ${cellId}`)
      seenCellIds.add(cellId)
      assert.ok(allowedRoles.has(role as NotebookCellRole), `unknown role ${role} in ${cellId}`)
      assert.ok(cellId.startsWith(`ch${String(index + 1).padStart(2, '0')}-`))
    }
  }

  assert.ok(seenCellIds.size >= 40, 'the Chinese master should contain a substantive executable chain')
})

test('authoritative outputs are bound exactly once to their contract chapters', async () => {
  const { chapters } = await readMaster()
  const actualBindings = new Map<PythonDataToolsOutputId, PythonDataToolsChapterId>()

  for (const [index, source] of chapters.entries()) {
    const chapterId = pythonDataToolsContract.chapters[index].id
    for (const marker of source.matchAll(cellMarkerPattern)) {
      const outputId = marker[3] as PythonDataToolsOutputId | undefined
      if (!outputId) continue
      assert.ok(!actualBindings.has(outputId), `output ${outputId} is bound more than once`)
      actualBindings.set(outputId, chapterId)
    }
  }

  assert.equal(actualBindings.size, pythonDataToolsContract.outputs.length)
  for (const output of pythonDataToolsContract.outputs) {
    assert.equal(actualBindings.get(output.id), output.chapterId, `${output.id} is in the wrong chapter`)
  }
})

test('all eight chapters use learner-facing result language and complete result presentations', async () => {
  const { chapters } = await readMaster()
  const chapterOrder = new Map(
    pythonDataToolsContract.chapters.map(({ id }, index) => [id, index]),
  )
  const expectedOutputs = [...pythonDataToolsContract.outputs].sort((left, right) => (
    (chapterOrder.get(left.chapterId) ?? 0) - (chapterOrder.get(right.chapterId) ?? 0)
  ))
  const actualMarkers = chapters
    .flatMap((source) => [...source.matchAll(resultPresentationMarkerPattern)].map((match) => match[1]))

  assert.deepEqual(actualMarkers, expectedOutputs.map(({ id }) => id))

  for (const [index, source] of chapters.entries()) {
    const chapterId = pythonDataToolsContract.chapters[index].id
    const visibleProse = stripAuthoringSyntax(source)
    assert.doesNotMatch(
      visibleProse,
      /证据|\bevidence\b|\bmanifest\b|\boutput\b/i,
      `${chapterId} exposes implementation vocabulary to learners`,
    )
    assert.match(source, /## 运行结果与阅读/)
    assert.match(source, /## 分析发现/)

    for (const output of expectedOutputs.filter(({ chapterId: owner }) => owner === chapterId)) {
      const presentation = parseResultPresentation(source, output.id)
      const bindingIndex = source.indexOf(`output: ${output.id}`)
      assert.ok(bindingIndex >= 0, `${output.id} is missing its source binding`)
      assert.ok(presentation.markerIndex > bindingIndex, `${output.id} presentation must follow its bound cell`)
      const translations = presentation.fields.get('axisLegendTranslations') ?? ''
      if (output.kind === 'json') {
        assert.equal(
          translations,
          '[]',
          `${output.id} JSON presentation must declare an explicit empty translation list`,
        )
      } else {
        assert.notEqual(translations, '[]', `${output.id} visual presentation needs translations`)
        assert.match(translations, /- `[^`]+`：/, `${output.id} translations must be structured rows`)
      }
    }
  }
})

test('all eight chapters preserve Stage 3 Python bytes and source/output bindings', async () => {
  const { chapters } = await readMaster()
  const notebook = JSON.parse(await readFile(
    new URL('../public/notebooks/python-data-tools/python-data-tools-bike-sharing.zh-CN.ipynb', import.meta.url),
    'utf8',
  )) as {
    cells: Array<{
      cell_type: string
      source: string | string[]
      metadata?: { mlAtlas?: { sourceCellId?: string; outputId?: string } }
    }>
  }
  const notebookCells = new Map(
    notebook.cells
      .filter(({ cell_type, metadata }) => cell_type === 'code' && metadata?.mlAtlas?.sourceCellId)
      .map((cell) => [cell.metadata?.mlAtlas?.sourceCellId as string, cell]),
  )

  for (const source of chapters) {
    const codeByCellId = new Map(
      [...source.matchAll(cellMarkerPattern)].map((marker) => {
        const codeStart = marker.index + marker[0].length
        const codeEnd = source.indexOf('\n```', codeStart)
        return [marker[1], source.slice(codeStart, codeEnd)]
      }),
    )

    for (const [cellId, code] of codeByCellId) {
      const notebookCell = notebookCells.get(cellId)
      assert.ok(notebookCell, `Stage 3 Notebook is missing ${cellId}`)
      const notebookSource = Array.isArray(notebookCell.source)
        ? notebookCell.source.join('')
        : notebookCell.source
      const hasPublicationSuffix = Boolean(notebookCell.metadata?.mlAtlas?.outputId)
      if (cellId === 'ch01-imports' || hasPublicationSuffix) {
        assert.ok(notebookSource.startsWith(`${code}\n\n`), `${cellId} Python prefix drifted`)
      } else {
        assert.equal(notebookSource, code, `${cellId} Python bytes drifted`)
      }
    }
  }
})

test('the five contract mounts are ordered, complete, and stateless teaching prompts', async () => {
  const { index, chapters } = await readMaster()
  const actual = new Map<PythonDataToolsChapterId, PythonDataToolsExerciseKind>()
  const actualPrompts = new Map<PythonDataToolsChapterId, PythonDataToolsExerciseKind>()

  for (const [chapterIndex, source] of chapters.entries()) {
    const chapterId = pythonDataToolsContract.chapters[chapterIndex].id
    const exerciseMarkers = [...source.matchAll(exerciseMarkerPattern)]
    assert.ok(exerciseMarkers.length <= 1, `${chapterId} has more than one exercise`)
    if (exerciseMarkers.length === 0) continue

    const kind = exerciseMarkers[0][1] as PythonDataToolsExerciseKind
    actual.set(chapterId, kind)
    const prompt = parseTeachingPrompt(source, kind)
    actualPrompts.set(chapterId, kind)
    assert.equal(prompt.kind, kind)
    assert.equal(prompt.chapterId, chapterId)
    assert.deepEqual(prompt.policy, {
      scored: pythonDataToolsContract.exercisePolicy.scored,
      submitted: pythonDataToolsContract.exercisePolicy.submitted,
      persistedToProgress: pythonDataToolsContract.exercisePolicy.persistedToProgress,
      gatesChapter: pythonDataToolsContract.exercisePolicy.gatesChapter,
    })
    assert.doesNotMatch(
      stripAuthoringSyntax(prompt.block),
      /选择\s*[A-D]|输入|提交|判分|计分|重置|完成状态|学习进度|localStorage|fetch|XMLHttpRequest|sklearn|\.fit\(|\.predict\(|dropna|fillna|drop_duplicates|置信区间|显著性|p\s*值|导致|造成/i,
      `${kind} must remain static and inside the descriptive-analysis boundary`,
    )
  }

  assert.deepEqual(
    [...actual.entries()],
    pythonDataToolsContract.exerciseMounts.map(({ chapterId, kind }) => [chapterId, kind]),
  )
  assert.deepEqual(
    [...actualPrompts.entries()],
    pythonDataToolsContract.exerciseMounts.map(({ chapterId, kind }) => [chapterId, kind]),
  )
  assert.equal([...chapters.join('\n').matchAll(teachingPromptMarkerPattern)].length, 5)
  assert.match(index, /## 静态教学提示/)
  assert.match(index, /## 正式运行结果与呈现标记/)
  assert.match(index, /id=shape-index kind=shape-index chapter=numpy-foundations/)
  assert.match(index, /scored=false submitted=false persistedToProgress=false gatesChapter=false/)
  for (const heading of ['运行结果标题', '无障碍说明', '坐标轴与图例翻译', '分析发现', '需要注意', '静态摘要']) {
    assert.ok(index.includes(`### ${heading}`), `README result grammar is missing ${heading}`)
  }
})

test('all Chinese masters are valid UTF-8 without placeholders or mojibake', async () => {
  for (const filename of chapterFiles) {
    const bytes = await readFile(new URL(filename, masterDirectory))
    const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    assert.ok(source.trim(), `${filename} must not be empty`)
    assert.doesNotMatch(
      source,
      /TODO|TBD|PLACEHOLDER|\uFFFD|Ã.|Â.|â(?:€|€¦|€“|€”)/i,
      `${filename} contains unfinished text or mojibake`,
    )
  }
})

test('visualization chapters teach misleading-chart repair and accessible fallbacks', async () => {
  const { chapters } = await readMaster()
  const chapterById = new Map(
    pythonDataToolsContract.chapters.map(({ id }, index) => [id, chapters[index]]),
  )

  for (const id of [
    'matplotlib-visualization',
    'seaborn-statistics',
    'plotly-exploration',
  ] as const) {
    const source = chapterById.get(id) ?? ''
    assert.match(source, /误导/)
    assert.match(source, /修正/)
    assert.match(source, /中文 alt 草案/)
    assert.match(source, /颜色.*不.*唯一|不只依赖颜色|非颜色|线型/)
  }

  assert.match(chapterById.get('plotly-exploration') ?? '', /静态 fallback/)
  assert.match(chapterById.get('plotly-exploration') ?? '', /筛选状态/)
})

test('Seaborn chapter stays inside the descriptive statistics contract', async () => {
  const { chapters } = await readMaster()
  const source = chapters[5]

  for (const required of [
    '描述性统计',
    '协方差',
    'Pearson',
    '缺失',
    '样本量',
    '离群值',
    '相关不代表因果',
  ]) {
    assert.ok(source.includes(required), `Seaborn chapter is missing ${required}`)
  }

  assert.match(source, /不计算或解释置信区间、显著性检验和 p 值/)
  const code = (source.match(pythonBlockPattern) ?? []).join('\n')
  assert.doesNotMatch(code, /p[_-]?value|ttest|confidence[_-]?interval|scipy\.stats/i)
})

test('course uses the local snapshot and stays inside the R7 descriptive-analysis boundary', async () => {
  const { index, chapters } = await readMaster()
  const allCode = chapters.flatMap((source) => source.match(pythonBlockPattern) ?? []).join('\n')

  assert.match(chapters[0], /\.\.\/\.\.\/datasets\/python-data-tools\/bike-sharing-hour\.csv/)
  assert.match(index, /`rides`/)
  assert.match(index, /`hourly_demand`/)
  assert.match(index, /`workingday_hourly`/)
  assert.match(index, /`rider_mix`/)
  assert.match(index, /`correlation_columns`/)
  assert.doesNotMatch(
    allCode,
    /sklearn|train_test_split|\.fit\(|\.predict\(|dropna|fillna|drop_duplicates|p[_-]?value|ttest|confidence[_-]?interval|scipy\.stats|pyodide|requests\.|urlopen|https?:\/\//i,
  )
  assert.match(index, /只做描述性分析，不训练预测模型，不作因果识别，不教授数据清洗/)
  assert.match(index, /清洗任务交接到 `\/data-lab`/)
  assert.match(chapters[7], /相关不代表因果/)
})

test('final report traces all analysis dimensions and hands cleaning to Data Lab', async () => {
  const { chapters } = await readMaster()
  const source = chapters[7]

  for (const output of pythonDataToolsContract.outputs) {
    assert.ok(source.includes(output.id), `final report must trace ${output.id}`)
  }
  for (const dimension of ['时间', '工作日', '季节', '天气', '用户构成']) {
    assert.ok(source.includes(dimension), `final report is missing dimension ${dimension}`)
  }
  for (const part of ['观察', '运行结果', '解释', '限制']) {
    assert.ok(source.includes(part), `final report is missing claim part ${part}`)
  }
  assert.match(source, /不做预测|不包含预测|不训练预测模型/)
  assert.match(source, /相关不代表因果/)
  assert.match(source, /\/data-lab/)
  assert.match(source, /缺失、重复、异常类型.*离群值/)
})
