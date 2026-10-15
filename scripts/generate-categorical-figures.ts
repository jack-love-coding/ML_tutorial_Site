import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { categoricalEncodingExample } from '../src/modules/data-lab/utils/categoricalEncodingLesson.ts'

const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const text = (x: number, y: number, value: string, size = 14) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}">${escape(value)}</text>`
const frame = (body: string, title: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 330" role="img"><title>${title}</title><rect width="360" height="330" fill="white"/><g font-family="system-ui,sans-serif" fill="#172033">${body}</g></svg>\n`
const cell = (x: number, y: number, value: number, label: string) => `<rect x="${x}" y="${y}" width="46" height="42" rx="4" fill="${value ? '#dbeafe' : '#f8fafc'}" stroke="${value ? '#1d4ed8' : '#94a3b8'}" stroke-width="${value ? 3 : 1}"/>${text(x + 23, y + 18, label, 11)}${text(x + 23, y + 35, String(value))}`

export function categoricalFigures() {
  const rows = ['north', 'west', 'airport'].map(district => ({ district, example: categoricalEncodingExample({ district }) }))
  const tokens = rows[0]!.example.tokens
  let body = text(180, 25, 'train: north × 2, south × 2, west × 1')
  body += text(180, 51, 'min_frequency = 2', 13)
  tokens.forEach((token, i) => { body += text(118 + i * 54, 83, token.replace(/[<>]/g, ''), 12) })
  rows.forEach(({ district, example }, row) => {
    const y = 100 + row * 67
    body += text(44, y + 27, district)
    example.vector.forEach((value, i) => { body += cell(95 + i * 54, y, value, `#${i}`) })
  })
  body += text(180, 314, 'same 4 slots for every prediction', 13)

  const cross = categoricalEncodingExample({ mode: 'cross' })
  let grid = text(180, 25, 'south × condo → #5') + text(180, 49, '4 × 4 = 16 slots', 13)
  cross.property.tokens.forEach((token, i) => { grid += text(118 + i * 54, 76, token === 'apartment' ? 'apt.' : token.replace(/[<>]/g, ''), 12) })
  cross.district.tokens.forEach((token, row) => {
    grid += text(44, 116 + row * 51, token.replace(/[<>]/g, ''), 12)
    cross.property.tokens.forEach((_, column) => { const i = row * cross.property.tokens.length + column; grid += cell(95 + column * 54, 90 + row * 51, cross.vector[i]!, `#${i}`) })
  })
  grid += text(180, 314, 'one sample, one active combination', 13)
  return new Map([['vocabulary.svg', frame(body, 'Known, rare and unknown values reuse fixed slots')], ['cross.svg', frame(grid, 'One categorical pair activates one of sixteen cross slots')]])
}

if (import.meta.main) {
  const directory = new URL('../public/data-lab/diagrams/categorical/', import.meta.url)
  if (!process.argv.includes('--check')) mkdirSync(directory, { recursive: true })
  for (const [name, svg] of categoricalFigures()) {
    const path = new URL(name, directory)
    if (process.argv.includes('--check')) { if (readFileSync(path, 'utf8') !== svg) throw new Error('Stale categorical figure: ' + name) }
    else writeFileSync(path, svg)
  }
}
