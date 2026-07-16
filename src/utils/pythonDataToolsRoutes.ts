import {
  pythonDataToolsContract,
  type PythonDataToolsChapterId,
} from '../data/pythonNotebookContract.ts'

export const legacyPythonDataToolsChapterMap = Object.freeze({
  'notebook-rhythm': 'notebook-workflow',
  'numpy-arrays': 'numpy-foundations',
  'pandas-tables': 'pandas-structures',
  'sklearn-small-model': 'pandas-analysis',
  'reproducible-handoff': 'analysis-report',
} as const satisfies Readonly<Record<string, PythonDataToolsChapterId>>)

export type PythonDataToolsChapterResolution =
  | { readonly kind: 'legacy'; readonly id: PythonDataToolsChapterId }
  | { readonly kind: 'current'; readonly id: PythonDataToolsChapterId }
  | { readonly kind: 'unknown'; readonly id: PythonDataToolsChapterId }

const pythonDataToolsChapterIdSet = new Set<string>(
  pythonDataToolsContract.chapters.map(({ id }) => id),
)

const firstPythonDataToolsChapterId = pythonDataToolsContract.chapters[0].id

function isLegacyPythonDataToolsChapterId(
  id: string,
): id is keyof typeof legacyPythonDataToolsChapterMap {
  return Object.hasOwn(legacyPythonDataToolsChapterMap, id)
}

function isCurrentPythonDataToolsChapterId(id: string): id is PythonDataToolsChapterId {
  return pythonDataToolsChapterIdSet.has(id)
}

export function resolvePythonDataToolsChapter(
  id: string,
): PythonDataToolsChapterResolution {
  if (isLegacyPythonDataToolsChapterId(id)) {
    return { kind: 'legacy', id: legacyPythonDataToolsChapterMap[id] }
  }

  if (isCurrentPythonDataToolsChapterId(id)) {
    return { kind: 'current', id }
  }

  return { kind: 'unknown', id: firstPythonDataToolsChapterId }
}
