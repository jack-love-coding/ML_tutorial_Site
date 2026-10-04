import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { lossFunctionsChapterIds, lossFunctionsChapterBindings, lossFunctionsAssetById, parseLossFunctionsOutput } from '../src/data/lossFunctionsAssets.ts'

export function lossDisplayFiles() {
  const files = new Map()
  for (const chapterId of lossFunctionsChapterIds) {
    const summaries = {}
    const sources = []
    for (const id of lossFunctionsChapterBindings[chapterId].assetIds) {
      if (id !== 'regression-loss-summary' && id !== 'bce-gradient-summary') continue
      const publicPath = lossFunctionsAssetById.get(id).publicPath
      const raw = readFileSync(resolve('public', '.' + publicPath))
      const full = parseLossFunctionsOutput(id, JSON.parse(raw))
      // Runtime consumers use the first three rows, representatives, top five contributions,
      // full aggregates/distributions, and the complete fixed numerical probes.
      summaries[id] = { ...full, rows: full.rows.slice(0, 3), highContributionRows: full.highContributionRows.slice(0, 5) }
      sources.push({ id, publicPath, sha256: createHash('sha256').update(raw).digest('hex') })
    }
    files.set(`public/notebooks/loss-functions/display/${chapterId}.json`, JSON.stringify({ schemaVersion: 1, chapterId, sources, summaries }) + '\n')
  }
  return files
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  mkdirSync('public/notebooks/loss-functions/display', { recursive: true })
  for (const [path, text] of lossDisplayFiles()) {
    if (process.argv.includes('--check')) {
      if (readFileSync(path, 'utf8') !== text) throw new Error(`Display data drift: ${path}`)
    } else writeFileSync(path, text)
  }
  console.log('Loss display data is current (7 chapters).')
}
