import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  pythonDataToolsContract,
  pythonDataToolsOutputIds,
  type NotebookCellRole,
} from '../src/data/pythonNotebookContract.ts'

const root = new URL('../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')

const chapterIds = [
  'notebook-workflow',
  'numpy-foundations',
  'pandas-structures',
  'pandas-analysis',
  'matplotlib-visualization',
  'seaborn-statistics',
  'plotly-exploration',
  'analysis-report',
] as const

test('Python data tools contract fixes the eight-chapter bilingual course order', () => {
  assert.equal(pythonDataToolsContract.moduleId, 'python-notebook')
  assert.equal(pythonDataToolsContract.route, '/learn/python-notebook')
  assert.deepEqual(pythonDataToolsContract.chapters.map(({ id }) => id), chapterIds)
  for (const chapter of pythonDataToolsContract.chapters) {
    assert.ok(chapter.title['zh-CN'].trim())
    assert.ok(chapter.title.en.trim())
    assert.ok(chapter.question['zh-CN'].trim())
    assert.ok(chapter.question.en.trim())
  }
})

test('contract defines stable cell roles, exercise mounts, and authoritative outputs', () => {
  const roles: NotebookCellRole[] = [
    'question', 'setup', 'data', 'compute', 'visualize', 'interpret', 'limit', 'handoff',
  ]
  assert.deepEqual(pythonDataToolsContract.cellRoles, roles)
  assert.deepEqual(
    pythonDataToolsContract.exerciseMounts.map(({ chapterId, kind }) => [chapterId, kind]),
    [
      ['numpy-foundations', 'shape-index'],
      ['pandas-analysis', 'filter-groupby'],
      ['matplotlib-visualization', 'chart-choice'],
      ['seaborn-statistics', 'interpret-correlation'],
      ['plotly-exploration', 'interactive-encoding'],
    ],
  )
  assert.deepEqual(pythonDataToolsContract.outputs.map(({ id }) => id), pythonDataToolsOutputIds)
  assert.ok(pythonDataToolsContract.outputs.every(({ generator }) => generator.startsWith('scripts/python-data-tools/')))
  assert.equal(new Set(pythonDataToolsContract.outputs.map(({ cellId }) => cellId)).size, pythonDataToolsOutputIds.length)
  assert.ok(pythonDataToolsContract.outputs.every(({ datasetBinding }) => datasetBinding === 'manifest:file.sha256'))
  assert.ok(pythonDataToolsContract.outputs.every(({ environmentContractVersion }) => environmentContractVersion === 'python-data-tools-v1'))
})

test('phase 1 preserves the existing runtime lesson and checkpoint boundary', () => {
  const moduleSource = read('src/data/pythonNotebookModule.ts')
  assert.match(moduleSource, /slug: 'python-notebook'/)
  assert.match(moduleSource, /route: '\/learn\/python-notebook'/)
  assert.equal([...moduleSource.matchAll(/chapter\(\s*'/g)].length, 5)
  for (const id of [
    'notebook-rhythm', 'numpy-arrays', 'pandas-tables',
    'sklearn-small-model', 'reproducible-handoff',
  ]) assert.match(moduleSource, new RegExp(`chapter\\(\\s*'${id}'`))
})
