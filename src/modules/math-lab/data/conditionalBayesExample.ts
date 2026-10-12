import type { ConditionalBayesInput } from '../utils/beginnerFoundations.ts'

// With 1% slider increments, 10,000 hypothetical emails give integer expected
// counts for every branch. Keep observed datasets separate from this teaching model.
export const CONDITIONAL_BAYES_EXAMPLE: Readonly<Required<ConditionalBayesInput>> = {
  priorSpam: .08,
  signalGivenSpam: .82,
  signalGivenNotSpam: .12,
  populationSize: 10000,
}
