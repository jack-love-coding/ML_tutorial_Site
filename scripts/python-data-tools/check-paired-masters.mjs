#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pythonDataToolsContract } from '../../src/data/pythonNotebookContract.ts'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const defaultRoot = resolve(scriptDirectory, '../../docs/curriculum-v3/python-data-tools')
const decoder = new TextDecoder('utf-8', { fatal: true })

const localeDirectories = {
  'zh-CN': 'chinese-master',
  en: 'english-master',
}

const resultFieldHeadings = {
  'zh-CN': {
    title: ['运行结果标题'],
    alt: ['无障碍说明'],
    axisLegendTranslations: ['坐标轴与图例翻译'],
    interpretation: ['分析发现'],
    limitation: ['需要注意'],
    fallbackSummary: ['静态摘要'],
  },
  en: {
    title: ['Runtime result', 'Result title'],
    alt: ['Accessibility description'],
    axisLegendTranslations: ['Axis and legend labels', 'Chinese labels and English meanings'],
    interpretation: ['Analysis finding', 'What the chart shows', 'What the table shows', 'What the report shows'],
    limitation: ['Keep in mind', 'What to keep in mind'],
    fallbackSummary: ['Static summary', 'Fallback summary'],
  },
}

const promptFieldHeadings = {
  'zh-CN': {
    question: ['想一想'],
    referenceReasoning: ['参考思路'],
    misconception: ['常见误区'],
    revisit: ['复看'],
  },
  en: {
    question: ['Think about it', 'Think it through'],
    referenceReasoning: ['Reference reasoning', 'Suggested reasoning'],
    misconception: ['Common misconceptions', 'Common misconception'],
    revisit: ['Review'],
  },
}

function chapterFilename(index, chapterId) {
  return `${String(index + 1).padStart(2, '0')}-${chapterId}.md`
}

function diagnostic(locale, filename, chapterId, marker, message) {
  throw new Error(`[${locale}] ${filename} chapter=${chapterId} [${marker}] ${message}`)
}

function decodeMaster(path, context) {
  let bytes
  try {
    bytes = readFileSync(path)
  } catch (error) {
    diagnostic(context.locale, context.filename, context.chapterId, 'course-files', `missing authority file: ${error.message}`)
  }
  try {
    return decoder.decode(bytes)
  } catch {
    diagnostic(context.locale, context.filename, context.chapterId, 'utf-8', 'invalid UTF-8 byte sequence')
  }
}

function visibleProse(source) {
  return source
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/`[^`\n]+`/g, '')
}

function validateVisibleProse(source, context) {
  const prose = visibleProse(source)
  const mojibake = prose.match(/\uFFFD|Ã.|Â.|â(?:€|™|€œ|€œ)|æ(?:œ|•|°)|ç(?:š|„)/u)
  if (mojibake) diagnostic(context.locale, context.filename, context.chapterId, 'visible-prose', `mojibake sequence ${JSON.stringify(mojibake[0])}`)

  const placeholder = prose.match(/\b(?:TODO|TBD|FIXME|placeholder|coming soon|not available)\b|(?:待补|占位|稍后补充)/iu)
  if (placeholder) diagnostic(context.locale, context.filename, context.chapterId, 'visible-prose', `placeholder text ${JSON.stringify(placeholder[0])}`)

  const internal = context.locale === 'zh-CN'
    ? prose.match(/证据|清单文件|输出文件/u)
    : prose.match(/\b(?:evidence|manifest|output)\b/iu)
  if (internal) diagnostic(context.locale, context.filename, context.chapterId, 'visible-prose', `learner-visible internal term ${JSON.stringify(internal[0])}`)
}

function parseChapterId(source, context) {
  const match = source.match(/^(?:章节 ID：|Chapter ID:)\s*`([a-z0-9-]+)`\s*$/m)
  if (!match) diagnostic(context.locale, context.filename, context.chapterId, 'chapter-id', 'missing chapter ID declaration')
  if (match[1] !== context.chapterId) diagnostic(context.locale, context.filename, context.chapterId, 'chapter-id', `first mismatch: found ${match[1]}`)
}

function parseCells(source, context) {
  const pattern = /<!-- cell: (ch\d{2}-[a-z0-9-]+) role: ([a-z]+)(?: output: ([a-z0-9-]+))? -->\n```python\n([\s\S]*?)```/g
  const cells = [...source.matchAll(pattern)].map((match) => ({
    id: match[1],
    role: match[2],
    outputId: match[3],
    code: match[4],
    index: match.index,
  }))
  const markerCount = [...source.matchAll(/<!-- cell:/g)].length
  if (cells.length !== markerCount) diagnostic(context.locale, context.filename, context.chapterId, 'cell-markers', 'a cell marker is not immediately followed by a Python fence')

  const seen = new Set()
  for (const cell of cells) {
    if (seen.has(cell.id)) diagnostic(context.locale, context.filename, context.chapterId, `cell:${cell.id}`, 'duplicate cell ID')
    seen.add(cell.id)
    if (!pythonDataToolsContract.cellRoles.includes(cell.role)) diagnostic(context.locale, context.filename, context.chapterId, `cell:${cell.id}`, `invalid role ${cell.role}`)
  }
  return cells
}

function orderedHeadingsBlock(source, markerIndex, markerLength) {
  const remainder = source.slice(markerIndex + markerLength)
  const nextSection = remainder.search(/\n## (?!#)/)
  return nextSection >= 0 ? remainder.slice(0, nextSection) : remainder
}

function teachingPromptBlock(source, markerIndex, markerLength, locale) {
  const remainder = source.slice(markerIndex + markerLength)
  const questionHeadings = promptFieldHeadings[locale].question
  const question = headingPosition(remainder, questionHeadings, 2)
  if (!question) return remainder
  const afterQuestionHeading = question.index + question.length
  const followingSection = remainder.slice(afterQuestionHeading).search(/\n## (?!#)/)
  return followingSection >= 0
    ? remainder.slice(question.index, afterQuestionHeading + followingSection)
    : remainder.slice(question.index)
}

function headingPosition(block, names, level) {
  for (const name of names) {
    const match = new RegExp(`^${'#'.repeat(level)} ${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').exec(block)
    if (match) return { index: match.index, length: match[0].length, name }
  }
  return undefined
}

