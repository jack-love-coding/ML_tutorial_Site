import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dataLabModules } from '../src/modules/data-lab/data/modules.ts'
import {
  buildDataQuizAttempt,
  evaluateDataQuizAnswer,
} from '../src/modules/data-lab/utils/quiz.ts'
import {
  appendDataQuizAttempt,
  clearDataLabProgress,
  createDefaultDataLabProgress,
  loadDataLabProgress,
  markDataLabModuleComplete,
  saveDataLabProgress,
  setLastVisitedDataLabModule,
} from '../src/modules/data-lab/utils/progress.ts'
import {
  castColumn,
  activeSparseIndices,
  buildCategoryVocabulary,
  clipColumn,
  deriveColumn,
  dropDuplicates,
  encodeMultiHot,
  encodeOneHot,
  featureCrossDimension,
  featureCrossToken,
  fillMissing,
  groupByAggregate,
  hashCategoryToBucket,
  housingTeachingTable,
  inferColumnType,
  isMissing,
  mergeLookup,
  resolveCategoryToken,
  oneHotDimension,
  profileColumns,
  tableShape,
} from '../src/modules/data-lab/utils/tableTransforms.ts'
import type { DataTable, LocalizedCopy } from '../src/modules/data-lab/types/dataLab.ts'
import { withPublicBase } from '../src/utils/publicPath.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

function assertLocalized(copy: LocalizedCopy, message: string) {
  assert.equal(typeof copy['zh-CN'], 'string', `${message} needs zh-CN text`)
  assert.equal(typeof copy.en, 'string', `${message} needs English text`)
  assert.equal(copy['zh-CN'].length >= 2, true, `${message} zh-CN text is too short`)
  assert.equal(copy.en.length > 2, true, `${message} English text is too short`)
  assert.notEqual(copy['zh-CN'], copy.en, `${message} should be bilingual, not duplicated`)
}

function createMemoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  }
}

