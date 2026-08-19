#!/usr/bin/env node
/** Execute the Phase 29 browser matrix against the already-built Pages artifact. */
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
// `npm exec` resolves Vite from the active package in CI and from the shared
// dependency checkout used by local GSD worktrees; do not assume node_modules
// is copied into every worktree.
const server = spawn('npm', ['exec', '--', 'vite', 'preview', '--base', '/ML_tutorial_Site/', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] })
let ready = false
let output = ''
const collect = (chunk) => { output += String(chunk); if (/127\.0\.0\.1:4173/.test(output)) ready = true }
server.stdout.on('data', collect); server.stderr.on('data', collect)
try {
  for (let attempt = 0; attempt < 100 && !ready; attempt += 1) await new Promise((resolveAttempt) => setTimeout(resolveAttempt, 100))
  if (!ready) throw new Error(`Pages preview did not start: ${output}`)
  const command = process.env.PLAYWRIGHT_CLI ?? 'npx'
  const cli = (args) => process.env.PLAYWRIGHT_CLI
    ? [command, args]
    : [command, ['--yes', '--package', '@playwright/cli', 'playwright-cli', ...args]]
  const execute = async (args) => {
    const [bin, argv] = cli(args)
    const child = spawn(bin, argv, { cwd: root, stdio: 'inherit' })
    const [code] = await once(child, 'exit')
    if (code !== 0) throw new Error(`playwright-cli ${args[0]} failed with ${code}`)
  }
  await execute(['open', 'http://127.0.0.1:4173/ML_tutorial_Site/learn/logistic-regression'])
  await execute(['run-code', '--filename', 'scripts/qa/logisticRegressionBrowserMatrix.js'])
} finally {
  server.kill('SIGTERM')
  await once(server, 'exit').catch(() => undefined)
}
