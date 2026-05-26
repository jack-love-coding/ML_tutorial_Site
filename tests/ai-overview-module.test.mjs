import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('AI overview is the first registered learning module', () => {
  const typesSource = read('src/types/ml.ts')
  const catalogSource = read('src/data/moduleCatalog.ts')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')
  const homeSource = read('src/views/HomeView.vue')
  const messagesSource = read('src/i18n/messages.ts')

  assert.match(typesSource, /\| 'ai-overview'/)
  assert.match(catalogSource, /import \{ aiOverviewModule \} from '\.\/aiOverviewModule'/)

  const aiIndex = catalogSource.indexOf('aiOverviewModule,')
  const lossIndex = catalogSource.indexOf('lossFunctionsModule,')
  assert.ok(aiIndex >= 0, 'ai-overview should be registered in moduleOrder')
  assert.ok(aiIndex < lossIndex, 'ai-overview should be the first ML Models module')

  assert.match(algorithmViewSource, /AiOverviewLessonLab/)
  assert.match(algorithmViewSource, /slug\.value === 'ai-overview'/)
  assert.match(algorithmViewSource, /algorithm-view--ai-overview/)
  assert.match(homeSource, /ai-overview/)
  assert.match(messagesSource, /aiOverview: \{/)
})

test('AI overview module covers beginner AI map and uses centralized references', () => {
  const modulePath = new URL('src/data/aiOverviewModule.ts', root)
  assert.ok(existsSync(modulePath), 'src/data/aiOverviewModule.ts should exist')

  const moduleSource = read('src/data/aiOverviewModule.ts')

  assert.match(moduleSource, /slug: 'ai-overview'/)
  assert.match(moduleSource, /route: '\/learn\/ai-overview'/)
  assert.equal([...moduleSource.matchAll(/chapter\(\s*'/g)].length, 5)

  for (const id of ['what-is-ml', 'learning-types', 'deep-learning', 'generative-ai', 'training-flow']) {
    assert.match(moduleSource, new RegExp(`chapter\\(\\s*'${id}'`))
    assert.match(moduleSource, new RegExp(`modules\\.aiOverview\\.sections\\.${id.replaceAll('-', '')}\\.title`))
  }

  for (const requiredConcept of [
    '监督学习',
    '无监督学习',
    '深度学习',
    '生成式 AI',
    '训练流程',
    'train/validation/test',
    'input -> model -> prediction -> loss/metric -> iteration',
  ]) {
    assert.match(moduleSource, new RegExp(requiredConcept.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }

  for (const refId of ['REF-GOOGLE-MLCC', 'REF-INRIA-SKLEARN-MOOC', 'REF-D2L', 'REF-SKLEARN-USER-GUIDE']) {
    assert.match(moduleSource, new RegExp(refId))
  }

  assert.doesNotMatch(moduleSource, /https?:\/\//)
})

test('AI overview includes task-style checkpoints and overview visuals', () => {
  const checkpointSource = read('src/data/algorithmCheckpoints.ts')
  const labSource = read('src/components/AiOverviewLessonLab.vue')
  const styleIndexSource = read('src/styles/index.css')

  assert.match(checkpointSource, /'ai-overview': \[/)
  assert.match(checkpointSource, /ai-overview-task-type/)
  assert.match(checkpointSource, /ai-overview-training-flow/)

  for (const token of [
    'overview-lab__pipeline',
    'overview-lab__task-grid',
    'overview-lab__scenario',
    'overview-lab__flow-step',
    'selectedScenario',
  ]) {
    assert.match(labSource, new RegExp(token))
  }

  assert.match(styleIndexSource, /ai-overview\.css/)
})
