import { crossEntropy, softmax } from './aiBridgeMath.ts'

// This is the frozen output of the lesson's NumPy default_rng(7) example.
export const probabilitySamples = [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0] as const
export const onTimeProbability = 0.7
export const observedFrequency = probabilitySamples.reduce<number>((sum, value) => sum + value, 0) / probabilitySamples.length
export const probabilitySamplingOutput = `samples = [${probabilitySamples.join(', ')}]\nempirical_frequency = ${observedFrequency}`

export function distributionMoments(values: readonly number[], probabilities: readonly number[]) {
  if (!values.length || values.length !== probabilities.length || values.some(value => !Number.isFinite(value))
    || probabilities.some(value => !Number.isFinite(value) || value < 0)
    || Math.abs(probabilities.reduce((sum, value) => sum + value, 0) - 1) > 1e-10) throw new Error('Invalid discrete distribution')
  const mean = values.reduce((sum, value, i) => sum + value * probabilities[i]!, 0)
  const variance = values.reduce((sum, value, i) => sum + (value - mean) ** 2 * probabilities[i]!, 0)
  return { mean, variance }
}
export const spreadExamples = [[1, 3], [0, 4]].map(values => ({ values, probabilities: [0.5, 0.5], ...distributionMoments(values, [0.5, 0.5]) }))

// A labelled hypothetical cohort, not a claim about a trained model's calibration.
export const calibrationExamples = Array.from({ length: 10 }, (_, i) => ({ confidence: 0.9, correct: i < 6 }))
export const calibrationExample = {
  count: calibrationExamples.length,
  correct: calibrationExamples.filter(row => row.correct).length,
  confidence: calibrationExamples.reduce((sum, row) => sum + row.confidence, 0) / calibrationExamples.length,
  accuracy: calibrationExamples.filter(row => row.correct).length / calibrationExamples.length,
}

export const softmaxExample = (() => {
  const logits = [1.5, 0.3, -0.8]
  const probabilities = softmax(logits)
  const targetIndex = 2
  return { logits, probabilities, targetIndex, targetProbability: probabilities[targetIndex]!, loss: crossEntropy(probabilities, targetIndex) }
})()
