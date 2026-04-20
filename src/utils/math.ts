export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value))
}

export function magnitude(x: number, y: number) {
  return Math.sqrt(x * x + y * y)
}

export function round(value: number, digits = 3) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}
