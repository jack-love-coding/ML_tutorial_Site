import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('algorithm modules keep checkpoints as ungraded teaching review', () => {
  const algorithmViewSource = read('src/views/AlgorithmView.vue')
  const componentSource = read('src/components/AlgorithmCheckpointQuiz.vue')

  assert.match(algorithmViewSource, /AlgorithmCheckpointQuiz/)
  assert.match(algorithmViewSource, /moduleDefinition\.checkpoints/)
  assert.match(algorithmViewSource, /loadAlgorithmProgress/)
  assert.match(algorithmViewSource, /setLastVisitedAlgorithmModule/)
  assert.doesNotMatch(
    algorithmViewSource,
    /appendAlgorithmQuizAttempt|markAlgorithmModuleComplete|shouldCompleteAlgorithmModule|onAlgorithmQuizSubmit|mode="scored"/,
  )

  assert.match(componentSource, /理解回顾 · 不计分|Concept review · Not graded/)
  assert.match(componentSource, /answers\[checkpoint\.id\]/)
  assert.match(componentSource, /参考思路|Reference explanation/)
  assert.match(componentSource, /router-link/)
  assert.match(componentSource, /checkpoint\.misconceptionTags/)
  assert.doesNotMatch(
    componentSource,
    /evaluateAlgorithmCheckpointAnswer|buildAlgorithmQuizAttempt|defineEmits|function submit|答对|提交检测|is-correct/,
  )
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
