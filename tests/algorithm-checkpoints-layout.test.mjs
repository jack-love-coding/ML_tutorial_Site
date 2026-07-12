import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('algorithm view wires module checkpoints and progress helpers', () => {
  const algorithmViewSource = read('src/views/AlgorithmView.vue')
  const styleSource = read('src/styles/views/algorithm-shell.css')

  assert.match(algorithmViewSource, /AlgorithmCheckpointQuiz/)
  assert.match(algorithmViewSource, /loadAlgorithmProgress/)
  assert.match(algorithmViewSource, /setLastVisitedAlgorithmModule/)
  assert.match(algorithmViewSource, /appendAlgorithmQuizAttempt/)
  assert.match(algorithmViewSource, /markAlgorithmModuleComplete/)
  assert.match(algorithmViewSource, /shouldCompleteAlgorithmModule/)
  assert.match(algorithmViewSource, /completedModuleSlugs\.includes\(moduleDefinition\.slug\)/)
  assert.match(algorithmViewSource, /moduleDefinition\.checkpoints/)
  assert.match(algorithmViewSource, /lastVisitedModuleSlug/)
  assert.match(algorithmViewSource, /算法已完成|Completed/)

  assert.match(styleSource, /\.algorithm-checkpoint/)
  assert.match(styleSource, /\.algorithm-hero__status/)
})

test('algorithm checkpoint component renders feedback and revisit links', () => {
  const componentSource = read('src/components/AlgorithmCheckpointQuiz.vue')

  assert.match(componentSource, /defineProps/)
  assert.match(componentSource, /evaluateAlgorithmCheckpointAnswer/)
  assert.match(componentSource, /buildAlgorithmQuizAttempt/)
  assert.match(componentSource, /MarkdownMathContent/)
  assert.match(componentSource, /router-link/)
  assert.match(componentSource, /revisitChapterId/)
  assert.match(componentSource, /提交检测|Submit checkpoint/)
})

test('AI Overview uses immediate local formative feedback while other modules stay scored', () => {
  const componentSource = read('src/components/AlgorithmCheckpointQuiz.vue')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')

  assert.match(componentSource, /mode\?: 'scored' \| 'formative'/)
  assert.match(componentSource, /mode: 'scored'/)
  assert.match(componentSource, /mode === 'formative'.*answers\[checkpoint\.id\]/s)
  assert.match(componentSource, /checkpoint\.misconceptionTags/)
  assert.match(componentSource, /v-if="mode === 'scored'"/)
  assert.match(componentSource, /if \(props\.mode !== 'scored'\) return/)
  assert.match(algorithmViewSource, /:mode="isAiOverviewPage \? 'formative' : 'scored'"/)
  assert.doesNotMatch(componentSource, /saveAlgorithmProgress|appendAlgorithmQuizAttempt|markAlgorithmModuleComplete/)

  const submitFunction = componentSource.slice(
    componentSource.indexOf('function submit()'),
    componentSource.indexOf('</script>'),
  )
  assert.ok(submitFunction.indexOf("if (props.mode !== 'scored') return") < submitFunction.indexOf('emit('))

  const formativeHeader = componentSource.slice(
    componentSource.indexOf("mode === 'formative'"),
    componentSource.indexOf('<strong v-if="mode === \'scored\'"'),
  )
  assert.doesNotMatch(formativeHeader, /答对|correct|score|submit/i)
})
