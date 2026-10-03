import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { runBoundedProcess, stopProcess, waitForPreviewReady } from './run-logistic-regression-browser-matrix.mjs'
const cwd = resolve(import.meta.dirname, '../..')
const server = spawn('npm', ['exec', '--no', '--', 'vite', 'preview', '--base', '/ML_tutorial_Site/', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { cwd, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] })
const cli = async (session, args) => {
  const result = await runBoundedProcess({ command: 'npm', args: ['exec', '--no', '--', 'playwright-cli', `-s=${session}`, ...args], cwd, timeoutMs: 480000, forwardOutput: false, label: `textbook ${args[0]}` })
  if (/### Error/.test(result.stdout)) throw new Error(result.stdout)
  if (args[0] === 'run-code') {
    const match = result.stdout.match(/### Result\s*\n([^\n]+)/)
    if (!match) throw new Error('Browser matrix returned no result')
    console.log(session + ': ' + match[1])
  }
}
try {
  await waitForPreviewReady(server)
  const matrices = [ ['textbook-storage', 'textbookReadingSmoke.js'], ['textbook-route', 'textbookRouteSmoke.js'], ['textbook-resources', 'textbookResourceSmoke.js'] ]
  // Each matrix gets an isolated browser profile; every profile is closed even after failure.
  for (const [session, file] of matrices) {
    try {
      await cli(session, ['open', 'http://127.0.0.1:4173/ML_tutorial_Site/'])
      await cli(session, ['run-code', '--filename', `scripts/qa/${file}`])
    } finally { await cli(session, ['close']) }
  }
} finally { await stopProcess(server) }
