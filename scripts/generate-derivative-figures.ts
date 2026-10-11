import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { DEFAULT_PARAMETERS, MATH_TO_CODE_SAMPLES } from '../src/modules/math-lab/data/mathToCode/sharedTask.ts'
import { meanSquaredError, predictBatch } from '../src/modules/math-lab/utils/mathToCode.ts'

const matrix = MATH_TO_CODE_SAMPLES.map(sample => sample.features)
const targets = MATH_TO_CODE_SAMPLES.map(sample => sample.target)
export const center = DEFAULT_PARAMETERS.weights[1]!
export function lossAt(w2: number) {
  return meanSquaredError(predictBatch(matrix, [DEFAULT_PARAMETERS.weights[0]!, w2], DEFAULT_PARAMETERS.bias), targets)
}
export function slopeAt(w2: number) {
  const predictions = predictBatch(matrix, [DEFAULT_PARAMETERS.weights[0]!, w2], DEFAULT_PARAMETERS.bias)
  return 2 * predictions.reduce((sum, prediction, i) => sum + (prediction - targets[i]!) * matrix[i]![1]!, 0) / targets.length
}
export const tangentAt = (w2: number) => lossAt(center) + slopeAt(center) * (w2 - center)
export const forwardSlopes = [.2, .1, .02].map(h => ({ h, slope: (lossAt(center + h) - lossAt(center)) / h }))

const chart = { left: 48, right: 322, top: 35, bottom: 250, xMin: -1.3, xMax: -.5, yMin: 0, yMax: 6.5 }
export const project = (x: number, y: number) => ({
  x: chart.left + (x - chart.xMin) / (chart.xMax - chart.xMin) * (chart.right - chart.left),
  y: chart.bottom - (y - chart.yMin) / (chart.yMax - chart.yMin) * (chart.bottom - chart.top),
})
const point = (x: number, y: number) => { const p = project(x, y); return `${p.x.toFixed(3)},${p.y.toFixed(3)}` }
export const curveSamples = Array.from({ length: 81 }, (_, i) => {
  const x = chart.xMin + i / 80 * (chart.xMax - chart.xMin)
  return { x, y: lossAt(x) }
})
const base = () => `<rect width="360" height="322" fill="#fff"/>
<g font-family="system-ui,sans-serif" font-size="14" fill="#172033">
${[0, 2, 4, 6].map(value => `<path d="M48 ${project(0, value).y}H322" stroke="#e2e8f0"/><text x="38" y="${project(0, value).y + 5}" text-anchor="end">${value}</text>`).join('')}
${[-1.2, -1, -.8, -.6].map(value => `<text x="${project(value, 0).x}" y="274" text-anchor="middle">${value}</text>`).join('')}
<path d="M48 35V250H328" fill="none" stroke="#172033" stroke-width="1.5"/>
<text x="48" y="22">L (MSE)</text><text x="337" y="274" text-anchor="middle">w₂</text>
</g>`
const curve = () => `<polyline id="loss-curve" points="${curveSamples.map(p => point(p.x, p.y)).join(' ')}" fill="none" stroke="#1d4ed8" stroke-width="3"/>`
const tangent = () => `<polyline id="tangent" points="${point(-1.3, tangentAt(-1.3))} ${point(-.58, tangentAt(-.58))}" fill="none" stroke="#9a3412" stroke-width="2.5" stroke-dasharray="7 5"/>`
const anchor = () => `<circle cx="${project(center, lossAt(center)).x}" cy="${project(center, lossAt(center)).y}" r="5" fill="#172033" stroke="#fff" stroke-width="2"/>`
const wrap = (title: string, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 322" role="img"><title>${title}</title>${body}</svg>\n`

export function derivativeFigures() {
  return new Map([
    ['loss-tangent.svg', wrap('L(w₂): tangent slope at w₂ = −1 is −5', base() + curve() + tangent() + anchor()
      + '<g font-family="system-ui,sans-serif" font-size="15" fill="#172033"><text x="112" y="106">(−1, 2.5)</text><text x="208" y="157" fill="#9a3412">L′(−1) = −5</text><text x="48" y="305">Δw₂ = 0.01:  L ≈ 2.45</text></g>')],
    ['loss-secants.svg', wrap('Forward secant slopes approach −5 as h decreases', base() + curve()
      + forwardSlopes.map(({ h, slope }, i) => `<polyline id="secant-${i}" points="${point(center, lossAt(center))} ${point(center + h, lossAt(center + h))}" fill="none" stroke="${['#047857', '#7c3aed', '#b45309'][i]}" stroke-width="2"/><rect x="${project(center + h, lossAt(center + h)).x - 3}" y="${project(center + h, lossAt(center + h)).y - 3}" width="6" height="6" fill="${['#047857', '#7c3aed', '#b45309'][i]}"/><text x="175" y="${40 + i * 20}" font-family="system-ui,sans-serif" font-size="13" fill="#172033">h=${h}: ${Number(slope.toFixed(2))}</text>`).join('')
      + tangent() + anchor() + '<text x="48" y="305" font-family="system-ui,sans-serif" font-size="15" fill="#172033">h → 0: slope → −5</text>')],
  ])
}

if (import.meta.main) {
  const directory = new URL('../public/math-lab/diagrams/derivatives/', import.meta.url)
  if (!process.argv.includes('--check')) mkdirSync(directory, { recursive: true })
  for (const [name, svg] of derivativeFigures()) {
    const path = new URL(name, directory)
    if (process.argv.includes('--check')) {
      if (readFileSync(path, 'utf8') !== svg) throw new Error('Stale derivative figure: ' + name)
    } else writeFileSync(path, svg)
  }
}
