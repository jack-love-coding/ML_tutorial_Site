import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { calibrationExample, onTimeProbability, observedFrequency, probabilitySamples, softmaxExample, spreadExamples } from '../src/modules/math-lab/utils/probabilityReadingExamples.ts'

const ink = '#172033', blue = '#1d4ed8', orange = '#9a3412'
const text = (x: number, y: number, value: string, size = 20) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}">${value}</text>`
const line = (x1: number, y1: number, x2: number, y2: number, dashed = false) => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${ink}" stroke-width="2"${dashed ? ' stroke-dasharray="5 4"' : ''}/>`
const frame = (title: string, height: number, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${height}" role="img"><title>${title}</title><rect width="360" height="${height}" fill="white"/><g fill="${ink}" font-family="system-ui,sans-serif">${body}</g></svg>\n`

export function probabilityReadingFigures(): Record<string, string> {
  const bar = (y: number, label: string, value: number, color = blue) => text(180, y, label) + `<rect x="30" y="${y + 12}" width="300" height="26" rx="4" fill="#e2e8f0"/><rect x="30" y="${y + 12}" width="${300 * value}" height="26" rx="4" fill="${color}"/>`
  const story = frame('A probability distribution assigns mass to each possible outcome', 230,
    text(180, 30, 'Z ∈ {0, 1}') + bar(72, 'P(Z = 0) = 0.30', 1 - onTimeProbability, orange)
    + bar(145, 'P(Z = 1) = 0.70', onTimeProbability) + text(180, 218, '0.30 + 0.70 = 1'))
  const mapping = frame('An event indicator maps outcomes to zero or one', 252,
    text(180, 30, 'A = {on time}')
    + `<rect x="20" y="55" width="320" height="76" rx="8" fill="#eff6ff" stroke="${blue}"/>`
    + text(180, 85, 'A → Z = 1') + text(180, 116, 'P(Z = 1) = 0.70')
    + `<rect x="20" y="150" width="320" height="76" rx="8" fill="#fff7ed" stroke="${orange}"/>`
    + text(180, 180, 'not A → Z = 0') + text(180, 211, 'P(Z = 0) = 0.30'))
  const samples = probabilitySamples.map((value, i) => {
    const x = 35 + (i % 6) * 58, y = 65 + Math.floor(i / 6) * 52
    return `<circle cx="${x}" cy="${y}" r="20" fill="${value ? '#eff6ff' : '#fff7ed'}" stroke="${value ? blue : orange}"/>` + text(x, y + 7, String(value))
  }).join('')
  const frequency = frame('Twelve fixed-seed observations differ from the model probability', 336,
    text(180, 28, 'n = 12; seed = 7') + samples
    + bar(183, `9 / 12 = ${observedFrequency.toFixed(2)}`, observedFrequency)
    + bar(259, `P(Z = 1) = ${onTimeProbability.toFixed(2)}`, onTimeProbability, orange)
    + text(180, 326, '0.75 ≠ 0.70'))
  const spread = frame('Equal means do not imply equal variances', 390,
    spreadExamples.map((example, i) => {
      const top = 24 + i * 188, axis = top + 88
      return text(180, top, `P(${example.values[0]}) = P(${example.values[1]}) = 0.5`)
        + line(40, axis, 320, axis) + line(180, top + 35, 180, axis + 10, true)
        + example.values.map(value => `<circle cx="${40 + value * 70}" cy="${axis}" r="10" fill="${i ? orange : blue}"/>`).join('')
        + [0, 1, 2, 3, 4].map(value => text(40 + value * 70, axis + 34, String(value))).join('')
        + text(180, axis + 66, `E[X] = ${example.mean}; Var(X) = ${example.variance}`)
    }).join(''))
  const x = (p: number) => 55 + 240 * p, y = (p: number) => 300 - 240 * p
  const c = calibrationExample
  const calibration = frame('Ten hypothetical predictions at confidence 0.90, six correct', 390,
    text(180, 26, 'n = 10; 6 / 10 = 0.60') + line(x(0), y(0), x(1), y(0)) + line(x(0), y(0), x(0), y(1))
    + line(x(0), y(0), x(1), y(1), true)
    + line(x(c.confidence), y(0), x(c.confidence), y(c.accuracy), true)
    + line(x(0), y(c.accuracy), x(c.confidence), y(c.accuracy), true)
    + [0, 0.5, 1].map(value => text(x(value), 327, String(value)) + text(27, y(value) + 7, String(value))).join('')
    + `<circle cx="${x(c.confidence)}" cy="${y(c.accuracy)}" r="8" fill="${orange}"/>`
    + text(180, 118, '(0.90, 0.60)') + text(180, 356, 'x: confidence; y: accuracy') + text(180, 382, 'ideal: y = x'))
  const s = softmaxExample
  const softmax = frame('Three exact logits, their softmax probabilities, and target negative log loss', 374,
    text(180, 28, 'softmax(z); T = 1')
    + s.probabilities.map((p, i) => {
      const top = 64 + i * 74
      return text(180, top, `C${i}: ${s.logits[i]!.toFixed(1)} → ${p.toFixed(3)}`)
        + `<rect x="30" y="${top + 11}" width="300" height="26" rx="4" fill="#e2e8f0"/>`
        + `<rect x="30" y="${top + 11}" width="${300 * p}" height="26" rx="4" fill="${i === s.targetIndex ? orange : blue}"/>`
        + (i === s.targetIndex ? `<rect x="24" y="${top - 26}" width="312" height="70" rx="6" stroke="${orange}" fill="none" stroke-dasharray="5 4"/>` : '')
    }).join('')
    + text(180, 294, 'target = C2') + text(180, 327, `q = ${s.targetProbability.toFixed(3)}`) + text(180, 361, `−ln(q) ≈ ${s.loss.toFixed(3)}`))
  return { 'outcome-distribution.svg': story, 'event-indicator.svg': mapping, 'sample-frequency.svg': frequency,
    'same-mean-spread.svg': spread, 'calibration-cohort.svg': calibration, 'softmax-target.svg': softmax }
}

if (import.meta.main) {
  const directory = new URL('../public/math-lab/diagrams/probability/', import.meta.url)
  mkdirSync(directory, { recursive: true })
  for (const [filename, svg] of Object.entries(probabilityReadingFigures())) {
    const file = new URL(filename, directory)
    if (process.argv.includes('--check')) {
      if (readFileSync(file, 'utf8') !== svg) throw new Error(`Stale probability figure: ${filename}`)
    } else writeFileSync(file, svg)
  }
}
