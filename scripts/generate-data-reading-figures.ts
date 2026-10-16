import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { clippingAfter, clippingBefore, scalingReadingExample, scalingTrainingRooms, scalingVariance } from '../src/modules/data-lab/data/cleaningReadingVisuals.ts'
import { cleaningExampleOutput, trainingRoomsMedian } from '../src/modules/data-lab/utils/cleaningTeachingExample.ts'
import { housingTeachingTable } from '../src/modules/data-lab/utils/tableTransforms.ts'

const text = (x: number, y: number, label: string) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="20">${label}</text>`
const frame = (title: string, height: number, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${height}" role="img"><title>${title}</title><rect width="360" height="${height}" fill="white"/><g font-family="system-ui,sans-serif" fill="#172033">${body}</g></svg>\n`
export function dataReadingFigures(): Record<string, string> {
  const s = scalingReadingExample
  const scaling = frame('Fit scaling parameters on training rows and reuse them for validation', 360,
    text(180, 28, `train: [${scalingTrainingRooms.join(', ')}]`)
    + `<rect x="20" y="46" width="320" height="100" rx="8" fill="#eff6ff" stroke="#1d4ed8"/>`
    + text(180, 78, `μ = ${s.mean}; ddof = 0`) + text(180, 115, `σ = √${scalingVariance} ≈ ${s.standardDeviation.toFixed(3)}`)
    + '<path d="M180 155V189m-7-8 7 8 7-8" stroke="#172033" stroke-width="2" fill="none"/>'
    + text(180, 220, `validation: x = ${s.validationValue}`)
    + `<rect x="20" y="239" width="320" height="98" rx="8" fill="#fff7ed" stroke="#9a3412"/>`
    + text(180, 273, '(x − μ) / σ') + text(180, 312, `(${s.validationValue} − ${s.mean}) / √${scalingVariance} ≈ ${s.transformedValidation.toFixed(3)}`))
  const actions = [
    ['1. rooms', `NA → ${trainingRoomsMedian}`], ['2. price', `${clippingBefore} → ${clippingAfter}`],
    ['3. id: B-03', `${housingTeachingTable.rows.length} rows → ${cleaningExampleOutput.rows.length} rows`], ['4. listed_at', 'bad-date → NA'],
  ]
  const cleaning = frame('Separate imputation, clipping, deduplication, and parsing', 416,
    actions.map(([label, result], i) => {
      const y = 12 + i * 102
      return `<rect x="20" y="${y}" width="320" height="86" rx="8" fill="${i % 2 ? '#fff7ed' : '#eff6ff'}" stroke="#475569"/>`
        + text(180, y + 30, label!) + text(180, y + 65, result!)
    }).join(''))
  return { 'scaling/fit-and-transform.svg': scaling, 'cleaning/four-policies.svg': cleaning }
}
if (import.meta.main) for (const [filename, svg] of Object.entries(dataReadingFigures())) {
  const file = new URL('../public/data-lab/diagrams/' + filename, import.meta.url)
  if (process.argv.includes('--check')) {
    if (readFileSync(file, 'utf8') !== svg) throw new Error('Stale data reading figure: ' + filename)
  } else { mkdirSync(new URL('.', file), { recursive: true }); writeFileSync(file, svg) }
}
