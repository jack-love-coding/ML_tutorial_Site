// Explicit teaching fixtures, not measured project/model results.
export type GeneralizationScenario = 'underfit' | 'balanced' | 'overfit'
export const curveEpochs = [0, 10, 20, 30, 40, 50] as const
export const generalizationCurves = {
  underfit: { train: [1, .84, .76, .72, .70, .69], validation: [1.06, .90, .83, .80, .79, .79] },
  balanced: { train: [1, .62, .39, .26, .21, .19], validation: [1.06, .67, .45, .33, .29, .28] },
  overfit: { train: [1, .60, .34, .18, .09, .04], validation: [1.06, .66, .43, .35, .48, .70] },
} satisfies Record<GeneralizationScenario, { train: number[]; validation: number[] }>

export function generalizationCurveSnapshot(scenario: GeneralizationScenario, index: number) {
  const series = generalizationCurves[scenario] ?? generalizationCurves.balanced
  const selected = Number.isFinite(index) ? Math.min(curveEpochs.length - 1, Math.max(0, Math.trunc(index))) : 0
  const bestIndex = series.validation.indexOf(Math.min(...series.validation))
  return { series, index: selected, epoch: curveEpochs[selected]!, train: series.train[selected]!, validation: series.validation[selected]!, bestEpoch: curveEpochs[bestIndex]!, bestIndex }
}
