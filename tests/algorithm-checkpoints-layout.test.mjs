import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('algorithm modules expose reference examples with no learner state', () => {
  const page = read('src/views/AlgorithmView.vue')
  const examples = read('src/components/AlgorithmCheckpointQuiz.vue')
  assert.match(page, /AlgorithmCheckpointQuiz/)
  assert.match(examples, /ReferenceExample/)
  assert.match(examples, /revisitRoute/)
  assert.doesNotMatch(page, /loadAlgorithmProgress|setLastVisitedAlgorithmModule/)
  assert.doesNotMatch(examples, /v-model|defineEmits|is-correct/)
})


test('AI Overview and Python review use the same immediate explanation behavior', () => {
  const chapterLabSource = read('src/modules/ai-overview/labs/AiOverviewChapterLab.vue')
  const courseViewSource = read('src/views/PythonDataToolsCourseView.vue')

  assert.match(chapterLabSource, /<AlgorithmCheckpointQuiz/)
  assert.doesNotMatch(chapterLabSource, /mode=|:completed=|@submit/)
  assert.match(chapterLabSource, /'ml-common-language': \[[^\]]*training-loop-order[^\]]*field-roles/s)
  assert.match(chapterLabSource, /'learning-paradigms': \[[^\]]*paradigm-signal/s)
  assert.match(chapterLabSource, /'reinforcement-q-learning': \[[^\]]*kmeans-direction[^\]]*q-value-direction/s)

  assert.match(courseViewSource, /variant="course-review"/)
  assert.match(courseViewSource, /activeChapter\.id === 'analysis-report'/)
  assert.doesNotMatch(courseViewSource, /@submit|saveAlgorithmProgress|markAlgorithmModuleComplete/)
})

test('checkpoint styling remains available without completion-state UI', () => {
  const styleSource = read('src/styles/views/algorithm-shell.css')
  assert.match(styleSource, /\.algorithm-checkpoint/)
  assert.match(styleSource, /\.algorithm-hero__status/)
})
