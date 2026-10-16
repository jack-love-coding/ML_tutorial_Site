import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { MATH_TO_CODE_SAMPLES } from '../src/modules/math-lab/data/mathToCode/sharedTask.ts'
const samples = MATH_TO_CODE_SAMPLES.map(sample => sample.features)
const text = (x: number, y: number, label: string) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="20">${label}</text>`
const frame = (title: string, height: number, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${height}" role="img"><title>${title}</title><rect width="360" height="${height}" fill="white"/><g font-family="system-ui,sans-serif" fill="#172033">${body}</g></svg>\n`
export function vectorReadingFigures(): Record<string, string> {
  const x = (value: number) => 55 + value * 55, y = (value: number) => 304 - value * 48
  const a = samples[0]!, b = samples[1]!
  const vector = frame('Ordered task features locate two samples on the same axes', 420,
    '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="#1d4ed8"/></marker></defs>'
    + text(180, 28, `A = [${a.join(', ')}]; B = [${b.join(', ')}]`)
    + [0, 1, 2, 3, 4].map(value => `<path d="M${x(value)} ${y(0)}V${y(5)}" stroke="#e2e8f0"/>` + text(x(value), 333, String(value))).join('')
    + [0, 1, 2, 3, 4, 5].map(value => `<path d="M${x(0)} ${y(value)}H${x(4)}" stroke="#e2e8f0"/>` + text(30, y(value) + 7, String(value))).join('')
    + `<path d="M${x(0)} ${y(5)}V${y(0)}H${x(4)}" fill="none" stroke="#172033" stroke-width="2"/>`
    + text(305, y(0) + 7, 'x₁') + text(x(0), 52, 'x₂')
    + `<path d="M${x(0)} ${y(0)}L${x(a[0]!)} ${y(a[1]!)}" stroke="#1d4ed8" stroke-width="3" marker-end="url(#arrow)"/>`
    + `<path d="M${x(a[0]!)} ${y(a[1]!)}L${x(b[0]!)} ${y(b[1]!)}" fill="none" stroke="#9a3412" stroke-dasharray="5 4" stroke-width="2"/>`
    + `<circle cx="${x(a[0]!)}" cy="${y(a[1]!)}" r="6" fill="#1d4ed8"/>`
    + `<rect x="${x(b[0]!) - 6}" y="${y(b[1]!) - 6}" width="12" height="12" fill="#9a3412"/>`
    + text(x(a[0]!) + 40, y(a[1]!) + 4, 'A') + text(x(b[0]!) - 20, y(b[1]!) - 16, 'B')
    + text(180, 365, 'x₁: base tasks; x₂: hints')
    + text(180, 402, `B − A = [${b.map((value, i) => value - a[i]!).join(', ')}]`))
  const matrix = frame('Rows are samples and columns are the same ordered features', 388,
    text(180, 28, 'X: shape (2, 2)') + text(160, 71, 'x₁') + text(275, 71, 'x₂')
    + samples.map((sample, i) => {
      const top = 91 + i * 90
      return text(42, top + 44, i ? 'B' : 'A')
        + sample.map((value, j) => `<rect x="${103 + 115 * j}" y="${top}" width="104" height="68" rx="6" fill="${i ? '#fff7ed' : '#eff6ff'}" stroke="#475569"/>` + text(155 + 115 * j, top + 43, String(value))).join('')
    }).join('')
    + text(180, 280, 'axis 0: A, B') + text(180, 313, 'axis 1: x₁, x₂')
    + text(180, 350, 'one row: shape (2,)') + text(180, 379, 'target y: separate'))
  return { 'ordered-features.svg': vector, 'sample-feature-axes.svg': matrix }
}
if (import.meta.main) for (const [filename, svg] of Object.entries(vectorReadingFigures())) {
  const file = new URL('../public/math-lab/diagrams/matrices/' + filename, import.meta.url)
  if (process.argv.includes('--check')) { if (readFileSync(file, 'utf8') !== svg) throw new Error('Stale vector figure: ' + filename) }
  else { mkdirSync(new URL('.', file), { recursive: true }); writeFileSync(file, svg) }
}
