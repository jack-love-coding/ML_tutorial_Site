import { readFileSync } from 'node:fs'

/** Historical examples remain in manuscripts after retiring their student UI. */
export function manuscriptSection(file: string, id: string) {
  const source = readFileSync(new URL(`../../docs/curriculum/v3/math-to-code/${file}`, import.meta.url), 'utf8')
  const headings = [...source.matchAll(/^##\s+(.+?)\s+\{#([a-z0-9-]+)\}\s*$/gm)]
  const index = headings.findIndex(heading => heading[2] === id)
  if (index < 0) throw new Error(`Missing archived section: ${file}/${id}`)
  const heading = headings[index]!
  return source.slice(heading.index! + heading[0].length, headings[index + 1]?.index ?? source.length).trim()
}
