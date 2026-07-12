export function normalizeK(value: number) {
  if (!Number.isFinite(value)) return 3
  return Math.min(5, Math.max(2, Math.round(value)))
}

export function normalizeSeed(value: number, fallback: number) {
  if (!Number.isInteger(fallback)) throw new Error('seed fallback must be an integer')
  if (!Number.isFinite(value)) return fallback
  return Math.round(value)
}
