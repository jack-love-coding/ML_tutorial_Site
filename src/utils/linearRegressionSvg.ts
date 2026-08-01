export interface NumericDomain {
  minimum: number
  maximum: number
}

export function scaleLinear(
  value: number,
  domain: NumericDomain,
  range: NumericDomain,
): number {
  if (!Number.isFinite(value)) return range.minimum
  const span = domain.maximum - domain.minimum
  if (!Number.isFinite(span) || Math.abs(span) < 1e-12) {
    return (range.minimum + range.maximum) / 2
  }
  const ratio = (value - domain.minimum) / span
  return range.minimum + ratio * (range.maximum - range.minimum)
}

export function paddedDomain(values: readonly number[], fallback: NumericDomain): NumericDomain {
  const finite = values.filter(Number.isFinite)
  if (!finite.length) return fallback
  const minimum = Math.min(...finite)
  const maximum = Math.max(...finite)
  const padding = Math.max((maximum - minimum) * 0.08, 1e-6)
  return { minimum: minimum - padding, maximum: maximum + padding }
}

export function svgPolyline(
  points: readonly { x: number; y: number }[],
  xDomain: NumericDomain,
  yDomain: NumericDomain,
  width: number,
  height: number,
  padding: number,
): string {
  return points
    .filter(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))
    .map(({ x, y }) => {
      const mappedX = scaleLinear(
        x,
        xDomain,
        { minimum: padding, maximum: width - padding },
      )
      const mappedY = scaleLinear(
        y,
        yDomain,
        { minimum: height - padding, maximum: padding },
      )
      return `${mappedX},${mappedY}`
    })
    .join(' ')
}
