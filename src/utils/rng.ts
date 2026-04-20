export function createSeededRandom(seed: number) {
  let state = seed >>> 0

  return () => {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomBetween(rand: () => number, min: number, max: number) {
  return min + (max - min) * rand()
}

export function randomNormal(rand: () => number, mean = 0, std = 1) {
  const u1 = Math.max(rand(), Number.EPSILON)
  const u2 = Math.max(rand(), Number.EPSILON)
  const magnitude = Math.sqrt(-2 * Math.log(u1))
  return mean + std * magnitude * Math.cos(2 * Math.PI * u2)
}
