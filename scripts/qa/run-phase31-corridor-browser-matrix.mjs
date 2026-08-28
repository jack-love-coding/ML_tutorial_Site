#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  runBoundedProcess,
  stopProcess,
  waitForPreviewReady,
} from './run-logistic-regression-browser-matrix.mjs'

const root = resolve(import.meta.dirname, '../..')

function localPlaywrightCommand(args) {
  return { command: 'npm', args: ['exec', '--no', '--', 'playwright-cli', ...args] }
}

export async function main() {
  let server
  let runCli
  let browserOpened = false
  let completed = false
  try {
    server = spawn('npm', ['exec', '--', 'vite', 'preview', '--base', '/ML_tutorial_Site/', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
      cwd: root,
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    await waitForPreviewReady(server)
    runCli = async (args) => {
      const cli = localPlaywrightCommand(args)
      await runBoundedProcess({ ...cli, cwd: root, label: `playwright-cli ${args[0]}` })
    }
    await runCli(['open', 'http://127.0.0.1:4173/ML_tutorial_Site/learn/loss-functions'])
    browserOpened = true
    await runCli(['run-code', '--filename', 'scripts/qa/phase31CorridorBrowserMatrix.js'])
    completed = true
  } finally {
    let cleanupError
    if (browserOpened && runCli) {
      try { await runCli(['close']) } catch (error) { cleanupError = error }
    }
    await stopProcess(server)
    if (completed && cleanupError) throw cleanupError
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
}
