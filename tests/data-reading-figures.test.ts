import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { applyCleaningTeachingSteps, cleaningStepIds, trainingRoomsMedian } from '../src/modules/data-lab/utils/cleaningTeachingExample.ts'
import { housingTeachingTable } from '../src/modules/data-lab/utils/tableTransforms.ts'
import { dataPipelineTeachingRows } from '../src/modules/data-lab/utils/pipelineTask.ts'
import { cleaningReadingVisual, scalingReadingExample, scalingReadingVisual } from '../src/modules/data-lab/data/cleaningReadingVisuals.ts'
import { dataReadingFigures } from '../scripts/generate-data-reading-figures.ts'

test('every cleaning switch combination agrees with pandas and leaves the original teaching fragment unchanged', () => {
  const original = JSON.stringify(housingTeachingTable)
  const result = spawnSync('python3', ['-c', `import json,sys,pandas as pd
rows=json.load(sys.stdin);train=pd.DataFrame(rows);outputs=[]
for mask in range(16):
 df=train.copy()
 if mask & 1: df['rooms']=df['rooms'].fillna(train['rooms'].median())
 if mask & 2: df['price']=df['price'].clip(lower=100,upper=1200)
 if mask & 4: df=df.drop_duplicates(subset=['id'])
 if mask & 8:
  parsed=pd.to_datetime(df['listed_at'],errors='coerce')
  df['listed_at']=parsed.dt.strftime('%Y-%m-%d').where(parsed.notna(),None)
 outputs.append(json.loads(df.to_json(orient='records')))
print(json.dumps(outputs))`], { encoding: 'utf8', input: JSON.stringify(housingTeachingTable.rows), timeout: 20000 })
  assert.equal(result.status, 0, result.stderr)
  const expected = JSON.parse(result.stdout)
  assert.equal(trainingRoomsMedian, 3.5, 'the observed counts are 2, 3, 4, 9; the median is not 3')
  for (let mask = 0; mask < 16; mask++) {
    const active = cleaningStepIds.filter((_, i) => mask & (1 << i))
    assert.deepEqual(applyCleaningTeachingSteps(active).rows, expected[mask], `combination ${mask}`)
  }
  assert.equal(JSON.stringify(housingTeachingTable), original)
  const output = applyCleaningTeachingSteps(cleaningStepIds)
  assert.equal(output.rows.length, 5)
  assert.equal(output.rows.find(row => row.id === 'B-03')!.listed_at, null)
  assert.equal(output.rows.find(row => row.id === 'D-05')!.district, '', 'the demo must not imply all missingness is repaired')
})

test('the scaling reading uses the same training population variance and validation value as the lab', () => {
  const result = spawnSync('python3', ['-c', `import json,sys,numpy as np
rows=json.load(sys.stdin);x=np.array([r['rooms'] for r in rows if r['split']=='train']);v=next(r['rooms'] for r in rows if r['split']=='validation')
print(json.dumps([float(x.mean()),float(x.std(ddof=0)),float((v-x.mean())/x.std(ddof=0))]))`], { encoding: 'utf8', input: JSON.stringify(dataPipelineTeachingRows), timeout: 20000 })
  assert.equal(result.status, 0, result.stderr)
  const expected = JSON.parse(result.stdout)
  for (const [i, value] of [scalingReadingExample.mean, scalingReadingExample.standardDeviation, scalingReadingExample.transformedValidation].entries()) assert.ok(Math.abs(value - expected[i]) < 1e-12)
})

test('data reading SVGs are reproducible and keep full bilingual explanations outside the image', () => {
  for (const [path, svg] of Object.entries(dataReadingFigures())) {
    assert.equal(readFileSync(new URL('../public/data-lab/diagrams/' + path, import.meta.url), 'utf8'), svg)
    assert.ok([...svg.matchAll(/font-size="(\d+)"/g)].every(match => Number(match[1]) >= 20))
  }
  for (const asset of [cleaningReadingVisual, scalingReadingVisual]) for (const locale of ['zh-CN', 'en'] as const) assert.ok(asset.caption[locale].length > 180)
  assert.match(cleaningReadingVisual.caption.en, /3\.5/)
  assert.match(scalingReadingVisual.caption.en, /ddof=0/)
})
