import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { runBoundedProcess, stopProcess, waitForPreviewReady } from './run-logistic-regression-browser-matrix.mjs'
const cwd = resolve(import.meta.dirname, '../..')
const server = spawn('npm', ['exec', '--no', '--', 'vite', 'preview', '--base', '/ML_tutorial_Site/', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { cwd, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] })
const cli = async (session, args) => {
  const result = await runBoundedProcess({ command: 'npm', args: ['exec', '--no', '--', 'playwright-cli', `-s=${session}`, ...args], cwd, timeoutMs: 480000, forwardOutput: Boolean(process.env.TEXTBOOK_SMOKE_DEBUG), label: `textbook ${args[0]}` })
  if (/### Error/.test(result.stdout)) throw new Error(result.stdout)
  if (args[0] === 'run-code') {
    const match = result.stdout.match(/### Result\s*\n([^\n]+)/)
    if (!match) throw new Error('Browser matrix returned no result')
    console.log(session + ': ' + match[1])
  }
}
try {
  await waitForPreviewReady(server)
  const matrices = [ ['textbook-storage', 'textbookReadingSmoke.js'], ['textbook-route', 'textbookRouteSmoke.js'], ['textbook-resources', 'textbookResourceSmoke.js'], ['algorithm-modes', 'algorithmModesSmoke.js'], ['math-providers', 'mathProvidersSmoke.js'] ]
  matrices.push(['math-reading', 'mathReadingSmoke.js'])
  matrices.push(['math-loading', 'mathLoadingSmoke.js'])
  matrices.push(['classification-project', 'classificationProjectReferenceSmoke.js'])
  // Each matrix gets an isolated browser profile; every profile is closed even after failure.
  const requested = new Set(process.argv.slice(2))
  for (const name of requested) if (!matrices.some(([session]) => session === name)) throw new Error(`Unknown matrix: ${name}`)
  for (const [session, file] of matrices.filter(([session]) => !requested.size || requested.has(session))) {
    try {
      await cli(session, ['open', '--config', 'scripts/qa/browser.config.json', 'http://127.0.0.1:4173/ML_tutorial_Site/'])
      if (session === 'textbook-route') {
        const manifest = JSON.parse(readFileSync(resolve(cwd, 'dist/textbook-readings.json'), 'utf8'))
        const requestedIds = process.env.TEXTBOOK_SMOKE_UNITS?.split(',').map(id => id.trim()).filter(Boolean)
        const unitIds = requestedIds ?? manifest.units.filter(unit => unit.publicationStatus !== 'preview').map(unit => unit.id)
        if (!unitIds.length) throw new Error('No units selected for browser verification')
        for (const id of unitIds) if (!manifest.units.some(unit => unit.id === id)) throw new Error('Unknown candidate unit: ' + id)
        // Bound each invocation by one unit as the released reading sequence grows.
        // The probe still clicks and verifies its final cross-unit handoff.
        for (const unitId of unitIds) {
          const code = readFileSync(resolve(cwd, 'scripts/qa', file), 'utf8').replace('/* candidate-unit-ids */ []', JSON.stringify([unitId]))
          await cli(session, ['run-code', code])
        }
      } else await cli(session, ['run-code', '--filename', `scripts/qa/${file}`])
    } finally { await cli(session, ['close']) }
  }
} finally { await stopProcess(server) }
