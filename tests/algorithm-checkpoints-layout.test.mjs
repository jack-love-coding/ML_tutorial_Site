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