function parseFields(block, fieldHeadings, context, marker, firstLevel) {
  const entries = Object.entries(fieldHeadings)
  const positions = entries.map(([field, headings], index) => {
    const position = headingPosition(block, headings, index === 0 ? firstLevel : 3)
    if (!position) diagnostic(context.locale, context.filename, context.chapterId, marker, `${field} field is missing`)
    return { field, ...position }
  })

  for (let index = 1; index < positions.length; index += 1) {
    if (positions[index].index <= positions[index - 1].index) {
      diagnostic(context.locale, context.filename, context.chapterId, marker, `${positions[index].field} field is reordered`)
    }
  }

  return Object.fromEntries(positions.map((position, index) => {
    const value = block.slice(position.index + position.length, positions[index + 1]?.index).trim()
    if (!value) diagnostic(context.locale, context.filename, context.chapterId, marker, `${position.field} field is empty`)
    return [position.field, value]
  }))
}

function parseResultPresentations(source, context, outputKindById) {
  const matches = [...source.matchAll(/<!-- result-presentation: ([a-z0-9-]+) -->/g)]
  const seen = new Set()
  return matches.map((match) => {
    const outputId = match[1]
    const marker = `result-presentation:${outputId}`
    if (seen.has(outputId)) diagnostic(context.locale, context.filename, context.chapterId, marker, 'duplicate result-presentation ID')
    seen.add(outputId)
    if (!outputKindById.has(outputId)) diagnostic(context.locale, context.filename, context.chapterId, marker, 'unknown output ID')
    const block = orderedHeadingsBlock(source, match.index, match[0].length)
    const fields = parseFields(block, resultFieldHeadings[context.locale], context, marker, 3)
    if (outputKindById.get(outputId) === 'json') {
      if (fields.axisLegendTranslations !== '[]') diagnostic(context.locale, context.filename, context.chapterId, marker, 'axisLegendTranslations must be the explicit [] for JSON')
    } else if (fields.axisLegendTranslations === '[]' || !/^- /m.test(fields.axisLegendTranslations)) {
      diagnostic(context.locale, context.filename, context.chapterId, marker, 'axisLegendTranslations must contain translation rows for visual output')
    }
    return { id: outputId, fields, index: match.index }
  })
}

function parseTeachingPrompts(source, context) {
  const pattern = /<!-- teaching-prompt: id=([a-z0-9-]+) kind=([a-z0-9-]+) chapter=([a-z0-9-]+) scored=(true|false) submitted=(true|false) persistedToProgress=(true|false) gatesChapter=(true|false) -->/g
  const matches = [...source.matchAll(pattern)]
  const markerCount = [...source.matchAll(/<!-- teaching-prompt:/g)].length
  if (matches.length !== markerCount) diagnostic(context.locale, context.filename, context.chapterId, 'teaching-prompt-markers', 'malformed teaching-prompt marker')
  const seen = new Set()
  return matches.map((match) => {
    const id = match[1]
    const marker = `teaching-prompt:${id}`
    if (seen.has(id)) diagnostic(context.locale, context.filename, context.chapterId, marker, 'duplicate prompt ID')
    seen.add(id)
    if (match[2] !== id) diagnostic(context.locale, context.filename, context.chapterId, marker, `kind ${match[2]} does not match ID`)
    if (match[3] !== context.chapterId) diagnostic(context.locale, context.filename, context.chapterId, marker, `chapter ${match[3]} does not match file`)
    if (match.slice(4, 8).some((value) => value !== 'false')) diagnostic(context.locale, context.filename, context.chapterId, marker, 'all four prompt policy flags must be false')
    const block = teachingPromptBlock(source, match.index, match[0].length, context.locale)
    const fields = parseFields(block, promptFieldHeadings[context.locale], context, marker, 2)
    return { id, kind: match[2], fields, index: match.index }
  })
}

