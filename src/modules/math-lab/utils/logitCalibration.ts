export const LOGIT_CALIBRATION_LOGITS = [
  -3.2, -2.1, -1.4, -0.9, -0.4, -0.1, 0.2, 0.5, 0.9, 1.3, 2.0, 3.1,
] as const

export const LOGIT_CALIBRATION_TARGET = 0.62
export const LOGIT_CALIBRATION_ROOT = 0.730290740297536

export function stableSigmoid(value: number) {
  if (value >= 0) return 1 / (1 + Math.exp(-value))
  const exponential = Math.exp(value)
  return exponential / (1 + exponential)
}

export function logitCalibrationMeanProbability(bias: number) {
  return LOGIT_CALIBRATION_LOGITS.reduce(
    (sum, logit) => sum + stableSigmoid(logit + bias),
    0,
  ) / LOGIT_CALIBRATION_LOGITS.length
}

export function logitCalibrationResidual(bias: number) {
  return logitCalibrationMeanProbability(bias) - LOGIT_CALIBRATION_TARGET
}

export function logitCalibrationDerivative(bias: number) {
  return LOGIT_CALIBRATION_LOGITS.reduce((sum, logit) => {
    const probability = stableSigmoid(logit + bias)
    return sum + probability * (1 - probability)
  }, 0) / LOGIT_CALIBRATION_LOGITS.length
}
