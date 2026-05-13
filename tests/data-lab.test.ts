import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { dataLabModules } from '../src/modules/data-lab/data/modules.ts'
import {
  castColumn,
  clipColumn,
  deriveColumn,
  dropDuplicates,
  fillMissing,
  groupByAggregate,
  housingTeachingTable,
  inferColumnType,
  isMissing,
  mergeLookup,
  oneHotDimension,
  profileColumns,
  tableShape,
} from '../src/modules/data-lab/utils/tableTransforms.ts'
import type { DataTable, LocalizedCopy } from '../src/modules/data-lab/types/dataLab.ts'
import { withPublicBase } from '../src/utils/publicPath.ts'

const root = new URL('../', import.meta.url)

function assertLocalized(copy: LocalizedCopy, message: string) {
  assert.equal(typeof copy['zh-CN'], 'string', `${message} needs zh-CN text`)
  assert.equal(typeof copy.en, 'string', `${message} needs English text`)
  assert.equal(copy['zh-CN'].length >= 2, true, `${message} zh-CN text is too short`)
  assert.equal(copy.en.length > 2, true, `${message} English text is too short`)
  assert.notEqual(copy['zh-CN'], copy.en, `${message} should be bilingual, not duplicated`)
}

test('data lab modules expose a complete independent learning path', () => {
  assert.equal(dataLabModules.length, 4)
  assert.deepEqual(
    dataLabModules.map((moduleDefinition) => moduleDefinition.id),
    [
      'data-types-feature-vectors',
      'data-cleaning-preprocessing',
      'exploratory-data-analysis',
      'pandas-workflow',
    ],
  )
  assert.deepEqual(dataLabModules.map((moduleDefinition) => moduleDefinition.order), [1, 2, 3, 4])

  const componentNames = new Set<string>()
  for (const moduleDefinition of dataLabModules) {
    assertLocalized(moduleDefinition.title, `${moduleDefinition.id} title`)
    assertLocalized(moduleDefinition.subtitle, `${moduleDefinition.id} subtitle`)
    assert.equal(moduleDefinition.learningObjectives.length >= 3, true, `${moduleDefinition.id} needs objectives`)
    assert.equal(moduleDefinition.concepts.length >= 2, true, `${moduleDefinition.id} needs concepts`)
    assert.equal(moduleDefinition.sections.length >= 3, true, `${moduleDefinition.id} needs lesson sections`)
    assert.equal(moduleDefinition.labs.length >= 1, true, `${moduleDefinition.id} needs a lab`)
    assert.equal(moduleDefinition.quizzes.length >= 1, true, `${moduleDefinition.id} needs a quiz`)
    assert.equal(moduleDefinition.misconceptions.length >= 1, true, `${moduleDefinition.id} needs misconceptions`)
    assert.equal(moduleDefinition.sourceReferences.length >= 3, true, `${moduleDefinition.id} needs references`)
    assert.equal(moduleDefinition.visuals.some((visual) => visual.type === 'image'), true)
    assert.equal(moduleDefinition.visuals.some((visual) => visual.type === 'manim-video'), true)
    assert.equal(moduleDefinition.notebookUrl, undefined, 'Notebook links should stay hidden until a URL exists')

    for (const objective of moduleDefinition.learningObjectives) assertLocalized(objective, `${moduleDefinition.id} objective`)
    for (const section of moduleDefinition.sections) {
      assertLocalized(section.title, `${moduleDefinition.id} section title`)
      assertLocalized(section.content, `${moduleDefinition.id} section content`)
      assert.equal(section.content.en.length > 180, true, `${section.id} English lesson body is too thin`)
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
    'CleaningPipelineLab',
    'ColumnTypeLab',
    'EdaWorkbenchLab',
    'PandasPipelineLab',
  ])
})

test('data lab source references and visual assets are local, explicit, and teaching-oriented', () => {
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
    }

    for (const visual of moduleDefinition.visuals) {
      assertLocalized(visual.title, `${visual.id} visual title`)
      assertLocalized(visual.caption, `${visual.id} visual caption`)
      assert.match(visual.assetPath, visual.type === 'image' ? /^\/data-lab\/generated\// : /^\/manim\/data-lab\//)
      assert.ok(existsSync(new URL(`public${visual.assetPath}`, root)), `${visual.assetPath} should exist`)

      if (visual.type === 'image') {
        assert.equal((visual.labels?.length ?? 0) >= 4, true, `${visual.id} needs explanatory overlay labels`)
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

  const dataManimMetadata = new URL('public/manim/data-lab/metadata.json', root)
  assert.ok(existsSync(dataManimMetadata), 'Data Lab Manim metadata should exist')
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
    withPublicBase('/data-lab/generated/data-types-feature-vectors.png', '/ML_tutorial_Site/'),
    '/ML_tutorial_Site/data-lab/generated/data-types-feature-vectors.png',
  )
  assert.equal(
    withPublicBase('/manim/data-lab/pandas-method-chain.mp4', '/ML_tutorial_Site/'),
    '/ML_tutorial_Site/manim/data-lab/pandas-method-chain.mp4',
  )
})
