import '../scripts/register-ts-resolver.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { csvParse } from 'd3'
import { classificationProjectCode, classificationProjectReference } from '../src/data/generated/classificationProjectRuntime.ts'
import { curriculumLessonDirectory } from '../src/curriculum/generated/lessonDirectory.ts'
import { verifyReleaseManifest } from '../scripts/textbook-release.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

const directory = 'public/classification-project/v1/'
const { classificationProjectModule } = await import('../src/data/classificationProjectModule.ts')
const read = (path: string) => readFileSync(path, 'utf8')
const json = (name: string) => JSON.parse(read(directory + name))
const summary = json('reference-summary.json')
const split = json('split.json')
const predictions = json('validation-predictions.json') as Array<{ sms_id: number; label: string; score: number }>
const csv = read('public/datasets/numerical-methods/sms-spam.csv')
const rows = csvParse(csv)
const byId = new Map(rows.map(row => [Number(row.sms_id), row]))
const round = (value: number) => Number(value.toFixed(8))

test('SMS reference freezes existing source bytes and every downloadable artifact', () => {
  assert.equal(createHash('sha256').update(csv).digest('hex'), 'd43a9b9fe1530f4cc58a1e01ad23ee466283c9abce4a83be17b199899bd584f8')
  const manifest = json('manifest.json')
  assert.equal(verifyReleaseManifest('/classification-project/v1/manifest.json'), manifest.members.length)
  assert.equal(read(directory + 'reference.py'), read('scripts/classification-project/reference.py'))
  assert.equal(read(directory + 'requirements.txt'), read('scripts/linear-regression/requirements.txt'))
  assert.deepEqual(classificationProjectReference, summary)
  const provenance = JSON.parse(read('public' + manifest.source.datasetManifest))
  assert.equal(provenance.dataset.license, manifest.source.license)
  assert.deepEqual(provenance.dataset.creators, manifest.source.creators)
  assert.equal(provenance.file.sha256, split.dataset.sha256)
})

test('frozen SMS partitions are disjoint and do not share normalized messages', () => {
  assert.equal(rows.length, 5574)
  const allIds = new Set<number>()
  const allMessages = new Set<string>()
  for (const [name, ids] of Object.entries(split.partitions) as Array<[string, number[]]>) {
    assert.equal(ids.length, summary.counts[name])
    const labelCounts: Record<string, number> = {}
    for (const id of ids) {
      const row = byId.get(id)
      assert.ok(row, String(id))
      assert.ok(!allIds.has(id), 'Row spans partitions: ' + id)
      allIds.add(id)
      // Lowercase is sufficient to detect cross-partition case/whitespace
      // duplicates in this frozen corpus; the offline generator uses casefold.
      const normalized = row.message!.toLowerCase().trim().replace(/\s+/gu, ' ')
      assert.ok(!allMessages.has(normalized), 'Message spans partitions: ' + id)
      allMessages.add(normalized)
      labelCounts[row.label!] = (labelCounts[row.label!] ?? 0) + 1
    }
    assert.deepEqual(labelCounts, summary.labelCounts[name])
  }
  assert.equal(allIds.size, 5159)
  assert.equal(summary.excludedDuplicateRows, rows.length - allIds.size)
  assert.deepEqual(summary.counts, { train: 3095, validation: 1032, test: 1032 })
  assert.deepEqual(split.split.seeds, [42, 43])
})

test('validation predictions independently reproduce threshold choice, costs and all metrics', () => {
  assert.deepEqual(predictions.map(row => row.sms_id), split.partitions.validation)
  for (const row of predictions) {
    assert.equal(row.label, byId.get(row.sms_id)?.label)
    assert.ok(Number.isFinite(row.score) && row.score >= 0 && row.score <= 1)
  }
  const positives = predictions.filter(row => row.label === 'spam')
  const negatives = predictions.filter(row => row.label === 'ham')
  const auc = round(positives.reduce((total, positive) => total + negatives.reduce(
    (count, negative) => count + (positive.score > negative.score ? 1 : positive.score === negative.score ? 0.5 : 0), 0,
  ), 0) / (positives.length * negatives.length))
  const reports = summary.thresholdSweep.map((report: { threshold: number }) => {
    const confusion = { TP: 0, FP: 0, TN: 0, FN: 0 }
    for (const row of predictions) {
      const positive = row.score >= report.threshold
      confusion[row.label === 'spam' ? (positive ? 'TP' : 'FN') : (positive ? 'FP' : 'TN')]++
    }
    const { TP, FP, TN, FN } = confusion
    const precision = TP / (TP + FP) || 0
    const recall = TP / (TP + FN) || 0
    const recomputed = {
      threshold: report.threshold, confusion, precision: round(precision), recall: round(recall),
      f1: round(2 * TP / (2 * TP + FP + FN) || 0), accuracy: round((TP + TN) / predictions.length),
      auc, cost: 5 * FP + FN,
    }
    assert.deepEqual(report, recomputed)
    return recomputed
  })
  const selected = [...reports].sort((a, b) => a.cost - b.cost || a.confusion.FP - b.confusion.FP || b.threshold - a.threshold)[0]
  assert.deepEqual(selected, summary.validation)
  assert.equal(selected?.threshold, 0.45)
  assert.equal(selected?.cost, 31)
  for (const error of summary.validationErrorExamples) {
    const row = predictions.find(row => row.sms_id === error.sms_id)!
    assert.equal(row.score, error.score)
    assert.equal(error.kind, row.label === 'ham' ? 'FP' : 'FN')
    assert.notEqual(row.label, row.score >= summary.validation.threshold ? 'spam' : 'ham')
  }
})

