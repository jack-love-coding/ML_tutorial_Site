import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { CONDITIONAL_BAYES_EXAMPLE } from '../src/modules/math-lab/data/conditionalBayesExample.ts'
import { evaluateConditionalBayes } from '../src/modules/math-lab/utils/beginnerFoundations.ts'

export const baseline = evaluateConditionalBayes(CONDITIONAL_BAYES_EXAMPLE)
export const rare = evaluateConditionalBayes({ ...CONDITIONAL_BAYES_EXAMPLE, priorSpam: .01 })
const percent = (value: number) => `${(value * 100).toFixed(1)}%`
const text = (x: number, y: number, value: string, size = 17) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}">${value}</text>`
const box = (x: number, y: number, w: number, label: string, fill = '#eff6ff') => `<rect x="${x}" y="${y}" width="${w}" height="44" rx="6" fill="${fill}" stroke="#334155"/>${text(x + w / 2, y + 28, label)}`
const arrow = (x: number, y1: number, y2: number) => `<path d="M${x} ${y1}V${y2}m-5-6 5 6 5-6" fill="none" stroke="#334155" stroke-width="2"/>`
const wrap = (title: string, height: number, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${height}" role="img"><title>${title}</title><defs><pattern id="stripes" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#dbeafe"/><path d="M0 8L8 0" stroke="#1e40af"/></pattern></defs><rect width="360" height="${height}" fill="white"/><g font-family="system-ui,sans-serif" fill="#172033">${body}</g></svg>\n`

export function conditionalFigures() {
  const b = baseline
  const filtering = text(180, 30, `N = ${b.populationSize}`)
    + box(14, 60, 158, `A: ${b.spamCount}`) + box(188, 60, 158, `¬A: ${b.notSpamCount}`, '#fff7ed')
    + arrow(93, 110, 177) + arrow(267, 110, 177)
    + text(139, 148, `× ${b.signalGivenSpam}`, 15) + text(313, 148, `× ${b.signalGivenNotSpam}`, 15)
    + box(14, 188, 158, `A ∩ B: ${b.signalSpamCount}`) + box(188, 188, 158, `¬A ∩ B: ${b.signalNotSpamCount}`, '#fff7ed')
    + text(180, 268, `B: ${b.signalSpamCount} + ${b.signalNotSpamCount} = ${b.signalCount}`)
    + arrow(180, 278, 300) + text(180, 328, `P(A | B) = ${b.signalSpamCount} / ${b.signalCount}`)
    + text(180, 360, `≈ ${percent(b.posteriorSpam)}`)
  const comparisons = [baseline, rare].map((e, i) => {
    const top = 98 + i * 142, width = 312 * e.posteriorSpam
    return text(180, top, `P(A) = ${percent(e.priorSpam)}`)
      + `<rect x="24" y="${top + 14}" width="312" height="30" fill="url(#stripes)" stroke="#334155"/><rect x="24" y="${top + 14}" width="${width}" height="30" fill="#9a3412"/>`
      + text(180, top + 74, `${e.signalSpamCount} / ${e.signalCount} ≈ ${percent(e.posteriorSpam)}`)
  }).join('')
  return new Map([
    ['condition-denominator.svg', wrap('Filter to signal B before dividing: 656 out of 1760', 382, filtering)],
    ['base-rate-comparison.svg', wrap('Same signal rates, different priors: posterior 37.3% versus 6.5%', 382,
      text(180, 28, `P(B | A) = ${b.signalGivenSpam}`) + text(180, 55, `P(B | ¬A) = ${b.signalGivenNotSpam}`) + comparisons
      + `<rect x="70" y="345" width="16" height="16" fill="#9a3412"/>${text(113, 359, 'A', 15)}<rect x="220" y="345" width="16" height="16" fill="url(#stripes)"/>${text(267, 359, '¬A', 15)}`)],
  ])
}

if (import.meta.main) {
  const directory = new URL('../public/math-lab/diagrams/probability/', import.meta.url)
  if (!process.argv.includes('--check')) mkdirSync(directory, { recursive: true })
  for (const [name, svg] of conditionalFigures()) {
    const file = new URL(name, directory)
    if (process.argv.includes('--check')) {
      if (readFileSync(file, 'utf8') !== svg) throw new Error('Stale conditional figure: ' + name)
    } else writeFileSync(file, svg)
  }
}
