import { computed, unref, type MaybeRef } from 'vue'
import { clamp, type Vector2 } from '../utils/math'

export interface SvgPoint {
  x: number
  y: number
}

export interface CartesianViewportOptions {
  width: number
  height: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback
}

function ticks(min: number, max: number, count: number) {
  const safeCount = Math.max(2, Math.floor(finiteOr(count, 7)))
  return Array.from({ length: safeCount }, (_, index) => min + (index * (max - min)) / (safeCount - 1))
}

export function useCartesianViewport(options: MaybeRef<CartesianViewportOptions>) {
  const viewport = computed(() => {
    const next = unref(options)
    return {
      width: Math.max(1, finiteOr(next.width, 420)),
      height: Math.max(1, finiteOr(next.height, 320)),
      xMin: finiteOr(next.xMin, -3),
      xMax: finiteOr(next.xMax, 3),
      yMin: finiteOr(next.yMin, -3),
      yMax: finiteOr(next.yMax, 3),
    }
  })

  const xTicks = computed(() => ticks(viewport.value.xMin, viewport.value.xMax, 7))
  const yTicks = computed(() => ticks(viewport.value.yMin, viewport.value.yMax, 7))

  function clampPoint(point: Vector2): Vector2 {
    return {
      x: clamp(finiteOr(point.x, 0), viewport.value.xMin, viewport.value.xMax),
      y: clamp(finiteOr(point.y, 0), viewport.value.yMin, viewport.value.yMax),
    }
  }

  function toSvg(point: Vector2): SvgPoint {
    const safePoint = clampPoint(point)
    const { width, height, xMin, xMax, yMin, yMax } = viewport.value
    return {
      x: ((safePoint.x - xMin) / (xMax - xMin)) * width,
      y: height - ((safePoint.y - yMin) / (yMax - yMin)) * height,
    }
  }

  function fromSvg(point: SvgPoint): Vector2 {
    const { width, height, xMin, xMax, yMin, yMax } = viewport.value
    return clampPoint({
      x: xMin + (finiteOr(point.x, 0) / width) * (xMax - xMin),
      y: yMin + ((height - finiteOr(point.y, 0)) / height) * (yMax - yMin),
    })
  }

  return {
    viewport,
    xTicks,
    yTicks,
    clampPoint,
    toSvg,
    fromSvg,
  }
}
