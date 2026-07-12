export function createSeededRandom(seed: number) {
  if (!Number.isInteger(seed)) throw new Error('seed must be an integer')

  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}
