import { readFileSync } from 'node:fs'

const cssImportPattern = /^@import\s+['"](.+?)['"];\s*$/gm

export function readStyleSource() {
  return readCssWithImports(new URL('../../src/styles/index.css', import.meta.url))
}

function readCssWithImports(url) {
  const source = readFileSync(url, 'utf8')

  return source.replace(cssImportPattern, (_match, specifier) =>
    readCssWithImports(new URL(specifier, url)),
  )
}
