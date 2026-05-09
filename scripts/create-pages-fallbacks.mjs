import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const distDir = process.argv[2] ?? 'dist'
const indexPath = join(distDir, 'index.html')

if (!existsSync(indexPath)) {
  throw new Error(`Cannot find ${indexPath}. Run the production build first.`)
}

const routes = new Set([
  '/math-lab',
  '/math-lab/diagnostic',
])

function addRoute(route) {
  if (!route.startsWith('/')) return
  routes.add(route.replace(/\/$/, ''))
}

function readText(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

function walkFiles(dir, extension, files = []) {
  if (!existsSync(dir)) return files

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      walkFiles(path, extension, files)
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(path)
    }
  }

  return files
}

for (const file of walkFiles('src/data', '.ts')) {
  const text = readText(file)
  for (const match of text.matchAll(/route:\s*['"]([^'"]+)['"]/g)) {
    addRoute(match[1])
  }
}

const importedNotes = readText('src/modules/math-lab/data/importedMathNotes.generated.ts')
for (const match of importedNotes.matchAll(/^    "id": "([^"]+)",/gm)) {
  addRoute(`/math-lab/modules/${match[1]}`)
}

const foundationModules = readText('src/modules/math-lab/data/mathFoundationsModules.ts')
for (const match of foundationModules.matchAll(/^    id: '([^']+)',/gm)) {
  addRoute(`/math-lab/modules/${match[1]}`)
}

copyFileSync(indexPath, join(distDir, '404.html'))

for (const route of [...routes].sort()) {
  const outputPath = join(distDir, ...route.slice(1).split('/'), 'index.html')
  mkdirSync(dirname(outputPath), { recursive: true })
  copyFileSync(indexPath, outputPath)
}

console.log(`Created ${routes.size} GitHub Pages SPA fallback routes.`)
