import '../scripts/register-ts-resolver.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { textbookReadings } from '../src/curriculum/reading.ts'
import { pythonDataToolsRuntimeChapters } from '../src/data/generated/pythonDataToolsRuntime.generated.ts'
import { linearRegressionLessons } from '../src/data/linearRegressionLesson.ts'
import { housingProjectLessons } from '../src/data/housingProjectLesson.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'
import { dataLabModuleRegistry } from '../src/modules/data-lab/data/modules.ts'

const { classificationModule } = await import('../src/data/classificationModule.ts')
const { treeForestModule } = await import('../src/data/treeForestModule.ts')
const { modelSelectionModule } = await import('../src/data/modelSelectionModule.ts')

const cases = JSON.parse(readFileSync(new URL('../scripts/qa/readingHandoffCases.json', import.meta.url), 'utf8')) as Array<{ moduleId: string; lessonId: string; optionalPath?: string }>
function body(moduleId: string, lessonId: string, locale: 'zh-CN' | 'en'): string {
  if (moduleId === 'python-notebook') return pythonDataToolsRuntimeChapters.find(chapter => chapter.id === lessonId)!.blocks.filter(block => block.kind === 'markdown').map(block => block.markdown[locale]).join('\n')
  if (moduleId === 'linear-regression' || moduleId === 'housing-price-project') {
    const lessons = moduleId === 'linear-regression' ? linearRegressionLessons : housingProjectLessons
    return lessons[lessonId]!.blocks.filter(block => block.kind === 'explanation').map(block => block.body[locale]).join('\n')
  }
  const module = [classificationModule, treeForestModule, modelSelectionModule].find(module => module.slug === moduleId)
  if (module) return module.chapters.find(chapter => chapter.id === lessonId)!.markdown![locale]
  return (mathLabModuleRegistry[moduleId] ?? dataLabModuleRegistry[moduleId])!.sections.find(section => section.id === lessonId)!.content[locale]
}

test('bilingual narrative handoffs agree with the actual core sequence and separate optional topics', () => {
  assert.equal(textbookReadings.length, 120)
  assert.equal(new Set(cases.map(probe => textbookReadings.find(lesson => lesson.moduleId === probe.moduleId && lesson.lessonId === probe.lessonId)?.unitId)).size, 6)
  for (const probe of cases) {
    const index = textbookReadings.findIndex(lesson => lesson.moduleId === probe.moduleId && lesson.lessonId === probe.lessonId)
    assert.ok(index >= 0)
    const next = textbookReadings[index + 1]!
    const target = probe.optionalPath ?? next.path + '?route=core-learning-path' + (next.hash ?? '')
    for (const locale of ['zh-CN', 'en'] as const) {
      const text = body(probe.moduleId, probe.lessonId, locale)
      const links = [...text.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1])
      assert.ok(links.includes(target), `${locale} ${probe.moduleId}/${probe.lessonId} must link to ${target}`)
      if (probe.optionalPath) assert.match(text, locale === 'en' ? /optional/i : /选读|可选/)
    }
  }
})

test('probability introductions place each overview image once and retain code and experiment anchors', () => {
  const module = mathLabModuleRegistry['beginner-probability-distributions']!
  assert.equal(module.sections.length, 12)
  for (const id of ['beginner-probability-story', 'beginner-sample-space-random-variable-longform', 'beginner-distribution-frequency-longform']) {
    assert.equal(module.sections.filter(section => section.visualIds?.includes(id)).length, 1, id)
    assert.ok(module.visuals.some(asset => asset.id === id))
  }
  for (const lab of module.labs) assert.equal(module.sections.filter(section => section.labIds?.includes(lab.id)).length, 1)
  const aliases = module.visuals.flatMap(asset => asset.legacyAnchorIds ?? [])
  assert.deepEqual(aliases, [
    'beginner-probability-story--beginner-probability-sample-space',
    'beginner-sample-space-random-variable-longform--beginner-probability-sample-space',
    'beginner-distribution-frequency-longform--minimum-probability-numpy-output',
  ])
  assert.equal(new Set([...module.sections.map(section => section.id), ...module.visuals.map(asset => asset.id), ...aliases]).size, module.sections.length + module.visuals.length + aliases.length)
  const sampleSpace = module.sections.find(section => section.id === 'beginner-probability-sample-space')!
  for (const locale of ['zh-CN', 'en'] as const) {
    assert.match(sampleSpace.content[locale], /P\(Z=0\)=0\.30/)
    assert.match(sampleSpace.content[locale], /P\(Z=1\)=0\.70/)
    assert.match(sampleSpace.content[locale], locale === 'en' ? /arbitrary IDs/ : /约定编号/)
  }
  assert.match(module.concepts.find(concept => concept.id === 'beginner-distribution')!.codeOutput!.en, /empirical_frequency = 0\.75/)
})

test('both CV leakage examples compute negative MAE and the correct pipeline matches fold-local evaluation', () => {
  const chapter = modelSelectionModule.chapters.find(chapter => chapter.id === 'pipeline-leakage')!
  const snippets = (locale: 'zh-CN' | 'en') => [...chapter.markdown![locale].matchAll(/~~~python\n([\s\S]*?)\n~~~/g)].map(match => match[1]!)
  assert.deepEqual(snippets('zh-CN'), snippets('en'))
  const code = snippets('en')
  assert.equal(code.length, 2)
  for (const snippet of code) assert.match(snippet, /scoring="neg_mean_absolute_error"/)
  const result = spawnSync('python3', ['-c', `import json, sys
import numpy as np
from sklearn.model_selection import KFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error
X_dev = np.arange(180, dtype=float).reshape(60, 3)
X_dev[:, 1] = np.sin(X_dev[:, 1])
y_dev = 2 * X_dev[:, 0] - 3 * X_dev[:, 1] + np.cos(X_dev[:, 2])
snippets = json.load(sys.stdin)
for snippet in snippets:
    exec(snippet)
    assert scores.shape == (5,) and np.all(scores <= 0)
expected = []
for train, valid in KFold(5).split(X_dev):
    model = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
    model.fit(X_dev[train], y_dev[train])
    expected.append(mean_absolute_error(y_dev[valid], model.predict(X_dev[valid])))
np.testing.assert_allclose(mae_scores, expected, rtol=1e-12)
print("5 fold-local MAE values matched")`], { input: JSON.stringify(code), encoding: 'utf8', timeout: 20000 })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /5 fold-local MAE values matched/)
})
