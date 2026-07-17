import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  buildCausalMask,
  buildNextTokenPairs,
  generationTokenLogits,
  softmaxWithTemperature,
  topKTokenDistribution,
} from '../src/simulations/llmGeneration.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('temperature softmax is normalized and lower temperature sharpens the distribution', () => {
  const cool = softmaxWithTemperature([3, 2, 1], 0.5)
  const warm = softmaxWithTemperature([3, 2, 1], 1.5)

  assert.ok(Math.abs(cool.reduce((sum, value) => sum + value, 0) - 1) < 1e-12)
  assert.ok(Math.abs(warm.reduce((sum, value) => sum + value, 0) - 1) < 1e-12)
  assert.ok(cool[0]! > warm[0]!)
  assert.throws(() => softmaxWithTemperature([1, 2], 0), /temperature/)
})

test('top-k decoding keeps only the highest logits and renormalizes them', () => {
  const distribution = topKTokenDistribution(generationTokenLogits, 1, 2)

  assert.deepEqual(distribution.map((candidate) => candidate.token), ['学习', '模型'])
  assert.ok(Math.abs(distribution.reduce((sum, candidate) => sum + candidate.probability, 0) - 1) < 1e-12)
  assert.throws(() => topKTokenDistribution(generationTokenLogits, 1, 0), /topK/)
})

test('shifted targets and causal mask expose only valid next-token context', () => {
  assert.deepEqual(buildNextTokenPairs(['A', 'B', 'C']), [
    { position: 0, inputToken: 'A', targetToken: 'B' },
    { position: 1, inputToken: 'B', targetToken: 'C' },
  ])
  assert.deepEqual(buildCausalMask(3), [
    [true, false, false],
    [true, true, false],
    [true, true, true],
  ])
})

test('LLM course wires causal training and decoding into the existing lesson lab', () => {
  const moduleSource = read('src/data/llmRagModule.ts')
  const labSource = read('src/components/AppliedWorkflowLessonLab.vue')
  const catalogSource = read('src/curriculum/adapters/algorithmAdapter.ts')

  assert.ok(moduleSource.indexOf("'causal-language-modeling'") < moduleSource.indexOf("'decoding-generation'"))
  assert.ok(moduleSource.indexOf("'decoding-generation'") < moduleSource.indexOf("'tokenization-context'"))
  assert.match(labSource, /LlmGenerationLab/)
  assert.match(labSource, /temperature/)
  assert.match(catalogSource, /prerequisites: \['attention-transformer'\]/)
})
