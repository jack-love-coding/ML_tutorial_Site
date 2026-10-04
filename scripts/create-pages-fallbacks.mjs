import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pagesEntrypoints } from './pages-entrypoints.mjs'

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
console.log(`Created ${routes.length} GitHub Pages SPA entrypoints from the curriculum directory.`)
