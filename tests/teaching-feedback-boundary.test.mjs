import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('frontend reviews explain choices without scoring or completion thresholds', () => {
  for (const path of [
    'src/components/AlgorithmCheckpointQuiz.vue',
    'src/modules/math-lab/components/CheckpointQuiz.vue',
    'src/modules/data-lab/components/DataCheckpointQuiz.vue',
  ]) {
    const source = read(path)
    assert.match(source, /不计分|Not graded/)
    assert.match(source, /参考思路|Reference explanation/)
    assert.doesNotMatch(source, /defineEmits|function submit|答对|提交检测|is-correct/)
  }

  for (const path of [
    'src/views/AlgorithmView.vue',
    'src/modules/math-lab/pages/MathLabModulePage.vue',
    'src/modules/data-lab/pages/DataLabModulePage.vue',
  ]) {
    assert.doesNotMatch(
      read(path),
      /correct\s*\/\s*attempts\.length|>=\s*0\.66|markAlgorithmModuleComplete|markDataLabModuleComplete|markRouteModuleComplete/,
    )
  }
})

test('visible Vue copy uses learner-facing result language instead of evidence jargon', () => {
  for (const path of [
    'src/views/CurriculumProgressView.vue',
    'src/lessons/LessonInteractionProtocolPanel.vue',
    'src/components/CnnShapeParameterChallengeLab.vue',
    'src/components/TransformerBlockAssemblyChallengeLab.vue',
    'src/components/AttentionQkvChallengeLab.vue',
    'src/components/OptimizerCurveDiagnosisChallengeLab.vue',
    'src/components/ArchitectureToolsHandoffChallengeLab.vue',
    'src/modules/math-lab/components/CheckpointReportCard.vue',
    'src/modules/data-lab/labs/DataQualityDecisionRecordLab.vue',
  ]) {
    assert.doesNotMatch(read(path), /证据/, `${path} should avoid evidence jargon in visible Chinese copy`)
  }
})
