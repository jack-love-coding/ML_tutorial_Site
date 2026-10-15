import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { evaluatePartialDerivativePoint } from '../src/modules/math-lab/utils/calculus.ts'
import { partialContourPath, partialGradientLevels, partialGradientStart, partialVectorEnd, projectPartialPoint } from '../src/modules/math-lab/utils/partialGradientGeometry.ts'

export const partialFigureEvaluation = evaluatePartialDerivativePoint(partialGradientStart.point)
const text = (x: number, y: number, value: string, size = 14) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle">${value}</text>`
export function partialGradientFigure() {
  const { point, gradient, negativeGradient } = partialFigureEvaluation
  const p = projectPartialPoint(point)
  const arrow = (vector: { x: number; y: number }, color: string, dashed: boolean, id: string) => {
    const end = projectPartialPoint(partialVectorEnd(point, vector))
    return `<line x1="${p.x}" y1="${p.y}" x2="${end.x}" y2="${end.y}" stroke="${color}" stroke-width="3" ${dashed ? 'stroke-dasharray="5 3"' : ''} marker-end="url(#${id})"/>`
  }
  const contours = partialGradientLevels.map(level => `<path d="${partialContourPath(level)}" fill="none" stroke="#cbd5e1" stroke-width="1.5"/>`).join('')
  const current = `<path d="${partialContourPath(partialFigureEvaluation.loss)}" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 4"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 440" role="img"><title>Gradient and negative gradient on the lab's quadratic loss</title><rect width="360" height="440" fill="#fff"/><defs><clipPath id="plot"><rect width="360" height="360"/></clipPath><marker id="up" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#1d4ed8"/></marker><marker id="down" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#c2410c"/></marker></defs><g font-family="system-ui,sans-serif" fill="#172033">${text(180, 24, 'L = 0.72x² + 0.32xy + 0.52y²')}<g transform="translate(0 38)"><g clip-path="url(#plot)">${contours}${current}<path d="M15 180H345M180 15V345" stroke="#64748b" fill="none"/>${arrow(gradient, '#1d4ed8', false, 'up')}${arrow(negativeGradient, '#c2410c', true, 'down')}</g>${text(342, 173, 'x')}${text(193, 17, 'y')}${[-3, 0, 3].map(value => text(projectPartialPoint({x:value,y:0}).x, 198, String(value), 12)).join('')}${[-3, 3].map(value => text(166, projectPartialPoint({x:0,y:value}).y+4, String(value), 12)).join('')}<circle cx="${p.x}" cy="${p.y}" r="4" fill="#172033"/>${text(292, 256, '∇L')}${text(204, 207, '−∇L')}${text(240, 281, '(1.4, −1.1)')}</g>${text(180, 417, '∇L = (1.664, −0.696)')}</g></svg>\n`
}

if (import.meta.main) {
  const directory = new URL('../public/math-lab/diagrams/partials/', import.meta.url)
  const path = new URL('gradient-contour.svg', directory)
  if (process.argv.includes('--check')) {
    if (readFileSync(path, 'utf8') !== partialGradientFigure()) throw new Error('Stale partial-gradient figure')
  } else {
    mkdirSync(directory, { recursive: true })
    writeFileSync(path, partialGradientFigure())
  }
}