test('data lab modules expose a complete independent learning path', () => {
  assert.equal(dataLabModules.length, 5)
  assert.deepEqual(
    dataLabModules.map((moduleDefinition) => moduleDefinition.id),
    [
      'numerical-data',
      'categorical-data',
      'dataset-quality',
      'splits-generalization',
      'complexity-regularization',
    ],
  )
  assert.deepEqual(dataLabModules.map((moduleDefinition) => moduleDefinition.order), [1, 2, 3, 4, 5])

  const componentNames = new Set<string>()
  for (const moduleDefinition of dataLabModules) {
    assertLocalized(moduleDefinition.title, `${moduleDefinition.id} title`)
    assertLocalized(moduleDefinition.subtitle, `${moduleDefinition.id} subtitle`)
    assert.equal(moduleDefinition.learningObjectives.length >= 5, true, `${moduleDefinition.id} needs expanded objectives`)
    assert.equal(moduleDefinition.concepts.length >= 4, true, `${moduleDefinition.id} needs textbook-level concepts`)
    assert.equal(moduleDefinition.sections.length >= 5, true, `${moduleDefinition.id} needs expanded lesson sections`)
    assert.equal(moduleDefinition.labs.length >= 1, true, `${moduleDefinition.id} needs a lab`)
    assert.equal(moduleDefinition.quizzes.length >= 2, true, `${moduleDefinition.id} needs expanded quizzes`)
    assert.equal(moduleDefinition.misconceptions.length >= 2, true, `${moduleDefinition.id} needs expanded misconceptions`)
    assert.equal(moduleDefinition.sourceReferences.length >= 2, true, `${moduleDefinition.id} needs lightweight references`)
    assert.equal('sourcePages' in moduleDefinition, false, `${moduleDefinition.id} should not expose page-level source metadata`)
    assert.equal('sourceMode' in moduleDefinition, false, `${moduleDefinition.id} should not expose source mode`)
    assert.equal(moduleDefinition.visuals.filter((visual) => visual.type === 'image').length >= 2, true)
    assert.equal(moduleDefinition.visuals.some((visual) => visual.type === 'manim-video'), true)
    assert.equal(moduleDefinition.notebookUrl, undefined, 'Notebook links should stay hidden until a URL exists')

    const zhLessonBody = [
      moduleDefinition.title['zh-CN'],
      moduleDefinition.subtitle['zh-CN'],
      ...moduleDefinition.learningObjectives.map((objective) => objective['zh-CN']),
      ...moduleDefinition.concepts.map((concept) => concept.plainExplanation['zh-CN']),
      ...moduleDefinition.sections.map((section) => section.content['zh-CN']),
      ...moduleDefinition.misconceptions.map((item) => item.correction['zh-CN']),
    ].join('\n')
    assert.match(zhLessonBody, /为什么重要/, `${moduleDefinition.id} should explain why the concepts matter`)
    assert.match(zhLessonBody, /课堂|学生/, `${moduleDefinition.id} should be written for students`)
    assert.doesNotMatch(
      zhLessonBody,
      /迁移\s*Google|Google\s*MLCC|MLCC|翻译整理|来源与许可|原文\/文档时间|按 CC BY|Source date|translated and organized/i,
      `${moduleDefinition.id} should avoid source-first page narrative`,
    )

    for (const objective of moduleDefinition.learningObjectives) assertLocalized(objective, `${moduleDefinition.id} objective`)
    for (const section of moduleDefinition.sections) {
      assertLocalized(section.title, `${moduleDefinition.id} section title`)
      assertLocalized(section.content, `${moduleDefinition.id} section content`)
      assert.equal(section.content.en.length > 180, true, `${section.id} English lesson body is too thin`)
      assert.equal(section.content['zh-CN'].length > 180, true, `${section.id} Chinese lesson body is too thin`)
      assert.equal('sourcePageIds' in section, false, `${section.id} should not carry source page traceability`)
    }
    for (const concept of moduleDefinition.concepts) {
      assertLocalized(concept.name, `${concept.id} concept name`)
      assertLocalized(concept.plainExplanation, `${concept.id} concept explanation`)
      assertLocalized(concept.example, `${concept.id} concept example`)
    }
    for (const lab of moduleDefinition.labs) {
      componentNames.add(lab.componentName)
      assertLocalized(lab.title, `${lab.id} lab title`)
      assert.equal(lab.successCriteria.length >= 2, true, `${lab.id} needs success criteria`)
    }
    for (const quiz of moduleDefinition.quizzes) {
      assertLocalized(quiz.prompt, `${quiz.id} quiz prompt`)
      assert.equal(quiz.choices.some((choice) => choice.id === quiz.answer), true)
      assertLocalized(quiz.explanation, `${quiz.id} quiz explanation`)
    }
  }

  assert.deepEqual([...componentNames].sort(), [
    'CategoricalEncodingLab',
    'CategoricalVocabularyTaskLab',
    'CleaningPipelineLab',
    'ColumnTypeLab',
    'DataPipelineTaskLab',
    'EdaWorkbenchLab',
    'PandasPipelineLab',
  ])
})

