#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pythonDataToolsContract } from '../../src/data/pythonNotebookContract.ts'
import { checkPairedMasters } from './check-paired-masters.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const defaultRoot = resolve(scriptDirectory, '../../docs/curriculum-v3/python-data-tools')
const defaultTarget = resolve(scriptDirectory, '../../src/data/generated/pythonDataToolsRuntime.generated.ts')

const localeDirectory = { 'zh-CN': 'chinese-master', en: 'english-master' }
const resultHeadings = {
  'zh-CN': {
    title: ['运行结果标题'], alt: ['无障碍说明'], axisLegendTranslations: ['坐标轴与图例翻译'],
    interpretation: ['分析发现'], limitation: ['需要注意'], fallbackSummary: ['静态摘要'],
  },
  en: {
    title: ['Runtime result', 'Result title'], alt: ['Accessibility description'],
    axisLegendTranslations: ['Axis and legend labels', 'Chinese labels and English meanings'],
    interpretation: ['Analysis finding', 'What the chart shows', 'What the table shows', 'What the report shows'],
    limitation: ['Keep in mind', 'What to keep in mind'], fallbackSummary: ['Static summary', 'Fallback summary'],
  },
}
const promptHeadings = {
  'zh-CN': {
    question: ['想一想'], referenceReasoning: ['参考思路'], misconception: ['常见误区'], revisit: ['复看'],
  },
  en: {
    question: ['Think about it', 'Think it through'], referenceReasoning: ['Reference reasoning', 'Suggested reasoning'],
    misconception: ['Common misconceptions', 'Common misconception'], revisit: ['Review'],
  },
}

