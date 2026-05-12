import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const docsSource = readFileSync(
  new URL('../docs/ml-content-import-plan.md', import.meta.url),
  'utf8',
)
const modulesSource = readFileSync(new URL('../src/data/modules.ts', import.meta.url), 'utf8')
const mlpModuleSource = readFileSync(new URL('../src/data/mlpModule.ts', import.meta.url), 'utf8')
const messagesSource = readFileSync(new URL('../src/i18n/messages.ts', import.meta.url), 'utf8')

function countChapterObjects(source, slug) {
  const slugStart = source.indexOf(`slug: '${slug}'`)
  assert.notEqual(slugStart, -1, `expected ${slug} module to exist`)

  const controlsStart = source.indexOf('controls:', slugStart)
  assert.notEqual(controlsStart, -1, `expected ${slug} controls after chapters`)

  return [...source.slice(slugStart, controlsStart).matchAll(/eyebrowKey: 'common\.chapter'/g)]
    .length
}

test('ML content import plan documents source priorities and reusable chapter template', () => {
  assert.match(docsSource, /D2L/)
  assert.match(docsSource, /Google Machine Learning Crash Course/)
  assert.match(docsSource, /CS357/)
  assert.match(docsSource, /mlcourse\.ai/)
  assert.match(docsSource, /OpenStax/)

  for (const heading of [
    '### 核心问题',
    '### 概念直觉',
    '### 手算例子',
    '### 公式',
    '### 常见误解',
    '### 交互实验设计',
    '### 来源参考',
  ]) {
    assert.match(docsSource, new RegExp(heading))
  }
})

test('logistic regression and MLP modules now follow the expanded teaching plan', () => {
  assert.equal(countChapterObjects(modulesSource, 'logistic-regression'), 5)
  assert.equal([...mlpModuleSource.matchAll(/\bchapter\(\s*'/g)].length, 8)

  for (const id of [
    "id: 'sigmoid'",
    "id: 'regularization'",
  ]) {
    assert.match(modulesSource, new RegExp(id))
  }

  for (const id of [
    "'linearLimits'",
    "'neuronAffine'",
    "'activations'",
    "'hiddenRepresentation'",
    "'forwardOutput'",
    "'backprop'",
    "'trainingDynamics'",
    "'capacityGeneralization'",
  ]) {
    assert.match(mlpModuleSource, new RegExp(id))
  }

  for (const titleKey of [
    'sigmoid',
    'regularization',
  ]) {
    assert.match(messagesSource, new RegExp(`${titleKey}: \\{`))
  }

  assert.match(mlpModuleSource, /OpenStax/)
  assert.match(mlpModuleSource, /CC BY-NC-SA/)
})
