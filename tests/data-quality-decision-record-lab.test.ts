import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import {
  buildDataQualityDecisionSnapshot,
  type DataQualityDecisionConfig,
} from '../src/modules/data-lab/utils/dataQualityDecisionTask.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

function buildSnapshot(config: Partial<DataQualityDecisionConfig> = {}) {
  return buildDataQualityDecisionSnapshot({
    scenarioId: 'missing-rooms',
    selectedIssue: 'missingness',
    selectedTreatment: 'impute',
    selectedRisk: 'medium',
    ...config,
  })
}

test('missing rooms scenario records a safe imputation decision with stable shape evidence', () => {
  const snapshot = buildSnapshot()

  assert.equal(snapshot.scenarioId, 'missing-rooms')
  assert.equal(snapshot.expectedIssue, 'missingness')
  assert.deepEqual(snapshot.recommendedTreatments, ['impute', 'collect-more-data'])
  assert.equal(snapshot.recommendedRisk, 'medium')
  assert.equal(snapshot.safe, true)
  assert.deepEqual(snapshot.warnings, [])
  assert.equal(snapshot.evidence.affectedRows, 2)
  assert.deepEqual(snapshot.evidence.affectedColumns, ['rooms'])
  assert.equal(snapshot.impact.beforeShape, '[6,6]')
  assert.equal(snapshot.impact.afterShape, '[6,6]')
  assert.match(snapshot.decisionRecord.evidence, /2 rows/)
  assert.match(snapshot.decisionRecord.projectImpact, /housing/i)
  assert.ok(snapshot.codeLines.some((line) => line.includes("isna()")))
})

test('duplicate listing scenario exposes row-count impact and warns on wrong issue treatment or risk', () => {
  const snapshot = buildSnapshot({
    scenarioId: 'duplicate-listing',
    selectedIssue: 'missingness',
    selectedTreatment: 'impute',
    selectedRisk: 'low',
  })

  assert.equal(snapshot.expectedIssue, 'duplicate')
  assert.deepEqual(snapshot.recommendedTreatments, ['deduplicate'])
  assert.equal(snapshot.recommendedRisk, 'medium')
  assert.equal(snapshot.safe, false)
  assert.equal(snapshot.impact.beforeShape, '[6,6]')
  assert.equal(snapshot.impact.afterShape, '[5,6]')
  assert.ok(snapshot.warnings.some((warning) => warning.includes('expected duplicate')))
  assert.ok(snapshot.warnings.some((warning) => warning.includes('recommended treatment')))
  assert.ok(snapshot.warnings.some((warning) => warning.includes('risk is understated')))
})

test('label timing scenario remains a high-risk data-quality decision before modeling', () => {
  const snapshot = buildSnapshot({
    scenarioId: 'label-timing',
    selectedIssue: 'label-timing',
    selectedTreatment: 'remove-leaky-signal',
    selectedRisk: 'high',
  })

  assert.equal(snapshot.safe, true)
  assert.equal(snapshot.expectedIssue, 'label-timing')
  assert.equal(snapshot.recommendedRisk, 'high')
  assert.ok(snapshot.recommendedTreatments.includes('remove-leaky-signal'))
  assert.ok(snapshot.evidence.affectedColumns.includes('post_sale_review'))
  assert.match(snapshot.impact.projectRisk, /future information/i)
  assert.ok(snapshot.codeLines.some((line) => line.includes('prediction_time')))
})

test('imbalance baseline scenario records baseline and metric implications', () => {
  const snapshot = buildSnapshot({
    scenarioId: 'imbalance-baseline',
    selectedIssue: 'imbalance',
    selectedTreatment: 'use-baseline-and-metrics',
    selectedRisk: 'medium',
  })

  assert.equal(snapshot.safe, true)
  assert.equal(snapshot.expectedIssue, 'imbalance')
  assert.equal(snapshot.evidence.affectedRows, 1)
  assert.match(snapshot.evidence.metric, /positive share: 16\.7%/)
  assert.match(snapshot.decisionRecord.treatment, /baseline/i)
})

test('invalid decision config falls back to the missing rooms recommendation', () => {
  const snapshot = buildDataQualityDecisionSnapshot({
    scenarioId: 'unknown-scenario',
    selectedIssue: 'bad-issue',
    selectedTreatment: 'bad-treatment',
    selectedRisk: 'bad-risk',
  } as unknown as DataQualityDecisionConfig)

  assert.equal(snapshot.scenarioId, 'missing-rooms')
  assert.equal(snapshot.safe, true)
  assert.equal(snapshot.expectedIssue, 'missingness')
  assert.equal(snapshot.decisionRecord.issue, 'missingness')
  assert.equal(snapshot.decisionRecord.treatment, 'impute')
  assert.equal(snapshot.decisionRecord.risk, 'medium')
})

test('data quality decision record lab is wired into dataset quality as a lazy Data Lab lab', () => {
  const labPath = 'src/modules/data-lab/labs/DataQualityDecisionRecordLab.vue'
  const componentSource = read(labPath)
  const moduleSource = read('src/modules/data-lab/data/modules.ts')
  const modulePageSource = read('src/modules/data-lab/pages/DataLabModulePage.vue')
  const typeSource = read('src/modules/data-lab/types/dataLab.ts')
  const styleSource = read('src/styles/modules/data-lab.css')

  assert.ok(existsSync(new URL(labPath, root)), `${labPath} should exist`)
  assert.match(componentSource, /buildDataQualityDecisionSnapshot/)
  assert.match(componentSource, /Data Quality Decision Record/)
  assert.match(componentSource, /data-quality-decision-record-lab__scenarios/)
  assert.match(typeSource, /DataQualityDecisionRecordLab/)
  assert.match(modulePageSource, /DataQualityDecisionRecordLab: defineAsyncComponent/)
  assert.match(moduleSource, /data-quality-decision-record-lab/)
  assert.match(moduleSource, /数据质量决策记录/)
  assert.match(
    moduleSource,
    /labIds: \['data-quality-decision-record-lab', 'eda-workbench-lab'\]/,
  )
  assert.match(styleSource, /data-quality-decision-record-lab__record/)
})