function filenameFor(index, chapterId) {
  return `${String(index + 1).padStart(2, '0')}-${chapterId}.md`
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function heading(source, names, level) {
  for (const name of names) {
    const match = new RegExp(`^${'#'.repeat(level)} ${escapeRegExp(name)}\\s*$`, 'm').exec(source)
    if (match) return { index: match.index, end: match.index + match[0].length }
  }
  return undefined
}

function fieldsFromBlock(block, headings, firstLevel) {
  const positions = Object.entries(headings).map(([field, names], index) => {
    const position = heading(block, names, index === 0 ? firstLevel : 3)
    if (!position) throw new Error(`validated ${field} heading is unavailable during projection`)
    return { field, ...position }
  })
  return Object.fromEntries(positions.map((position, index) => [
    position.field,
    block.slice(position.end, positions[index + 1]?.index).trim(),
  ]))
}

function masterHeader(source, locale) {
  const title = source.match(/^#\s+(.+)$/m)?.[1]?.trim()
  const questionHeading = heading(source, locale === 'zh-CN' ? ['核心问题'] : ['Core question'], 2)
  if (!title || !questionHeading) throw new Error(`[${locale}] validated chapter header is unavailable during projection`)
  const remainder = source.slice(questionHeading.end)
  const nextSectionOffset = remainder.search(/\n## (?!#)/)
  if (nextSectionOffset < 0) throw new Error(`[${locale}] chapter has no body after the core question`)
  return {
    title,
    question: remainder.slice(0, nextSectionOffset).trim(),
    bodyStart: questionHeading.end + nextSectionOffset + 1,
  }
}

function findSectionEnd(source, contentStart) {
  const offset = source.slice(contentStart).search(/\n## (?!#)/)
  return offset < 0 ? source.length : contentStart + offset
}

function findResultPresentationEnd(source, contentStart, locale) {
  const block = source.slice(contentStart)
  const fallbackHeading = heading(block, resultHeadings[locale].fallbackSummary, 3)
  if (!fallbackHeading) {
    throw new Error(`[${locale}] validated fallback summary heading is unavailable during projection`)
  }

  const fallbackContentStart = contentStart + fallbackHeading.end
  const nextHeadingOffset = source.slice(fallbackContentStart).search(/\n#{1,3} (?!#)/)
  return nextHeadingOffset < 0 ? source.length : fallbackContentStart + nextHeadingOffset
}

function parseEvents(source, locale) {
  const events = []
  const cellPattern = /<!-- cell: (ch\d{2}-[a-z0-9-]+) role: ([a-z]+)(?: output: ([a-z0-9-]+))? -->\n```python\n([\s\S]*?)```/g
  for (const match of source.matchAll(cellPattern)) {
    events.push({ kind: 'code', id: match[1], role: match[2], outputId: match[3], code: match[4], start: match.index, end: match.index + match[0].length })
  }

  for (const match of source.matchAll(/<!-- result-presentation: ([a-z0-9-]+) -->/g)) {
    const end = findResultPresentationEnd(source, match.index + match[0].length, locale)
    events.push({
      kind: 'result-presentation', id: match[1],
      fields: fieldsFromBlock(source.slice(match.index + match[0].length, end), resultHeadings[locale], 3),
      start: match.index, end,
    })
  }

  const promptPattern = /<!-- teaching-prompt: id=([a-z0-9-]+) kind=([a-z0-9-]+) chapter=([a-z0-9-]+) scored=false submitted=false persistedToProgress=false gatesChapter=false -->/g
  for (const match of source.matchAll(promptPattern)) {
    const preceding = source.slice(0, match.index).match(/<!-- exercise: ([a-z0-9-]+) -->\s*$/)
    const start = preceding ? match.index - preceding[0].length : match.index
    const question = heading(source.slice(match.index + match[0].length), promptHeadings[locale].question, 2)
    if (!question) throw new Error(`[${locale}] validated teaching prompt ${match[1]} is unavailable during projection`)
    const absoluteQuestionEnd = match.index + match[0].length + question.end
    const end = findSectionEnd(source, absoluteQuestionEnd)
    events.push({
      kind: 'teaching-prompt', id: match[1], promptKind: match[2], chapterId: match[3],
      fields: fieldsFromBlock(source.slice(match.index + match[0].length, end), promptHeadings[locale], 2),
      start, end,
    })
  }

  return events.sort((left, right) => left.start - right.start)
}

function translationRows(chinese, english) {
  if (chinese === '[]' && english === '[]') return []
  const parse = (value) => [...value.matchAll(/^-\s+`([^`]+)`[:：]\s*(.+)$/gm)].map((match) => ({ source: match[1], label: match[2].trim() }))
  const zhRows = parse(chinese)
  const enRows = parse(english)
  if (zhRows.length !== enRows.length || zhRows.some((row, index) => row.source !== enRows[index]?.source)) {
    throw new Error('validated axis/legend translation rows drifted during projection')
  }
  return zhRows.map((row, index) => ({ source: row.source, label: { 'zh-CN': row.label, en: enRows[index].label } }))
}

function localizedMarkdownBlocks(chapterId, chineseSource, englishSource, chineseEvents, englishEvents, bodyStarts) {
  const blocks = []
  let zhCursor = bodyStarts['zh-CN']
  let enCursor = bodyStarts.en
  let markdownIndex = 0

  for (const [eventIndex, chineseEvent] of chineseEvents.entries()) {
    const englishEvent = englishEvents[eventIndex]
    if (!englishEvent || englishEvent.kind !== chineseEvent.kind || englishEvent.id !== chineseEvent.id) {
      throw new Error(`[en] chapter=${chapterId} event=${eventIndex + 1} first mismatch during projection`)
    }
    const zhMarkdown = chineseSource.slice(zhCursor, chineseEvent.start).trim()
    const enMarkdown = englishSource.slice(enCursor, englishEvent.start).trim()
    if (zhMarkdown || enMarkdown) {
      markdownIndex += 1
      blocks.push({ kind: 'markdown', id: `${chapterId}-markdown-${markdownIndex}`, markdown: { 'zh-CN': zhMarkdown, en: enMarkdown } })
    }

    if (chineseEvent.kind === 'code') {
      blocks.push({
        kind: 'code', id: chineseEvent.id, role: chineseEvent.role,
        ...(chineseEvent.outputId ? { outputId: chineseEvent.outputId } : {}), code: chineseEvent.code,
      })
    } else if (chineseEvent.kind === 'result-presentation') {
      const output = pythonDataToolsContract.outputs.find(({ id }) => id === chineseEvent.id)
      blocks.push({
        kind: 'result-presentation', id: `result-${chineseEvent.id}`, outputId: chineseEvent.id, outputKind: output.kind,
        title: { 'zh-CN': chineseEvent.fields.title, en: englishEvent.fields.title },
        alt: { 'zh-CN': chineseEvent.fields.alt, en: englishEvent.fields.alt },
        axisLegendTranslations: translationRows(chineseEvent.fields.axisLegendTranslations, englishEvent.fields.axisLegendTranslations),
        interpretation: { 'zh-CN': chineseEvent.fields.interpretation, en: englishEvent.fields.interpretation },
        limitation: { 'zh-CN': chineseEvent.fields.limitation, en: englishEvent.fields.limitation },
        fallbackSummary: { 'zh-CN': chineseEvent.fields.fallbackSummary, en: englishEvent.fields.fallbackSummary },
      })
    } else {
      blocks.push({
        kind: 'teaching-prompt', id: chineseEvent.id, promptKind: chineseEvent.promptKind, chapterId,
        question: { 'zh-CN': chineseEvent.fields.question, en: englishEvent.fields.question },
        referenceReasoning: { 'zh-CN': chineseEvent.fields.referenceReasoning, en: englishEvent.fields.referenceReasoning },
        misconception: { 'zh-CN': chineseEvent.fields.misconception, en: englishEvent.fields.misconception },
        revisit: { 'zh-CN': chineseEvent.fields.revisit, en: englishEvent.fields.revisit },
      })
    }
    zhCursor = chineseEvent.end
    enCursor = englishEvent.end
  }

  const zhRemainder = chineseSource.slice(zhCursor).trim()
  const enRemainder = englishSource.slice(enCursor).trim()
  if (zhRemainder || enRemainder) {
    markdownIndex += 1
    blocks.push({ kind: 'markdown', id: `${chapterId}-markdown-${markdownIndex}`, markdown: { 'zh-CN': zhRemainder, en: enRemainder } })
  }
  return blocks
}

export function compileRuntimeContent(options = {}) {
  const root = resolve(options.root ?? defaultRoot)
  checkPairedMasters({ root })
  return pythonDataToolsContract.chapters.map((chapter, index) => {
    const filename = filenameFor(index, chapter.id)
    const chineseSource = readFileSync(resolve(root, localeDirectory['zh-CN'], filename), 'utf8')
    const englishSource = readFileSync(resolve(root, localeDirectory.en, filename), 'utf8')
    const chineseHeader = masterHeader(chineseSource, 'zh-CN')
    const englishHeader = masterHeader(englishSource, 'en')
    const chineseEvents = parseEvents(chineseSource, 'zh-CN')
    const englishEvents = parseEvents(englishSource, 'en')
    return {
      id: chapter.id,
      title: { 'zh-CN': chineseHeader.title, en: englishHeader.title },
      question: { 'zh-CN': chineseHeader.question, en: englishHeader.question },
      blocks: localizedMarkdownBlocks(
        chapter.id, chineseSource, englishSource, chineseEvents, englishEvents,
        { 'zh-CN': chineseHeader.bodyStart, en: englishHeader.bodyStart },
      ),
    }
  })
}

export function buildRuntimeContentSource(options = {}) {
  const chapters = compileRuntimeContent(options)
  return '// Generated by scripts/python-data-tools/build-runtime-content.mjs. Do not edit by hand.\n'
    + "import type { PythonDataToolsRuntimeChapter } from '../../types/pythonDataToolsRuntime.ts'\n\n"
    + `export const pythonDataToolsRuntimeChapters = ${JSON.stringify(chapters, null, 2)} as const satisfies readonly PythonDataToolsRuntimeChapter[]\n`
}

export function checkRuntimeContent(options = {}) {
  const target = resolve(options.target ?? defaultTarget)
  const expected = buildRuntimeContentSource(options)
  let current = ''
  try { current = readFileSync(target, 'utf8') } catch { /* Report missing targets as drift. */ }
  if (current !== expected) throw new Error('pythonDataToolsRuntime.generated.ts is out of date; run node scripts/python-data-tools/build-runtime-content.mjs')
  return true
}

function parseArguments(argv) {
  const options = { check: false }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--check') options.check = true
    else if (argument === '--root' || argument === '--target') {
      const value = argv[index + 1]
      if (!value) throw new Error(`${argument} requires a value`)
      options[argument.slice(2)] = value
      index += 1
    } else throw new Error(`Unknown argument: ${argument}`)
  }
  return options
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArguments(process.argv.slice(2))
    if (options.check) {
      checkRuntimeContent(options)
      process.stdout.write('pythonDataToolsRuntime.generated.ts is up to date\n')
    } else {
      const target = resolve(options.target ?? defaultTarget)
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, buildRuntimeContentSource(options), 'utf8')
      process.stdout.write(`Generated ${target}\n`)
    }
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
