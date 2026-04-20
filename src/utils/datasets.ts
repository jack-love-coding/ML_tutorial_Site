import type { PlotPoint } from '../types/ml'
import { createSeededRandom, randomBetween, randomNormal } from './rng'

interface DatasetParams {
  kind: string
  sampleCount: number
  noise: number
  seed: number
}

function jitter(value: number, rand: () => number, noise: number) {
  return value + randomNormal(rand, 0, noise)
}

export function generateDataset({ kind, sampleCount, noise, seed }: DatasetParams): PlotPoint[] {
  const rand = createSeededRandom(seed)
  const points: PlotPoint[] = []
  const countPerClass = Math.max(12, Math.floor(sampleCount / 2))

  if (kind === 'blobs') {
    for (let index = 0; index < countPerClass; index += 1) {
      points.push({
        x: jitter(-1.2, rand, 0.42 + noise),
        y: jitter(-0.8, rand, 0.35 + noise),
        label: 0,
      })
      points.push({
        x: jitter(1.15, rand, 0.42 + noise),
        y: jitter(0.9, rand, 0.35 + noise),
        label: 1,
      })
    }
    return points
  }

  if (kind === 'tilted') {
    for (let index = 0; index < sampleCount; index += 1) {
      const x = randomBetween(rand, -2.1, 2.1)
      const y = randomBetween(rand, -2.1, 2.1)
      const score = x * 0.75 + y * 0.55 + randomNormal(rand, 0, noise * 2.2)
      points.push({ x, y, label: score > 0 ? 1 : 0 })
    }
    return points
  }

  if (kind === 'xor') {
    const centers = [
      { x: -1.25, y: -1.2, label: 0 },
      { x: 1.25, y: 1.2, label: 0 },
      { x: -1.25, y: 1.2, label: 1 },
      { x: 1.25, y: -1.2, label: 1 },
    ]
    for (let index = 0; index < sampleCount; index += 1) {
      const center = centers[index % centers.length]
      points.push({
        x: jitter(center.x, rand, 0.32 + noise),
        y: jitter(center.y, rand, 0.32 + noise),
        label: center.label,
      })
    }
    return points
  }

  if (kind === 'moons') {
    for (let index = 0; index < countPerClass; index += 1) {
      const angle = Math.PI * rand()
      points.push({
        x: Math.cos(angle) + randomNormal(rand, 0, noise * 0.9),
        y: Math.sin(angle) + randomNormal(rand, 0, noise * 0.9),
        label: 0,
      })
      points.push({
        x: 1 - Math.cos(angle) + randomNormal(rand, 0, noise * 0.9),
        y: -Math.sin(angle) + 0.45 + randomNormal(rand, 0, noise * 0.9),
        label: 1,
      })
    }
    return points
  }

  if (kind === 'circles') {
    for (let index = 0; index < countPerClass; index += 1) {
      const angle = rand() * Math.PI * 2
      points.push({
        x: Math.cos(angle) * 0.8 + randomNormal(rand, 0, noise * 0.8),
        y: Math.sin(angle) * 0.8 + randomNormal(rand, 0, noise * 0.8),
        label: 0,
      })
    }
    for (let index = 0; index < countPerClass; index += 1) {
      const angle = rand() * Math.PI * 2
      points.push({
        x: Math.cos(angle) * 1.65 + randomNormal(rand, 0, noise),
        y: Math.sin(angle) * 1.65 + randomNormal(rand, 0, noise),
        label: 1,
      })
    }
    return points
  }

  for (let index = 0; index < countPerClass; index += 1) {
    const t = index / countPerClass
    const angle = t * 3.5 * Math.PI
    points.push({
      x: 0.23 * angle * Math.cos(angle) + randomNormal(rand, 0, noise),
      y: 0.23 * angle * Math.sin(angle) + randomNormal(rand, 0, noise),
      label: 0,
    })

    const angle2 = angle + Math.PI
    points.push({
      x: 0.23 * angle2 * Math.cos(angle2) + randomNormal(rand, 0, noise),
      y: 0.23 * angle2 * Math.sin(angle2) + randomNormal(rand, 0, noise),
      label: 1,
    })
  }

  return points
}