test('model selection and test reporting use distinct boundaries and consistent labels', () => {
  assert.deepEqual(summary.policy, { modelSelectionSplit: 'train-cv', thresholdSelectionSplit: 'validation', testEvaluations: 1, testReselectionAllowed: false })
  assert.match(classificationProjectCode.fit, /search\.fit\(X_train, y_train\)/)
  assert.doesNotMatch(classificationProjectCode.fit, /\bX_(valid|test)\b/)
  assert.doesNotMatch(classificationProjectCode.threshold, /\b(?:X_test|y_test|score_test)\b/)
  assert.match(classificationProjectCode.threshold, /np\.where\(scores >= threshold, "spam", "ham"\)/)
  assert.equal((classificationProjectCode.evaluate.match(/model\.predict_proba\(X_test\)/g) ?? []).length, 1)
  assert.doesNotMatch(classificationProjectCode.review, /\b(?:X_test|y_test|score_test)\b/)
  const { TP, FP, TN, FN } = summary.lockedTest.confusion
  assert.equal(TP + FP + TN + FN, summary.counts.test)
  assert.equal(TP + FN, summary.labelCounts.test.spam)
  assert.equal(TN + FP, summary.labelCounts.test.ham)
  assert.equal(summary.lockedTest.precision, round(TP / (TP + FP)))
  assert.equal(summary.lockedTest.recall, round(TP / (TP + FN)))
  assert.equal(summary.lockedTest.f1, round(2 * TP / (2 * TP + FP + FN)))
  assert.equal(summary.lockedTest.cost, 5 * FP + FN)
  assert.equal(summary.selectedC, [...summary.cv].sort((a, b) => b.meanF1 - a.meanF1)[0].C)
})

test('both executed Notebooks and website use the same six canonical code blocks', () => {
  const canonical: Record<string, string> = {}
  // Split at explicit cell markers, never infer cells from blank lines.
  const pieces = read('scripts/classification-project/reference.py').split(/^# %% (\w+)\n/m)
  for (let i = 1; i < pieces.length; i += 2) canonical[pieces[i]!] = pieces[i + 1]!.trim() + '\n'
  assert.deepEqual(classificationProjectCode, canonical)
  let outputs: unknown
  for (const locale of ['zh-CN', 'en'] as const) {
    const notebook = json('classification-project.' + locale + '.ipynb')
    const cells = notebook.cells.filter((cell: { cell_type: string }) => cell.cell_type === 'code')
    assert.equal(cells.length, 6)
    const observed = cells.map((cell, index) => {
      assert.equal(cell.execution_count, index + 1)
      assert.equal(cell.source.join(''), Object.values(classificationProjectCode)[index])
      assert.ok(cell.outputs.length, 'Executed cell lacks a result')
      assert.ok(cell.outputs.every(output => output.output_type !== 'error'))
      return cell.outputs
    })
    if (outputs) assert.deepEqual(observed, outputs)
    outputs = observed
    assert.deepEqual(JSON.parse(cells.at(-1).outputs.map(output => output.text?.join('') ?? '').join('')), summary)
    classificationProjectModule.chapters.forEach((chapter, index) => {
      const markdown = chapter.markdown[locale]
      assert.ok(markdown.includes(Object.values(classificationProjectCode)[index]!))
      const html = renderMarkdownWithMath(markdown)
      assert.match(html, /<details><summary>/)
      assert.match(html, /<pre><code class="language-python">/)
      assert.doesNotMatch(html, /katex-error/)
    })
  }
})

test('project review links target actual current chapters', () => {
  const validPaths = new Set(curriculumLessonDirectory.flatMap(module => module.lessons.map(lesson => '/learn/' + module.id + '/' + lesson.id)))
  for (const chapter of classificationProjectModule.chapters) {
    for (const body of Object.values(chapter.markdown)) {
      for (const [, path] of body.matchAll(/\]\((\/learn\/[^)]+)\)/g)) assert.ok(validPaths.has(path!), path)
    }
  }
})