function formulaSignatures(source) {
  return [...source.matchAll(/\\\[([\s\S]*?)\\\]|\\\(([^\n]*?)\\\)/g)]
    .map((match) => (match[1] ?? match[2]).replace(/\s+/g, ''))
}

function substantiveNumericStatements(source) {
  const prose = visibleProse(source).replace(/^#{1,6} .*$/gm, '')
  return [...new Set(
    [...prose.matchAll(/(?<![\p{L}_])-?\d+(?:\.\d+)?(?:%|\b)/gu)]
      .map((match) => match[0])
      .filter((value) => Math.abs(Number.parseFloat(value)) > 8 || value.includes('.') || value.startsWith('-')),
  )].sort()
}

function stableMarkers(source) {
  const pattern = /<!-- (cell: [^\n]+|exercise: [^\n]+|teaching-prompt: [^\n]+|result-presentation: [^\n]+) -->/g
  return [...source.matchAll(pattern)].map((match) => {
    const marker = match[1]
    if (marker.startsWith('cell: ')) return `cell: ${marker.match(/^cell: ([a-z0-9-]+)/)?.[1]}`
    if (marker.startsWith('teaching-prompt: ')) return `teaching-prompt: ${marker.match(/\bid=([a-z0-9-]+)/)?.[1]}`
    return marker
  })
}

function compareSequences(chinese, english, context, label, markerForMismatch) {
  const length = Math.max(chinese.length, english.length)
  for (let index = 0; index < length; index += 1) {
    if (chinese[index] !== english[index]) {
      diagnostic(context.locale, context.filename, context.chapterId, markerForMismatch(chinese[index], english[index], index), `first mismatch: expected ${JSON.stringify(chinese[index])}, found ${JSON.stringify(english[index])}`)
    }
  }
}

function parseMaster(root, locale, chapter, index, outputKindById) {
  const filename = chapterFilename(index, chapter.id)
  const context = { locale, filename, chapterId: chapter.id }
  const path = join(root, localeDirectories[locale], filename)
  if (!existsSync(path)) diagnostic(locale, filename, chapter.id, 'course-files', 'missing authority file')
  const source = decodeMaster(path, context)
  if (!source.trim()) diagnostic(locale, filename, chapter.id, 'course-files', 'empty authority file')
  validateVisibleProse(source, context)
  parseChapterId(source, context)
  return {
    context,
    source,
    cells: parseCells(source, context),
    results: parseResultPresentations(source, context, outputKindById),
    prompts: parseTeachingPrompts(source, context),
    formulas: formulaSignatures(source),
    numericStatements: substantiveNumericStatements(source),
    markers: stableMarkers(source),
  }
}

function validateDirectoryInventory(root) {
  for (const [locale, directory] of Object.entries(localeDirectories)) {
    const path = join(root, directory)
    const expected = pythonDataToolsContract.chapters.map((chapter, index) => chapterFilename(index, chapter.id))
    const actual = readdirSync(path).filter((file) => /^\d{2}-.*\.md$/.test(file)).sort()
    for (const [index, filename] of expected.entries()) {
      if (!actual.includes(filename)) {
        diagnostic(locale, filename, pythonDataToolsContract.chapters[index].id, 'course-files', 'missing authority file')
      }
    }
    for (const filename of actual) {
      if (!expected.includes(filename)) {
        const chapterId = filename.replace(/^\d{2}-|\.md$/g, '')
        diagnostic(locale, filename, chapterId, 'course-files', 'unexpected or renamed authority file')
      }
    }
  }
}

export function checkPairedMasters(options = {}) {
  const root = resolve(options.root ?? defaultRoot)
  validateDirectoryInventory(root)
  const outputKindById = new Map(pythonDataToolsContract.outputs.map(({ id, kind }) => [id, kind]))
  const globalCellIds = new Set()
  const globalOutputIds = new Set()
  const globalPromptIds = new Set()
  const pairs = []

  for (const [index, chapter] of pythonDataToolsContract.chapters.entries()) {
    const chinese = parseMaster(root, 'zh-CN', chapter, index, outputKindById)
    const english = parseMaster(root, 'en', chapter, index, outputKindById)

    compareSequences(chinese.markers, english.markers, english.context, 'markers', (expected, actual) => {
      const marker = expected ?? actual ?? `marker:${index + 1}`
      return marker.startsWith('cell: ') ? `cell:${marker.split(/\s+/)[1]}` : marker.replace(': ', ':')
    })
    compareSequences(chinese.formulas, english.formulas, english.context, 'formulas', (_expected, _actual, formulaIndex) => `formula:${formulaIndex + 1}`)
    compareSequences(chinese.numericStatements, english.numericStatements, english.context, 'numeric statements', () => 'numeric-statements')

    compareSequences(chinese.cells.map(({ id }) => id), english.cells.map(({ id }) => id), english.context, 'cells', (expected, actual) => `cell:${expected ?? actual}`)
    for (const [cellIndex, chineseCell] of chinese.cells.entries()) {
      const englishCell = english.cells[cellIndex]
      if (englishCell.role !== chineseCell.role) diagnostic('en', english.context.filename, chapter.id, `cell:${chineseCell.id}`, `role first mismatch: expected ${chineseCell.role}, found ${englishCell.role}`)
      if (englishCell.outputId !== chineseCell.outputId) diagnostic('en', english.context.filename, chapter.id, `cell:${chineseCell.id}`, `output binding first mismatch: expected ${chineseCell.outputId}, found ${englishCell.outputId}`)
      if (englishCell.code !== chineseCell.code) diagnostic('en', english.context.filename, chapter.id, `cell:${chineseCell.id}`, 'Python bytes first mismatch')
      if (globalCellIds.has(chineseCell.id)) diagnostic('zh-CN', chinese.context.filename, chapter.id, `cell:${chineseCell.id}`, 'duplicate cell ID across course')
      globalCellIds.add(chineseCell.id)
    }

    compareSequences(chinese.results.map(({ id }) => id), english.results.map(({ id }) => id), english.context, 'results', (expected, actual) => `result-presentation:${expected ?? actual}`)
    for (const result of chinese.results) {
      if (globalOutputIds.has(result.id)) diagnostic('zh-CN', chinese.context.filename, chapter.id, `result-presentation:${result.id}`, 'duplicate result ID across course')
      globalOutputIds.add(result.id)
      const cell = chinese.cells.find(({ outputId }) => outputId === result.id)
      if (!cell || cell.index >= result.index) diagnostic('zh-CN', chinese.context.filename, chapter.id, `result-presentation:${result.id}`, 'result presentation must follow its bound output cell')
    }

    compareSequences(chinese.prompts.map(({ id }) => id), english.prompts.map(({ id }) => id), english.context, 'prompts', (expected, actual) => `teaching-prompt:${expected ?? actual}`)
    for (const prompt of chinese.prompts) {
      if (globalPromptIds.has(prompt.id)) diagnostic('zh-CN', chinese.context.filename, chapter.id, `teaching-prompt:${prompt.id}`, 'duplicate prompt ID across course')
      globalPromptIds.add(prompt.id)
    }
    pairs.push({ chinese, english })
  }

  const expectedPrompts = pythonDataToolsContract.exerciseMounts.map(({ kind }) => kind)
  compareSequences(expectedPrompts, [...globalPromptIds], { locale: 'zh-CN', filename: 'all masters', chapterId: 'course' }, 'prompt order', (expected, actual) => `teaching-prompt:${expected ?? actual}`)
  const expectedResults = pythonDataToolsContract.chapters.flatMap((chapter) => pythonDataToolsContract.outputs.filter(({ chapterId }) => chapterId === chapter.id).map(({ id }) => id))
  compareSequences(expectedResults, [...globalOutputIds], { locale: 'zh-CN', filename: 'all masters', chapterId: 'course' }, 'result order', (expected, actual) => `result-presentation:${expected ?? actual}`)

  return {
    chapterCount: pythonDataToolsContract.chapters.length,
    pairCount: pairs.length,
    cellCount: globalCellIds.size,
    promptCount: globalPromptIds.size,
    resultPresentationCount: globalOutputIds.size,
  }
}

function parseArguments(argv) {
  let root
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--root') {
      root = argv[index + 1]
      if (!root) throw new Error('--root requires a directory')
      index += 1
    } else {
      throw new Error(`Unknown argument: ${argv[index]}`)
    }
  }
  return { root }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = checkPairedMasters(parseArguments(process.argv.slice(2)))
    process.stdout.write(
      `Python Data Tools paired-master preflight passed: ${result.pairCount} bilingual chapter pairs, `
      + `${result.cellCount} cells, ${result.resultPresentationCount} result presentations, and ${result.promptCount} prompts.\n`,
    )
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
