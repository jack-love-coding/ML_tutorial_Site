import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { DEFAULT_PARAMETERS, MATH_TO_CODE_SAMPLES } from '../src/modules/math-lab/data/mathToCode/sharedTask.ts'
import { predictOne } from '../src/modules/math-lab/utils/mathToCode.ts'

export const sample = MATH_TO_CODE_SAMPLES[0]!
export const contributions = sample.features.map((x, i) => x * DEFAULT_PARAMETERS.weights[i]!)
export const prediction = predictOne(sample.features, DEFAULT_PARAMETERS.weights, DEFAULT_PARAMETERS.bias)
export const residual = prediction - sample.target
export const motionPosition = (time: number) => 2 + 3 * time
export const motionPoints = [0, 1, 2, 3, 4].map(time => ({ time, position: motionPosition(time) }))
export const projectMotion = (time: number, position: number) => ({ x: 46 + time * 66, y: 274 - position * 15 })
const text = (x: number, y: number, value: string, size = 17) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle">${value}</text>`
const box = (x: number, y: number, width: number, label: string, fill = '#eff6ff') => `<rect x="${x}" y="${y}" width="${width}" height="42" rx="6" fill="${fill}" stroke="#334155"/>${text(x + width / 2, y + 27, label)}`
const arrow = (path: string, dashed = false) => `<path d="${path}" fill="none" stroke="#334155" stroke-width="2" ${dashed ? 'stroke-dasharray="5 4"' : ''} marker-end="url(#arrow)"/>`
const wrap = (title: string, height: number, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${height}" role="img"><title>${title}</title><rect width="360" height="${height}" fill="#fff"/><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#334155"/></marker></defs><g font-family="system-ui,sans-serif" fill="#172033">${body}</g></svg>\n`

export function functionFigures() {
  const [c1, c2] = contributions
  const sum = contributions.reduce((a, b) => a + b, 0)
  const mapping = text(180, 27, `x = [${sample.features.join(', ')}]`)
    + text(180, 54, `w = [${DEFAULT_PARAMETERS.weights.join(', ')}]`)
    + arrow('M104 66V90') + arrow('M264 66V90')
    + box(14, 98, 160, `${sample.features[0]} × ${DEFAULT_PARAMETERS.weights[0]} = ${c1}`) + box(188, 98, 158, `${sample.features[1]} × (${DEFAULT_PARAMETERS.weights[1]}) = ${c2}`)
    + arrow('M94 147V166H180V187') + arrow('M267 147V166H180')
    + box(92, 195, 176, `${c1} + (${c2}) = ${sum}`)
    + arrow('M180 244V285') + text(252, 268, `+ b = +${DEFAULT_PARAMETERS.bias}`)
    + box(92, 293, 176, `ŷ = ${prediction}`, '#ecfdf5')
    + arrow('M180 340V384', true) + box(14, 345, 85, `y = ${sample.target}`, '#fff7ed')
    + arrow('M99 366H117V407H138', true)
    + box(146, 386, 198, `r = ${prediction} − ${sample.target} = ${residual}`, '#fff7ed')
  const axes = `<path d="M46 25V274H327" fill="none" stroke="#334155" stroke-width="1.5"/>`
    + text(67, 18, 's (m)', 15) + text(325, 320, 't (s)', 15)
    + [0, 2, 5, 8, 11, 14].map(value => `<path d="M46 ${projectMotion(0, value).y}H310" stroke="#e2e8f0"/>${text(28, projectMotion(0, value).y + 5, String(value), 14)}`).join('')
    + motionPoints.map(p => text(projectMotion(p.time, 0).x, 298, String(p.time), 14)).join('')
  const line = `<polyline points="${motionPoints.map(p => { const q = projectMotion(p.time, p.position); return `${q.x},${q.y}` }).join(' ')}" fill="none" stroke="#1d4ed8" stroke-width="3"/>`
    + motionPoints.map(p => { const q = projectMotion(p.time, p.position); return `<circle cx="${q.x}" cy="${q.y}" r="4" fill="#1d4ed8"/>` }).join('')
  const triangle = `<path d="M112 199H178V154" fill="none" stroke="#9a3412" stroke-width="2" stroke-dasharray="5 4"/>`
    + text(146, 220, 'Δt = 1 s', 14) + text(222, 181, 'Δs = 3 m', 14)
    + text(212, 41, 's(t) = 2 + 3t') + text(281, 84, '(4, 14)', 14)
    + text(180, 336, 'Δs / Δt = 3 m/s')
  return new Map([
    ['prediction-flow.svg', wrap('Inputs and parameters produce prediction 10; target 9 enters only the residual', 442, mapping)],
    ['uniform-motion.svg', wrap('Uniform motion: position 2 plus speed 3 times time', 354, axes + line + triangle)],
  ])
}

if (import.meta.main) {
  const directory = new URL('../public/math-lab/diagrams/functions/', import.meta.url)
  if (!process.argv.includes('--check')) mkdirSync(directory, { recursive: true })
  for (const [name, svg] of functionFigures()) {
    const path = new URL(name, directory)
    if (process.argv.includes('--check')) {
      if (readFileSync(path, 'utf8') !== svg) throw new Error('Stale function figure: ' + name)
    } else writeFileSync(path, svg)
  }
}
