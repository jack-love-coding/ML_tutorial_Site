import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pagesEntrypoints } from './pages-entrypoints.mjs'
import { textbookReadingManifest } from '../src/curriculum/publication.ts'

const distDir = process.argv[2] ?? 'dist'
const indexPath = join(distDir, 'index.html')
if (!existsSync(indexPath)) throw new Error(`Cannot find ${indexPath}. Run the production build first.`)
const routes = pagesEntrypoints()
copyFileSync(indexPath, join(distDir, '404.html'))
for (const route of routes) {
  if (route === '/') continue
  const outputPath = join(distDir, ...route.slice(1).split('/'), 'index.html')
  mkdirSync(dirname(outputPath), { recursive: true })
  copyFileSync(indexPath, outputPath)
}
writeFileSync(join(distDir, 'routes.json'), JSON.stringify(routes, null, 2) + '\n')
writeFileSync(join(distDir, 'textbook-readings.json'), JSON.stringify(textbookReadingManifest()) + '\n')
const event = process.env.GITHUB_EVENT_PATH ? JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')) : {}
writeFileSync(join(distDir, 'release.json'), JSON.stringify({
  sha: process.env.GITHUB_SHA ?? null,
  previousSha: event.before ?? null,
  runId: process.env.GITHUB_RUN_ID ?? null,
  source: process.env.GITHUB_SHA ? 'github-actions' : 'local-unpublished',
  units: textbookReadingManifest().units.map(({ id, publicationStatus }) => ({ id, publicationStatus })),
}) + '\n')
console.log(`Created ${routes.length} GitHub Pages SPA entrypoints from the curriculum directory.`)
