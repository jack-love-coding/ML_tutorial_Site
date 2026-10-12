import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { DEFAULT_PARAMETERS, MATH_TO_CODE_SAMPLES } from '../src/modules/math-lab/data/mathToCode/sharedTask.ts'
import { predictBatch } from '../src/modules/math-lab/utils/mathToCode.ts'

export const matrix = MATH_TO_CODE_SAMPLES.map(sample => [...sample.features])
export const predictions = predictBatch(matrix, DEFAULT_PARAMETERS.weights, DEFAULT_PARAMETERS.bias)
export const rows = matrix.map((features, index) => ({ features, contributions: features.map((x, j) => x * DEFAULT_PARAMETERS.weights[j]!), prediction: predictions[index]! }))

export function matrixFigure() {
  const t = (x: number, y: number, value: string, size = 18) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}">${value}</text>`
  const panels = rows.map((row, i) => {
    const top = 94 + i * 144
    return `<rect x="12" y="${top}" width="336" height="126" rx="8" fill="${i === 0 ? '#eff6ff' : '#fff7ed'}" stroke="#334155"/>`
      + t(43, top + 27, `#${i + 1}`) + t(213, top + 27, `x = [${row.features.join(', ')}]`)
      + t(180, top + 62, row.features.map((x, j) => `${x} × (${DEFAULT_PARAMETERS.weights[j]})`).join(' + ') + ` + ${DEFAULT_PARAMETERS.bias}`)
      + t(180, top + 101, row.contributions.map(x => `(${x})`).join(' + ') + ` + ${DEFAULT_PARAMETERS.bias} = ${row.prediction}`)
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 444" role="img"><title>One output per sample row using shared weights and bias</title><rect width="360" height="444" fill="white"/><g font-family="system-ui,sans-serif" fill="#172033">${t(180, 30, 'Xw + b = ŷ')}${t(180, 64, `w = [${DEFAULT_PARAMETERS.weights.join(', ')}], b = ${DEFAULT_PARAMETERS.bias}`)}${panels}<path d="M180 375V394m-6-7 6 7 6-7" stroke="#334155" stroke-width="2" fill="none"/>${t(180, 425, `ŷ = [${predictions.join(', ')}]`)}</g></svg>\n`
}

if (import.meta.main) {
  const directory = new URL('../public/math-lab/diagrams/matrices/', import.meta.url)
  const file = new URL('batch-prediction.svg', directory)
  if (process.argv.includes('--check')) {
    if (readFileSync(file, 'utf8') !== matrixFigure()) throw new Error('Stale matrix figure')
  } else {
    mkdirSync(directory, { recursive: true })
    writeFileSync(file, matrixFigure())
  }
}