test('data lab references stay lightweight and visual assets are teaching-oriented', () => {
  const sourceHosts = new Set<string>()

  for (const moduleDefinition of dataLabModules) {
    for (const source of moduleDefinition.sourceReferences) {
      const url = new URL(source.href)
      sourceHosts.add(url.hostname)
      assert.ok(
        ['developers.google.com', 'pandas.pydata.org'].includes(url.hostname),
        `${source.href} should come from an approved teaching source`,
      )
      assertLocalized(source.label, `${moduleDefinition.id} source label`)
      assertLocalized(source.usage, `${moduleDefinition.id} source usage`)
      assert.equal('lastUpdated' in source, false, `${moduleDefinition.id} reference should not expose source dates`)
      assert.equal('sourceMode' in source, false, `${moduleDefinition.id} reference should not expose source mode`)
    }

    for (const visual of moduleDefinition.visuals) {
      assertLocalized(visual.title, `${visual.id} visual title`)
      assertLocalized(visual.caption, `${visual.id} visual caption`)
      assert.match(visual.assetPath, visual.type === 'image' ? /^\/data-lab\/generated\// : /^\/manim\/data-lab\//)
      assert.ok(existsSync(new URL(`public${visual.assetPath}`, root)), `${visual.assetPath} should exist`)

      if (visual.type === 'image') {
        assert.equal((visual.labels?.length ?? 0) >= 4, true, `${visual.id} needs explanatory overlay labels`)
        if (visual.assetPath.includes('-v2.png')) {
          assert.equal((visual.labels?.length ?? 0) >= 5, true, `${visual.id} needs dense explanatory overlay labels`)
        }
        for (const label of visual.labels ?? []) {
          assertLocalized(label.label, `${visual.id} overlay ${label.id}`)
          assert.equal(label.x >= 0 && label.x <= 100, true)
          assert.equal(label.y >= 0 && label.y <= 100, true)
        }
      } else {
        assert.ok(visual.posterPath)
        assert.ok(existsSync(new URL(`public${visual.posterPath}`, root)), `${visual.posterPath} should exist`)
      }
    }
  }

  assert.ok(sourceHosts.has('developers.google.com'))
  assert.ok(sourceHosts.has('pandas.pydata.org'))

  for (const assetPath of [
    'public/data-lab/generated/feature-vector-pipeline-v2.png',
    'public/data-lab/generated/cleaning-policy-map-v2.png',
    'public/data-lab/generated/eda-investigation-board-v2.png',
    'public/data-lab/generated/pandas-shape-audit-v2.png',
    'public/data-lab/generated/categorical-semantics.png',
    'public/data-lab/generated/categorical-vocabulary-one-hot.png',
    'public/data-lab/generated/categorical-feature-cross-sparsity.png',
  ]) {
    assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
  }

  const dataManimMetadata = new URL('public/manim/data-lab/metadata.json', root)
  assert.ok(existsSync(dataManimMetadata), 'Data Lab Manim metadata should exist')
})

test('data lab quiz scoring records correct and review-needed attempts', () => {
  const moduleDefinition = dataLabModules[0]
  const quiz = moduleDefinition.quizzes[0]

  const correct = evaluateDataQuizAnswer(quiz, quiz.answer)
  assert.equal(correct.correct, true)
  assert.equal(correct.reviewNeeded, false)

  const incorrect = evaluateDataQuizAnswer(quiz, 'distractor')
  assert.equal(incorrect.correct, false)
  assert.equal(incorrect.reviewNeeded, true)
  assert.equal(incorrect.expectedAnswer, quiz.answer)

  const attempt = buildDataQuizAttempt(moduleDefinition.id, quiz, 'distractor')
  assert.equal(attempt.moduleId, moduleDefinition.id)
  assert.equal(attempt.quizId, quiz.id)
  assert.equal(attempt.selected, 'distractor')
  assert.equal(attempt.correct, false)
  assert.match(attempt.attemptedAt, /^\d{4}-\d{2}-\d{2}T/)
})

test('data lab progress persists last visited, completion, and quiz attempts', () => {
  const storage = createMemoryStorage()
  const moduleDefinition = dataLabModules[0]
  const quiz = moduleDefinition.quizzes[0]
  const attempt = buildDataQuizAttempt(moduleDefinition.id, quiz, quiz.answer)

  let progress = createDefaultDataLabProgress('2026-05-18T00:00:00.000Z')
  progress = setLastVisitedDataLabModule(progress, 'categorical-data')
  progress = appendDataQuizAttempt(progress, attempt)
  progress = markDataLabModuleComplete(progress, moduleDefinition.id)
  saveDataLabProgress(progress, storage)

  const reloaded = loadDataLabProgress(storage)
  assert.deepEqual(reloaded.completedModuleIds, [moduleDefinition.id])
  assert.equal(reloaded.lastVisitedModuleId, moduleDefinition.id)
  assert.equal(reloaded.quizAttempts.length, 1)
  assert.equal(reloaded.quizAttempts[0]?.correct, true)

  const corruptedStorage = createMemoryStorage({
    'ml-atlas:data-lab-progress:v1': '{bad json',
  })
  assert.deepEqual(loadDataLabProgress(corruptedStorage).completedModuleIds, [])

  clearDataLabProgress(storage)
  assert.deepEqual(loadDataLabProgress(storage).quizAttempts, [])
})

test('categorical encoding utilities keep train-time vocabulary stable', () => {
  const vocabulary = buildCategoryVocabulary(
    ['north', 'south', 'south', 'west', 'harbor', 'north', 'airport'],
    { minFrequency: 2, maxCategories: 3, includeOov: true },
  )

  assert.deepEqual(vocabulary.tokens, ['north', 'south', '<RARE>', '<OOV>'])
  assert.deepEqual(vocabulary.rareValues.sort(), ['airport', 'harbor', 'west'])
  assert.equal(resolveCategoryToken('harbor', vocabulary), '<RARE>')
  assert.equal(resolveCategoryToken('new-district', vocabulary), '<OOV>')

  assert.deepEqual(encodeOneHot('south', vocabulary), [0, 1, 0, 0])
  assert.deepEqual(encodeOneHot('airport', vocabulary), [0, 0, 1, 0])
  assert.deepEqual(encodeOneHot('unknown', vocabulary), [0, 0, 0, 1])
  assert.deepEqual(activeSparseIndices(encodeOneHot('north', vocabulary)), [0])

  const prototypeVocabulary = buildCategoryVocabulary(['__proto__', 'constructor', 'north'], { includeOov: true })
  assert.equal(prototypeVocabulary.frequencies.__proto__, 1)
  assert.equal(prototypeVocabulary.frequencies.constructor, 1)
  assert.equal(prototypeVocabulary.tokenToIndex.__proto__ !== undefined, true)
  assert.equal(prototypeVocabulary.tokenToIndex.constructor !== undefined, true)

  const northOnlyVocabulary = buildCategoryVocabulary(['north'], { includeOov: true })
  assert.deepEqual(encodeOneHot('__proto__', northOnlyVocabulary), [0, 1])
  assert.deepEqual(encodeOneHot('constructor', northOnlyVocabulary), [0, 1])
  assert.deepEqual(Object.keys(encodeOneHot('__proto__', northOnlyVocabulary)), ['0', '1'])

  const tagVocabulary = buildCategoryVocabulary(['school', 'subway', 'park', 'school'], { includeOov: true })
  assert.deepEqual(encodeMultiHot(['school', 'park'], tagVocabulary), [1, 1, 0, 0])

  const left = buildCategoryVocabulary(['north', 'south'], { includeOov: false })
  const right = buildCategoryVocabulary(['apartment', 'condo', 'house'], { includeOov: false })
  assert.equal(featureCrossDimension(left, right), 6)
  assert.equal(featureCrossToken('North', 'Condo'), 'north×condo')

  const hashed = hashCategoryToBucket('airport', 8)
  assert.equal(hashed.bucket >= 0 && hashed.bucket < 8, true)
  assert.equal(hashCategoryToBucket('airport', 8).bucket, hashed.bucket)
})

test('data lab Chinese source stays free of mojibake fragments', () => {
  const source = [
    'src/modules/data-lab/data/modules.ts',
    'src/modules/data-lab/data/categoricalDataModule.ts',
    'src/modules/data-lab/pages/DataLabHome.vue',
    'src/modules/data-lab/pages/DataLabModulePage.vue',
  ]
    .map(read)
    .join('\n')

  assert.doesNotMatch(source, /(锛|�|鈥|乣|銆|€|鏁|鍒|瀛︿|绔犺|棰勮|姣忔|琛楀|鍙傝|杩斿|寮€)/)
  assert.doesNotMatch(source, /用于校准，不直接搬运|Used for calibration, not copied prose/)
  assert.doesNotMatch(source, /迁移\s*Google|Google\s*MLCC|MLCC|翻译整理|来源与许可|原文\/文档时间|按 CC BY|Source date|Sources and licenses/i)
})

test('data table transforms model pandas-like operations without mutating inputs', () => {
  const original = JSON.stringify(housingTeachingTable)

  const profiles = profileColumns(housingTeachingTable)
  const byKey = Object.fromEntries(profiles.map((profile) => [profile.key, profile]))
  assert.equal(byKey.rooms?.missingCount, 2)
  assert.equal(byKey.price?.numericMax, 9800)
  assert.equal(byKey.id?.inferredType, 'identifier')
  assert.equal(oneHotDimension(housingTeachingTable, 'district'), 3)
  assert.equal(tableShape(housingTeachingTable).rows, 6)
  assert.equal(tableShape(housingTeachingTable).columns, 6)

  assert.equal(inferColumnType(['94110', '10001'], 'zip_code'), 'identifier')
  assert.equal(inferColumnType([true, false], 'has_school'), 'boolean')
  assert.equal(inferColumnType(['2026-01-01', '2026-01-02'], 'listed_at'), 'datetime')
  assert.equal(isMissing(''), true)
  assert.equal(isMissing(0), false)

  const filled = fillMissing(housingTeachingTable, 'rooms', 3)
  assert.equal(filled.rows.filter((row) => isMissing(row.rooms)).length, 0)
  assert.equal(housingTeachingTable.rows.filter((row) => isMissing(row.rooms)).length, 2)

  const clipped = clipColumn(housingTeachingTable, 'price', 100, 1200)
  assert.equal(clipped.rows.some((row) => row.price === 1200), true)
  assert.equal(housingTeachingTable.rows.some((row) => row.price === 9800), true)

  const deduped = dropDuplicates(housingTeachingTable, ['id'])
  assert.equal(deduped.rows.length, 5)

  const parsedDates = castColumn(housingTeachingTable, 'listed_at', 'datetime')
  assert.equal(parsedDates.rows[0]?.listed_at, '2026-01-02')
  assert.equal(parsedDates.rows[2]?.listed_at, null)

  const grouped = groupByAggregate(housingTeachingTable, 'district', 'price', 'mean')
  assert.deepEqual(grouped.rows.find((row) => row.district === 'north'), {
    district: 'north',
    price_mean: 365,
  })
  assert.equal(grouped.rows.some((row) => row.district === ''), false)

  const withDerived = deriveColumn(
    deduped,
    { key: 'price_per_room', label: { 'zh-CN': '每房价格', en: 'price per room' }, semanticType: 'numeric' },
    (row) => (Number(row.rooms) > 0 ? Number((Number(row.price) / Number(row.rooms)).toFixed(2)) : null),
  )
  assert.equal(withDerived.columns.at(-1)?.key, 'price_per_room')
  assert.equal(deduped.columns.some((column) => column.key === 'price_per_room'), false)

  const lookup: DataTable = {
    columns: [
      { key: 'district', label: { 'zh-CN': '街区', en: 'district' }, semanticType: 'categorical' },
      { key: 'region', label: { 'zh-CN': '区域', en: 'region' }, semanticType: 'categorical' },
    ],
    rows: [
      { district: 'north', region: 'urban' },
      { district: 'west', region: 'suburban' },
    ],
  }
  const merged = mergeLookup(deduped, lookup, 'district')
  assert.equal(merged.columns.some((column) => column.key === 'region'), true)
  assert.equal(merged.rows.find((row) => row.district === 'north')?.region, 'urban')
  assert.equal(deduped.columns.some((column) => column.key === 'region'), false)

  assert.equal(JSON.stringify(housingTeachingTable), original)
})

test('data lab public paths are compatible with GitHub Pages base URLs', () => {
  assert.equal(
    withPublicBase('/data-lab/generated/feature-vector-pipeline-v2.png', '/ML_tutorial_Site/'),
    '/ML_tutorial_Site/data-lab/generated/feature-vector-pipeline-v2.png',
  )
  assert.equal(
    withPublicBase('/manim/data-lab/pandas-method-chain.mp4', '/ML_tutorial_Site/'),
    '/ML_tutorial_Site/manim/data-lab/pandas-method-chain.mp4',
  )
})
